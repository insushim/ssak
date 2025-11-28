import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  documentId
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { analyzeWriting, detectPlagiarism, detectAIUsage } from '../utils/geminiAPI';
import { PASSING_SCORE, PLAGIARISM_THRESHOLD, WORD_COUNT_STANDARDS } from '../config/auth';

// ============================================
// 🚀 캐싱 시스템 - Firestore 읽기 최적화 (10,000명 대응)
// ============================================

// LocalStorage 키 접두사
const LS_PREFIX = 'ssak_cache_';

// 캐시 저장소 (메모리 캐시 + LocalStorage 영속화)
const cache = {
  studentWritings: new Map(), // studentId -> { data, timestamp }
  classData: new Map(),       // classCode -> { data, timestamp }
  userNicknames: new Map(),   // studentId -> { nickname, timestamp }
  studentStats: new Map(),    // studentId -> { data, timestamp }
  classRanking: new Map(),    // classCode_period -> { data, timestamp }
};

const rankingCache = new Map(); // classCode_period -> { data, timestamp }

// Ranking 캐시 무효화 함수
export function invalidateRankingCache(classCode) {
  if (classCode) {
    rankingCache.delete(`${classCode}_weekly`);
    rankingCache.delete(`${classCode}_monthly`);
  } else {
    rankingCache.clear();
  }
}

// 🚀 캐시 유효 시간 극대화 (100,000명 대응) - 비용 최적화를 위해 대폭 증가
const CACHE_TTL = {
  studentWritings: 3600000,  // 60분 - 본인 글 (이전 5분) - 제출 시에만 무효화
  classData: 3600000,        // 60분 - 반 정보 (이전 10분)
  userNicknames: 7200000,    // 2시간 - 닉네임 (이전 30분)
  studentStats: 3600000,     // 60분 - 학생 통계 (이전 10분)
  classRanking: 3600000,     // 60분 - 랭킹 (이전 30분)
};

// 캐시 유효성 확인 (jitter 추가로 thundering herd 방지)
function isCacheValid(timestamp, ttl) {
  if (!timestamp) return false;
  // 🚀 10% jitter 추가 - 캐시 만료 시간 분산
  const jitter = ttl * 0.1 * Math.random();
  return (Date.now() - timestamp) < (ttl + jitter);
}

// LocalStorage에 캐시 저장 (큰 데이터용)
function saveToLocalStorage(key, data) {
  try {
    const item = { data, timestamp: Date.now() };
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(item));
  } catch (e) {
    // localStorage 용량 초과 시 오래된 캐시 정리
    clearOldLocalStorageCache();
  }
}

// LocalStorage에서 캐시 로드
function loadFromLocalStorage(key, ttl) {
  try {
    const item = localStorage.getItem(LS_PREFIX + key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (isCacheValid(parsed.timestamp, ttl)) {
      return parsed.data;
    }
    localStorage.removeItem(LS_PREFIX + key);
  } catch (e) {
    // 파싱 에러 시 무시
  }
  return null;
}

// 오래된 LocalStorage 캐시 정리
function clearOldLocalStorageCache() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX));
  // 가장 오래된 50% 삭제
  const items = keys.map(k => {
    try {
      const parsed = JSON.parse(localStorage.getItem(k));
      return { key: k, timestamp: parsed?.timestamp || 0 };
    } catch {
      return { key: k, timestamp: 0 };
    }
  }).sort((a, b) => a.timestamp - b.timestamp);

  items.slice(0, Math.ceil(items.length / 2)).forEach(item => {
    localStorage.removeItem(item.key);
  });
}

// 캐시 무효화 함수
export function invalidateCache(type, key = null) {
  if (key) {
    cache[type]?.delete(key);
  } else if (cache[type]) {
    cache[type].clear();
  }
}

// 특정 학생의 글 캐시 무효화
export function invalidateStudentWritingsCache(studentId) {
  cache.studentWritings.delete(studentId);
}

// 특정 반의 캐시 무효화
export function invalidateClassCache(classCode) {
  cache.classData.delete(classCode);
}

