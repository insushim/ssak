export const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID || '';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const GRADE_LEVELS = {
  'elementary-1': '초등학교 1학년',
  'elementary-2': '초등학교 2학년',
  'elementary-3': '초등학교 3학년',
  'elementary-4': '초등학교 4학년',
  'elementary-5': '초등학교 5학년',
  'elementary-6': '초등학교 6학년',
  'middle-1': '중학교 1학년',
  'middle-2': '중학교 2학년',
  'middle-3': '중학교 3학년',
  'high-1': '고등학교 1학년',
  'high-2': '고등학교 2학년',
  'high-3': '고등학교 3학년'
};

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
  '편지': { minMult: 0.5, idealMult: 0.6, maxMult: 0.7 },      // 편지글은 짧아도 됨
  '일기': { minMult: 0.5, idealMult: 0.6, maxMult: 0.7 },      // 일기도 짧아도 됨
  '감상문': { minMult: 0.7, idealMult: 0.8, maxMult: 0.9 },    // 감상문은 중간
  '독후감': { minMult: 0.8, idealMult: 0.9, maxMult: 1.0 },    // 독후감은 좀 길게
  '시': { minMult: 0.2, idealMult: 0.3, maxMult: 0.4 },        // 시는 매우 짧아도 됨
  '동시': { minMult: 0.2, idealMult: 0.3, maxMult: 0.4 },      // 동시도 짧게
  '묘사하는 글': { minMult: 0.7, idealMult: 0.8, maxMult: 0.9 },
  '설명하는 글': { minMult: 0.9, idealMult: 1.0, maxMult: 1.1 },
  '주장하는 글': { minMult: 1.0, idealMult: 1.1, maxMult: 1.2 }, // 논설문은 길게
  '서사/이야기': { minMult: 0.8, idealMult: 0.9, maxMult: 1.0 },
  '상상글': { minMult: 0.7, idealMult: 0.8, maxMult: 1.0 },
  '기행문': { minMult: 0.8, idealMult: 0.9, maxMult: 1.0 },
  '보고서': { minMult: 1.0, idealMult: 1.1, maxMult: 1.2 },
  '기본': { minMult: 1.0, idealMult: 1.0, maxMult: 1.0 }       // 기본값
};

// 글쓰기 유형 감지 함수
export function detectWritingType(topic) {
  const topicLower = topic.toLowerCase();

  // 유형 키워드 매칭
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

// 학년과 글쓰기 유형에 따른 적정 글자 수 계산
export function getAdjustedWordCount(gradeLevel, topic) {
  const baseStandard = WORD_COUNT_STANDARDS[gradeLevel] || WORD_COUNT_STANDARDS['elementary-4'];
  const writingType = detectWritingType(topic);
  const multiplier = WRITING_TYPE_MULTIPLIERS[writingType] || WRITING_TYPE_MULTIPLIERS['기본'];

  return {
    min: Math.round(baseStandard.min * multiplier.minMult),
    ideal: Math.round(baseStandard.ideal * multiplier.idealMult),
    max: Math.round(baseStandard.max * multiplier.maxMult),
    writingType
  };
}

// 기준 점수 (이 점수 이상이어야 제출 성공)
// 자유 주제 기본값 - 과제는 과제별 minScore 사용
export const PASSING_SCORE = 70;

// 표절 감지 임계값 (50% 이상 유사도)
export const PLAGIARISM_THRESHOLD = 50;

// 학급당 최대 학생 수
export const MAX_STUDENTS_PER_CLASS = 40;
