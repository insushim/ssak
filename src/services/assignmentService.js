import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, orderBy, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================
// 🚀 캐싱 시스템 - Firestore 읽기 최적화
// ============================================
const assignmentsCache = new Map(); // classCode -> { data, timestamp }
const studentAssignmentsCache = new Map(); // classCode -> { data, timestamp } (submissions 제외)
const submissionsCache = new Map(); // key -> { data, timestamp }

// 🚀 캐시 TTL 극대화 (100,000명 대응)
const CACHE_TTL = {
  assignments: 1800000,  // 30분 (학생용 과제는 자주 변경 안됨)
  submissions: 300000    // 5분
};

function isCacheValid(timestamp, ttl) {
  if (!timestamp) return false;
  // 10% jitter 추가로 thundering herd 방지
  const jitter = ttl * 0.1 * Math.random();
  return (Date.now() - timestamp) < (ttl + jitter);
}

// 과제 캐시 무효화 (학생용 캐시 포함)
export function invalidateAssignmentsCache(classCode) {
  if (classCode) {
    assignmentsCache.delete(classCode);
    studentAssignmentsCache.delete(classCode);
  } else {
    assignmentsCache.clear();
    studentAssignmentsCache.clear();
  }
}

// 제출물 캐시 무효화
export function invalidateSubmissionsCache(key) {
  if (key) {
    submissionsCache.delete(key);
  } else {
    submissionsCache.clear();
  }
}

export async function createAssignment(teacherId, classCode, title, description, dueDate, minScore = 70, maxAiProbability = 50) {
  try {
    const createdAt = new Date().toISOString();
    const assignment = {
      teacherId,
      classCode,
      title,
      description,
      dueDate,
      minScore,
      maxAiProbability,
      createdAt
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);

    // 🚀 classes 문서에 과제 요약 추가 (학생용 - DB 읽기 0회)
    try {
      await updateDoc(doc(db, 'classes', classCode), {
        assignmentSummary: arrayUnion({
          id: docRef.id,
          title,
          description,  // 🚀 설명 추가
          minScore,
          createdAt
        })
      });
    } catch (e) {
      console.warn('과제 요약 추가 실패 (classes 문서):', e);
    }

    // 🚀 캐시 무효화
    invalidateAssignmentsCache(classCode);
    return { id: docRef.id, ...assignment };
  } catch (error) {
    console.error('과제 생성 에러:', error);
    throw error;
  }
}

// 🚀 최적화: 캐싱 + 정렬을 Firestore에서 처리
// 🔧 에러 핸들링 강화 - 에러 발생해도 앱이 중단되지 않도록
export async function getAssignmentsByClass(classCode, forceRefresh = false) {
  try {
    // 🔧 classCode 유효성 검사
    if (!classCode || typeof classCode !== 'string') {
      console.warn('getAssignmentsByClass: 유효하지 않은 classCode:', classCode);
      return [];
    }

    // 캐시 확인
    const cached = assignmentsCache.get(classCode);
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_TTL.assignments)) {
      console.log(`[📊 DB읽기] getAssignmentsByClass 캐시 히트 - ${cached.data.length}개 과제`);
      return cached.data;
    }

    console.log(`[📊 DB읽기] getAssignmentsByClass DB 조회 - classCode: ${classCode}`);
    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode),
      orderBy('createdAt', 'desc'),
      limit(100) // 🚀 최대 100개로 증가 (50개 → 100개)
    );
    const snapshot = await getDocs(q);
    const assignments = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      assignments.push({ id: docSnap.id, ...data });
    });
    console.log(`[📊 DB읽기] getAssignmentsByClass - ${assignments.length}개 과제 로드`);

    // 캐시 저장
    assignmentsCache.set(classCode, {
      data: assignments,
      timestamp: Date.now()
    });

    return assignments;
  } catch (error) {
    console.error('과제 목록 로드 에러:', error);
    // 🔧 에러 시 빈 배열 반환 (앱 중단 방지)
    return [];
  }
}

