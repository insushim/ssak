const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const admin = require('firebase-admin');
const {GoogleGenerativeAI} = require('@google/generative-ai');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const MAX_STUDENTS_PER_CLASS = 40;

// Define secret for Gemini API key
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// 🚀 슈퍼관리자 userData에 학급 요약 정보 동기화 (DB 읽기 최적화)
// 학급 생성/수정/삭제 시 호출하여 슈퍼관리자가 로그인할 때 추가 DB 읽기 없이 학급 정보 확인 가능
const syncSuperAdminClassesSummary = async () => {
  try {
    // 모든 슈퍼관리자 조회
    const superAdminsSnapshot = await db.collection('users')
      .where('role', '==', 'super_admin')
      .get();

    if (superAdminsSnapshot.empty) {
      console.log('[동기화] 슈퍼관리자 없음');
      return;
    }

    // 모든 학급 정보 조회
    const classesSnapshot = await db.collection('classes').get();

    // 선생님 ID 수집 (teacherName이 없는 경우 조회 필요)
    const teacherIds = new Set();
    const classesData = [];

    classesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      classesData.push({ id: docSnap.id, data });
      if (data.teacherId && !data.teacherName) {
        teacherIds.add(data.teacherId);
      }
    });

    // teacherName이 없는 선생님들 이름 조회
    const teacherNames = {};
    if (teacherIds.size > 0) {
      console.log(`[동기화] ${teacherIds.size}명의 선생님 이름 조회`);
      await Promise.all(
        Array.from(teacherIds).map(async (teacherId) => {
          try {
            const teacherDoc = await db.doc(`users/${teacherId}`).get();
            if (teacherDoc.exists) {
              const teacherData = teacherDoc.data();
              teacherNames[teacherId] = teacherData.name || teacherData.email?.split('@')[0] || '알 수 없음';

              // 해당 선생님의 모든 classes 문서에 teacherName 저장 (다음부터 조회 불필요)
              const classesToUpdate = classesData.filter(c => c.data.teacherId === teacherId && !c.data.teacherName);
              for (const classDoc of classesToUpdate) {
                await db.doc(`classes/${classDoc.id}`).update({ teacherName: teacherNames[teacherId] });
                console.log(`[동기화] 학급 ${classDoc.id}에 teacherName 저장: ${teacherNames[teacherId]}`);
              }
            }
          } catch (e) {
            console.warn(`선생님 ${teacherId} 조회 실패:`, e);
          }
        })
      );
    }

    // classesSummary 생성
    const classesSummary = classesData.map(({ id, data }) => ({
      classCode: id,
      className: data.className || id,
      teacherId: data.teacherId || null,
      teacherName: data.teacherName || teacherNames[data.teacherId] || '알 수 없음',
      studentCount: data.students?.length || 0,
      gradeLevel: data.gradeLevel || null,
      createdAt: data.createdAt || null
    }));

    // 모든 슈퍼관리자의 userData에 classesSummary 저장
    const batch = db.batch();
    superAdminsSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        classesSummary,
        classesSummaryUpdatedAt: new Date().toISOString()
      });
    });
    await batch.commit();

    console.log(`[동기화] ${superAdminsSnapshot.size}명의 슈퍼관리자에게 ${classesSummary.length}개 학급 정보 동기화 완료`);
  } catch (error) {
    console.error('[동기화] 슈퍼관리자 classesSummary 동기화 에러:', error);
  }
};

// 🚀 학생 userData에 classInfo 동기화 (기존 학생 + 과제 변경 시)
const syncStudentClassInfo = async (classCode) => {
  try {
    const classDoc = await db.doc(`classes/${classCode}`).get();
    if (!classDoc.exists) {
      console.log(`[동기화] 학급 ${classCode} 없음`);
      return;
    }

    const classData = classDoc.data();

    // 선생님 이름 조회
    let teacherName = classData.teacherName;
    if (!teacherName && classData.teacherId) {
      const teacherDoc = await db.doc(`users/${classData.teacherId}`).get();
      if (teacherDoc.exists) {
        const teacherData = teacherDoc.data();
        teacherName = teacherData.name || teacherData.email?.split('@')[0] || '알 수 없음';
      }
    }

    const classInfo = {
      classCode: classCode,
      className: classData.className || classCode,
      teacherId: classData.teacherId,
      teacherName: teacherName || '알 수 없음',
      gradeLevel: classData.gradeLevel,
      assignmentSummary: classData.assignmentSummary || [],
      weeklyRanking: classData.weeklyRanking || null,
      monthlyRanking: classData.monthlyRanking || null
    };

    // 해당 학급의 모든 학생 조회
    const studentsSnapshot = await db.collection('users')
      .where('classCode', '==', classCode)
      .where('role', '==', 'student')
      .get();

    if (studentsSnapshot.empty) {
      console.log(`[동기화] 학급 ${classCode}에 학생 없음`);
      return;
    }

    // 배치로 모든 학생 업데이트
    const batch = db.batch();
    studentsSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, { classInfo });
    });
    await batch.commit();

    console.log(`[동기화] 학급 ${classCode}의 ${studentsSnapshot.size}명 학생 classInfo 동기화 완료`);
  } catch (error) {
    console.error('[동기화] 학생 classInfo 동기화 에러:', error);
  }
};

exports.batchCreateStudents = onCall(async (request) => {
  // In v2, auth is in request.auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;

  const { classCode, count, prefix, gradeLevel } = data || {};
  const total = Number(count);

  if (!classCode) {
    throw new HttpsError('invalid-argument', 'classCode가 필요합니다.');
  }

  if (!total || total < 1 || total > MAX_STUDENTS_PER_CLASS) {
    throw new HttpsError('invalid-argument', `생성 인원은 1~${MAX_STUDENTS_PER_CLASS}명이어야 합니다.`);
  }

  if (!gradeLevel) {
    throw new HttpsError('invalid-argument', 'gradeLevel이 필요합니다.');
  }

  const teacherUid = request.auth.uid;
  const teacherRef = db.doc(`users/${teacherUid}`);
  const teacherSnap = await teacherRef.get();

  if (!teacherSnap.exists) {
    throw new HttpsError('permission-denied', '교사 프로필을 찾을 수 없습니다.');
  }

  const teacherData = teacherSnap.data();
  const isAdmin = teacherData.role === 'super_admin';

  if (!isAdmin && teacherData.role !== 'teacher') {
    throw new HttpsError('permission-denied', '교사만 학생 계정을 생성할 수 있습니다.');
  }

  const classRef = db.doc(`classes/${classCode}`);
  const classSnap = await classRef.get();

  if (!classSnap.exists) {
    throw new HttpsError('not-found', '클래스를 찾을 수 없습니다.');
  }

  const classData = classSnap.data();

  if (!isAdmin && classData.teacherId !== teacherUid) {
    throw new HttpsError('permission-denied', '해당 클래스의 담당 교사만 생성할 수 있습니다.');
  }

  const currentStudents = Array.isArray(classData.students) ? classData.students.length : 0;
  if (currentStudents + total > MAX_STUDENTS_PER_CLASS) {
    throw new HttpsError(
      'failed-precondition',
      `클래스 정원을 초과합니다. 현재 ${currentStudents}명, 최대 ${MAX_STUDENTS_PER_CLASS}명입니다.`
    );
  }

  const cleanedPrefix = (prefix || classCode || 'student')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'student';
  const domain = (teacherData.email || '').split('@')[1] || 'example.com';
  const now = new Date().toISOString();

  const results = [];
  const newStudents = [];

  for (let i = 1; i <= total; i++) {
    const seq = String(currentStudents + i).padStart(3, '0');
    const email = `${cleanedPrefix}${seq}@${domain}`;
    // Firebase requires minimum 6 characters for password
    // Always use format: prefix + seq + "123" to ensure 6+ characters
    const basePassword = `${cleanedPrefix}${seq}`;
    const password = basePassword.length >= 6 ? basePassword : `${basePassword}123`;
    const displayName = `학생${seq}`;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName
      });

      // 🚀 학생 userData에 classInfo 캐시 (로그인 시 DB 읽기 0회!)
      const classInfo = {
        classCode: classCode,
        className: classData.className || classCode,
        teacherId: classData.teacherId,
        teacherName: classData.teacherName || teacherData.name || teacherData.email?.split('@')[0] || '알 수 없음',
        gradeLevel: classData.gradeLevel,
        assignmentSummary: classData.assignmentSummary || [],
        weeklyRanking: classData.weeklyRanking || null,
        monthlyRanking: classData.monthlyRanking || null
      };

      await db.doc(`users/${userRecord.uid}`).set({
        uid: userRecord.uid,
        email,
        name: displayName,
        role: 'student',
        approved: true,
        gradeLevel,
        classCode,
        classInfo,  // 🚀 캐시된 학급 정보
        writingSummary: [],  // 🚀 초기값
        createdAt: now,
        createdBy: teacherUid
      });

      newStudents.push({
        studentId: userRecord.uid,
        studentName: displayName,
        joinedAt: now
      });

      results.push({ email, password, status: 'created' });
    } catch (error) {
      results.push({
        email,
        password: null,
        status: 'skipped',
        message: error.message
      });
    }
  }

  if (newStudents.length > 0) {
    await classRef.update({
      students: admin.firestore.FieldValue.arrayUnion(...newStudents)
    });

    // 🚀 학생 추가 후 슈퍼관리자 classesSummary 동기화
    await syncSuperAdminClassesSummary();
  }

  return {
    created: results.filter((r) => r.status === 'created').length,
    attempted: total,
    results
  };
});

