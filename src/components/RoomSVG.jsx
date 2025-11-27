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

// 차량 SVG
export const VehicleSVG = ({ type = 'car', size = 80 }) => {
  const vehicles = {
    car: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <path d="M 15 45 L 20 30 L 60 30 L 65 45 L 70 45 L 70 55 L 10 55 L 10 45 Z" fill="#FF4500" />
        <path d="M 22 32 L 25 40 L 55 40 L 58 32 Z" fill="#87CEEB" />
        <rect x="10" y="50" width="60" height="10" rx="2" fill="#8B0000" />
        <circle cx="22" cy="58" r="8" fill="#1a1a1a" />
        <circle cx="58" cy="58" r="8" fill="#1a1a1a" />
        <circle cx="22" cy="58" r="5" fill="#404040" />
        <circle cx="58" cy="58" r="5" fill="#404040" />
        <rect x="65" y="42" width="8" height="5" rx="1" fill="#FFFF00" />
        <rect x="7" y="42" width="8" height="5" rx="1" fill="#FF0000" />
      </svg>
    ),
    sportsCar: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <path d="M 5 50 L 10 40 Q 25 25 55 25 L 75 40 L 75 50 L 5 50 Z" fill="#FF0000" />
        <path d="M 20 28 Q 35 25 50 28 L 55 40 L 15 40 Z" fill="#1a1a1a" />
        <rect x="5" y="48" width="70" height="8" rx="2" fill="#8B0000" />
        <circle cx="18" cy="55" r="7" fill="#1a1a1a" />
        <circle cx="62" cy="55" r="7" fill="#1a1a1a" />
        <circle cx="18" cy="55" r="4" fill="#C0C0C0" />
        <circle cx="62" cy="55" r="4" fill="#C0C0C0" />
        <rect x="68" y="42" width="10" height="4" rx="1" fill="#FFFF00" />
        <path d="M 5 45 L 2 45 L 2 50 L 5 50" fill="#FF0000" />
      </svg>
    ),
    motorcycle: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="18" cy="55" r="12" fill="#1a1a1a" />
        <circle cx="62" cy="55" r="12" fill="#1a1a1a" />
        <circle cx="18" cy="55" r="8" fill="#404040" />
        <circle cx="62" cy="55" r="8" fill="#404040" />
        <path d="M 25 55 L 35 35 L 55 35 L 55 55" fill="#FF4500" />
        <path d="M 35 35 L 30 25 L 25 25" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        <ellipse cx="45" cy="32" rx="12" ry="5" fill="#87CEEB" />
        <rect x="55" y="40" width="15" height="5" fill="#FF4500" />
      </svg>
    ),
    helicopter: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <ellipse cx="40" cy="45" rx="25" ry="15" fill="#4169E1" />
        <ellipse cx="25" cy="45" rx="10" ry="8" fill="#87CEEB" />
        <path d="M 65 45 L 75 35 L 75 55 Z" fill="#4169E1" />
        <rect x="73" y="43" width="5" height="4" fill="#4169E1" />
        <ellipse cx="75" cy="45" rx="3" ry="8" fill="#1a1a1a" />
        <rect x="35" y="20" width="10" height="5" fill="#404040" />
        <rect x="5" y="22" width="70" height="3" rx="1" fill="#1a1a1a" />
        <rect x="35" y="58" width="3" height="10" fill="#404040" />
        <rect x="42" y="58" width="3" height="10" fill="#404040" />
        <rect x="25" y="68" width="30" height="3" rx="1" fill="#404040" />
      </svg>
    ),
    rocket: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#A0A0A0" />
          </linearGradient>
        </defs>
        <path d="M 40 5 Q 55 20 55 50 L 55 65 L 25 65 L 25 50 Q 25 20 40 5" fill="url(#rocketGradient)" />
        <ellipse cx="40" cy="35" rx="8" ry="10" fill="#87CEEB" />
        <ellipse cx="40" cy="35" rx="5" ry="7" fill="#1a1a1a" opacity="0.3" />
        <path d="M 25 55 L 15 70 L 25 65" fill="#FF4500" />
        <path d="M 55 55 L 65 70 L 55 65" fill="#FF4500" />
        <path d="M 35 65 L 30 80 L 40 75 L 50 80 L 45 65" fill="#FF6347" />
        <path d="M 37 68 L 35 78 L 40 75 L 45 78 L 43 68" fill="#FFD700" />
        <circle cx="40" cy="55" r="5" fill="#FF0000" />
      </svg>
    ),
    yacht: (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <path d="M 5 50 Q 10 65 40 65 Q 70 65 75 50 L 65 50 L 60 55 L 20 55 L 15 50 Z" fill="#F5F5F5" />
        <rect x="35" y="20" width="5" height="35" fill="#8B4513" />
        <path d="M 40 20 L 65 45 L 40 45 Z" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
        <path d="M 35 25 L 15 45 L 35 45 Z" fill="#FF6347" />
        <rect x="25" y="45" width="30" height="8" rx="2" fill="#E8E8E8" />
        <rect x="30" y="47" width="8" height="4" fill="#87CEEB" />
        <rect x="42" y="47" width="8" height="4" fill="#87CEEB" />
        <path d="M 0 55 Q 10 52 20 55 Q 30 58 40 55 Q 50 52 60 55 Q 70 58 80 55 L 80 70 L 0 70 Z" fill="#4169E1" opacity="0.5" />
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
    )
  };

  return decorations[type] || decorations.plant;
};

export default { FurnitureSVG, ElectronicsSVG, VehicleSVG, PetSVG, DecorationSVG };
