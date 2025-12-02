// 실사 스타일 룸 아이템 SVG 컴포넌트
import React from 'react';

// 가구 SVG
export const FurnitureSVG = ({ type = 'sofa', size = 80 }) => {
  const furniture = {
    sofa: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="5" y="35" width="70" height="35" rx="5" fill="#8B4513" />
        <rect x="8" y="30" width="64" height="20" rx="8" fill="#A0522D" />
        <rect x="5" y="25" width="15" height="35" rx="5" fill="#A0522D" />
        <rect x="60" y="25" width="15" height="35" rx="5" fill="#A0522D" />
        <rect x="20" y="32" width="18" height="12" rx="3" fill="#CD853F" opacity="0.5" />
        <rect x="42" y="32" width="18" height="12" rx="3" fill="#CD853F" opacity="0.5" />
        <rect x="8" y="65" width="8" height="10" rx="2" fill="#4a3728" />
        <rect x="64" y="65" width="8" height="10" rx="2" fill="#4a3728" />
      </svg>
    ),
    bed: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="5" y="25" width="70" height="45" rx="3" fill="#8B4513" />
        <rect x="8" y="10" width="64" height="25" rx="5" fill="#D2691E" />
        <rect x="10" y="30" width="60" height="35" rx="2" fill="#F5F5DC" />
        <rect x="12" y="32" width="56" height="8" rx="2" fill="white" />
        <ellipse cx="25" cy="36" rx="10" ry="4" fill="#E8E8E8" />
        <ellipse cx="55" cy="36" rx="10" ry="4" fill="#E8E8E8" />
        <rect x="12" y="42" width="56" height="20" rx="2" fill="#87CEEB" />
        <path d="M 12 50 Q 40 45 68 50" stroke="#ADD8E6" strokeWidth="2" fill="none" />
        <rect x="8" y="65" width="6" height="10" rx="1" fill="#4a3728" />
        <rect x="66" y="65" width="6" height="10" rx="1" fill="#4a3728" />
      </svg>
    ),
    chair: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="20" y="10" width="40" height="35" rx="3" fill="#8B4513" />
        <rect x="15" y="40" width="50" height="8" rx="2" fill="#A0522D" />
        <rect x="18" y="48" width="6" height="27" fill="#4a3728" />
        <rect x="56" y="48" width="6" height="27" fill="#4a3728" />
        <rect x="22" y="15" width="36" height="15" rx="2" fill="#CD853F" opacity="0.3" />
      </svg>
    ),
    desk: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="5" y="25" width="70" height="8" rx="2" fill="#8B4513" />
        <rect x="8" y="33" width="10" height="40" fill="#A0522D" />
        <rect x="62" y="33" width="10" height="40" fill="#A0522D" />
        <rect x="8" y="38" width="25" height="25" rx="2" fill="#CD853F" />
        <rect x="10" y="42" width="21" height="8" rx="1" fill="#8B4513" />
        <rect x="10" y="53" width="21" height="8" rx="1" fill="#8B4513" />
        <circle cx="28" cy="46" r="2" fill="#FFD700" />
        <circle cx="28" cy="57" r="2" fill="#FFD700" />
      </svg>
    ),
    bookshelf: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="10" y="5" width="60" height="70" rx="2" fill="#8B4513" />
        <rect x="12" y="8" width="56" height="18" fill="#D2691E" />
        <rect x="12" y="30" width="56" height="18" fill="#D2691E" />
        <rect x="12" y="52" width="56" height="18" fill="#D2691E" />
        <rect x="15" y="10" width="8" height="14" fill="#FF6347" />
        <rect x="25" y="12" width="6" height="12" fill="#4169E1" />
        <rect x="33" y="10" width="7" height="14" fill="#32CD32" />
        <rect x="42" y="11" width="9" height="13" fill="#FFD700" />
        <rect x="53" y="10" width="6" height="14" fill="#9370DB" />
        <rect x="15" y="32" width="7" height="14" fill="#FF69B4" />
        <rect x="24" y="34" width="8" height="12" fill="#00CED1" />
        <rect x="34" y="32" width="6" height="14" fill="#FF8C00" />
        <rect x="42" y="33" width="10" height="13" fill="#8B0000" />
        <rect x="54" y="32" width="7" height="14" fill="#2E8B57" />
        <rect x="16" y="54" width="12" height="14" fill="#4682B4" />
        <rect x="30" y="56" width="8" height="12" fill="#DC143C" />
        <rect x="40" y="54" width="9" height="14" fill="#6B8E23" />
        <rect x="51" y="55" width="7" height="13" fill="#483D8B" />
      </svg>
    ),
    throne: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="throneGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        <path d="M 15 5 L 20 25 L 15 70 L 65 70 L 60 25 L 65 5 L 55 15 L 40 0 L 25 15 Z" fill="url(#throneGold)" />
        <ellipse cx="40" cy="12" rx="8" ry="6" fill="#FF0000" />
        <rect x="20" y="40" width="40" height="25" rx="3" fill="#8B0000" />
        <rect x="18" y="35" width="44" height="10" rx="2" fill="#B22222" />
        <rect x="15" y="65" width="10" height="10" rx="2" fill="url(#throneGold)" />
        <rect x="55" y="65" width="10" height="10" rx="2" fill="url(#throneGold)" />
        <circle cx="20" cy="30" r="3" fill="#FFD700" />
        <circle cx="60" cy="30" r="3" fill="#FFD700" />
      </svg>
    )
  };

  return furniture[type] || furniture.sofa;
};