// 🚀 학생용 과제 목록 - classes 문서의 요약 정보 사용 (DB 읽기 0회!)
// classInfo에서 assignmentSummary를 추출해서 사용
export function getAssignmentsFromClassInfo(classInfo) {
  if (!classInfo || !classInfo.assignmentSummary) {
    return [];
  }
  // createdAt 기준 내림차순 정렬
  return [...classInfo.assignmentSummary].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// 🚀 기존 classes에 assignmentSummary 마이그레이션
export async function migrateAssignmentSummary(classCode) {
  try {
    // classes 문서 확인
    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (!classDoc.exists()) return { success: false };

    const classData = classDoc.data();

    // 이미 마이그레이션 됐으면 스킵
    if (classData.assignmentSummary && classData.assignmentSummary.length > 0) {
      console.log(`[마이그레이션] assignmentSummary 이미 존재 - ${classData.assignmentSummary.length}개`);
      return { success: true, migrated: false };
    }

    // assignments 컬렉션에서 요약 생성
    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('[마이그레이션] 과제 없음');
      return { success: true, migrated: false };
    }

    const summary = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      summary.push({
        id: docSnap.id,
        title: data.title,
        description: data.description || '',  // 🚀 설명 추가
        minScore: data.minScore || 70,
        createdAt: data.createdAt
      });
    });

    // classes 문서 업데이트
    await updateDoc(doc(db, 'classes', classCode), {
      assignmentSummary: summary
    });

    console.log(`[마이그레이션] assignmentSummary 생성 완료 - ${summary.length}개 과제`);
    return { success: true, migrated: true, count: summary.length };
  } catch (error) {
    console.error('[마이그레이션] assignmentSummary 에러:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAssignment(assignmentId, classCode = null, assignmentTitle = null) {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));

    // 🚀 classes 문서에서 과제 요약 제거
    if (classCode) {
      try {
        const classDoc = await getDoc(doc(db, 'classes', classCode));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          const summary = classData.assignmentSummary || [];
          // id 또는 title로 찾아서 제거
          const filtered = summary.filter(a => a.id !== assignmentId && a.title !== assignmentTitle);
          if (filtered.length !== summary.length) {
            await updateDoc(doc(db, 'classes', classCode), {
              assignmentSummary: filtered
            });
          }
        }
      } catch (e) {
        console.warn('과제 요약 제거 실패:', e);
      }
      invalidateAssignmentsCache(classCode);
    } else {
      invalidateAssignmentsCache(); // 전체 캐시 클리어
    }
  } catch (error) {
    console.error('과제 삭제 에러:', error);
    throw error;
  }
}

export async function submitAssignment(studentId, studentName, assignmentId, content) {
  try {
    const submission = {
      studentId,
      studentName,
      assignmentId,
      content,
      submittedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'submissions'), submission);
    // 🚀 캐시 무효화
    invalidateSubmissionsCache(`assignment_${assignmentId}`);
    invalidateSubmissionsCache(`student_${studentId}`);
    return { id: docRef.id, ...submission };
  } catch (error) {
    console.error('과제 제출 에러:', error);
    throw error;
  }
}

// 🚀 최적화: 캐싱 + 페이지네이션
export async function getSubmissionsByAssignment(assignmentId, forceRefresh = false) {
  try {
    const cacheKey = `assignment_${assignmentId}`;
    const cached = submissionsCache.get(cacheKey);
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_TTL.submissions)) {
      return cached.data;
    }

    const q = query(
      collection(db, 'submissions'),
      where('assignmentId', '==', assignmentId),
      limit(100) // 과제당 최대 100개 제출물
    );
    const snapshot = await getDocs(q);
    const submissions = [];
    snapshot.forEach((docSnap) => {
      submissions.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 캐시 저장
    submissionsCache.set(cacheKey, {
      data: submissions,
      timestamp: Date.now()
    });

    return submissions;
  } catch (error) {
    console.error('제출 목록 로드 에러:', error);
    throw error;
  }
}

