// ============================================
// 🛒 상점 아이템 데이터 - StudentDashboard에서 분리
// 번들 크기 최적화: 동적 import 가능
// ============================================

// 아바타 아이템 정의 (SVG 실사 스타일 지원)
export const AVATAR_ITEMS = {
  // 캐릭터 얼굴 - SVG 실사 스타일 (사람/동물/이모지)
  faces: [
    // 남자 캐릭터
    { id: 'face1', emoji: '👦', name: '남자 (기본)', price: 0, svgType: 'human', expression: 'happy', skinColor: '#FFD5B8', gender: 'male' },
    { id: 'face2', emoji: '😎', name: '남자 (멋쟁이)', price: 50, svgType: 'human', expression: 'cool', skinColor: '#FFD5B8', gender: 'male' },
    { id: 'face3', emoji: '🤓', name: '남자 (똒똒이)', price: 50, svgType: 'human', expression: 'smart', skinColor: '#FFD5B8', gender: 'male' },
    // 여자 캐릭터
    { id: 'face4', emoji: '👧', name: '여자 (기본)', price: 0, svgType: 'human', expression: 'happy', skinColor: '#FFE4D6', gender: 'female' },
    { id: 'face5', emoji: '😊', name: '여자 (상냥)', price: 50, svgType: 'human', expression: 'angel', skinColor: '#FFE4D6', gender: 'female' },
    { id: 'face6', emoji: '🥰', name: '여자 (사랑스러운)', price: 80, svgType: 'human', expression: 'happy', skinColor: '#FFF0E6', gender: 'female' },
    // 피부색 변형
    { id: 'face7', emoji: '👶', name: '아기 얼굴', price: 100, svgType: 'human', expression: 'surprised', skinColor: '#FFE4D6', gender: 'neutral' },
    { id: 'face8', emoji: '😇', name: '천사', price: 100, svgType: 'human', expression: 'angel', skinColor: '#FFF0E6', gender: 'neutral' },
    // 동물 캐릭터 (헤어/의상 적용 안됨)
    { id: 'face10', emoji: '🦊', name: '여우', price: 100, svgType: 'animal', animalType: 'fox' },
    { id: 'face11', emoji: '🐰', name: '토끼', price: 100, svgType: 'animal', animalType: 'rabbit' },
    { id: 'face12', emoji: '🐻', name: '곰돌이', price: 150, svgType: 'animal', animalType: 'bear' },
    { id: 'face13', emoji: '🦁', name: '사자왕', price: 200, svgType: 'animal', animalType: 'lion' },
    { id: 'face14', emoji: '🐱', name: '고양이', price: 80, svgType: 'animal', animalType: 'cat' },
    { id: 'face15', emoji: '🐶', name: '강아지', price: 80, svgType: 'animal', animalType: 'dog' },
    { id: 'face16', emoji: '🐼', name: '판다', price: 150, svgType: 'animal', animalType: 'panda' },
    { id: 'face17', emoji: '🐯', name: '호랑이', price: 180, svgType: 'animal', animalType: 'tiger' },
    // 이모지 캐릭터 (헤어/의상 적용 안됨)
    { id: 'face20', emoji: '🦋', name: '나비', price: 200, svgType: 'animal', animalType: 'butterfly' },
    { id: 'face21', emoji: '🐸', name: '개구리', price: 120, svgType: 'animal', animalType: 'frog' },
    { id: 'face22', emoji: '🦢', name: '백조', price: 220, svgType: 'animal', animalType: 'swan' },
    { id: 'face23', emoji: '🐠', name: '열대어', price: 180, svgType: 'animal', animalType: 'tropicalfish' },
    { id: 'face24', emoji: '🦈', name: '상어', price: 320, svgType: 'animal', animalType: 'shark' },
    { id: 'face25', emoji: '🐙', name: '문어', price: 250, svgType: 'animal', animalType: 'octopus' },
    // 스페셜 캐릭터
    { id: 'face30', emoji: '🐲', name: '용', price: 300, svgType: 'animal', animalType: 'dragon', special: true },
    { id: 'face31', emoji: '🦄', name: '유니콘', price: 500, svgType: 'animal', animalType: 'unicorn', special: true },
    { id: 'face32', emoji: '👻', name: '유령', price: 400, svgType: 'animal', animalType: 'ghost', special: true },
    { id: 'face33', emoji: '👽', name: '외계인', price: 600, svgType: 'animal', animalType: 'alien', special: true },
    { id: 'face34', emoji: '🤖', name: '로봇', price: 800, svgType: 'animal', animalType: 'robot', special: true },
    { id: 'face35', emoji: '🎃', name: '호박', price: 450, svgType: 'animal', animalType: 'pumpkin', special: true }
  ],
  // 머리 스타일 (확장) - svgStyle 추가
  hair: [
    { id: 'hair1', emoji: '👤', name: '기본', price: 0, svgStyle: 'default' },
    { id: 'hair2', emoji: '💇', name: '단발', price: 30, svgStyle: 'short' },
    { id: 'hair3', emoji: '💇‍♀️', name: '긴머리', price: 30, svgStyle: 'long' },
    { id: 'hair4', emoji: '👨‍🦱', name: '곱슬머리', price: 50, svgStyle: 'curly' },
    { id: 'hair5', emoji: '👩‍🦰', name: '웨이브', price: 50, svgStyle: 'wave' },
    { id: 'hair6', emoji: '👨‍🦲', name: '스포츠컷', price: 40, svgStyle: 'sportscut' },
    { id: 'hair7', emoji: '🧑‍🦳', name: '은발', price: 100, svgStyle: 'default', defaultColor: '#C0C0C0' },
    { id: 'hair8', emoji: '👸', name: '공주머리', price: 150, svgStyle: 'princess' },
    { id: 'hair9', emoji: '🦸', name: '히어로컷', price: 200, svgStyle: 'herocut' },
    { id: 'hair10', emoji: '🧝', name: '엘프머리', price: 300, svgStyle: 'elf' },
    { id: 'hair11', emoji: '👩‍🎤', name: '락스타', price: 180, svgStyle: 'rockstar' },
    { id: 'hair12', emoji: '🧑‍🎄', name: '산타머리', price: 250, special: true, svgStyle: 'santa' },
    { id: 'hair13', emoji: '🧜', name: '인어머리', price: 350, special: true, svgStyle: 'mermaid' },
    { id: 'hair14', emoji: '🎎', name: '전통머리', price: 200, svgStyle: 'bun' },
    { id: 'hair15', emoji: '👩‍🚀', name: '우주비행사', price: 400, special: true, svgStyle: 'astronaut' }
  ],
  // 머리 색상
  hairColor: [
    { id: 'hc1', color: '#1a1a1a', name: '검정', price: 0 },
    { id: 'hc2', color: '#4a3728', name: '갈색', price: 20 },
    { id: 'hc3', color: '#ffd700', name: '금발', price: 50 },
    { id: 'hc4', color: '#ff6b6b', name: '빨강', price: 80 },
    { id: 'hc5', color: '#4ecdc4', name: '민트', price: 100 },
    { id: 'hc6', color: '#a855f7', name: '보라', price: 100 },
    { id: 'hc7', color: '#3b82f6', name: '파랑', price: 100 },
    { id: 'hc8', color: '#ec4899', name: '핑크', price: 120 },
    { id: 'hc9', color: '#C0C0C0', name: '은색', price: 100 },
    { id: 'hc10', color: '#F5F5F5', name: '백발', price: 150 },
    { id: 'hc11', color: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)', name: '그라데이션', price: 200 },
    { id: 'hc12', color: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)', name: '레인보우', price: 500 }
  ],
  // 옷/의상 (확장) - svgType과 color 추가
  clothes: [
    { id: 'cloth1', emoji: '👕', name: '기본 티셔츠', price: 0, svgType: 'tshirt', color: '#4A90D9' },
    { id: 'cloth2', emoji: '👔', name: '셔츠', price: 50, svgType: 'shirt', color: '#FFFFFF' },
    { id: 'cloth3', emoji: '🎽', name: '운동복', price: 40, svgType: 'sportswear', color: '#FF6B6B' },
    { id: 'cloth4', emoji: '👗', name: '원피스', price: 80, svgType: 'dress', color: '#FF69B4' },
    { id: 'cloth5', emoji: '🧥', name: '코트', price: 100, svgType: 'coat', color: '#8B4513' },
    { id: 'cloth6', emoji: '🥋', name: '도복', price: 120, svgType: 'taekwondo', color: '#FFFFFF' },
    { id: 'cloth7', emoji: '👘', name: '한복', price: 200, svgType: 'hanbok', color: '#E91E63' },
    { id: 'cloth8', emoji: '🦸', name: '히어로 슈트', price: 300, svgType: 'superhero', color: '#1E3A8A' },
    { id: 'cloth9', emoji: '👑', name: '왕족 의상', price: 500, svgType: 'princess', color: '#FFD700' },
    { id: 'cloth10', emoji: '🧙', name: '마법사 로브', price: 400, svgType: 'wizard', color: '#4B0082' },
    { id: 'cloth11', emoji: '🎅', name: '산타복', price: 150, svgType: 'santasuit', color: '#DC2626' },
    { id: 'cloth12', emoji: '🤵', name: '턱시도', price: 250, svgType: 'tuxedo', color: '#1a1a1a' },
    { id: 'cloth13', emoji: '👩‍🎤', name: '록스타 재킷', price: 220, svgType: 'rockstarjacket', color: '#1a1a1a' },
    { id: 'cloth14', emoji: '🥷', name: '닌자복', price: 280, svgType: 'ninja', color: '#1a1a1a' },
    { id: 'cloth15', emoji: '👨‍🚀', name: '우주복', price: 450, special: true, svgType: 'spacesuit', color: '#F5F5F5' },
    { id: 'cloth16', emoji: '🧛', name: '뱀파이어 망토', price: 350, special: true, svgType: 'robe', color: '#800020' },
    { id: 'cloth17', emoji: '🧚', name: '요정 드레스', price: 380, special: true, svgType: 'princess', color: '#98FB98' },
    { id: 'cloth18', emoji: '🎭', name: '오페라 의상', price: 320, svgType: 'dress', color: '#8B0000' },
    { id: 'cloth19', emoji: '🏴‍☠️', name: '해적 의상', price: 270, svgType: 'pirate', color: '#654321' },
    { id: 'cloth20', emoji: '⚔️', name: '기사 갑옷', price: 550, special: true, svgType: 'armor', color: '#C0C0C0' }
  ],
  // 소품/악세서리 (확장) - svgType 추가
  accessories: [
    { id: 'acc1', emoji: '❌', name: '없음', price: 0, svgType: 'none' },
    { id: 'acc2', emoji: '👓', name: '안경', price: 30, svgType: 'glasses' },
    { id: 'acc3', emoji: '🕶️', name: '선글라스', price: 50, svgType: 'sunglasses' },
    { id: 'acc4', emoji: '🎀', name: '리본', price: 40, svgType: 'bow' },
    { id: 'acc5', emoji: '🎩', name: '모자', price: 60, svgType: 'hat' },
    { id: 'acc6', emoji: '👒', name: '밀짚모자', price: 70, svgType: 'strawhat' },
    { id: 'acc7', emoji: '🧢', name: '캡모자', price: 50, svgType: 'cap' },
    { id: 'acc8', emoji: '💍', name: '반지', price: 100, svgType: 'ring' },
    { id: 'acc9', emoji: '📿', name: '목걸이', price: 80, svgType: 'necklace' },
    { id: 'acc10', emoji: '👑', name: '왕관', price: 300, svgType: 'crown' },
    { id: 'acc11', emoji: '🎭', name: '마스크', price: 150, svgType: 'mask' },
    { id: 'acc12', emoji: '🦋', name: '나비장식', price: 120, svgType: 'butterfly' },
    { id: 'acc13', emoji: '⭐', name: '별장식', price: 100, svgType: 'star' },
    { id: 'acc14', emoji: '🌸', name: '꽃장식', price: 90, svgType: 'flower' },
    { id: 'acc15', emoji: '🎧', name: '헤드폰', price: 80, svgType: 'headphones' },
    { id: 'acc16', emoji: '🦴', name: '뼈다귀', price: 60, svgType: 'bone' },
    { id: 'acc17', emoji: '🔮', name: '수정구슬', price: 200, special: true, svgType: 'crystal_ball' },
    { id: 'acc18', emoji: '🗡️', name: '검', price: 250, special: true, svgType: 'sword' },
    { id: 'acc19', emoji: '🏹', name: '활', price: 220, svgType: 'bow_weapon' },
    { id: 'acc20', emoji: '🪄', name: '마법 지팡이', price: 350, special: true, svgType: 'wand' },
    { id: 'acc21', emoji: '🎸', name: '기타', price: 180, svgType: 'guitar' },
    { id: 'acc22', emoji: '🎺', name: '트럼펫', price: 160, svgType: 'trumpet' },
    { id: 'acc23', emoji: '🎨', name: '팔레트', price: 140, svgType: 'palette' },
    { id: 'acc24', emoji: '📷', name: '카메라', price: 130, svgType: 'camera' },
    { id: 'acc25', emoji: '🎤', name: '마이크', price: 110, svgType: 'microphone' },
    { id: 'acc26', emoji: '🌟', name: '빛나는 별', price: 400, special: true, svgType: 'shining_star' },
    { id: 'acc27', emoji: '💫', name: '유성', price: 500, special: true, svgType: 'meteor' },
    { id: 'acc28', emoji: '🌙', name: '달', price: 450, special: true, svgType: 'moon' }
  ],
  // 배경 (확장)
  backgrounds: [
    { id: 'bg1', color: 'from-gray-100 to-gray-200', name: '기본', price: 0 },
    { id: 'bg2', color: 'from-blue-100 to-blue-200', name: '하늘', price: 30 },
    { id: 'bg3', color: 'from-green-100 to-green-200', name: '숲', price: 30 },
    { id: 'bg4', color: 'from-pink-100 to-pink-200', name: '벚꽃', price: 50 },
    { id: 'bg5', color: 'from-purple-100 to-purple-200', name: '보라', price: 50 },
    { id: 'bg6', color: 'from-yellow-100 to-orange-200', name: '노을', price: 80 },
    { id: 'bg7', color: 'from-cyan-200 to-blue-300', name: '바다', price: 100 },
    { id: 'bg8', color: 'from-indigo-200 to-purple-300', name: '우주', price: 150 },
    { id: 'bg9', color: 'from-amber-200 via-yellow-200 to-amber-300', name: '황금', price: 200 },
    { id: 'bg10', color: 'from-rose-200 via-pink-200 to-fuchsia-200', name: '무지개', price: 300 },
    { id: 'bg11', color: 'from-slate-800 via-slate-700 to-slate-900', name: '밤하늘', price: 180 },
    { id: 'bg12', color: 'from-emerald-300 via-teal-200 to-cyan-300', name: '오로라', price: 250, special: true },
    { id: 'bg13', color: 'from-red-400 via-orange-300 to-yellow-300', name: '불꽃', price: 220, special: true },
    { id: 'bg14', color: 'from-violet-400 via-purple-300 to-fuchsia-400', name: '은하수', price: 350, special: true },
    { id: 'bg15', color: 'from-rose-300 via-red-200 to-pink-300', name: '러브', price: 150 }
  ],
  // 테두리 (확장)
  frames: [
    { id: 'frame1', style: 'ring-2 ring-gray-300', name: '없음', price: 0 },
    { id: 'frame2', style: 'ring-4 ring-blue-400', name: '파랑', price: 40 },
    { id: 'frame3', style: 'ring-4 ring-emerald-400', name: '초록', price: 40 },
    { id: 'frame4', style: 'ring-4 ring-purple-400', name: '보라', price: 60 },
    { id: 'frame5', style: 'ring-4 ring-amber-400', name: '금색', price: 100 },
    { id: 'frame6', style: 'ring-4 ring-rose-400 ring-offset-2', name: '로즈', price: 120 },
    { id: 'frame7', style: 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-cyan-100', name: '빛나는', price: 150 },
    { id: 'frame8', style: 'ring-[6px] ring-amber-500 shadow-lg shadow-amber-300', name: '황금빛', price: 200 },
    { id: 'frame9', style: 'ring-4 ring-pink-500 ring-offset-4 ring-offset-pink-100', name: '핑크하트', price: 180 },
    { id: 'frame10', style: 'ring-[6px] ring-gradient-to-r from-purple-500 to-pink-500', name: '그라데이션', price: 280, special: true },
    { id: 'frame11', style: 'ring-4 ring-slate-600 ring-offset-2 shadow-xl', name: '다크', price: 160 },
    { id: 'frame12', style: 'ring-[8px] ring-amber-400 ring-offset-4 ring-offset-amber-100 shadow-2xl shadow-amber-400', name: '레전더리', price: 500, special: true }
  ]
};

// 마이룸 아이템 (집 꾸미기)
export const ROOM_ITEMS = {
  // 가구
  furniture: [
    { id: 'furn1', emoji: '🛋️', name: '기본 소파', price: 0 },
    { id: 'furn2', emoji: '🛏️', name: '침대', price: 100 },
    { id: 'furn3', emoji: '🪑', name: '의자', price: 50 },
    { id: 'furn4', emoji: '🗄️', name: '서랍장', price: 80 },
    { id: 'furn5', emoji: '📚', name: '책장', price: 120 },
    { id: 'furn6', emoji: '🖥️', name: '컴퓨터 책상', price: 200 },
    { id: 'furn7', emoji: '🎮', name: '게임 의자', price: 300 },
    { id: 'furn8', emoji: '🛋️', name: '럭셔리 소파', price: 500 },
    { id: 'furn9', emoji: '🏰', name: '캐노피 침대', price: 800 },
    { id: 'furn10', emoji: '👑', name: '왕좌', price: 1500 }
  ],
  // 가전제품
  electronics: [
    { id: 'elec1', emoji: '📺', name: '기본 TV', price: 0 },
    { id: 'elec2', emoji: '🖥️', name: '모니터', price: 100 },
    { id: 'elec3', emoji: '🎮', name: '게임기', price: 200 },
    { id: 'elec4', emoji: '🔊', name: '스피커', price: 150 },
    { id: 'elec5', emoji: '❄️', name: '에어컨', price: 300 },
    { id: 'elec6', emoji: '📺', name: '대형 TV', price: 500 },
    { id: 'elec7', emoji: '🎬', name: '홈시어터', price: 800 },
    { id: 'elec8', emoji: '🤖', name: 'AI 로봇', price: 1000 },
    { id: 'elec9', emoji: '🕹️', name: 'VR 장비', price: 1200 }
  ],
  // 차량
  vehicles: [
    { id: 'car1', emoji: '🚗', name: '기본 자동차', price: 500 },
    { id: 'car2', emoji: '🚙', name: 'SUV', price: 800 },
    { id: 'car3', emoji: '🏎️', name: '스포츠카', price: 1500 },
    { id: 'car4', emoji: '🚐', name: '캠핑카', price: 1200 },
    { id: 'car5', emoji: '🏍️', name: '오토바이', price: 600 },
    { id: 'car6', emoji: '🚁', name: '헬리콥터', price: 3000 },
    { id: 'car7', emoji: '🛥️', name: '요트', price: 2500 },
    { id: 'car8', emoji: '✈️', name: '전용기', price: 5000 },
    { id: 'car9', emoji: '🚀', name: '우주선', price: 10000 }
  ],
  // 펫
  pets: [
    { id: 'pet1', emoji: '🐕', name: '강아지', price: 200 },
    { id: 'pet2', emoji: '🐈', name: '고양이', price: 200 },
    { id: 'pet3', emoji: '🐹', name: '햄스터', price: 100 },
    { id: 'pet4', emoji: '🐰', name: '토끼', price: 150 },
    { id: 'pet5', emoji: '🦜', name: '앵무새', price: 250 },
    { id: 'pet6', emoji: '🐠', name: '열대어', price: 100 },
    { id: 'pet7', emoji: '🦊', name: '여우', price: 500 },
    { id: 'pet8', emoji: '🦄', name: '유니콘', price: 2000 },
    { id: 'pet9', emoji: '🐉', name: '드래곤', price: 5000 },
    { id: 'pet10', emoji: '🦅', name: '독수리', price: 800 }
  ],
  // 인테리어/벽지
  wallpaper: [
    { id: 'wall1', color: '#f5f5f5, #e8e8e8', name: '기본', price: 0 },
    { id: 'wall2', color: '#e0f2fe, #bae6fd', name: '하늘색', price: 50 },
    { id: 'wall3', color: '#fce7f3, #fbcfe8', name: '핑크', price: 50 },
    { id: 'wall4', color: '#d1fae5, #a7f3d0', name: '민트', price: 50 },
    { id: 'wall5', color: '#fef3c7, #fde68a', name: '크림', price: 60 },
    { id: 'wall6', color: '#c4b5fd, #a5b4fc', name: '우주', price: 150 },
    { id: 'wall7', color: '#fecdd3, #f9a8d4, #d8b4fe', name: '오로라', price: 200 },
    { id: 'wall8', color: '#fcd34d, #fef08a, #fcd34d', name: '황금', price: 300 }
  ],
  // 장식품
  decorations: [
    { id: 'deco1', emoji: '🖼️', name: '그림', price: 50 },
    { id: 'deco2', emoji: '🪴', name: '화분', price: 30 },
    { id: 'deco3', emoji: '🏆', name: '트로피', price: 100 },
    { id: 'deco4', emoji: '🎪', name: '텐트', price: 150 },
    { id: 'deco5', emoji: '🎄', name: '크리스마스 트리', price: 200 },
    { id: 'deco6', emoji: '⛲', name: '분수대', price: 500 },
    { id: 'deco7', emoji: '🗽', name: '조각상', price: 400 },
    { id: 'deco8', emoji: '🌈', name: '무지개 장식', price: 300 },
    { id: 'deco9', emoji: '💎', name: '보석 장식', price: 800 },
    { id: 'deco10', emoji: '🏰', name: '미니 성', price: 1000 }
  ]
};

// 카테고리 정보
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

// 기본 아이템 ID
export const DEFAULT_OWNED_ITEMS = ['face1', 'bg1', 'frame1', 'hair1', 'hc1', 'cloth1', 'acc1', 'furn1', 'elec1', 'wall1'];

export const DEFAULT_EQUIPPED_ITEMS = {
  face: 'face1',
  hair: 'hair1',
  hairColor: 'hc1',
  clothes: 'cloth1',
  accessory: 'acc1',
  background: 'bg1',
  frame: 'frame1'
};

export const DEFAULT_ROOM_ITEMS = {
  furniture: 'furn1',
  electronics: 'elec1',
  vehicle: null,
  pet: null,
  wallpaper: 'wall1',
  decorations: []
};

// 아이템 검색 헬퍼 함수
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