// 가전제품 SVG
export const ElectronicsSVG = ({ type = 'tv', size = 80 }) => {
  const electronics = {
    tv: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="5" y="10" width="70" height="45" rx="3" fill="#1a1a1a" />
        <rect x="8" y="13" width="64" height="39" fill="#2a2a2a" />
        <rect x="10" y="15" width="60" height="35" fill="#87CEEB" />
        <ellipse cx="25" cy="32" rx="8" ry="10" fill="#228B22" />
        <ellipse cx="35" cy="35" rx="6" ry="8" fill="#32CD32" />
        <circle cx="55" cy="30" r="10" fill="#FFD700" />
        <rect x="35" y="55" width="10" height="5" fill="#1a1a1a" />
        <rect x="25" y="60" width="30" height="3" rx="1" fill="#2a2a2a" />
        <circle cx="72" cy="52" r="2" fill="#FF0000" />
      </svg>
    ),
    computer: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="10" y="10" width="60" height="40" rx="2" fill="#1a1a1a" />
        <rect x="13" y="13" width="54" height="34" fill="#2a2a2a" />
        <rect x="15" y="15" width="50" height="30" fill="#1E90FF" />
        <rect x="20" y="20" width="15" height="3" fill="white" />
        <rect x="20" y="25" width="25" height="2" fill="rgba(255,255,255,0.7)" />
        <rect x="20" y="29" width="20" height="2" fill="rgba(255,255,255,0.7)" />
        <rect x="35" y="50" width="10" height="8" fill="#2a2a2a" />
        <rect x="20" y="58" width="40" height="3" rx="1" fill="#1a1a1a" />
        <rect x="5" y="65" width="70" height="8" rx="2" fill="#2a2a2a" />
        <rect x="8" y="67" width="64" height="4" fill="#1a1a1a" />
      </svg>
    ),
    gameConsole: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="10" y="30" width="60" height="25" rx="5" fill="#1a1a1a" />
        <rect x="15" y="35" width="20" height="15" rx="2" fill="#2a2a2a" />
        <rect x="45" y="35" width="20" height="15" rx="2" fill="#2a2a2a" />
        <circle cx="25" cy="42" r="5" fill="#404040" />
        <circle cx="55" cy="40" r="3" fill="#FF0000" />
        <circle cx="60" cy="45" r="3" fill="#00FF00" />
        <circle cx="50" cy="45" r="3" fill="#0000FF" />
        <circle cx="55" cy="50" r="3" fill="#FFFF00" />
        <rect x="35" y="55" width="10" height="3" fill="#2a2a2a" />
        <circle cx="68" cy="33" r="2" fill="#00FF00" />
      </svg>
    ),
    speaker: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <rect x="20" y="10" width="40" height="60" rx="5" fill="#1a1a1a" />
        <circle cx="40" cy="30" r="12" fill="#2a2a2a" />
        <circle cx="40" cy="30" r="8" fill="#404040" />
        <circle cx="40" cy="30" r="4" fill="#606060" />
        <circle cx="40" cy="55" r="8" fill="#2a2a2a" />
        <circle cx="40" cy="55" r="5" fill="#404040" />
        <circle cx="40" cy="55" r="2" fill="#606060" />
        <rect x="35" y="65" width="10" height="3" fill="#404040" />
      </svg>
    ),
    aircon: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 에어컨 본체 */}
        <rect x="5" y="15" width="70" height="30" rx="5" fill="#F5F5F5" />
        <rect x="8" y="18" width="64" height="24" rx="3" fill="#E8E8E8" />
        {/* 에어컨 통풍구 */}
        <rect x="10" y="35" width="60" height="5" rx="1" fill="#D0D0D0" />
        <line x1="15" y1="37" x2="65" y2="37" stroke="#A0A0A0" strokeWidth="1" />
        <line x1="15" y1="39" x2="65" y2="39" stroke="#A0A0A0" strokeWidth="1" />
        {/* 디스플레이 */}
        <rect x="55" y="22" width="12" height="8" rx="1" fill="#1a1a1a" />
        <text x="61" y="28" textAnchor="middle" fill="#00FF00" fontSize="6">24</text>
        {/* 바람 효과 */}
        <path d="M 15 48 Q 25 55 40 50 Q 55 45 65 52" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 20 53 Q 30 60 45 55 Q 60 50 70 57" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M 25 58 Q 35 65 50 60 Q 65 55 75 62" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.2" />
        {/* LED */}
        <circle cx="15" cy="25" r="2" fill="#00FF00" />
      </svg>
    ),
    bigTv: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 대형 TV 프레임 */}
        <rect x="2" y="8" width="76" height="50" rx="2" fill="#1a1a1a" />
        <rect x="4" y="10" width="72" height="46" fill="#0a0a0a" />
        {/* 화면 */}
        <rect x="5" y="11" width="70" height="44" fill="#1E90FF" />
        {/* 화면 내용 - 영화 장면 */}
        <rect x="5" y="11" width="70" height="10" fill="#87CEEB" />
        <circle cx="60" cy="18" r="6" fill="#FFD700" />
        <ellipse cx="25" cy="45" rx="15" ry="8" fill="#228B22" />
        <ellipse cx="55" cy="48" rx="12" ry="6" fill="#32CD32" />
        <rect x="35" y="35" width="10" height="18" fill="#8B4513" />
        {/* 스탠드 */}
        <rect x="30" y="58" width="20" height="4" fill="#1a1a1a" />
        <rect x="25" y="62" width="30" height="6" rx="2" fill="#2a2a2a" />
        {/* 삼성/LG 스타일 로고 영역 */}
        <rect x="35" y="52" width="10" height="2" fill="#404040" />
      </svg>
    ),
    homeTheater: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 큰 TV */}
        <rect x="15" y="5" width="50" height="32" rx="2" fill="#1a1a1a" />
        <rect x="17" y="7" width="46" height="28" fill="#4169E1" />
        <ellipse cx="40" cy="21" rx="15" ry="10" fill="#FFD700" opacity="0.8" />
        {/* TV 스탠드 */}
        <rect x="35" y="37" width="10" height="3" fill="#1a1a1a" />
        {/* 사운드바 */}
        <rect x="10" y="42" width="60" height="8" rx="3" fill="#2a2a2a" />
        <circle cx="20" cy="46" r="2" fill="#404040" />
        <circle cx="30" cy="46" r="2" fill="#404040" />
        <circle cx="40" cy="46" r="2" fill="#404040" />
        <circle cx="50" cy="46" r="2" fill="#404040" />
        <circle cx="60" cy="46" r="2" fill="#404040" />
        {/* 좌우 스피커 */}
        <rect x="2" y="55" width="12" height="22" rx="2" fill="#1a1a1a" />
        <circle cx="8" cy="62" r="3" fill="#2a2a2a" />
        <circle cx="8" cy="71" r="4" fill="#2a2a2a" />
        <rect x="66" y="55" width="12" height="22" rx="2" fill="#1a1a1a" />
        <circle cx="72" cy="62" r="3" fill="#2a2a2a" />
        <circle cx="72" cy="71" r="4" fill="#2a2a2a" />
        {/* 서브우퍼 */}
        <rect x="30" y="55" width="20" height="20" rx="3" fill="#1a1a1a" />
        <circle cx="40" cy="65" r="6" fill="#2a2a2a" />
        <circle cx="40" cy="65" r="3" fill="#404040" />
      </svg>
    ),
    aiRobot: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 로봇 머리 */}
        <ellipse cx="40" cy="22" rx="18" ry="16" fill="#E0E0E0" />
        <ellipse cx="40" cy="22" rx="15" ry="13" fill="#F5F5F5" />
        {/* 안테나 */}
        <rect x="38" y="2" width="4" height="8" fill="#808080" />
        <circle cx="40" cy="2" r="3" fill="#00BFFF" />
        {/* 눈 */}
        <ellipse cx="32" cy="20" rx="5" ry="6" fill="#1a1a1a" />
        <ellipse cx="48" cy="20" rx="5" ry="6" fill="#1a1a1a" />
        <ellipse cx="32" cy="19" rx="3" ry="4" fill="#00BFFF" />
        <ellipse cx="48" cy="19" rx="3" ry="4" fill="#00BFFF" />
        <circle cx="33" cy="18" r="1" fill="white" />
        <circle cx="49" cy="18" r="1" fill="white" />
        {/* 입 */}
        <rect x="35" y="28" width="10" height="3" rx="1" fill="#404040" />
        {/* 몸통 */}
        <rect x="25" y="38" width="30" height="30" rx="5" fill="#E0E0E0" />
        <rect x="28" y="42" width="24" height="15" rx="2" fill="#1a1a1a" />
        {/* 가슴 디스플레이 */}
        <rect x="30" y="44" width="20" height="11" fill="#00BFFF" opacity="0.8" />
        <rect x="32" y="46" width="6" height="2" fill="white" />
        <rect x="32" y="50" width="10" height="2" fill="white" opacity="0.6" />
        {/* 버튼들 */}
        <circle cx="35" cy="62" r="2" fill="#FF0000" />
        <circle cx="45" cy="62" r="2" fill="#00FF00" />
        {/* 팔 */}
        <rect x="12" y="40" width="10" height="20" rx="3" fill="#C0C0C0" />
        <circle cx="17" cy="62" r="4" fill="#808080" />
        <rect x="58" y="40" width="10" height="20" rx="3" fill="#C0C0C0" />
        <circle cx="63" cy="62" r="4" fill="#808080" />
        {/* 바퀴 */}
        <ellipse cx="32" cy="72" rx="6" ry="4" fill="#404040" />
        <ellipse cx="48" cy="72" rx="6" ry="4" fill="#404040" />
      </svg>
    ),
    vr: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <ellipse cx="40" cy="40" rx="35" ry="20" fill="#1a1a1a" />
        <ellipse cx="25" cy="40" rx="12" ry="10" fill="#2a2a2a" />
        <ellipse cx="55" cy="40" rx="12" ry="10" fill="#2a2a2a" />
        <ellipse cx="25" cy="40" rx="8" ry="7" fill="#00BFFF" opacity="0.5" />
        <ellipse cx="55" cy="40" rx="8" ry="7" fill="#00BFFF" opacity="0.5" />
        <path d="M 5 40 L 15 35 L 15 45 Z" fill="#404040" />
        <path d="M 75 40 L 65 35 L 65 45 Z" fill="#404040" />
        <rect x="35" y="35" width="10" height="10" rx="2" fill="#404040" />
      </svg>
    )
  };

  return electronics[type] || electronics.tv;
};

