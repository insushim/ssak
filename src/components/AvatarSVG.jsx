// 실사 스타일 SVG 아바타 컴포넌트
import React from 'react';

// 얼굴 형태 SVG (남자/여자 구분)
export const FaceSVG = ({ skinColor = '#FFD5B8', expression = 'happy', size = 120, gender = 'male' }) => {
  const expressions = {
    happy: { eyeY: 45, mouthPath: 'M 45 75 Q 60 90 75 75', eyebrowY: 35 },
    cool: { eyeY: 45, mouthPath: 'M 45 78 L 75 78', eyebrowY: 33 },
    smart: { eyeY: 45, mouthPath: 'M 50 75 Q 60 82 70 75', eyebrowY: 32 },
    angel: { eyeY: 45, mouthPath: 'M 45 72 Q 60 85 75 72', eyebrowY: 36 },
    surprised: { eyeY: 45, mouthPath: 'M 55 75 Q 60 85 65 75 Q 60 85 55 75', eyebrowY: 30 },
    sad: { eyeY: 47, mouthPath: 'M 45 82 Q 60 72 75 82', eyebrowY: 38 },
    angry: { eyeY: 45, mouthPath: 'M 50 80 L 70 80', eyebrowY: 32 },
    wink: { eyeY: 45, mouthPath: 'M 45 75 Q 60 88 75 75', eyebrowY: 35 },
  };

  const expr = expressions[expression] || expressions.happy;
  const isFemale = gender === 'female';

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {/* 얼굴 윤곽 - 여자는 더 갸름하게 */}
      <ellipse cx="60" cy="60" rx={isFemale ? 42 : 45} ry={isFemale ? 48 : 50} fill={skinColor} />

      {/* 귀 */}
      <ellipse cx={isFemale ? 20 : 18} cy="60" rx={isFemale ? 6 : 8} ry={isFemale ? 10 : 12} fill={skinColor} />
      <ellipse cx={isFemale ? 100 : 102} cy="60" rx={isFemale ? 6 : 8} ry={isFemale ? 10 : 12} fill={skinColor} />

      {/* 여자 귀걸이 */}
      {isFemale && (
        <>
          <circle cx="20" cy="72" r="4" fill="#FFD700" />
          <circle cx="100" cy="72" r="4" fill="#FFD700" />
        </>
      )}

      {/* 눈썹 - 여자는 더 얇고 곡선, 남자는 굵고 직선 */}
      {isFemale ? (
        <>
          <path d={`M 33 ${expr.eyebrowY} Q 42 ${expr.eyebrowY - 5} 52 ${expr.eyebrowY + 1}`} stroke="#5a4a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M 68 ${expr.eyebrowY + 1} Q 78 ${expr.eyebrowY - 5} 87 ${expr.eyebrowY}`} stroke="#5a4a3a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M 33 ${expr.eyebrowY} Q 42 ${expr.eyebrowY - 3} 52 ${expr.eyebrowY}`} stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={`M 68 ${expr.eyebrowY} Q 78 ${expr.eyebrowY - 3} 87 ${expr.eyebrowY}`} stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* 눈 - 여자는 더 크고 둥글게, 속눈썹 추가 */}
      <ellipse cx="42" cy={expr.eyeY} rx={isFemale ? 9 : 8} ry={isFemale ? 11 : 10} fill="white" />
      <ellipse cx="78" cy={expr.eyeY} rx={isFemale ? 9 : 8} ry={isFemale ? 11 : 10} fill="white" />

      {/* 여자 속눈썹 */}
      {isFemale && (
        <>
          <path d="M 33 42 Q 36 38 40 41" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
          <path d="M 37 40 Q 40 36 44 40" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
          <path d="M 44 41 Q 47 38 50 42" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
          <path d="M 70 42 Q 73 38 76 41" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
          <path d="M 76 40 Q 79 36 82 40" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
          <path d="M 80 41 Q 83 38 87 42" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* 눈동자 - 여자는 더 크게 */}
      <circle cx="42" cy={expr.eyeY + 1} r={isFemale ? 6 : 5} fill="#2d1b0e" />
      <circle cx="78" cy={expr.eyeY + 1} r={isFemale ? 6 : 5} fill="#2d1b0e" />

      {/* 눈 하이라이트 */}
      <circle cx="44" cy={expr.eyeY - 1} r={isFemale ? 2.5 : 2} fill="white" />
      <circle cx="80" cy={expr.eyeY - 1} r={isFemale ? 2.5 : 2} fill="white" />
      {isFemale && (
        <>
          <circle cx="40" cy={expr.eyeY + 2} r="1" fill="white" />
          <circle cx="76" cy={expr.eyeY + 2} r="1" fill="white" />
        </>
      )}

      {/* 코 - 여자는 더 작고 섬세하게 */}
      <path d={isFemale ? "M 59 55 Q 60 62 61 55" : "M 57 52 Q 60 65 63 52"} stroke="#d4a574" strokeWidth={isFemale ? 1.5 : 2} fill="none" />

      {/* 입 - 여자는 더 도톰하고 핑크빛 */}
      <path d={expr.mouthPath} stroke={isFemale ? "#e57373" : "#c96b6b"} strokeWidth={isFemale ? 3.5 : 3} fill="none" strokeLinecap="round" />
      {isFemale && (
        <path d={expr.mouthPath} stroke="#ff9999" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      )}

      {/* 볼 터치 - 여자는 더 진하고 넓게 */}
      <ellipse cx="28" cy="65" rx={isFemale ? 10 : 8} ry={isFemale ? 6 : 5} fill={isFemale ? "#ff9999" : "#ffb5b5"} opacity={isFemale ? 0.6 : 0.5} />
      <ellipse cx="92" cy="65" rx={isFemale ? 10 : 8} ry={isFemale ? 6 : 5} fill={isFemale ? "#ff9999" : "#ffb5b5"} opacity={isFemale ? 0.6 : 0.5} />

      {/* 남자 턱 라인 강조 */}
      {!isFemale && (
        <path d="M 25 75 Q 60 110 95 75" stroke={skinColor} strokeWidth="3" fill="none" opacity="0.3" />
      )}
    </svg>
  );
};

// 동물 얼굴 SVG
export const AnimalFaceSVG = ({ type = 'fox', size = 120 }) => {
  const animals = {
    fox: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="65" rx="35" ry="38" fill="#FF7F50" />
        <ellipse cx="60" cy="75" rx="20" ry="22" fill="white" />
        <polygon points="35,30 25,5 50,25" fill="#FF7F50" />
        <polygon points="85,30 95,5 70,25" fill="#FF7F50" />
        <polygon points="35,30 30,12 45,25" fill="#FFB38A" />
        <polygon points="85,30 90,12 75,25" fill="#FFB38A" />
        <ellipse cx="45" cy="55" rx="6" ry="8" fill="#2d1b0e" />
        <ellipse cx="75" cy="55" rx="6" ry="8" fill="#2d1b0e" />
        <circle cx="47" cy="53" r="2" fill="white" />
        <circle cx="77" cy="53" r="2" fill="white" />
        <ellipse cx="60" cy="72" rx="5" ry="4" fill="#2d1b0e" />
        <path d="M 55 78 Q 60 85 65 78" stroke="#2d1b0e" strokeWidth="2" fill="none" />
      </svg>
    ),
    rabbit: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="70" rx="38" ry="40" fill="#F5F5F5" />
        <ellipse cx="40" cy="20" rx="12" ry="35" fill="#F5F5F5" />
        <ellipse cx="80" cy="20" rx="12" ry="35" fill="#F5F5F5" />
        <ellipse cx="40" cy="20" rx="6" ry="25" fill="#FFB5B5" />
        <ellipse cx="80" cy="20" rx="6" ry="25" fill="#FFB5B5" />
        <ellipse cx="45" cy="60" rx="8" ry="10" fill="#FF6B6B" />
        <ellipse cx="75" cy="60" rx="8" ry="10" fill="#FF6B6B" />
        <circle cx="45" cy="60" r="4" fill="#2d1b0e" />
        <circle cx="75" cy="60" r="4" fill="#2d1b0e" />
        <circle cx="47" cy="58" r="1.5" fill="white" />
        <circle cx="77" cy="58" r="1.5" fill="white" />
        <ellipse cx="60" cy="78" rx="6" ry="4" fill="#FFB5B5" />
        <path d="M 54 85 Q 60 92 66 85" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
        <line x1="30" y1="75" x2="15" y2="72" stroke="#ccc" strokeWidth="1" />
        <line x1="30" y1="78" x2="15" y2="80" stroke="#ccc" strokeWidth="1" />
        <line x1="90" y1="75" x2="105" y2="72" stroke="#ccc" strokeWidth="1" />
        <line x1="90" y1="78" x2="105" y2="80" stroke="#ccc" strokeWidth="1" />
      </svg>
    ),
    bear: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="25" cy="25" r="18" fill="#8B4513" />
        <circle cx="95" cy="25" r="18" fill="#8B4513" />
        <circle cx="25" cy="25" r="10" fill="#D2691E" />
        <circle cx="95" cy="25" r="10" fill="#D2691E" />
        <ellipse cx="60" cy="65" rx="42" ry="45" fill="#8B4513" />
        <ellipse cx="60" cy="78" rx="22" ry="20" fill="#D2B48C" />
        <ellipse cx="45" cy="55" rx="6" ry="8" fill="#1a1a1a" />
        <ellipse cx="75" cy="55" rx="6" ry="8" fill="#1a1a1a" />
        <circle cx="47" cy="53" r="2" fill="white" />
        <circle cx="77" cy="53" r="2" fill="white" />
        <ellipse cx="60" cy="72" rx="8" ry="6" fill="#1a1a1a" />
        <path d="M 50 82 Q 60 92 70 82" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      </svg>
    ),
    lion: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="55" fill="#DAA520" />
        {[...Array(16)].map((_, i) => (
          <ellipse
            key={i}
            cx={60 + 48 * Math.cos(i * Math.PI / 8)}
            cy={60 + 48 * Math.sin(i * Math.PI / 8)}
            rx="12" ry="18"
            fill="#CD853F"
            transform={`rotate(${i * 22.5} ${60 + 48 * Math.cos(i * Math.PI / 8)} ${60 + 48 * Math.sin(i * Math.PI / 8)})`}
          />
        ))}
        <ellipse cx="60" cy="65" rx="35" ry="38" fill="#F4A460" />
        <ellipse cx="60" cy="78" rx="18" ry="15" fill="#FFE4C4" />
        <ellipse cx="45" cy="55" rx="6" ry="8" fill="#8B4513" />
        <ellipse cx="75" cy="55" rx="6" ry="8" fill="#8B4513" />
        <circle cx="47" cy="53" r="2" fill="white" />
        <circle cx="77" cy="53" r="2" fill="white" />
        <ellipse cx="60" cy="72" rx="6" ry="5" fill="#1a1a1a" />
        <path d="M 50 82 Q 60 90 70 82" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      </svg>
    ),
    cat: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="68" rx="38" ry="40" fill="#808080" />
        <polygon points="28,45 15,5 45,35" fill="#808080" />
        <polygon points="92,45 105,5 75,35" fill="#808080" />
        <polygon points="28,45 20,15 40,35" fill="#FFB5B5" />
        <polygon points="92,45 100,15 80,35" fill="#FFB5B5" />
        <ellipse cx="60" cy="80" rx="15" ry="12" fill="white" />
        <ellipse cx="42" cy="58" rx="10" ry="12" fill="#90EE90" />
        <ellipse cx="78" cy="58" rx="10" ry="12" fill="#90EE90" />
        <ellipse cx="42" cy="60" rx="3" ry="8" fill="#1a1a1a" />
        <ellipse cx="78" cy="60" rx="3" ry="8" fill="#1a1a1a" />
        <ellipse cx="60" cy="75" rx="5" ry="4" fill="#FFB5B5" />
        <path d="M 55 80 Q 60 85 65 80" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        <line x1="25" y1="72" x2="8" y2="68" stroke="#555" strokeWidth="1.5" />
        <line x1="25" y1="76" x2="8" y2="76" stroke="#555" strokeWidth="1.5" />
        <line x1="25" y1="80" x2="8" y2="84" stroke="#555" strokeWidth="1.5" />
        <line x1="95" y1="72" x2="112" y2="68" stroke="#555" strokeWidth="1.5" />
        <line x1="95" y1="76" x2="112" y2="76" stroke="#555" strokeWidth="1.5" />
        <line x1="95" y1="80" x2="112" y2="84" stroke="#555" strokeWidth="1.5" />
      </svg>
    ),
    dog: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="65" rx="40" ry="42" fill="#D2691E" />
        <ellipse cx="25" cy="35" rx="15" ry="25" fill="#8B4513" transform="rotate(-20, 25, 35)" />
        <ellipse cx="95" cy="35" rx="15" ry="25" fill="#8B4513" transform="rotate(20, 95, 35)" />
        <ellipse cx="60" cy="78" rx="22" ry="18" fill="#FFE4C4" />
        <ellipse cx="42" cy="55" rx="8" ry="10" fill="white" />
        <ellipse cx="78" cy="55" rx="8" ry="10" fill="white" />
        <circle cx="42" cy="57" r="5" fill="#4a3728" />
        <circle cx="78" cy="57" r="5" fill="#4a3728" />
        <circle cx="44" cy="55" r="2" fill="white" />
        <circle cx="80" cy="55" r="2" fill="white" />
        <ellipse cx="60" cy="72" rx="8" ry="6" fill="#1a1a1a" />
        <path d="M 50 82 Q 60 92 70 82" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        <ellipse cx="60" cy="95" rx="6" ry="3" fill="#FF6B6B" />
      </svg>
    ),
    panda: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="65" rx="42" ry="45" fill="white" />
        <circle cx="28" cy="30" r="15" fill="#1a1a1a" />
        <circle cx="92" cy="30" r="15" fill="#1a1a1a" />
        <ellipse cx="38" cy="55" rx="15" ry="18" fill="#1a1a1a" />
        <ellipse cx="82" cy="55" rx="15" ry="18" fill="#1a1a1a" />
        <ellipse cx="38" cy="55" rx="8" ry="10" fill="white" />
        <ellipse cx="82" cy="55" rx="8" ry="10" fill="white" />
        <circle cx="38" cy="57" r="5" fill="#1a1a1a" />
        <circle cx="82" cy="57" r="5" fill="#1a1a1a" />
        <circle cx="40" cy="55" r="2" fill="white" />
        <circle cx="84" cy="55" r="2" fill="white" />
        <ellipse cx="60" cy="75" rx="8" ry="6" fill="#1a1a1a" />
        <path d="M 52 82 Q 60 88 68 82" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      </svg>
    ),
    tiger: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="65" rx="42" ry="45" fill="#FF8C00" />
        <circle cx="25" cy="25" r="15" fill="#FF8C00" />
        <circle cx="95" cy="25" r="15" fill="#FF8C00" />
        <circle cx="25" cy="25" r="8" fill="white" />
        <circle cx="95" cy="25" r="8" fill="white" />
        <ellipse cx="60" cy="80" rx="25" ry="20" fill="white" />
        <path d="M 40 30 L 35 50" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 50 25 L 48 45" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 60 22 L 60 40" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 70 25 L 72 45" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 80 30 L 85 50" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="42" cy="55" rx="8" ry="10" fill="white" />
        <ellipse cx="78" cy="55" rx="8" ry="10" fill="white" />
        <circle cx="42" cy="57" r="5" fill="#FF8C00" />
        <circle cx="78" cy="57" r="5" fill="#FF8C00" />
        <circle cx="42" cy="57" r="3" fill="#1a1a1a" />
        <circle cx="78" cy="57" r="3" fill="#1a1a1a" />
        <ellipse cx="60" cy="72" rx="6" ry="5" fill="#FFB5B5" />
        <path d="M 50 82 Q 60 90 70 82" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      </svg>
    ),
    unicorn: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="hornGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF69B4" />
          </linearGradient>
          <linearGradient id="maneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="33%" stopColor="#9370DB" />
            <stop offset="66%" stopColor="#00CED1" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="68" rx="38" ry="40" fill="white" />
        <ellipse cx="25" cy="30" rx="12" ry="20" fill="white" />
        <ellipse cx="95" cy="30" rx="12" ry="20" fill="white" />
        <ellipse cx="25" cy="30" rx="6" ry="12" fill="#FFB5B5" />
        <ellipse cx="95" cy="30" rx="6" ry="12" fill="#FFB5B5" />
        <polygon points="60,0 52,35 68,35" fill="url(#hornGradient)" />
        <path d="M 55 2 L 65 2 M 53 10 L 67 10 M 54 18 L 66 18 M 55 26 L 65 26" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        <path d="M 20 15 Q 5 40 15 60 Q 20 45 25 35" fill="url(#maneGradient)" />
        <path d="M 100 15 Q 115 40 105 60 Q 100 45 95 35" fill="url(#maneGradient)" />
        <ellipse cx="42" cy="58" rx="8" ry="10" fill="#E6E6FA" />
        <ellipse cx="78" cy="58" rx="8" ry="10" fill="#E6E6FA" />
        <circle cx="42" cy="60" r="5" fill="#9370DB" />
        <circle cx="78" cy="60" r="5" fill="#9370DB" />
        <circle cx="44" cy="58" r="2" fill="white" />
        <circle cx="80" cy="58" r="2" fill="white" />
        <ellipse cx="60" cy="78" rx="5" ry="4" fill="#FFB5B5" />
        <path d="M 50 85 Q 60 92 70 85" stroke="#FF69B4" strokeWidth="2" fill="none" />
        <ellipse cx="32" cy="72" rx="6" ry="4" fill="#FFB5B5" opacity="0.6" />
        <ellipse cx="88" cy="72" rx="6" ry="4" fill="#FFB5B5" opacity="0.6" />
      </svg>
    ),
    dragon: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="65" rx="40" ry="42" fill="#228B22" />
        <polygon points="25,35 10,10 35,30" fill="#228B22" />
        <polygon points="95,35 110,10 85,30" fill="#228B22" />
        <polygon points="40,10 50,0 55,15 45,20" fill="#FFD700" />
        <polygon points="55,8 62,0 68,8 62,18" fill="#FFD700" />
        <polygon points="65,15 75,0 80,10 70,20" fill="#FFD700" />
        <ellipse cx="60" cy="80" rx="25" ry="18" fill="#90EE90" />
        <ellipse cx="40" cy="55" rx="10" ry="12" fill="#FFD700" />
        <ellipse cx="80" cy="55" rx="10" ry="12" fill="#FFD700" />
        <ellipse cx="40" cy="57" rx="4" ry="8" fill="#1a1a1a" />
        <ellipse cx="80" cy="57" rx="4" ry="8" fill="#1a1a1a" />
        <ellipse cx="60" cy="75" rx="6" ry="4" fill="#006400" />
        <path d="M 45 85 Q 60 98 75 85" stroke="#006400" strokeWidth="3" fill="none" />
        <path d="M 25 90 Q 20 95 25 100 L 28 95 Q 23 92 25 90" fill="#FF4500" />
        <path d="M 95 90 Q 100 95 95 100 L 92 95 Q 97 92 95 90" fill="#FF4500" />
      </svg>
    ),
    owl: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="68" rx="38" ry="42" fill="#8B4513" />
        <polygon points="35,30 25,10 45,25" fill="#8B4513" />
        <polygon points="85,30 95,10 75,25" fill="#8B4513" />
        <polygon points="35,30 28,15 42,25" fill="#D2691E" />
        <polygon points="85,30 92,15 78,25" fill="#D2691E" />
        <ellipse cx="60" cy="85" rx="20" ry="15" fill="#DEB887" />
        <circle cx="40" cy="55" r="18" fill="#DEB887" />
        <circle cx="80" cy="55" r="18" fill="#DEB887" />
        <circle cx="40" cy="55" r="12" fill="white" />
        <circle cx="80" cy="55" r="12" fill="white" />
        <circle cx="40" cy="55" r="8" fill="#FF8C00" />
        <circle cx="80" cy="55" r="8" fill="#FF8C00" />
        <circle cx="40" cy="55" r="5" fill="#1a1a1a" />
        <circle cx="80" cy="55" r="5" fill="#1a1a1a" />
        <circle cx="42" cy="53" r="2" fill="white" />
        <circle cx="82" cy="53" r="2" fill="white" />
        <polygon points="60,70 55,80 60,78 65,80" fill="#FF8C00" />
      </svg>
    ),
    robot: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A0A0A0" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>
        </defs>
        <line x1="60" y1="0" x2="60" y2="15" stroke="#404040" strokeWidth="4" />
        <circle cx="60" cy="5" r="5" fill="#FF0000" />
        <rect x="20" y="20" width="80" height="85" rx="10" fill="url(#robotGradient)" />
        <rect x="5" y="40" width="15" height="40" rx="5" fill="#808080" />
        <rect x="100" y="40" width="15" height="40" rx="5" fill="#808080" />
        <rect x="30" y="30" width="25" height="20" rx="3" fill="#1a1a1a" />
        <rect x="65" y="30" width="25" height="20" rx="3" fill="#1a1a1a" />
        <circle cx="42" cy="40" r="8" fill="#00FFFF" />
        <circle cx="78" cy="40" r="8" fill="#00FFFF" />
        <circle cx="42" cy="40" r="4" fill="white" opacity="0.5" />
        <circle cx="78" cy="40" r="4" fill="white" opacity="0.5" />
        <rect x="35" y="65" width="50" height="10" rx="3" fill="#404040" />
        <rect x="40" y="67" width="8" height="6" fill="#00FF00" />
        <rect x="52" y="67" width="8" height="6" fill="#00FF00" />
        <rect x="64" y="67" width="8" height="6" fill="#00FF00" />
        <rect x="76" y="67" width="8" height="6" fill="#00FF00" />
        <rect x="45" y="85" width="30" height="8" rx="2" fill="#505050" />
        <circle cx="25" cy="95" r="3" fill="#FFD700" />
        <circle cx="95" cy="95" r="3" fill="#FFD700" />
      </svg>
    ),
    alien: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="alienGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#98FB98" />
            <stop offset="100%" stopColor="#228B22" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="55" rx="45" ry="50" fill="url(#alienGradient)" />
        <ellipse cx="40" cy="50" rx="18" ry="22" fill="#1a1a1a" />
        <ellipse cx="80" cy="50" rx="18" ry="22" fill="#1a1a1a" />
        <ellipse cx="40" cy="50" rx="14" ry="18" fill="#90EE90" />
        <ellipse cx="80" cy="50" rx="14" ry="18" fill="#90EE90" />
        <ellipse cx="40" cy="52" rx="6" ry="10" fill="#1a1a1a" />
        <ellipse cx="80" cy="52" rx="6" ry="10" fill="#1a1a1a" />
        <circle cx="42" cy="48" r="3" fill="white" opacity="0.7" />
        <circle cx="82" cy="48" r="3" fill="white" opacity="0.7" />
        <ellipse cx="60" cy="85" rx="8" ry="5" fill="#006400" />
        <line x1="52" y1="85" x2="68" y2="85" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    ghost: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <filter id="ghostGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M 25 60 Q 25 15 60 15 Q 95 15 95 60 L 95 100 Q 87 90 80 100 Q 72 90 65 100 Q 57 90 50 100 Q 42 90 35 100 Q 27 90 25 100 Z" fill="white" filter="url(#ghostGlow)" opacity="0.95" />
        <ellipse cx="45" cy="50" rx="10" ry="12" fill="#1a1a1a" />
        <ellipse cx="75" cy="50" rx="10" ry="12" fill="#1a1a1a" />
        <circle cx="47" cy="48" r="3" fill="white" />
        <circle cx="77" cy="48" r="3" fill="white" />
        <ellipse cx="60" cy="75" rx="10" ry="8" fill="#1a1a1a" />
      </svg>
    )
  };

  return animals[type] || animals.fox;
};

