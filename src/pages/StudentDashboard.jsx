import { useState, useEffect, useCallback, useRef } from "react";
// 🚀 useDebounce 제거 - 자동저장 기능 제거로 더 이상 필요 없음
import Confetti from "react-confetti";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { signOut, updateUserData } from "../services/authService";
import { getClassByCode } from "../services/classService";
import {
  saveWriting,
  submitWriting,
  getStudentStats,
  saveDraftByTopic,
  getDraftByTopic,
  deleteDraft,
  getClassRanking,
  getWritingSummaryFromUserData,
  getWritingDetail,
  migrateWritingsMinScore
} from "../services/writingService";
import { getAssignmentsFromClassInfo, migrateAssignmentSummary } from "../services/assignmentService";
import { getWritingHelp, getQuickAdvice } from "../utils/geminiAPI";
import { WORD_COUNT_STANDARDS, PASSING_SCORE, GRADE_LEVELS, getAdjustedWordCount } from "../config/auth";
import { FaceSVG, AnimalFaceSVG, HairSVG, ClothesSVG, AccessorySVG, BackgroundSVG } from "../components/AvatarSVG";
import { FurnitureSVG, ElectronicsSVG, VehicleSVG, PetSVG, DecorationSVG } from "../components/RoomSVG";
import { LEVELS, getLevelInfo, getNextLevelInfo, ACHIEVEMENTS, checkAchievements, WRITING_TEMPLATES } from "../config/levels";