// 차량 SVG - 3D 스타일
export const VehicleSVG = ({ type = 'car', size = 80 }) => {
  const vehicles = {
    car: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 기본 세단 - 빨간색 클래식 세단 */}
        <defs>
          <linearGradient id="carBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6347" />
            <stop offset="50%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#CC3700" />
          </linearGradient>
          <linearGradient id="carWindow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B0E0E6" />
            <stop offset="100%" stopColor="#4682B4" />
          </linearGradient>
        </defs>
        {/* 차체 - 세단 스타일 */}
        <path d="M 12 48 L 18 32 L 62 32 L 68 48 Z" fill="url(#carBody)" />
        <rect x="8" y="48" width="64" height="12" rx="2" fill="url(#carBody)" />
        {/* 창문 - 4도어 세단 */}
        <path d="M 20 34 L 23 44 L 38 44 L 38 34 Z" fill="url(#carWindow)" />
        <path d="M 42 34 L 42 44 L 57 44 L 60 34 Z" fill="url(#carWindow)" />
        <rect x="38" y="34" width="4" height="10" fill="#CC3700" />
        {/* 창문 반사 */}
        <path d="M 22 36 L 24 42 L 30 42 L 30 36 Z" fill="white" opacity="0.3" />
        {/* 하단 */}
        <rect x="8" y="56" width="64" height="4" rx="1" fill="#8B0000" />
        {/* 바퀴 */}
        <ellipse cx="22" cy="60" rx="10" ry="9" fill="#1a1a1a" />
        <ellipse cx="58" cy="60" rx="10" ry="9" fill="#1a1a1a" />
        <ellipse cx="22" cy="60" rx="6" ry="5" fill="#404040" />
        <ellipse cx="58" cy="60" rx="6" ry="5" fill="#404040" />
        <circle cx="22" cy="60" r="2" fill="#C0C0C0" />
        <circle cx="58" cy="60" r="2" fill="#C0C0C0" />
        {/* 헤드라이트/테일라이트 */}
        <rect x="68" y="50" width="6" height="4" rx="1" fill="#FFFF00" />
        <rect x="6" y="50" width="6" height="4" rx="1" fill="#FF0000" />
        {/* 사이드 미러 */}
        <rect x="15" y="38" width="4" height="3" rx="1" fill="#1a1a1a" />
        <rect x="61" y="38" width="4" height="3" rx="1" fill="#1a1a1a" />
      </svg>
    ),
    suv: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* SUV - 검정색 대형 SUV */}
        <defs>
          <linearGradient id="suvBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="50%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>
        {/* 높은 차체 */}
        <rect x="8" y="25" width="64" height="30" rx="4" fill="url(#suvBody)" />
        {/* 지붕 - 루프랙 */}
        <rect x="12" y="20" width="56" height="8" rx="2" fill="#2a2a2a" />
        <rect x="18" y="18" width="8" height="4" rx="1" fill="#606060" />
        <rect x="34" y="18" width="12" height="4" rx="1" fill="#606060" />
        <rect x="54" y="18" width="8" height="4" rx="1" fill="#606060" />
        {/* 창문 - 큰 창 */}
        <rect x="14" y="28" width="22" height="14" rx="2" fill="#4682B4" />
        <rect x="40" y="28" width="26" height="14" rx="2" fill="#4682B4" />
        <rect x="36" y="28" width="4" height="14" fill="#2a2a2a" />
        {/* 창문 반사 */}
        <rect x="16" y="30" width="8" height="6" rx="1" fill="white" opacity="0.2" />
        {/* 하단 - 보호대 */}
        <rect x="5" y="55" width="70" height="8" rx="2" fill="#404040" />
        <rect x="8" y="57" width="64" height="4" fill="#606060" />
        {/* 큰 바퀴 */}
        <ellipse cx="20" cy="63" rx="12" ry="11" fill="#1a1a1a" />
        <ellipse cx="60" cy="63" rx="12" ry="11" fill="#1a1a1a" />
        <ellipse cx="20" cy="63" rx="7" ry="6" fill="#505050" />
        <ellipse cx="60" cy="63" rx="7" ry="6" fill="#505050" />
        <circle cx="20" cy="63" r="3" fill="#808080" />
        <circle cx="60" cy="63" r="3" fill="#808080" />
        {/* 그릴 */}
        <rect x="66" y="35" width="8" height="15" rx="2" fill="#1a1a1a" />
        <rect x="68" y="38" width="4" height="3" fill="#C0C0C0" />
        <rect x="68" y="43" width="4" height="3" fill="#C0C0C0" />
        {/* LED 헤드라이트 */}
        <rect x="68" y="32" width="6" height="2" rx="1" fill="#FFFFFF" />
        {/* 테일라이트 */}
        <rect x="6" y="35" width="4" height="12" rx="1" fill="#FF0000" />
      </svg>
    ),
    sportsCar: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 스포츠카 - 노란색 람보르기니 스타일 */}
        <defs>
          <linearGradient id="sportsCarBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFC000" />
            <stop offset="100%" stopColor="#CC9900" />
          </linearGradient>
        </defs>
        {/* 매우 낮은 차체 */}
        <path d="M 5 52 L 15 42 L 30 38 L 65 38 L 78 45 L 78 52 Z" fill="url(#sportsCarBody)" />
        {/* 날카로운 앞부분 */}
        <path d="M 65 38 L 78 45 L 78 48 L 70 48 L 65 42 Z" fill="#CC9900" />
        {/* 에어 인테이크 */}
        <path d="M 68 48 L 76 48 L 76 52 L 68 52 Z" fill="#1a1a1a" />
        <rect x="70" y="49" width="4" height="2" fill="#404040" />
        {/* 낮은 윈드실드 */}
        <path d="M 30 40 L 35 48 L 55 48 L 50 40 Z" fill="#1a1a1a" />
        <path d="M 32 41 L 36 47 L 52 47 L 48 41 Z" fill="#4682B4" opacity="0.8" />
        {/* 엔진 커버 (뒤쪽) */}
        <rect x="8" y="44" width="20" height="8" rx="2" fill="#1a1a1a" />
        <rect x="12" y="46" width="12" height="4" fill="#404040" />
        {/* 사이드 에어 인테이크 */}
        <path d="M 55 48 L 65 48 L 65 52 L 55 52 Z" fill="#1a1a1a" />
        {/* 하단 */}
        <rect x="5" y="52" width="73" height="6" rx="1" fill="#CC9900" />
        {/* 낮은 바퀴 */}
        <ellipse cx="22" cy="58" rx="10" ry="8" fill="#1a1a1a" />
        <ellipse cx="62" cy="58" rx="10" ry="8" fill="#1a1a1a" />
        <ellipse cx="22" cy="58" rx="6" ry="4" fill="#404040" />
        <ellipse cx="62" cy="58" rx="6" ry="4" fill="#404040" />
        {/* 스포크 휠 */}
        <line x1="22" y1="54" x2="22" y2="62" stroke="#C0C0C0" strokeWidth="1" />
        <line x1="18" y1="58" x2="26" y2="58" stroke="#C0C0C0" strokeWidth="1" />
        <line x1="62" y1="54" x2="62" y2="62" stroke="#C0C0C0" strokeWidth="1" />
        <line x1="58" y1="58" x2="66" y2="58" stroke="#C0C0C0" strokeWidth="1" />
        {/* 리어 스포일러 */}
        <rect x="5" y="40" width="15" height="3" rx="1" fill="#1a1a1a" />
        <rect x="3" y="38" width="4" height="5" rx="1" fill="#1a1a1a" />
      </svg>
    ),
    camper: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* 캠핑카 - 흰색 대형 캠핑카 */}
        <defs>
          <linearGradient id="camperBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F5F5F5" />
            <stop offset="100%" stopColor="#E0E0E0" />
          </linearGradient>
        </defs>
        {/* 캠핑카 본체 - 큰 박스 */}
        <rect x="5" y="18" width="55" height="38" rx="3" fill="url(#camperBody)" />
        {/* 운전석 */}
        <path d="M 60 30 L 75 35 L 75 56 L 60 56 Z" fill="#4682B4" />
        <path d="M 62 32 L 72 36 L 72 50 L 62 50 Z" fill="#87CEEB" />
        {/* 창문들 */}
        <rect x="10" y="25" width="12" height="10" rx="1" fill="#87CEEB" />
        <rect x="26" y="25" width="12" height="10" rx="1" fill="#87CEEB" />
        <rect x="42" y="25" width="12" height="10" rx="1" fill="#87CEEB" />
        {/* 창문 커튼 */}
        <rect x="10" y="25" width="12" height="3" fill="#FFB6C1" opacity="0.7" />
        <rect x="26" y="25" width="12" height="3" fill="#FFB6C1" opacity="0.7" />
        <rect x="42" y="25" width="12" height="3" fill="#FFB6C1" opacity="0.7" />
        {/* 문 */}
        <rect x="18" y="38" width="10" height="16" rx="1" fill="#D0D0D0" />
        <circle cx="26" cy="46" r="1.5" fill="#FFD700" />
        {/* 스트라이프 장식 */}
        <rect x="5" y="40" width="55" height="3" fill="#FF6347" />
        <rect x="5" y="44" width="55" height="2" fill="#4169E1" />
        {/* 하단 */}
        <rect x="5" y="56" width="70" height="6" rx="2" fill="#404040" />
        {/* 바퀴 */}
        <ellipse cx="20" cy="62" rx="10" ry="9" fill="#1a1a1a" />
        <ellipse cx="65" cy="62" rx="10" ry="9" fill="#1a1a1a" />
        <ellipse cx="20" cy="62" rx="5" ry="4" fill="#606060" />
        <ellipse cx="65" cy="62" rx="5" ry="4" fill="#606060" />
        {/* 에어컨 */}
        <rect x="30" y="12" width="15" height="6" rx="2" fill="#C0C0C0" />
        {/* 헤드라이트/테일라이트 */}
        <rect x="72" y="40" width="4" height="6" rx="1" fill="#FFFF00" />
        <rect x="2" y="45" width="4" height="8" rx="1" fill="#FF0000" />
        {/* 사이드 미러 */}
        <rect x="58" y="35" width="4" height="4" rx="1" fill="#1a1a1a" />
      </svg>
    ),
    motorcycle: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="bikeBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6347" />
            <stop offset="100%" stopColor="#CC3700" />
          </linearGradient>
        </defs>
        <ellipse cx="18" cy="55" rx="13" ry="12" fill="#1a1a1a" />
        <ellipse cx="62" cy="55" rx="13" ry="12" fill="#1a1a1a" />
        <ellipse cx="18" cy="55" rx="9" ry="8" fill="#404040" />
        <ellipse cx="62" cy="55" rx="9" ry="8" fill="#404040" />
        <ellipse cx="18" cy="55" rx="3" ry="2" fill="#C0C0C0" />
        <ellipse cx="62" cy="55" rx="3" ry="2" fill="#C0C0C0" />
        <path d="M 25 55 L 35 35 L 55 35 L 55 55" fill="url(#bikeBody)" />
        <path d="M 35 35 L 30 25 L 25 25" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        <ellipse cx="45" cy="32" rx="12" ry="5" fill="#4682B4" />
        <ellipse cx="43" cy="31" rx="5" ry="2" fill="white" opacity="0.3" />
        <rect x="55" y="40" width="15" height="5" fill="url(#bikeBody)" />
        <circle cx="28" cy="48" r="2" fill="#FFFF00" />
      </svg>
    ),
    helicopter: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="heliBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5B9BD5" />
            <stop offset="50%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#2E4A8F" />
          </linearGradient>
          <linearGradient id="heliWindow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B0E0E6" />
            <stop offset="100%" stopColor="#4682B4" />
          </linearGradient>
        </defs>
        {/* 메인 바디 */}
        <ellipse cx="35" cy="45" rx="28" ry="16" fill="url(#heliBody)" />
        {/* 윈도우 */}
        <ellipse cx="22" cy="44" rx="12" ry="10" fill="url(#heliWindow)" />
        <ellipse cx="20" cy="42" rx="5" ry="4" fill="white" opacity="0.4" />
        {/* 테일 */}
        <path d="M 63 45 L 78 38 L 78 52 Z" fill="url(#heliBody)" />
        <rect x="75" y="42" width="4" height="6" fill="#4169E1" />
        {/* 테일 로터 */}
        <ellipse cx="78" cy="45" rx="2" ry="10" fill="#2a2a2a" />
        <ellipse cx="78" cy="45" rx="1" ry="6" fill="#505050" />
        {/* 메인 로터 샤프트 */}
        <rect x="32" y="18" width="6" height="12" rx="1" fill="#505050" />
        {/* 메인 로터 블레이드 */}
        <rect x="2" y="15" width="76" height="5" rx="2" fill="#2a2a2a" />
        <rect x="5" y="16" width="70" height="3" rx="1" fill="#404040" />
        <ellipse cx="35" cy="17" rx="4" ry="3" fill="#606060" />
        {/* 스키드 */}
        <rect x="20" y="58" width="4" height="14" rx="1" fill="#404040" />
        <rect x="44" y="58" width="4" height="14" rx="1" fill="#404040" />
        <rect x="12" y="70" width="44" height="4" rx="2" fill="#505050" />
        {/* 디테일 */}
        <circle cx="55" cy="42" r="3" fill="#FFD700" />
        <rect x="26" y="52" width="15" height="2" fill="#2E4A8F" />
      </svg>
    ),
    privateJet: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="jetBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#F5F5F5" />
            <stop offset="70%" stopColor="#E8E8E8" />
            <stop offset="100%" stopColor="#C0C0C0" />
          </linearGradient>
          <linearGradient id="jetWindow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#1E90FF" />
          </linearGradient>
          <linearGradient id="jetWing" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#A0A0A0" />
          </linearGradient>
        </defs>
        {/* 동체 */}
        <ellipse cx="40" cy="40" rx="35" ry="10" fill="url(#jetBody)" />
        {/* 노즈 콘 */}
        <path d="M 75 40 Q 82 40 78 40 L 75 36 L 75 44 Z" fill="#C0C0C0" />
        {/* 창문들 */}
        <ellipse cx="55" cy="38" rx="3" ry="2.5" fill="url(#jetWindow)" />
        <ellipse cx="48" cy="38" rx="3" ry="2.5" fill="url(#jetWindow)" />
        <ellipse cx="41" cy="38" rx="3" ry="2.5" fill="url(#jetWindow)" />
        <ellipse cx="34" cy="38" rx="3" ry="2.5" fill="url(#jetWindow)" />
        <ellipse cx="27" cy="38" rx="3" ry="2.5" fill="url(#jetWindow)" />
        {/* 조종석 */}
        <ellipse cx="68" cy="38" rx="5" ry="4" fill="url(#jetWindow)" />
        <ellipse cx="69" cy="37" rx="2" ry="1.5" fill="white" opacity="0.4" />
        {/* 주 날개 */}
        <path d="M 35 50 L 20 70 L 55 70 L 50 50 Z" fill="url(#jetWing)" />
        <path d="M 35 30 L 20 10 L 55 10 L 50 30 Z" fill="url(#jetWing)" />
        {/* 꼬리 날개 (수직) */}
        <path d="M 8 40 L 5 20 L 12 20 L 15 40 Z" fill="url(#jetWing)" />
        {/* 꼬리 날개 (수평) */}
        <path d="M 5 35 L 0 28 L 15 28 L 12 35 Z" fill="url(#jetWing)" />
        <path d="M 5 45 L 0 52 L 15 52 L 12 45 Z" fill="url(#jetWing)" />
        {/* 엔진 */}
        <ellipse cx="28" cy="55" rx="6" ry="4" fill="#606060" />
        <ellipse cx="28" cy="55" rx="4" ry="2.5" fill="#404040" />
        <ellipse cx="52" cy="55" rx="6" ry="4" fill="#606060" />
        <ellipse cx="52" cy="55" rx="4" ry="2.5" fill="#404040" />
        {/* 스트라이프 장식 */}
        <rect x="5" y="39" width="70" height="2" fill="#1E3A5F" />
        <rect x="5" y="42" width="70" height="1" fill="#C9A227" />
      </svg>
    ),
    rocket: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F0F0F0" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D0D0D0" />
          </linearGradient>
          <linearGradient id="rocketFire" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FF6347" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
        </defs>
        <path d="M 40 5 Q 55 20 55 50 L 55 65 L 25 65 L 25 50 Q 25 20 40 5" fill="url(#rocketBody)" />
        <path d="M 40 5 Q 45 15 45 30 L 35 30 Q 35 15 40 5" fill="#E0E0E0" />
        <ellipse cx="40" cy="35" rx="8" ry="10" fill="#4682B4" />
        <ellipse cx="40" cy="33" rx="4" ry="5" fill="#87CEEB" opacity="0.5" />
        <path d="M 25 55 L 15 70 L 25 65" fill="#FF4500" />
        <path d="M 55 55 L 65 70 L 55 65" fill="#FF4500" />
        <path d="M 35 65 L 30 80 L 40 75 L 50 80 L 45 65" fill="url(#rocketFire)" />
        <path d="M 37 68 L 35 76 L 40 73 L 45 76 L 43 68" fill="#FFFF00" />
        <circle cx="40" cy="55" r="5" fill="#C0C0C0" />
        <circle cx="40" cy="55" r="3" fill="#808080" />
        <rect x="26" y="50" width="3" height="8" fill="#FF4500" />
        <rect x="51" y="50" width="3" height="8" fill="#FF4500" />
      </svg>
    ),
    yacht: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="yachtHull" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8E8E8" />
          </linearGradient>
          <linearGradient id="yachtWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>
        <path d="M 5 50 Q 10 65 40 65 Q 70 65 75 50 L 65 50 L 60 55 L 20 55 L 15 50 Z" fill="url(#yachtHull)" />
        <rect x="35" y="18" width="5" height="37" fill="#8B4513" />
        <path d="M 40 18 L 68 48 L 40 48 Z" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
        <path d="M 42 20 L 60 42 L 42 42 Z" fill="white" opacity="0.3" />
        <path d="M 35 23 L 12 48 L 35 48 Z" fill="#FF6347" />
        <rect x="25" y="48" width="30" height="8" rx="2" fill="#F5F5F5" />
        <rect x="30" y="50" width="8" height="4" rx="1" fill="#87CEEB" />
        <rect x="42" y="50" width="8" height="4" rx="1" fill="#87CEEB" />
        <path d="M 0 58 Q 10 54 20 58 Q 30 62 40 58 Q 50 54 60 58 Q 70 62 80 58 L 80 75 L 0 75 Z" fill="url(#yachtWater)" opacity="0.6" />
        <ellipse cx="15" cy="62" rx="3" ry="1" fill="white" opacity="0.5" />
        <ellipse cx="65" cy="60" rx="3" ry="1" fill="white" opacity="0.5" />
      </svg>
    )
  };

  return vehicles[type] || vehicles.car;
};

