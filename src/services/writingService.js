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
  documentId,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { analyzeWriting, detectPlagiarism } from '../utils/geminiAPI'; // 🚀 detectAIUsage 제거 (analyzeWriting에 통합)
import { PASSING_SCORE, PLAGIARISM_THRESHOLD, WORD_COUNT_STANDARDS } from '../config/auth';
import { updateAssignmentSubmission } from './assignmentService';

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
  classWritings: new Map(),   // 🚀 classCode -> { data, timestamp } - 선생님용 제출글 캐시
  writingDetail: new Map(),   // 🚀 writingId -> { data, timestamp } - 제출기록 상세 캐시
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
  studentWritings: 7200000,  // 🔥 2시간 - 본인 글 (제출 시에만 무효화되므로 길어도 안전)
  classData: 7200000,        // 🔥 2시간 - 반 정보 (거의 변경 안됨)
  userNicknames: 14400000,   // 🔥 4시간 - 닉네임 (거의 변경 안됨)
  studentStats: 7200000,     // 🔥 2시간 - 학생 통계 (제출 시에만 무효화)
  classRanking: 7200000,     // 🔥 2시간 - 랭킹 (제출 시 증분 업데이트되므로 안전)
  classWritings: 600000,     // 🔥 10분 - 선생님용 제출글 (새 제출물 확인 필요)
  writingDetail: 14400000,   // 🔥 4시간 - 제출기록 상세 (글 내용은 불변)
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
  try {
    localStorage.removeItem(LS_PREFIX + `writings_${studentId}`);
  } catch (e) {}
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