// Delete user (both Auth and Firestore)
exports.deleteUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {userId} = data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId가 필요합니다.');
  }

  // Check if requester is super admin
  const requesterRef = db.doc(`users/${request.auth.uid}`);
  const requesterSnap = await requesterRef.get();

  if (!requesterSnap.exists || requesterSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 사용자를 삭제할 수 있습니다.');
  }

  try {
    // Delete from Firebase Auth
    await auth.deleteUser(userId);

    // Delete from Firestore
    await db.doc(`users/${userId}`).delete();

    return {success: true, message: '사용자가 삭제되었습니다.'};
  } catch (error) {
    throw new HttpsError('internal', `삭제 실패: ${error.message}`);
  }
});

// Batch delete users
exports.batchDeleteUsers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {userIds} = data;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new HttpsError('invalid-argument', 'userIds 배열이 필요합니다.');
  }

  // Check if requester is super admin
  const requesterRef = db.doc(`users/${request.auth.uid}`);
  const requesterSnap = await requesterRef.get();

  if (!requesterSnap.exists || requesterSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 사용자를 삭제할 수 있습니다.');
  }

  const results = [];

  for (const userId of userIds) {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(userId);

      // Delete from Firestore
      await db.doc(`users/${userId}`).delete();

      results.push({userId, status: 'deleted'});
    } catch (error) {
      results.push({userId, status: 'failed', error: error.message});
    }
  }

  const deleted = results.filter((r) => r.status === 'deleted').length;
  return {
    deleted,
    attempted: userIds.length,
    results
  };
});

// Reset student password (for teachers)
exports.resetStudentPassword = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {studentId, classCode} = data;

  if (!studentId || !classCode) {
    throw new HttpsError('invalid-argument', 'studentId와 classCode가 필요합니다.');
  }

  const teacherUid = request.auth.uid;

  // Check if requester is the teacher of this class or super admin
  const teacherRef = db.doc(`users/${teacherUid}`);
  const teacherSnap = await teacherRef.get();

  if (!teacherSnap.exists) {
    throw new HttpsError('permission-denied', '교사 프로필을 찾을 수 없습니다.');
  }

  const teacherData = teacherSnap.data();
  const isAdmin = teacherData.role === 'super_admin';

  if (!isAdmin && teacherData.role !== 'teacher') {
    throw new HttpsError('permission-denied', '교사만 학생 비밀번호를 초기화할 수 있습니다.');
  }

  // Verify teacher owns this class
  const classRef = db.doc(`classes/${classCode}`);
  const classSnap = await classRef.get();

  if (!classSnap.exists) {
    throw new HttpsError('not-found', '클래스를 찾을 수 없습니다.');
  }

  const classData = classSnap.data();

  if (!isAdmin && classData.teacherId !== teacherUid) {
    throw new HttpsError('permission-denied', '해당 클래스의 담당 교사만 비밀번호를 초기화할 수 있습니다.');
  }

  // Check if student belongs to this class
  const studentInClass = classData.students && classData.students.some(s => s.studentId === studentId);
  if (!studentInClass) {
    throw new HttpsError('not-found', '해당 학생이 이 클래스에 속해있지 않습니다.');
  }

  try {
    // Get student email from users collection
    const studentRef = db.doc(`users/${studentId}`);
    const studentSnap = await studentRef.get();

    if (!studentSnap.exists) {
      throw new HttpsError('not-found', '학생 정보를 찾을 수 없습니다.');
    }

    const studentData = studentSnap.data();
    const email = studentData.email;

    // Generate new password based on email prefix
    const emailPrefix = email.split('@')[0];
    const newPassword = emailPrefix.length >= 6 ? emailPrefix : `${emailPrefix}123`;

    // Update password in Firebase Auth
    await auth.updateUser(studentId, {
      password: newPassword
    });

    return {
      success: true,
      message: '비밀번호가 초기화되었습니다.',
      newPassword: newPassword
    };
  } catch (error) {
    throw new HttpsError('internal', `비밀번호 초기화 실패: ${error.message}`);
  }
});

// 🚀 글쓰기 품질 검사 함수 (반복문장, 무의미한 글 감지)
function checkWritingQuality(text) {
  // 1. 한글 자음/모음만 있는 무의미한 글 감지
  const koreanJamoPattern = /[ㄱ-ㅎㅏ-ㅣ]{5,}/g;
  const jamoMatches = text.match(koreanJamoPattern) || [];
  const totalJamoLength = jamoMatches.reduce((sum, m) => sum + m.length, 0);
  if (totalJamoLength > text.length * 0.3) {
    return {
      isInvalid: true,
      reason: '무의미한 자음/모음 반복',
      feedback: '의미있는 문장으로 글을 작성해주세요. 자음이나 모음만 나열하면 글이 될 수 없어요.',
      improvement: '완성된 글자와 문장으로 자신의 생각을 표현해보세요.'
    };
  }

  // 2. 알파벳/숫자 무의미 나열 감지
  const nonsensePattern = /[a-zA-Z0-9ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡ]{10,}/g;
  const nonsenseMatches = text.match(nonsensePattern) || [];
  const totalNonsenseLength = nonsenseMatches.reduce((sum, m) => sum + m.length, 0);
  if (totalNonsenseLength > text.length * 0.4) {
    return {
      isInvalid: true,
      reason: '무의미한 문자 나열',
      feedback: '의미있는 한글 문장으로 글을 작성해주세요.',
      improvement: '주제에 맞는 내용을 생각하며 차근차근 써보세요.'
    };
  }

  // 3. 문장 단위 반복 감지
  const sentences = text.split(/[.!?。]\s*/).filter(s => s.trim().length > 5);
  if (sentences.length >= 3) {
    const sentenceCount = {};
    sentences.forEach(s => {
      const normalized = s.trim().replace(/\s+/g, ' ');
      sentenceCount[normalized] = (sentenceCount[normalized] || 0) + 1;
    });

    // 같은 문장이 3번 이상 반복되는지 체크
    const repeatedSentences = Object.entries(sentenceCount).filter(([_, count]) => count >= 3);
    const totalRepeated = repeatedSentences.reduce((sum, [_, count]) => sum + count, 0);

    if (totalRepeated > sentences.length * 0.5) {
      return {
        isInvalid: true,
        reason: '동일 문장 과도한 반복',
        feedback: '같은 문장을 반복하지 말고, 다양한 내용으로 글을 채워주세요.',
        improvement: '각 문장마다 새로운 내용이나 생각을 담아보세요.'
      };
    }
  }

  // 4. 짧은 구절/패턴 반복 감지 (예: "~을 알고요" 반복)
  const shortPatterns = text.match(/(.{4,20})[.!?,]?\s*/g) || [];
  if (shortPatterns.length >= 5) {
    const patternCount = {};
    shortPatterns.forEach(p => {
      const normalized = p.trim().replace(/\s+/g, ' ');
      if (normalized.length >= 4) {
        patternCount[normalized] = (patternCount[normalized] || 0) + 1;
      }
    });

    const mostRepeated = Object.entries(patternCount).sort((a, b) => b[1] - a[1])[0];
    if (mostRepeated && mostRepeated[1] >= 5 && mostRepeated[1] > shortPatterns.length * 0.3) {
      return {
        isInvalid: true,
        reason: `"${mostRepeated[0].substring(0, 20)}..." 패턴 ${mostRepeated[1]}회 반복`,
        feedback: `같은 표현("${mostRepeated[0].substring(0, 15)}...")을 너무 많이 반복했어요. 다양한 문장으로 표현해보세요.`,
        improvement: '같은 말을 반복하지 말고, 각각 다른 내용과 표현으로 써보세요.'
      };
    }
  }

  // 5. 유니크한 단어 비율 체크 (다양성)
  const words = text.match(/[가-힣a-zA-Z]+/g) || [];
  if (words.length >= 20) {
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const diversityRatio = uniqueWords.size / words.length;

    if (diversityRatio < 0.25) { // 유니크 단어가 25% 미만이면
      return {
        isInvalid: true,
        reason: `단어 다양성 매우 부족 (${Math.round(diversityRatio * 100)}%)`,
        feedback: '같은 단어를 너무 많이 반복하고 있어요. 다양한 단어를 사용해보세요.',
        improvement: '비슷한 뜻의 다른 단어들도 찾아서 사용해보세요.'
      };
    }
  }

  // 6. 의미있는 한글 비율 체크
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars > 20 && koreanChars / totalChars < 0.5) {
    return {
      isInvalid: true,
      reason: '한글 비율 부족',
      feedback: '한글로 된 의미있는 문장을 작성해주세요.',
      improvement: '주제에 대한 자신의 생각을 한글 문장으로 표현해보세요.'
    };
  }

  return { isInvalid: false };
}