// 🚀 최적화: 캐싱 + 페이지네이션
export async function getSubmissionsByStudent(studentId, forceRefresh = false) {
  try {
    const cacheKey = `student_${studentId}`;
    const cached = submissionsCache.get(cacheKey);
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_TTL.submissions)) {
      return cached.data;
    }

    const q = query(
      collection(db, 'submissions'),
      where('studentId', '==', studentId),
      limit(100) // 학생당 최대 100개 제출물
    );
    const snapshot = await getDocs(q);
    const submissions = [];
    snapshot.forEach((docSnap) => {
      submissions.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 캐시 저장
    submissionsCache.set(cacheKey, {
      data: submissions,
      timestamp: Date.now()
    });

    return submissions;
  } catch (error) {
    console.error('내 제출 목록 로드 에러:', error);
    throw error;
  }
}

// ============================================
// 🚀 assignments.submissions - 제출 현황 관리
// 선생님이 주제 클릭 시 DB 읽기 0회를 위해
// 제출자 정보를 assignment 문서에 직접 저장
// ============================================

// 🚀 글 제출 시 assignment에 제출자 정보 추가/업데이트
// 목표점수 이상인 글만 추가됨
export async function updateAssignmentSubmission(classCode, topic, submissionInfo) {
  try {
    // topic(제목)으로 assignment 찾기
    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode),
      where('title', '==', topic),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`[submissions] "${topic}" 과제를 찾을 수 없음 (자유 주제일 수 있음)`);
      return false;
    }

    const assignmentDoc = snapshot.docs[0];
    const assignmentData = assignmentDoc.data();
    const minScore = assignmentData.minScore || 70;
    const submissions = assignmentData.submissions || [];

    // 🚀 목표점수 미달이면 submissions에서 제거만 하고 추가하지 않음
    const filteredSubmissions = submissions.filter(
      s => s.studentId !== submissionInfo.studentId
    );

    // 목표점수 이상인 경우만 추가
    if (submissionInfo.score >= minScore) {
      filteredSubmissions.push({
        studentId: submissionInfo.studentId,
        nickname: submissionInfo.nickname,
        score: submissionInfo.score,
        writingId: submissionInfo.writingId,
        submittedAt: submissionInfo.submittedAt,
        reviewed: false
      });
      console.log(`[submissions] "${topic}" 과제에 ${submissionInfo.nickname} 제출 정보 추가됨 (${submissionInfo.score}점 >= ${minScore}점)`);
    } else {
      console.log(`[submissions] "${topic}" 과제 - ${submissionInfo.nickname} 목표점수 미달 (${submissionInfo.score}점 < ${minScore}점), 선생님에게 표시 안됨`);
    }

    // assignment 문서 업데이트
    await updateDoc(doc(db, 'assignments', assignmentDoc.id), {
      submissions: filteredSubmissions
    });

    // 🚀 캐시 무효화
    invalidateAssignmentsCache(classCode);

    return true;
  } catch (error) {
    console.error('assignment submission 업데이트 에러:', error);
    return false;
  }
}

// 🚀 글 삭제 시 assignment에서 제출자 정보 제거
export async function removeAssignmentSubmission(classCode, topic, writingId) {
  try {
    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode),
      where('title', '==', topic),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    const assignmentDoc = snapshot.docs[0];
    const assignmentData = assignmentDoc.data();
    const submissions = assignmentData.submissions || [];

    // 해당 writingId 제거
    const filteredSubmissions = submissions.filter(s => s.writingId !== writingId);

    await updateDoc(doc(db, 'assignments', assignmentDoc.id), {
      submissions: filteredSubmissions
    });

    // 🚀 캐시 무효화
    invalidateAssignmentsCache(classCode);

    return true;
  } catch (error) {
    console.error('assignment submission 제거 에러:', error);
    return false;
  }
}

// 🚀 주제 전체 글 삭제 시 submissions 전체 제거
export async function clearAssignmentSubmissions(classCode, topic) {
  try {
    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode),
      where('title', '==', topic),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    const assignmentDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'assignments', assignmentDoc.id), {
      submissions: []
    });

    // 🚀 캐시 무효화
    invalidateAssignmentsCache(classCode);

    return true;
  } catch (error) {
    console.error('assignment submissions 전체 삭제 에러:', error);
    return false;
  }
}