export async function saveWriting(studentId, writingData, isDraft = true) {
  try {
    const writingId = `${studentId}_${Date.now()}`;
    const data = {
      ...writingData,
      studentId,
      writingId,
      isDraft,
      lastSavedAt: new Date().toISOString(),
      createdAt: writingData.createdAt || new Date().toISOString()
    };

    await setDoc(doc(db, 'writings', writingId), data);
    return data;
  } catch (error) {
    console.error('글 저장 에러:', error);
    throw error;
  }
}

// 주제별 임시 저장 (덮어쓰기 방식)
export async function saveDraftByTopic(studentId, topic, writingData) {
  try {
    const draftId = `draft_${studentId}_${encodeURIComponent(topic)}`;
    const data = {
      ...writingData,
      studentId,
      topic,
      draftId,
      isDraft: true,
      lastSavedAt: new Date().toISOString(),
      createdAt: writingData.createdAt || new Date().toISOString()
    };

    await setDoc(doc(db, 'drafts', draftId), data);
    return data;
  } catch (error) {
    console.error('임시 저장 에러:', error);
    throw error;
  }
}

// 주제별 임시 저장 불러오기
export async function getDraftByTopic(studentId, topic) {
  try {
    const draftId = `draft_${studentId}_${encodeURIComponent(topic)}`;
    const draftDoc = await getDoc(doc(db, 'drafts', draftId));
    if (draftDoc.exists()) {
      return draftDoc.data();
    }
    return null;
  } catch (error) {
    console.error('임시 저장 불러오기 에러:', error);
    return null;
  }
}

// 임시 저장 삭제 (제출 후)
export async function deleteDraft(studentId, topic) {
  try {
    const draftId = `draft_${studentId}_${encodeURIComponent(topic)}`;
    await deleteDoc(doc(db, 'drafts', draftId));
    return true;
  } catch (error) {
    console.error('임시 저장 삭제 에러:', error);
    return false;
  }
}

