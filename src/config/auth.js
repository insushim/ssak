// ============================================
// 인증 및 권한 설정
// ============================================

export const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID || '';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// ============================================
// 학년 설정
// ============================================

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

// ============================================
// 시스템 설정
// ============================================

// 기준 점수 (이 점수 이상이어야 제출 성공)
export const PASSING_SCORE = 70;

// 표절 감지 임계값 (50% 이상 유사도)
export const PLAGIARISM_THRESHOLD = 50;

// 학급당 최대 학생 수
export const MAX_STUDENTS_PER_CLASS = 40;

// ============================================
// 글자 수 관련 설정 (별도 파일에서 re-export)
// 하위 호환성을 위해 유지
// ============================================

export {
  WORD_COUNT_STANDARDS,
  WRITING_TYPE_MULTIPLIERS,
  detectWritingType,
  getAdjustedWordCount,
  normalizeGradeLevel
} from './wordCount';