// 머리카락 SVG - 얼굴(눈 위치 y=45) 위에 자연스럽게 배치
// 앞머리는 y=35 정도까지만 내려와서 눈을 가리지 않음
export const HairSVG = ({ style = 'default', color = '#1a1a1a', size = 120, gender = 'male' }) => {
  const lighterColor = color === '#1a1a1a' ? '#3a3a3a' : color;

  const hairStyles = {
    // 기본 - 자연스러운 짧은 머리 (남성형)
    default: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 윗부분 */}
        <ellipse cx="60" cy="18" rx="46" ry="16" fill={color} />
        {/* 뒤통수 */}
        <path d="M 14 25 Q 14 8 60 5 Q 106 8 106 25 L 106 35 Q 100 38 60 38 Q 20 38 14 35 Z" fill={color} />
        {/* 옆머리 (귀 위) */}
        <path d="M 14 30 Q 8 40 10 55 L 18 52 Q 16 42 18 32 Z" fill={color} />
        <path d="M 106 30 Q 112 40 110 55 L 102 52 Q 104 42 102 32 Z" fill={color} />
        {/* 앞머리 - 이마만 살짝 덮음 */}
        <path d="M 25 30 Q 40 24 60 26 Q 80 24 95 30 Q 85 38 60 36 Q 35 38 25 30 Z" fill={color} />
        {/* 하이라이트 */}
        <ellipse cx="45" cy="15" rx="12" ry="6" fill={lighterColor} opacity="0.2" />
      </svg>
    ),
    // 단발 - 볼 정도 길이 (여성형 단발)
    short: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 윗부분 볼륨 */}
        <ellipse cx="60" cy="16" rx="48" ry="14" fill={color} />
        {/* 뒤통수 */}
        <path d="M 12 22 Q 12 6 60 3 Q 108 6 108 22" fill={color} />
        {/* 옆머리 - 볼까지 내려옴 */}
        <path d="M 12 22 L 8 70 Q 10 78 20 78 L 22 40 Q 18 30 12 25 Z" fill={color} />
        <path d="M 108 22 L 112 70 Q 110 78 100 78 L 98 40 Q 102 30 108 25 Z" fill={color} />
        {/* 앞머리 뱅 - 눈썹 위까지만 */}
        <path d="M 20 28 Q 40 22 60 24 Q 80 22 100 28 Q 90 36 60 34 Q 30 36 20 28 Z" fill={color} />
        {/* 하이라이트 */}
        <ellipse cx="50" cy="14" rx="16" ry="6" fill={lighterColor} opacity="0.2" />
      </svg>
    ),
    // 긴머리 - 어깨까지
    long: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 윗부분 */}
        <ellipse cx="60" cy="15" rx="48" ry="13" fill={color} />
        {/* 뒤통수 */}
        <path d="M 12 20 Q 10 5 60 2 Q 110 5 108 20" fill={color} />
        {/* 왼쪽 긴 머리 */}
        <path d="M 12 20 Q 2 45 5 80 Q 8 115 25 118 Q 35 115 32 90 L 28 55 Q 22 35 12 25 Z" fill={color} />
        {/* 오른쪽 긴 머리 */}
        <path d="M 108 20 Q 118 45 115 80 Q 112 115 95 118 Q 85 115 88 90 L 92 55 Q 98 35 108 25 Z" fill={color} />
        {/* 앞머리 - 눈썹 위까지 */}
        <path d="M 22 28 Q 40 20 60 22 Q 80 20 98 28 Q 88 36 60 34 Q 32 36 22 28 Z" fill={color} />
        {/* 하이라이트 */}
        <path d="M 12 40 Q 8 70 15 100" stroke={lighterColor} strokeWidth="4" opacity="0.2" fill="none" />
        <path d="M 108 40 Q 112 70 105 100" stroke={lighterColor} strokeWidth="4" opacity="0.2" fill="none" />
      </svg>
    ),
    // 곱슬머리
    curly: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 곱슬 볼륨 베이스 */}
        <ellipse cx="60" cy="22" rx="48" ry="18" fill={color} />
        {/* 위쪽 곱슬 */}
        <circle cx="28" cy="12" r="12" fill={color} />
        <circle cx="50" cy="6" r="11" fill={color} />
        <circle cx="72" cy="6" r="11" fill={color} />
        <circle cx="94" cy="12" r="12" fill={color} />
        {/* 옆 곱슬 */}
        <circle cx="8" cy="35" r="12" fill={color} />
        <circle cx="5" cy="55" r="10" fill={color} />
        <circle cx="8" cy="73" r="9" fill={color} />
        <circle cx="112" cy="35" r="12" fill={color} />
        <circle cx="115" cy="55" r="10" fill={color} />
        <circle cx="112" cy="73" r="9" fill={color} />
        {/* 앞머리 곱슬 - 눈 위에 */}
        <circle cx="35" cy="30" r="8" fill={color} />
        <circle cx="55" cy="28" r="9" fill={color} />
        <circle cx="75" cy="28" r="9" fill={color} />
        <circle cx="90" cy="30" r="8" fill={color} />
        {/* 하이라이트 */}
        <circle cx="45" cy="10" r="4" fill={lighterColor} opacity="0.25" />
        <circle cx="75" cy="10" r="4" fill={lighterColor} opacity="0.25" />
      </svg>
    ),
    // 뾰족 스파이크 (남성형)
    spiky: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 베이스 */}
        <ellipse cx="60" cy="28" rx="44" ry="16" fill={color} />
        {/* 스파이크들 */}
        <polygon points="18,28 8,0 32,22" fill={color} />
        <polygon points="32,22 28,-8 48,18" fill={color} />
        <polygon points="48,18 55,-12 65,18" fill={color} />
        <polygon points="72,18 75,-8 92,22" fill={color} />
        <polygon points="88,22 102,0 105,28" fill={color} />
        {/* 옆머리 */}
        <path d="M 16 30 Q 8 42 10 55 L 20 52 Q 18 42 20 32 Z" fill={color} />
        <path d="M 104 30 Q 112 42 110 55 L 100 52 Q 102 42 100 32 Z" fill={color} />
        {/* 하이라이트 */}
        <polygon points="55,18 58,0 62,18" fill={lighterColor} opacity="0.3" />
      </svg>
    ),
    // 묶음머리 (번/상투)
    bun: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 윗부분 */}
        <ellipse cx="60" cy="22" rx="46" ry="14" fill={color} />
        <path d="M 14 25 Q 14 10 60 5 Q 106 10 106 25" fill={color} />
        {/* 번 (상투) - 위에 */}
        <circle cx="60" cy="-2" r="18" fill={color} />
        <ellipse cx="60" cy="-4" rx="10" ry="8" fill={lighterColor} opacity="0.15" />
        {/* 앞머리 */}
        <path d="M 25 28 Q 42 22 60 24 Q 78 22 95 28 Q 85 36 60 34 Q 35 36 25 28 Z" fill={color} />
        {/* 옆머리 */}
        <path d="M 14 28 Q 8 40 10 55 L 18 52 Q 16 42 18 30 Z" fill={color} />
        <path d="M 106 28 Q 112 40 110 55 L 102 52 Q 104 42 102 30 Z" fill={color} />
      </svg>
    ),
    // 공주머리 (웨이브 긴머리)
    princess: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 윗부분 */}
        <ellipse cx="60" cy="14" rx="48" ry="12" fill={color} />
        <path d="M 12 18 Q 10 4 60 1 Q 110 4 108 18" fill={color} />
        {/* 왼쪽 웨이브 */}
        <path d="M 12 18 Q 0 40 8 60 Q 0 80 8 100 Q 15 118 28 116 Q 38 110 35 90 Q 40 70 35 52 L 28 38 Q 22 28 12 22 Z" fill={color} />
        {/* 오른쪽 웨이브 */}
        <path d="M 108 18 Q 120 40 112 60 Q 120 80 112 100 Q 105 118 92 116 Q 82 110 85 90 Q 80 70 85 52 L 92 38 Q 98 28 108 22 Z" fill={color} />
        {/* 앞머리 - 양갈래로 나뉨 */}
        <path d="M 22 25 Q 38 18 55 22 L 50 34 Q 35 32 22 28 Z" fill={color} />
        <path d="M 98 25 Q 82 18 65 22 L 70 34 Q 85 32 98 28 Z" fill={color} />
        {/* 가르마 */}
        <path d="M 60 8 L 60 32" stroke={lighterColor} strokeWidth="2" opacity="0.3" />
        {/* 하이라이트 웨이브 */}
        <path d="M 15 35 Q 5 55 12 75 Q 5 95 12 110" stroke={lighterColor} strokeWidth="3" opacity="0.2" fill="none" />
        <path d="M 105 35 Q 115 55 108 75 Q 115 95 108 110" stroke={lighterColor} strokeWidth="3" opacity="0.2" fill="none" />
      </svg>
    )
  };

  return hairStyles[style] || hairStyles.default;
};