// Analyze writing using Gemini AI - 격려 중심 평가
exports.analyzeWriting = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {text, gradeLevel, topic, wordCount, idealWordCount, isRewrite, previousScore} = data || {};

  if (!text || !topic) {
    throw new HttpsError('invalid-argument', '텍스트와 주제가 필요합니다.');
  }

  // 🚀 서버 측 무의미한 글 감지 (AI 호출 전에 체크)
  const qualityCheck = checkWritingQuality(text);
  if (qualityCheck.isInvalid) {
    console.log(`[무의미한 글 감지] 사유: ${qualityCheck.reason}`);
    return {
      score: 0,
      contentScore: 0,
      topicRelevanceScore: 0,
      structureScore: 0,
      vocabularyScore: 0,
      grammarScore: 0,
      creativityScore: 0,
      feedback: qualityCheck.feedback,
      strengths: [],
      improvements: [qualityCheck.improvement],
      overallFeedback: qualityCheck.feedback,
      writingTips: ['주제에 맞는 의미있는 내용을 작성해보세요.', '같은 말을 반복하지 말고 다양한 문장으로 표현해보세요.'],
      detailedFeedback: [],
      qualityPenalty: qualityCheck.reason
    };
  }

  try {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

    const gradeLevelNames = {
      'elementary_1_2': '초등학교 1-2학년',
      'elementary_3_4': '초등학교 3-4학년',
      'elementary_5_6': '초등학교 5-6학년',
      'middle': '중학생',
      'high': '고등학생'
    };

    const gradeName = gradeLevelNames[gradeLevel] || gradeLevel;

    // 🚀 고쳐쓰기 모드 - 학생의 노력을 인정하여 점수 상승
    const rewriteInfo = isRewrite && previousScore !== null
      ? `\n\n**🔄 고쳐쓰기 모드 - 반드시 점수 상승!**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이 학생은 이전 글(${previousScore}점)을 수정하여 다시 제출했습니다.

⭐️ 핵심 원칙: 고쳐쓰기는 학생의 노력을 인정하여 **반드시 점수를 올려주세요!**
학생이 피드백을 받고 다시 노력했다는 것 자체가 칭찬받을 일입니다.

🎯 점수 산정 (필수!):
- 최소 점수: ${previousScore + 3}점 (이전 점수 + 3점 이상)
- 권장 점수: ${previousScore + 5}점 ~ ${previousScore + 12}점
- 내용이 조금이라도 추가/수정되었다면: +5점 ~ +10점
- 문법/맞춤법이 개선되었다면: +3점 ~ +5점 추가
- 구성이 개선되었다면: +3점 ~ +5점 추가

📌 평가 시 주의사항:
1. 고쳐쓰기한 글은 무조건 이전 점수(${previousScore}점)보다 높게 평가하세요
2. 학생이 다시 시도한 노력 자체를 인정해주세요
3. 작은 개선이라도 긍정적으로 평가하세요
4. 점수가 떨어지면 학생이 의욕을 잃습니다!

❌ 점수를 올리지 않아도 되는 유일한 경우:
- 이전 글과 완전히 동일한 내용 (복사-붙여넣기)
- 무의미한 문자 반복으로만 채움
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : '';

    const prompt = `당신은 ${gradeName} 학생의 글쓰기를 평가하는 따뜻하고 격려하는 선생님입니다.
학생의 노력과 성장 가능성을 인정하면서 구체적이고 도움이 되는 피드백을 제공해주세요.
**학생들이 글쓰기에 흥미를 잃지 않도록 격려 중심의 평가를 해주세요.**${rewriteInfo}

주제: ${topic}
글자 수: ${wordCount}자 (권장: ${idealWordCount}자)
학년: ${gradeName}

학생이 작성한 글:
"""
${text}
"""

**⚠️ 무의미한 글 감지 (최우선 확인!):**
다음 중 하나라도 해당하면 즉시 0점 처리:
- 같은 글자/단어 반복 (예: "아아아아아", "ㅋㅋㅋㅋ", "하하하하", "가나다라마바사아자차카타파하" 반복)
- 의미없는 알파벳 나열 (예: "asdfgh", "qwerty", "abcdef" 등)
- 의미없는 숫자 나열 (예: "123456", "111111" 등)
- 키보드 순서대로 입력 (예: "ㅂㅈㄷㄱㅅㅛ", "qwertyuiop")
- 의미없는 문장 반복 (예: "나는 밥을 먹었다. 나는 밥을 먹었다. 나는 밥을 먹었다.")
- 주제와 전혀 관련없는 횡설수설
- 글의 50% 이상이 무의미한 내용으로 채워진 경우

위 경우 score는 반드시 0점, feedback에 "의미있는 글을 작성해주세요"라고 적어주세요.

**✨ 평가 방침 (매우 중요!):**
- 학생들의 글쓰기 의욕을 북돋아주기 위해 **관대하게 평가**해주세요
- 완벽하지 않아도 노력이 보이면 높은 점수를 주세요
- 평균적인 글은 72-78점, 잘 쓴 글은 80-88점, 매우 뛰어난 글은 90점 이상입니다
- **기본 점수를 높게 시작하고, 심각한 문제가 있을 때만 감점하세요**

1. 내용 (25점) - 기본 18점에서 시작:
   - 22-25점: 주제에 대한 이해와 나름의 시각이 있음
   - 18-21점: 주제와 관련된 내용을 적절히 전개함
   - 12-17점: 주제를 다루고 있으나 깊이가 부족
   - 0-11점: 주제와 관련없거나 내용이 매우 빈약함

2. 주제 일치도 (10점) - ⚠️ 엄격하게 평가:
   - 9-10점: 글 전체가 주제와 완벽히 일치, 주제를 벗어난 부분 없음
   - 7-8점: 대부분 주제와 일치하나 일부 벗어난 내용 있음
   - 4-6점: 주제와 관련은 있으나 상당 부분 벗어남
   - 0-3점: 주제와 거의 관련 없는 내용 (이 경우 전체 점수 -20점 추가 감점!)

3. 구성 (20점) - 기본 14점에서 시작:
   - 17-20점: 서론/본론/결론 구조가 명확함
   - 14-16점: 기본적인 글 구조가 있음
   - 9-13점: 구조가 다소 불명확함
   - 0-8점: 구조 없이 나열식

4. 어휘 및 문장 다양성 (20점) - 기본 14점에서 시작:
   - 17-20점: 다양한 어휘와 문장 시작어 사용 (예: "나는", "그래서", "왜냐하면" 등 다양하게 시작)
   - 14-16점: 기본적인 어휘, 문장 시작어가 2-3가지 정도
   - 9-13점: 어휘가 단조롭고 같은 문장 시작어 반복 (예: 계속 "나는"으로 시작)
   - 0-8점: 같은 단어/시작어 과도한 반복 (이 경우 -5점 추가 감점!)

5. 문법/맞춤법 (15점) - 기본 11점에서 시작:
   - 13-15점: 맞춤법 오류 거의 없음
   - 11-12점: 사소한 실수 몇 개
   - 7-10점: 여러 개의 맞춤법 오류
   - 0-6점: 심각한 문법 오류 다수

6. 창의성 (10점) - 기본 6점에서 시작:
   - 9-10점: 독창적인 표현이나 시각
   - 6-8점: 나름의 개성이 있음
   - 3-5점: 평범하지만 성실함
   - 0-2점: 매우 틀에 박힌 내용

**📌 추가 감점 규칙 (반드시 적용!):**
- 주제 일치도 3점 이하: 전체 점수에서 -20점 추가 감점
- 같은 문장 시작어 4회 이상 연속 반복: -5점 추가 감점
- 글자 수 감점은 서버에서 자동 적용됨 (AI는 글자 수 감점하지 마세요)

**피드백 작성 지침 (매우 중요!):**
1. "잘한 점"은 학생이 실제로 잘한 구체적인 부분을 3-4개 이상 찾아서 칭찬해주세요 (문장 인용 포함)
2. "개선할 점"은 구체적인 예시와 함께 어떻게 고치면 좋을지 설명해주세요 (3개 이상)
3. "종합 의견"은 학생에게 직접 말하듯이 따뜻하면서도 구체적인 조언을 4-5문장으로 작성해주세요
4. "글쓰기 팁"은 이 학생이 다음에 글을 쓸 때 바로 적용할 수 있는 실용적인 조언 2-3개
5. "상세 피드백"에서는 실제로 고쳐야 할 문장을 글에서 찾아 구체적으로 수정 제안해주세요

반드시 다음 JSON 형식으로만 응답하세요:
{
  "score": 총점(0-100, 추가감점 포함),
  "contentScore": 내용점수(0-25),
  "topicRelevanceScore": 주제일치도점수(0-10),
  "structureScore": 구성점수(0-20),
  "vocabularyScore": 어휘및문장다양성점수(0-20),
  "grammarScore": 문법점수(0-15),
  "creativityScore": 창의성점수(0-10),
  "feedback": "전체적인 평가 한 줄 요약",
  "strengths": ["구체적으로 잘한 점 1 (해당 문장이나 표현 인용)", "잘한 점 2", "잘한 점 3", "잘한 점 4"],
  "improvements": ["구체적인 개선점 1 + 어떻게 고치면 좋을지", "개선점 2 + 수정 방법", "개선점 3 + 수정 방법"],
  "overallFeedback": "학생에게 직접 말하듯이 작성하는 종합 의견. 잘한 부분을 먼저 인정하고, 앞으로 어떻게 발전하면 좋을지 구체적으로 조언해주세요. 4-5문장으로 따뜻하면서도 도움이 되게 작성.",
  "writingTips": ["다음 글쓰기에 바로 적용할 수 있는 실용적인 팁 1", "팁 2"],
  "detailedFeedback": [
    {"type": "grammar", "original": "글에서 발견한 실제 틀린 문장", "suggestion": "올바르게 수정한 문장", "reason": "왜 이렇게 고쳐야 하는지 설명"},
    {"type": "vocabulary", "original": "개선할 수 있는 실제 표현", "suggestion": "더 좋은 표현", "reason": "이 표현이 더 좋은 이유"},
    {"type": "structure", "original": "구조적으로 개선할 부분", "suggestion": "개선된 형태", "reason": "구조 개선 이유"}
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 점수 유효성 검사 및 보정
    parsed.score = Math.max(0, Math.min(100, parsed.score || 0));
    parsed.contentScore = Math.max(0, Math.min(25, parsed.contentScore || 0));
    parsed.topicRelevanceScore = Math.max(0, Math.min(10, parsed.topicRelevanceScore || 0));
    parsed.structureScore = Math.max(0, Math.min(20, parsed.structureScore || 0));
    parsed.vocabularyScore = Math.max(0, Math.min(20, parsed.vocabularyScore || 0));
    parsed.grammarScore = Math.max(0, Math.min(15, parsed.grammarScore || 0));
    parsed.creativityScore = Math.max(0, Math.min(10, parsed.creativityScore || 0));

    // 🚀 주제 일치도 3점 이하 시 추가 감점 (AI가 안 했을 경우 대비)
    if (parsed.topicRelevanceScore <= 3) {
      const beforePenalty = parsed.score;
      parsed.score = Math.max(0, parsed.score - 20);
      parsed.topicPenalty = 20;
      console.log(`[주제이탈 감점] 주제일치도 ${parsed.topicRelevanceScore}점 → -20점 (${beforePenalty}→${parsed.score})`);
    }

    // 🚀 글자 수 강제 감점 (완화된 기준)
    if (wordCount && idealWordCount) {
      const ratio = wordCount / idealWordCount;
      let wordCountPenalty = 0;

      if (ratio < 0.20) {
        wordCountPenalty = 30; // 20% 미만: -30점
      } else if (ratio < 0.30) {
        wordCountPenalty = 25; // 20~29%: -25점
      } else if (ratio < 0.40) {
        wordCountPenalty = 20; // 30~39%: -20점
      } else if (ratio < 0.50) {
        wordCountPenalty = 15; // 40~49%: -15점
      } else if (ratio < 0.60) {
        wordCountPenalty = 12; // 50~59%: -12점
      } else if (ratio < 0.70) {
        wordCountPenalty = 10; // 60~69%: -10점
      } else if (ratio < 0.80) {
        wordCountPenalty = 7; // 70~79%: -7점
      } else if (ratio < 0.90) {
        wordCountPenalty = 5; // 80~89%: -5점
      }
      // 90% 이상: 감점 없음

      if (wordCountPenalty > 0) {
        const originalScore = parsed.score;
        parsed.score = Math.max(0, parsed.score - wordCountPenalty);
        parsed.wordCountPenalty = wordCountPenalty;
        console.log(`[글자수 감점] ${wordCount}자/${idealWordCount}자 (${Math.round(ratio * 100)}%) → -${wordCountPenalty}점 (${originalScore}→${parsed.score})`);
      }
    }

    // 🚀 고쳐쓰기 모드: 점수가 떨어지면 강제로 올려줌!
    if (isRewrite && previousScore !== null) {
      const originalAiScore = parsed.score;
      const scoreDiff = parsed.score - previousScore;

      // 점수가 떨어졌거나 같으면 강제로 올려줌 (최소 +3점)
      if (parsed.score <= previousScore) {
        const minBonus = 3;
        const maxBonus = 8;
        // 이전 점수에 따라 보너스 조정 (높을수록 보너스 적게)
        const bonus = previousScore >= 85 ? minBonus :
                      previousScore >= 75 ? minBonus + 2 :
                      previousScore >= 65 ? minBonus + 3 :
                      maxBonus;
        parsed.score = Math.min(100, previousScore + bonus);
        console.log(`[고쳐쓰기 보정] AI점수(${originalAiScore}) <= 이전점수(${previousScore}) → 강제 상승: ${parsed.score}점 (+${bonus})`);
      } else {
        console.log(`[고쳐쓰기] 이전: ${previousScore}점 → 현재: ${parsed.score}점 (+${scoreDiff}점)`);
      }

      parsed.isRewrite = true;
      parsed.previousScore = previousScore;
      parsed.scoreDiff = parsed.score - previousScore;
    }

    return parsed;
  } catch (error) {
    console.error('글 분석 에러:', error);
    throw new HttpsError('internal', `글 분석 실패: ${error.message}`);
  }
});

