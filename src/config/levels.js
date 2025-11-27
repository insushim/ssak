// 레벨 시스템 설정
export const LEVELS = [
  { level: 1, name: '씨앗', emoji: '🌱', minPoints: 0, color: 'from-gray-400 to-gray-500' },
  { level: 2, name: '새싹', emoji: '🌿', minPoints: 100, color: 'from-green-400 to-green-500' },
  { level: 3, name: '잎사귀', emoji: '🍀', minPoints: 300, color: 'from-green-500 to-emerald-500' },
  { level: 4, name: '꽃봉오리', emoji: '🌷', minPoints: 600, color: 'from-pink-400 to-pink-500' },
  { level: 5, name: '꽃', emoji: '🌸', minPoints: 1000, color: 'from-pink-500 to-rose-500' },
  { level: 6, name: '나무', emoji: '🌳', minPoints: 1500, color: 'from-emerald-500 to-green-600' },
  { level: 7, name: '큰나무', emoji: '🌲', minPoints: 2500, color: 'from-green-600 to-green-700' },
  { level: 8, name: '숲', emoji: '🏕️', minPoints: 4000, color: 'from-green-700 to-emerald-800' },
  { level: 9, name: '정원', emoji: '🏡', minPoints: 6000, color: 'from-emerald-600 to-teal-600' },
  { level: 10, name: '마스터', emoji: '👑', minPoints: 10000, color: 'from-yellow-500 to-amber-500' },
];

// 포인트로 레벨 정보 가져오기
export const getLevelInfo = (points) => {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.minPoints) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

// 다음 레벨까지 필요한 포인트
export const getNextLevelInfo = (points) => {
  const currentLevel = getLevelInfo(points);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;

  if (nextLevelIndex >= LEVELS.length) {
    return { nextLevel: null, pointsNeeded: 0, progress: 100 };
  }

  const nextLevel = LEVELS[nextLevelIndex];
  const pointsNeeded = nextLevel.minPoints - points;
  const levelRange = nextLevel.minPoints - currentLevel.minPoints;
  const currentProgress = points - currentLevel.minPoints;
  const progress = Math.round((currentProgress / levelRange) * 100);

  return { nextLevel, pointsNeeded, progress };
};