// 🚀 24시간 지난 미달성 글 자동 삭제 (대시보드 로드 시 호출)
export async function cleanupOldFailedWritings(studentId, writings, passingScore = 70) {
  try {
    if (!studentId || !writings || writings.length === 0) {
      return { deleted: 0 };
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 24시간 지난 미달성 글 필터링
    const oldFailedWritings = writings.filter(w =>
      !w.isDraft &&
      w.submittedAt &&
      new Date(w.submittedAt) < oneDayAgo &&
      (w.score < (w.minScore !== undefined ? w.minScore : passingScore))
    );

    if (oldFailedWritings.length === 0) {
      return { deleted: 0 };
    }

    // 병렬 삭제
    await Promise.all(
      oldFailedWritings.map(w => deleteDoc(doc(db, 'writings', w.writingId)))
    );

    console.log(`[자동 정리] 24시간 지난 미달성 글 ${oldFailedWritings.length}개 삭제됨`);

    // 캐시 무효화
    invalidateStudentWritingsCache(studentId);

    return { deleted: oldFailedWritings.length };
  } catch (error) {
    console.error('24시간 미달성 글 삭제 에러:', error);
    return { deleted: 0, error };
  }
}

export async function getStudentWritings(studentId, forceRefresh = false) {
  try {
    // 🔧 studentId 유효성 검사
    if (!studentId) {
      console.warn('getStudentWritings: studentId가 없습니다');
      return [];
    }

    // 캐시 확인 (forceRefresh가 아니고 캐시가 유효하면 캐시 사용)
    const cached = cache.studentWritings.get(studentId);
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_TTL.studentWritings)) {
      return cached.data;
    }

    const q = query(
      collection(db, 'writings'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const writings = [];
    querySnapshot.forEach((doc) => {
      writings.push(doc.data());
    });

    // 캐시 저장
    cache.studentWritings.set(studentId, {
      data: writings,
      timestamp: Date.now()
    });

    return writings;
  } catch (error) {
    console.error('학생 글 조회 에러:', error);
    // 🔧 에러 시 빈 배열 반환 (앱 중단 방지)
    return [];
  }
}

export async function getWritingById(writingId) {
  try {
    const writingDoc = await getDoc(doc(db, 'writings', writingId));
    if (writingDoc.exists()) {
      return writingDoc.data();
    }
    return null;
  } catch (error) {
    console.error('글 조회 에러:', error);
    throw error;
  }
}

// isRewrite: 고쳐쓰기 모드 여부 (포인트 지급 조건에 영향)
// 🚀 최적화: classCode와 userData를 파라미터로 받아 getDoc 호출 최소화 (100,000명 대응)
export async function submitWriting(studentId, writingData, isRewrite = false, classCode = null, userData = null) {
  try {
    // 글자 수 기준 가져오기
    const standard = WORD_COUNT_STANDARDS[writingData.gradeLevel];
    const wordCount = writingData.wordCount;

    // 1. 이전 제출물 가져오기 (표절 검사용)
    const previousSubmissions = await getStudentWritings(studentId);
    const previousContents = previousSubmissions
      .filter(w => !w.isDraft && w.writingId !== writingData.writingId)
      .map(w => ({ content: w.content }));

    // 2. 표절 검사 (자기 글은 제외 - 같은 주제의 이전 버전은 제외)
    let plagiarismResult = null;
    // 같은 주제의 글은 고쳐쓰기이므로 표절 검사에서 제외
    const otherTopicContents = previousContents.filter(w => {
      // 같은 주제의 글은 제외 (고쳐쓰기)
      const prevWriting = previousSubmissions.find(ps => ps.content === w.content);
      return prevWriting && prevWriting.topic !== writingData.topic;
    });

    if (otherTopicContents.length > 0) {
      plagiarismResult = await detectPlagiarism(writingData.content, otherTopicContents);
      // 표절 검사 결과는 기록만 하고 제출은 차단하지 않음 (로그 제거)
    }

    // 3. AI 사용 감지 (참고사항으로만 - 제출 차단하지 않음)
    const aiUsageResult = await detectAIUsage(writingData.content, writingData.topic);

    // 4. AI 분석 (글자 수 포함)
    const analysisResult = await analyzeWriting(
      writingData.content,
      writingData.gradeLevel,
      writingData.topic,
      wordCount,
      standard.ideal
    );

    // 5. 제출 (기준 점수 체크 제거 - 모든 점수 허용)
    const now = new Date().toISOString();
    const writingId = writingData.writingId || `${studentId}_${Date.now()}`;

    // 🚀 classCode 파라미터가 없으면 userData에서 가져오기
    let finalClassCode = classCode;
    if (!finalClassCode && userData) {
      finalClassCode = userData.classCode;
    }

    const submissionData = {
      ...writingData,
      writingId,
      studentId,
      classCode: finalClassCode, // 🚀 랭킹 배치 조회를 위한 classCode 추가
      isDraft: false,
      isRewrite, // 고쳐쓰기 여부 저장
      createdAt: writingData.createdAt || now,
      submittedAt: now,
      analysis: analysisResult,
      plagiarismCheck: plagiarismResult,
      aiUsageCheck: aiUsageResult,
      score: analysisResult.score
    };

    await setDoc(doc(db, 'writings', writingId), submissionData);

    // 6. 학생 통계 업데이트 + 캐시 무효화
    await updateStudentStats(studentId, analysisResult.score);
    invalidateStudentStatsCache(studentId);

    // 7. 포인트 지급 (고쳐쓰기 여부, AI 가능성, userData 전달)
    const aiProbability = aiUsageResult?.aiProbability || 0;
    const earnedPoints = await awardPoints(studentId, analysisResult.score, isRewrite, aiProbability, userData);
    submissionData.earnedPoints = earnedPoints; // 지급된 포인트 정보 추가

    // 8. 🚀 달성 시 같은 주제의 미달성 글 + 임시저장 글 삭제 (Firestore 용량 최적화)
    const requiredScore = writingData.minScore !== undefined ? writingData.minScore : PASSING_SCORE;
    if (analysisResult.score >= requiredScore) {
      // 같은 주제의 미달성 글 찾아서 삭제
      const sameTopicFailedWritings = previousSubmissions.filter(w =>
        !w.isDraft &&
        w.topic === writingData.topic &&
        w.writingId !== writingId && // 현재 제출한 글 제외
        (w.score < (w.minScore !== undefined ? w.minScore : PASSING_SCORE))
      );

      // 🚀 같은 주제의 임시저장 글도 삭제
      const sameTopicDrafts = previousSubmissions.filter(w =>
        w.isDraft &&
        w.topic === writingData.topic &&
        w.writingId !== writingId
      );

      const toDelete = [...sameTopicFailedWritings, ...sameTopicDrafts];
      if (toDelete.length > 0) {
        // 병렬로 삭제
        await Promise.all(
          toDelete.map(w => deleteDoc(doc(db, 'writings', w.writingId)))
        );
        console.log(`[최적화] ${writingData.topic} 주제 미달성 글 ${sameTopicFailedWritings.length}개, 임시저장 ${sameTopicDrafts.length}개 삭제됨`);
      }
    }

    // 9. 🚀 24시간 지난 미달성 글 자동 삭제 (Firestore 용량 최적화)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldFailedWritings = previousSubmissions.filter(w =>
      !w.isDraft &&
      w.writingId !== writingId &&
      w.submittedAt &&
      new Date(w.submittedAt) < oneDayAgo &&
      (w.score < (w.minScore !== undefined ? w.minScore : PASSING_SCORE))
    );

    if (oldFailedWritings.length > 0) {
      await Promise.all(
        oldFailedWritings.map(w => deleteDoc(doc(db, 'writings', w.writingId)))
      );
      console.log(`[최적화] 24시간 지난 미달성 글 ${oldFailedWritings.length}개 삭제됨`);
    }

    // 🚀 캐시 무효화 - 글 제출 후 해당 학생의 글 캐시 갱신
    invalidateStudentWritingsCache(studentId);

    // 🚀 랭킹 캐시 무효화 (classCode 파라미터 활용)
    if (classCode) {
      invalidateRankingCache(classCode);
    }

    return submissionData;
  } catch (error) {
    console.error('글 제출 에러:', error);
    throw error;
  }
}