// 펫 SVG
export const PetSVG = ({ type = 'dog', size = 60 }) => {
  const pets = {
    dog: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="35" rx="20" ry="18" fill="#D2691E" />
        <ellipse cx="30" cy="25" rx="15" ry="14" fill="#D2691E" />
        <ellipse cx="18" cy="15" rx="8" ry="12" fill="#8B4513" transform="rotate(-20, 18, 15)" />
        <ellipse cx="42" cy="15" rx="8" ry="12" fill="#8B4513" transform="rotate(20, 42, 15)" />
        <ellipse cx="30" cy="32" rx="8" ry="6" fill="#FFE4C4" />
        <ellipse cx="24" cy="24" rx="4" ry="5" fill="white" />
        <ellipse cx="36" cy="24" rx="4" ry="5" fill="white" />
        <circle cx="24" cy="25" r="3" fill="#4a3728" />
        <circle cx="36" cy="25" r="3" fill="#4a3728" />
        <ellipse cx="30" cy="30" rx="4" ry="3" fill="#1a1a1a" />
        <path d="M 26 35 Q 30 40 34 35" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        <ellipse cx="30" cy="55" rx="3" ry="2" fill="#D2691E" />
      </svg>
    ),
    cat: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#808080" />
        <ellipse cx="30" cy="25" rx="14" ry="13" fill="#808080" />
        <polygon points="18,20 8,2 22,15" fill="#808080" />
        <polygon points="42,20 52,2 38,15" fill="#808080" />
        <polygon points="18,20 12,8 20,15" fill="#FFB5B5" />
        <polygon points="42,20 48,8 40,15" fill="#FFB5B5" />
        <ellipse cx="30" cy="32" rx="6" ry="5" fill="white" />
        <ellipse cx="23" cy="24" rx="5" ry="6" fill="#90EE90" />
        <ellipse cx="37" cy="24" rx="5" ry="6" fill="#90EE90" />
        <ellipse cx="23" cy="25" rx="2" ry="4" fill="#1a1a1a" />
        <ellipse cx="37" cy="25" rx="2" ry="4" fill="#1a1a1a" />
        <ellipse cx="30" cy="30" rx="3" ry="2" fill="#FFB5B5" />
        <path d="M 27 33 Q 30 36 33 33" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        <path d="M 55 38 Q 58 30 55 22" stroke="#808080" strokeWidth="4" fill="none" />
      </svg>
    ),
    hamster: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="35" rx="22" ry="20" fill="#F5DEB3" />
        <ellipse cx="15" cy="20" rx="8" ry="10" fill="#F5DEB3" />
        <ellipse cx="45" cy="20" rx="8" ry="10" fill="#F5DEB3" />
        <ellipse cx="15" cy="20" rx="5" ry="6" fill="#FFB5B5" />
        <ellipse cx="45" cy="20" rx="5" ry="6" fill="#FFB5B5" />
        <ellipse cx="30" cy="40" rx="12" ry="10" fill="white" />
        <ellipse cx="22" cy="32" rx="4" ry="5" fill="#1a1a1a" />
        <ellipse cx="38" cy="32" rx="4" ry="5" fill="#1a1a1a" />
        <circle cx="23" cy="31" r="1.5" fill="white" />
        <circle cx="39" cy="31" r="1.5" fill="white" />
        <ellipse cx="30" cy="38" rx="3" ry="2" fill="#FFB5B5" />
        <ellipse cx="20" cy="42" rx="6" ry="5" fill="#FFB5B5" opacity="0.5" />
        <ellipse cx="40" cy="42" rx="6" ry="5" fill="#FFB5B5" opacity="0.5" />
      </svg>
    ),
    unicorn: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="unicornHorn" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF69B4" />
          </linearGradient>
          <linearGradient id="unicornMane" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="50%" stopColor="#9370DB" />
            <stop offset="100%" stopColor="#00CED1" />
          </linearGradient>
        </defs>
        <ellipse cx="30" cy="40" rx="20" ry="15" fill="white" />
        <ellipse cx="25" cy="30" rx="12" ry="12" fill="white" />
        <polygon points="25,8 22,22 28,22" fill="url(#unicornHorn)" />
        <ellipse cx="15" cy="22" rx="5" ry="8" fill="white" />
        <ellipse cx="15" cy="22" rx="3" ry="5" fill="#FFB5B5" />
        <path d="M 30 20 Q 40 15 45 25" stroke="url(#unicornMane)" strokeWidth="4" fill="none" />
        <path d="M 32 23 Q 42 20 48 28" stroke="url(#unicornMane)" strokeWidth="3" fill="none" />
        <ellipse cx="20" cy="30" rx="3" ry="4" fill="#E6E6FA" />
        <circle cx="20" cy="31" r="2" fill="#9370DB" />
        <ellipse cx="25" cy="36" rx="2" ry="1.5" fill="#FFB5B5" />
        <ellipse cx="15" cy="35" rx="4" ry="3" fill="#FFB5B5" opacity="0.4" />
      </svg>
    ),
    dragon: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#228B22" />
        <ellipse cx="28" cy="25" rx="14" ry="12" fill="#228B22" />
        <polygon points="20,15 15,2 25,12" fill="#FFD700" />
        <polygon points="28,12 25,0 32,10" fill="#FFD700" />
        <polygon points="36,15 40,2 32,12" fill="#FFD700" />
        <ellipse cx="28" cy="30" rx="8" ry="6" fill="#90EE90" />
        <ellipse cx="22" cy="24" rx="5" ry="6" fill="#FFD700" />
        <ellipse cx="34" cy="24" rx="5" ry="6" fill="#FFD700" />
        <ellipse cx="22" cy="25" rx="2" ry="4" fill="#1a1a1a" />
        <ellipse cx="34" cy="25" rx="2" ry="4" fill="#1a1a1a" />
        <ellipse cx="28" cy="30" rx="3" ry="2" fill="#006400" />
        <path d="M 22 35 Q 28 42 34 35" stroke="#006400" strokeWidth="2" fill="none" />
        <path d="M 45 35 Q 55 30 50 45" fill="#228B22" />
        <polygon points="45,45 50,50 55,45" fill="#228B22" />
      </svg>
    ),
    parrot: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="35" rx="15" ry="20" fill="#FF4500" />
        <ellipse cx="30" cy="18" rx="12" ry="12" fill="#FF6347" />
        <ellipse cx="35" cy="15" rx="8" ry="10" fill="#32CD32" transform="rotate(30, 35, 15)" />
        <ellipse cx="25" cy="15" rx="8" ry="10" fill="#32CD32" transform="rotate(-30, 25, 15)" />
        <ellipse cx="25" cy="18" rx="4" ry="5" fill="white" />
        <ellipse cx="35" cy="18" rx="4" ry="5" fill="white" />
        <circle cx="25" cy="19" r="3" fill="#1a1a1a" />
        <circle cx="35" cy="19" r="3" fill="#1a1a1a" />
        <path d="M 30 22 L 28 30 L 32 30 Z" fill="#FFD700" />
        <path d="M 30 30 L 26 35 L 34 35 Z" fill="#FFD700" />
        <ellipse cx="18" cy="40" rx="6" ry="12" fill="#4169E1" transform="rotate(-20, 18, 40)" />
        <ellipse cx="42" cy="40" rx="6" ry="12" fill="#4169E1" transform="rotate(20, 42, 40)" />
      </svg>
    ),
    // 열대어 - 어항 속 화려한 물고기
    fish: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="fishBowl" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4169E1" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="fishBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#DC143C" />
          </linearGradient>
        </defs>
        {/* 어항 */}
        <ellipse cx="30" cy="35" rx="26" ry="22" fill="url(#fishBowl)" stroke="#87CEEB" strokeWidth="2" />
        <ellipse cx="30" cy="18" rx="20" ry="6" fill="#87CEEB" opacity="0.3" />
        {/* 물고기 1 - 메인 */}
        <ellipse cx="32" cy="32" rx="12" ry="7" fill="url(#fishBody)" />
        <polygon points="45,32 55,25 55,39" fill="#FF6B35" />
        <circle cx="25" cy="30" r="2" fill="#1a1a1a" />
        <circle cx="25.5" cy="29.5" r="0.8" fill="white" />
        <ellipse cx="32" cy="26" rx="5" ry="2" fill="#FFD700" opacity="0.6" />
        <path d="M 30 38 Q 35 42 38 38" fill="#FF6B35" />
        {/* 물고기 2 - 작은거 */}
        <ellipse cx="18" cy="40" rx="6" ry="4" fill="#4169E1" />
        <polygon points="10,40 5,36 5,44" fill="#4169E1" />
        <circle cx="22" cy="39" r="1.2" fill="white" />
        {/* 물방울/거품 */}
        <circle cx="38" cy="22" r="2" fill="white" opacity="0.5" />
        <circle cx="22" cy="25" r="1.5" fill="white" opacity="0.4" />
        <circle cx="42" cy="28" r="1" fill="white" opacity="0.3" />
        {/* 바닥 자갈 */}
        <ellipse cx="20" cy="52" rx="4" ry="2" fill="#DEB887" />
        <ellipse cx="30" cy="53" rx="3" ry="1.5" fill="#D2B48C" />
        <ellipse cx="40" cy="52" rx="4" ry="2" fill="#DEB887" />
        {/* 해초 */}
        <path d="M 15 55 Q 12 45 15 38 Q 18 45 15 55" fill="#228B22" />
        <path d="M 45 55 Q 48 45 45 40 Q 42 45 45 55" fill="#32CD32" />
      </svg>
    ),
    // 여우
    fox: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="foxFur" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FF6600" />
          </linearGradient>
        </defs>
        {/* 몸통 */}
        <ellipse cx="30" cy="40" rx="18" ry="14" fill="url(#foxFur)" />
        {/* 머리 */}
        <ellipse cx="30" cy="25" rx="14" ry="12" fill="url(#foxFur)" />
        {/* 뾰족한 귀 */}
        <polygon points="18,22 10,5 24,18" fill="#FF8C00" />
        <polygon points="42,22 50,5 36,18" fill="#FF8C00" />
        <polygon points="18,22 13,10 22,18" fill="#FFB38A" />
        <polygon points="42,22 47,10 38,18" fill="#FFB38A" />
        {/* 하얀 얼굴 패턴 */}
        <ellipse cx="30" cy="30" rx="8" ry="7" fill="white" />
        {/* 눈 */}
        <ellipse cx="24" cy="24" rx="3" ry="4" fill="#2d1b0e" />
        <ellipse cx="36" cy="24" rx="3" ry="4" fill="#2d1b0e" />
        <circle cx="25" cy="23" r="1" fill="white" />
        <circle cx="37" cy="23" r="1" fill="white" />
        {/* 코 */}
        <ellipse cx="30" cy="30" rx="3" ry="2" fill="#1a1a1a" />
        {/* 입 */}
        <path d="M 27 33 Q 30 36 33 33" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        {/* 꼬리 */}
        <path d="M 48 40 Q 58 35 55 50 Q 50 55 45 48" fill="url(#foxFur)" />
        <path d="M 52 48 Q 48 52 46 47" fill="white" />
        {/* 발 */}
        <ellipse cx="20" cy="52" rx="4" ry="3" fill="#1a1a1a" />
        <ellipse cx="40" cy="52" rx="4" ry="3" fill="#1a1a1a" />
      </svg>
    ),
    // 토끼
    rabbit: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        {/* 몸통 */}
        <ellipse cx="30" cy="42" rx="16" ry="14" fill="#F5F5F5" />
        {/* 머리 */}
        <ellipse cx="30" cy="28" rx="14" ry="13" fill="#F5F5F5" />
        {/* 긴 귀 */}
        <ellipse cx="20" cy="8" rx="6" ry="16" fill="#F5F5F5" />
        <ellipse cx="40" cy="8" rx="6" ry="16" fill="#F5F5F5" />
        <ellipse cx="20" cy="8" rx="3" ry="12" fill="#FFB5B5" />
        <ellipse cx="40" cy="8" rx="3" ry="12" fill="#FFB5B5" />
        {/* 눈 */}
        <ellipse cx="24" cy="26" rx="4" ry="5" fill="#FF6B6B" />
        <ellipse cx="36" cy="26" rx="4" ry="5" fill="#FF6B6B" />
        <circle cx="24" cy="26" r="2.5" fill="#1a1a1a" />
        <circle cx="36" cy="26" r="2.5" fill="#1a1a1a" />
        <circle cx="25" cy="25" r="1" fill="white" />
        <circle cx="37" cy="25" r="1" fill="white" />
        {/* 코 */}
        <ellipse cx="30" cy="34" rx="4" ry="3" fill="#FFB5B5" />
        {/* 입 */}
        <path d="M 27 38 Q 30 42 33 38" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        {/* 수염 */}
        <line x1="18" y1="34" x2="8" y2="32" stroke="#ccc" strokeWidth="1" />
        <line x1="18" y1="36" x2="8" y2="38" stroke="#ccc" strokeWidth="1" />
        <line x1="42" y1="34" x2="52" y2="32" stroke="#ccc" strokeWidth="1" />
        <line x1="42" y1="36" x2="52" y2="38" stroke="#ccc" strokeWidth="1" />
        {/* 볼터치 */}
        <ellipse cx="18" cy="32" rx="4" ry="3" fill="#FFB5B5" opacity="0.5" />
        <ellipse cx="42" cy="32" rx="4" ry="3" fill="#FFB5B5" opacity="0.5" />
        {/* 발 */}
        <ellipse cx="22" cy="54" rx="5" ry="3" fill="#F5F5F5" />
        <ellipse cx="38" cy="54" rx="5" ry="3" fill="#F5F5F5" />
      </svg>
    ),
    // 독수리
    eagle: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="eagleFeather" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a3728" />
            <stop offset="100%" stopColor="#2d1b0e" />
          </linearGradient>
        </defs>
        {/* 몸통 */}
        <ellipse cx="30" cy="38" rx="14" ry="16" fill="url(#eagleFeather)" />
        {/* 날개 (펼친 상태) */}
        <path d="M 16 38 Q 0 30 5 18 Q 10 25 18 30 Q 12 35 16 38" fill="url(#eagleFeather)" />
        <path d="M 44 38 Q 60 30 55 18 Q 50 25 42 30 Q 48 35 44 38" fill="url(#eagleFeather)" />
        {/* 머리 (흰색) */}
        <ellipse cx="30" cy="20" rx="10" ry="10" fill="white" />
        {/* 날카로운 눈 */}
        <ellipse cx="25" cy="18" rx="3" ry="4" fill="#FFD700" />
        <ellipse cx="35" cy="18" rx="3" ry="4" fill="#FFD700" />
        <ellipse cx="25" cy="19" rx="1.5" ry="2.5" fill="#1a1a1a" />
        <ellipse cx="35" cy="19" rx="1.5" ry="2.5" fill="#1a1a1a" />
        {/* 눈썹 (위엄있게) */}
        <path d="M 21 14 L 28 16" stroke="#4a3728" strokeWidth="2" />
        <path d="M 39 14 L 32 16" stroke="#4a3728" strokeWidth="2" />
        {/* 부리 */}
        <path d="M 30 22 L 26 28 L 30 32 L 34 28 Z" fill="#FFD700" />
        <path d="M 30 28 L 28 30 L 30 32 L 32 30 Z" fill="#FF8C00" />
        {/* 꼬리 깃털 */}
        <path d="M 25 52 L 20 60 L 25 55 L 30 60 L 35 55 L 40 60 L 35 52" fill="url(#eagleFeather)" />
        {/* 발톱 */}
        <path d="M 25 52 L 22 58 M 25 52 L 25 58 M 25 52 L 28 58" stroke="#FFD700" strokeWidth="2" />
        <path d="M 35 52 L 32 58 M 35 52 L 35 58 M 35 52 L 38 58" stroke="#FFD700" strokeWidth="2" />
      </svg>
    )
  };

  return pets[type] || pets.dog;
};

