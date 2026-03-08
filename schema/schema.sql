-- 싹(SSAK) Database Schema for Cloudflare D1

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student',
  class_code TEXT DEFAULT '',
  grade_level TEXT DEFAULT '',
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_submit_date TEXT DEFAULT '',
  approved INTEGER DEFAULT 0,
  privacy_agreed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  school_name TEXT DEFAULT '',
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  max_students INTEGER DEFAULT 40,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Writings
CREATE TABLE IF NOT EXISTS writings (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_code TEXT DEFAULT '',
  assignment_id TEXT DEFAULT '',
  content TEXT NOT NULL,
  writing_type TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  grade_level TEXT DEFAULT '',
  score_content INTEGER DEFAULT 0,
  score_organization INTEGER DEFAULT 0,
  score_expression INTEGER DEFAULT 0,
  score_mechanics INTEGER DEFAULT 0,
  score_total INTEGER DEFAULT 0,
  feedback TEXT DEFAULT '',
  sentence_feedbacks TEXT DEFAULT '[]',
  is_draft INTEGER DEFAULT 0,
  is_rewrite INTEGER DEFAULT 0,
  previous_score INTEGER DEFAULT 0,
  rewrite_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  sentence_count INTEGER DEFAULT 0,
  paragraph_count INTEGER DEFAULT 0,
  unique_word_count INTEGER DEFAULT 0,
  vocabulary_diversity REAL DEFAULT 0,
  avg_sentence_length REAL DEFAULT 0,
  self_assessment TEXT DEFAULT '',
  teacher_feedback TEXT DEFAULT '',
  teacher_feedback_at TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  submitted_at TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_writings_student ON writings(student_id);
CREATE INDEX IF NOT EXISTS idx_writings_class ON writings(class_code);
CREATE INDEX IF NOT EXISTS idx_writings_assignment ON writings(assignment_id);
CREATE INDEX IF NOT EXISTS idx_writings_submitted ON writings(submitted_at);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  class_code TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date TEXT DEFAULT '',
  grade_level TEXT DEFAULT '',
  writing_type TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  min_word_count INTEGER DEFAULT 0,
  ideal_word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_code);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, achievement_id)
);

-- Error Pattern Tracking (per student)
CREATE TABLE IF NOT EXISTS error_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_detail TEXT DEFAULT '',
  count INTEGER DEFAULT 1,
  last_example TEXT DEFAULT '',
  last_seen TEXT DEFAULT (datetime('now')),
  first_seen TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_error_user_type ON error_patterns(user_id, pattern_type);

-- Monthly Writing Stats (Writing DNA)
CREATE TABLE IF NOT EXISTS writing_stats (
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  total_writings INTEGER DEFAULT 0,
  avg_score REAL DEFAULT 0,
  avg_word_count REAL DEFAULT 0,
  unique_words INTEGER DEFAULT 0,
  vocabulary_diversity REAL DEFAULT 0,
  avg_sentence_length REAL DEFAULT 0,
  favorite_words TEXT DEFAULT '[]',
  common_errors TEXT DEFAULT '[]',
  strengths TEXT DEFAULT '',
  score_content_avg REAL DEFAULT 0,
  score_organization_avg REAL DEFAULT 0,
  score_expression_avg REAL DEFAULT 0,
  score_mechanics_avg REAL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, month)
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Self Assessments (linked to writings)
CREATE TABLE IF NOT EXISTS self_assessments (
  writing_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rating_topic INTEGER DEFAULT 3,
  rating_length INTEGER DEFAULT 3,
  rating_spelling INTEGER DEFAULT 3,
  rating_expression INTEGER DEFAULT 3,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Teacher Quick Feedbacks
CREATE TABLE IF NOT EXISTS teacher_feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  writing_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  custom_message TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_teacher_fb_writing ON teacher_feedbacks(writing_id);
