// ============================================
// 글자 수 설정 - 학년별/유형별 기준
// ============================================

// 학년별 기본 적정 글자 수 범위
export const WORD_COUNT_STANDARDS = {
  'elementary-1': { min: 50, ideal: 100, max: 150 },
  'elementary-2': { min: 100, ideal: 150, max: 200 },
  'elementary-3': { min: 150, ideal: 250, max: 350 },
  'elementary-4': { min: 200, ideal: 350, max: 500 },
  'elementary-5': { min: 300, ideal: 500, max: 700 },
  'elementary-6': { min: 400, ideal: 600, max: 800 },
  'middle-1': { min: 500, ideal: 700, max: 900 },
  'middle-2': { min: 600, ideal: 800, max: 1000 },
  'middle-3': { min: 700, ideal: 900, max: 1200 },
  'high-1': { min: 800, ideal: 1000, max: 1500 },
  'high-2': { min: 900, ideal: 1200, max: 1800 },
  'high-3': { min: 1000, ideal: 1500, max: 2000 }
};

// 글쓰기 유형별 글자 수 조정 비율
export const WRITING_TYPE_MULTIPLIERS = {
  '편지': { minMult: 0.5, idealMult: 0.6, maxMult: 0.7 },
  '일기': { minMult: 0.5, idealMult: 0.6, maxMult: 0.7 },
  '감상문': { minMult: 0.7, idealMult: 0.8, maxMult: 0.9 },
  '독후감': { minMult: 0.8, idealMult: 0.9, maxMult: 1.0 },
  '시': { minMult: 0.2, idealMult: 0.3, maxMult: 0.4 },
  '동시': { minMult: 0.2, idealMult: 0.3, maxMult: 0.4 },
  '묘사하는 글': { minMult: 0.7, idealMult: 0.8, maxMult: 0.9 },
  '설명하는 글': { minMult: 0.9, idealMult: 1.0, maxMult: 1.1 },
  '주장하는 글': { minMult: 1.0, idealMult: 1.1, maxMult: 1.2 },
  '서사/이야기': { minMult: 0.8, idealMult: 0.9, maxMult: 1.0 },
  '상상글': { minMult: 0.7, idealMult: 0.8, maxMult: 1.0 },
  '기행문': { minMult: 0.8, idealMult: 0.9, maxMult: 1.0 },
  '보고서': { minMult: 1.0, idealMult: 1.1, maxMult: 1.2 },
  '기본': { minMult: 1.0, idealMult: 1.0, maxMult: 1.0 }
};

/**
 * 글쓰기 유형 감지
 * @param {string} topic - 글쓰기 주제
 * @returns {string} 글쓰기 유형
 */
export function detectWritingType(topic) {
  const topicLower = (topic || '').toLowerCase();

  if (topicLower.includes('편지') || topicLower.includes('에게')) return '편지';
  if (topicLower.includes('일기') || topicLower.includes('하루')) return '일기';
  if (topicLower.includes('감상') || topicLower.includes('느낀점')) return '감상문';
  if (topicLower.includes('독후') || topicLower.includes('책을 읽고')) return '독후감';
  if (topicLower.includes('시') && topicLower.length < 10) return '시';
  if (topicLower.includes('동시')) return '동시';
  if (topicLower.includes('묘사') || topicLower.includes('장면')) return '묘사하는 글';
  if (topicLower.includes('설명') || topicLower.includes('방법') || topicLower.includes('소개')) return '설명하는 글';
  if (topicLower.includes('주장') || topicLower.includes('생각') || topicLower.includes('의견') || topicLower.includes('찬성') || topicLower.includes('반대')) return '주장하는 글';
  if (topicLower.includes('이야기') || topicLower.includes('서사') || topicLower.includes('그날')) return '서사/이야기';
  if (topicLower.includes('상상') || topicLower.includes('만약') || topicLower.includes('미래')) return '상상글';
  if (topicLower.includes('여행') || topicLower.includes('기행') || topicLower.includes('다녀온')) return '기행문';
  if (topicLower.includes('보고') || topicLower.includes('조사') || topicLower.includes('연구')) return '보고서';

  return '기본';
}

/**
 * 학년별 gradeLevel 형식 정규화
 * @param {string} gradeLevel - 원본 gradeLevel
 * @returns {string} 정규화된 gradeLevel
 */
export function normalizeGradeLevel(gradeLevel) {
  if (!gradeLevel) return 'elementary-4';

  // elementary_1_2, elementary_3_4, elementary_5_6, middle, high 형식 처리
  if (gradeLevel === 'elementary_1_2') return 'elementary-2';
  if (gradeLevel === 'elementary_3_4') return 'elementary-4';
  if (gradeLevel === 'elementary_5_6') return 'elementary-6';
  if (gradeLevel === 'middle') return 'middle-2';
  if (gradeLevel === 'high') return 'high-2';

  return gradeLevel;
}

/**
 * 학년과 글쓰기 유형에 따른 적정 글자 수 계산
 * @param {string} gradeLevel - 학년 레벨
 * @param {string} topic - 글쓰기 주제
 * @returns {{ min: number, ideal: number, max: number, writingType: string }}
 */
export function getAdjustedWordCount(gradeLevel, topic) {
  const normalizedGrade = normalizeGradeLevel(gradeLevel);
  const baseStandard = WORD_COUNT_STANDARDS[normalizedGrade] || WORD_COUNT_STANDARDS['elementary-4'];
  const safeBaseStandard = baseStandard || { min: 200, ideal: 350, max: 500 };

  const writingType = detectWritingType(topic);
  const multiplier = WRITING_TYPE_MULTIPLIERS[writingType] || WRITING_TYPE_MULTIPLIERS['기본'];

  return {
    min: Math.round(safeBaseStandard.min * multiplier.minMult),
    ideal: Math.round(safeBaseStandard.ideal * multiplier.idealMult),
    max: Math.round(safeBaseStandard.max * multiplier.maxMult),
    writingType
  };
}
