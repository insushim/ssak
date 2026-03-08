import type { Achievement, AchievementCheckData } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  // 글쓰기 횟수
  {
    id: "write_1",
    name: "첫 걸음",
    description: "첫 글을 제출했어요",
    icon: "✏️",
    category: "글쓰기",
    condition: (d) => d.totalWritings >= 1,
  },
  {
    id: "write_5",
    name: "글쓰기 새싹",
    description: "5편의 글을 썼어요",
    icon: "🌱",
    category: "글쓰기",
    condition: (d) => d.totalWritings >= 5,
  },
  {
    id: "write_10",
    name: "성장하는 작가",
    description: "10편의 글을 썼어요",
    icon: "🌿",
    category: "글쓰기",
    condition: (d) => d.totalWritings >= 10,
  },
  {
    id: "write_20",
    name: "열정적인 작가",
    description: "20편의 글을 썼어요",
    icon: "🌳",
    category: "글쓰기",
    condition: (d) => d.totalWritings >= 20,
  },
  {
    id: "write_50",
    name: "다작 작가",
    description: "50편의 글을 썼어요",
    icon: "📚",
    category: "글쓰기",
    condition: (d) => d.totalWritings >= 50,
  },
  {
    id: "write_100",
    name: "전설의 작가",
    description: "100편의 글을 썼어요",
    icon: "👑",
    category: "글쓰기",
    condition: (d) => d.totalWritings >= 100,
  },

  // 점수
  {
    id: "score_70",
    name: "기준 돌파",
    description: "70점 이상을 받았어요",
    icon: "⭐",
    category: "점수",
    condition: (d) => d.maxScore >= 70,
  },
  {
    id: "score_80",
    name: "우수 작가",
    description: "80점 이상을 받았어요",
    icon: "🌟",
    category: "점수",
    condition: (d) => d.maxScore >= 80,
  },
  {
    id: "score_90",
    name: "최우수 작가",
    description: "90점 이상을 받았어요",
    icon: "💫",
    category: "점수",
    condition: (d) => d.maxScore >= 90,
  },
  {
    id: "score_95",
    name: "천재 작가",
    description: "95점 이상을 받았어요",
    icon: "🏆",
    category: "점수",
    condition: (d) => d.maxScore >= 95,
  },
  {
    id: "avg_80",
    name: "꾸준한 실력",
    description: "평균 80점 이상",
    icon: "📊",
    category: "점수",
    condition: (d) => d.avgScore >= 80 && d.totalWritings >= 5,
  },
  {
    id: "avg_90",
    name: "명문 작가",
    description: "평균 90점 이상",
    icon: "🎖️",
    category: "점수",
    condition: (d) => d.avgScore >= 90 && d.totalWritings >= 10,
  },

  // 연속 제출
  {
    id: "streak_3",
    name: "3일 연속",
    description: "3일 연속 제출",
    icon: "🔥",
    category: "연속",
    condition: (d) => d.streakDays >= 3,
  },
  {
    id: "streak_7",
    name: "일주일 연속",
    description: "7일 연속 제출",
    icon: "🔥",
    category: "연속",
    condition: (d) => d.streakDays >= 7,
  },
  {
    id: "streak_14",
    name: "2주 연속",
    description: "14일 연속 제출",
    icon: "🔥",
    category: "연속",
    condition: (d) => d.streakDays >= 14,
  },
  {
    id: "streak_30",
    name: "한 달 연속",
    description: "30일 연속 제출",
    icon: "💎",
    category: "연속",
    condition: (d) => d.streakDays >= 30,
  },
  {
    id: "streak_100",
    name: "100일 도전",
    description: "100일 연속 제출",
    icon: "🏅",
    category: "연속",
    condition: (d) => d.streakDays >= 100,
  },

  // 포인트
  {
    id: "points_500",
    name: "500P 달성",
    description: "500 포인트 모았어요",
    icon: "💰",
    category: "포인트",
    condition: (d) => d.totalPoints >= 500,
  },
  {
    id: "points_1000",
    name: "1000P 달성",
    description: "1,000 포인트 모았어요",
    icon: "💰",
    category: "포인트",
    condition: (d) => d.totalPoints >= 1000,
  },
  {
    id: "points_5000",
    name: "5000P 달성",
    description: "5,000 포인트 모았어요",
    icon: "💎",
    category: "포인트",
    condition: (d) => d.totalPoints >= 5000,
  },

  // 고쳐쓰기
  {
    id: "rewrite_1",
    name: "다시 도전",
    description: "첫 고쳐쓰기를 했어요",
    icon: "🔄",
    category: "고쳐쓰기",
    condition: (d) => d.rewriteCount >= 1,
  },
  {
    id: "rewrite_5",
    name: "끈기 있는 작가",
    description: "5번 고쳐쓰기",
    icon: "💪",
    category: "고쳐쓰기",
    condition: (d) => d.rewriteCount >= 5,
  },
  {
    id: "rewrite_10",
    name: "완벽주의자",
    description: "10번 고쳐쓰기",
    icon: "✨",
    category: "고쳐쓰기",
    condition: (d) => d.rewriteCount >= 10,
  },

  // 레벨
  {
    id: "level_3",
    name: "떡잎",
    description: "레벨 3 달성",
    icon: "🌱",
    category: "레벨",
    condition: (d) => d.level >= 3,
  },
  {
    id: "level_5",
    name: "꽃봉오리",
    description: "레벨 5 달성",
    icon: "🌸",
    category: "레벨",
    condition: (d) => d.level >= 5,
  },
  {
    id: "level_7",
    name: "열매",
    description: "레벨 7 달성",
    icon: "🍎",
    category: "레벨",
    condition: (d) => d.level >= 7,
  },
  {
    id: "level_10",
    name: "마스터",
    description: "레벨 10 달성",
    icon: "🌟",
    category: "레벨",
    condition: (d) => d.level >= 10,
  },

  // 만점
  {
    id: "perfect_1",
    name: "첫 만점",
    description: "100점을 받았어요!",
    icon: "💯",
    category: "특별",
    condition: (d) => d.perfectCount >= 1,
  },
  {
    id: "perfect_5",
    name: "만점 수집가",
    description: "5번 만점",
    icon: "🏆",
    category: "특별",
    condition: (d) => d.perfectCount >= 5,
  },
];

