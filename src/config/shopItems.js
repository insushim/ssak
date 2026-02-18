// ============================================
// 🛒 상점 아이템 데이터 - 프리미엄 아바타 시스템 v2.0
// 희귀도 티어 + 세트 시스템 + 업적 아이템 + 시즌 한정
// ============================================

// ──────────────────────────────────────────
// 🎨 희귀도 설정 (WoW/Fortnite/LoL 산업 표준)
// ──────────────────────────────────────────
export const RARITY_CONFIG = {
  common: {
    name: '일반', nameEn: 'Common', order: 0,
    color: '#9CA3AF', gradientFrom: '#D1D5DB', gradientTo: '#9CA3AF',
    bgClass: 'from-gray-50 to-gray-100',
    borderClass: 'border-gray-300',
    textClass: 'text-gray-500',
    badgeBg: 'bg-gray-100 text-gray-600',
    glow: false, shimmer: false, particles: false
  },
  uncommon: {
    name: '고급', nameEn: 'Uncommon', order: 1,
    color: '#22C55E', gradientFrom: '#86EFAC', gradientTo: '#22C55E',
    bgClass: 'from-green-50 to-emerald-100',
    borderClass: 'border-green-400',
    textClass: 'text-green-600',
    badgeBg: 'bg-green-100 text-green-700',
    glow: false, shimmer: false, particles: false
  },
  rare: {
    name: '희귀', nameEn: 'Rare', order: 2,
    color: '#3B82F6', gradientFrom: '#93C5FD', gradientTo: '#3B82F6',
    bgClass: 'from-blue-50 to-sky-100',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700',
    glow: true, shimmer: false, particles: false
  },
  epic: {
    name: '영웅', nameEn: 'Epic', order: 3,
    color: '#A855F7', gradientFrom: '#C084FC', gradientTo: '#7C3AED',
    bgClass: 'from-purple-50 to-violet-100',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-700',
    glow: true, shimmer: true, particles: false
  },
  legendary: {
    name: '전설', nameEn: 'Legendary', order: 4,
    color: '#F59E0B', gradientFrom: '#FDE68A', gradientTo: '#D97706',
    bgClass: 'from-amber-50 to-yellow-100',
    borderClass: 'border-amber-400',
    textClass: 'text-amber-600',
    badgeBg: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700',
    glow: true, shimmer: true, particles: true
  },
  mythic: {
    name: '신화', nameEn: 'Mythic', order: 5,
    color: '#EF4444', gradientFrom: '#FCA5A5', gradientTo: '#DC2626',
    bgClass: 'from-red-50 via-pink-50 to-rose-100',
    borderClass: 'border-red-400',
    textClass: 'text-red-500',
    badgeBg: 'bg-gradient-to-r from-red-100 via-pink-100 to-rose-100 text-red-600',
    glow: true, shimmer: true, particles: true
  }
};

// 가격 기반 자동 희귀도 결정 (수동 지정 없을 때 폴백)
export function getAutoRarity(price, isSpecial) {
  if (isSpecial && price >= 600) return 'mythic';
  if (isSpecial || price >= 400) return 'legendary';
  if (price >= 200) return 'epic';
  if (price >= 80) return 'rare';
  if (price >= 30) return 'uncommon';
  return 'common';
}