export async function updateStudentStats(studentId, score) {
  try {
    const statsRef = doc(db, 'studentStats', studentId);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const currentStats = statsDoc.data();
      const newTotalSubmissions = currentStats.totalSubmissions + 1;
      const newTotalScore = currentStats.totalScore + score;
      const newAverageScore = newTotalScore / newTotalSubmissions;

      await updateDoc(statsRef, {
        totalSubmissions: newTotalSubmissions,
        totalScore: newTotalScore,
        averageScore: Math.round(newAverageScore * 10) / 10,
        lastSubmittedAt: new Date().toISOString(),
        scores: [...currentStats.scores, score]
      });
    } else {
      await setDoc(statsRef, {
        studentId,
        totalSubmissions: 1,
        totalScore: score,
        averageScore: score,
        lastSubmittedAt: new Date().toISOString(),
        scores: [score]
      });
    }
  } catch (error) {
    console.error('학생 통계 업데이트 에러:', error);
    throw error;
  }
}

// 🚀 최적화: 캐싱 추가 (10,000명 대응)
export async function getStudentStats(studentId, forceRefresh = false) {
  try {
    // 캐시 확인 (메모리 -> LocalStorage)
    if (!forceRefresh) {
      const cached = cache.studentStats.get(studentId);
      if (cached && isCacheValid(cached.timestamp, CACHE_TTL.studentStats)) {
        return cached.data;
      }

      // LocalStorage 확인
      const lsData = loadFromLocalStorage(`stats_${studentId}`, CACHE_TTL.studentStats);
      if (lsData) {
        cache.studentStats.set(studentId, { data: lsData, timestamp: Date.now() });
        return lsData;
      }
    }

    const statsDoc = await getDoc(doc(db, 'studentStats', studentId));
    const result = statsDoc.exists() ? statsDoc.data() : {
      totalSubmissions: 0,
      averageScore: 0,
      scores: []
    };

    // 캐시 저장 (메모리 + LocalStorage)
    cache.studentStats.set(studentId, { data: result, timestamp: Date.now() });
    saveToLocalStorage(`stats_${studentId}`, result);

    return result;
  } catch (error) {
    console.error('학생 통계 조회 에러:', error);
    // 에러 시 빈 데이터 반환 (앱 중단 방지)
    return { totalSubmissions: 0, averageScore: 0, scores: [] };
  }
}

// 학생 통계 캐시 무효화
export function invalidateStudentStatsCache(studentId) {
  cache.studentStats.delete(studentId);
  try {
    localStorage.removeItem(LS_PREFIX + `stats_${studentId}`);
  } catch (e) {}
}