// 업적/뱃지 정의
export const ACHIEVEMENTS = [
  // 글쓰기 관련
  { id: 'first_submit', name: '첫 발걸음', emoji: '👣', description: '첫 글 제출 완료', condition: 'submissions >= 1' },
  { id: 'submit_5', name: '꾸준한 작가', emoji: '✍️', description: '5편 제출 완료', condition: 'submissions >= 5' },
  { id: 'submit_10', name: '열정 작가', emoji: '📝', description: '10편 제출 완료', condition: 'submissions >= 10' },
  { id: 'submit_30', name: '베스트셀러 작가', emoji: '📚', description: '30편 제출 완료', condition: 'submissions >= 30' },
  { id: 'submit_100', name: '전설의 작가', emoji: '🏆', description: '100편 제출 완료', condition: 'submissions >= 100' },

  // 점수 관련
  { id: 'first_pass', name: '목표 달성', emoji: '🎯', description: '첫 80점 이상 달성', condition: 'hasPassedOnce' },
  { id: 'score_80', name: '우수 작가', emoji: '⭐', description: '80점 이상 달성', condition: 'highestScore >= 80' },
  { id: 'score_90', name: '최우수 작가', emoji: '🌟', description: '90점 이상 달성', condition: 'highestScore >= 90' },
  { id: 'score_100', name: '완벽한 글', emoji: '💯', description: '100점 달성', condition: 'highestScore >= 100' },
  { id: 'perfect_3', name: '연속 완벽', emoji: '🔥', description: '연속 3회 90점 이상', condition: 'consecutivePerfect >= 3' },

  // 연속 관련
  { id: 'streak_3', name: '3일 연속', emoji: '📅', description: '3일 연속 제출', condition: 'streakDays >= 3' },
  { id: 'streak_7', name: '1주일 연속', emoji: '🗓️', description: '7일 연속 제출', condition: 'streakDays >= 7' },
  { id: 'streak_30', name: '한 달 연속', emoji: '📆', description: '30일 연속 제출', condition: 'streakDays >= 30' },

  // 글자 수 관련
  { id: 'words_500', name: '500자 돌파', emoji: '📄', description: '한 편에 500자 이상 작성', condition: 'maxWordCount >= 500' },
  { id: 'words_1000', name: '1000자 돌파', emoji: '📃', description: '한 편에 1000자 이상 작성', condition: 'maxWordCount >= 1000' },
  { id: 'words_2000', name: '장편 작가', emoji: '📖', description: '한 편에 2000자 이상 작성', condition: 'maxWordCount >= 2000' },

  // 포인트 관련
  { id: 'points_500', name: '500P 달성', emoji: '💰', description: '500 포인트 누적', condition: 'totalPoints >= 500' },
  { id: 'points_1000', name: '1000P 달성', emoji: '💵', description: '1000 포인트 누적', condition: 'totalPoints >= 1000' },
  { id: 'points_5000', name: '부자 작가', emoji: '💎', description: '5000 포인트 누적', condition: 'totalPoints >= 5000' },

  // 특별 업적
  { id: 'early_bird', name: '아침형 작가', emoji: '🌅', description: '오전 6시~8시에 제출', condition: 'hasEarlySubmission' },
  { id: 'night_owl', name: '밤형 작가', emoji: '🦉', description: '오후 10시~12시에 제출', condition: 'hasNightSubmission' },
  { id: 'weekend_writer', name: '주말 작가', emoji: '🎉', description: '주말에 제출', condition: 'hasWeekendSubmission' },
  { id: 'rewrite_master', name: '퇴고의 달인', emoji: '✏️', description: '고쳐쓰기로 80점 이상 달성', condition: 'hasRewriteSuccess' },
];

// 업적 달성 여부 확인
export const checkAchievements = (userStats) => {
  const earned = [];

  for (const achievement of ACHIEVEMENTS) {
    let isEarned = false;

    // 조건 평가
    switch (achievement.id) {
      case 'first_submit':
        isEarned = (userStats.totalSubmissions || 0) >= 1;
        break;
      case 'submit_5':
        isEarned = (userStats.totalSubmissions || 0) >= 5;
        break;
      case 'submit_10':
        isEarned = (userStats.totalSubmissions || 0) >= 10;
        break;
      case 'submit_30':
        isEarned = (userStats.totalSubmissions || 0) >= 30;
        break;
      case 'submit_100':
        isEarned = (userStats.totalSubmissions || 0) >= 100;
        break;
      case 'first_pass':
        isEarned = userStats.hasPassedOnce || false;
        break;
      case 'score_80':
        isEarned = (userStats.highestScore || 0) >= 80;
        break;
      case 'score_90':
        isEarned = (userStats.highestScore || 0) >= 90;
        break;
      case 'score_100':
        isEarned = (userStats.highestScore || 0) >= 100;
        break;
      case 'streak_3':
        isEarned = (userStats.streakDays || 0) >= 3;
        break;
      case 'streak_7':
        isEarned = (userStats.streakDays || 0) >= 7;
        break;
      case 'streak_30':
        isEarned = (userStats.streakDays || 0) >= 30;
        break;
      case 'words_500':
        isEarned = (userStats.maxWordCount || 0) >= 500;
        break;
      case 'words_1000':
        isEarned = (userStats.maxWordCount || 0) >= 1000;
        break;
      case 'words_2000':
        isEarned = (userStats.maxWordCount || 0) >= 2000;
        break;
      case 'points_500':
        isEarned = (userStats.totalPoints || 0) >= 500;
        break;
      case 'points_1000':
        isEarned = (userStats.totalPoints || 0) >= 1000;
        break;
      case 'points_5000':
        isEarned = (userStats.totalPoints || 0) >= 5000;
        break;
      default:
        isEarned = false;
    }

    if (isEarned) {
      earned.push(achievement);
    }
  }

  return earned;
};