// 아바타 아이템 정의 (SVG 실사 스타일 지원)
const AVATAR_ITEMS = {
  // 캐릭터 얼굴 - SVG 실사 스타일 (사람/동물/이모지)
  faces: [
    // 남자 캐릭터
    { id: 'face1', emoji: '👦', name: '남자 (기본)', price: 0, svgType: 'human', expression: 'happy', skinColor: '#FFD5B8', gender: 'male' },
    { id: 'face2', emoji: '😎', name: '남자 (멋쟁이)', price: 50, svgType: 'human', expression: 'cool', skinColor: '#FFD5B8', gender: 'male' },
    { id: 'face3', emoji: '🤓', name: '남자 (똑똑이)', price: 50, svgType: 'human', expression: 'smart', skinColor: '#FFD5B8', gender: 'male' },
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
const ROOM_ITEMS = {
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
const SHOP_CATEGORIES = {
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

const CATEGORY_NAMES = {
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

export default function StudentDashboard({ user, userData }) {
  const [classInfo, setClassInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("write");
  const [writings, setWritings] = useState([]);
  const [stats, setStats] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]); // 모든 과제 저장 (minScore 조회용)

  // 🚀 제출기록 상세 보기 (클릭 시 로드)
  const [selectedWritingDetail, setSelectedWritingDetail] = useState(null);
  const [loadingWritingDetail, setLoadingWritingDetail] = useState(false);

  const [currentWriting, setCurrentWriting] = useState({
    topic: "",
    content: "",
    wordCount: 0,
    gradeLevel: userData.gradeLevel,
    studentName: userData.name
  });

  // 🚀 탭 이동 시 경고창 함수 - 작성 중인 글 보호
  const handleTabChange = (newTab) => {
    // 글쓰기 탭에서 다른 탭으로 이동하려 하고, 작성 중인 글이 있는 경우
    if (activeTab === "write" && newTab !== "write" && currentWriting.content && currentWriting.content.trim().length > 0) {
      const confirmMove = window.confirm(
        `⚠️ 작성 중인 글이 있습니다!\n\n` +
        `주제: "${currentWriting.topic || '(주제 미선택)'}"\n` +
        `작성된 글자 수: ${currentWriting.wordCount}자\n\n` +
        `다른 탭으로 이동하면 작성 중인 글이 삭제됩니다.\n` +
        `그래도 이동하시겠습니까?\n\n` +
        `💡 팁: 글을 유지하려면 '취소'를 누른 후 '제출하기'로 저장하세요.`
      );

      if (!confirmMove) {
        return; // 취소 시 이동하지 않음
      }

      // 확인 시 글 초기화
      setCurrentWriting({
        topic: "",
        content: "",
        wordCount: 0,
        gradeLevel: userData.gradeLevel,
        studentName: userData.name
      });
      setSelectedTopic(null);
    }

    setActiveTab(newTab);

    // 🚀 탭별 DB 읽기 로그
    if (newTab === 'statistics') {
      console.log('[📊 탭] 통계 탭 - DB 읽기 0회 (이미 로드된 stats 사용)');
    } else if (newTab === 'profile') {
      console.log('[📊 탭] 내 프로필 탭 - DB 읽기 0회 (이미 로드된 userData 사용)');
    } else if (newTab === 'ranking') {
      console.log('[📊 탭] 랭킹 탭 - DB 읽기 0회 (classInfo 캐시 사용)');
    } else if (newTab === 'history') {
      console.log('[📊 탭] 제출기록 탭 - DB 읽기 0회 (userData.writingSummary 사용)');
    } else if (newTab === 'write') {
      console.log('[📊 탭] 글쓰기 탭 - DB 읽기 0회');
    }
  };

  // 🚀 자동저장 제거 - Firestore 비용 최적화 (주제 이동 시 경고창으로 대체)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [aiHelp, setAiHelp] = useState(null);
  const [aiHelpHistory, setAiHelpHistory] = useState([]); // AI 도움 기록 (표절 검사용)
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [submittedWriting, setSubmittedWriting] = useState(null);
  const [completedAssignmentsCount, setCompletedAssignmentsCount] = useState(0);
  const [rewriteMode, setRewriteMode] = useState(null); // 고쳐쓰기 모드 - AI 제안 저장
  const [isProcessingAction, setIsProcessingAction] = useState(false); // 🚀 버튼 중복 클릭 방지

  // 🧪 테스트 모드 관련 state
  const isTestStudent = userData.isTestStudent || false;
  const [testScoreMode, setTestScoreMode] = useState(null); // null: 일반, 'pass': 도달점수, 'fail': 미달점수, 'custom': 직접입력
  const [customTestScore, setCustomTestScore] = useState(75); // 직접 입력 점수

  // 실시간 조언 관련 state
  const [quickAdvice, setQuickAdvice] = useState(null);
  const [loadingQuickAdvice, setLoadingQuickAdvice] = useState(false);
  const [lastAdviceTime, setLastAdviceTime] = useState(0);

  // 주제별 임시 글 저장 (주제 이동시 내용 보존)
  const [draftsByTopic, setDraftsByTopic] = useState({});
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 프로필 관련 state
  const [nickname, setNickname] = useState(userData.nickname || userData.name);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [points, setPoints] = useState(userData.points || 0);
  const [totalPoints, setTotalPoints] = useState(userData.totalPoints || userData.points || 0); // 누적 포인트 (레벨 계산용)
  const [ownedItems, setOwnedItems] = useState(userData.ownedItems || ['face1', 'bg1', 'frame1', 'hair1', 'hc1', 'cloth1', 'acc1', 'furn1', 'elec1', 'wall1']);
  const [equippedItems, setEquippedItems] = useState(userData.equippedItems || {
    face: 'face1',
    hair: 'hair1',
    hairColor: 'hc1',
    clothes: 'cloth1',
    accessory: 'acc1',
    background: 'bg1',
    frame: 'frame1'
  });
  const [roomItems, setRoomItems] = useState(userData.roomItems || {
    furniture: 'furn1',
    electronics: 'elec1',
    vehicle: null,
    pet: null,
    wallpaper: 'wall1',
    decorations: []
  });
  const [shopCategory, setShopCategory] = useState('avatar');
  const [avatarTab, setAvatarTab] = useState('faces');
  const [showPassedWritings, setShowPassedWritings] = useState(true); // 달성 글 펼침 상태 (기본: 펼침)
  // 아바타 미리보기 상태
  const [previewItem, setPreviewItem] = useState(null); // { item, category }
  const [previewEquipped, setPreviewEquipped] = useState(null); // 미리보기용 임시 장착 상태
  // 마이룸 미리보기 상태
  const [previewRoomItem, setPreviewRoomItem] = useState(null); // { item, category }

  // 음성 입력 관련 state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // 글쓰기 템플릿 관련 state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // 글자 수 목표 달성 축하 애니메이션
  const [showWordCountCelebration, setShowWordCountCelebration] = useState(false);
  const [lastWordCountMilestone, setLastWordCountMilestone] = useState(0);

  // 레벨/업적 관련 state
  const [userAchievements, setUserAchievements] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // 임시 저장 관련 state
  const [hasDraft, setHasDraft] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // 랭킹 관련 state
  const [rankingData, setRankingData] = useState([]);
  const [rankingPeriod, setRankingPeriod] = useState('weekly');
  const [rankingExpanded, setRankingExpanded] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [myRank, setMyRank] = useState(null);
  const [rankingLastLoaded, setRankingLastLoaded] = useState(null); // 🚀 캐시 타임스탬프

  // 닉네임 변경 알림 모달
  const [showNicknameAlert, setShowNicknameAlert] = useState(false);
  const [nicknameAlertInput, setNicknameAlertInput] = useState('');

  useEffect(() => {
    // 🚀 초기 로드 및 새로고침 시에는 DB에서 최신 데이터 가져옴
    loadData(true);
    // 음성 인식 지원 확인
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      initSpeechRecognition();
    }
    // 닉네임 변경 여부 체크 - 한번도 변경하지 않은 경우 알림
    if (!userData.nicknameChanged) {
      setShowNicknameAlert(true);
    }
  }, []);

  // 🚀 페이지 로드 시 임시저장 자동 복구 + 예약된 저장 실행
  useEffect(() => {
    const recoverDraft = async () => {
      try {
        // 0. 먼저 예약된 서버 저장이 있으면 실행 (페이지 종료 시 저장 못한 것)
        const pendingSaveKey = `writing_pending_save_${user.uid}`;
        const pendingSave = localStorage.getItem(pendingSaveKey);
        if (pendingSave) {
          try {
            const draftData = JSON.parse(pendingSave);
            // 10분 이내의 데이터만 서버에 저장
            if (Date.now() - draftData.timestamp < 10 * 60 * 1000) {
              await saveDraftByTopic(user.uid, draftData.topic, {
                topic: draftData.topic,
                content: draftData.content,
                wordCount: draftData.wordCount
              });
              console.log(`[복구 저장] "${draftData.topic}" 서버 저장 완료`);
            }
            localStorage.removeItem(pendingSaveKey);
          } catch (e) {
            console.warn('예약된 저장 실패:', e);
            localStorage.removeItem(pendingSaveKey);
          }
        }

        // 🚀 1. sessionStorage에서 즉시 복구 (확대/축소, 새로고침 대비 - 확인창 없이!)
        const sessionDraftKey = `writing_session_${user.uid}`;
        const sessionDraft = sessionStorage.getItem(sessionDraftKey);
        if (sessionDraft) {
          try {
            const draftData = JSON.parse(sessionDraft);
            // 30분 이내의 데이터만 복구
            if (Date.now() - draftData.timestamp < 30 * 60 * 1000 && draftData.content?.trim().length > 0) {
              console.log(`[세션복구] "${draftData.topic}" 자동 복구 (${draftData.wordCount}자)`);
              setActiveTab('write');
              setSelectedTopic({ title: draftData.topic });
              setCurrentWriting({
                topic: draftData.topic,
                content: draftData.content,
                wordCount: draftData.wordCount,
                isAssignment: draftData.isAssignment || false,
                minScore: draftData.minScore
              });
              // 복구 후 세션 저장소는 유지 (다음 확대/축소 대비)
              return; // 세션에서 복구되었으면 localStorage 복구 스킵
            }
          } catch (e) {
            console.warn('세션 복구 실패:', e);
          }
        }

        // 2. 로컬 스토리지에서 모든 임시저장 찾기
        const allDrafts = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`writing_draft_${user.uid}_`)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              const topic = key.replace(`writing_draft_${user.uid}_`, '');
              if (data && data.content && data.content.trim().length > 0) {
                const savedTime = new Date(data.savedAt).getTime();
                const now = Date.now();
                // 24시간 이내 저장된 것만
                if (now - savedTime < 24 * 60 * 60 * 1000) {
                  allDrafts.push({
                    topic,
                    content: data.content,
                    wordCount: data.wordCount || data.content.replace(/\s/g, '').length,
                    savedAt: data.savedAt,
                    savedTime
                  });
                }
              }
            } catch (e) {
              // 파싱 에러 무시
            }
          }
        }

        // 3. 가장 최근에 저장된 글 찾기
        if (allDrafts.length > 0) {
          allDrafts.sort((a, b) => b.savedTime - a.savedTime);
          const latestDraft = allDrafts[0];

          // 최근 10분 이내에 작성하던 글이 있으면 자동 복구
          const minutesAgo = Math.floor((Date.now() - latestDraft.savedTime) / 60000);
          if (minutesAgo < 10 && latestDraft.wordCount >= 10) {
            // 바로 복구하지 않고 사용자에게 확인
            const confirmRecover = window.confirm(
              `📝 작성 중이던 글이 있습니다!\n\n` +
              `주제: "${latestDraft.topic}"\n` +
              `글자 수: ${latestDraft.wordCount}자\n` +
              `저장 시간: ${minutesAgo}분 전\n\n` +
              `이어서 작성하시겠습니까?`
            );

            if (confirmRecover) {
              // 글쓰기 탭으로 이동하고 글 복구
              setActiveTab('write');
              setSelectedTopic({ title: latestDraft.topic });
              setCurrentWriting({
                topic: latestDraft.topic,
                content: latestDraft.content,
                wordCount: latestDraft.wordCount,
                isAssignment: false
              });
              console.log(`[자동복구] "${latestDraft.topic}" 복구 완료 (${latestDraft.wordCount}자)`);
            }
          }
        }
      } catch (e) {
        console.warn('임시저장 복구 실패:', e);
      }
    };

    // 페이지 로드 후 100ms 뒤에 복구 시도 (더 빠르게!)
    const timer = setTimeout(recoverDraft, 100);
    return () => clearTimeout(timer);
  }, [user.uid]);

  // 🚀 확대/축소, 탭 전환 시 글 보존 (visibilitychange + resize 이벤트)
  useEffect(() => {
    // 현재 작성 중인 글을 sessionStorage에 저장
    const saveToSession = () => {
      if (currentWriting.topic && currentWriting.content?.trim().length > 0) {
        try {
          const sessionDraftKey = `writing_session_${user.uid}`;
          sessionStorage.setItem(sessionDraftKey, JSON.stringify({
            topic: currentWriting.topic,
            content: currentWriting.content,
            wordCount: currentWriting.wordCount,
            isAssignment: currentWriting.isAssignment,
            minScore: currentWriting.minScore,
            timestamp: Date.now()
          }));
          console.log(`[세션저장] "${currentWriting.topic}" 저장됨 (${currentWriting.wordCount}자)`);
        } catch (e) {
          // 무시
        }
      }
    };

    // 탭이 숨겨질 때 (확대/축소, 탭 전환 등)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToSession();
      }
    };

    // 창 크기 변경 시 (웨일북 확대/축소)
    const handleResize = () => {
      saveToSession();
    };

    // 페이지 언로드 전
    const handleBeforeUnload = () => {
      saveToSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [user.uid, currentWriting]);

  // 모바일 뒤로가기 처리 - 글쓰기 중 뒤로가기 시 로그인 풀림 방지
  useEffect(() => {
    // history에 상태 추가
    const pushState = () => {
      window.history.pushState({ studentDashboard: true }, '');
    };

    const handlePopState = (event) => {
      // 피드백 화면에서 뒤로가기 -> 피드백 닫기
      if (feedback) {
        event.preventDefault();
        setFeedback(null);
        setSubmittedWriting(null);
        pushState();
        return;
      }

      // 글쓰기 중에 뒤로가기 -> 주제 선택으로 돌아가기
      if (currentWriting.content && currentWriting.content.trim().length > 0) {
        event.preventDefault();
        if (window.confirm('⚠️ 작성 중인 글이 있습니다!\n\n뒤로 가면 작성 중인 글이 삭제됩니다.\n그래도 뒤로 가시겠습니까?')) {
          setCurrentWriting(prev => ({
            ...prev,
            topic: '',
            content: '',
            wordCount: 0
          }));
          setSelectedTopic(null);
          setAiHelp(null);
          setAiHelpHistory([]); // AI 도움 기록 초기화
          setQuickAdvice(null);
          setRewriteMode(null);
        }
        pushState();
        return;
      }

      // 주제 선택 중에 뒤로가기 -> 탭 유지
      if (selectedTopic || currentWriting.topic) {
        event.preventDefault();
        setSelectedTopic(null);
        setCurrentWriting(prev => ({
          ...prev,
          topic: '',
          content: '',
          wordCount: 0
        }));
        pushState();
        return;
      }

      // 그 외의 경우 기본 뒤로가기 동작 허용 (하지만 history 상태 유지)
      pushState();
    };

    // 초기 상태 추가
    pushState();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [feedback, currentWriting.content, currentWriting.topic, selectedTopic]);

  // 🚀 PC 새로고침/창닫기 시 경고 - 작성 중인 글 보호
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // 글쓰기 중인 내용이 있을 때만 경고
      if (currentWriting.content && currentWriting.content.trim().length > 0) {
        e.preventDefault();
        // 표준 방식 (Chrome 51+, Safari 9.1+)
        e.returnValue = '작성 중인 글이 있습니다. 페이지를 떠나시겠습니까?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentWriting.content]);

  // 🚀 페이지 나갈 때 서버 저장 (DB 비용 최적화)
  // - 30초마다 저장하면 DB 비용이 크게 증가하므로 제거
  // - 대신 페이지 나갈 때만 서버에 저장
  // - 로컬스토리지 자동저장은 유지 (DB 비용 0)
  useEffect(() => {
    const handleUnloadSave = async () => {
      // 주제와 내용이 있고, 최소 20자 이상일 때만 저장
      if (!currentWriting.topic || !currentWriting.content || currentWriting.wordCount < 20) {
        return;
      }
      // 피드백 화면이면 저장하지 않음
      if (feedback) return;

      try {
        // sendBeacon으로 비동기 저장 (페이지가 닫혀도 전송 보장)
        const draftData = {
          userId: user.uid,
          topic: currentWriting.topic,
          content: currentWriting.content,
          wordCount: currentWriting.wordCount,
          timestamp: Date.now()
        };

        // sendBeacon은 JSON 직접 전송 불가, 로컬스토리지에 저장해두면 다음 접속시 복구
        localStorage.setItem(`writing_pending_save_${user.uid}`, JSON.stringify(draftData));
        console.log(`[페이지 종료] "${currentWriting.topic}" 임시저장 예약됨`);
      } catch (e) {
        console.warn('페이지 종료 시 저장 실패:', e);
      }
    };

    window.addEventListener('pagehide', handleUnloadSave);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadSave();
      }
    });

    return () => {
      window.removeEventListener('pagehide', handleUnloadSave);
    };
  }, [currentWriting.topic, currentWriting.content, currentWriting.wordCount, feedback, user.uid]);

  // userData 변경시 프로필 정보 업데이트
  useEffect(() => {
    setNickname(userData.nickname || userData.name);
    setPoints(userData.points || 0);
    setTotalPoints(userData.totalPoints || userData.points || 0); // 누적 포인트 동기화
    setOwnedItems(userData.ownedItems || ['face1', 'bg1', 'frame1', 'hair1', 'hc1', 'cloth1', 'acc1', 'furn1', 'elec1', 'wall1']);
    setEquippedItems(userData.equippedItems || {
      face: 'face1',
      hair: 'hair1',
      hairColor: 'hc1',
      clothes: 'cloth1',
      accessory: 'acc1',
      background: 'bg1',
      frame: 'frame1'
    });
    setRoomItems(userData.roomItems || {
      furniture: 'furn1',
      electronics: 'elec1',
      vehicle: null,
      pet: null,
      wallpaper: 'wall1',
      decorations: []
    });
  }, [userData]);

  // 랭킹 탭 선택 시 데이터 로드
  // 🚀 최적화: classInfo 캐시 사용 (DB 읽기 0회!)
  useEffect(() => {
    if (activeTab === 'ranking' && classInfo?.classCode) {
      // 🚀 캐시 가드: 60초 이내에 로드했으면 재로드하지 않음
      const now = Date.now();
      if (rankingLastLoaded && (now - rankingLastLoaded) < 60000 && rankingData.length > 0) {
        return;
      }
      // 🚀 classInfo에 랭킹 캐시가 있으면 forceRefresh 불필요 (DB 읽기 0회!)
      const rankingField = rankingPeriod === 'weekly' ? 'weeklyRanking' : 'monthlyRanking';
      const hasRankingCache = classInfo?.[rankingField]?.data;
      loadRankingData(classInfo.classCode, rankingPeriod, false);
    }
  }, [activeTab, classInfo?.classCode, rankingPeriod]);

  // 🚀 랭킹 데이터 로드 함수 - 최적화: classInfo 캐시 사용 (DB 읽기 0회!)
  const loadRankingData = async (classCode, period, forceRefresh = false) => {
    if (loadingRanking) return; // 🔥 동시 로드 방지

    // 🔧 classCode 유효성 검사
    if (!classCode) {
      console.warn('랭킹 로드 실패: classCode가 없습니다');
      setRankingData([]);
      return;
    }

    // 🚀 캐시 가드: 강제 새로고침이 아니고 최근 로드했으면 스킵
    if (!forceRefresh && rankingLastLoaded && (Date.now() - rankingLastLoaded) < 60000 && rankingData.length > 0) {
      return;
    }
    setLoadingRanking(true);
    try {
      // 🚀 classInfo에서 캐시된 랭킹 사용 (DB 읽기 0회!)
      const rankingField = period === 'weekly' ? 'weeklyRanking' : 'monthlyRanking';
      let fullRanking = [];

      if (classInfo?.[rankingField]?.data) {
        fullRanking = classInfo[rankingField].data;
        console.log(`[📊 캐시] 랭킹 - classInfo.${rankingField}에서 로드 (DB 읽기 0회)`);
      } else if (forceRefresh) {
        // 강제 새로고침 시에만 DB 조회
        console.log(`[📊 DB읽기] 랭킹 강제 새로고침 - classCode: ${classCode}`);
        fullRanking = await getClassRanking(classCode, period, { forceRefresh: true });
      } else {
        console.log(`[📊 캐시] 랭킹 데이터 없음 - 빈 배열 반환`);
      }

      setRankingData(fullRanking);
      setRankingLastLoaded(Date.now());

      // 내 순위 설정
      const myRankData = fullRanking.find(r => r.studentId === user.uid);
      if (myRankData) {
        setMyRank(myRankData.rank);
      } else {
        setMyRank(null);
      }
    } catch (error) {
      console.error('랭킹 데이터 로드 에러:', error);
      setRankingData([]);
      setMyRank(null);
    } finally {
      setLoadingRanking(false);
    }
  };

  // 음성 인식 초기화
  const isListeningRef = useRef(false); // 클로저 문제 해결용
  const interimTranscriptRef = useRef(''); // 중간 결과 저장용

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3; // 여러 대안 중 최적 선택

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          // 가장 신뢰도 높은 결과 선택
          const result = event.results[i];
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence || 0;

          // 대안들 중 더 높은 신뢰도 찾기
          for (let j = 1; j < result.length; j++) {
            if (result[j].confidence > bestConfidence) {
              bestConfidence = result[j].confidence;
              bestTranscript = result[j].transcript;
            }
          }

          if (result.isFinal) {
            finalTranscript += bestTranscript;
          } else {
            interimTranscript += bestTranscript;
          }
        }

        // 중간 결과 저장 (UI 표시용)
        interimTranscriptRef.current = interimTranscript;

        if (finalTranscript) {
          setCurrentWriting(prev => ({
            ...prev,
            content: prev.content + finalTranscript,
            wordCount: (prev.content + finalTranscript).replace(/\s/g, "").length
          }));
          interimTranscriptRef.current = ''; // 확정되면 중간 결과 클리어
        }
      };

      recognition.onerror = (event) => {
        console.error('음성 인식 에러:', event.error);
        // no-speech 에러는 무시하고 계속 듣기
        if (event.error === 'no-speech') {
          return;
        }
        // aborted는 사용자가 중단한 것이므로 무시
        if (event.error === 'aborted') {
          return;
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        // ref를 사용해 현재 상태 정확히 확인
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.log('음성 인식 재시작 실패:', e);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  };

  // 음성 입력 토글
  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      interimTranscriptRef.current = '';
    } else {
      isListeningRef.current = true;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('음성 인식 시작 실패:', e);
        isListeningRef.current = false;
      }
    }
  };

  // 템플릿 적용
  const applyTemplate = (template) => {
    setSelectedTemplate(template);
    setCurrentWriting(prev => ({
      ...prev,
      content: template.template,
      wordCount: template.template.replace(/\s/g, "").length
    }));
    setShowTemplateModal(false);
  };

  // 글자 수 마일스톤 체크
  const checkWordCountMilestone = (count) => {
    const milestones = [50, 100, 200, 300, 500, 1000];
    for (const milestone of milestones) {
      if (count >= milestone && lastWordCountMilestone < milestone) {
        setLastWordCountMilestone(milestone);
        setShowWordCountCelebration(true);
        setTimeout(() => setShowWordCountCelebration(false), 3000);
        break;
      }
    }
  };

  // 임시 저장
  const handleSaveDraft = async () => {
    if (!currentWriting.topic || !currentWriting.content) {
      alert('주제와 내용을 입력해주세요.');
      return;
    }
    setSavingDraft(true);
    try {
      await saveDraftByTopic(user.uid, currentWriting.topic, currentWriting);
      setHasDraft(true);
      alert('임시 저장이 완료되었습니다!');
    } catch (error) {
      console.error('임시 저장 에러:', error);
      alert('임시 저장에 실패했습니다.');
    } finally {
      setSavingDraft(false);
    }
  };

  // 임시 저장 불러오기
  const handleLoadDraft = async () => {
    if (!currentWriting.topic) {
      alert('먼저 주제를 선택해주세요.');
      return;
    }
    setLoadingDraft(true);
    try {
      const draft = await getDraftByTopic(user.uid, currentWriting.topic);
      if (draft) {
        setCurrentWriting({
          ...currentWriting,
          content: draft.content || '',
          wordCount: (draft.content || '').replace(/\s/g, '').length
        });
        alert('임시 저장된 글을 불러왔습니다!');
      } else {
        alert('저장된 임시 글이 없습니다.');
      }
    } catch (error) {
      console.error('임시 저장 불러오기 에러:', error);
      alert('불러오기에 실패했습니다.');
    } finally {
      setLoadingDraft(false);
    }
  };

  // 주제 선택 시 임시 저장 여부 확인
  const checkDraftExists = async (topic) => {
    try {
      const draft = await getDraftByTopic(user.uid, topic);
      setHasDraft(!!draft);
    } catch {
      setHasDraft(false);
    }
  };

  // 🚀 제출기록에서 글 클릭 시 상세 정보 로드 (DB 읽기 1회)
  const handleViewWritingDetail = async (writingId) => {
    if (loadingWritingDetail) return;

    // 이미 로드된 글이면 토글
    if (selectedWritingDetail?.writingId === writingId) {
      setSelectedWritingDetail(null);
      return;
    }

    setLoadingWritingDetail(true);
    try {
      console.log(`[📊 DB읽기] 제출기록 상세 조회 - writingId: ${writingId}`);
      const detail = await getWritingDetail(writingId);
      setSelectedWritingDetail(detail);
    } catch (error) {
      console.error('글 상세 로드 에러:', error);
    } finally {
      setLoadingWritingDetail(false);
    }
  };

  // 🚀 최적화: writings 컬렉션 쿼리 완전 제거! (DB 읽기 76회 → 0회)
  // users 문서의 writingSummary에서 글 목록 가져오기
  // 🚀 forceRefresh: true면 DB에서 최신 데이터, false면 로컬 userData 사용
  const loadData = async (forceRefresh = false) => {
    try {
      let studentWritings = [];
      let studentStats = null;
      let cls = null;
      let classAssignments = [];

      // 1. 🚀 users 문서에서 글 요약 가져오기
      let currentUserData = userData;

      // 새로고침 시에만 DB에서 최신 데이터 가져옴 (비용 절약!)
      if (forceRefresh) {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          currentUserData = userDoc.data();
          console.log(`[📊 DB읽기] users 문서 새로고침 - writingSummary 개수: ${currentUserData.writingSummary?.length || 0}`);
          console.log(`[📊 DB읽기] writingSummary 내용:`, currentUserData.writingSummary);
        }
      }

      // 🚀 v6: 마이그레이션 완전 제거 - 이미 존재하는 writingSummary를 절대 덮어쓰지 않음
      // writingSummary가 있으면 그대로 사용, 없으면 빈 배열로 초기화
      const hasWritingSummary = currentUserData.writingSummary && Array.isArray(currentUserData.writingSummary);

      console.log(`[loadData] writingSummary 상태: ${hasWritingSummary ? `${currentUserData.writingSummary.length}개 있음` : '없음'}`);

      // writingSummary가 없는 경우에만 초기화 (마이그레이션 없이 빈 배열로)
      if (!hasWritingSummary) {
        console.log('[loadData] writingSummary 없음 - 빈 배열로 초기화');
        currentUserData.writingSummary = [];
        // DB에도 빈 배열 저장 (다음 로드 시 초기화 반복 방지)
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../config/firebase');
          await updateDoc(doc(db, 'users', user.uid), { writingSummary: [] });
        } catch (e) {
          console.warn('writingSummary 초기화 저장 실패:', e);
        }
      }

      // 🚀 userData에서 글 요약 추출 (DB 읽기 0회!)
      studentWritings = getWritingSummaryFromUserData(currentUserData);
      console.log(`[📊 캐시] 글 ${studentWritings.length}개 - userData에서 로드`);

      // 🚀 1시간 지난 미달성 글은 Cloud Function(autoCleanupFailedWritings)에서 자동 삭제됨
      // 클라이언트에서는 화면에서만 필터링 (권한 문제 없이 처리)
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      studentWritings = studentWritings.filter(w => {
        // 임시저장이면 유지
        if (w.isDraft) return true;
        // 제출된 글 중 미달성이고 1시간 지난 것은 화면에서 제외
        const minScore = w.minScore !== undefined ? w.minScore : PASSING_SCORE;
        if (w.score < minScore && w.submittedAt && new Date(w.submittedAt) < oneHourAgo) {
          return false;
        }
        return true;
      });

      // 2. 🚀 통계는 userData에서 계산 (writingSummary 기반 - DB 읽기 0회!)
      // studentStats 컬렉션은 제출 시에만 업데이트하고, 로그인 시에는 writingSummary에서 계산
      const submittedWritings = studentWritings.filter(w => !w.isDraft);
      studentStats = {
        totalSubmissions: submittedWritings.length,
        averageScore: submittedWritings.length > 0
          ? Math.round(submittedWritings.reduce((sum, w) => sum + (w.score || 0), 0) / submittedWritings.length)
          : 0,
        scores: submittedWritings.map(w => w.score || 0)
      };
      console.log(`[📊 캐시] 통계 - writingSummary에서 계산 (DB 읽기 0회)`);

      // 즉시 UI 업데이트
      setWritings(studentWritings);
      setStats(studentStats);

      // 3. 🚀 반 정보 로드 - 과제는 항상 최신 데이터 사용 (DB 읽기 1회)
      // 과제는 교사가 언제든 추가/삭제할 수 있으므로 캐시만 사용하면 안됨
      if (userData.classCode) {
        try {
          console.log(`[📊 DB읽기] 학급 정보 - classes 문서 조회 (과제 최신화)`);
          cls = await getClassByCode(userData.classCode, true); // forceRefresh로 최신 데이터
        } catch (err) {
          console.error('학급 정보 조회 에러:', err);
          // 에러 시 캐시 사용
          if (currentUserData.classInfo) {
            cls = currentUserData.classInfo;
            console.log(`[📊 캐시] 학급 정보 - 에러로 인해 캐시 사용`);
          }
        }
      }

      if (cls) {
        setClassInfo(cls);

        // 🚀 v5: description + minScore 필드 마이그레이션 (강제 실행)
        const migrationKey = `assignmentSummary_v5_${userData.classCode}`;
        const hasAllFields = cls.assignmentSummary &&
          cls.assignmentSummary.length > 0 &&
          cls.assignmentSummary[0].description !== undefined &&
          cls.assignmentSummary[0].minScore !== undefined;

        if (!hasAllFields || !localStorage.getItem(migrationKey)) {
          try {
            console.log('[마이그레이션 v5] assignmentSummary minScore 추가');
            const result = await migrateAssignmentSummary(userData.classCode);
            if (result.migrated) {
              cls = await getClassByCode(userData.classCode);
              setClassInfo(cls);
              console.log('[마이그레이션 v5] assignmentSummary 업데이트 완료');
            }
            localStorage.setItem(migrationKey, 'true');
          } catch (e) {
            console.warn('assignmentSummary 마이그레이션 실패:', e);
          }
        }

        // 🚀 v6: 기존 글의 minScore 마이그레이션 (한 번만 실행)
        const minScoreMigrationKey = `writings_minScore_v1_${userData.classCode}`;
        if (!localStorage.getItem(minScoreMigrationKey)) {
          try {
            console.log('[마이그레이션 v6] writings minScore 추가');
            const result = await migrateWritingsMinScore(userData.classCode);
            if (result.migratedCount > 0 || result.summaryUpdatedCount > 0) {
              console.log(`[마이그레이션 v6] writings: ${result.migratedCount}개, writingSummary: ${result.summaryUpdatedCount}명 업데이트`);
            }
            localStorage.setItem(minScoreMigrationKey, 'true');
          } catch (e) {
            console.warn('writings minScore 마이그레이션 실패:', e);
          }
        }

        // 🚀 classes 문서의 assignmentSummary에서 과제 목록 추출 (DB 읽기 0회!)
        const allClassAssignments = getAssignmentsFromClassInfo(cls);

        // 만료되지 않은 과제만 필터링 (생성일 기준 7일 이내)
        classAssignments = allClassAssignments.filter(assignment => {
          const createdAt = new Date(assignment.createdAt).getTime();
          const expiresAt = createdAt + (7 * 24 * 60 * 60 * 1000);
          return Date.now() < expiresAt;
        });
        console.log(`[📊 최적화] 과제 ${classAssignments.length}개 (만료 제외) - classes 문서에서 로드 (DB 읽기 0회)`);

        // 목표에 도달한 과제 필터링
        console.log('[과제 필터링] 전체 과제:', classAssignments.map(a => ({ title: a.title, minScore: a.minScore })));
        console.log('[과제 필터링] 학생 글:', studentWritings.map(w => ({ topic: w.topic, score: w.score, isDraft: w.isDraft })));

        const pendingAssignments = classAssignments.filter(assignment => {
          const assignmentMinScore = assignment.minScore !== undefined ? assignment.minScore : PASSING_SCORE;
          const hasPassingSubmission = studentWritings.some(
            w => !w.isDraft &&
                 w.topic === assignment.title &&
                 w.score >= assignmentMinScore
          );
          console.log(`[과제 필터링] "${assignment.title}" - minScore: ${assignmentMinScore}, 통과: ${hasPassingSubmission}`);
          return !hasPassingSubmission;
        });

        const completedCount = classAssignments.length - pendingAssignments.length;
        setCompletedAssignmentsCount(completedCount);

        setAssignments(pendingAssignments);
        setAllAssignments(classAssignments);
      }

      // 🚀 로그인 시 총 DB 읽기 요약
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[📊 로그인 완료] 총 DB 읽기: 2회`);
      console.log('  - users 문서: 1회 (App.jsx에서 로드)');
      console.log('  - classes 문서: 1회 (과제 최신화)');
      console.log('  - studentStats: 0회 (writingSummary에서 계산)');
      console.log('  - writings 컬렉션: 0회 (userData.writingSummary 캐시)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      console.error("데이터 로드 에러:", error);
    }
  };

  const handleGetAIHelp = async (helpType) => {
    if (!currentWriting.content && helpType !== 'hint') {
      alert('먼저 글을 작성해주세요.');
      return;
    }
    setLoadingHelp(true);
    try {
      const help = await getWritingHelp(currentWriting.content, currentWriting.topic, helpType);
      setAiHelp({ type: helpType, content: help });

      // AI 도움 기록 저장 (표절 검사용) - hints, suggestions 등 텍스트 추출
      const aiTexts = [];
      if (help.hints) aiTexts.push(...help.hints);
      if (help.suggestions) aiTexts.push(...help.suggestions.map(s => s.improved));
      if (help.expandIdeas) aiTexts.push(...help.expandIdeas);
      if (help.polished) aiTexts.push(help.polished); // 이전 버전 호환
      if (aiTexts.length > 0) {
        setAiHelpHistory(prev => [...prev, ...aiTexts]);
      }
    } catch (error) {
      alert(error.message || 'AI 도움 요청에 실패했습니다.');
    } finally {
      setLoadingHelp(false);
    }
  };

  // 🚀 autoSave 함수 제거 - Firestore 비용 최적화
  // 주제 이동 시 경고창으로 대체 (handleTopicSelect에서 처리)

  // 🚀 주제 이동 시 경고창 추가 - 자동저장 대체
  const handleTopicSelect = (topic) => {
    // 현재 작성 중인 글이 있고, 다른 주제로 이동하려는 경우 경고
    if (currentWriting.topic && currentWriting.topic !== topic.title && currentWriting.content && currentWriting.content.trim().length > 0) {
      const confirmMove = window.confirm(
        `⚠️ 작성 중인 글이 있습니다!\n\n` +
        `현재 주제: "${currentWriting.topic}"\n` +
        `작성된 글자 수: ${currentWriting.wordCount}자\n\n` +
        `"${topic.title}" 주제로 이동하면 작성 중인 글이 삭제됩니다.\n` +
        `그래도 이동하시겠습니까?\n\n` +
        `💡 팁: 글을 유지하려면 '취소'를 누른 후 '제출하기'로 저장하세요.`
      );

      if (!confirmMove) {
        return; // 취소 시 이동하지 않음
      }
    }

    setSelectedTopic(topic);

    // 해당 주제에 이전에 저장된 글이 있는지 확인 (로컬 메모리)
    const savedDraft = draftsByTopic[topic.title];

    // 🚀 로컬 스토리지에서 임시 저장 확인 (크래시/새로고침 복구)
    let localDraft = null;
    try {
      const localDraftKey = `writing_draft_${user.uid}_${topic.title}`;
      const localDraftData = localStorage.getItem(localDraftKey);
      if (localDraftData) {
        localDraft = JSON.parse(localDraftData);
        // 24시간 이내 저장된 것만 복구
        const savedTime = new Date(localDraft.savedAt).getTime();
        const now = Date.now();
        if (now - savedTime > 24 * 60 * 60 * 1000) {
          localDraft = null;
          localStorage.removeItem(localDraftKey);
        }
      }
    } catch (e) {
      // 로컬 스토리지 오류 무시
    }

    // 과제별 기준점수 적용 (과제가 아니면 기본 PASSING_SCORE 사용)
    const topicMinScore = topic.minScore !== undefined ? topic.minScore : PASSING_SCORE;

    // 복구할 내용 결정: 로컬 스토리지 > 메모리 > 빈 문자열
    const recoveredContent = localDraft?.content || savedDraft?.content || "";
    const recoveredWordCount = localDraft?.wordCount || savedDraft?.wordCount || 0;

    // 🚀 로컬 스토리지에서 복구된 경우 알림
    if (localDraft?.content && localDraft.content.trim().length > 0) {
      const savedTime = new Date(localDraft.savedAt);
      const timeAgo = Math.floor((Date.now() - savedTime.getTime()) / 60000); // 분 단위
      if (timeAgo < 60) {
        setTimeout(() => {
          alert(`📝 ${timeAgo}분 전에 작성하던 글이 복구되었습니다!\n\n글자 수: ${localDraft.wordCount}자`);
        }, 500);
      } else {
        const hoursAgo = Math.floor(timeAgo / 60);
        setTimeout(() => {
          alert(`📝 ${hoursAgo}시간 전에 작성하던 글이 복구되었습니다!\n\n글자 수: ${localDraft.wordCount}자`);
        }, 500);
      }
    }

    setCurrentWriting({
      ...currentWriting,
      topic: topic.title,
      content: recoveredContent,
      wordCount: recoveredWordCount,
      isAssignment: topic.isAssignment || false,
      minScore: topicMinScore
    });
    setFeedback(null);
    setQuickAdvice(null);

    // 서버에 저장된 임시 저장 확인
    checkDraftExists(topic.title);
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    const wordCount = content.replace(/\s/g, "").length;
    setCurrentWriting({
      ...currentWriting,
      content,
      wordCount
    });
    // 글자 수 마일스톤 체크
    checkWordCountMilestone(wordCount);

    // 🚀 로컬 스토리지에 자동 저장 (크래시/새로고침 대비)
    if (currentWriting.topic && content.trim().length > 0) {
      try {
        const localDraftKey = `writing_draft_${user.uid}_${currentWriting.topic}`;
        localStorage.setItem(localDraftKey, JSON.stringify({
          content,
          wordCount,
          savedAt: new Date().toISOString()
        }));
      } catch (e) {
        // 로컬 스토리지 오류 무시 (용량 초과 등)
      }
    }
  };

  // 실시간 조언 요청 (비용 최적화: 60초 쿨다운)
  const handleGetQuickAdvice = async (adviceType) => {
    const now = Date.now();
    if (now - lastAdviceTime < 60000) { // 60초 쿨다운
      alert('잠시 후 다시 시도해주세요. (60초 쿨다운)');
      return;
    }
    if (!currentWriting.content || currentWriting.wordCount < 20) {
      alert('조언을 받으려면 최소 20자 이상 작성해주세요.');
      return;
    }

    setLoadingQuickAdvice(true);
    try {
      const result = await getQuickAdvice(
        currentWriting.content,
        currentWriting.topic,
        userData.gradeLevel,
        adviceType
      );
      setQuickAdvice(result);
      setLastAdviceTime(now);
    } catch (error) {
      console.error('실시간 조언 에러:', error);
    } finally {
      setLoadingQuickAdvice(false);
    }
  };

  const getWordCountStatus = () => {
    // 글쓰기 유형에 따라 조정된 글자 수 기준 사용
    const topic = currentWriting.topic || '';
    const adjusted = getAdjustedWordCount(userData.gradeLevel, topic);
    const count = currentWriting.wordCount;

    if (count < adjusted.min) {
      return {
        status: "too-short",
        message: `글이 너무 짧습니다. (최소 ${adjusted.min}자)`,
        color: "text-red-600",
        standard: adjusted
      };
    } else if (count >= adjusted.min && count < adjusted.ideal) {
      return {
        status: "ok",
        message: "좋아요! 좀 더 써볼까요?",
        color: "text-yellow-600",
        standard: adjusted
      };
    } else if (count >= adjusted.ideal && count <= adjusted.max) {
      return {
        status: "ideal",
        message: "아주 좋아요!",
        color: "text-green-600",
        standard: adjusted
      };
    } else {
      return {
        status: "too-long",
        message: `글이 너무 깁니다. (최대 ${adjusted.max}자)`,
        color: "text-red-600",
        standard: adjusted
      };
    }
  };

  const handleSubmit = async () => {
    if (!currentWriting.topic || !currentWriting.content) {
      alert("주제와 내용을 모두 입력해 주세요.");
      return;
    }

    // 🚀 고쳐쓰기 모드: 최소 10글자 이상 변경해야 제출 가능 (특수문자 제외!)
    if (rewriteMode && rewriteMode.originalContent) {
      // 특수문자, 공백 제거 (의미있는 글자만 카운트)
      const meaninglessChars = /[\s.!?~,;:'"\-_=+*&^%$#@`<>(){}\[\]\/\\|ㅋㅎㅠㅜ]/g;
      const original = rewriteMode.originalContent.replace(meaninglessChars, '');
      const current = currentWriting.content.replace(meaninglessChars, '');

      // 내용 변경량 계산 (의미있는 글자만)
      let changedChars = 0;
      const minLen = Math.min(original.length, current.length);
      for (let i = 0; i < minLen; i++) {
        if (original[i] !== current[i]) changedChars++;
      }
      changedChars += Math.abs(original.length - current.length);

      if (changedChars < 10) {
        alert("고쳐쓰기 모드에서는 의미있는 내용을 수정해야 제출 가능합니다.");
        return;
      }
    }

    if (!confirm("글을 제출하시겠습니까? 제출 후 AI가 분석합니다.")) return;

    setIsSubmitting(true);
    try {
      // 🚀 최적화: classCode와 userData 전달하여 Firestore 읽기 2회 감소
      const classCode = userData.classCode || classInfo?.classCode;
      console.log(`[제출] classCode: ${classCode}, topic: "${currentWriting.topic}"`);
      console.log(`[제출] userData:`, userData);

      // 🚀 자동 고쳐쓰기 모드: 같은 주제로 이전에 제출한 글이 있으면 자동 적용
      let isAutoRewrite = !!rewriteMode;
      let previousScoreForRewrite = currentWriting.previousScore || null;

      if (!rewriteMode && userData.writingSummary) {
        const previousSubmission = userData.writingSummary.find(w =>
          w.topic === currentWriting.topic && !w.isDraft
        );
        if (previousSubmission) {
          isAutoRewrite = true;
          previousScoreForRewrite = previousSubmission.score;
          console.log(`[자동 고쳐쓰기] 같은 주제 발견 - 이전 점수: ${previousScoreForRewrite}점`);
        }
      }

      // previousScore를 currentWriting에 추가 (submitWriting에서 사용)
      const writingDataWithPrevScore = {
        ...currentWriting,
        previousScore: previousScoreForRewrite
      };

      const result = await submitWriting(
        user.uid,
        writingDataWithPrevScore,
        isAutoRewrite,
        classCode,
        userData,
        testScoreMode, // 🧪 테스트 모드 점수 (null, 'pass', 'fail', 'custom')
        testScoreMode === 'custom' ? customTestScore : null, // 🧪 직접 입력 점수
        aiHelpHistory // 🚀 AI 도움 기록 (표절 검사용)
      );

      // 과제별 기준점수 (과제가 아니면 기본 PASSING_SCORE 사용)
      const requiredScore = currentWriting.minScore !== undefined ? currentWriting.minScore : PASSING_SCORE;

      // 제출한 글 내용 저장 (피드백과 함께 표시하기 위해)
      setSubmittedWriting({
        topic: currentWriting.topic,
        content: currentWriting.content,
        wordCount: currentWriting.wordCount,
        minScore: requiredScore,
        isAssignment: currentWriting.isAssignment || false
      });

      setFeedback({
        ...result.analysis,
        aiUsageCheck: result.aiUsageCheck,
        score: result.score,
        earnedPoints: result.earnedPoints || 0, // 획득 포인트 정보 추가
        notSaved: result.notSaved || false, // 저장 안됨 플래그
        notSavedReason: result.reason || null // 저장 안된 이유
      });

      if (result.score >= requiredScore) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      // 제출 성공 시 임시 저장 삭제 (서버 + 로컬 + 세션)
      if (currentWriting.topic) {
        await deleteDraft(user.uid, currentWriting.topic);
        setHasDraft(false);
        // 🚀 로컬 스토리지 + 세션 스토리지 임시 저장도 삭제
        try {
          const localDraftKey = `writing_draft_${user.uid}_${currentWriting.topic}`;
          localStorage.removeItem(localDraftKey);
          // 🚀 세션 스토리지도 삭제 (제출 완료된 글이 다시 복구되지 않도록)
          const sessionDraftKey = `writing_session_${user.uid}`;
          sessionStorage.removeItem(sessionDraftKey);
        } catch (e) {
          // 무시
        }
      }

      // 글 초기화 (피드백은 유지)
      // 🚀 주의: setSelectedTopic(null)을 먼저 해야 피드백 화면이 표시됨
      setSelectedTopic(null);
      setAiHelp(null);
      setAiHelpHistory([]); // AI 도움 기록 초기화
      setRewriteMode(null); // 고쳐쓰기 모드 종료
      setCurrentWriting({
        topic: "",
        content: "",
        wordCount: 0,
        gradeLevel: userData.gradeLevel,
        studentName: userData.name
      });

      // 🚀 제출 성공 시 writings 목록에 새 글 추가 (loadData 호출하지 않음 - 피드백 화면 유지!)
      // loadData()를 호출하면 비동기 처리 중 피드백 화면이 깜빡이거나 사라질 수 있음
      if (!result.notSaved) {
        setWritings(prev => [...prev, {
          writingId: result.writingId,
          topic: result.topic,
          score: result.score,
          submittedAt: result.submittedAt,
          wordCount: result.wordCount,
          minScore: result.minScore || requiredScore
        }]);
      }

      // 🚀 포인트 즉시 업데이트 (레벨 유지를 위해 totalPoints도 업데이트)
      if (result.earnedPoints > 0) {
        setPoints(prev => prev + result.earnedPoints);
        setTotalPoints(prev => prev + result.earnedPoints); // 누적 포인트 증가 (레벨 계산용)
      }

      // 🚀 비용 최적화: 글 제출 후 랭킹 새로고침 제거 (랭킹 탭에서만 로드)
    } catch (error) {
      console.error('[제출 오류]', error);
      // 🚀 모바일 오류 개선: 더 상세한 에러 메시지
      let errorMessage = "제출에 실패했습니다.";
      if (error.code === 'functions/deadline-exceeded' || error.message?.includes('timeout')) {
        errorMessage = "⏱️ 서버 응답 시간이 초과되었습니다.\n\n잠시 후 다시 시도해주세요.\n(네트워크 연결을 확인해주세요)";
      } else if (error.code === 'functions/unavailable' || error.message?.includes('network')) {
        errorMessage = "📶 네트워크 연결이 불안정합니다.\n\nWi-Fi 또는 데이터 연결을 확인하고 다시 시도해주세요.";
      } else if (error.code === 'functions/internal') {
        errorMessage = "🔧 서버 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  // 닉네임 변경
  const handleNicknameChange = async () => {
    if (!newNickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (newNickname.length > 10) {
      alert('닉네임은 10자 이하로 입력해주세요.');
      return;
    }
    try {
      await updateUserData(user.uid, { nickname: newNickname.trim(), nicknameChanged: true });
      setNickname(newNickname.trim());
      setEditingNickname(false);
      setNewNickname('');
      setShowNicknameAlert(false);
      alert('닉네임이 변경되었습니다!');
    } catch (error) {
      alert('닉네임 변경에 실패했습니다.');
    }
  };

  // 닉네임 알림 모달에서 변경
  const handleNicknameAlertSave = async () => {
    if (!nicknameAlertInput.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (nicknameAlertInput.length > 10) {
      alert('닉네임은 10자 이하로 입력해주세요.');
      return;
    }
    try {
      await updateUserData(user.uid, { nickname: nicknameAlertInput.trim(), nicknameChanged: true });
      setNickname(nicknameAlertInput.trim());
      setShowNicknameAlert(false);
      setNicknameAlertInput('');
      alert('닉네임이 설정되었습니다! 환영합니다!');
    } catch (error) {
      alert('닉네임 설정에 실패했습니다.');
    }
  };

  // 아이템 구매
  const handlePurchaseItem = async (item, category) => {
    if (ownedItems.includes(item.id)) {
      alert('이미 보유한 아이템입니다.');
      return;
    }
    if (points < item.price) {
      alert(`포인트가 부족합니다. (필요: ${item.price}P, 보유: ${points}P)`);
      return;
    }
    if (!confirm(`${item.name}을(를) ${item.price}P로 구매하시겠습니까?`)) return;

    try {
      const newOwnedItems = [...ownedItems, item.id];
      const newPoints = points - item.price;

      await updateUserData(user.uid, {
        ownedItems: newOwnedItems,
        points: newPoints
      });

      // 로컬 state 즉시 업데이트
      setOwnedItems(newOwnedItems);
      setPoints(newPoints);

      alert(`${item.name}을(를) 구매했습니다!\n이제 '장착' 버튼을 눌러 아바타에 적용하세요.`);
    } catch (error) {
      console.error('구매 실패:', error);
      alert('구매에 실패했습니다: ' + error.message);
    }
  };

  // 아이템 장착 (아바타)
  const handleEquipItem = async (item, category) => {
    if (!ownedItems.includes(item.id)) {
      alert('먼저 아이템을 구매해주세요.');
      return;
    }
    const categoryMap = {
      faces: 'face',
      hair: 'hair',
      hairColor: 'hairColor',
      clothes: 'clothes',
      accessories: 'accessory',
      backgrounds: 'background',
      frames: 'frame'
    };
    const categoryKey = categoryMap[category] || category;
    const newEquippedItems = { ...equippedItems, [categoryKey]: item.id };

    try {
      await updateUserData(user.uid, { equippedItems: newEquippedItems });
      setEquippedItems(newEquippedItems);
    } catch (error) {
      console.error('장착 실패:', error);
      alert('장착에 실패했습니다: ' + error.message);
    }
  };

  // 마이룸 아이템 장착
  const handleEquipRoomItem = async (item, category) => {
    if (!ownedItems.includes(item.id)) {
      alert('먼저 아이템을 구매해주세요.');
      return;
    }
    const categoryMap = {
      furniture: 'furniture',
      electronics: 'electronics',
      vehicles: 'vehicle',
      pets: 'pet',
      wallpaper: 'wallpaper'
    };
    const categoryKey = categoryMap[category];

    let newRoomItems;
    if (category === 'decorations') {
      // 장식품은 여러 개 추가 가능
      const currentDecos = roomItems.decorations || [];
      if (currentDecos.includes(item.id)) {
        newRoomItems = { ...roomItems, decorations: currentDecos.filter(d => d !== item.id) };
      } else {
        newRoomItems = { ...roomItems, decorations: [...currentDecos, item.id] };
      }
    } else {
      newRoomItems = { ...roomItems, [categoryKey]: item.id };
    }

    try {
      await updateUserData(user.uid, { roomItems: newRoomItems });
      setRoomItems(newRoomItems);
    } catch (error) {
      alert('장착에 실패했습니다.');
    }
  };

  // 현재 장착 아이템 가져오기
  const getEquippedFace = () => AVATAR_ITEMS.faces.find(f => f.id === equippedItems.face) || AVATAR_ITEMS.faces[0];
  const getEquippedHair = () => AVATAR_ITEMS.hair.find(h => h.id === equippedItems.hair) || AVATAR_ITEMS.hair[0];
  const getEquippedHairColor = () => AVATAR_ITEMS.hairColor.find(h => h.id === equippedItems.hairColor) || AVATAR_ITEMS.hairColor[0];
  const getEquippedClothes = () => AVATAR_ITEMS.clothes.find(c => c.id === equippedItems.clothes) || AVATAR_ITEMS.clothes[0];
  const getEquippedAccessory = () => AVATAR_ITEMS.accessories.find(a => a.id === equippedItems.accessory) || AVATAR_ITEMS.accessories[0];
  const getEquippedBackground = () => AVATAR_ITEMS.backgrounds.find(b => b.id === equippedItems.background) || AVATAR_ITEMS.backgrounds[0];
  const getEquippedFrame = () => AVATAR_ITEMS.frames.find(f => f.id === equippedItems.frame) || AVATAR_ITEMS.frames[0];

  // 미리보기용 아이템 가져오기 (미리보기가 있으면 미리보기 아이템 사용)
  const getPreviewFace = () => {
    if (previewItem?.category === 'faces') return previewItem.item;
    return getEquippedFace();
  };
  const getPreviewHair = () => {
    if (previewItem?.category === 'hair') return previewItem.item;
    return getEquippedHair();
  };
  const getPreviewHairColor = () => {
    if (previewItem?.category === 'hairColor') return previewItem.item;
    return getEquippedHairColor();
  };
  const getPreviewClothes = () => {
    if (previewItem?.category === 'clothes') return previewItem.item;
    return getEquippedClothes();
  };
  const getPreviewAccessory = () => {
    if (previewItem?.category === 'accessories') return previewItem.item;
    return getEquippedAccessory();
  };
  const getPreviewBackground = () => {
    if (previewItem?.category === 'backgrounds') return previewItem.item;
    return getEquippedBackground();
  };
  const getPreviewFrame = () => {
    if (previewItem?.category === 'frames') return previewItem.item;
    return getEquippedFrame();
  };

  // 아이템 미리보기 설정
  const handlePreviewItem = (item, category) => {
    setPreviewItem({ item, category });
  };

  // 미리보기 취소
  const handleCancelPreview = () => {
    setPreviewItem(null);
  };

  // 마이룸 아이템 미리보기 설정
  const handlePreviewRoomItem = (item, category) => {
    setPreviewRoomItem({ item, category });
  };

  // 마이룸 미리보기 취소
  const handleCancelRoomPreview = () => {
    setPreviewRoomItem(null);
  };

  // 마이룸 미리보기 아이템 가져오기 (각 카테고리별)
  const getPreviewRoomFurniture = () => {
    if (previewRoomItem?.category === 'furniture') return previewRoomItem.item.id;
    return roomItems.furniture || 'furn1';
  };
  const getPreviewRoomElectronics = () => {
    if (previewRoomItem?.category === 'electronics') return previewRoomItem.item.id;
    return roomItems.electronics || 'elec1';
  };
  const getPreviewRoomWallpaper = () => {
    if (previewRoomItem?.category === 'wallpaper') return previewRoomItem.item.id;
    return roomItems.wallpaper || 'wall1';
  };
  const getPreviewRoomVehicle = () => {
    if (previewRoomItem?.category === 'vehicles') return previewRoomItem.item.id;
    return roomItems.vehicle;
  };
  const getPreviewRoomPet = () => {
    if (previewRoomItem?.category === 'pets') return previewRoomItem.item.id;
    return roomItems.pet;
  };
  const getPreviewRoomDecorations = () => {
    if (previewRoomItem?.category === 'decorations') {
      // 미리보기 아이템을 기존 장식에 추가해서 보여줌
      const existing = roomItems.decorations || [];
      if (!existing.includes(previewRoomItem.item.id)) {
        return [...existing, previewRoomItem.item.id].slice(-3); // 최대 3개
      }
    }
    return roomItems.decorations || [];
  };

  // 상점 아이템 가져오기
  const getShopItems = () => {
    if (shopCategory === 'avatar') {
      return AVATAR_ITEMS[avatarTab] || [];
    } else {
      return ROOM_ITEMS[avatarTab] || [];
    }
  };

  // 아이템이 장착되었는지 확인
  const isItemEquipped = (item, category) => {
    if (shopCategory === 'avatar') {
      const categoryMap = {
        faces: 'face',
        hair: 'hair',
        hairColor: 'hairColor',
        clothes: 'clothes',
        accessories: 'accessory',
        backgrounds: 'background',
        frames: 'frame'
      };
      return equippedItems[categoryMap[category]] === item.id;
    } else {
      const categoryMap = {
        furniture: 'furniture',
        electronics: 'electronics',
        vehicles: 'vehicle',
        pets: 'pet',
        wallpaper: 'wallpaper'
      };
      if (category === 'decorations') {
        return (roomItems.decorations || []).includes(item.id);
      }
      return roomItems[categoryMap[category]] === item.id;
    }
  };

  const wordCountStatus = getWordCountStatus();
  const standard = wordCountStatus.standard || WORD_COUNT_STANDARDS[userData.gradeLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {showConfetti && <Confetti />}

      {/* 닉네임 변경 알림 모달 */}
      {showNicknameAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-bounce-in">
            {/* 아이콘 */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">👋</span>
              </div>
            </div>

            {/* 제목 */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              환영합니다!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              친구들이 알아볼 수 있도록<br />
              <span className="font-semibold text-blue-600">나만의 닉네임</span>을 설정해주세요!
            </p>

            {/* 입력 필드 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임 (최대 10자)
              </label>
              <input
                type="text"
                value={nicknameAlertInput}
                onChange={(e) => setNicknameAlertInput(e.target.value)}
                placeholder="예: 글쓰기왕, 책벌레123"
                maxLength={10}
                className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {nicknameAlertInput.length}/10
              </p>
            </div>

            {/* 버튼 */}
            <button
              onClick={handleNicknameAlertSave}
              disabled={!nicknameAlertInput.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                nicknameAlertInput.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              시작하기
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
              닉네임은 나중에 프로필에서 변경할 수 있어요
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 text-white shadow-xl relative overflow-hidden">
        {/* 마법 효과 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 left-10 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute top-4 right-20 w-2 h-2 bg-yellow-200 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 로고 */}
            <div className="relative inline-block">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                싹
              </span>
              {/* 붓 터치 효과 */}
              <svg className="absolute -top-1 -right-3 w-5 h-6 sm:w-6 sm:h-8" viewBox="0 0 48 64" fill="none">
                <path
                  d="M8 56 Q12 48, 16 36 Q20 24, 28 14 Q34 6, 44 2"
                  stroke="url(#brushGradientHeader)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="brushGradientHeader" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute -top-2 right-[-14px] text-xs sm:text-sm animate-pulse" style={{ textShadow: '0 0 8px #fef08a' }}>✨</span>
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-widest text-cyan-200 opacity-80">SSAK</span>

            {/* 아바타 + 레벨 + 업적 + 사용자 정보 */}
            <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-white/20 flex items-center gap-2 sm:gap-3">
              {/* 미니 아바타 - 상반신 형태 (옷 위에 얼굴) */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${getEquippedBackground().color} ${getEquippedFrame().style} flex items-center justify-center overflow-hidden relative`}>
                {(() => {
                  const face = getEquippedFace();
                  const hair = getEquippedHair();
                  const hairColor = getEquippedHairColor();
                  const clothes = getEquippedClothes();
                  const accessory = getEquippedAccessory();
                  const avatarSize = 32;
                  // 🎨 은발 등 defaultColor가 있으면 우선 사용
                  const actualHairColor = hair.defaultColor || hairColor.color || '#1a1a1a';

                  if (face.svgType === 'human') {
                    return (
                      <div className="relative" style={{ width: avatarSize, height: avatarSize * 1.2 }}>
                        {/* 옷 (상반신 아래쪽) - 팔, 목 포함 */}
                        {clothes.svgType && clothes.svgType !== 'none' && (
                          <div className="absolute" style={{ bottom: -avatarSize * 0.4, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                            <ClothesSVG type={clothes.svgType} color={clothes.color} size={avatarSize * 0.9} skinColor={face.skinColor || '#FFD5B8'} />
                          </div>
                        )}
                        {/* 얼굴 (상반신 위쪽) */}
                        <div className="absolute" style={{ top: -avatarSize * 0.15, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                          <FaceSVG skinColor={face.skinColor} expression={face.expression} size={avatarSize * 0.85} gender={face.gender || 'male'} />
                        </div>
                        {/* 머리카락 (얼굴 위 레이어) */}
                        {hair.svgStyle && hair.svgStyle !== 'none' && (
                          <div className="absolute" style={{ top: -avatarSize * 0.15, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                            <HairSVG style={hair.svgStyle} color={actualHairColor} size={avatarSize * 0.85} />
                          </div>
                        )}
                        {/* 악세서리 (맨 앞) - 모자가 눈썹 안 가리도록 위치 조정 */}
                        {accessory.svgType && accessory.svgType !== 'none' && (
                          <div className="absolute" style={{ top: -avatarSize * 0.28, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
                            <AccessorySVG type={accessory.svgType} size={avatarSize * 0.85} />
                          </div>
                        )}
                      </div>
                    );
                  } else if (face.svgType === 'animal' && face.animalType) {
                    // 머리카락이 어울리지 않는 특수 동물 타입들
                    const noHairAnimals = ['butterfly', 'frog', 'swan', 'tropicalfish', 'shark', 'octopus', 'ghost', 'alien', 'robot', 'pumpkin'];
                    const showHair = !noHairAnimals.includes(face.animalType);

                    return (
                      <div className="relative" style={{ width: avatarSize, height: avatarSize * 1.2 }}>
                        {/* 옷 (상반신 아래쪽) - 동물은 기본 피부색 */}
                        {clothes.svgType && clothes.svgType !== 'none' && (
                          <div className="absolute" style={{ bottom: -avatarSize * 0.4, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                            <ClothesSVG type={clothes.svgType} color={clothes.color} size={avatarSize * 0.9} skinColor="#FFD5B8" />
                          </div>
                        )}
                        {/* 동물 얼굴 (상반신 위쪽) */}
                        <div className="absolute" style={{ top: -avatarSize * 0.15, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                          <AnimalFaceSVG type={face.animalType} size={avatarSize * 0.85} />
                        </div>
                        {/* 머리카락 - 특수 동물은 표시 안함 */}
                        {showHair && hair.svgStyle && hair.svgStyle !== 'none' && (
                          <div className="absolute" style={{ top: -avatarSize * 0.15, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                            <HairSVG style={hair.svgStyle} color={actualHairColor} size={avatarSize * 0.85} />
                          </div>
                        )}
                        {/* 악세서리 (맨 앞) - 모자가 눈썹 안 가리도록 위치 조정 */}
                        {accessory.svgType && accessory.svgType !== 'none' && (
                          <div className="absolute" style={{ top: -avatarSize * 0.28, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
                            <AccessorySVG type={accessory.svgType} size={avatarSize * 0.85} />
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return <span className="text-sm sm:text-lg">{face.emoji}</span>;
                  }
                })()}
              </div>

              {/* 레벨 표시 */}
              {(() => {
                const levelInfo = getLevelInfo(totalPoints); // 누적 포인트로 레벨 계산
                return (
                  <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r ${levelInfo.color} shadow-md`}>
                    <span className="text-xs sm:text-sm">{levelInfo.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-white whitespace-nowrap">Lv.{levelInfo.level}</span>
                  </div>
                );
              })()}

              {/* 🚀 비용 최적화: 메달 표시 제거 (랭킹 탭에서만 확인) */}

              {/* 업적 표시 - 가장 좋은 업적만 */}
              {(() => {
                const scores = writings.map(w => w.score || 0);
                const wordCounts = writings.map(w => (w.content || '').length);

                const earnedAchievements = checkAchievements({
                  totalSubmissions: writings.length,
                  highestScore: scores.length > 0 ? Math.max(...scores) : 0,
                  totalPoints: totalPoints, // 누적 포인트 사용
                  maxWordCount: wordCounts.length > 0 ? Math.max(...wordCounts) : 0
                });

                // 가장 좋은 업적 (배열 끝에서부터 선택)
                const bestAchievement = earnedAchievements.length > 0 ? earnedAchievements[earnedAchievements.length - 1] : null;

                return bestAchievement ? (
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/10 backdrop-blur border border-white/20 shadow-md">
                    <span className="text-xs sm:text-sm">{bestAchievement.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-medium text-white whitespace-nowrap hidden sm:inline">{bestAchievement.name}</span>
                  </div>
                ) : null;
              })()}

              <div className="hidden sm:block">
                <p className="text-sm text-white font-medium">
                  {nickname}
                </p>
                <p className="text-xs text-blue-200">
                  {GRADE_LEVELS[userData.gradeLevel]} {classInfo && `· ${classInfo.className}`}
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 포인트 + 로그아웃 */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* 포인트 표시 */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <span className="text-sm sm:text-lg">💎</span>
              <span className="font-bold text-amber-900 text-xs sm:text-sm">{points}P</span>
            </div>
            {/* 로그아웃 버튼 - 모바일에서 2줄 표시 */}
            <button
              onClick={handleLogout}
              className="bg-white/15 backdrop-blur border border-white/20 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl hover:bg-white/25 transition-all text-[10px] sm:text-sm leading-tight text-center"
            >
              <span className="sm:hidden">로그<br/>아웃</span>
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs - 모바일 최적화 */}
        <div className="mb-6">
          <nav className="grid grid-cols-5 gap-1 sm:flex sm:space-x-2 bg-white/80 backdrop-blur p-1.5 rounded-2xl shadow-sm border border-blue-100">
            <button
              onClick={() => handleTabChange("write")}
              className={`${
                activeTab === "write"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
              } flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all`}
            >
              <span>✍️</span> <span className="hidden sm:inline">글쓰기</span><span className="sm:hidden">글쓰기</span>
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`${
                activeTab === "history"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
              } flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all`}
            >
              <span>📋</span> <span className="hidden sm:inline">제출 기록</span><span className="sm:hidden">기록</span>
            </button>
            <button
              onClick={() => handleTabChange("ranking")}
              className={`${
                activeTab === "ranking"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
              } flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all`}
            >
              <span>🏆</span> <span className="hidden sm:inline">학급랭킹</span><span className="sm:hidden">랭킹</span>
            </button>
            <button
              onClick={() => handleTabChange("stats")}
              className={`${
                activeTab === "stats"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
              } flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all`}
            >
              <span>📊</span> <span className="hidden sm:inline">통계</span><span className="sm:hidden">통계</span>
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
              } flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all`}
            >
              <span>👤</span> <span className="hidden sm:inline">내 프로필</span><span className="sm:hidden">프로필</span>
            </button>
          </nav>
        </div>

        {/* Write Tab */}
        {activeTab === "write" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topic Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm">📚</span>
                    선생님 과제
                  </h3>
                  {completedAssignmentsCount > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      <span>✅</span>
                      <span>{completedAssignmentsCount}개 완료!</span>
                    </div>
                  )}
                </div>

                {/* 남은 과제 수 표시 */}
                {(assignments.length > 0 || completedAssignmentsCount > 0) && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">남은 과제</span>
                      <span className="font-bold text-blue-600">{assignments.length}개</span>
                    </div>
                    {completedAssignmentsCount > 0 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                          style={{ width: `${(completedAssignmentsCount / (completedAssignmentsCount + assignments.length)) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {/* 교사 과제 */}
                  {assignments.length > 0 ? (
                    <div className="space-y-2">
                      {assignments.map((assignment) => {
                        const assignmentMinScore = assignment.minScore !== undefined ? assignment.minScore : PASSING_SCORE;

                        return (
                        <button
                          key={assignment.id}
                          onClick={() => handleTopicSelect({
                            id: assignment.id,
                            title: assignment.title,
                            description: assignment.description,
                            isAssignment: true,
                            minScore: assignmentMinScore
                          })}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedTopic?.id === assignment.id
                              ? "border-purple-500 bg-purple-50 shadow-md"
                              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-semibold text-gray-900">{assignment.title}</div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">과제</span>
                          </div>
                          {assignment.description && (
                            <div className="text-sm text-gray-600 mt-2">{assignment.description}</div>
                          )}
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                              <span>⏰</span>
                              <span>마감: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              목표 {assignmentMinScore}점+
                            </span>
                          </div>
                        </button>
                        );
                      })}
                    </div>
                  ) : completedAssignmentsCount > 0 ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🎉</span>
                      </div>
                      <p className="text-emerald-700 font-semibold text-lg">모든 과제를 완료했어요!</p>
                      <p className="text-emerald-600 text-sm mt-1">총 {completedAssignmentsCount}개의 과제를 성공적으로 마쳤습니다</p>
                      <p className="text-gray-400 text-xs mt-3">새 과제가 출제되면 여기에 표시됩니다</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📭</span>
                      </div>
                      <p className="text-gray-500 text-sm">아직 출제된 과제가 없습니다.</p>
                      <p className="text-gray-400 text-xs mt-1">선생님이 과제를 출제하면 여기에 표시됩니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Writing Area */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                {selectedTopic ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{currentWriting.topic}</h3>
                      {/* 🚀 과제 설명 표시 */}
                      {selectedTopic.description && (
                        <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                          <p className="text-sm text-blue-700">{selectedTopic.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">글자수</span>
                          {standard.writingType && standard.writingType !== '기본' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {standard.writingType}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${wordCountStatus.color}`}>
                          {currentWriting.wordCount}자 / {standard.ideal}자 권장
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            wordCountStatus.status === "ideal"
                              ? "bg-emerald-500"
                              : wordCountStatus.status === "ok"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min((currentWriting.wordCount / standard.max) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${wordCountStatus.color}`}>{wordCountStatus.message}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">범위: {standard.min}자 ~ {standard.max}자</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {isSaving ? (
                            <>
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              저장 중...
                            </>
                          ) : lastSavedAt ? (
                            <>
                              💾 {lastSavedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 저장됨
                            </>
                          ) : (
                            ''
                          )}
                        </p>
                      </div>
                    </div>

                    {/* 고쳐쓰기 모드 배너 */}
                    {rewriteMode && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">✏️</span>
                            <div>
                              <h4 className="font-bold text-orange-800">고쳐쓰기 모드</h4>
                              <p className="text-xs text-orange-600">이전 점수: {rewriteMode.score}점 → {rewriteMode.minScore || PASSING_SCORE}점 이상 목표!</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setRewriteMode(null)}
                            className="text-orange-500 hover:text-orange-700 text-sm"
                          >
                            모드 종료 ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 고쳐쓰기 모드: 수정 필요 부분 강조된 원본 글 미리보기 */}
                    {rewriteMode && rewriteMode.detailedFeedback && rewriteMode.detailedFeedback.length > 0 && (
                      <div className="mb-3 p-3 bg-white border-2 border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-orange-700">📌 수정이 필요한 부분 (빨간색 표시)</span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {(() => {
                            let highlightedContent = currentWriting.content;
                            // 수정이 필요한 문장들을 빨간색으로 강조
                            rewriteMode.detailedFeedback.forEach(item => {
                              if (item.original && highlightedContent.includes(item.original)) {
                                highlightedContent = highlightedContent.replace(
                                  item.original,
                                  `<mark class="bg-red-200 text-red-800 px-1 rounded">${item.original}</mark>`
                                );
                              }
                            });
                            return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
                          })()}
                        </div>
                      </div>
                    )}

                    {/* 글자 수 축하 애니메이션 */}
                    {showWordCountCelebration && (
                      <div className="mb-3 p-4 bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 border-2 border-yellow-400 rounded-xl animate-bounce">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl">🎉</span>
                          <div className="text-center">
                            <p className="font-bold text-amber-800 text-lg">{lastWordCountMilestone}자 달성!</p>
                            <p className="text-amber-600 text-sm">대단해요! 계속 써보세요!</p>
                          </div>
                          <span className="text-3xl">🎉</span>
                        </div>
                      </div>
                    )}

                    {/* 음성 입력 & 템플릿 버튼 */}
                    <div className="mb-3 flex gap-2">
                      {speechSupported && (
                        <button
                          onClick={toggleSpeechRecognition}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            isListening
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <span className="w-3 h-3 bg-white rounded-full animate-ping" />
                              🎤 말하는 중...
                            </>
                          ) : (
                            <>🎤 음성 입력</>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setShowTemplateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg font-medium hover:from-emerald-200 hover:to-teal-200 transition-all"
                      >
                        📋 템플릿
                      </button>
                    </div>

                    <textarea
                      value={currentWriting.content}
                      onChange={handleContentChange}
                      onPaste={(e) => {
                        e.preventDefault();
                        alert('붙여넣기가 차단되었습니다.\n\n직접 글을 작성해 주세요! ✍️\n\nAI 힌트는 참고만 하고, 자신의 말로 다시 써보세요.');
                      }}
                      placeholder={isListening ? "말씀하세요... 음성이 텍스트로 변환됩니다." : "주제에 맞춰 글을 작성해 보세요..."}
                      className={`w-full h-64 px-4 py-3 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                        rewriteMode ? 'border-orange-300 bg-orange-50/30' : isListening ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                      }`}
                    />

                    {/* AI 도움 버튼 */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleGetAIHelp('hint')}
                        disabled={loadingHelp}
                        className="flex-1 min-w-[100px] bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm hover:bg-emerald-200 disabled:opacity-50 font-medium"
                      >
                        💡 힌트
                      </button>
                      <button
                        onClick={() => handleGetAIHelp('polish')}
                        disabled={loadingHelp || !currentWriting.content}
                        className="flex-1 min-w-[100px] bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 disabled:opacity-50 font-medium"
                      >
                        ✨ 표현 다듬기
                      </button>
                      <button
                        onClick={() => handleGetAIHelp('expand')}
                        disabled={loadingHelp || !currentWriting.content}
                        className="flex-1 min-w-[100px] bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 disabled:opacity-50 font-medium"
                      >
                        📝 확장
                      </button>
                    </div>

                    {/* 실시간 조언 버튼 (비용 최적화) */}
                    <div className="mt-2">
                      {currentWriting.wordCount < 20 && (
                        <p className="text-xs text-gray-500 mb-1 text-center">
                          💡 20자 이상 작성하면 AI 조언을 받을 수 있어요! ({currentWriting.wordCount}/20자)
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleGetQuickAdvice('next')}
                          disabled={loadingQuickAdvice || currentWriting.wordCount < 20}
                          className="flex-1 min-w-[100px] bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-2 rounded-lg text-sm hover:from-amber-200 hover:to-orange-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-amber-200 transition-all"
                          title="다음에 쓸 내용에 대한 힌트를 받아요"
                        >
                          {loadingQuickAdvice ? '...' : '🚀 다음 문장'}
                        </button>
                        <button
                          onClick={() => handleGetQuickAdvice('improve')}
                          disabled={loadingQuickAdvice || currentWriting.wordCount < 20}
                          className="flex-1 min-w-[100px] bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-3 py-2 rounded-lg text-sm hover:from-cyan-200 hover:to-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-cyan-200 transition-all"
                          title="마지막 문장을 더 좋게 개선해요"
                        >
                          {loadingQuickAdvice ? '...' : '✨ 문장 개선'}
                        </button>
                        <button
                          onClick={() => handleGetQuickAdvice('check')}
                          disabled={loadingQuickAdvice || currentWriting.wordCount < 20}
                          className="flex-1 min-w-[100px] bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-3 py-2 rounded-lg text-sm hover:from-rose-200 hover:to-pink-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-rose-200 transition-all"
                          title="맞춤법과 문법 오류를 체크해요"
                        >
                          {loadingQuickAdvice ? '...' : '🔍 맞춤법/문법'}
                        </button>
                      </div>
                    </div>

                    {/* 실시간 조언 결과 */}
                    {quickAdvice && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm text-amber-800 mb-1 flex items-center gap-1">
                              {quickAdvice.type === 'next' && '🚀 다음에 쓸 내용'}
                              {quickAdvice.type === 'improve' && '✨ 문장 개선 제안'}
                              {quickAdvice.type === 'check' && '🔍 맞춤법/문법 체크'}
                              {quickAdvice.type === 'encourage' && '💪 응원 메시지'}
                            </h5>
                            <p className="text-sm text-amber-900">{quickAdvice.advice}</p>
                          </div>
                          <button
                            onClick={() => setQuickAdvice(null)}
                            className="text-amber-600 hover:text-amber-800 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI 도움 결과 */}
                    {aiHelp && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-yellow-900 mb-2">
                              {aiHelp.type === 'hint' && '💡 힌트'}
                              {aiHelp.type === 'polish' && '✨ 표현 다듬기'}
                              {aiHelp.type === 'expand' && '📝 확장 아이디어'}
                              {aiHelp.type === 'grammar' && '✏️ 문법 검사'}
                            </h5>

                            {/* 힌트 타입 */}
                            {aiHelp.type === 'hint' && aiHelp.content && (
                              <div className="space-y-2">
                                {aiHelp.content.hints && (
                                  <div>
                                    <p className="text-xs font-medium text-yellow-700 mb-1">💡 힌트:</p>
                                    <ul className="space-y-1">
                                      {aiHelp.content.hints.map((hint, idx) => (
                                        <li key={idx} className="text-sm text-yellow-800 pl-2 border-l-2 border-yellow-300">
                                          {hint}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {aiHelp.content.questions && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-yellow-700 mb-1">❓ 생각해볼 질문:</p>
                                    <ul className="space-y-1">
                                      {aiHelp.content.questions.map((q, idx) => (
                                        <li key={idx} className="text-sm text-yellow-800 pl-2 border-l-2 border-orange-300">
                                          {q}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 표현 다듬기 타입 */}
                            {aiHelp.type === 'polish' && aiHelp.content && (
                              <div className="space-y-2">
                                {aiHelp.content.praise && (
                                  <div className="bg-green-50 p-2 rounded border border-green-200">
                                    <p className="text-sm text-green-700">👏 {aiHelp.content.praise}</p>
                                  </div>
                                )}
                                {aiHelp.content.suggestions && aiHelp.content.suggestions.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-yellow-700 mb-1">✏️ 표현 개선 제안:</p>
                                    <ul className="space-y-1.5">
                                      {aiHelp.content.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-xs text-yellow-800 bg-white p-2 rounded border border-yellow-100">
                                          <div className="flex flex-wrap items-start gap-1">
                                            <span className="line-through text-red-500">"{suggestion.original}"</span>
                                            <span className="mx-1">→</span>
                                            <span className="text-green-600 font-medium">"{suggestion.improved}"</span>
                                          </div>
                                          {suggestion.reason && <p className="text-gray-500 mt-1 text-xs">💡 {suggestion.reason}</p>}
                                        </li>
                                      ))}
                                    </ul>
                                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                                      ⚠️ 참고만 하고, 자신의 표현으로 직접 수정해보세요!
                                    </p>
                                  </div>
                                )}
                                {aiHelp.content.tips && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-yellow-700 mb-1">💡 팁:</p>
                                    <ul className="list-disc list-inside text-xs text-yellow-800">
                                      {aiHelp.content.tips.map((tip, idx) => (
                                        <li key={idx}>{tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 확장 아이디어 타입 */}
                            {aiHelp.type === 'expand' && aiHelp.content && (
                              <div className="space-y-2">
                                {aiHelp.content.expandIdeas && (
                                  <div>
                                    <p className="text-xs font-medium text-yellow-700 mb-1">💡 확장 아이디어:</p>
                                    <ul className="space-y-1">
                                      {aiHelp.content.expandIdeas.map((idea, idx) => (
                                        <li key={idx} className="text-sm text-yellow-800 pl-2 border-l-2 border-purple-300">
                                          {idea}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {aiHelp.content.detailSuggestions && aiHelp.content.detailSuggestions.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-yellow-700 mb-1">📝 세부 제안:</p>
                                    <ul className="space-y-1">
                                      {aiHelp.content.detailSuggestions.map((s, idx) => (
                                        <li key={idx} className="text-xs text-yellow-800 bg-white p-1.5 rounded">
                                          <span className="font-medium text-purple-700">{s.part}:</span> {s.suggestion}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {aiHelp.content.examples && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-yellow-700 mb-1">📌 예시:</p>
                                    <ul className="list-disc list-inside text-xs text-yellow-800">
                                      {aiHelp.content.examples.map((ex, idx) => (
                                        <li key={idx}>{ex}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 문법 검사 타입 */}
                            {aiHelp.type === 'grammar' && aiHelp.content && (
                              <div>
                                {aiHelp.content.hasErrors ? (
                                  <div>
                                    <p className="text-sm text-yellow-800 mb-2">발견된 오류:</p>
                                    <ul className="space-y-1">
                                      {aiHelp.content.errors?.map((error, idx) => (
                                        <li key={idx} className="text-xs text-yellow-700">
                                          <strong>{error.text}</strong> → {error.correction}
                                          <br />
                                          <span className="text-gray-600">{error.explanation}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <p className="text-sm text-yellow-800">문법 오류가 발견되지 않았습니다! 👍</p>
                                )}
                              </div>
                            )}

                            {/* 기본 조언 (fallback) */}
                            {!['hint', 'polish', 'expand', 'grammar'].includes(aiHelp.type) && aiHelp.content && (
                              <div>
                                {aiHelp.content.advice && (
                                  <p className="text-sm text-yellow-800">{aiHelp.content.advice}</p>
                                )}
                                {aiHelp.content.tips && (
                                  <ul className="mt-1 list-disc list-inside text-xs text-yellow-700">
                                    {aiHelp.content.tips.map((tip, idx) => (
                                      <li key={idx}>{tip}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setAiHelp(null)}
                            className="text-yellow-700 hover:text-yellow-900 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 고쳐쓰기 모드 - AI 제안 패널 */}
                    {rewriteMode && rewriteMode.detailedFeedback && rewriteMode.detailedFeedback.length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
                        <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-sm">📝</span>
                          AI가 제안하는 수정 사항
                        </h4>
                        <div className="space-y-3">
                          {rewriteMode.detailedFeedback.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
                              <div className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                <div className="flex-1">
                                  {/* 원본 문장 - 빨간색 강조 */}
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-500 block mb-1">원본:</span>
                                    <p className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded border-l-4 border-red-400 font-medium">
                                      "{item.original}"
                                    </p>
                                  </div>
                                  {/* 제안 문장 - 초록색 강조 */}
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-500 block mb-1">이렇게 고쳐보세요:</span>
                                    <p className="text-sm bg-emerald-50 text-emerald-700 px-2 py-1 rounded border-l-4 border-emerald-400 font-medium">
                                      "{item.suggestion}"
                                    </p>
                                  </div>
                                  {/* 이유 */}
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <span className="text-amber-500">💡</span> {item.reason}
                                    {item.type && (
                                      <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                                        item.type === 'grammar' ? 'bg-blue-100 text-blue-600' :
                                        item.type === 'vocabulary' ? 'bg-purple-100 text-purple-600' :
                                        item.type === 'structure' ? 'bg-green-100 text-green-600' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {item.type === 'grammar' ? '문법' :
                                         item.type === 'vocabulary' ? '어휘' :
                                         item.type === 'structure' ? '구조' :
                                         item.type === 'expression' ? '표현' : item.type}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 개선사항 목록 */}
                        {rewriteMode.improvements && rewriteMode.improvements.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-orange-200">
                            <h5 className="font-semibold text-orange-700 text-sm mb-2">💪 추가 개선 포인트</h5>
                            <ul className="space-y-1">
                              {rewriteMode.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-orange-600 flex items-start gap-2">
                                  <span className="text-orange-400">•</span>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 임시 저장 / 불러오기 버튼 */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || !currentWriting.content || !currentWriting.topic}
                        className="flex-1 bg-amber-500 text-white px-4 py-2 rounded font-medium hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {savingDraft ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            저장 중...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            임시 저장
                          </>
                        )}
                      </button>
                      {hasDraft && (
                        <button
                          onClick={handleLoadDraft}
                          disabled={loadingDraft}
                          className="flex-1 bg-teal-500 text-white px-4 py-2 rounded font-medium hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loadingDraft ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                              </svg>
                              불러오는 중...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              저장된 글 불러오기
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* 🧪 테스트 학생 점수 선택 UI */}
                    {isTestStudent && (
                      <div className="mt-2 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🧪</span>
                          <span className="font-bold text-yellow-700">테스트 모드</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setTestScoreMode(null)}
                            className={`px-3 py-2 rounded font-medium transition-all ${
                              testScoreMode === null
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            일반
                          </button>
                          <button
                            onClick={() => setTestScoreMode('pass')}
                            className={`px-3 py-2 rounded font-medium transition-all ${
                              testScoreMode === 'pass'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            ✅ 도달
                          </button>
                          <button
                            onClick={() => setTestScoreMode('fail')}
                            className={`px-3 py-2 rounded font-medium transition-all ${
                              testScoreMode === 'fail'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            ❌ 미달
                          </button>
                          <button
                            onClick={() => setTestScoreMode('custom')}
                            className={`px-3 py-2 rounded font-medium transition-all ${
                              testScoreMode === 'custom'
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            🎯 직접입력
                          </button>
                        </div>
                        {testScoreMode === 'custom' && (
                          <div className="mt-3 flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={customTestScore}
                              onChange={(e) => setCustomTestScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-20 px-3 py-2 border-2 border-purple-300 rounded-lg text-center font-bold text-lg focus:outline-none focus:border-purple-500"
                            />
                            <span className="text-purple-700 font-medium">점으로 제출</span>
                            <div className="flex gap-1 ml-2">
                              {[50, 65, 75, 85, 95].map(score => (
                                <button
                                  key={score}
                                  onClick={() => setCustomTestScore(score)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    customTestScore === score
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                  }`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {testScoreMode && testScoreMode !== 'custom' && (
                          <p className="mt-2 text-sm text-yellow-600">
                            {testScoreMode === 'pass'
                              ? '📌 제출 시 기준점수 이상의 점수로 저장됩니다.'
                              : '📌 제출 시 기준점수 미만의 점수로 저장됩니다.'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 제출/취소 버튼 */}
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !currentWriting.content}
                        className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded font-semibold hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "AI 분석 중..." : (isTestStudent && testScoreMode
                          ? `🧪 테스트 제출 (${testScoreMode === 'pass' ? '도달' : testScoreMode === 'fail' ? '미달' : `${customTestScore}점`})`
                          : "제출하기")}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentWriting({
                            topic: "",
                            content: "",
                            wordCount: 0,
                            gradeLevel: userData.gradeLevel,
                            studentName: userData.name
                          });
                          setSelectedTopic(null);
                          setFeedback(null);
                          setAiHelp(null);
                          setAiHelpHistory([]); // AI 도움 기록 초기화
                          setRewriteMode(null);
                          setHasDraft(false);
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded hover:bg-gray-300"
                      >
                        {rewriteMode ? '다른 주제 쓰기' : '취소'}
                      </button>
                    </div>

                  </>
                ) : feedback && submittedWriting ? (
                  /* 피드백 결과 화면 */
                  (() => {
                    const requiredScore = submittedWriting.minScore !== undefined ? submittedWriting.minScore : PASSING_SCORE;
                    const isPassed = feedback.score >= requiredScore;

                    return (
                  <div className="space-y-6">
                    {/* 헤더 - 점수 및 통과 여부 */}
                    <div className={`relative overflow-hidden rounded-2xl p-8 text-white ${
                      isPassed
                        ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
                        : 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500'
                    }`}>
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>

                      <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                          {isPassed ? (
                            <span className="text-3xl">🎉</span>
                          ) : (
                            <span className="text-3xl">💪</span>
                          )}
                        </div>
                        <h2 className="text-lg font-medium opacity-90 mb-2">
                          {isPassed ? '축하합니다!' : '조금만 더 노력해봐요!'}
                        </h2>
                        <div className="text-7xl font-black mb-2">{feedback.score}<span className="text-3xl">점</span></div>
                        <p className="text-sm opacity-80">
                          {isPassed
                            ? '기준 점수를 통과했어요!'
                            : `기준 점수 ${requiredScore}점까지 ${requiredScore - feedback.score}점 남았어요`}
                        </p>
                      </div>
                    </div>

                    {/* 🚀 저장 안됨 알림 (기존 미제출글보다 점수가 낮은 경우) */}
                    {feedback.notSaved && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💡</span>
                          <div>
                            <p className="font-medium text-amber-800">이 글은 저장되지 않았어요</p>
                            <p className="text-sm text-amber-600 mt-1">
                              같은 주제로 이전에 더 높은 점수의 글이 있어서, 기존 글이 유지됩니다.
                              <br />더 좋은 글을 작성하면 기존 글을 대체할 수 있어요!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 포인트 획득 축하 카드 */}
                    {feedback.earnedPoints > 0 ? (
                      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-2xl p-6 shadow-xl">
                        {/* 배경 장식 */}
                        <div className="absolute top-0 left-0 w-full h-full">
                          <div className="absolute top-2 left-4 text-4xl animate-bounce" style={{animationDelay: '0s'}}>⭐</div>
                          <div className="absolute top-4 right-6 text-3xl animate-bounce" style={{animationDelay: '0.2s'}}>🎉</div>
                          <div className="absolute bottom-3 left-8 text-2xl animate-bounce" style={{animationDelay: '0.4s'}}>✨</div>
                          <div className="absolute bottom-2 right-4 text-3xl animate-bounce" style={{animationDelay: '0.1s'}}>🌟</div>
                          <div className="absolute top-1/2 left-2 text-2xl animate-pulse">💎</div>
                          <div className="absolute top-1/2 right-2 text-2xl animate-pulse">💎</div>
                        </div>

                        {/* 메인 콘텐츠 */}
                        <div className="relative z-10 text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/30 backdrop-blur rounded-full mb-3 shadow-lg">
                            <span className="text-5xl">🎁</span>
                          </div>
                          <h3 className="text-2xl font-black text-white drop-shadow-lg mb-1">
                            포인트 획득!
                          </h3>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-5xl font-black text-white drop-shadow-lg">
                              +{feedback.earnedPoints}
                            </span>
                            <span className="text-3xl font-bold text-white/90">P</span>
                          </div>
                          <p className="text-white/90 text-sm font-medium">
                            {feedback.earnedPoints >= 60 ? '🏆 최고 점수 보너스!' :
                             feedback.earnedPoints >= 30 ? '🎯 목표 달성 보너스!' :
                             '👍 잘했어요!'}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                            <span className="text-yellow-900 text-sm font-semibold">
                              💰 상점에서 아이템을 구매해보세요!
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">💡</div>
                        <p className="text-sm text-gray-600 font-medium">
                          {feedback.score <= 50
                            ? '50점을 넘으면 포인트를 받을 수 있어요!'
                            : '80점을 달성하면 포인트를 받을 수 있어요!'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          고쳐쓰기로 점수를 올려보세요! 💪
                        </p>
                      </div>
                    )}

                    {/* 🚀 비용 최적화: 실시간 순위 표시 제거 - 랭킹 탭에서만 확인 가능 */}

                    {/* 제출한 글 내용 */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">{submittedWriting.topic}</h3>
                        <p className="text-xs text-gray-500 mt-1">{submittedWriting.wordCount}자</p>
                      </div>
                      <div className="p-5 max-h-48 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{submittedWriting.content}</p>
                      </div>
                    </div>

                    {/* 세부 점수 - 카드 그리드 */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                      {[
                        { label: '내용', score: feedback.contentScore, max: 25, color: 'from-blue-500 to-blue-600', icon: '📝' },
                        { label: '주제', score: feedback.topicRelevanceScore, max: 10, color: 'from-red-500 to-red-600', icon: '🎯' },
                        { label: '구성', score: feedback.structureScore, max: 20, color: 'from-purple-500 to-purple-600', icon: '🏗️' },
                        { label: '어휘', score: feedback.vocabularyScore, max: 20, color: 'from-pink-500 to-pink-600', icon: '📚' },
                        { label: '문법', score: feedback.grammarScore, max: 15, color: 'from-amber-500 to-amber-600', icon: '✏️' },
                        { label: '창의성', score: feedback.creativityScore, max: 10, color: 'from-emerald-500 to-emerald-600', icon: '💡' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                          <div className={`text-xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.score}/{item.max}
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                              style={{ width: `${(item.score / item.max) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI 활용 분석 */}
                    {feedback.aiUsageCheck && (
                      <div className={`rounded-xl border-2 p-5 ${
                        feedback.aiUsageCheck.verdict === 'HIGH'
                          ? 'bg-red-50 border-red-200'
                          : feedback.aiUsageCheck.verdict === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🤖</span>
                            <h4 className="font-semibold text-gray-800">AI 활용 분석</h4>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                            feedback.aiUsageCheck.verdict === 'HIGH'
                              ? 'bg-red-200 text-red-800'
                              : feedback.aiUsageCheck.verdict === 'MEDIUM'
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-emerald-200 text-emerald-800'
                          }`}>
                            AI 가능성 {feedback.aiUsageCheck.aiProbability}%
                          </div>
                        </div>
                        {feedback.aiUsageCheck.explanation && (
                          <p className="text-sm text-gray-700 mb-3">{feedback.aiUsageCheck.explanation}</p>
                        )}
                        {feedback.aiUsageCheck.humanLikeFeatures?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-emerald-700 font-medium mb-2">사람이 쓴 것 같은 특징:</p>
                            <div className="flex flex-wrap gap-2">
                              {feedback.aiUsageCheck.humanLikeFeatures.map((feature, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full text-xs text-emerald-700">
                                  <span>✓</span> {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {feedback.aiUsageCheck.aiLikeFeatures?.length > 0 && feedback.aiUsageCheck.verdict !== 'LOW' && (
                          <div>
                            <p className="text-xs text-amber-700 font-medium mb-2">AI가 쓴 것 같은 특징:</p>
                            <div className="flex flex-wrap gap-2">
                              {feedback.aiUsageCheck.aiLikeFeatures.map((feature, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white/60 rounded-full text-xs text-amber-700">
                                  <span>⚠️</span> {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 상세 피드백 */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
                      <h4 className="font-bold text-lg text-indigo-900 mb-5 flex items-center gap-2">
                        <span className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm">AI</span>
                        선생님의 피드백
                      </h4>

                      <div className="space-y-4">
                        {/* 좋은 점 */}
                        <div className="bg-white rounded-lg p-4 border border-emerald-200">
                          <h5 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">✨</span>
                            잘한 점
                          </h5>
                          <ul className="space-y-2">
                            {feedback.strengths?.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 개선 포인트 */}
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <h5 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">🎯</span>
                            이렇게 하면 더 좋아요
                          </h5>
                          <ul className="space-y-2">
                            {feedback.improvements?.map((improvement, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-orange-500 mt-0.5">•</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 상세 문장 피드백 (새로 추가) */}
                        {feedback.detailedFeedback && feedback.detailedFeedback.length > 0 && (
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <h5 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">✍️</span>
                              문장별 수정 제안
                            </h5>
                            <div className="space-y-4">
                              {feedback.detailedFeedback.map((item, idx) => (
                                <div key={idx} className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                                  <div className="flex items-start gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      item.type === 'grammar' ? 'bg-blue-100 text-blue-700' :
                                      item.type === 'vocabulary' ? 'bg-pink-100 text-pink-700' :
                                      item.type === 'structure' ? 'bg-amber-100 text-amber-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {item.type === 'grammar' ? '문법' :
                                       item.type === 'vocabulary' ? '어휘' :
                                       item.type === 'structure' ? '구성' : '표현'}
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                      <span className="text-red-500 font-medium whitespace-nowrap">원문:</span>
                                      <span className="text-gray-600 line-through">{item.original}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="text-emerald-600 font-medium whitespace-nowrap">수정:</span>
                                      <span className="text-gray-800 font-medium">{item.suggestion}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 pl-1">
                                      💡 {item.reason}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-purple-600 mt-3 flex items-center gap-1">
                              <span>⚠️</span>
                              수정 제안을 그대로 복사하면 AI 감지에 걸릴 수 있어요. 참고만 하세요!
                            </p>
                          </div>
                        )}

                        {/* 글쓰기 팁 */}
                        {feedback.writingTips && feedback.writingTips.length > 0 && (
                          <div className="bg-white rounded-lg p-4 border border-cyan-200">
                            <h5 className="font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center">📝</span>
                              글쓰기 팁
                            </h5>
                            <ul className="space-y-2">
                              {feedback.writingTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-cyan-500 mt-0.5">💡</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 종합 의견 */}
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <h5 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">💬</span>
                            종합 의견
                          </h5>
                          <p className="text-sm text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
                        </div>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex flex-wrap gap-3">
                      {isPassed ? (
                        // 기준 점수 달성 시 - 고쳐쓰기 + 새 글쓰기
                        <>
                          <button
                            disabled={isProcessingAction}
                            onClick={() => {
                              if (isProcessingAction) return;
                              setIsProcessingAction(true);
                              // 제출했던 글 내용을 다시 복원
                              setSelectedTopic({ id: 'rewrite', title: submittedWriting.topic });
                              setCurrentWriting({
                                topic: submittedWriting.topic,
                                content: submittedWriting.content,
                                wordCount: submittedWriting.wordCount,
                                gradeLevel: userData.gradeLevel,
                                studentName: userData.name,
                                minScore: requiredScore,
                                isAssignment: submittedWriting.isAssignment,
                                previousScore: feedback.score  // 이전 점수 저장 (고쳐쓰기 보너스용)
                              });
                              // 고쳐쓰기 모드 - AI 제안 저장 (minScore + 원본 내용 포함)
                              setRewriteMode({
                                detailedFeedback: feedback.detailedFeedback || [],
                                improvements: feedback.improvements || [],
                                score: feedback.score,
                                minScore: requiredScore,
                                originalContent: submittedWriting.content // 원본 내용 저장 (고쳐쓰기 검증용)
                              });
                              // 피드백 닫기
                              setFeedback(null);
                              setSubmittedWriting(null);
                              setTimeout(() => setIsProcessingAction(false), 500);
                            }}
                            className="flex-1 min-w-[140px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            고쳐쓰기
                          </button>
                          <button
                            disabled={isProcessingAction}
                            onClick={() => {
                              if (isProcessingAction) return;
                              setIsProcessingAction(true);
                              setFeedback(null);
                              setSubmittedWriting(null);
                              setSelectedTopic(null);
                              setCurrentWriting({
                                topic: "",
                                content: "",
                                wordCount: 0,
                                gradeLevel: userData.gradeLevel,
                                studentName: userData.name
                              });
                              setRewriteMode(null);
                              setTimeout(() => setIsProcessingAction(false), 500);
                            }}
                            className="flex-1 min-w-[140px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            새 글 쓰기
                          </button>
                        </>
                      ) : (
                        // 기준 점수 미달 시 - 고쳐쓰기
                        <button
                          disabled={isProcessingAction}
                          onClick={() => {
                            if (isProcessingAction) return;
                            setIsProcessingAction(true);
                            // 제출했던 글 내용을 다시 복원
                            setSelectedTopic({ id: 'rewrite', title: submittedWriting.topic });
                            setCurrentWriting({
                              topic: submittedWriting.topic,
                              content: submittedWriting.content,
                              wordCount: submittedWriting.wordCount,
                              gradeLevel: userData.gradeLevel,
                              studentName: userData.name,
                              minScore: requiredScore,  // 🚀 기준점수 전달 (누락 버그 수정)
                              isAssignment: submittedWriting.isAssignment,
                              previousScore: feedback.score  // 🚀 이전 점수 저장 (AI 고쳐쓰기 보너스용)
                            });
                            // 고쳐쓰기 모드 - AI 제안 저장 (minScore + 원본 내용 포함)
                            setRewriteMode({
                              detailedFeedback: feedback.detailedFeedback || [],
                              improvements: feedback.improvements || [],
                              score: feedback.score,
                              minScore: requiredScore,
                              originalContent: submittedWriting.content // 🚀 원본 내용 저장 (고쳐쓰기 검증용)
                            });
                            // 피드백 닫기
                            setFeedback(null);
                            setSubmittedWriting(null);
                            setTimeout(() => setIsProcessingAction(false), 500);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          고쳐쓰기
                        </button>
                      )}
                      <button
                        onClick={() => handleTabChange("history")}
                        className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        제출 기록 보기
                      </button>
                    </div>
                  </div>
                  );
                  })()
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✍️</span>
                    </div>
                    <p className="text-gray-500 mb-2">왼쪽에서 주제를 선택해 주세요.</p>
                    <p className="text-xs text-gray-400">추천 주제 또는 직접 입력할 수 있어요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* 통계 헤더 */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 통계 카드들 */}
                <div className="flex gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl px-4 py-3 border border-emerald-200">
                    <div className="text-xs text-emerald-600 font-medium">달성</div>
                    <div className="text-2xl font-bold text-emerald-700">{writings.filter(w => {
                      if (w.isDraft) return false;
                      const requiredScore = w.minScore !== undefined ? w.minScore : PASSING_SCORE;
                      return w.score >= requiredScore;
                    }).length}</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl px-4 py-3 border border-orange-200">
                    <div className="text-xs text-orange-600 font-medium">미달성</div>
                    <div className="text-2xl font-bold text-orange-700">{writings.filter(w => {
                      if (w.isDraft) return false;
                      const requiredScore = w.minScore !== undefined ? w.minScore : PASSING_SCORE;
                      return w.score < requiredScore;
                    }).length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 미달성 글 섹션 (기본 표시) */}
            {(() => {
              // 🚀 과제 제목 정규화 함수 (물음표, 공백 등 무시하고 비교)
              const normalizeTitle = (title) => (title || '').replace(/[?？!！\s]/g, '').toLowerCase();

              // 과제 맵 생성 (정규화된 제목 -> minScore)
              const assignmentMap = new Map();
              allAssignments.forEach(a => {
                assignmentMap.set(normalizeTitle(a.title), a.minScore);
              });

              // 글 주제로 과제 minScore 찾기 (유사도 매칭)
              const findAssignmentMinScore = (topic) => {
                const normalizedTopic = normalizeTitle(topic);
                // 정확히 일치하면 반환
                if (assignmentMap.has(normalizedTopic)) {
                  return assignmentMap.get(normalizedTopic);
                }
                // 포함 관계로 매칭 시도
                for (const [key, value] of assignmentMap) {
                  if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
                    return value;
                  }
                }
                return undefined;
              };

              const allSubmitted = writings.filter(w => !w.isDraft);

              const failedWritings = allSubmitted.filter(w => {
                const requiredScore = w.minScore !== undefined ? w.minScore : (findAssignmentMinScore(w.topic) ?? PASSING_SCORE);
                return w.score < requiredScore;
              });

              const passedWritings = allSubmitted.filter(w => {
                const requiredScore = w.minScore !== undefined ? w.minScore : (findAssignmentMinScore(w.topic) ?? PASSING_SCORE);
                return w.score >= requiredScore;
              });

              // 글 카드 렌더링 함수 - 🚀 클릭 시 상세 정보 로드 (DB 읽기 1회)
              const renderWritingCard = (writing) => {
                const writingRequiredScore = writing.minScore !== undefined ? writing.minScore : (findAssignmentMinScore(writing.topic) ?? PASSING_SCORE);
                const isPassed = writing.score >= writingRequiredScore;
                const isSelected = selectedWritingDetail?.writingId === writing.writingId;
                const detail = isSelected ? selectedWritingDetail : null;

                return (
                  <div
                    key={writing.writingId}
                    className={`bg-white shadow-lg rounded-2xl overflow-hidden border-l-4 cursor-pointer transition-all ${
                      isPassed ? 'border-l-emerald-500' : 'border-l-orange-500'
                    } ${isSelected ? 'ring-2 ring-blue-400' : 'hover:shadow-xl'}`}
                    onClick={() => handleViewWritingDetail(writing.writingId)}
                  >
                    <div className={`px-6 py-4 ${isPassed ? 'bg-gradient-to-r from-emerald-50 to-white' : 'bg-gradient-to-r from-orange-50 to-white'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                              {isPassed ? '✅ 달성' : '🔄 미달성'}
                            </span>
                            <span className="text-xs text-gray-500">목표: {writingRequiredScore}점</span>
                            {loadingWritingDetail && selectedWritingDetail?.writingId !== writing.writingId && (
                              <span className="text-xs text-blue-500">로딩중...</span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{writing.topic}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(writing.submittedAt).toLocaleDateString()} {new Date(writing.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-black ${writing.score >= PASSING_SCORE ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {writing.score}<span className="text-lg">점</span>
                          </div>
                          <div className="text-sm text-gray-500">{writing.wordCount}자</div>
                          <div className="text-xs text-blue-500 mt-1">{isSelected ? '▲ 접기' : '▼ 상세보기'}</div>
                        </div>
                      </div>
                      {/* 🚀 미달성 글: 고쳐쓰기 버튼 (상세보기 안 열어도 바로 표시) */}
                      {!isPassed && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();

                            // 상세 정보가 없으면 먼저 로드
                            let writingDetail = detail;
                            if (!writingDetail) {
                              try {
                                writingDetail = await getWritingDetail(writing.writingId);
                              } catch (err) {
                                console.error('글 상세 로드 실패:', err);
                                alert('글 내용을 불러오는데 실패했습니다. 다시 시도해주세요.');
                                return;
                              }
                            }

                            // 원본 글 내용으로 고쳐쓰기 시작
                            setSelectedTopic({ id: 'rewrite', title: writing.topic });
                            setCurrentWriting({
                              topic: writing.topic,
                              content: writingDetail.content || '',
                              wordCount: writingDetail.wordCount || writing.wordCount,
                              gradeLevel: userData.gradeLevel,
                              studentName: userData.name,
                              minScore: writingRequiredScore,
                              isAssignment: writingDetail.isAssignment || false,
                              previousScore: writing.score
                            });
                            setRewriteMode({
                              detailedFeedback: writingDetail.analysis?.detailedFeedback || [],
                              improvements: writingDetail.analysis?.improvements || [],
                              score: writing.score,
                              minScore: writingRequiredScore,
                              originalContent: writingDetail.content || ''
                            });
                            setSelectedWritingDetail(null);
                            handleTabChange('write');
                          }}
                          className="mt-3 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                        >
                          ✏️ 고쳐쓰기
                        </button>
                      )}
                    </div>

                    {/* 🚀 상세 정보 (클릭 시에만 표시 - DB 읽기 1회) */}
                    {isSelected && detail && (
                      <>
                        <div className="px-6 py-4">
                          <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{detail.content}</p>
                          </div>
                        </div>
                        {detail.analysis && (
                          <div className="px-6 pb-6 space-y-4">
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {[
                                { label: '내용', score: detail.analysis.contentScore, max: 25, color: 'blue' },
                                { label: '주제', score: detail.analysis.topicRelevanceScore, max: 10, color: 'red' },
                                { label: '구성', score: detail.analysis.structureScore, max: 20, color: 'purple' },
                                { label: '어휘', score: detail.analysis.vocabularyScore, max: 20, color: 'pink' },
                                { label: '문법', score: detail.analysis.grammarScore, max: 15, color: 'amber' },
                                { label: '창의성', score: detail.analysis.creativityScore, max: 10, color: 'emerald' }
                              ].map((item, idx) => (
                                <div key={idx} className="text-center bg-gray-50 rounded-lg p-2">
                                  <div className="text-xs text-gray-500">{item.label}</div>
                                  <div className={`font-bold text-${item.color}-600`}>{item.score}/{item.max}</div>
                                </div>
                              ))}
                            </div>
                            {detail.aiUsageCheck && (
                              <div className={`p-3 rounded-xl text-sm ${
                                detail.aiUsageCheck.verdict === 'HIGH' ? 'bg-red-50 border border-red-200' :
                                detail.aiUsageCheck.verdict === 'MEDIUM' ? 'bg-amber-50 border border-amber-200' :
                                'bg-emerald-50 border border-emerald-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-xs">🤖 AI 활용 분석</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    detail.aiUsageCheck.verdict === 'HIGH' ? 'bg-red-200 text-red-800' :
                                    detail.aiUsageCheck.verdict === 'MEDIUM' ? 'bg-amber-200 text-amber-800' :
                                    'bg-emerald-200 text-emerald-800'
                                  }`}>
                                    {detail.aiUsageCheck.aiProbability}%
                                  </span>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
                              💬 {detail.analysis.overallFeedback}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              };

              return (
                <>
                  {/* 미달성 글 (기본 표시) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2">
                      <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">🔄</span>
                      미달성 글 ({failedWritings.length}개)
                    </h3>
                    {failedWritings.length === 0 ? (
                      <div className="bg-white shadow rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🎉</span>
                        </div>
                        <p className="text-gray-600 font-medium">미달성 글이 없습니다. 대단해요!</p>
                      </div>
                    ) : (
                      failedWritings.map(renderWritingCard)
                    )}
                  </div>

                  {/* 달성 글 (아코디언 - 클릭 시 펼침) */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowPassedWritings(!showPassedWritings)}
                      className="w-full bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg">✅</span>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-emerald-700">달성 글 ({passedWritings.length}개)</h3>
                          <p className="text-xs text-emerald-600">클릭하여 {showPassedWritings ? '접기' : '펼치기'}</p>
                        </div>
                      </div>
                      <span className={`text-2xl text-emerald-600 transition-transform ${showPassedWritings ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {showPassedWritings && (
                      <div className="mt-4 space-y-4">
                        {passedWritings.length === 0 ? (
                          <div className="bg-white shadow rounded-2xl p-8 text-center">
                            <p className="text-gray-500">아직 달성한 글이 없습니다.</p>
                          </div>
                        ) : (
                          passedWritings.map(renderWritingCard)
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 제출 수</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats?.totalSubmissions || 0}개</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">평균 점수</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats?.averageScore || 0}점</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">최고 점수</h3>
                <p className="text-3xl font-bold text-purple-600">{stats?.scores ? Math.max(...stats.scores) : 0}점</p>
              </div>
            </div>

            {stats && stats.scores && stats.scores.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">점수 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.scores.map((score, idx) => ({
                      name: `${idx + 1}회차`,
                      score
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} name="점수" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Ranking Tab */}
        {activeTab === "ranking" && (
          <div className="space-y-6">
            {/* 내 순위 카드 */}
            {myRank && (
              <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm mb-1">나의 {rankingPeriod === 'weekly' ? '주간' : '월간'} 순위</p>
                    <p className="text-4xl font-black">{myRank}등</p>
                  </div>
                  <div className="text-6xl">
                    {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🏅'}
                  </div>
                </div>
              </div>
            )}

            {/* 기간 선택 */}
            <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center text-white text-sm">🏆</span>
                  학급 랭킹
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (rankingPeriod !== 'weekly') {
                        setRankingLastLoaded(null); // 🚀 기간 변경 시 캐시 무효화
                        setRankingPeriod('weekly');
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      rankingPeriod === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    주간
                  </button>
                  <button
                    onClick={() => {
                      if (rankingPeriod !== 'monthly') {
                        setRankingLastLoaded(null); // 🚀 기간 변경 시 캐시 무효화
                        setRankingPeriod('monthly');
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      rankingPeriod === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    월간
                  </button>
                </div>
              </div>

              {loadingRanking ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">랭킹 로딩 중...</p>
                </div>
              ) : rankingData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-4">📊</p>
                  <p>아직 랭킹 데이터가 없습니다.</p>
                </div>
              ) : (
                (() => {
                  // 🚀 전체 랭킹 표시 (classes 문서에서 1회 읽기 - 동일 비용)
                  const renderRankingCard = (student) => {
                    const isMe = student.studentId === user.uid;
                    const rank = student.rank;
                    return (
                      <div
                        key={student.studentId}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-md'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {/* 순위 */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                          rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                        </div>

                        {/* 닉네임 */}
                        <div className="flex-1">
                          <p className={`font-semibold ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                            {student.nickname} {isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-2">나</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            제출 {student.submissionCount}회 · 평균 {student.averageScore}점 · 통과 {student.passCount}회
                          </p>
                        </div>

                        {/* 점수 */}
                        <div className="text-right">
                          <p className={`text-lg font-bold ${isMe ? 'text-blue-600' : 'text-gray-700'}`}>
                            {student.rankingScore}점
                          </p>
                          <p className="text-xs text-gray-500">랭킹점수</p>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-3">
                      {/* 전체 학생 랭킹 */}
                      {rankingData.map((student) => renderRankingCard(student))}

                      {/* 총 인원 표시 */}
                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-400">
                          총 {rankingData.length}명 중 {myRank ? `${myRank}위` : '-'}
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* 랭킹 점수 설명 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800 font-medium mb-2">📊 랭킹 점수 계산법</p>
                <p className="text-xs text-blue-600">
                  제출 수 × 10 + 평균 점수 + 통과 수 × 5
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 레벨 + 아바타 미리보기 + 마이룸 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 레벨 카드 */}
              <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center text-white text-sm">⭐</span>
                  내 레벨
                </h3>
                {(() => {
                  const levelInfo = getLevelInfo(totalPoints); // 누적 포인트로 레벨 계산
                  const nextLevelInfo = getNextLevelInfo(totalPoints); // 누적 포인트로 다음 레벨 계산
                  return (
                    <div className="text-center">
                      {/* 레벨 뱃지 */}
                      <div className={`inline-block px-6 py-3 rounded-2xl bg-gradient-to-r ${levelInfo.color} shadow-lg mb-4`}>
                        <span className="text-4xl">{levelInfo.emoji}</span>
                        <div className="text-white font-bold text-lg mt-1">{levelInfo.name}</div>
                        <div className="text-white/80 text-sm">Lv.{levelInfo.level}</div>
                      </div>

                      {/* 포인트 표시 */}
                      <div className="mt-3 text-gray-700">
                        <span className="text-2xl font-bold text-amber-600">{points.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">포인트</span>
                      </div>

                      {/* 다음 레벨 진행바 */}
                      {nextLevelInfo.nextLevel && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">다음 레벨</span>
                            <span className="font-medium text-gray-700">
                              {nextLevelInfo.nextLevel.emoji} {nextLevelInfo.nextLevel.name}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full bg-gradient-to-r ${nextLevelInfo.nextLevel.color} transition-all duration-500`}
                              style={{ width: `${nextLevelInfo.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {nextLevelInfo.pointsNeeded.toLocaleString()}P 더 필요 ({nextLevelInfo.progress}%)
                          </p>
                        </div>
                      )}
                      {!nextLevelInfo.nextLevel && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl">
                          <p className="text-amber-800 font-bold">🎉 최고 레벨 달성!</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 아바타 카드 */}
              <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm">👤</span>
                  {previewItem ? '미리보기' : '내 아바타'}
                  {previewItem && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full animate-pulse">
                      👀 {previewItem.item.name}
                    </span>
                  )}
                </h3>

                {/* 아바타 프리뷰 - 상반신 형태 (미리보기 지원) */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${getPreviewBackground().color} ${getPreviewFrame().style} flex items-center justify-center shadow-xl overflow-hidden relative ${previewItem ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}`}>
                      {(() => {
                        const face = getPreviewFace();
                        const previewHair = getPreviewHair();
                        // 🎨 은발 등 defaultColor가 있으면 우선 사용
                        const actualHairColor = previewHair.defaultColor || getPreviewHairColor().color || '#1a1a1a';

                        if (face.svgType === 'human') {
                          return (
                            <div className="relative" style={{ width: 120, height: 140 }}>
                              {/* 옷 (상반신 아래쪽) - 팔, 목 포함 */}
                              <div className="absolute" style={{ bottom: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                                <ClothesSVG type={getPreviewClothes().svgType || 'tshirt'} color={getPreviewClothes().color || '#4A90D9'} size={110} skinColor={face.skinColor || '#FFD5B8'} />
                              </div>
                              {/* 얼굴 (상반신 위쪽) */}
                              <div className="absolute" style={{ top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                                <FaceSVG skinColor={face.skinColor} expression={face.expression} size={95} gender={face.gender || 'male'} />
                              </div>
                              {/* 머리카락 (항상 얼굴 위에) */}
                              {previewHair.svgStyle && previewHair.svgStyle !== 'none' && (
                                <div className="absolute" style={{ top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                                  <HairSVG
                                    style={previewHair.svgStyle || 'default'}
                                    color={actualHairColor}
                                    size={95}
                                  />
                                </div>
                              )}
                              {/* 악세서리 - 모자가 눈썹 안 가리도록 위치 조정 */}
                              {getPreviewAccessory().id !== 'acc1' && getPreviewAccessory().svgType && getPreviewAccessory().svgType !== 'none' && (
                                <div className="absolute" style={{ top: -25, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
                                  <AccessorySVG type={getPreviewAccessory().svgType} size={95} />
                                </div>
                              )}
                            </div>
                          );
                        } else if (face.svgType === 'animal' && face.animalType) {
                          // 머리카락이 어울리지 않는 특수 동물 타입들
                          const noHairAnimals = ['butterfly', 'frog', 'swan', 'tropicalfish', 'shark', 'octopus', 'ghost', 'alien', 'robot', 'pumpkin'];
                          const showHair = !noHairAnimals.includes(face.animalType);

                          return (
                            <div className="relative" style={{ width: 120, height: 140 }}>
                              {/* 옷 (상반신 아래쪽) - 동물은 기본 피부색 */}
                              <div className="absolute" style={{ bottom: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                                <ClothesSVG type={getPreviewClothes().svgType || 'tshirt'} color={getPreviewClothes().color || '#4A90D9'} size={110} skinColor="#FFD5B8" />
                              </div>
                              {/* 동물 얼굴 (상반신 위쪽) */}
                              <div className="absolute" style={{ top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                                <AnimalFaceSVG type={face.animalType} size={95} />
                              </div>
                              {/* 머리카락 - 특수 동물은 표시 안함 */}
                              {showHair && previewHair.svgStyle && previewHair.svgStyle !== 'none' && (
                                <div className="absolute" style={{ top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                                  <HairSVG
                                    style={previewHair.svgStyle || 'default'}
                                    color={actualHairColor}
                                    size={95}
                                  />
                                </div>
                              )}
                              {/* 악세서리 - 모자가 눈썹 안 가리도록 위치 조정 */}
                              {getPreviewAccessory().id !== 'acc1' && getPreviewAccessory().svgType && getPreviewAccessory().svgType !== 'none' && (
                                <div className="absolute" style={{ top: -25, left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
                                  <AccessorySVG type={getPreviewAccessory().svgType} size={95} />
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return <span className="text-6xl">{face.emoji}</span>;
                        }
                      })()}
                    </div>

                    {/* 염색 표시 - 사람 얼굴일 때만 */}
                    {getPreviewFace().svgType === 'human' && getPreviewHairColor().id !== 'hc1' && (
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg z-40"
                        style={{ background: getPreviewHairColor().color }}
                      ></div>
                    )}

                    {/* 미리보기 배지 또는 장착 아이템 요약 */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-40">
                      {previewItem ? (
                        <div className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg font-bold animate-pulse">
                          미리보기
                        </div>
                      ) : (
                        <>
                          {getEquippedFace().special && (
                            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg font-bold">
                              SPECIAL
                            </div>
                          )}
                          {/* 사람 얼굴일 때만 의상 배지 */}
                          {getEquippedFace().svgType === 'human' && getEquippedClothes().id !== 'cloth1' && (
                            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg">
                              {getEquippedClothes().emoji}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 미리보기 버튼들 */}
                {previewItem && ownedItems.includes(previewItem.item.id) && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        handleEquipItem(previewItem.item, previewItem.category);
                        setPreviewItem(null);
                      }}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      ✓ 장착하기
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all"
                    >
                      취소
                    </button>
                  </div>
                )}
                {previewItem && !ownedItems.includes(previewItem.item.id) && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        handlePurchaseItem(previewItem.item, previewItem.category);
                      }}
                      disabled={points < previewItem.item.price}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                        points >= previewItem.item.price
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {previewItem.item.price}P로 구매
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all"
                    >
                      취소
                    </button>
                  </div>
                )}

                {/* 닉네임 */}
                <div className="text-center mb-4">
                  {editingNickname ? (
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="새 닉네임"
                        maxLength={10}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                      />
                      <button
                        onClick={handleNicknameChange}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => { setEditingNickname(false); setNewNickname(''); }}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{nickname}</h4>
                      <button
                        onClick={() => { setEditingNickname(true); setNewNickname(nickname); }}
                        className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                      >
                        ✏️ 닉네임 변경
                      </button>
                    </div>
                  )}
                </div>

                {/* 포인트 */}
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 border border-amber-300 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">보유 포인트</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      <span className="text-3xl font-black text-amber-600">{points.toLocaleString()}</span>
                      <span className="text-amber-600 font-bold">P</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 업적/뱃지 카드 */}
              <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">🏆</span>
                  업적
                </h3>
                {(() => {
                  const userStats = {
                    totalSubmissions: stats?.totalSubmissions || 0,
                    highestScore: Math.max(...(stats?.scores || [0])),
                    totalPoints: totalPoints, // 누적 포인트 사용
                    streakDays: userData.streakDays || 0,
                    maxWordCount: Math.max(...writings.map(w => w.wordCount || 0), 0),
                    hasPassedOnce: (stats?.scores || []).some(s => s >= 80)
                  };
                  const earnedAchievements = checkAchievements(userStats);
                  return (
                    <div className="space-y-3">
                      {/* 획득한 업적 */}
                      <div className="flex flex-wrap gap-2">
                        {earnedAchievements.length > 0 ? (
                          earnedAchievements.slice(0, 8).map(achievement => (
                            <div
                              key={achievement.id}
                              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border border-amber-200"
                              title={achievement.description}
                            >
                              <span className="text-xl">{achievement.emoji}</span>
                              <span className="text-xs font-medium text-amber-800">{achievement.name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">아직 획득한 업적이 없어요. 글을 제출하면 업적을 얻을 수 있어요!</p>
                        )}
                      </div>
                      {earnedAchievements.length > 8 && (
                        <p className="text-xs text-gray-500 text-center">+{earnedAchievements.length - 8}개 더...</p>
                      )}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">획득한 업적</span>
                          <span className="font-bold text-amber-600">{earnedAchievements.length} / {ACHIEVEMENTS.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                            style={{ width: `${(earnedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 마이룸 미리보기 - 3D 스타일 */}
              <div className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur shadow-2xl rounded-2xl p-6 border ${previewRoomItem ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-slate-600'}`}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-cyan-500/30">🏠</span>
                  {previewRoomItem ? '미리보기' : '마이룸'}
                  {previewRoomItem && (
                    <span className="ml-2 text-sm font-normal text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/30">
                      👀 {previewRoomItem.item.name}
                    </span>
                  )}
                </h3>

                {/* 3D 아이소메트릭 스타일 방 미리보기 */}
                <div className={`relative rounded-2xl overflow-hidden min-h-[280px] bg-gradient-to-b from-indigo-900/50 via-slate-800/80 to-slate-900 ${previewRoomItem ? 'ring-4 ring-purple-400/40' : ''}`} style={{ perspective: '1200px' }}>

                  {/* 배경 하늘/공간 효과 */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* 별 효과 */}
                    <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-pulse opacity-60"></div>
                    <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-4 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-8 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.5s' }}></div>
                    {/* 부드러운 글로우 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl"></div>
                  </div>

                  {/* 3D 방 컨테이너 */}
                  <div className="absolute inset-4 bottom-6" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(5deg)' }}>

                    {/* 뒷벽 - 왼쪽 패널 */}
                    <div
                      className="absolute left-0 top-0 w-[60%] h-[65%] rounded-tl-xl overflow-hidden"
                      style={{
                        transform: 'skewY(3deg)',
                        background: (() => {
                          const wallpaper = ROOM_ITEMS.wallpaper.find(w => w.id === getPreviewRoomWallpaper());
                          if (wallpaper?.color) {
                            const colors = wallpaper.color.split(', ');
                            if (colors.length === 3) {
                              return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
                            }
                            return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1] || colors[0]} 100%)`;
                          }
                          return 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)';
                        })(),
                        boxShadow: 'inset -15px 0 40px rgba(0,0,0,0.08), inset 0 -20px 40px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* 벽지 패턴 */}
                      <div className="absolute inset-0 opacity-[0.15]" style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 25px, rgba(160,140,120,0.4) 25px, rgba(160,140,120,0.4) 26px),
                                         repeating-linear-gradient(0deg, transparent 0px, transparent 25px, rgba(160,140,120,0.2) 25px, rgba(160,140,120,0.2) 26px)`,
                      }}></div>
                      {/* 벽 하이라이트 */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                      {/* 벽 장식 - 액자/그림 */}
                      <div className="absolute top-8 left-10 drop-shadow-lg">
                        {getPreviewRoomDecorations().slice(0, 1).map((decoId) => {
                          const svgTypeMap = {
                            'deco1': 'painting', 'deco2': 'plant', 'deco3': 'trophy',
                            'deco4': 'tent', 'deco5': 'christmasTree', 'deco6': 'fountain',
                            'deco7': 'statue', 'deco8': 'rainbow', 'deco9': 'gem', 'deco10': 'castle'
                          };
                          return <DecorationSVG key={decoId} type={svgTypeMap[decoId] || 'painting'} size={50} />;
                        })}
                        {getPreviewRoomDecorations().length === 0 && (
                          <div className="w-14 h-12 bg-gradient-to-br from-amber-200 to-amber-300 rounded-sm border-4 border-amber-600 shadow-xl" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)' }}></div>
                        )}
                      </div>
                      {/* 코너 몰딩 */}
                      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900/30 to-amber-700/10"></div>
                    </div>

                    {/* 뒷벽 - 오른쪽 패널 */}
                    <div
                      className="absolute right-0 top-0 w-[50%] h-[65%] rounded-tr-xl overflow-hidden"
                      style={{
                        transform: 'skewY(-3deg)',
                        background: (() => {
                          const wallpaper = ROOM_ITEMS.wallpaper.find(w => w.id === getPreviewRoomWallpaper());
                          if (wallpaper?.color) {
                            const colors = wallpaper.color.split(', ');
                            if (colors.length === 3) {
                              return `linear-gradient(225deg, ${colors[1]} 0%, ${colors[2]} 50%, ${colors[0]} 100%)`;
                            }
                            return `linear-gradient(225deg, ${colors[1] || colors[0]} 0%, ${colors[0]} 100%)`;
                          }
                          return 'linear-gradient(225deg, #e8e8e8 0%, #f5f5f5 100%)';
                        })(),
                        boxShadow: 'inset 15px 0 40px rgba(0,0,0,0.06), inset 0 -20px 40px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* 창문 */}
                      <div className="absolute top-6 right-8 w-16 h-14 rounded-md overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 0 20px rgba(135,206,235,0.3)' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-sky-400 to-indigo-400"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent"></div>
                        {/* 창틀 */}
                        <div className="absolute inset-0 border-4 border-slate-500 rounded-md"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-500 -translate-y-1/2"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-slate-500 -translate-x-1/2"></div>
                        {/* 빛 반사 */}
                        <div className="absolute top-1 left-1 w-3 h-5 bg-white/60 rounded-sm rotate-12 blur-[1px]"></div>
                      </div>
                      {/* 가전 */}
                      <div className="absolute bottom-2 right-6 drop-shadow-xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                        {(() => {
                          const elecId = getPreviewRoomElectronics();
                          const svgTypeMap = {
                            'elec1': 'tv', 'elec2': 'computer', 'elec3': 'gameConsole', 'elec4': 'speaker',
                            'elec5': 'aircon', 'elec6': 'bigTv', 'elec7': 'homeTheater', 'elec8': 'aiRobot', 'elec9': 'vr'
                          };
                          return <ElectronicsSVG type={svgTypeMap[elecId] || 'tv'} size={55} />;
                        })()}
                      </div>
                      {/* 코너 몰딩 */}
                      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900/30 to-amber-700/10"></div>
                    </div>

                    {/* 바닥 - 3D 효과 강화 */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[45%] rounded-b-xl overflow-hidden"
                      style={{
                        background: 'linear-gradient(180deg, #c4a882 0%, #a08060 50%, #8b6b4a 100%)',
                        boxShadow: 'inset 0 20px 60px rgba(0,0,0,0.15), inset 0 -10px 30px rgba(255,255,255,0.1), 0 -2px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* 나무 바닥 무늬 - 향상된 */}
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(90deg,
                          rgba(139,69,19,0.15) 0px,
                          transparent 2px,
                          transparent 30px,
                          rgba(139,69,19,0.15) 30px),
                          repeating-linear-gradient(0deg,
                          rgba(0,0,0,0.05) 0px,
                          transparent 1px,
                          transparent 80px)`,
                      }}></div>
                      {/* 바닥 광택 */}
                      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/15 to-transparent"></div>
                      {/* 바닥 깊이감 */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* 벽-바닥 모서리 라인 */}
                    <div className="absolute left-0 right-0" style={{ bottom: '45%', height: '4px', background: 'linear-gradient(90deg, #6b5740, #8b7355, #6b5740)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>

                    {/* 바닥 아이템들 영역 */}
                    <div className="absolute bottom-4 left-0 right-0 h-[40%] flex items-end justify-between px-6">
                      {/* 왼쪽 - 가구 */}
                      <div className="relative z-10" style={{ transform: 'translateY(-8px)', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
                        {(() => {
                          const furnitureId = getPreviewRoomFurniture();
                          const svgTypeMap = {
                            'furn1': 'sofa', 'furn2': 'bed', 'furn3': 'chair', 'furn4': 'desk',
                            'furn5': 'bookshelf', 'furn6': 'desk', 'furn7': 'chair', 'furn8': 'sofa',
                            'furn9': 'bed', 'furn10': 'throne'
                          };
                          return <FurnitureSVG type={svgTypeMap[furnitureId] || 'sofa'} size={70} />;
                        })()}
                      </div>

                      {/* 중앙 - 펫 */}
                      {getPreviewRoomPet() && (
                        <div className="relative z-20" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))', animation: 'bounce 2s ease-in-out infinite' }}>
                          {(() => {
                            const petId = getPreviewRoomPet();
                            const svgTypeMap = {
                              'pet1': 'dog', 'pet2': 'cat', 'pet3': 'hamster', 'pet4': 'rabbit',
                              'pet5': 'parrot', 'pet6': 'fish', 'pet7': 'fox', 'pet8': 'unicorn',
                              'pet9': 'dragon', 'pet10': 'eagle'
                            };
                            return <PetSVG type={svgTypeMap[petId] || 'dog'} size={58} />;
                          })()}
                        </div>
                      )}

                      {/* 오른쪽 - 차량 */}
                      {getPreviewRoomVehicle() && (
                        <div className="relative z-10" style={{ transform: 'translateY(-8px)', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}>
                          {(() => {
                            const vehicleId = getPreviewRoomVehicle();
                            const svgTypeMap = {
                              'car1': 'car', 'car2': 'suv', 'car3': 'sportsCar', 'car4': 'camper',
                              'car5': 'motorcycle', 'car6': 'helicopter', 'car7': 'yacht',
                              'car8': 'privateJet', 'car9': 'rocket'
                            };
                            return <VehicleSVG type={svgTypeMap[vehicleId] || 'car'} size={65} />;
                          })()}
                        </div>
                      )}
                    </div>

                    {/* 추가 장식 (벽 외) */}
                    {getPreviewRoomDecorations().slice(1, 3).map((decoId, idx) => (
                      <div key={decoId} className="absolute z-10" style={{
                        bottom: `${30 + idx * 8}%`,
                        left: `${28 + idx * 22}%`,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))'
                      }}>
                        {(() => {
                          const svgTypeMap = {
                            'deco1': 'painting', 'deco2': 'plant', 'deco3': 'trophy',
                            'deco4': 'tent', 'deco5': 'christmasTree', 'deco6': 'fountain',
                            'deco7': 'statue', 'deco8': 'rainbow', 'deco9': 'gem', 'deco10': 'castle'
                          };
                          return <DecorationSVG type={svgTypeMap[decoId] || 'plant'} size={38} />;
                        })()}
                      </div>
                    ))}

                    {/* 조명 효과 - 강화 */}
                    <div className="absolute top-4 left-1/3 w-40 h-40 pointer-events-none" style={{
                      background: 'radial-gradient(ellipse at center, rgba(255,248,220,0.25) 0%, rgba(255,248,220,0.1) 40%, transparent 70%)',
                      filter: 'blur(8px)'
                    }}></div>
                    {/* 창문에서 들어오는 빛 */}
                    <div className="absolute top-8 right-0 w-24 h-40 pointer-events-none opacity-30" style={{
                      background: 'linear-gradient(135deg, rgba(135,206,235,0.4) 0%, transparent 60%)',
                      transform: 'skewX(-15deg)',
                      filter: 'blur(4px)'
                    }}></div>
                  </div>

                  {/* 고급 프레임 */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.1), inset 0 0 0 4px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)'
                  }}></div>
                </div>

                {/* 마이룸 미리보기 버튼들 */}
                {previewRoomItem && (
                  <div className="flex gap-2 mt-4">
                    {ownedItems.includes(previewRoomItem.item.id) ? (
                      <button
                        onClick={() => {
                          handleEquipRoomItem(previewRoomItem.item, previewRoomItem.category);
                          setPreviewRoomItem(null);
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-cyan-600 transition-all"
                      >
                        ✓ 배치하기
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handlePurchaseItem(previewRoomItem.item, previewRoomItem.category);
                        }}
                        disabled={points < previewRoomItem.item.price}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                          points >= previewRoomItem.item.price
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {previewRoomItem.item.price}P로 구매
                      </button>
                    )}
                    <button
                      onClick={handleCancelRoomPreview}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>

              {/* 포인트 획득 방법 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>💡</span> 포인트 획득
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-blue-600 font-bold">+10P</div>
                    <div className="text-gray-600">글 제출</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-emerald-600 font-bold">+20P</div>
                    <div className="text-gray-600">80점 이상</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-purple-600 font-bold">+50P</div>
                    <div className="text-gray-600">90점 이상</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-amber-600 font-bold">+5P</div>
                    <div className="text-gray-600">연속 제출</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상점 */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">🛒</span>
                  상점
                </h3>

                {/* 대분류 탭 (아바타/마이룸) */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => { setShopCategory('avatar'); setAvatarTab('faces'); }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      shopCategory === 'avatar'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👤 아바타
                  </button>
                  <button
                    onClick={() => { setShopCategory('room'); setAvatarTab('furniture'); }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      shopCategory === 'room'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🏠 마이룸
                  </button>
                </div>

                {/* 소분류 탭 */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                  {(shopCategory === 'avatar' ? SHOP_CATEGORIES.avatar.subcategories : SHOP_CATEGORIES.room.subcategories).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setAvatarTab(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        avatarTab === cat
                          ? 'bg-blue-500 text-white shadow'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {CATEGORY_NAMES[cat]}
                    </button>
                  ))}
                </div>

                {/* 아이템 목록 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {getShopItems().map((item) => {
                    const owned = ownedItems.includes(item.id);
                    const equipped = isItemEquipped(item, avatarTab);

                    return (
                      <div
                        key={item.id}
                        className={`relative rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                          equipped
                            ? 'border-blue-500 bg-blue-50'
                            : owned
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* 뱃지 */}
                        {equipped && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                            착용중
                          </div>
                        )}
                        {owned && !equipped && (
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                            보유
                          </div>
                        )}

                        {/* 미리보기 - 카테고리별로 적절한 SVG 표시 */}
                        <div className="flex justify-center mb-2 h-12 items-center">
                          {shopCategory === 'room' ? (
                            // 마이룸 아이템은 SVG로 표시
                            (() => {
                              const svgTypeMap = {
                                furniture: { 'furn1': 'sofa', 'furn2': 'bed', 'furn3': 'chair', 'furn4': 'desk', 'furn5': 'bookshelf', 'furn6': 'desk', 'furn7': 'chair', 'furn8': 'sofa', 'furn9': 'bed', 'furn10': 'throne' },
                                electronics: { 'elec1': 'tv', 'elec2': 'computer', 'elec3': 'gameConsole', 'elec4': 'speaker', 'elec5': 'aircon', 'elec6': 'bigTv', 'elec7': 'homeTheater', 'elec8': 'aiRobot', 'elec9': 'vr' },
                                vehicles: { 'car1': 'car', 'car2': 'suv', 'car3': 'sportsCar', 'car4': 'camper', 'car5': 'motorcycle', 'car6': 'helicopter', 'car7': 'yacht', 'car8': 'privateJet', 'car9': 'rocket' },
                                pets: { 'pet1': 'dog', 'pet2': 'cat', 'pet3': 'hamster', 'pet4': 'rabbit', 'pet5': 'parrot', 'pet6': 'fish', 'pet7': 'fox', 'pet8': 'unicorn', 'pet9': 'dragon', 'pet10': 'eagle' },
                                decorations: { 'deco1': 'painting', 'deco2': 'plant', 'deco3': 'trophy', 'deco4': 'tent', 'deco5': 'christmasTree', 'deco6': 'fountain', 'deco7': 'statue', 'deco8': 'rainbow', 'deco9': 'gem', 'deco10': 'castle' }
                              };
                              if (avatarTab === 'furniture' && svgTypeMap.furniture[item.id]) {
                                return <FurnitureSVG type={svgTypeMap.furniture[item.id]} size={40} />;
                              } else if (avatarTab === 'electronics' && svgTypeMap.electronics[item.id]) {
                                return <ElectronicsSVG type={svgTypeMap.electronics[item.id]} size={40} />;
                              } else if (avatarTab === 'vehicles' && svgTypeMap.vehicles[item.id]) {
                                return <VehicleSVG type={svgTypeMap.vehicles[item.id]} size={40} />;
                              } else if (avatarTab === 'pets' && svgTypeMap.pets[item.id]) {
                                return <PetSVG type={svgTypeMap.pets[item.id]} size={40} />;
                              } else if (avatarTab === 'decorations' && svgTypeMap.decorations[item.id]) {
                                return <DecorationSVG type={svgTypeMap.decorations[item.id]} size={40} />;
                              } else {
                                return <span className="text-3xl">{item.emoji}</span>;
                              }
                            })()
                          ) : item.emoji ? (
                            <span className="text-3xl">{item.emoji}</span>
                          ) : item.color && typeof item.color === 'string' && item.color.includes('#') ? (
                            // 벽지 색상 (새 형식: "#color1, #color2, #color3")
                            <div
                              className="w-10 h-10 rounded-lg border border-gray-200"
                              style={{
                                background: (() => {
                                  const colors = item.color.split(', ');
                                  if (colors.length === 3) {
                                    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
                                  }
                                  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1] || colors[0]} 100%)`;
                                })()
                              }}
                            ></div>
                          ) : item.style ? (
                            <div className={`w-10 h-10 rounded-full bg-gray-100 ${item.style}`}></div>
                          ) : item.color ? (
                            <div className="w-10 h-10 rounded-full border border-gray-200" style={{ background: item.color }}></div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          )}
                        </div>

                        {/* 정보 */}
                        <div className="text-center">
                          <p className="font-medium text-gray-800 text-xs truncate">{item.name}</p>
                          {!owned && (
                            <p className={`text-xs font-bold ${item.price === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {item.price === 0 ? '무료' : `${item.price.toLocaleString()}P`}
                            </p>
                          )}
                        </div>

                        {/* 버튼 */}
                        <div className="mt-2 space-y-1">
                          {/* 아바타 카테고리에서 미리보기 버튼 표시 */}
                          {shopCategory === 'avatar' && (
                            <button
                              onClick={() => handlePreviewItem(item, avatarTab)}
                              className={`w-full py-1 text-xs font-medium rounded-lg transition-all ${
                                previewItem?.item.id === item.id
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                              }`}
                            >
                              {previewItem?.item.id === item.id ? '👀 미리보기중' : '👀 미리보기'}
                            </button>
                          )}
                          {/* 마이룸 카테고리에서 미리보기 버튼 표시 */}
                          {shopCategory === 'room' && (
                            <button
                              onClick={() => handlePreviewRoomItem(item, avatarTab)}
                              className={`w-full py-1 text-xs font-medium rounded-lg transition-all ${
                                previewRoomItem?.item.id === item.id
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                              }`}
                            >
                              {previewRoomItem?.item.id === item.id ? '👀 미리보기중' : '👀 미리보기'}
                            </button>
                          )}
                          {owned ? (
                            <button
                              onClick={() => shopCategory === 'avatar' ? handleEquipItem(item, avatarTab) : handleEquipRoomItem(item, avatarTab)}
                              disabled={equipped}
                              className={`w-full py-1.5 text-xs font-medium rounded-lg transition-all ${
                                equipped
                                  ? 'bg-blue-100 text-blue-600 cursor-default'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              {equipped ? '착용중' : '장착'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePurchaseItem(item, avatarTab)}
                              disabled={points < item.price}
                              className={`w-full py-1.5 text-xs font-medium rounded-lg transition-all ${
                                points >= item.price
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {item.price === 0 ? '획득' : '구매'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 하단 정보 */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>보유 아이템: {ownedItems.length}개</span>
                  <span>💎 {points.toLocaleString()}P 보유중</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 글쓰기 템플릿 모달 */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                    <span className="text-2xl">📋</span> 글쓰기 템플릿 선택
                  </h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-emerald-700 mt-2">원하는 글쓰기 양식을 선택하세요. 글 작성에 도움이 됩니다!</p>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WRITING_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                        selectedTemplate?.id === template.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-3xl">{template.emoji}</span>
                      <h4 className="font-bold text-gray-800 mt-2">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