// 옷 SVG
export const ClothesSVG = ({ type = 'tshirt', color = '#4A90D9', size = 120 }) => {
  const clothesTypes = {
    tshirt: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 30 0 L 10 25 L 25 35 L 25 120 L 95 120 L 95 35 L 110 25 L 90 0 L 75 15 Q 60 25 45 15 Z" fill={color} />
        <path d="M 30 0 L 10 25 L 25 35 L 25 0" fill={color} opacity="0.8" />
        <path d="M 90 0 L 110 25 L 95 35 L 95 0" fill={color} opacity="0.8" />
        <path d="M 45 15 Q 60 25 75 15" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
      </svg>
    ),
    shirt: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 30 0 L 10 25 L 25 35 L 25 120 L 95 120 L 95 35 L 110 25 L 90 0 L 75 15 Q 60 25 45 15 Z" fill={color} />
        <rect x="57" y="0" width="6" height="120" fill="white" opacity="0.3" />
        <circle cx="60" cy="30" r="3" fill="white" opacity="0.5" />
        <circle cx="60" cy="50" r="3" fill="white" opacity="0.5" />
        <circle cx="60" cy="70" r="3" fill="white" opacity="0.5" />
        <circle cx="60" cy="90" r="3" fill="white" opacity="0.5" />
        <path d="M 43 0 L 50 15 L 60 8 L 70 15 L 77 0" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    ),
    dress: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 40 0 Q 60 10 80 0 L 95 120 L 25 120 Z" fill={color} />
        <path d="M 40 0 L 20 20 L 30 25 L 30 35 Q 25 40 30 45 L 30 0" fill={color} opacity="0.8" />
        <path d="M 80 0 L 100 20 L 90 25 L 90 35 Q 95 40 90 45 L 90 0" fill={color} opacity="0.8" />
        <ellipse cx="60" cy="30" rx="25" ry="5" fill="white" opacity="0.2" />
      </svg>
    ),
    hoodie: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 30 0 L 5 30 L 20 40 L 20 120 L 100 120 L 100 40 L 115 30 L 90 0 Z" fill={color} />
        <path d="M 30 0 Q 60 20 90 0 Q 80 35 60 45 Q 40 35 30 0" fill={color} stroke={color} strokeWidth="2" />
        <ellipse cx="60" cy="35" rx="15" ry="10" fill="rgba(0,0,0,0.15)" />
        <rect x="45" y="60" width="30" height="35" rx="3" fill="rgba(0,0,0,0.1)" />
      </svg>
    ),
    suit: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 30 0 L 10 25 L 25 35 L 25 120 L 95 120 L 95 35 L 110 25 L 90 0 L 75 15 Q 60 25 45 15 Z" fill="#1a1a1a" />
        <path d="M 45 15 L 55 120 L 65 120 L 75 15" fill="white" />
        <polygon points="45,15 60,5 75,15 60,30" fill="white" />
        <polygon points="50,25 60,20 70,25 60,35" fill="#C41E3A" />
        <path d="M 30 0 L 45 15 L 35 45 L 30 120 L 25 120 L 25 35 L 10 25 Z" fill="#1a1a1a" opacity="0.9" />
        <path d="M 90 0 L 75 15 L 85 45 L 90 120 L 95 120 L 95 35 L 110 25 Z" fill="#1a1a1a" opacity="0.9" />
      </svg>
    ),
    hanbok: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 35 30 L 10 120 L 110 120 L 85 30 Z" fill="#E91E63" />
        <path d="M 35 0 L 15 40 L 30 40 L 30 30 Q 60 40 90 30 L 90 40 L 105 40 L 85 0 Z" fill="#FFEB3B" />
        <path d="M 35 30 Q 60 40 85 30 Q 80 50 60 50 Q 40 50 35 30" fill="#E91E63" />
        <rect x="55" y="30" width="10" height="30" fill="#4CAF50" />
        <circle cx="60" cy="60" r="8" fill="#4CAF50" />
        <path d="M 60 68 Q 55 90 40 110" stroke="#4CAF50" strokeWidth="4" fill="none" />
        <path d="M 60 68 Q 65 90 80 110" stroke="#4CAF50" strokeWidth="4" fill="none" />
      </svg>
    ),
    armor: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C0C0C0" />
            <stop offset="50%" stopColor="#808080" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
        </defs>
        <path d="M 30 10 L 15 35 L 25 45 L 25 120 L 95 120 L 95 45 L 105 35 L 90 10 Z" fill="url(#metalGradient)" />
        <ellipse cx="60" cy="50" rx="25" ry="30" fill="#606060" />
        <path d="M 45 35 L 60 30 L 75 35 L 75 65 L 60 70 L 45 65 Z" fill="#808080" stroke="#404040" strokeWidth="2" />
        <rect x="5" y="30" width="25" height="50" rx="5" fill="url(#metalGradient)" />
        <rect x="90" y="30" width="25" height="50" rx="5" fill="url(#metalGradient)" />
      </svg>
    )
  };

  return clothesTypes[type] || clothesTypes.tshirt;
};