// 장식품 SVG
export const DecorationSVG = ({ type = 'plant', size = 60 }) => {
  const decorations = {
    plant: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="50" rx="15" ry="8" fill="#8B4513" />
        <rect x="20" y="42" width="20" height="10" fill="#A0522D" />
        <ellipse cx="30" cy="42" rx="10" ry="4" fill="#654321" />
        <path d="M 30 40 Q 25 30 30 20 Q 35 30 30 40" fill="#228B22" />
        <path d="M 30 35 Q 20 28 15 20" stroke="#228B22" strokeWidth="3" fill="none" />
        <ellipse cx="15" cy="18" rx="6" ry="8" fill="#32CD32" transform="rotate(-30, 15, 18)" />
        <path d="M 30 30 Q 40 25 48 22" stroke="#228B22" strokeWidth="3" fill="none" />
        <ellipse cx="48" cy="20" rx="6" ry="8" fill="#32CD32" transform="rotate(30, 48, 20)" />
        <path d="M 30 25 Q 22 18 18 10" stroke="#228B22" strokeWidth="2" fill="none" />
        <ellipse cx="18" cy="8" rx="5" ry="6" fill="#90EE90" transform="rotate(-20, 18, 8)" />
      </svg>
    ),
    trophy: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
        <rect x="22" y="40" width="16" height="8" fill="url(#trophyGold)" />
        <rect x="18" y="48" width="24" height="6" rx="2" fill="url(#trophyGold)" />
        <path d="M 15 8 L 15 25 Q 15 35 30 38 Q 45 35 45 25 L 45 8 Z" fill="url(#trophyGold)" />
        <path d="M 15 12 L 8 15 L 8 22 Q 8 28 15 28" fill="url(#trophyGold)" />
        <path d="M 45 12 L 52 15 L 52 22 Q 52 28 45 28" fill="url(#trophyGold)" />
        <ellipse cx="30" cy="20" rx="8" ry="6" fill="#FFE4B5" opacity="0.5" />
        <text x="30" y="25" textAnchor="middle" fill="#8B4513" fontSize="10" fontWeight="bold">1</text>
      </svg>
    ),
    painting: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <rect x="5" y="5" width="50" height="50" fill="#8B4513" />
        <rect x="8" y="8" width="44" height="44" fill="#F5F5DC" />
        <rect x="10" y="10" width="40" height="40" fill="#87CEEB" />
        <ellipse cx="40" cy="20" rx="8" ry="8" fill="#FFD700" />
        <path d="M 10 35 Q 20 25 30 35 Q 40 45 50 30" fill="#228B22" />
        <path d="M 10 40 Q 25 30 35 40 Q 45 50 50 38" fill="#32CD32" />
        <rect x="10" y="45" width="40" height="5" fill="#90EE90" />
      </svg>
    ),
    fountain: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <ellipse cx="30" cy="52" rx="25" ry="6" fill="#808080" />
        <ellipse cx="30" cy="48" rx="22" ry="5" fill="#4169E1" opacity="0.6" />
        <rect x="27" y="30" width="6" height="20" fill="#A0A0A0" />
        <ellipse cx="30" cy="30" rx="8" ry="3" fill="#808080" />
        <path d="M 30 28 Q 25 15 30 5 Q 35 15 30 28" fill="#87CEEB" opacity="0.7" />
        <path d="M 28 25 Q 20 18 15 20" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 32 25 Q 40 18 45 20" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="25" cy="45" r="2" fill="#ADD8E6" opacity="0.5" />
        <circle cx="35" cy="46" r="2" fill="#ADD8E6" opacity="0.5" />
        <circle cx="30" cy="44" r="1.5" fill="#ADD8E6" opacity="0.5" />
      </svg>
    ),
    rainbow: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <path d="M 5 50 Q 5 10 30 10 Q 55 10 55 50" stroke="#FF0000" strokeWidth="4" fill="none" />
        <path d="M 9 50 Q 9 14 30 14 Q 51 14 51 50" stroke="#FF7F00" strokeWidth="4" fill="none" />
        <path d="M 13 50 Q 13 18 30 18 Q 47 18 47 50" stroke="#FFFF00" strokeWidth="4" fill="none" />
        <path d="M 17 50 Q 17 22 30 22 Q 43 22 43 50" stroke="#00FF00" strokeWidth="4" fill="none" />
        <path d="M 21 50 Q 21 26 30 26 Q 39 26 39 50" stroke="#0000FF" strokeWidth="4" fill="none" />
        <path d="M 25 50 Q 25 30 30 30 Q 35 30 35 50" stroke="#4B0082" strokeWidth="4" fill="none" />
        <ellipse cx="10" cy="52" rx="8" ry="5" fill="white" opacity="0.8" />
        <ellipse cx="50" cy="52" rx="8" ry="5" fill="white" opacity="0.8" />
      </svg>
    ),
    gem: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00BFFF" />
            <stop offset="50%" stopColor="#1E90FF" />
            <stop offset="100%" stopColor="#0000CD" />
          </linearGradient>
        </defs>
        <polygon points="30,5 50,20 45,50 15,50 10,20" fill="url(#gemGradient)" />
        <polygon points="30,5 10,20 20,20" fill="#87CEEB" />
        <polygon points="30,5 50,20 40,20" fill="#4169E1" />
        <polygon points="20,20 40,20 30,50" fill="#1E90FF" />
        <polygon points="10,20 20,20 15,50" fill="#00BFFF" />
        <polygon points="40,20 50,20 45,50" fill="#0000CD" />
        <polygon points="15,50 30,50 20,20" fill="#4169E1" opacity="0.8" />
        <polygon points="45,50 30,50 40,20" fill="#00008B" opacity="0.8" />
        <polygon points="30,5 20,20 40,20" fill="white" opacity="0.3" />
      </svg>
    ),
    // 조각상 - 대리석 동상
    statue: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="50%" stopColor="#E8E8E8" />
            <stop offset="100%" stopColor="#D3D3D3" />
          </linearGradient>
        </defs>
        {/* 받침대 */}
        <rect x="15" y="50" width="30" height="8" rx="2" fill="#808080" />
        <rect x="18" y="45" width="24" height="6" fill="#A0A0A0" />
        {/* 몸통 */}
        <ellipse cx="30" cy="38" rx="10" ry="8" fill="url(#marbleGrad)" />
        {/* 상체 */}
        <path d="M 22 38 Q 18 30 22 22 L 38 22 Q 42 30 38 38 Z" fill="url(#marbleGrad)" />
        {/* 머리 */}
        <ellipse cx="30" cy="15" rx="8" ry="9" fill="url(#marbleGrad)" />
        {/* 얼굴 디테일 */}
        <ellipse cx="27" cy="14" rx="1.5" ry="1" fill="#A0A0A0" />
        <ellipse cx="33" cy="14" rx="1.5" ry="1" fill="#A0A0A0" />
        <path d="M 28 18 Q 30 19 32 18" stroke="#A0A0A0" strokeWidth="1" fill="none" />
        {/* 머리카락 곱슬 */}
        <path d="M 22 12 Q 20 8 24 6 Q 28 4 30 6 Q 32 4 36 6 Q 40 8 38 12" fill="url(#marbleGrad)" />
        {/* 팔 */}
        <path d="M 22 25 Q 12 28 15 38" stroke="url(#marbleGrad)" strokeWidth="4" fill="none" />
        <path d="M 38 25 Q 45 22 48 28" stroke="url(#marbleGrad)" strokeWidth="4" fill="none" />
        {/* 하이라이트 */}
        <ellipse cx="26" cy="30" rx="3" ry="5" fill="white" opacity="0.3" />
      </svg>
    ),
    // 미니 성
    castle: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="castleWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4C4A8" />
            <stop offset="100%" stopColor="#A89078" />
          </linearGradient>
          <linearGradient id="castleRoof" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="100%" stopColor="#660000" />
          </linearGradient>
        </defs>
        {/* 중앙 탑 */}
        <rect x="22" y="20" width="16" height="35" fill="url(#castleWall)" />
        <polygon points="22,20 30,5 38,20" fill="url(#castleRoof)" />
        {/* 깃발 */}
        <line x1="30" y1="5" x2="30" y2="0" stroke="#4a3728" strokeWidth="1" />
        <polygon points="30,0 40,3 30,6" fill="#FFD700" />
        {/* 왼쪽 탑 */}
        <rect x="5" y="30" width="12" height="25" fill="url(#castleWall)" />
        <polygon points="5,30 11,18 17,30" fill="url(#castleRoof)" />
        {/* 왼쪽 탑 창문 */}
        <rect x="8" y="35" width="6" height="8" rx="3" fill="#1a1a1a" />
        {/* 오른쪽 탑 */}
        <rect x="43" y="30" width="12" height="25" fill="url(#castleWall)" />
        <polygon points="43,30 49,18 55,30" fill="url(#castleRoof)" />
        {/* 오른쪽 탑 창문 */}
        <rect x="46" y="35" width="6" height="8" rx="3" fill="#1a1a1a" />
        {/* 연결 벽 */}
        <rect x="17" y="40" width="5" height="15" fill="url(#castleWall)" />
        <rect x="38" y="40" width="5" height="15" fill="url(#castleWall)" />
        {/* 중앙 문 */}
        <rect x="26" y="40" width="8" height="15" rx="4" fill="#4a3728" />
        {/* 창문들 */}
        <rect x="26" y="25" width="8" height="10" rx="4" fill="#87CEEB" />
        <line x1="30" y1="25" x2="30" y2="35" stroke="#4a3728" strokeWidth="1" />
        {/* 성벽 굴곡 */}
        <rect x="5" y="28" width="3" height="4" fill="url(#castleWall)" />
        <rect x="9" y="28" width="3" height="4" fill="url(#castleWall)" />
        <rect x="14" y="28" width="3" height="4" fill="url(#castleWall)" />
        <rect x="43" y="28" width="3" height="4" fill="url(#castleWall)" />
        <rect x="48" y="28" width="3" height="4" fill="url(#castleWall)" />
        <rect x="53" y="28" width="3" height="4" fill="url(#castleWall)" />
      </svg>
    ),
    // 텐트
    tent: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="tentFabric" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="50%" stopColor="#FF8E8E" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
        </defs>
        {/* 텐트 본체 */}
        <polygon points="30,5 5,55 55,55" fill="url(#tentFabric)" />
        {/* 텐트 줄무늬 */}
        <polygon points="30,5 20,55 25,55" fill="#FFB347" />
        <polygon points="30,5 35,55 40,55" fill="#FFB347" />
        {/* 입구 */}
        <polygon points="30,25 20,55 40,55" fill="#4a3728" />
        <polygon points="30,25 22,55 30,55" fill="#654321" />
        {/* 꼭대기 장식 */}
        <circle cx="30" cy="5" r="3" fill="#FFD700" />
        {/* 밧줄 */}
        <line x1="30" y1="5" x2="5" y2="55" stroke="#8B7355" strokeWidth="1" />
        <line x1="30" y1="5" x2="55" y2="55" stroke="#8B7355" strokeWidth="1" />
        {/* 말뚝 */}
        <line x1="3" y1="52" x2="8" y2="58" stroke="#8B7355" strokeWidth="2" />
        <line x1="57" y1="52" x2="52" y2="58" stroke="#8B7355" strokeWidth="2" />
        {/* 그림자 */}
        <ellipse cx="30" cy="56" rx="25" ry="3" fill="#1a1a1a" opacity="0.2" />
      </svg>
    ),
    // 크리스마스 트리
    christmasTree: (
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="treeGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#228B22" />
            <stop offset="100%" stopColor="#006400" />
          </linearGradient>
        </defs>
        {/* 나무 몸통 */}
        <rect x="26" y="48" width="8" height="10" fill="#8B4513" />
        {/* 트리 층 */}
        <polygon points="30,2 45,22 15,22" fill="url(#treeGreen)" />
        <polygon points="30,12 48,32 12,32" fill="url(#treeGreen)" />
        <polygon points="30,22 52,48 8,48" fill="url(#treeGreen)" />
        {/* 별 */}
        <polygon points="30,0 32,6 38,6 33,10 35,16 30,12 25,16 27,10 22,6 28,6" fill="#FFD700" />
        {/* 장식 - 빨간 공 */}
        <circle cx="22" cy="28" r="3" fill="#FF0000" />
        <circle cx="38" cy="35" r="3" fill="#FF0000" />
        <circle cx="25" cy="42" r="3" fill="#FF0000" />
        <circle cx="42" cy="44" r="3" fill="#FF0000" />
        {/* 장식 - 금색 공 */}
        <circle cx="35" cy="25" r="2.5" fill="#FFD700" />
        <circle cx="18" cy="38" r="2.5" fill="#FFD700" />
        <circle cx="33" cy="44" r="2.5" fill="#FFD700" />
        {/* 장식 - 파란 공 */}
        <circle cx="28" cy="18" r="2" fill="#4169E1" />
        <circle cx="40" cy="42" r="2" fill="#4169E1" />
        {/* 반짝임 하이라이트 */}
        <circle cx="23" cy="27" r="1" fill="white" opacity="0.6" />
        <circle cx="36" cy="24" r="0.8" fill="white" opacity="0.6" />
        <circle cx="39" cy="34" r="1" fill="white" opacity="0.6" />
        {/* 리본/가랜드 */}
        <path d="M 18 25 Q 25 28 32 25 Q 38 22 44 26" stroke="#FF69B4" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M 14 38 Q 22 42 30 38 Q 38 34 46 40" stroke="#FF69B4" strokeWidth="2" fill="none" opacity="0.7" />
      </svg>
    )
  };

  return decorations[type] || decorations.plant;
};

export default { FurnitureSVG, ElectronicsSVG, VehicleSVG, PetSVG, DecorationSVG };