// ============================================
// 🚀 마이그레이션: 기존 writings에서 submissions 데이터 복원
// 기존 과제에 submissions 필드가 없는 경우 사용
// ============================================
export async function migrateAssignmentSubmissions(classCode) {
  try {
    console.log(`[마이그레이션] 시작 - classCode: ${classCode}`);

    // 1. 해당 클래스의 모든 과제 가져오기 (minScore 정보 포함)
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);

    if (assignmentsSnapshot.empty) {
      console.log('[마이그레이션] 과제가 없습니다.');
      return { success: true, migratedCount: 0 };
    }

    // 과제별 minScore 맵 생성
    const assignmentMinScores = new Map();
    assignmentsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      assignmentMinScores.set(data.title, data.minScore || 70);
    });

    // 2. 해당 클래스의 모든 제출된 글 가져오기
    const writingsQuery = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode),
      where('isDraft', '==', false)
    );
    const writingsSnapshot = await getDocs(writingsQuery);

    // 🚀 3. 학생 ID 수집 및 users 컬렉션에서 닉네임 조회
    const studentIds = new Set();
    writingsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.studentId) {
        studentIds.add(data.studentId);
      }
    });

    // users 컬렉션에서 닉네임 가져오기
    const nicknameMap = new Map();
    const studentIdArray = Array.from(studentIds);

    // 병렬로 사용자 정보 가져오기 (최대 30명씩 배치)
    const batchSize = 30;
    for (let i = 0; i < studentIdArray.length; i += batchSize) {
      const batch = studentIdArray.slice(i, i + batchSize);
      const userPromises = batch.map(async (studentId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', studentId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            nicknameMap.set(studentId, userData.nickname || userData.name || '익명');
          }
        } catch (e) {
          console.warn(`[마이그레이션] 사용자 ${studentId} 정보 조회 실패`);
        }
      });
      await Promise.all(userPromises);
    }
    console.log(`[마이그레이션] ${nicknameMap.size}명의 학생 닉네임 조회 완료`);

    // 주제별로 글 그룹화 (목표점수 이상인 글만!)
    const writingsByTopic = new Map();
    writingsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const topic = data.topic;
      if (!topic) return;

      // 🚀 목표점수 미달 글은 제외
      const minScore = assignmentMinScores.get(topic) || 70;
      if ((data.score || 0) < minScore) {
        return; // 목표점수 미달이면 스킵
      }

      if (!writingsByTopic.has(topic)) {
        writingsByTopic.set(topic, []);
      }

      // 🚀 닉네임: users 컬렉션에서 가져온 것 우선, 없으면 기존 데이터 사용
      const nickname = nicknameMap.get(data.studentId) || data.nickname || data.studentName || '익명';

      writingsByTopic.get(topic).push({
        studentId: data.studentId,
        nickname: nickname,
        score: data.score || 0,
        writingId: data.writingId || docSnap.id,
        submittedAt: data.submittedAt || data.createdAt,
        reviewed: data.reviewed || false
      });
    });

    console.log(`[마이그레이션] ${writingsByTopic.size}개 주제에서 목표점수 이상 글 발견`);

    // 4. 각 과제의 submissions 업데이트 (강제 업데이트 - 기존 데이터도 정리)
    let migratedCount = 0;
    for (const docSnap of assignmentsSnapshot.docs) {
      const assignmentData = docSnap.data();
      const topic = assignmentData.title;

      const topicWritings = writingsByTopic.get(topic) || [];

      // 같은 학생의 중복 제거 (가장 최근 글만 유지)
      const studentMap = new Map();
      topicWritings.forEach(w => {
        const existing = studentMap.get(w.studentId);
        if (!existing || new Date(w.submittedAt) > new Date(existing.submittedAt)) {
          studentMap.set(w.studentId, w);
        }
      });

      const submissions = Array.from(studentMap.values());

      await updateDoc(doc(db, 'assignments', docSnap.id), {
        submissions: submissions
      });

      console.log(`[마이그레이션] "${topic}" - ${submissions.length}명 submissions (목표점수 이상)`);
      migratedCount++;
    }

    // 캐시 무효화
    invalidateAssignmentsCache(classCode);

    console.log(`[마이그레이션] 완료 - ${migratedCount}개 과제 업데이트됨`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error('[마이그레이션] 에러:', error);
    return { success: false, error: error.message };
  }
}