// 악세서리 SVG
export const AccessorySVG = ({ type = 'none', size = 120 }) => {
  if (type === 'none') return null;

  const accessories = {
    glasses: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <rect x="25" y="40" width="30" height="22" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="65" y="40" width="30" height="22" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <path d="M 55 50 L 65 50" stroke="#1a1a1a" strokeWidth="3" />
        <path d="M 25 50 L 15 48" stroke="#1a1a1a" strokeWidth="3" />
        <path d="M 95 50 L 105 48" stroke="#1a1a1a" strokeWidth="3" />
      </svg>
    ),
    sunglasses: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <rect x="22" y="38" width="35" height="26" rx="5" fill="#1a1a1a" />
        <rect x="63" y="38" width="35" height="26" rx="5" fill="#1a1a1a" />
        <path d="M 57 50 L 63 50" stroke="#1a1a1a" strokeWidth="4" />
        <path d="M 22 50 L 10 46" stroke="#1a1a1a" strokeWidth="4" />
        <path d="M 98 50 L 110 46" stroke="#1a1a1a" strokeWidth="4" />
        <rect x="25" y="42" width="8" height="5" rx="2" fill="white" opacity="0.3" />
        <rect x="66" y="42" width="8" height="5" rx="2" fill="white" opacity="0.3" />
      </svg>
    ),
    crown: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
        <path d="M 25 45 L 35 15 L 50 35 L 60 5 L 70 35 L 85 15 L 95 45 L 90 50 L 30 50 Z" fill="url(#crownGradient)" />
        <circle cx="35" cy="15" r="5" fill="#FF0000" />
        <circle cx="60" cy="5" r="6" fill="#00BFFF" />
        <circle cx="85" cy="15" r="5" fill="#00FF00" />
        <rect x="30" y="45" width="60" height="8" fill="url(#crownGradient)" />
        <circle cx="45" cy="49" r="3" fill="#FF69B4" />
        <circle cx="60" cy="49" r="3" fill="#FF69B4" />
        <circle cx="75" cy="49" r="3" fill="#FF69B4" />
      </svg>
    ),
    bow: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="40" cy="25" rx="18" ry="12" fill="#FF69B4" />
        <ellipse cx="80" cy="25" rx="18" ry="12" fill="#FF69B4" />
        <circle cx="60" cy="25" r="8" fill="#FF1493" />
        <ellipse cx="40" cy="25" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />
        <ellipse cx="80" cy="25" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />
        <path d="M 55 33 L 50 50 L 60 45 L 70 50 L 65 33" fill="#FF69B4" />
      </svg>
    ),
    hat: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <ellipse cx="60" cy="45" rx="50" ry="12" fill="#1a1a1a" />
        <ellipse cx="60" cy="42" rx="35" ry="8" fill="#2d2d2d" />
        <path d="M 30 42 Q 30 10 60 5 Q 90 10 90 42" fill="#1a1a1a" />
        <rect x="30" y="35" width="60" height="8" fill="#8B4513" />
      </svg>
    ),
    headphones: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <path d="M 25 60 Q 25 25 60 20 Q 95 25 95 60" stroke="#1a1a1a" strokeWidth="8" fill="none" />
        <rect x="15" y="55" width="20" height="35" rx="5" fill="#1a1a1a" />
        <rect x="85" y="55" width="20" height="35" rx="5" fill="#1a1a1a" />
        <ellipse cx="25" cy="72" rx="8" ry="12" fill="#404040" />
        <ellipse cx="95" cy="72" rx="8" ry="12" fill="#404040" />
      </svg>
    ),
    wand: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="wandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#4a2810" />
          </linearGradient>
        </defs>
        <rect x="55" y="30" width="10" height="80" rx="2" fill="url(#wandGradient)" transform="rotate(-20, 60, 70)" />
        <polygon points="60,15 55,30 65,30" fill="#FFD700" transform="rotate(-20, 60, 25)" />
        <circle cx="60" cy="15" r="8" fill="#FFD700" transform="rotate(-20, 60, 15)" />
        <circle cx="60" cy="15" r="4" fill="white" opacity="0.6" transform="rotate(-20, 60, 15)" />
        <circle cx="50" cy="10" r="2" fill="#FFD700" />
        <circle cx="70" cy="8" r="2" fill="#FFD700" />
        <circle cx="55" cy="5" r="1.5" fill="#FFD700" />
        <circle cx="68" cy="18" r="1.5" fill="#FFD700" />
      </svg>
    )
  };

  return accessories[type] || null;
};