// 🚀 1시간 지난 미달성 글 자동 삭제 (대시보드 로드 시 호출)
export async function cleanupOldFailedWritings(studentId, writings, passingScore = 70) {
  try {
    if (!studentId || !writings || writings.length === 0) {
      return { deleted: 0 };
    }

    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1시간 전

    // 1시간 지난 미달성 글 필터링
    const oldFailedWritings = writings.filter(w =>
      !w.isDraft &&
      w.submittedAt &&
      new Date(w.submittedAt) < oneHourAgo &&
      (w.score < (w.minScore !== undefined ? w.minScore : passingScore))
    );

    if (oldFailedWritings.length === 0) {
      return { deleted: 0 };
    }

    // 병렬 삭제
    await Promise.all(
      oldFailedWritings.map(w => deleteDoc(doc(db, 'writings', w.writingId)))
    );

    console.log(`[자동 정리] 1시간 지난 미달성 글 ${oldFailedWritings.length}개 삭제됨`);

    // 캐시 무효화
    invalidateStudentWritingsCache(studentId);

    return { deleted: oldFailedWritings.length };
  } catch (error) {
    console.error('1시간 미달성 글 삭제 에러:', error);
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

    // 🔥 1. 메모리 캐시 확인 (forceRefresh가 아니고 캐시가 유효하면 캐시 사용)
    if (!forceRefresh) {
      const cached = cache.studentWritings.get(studentId);
      if (cached && isCacheValid(cached.timestamp, CACHE_TTL.studentWritings)) {
        console.log(`[📊 DB읽기] getStudentWritings 메모리 캐시 히트 - ${cached.data.length}개 글`);
        return cached.data;
      }

      // 🔥 2. LocalStorage 캐시 확인 (페이지 새로고침 후에도 유지)
      const lsData = loadFromLocalStorage(`writings_${studentId}`, CACHE_TTL.studentWritings);
      if (lsData) {
        console.log(`[📊 DB읽기] getStudentWritings LocalStorage 캐시 히트 - ${lsData.length}개 글`);
        cache.studentWritings.set(studentId, { data: lsData, timestamp: Date.now() });
        return lsData;
      }
    }

    // 🔥 3. DB에서 조회 (캐시 미스 시에만)
    console.log(`[📊 DB읽기] getStudentWritings DB 조회 - studentId: ${studentId}`);
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
    console.log(`[📊 DB읽기] getStudentWritings 결과 - ${writings.length}개 글 로드됨`);

    // 메모리 + LocalStorage 이중 캐시 저장
    cache.studentWritings.set(studentId, {
      data: writings,
      timestamp: Date.now()
    });
    saveToLocalStorage(`writings_${studentId}`, writings);

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
// 🧪 testScoreMode: null(일반), 'pass'(도달점수), 'fail'(미달점수), 'custom'(직접입력) - 테스트 학생용
// 🧪 customTestScore: 직접 입력 점수 (testScoreMode === 'custom' 일 때 사용)
// 🚀 aiHelpHistory: AI 도움 기록 (표절 검사용)
export async function submitWriting(studentId, writingData, isRewrite = false, classCode = null, userData = null, testScoreMode = null, customTestScore = null, aiHelpHistory = []) {
  try {
    // 글자 수 기준 가져오기 (gradeLevel 형식 변환 포함)
    let normalizedGrade = writingData.gradeLevel;
    if (normalizedGrade) {
      // elementary_1_2, elementary_3_4, elementary_5_6, middle, high 형식 처리
      if (normalizedGrade === 'elementary_1_2') normalizedGrade = 'elementary-2';
      else if (normalizedGrade === 'elementary_3_4') normalizedGrade = 'elementary-4';
      else if (normalizedGrade === 'elementary_5_6') normalizedGrade = 'elementary-6';
      else if (normalizedGrade === 'middle') normalizedGrade = 'middle-2';
      else if (normalizedGrade === 'high') normalizedGrade = 'high-2';
    }
    const standard = WORD_COUNT_STANDARDS[normalizedGrade] || WORD_COUNT_STANDARDS['elementary-4'] || { min: 200, ideal: 350, max: 500 };
    const wordCount = writingData.wordCount;

    // 🚀 자기 표절 검사 완전 제거 - AI 표절 검사만 사용
    // (이전 글 조회 제거 = DB 읽기 76회 절약!)

    // 🚀 AI 도움 복사 표절 검사 (클라이언트에서 받은 AI 도움 기록과 비교)
    if (aiHelpHistory && aiHelpHistory.length > 0) {
      const submittedText = writingData.content.replace(/\s/g, '').toLowerCase();
      for (const aiText of aiHelpHistory) {
        if (!aiText || typeof aiText !== 'string') continue;
        const cleanAiText = aiText.replace(/\s/g, '').toLowerCase();
        if (cleanAiText.length < 10) continue; // 너무 짧은 텍스트는 무시

        // 제출된 글에 AI 도움 텍스트가 50% 이상 포함되어 있으면 표절
        if (submittedText.includes(cleanAiText) || cleanAiText.length > 20 && submittedText.includes(cleanAiText.substring(0, 20))) {
          const similarity = cleanAiText.length / submittedText.length;
          if (similarity > 0.3) { // AI 텍스트가 제출글의 30% 이상 차지하면
            throw new Error('AI 도움을 그대로 복사하면 안 됩니다. 참고만 하고 자신의 표현으로 다시 써주세요!');
          }
        }
      }
    }

    // 🚀 고쳐쓰기 시 이전 점수 전달 (AI가 개선 여부 판단)
    const previousScore = isRewrite ? (writingData.previousScore || null) : null;

    // AI 분석 (글자 수 포함 + 고쳐쓰기 정보)
    const analysisResult = await analyzeWriting(
      writingData.content,
      writingData.gradeLevel,
      writingData.topic,
      wordCount,
      standard.ideal,
      isRewrite,
      previousScore
    );

    // 5. 제출 (기준 점수 체크 제거 - 모든 점수 허용)
    const now = new Date().toISOString();
    const writingId = writingData.writingId || `${studentId}_${Date.now()}`;

    // 🚀 classCode 파라미터가 없으면 userData에서 가져오기
    let finalClassCode = classCode;
    if (!finalClassCode && userData) {
      finalClassCode = userData.classCode;
    }

    const minScore = writingData.minScore || PASSING_SCORE;

    // 🧪 테스트 모드: 점수 강제 설정
    let newScore = analysisResult.score;
    if (testScoreMode === 'pass') {
      // 도달 점수: 기준점수 + 5 ~ 기준점수 + 20 사이 랜덤
      newScore = minScore + Math.floor(Math.random() * 16) + 5;
      if (newScore > 100) newScore = 100;
      console.log(`[🧪 테스트] 도달 점수 모드: ${analysisResult.score} → ${newScore} (기준: ${minScore})`);
    } else if (testScoreMode === 'fail') {
      // 미달 점수: 기준점수 - 20 ~ 기준점수 - 1 사이 랜덤
      newScore = minScore - Math.floor(Math.random() * 20) - 1;
      if (newScore < 30) newScore = 30;
      console.log(`[🧪 테스트] 미달 점수 모드: ${analysisResult.score} → ${newScore} (기준: ${minScore})`);
    } else if (testScoreMode === 'custom' && customTestScore !== null) {
      // 직접 입력 점수: 0~100 사이로 제한
      newScore = Math.min(100, Math.max(0, customTestScore));
      console.log(`[🧪 테스트] 직접 입력 모드: ${analysisResult.score} → ${newScore} (기준: ${minScore})`);
    }

    // 🚀 동일 주제 미제출글 비교 로직 (DB 사용량 최소화)
    // - 새 점수가 목표점수 미달인 경우만 비교
    // - 기존 미제출글보다 점수가 낮으면 저장 안함
    // - 기존 미제출글보다 점수가 높으면 기존 글 삭제 후 새 글 저장
    let shouldSave = true;
    let deletedOldWritingId = null;

    if (newScore < minScore) {
      // 미제출글인 경우: 동일 주제 기존 미제출글 확인
      const existingWritings = userData?.writingSummary || [];
      const sameTopic = existingWritings.find(w =>
        w.topic === writingData.topic &&
        w.score < (w.minScore || PASSING_SCORE) // 기존 미제출글만
      );

      if (sameTopic) {
        if (newScore <= sameTopic.score) {
          // 기존 미제출글보다 점수가 같거나 낮음 → 저장 안함
          console.log(`[중복 방지] 기존 미제출글(${sameTopic.score}점)보다 낮거나 같음(${newScore}점) - 저장 안함`);
          shouldSave = false;
        } else {
          // 기존 미제출글보다 점수가 높음 → 기존 글 삭제
          console.log(`[중복 방지] 기존 미제출글(${sameTopic.score}점)보다 높음(${newScore}점) - 기존 글 삭제`);
          try {
            await deleteDoc(doc(db, 'writings', sameTopic.writingId));
            deletedOldWritingId = sameTopic.writingId;
          } catch (e) {
            console.warn('기존 미제출글 삭제 실패:', e);
          }
        }
      }
    }

    // 저장하지 않는 경우 (기존 미제출글보다 점수가 낮음)
    if (!shouldSave) {
      return {
        ...writingData,
        score: newScore,
        analysis: analysisResult,
        aiUsageCheck: analysisResult.aiUsageCheck || {
          aiProbability: 15,
          verdict: 'LOW',
          explanation: '직접 작성한 글로 판단됩니다.'
        },
        notSaved: true,
        reason: '동일 주제의 기존 글보다 점수가 낮아 저장되지 않았습니다.'
      };
    }

    const submissionData = {
      ...writingData,
      writingId,
      studentId,
      classCode: finalClassCode, // 🚀 랭킹 배치 조회를 위한 classCode 추가
      nickname: userData?.nickname || userData?.name || writingData.studentName, // 🚀 선생님이 누가 썼는지 확인용
      isDraft: false,
      isRewrite, // 고쳐쓰기 여부 저장
      createdAt: writingData.createdAt || now,
      submittedAt: now,
      analysis: analysisResult,
      plagiarismCheck: null, // 🚀 자기 표절 검사 제거
      aiUsageCheck: analysisResult.aiUsageCheck || {
        aiProbability: 15,
        verdict: 'LOW',
        explanation: '직접 작성한 글로 판단됩니다.'
      }, // 🚀 통합 분석 결과 사용 (undefined 방지)
      score: newScore,
      minScore: minScore // 🚀 과제 기준점수 명시적 저장 (선생님 설정값 유지)
    };

    await setDoc(doc(db, 'writings', writingId), submissionData);

    // 6. 학생 통계 업데이트 + 캐시 무효화
    // 🔧 newScore 사용 (테스트 모드에서 점수가 변경될 수 있음)
    await updateStudentStats(studentId, newScore);
    invalidateStudentStatsCache(studentId);

    // 7. 포인트 지급 (고쳐쓰기 여부, AI 가능성, userData 전달)
    const aiProbability = analysisResult.aiUsageCheck?.aiProbability || 0;
    // 🔧 newScore 사용 (테스트 모드에서 점수가 변경될 수 있음)
    const earnedPoints = await awardPoints(studentId, newScore, isRewrite, aiProbability, userData);
    submissionData.earnedPoints = earnedPoints; // 지급된 포인트 정보 추가

    // 🚀 미달성 글 삭제는 서버에서 24시간마다 자동 처리 (Cloud Function)
    // 클라이언트에서 이전 글 조회 제거 = DB 읽기 절약!

    // 🚀 캐시 무효화 - 글 제출 후 해당 학생의 글 캐시 갱신
    invalidateStudentWritingsCache(studentId);

    // 🚀 랭킹 캐시 무효화 (classCode 파라미터 활용)
    if (classCode) {
      invalidateRankingCache(classCode);
      // 🚀 선생님용 제출글 캐시도 무효화 (새 글 반영)
      invalidateClassWritingsCache(classCode);

      // 🚀 assignments.submissions에 제출자 정보 추가 (선생님 주제 클릭 시 DB 읽기 0회!)
      // 🔧 newScore 사용 (테스트 모드에서 점수가 변경될 수 있음)
      await updateAssignmentSubmission(classCode, writingData.topic, {
        studentId,
        nickname: userData?.nickname || userData?.name || '익명',
        score: newScore,
        writingId,
        submittedAt: submissionData.submittedAt
      });

      // 🚀 랭킹 증분 업데이트 (글 제출 시 바로 반영, 랭킹 조회 시 570회 읽기 방지!)
      // 🔧 newScore 사용 (테스트 모드에서 점수가 변경될 수 있음)
      await updateStudentRankingOnSubmit(classCode, studentId, newScore, userData);
    }

    // 🚀 users 문서의 writingSummary 업데이트 (로그인 시 DB 읽기 0회!)
    // 기존 미제출글 삭제한 경우, 해당 글도 writingSummary에서 제거
    if (deletedOldWritingId) {
      await updateWritingSummary(studentId, { writingId: deletedOldWritingId }, 'delete');
    }
    await updateWritingSummary(studentId, submissionData, 'add');

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
    console.log(`[📊 DB읽기] getAllClassWritingsBatch 호출 - classCode: ${classCode}, forTeacher: ${forTeacher}`);
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
    console.log(`[📊 DB읽기] getAllClassWritingsBatch 결과 - ${writings.length}개 글 로드됨`);

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

// 🚀 선생님용 제출글 캐시 무효화
export function invalidateClassWritingsCache(classCode) {
  if (classCode) {
    cache.classWritings.delete(classCode);
    // 주제별 캐시도 무효화
    for (const key of cache.classWritings.keys()) {
      if (key.startsWith(`${classCode}_topic_`)) {
        cache.classWritings.delete(key);
      }
    }
  } else {
    cache.classWritings.clear();
  }
}

// 🚀 주제별 제출 현황만 가져오기 (글 내용 없이 주제+학생수+평균점수만)
// Firestore 읽기: 1번 (주제별 aggregate 또는 전체 글 메타데이터만)
export async function getClassWritingsSummary(classCode, forceRefresh = false) {
  try {
    if (!classCode || typeof classCode !== 'string') {
      return { topics: [], totalCount: 0 };
    }

    // 캐시 확인
    const cacheKey = `${classCode}_summary`;
    const cached = cache.classWritings.get(cacheKey);
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_TTL.classWritings)) {
      console.log(`[캐시 히트] 주제 요약 (캐시에서 로드)`);
      return cached.data;
    }

    // 🚀 writings 컬렉션에서 메타데이터만 조회 (topic, score, studentId, nickname만 필요)
    const q = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode),
      where('isDraft', '==', false)
    );

    const snapshot = await getDocs(q);

    // 주제별로 그룹화 (글 내용은 저장하지 않음!)
    const topicMap = new Map();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const topic = data.topic || '기타';

      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          topic,
          count: 0,
          totalScore: 0,
          students: [] // studentId만 저장
        });
      }

      const topicData = topicMap.get(topic);
      topicData.count++;
      topicData.totalScore += (data.score || 0);
      topicData.students.push({
        studentId: data.studentId,
        nickname: data.nickname || data.studentNickname || '익명',
        score: data.score || 0,
        writingId: data.writingId,
        submittedAt: data.submittedAt
      });
    });

    // 결과 정리
    const topics = Array.from(topicMap.values()).map(t => ({
      topic: t.topic,
      count: t.count,
      avgScore: t.count > 0 ? Math.round(t.totalScore / t.count) : 0,
      students: t.students.sort((a, b) => b.score - a.score) // 점수 높은 순
    }));

    const result = {
      topics: topics.sort((a, b) => b.count - a.count), // 제출 많은 순
      totalCount: snapshot.size
    };

    // 캐시 저장
    cache.classWritings.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    console.log(`[캐시 저장] 주제 요약 ${topics.length}개 주제, ${snapshot.size}개 글`);

    return result;
  } catch (error) {
    console.error('주제 요약 조회 에러:', error);
    return { topics: [], totalCount: 0 };
  }
}