// Detect plagiarism
exports.detectPlagiarism = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {text, previousSubmissions} = data || {};

  if (!text) {
    throw new HttpsError('invalid-argument', '텍스트가 필요합니다.');
  }

  // 이전 제출물이 없으면 표절 없음으로 반환
  if (!previousSubmissions || previousSubmissions.length === 0) {
    return {
      isPlagiarized: false,
      similarityPercentage: 0,
      details: '비교할 이전 제출물이 없습니다.'
    };
  }

  try {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

    const previousTexts = previousSubmissions.map((s, i) => `[이전 글 ${i + 1}]\n${s.content}`).join('\n\n');

    const prompt = `다음 글이 이전에 제출된 글들과 얼마나 유사한지 분석해주세요.

[현재 제출된 글]
${text}

[이전에 제출된 글들]
${previousTexts}

유사도를 0-100%로 측정하고, 30% 이상이면 표절 의심으로 판단해주세요.
문장 구조, 표현, 아이디어의 유사성을 모두 고려하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "isPlagiarized": true/false,
  "similarityPercentage": 0-100,
  "details": "분석 결과 설명"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {isPlagiarized: false, similarityPercentage: 0, details: '분석 실패'};
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('표절 검사 에러:', error);
    return {isPlagiarized: false, similarityPercentage: 0, details: '검사 중 오류 발생'};
  }
});

// Detect AI usage - 더 관대한 기준으로 수정
exports.detectAIUsage = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {text, topic} = data || {};

  if (!text) {
    throw new HttpsError('invalid-argument', '텍스트가 필요합니다.');
  }

  try {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

    const prompt = `당신은 학생 글쓰기를 분석하는 전문가입니다. 다음 글이 AI에 의해 작성되었는지 **매우 신중하게** 분석해주세요.

주제: ${topic}

글:
"""
${text}
"""

**중요한 판단 기준:**

글을 잘 쓰는 것과 AI가 쓴 것은 완전히 다릅니다!
- 어른이나 글쓰기를 잘하는 학생도 완성도 높은 글을 씁니다
- 단순히 "글이 잘 쓰여졌다"는 것은 AI 사용의 근거가 아닙니다
- 맞춤법이 정확하고 문장이 매끄러운 것도 AI 증거가 아닙니다

**AI 작성의 명확한 징후 (여러 개가 동시에 나타나야 함):**
- ChatGPT 특유의 "~입니다. ~입니다." 반복 패턴
- "첫째, 둘째, 셋째" 같은 정형화된 나열 구조
- 감정이나 개인 경험이 전혀 없는 백과사전식 서술
- "결론적으로", "요약하자면" 같은 AI 특유 표현
- 모든 문장이 비슷한 길이와 구조

**사람이 쓴 글의 특징:**
- 개인적인 경험이나 생각 표현
- 감정 표현 (기쁘다, 슬프다, 재미있다 등)
- 문장 길이의 자연스러운 변화
- 구어체와 문어체의 자연스러운 혼용
- 약간의 문법 오류나 구어적 표현

**판정 기준 (매우 엄격하게):**
- LOW (0-30%): 기본값. 대부분의 글은 여기에 해당
- MEDIUM (31-60%): AI 특유 패턴이 2-3개 이상 명확히 발견될 때만
- HIGH (61-100%): AI 특유 패턴이 4개 이상이고, 개인적 표현이 전무할 때만

**의심스러우면 낮은 점수를 주세요.** 잘 쓴 글을 AI로 오판하는 것보다, AI 글을 놓치는 것이 학생에게 덜 해롭습니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "aiProbability": 0-100 (기본값은 15-25 범위로 설정),
  "verdict": "LOW/MEDIUM/HIGH",
  "explanation": "판정 이유를 학생이 이해할 수 있게 친절하게 설명 (2-3문장)",
  "humanLikeFeatures": ["사람이 쓴 것으로 보이는 특징1", "특징2"],
  "aiLikeFeatures": ["AI가 쓴 것으로 의심되는 특징 (없으면 빈 배열)"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        aiProbability: 15,
        verdict: 'LOW',
        explanation: '분석을 완료했습니다. 직접 작성한 글로 판단됩니다.',
        humanLikeFeatures: ['자연스러운 문체'],
        aiLikeFeatures: []
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 확률이 너무 높게 나오면 조정 (글을 잘 쓴다고 AI는 아님)
    if (parsed.aiProbability > 60 && (!parsed.aiLikeFeatures || parsed.aiLikeFeatures.length < 3)) {
      parsed.aiProbability = Math.min(parsed.aiProbability, 40);
      parsed.verdict = 'LOW';
    }

    return parsed;
  } catch (error) {
    console.error('AI 사용 감지 에러:', error);
    return {
      aiProbability: 15,
      verdict: 'LOW',
      explanation: '분석 중 오류가 발생했지만, 직접 작성한 글로 간주합니다.',
      humanLikeFeatures: [],
      aiLikeFeatures: []
    };
  }
});

