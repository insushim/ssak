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

// 학년별 적정 글자 수 범위
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

// 기준 점수 (이 점수 이상이어야 제출 가능)
export const PASSING_SCORE = 70;

// 표절 감지 임계값 (50% 이상 유사도)
export const PLAGIARISM_THRESHOLD = 50;

// 학급당 최대 학생 수
export const MAX_STUDENTS_PER_CLASS = 40;
