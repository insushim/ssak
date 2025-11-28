import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, orderBy, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================
// 🚀 캐싱 시스템 - Firestore 읽기 최적화
// ============================================
const assignmentsCache = new Map(); // classCode -> { data, timestamp }
const submissionsCache = new Map(); // key -> { data, timestamp }

// 🚀 캐시 TTL 극대화 (100,000명 대응)
const CACHE_TTL = {
  assignments: 600000,  // 10분 (이전 3분)
  submissions: 300000   // 5분 (이전 2분)
};

function isCacheValid(timestamp, ttl) {
  if (!timestamp) return false;
  // 10% jitter 추가로 thundering herd 방지
  const jitter = ttl * 0.1 * Math.random();
  return (Date.now() - timestamp) < (ttl + jitter);
}

// 과제 캐시 무효화
export function invalidateAssignmentsCache(classCode) {
  if (classCode) {
    assignmentsCache.delete(classCode);
  } else {
    assignmentsCache.clear();
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
    const assignment = {
      teacherId,
      classCode,
      title,
      description,
      dueDate,
      minScore,
      maxAiProbability,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);
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
      return cached.data;
    }

    const q = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode),
      orderBy('createdAt', 'desc'),
      limit(100) // 🚀 최대 100개로 증가 (50개 → 100개)
    );
    const snapshot = await getDocs(q);
    const assignments = [];
    snapshot.forEach((docSnap) => {
      assignments.push({ id: docSnap.id, ...docSnap.data() });
    });

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

export async function deleteAssignment(assignmentId, classCode = null) {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
    // 🚀 캐시 무효화
    if (classCode) {
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
    const submissions = assignmentData.submissions || [];

    // 같은 학생의 기존 제출 제거 (업데이트를 위해)
    const filteredSubmissions = submissions.filter(
      s => s.studentId !== submissionInfo.studentId
    );

    // 새 제출 정보 추가
    filteredSubmissions.push({
      studentId: submissionInfo.studentId,
      nickname: submissionInfo.nickname,
      score: submissionInfo.score,
      writingId: submissionInfo.writingId,
      submittedAt: submissionInfo.submittedAt,
      reviewed: false
    });

    // assignment 문서 업데이트
    await updateDoc(doc(db, 'assignments', assignmentDoc.id), {
      submissions: filteredSubmissions
    });

    // 🚀 캐시 무효화
    invalidateAssignmentsCache(classCode);

    console.log(`[submissions] "${topic}" 과제에 ${submissionInfo.nickname} 제출 정보 추가됨`);
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