// 🚀 사용자 닉네임 캐싱 가져오기 (읽기 최적화)
async function getCachedUserNickname(studentId) {
  // 캐시 확인
  const cached = cache.userNicknames.get(studentId);
  if (cached && isCacheValid(cached.timestamp, CACHE_TTL.userNicknames)) {
    return cached.nickname;
  }

  // DB에서 가져오기
  try {
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};
    const nickname = studentData.nickname || studentData.name || '익명';

    // 캐시 저장
    cache.userNicknames.set(studentId, {
      nickname,
      timestamp: Date.now()
    });

    return nickname;
  } catch (error) {
    return '익명';
  }
}

// 🚀 배치 쿼리: classCode로 모든 글을 한 번에 가져오기 (전체 글 조회용)
// 🔧 migrateWritingsClassCode 함수 실행 후에는 폴백이 거의 사용되지 않음
// (안전장치로 폴백 로직 유지)
async function getAllClassWritingsBatch(classCode, studentIds = [], forTeacher = false) {
  try {
    // 1차: classCode 배치 쿼리 (1번의 Firestore 읽기)
    const q = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode),
      where('isDraft', '==', false)
    );

    const snapshot = await getDocs(q);
    const writings = [];
    const foundStudentIds = new Set();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      writings.push(data);
      if (data.studentId) {
        foundStudentIds.add(data.studentId);
      }
    });

    // 🔧 선생님 대시보드용: classCode가 없는 기존 글도 조회
    // studentIds 중 classCode 쿼리에서 글이 없는 학생만 추가 조회
    if (forTeacher && studentIds.length > 0) {
      const missingStudentIds = studentIds.filter(id => !foundStudentIds.has(id));

      if (missingStudentIds.length > 0) {
        // studentId 배치 쿼리 (Firestore 'in'은 최대 30개)
        const batchSize = 30;
        for (let i = 0; i < missingStudentIds.length; i += batchSize) {
          const batchIds = missingStudentIds.slice(i, i + batchSize);
          const fallbackQ = query(
            collection(db, 'writings'),
            where('studentId', 'in', batchIds),
            where('isDraft', '==', false)
          );
          const fallbackSnapshot = await getDocs(fallbackQ);
          fallbackSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // 이미 classCode 쿼리에서 가져온 글은 제외 (중복 방지)
            if (!writings.some(w => w.writingId === data.writingId)) {
              writings.push(data);
            }
          });
        }
      }
    }

    return writings;
  } catch (error) {
    console.error('배치 글 조회 에러:', error);
    return [];
  }
}

// forTeacher: true면 classCode가 없는 기존 글도 studentId로 폴백 조회
export async function getClassWritings(classCode, forceRefresh = false, forTeacher = true) {
  try {
    // classCode 유효성 검사
    if (!classCode || typeof classCode !== 'string') {
      console.error('유효하지 않은 classCode:', classCode);
      return [];
    }

    // 🚀 반 데이터 캐싱
    let classData;
    const cachedClass = cache.classData.get(classCode);
    if (!forceRefresh && cachedClass && isCacheValid(cachedClass.timestamp, CACHE_TTL.classData)) {
      classData = cachedClass.data;
    } else {
      const classDoc = await getDoc(doc(db, 'classes', classCode));
      if (!classDoc.exists()) {
        console.error('학급을 찾을 수 없음:', classCode);
        throw new Error('존재하지 않는 학급입니다.');
      }
      classData = classDoc.data();
      cache.classData.set(classCode, { data: classData, timestamp: Date.now() });
    }

    const students = classData.students || [];

    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map(s => s.studentId);

    // 🚀 최적화: 모든 글을 단 1번의 쿼리로 가져오기 (20개 쿼리 → 1개 쿼리)
    // 🔧 forTeacher=true면 classCode가 없는 기존 글도 studentId로 폴백 조회
    const allWritings = await getAllClassWritingsBatch(classCode, studentIds, forTeacher);

    // 학생별로 글 그룹화
    const writingsByStudent = new Map();
    allWritings.forEach(writing => {
      if (!writingsByStudent.has(writing.studentId)) {
        writingsByStudent.set(writing.studentId, []);
      }
      writingsByStudent.get(writing.studentId).push(writing);
    });

    // 🚀 최적화: 모든 사용자 데이터를 배치로 가져오기 (getCachedUserNickname 개별 호출 제거)
    // 25명 * 개별 getDoc 호출 = 25번 읽기 → 1번 배치 쿼리로 감소
    const userDataMap = new Map();
    const batchSize = 30;
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batchIds = studentIds.slice(i, i + batchSize);
      const q = query(
        collection(db, 'users'),
        where(documentId(), 'in', batchIds)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        userDataMap.set(docSnap.id, docSnap.data());
      });
    }

    // 닉네임 매핑 (추가 DB 호출 없음)
    const allWritingsWithNicknames = studentIds.flatMap((studentId) => {
      const userData = userDataMap.get(studentId) || {};
      const nickname = userData.nickname || userData.name || '익명';
      const writings = writingsByStudent.get(studentId) || [];

      return writings.map(w => ({
        ...w,
        nickname,
        displayName: nickname
      }));
    });

    return allWritingsWithNicknames.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  } catch (error) {
    console.error('학급 글 조회 에러:', error);
    // 🔧 에러 시 빈 배열 반환 (앱 중단 방지)
    return [];
  }
}