// 글쓰기 템플릿
export const WRITING_TEMPLATES = [
  {
    id: 'free',
    name: '자유 글쓰기',
    emoji: '✏️',
    description: '형식 없이 자유롭게 작성',
    template: ''
  },
  {
    id: 'intro_body_conclusion',
    name: '서론-본론-결론',
    emoji: '📝',
    description: '기본적인 글 구성',
    template: `[서론]
주제를 소개하고, 글을 쓰는 이유나 배경을 적어보세요.


[본론]
주제에 대해 자세히 설명하거나, 경험/생각을 풀어서 써보세요.


[결론]
글을 정리하고, 느낀 점이나 다짐을 적어보세요.

`
  },
  {
    id: 'diary',
    name: '일기',
    emoji: '📔',
    description: '하루를 기록하는 일기',
    template: `오늘의 날씨:

오늘 있었던 일:


가장 기억에 남는 일:


오늘의 기분:


내일 하고 싶은 일:

`
  },
  {
    id: 'letter',
    name: '편지',
    emoji: '💌',
    description: '누군가에게 쓰는 편지',
    template: `_____에게

안녕하세요, 저는 _____입니다.




보고 싶은 마음을 담아,
_____가(이)
`
  },
  {
    id: 'book_report',
    name: '독후감',
    emoji: '📖',
    description: '책을 읽고 쓰는 감상문',
    template: `책 제목:
저자:
읽은 날짜:

[책 소개]
이 책은 어떤 내용인가요?


[인상 깊은 장면]
가장 기억에 남는 장면이나 문장은 무엇인가요?


[내 생각과 느낌]
이 책을 읽고 어떤 생각이 들었나요?


[추천하고 싶은 사람]
이 책을 누구에게 추천하고 싶나요? 왜 그런가요?

`
  },
  {
    id: 'opinion',
    name: '주장하는 글',
    emoji: '💬',
    description: '내 의견을 주장하는 글',
    template: `[나의 주장]
나는 _____라고 생각합니다.

[이유 1]
첫 번째로,


[이유 2]
두 번째로,


[이유 3]
세 번째로,


[결론]
따라서, _____

`
  },
  {
    id: 'description',
    name: '설명하는 글',
    emoji: '📋',
    description: '무언가를 설명하는 글',
    template: `[소개]
_____에 대해 설명하겠습니다.

[정의/특징]
_____은(는) _____입니다.


[상세 설명]



[마무리]
이처럼 _____

`
  },
  {
    id: 'story',
    name: '이야기 글',
    emoji: '📚',
    description: '창작 이야기',
    template: `제목:

[배경]
언제, 어디서 일어난 이야기인가요?


[등장인물]
누가 나오나요?


[사건의 시작]
무슨 일이 일어났나요?


[사건의 전개]
그 다음에 어떻게 되었나요?


[결말]
이야기는 어떻게 끝나나요?

`
  },
  {
    id: 'poem',
    name: '시',
    emoji: '🎭',
    description: '감정을 담은 시',
    template: `제목:




`
  },
  {
    id: 'news',
    name: '기사문',
    emoji: '📰',
    description: '뉴스 기사 형식',
    template: `[제목]


[누가]
[언제]
[어디서]
[무엇을]
[어떻게]
[왜]

[상세 내용]


[기자 의견]

`
  },
  {
    id: 'interview',
    name: '인터뷰',
    emoji: '🎤',
    description: '가상 인터뷰 글',
    template: `인터뷰 대상:

Q1: 자기소개를 해주세요.
A1:


Q2:
A2:


Q3:
A3:


Q4: 마지막으로 하고 싶은 말이 있다면?
A4:

`
  },
  {
    id: 'compare',
    name: '비교하는 글',
    emoji: '⚖️',
    description: '두 가지를 비교하는 글',
    template: `비교 대상: _____ vs _____

[공통점]
1.
2.
3.

[차이점]
1.
2.
3.

[나의 선택/결론]

`
  }
];