// Get writing help
exports.getWritingHelp = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {text, topic, helpType} = data || {};

  if (!topic) {
    throw new HttpsError('invalid-argument', '주제가 필요합니다.');
  }

  try {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

    let prompt = '';
    if (helpType === 'hint') {
      prompt = `학생이 "${topic}"이라는 주제로 글을 쓰려고 합니다.
현재 작성된 내용: ${text || '(아직 없음)'}

학생이 스스로 생각할 수 있도록 힌트만 제공해주세요. 직접적인 내용을 알려주지 말고, 생각할 거리를 던져주세요.

JSON 형식으로 응답:
{
  "hints": ["힌트1", "힌트2", "힌트3"],
  "questions": ["생각해볼 질문1", "생각해볼 질문2"]
}`;
    } else if (helpType === 'structure') {
      prompt = `"${topic}"이라는 주제로 글을 쓸 때 어떤 구조로 쓰면 좋을지 안내해주세요.

JSON 형식으로 응답:
{
  "introduction": "서론에서 다룰 내용 안내",
  "body": ["본론1 안내", "본론2 안내"],
  "conclusion": "결론에서 다룰 내용 안내"
}`;
    } else if (helpType === 'polish') {
      prompt = `학생이 "${topic}"이라는 주제로 글을 쓰고 있습니다.

현재 작성된 내용:
"""
${text}
"""

위 글의 표현을 더 아름답고 풍부하게 다듬어주세요.
- 단조로운 표현을 생동감 있게
- 반복되는 단어를 다양한 어휘로
- 문장을 더 매끄럽게

원래 의미는 유지하면서 표현만 개선해주세요.

JSON 형식으로 응답:
{
  "polished": "다듬어진 전체 글",
  "changes": [
    {"before": "원래 표현", "after": "개선된 표현", "reason": "변경 이유"}
  ],
  "tips": ["표현 개선 팁1", "표현 개선 팁2"]
}`;
    } else if (helpType === 'expand') {
      prompt = `학생이 "${topic}"이라는 주제로 글을 쓰고 있습니다.

현재 작성된 내용:
"""
${text}
"""

위 글을 더 풍성하게 확장할 수 있도록 도와주세요.
- 추가할 수 있는 내용 제안
- 더 자세히 설명할 부분 안내
- 예시나 구체적인 상황 추가 아이디어

학생이 직접 쓸 수 있도록 아이디어만 제공해주세요.

JSON 형식으로 응답:
{
  "expandIdeas": ["확장 아이디어1", "확장 아이디어2", "확장 아이디어3"],
  "detailSuggestions": [
    {"part": "확장할 부분", "suggestion": "이렇게 더 자세히 쓸 수 있어요"}
  ],
  "examples": ["추가할 수 있는 예시1", "추가할 수 있는 예시2"]
}`;
    } else {
      prompt = `학생이 "${topic}"이라는 주제로 글을 쓰고 있습니다.
현재 작성된 내용: ${text || '(아직 없음)'}

글쓰기에 도움이 될 조언을 해주세요.

JSON 형식으로 응답:
{
  "advice": "전반적인 조언",
  "tips": ["팁1", "팁2"]
}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답 파싱 실패');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('글쓰기 도움 에러:', error);
    throw new HttpsError('internal', `도움 요청 실패: ${error.message}`);
  }
});

// Get quick advice during writing
exports.getQuickAdvice = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {text, topic, gradeLevel, adviceType} = data || {};

  if (!text || !topic) {
    throw new HttpsError('invalid-argument', '텍스트와 주제가 필요합니다.');
  }

  try {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

    const gradeLevelNames = {
      'elementary_1_2': '초등학교 1-2학년',
      'elementary_3_4': '초등학교 3-4학년',
      'elementary_5_6': '초등학교 5-6학년',
      'middle': '중학생',
      'high': '고등학생'
    };

    const gradeName = gradeLevelNames[gradeLevel] || gradeLevel;

    const prompt = `${gradeName} 학생이 "${topic}"이라는 주제로 글을 쓰고 있습니다.

현재까지 작성된 내용:
"""
${text}
"""

${adviceType === 'encourage' ? '학생을 격려하고 다음에 쓸 내용을 부드럽게 제안해주세요.' : '현재 글의 문제점과 개선 방향을 알려주세요.'}

반드시 1-2문장의 짧은 조언만 해주세요. 학생이 스스로 생각하도록 유도하세요.

JSON 형식으로 응답:
{
  "advice": "짧은 조언 (1-2문장)",
  "emoji": "적절한 이모지 1개"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {advice: '좋아요! 계속 써보세요.', emoji: '📝'};
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('실시간 조언 에러:', error);
    return {advice: '잘 하고 있어요!', emoji: '👍'};
  }
});