export async function deleteWriting(writingId) {
  try {
    await deleteDoc(doc(db, 'writings', writingId));
    return true;
  } catch (error) {
    console.error('글 삭제 에러:', error);
    throw error;
  }
}

// 친구 글 읽기 - 같은 주제로 제출한 친구들의 글 조회
// 🚀 최적화: classCode 배치 쿼리 1번으로 모든 글 가져오기 (학생별 개별 쿼리 완전 제거)
export async function getFriendWritings(classCode, topic, excludeStudentId) {
  try {
    if (!classCode || !topic) return [];

    // 🚀 classCode + topic으로 한번에 모든 관련 글 조회 (1번의 Firestore 읽기)
    const q = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode),
      where('isDraft', '==', false)
    );

    const snapshot = await getDocs(q);
    const allWritings = [];
    snapshot.forEach((docSnap) => {
      allWritings.push(docSnap.data());
    });

    // 필터링: 같은 주제, 80점 이상, 본인 제외
    const matchingWritings = allWritings.filter(w =>
      w.topic === topic &&
      w.score >= 80 &&
      w.studentId !== excludeStudentId
    );

    if (matchingWritings.length === 0) return [];

    // 닉네임은 글에 이미 저장되어 있으므로 추가 쿼리 불필요
    // 만약 닉네임이 없으면 '익명'으로 표시
    return matchingWritings
      .map(w => ({
        ...w,
        nickname: w.studentNickname || '익명',
        displayName: w.studentNickname || '익명'
      }))
      .sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('친구 글 조회 에러:', error);
    return [];
  }
}

// 포인트 지급 함수
// isRewrite: 고쳐쓰기 모드인지 여부
// 🚀 최적화: userData를 파라미터로 받아 getDoc 호출 제거 (100,000명 대응)
// aiProbability: AI 사용 가능성 (0-100)
export async function awardPoints(studentId, score, isRewrite = false, aiProbability = 0, userData = null) {
  try {
    // 50점 이하: 포인트 미지급 (의미없는 문장 방지)
    if (score <= 50) {
      return 0;
    }

    // 고쳐쓰기 모드에서 80점 미달: 포인트 미지급
    if (isRewrite && score < 80) {
      return 0;
    }

    // AI 가능성 80% 이상: 포인트 미지급
    if (aiProbability >= 80) {
      return 0;
    }

    const userRef = doc(db, 'users', studentId);

    // 🚀 userData가 제공되지 않은 경우에만 Firestore에서 조회
    if (!userData) {
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return 0;
      userData = userDoc.data();
    }

    const currentPoints = userData.points || 0;

    // 기본 포인트: 10P (50점 초과 시)
    let earnedPoints = 10;

    // 80점 이상: +20P 보너스
    if (score >= 80) {
      earnedPoints += 20;
    }

    // 90점 이상: +50P 추가 보너스 (총 80P)
    if (score >= 90) {
      earnedPoints += 30; // 이미 +20 받았으므로 +30 추가
    }

    // 연속 제출 보너스 체크
    const lastSubmitDate = userData.lastSubmitDate;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streakDays = userData.streakDays || 0;
    if (lastSubmitDate === yesterday) {
      streakDays += 1;
      earnedPoints += 5; // 연속 제출 보너스
    } else if (lastSubmitDate !== today) {
      streakDays = 1;
    }

    // AI 가능성 50% 이상: 포인트 절반 지급
    if (aiProbability >= 50) {
      earnedPoints = Math.floor(earnedPoints / 2);
    }

    const newPoints = currentPoints + earnedPoints;

    await updateDoc(userRef, {
      points: newPoints,
      lastSubmitDate: today,
      streakDays: streakDays
    });

    return earnedPoints;
  } catch (error) {
    console.error('포인트 지급 에러:', error);
    // 포인트 지급 실패해도 글 제출은 성공으로 처리
    return 0;
  }
}