// 🚀 getTopicStudents 함수 제거됨!
// 이제 assignment.submissions에서 학생 목록을 직접 가져옴 (DB 읽기 0회)
// assignmentService.js의 updateAssignmentSubmission 참조

// forTeacher: true면 classCode가 없는 기존 글도 studentId로 폴백 조회
export async function getClassWritings(classCode, forceRefresh = false, forTeacher = true) {
  try {
    // classCode 유효성 검사
    if (!classCode || typeof classCode !== 'string') {
      console.error('유효하지 않은 classCode:', classCode);
      return [];
    }

    // 🚀 제출글 캐시 확인 (선생님이 탭 전환할 때마다 500회 읽기 방지!)
    const cachedWritings = cache.classWritings.get(classCode);
    if (!forceRefresh && cachedWritings && isCacheValid(cachedWritings.timestamp, CACHE_TTL.classWritings)) {
      console.log(`[캐시 히트] 제출글 ${cachedWritings.data.length}개 (캐시에서 로드)`);
      return cachedWritings.data;
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

    const sortedWritings = allWritingsWithNicknames.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    // 🚀 캐시 저장 (5분간 유지 - 탭 전환 시 재조회 방지)
    cache.classWritings.set(classCode, {
      data: sortedWritings,
      timestamp: Date.now()
    });
    console.log(`[캐시 저장] 제출글 ${sortedWritings.length}개 (Firestore에서 로드)`);

    return sortedWritings;
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

    // 🔧 항상 Firestore에서 최신 포인트 조회 (stale userData 방지)
    // userData가 전달되어도 포인트는 DB에서 최신값 사용
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return 0;
    const freshUserData = userDoc.data();

    const currentPoints = freshUserData.points || 0;

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
    const lastSubmitDate = freshUserData.lastSubmitDate;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streakDays = freshUserData.streakDays || 0;
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
    const currentTotalPoints = freshUserData.totalPoints || currentPoints; // 누적 포인트 (없으면 현재 포인트로 초기화)
    const newTotalPoints = currentTotalPoints + earnedPoints; // 누적 포인트는 항상 증가

    await updateDoc(userRef, {
      points: newPoints,
      totalPoints: newTotalPoints, // 누적 포인트 저장 (레벨 계산용)
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

// ============================================
// 🚀 랭킹 최적화: classes 문서에 미리 계산된 랭킹 저장
// 글 제출 시 업데이트 → 조회 시 DB 읽기 1회!
// ============================================

// 랭킹 계산을 위한 기간 시작일 계산
function getRankingPeriodStart(period) {
  const now = new Date();
  if (period === 'weekly') {
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - diff);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  } else {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

// 현재 주/월 키 생성 (예: "2025-W48", "2025-11")
function getRankingPeriodKey(period) {
  const now = new Date();
  if (period === 'weekly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  } else {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}

// 🚀 학급 랭킹 조회 - 미리 계산된 데이터 사용 (DB 읽기 1회!)
export async function getClassRanking(classCode, period = 'weekly', options = {}) {
  try {
    console.log(`[📊 DB읽기] getClassRanking 호출 - classCode: ${classCode}, period: ${period}`);

    // 🚀 랭킹 결과 캐시 체크 (최우선)
    const cacheKey = `${classCode}_${period}`;
    if (!options.forceRefresh) {
      const cached = rankingCache.get(cacheKey);
      if (cached && isCacheValid(cached.timestamp, CACHE_TTL.classRanking)) {
        console.log(`[📊 DB읽기] getClassRanking 캐시 히트`);
        return cached.data;
      }
    }

    // 🚀 스파이크 방지: 동시 다중 요청 시 첫 요청만 처리
    if (!options.forceRefresh && rankingCache.has(`${cacheKey}_loading`)) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const recheck = rankingCache.get(cacheKey);
      if (recheck && isCacheValid(recheck.timestamp, CACHE_TTL.classRanking)) {
        return recheck.data;
      }
    }

    rankingCache.set(`${cacheKey}_loading`, true);

    // 🚀 classes 문서에서 미리 계산된 랭킹 데이터 가져오기 (1회 읽기!)
    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (!classDoc.exists()) {
      rankingCache.delete(`${cacheKey}_loading`);
      return [];
    }

    const classData = classDoc.data();
    cache.classData.set(classCode, { data: classData, timestamp: Date.now() });

    const students = classData.students || [];
    if (students.length === 0) {
      rankingCache.delete(`${cacheKey}_loading`);
      return [];
    }

    // 🚀 미리 계산된 랭킹 데이터 확인
    const periodKey = getRankingPeriodKey(period);
    const rankingField = period === 'weekly' ? 'weeklyRanking' : 'monthlyRanking';
    const savedRanking = classData[rankingField];

    // 저장된 랭킹이 현재 기간과 일치하면 바로 반환 (DB 읽기 추가 0회!)
    // 🚀 미리 계산된 랭킹이 현재 기간과 일치하면 사용
    if (savedRanking && savedRanking.periodKey === periodKey && savedRanking.data) {
      console.log(`[📊 DB읽기] getClassRanking - 미리 계산된 랭킹 사용 (periodKey: ${periodKey})`);
      const result = savedRanking.data;
      rankingCache.set(cacheKey, { data: result, timestamp: Date.now() });
      rankingCache.delete(`${cacheKey}_loading`);
      return result;
    }

    // 🚀 새 기간이면 빈 배열 반환 (재계산 없음! = 읽기 0회)
    // 글 제출 시 updateStudentRankingOnSubmit에서 증분 업데이트됨
    console.log(`[📊 DB읽기] getClassRanking - 새 기간, 빈 랭킹 반환 (${periodKey})`);
    rankingCache.set(cacheKey, { data: [], timestamp: Date.now() });
    rankingCache.delete(`${cacheKey}_loading`);

    return [];
  } catch (error) {
    console.error('학급 랭킹 조회 에러:', error);
    rankingCache.delete(`${classCode}_${period}_loading`);
    return [];
  }
}

// 🚀 랭킹 재계산 및 저장 (마이그레이션 또는 새 기간 시작 시)
async function recalculateClassRanking(classCode, period, classData = null) {
  try {
    // classData가 없으면 조회
    if (!classData) {
      const classDoc = await getDoc(doc(db, 'classes', classCode));
      if (!classDoc.exists()) return [];
      classData = classDoc.data();
    }

    const students = classData.students || [];
    if (students.length === 0) return [];

    const startDate = getRankingPeriodStart(period);
    const studentIds = students.map(s => s.studentId);

    // 사용자 데이터 배치 조회
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

    // 글 데이터 조회
    console.log(`[📊 DB읽기] recalculateClassRanking - 글 조회 시작`);
    const writingsQuery = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode),
      where('isDraft', '==', false),
      where('submittedAt', '>=', startDate.toISOString())
    );
    const writingsSnapshot = await getDocs(writingsQuery);

    const writingsByStudent = new Map();
    writingsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!writingsByStudent.has(data.studentId)) {
        writingsByStudent.set(data.studentId, []);
      }
      writingsByStudent.get(data.studentId).push(data);
    });
    console.log(`[📊 DB읽기] recalculateClassRanking - ${writingsSnapshot.size}개 글 로드됨`);

    // 랭킹 계산
    const rankingResults = studentIds.map((studentId) => {
      const userData = userDataMap.get(studentId) || {};
      const nickname = userData.nickname || userData.name || '익명';
      const periodWritings = writingsByStudent.get(studentId) || [];

      const submissionCount = periodWritings.length;
      const totalScore = periodWritings.reduce((sum, w) => sum + (w.score || 0), 0);
      const averageScore = submissionCount > 0 ? Math.round(totalScore / submissionCount) : 0;
      const passCount = periodWritings.filter(w => w.score >= 70).length;  // 🚀 통과 기준 70점
      const highScore = Math.max(...periodWritings.map(w => w.score || 0), 0);
      // 🚀 랭킹 점수: 평균 점수 × 3 + 통과 횟수 × 20 (제출 수 제외!)
      const rankingScore = averageScore * 3 + passCount * 20;

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
    });

    // 정렬 및 순위 부여
    rankingResults.sort((a, b) => b.rankingScore - a.rankingScore);
    const result = rankingResults.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    // 🚀 classes 문서에 랭킹 저장
    const periodKey = getRankingPeriodKey(period);
    const rankingField = period === 'weekly' ? 'weeklyRanking' : 'monthlyRanking';

    await updateDoc(doc(db, 'classes', classCode), {
      [rankingField]: {
        periodKey,
        data: result,
        updatedAt: new Date().toISOString()
      }
    });
    console.log(`[📊 DB쓰기] ${rankingField} 저장 완료 - ${result.length}명`);

    // 캐시 무효화
    invalidateClassDataCache(classCode);

    return result;
  } catch (error) {
    console.error('랭킹 재계산 에러:', error);
    return [];
  }
}

// 🚀 글 제출 시 랭킹 업데이트 (증분 업데이트)
// 🚀 최적화: 주간/월간 한 번에 업데이트 (쓰기 2회 → 1회)
export async function updateStudentRankingOnSubmit(classCode, studentId, score, userData) {
  try {
    if (!classCode) return;

    const classDoc = await getDoc(doc(db, 'classes', classCode));
    if (!classDoc.exists()) return;

    const classData = classDoc.data();
    const nickname = userData?.nickname || userData?.name || '익명';
    const updatedAt = new Date().toISOString();

    // 🚀 주간/월간 랭킹을 미리 계산
    const updateData = {};

    for (const period of ['weekly', 'monthly']) {
      const periodKey = getRankingPeriodKey(period);
      const rankingField = period === 'weekly' ? 'weeklyRanking' : 'monthlyRanking';
      const savedRanking = classData[rankingField];

      // 🚀 새 기간이면 빈 랭킹으로 시작 (재계산 없음! = 읽기 0회)
      let rankingData = [];
      if (savedRanking && savedRanking.periodKey === periodKey) {
        rankingData = [...(savedRanking.data || [])]; // 복사본 사용
      } else {
        console.log(`[랭킹] 새 기간 시작 (${periodKey}) - 빈 랭킹으로 초기화`);
      }

      // 기존 랭킹에서 해당 학생 찾기
      const studentIndex = rankingData.findIndex(r => r.studentId === studentId);

      if (studentIndex >= 0) {
        // 기존 학생 업데이트
        const student = { ...rankingData[studentIndex] }; // 복사본 사용
        student.submissionCount += 1;
        const newTotalScore = student.averageScore * (student.submissionCount - 1) + score;
        student.averageScore = Math.round(newTotalScore / student.submissionCount);
        if (score >= 70) student.passCount += 1;  // 🚀 통과 기준 70점으로 변경
        if (score > student.highScore) student.highScore = score;
        // 🚀 랭킹 점수: 평균 점수 × 3 + 통과 횟수 × 20 (제출 수 제외!)
        student.rankingScore = student.averageScore * 3 + student.passCount * 20;
        student.points = userData?.points || student.points;
        student.nickname = nickname;
        rankingData[studentIndex] = student;
      } else {
        // 새 학생 추가
        const isPassed = score >= 70;  // 🚀 통과 기준 70점
        rankingData.push({
          studentId,
          nickname,
          points: userData?.points || 0,
          submissionCount: 1,
          averageScore: score,
          passCount: isPassed ? 1 : 0,
          highScore: score,
          // 🚀 랭킹 점수: 평균 점수 × 3 + 통과 횟수 × 20 (제출 수 제외!)
          rankingScore: score * 3 + (isPassed ? 20 : 0),
          streakDays: userData?.streakDays || 0
        });
      }

      // 재정렬 및 순위 부여
      rankingData.sort((a, b) => b.rankingScore - a.rankingScore);
      rankingData = rankingData.map((student, index) => ({
        ...student,
        rank: index + 1
      }));

      // 업데이트 데이터에 추가
      updateData[rankingField] = {
        periodKey,
        data: rankingData,
        updatedAt
      };
    }

    // 🚀 한 번의 updateDoc으로 주간/월간 동시 저장 (쓰기 2회 → 1회!)
    await updateDoc(doc(db, 'classes', classCode), updateData);

    // 캐시 무효화
    invalidateRankingCache(classCode);
    invalidateClassDataCache(classCode);

    console.log(`[📊 랭킹] ${studentId} 랭킹 업데이트 완료 (쓰기 1회)`);
  } catch (error) {
    console.error('랭킹 업데이트 에러:', error);
    // 에러 시에도 앱은 계속 동작
  }
}

// classData 캐시 무효화
function invalidateClassDataCache(classCode) {
  cache.classData.delete(classCode);
}

// 🚀 학생용 랭킹 조회 - 내 랭킹 + 1,2,3등만 (DB 읽기 최소화)
// 전체 랭킹을 로드하는 대신 캐시된 데이터에서 필요한 것만 추출
export async function getStudentRankingOptimized(classCode, studentId, period = 'weekly', options = {}) {
  try {
    // 기존 getClassRanking 호출 (캐시 활용)
    const fullRanking = await getClassRanking(classCode, period, options);

    if (!fullRanking || fullRanking.length === 0) {
      return { top3: [], myRank: null };
    }

    // 1, 2, 3등 추출
    const top3 = fullRanking.slice(0, 3);

    // 내 순위 찾기
    const myRankIndex = fullRanking.findIndex(r => r.studentId === studentId);
    const myRank = myRankIndex !== -1 ? fullRanking[myRankIndex] : null;

    return { top3, myRank };
  } catch (error) {
    console.error('학생 랭킹 조회 에러:', error);
    return { top3: [], myRank: null };
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

// ============================================
// 🚀 학생 글 요약 시스템 - users 문서에 저장 (DB 읽기 0회!)
// 로그인 시 writings 컬렉션 쿼리 완전 제거
// ============================================

// 🚀 users 문서에서 글 요약 가져오기 (DB 읽기 0회 - users 이미 로드됨)
export function getWritingSummaryFromUserData(userData) {
  if (!userData || !userData.writingSummary) {
    return [];
  }
  // submittedAt 기준 내림차순 정렬
  return [...userData.writingSummary].sort((a, b) =>
    new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt)
  );
}

// 🚀 글 제출 시 users 문서의 writingSummary 업데이트
// 🔧 트랜잭션 사용으로 race condition 방지 (awardPoints와 동시 업데이트 시 데이터 손실 방지)
export async function updateWritingSummary(studentId, writingData, action = 'add') {
  try {
    const userRef = doc(db, 'users', studentId);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        console.error('[writingSummary] users 문서가 존재하지 않음:', studentId);
        throw new Error('users 문서가 존재하지 않음');
      }

      const userData = userDoc.data();
      let summary = userData.writingSummary || [];

      console.log(`[writingSummary] 현재 저장된 글 수: ${summary.length}`);

      if (action === 'add' || action === 'update') {
        // 기존 같은 writingId 제거
        summary = summary.filter(s => s.writingId !== writingData.writingId);

        // 🚀 새 요약 추가 - undefined 값 제거 (Firestore 에러 방지)
        const newEntry = {
          writingId: writingData.writingId || '',
          topic: writingData.topic || '',
          score: writingData.score || 0,
          wordCount: writingData.wordCount || 0,
          isDraft: writingData.isDraft || false
        };
        // undefined가 아닌 값만 추가
        if (writingData.submittedAt) newEntry.submittedAt = writingData.submittedAt;
        if (writingData.createdAt) newEntry.createdAt = writingData.createdAt;
        if (writingData.minScore !== undefined && writingData.minScore !== null) {
          newEntry.minScore = writingData.minScore;
        }

        summary.push(newEntry);
        console.log(`[writingSummary] 새 글 추가:`, newEntry);
      } else if (action === 'delete') {
        summary = summary.filter(s => s.writingId !== writingData.writingId);
      }

      // 🚀 summary 배열에서 undefined 값 제거 (안전장치)
      const cleanSummary = summary.map(item => {
        const clean = {};
        Object.keys(item).forEach(key => {
          if (item[key] !== undefined && item[key] !== null) {
            clean[key] = item[key];
          }
        });
        return clean;
      });

      transaction.update(userRef, { writingSummary: cleanSummary });
      console.log(`[writingSummary] ✅ 트랜잭션 저장 완료! 총 ${cleanSummary.length}개 - ${action}: ${writingData.topic}`);
    });

    return true;
  } catch (error) {
    console.error('[writingSummary] ❌ 업데이트 에러:', error);
    return false;
  }
}