// Generate writing topics using Gemini AI
exports.generateTopics = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {gradeLevel, count = 5, category} = data || {};

  if (!gradeLevel) {
    throw new HttpsError('invalid-argument', 'gradeLevel이 필요합니다.');
  }

  // Check if requester is teacher or super admin
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new HttpsError('permission-denied', '사용자 정보를 찾을 수 없습니다.');
  }

  const userData = userSnap.data();
  if (userData.role !== 'teacher' && userData.role !== 'super_admin') {
    throw new HttpsError('permission-denied', '교사만 주제를 생성할 수 있습니다.');
  }

  try {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

    const gradeLevelNames = {
      'elementary_1_2': '초등학교 1-2학년',
      'elementary_3_4': '초등학교 3-4학년',
      'elementary_5_6': '초등학교 5-6학년',
      'middle': '중학생',
      'high': '고등학생'
    };

    const gradeName = gradeLevelNames[gradeLevel] || gradeLevel;
    const categoryText = category ? `카테고리: ${category}` : '다양한 카테고리';

    const prompt = `${gradeName} 학생들을 위한 글쓰기 주제를 ${count}개 생성해주세요.
${categoryText}

각 주제는 학생들이 흥미를 가질 수 있고, 창의적인 글을 쓸 수 있는 것이어야 합니다.

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "topics": [
    {
      "title": "주제 제목",
      "description": "주제에 대한 간단한 설명 (1-2문장)",
      "category": "카테고리명"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('AI 주제 생성 에러:', error);
    throw new HttpsError('internal', `주제 생성 실패: ${error.message}`);
  }
});

// 🚀 기존 글에 classCode 일괄 업데이트 (관리자용) - 학급별 데이터 분리 최적화
exports.migrateWritingsClassCode = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  // 슈퍼 관리자만 실행 가능
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists || userSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 실행할 수 있습니다.');
  }

  try {
    // 1. 모든 학생의 classCode 조회 (users 컬렉션)
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .get();

    const studentClassMap = new Map(); // studentId -> classCode
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.classCode) {
        studentClassMap.set(docSnap.id, data.classCode);
      }
    });

    if (studentClassMap.size === 0) {
      return { updated: 0, message: 'classCode가 있는 학생이 없습니다.' };
    }

    // 2. classCode가 없는 글 조회
    const writingsSnapshot = await db.collection('writings').get();

    const toUpdate = [];
    writingsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // classCode가 없거나 빈 문자열인 글만 업데이트
      if (!data.classCode && data.studentId) {
        const classCode = studentClassMap.get(data.studentId);
        if (classCode) {
          toUpdate.push({ ref: docSnap.ref, classCode });
        }
      }
    });

    if (toUpdate.length === 0) {
      return { updated: 0, message: '업데이트할 글이 없습니다. 모든 글에 classCode가 있습니다.' };
    }

    // 3. 배치 업데이트 (500개씩)
    const batchSize = 500;
    let updatedCount = 0;

    for (let i = 0; i < toUpdate.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = toUpdate.slice(i, i + batchSize);
      batchDocs.forEach(({ ref, classCode }) => {
        batch.update(ref, { classCode });
      });
      await batch.commit();
      updatedCount += batchDocs.length;
    }

    return {
      updated: updatedCount,
      totalStudents: studentClassMap.size,
      message: `${updatedCount}개의 글에 classCode가 추가되었습니다.`
    };
  } catch (error) {
    console.error('classCode 마이그레이션 에러:', error);
    throw new HttpsError('internal', `마이그레이션 실패: ${error.message}`);
  }
});

// 🚀 24시간 지난 미달성 글 자동 삭제 (매일 새벽 3시 실행 - 비용 최적화)
const {onSchedule} = require('firebase-functions/v2/scheduler');

exports.autoCleanupFailedWritings = onSchedule('0 3 * * *', async (event) => {
  // 매일 새벽 3시 (UTC 기준, 한국 시간 낮 12시)
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24시간 전
    const PASSING_SCORE = 70;

    console.log(`[자동 삭제] 시작 - ${now.toISOString()}`);

    // 24시간 지난 미달성 글 조회
    const writingsRef = db.collection('writings');
    const snapshot = await writingsRef
      .where('isDraft', '==', false)
      .where('submittedAt', '<', oneDayAgo.toISOString())
      .get();

    if (snapshot.empty) {
      console.log('[자동 삭제] 삭제할 글 없음');
      return null;
    }

    // 미달성 글만 필터링 + users의 writingSummary에서도 제거할 정보 수집
    const toDelete = [];
    const userWritingsToRemove = new Map(); // studentId -> [writingId, ...]

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const minScore = data.minScore !== undefined ? data.minScore : PASSING_SCORE;
      if (data.score < minScore) {
        toDelete.push({ ref: docSnap.ref, data });

        // users의 writingSummary에서도 제거할 정보 수집
        if (data.studentId) {
          if (!userWritingsToRemove.has(data.studentId)) {
            userWritingsToRemove.set(data.studentId, []);
          }
          userWritingsToRemove.get(data.studentId).push(data.writingId || docSnap.id);
        }
      }
    });

    if (toDelete.length === 0) {
      console.log('[자동 삭제] 미달성 글 없음');
      return null;
    }

    // 배치 삭제 (500개씩)
    const batchSize = 500;
    let deletedCount = 0;

    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = toDelete.slice(i, i + batchSize);
      batchDocs.forEach(({ ref }) => batch.delete(ref));
      await batch.commit();
      deletedCount += batchDocs.length;
    }

    // 🚀 users의 writingSummary에서도 삭제된 글 제거
    for (const [studentId, writingIds] of userWritingsToRemove) {
      try {
        const userRef = db.doc(`users/${studentId}`);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const summary = userData.writingSummary || [];
          const filtered = summary.filter(s => !writingIds.includes(s.writingId));
          if (filtered.length !== summary.length) {
            await userRef.update({ writingSummary: filtered });
          }
        }
      } catch (e) {
        console.warn(`[자동 삭제] writingSummary 업데이트 실패 - ${studentId}:`, e);
      }
    }

    console.log(`[자동 삭제] 완료 - ${deletedCount}개 삭제됨`);
    return { deleted: deletedCount };
  } catch (error) {
    console.error('[자동 삭제] 에러:', error);
    return null;
  }
});

// 🚀 동일 주제 미제출글 정리 - 같은 주제의 미제출글 중 점수가 가장 높은 것만 남김
// 24시간 이내 글도 포함, 관리자용 즉시 실행
exports.cleanupDuplicateFailedWritings = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  // 슈퍼 관리자만 실행 가능
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists || userSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 실행할 수 있습니다.');
  }

  try {
    const PASSING_SCORE = 70;
    console.log('[중복 미제출글 정리] 시작');

    // 모든 미제출글 조회 (제출됨 but 미달성)
    const writingsRef = db.collection('writings');
    const snapshot = await writingsRef
      .where('isDraft', '==', false)
      .get();

    if (snapshot.empty) {
      return { deleted: 0, message: '글이 없습니다.' };
    }

    // 학생별 + 주제별로 그룹화
    const studentTopicMap = new Map(); // studentId -> { topic -> [writings] }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const minScore = data.minScore !== undefined ? data.minScore : PASSING_SCORE;

      // 미달성 글만 처리
      if (data.score >= minScore) return;

      const studentId = data.studentId;
      const topic = data.topic;

      if (!studentId || !topic) return;

      if (!studentTopicMap.has(studentId)) {
        studentTopicMap.set(studentId, new Map());
      }

      const topicMap = studentTopicMap.get(studentId);
      if (!topicMap.has(topic)) {
        topicMap.set(topic, []);
      }

      topicMap.get(topic).push({
        ref: docSnap.ref,
        writingId: data.writingId || docSnap.id,
        score: data.score || 0,
        submittedAt: data.submittedAt || data.createdAt
      });
    });

    // 삭제할 글 목록 생성 (같은 주제에서 최고점 제외)
    const toDelete = [];
    const userWritingsToRemove = new Map(); // studentId -> [writingId, ...]

    for (const [studentId, topicMap] of studentTopicMap) {
      for (const [topic, writings] of topicMap) {
        if (writings.length <= 1) continue; // 1개 이하면 스킵

        // 점수 내림차순 정렬 (점수 같으면 최신순)
        writings.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        });

        // 첫 번째(최고점) 제외하고 나머지 삭제 대상
        for (let i = 1; i < writings.length; i++) {
          toDelete.push({
            ref: writings[i].ref,
            studentId,
            writingId: writings[i].writingId,
            topic,
            score: writings[i].score
          });

          // users의 writingSummary에서도 제거할 정보 수집
          if (!userWritingsToRemove.has(studentId)) {
            userWritingsToRemove.set(studentId, []);
          }
          userWritingsToRemove.get(studentId).push(writings[i].writingId);
        }
      }
    }

    if (toDelete.length === 0) {
      console.log('[중복 미제출글 정리] 삭제할 글 없음');
      return { deleted: 0, message: '정리할 중복 미제출글이 없습니다.' };
    }

    console.log(`[중복 미제출글 정리] ${toDelete.length}개 삭제 예정`);

    // 배치 삭제 (500개씩)
    const batchSize = 500;
    let deletedCount = 0;

    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = toDelete.slice(i, i + batchSize);
      batchDocs.forEach(({ ref }) => batch.delete(ref));
      await batch.commit();
      deletedCount += batchDocs.length;
    }

    // 🚀 users의 writingSummary에서도 삭제된 글 제거
    let summaryUpdated = 0;
    for (const [studentId, writingIds] of userWritingsToRemove) {
      try {
        const userDocRef = db.doc(`users/${studentId}`);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const summary = userData.writingSummary || [];
          const filtered = summary.filter(s => !writingIds.includes(s.writingId));
          if (filtered.length !== summary.length) {
            await userDocRef.update({ writingSummary: filtered });
            summaryUpdated++;
          }
        }
      } catch (e) {
        console.warn(`[중복 미제출글 정리] writingSummary 업데이트 실패 - ${studentId}:`, e);
      }
    }

    console.log(`[중복 미제출글 정리] 완료 - ${deletedCount}개 삭제, ${summaryUpdated}명 writingSummary 업데이트`);

    return {
      deleted: deletedCount,
      summaryUpdated,
      details: toDelete.slice(0, 20).map(d => ({
        studentId: d.studentId.substring(0, 8) + '...',
        topic: d.topic.substring(0, 20),
        score: d.score
      })),
      message: `${deletedCount}개의 중복 미제출글이 삭제되었습니다.`
    };
  } catch (error) {
    console.error('[중복 미제출글 정리] 에러:', error);
    throw new HttpsError('internal', `정리 실패: ${error.message}`);
  }
});

// 🚀 학급 삭제 - 학급 내 모든 학생 삭제 (선생님은 제외)
// 슈퍼 관리자 또는 해당 학급의 담당 선생님만 삭제 가능
exports.deleteClassWithStudents = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const { classCode } = request.data || {};

  if (!classCode) {
    throw new HttpsError('invalid-argument', 'classCode가 필요합니다.');
  }

  // 사용자 권한 확인
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new HttpsError('permission-denied', '사용자 정보를 찾을 수 없습니다.');
  }

  const userData = userSnap.data();
  const isSuperAdmin = userData.role === 'super_admin';
  const isTeacher = userData.role === 'teacher';

  // 학급 정보 먼저 조회하여 권한 확인
  const classRef = db.doc(`classes/${classCode}`);
  const classDoc = await classRef.get();

  if (!classDoc.exists) {
    throw new HttpsError('not-found', '학급을 찾을 수 없습니다.');
  }

  const classData = classDoc.data();

  // 슈퍼 관리자가 아니고, 선생님이 아니거나, 해당 학급의 담당 선생님이 아닌 경우 거부
  if (!isSuperAdmin && (!isTeacher || classData.teacherId !== request.auth.uid)) {
    throw new HttpsError('permission-denied', '슈퍼 관리자 또는 해당 학급의 담당 선생님만 학급을 삭제할 수 있습니다.');
  }

  try {
    console.log(`[학급 삭제] 시작 - classCode: ${classCode}`);

    // classData는 이미 위에서 조회함
    const students = classData.students || [];
    const teacherId = classData.teacherId;

    console.log(`[학급 삭제] 학생 ${students.length}명, 선생님 ID: ${teacherId}`);

    let deletedStudents = 0;
    let deletedWritings = 0;
    const errors = [];

    // 2. 학생 계정 삭제 (Auth + Firestore)
    for (const student of students) {
      try {
        const studentId = student.studentId;

        // Firebase Auth에서 삭제
        try {
          await auth.deleteUser(studentId);
        } catch (authError) {
          if (authError.code !== 'auth/user-not-found') {
            console.warn(`[학급 삭제] Auth 삭제 실패 - ${studentId}:`, authError.message);
          }
        }

        // Firestore users 문서 삭제
        await db.doc(`users/${studentId}`).delete();

        // 해당 학생의 글 삭제
        const writingsQuery = db.collection('writings').where('studentId', '==', studentId);
        const writingsSnapshot = await writingsQuery.get();
        
        const batch = db.batch();
        writingsSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
          deletedWritings++;
        });
        if (!writingsSnapshot.empty) {
          await batch.commit();
        }

        // studentStats 삭제
        try {
          await db.doc(`studentStats/${studentId}`).delete();
        } catch (e) {
          // 무시
        }

        // drafts 삭제
        const draftsQuery = db.collection('drafts').where('studentId', '==', studentId);
        const draftsSnapshot = await draftsQuery.get();
        if (!draftsSnapshot.empty) {
          const draftBatch = db.batch();
          draftsSnapshot.forEach((docSnap) => draftBatch.delete(docSnap.ref));
          await draftBatch.commit();
        }

        deletedStudents++;
      } catch (studentError) {
        console.error(`[학급 삭제] 학생 삭제 실패 - ${student.studentId}:`, studentError);
        errors.push({ studentId: student.studentId, error: studentError.message });
      }
    }

    // 3. 학급 과제 삭제
    let deletedAssignments = 0;
    const assignmentsQuery = db.collection('assignments').where('classCode', '==', classCode);
    const assignmentsSnapshot = await assignmentsQuery.get();
    if (!assignmentsSnapshot.empty) {
      const assignmentBatch = db.batch();
      assignmentsSnapshot.forEach((docSnap) => {
        assignmentBatch.delete(docSnap.ref);
        deletedAssignments++;
      });
      await assignmentBatch.commit();
    }

    // 4. 선생님의 classCode 제거 (선생님은 삭제하지 않음)
    if (teacherId) {
      try {
        const teacherRef = db.doc(`users/${teacherId}`);
        const teacherDoc = await teacherRef.get();
        if (teacherDoc.exists) {
          const teacherData = teacherDoc.data();
          // 선생님이 이 학급만 담당하는 경우 classCode 제거
          if (teacherData.classCode === classCode) {
            await teacherRef.update({ classCode: admin.firestore.FieldValue.delete() });
          }
        }
      } catch (e) {
        console.warn(`[학급 삭제] 선생님 classCode 업데이트 실패:`, e);
      }
    }

    // 5. 학급 문서 삭제
    await classRef.delete();

    // 🚀 학급 삭제 후 슈퍼관리자 classesSummary 동기화
    await syncSuperAdminClassesSummary();

    console.log(`[학급 삭제] 완료 - 학생 ${deletedStudents}명, 글 ${deletedWritings}개, 과제 ${deletedAssignments}개 삭제`);

    return {
      success: true,
      deletedStudents,
      deletedWritings,
      deletedAssignments,
      errors: errors.length > 0 ? errors : undefined,
      message: `학급 "${classCode}" 삭제 완료: 학생 ${deletedStudents}명, 글 ${deletedWritings}개 삭제됨`
    };
  } catch (error) {
    console.error('[학급 삭제] 에러:', error);
    throw new HttpsError('internal', `학급 삭제 실패: ${error.message}`);
  }
});

// 🚀 수동으로 슈퍼관리자 classesSummary + 학생 classInfo 동기화 (관리자용)
exports.syncClassesSummary = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  // 슈퍼 관리자만 실행 가능
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists || userSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 실행할 수 있습니다.');
  }

  // 1. 🚀 각 학급의 assignmentSummary 정리 (assignments 컬렉션에 없는 과제 제거)
  const classesSnapshot = await db.collection('classes').get();
  let cleanedAssignments = 0;

  for (const classDoc of classesSnapshot.docs) {
    const classData = classDoc.data();
    const assignmentSummary = classData.assignmentSummary || [];

    if (assignmentSummary.length > 0) {
      // assignments 컬렉션에서 실제 존재하는 과제 ID 조회
      const assignmentsSnapshot = await db.collection('assignments')
        .where('classCode', '==', classDoc.id)
        .get();
      const validAssignmentIds = new Set(assignmentsSnapshot.docs.map(d => d.id));
      const validAssignmentTitles = new Set(assignmentsSnapshot.docs.map(d => d.data().title));

      // 유효한 과제만 필터링
      const cleanedSummary = assignmentSummary.filter(a =>
        validAssignmentIds.has(a.id) || validAssignmentTitles.has(a.title)
      );

      if (cleanedSummary.length !== assignmentSummary.length) {
        await db.doc(`classes/${classDoc.id}`).update({
          assignmentSummary: cleanedSummary
        });
        cleanedAssignments += (assignmentSummary.length - cleanedSummary.length);
        console.log(`[정리] 학급 ${classDoc.id}: ${assignmentSummary.length - cleanedSummary.length}개 과제 정리됨`);
      }
    }
  }

  // 2. 슈퍼관리자 classesSummary 동기화
  await syncSuperAdminClassesSummary();

  // 3. 모든 학급의 학생 classInfo 동기화
  let syncedStudents = 0;
  for (const classDoc of classesSnapshot.docs) {
    await syncStudentClassInfo(classDoc.id);
    syncedStudents++;
  }

  return { success: true, message: `동기화 완료 (학급 ${syncedStudents}개, 삭제된 과제 ${cleanedAssignments}개 정리)` };
});

// 🚀 매년 3월 1일 00:00 (한국 시간) 모든 학급 및 학생 자동 삭제
// Cron: 0 15 28 2 * (UTC 기준 2월 28일 15:00 = 한국 시간 3월 1일 00:00)
exports.autoDeleteAllClassesOnMarch1 = onSchedule({
  schedule: '0 15 28 2 *',
  timeZone: 'Asia/Seoul'
}, async (event) => {
  try {
    const now = new Date();
    console.log(`[연간 자동 삭제] 시작 - ${now.toISOString()}`);

    // 모든 학급 조회
    const classesSnapshot = await db.collection('classes').get();

    if (classesSnapshot.empty) {
      console.log('[연간 자동 삭제] 삭제할 학급 없음');
      return { deleted: 0, message: '삭제할 학급이 없습니다.' };
    }

    let totalDeletedClasses = 0;
    let totalDeletedStudents = 0;
    let totalDeletedWritings = 0;
    let totalDeletedAssignments = 0;
    const errors = [];

    // 각 학급 삭제
    for (const classDoc of classesSnapshot.docs) {
      const classCode = classDoc.id;
      const classData = classDoc.data();
      const students = classData.students || [];
      const teacherId = classData.teacherId;

      console.log(`[연간 자동 삭제] 학급 ${classCode} 처리 중 - 학생 ${students.length}명`);

      let deletedStudentsInClass = 0;
      let deletedWritingsInClass = 0;

      // 학생 계정 삭제
      for (const student of students) {
        try {
          const studentId = student.studentId;

          // Firebase Auth에서 삭제
          try {
            await auth.deleteUser(studentId);
          } catch (authError) {
            if (authError.code !== 'auth/user-not-found') {
              console.warn(`[연간 자동 삭제] Auth 삭제 실패 - ${studentId}:`, authError.message);
            }
          }

          // Firestore users 문서 삭제
          await db.doc(`users/${studentId}`).delete();

          // 해당 학생의 글 삭제
          const writingsQuery = db.collection('writings').where('studentId', '==', studentId);
          const writingsSnapshot = await writingsQuery.get();

          if (!writingsSnapshot.empty) {
            const batch = db.batch();
            writingsSnapshot.forEach((docSnap) => {
              batch.delete(docSnap.ref);
              deletedWritingsInClass++;
            });
            await batch.commit();
          }

          // studentStats 삭제
          try {
            await db.doc(`studentStats/${studentId}`).delete();
          } catch (e) {
            // 무시
          }

          // drafts 삭제
          const draftsQuery = db.collection('drafts').where('studentId', '==', studentId);
          const draftsSnapshot = await draftsQuery.get();
          if (!draftsSnapshot.empty) {
            const draftBatch = db.batch();
            draftsSnapshot.forEach((docSnap) => draftBatch.delete(docSnap.ref));
            await draftBatch.commit();
          }

          deletedStudentsInClass++;
        } catch (studentError) {
          console.error(`[연간 자동 삭제] 학생 삭제 실패 - ${student.studentId}:`, studentError);
          errors.push({ classCode, studentId: student.studentId, error: studentError.message });
        }
      }

      // 학급 과제 삭제
      let deletedAssignmentsInClass = 0;
      const assignmentsQuery = db.collection('assignments').where('classCode', '==', classCode);
      const assignmentsSnapshot = await assignmentsQuery.get();
      if (!assignmentsSnapshot.empty) {
        const assignmentBatch = db.batch();
        assignmentsSnapshot.forEach((docSnap) => {
          assignmentBatch.delete(docSnap.ref);
          deletedAssignmentsInClass++;
        });
        await assignmentBatch.commit();
      }

      // 선생님 classCode 제거 (선생님 계정은 유지)
      if (teacherId) {
        try {
          const teacherRef = db.doc(`users/${teacherId}`);
          const teacherDoc = await teacherRef.get();
          if (teacherDoc.exists) {
            const teacherData = teacherDoc.data();
            if (teacherData.classCode === classCode) {
              await teacherRef.update({ classCode: admin.firestore.FieldValue.delete() });
            }
          }
        } catch (e) {
          console.warn(`[연간 자동 삭제] 선생님 classCode 업데이트 실패:`, e);
        }
      }

      // 학급 문서 삭제
      await db.doc(`classes/${classCode}`).delete();

      totalDeletedClasses++;
      totalDeletedStudents += deletedStudentsInClass;
      totalDeletedWritings += deletedWritingsInClass;
      totalDeletedAssignments += deletedAssignmentsInClass;

      console.log(`[연간 자동 삭제] 학급 ${classCode} 완료 - 학생 ${deletedStudentsInClass}명, 글 ${deletedWritingsInClass}개`);
    }

    console.log(`[연간 자동 삭제] 전체 완료 - 학급 ${totalDeletedClasses}개, 학생 ${totalDeletedStudents}명, 글 ${totalDeletedWritings}개, 과제 ${totalDeletedAssignments}개`);

    return {
      deletedClasses: totalDeletedClasses,
      deletedStudents: totalDeletedStudents,
      deletedWritings: totalDeletedWritings,
      deletedAssignments: totalDeletedAssignments,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('[연간 자동 삭제] 에러:', error);
    return null;
  }
});

// 🚀 학급 내 학생들의 classCode 필드 마이그레이션
// 학급 코드가 삭제되었다가 복구된 경우 사용
exports.migrateStudentsClassCode = onCall(async (request) => {
  const { classCode } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  // 슈퍼관리자 확인
  const userSnap = await db.doc(`users/${userId}`).get();
  if (!userSnap.exists || userSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 실행할 수 있습니다.');
  }

  if (!classCode) {
    throw new HttpsError('invalid-argument', 'classCode가 필요합니다.');
  }

  try {
    // 1. 학급 문서에서 학생 목록 가져오기
    const classDoc = await db.doc(`classes/${classCode}`).get();
    if (!classDoc.exists) {
      throw new HttpsError('not-found', `학급 ${classCode}를 찾을 수 없습니다.`);
    }

    const classData = classDoc.data();
    const students = classData.students || [];
    const className = classData.className || classCode;
    const gradeLevel = classData.gradeLevel;
    const teacherId = classData.teacherId;
    const teacherName = classData.teacherName || '선생님';

    console.log(`[classCode 마이그레이션] 시작 - 학급: ${className} (${classCode}), 학생: ${students.length}명`);

    let updatedCount = 0;
    let errorCount = 0;

    // 2. 각 학생의 users 문서 업데이트
    for (const student of students) {
      try {
        const studentId = student.studentId;
        const studentRef = db.doc(`users/${studentId}`);
        const studentDoc = await studentRef.get();

        if (studentDoc.exists) {
          const studentData = studentDoc.data();

          // classCode와 classInfo 모두 업데이트
          await studentRef.update({
            classCode: classCode,
            'classInfo.classCode': classCode,
            'classInfo.className': className,
            'classInfo.gradeLevel': gradeLevel,
            'classInfo.teacherId': teacherId,
            'classInfo.teacherName': teacherName,
            'classInfo.assignmentSummary': classData.assignmentSummary || []
          });

          updatedCount++;
          console.log(`[classCode 마이그레이션] ${studentData.nickname || studentData.name} 업데이트 완료`);
        } else {
          console.warn(`[classCode 마이그레이션] 학생 문서 없음: ${studentId}`);
          errorCount++;
        }
      } catch (e) {
        console.error(`[classCode 마이그레이션] 학생 업데이트 실패:`, e);
        errorCount++;
      }
    }

    // 3. 해당 학급의 writings도 classCode 업데이트
    // 학생 ID 목록으로 해당 학생들의 글을 직접 조회
    let writingsUpdated = 0;
    const studentIds = students.map(s => s.studentId);

    // 학생별로 writings 조회하여 classCode 없는 것 업데이트
    for (const studentId of studentIds) {
      const writingsQuery = db.collection('writings')
        .where('studentId', '==', studentId);
      const writingsSnapshot = await writingsQuery.get();

      for (const docSnap of writingsSnapshot.docs) {
        const writingData = docSnap.data();
        // classCode가 없거나 잘못된 경우 업데이트
        if (!writingData.classCode || writingData.classCode !== classCode) {
          await docSnap.ref.update({ classCode: classCode });
          writingsUpdated++;
        }
      }
    }

    console.log(`[classCode 마이그레이션] 완료 - 학생 ${updatedCount}명, 글 ${writingsUpdated}개 업데이트`);

    return {
      success: true,
      className,
      classCode,
      studentsUpdated: updatedCount,
      writingsUpdated,
      errors: errorCount
    };
  } catch (error) {
    console.error('[classCode 마이그레이션] 에러:', error);
    throw new HttpsError('internal', error.message);
  }
});

// 🚀 기존 글의 minScore를 70점으로 마이그레이션 + 랭킹 재계산
exports.migrateMinScoreTo70 = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  // 슈퍼 관리자만 실행 가능
  const userRef = db.doc(`users/${request.auth.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists || userSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', '슈퍼 관리자만 실행할 수 있습니다.');
  }

  try {
    console.log('[minScore 마이그레이션] 시작');

    // 1. 모든 writings 문서에 minScore 70 추가 (없는 경우만)
    const writingsSnapshot = await db.collection('writings').get();
    let writingsUpdated = 0;

    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;

    for (const docSnap of writingsSnapshot.docs) {
      const data = docSnap.data();
      // 🔧 minScore가 없는 경우만 70으로 설정 (선생님이 설정한 값은 유지!)
      if (data.minScore === undefined) {
        batch.update(docSnap.ref, { minScore: 70 });
        writingsUpdated++;
        batchCount++;

        if (batchCount >= batchSize) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`[minScore 마이그레이션] writings ${writingsUpdated}개 업데이트`);

    // 2. 모든 users의 writingSummary에서 minScore 업데이트 (undefined인 경우만!)
    const usersSnapshot = await db.collection('users').where('role', '==', 'student').get();
    let usersUpdated = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.writingSummary && userData.writingSummary.length > 0) {
        // 🔧 minScore가 undefined인 항목만 70으로 설정 (선생님이 설정한 값은 유지!)
        let hasUndefined = false;
        const updatedSummary = userData.writingSummary.map(w => {
          if (w.minScore === undefined) {
            hasUndefined = true;
            return { ...w, minScore: 70 };
          }
          return w;
        });

        if (hasUndefined) {
          await userDoc.ref.update({ writingSummary: updatedSummary });
          usersUpdated++;
        }
      }
    }

    console.log(`[minScore 마이그레이션] users ${usersUpdated}명 writingSummary 업데이트`);

    // 3. 모든 학급의 랭킹 재계산 (passCount 기준 70점으로)
    const classesSnapshot = await db.collection('classes').get();
    let classesUpdated = 0;

    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classCode = classDoc.id;

      // 주간/월간 랭킹 재계산
      for (const period of ['weekly', 'monthly']) {
        const rankingField = period === 'weekly' ? 'weeklyRanking' : 'monthlyRanking';
        const savedRanking = classData[rankingField];

        if (savedRanking && savedRanking.data && savedRanking.data.length > 0) {
          // passCount 재계산 (70점 기준)
          const updatedData = [];

          for (const student of savedRanking.data) {
            // 해당 학생의 글 조회
            const writingsQuery = await db.collection('writings')
              .where('studentId', '==', student.studentId)
              .where('classCode', '==', classCode)
              .where('isDraft', '==', false)
              .get();

            let passCount = 0;
            let totalScore = 0;
            let submissionCount = 0;

            writingsQuery.forEach(doc => {
              const w = doc.data();
              if (w.score >= 70) passCount++;
              totalScore += w.score || 0;
              submissionCount++;
            });

            const averageScore = submissionCount > 0 ? Math.round(totalScore / submissionCount) : 0;
            // 새 랭킹 점수: 평균점수 × 3 + 통과횟수 × 20
            const rankingScore = averageScore * 3 + passCount * 20;

            updatedData.push({
              ...student,
              passCount,
              averageScore,
              submissionCount,
              rankingScore
            });
          }

          // 재정렬
          updatedData.sort((a, b) => b.rankingScore - a.rankingScore);
          const rankedData = updatedData.map((s, i) => ({ ...s, rank: i + 1 }));

          await classDoc.ref.update({
            [rankingField]: {
              ...savedRanking,
              data: rankedData,
              updatedAt: new Date().toISOString()
            }
          });
        }
      }
      classesUpdated++;
    }

    console.log(`[minScore 마이그레이션] 학급 ${classesUpdated}개 랭킹 재계산`);

    return {
      success: true,
      writingsUpdated,
      usersUpdated,
      classesUpdated,
      message: `마이그레이션 완료: 글 ${writingsUpdated}개, 학생 ${usersUpdated}명, 학급 ${classesUpdated}개`
    };
  } catch (error) {
    console.error('[minScore 마이그레이션] 에러:', error);
    throw new HttpsError('internal', error.message);
  }
});
