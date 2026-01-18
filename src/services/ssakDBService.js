/**
 * 싹DB 검색 서비스
 *
 * Firestore에 저장된 싹DB(글쓰기 평가 지식베이스)를 검색하는 서비스
 * - 루브릭 검색
 * - 우수작 예시 검색
 * - 첨삭 패턴 검색
 * - 주제 검색
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================
// 캐싱 시스템 (Firestore 읽기 최소화)
// ============================================

const ssakCache = {
  rubrics: new Map(),      // key: `${eduLevel}_${grade}_${genre}_${domain}`
  examples: new Map(),     // key: `${eduLevel}_${grade}_${genre}_${level}`
  patterns: new Map(),     // key: `${domain}_${patternType}`
  topics: new Map(),       // key: `${eduLevel}_${genre}`
};

const SSAK_CACHE_TTL = 86400000; // 24시간 (싹DB는 거의 변경 안됨)

function getCacheKey(...parts) {
  return parts.filter(Boolean).join('_');
}

function getFromCache(cacheMap, key) {
  const cached = cacheMap.get(key);
  if (cached && (Date.now() - cached.timestamp) < SSAK_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setToCache(cacheMap, key, data) {
  cacheMap.set(key, { data, timestamp: Date.now() });
}

// ============================================
// 학년 → 학령대 매핑
// ============================================

/**
 * 학년을 학령대로 변환
 * @param {number} grade - 학년 (1-12)
 * @returns {{ educationLevel: string, gradeGroup: string }}
 */
export function gradeToEducationLevel(grade) {
  if (grade <= 2) {
    return { educationLevel: '초등학교', gradeGroup: '1-2학년' };
  } else if (grade <= 4) {
    return { educationLevel: '초등학교', gradeGroup: '3-4학년' };
  } else if (grade <= 6) {
    return { educationLevel: '초등학교', gradeGroup: '5-6학년' };
  } else if (grade <= 7) {
    return { educationLevel: '중학교', gradeGroup: '1학년' };
  } else if (grade <= 8) {
    return { educationLevel: '중학교', gradeGroup: '2학년' };
  } else if (grade <= 9) {
    return { educationLevel: '중학교', gradeGroup: '3학년' };
  } else if (grade <= 10) {
    return { educationLevel: '고등학교', gradeGroup: '1학년' };
  } else if (grade <= 11) {
    return { educationLevel: '고등학교', gradeGroup: '2학년' };
  } else {
    return { educationLevel: '고등학교', gradeGroup: '3학년' };
  }
}

/**
 * 글쓰기 유형을 장르로 매핑
 * @param {string} writingType - 글쓰기 유형 (자유글쓰기, 주제글쓰기 등)
 * @param {number} grade - 학년
 * @returns {string} - 싹DB 장르
 */
export function getGenreFromWritingType(writingType, grade) {
  // 학년별 기본 장르 매핑
  const genreMap = {
    '자유글쓰기': grade <= 6 ? '일기' : '수필',
    '주제글쓰기': grade <= 4 ? '생활문' : grade <= 6 ? '설명문' : '논설문',
    '독후감': grade <= 6 ? '독후감' : '독서감상문',
    '일기': '일기',
    '편지': '편지',
    '설명문': '설명문',
    '논설문': '논설문',
    '보고서': '보고서',
  };

  return genreMap[writingType] || (grade <= 6 ? '일기' : '수필');
}

// ============================================
// 루브릭 검색
// ============================================

/**
 * 평가 루브릭 검색
 * @param {number} grade - 학년 (1-12)
 * @param {string} genre - 장르 (일기, 논설문 등)
 * @param {string} domain - 평가 영역 (종합, 내용, 조직, 표현, 표기)
 * @returns {Promise<Object|null>}
 */
export async function getRubric(grade, genre, domain = '종합') {
  const { educationLevel, gradeGroup } = gradeToEducationLevel(grade);
  const cacheKey = getCacheKey(educationLevel, gradeGroup, genre, domain);

  // 캐시 확인
  const cached = getFromCache(ssakCache.rubrics, cacheKey);
  if (cached) return cached;

  try {
    // Firestore 검색
    const rubricsRef = collection(db, 'rubrics');
    const q = query(
      rubricsRef,
      where('education_level', '==', educationLevel),
      where('grade', '==', gradeGroup),
      where('genre', '==', genre),
      where('domain', '==', domain),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // 종합 루브릭 폴백
      if (domain !== '종합') {
        return getRubric(grade, genre, '종합');
      }
      return null;
    }

    const rubric = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    setToCache(ssakCache.rubrics, cacheKey, rubric);
    return rubric;
  } catch (error) {
    console.error('루브릭 검색 오류:', error);
    return null;
  }
}

/**
 * 전체 영역 루브릭 가져오기 (내용, 조직, 표현, 표기)
 */
export async function getAllRubrics(grade, genre) {
  const domains = ['종합', '내용', '조직', '표현', '표기'];
  const results = await Promise.all(
    domains.map(domain => getRubric(grade, genre, domain))
  );

  return {
    total: results[0],
    content: results[1],
    organization: results[2],
    expression: results[3],
    mechanics: results[4]
  };
}

// ============================================
// 우수작 예시 검색
// ============================================

/**
 * 우수작 예시 검색
 * @param {number} grade - 학년
 * @param {string} genre - 장르
 * @param {string} level - 수준 (상/중/하 또는 high/mid/low)
 * @returns {Promise<Object|null>}
 */