// 🚀 개별 글 조회 (제출기록에서 클릭 시) - 캐싱 적용
export async function getWritingDetail(writingId) {
  try {
    // 🚀 캐시 확인
    const cached = cache.writingDetail.get(writingId);
    if (cached && isCacheValid(cached.timestamp, CACHE_TTL.writingDetail)) {
      console.log(`[📊 캐시] getWritingDetail 캐시 히트 - writingId: ${writingId}`);
      return cached.data;
    }

    console.log(`[📊 DB읽기] getWritingDetail - writingId: ${writingId}`);
    const writingDoc = await getDoc(doc(db, 'writings', writingId));
    if (writingDoc.exists()) {
      const data = writingDoc.data();
      // 🚀 캐시 저장
      cache.writingDetail.set(writingId, { data, timestamp: Date.now() });
      return data;
    }
    return null;
  } catch (error) {
    console.error('글 상세 조회 에러:', error);
    return null;
  }
}

// 🚀 기존 writings에서 writingSummary 마이그레이션 (달성글만!)
// 주의: 이 함수는 writingSummary가 없을 때만 호출되어야 함
export async function migrateWritingSummary(studentId) {
  try {
    // 🚀 먼저 현재 users 문서의 writingSummary 확인 (덮어쓰기 방지!)
    const userDoc = await getDoc(doc(db, 'users', studentId));
    if (!userDoc.exists()) {
      console.error('[마이그레이션] users 문서가 없음');
      return { success: false, error: 'users 문서 없음' };
    }

    const existingData = userDoc.data();
    const existingSummary = existingData.writingSummary || [];

    // 🚀 이미 writingSummary가 있으면 마이그레이션 하지 않음!
    if (existingSummary.length > 0) {
      console.log(`[마이그레이션] 이미 writingSummary 존재 (${existingSummary.length}개) - 스킵`);
      return { success: true, migrated: false, reason: 'already_exists' };
    }

    // 🚀 forceRefresh=true로 캐시 무시하고 최신 데이터 조회
    const writings = await getStudentWritings(studentId, true);
    if (writings.length === 0) return { success: true, migrated: false };

    // 🚀 달성글만 필터링 (미달성글은 요약에서 제외)
    const passedWritings = writings.filter(w => {
      if (w.isDraft) return false; // 임시저장 제외
      const minScore = w.minScore !== undefined ? w.minScore : PASSING_SCORE;
      return w.score >= minScore;
    });

    // 🚀 미달성글 + 임시저장 삭제 (데이터 비용 절약)
    const toDelete = writings.filter(w => {
      if (w.isDraft) return true; // 임시저장 삭제
      const minScore = w.minScore !== undefined ? w.minScore : PASSING_SCORE;
      return w.score < minScore; // 미달성 삭제
    });

    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map(w => deleteDoc(doc(db, 'writings', w.writingId)))
      );
      console.log(`[마이그레이션] 미달성/임시저장 ${toDelete.length}개 삭제`);
    }

    // 🚀 달성글만 요약 저장
    const summary = passedWritings.map(w => {
      const item = {
        writingId: w.writingId || '',
        topic: w.topic || '',
        score: w.score || 0,
        wordCount: w.wordCount || 0,
        isDraft: false
      };
      if (w.submittedAt) item.submittedAt = w.submittedAt;
      if (w.createdAt) item.createdAt = w.createdAt;
      if (w.minScore !== undefined) item.minScore = w.minScore;
      return item;
    });

    await updateDoc(doc(db, 'users', studentId), { writingSummary: summary });
    console.log(`[마이그레이션] writingSummary - 달성글 ${summary.length}개만 저장 (총 ${writings.length}개 중)`);
    return { success: true, migrated: true, count: summary.length };
  } catch (error) {
    console.error('writingSummary 마이그레이션 에러:', error);
    return { success: false, error: error.message };
  }
}