// 🚀 배치 쿼리: classCode로 모든 글을 한 번에 가져오기 (100,000명 대응)
// 🔧 폴백 제거 - classCode 쿼리만 사용 (비용 최적화)
// 기존 글에 classCode가 없어도 새 글에는 있으므로 시간이 지나면 자연스럽게 해결됨
async function getClassWritingsBatch(classCode, startDate, studentIds = [], forceRefresh = false) {
  try {
    // classCode 배치 쿼리만 사용 (1번의 Firestore 읽기)
    // 🚀 폴백 쿼리 완전 제거 - 학생 수 * N 읽기 방지
    const q = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode),
      where('isDraft', '==', false),
      where('submittedAt', '>=', startDate.toISOString())
    );

    const snapshot = await getDocs(q);
    const writings = [];
    snapshot.forEach((docSnap) => {
      writings.push(docSnap.data());
    });

    return writings;
  } catch (error) {
    console.error('배치 글 조회 에러:', error);
    // 에러 시 빈 배열 반환 (폴백 쿼리 제거)
    return [];
  }
}

// 학급 랭킹 조회 (주간/월간)
// 🚀 최적화: 캐싱 활용 + 스파이크 방지 + 배치 쿼리 (100,000명 대응)
export async function getClassRanking(classCode, period = 'weekly', options = {}) {
  try {
    // 🚀 랭킹 결과 캐시 체크 (최우선)
    // 🔧 forceRefresh면 캐시 무시
    const cacheKey = `${classCode}_${period}`;
    if (!options.forceRefresh) {
      const cached = rankingCache.get(cacheKey);
      if (cached && isCacheValid(cached.timestamp, CACHE_TTL.classRanking)) {
        return cached.data;
      }
    }

    // 🚀 스파이크 방지: 동시 다중 요청 시 첫 요청만 처리
    if (!options.forceRefresh && rankingCache.has(`${cacheKey}_loading`)) {
      // 이미 로딩 중이면 100ms 대기 후 캐시 재확인
      await new Promise(resolve => setTimeout(resolve, 100));
      const recheck = rankingCache.get(cacheKey);
      if (recheck && isCacheValid(recheck.timestamp, CACHE_TTL.classRanking)) {
        return recheck.data;
      }
    }

    // 로딩 플래그 설정
    rankingCache.set(`${cacheKey}_loading`, true);

    // 반 데이터 캐싱 활용
    let classData;
    const cachedClass = cache.classData.get(classCode);
    if (cachedClass && isCacheValid(cachedClass.timestamp, CACHE_TTL.classData)) {
      classData = cachedClass.data;
    } else {
      const classDoc = await getDoc(doc(db, 'classes', classCode));
      if (!classDoc.exists()) {
        throw new Error('학급을 찾을 수 없습니다.');
      }
      classData = classDoc.data();
      cache.classData.set(classCode, { data: classData, timestamp: Date.now() });
    }

    const students = classData.students || [];

    if (students.length === 0) {
      return [];
    }

    // 기간 계산
    const now = new Date();
    let startDate;
    if (period === 'weekly') {
      // 이번 주 월요일
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // 이번 달 1일
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const studentIds = students.map(s => s.studentId);

    // 🚀 최적화 1: 모든 사용자 데이터를 배치로 가져오기
    const userDataMap = new Map();
    const batchSize = 30; // Firestore 'in' 쿼리는 최대 30개 지원
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batchIds = studentIds.slice(i, i + batchSize);
      const q = query(
        collection(db, 'users'),
        where(documentId(), 'in', batchIds)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        userDataMap.set(docSnap.id, docSnap.data());
      });
    }

    // 🚀 최적화 2: 모든 글을 단 1번의 쿼리로 가져오기 (20개 쿼리 → 1개 쿼리)
    // 🔧 studentIds를 전달하여 폴백 조회 지원
    // 🔧 forceRefresh 옵션 전달 (캐시 무시)
    const allWritings = await getClassWritingsBatch(classCode, startDate, studentIds, options.forceRefresh);

    // 학생별로 글 그룹화
    const writingsByStudent = new Map();
    allWritings.forEach(writing => {
      if (!writingsByStudent.has(writing.studentId)) {
        writingsByStudent.set(writing.studentId, []);
      }
      writingsByStudent.get(writing.studentId).push(writing);
    });

    // 🚀 최적화: userDataMap에서 이미 가져온 닉네임 사용 (getCachedUserNickname 호출 제거)
    // 25명 * 개별 getDoc 호출 = 25번 읽기 → 0번으로 감소
    const rankingResults = studentIds.map((studentId) => {
      try {
        const userData = userDataMap.get(studentId) || {};
        // 🔧 userDataMap에서 직접 닉네임 추출 (추가 DB 호출 없음!)
        const nickname = userData.nickname || userData.name || '익명';
        const periodWritings = writingsByStudent.get(studentId) || [];

        // 통계 계산
        const submissionCount = periodWritings.length;
        const totalScore = periodWritings.reduce((sum, w) => sum + (w.score || 0), 0);
        const averageScore = submissionCount > 0 ? Math.round(totalScore / submissionCount) : 0;
        const passCount = periodWritings.filter(w => w.score >= 80).length;
        const highScore = Math.max(...periodWritings.map(w => w.score || 0), 0);

        // 랭킹 점수 계산 (평균 점수 * 3 + 통과 수 * 15 + 제출 수 * 2)
        // 점수와 통과 편수를 중요하게, 제출 편수는 보너스로
        const rankingScore = averageScore * 3 + passCount * 15 + submissionCount * 2;

        return {
          studentId,
          nickname,
          points: userData.points || 0,
          submissionCount,
          averageScore,
          passCount,
          highScore,
          rankingScore,
          streakDays: userData.streakDays || 0
        };
      } catch (error) {
        console.error(`학생 ${studentId} 랭킹 데이터 조회 에러:`, error);
        return null;
      }
    });

    const validResults = rankingResults.filter(r => r !== null);

    // 랭킹 점수로 정렬
    validResults.sort((a, b) => b.rankingScore - a.rankingScore);

    // 순위 부여
    const result = validResults.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    // 🚀 랭킹 결과 캐시 저장
    rankingCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // 로딩 플래그 제거
    rankingCache.delete(`${cacheKey}_loading`);

    return result;
  } catch (error) {
    console.error('학급 랭킹 조회 에러:', error);
    // 에러 시에도 로딩 플래그 제거
    rankingCache.delete(`${classCode}_${period}_loading`);
    // 🔧 에러 시 빈 배열 반환 (앱 중단 방지)
    return [];
  }
}

// 학생 성장 데이터 조회 (그래프용)
export async function getStudentGrowthData(studentId) {
  try {
    const writings = await getStudentWritings(studentId);
    const submittedWritings = writings
      .filter(w => !w.isDraft && w.submittedAt)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

    // 일별 데이터 그룹화
    const dailyData = {};
    submittedWritings.forEach(w => {
      const date = w.submittedAt.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          submissions: 0,
          totalScore: 0,
          scores: []
        };
      }
      dailyData[date].submissions += 1;
      dailyData[date].totalScore += w.score || 0;
      dailyData[date].scores.push(w.score || 0);
    });

    // 배열로 변환하고 평균 점수 계산
    const growthData = Object.values(dailyData).map(day => ({
      date: day.date,
      displayDate: new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      submissions: day.submissions,
      averageScore: Math.round(day.totalScore / day.submissions),
      highScore: Math.max(...day.scores)
    }));

    // 최근 30일 데이터만 반환
    return growthData.slice(-30);
  } catch (error) {
    console.error('학생 성장 데이터 조회 에러:', error);
    throw error;
  }
}