export async function getExample(grade, genre, level = 'high') {
  const { educationLevel, gradeGroup } = gradeToEducationLevel(grade);

  // 수준 정규화
  const levelMap = { '상': 'high', '중': 'mid', '하': 'low', 'high': 'high', 'mid': 'mid', 'low': 'low' };
  const normalizedLevel = levelMap[level] || 'high';

  const cacheKey = getCacheKey(educationLevel, gradeGroup, genre, normalizedLevel);

  // 캐시 확인
  const cached = getFromCache(ssakCache.examples, cacheKey);
  if (cached) return cached;

  try {
    const examplesRef = collection(db, 'examples');
    const q = query(
      examplesRef,
      where('education_level', '==', educationLevel),
      where('genre', '==', genre),
      where('level', '==', normalizedLevel),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const example = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    setToCache(ssakCache.examples, cacheKey, example);
    return example;
  } catch (error) {
    console.error('우수작 예시 검색 오류:', error);
    return null;
  }
}

/**
 * 모든 수준의 예시 가져오기
 */
export async function getAllExamples(grade, genre) {
  const levels = ['high', 'mid', 'low'];
  const results = await Promise.all(
    levels.map(level => getExample(grade, genre, level))
  );

  return {
    high: results[0],
    mid: results[1],
    low: results[2]
  };
}

// ============================================
// 첨삭 패턴 검색
// ============================================

/**
 * 첨삭 패턴 검색
 * @param {string} domain - 영역 (내용, 조직, 표현, 표기)
 * @param {string} patternType - 패턴 유형 (주제이탈, 근거부족 등)
 * @returns {Promise<Object|null>}
 */
export async function getFeedbackPattern(domain, patternType = null) {
  const cacheKey = getCacheKey(domain, patternType || 'all');

  // 캐시 확인
  const cached = getFromCache(ssakCache.patterns, cacheKey);
  if (cached) return cached;

  try {
    const patternsRef = collection(db, 'feedbackPatterns');
    let q;

    if (patternType) {
      // 특정 패턴 검색
      q = query(
        patternsRef,
        where('domain', '==', domain),
        limit(10)
      );
    } else {
      // 해당 영역 전체 패턴
      q = query(
        patternsRef,
        where('filePath', '>=', `/03_첨삭패턴/${domain}`),
        where('filePath', '<', `/03_첨삭패턴/${domain}~`),
        limit(20)
      );
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const patterns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setToCache(ssakCache.patterns, cacheKey, patterns);
    return patterns;
  } catch (error) {
    console.error('첨삭 패턴 검색 오류:', error);
    return null;
  }
}

/**
 * 모든 영역의 첨삭 패턴 가져오기
 */
export async function getAllFeedbackPatterns() {
  const domains = ['내용', '조직', '표현', '표기'];
  const results = await Promise.all(
    domains.map(domain => getFeedbackPattern(domain))
  );

  return {
    content: results[0] || [],
    organization: results[1] || [],
    expression: results[2] || [],
    mechanics: results[3] || []
  };
}

// ============================================
// 주제 검색
// ============================================

/**
 * 글쓰기 주제 검색
 * @param {number} grade - 학년
 * @param {string} genre - 장르
 * @returns {Promise<Object|null>}
 */
export async function getTopics(grade, genre) {
  const { educationLevel, gradeGroup } = gradeToEducationLevel(grade);
  const cacheKey = getCacheKey(educationLevel, gradeGroup, genre);

  // 캐시 확인
  const cached = getFromCache(ssakCache.topics, cacheKey);
  if (cached) return cached;

  try {
    const topicsRef = collection(db, 'topics');
    const q = query(
      topicsRef,
      where('education_level', '==', educationLevel),
      where('genre', '==', genre),
      limit(5)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setToCache(ssakCache.topics, cacheKey, topics);
    return topics;
  } catch (error) {
    console.error('주제 검색 오류:', error);
    return null;
  }
}

// ============================================
// 통합 검색 (평가용)
// ============================================

/**
 * 평가에 필요한 모든 싹DB 데이터 가져오기
 * @param {number} grade - 학년
 * @param {string} writingType - 글쓰기 유형
 * @returns {Promise<Object>}
 */
export async function getEvaluationContext(grade, writingType) {
  const genre = getGenreFromWritingType(writingType, grade);

  // 병렬로 모든 데이터 가져오기
  const [rubrics, examples, feedbackPatterns] = await Promise.all([
    getAllRubrics(grade, genre),
    getAllExamples(grade, genre),
    getAllFeedbackPatterns()
  ]);

  return {
    grade,
    genre,
    educationLevel: gradeToEducationLevel(grade),
    rubrics,
    examples,
    feedbackPatterns
  };
}

/**
 * 평가 프롬프트용 컨텍스트 문자열 생성
 */
export function buildPromptContext(evalContext) {
  const { grade, genre, educationLevel, rubrics, examples } = evalContext;

  let context = '';

  // 루브릭 컨텍스트
  if (rubrics.total) {
    context += `## 평가 기준 (${educationLevel.educationLevel} ${educationLevel.gradeGroup} ${genre})\n\n`;
    context += rubrics.total.content || '';
    context += '\n\n';
  }

  // 우수작 예시 컨텍스트
  if (examples.high) {
    context += `## 우수작 예시 (상 수준)\n\n`;
    context += examples.high.content?.substring(0, 1000) || '';
    context += '\n\n';
  }

  return context;
}

// ============================================
// 캐시 관리
// ============================================

/**
 * 싹DB 캐시 초기화
 */
export function clearSsakCache() {
  ssakCache.rubrics.clear();
  ssakCache.examples.clear();
  ssakCache.patterns.clear();
  ssakCache.topics.clear();
}

/**
 * 싹DB 통계 가져오기
 */
export async function getSsakDBStats() {
  try {
    const statsDoc = await getDoc(doc(db, 'ssakdb_meta', 'stats'));
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    return null;
  } catch (error) {
    console.error('싹DB 통계 조회 오류:', error);
    return null;
  }
}