// 🚀 기존 글의 minScore 마이그레이션
// 과제로 제출된 글 중 minScore가 없는 글에 과제의 minScore를 추가
export async function migrateWritingsMinScore(classCode) {
  try {
    console.log(`[minScore 마이그레이션] 시작 - classCode: ${classCode}`);

    // 1. 해당 클래스의 모든 과제 가져오기 (minScore 정보 포함)
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('classCode', '==', classCode)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);

    if (assignmentsSnapshot.empty) {
      console.log('[minScore 마이그레이션] 과제가 없습니다.');
      return { success: true, migratedCount: 0 };
    }

    // 과제별 minScore 맵 생성 (title -> minScore)
    const assignmentMinScores = new Map();
    assignmentsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      assignmentMinScores.set(data.title, data.minScore || 70);
    });
    console.log(`[minScore 마이그레이션] ${assignmentMinScores.size}개 과제 로드`);

    // 2. 해당 클래스의 모든 글 가져오기
    const writingsQuery = query(
      collection(db, 'writings'),
      where('classCode', '==', classCode)
    );
    const writingsSnapshot = await getDocs(writingsQuery);

    // 3. minScore가 없는 글 찾아서 업데이트
    let migratedCount = 0;
    const batch = writeBatch(db);
    let batchCount = 0;

    for (const docSnap of writingsSnapshot.docs) {
      const data = docSnap.data();

      // 이미 minScore가 있으면 스킵
      if (data.minScore !== undefined && data.minScore !== null) {
        continue;
      }

      // 과제 제목으로 minScore 찾기
      const assignmentMinScore = assignmentMinScores.get(data.topic);
      if (assignmentMinScore !== undefined) {
        batch.update(docSnap.ref, { minScore: assignmentMinScore });
        migratedCount++;
        batchCount++;
        console.log(`[minScore 마이그레이션] "${data.topic}" -> minScore: ${assignmentMinScore}`);

        // Firestore batch 제한 (500개)
        if (batchCount >= 450) {
          await batch.commit();
          console.log(`[minScore 마이그레이션] 중간 커밋: ${migratedCount}개`);
          batchCount = 0;
        }
      }
    }

    // 남은 배치 커밋
    if (batchCount > 0) {
      await batch.commit();
    }

    // 4. 해당 클래스 학생들의 writingSummary도 업데이트
    const studentsQuery = query(
      collection(db, 'users'),
      where('classCode', '==', classCode),
      where('role', '==', 'student')
    );
    const studentsSnapshot = await getDocs(studentsQuery);

    let summaryUpdatedCount = 0;
    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
      const summary = studentData.writingSummary || [];

      let updated = false;
      const newSummary = summary.map(w => {
        if (w.minScore === undefined || w.minScore === null) {
          const assignmentMinScore = assignmentMinScores.get(w.topic);
          if (assignmentMinScore !== undefined) {
            updated = true;
            return { ...w, minScore: assignmentMinScore };
          }
        }
        return w;
      });

      if (updated) {
        await updateDoc(doc(db, 'users', studentDoc.id), { writingSummary: newSummary });
        summaryUpdatedCount++;
      }
    }

    console.log(`[minScore 마이그레이션] 완료 - writings: ${migratedCount}개, writingSummary: ${summaryUpdatedCount}명`);
    return { success: true, migratedCount, summaryUpdatedCount };
  } catch (error) {
    console.error('[minScore 마이그레이션] 에러:', error);
    return { success: false, error: error.message };
  }
}