export const LEVELS = [
  { level: 1, name: "씨앗", minPoints: 0, icon: "🌰" },
  { level: 2, name: "새싹", minPoints: 100, icon: "🌱" },
  { level: 3, name: "떡잎", minPoints: 300, icon: "🌿" },
  { level: 4, name: "줄기", minPoints: 600, icon: "🪴" },
  { level: 5, name: "꽃봉오리", minPoints: 1000, icon: "🌷" },
  { level: 6, name: "꽃", minPoints: 1500, icon: "🌸" },
  { level: 7, name: "열매", minPoints: 2500, icon: "🍎" },
  { level: 8, name: "나무", minPoints: 4000, icon: "🌳" },
  { level: 9, name: "숲", minPoints: 7000, icon: "🌲" },
  { level: 10, name: "마스터", minPoints: 10000, icon: "🌟" },
];

export function calculateLevel(points: number): {
  level: number;
  name: string;
  icon: string;
  progress: number;
  nextLevelPoints: number;
} {
  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const progress =
    next.minPoints > current.minPoints
      ? (points - current.minPoints) / (next.minPoints - current.minPoints)
      : 1;

  return {
    level: current.level,
    name: current.name,
    icon: current.icon,
    progress: Math.min(1, progress),
    nextLevelPoints: next.minPoints,
  };
}

export function calculatePoints(
  score: number,
  isRewrite: boolean,
  previousScore: number,
): number {
  let points = Math.round(score * 1.5);

  // Rewrite bonus
  if (isRewrite && score > previousScore) {
    points += 50;
  }

  // High score bonus
  if (score >= 90) points += 20;
  else if (score >= 80) points += 10;

  return points;
}

export function checkAchievements(
  data: AchievementCheckData,
  unlockedIds: string[],
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id) && a.condition(data),
  );
}
