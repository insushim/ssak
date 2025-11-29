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

      await db.doc(`users/${userRecord.uid}`).set({
        uid: userRecord.uid,
        email,
        name: displayName,
        role: 'student',
        approved: true,
        gradeLevel,
        classCode,
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

// Analyze writing using Gemini AI - 더 깐깐한 평가 기준
exports.analyzeWriting = onCall({secrets: [geminiApiKey]}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }

  const data = request.data;
  const {text, gradeLevel, topic, wordCount, idealWordCount} = data || {};

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

    const prompt = `당신은 ${gradeName} 학생의 글쓰기를 평가하는 친절하면서도 전문적인 선생님입니다.
학생의 노력을 인정하면서도 구체적이고 도움이 되는 피드백을 제공해주세요.

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

다음 기준에 따라 엄격하게 평가해주세요.
분량이 부족하면 내용이 아무리 좋아도 높은 점수를 받을 수 없습니다.
평균적인 글은 60-70점대, 잘 쓴 글은 70-80점대, 매우 뛰어난 글은 80점 이상입니다.

1. 내용 (30점):
   - 25-30점: 주제에 대한 깊이 있는 이해와 창의적인 시각, 구체적인 예시와 근거
   - 18-24점: 주제를 잘 이해하고 적절한 내용 전개, 일부 구체적 예시
   - 10-17점: 기본적인 내용 전개는 있으나 깊이 부족
   - 0-9점: 주제 이해 부족, 내용이 빈약함

2. 구성 (25점):
   - 21-25점: 서론-본론-결론의 완벽한 구성, 문단 간 자연스러운 연결
   - 15-20점: 기본적인 글 구조 갖춤, 대체로 논리적 흐름
   - 8-14점: 구조가 불명확하거나 흐름이 어색함
   - 0-7점: 구조 없이 나열식

3. 어휘 (20점):
   - 17-20점: 다양하고 정확한 어휘 사용
   - 12-16점: 적절한 어휘 사용, 가끔 반복되는 표현
   - 6-11점: 기본적인 어휘만 사용, 표현이 단조로움
   - 0-5점: 어휘 부족, 같은 단어 반복

4. 문법/맞춤법 (15점):
   - 13-15점: 맞춤법, 띄어쓰기, 문장 부호 완벽
   - 9-12점: 사소한 실수 2-3개 정도
   - 5-8점: 여러 개의 맞춤법/문법 오류
   - 0-4점: 심각한 문법 오류 다수

5. 창의성 (10점):
   - 9-10점: 독창적인 관점과 참신한 아이디어
   - 6-8점: 개성 있는 표현이나 흥미로운 접근
   - 3-5점: 평범하지만 성실한 시도
   - 0-2점: 틀에 박힌 내용

글자 수 감점 (매우 중요!):
- 권장 글자 수의 90% 미만: -5점
- 권장 글자 수의 70% 미만: -15점
- 권장 글자 수의 50% 미만: -25점
- 권장 글자 수의 30% 미만: -35점
- 권장 글자 수의 20% 미만: -50점 (매우 부족, 최대 50점까지만 가능)

**피드백 작성 지침 (매우 중요!):**
1. "잘한 점"은 학생이 실제로 잘한 구체적인 부분을 3-4개 이상 찾아서 칭찬해주세요 (문장 인용 포함)
2. "개선할 점"은 구체적인 예시와 함께 어떻게 고치면 좋을지 설명해주세요 (3개 이상)
3. "종합 의견"은 학생에게 직접 말하듯이 따뜻하면서도 구체적인 조언을 4-5문장으로 작성해주세요
4. "글쓰기 팁"은 이 학생이 다음에 글을 쓸 때 바로 적용할 수 있는 실용적인 조언 2-3개
5. "상세 피드백"에서는 실제로 고쳐야 할 문장을 글에서 찾아 구체적으로 수정 제안해주세요

반드시 다음 JSON 형식으로만 응답하세요:
{
  "score": 총점(0-100),
  "contentScore": 내용점수(0-30),
  "structureScore": 구성점수(0-25),
  "vocabularyScore": 어휘점수(0-20),
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
    parsed.contentScore = Math.max(0, Math.min(30, parsed.contentScore || 0));
    parsed.structureScore = Math.max(0, Math.min(25, parsed.structureScore || 0));
    parsed.vocabularyScore = Math.max(0, Math.min(20, parsed.vocabularyScore || 0));
    parsed.grammarScore = Math.max(0, Math.min(15, parsed.grammarScore || 0));
    parsed.creativityScore = Math.max(0, Math.min(10, parsed.creativityScore || 0));

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