// ──────────────────────────────────────────
// 👤 아바타 아이템 (희귀도 + 설명 추가)
// ──────────────────────────────────────────
export const AVATAR_ITEMS = {
  faces: [
    // 남자 캐릭터
    { id: 'face1', emoji: '👦', name: '남자 (기본)', price: 0, svgType: 'human', expression: 'happy', skinColor: '#FFD5B8', gender: 'male', rarity: 'common', description: '기본 남자 캐릭터' },
    { id: 'face2', emoji: '😎', name: '남자 (멋쟁이)', price: 50, svgType: 'human', expression: 'cool', skinColor: '#FFD5B8', gender: 'male', rarity: 'uncommon', description: '쿨한 표정의 멋쟁이' },
    { id: 'face3', emoji: '🤓', name: '남자 (똒똒이)', price: 50, svgType: 'human', expression: 'smart', skinColor: '#FFD5B8', gender: 'male', rarity: 'uncommon', description: '지적인 분위기의 똒똒이' },
    // 여자 캐릭터
    { id: 'face4', emoji: '👧', name: '여자 (기본)', price: 0, svgType: 'human', expression: 'happy', skinColor: '#FFE4D6', gender: 'female', rarity: 'common', description: '기본 여자 캐릭터' },
    { id: 'face5', emoji: '😊', name: '여자 (상냥)', price: 50, svgType: 'human', expression: 'angel', skinColor: '#FFE4D6', gender: 'female', rarity: 'uncommon', description: '천사같은 미소의 상냥이' },
    { id: 'face6', emoji: '🥰', name: '여자 (사랑스러운)', price: 80, svgType: 'human', expression: 'happy', skinColor: '#FFF0E6', gender: 'female', rarity: 'rare', description: '사랑스러운 미소' },
    // 피부색 변형
    { id: 'face7', emoji: '👶', name: '아기 얼굴', price: 100, svgType: 'human', expression: 'surprised', skinColor: '#FFE4D6', gender: 'neutral', rarity: 'rare', description: '깜짝 놀란 귀여운 아기' },
    { id: 'face8', emoji: '😇', name: '천사', price: 100, svgType: 'human', expression: 'angel', skinColor: '#FFF0E6', gender: 'neutral', rarity: 'rare', description: '순수한 천사의 얼굴' },
    // 동물 캐릭터
    { id: 'face10', emoji: '🦊', name: '여우', price: 100, svgType: 'animal', animalType: 'fox', rarity: 'rare', description: '영리한 숲속의 여우' },
    { id: 'face11', emoji: '🐰', name: '토끼', price: 100, svgType: 'animal', animalType: 'rabbit', rarity: 'rare', description: '깡충깡충 귀여운 토끼' },
    { id: 'face12', emoji: '🐻', name: '곰돌이', price: 150, svgType: 'animal', animalType: 'bear', rarity: 'rare', description: '포근한 곰돌이' },
    { id: 'face13', emoji: '🦁', name: '사자왕', price: 200, svgType: 'animal', animalType: 'lion', rarity: 'epic', description: '용맹한 정글의 왕' },
    { id: 'face14', emoji: '🐱', name: '고양이', price: 80, svgType: 'animal', animalType: 'cat', rarity: 'rare', description: '도도한 고양이' },
    { id: 'face15', emoji: '🐶', name: '강아지', price: 80, svgType: 'animal', animalType: 'dog', rarity: 'rare', description: '충직한 강아지' },
    { id: 'face16', emoji: '🐼', name: '판다', price: 150, svgType: 'animal', animalType: 'panda', rarity: 'rare', description: '대나무를 사랑하는 판다' },
    { id: 'face17', emoji: '🐯', name: '호랑이', price: 180, svgType: 'animal', animalType: 'tiger', rarity: 'epic', description: '위풍당당한 호랑이' },
    // 이모지 캐릭터
    { id: 'face20', emoji: '🦋', name: '나비', price: 200, svgType: 'animal', animalType: 'butterfly', rarity: 'epic', description: '아름다운 날개의 나비' },
    { id: 'face21', emoji: '🐸', name: '개구리', price: 120, svgType: 'animal', animalType: 'frog', rarity: 'rare', description: '통통 튀는 개구리' },
    { id: 'face22', emoji: '🦢', name: '백조', price: 220, svgType: 'animal', animalType: 'swan', rarity: 'epic', description: '우아한 호수의 백조' },
    { id: 'face23', emoji: '🐠', name: '열대어', price: 180, svgType: 'animal', animalType: 'tropicalfish', rarity: 'epic', description: '무지개빛 열대어' },
    { id: 'face24', emoji: '🦈', name: '상어', price: 320, svgType: 'animal', animalType: 'shark', rarity: 'epic', description: '바다의 포식자' },
    { id: 'face25', emoji: '🐙', name: '문어', price: 250, svgType: 'animal', animalType: 'octopus', rarity: 'epic', description: '영리한 바다의 현자' },
    // 스페셜 캐릭터
    { id: 'face30', emoji: '🐲', name: '용', price: 300, svgType: 'animal', animalType: 'dragon', special: true, rarity: 'legendary', description: '전설의 불꽃 드래곤', setId: 'dragon' },
    { id: 'face31', emoji: '🦄', name: '유니콘', price: 500, svgType: 'animal', animalType: 'unicorn', special: true, rarity: 'legendary', description: '무지개빛 유니콘' },
    { id: 'face32', emoji: '👻', name: '유령', price: 400, svgType: 'animal', animalType: 'ghost', special: true, rarity: 'legendary', description: '귀여운 유령', seasonal: 'halloween' },
    { id: 'face33', emoji: '👽', name: '외계인', price: 600, svgType: 'animal', animalType: 'alien', special: true, rarity: 'mythic', description: '미지의 외계 존재' },
    { id: 'face34', emoji: '🤖', name: '로봇', price: 800, svgType: 'animal', animalType: 'robot', special: true, rarity: 'mythic', description: '최첨단 AI 로봇' },
    { id: 'face35', emoji: '🎃', name: '호박', price: 450, svgType: 'animal', animalType: 'pumpkin', special: true, rarity: 'legendary', description: '잭오랜턴 호박', seasonal: 'halloween' }
  ],

  hair: [
    { id: 'hair1', emoji: '👤', name: '기본', price: 0, svgStyle: 'default', rarity: 'common' },
    { id: 'hair2', emoji: '💇', name: '단발', price: 30, svgStyle: 'short', rarity: 'uncommon' },
    { id: 'hair3', emoji: '💇‍♀️', name: '긴머리', price: 30, svgStyle: 'long', rarity: 'uncommon' },
    { id: 'hair4', emoji: '👨‍🦱', name: '곱슬머리', price: 50, svgStyle: 'curly', rarity: 'uncommon' },
    { id: 'hair5', emoji: '👩‍🦰', name: '웨이브', price: 50, svgStyle: 'wave', rarity: 'uncommon' },
    { id: 'hair6', emoji: '👨‍🦲', name: '스포츠컷', price: 40, svgStyle: 'sportscut', rarity: 'uncommon' },
    { id: 'hair7', emoji: '🧑‍🦳', name: '은발', price: 100, svgStyle: 'default', defaultColor: '#C0C0C0', rarity: 'rare' },
    { id: 'hair8', emoji: '👸', name: '공주머리', price: 150, svgStyle: 'princess', rarity: 'rare', description: '우아한 공주님 헤어' },
    { id: 'hair9', emoji: '🦸', name: '히어로컷', price: 200, svgStyle: 'herocut', rarity: 'epic', description: '영웅의 헤어스타일' },
    { id: 'hair10', emoji: '🧝', name: '엘프머리', price: 300, svgStyle: 'elf', rarity: 'epic', description: '신비로운 엘프 헤어' },
    { id: 'hair11', emoji: '👩‍🎤', name: '락스타', price: 180, svgStyle: 'rockstar', rarity: 'epic', description: '무대를 흔드는 락스타', setId: 'rockstar' },
    { id: 'hair12', emoji: '🧑‍🎄', name: '산타머리', price: 250, special: true, svgStyle: 'santa', rarity: 'legendary', description: '메리 크리스마스!', setId: 'santa', seasonal: 'winter' },
    { id: 'hair13', emoji: '🧜', name: '인어머리', price: 350, special: true, svgStyle: 'mermaid', rarity: 'legendary', description: '바다를 닮은 물결 헤어', setId: 'mermaid' },
    { id: 'hair14', emoji: '🎎', name: '전통머리', price: 200, svgStyle: 'bun', rarity: 'epic' },
    { id: 'hair15', emoji: '👩‍🚀', name: '우주비행사', price: 400, special: true, svgStyle: 'astronaut', rarity: 'legendary', description: '우주를 향한 꿈', setId: 'space' }
  ],

  hairColor: [
    { id: 'hc1', color: '#1a1a1a', name: '검정', price: 0, rarity: 'common' },
    { id: 'hc2', color: '#4a3728', name: '갈색', price: 20, rarity: 'common' },
    { id: 'hc3', color: '#ffd700', name: '금발', price: 50, rarity: 'uncommon' },
    { id: 'hc4', color: '#ff6b6b', name: '빨강', price: 80, rarity: 'rare' },
    { id: 'hc5', color: '#4ecdc4', name: '민트', price: 100, rarity: 'rare' },
    { id: 'hc6', color: '#a855f7', name: '보라', price: 100, rarity: 'rare' },
    { id: 'hc7', color: '#3b82f6', name: '파랑', price: 100, rarity: 'rare' },
    { id: 'hc8', color: '#ec4899', name: '핑크', price: 120, rarity: 'rare' },
    { id: 'hc9', color: '#C0C0C0', name: '은색', price: 100, rarity: 'rare' },
    { id: 'hc10', color: '#F5F5F5', name: '백발', price: 150, rarity: 'epic' },
    { id: 'hc11', color: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)', name: '그라데이션', price: 200, rarity: 'epic', description: '두 가지 색이 어우러진 그라데이션' },
    { id: 'hc12', color: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)', name: '레인보우', price: 500, rarity: 'legendary', description: '일곱 빛깔 무지개 헤어' }
  ],

  clothes: [
    { id: 'cloth1', emoji: '👕', name: '기본 티셔츠', price: 0, svgType: 'tshirt', color: '#4A90D9', rarity: 'common' },
    { id: 'cloth2', emoji: '👔', name: '셔츠', price: 50, svgType: 'shirt', color: '#FFFFFF', rarity: 'uncommon' },
    { id: 'cloth3', emoji: '🎽', name: '운동복', price: 40, svgType: 'sportswear', color: '#FF6B6B', rarity: 'uncommon' },
    { id: 'cloth4', emoji: '👗', name: '원피스', price: 80, svgType: 'dress', color: '#FF69B4', rarity: 'rare' },
    { id: 'cloth5', emoji: '🧥', name: '코트', price: 100, svgType: 'coat', color: '#8B4513', rarity: 'rare' },
    { id: 'cloth6', emoji: '🥋', name: '도복', price: 120, svgType: 'taekwondo', color: '#FFFFFF', rarity: 'rare' },
    { id: 'cloth7', emoji: '👘', name: '한복', price: 200, svgType: 'hanbok', color: '#E91E63', rarity: 'epic', description: '아름다운 전통 한복' },
    { id: 'cloth8', emoji: '🦸', name: '히어로 슈트', price: 300, svgType: 'superhero', color: '#1E3A8A', rarity: 'epic', description: '정의의 히어로 슈트' },
    { id: 'cloth9', emoji: '👑', name: '왕족 의상', price: 500, svgType: 'princess', color: '#FFD700', rarity: 'legendary', description: '고귀한 왕족의 의상', setId: 'royal' },
    { id: 'cloth10', emoji: '🧙', name: '마법사 로브', price: 400, svgType: 'wizard', color: '#4B0082', rarity: 'legendary', description: '신비한 마법의 로브', setId: 'wizard' },
    { id: 'cloth11', emoji: '🎅', name: '산타복', price: 150, svgType: 'santasuit', color: '#DC2626', rarity: 'rare', description: '산타클로스의 빨간 옷', setId: 'santa', seasonal: 'winter' },
    { id: 'cloth12', emoji: '🤵', name: '턱시도', price: 250, svgType: 'tuxedo', color: '#1a1a1a', rarity: 'epic', description: '격식 있는 턱시도' },
    { id: 'cloth13', emoji: '👩‍🎤', name: '록스타 재킷', price: 220, svgType: 'rockstarjacket', color: '#1a1a1a', rarity: 'epic', description: '가죽 록스타 재킷', setId: 'rockstar' },
    { id: 'cloth14', emoji: '🥷', name: '닌자복', price: 280, svgType: 'ninja', color: '#1a1a1a', rarity: 'epic', description: '그림자처럼 움직이는 닌자', setId: 'ninja' },
    { id: 'cloth15', emoji: '👨‍🚀', name: '우주복', price: 450, special: true, svgType: 'spacesuit', color: '#F5F5F5', rarity: 'legendary', description: '우주 탐험을 위한 특수복', setId: 'space' },
    { id: 'cloth16', emoji: '🧛', name: '뱀파이어 망토', price: 350, special: true, svgType: 'robe', color: '#800020', rarity: 'legendary', description: '밤의 지배자의 망토', setId: 'vampire', seasonal: 'halloween' },
    { id: 'cloth17', emoji: '🧚', name: '요정 드레스', price: 380, special: true, svgType: 'princess', color: '#98FB98', rarity: 'legendary', description: '반짝이는 요정의 드레스', setId: 'fairy' },
    { id: 'cloth18', emoji: '🎭', name: '오페라 의상', price: 320, svgType: 'dress', color: '#8B0000', rarity: 'epic', description: '화려한 오페라 의상' },
    { id: 'cloth19', emoji: '🏴‍☠️', name: '해적 의상', price: 270, svgType: 'pirate', color: '#654321', rarity: 'epic', description: '바다의 모험가', setId: 'pirate' },
    { id: 'cloth20', emoji: '⚔️', name: '기사 갑옷', price: 550, special: true, svgType: 'armor', color: '#C0C0C0', rarity: 'legendary', description: '빛나는 기사의 갑옷', setId: 'knight' }
  ],

  accessories: [
    { id: 'acc1', emoji: '❌', name: '없음', price: 0, svgType: 'none', rarity: 'common' },
    { id: 'acc2', emoji: '👓', name: '안경', price: 30, svgType: 'glasses', rarity: 'uncommon' },
    { id: 'acc3', emoji: '🕶️', name: '선글라스', price: 50, svgType: 'sunglasses', rarity: 'uncommon' },
    { id: 'acc4', emoji: '🎀', name: '리본', price: 40, svgType: 'bow', rarity: 'uncommon', setId: 'fairy' },
    { id: 'acc5', emoji: '🎩', name: '모자', price: 60, svgType: 'hat', rarity: 'uncommon' },
    { id: 'acc6', emoji: '👒', name: '밀짚모자', price: 70, svgType: 'strawhat', rarity: 'uncommon', setId: 'pirate' },
    { id: 'acc7', emoji: '🧢', name: '캡모자', price: 50, svgType: 'cap', rarity: 'uncommon' },
    { id: 'acc8', emoji: '💍', name: '반지', price: 100, svgType: 'ring', rarity: 'rare' },
    { id: 'acc9', emoji: '📿', name: '목걸이', price: 80, svgType: 'necklace', rarity: 'rare' },
    { id: 'acc10', emoji: '👑', name: '왕관', price: 300, svgType: 'crown', rarity: 'epic', description: '왕의 권위를 상징하는 왕관', setId: 'royal' },
    { id: 'acc11', emoji: '🎭', name: '마스크', price: 150, svgType: 'mask', rarity: 'rare', setId: 'ninja' },
    { id: 'acc12', emoji: '🦋', name: '나비장식', price: 120, svgType: 'butterfly', rarity: 'rare', setId: 'mermaid' },
    { id: 'acc13', emoji: '⭐', name: '별장식', price: 100, svgType: 'star', rarity: 'rare' },
    { id: 'acc14', emoji: '🌸', name: '꽃장식', price: 90, svgType: 'flower', rarity: 'rare', setId: 'fairy' },
    { id: 'acc15', emoji: '🎧', name: '헤드폰', price: 80, svgType: 'headphones', rarity: 'rare', setId: 'rockstar' },
    { id: 'acc16', emoji: '🦴', name: '뼈다귀', price: 60, svgType: 'bone', rarity: 'uncommon' },
    { id: 'acc17', emoji: '🔮', name: '수정구슬', price: 200, special: true, svgType: 'crystal_ball', rarity: 'epic', description: '미래를 보여주는 수정구슬', setId: 'wizard' },
    { id: 'acc18', emoji: '🗡️', name: '검', price: 250, special: true, svgType: 'sword', rarity: 'epic', description: '빛나는 성검', setId: 'knight' },
    { id: 'acc19', emoji: '🏹', name: '활', price: 220, svgType: 'bow_weapon', rarity: 'epic', setId: 'pirate' },
    { id: 'acc20', emoji: '🪄', name: '마법 지팡이', price: 350, special: true, svgType: 'wand', rarity: 'legendary', description: '강력한 마법이 깃든 지팡이', setId: 'wizard' },
    { id: 'acc21', emoji: '🎸', name: '기타', price: 180, svgType: 'guitar', rarity: 'epic', setId: 'rockstar' },
    { id: 'acc22', emoji: '🎺', name: '트럼펫', price: 160, svgType: 'trumpet', rarity: 'rare' },
    { id: 'acc23', emoji: '🎨', name: '팔레트', price: 140, svgType: 'palette', rarity: 'rare' },
    { id: 'acc24', emoji: '📷', name: '카메라', price: 130, svgType: 'camera', rarity: 'rare' },
    { id: 'acc25', emoji: '🎤', name: '마이크', price: 110, svgType: 'microphone', rarity: 'rare' },
    { id: 'acc26', emoji: '🌟', name: '빛나는 별', price: 400, special: true, svgType: 'shining_star', rarity: 'legendary', description: '눈부시게 빛나는 별' },
    { id: 'acc27', emoji: '💫', name: '유성', price: 500, special: true, svgType: 'meteor', rarity: 'legendary', description: '하늘을 가르는 유성' },
    { id: 'acc28', emoji: '🌙', name: '달', price: 450, special: true, svgType: 'moon', rarity: 'legendary', description: '신비로운 달빛', setId: 'space' }
  ],

  backgrounds: [
    { id: 'bg1', color: 'from-gray-100 to-gray-200', name: '기본', price: 0, rarity: 'common' },
    { id: 'bg2', color: 'from-blue-100 to-blue-200', name: '하늘', price: 30, rarity: 'uncommon' },
    { id: 'bg3', color: 'from-green-100 to-green-200', name: '숲', price: 30, rarity: 'uncommon' },
    { id: 'bg4', color: 'from-pink-100 to-pink-200', name: '벚꽃', price: 50, rarity: 'uncommon', setId: 'fairy' },
    { id: 'bg5', color: 'from-purple-100 to-purple-200', name: '보라', price: 50, rarity: 'uncommon' },
    { id: 'bg6', color: 'from-yellow-100 to-orange-200', name: '노을', price: 80, rarity: 'rare' },
    { id: 'bg7', color: 'from-cyan-200 to-blue-300', name: '바다', price: 100, rarity: 'rare', setId: 'mermaid' },
    { id: 'bg8', color: 'from-indigo-200 to-purple-300', name: '우주', price: 150, rarity: 'rare', setId: 'space' },
    { id: 'bg9', color: 'from-amber-200 via-yellow-200 to-amber-300', name: '황금', price: 200, rarity: 'epic', setId: 'royal' },
    { id: 'bg10', color: 'from-rose-200 via-pink-200 to-fuchsia-200', name: '무지개', price: 300, rarity: 'epic' },
    { id: 'bg11', color: 'from-slate-800 via-slate-700 to-slate-900', name: '밤하늘', price: 180, rarity: 'epic', setId: 'vampire' },
    { id: 'bg12', color: 'from-emerald-300 via-teal-200 to-cyan-300', name: '오로라', price: 250, special: true, rarity: 'legendary', description: '신비로운 오로라' },
    { id: 'bg13', color: 'from-red-400 via-orange-300 to-yellow-300', name: '불꽃', price: 220, special: true, rarity: 'epic', setId: 'dragon' },
    { id: 'bg14', color: 'from-violet-400 via-purple-300 to-fuchsia-400', name: '은하수', price: 350, special: true, rarity: 'legendary', description: '빛나는 은하수', setId: 'wizard' },
    { id: 'bg15', color: 'from-rose-300 via-red-200 to-pink-300', name: '러브', price: 150, rarity: 'rare' }
  ],

  frames: [
    { id: 'frame1', style: 'ring-2 ring-gray-300', name: '없음', price: 0, rarity: 'common' },
    { id: 'frame2', style: 'ring-4 ring-blue-400', name: '파랑', price: 40, rarity: 'uncommon' },
    { id: 'frame3', style: 'ring-4 ring-emerald-400', name: '초록', price: 40, rarity: 'uncommon' },
    { id: 'frame4', style: 'ring-4 ring-purple-400', name: '보라', price: 60, rarity: 'uncommon' },
    { id: 'frame5', style: 'ring-4 ring-amber-400', name: '금색', price: 100, rarity: 'rare' },
    { id: 'frame6', style: 'ring-4 ring-rose-400 ring-offset-2', name: '로즈', price: 120, rarity: 'rare' },
    { id: 'frame7', style: 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-cyan-100', name: '빛나는', price: 150, rarity: 'rare' },
    { id: 'frame8', style: 'ring-[6px] ring-amber-500 shadow-lg shadow-amber-300', name: '황금빛', price: 200, rarity: 'epic', setId: 'knight' },
    { id: 'frame9', style: 'ring-4 ring-pink-500 ring-offset-4 ring-offset-pink-100', name: '핑크하트', price: 180, rarity: 'epic' },
    { id: 'frame10', style: 'ring-[6px] ring-gradient-to-r from-purple-500 to-pink-500', name: '그라데이션', price: 280, special: true, rarity: 'legendary', description: '화려한 그라데이션 테두리' },
    { id: 'frame11', style: 'ring-4 ring-slate-600 ring-offset-2 shadow-xl', name: '다크', price: 160, rarity: 'epic', setId: 'vampire' },
    { id: 'frame12', style: 'ring-[8px] ring-amber-400 ring-offset-4 ring-offset-amber-100 shadow-2xl shadow-amber-400', name: '레전더리', price: 500, special: true, rarity: 'legendary', description: '전설의 황금 테두리', setId: 'royal' }
  ]
};

// ──────────────────────────────────────────
// 🏠 마이룸 아이템 (희귀도 추가)
// ──────────────────────────────────────────
export const ROOM_ITEMS = {
  furniture: [
    { id: 'furn1', emoji: '🛋️', name: '기본 소파', price: 0, rarity: 'common' },
    { id: 'furn2', emoji: '🛏️', name: '침대', price: 100, rarity: 'rare' },
    { id: 'furn3', emoji: '🪑', name: '의자', price: 50, rarity: 'uncommon' },
    { id: 'furn4', emoji: '🗄️', name: '서랍장', price: 80, rarity: 'rare' },
    { id: 'furn5', emoji: '📚', name: '책장', price: 120, rarity: 'rare' },
    { id: 'furn6', emoji: '🖥️', name: '컴퓨터 책상', price: 200, rarity: 'epic' },
    { id: 'furn7', emoji: '🎮', name: '게임 의자', price: 300, rarity: 'epic' },
    { id: 'furn8', emoji: '🛋️', name: '럭셔리 소파', price: 500, rarity: 'legendary', description: '최고급 가죽 소파' },
    { id: 'furn9', emoji: '🏰', name: '캐노피 침대', price: 800, rarity: 'legendary', description: '왕궁의 침대' },
    { id: 'furn10', emoji: '👑', name: '왕좌', price: 1500, rarity: 'mythic', description: '왕의 황금 왕좌' }
  ],
  electronics: [
    { id: 'elec1', emoji: '📺', name: '기본 TV', price: 0, rarity: 'common' },
    { id: 'elec2', emoji: '🖥️', name: '모니터', price: 100, rarity: 'rare' },
    { id: 'elec3', emoji: '🎮', name: '게임기', price: 200, rarity: 'epic' },
    { id: 'elec4', emoji: '🔊', name: '스피커', price: 150, rarity: 'rare' },
    { id: 'elec5', emoji: '❄️', name: '에어컨', price: 300, rarity: 'epic' },
    { id: 'elec6', emoji: '📺', name: '대형 TV', price: 500, rarity: 'legendary' },
    { id: 'elec7', emoji: '🎬', name: '홈시어터', price: 800, rarity: 'legendary', description: '영화관급 홈시어터' },
    { id: 'elec8', emoji: '🤖', name: 'AI 로봇', price: 1000, rarity: 'mythic', description: '최첨단 AI 비서 로봇' },
    { id: 'elec9', emoji: '🕹️', name: 'VR 장비', price: 1200, rarity: 'mythic', description: '완전 몰입형 VR 장비' }
  ],
  vehicles: [
    { id: 'car1', emoji: '🚗', name: '기본 자동차', price: 500, rarity: 'legendary' },
    { id: 'car2', emoji: '🚙', name: 'SUV', price: 800, rarity: 'legendary' },
    { id: 'car3', emoji: '🏎️', name: '스포츠카', price: 1500, rarity: 'legendary', description: '번개처럼 빠른 스포츠카' },
    { id: 'car4', emoji: '🚐', name: '캠핑카', price: 1200, rarity: 'legendary' },
    { id: 'car5', emoji: '🏍️', name: '오토바이', price: 600, rarity: 'legendary' },
    { id: 'car6', emoji: '🚁', name: '헬리콥터', price: 3000, rarity: 'mythic', description: '하늘을 나는 헬리콥터' },
    { id: 'car7', emoji: '🛥️', name: '요트', price: 2500, rarity: 'mythic', description: '바다 위의 럭셔리' },
    { id: 'car8', emoji: '✈️', name: '전용기', price: 5000, rarity: 'mythic', description: 'VIP 전용 제트기' },
    { id: 'car9', emoji: '🚀', name: '우주선', price: 10000, rarity: 'mythic', description: '성간 여행이 가능한 우주선' }
  ],
  pets: [
    { id: 'pet1', emoji: '🐕', name: '강아지', price: 200, rarity: 'epic' },
    { id: 'pet2', emoji: '🐈', name: '고양이', price: 200, rarity: 'epic' },
    { id: 'pet3', emoji: '🐹', name: '햄스터', price: 100, rarity: 'rare' },
    { id: 'pet4', emoji: '🐰', name: '토끼', price: 150, rarity: 'rare' },
    { id: 'pet5', emoji: '🦜', name: '앵무새', price: 250, rarity: 'epic' },
    { id: 'pet6', emoji: '🐠', name: '열대어', price: 100, rarity: 'rare' },
    { id: 'pet7', emoji: '🦊', name: '여우', price: 500, rarity: 'legendary', description: '영리한 반려 여우' },
    { id: 'pet8', emoji: '🦄', name: '유니콘', price: 2000, rarity: 'mythic', description: '전설의 유니콘' },
    { id: 'pet9', emoji: '🐉', name: '드래곤', price: 5000, rarity: 'mythic', description: '충성스러운 아기 드래곤' },
    { id: 'pet10', emoji: '🦅', name: '독수리', price: 800, rarity: 'legendary', description: '하늘의 제왕' }
  ],
  wallpaper: [
    { id: 'wall1', color: '#f5f5f5, #e8e8e8', name: '기본', price: 0, rarity: 'common' },
    { id: 'wall2', color: '#e0f2fe, #bae6fd', name: '하늘색', price: 50, rarity: 'uncommon' },
    { id: 'wall3', color: '#fce7f3, #fbcfe8', name: '핑크', price: 50, rarity: 'uncommon' },
    { id: 'wall4', color: '#d1fae5, #a7f3d0', name: '민트', price: 50, rarity: 'uncommon' },
    { id: 'wall5', color: '#fef3c7, #fde68a', name: '크림', price: 60, rarity: 'uncommon' },
    { id: 'wall6', color: '#c4b5fd, #a5b4fc', name: '우주', price: 150, rarity: 'epic' },
    { id: 'wall7', color: '#fecdd3, #f9a8d4, #d8b4fe', name: '오로라', price: 200, rarity: 'epic', description: '오로라빛 벽지' },
    { id: 'wall8', color: '#fcd34d, #fef08a, #fcd34d', name: '황금', price: 300, rarity: 'legendary', description: '눈부신 황금 벽지' }
  ],
  decorations: [
    { id: 'deco1', emoji: '🖼️', name: '그림', price: 50, rarity: 'uncommon' },
    { id: 'deco2', emoji: '🪴', name: '화분', price: 30, rarity: 'uncommon' },
    { id: 'deco3', emoji: '🏆', name: '트로피', price: 100, rarity: 'rare' },
    { id: 'deco4', emoji: '🎪', name: '텐트', price: 150, rarity: 'rare' },
    { id: 'deco5', emoji: '🎄', name: '크리스마스 트리', price: 200, rarity: 'epic', seasonal: 'winter' },
    { id: 'deco6', emoji: '⛲', name: '분수대', price: 500, rarity: 'legendary', description: '아름다운 분수대' },
    { id: 'deco7', emoji: '🗽', name: '조각상', price: 400, rarity: 'legendary' },
    { id: 'deco8', emoji: '🌈', name: '무지개 장식', price: 300, rarity: 'epic' },
    { id: 'deco9', emoji: '💎', name: '보석 장식', price: 800, rarity: 'legendary', description: '빛나는 보석 장식' },
    { id: 'deco10', emoji: '🏰', name: '미니 성', price: 1000, rarity: 'mythic', description: '정교한 미니어처 성' }
  ]
};

// ──────────────────────────────────────────
// 🎯 세트 시스템 (테마별 컬렉션)
// ──────────────────────────────────────────
export const ITEM_SETS = {
  space: {
    id: 'space', name: '우주 탐험대', icon: '🚀',
    description: '광활한 우주를 탐험하는 용감한 탐험가 세트',
    items: ['hair15', 'cloth15', 'acc28', 'bg8'],
    bonusPoints: 200, rarity: 'legendary'
  },
  wizard: {
    id: 'wizard', name: '대마법사', icon: '🧙',
    description: '신비로운 마법의 세계를 지배하는 마법사 세트',
    items: ['cloth10', 'acc20', 'acc17', 'bg14'],
    bonusPoints: 300, rarity: 'legendary'
  },
  santa: {
    id: 'santa', name: '크리스마스 산타', icon: '🎅',
    description: '메리 크리스마스! 산타가 되어보세요',
    items: ['hair12', 'cloth11'],
    bonusPoints: 100, rarity: 'rare', seasonal: 'winter'
  },
  royal: {
    id: 'royal', name: '왕족', icon: '👑',
    description: '고귀한 왕족의 위엄을 느껴보세요',
    items: ['cloth9', 'acc10', 'frame12', 'bg9'],
    bonusPoints: 500, rarity: 'legendary'
  },
  rockstar: {
    id: 'rockstar', name: '록스타', icon: '🎸',
    description: '무대 위의 주인공! 록스타 세트',
    items: ['hair11', 'cloth13', 'acc21', 'acc15'],
    bonusPoints: 150, rarity: 'epic'
  },
  ninja: {
    id: 'ninja', name: '그림자 닌자', icon: '🥷',
    description: '어둠 속에서 움직이는 닌자 세트',
    items: ['cloth14', 'acc11', 'acc18'],
    bonusPoints: 200, rarity: 'epic'
  },
  pirate: {
    id: 'pirate', name: '대해적', icon: '🏴‍☠️',
    description: '바다의 왕! 해적 세트',
    items: ['cloth19', 'acc6', 'acc19'],
    bonusPoints: 150, rarity: 'epic'
  },
  fairy: {
    id: 'fairy', name: '숲의 요정', icon: '🧚',
    description: '반짝이는 날개의 아름다운 요정 세트',
    items: ['cloth17', 'acc14', 'acc4', 'bg4'],
    bonusPoints: 200, rarity: 'epic'
  },
  knight: {
    id: 'knight', name: '용감한 기사', icon: '⚔️',
    description: '정의를 위해 싸우는 기사 세트',
    items: ['cloth20', 'acc18', 'frame8'],
    bonusPoints: 300, rarity: 'legendary'
  },
  vampire: {
    id: 'vampire', name: '다크 뱀파이어', icon: '🧛',
    description: '밤의 지배자, 뱀파이어 세트',
    items: ['cloth16', 'bg11', 'frame11'],
    bonusPoints: 200, rarity: 'epic', seasonal: 'halloween'
  },
  mermaid: {
    id: 'mermaid', name: '바다의 인어', icon: '🧜',
    description: '깊은 바다 속 아름다운 인어 세트',
    items: ['hair13', 'bg7', 'acc12'],
    bonusPoints: 200, rarity: 'epic'
  },
  dragon: {
    id: 'dragon', name: '드래곤 마스터', icon: '🐉',
    description: '용을 다스리는 전설의 드래곤 마스터',
    items: ['face30', 'bg13', 'frame12'],
    bonusPoints: 500, rarity: 'mythic'
  }
};

// ──────────────────────────────────────────
// 🏆 업적 전용 아이템 (구매 불가, 마일스톤 해제)
// ──────────────────────────────────────────
export const ACHIEVEMENT_ITEMS = [
  {
    id: 'ach_first_writing', name: '작가의 첫걸음', emoji: '✏️',
    description: '첫 번째 글을 작성하세요',
    type: 'accessory', svgType: 'pen', rarity: 'rare',
    condition: { type: 'writings_count', value: 1 }
  },
  {
    id: 'ach_10_writings', name: '초보 작가의 펜', emoji: '🖊️',
    description: '10편의 글을 작성하세요',
    type: 'accessory', svgType: 'fancy_pen', rarity: 'epic',
    condition: { type: 'writings_count', value: 10 }
  },
  {
    id: 'ach_50_writings_frame', name: '달인 작가의 테두리', emoji: '📖',
    description: '50편의 글을 작성하세요',
    type: 'frame', style: 'ring-[6px] ring-emerald-500 shadow-lg shadow-emerald-300', rarity: 'legendary',
    condition: { type: 'writings_count', value: 50 }
  },
  {
    id: 'ach_100_writings_bg', name: '전설의 작가', emoji: '👑',
    description: '100편의 글을 작성하세요',
    type: 'background', color: 'from-amber-300 via-yellow-200 to-amber-400', rarity: 'mythic',
    condition: { type: 'writings_count', value: 100 }
  },
  {
    id: 'ach_perfect_score', name: '완벽한 글', emoji: '💯',
    description: '만점(100점)을 받으세요',
    type: 'frame', style: 'ring-[6px] ring-rose-500 ring-offset-2 shadow-lg shadow-rose-300', rarity: 'legendary',
    condition: { type: 'perfect_score', value: 100 }
  },
  {
    id: 'ach_7_streak', name: '불꽃 스트릭', emoji: '🔥',
    description: '7일 연속 글을 작성하세요',
    type: 'background', color: 'from-orange-400 via-red-400 to-yellow-300', rarity: 'epic',
    condition: { type: 'streak', value: 7 }
  },
  {
    id: 'ach_30_streak', name: '전설의 스트릭', emoji: '⚡',
    description: '30일 연속 글을 작성하세요',
    type: 'frame', style: 'ring-[8px] ring-orange-500 shadow-2xl shadow-orange-400', rarity: 'mythic',
    condition: { type: 'streak', value: 30 }
  },
  {
    id: 'ach_first_90', name: '우등생 뱃지', emoji: '🏅',
    description: '90점 이상을 받으세요',
    type: 'accessory', svgType: 'medal', rarity: 'rare',
    condition: { type: 'score_above', value: 90 }
  }
];

// 업적 조건 체크 헬퍼
export function checkAchievementCondition(condition, stats) {
  if (!stats) return false;
  switch (condition.type) {
    case 'writings_count':
      return (stats.totalWritings || 0) >= condition.value;
    case 'perfect_score':
      return (stats.highestScore || 0) >= condition.value;
    case 'streak':
      return (stats.maxStreak || 0) >= condition.value;
    case 'score_above':
      return (stats.highestScore || 0) >= condition.value;
    default:
      return false;
  }
}

// ──────────────────────────────────────────
// 📋 카테고리 & 기본값
// ──────────────────────────────────────────
export const SHOP_CATEGORIES = {
  avatar: {
    name: '아바타',
    icon: '👤',
    subcategories: ['faces', 'hair', 'hairColor', 'clothes', 'accessories', 'backgrounds', 'frames']
  },
  room: {
    name: '마이룸',
    icon: '🏠',
    subcategories: ['furniture', 'electronics', 'vehicles', 'pets', 'wallpaper', 'decorations']
  }
};

export const CATEGORY_NAMES = {
  faces: '얼굴',
  hair: '헤어스타일',
  hairColor: '염색',
  clothes: '의상',
  accessories: '악세서리',
  backgrounds: '배경',
  frames: '테두리',
  furniture: '가구',
  electronics: '가전',
  vehicles: '차량',
  pets: '펫',
  wallpaper: '벽지',
  decorations: '장식'
};

export const CATEGORY_ICONS = {
  faces: '😊', hair: '💇', hairColor: '🎨', clothes: '👔',
  accessories: '💍', backgrounds: '🌅', frames: '🖼️',
  furniture: '🛋️', electronics: '📺', vehicles: '🚗',
  pets: '🐾', wallpaper: '🧱', decorations: '✨'
};

// 카테고리 매핑 상수
export const AVATAR_CATEGORY_MAP = {
  faces: 'face', hair: 'hair', hairColor: 'hairColor',
  clothes: 'clothes', accessories: 'accessory',
  backgrounds: 'background', frames: 'frame'
};
export const ROOM_CATEGORY_MAP = {
  furniture: 'furniture', electronics: 'electronics',
  vehicles: 'vehicle', pets: 'pet', wallpaper: 'wallpaper'
};

export const DEFAULT_OWNED_ITEMS = ['face1', 'bg1', 'frame1', 'hair1', 'hc1', 'cloth1', 'acc1', 'furn1', 'elec1', 'wall1'];

export const DEFAULT_EQUIPPED_ITEMS = {
  face: 'face1', hair: 'hair1', hairColor: 'hc1',
  clothes: 'cloth1', accessory: 'acc1',
  background: 'bg1', frame: 'frame1'
};

export const DEFAULT_ROOM_ITEMS = {
  furniture: 'furn1', electronics: 'elec1',
  vehicle: null, pet: null, wallpaper: 'wall1', decorations: []
};

// ──────────────────────────────────────────
// 🔧 헬퍼 함수
// ──────────────────────────────────────────
export function findAvatarItem(category, itemId) {
  const items = AVATAR_ITEMS[category];
  if (!items) return null;
  return items.find(item => item.id === itemId);
}

export function findRoomItem(category, itemId) {
  const items = ROOM_ITEMS[category];
  if (!items) return null;
  return items.find(item => item.id === itemId);
}

// 아이템 ID로 아이템 검색 (모든 카테고리)
export function findItemById(itemId) {
  for (const cat of Object.keys(AVATAR_ITEMS)) {
    const found = AVATAR_ITEMS[cat].find(i => i.id === itemId);
    if (found) return { ...found, _category: cat, _type: 'avatar' };
  }
  for (const cat of Object.keys(ROOM_ITEMS)) {
    const found = ROOM_ITEMS[cat].find(i => i.id === itemId);
    if (found) return { ...found, _category: cat, _type: 'room' };
  }
  return ACHIEVEMENT_ITEMS.find(i => i.id === itemId) || null;
}

// 세트 완성도 체크
export function getSetProgress(setId, ownedItems) {
  const set = ITEM_SETS[setId];
  if (!set) return { owned: 0, total: 0, complete: false, items: [] };
  const owned = set.items.filter(id => ownedItems.includes(id));
  return {
    owned: owned.length,
    total: set.items.length,
    complete: owned.length === set.items.length,
    items: set.items.map(id => ({ id, owned: ownedItems.includes(id) }))
  };
}

// 전체 컬렉션 통계
export function getCollectionStats(ownedItems) {
  const totalAvatar = Object.values(AVATAR_ITEMS).reduce((sum, arr) => sum + arr.length, 0);
  const totalRoom = Object.values(ROOM_ITEMS).reduce((sum, arr) => sum + arr.length, 0);
  const total = totalAvatar + totalRoom;

  let ownedAvatar = 0;
  let ownedRoom = 0;
  for (const cat of Object.values(AVATAR_ITEMS)) {
    ownedAvatar += cat.filter(i => ownedItems.includes(i.id)).length;
  }
  for (const cat of Object.values(ROOM_ITEMS)) {
    ownedRoom += cat.filter(i => ownedItems.includes(i.id)).length;
  }

  // 희귀도별 통계
  const byRarity = {};
  const allItems = [...Object.values(AVATAR_ITEMS).flat(), ...Object.values(ROOM_ITEMS).flat()];
  for (const item of allItems) {
    const r = item.rarity || 'common';
    if (!byRarity[r]) byRarity[r] = { total: 0, owned: 0 };
    byRarity[r].total++;
    if (ownedItems.includes(item.id)) byRarity[r].owned++;
  }

  // 세트 완성 수
  const completedSets = Object.keys(ITEM_SETS).filter(
    setId => getSetProgress(setId, ownedItems).complete
  ).length;

  return {
    total, ownedAvatar, ownedRoom,
    owned: ownedAvatar + ownedRoom,
    totalAvatar, totalRoom,
    byRarity, completedSets,
    totalSets: Object.keys(ITEM_SETS).length
  };
}