// 배경 SVG 패턴
export const BackgroundSVG = ({ type = 'default', size = 200 }) => {
  const backgrounds = {
    stars: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        {[...Array(20)].map((_, i) => (
          <polygon
            key={i}
            points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2"
            fill="#FFD700"
            transform={`translate(${20 + (i * 37) % 180}, ${15 + Math.floor(i / 5) * 45}) scale(${0.3 + Math.random() * 0.5})`}
            opacity={0.5 + Math.random() * 0.5}
          />
        ))}
      </svg>
    ),
    clouds: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <ellipse cx="40" cy="40" rx="30" ry="20" fill="white" opacity="0.7" />
        <ellipse cx="60" cy="35" rx="25" ry="18" fill="white" opacity="0.7" />
        <ellipse cx="55" cy="45" rx="20" ry="15" fill="white" opacity="0.7" />
        <ellipse cx="150" cy="80" rx="35" ry="22" fill="white" opacity="0.6" />
        <ellipse cx="170" cy="75" rx="28" ry="18" fill="white" opacity="0.6" />
        <ellipse cx="60" cy="150" rx="25" ry="18" fill="white" opacity="0.5" />
        <ellipse cx="80" cy="145" rx="22" ry="15" fill="white" opacity="0.5" />
      </svg>
    ),
    hearts: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        {[...Array(12)].map((_, i) => (
          <path
            key={i}
            d="M 0 -5 C -5 -10 -10 -5 -10 0 C -10 8 0 12 0 12 C 0 12 10 8 10 0 C 10 -5 5 -10 0 -5"
            fill="#FF69B4"
            transform={`translate(${20 + (i * 50) % 180}, ${20 + Math.floor(i / 4) * 60}) scale(${0.8 + Math.random() * 0.6})`}
            opacity={0.4 + Math.random() * 0.4}
          />
        ))}
      </svg>
    ),
    bubbles: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={20 + (i * 43) % 180}
            cy={15 + Math.floor(i / 4) * 50}
            r={5 + Math.random() * 15}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
          />
        ))}
      </svg>
    )
  };

  return backgrounds[type] || null;
};

export default { FaceSVG, AnimalFaceSVG, HairSVG, ClothesSVG, AccessorySVG, BackgroundSVG };
