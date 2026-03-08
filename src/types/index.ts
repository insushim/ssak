export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: "student" | "teacher" | "super_admin";
  class_code: string;
  grade_level: string;
  points: number;
  level: number;
  streak_days: number;
  last_submit_date: string;
  approved: number;
  privacy_agreed: number;
  created_at: string;
}

export interface Writing {
  id: string;
  student_id: string;
  class_code: string;
  assignment_id: string;
  content: string;
  writing_type: string;
  topic: string;
  grade_level: string;
  score_content: number;
  score_organization: number;
  score_expression: number;
  score_mechanics: number;
  score_total: number;
  feedback: string;
  sentence_feedbacks: string;
  is_draft: number;
  is_rewrite: number;
  previous_score: number;
  rewrite_count: number;
  word_count: number;
  char_count: number;
  sentence_count: number;
  paragraph_count: number;
  unique_word_count: number;
  vocabulary_diversity: number;
  avg_sentence_length: number;
  self_assessment: string;
  teacher_feedback: string;
  teacher_feedback_at: string;
  created_at: string;
  submitted_at: string;
}

export interface ClassInfo {
  code: string;
  name: string;
  school_name: string;
  teacher_id: string;
  teacher_name: string;
  max_students: number;
  created_at: string;
  student_count?: number;
}

export interface Assignment {
  id: string;
  class_code: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  grade_level: string;
  writing_type: string;
  topic: string;
  min_word_count: number;
  ideal_word_count: number;
  status: string;
  created_at: string;
  submission_count?: number;
}

export interface SentenceFeedback {
  index: number;
  sentence: string;
  issues: string[];
  suggestions: string[];
  type: "error" | "warning" | "tip";
}

export interface SelfAssessment {
  rating_topic: number;
  rating_length: number;
  rating_spelling: number;
  rating_expression: number;
}

export interface ErrorPattern {
  pattern_type: string;
  pattern_detail: string;
  count: number;
  last_example: string;
  last_seen: string;
  first_seen: string;
}

export interface WritingStats {
  month: string;
  total_writings: number;
  avg_score: number;
  avg_word_count: number;
  unique_words: number;
  vocabulary_diversity: number;
  avg_sentence_length: number;
  favorite_words: string[];
  common_errors: string[];
  strengths: string;
  score_content_avg: number;
  score_organization_avg: number;
  score_expression_avg: number;
  score_mechanics_avg: number;
}

export interface WritingDNA {
  totalWritings: number;
  avgSentenceLength: number;
  vocabularyDiversity: number;
  favoriteWords: { word: string; count: number }[];
  commonErrors: { type: string; count: number; trend: string }[];
  strengths: string[];
  monthlyProgress: WritingStats[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  condition: (stats: AchievementCheckData) => boolean;
}

export interface AchievementCheckData {
  totalWritings: number;
  avgScore: number;
  maxScore: number;
  streakDays: number;
  totalPoints: number;
  level: number;
  totalWords: number;
  rewriteCount: number;
  perfectCount: number;
}

export interface ClassStatsSummary {
  totalStudents: number;
  submissionRate: number;
  avgVocabularyDiversity: number;
  needAttention: { name: string; reason: string }[];
  praiseWorthy: { name: string; reason: string }[];
  commonWeakness: { pattern: string; count: number }[];
}

export interface TeacherQuickFeedback {
  type: "good" | "content" | "spelling" | "structure" | "expression" | "custom";
  label: string;
  icon: string;
  message: string;
}

export type GradeLevel =
  | "초1-2"
  | "초3-4"
  | "초5-6"
  | "중1"
  | "중2"
  | "중3"
  | "고1"
  | "고2"
  | "고3"
  | "대학"
  | "성인";

export interface ScoreResult {
  content: number;
  organization: number;
  expression: number;
  mechanics: number;
  total: number;
  feedback: string;
  sentenceFeedbacks: SentenceFeedback[];
  textStats: TextStats;
}

export interface TextStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  uniqueWordCount: number;
  vocabularyDiversity: number;
  avgSentenceLength: number;
  longestSentence: number;
  shortestSentence: number;
}
