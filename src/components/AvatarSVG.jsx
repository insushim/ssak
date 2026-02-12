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
    ),
    shark: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="sharkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B8E9F" />
            <stop offset="100%" stopColor="#4A6572" />
          </linearGradient>
        </defs>
        {/* 상어 머리 */}
        <ellipse cx="60" cy="60" rx="40" ry="45" fill="url(#sharkGradient)" />
        {/* 배 부분 */}
        <ellipse cx="60" cy="75" rx="30" ry="25" fill="#E8E8E8" />
        {/* 등 지느러미 */}
        <polygon points="60,5 45,30 75,30" fill="#4A6572" />
        {/* 눈 - 사나운 표정 */}
        <ellipse cx="40" cy="45" rx="10" ry="8" fill="white" />
        <ellipse cx="80" cy="45" rx="10" ry="8" fill="white" />
        <circle cx="43" cy="45" r="5" fill="#1a1a1a" />
        <circle cx="83" cy="45" r="5" fill="#1a1a1a" />
        <circle cx="45" cy="43" r="2" fill="white" />
        <circle cx="85" cy="43" r="2" fill="white" />
        {/* 눈썹 - 사나운 표정 */}
        <path d="M 28 38 L 48 42" stroke="#4A6572" strokeWidth="3" strokeLinecap="round" />
        <path d="M 92 38 L 72 42" stroke="#4A6572" strokeWidth="3" strokeLinecap="round" />
        {/* 코 */}
        <ellipse cx="60" cy="60" rx="4" ry="3" fill="#3A5662" />
        {/* 입과 이빨 */}
        <path d="M 35 80 Q 60 95 85 80" stroke="#3A5662" strokeWidth="2" fill="none" />
        <polygon points="40,78 43,88 46,78" fill="white" />
        <polygon points="52,80 55,90 58,80" fill="white" />
        <polygon points="64,80 67,90 70,80" fill="white" />
        <polygon points="76,78 79,88 82,78" fill="white" />
        {/* 아가미 */}
        <line x1="25" y1="55" x2="25" y2="65" stroke="#3A5662" strokeWidth="2" />
        <line x1="20" y1="55" x2="20" y2="65" stroke="#3A5662" strokeWidth="2" />
        <line x1="95" y1="55" x2="95" y2="65" stroke="#3A5662" strokeWidth="2" />
        <line x1="100" y1="55" x2="100" y2="65" stroke="#3A5662" strokeWidth="2" />
      </svg>
    ),
    octopus: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="octopusGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E87A90" />
            <stop offset="100%" stopColor="#C44D6E" />
          </linearGradient>
        </defs>
        {/* 머리 */}
        <ellipse cx="60" cy="45" rx="38" ry="40" fill="url(#octopusGradient)" />
        {/* 다리들 (8개) */}
        <path d="M 25 70 Q 15 90 25 105 Q 28 95 30 85" fill="#C44D6E" />
        <path d="M 35 75 Q 28 95 38 108 Q 40 98 42 88" fill="#C44D6E" />
        <path d="M 48 78 Q 45 100 52 110 Q 53 100 55 90" fill="#C44D6E" />
        <path d="M 60 80 Q 60 102 60 112 Q 62 102 62 92" fill="#C44D6E" />
        <path d="M 72 78 Q 75 100 68 110 Q 67 100 65 90" fill="#C44D6E" />
        <path d="M 85 75 Q 92 95 82 108 Q 80 98 78 88" fill="#C44D6E" />
        <path d="M 95 70 Q 105 90 95 105 Q 92 95 90 85" fill="#C44D6E" />
        {/* 빨판 */}
        <circle cx="22" cy="95" r="3" fill="#FFB5C5" />
        <circle cx="35" cy="98" r="3" fill="#FFB5C5" />
        <circle cx="50" cy="100" r="3" fill="#FFB5C5" />
        <circle cx="60" cy="102" r="3" fill="#FFB5C5" />
        <circle cx="70" cy="100" r="3" fill="#FFB5C5" />
        <circle cx="85" cy="98" r="3" fill="#FFB5C5" />
        <circle cx="98" cy="95" r="3" fill="#FFB5C5" />
        {/* 눈 */}
        <ellipse cx="45" cy="40" rx="10" ry="12" fill="white" />
        <ellipse cx="75" cy="40" rx="10" ry="12" fill="white" />
        <circle cx="47" cy="42" r="6" fill="#1a1a1a" />
        <circle cx="77" cy="42" r="6" fill="#1a1a1a" />
        <circle cx="49" cy="40" r="2" fill="white" />
        <circle cx="79" cy="40" r="2" fill="white" />
        {/* 입 - 귀여운 표정 */}
        <path d="M 50 60 Q 60 68 70 60" stroke="#8B2252" strokeWidth="2" fill="none" />
        {/* 볼 터치 */}
        <ellipse cx="30" cy="50" rx="6" ry="4" fill="#FFB5C5" opacity="0.6" />
        <ellipse cx="90" cy="50" rx="6" ry="4" fill="#FFB5C5" opacity="0.6" />
      </svg>
    ),
    pumpkin: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="pumpkinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#CC5500" />
          </linearGradient>
        </defs>
        {/* 줄기 */}
        <rect x="55" y="5" width="10" height="15" rx="2" fill="#228B22" />
        <ellipse cx="60" cy="8" rx="3" ry="2" fill="#32CD32" />
        {/* 호박 몸통 - 여러 조각 */}
        <ellipse cx="60" cy="65" rx="45" ry="42" fill="url(#pumpkinGradient)" />
        <ellipse cx="35" cy="65" rx="20" ry="40" fill="#FF7F00" />
        <ellipse cx="85" cy="65" rx="20" ry="40" fill="#FF7F00" />
        <ellipse cx="60" cy="65" rx="15" ry="42" fill="#FFA500" />
        {/* 호박 선 */}
        <path d="M 40 25 Q 35 65 40 105" stroke="#CC5500" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 60 23 Q 60 65 60 107" stroke="#CC5500" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 80 25 Q 85 65 80 105" stroke="#CC5500" strokeWidth="1" fill="none" opacity="0.5" />
        {/* 눈 - 삼각형 (잭오랜턴 스타일) */}
        <polygon points="35,50 45,35 55,50" fill="#1a1a1a" />
        <polygon points="65,50 75,35 85,50" fill="#1a1a1a" />
        {/* 눈 안의 빛 */}
        <polygon points="40,48 45,40 50,48" fill="#FFD700" opacity="0.7" />
        <polygon points="70,48 75,40 80,48" fill="#FFD700" opacity="0.7" />
        {/* 코 - 삼각형 */}
        <polygon points="60,55 55,70 65,70" fill="#1a1a1a" />
        {/* 입 - 톱니 모양 */}
        <path d="M 30 80 L 40 75 L 50 85 L 60 75 L 70 85 L 80 75 L 90 80 Q 60 100 30 80" fill="#1a1a1a" />
        {/* 입 안의 빛 */}
        <path d="M 35 82 L 45 78 L 55 86 L 60 80 L 65 86 L 75 78 L 85 82 Q 60 95 35 82" fill="#FFD700" opacity="0.5" />
      </svg>
    ),
    butterfly: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="butterflyWingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="50%" stopColor="#9370DB" />
            <stop offset="100%" stopColor="#00CED1" />
          </linearGradient>
        </defs>
        {/* 왼쪽 날개 */}
        <ellipse cx="30" cy="45" rx="25" ry="30" fill="url(#butterflyWingGradient)" opacity="0.9" />
        <ellipse cx="25" cy="80" rx="18" ry="22" fill="url(#butterflyWingGradient)" opacity="0.9" />
        {/* 오른쪽 날개 */}
        <ellipse cx="90" cy="45" rx="25" ry="30" fill="url(#butterflyWingGradient)" opacity="0.9" />
        <ellipse cx="95" cy="80" rx="18" ry="22" fill="url(#butterflyWingGradient)" opacity="0.9" />
        {/* 날개 무늬 */}
        <circle cx="30" cy="40" r="8" fill="white" opacity="0.5" />
        <circle cx="90" cy="40" r="8" fill="white" opacity="0.5" />
        <circle cx="25" cy="75" r="5" fill="white" opacity="0.5" />
        <circle cx="95" cy="75" r="5" fill="white" opacity="0.5" />
        {/* 몸통 */}
        <ellipse cx="60" cy="60" rx="8" ry="35" fill="#4a3728" />
        {/* 머리 */}
        <circle cx="60" cy="25" r="12" fill="#4a3728" />
        {/* 더듬이 */}
        <path d="M 55 15 Q 45 5 40 10" stroke="#4a3728" strokeWidth="2" fill="none" />
        <path d="M 65 15 Q 75 5 80 10" stroke="#4a3728" strokeWidth="2" fill="none" />
        <circle cx="40" cy="10" r="3" fill="#FF69B4" />
        <circle cx="80" cy="10" r="3" fill="#FF69B4" />
        {/* 눈 */}
        <circle cx="55" cy="23" r="4" fill="white" />
        <circle cx="65" cy="23" r="4" fill="white" />
        <circle cx="56" cy="24" r="2" fill="#1a1a1a" />
        <circle cx="66" cy="24" r="2" fill="#1a1a1a" />
        {/* 입 */}
        <path d="M 56 30 Q 60 34 64 30" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    frog: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="frogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7CCD7C" />
            <stop offset="100%" stopColor="#228B22" />
          </linearGradient>
        </defs>
        {/* 머리 */}
        <ellipse cx="60" cy="60" rx="45" ry="40" fill="url(#frogGradient)" />
        {/* 배 부분 */}
        <ellipse cx="60" cy="75" rx="30" ry="22" fill="#98FB98" />
        {/* 눈 돌출 부분 */}
        <circle cx="35" cy="30" r="18" fill="url(#frogGradient)" />
        <circle cx="85" cy="30" r="18" fill="url(#frogGradient)" />
        {/* 눈 흰자 */}
        <circle cx="35" cy="28" r="12" fill="white" />
        <circle cx="85" cy="28" r="12" fill="white" />
        {/* 눈동자 */}
        <circle cx="38" cy="28" r="6" fill="#1a1a1a" />
        <circle cx="88" cy="28" r="6" fill="#1a1a1a" />
        <circle cx="40" cy="26" r="2" fill="white" />
        <circle cx="90" cy="26" r="2" fill="white" />
        {/* 콧구멍 */}
        <circle cx="50" cy="55" r="3" fill="#006400" />
        <circle cx="70" cy="55" r="3" fill="#006400" />
        {/* 입 - 웃는 표정 */}
        <path d="M 30 75 Q 60 95 90 75" stroke="#006400" strokeWidth="3" fill="none" />
        {/* 볼 터치 */}
        <ellipse cx="25" cy="60" rx="8" ry="5" fill="#FF6B6B" opacity="0.4" />
        <ellipse cx="95" cy="60" rx="8" ry="5" fill="#FF6B6B" opacity="0.4" />
      </svg>
    ),
    swan: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <path d="M 60 100 Q 30 80 35 50 Q 40 30 55 25" stroke="white" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M 60 100 Q 30 80 35 50 Q 40 30 55 25" stroke="#F5F5F5" strokeWidth="16" fill="none" strokeLinecap="round" />
        {/* 머리 */}
        <ellipse cx="60" cy="30" rx="22" ry="20" fill="white" />
        {/* 부리 */}
        <path d="M 75 25 L 100 28 L 95 35 L 75 32 Z" fill="#FF8C00" />
        <path d="M 75 28 L 85 30" stroke="#CC5500" strokeWidth="1" />
        {/* 부리 위 검은 부분 */}
        <path d="M 72 22 Q 78 20 82 22 L 80 28 Q 76 26 72 28 Z" fill="#1a1a1a" />
        {/* 눈 */}
        <circle cx="65" cy="25" r="5" fill="#1a1a1a" />
        <circle cx="67" cy="23" r="2" fill="white" />
        {/* 몸통 (물 위) */}
        <ellipse cx="60" cy="100" rx="35" ry="18" fill="white" />
        <ellipse cx="60" cy="100" rx="30" ry="14" fill="#F8F8F8" />
        {/* 날개 암시 */}
        <path d="M 30 95 Q 25 85 35 90" fill="white" stroke="#E8E8E8" strokeWidth="1" />
        <path d="M 90 95 Q 95 85 85 90" fill="white" stroke="#E8E8E8" strokeWidth="1" />
      </svg>
    ),
    tropicalfish: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="fishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00CED1" />
            <stop offset="50%" stopColor="#FF6347" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        {/* 꼬리 지느러미 */}
        <polygon points="10,60 30,40 30,80" fill="#FF6347" />
        <polygon points="10,60 25,50 25,70" fill="#FFD700" />
        {/* 몸통 */}
        <ellipse cx="65" cy="60" rx="40" ry="30" fill="url(#fishGradient)" />
        {/* 줄무늬 */}
        <path d="M 45 35 Q 50 60 45 85" stroke="white" strokeWidth="4" fill="none" opacity="0.7" />
        <path d="M 65 32 Q 70 60 65 88" stroke="white" strokeWidth="4" fill="none" opacity="0.7" />
        <path d="M 85 40 Q 88 60 85 80" stroke="white" strokeWidth="3" fill="none" opacity="0.7" />
        {/* 등 지느러미 */}
        <path d="M 50 30 L 60 15 L 70 20 L 80 30" fill="#FF6347" stroke="#FFD700" strokeWidth="1" />
        {/* 배 지느러미 */}
        <path d="M 55 90 L 60 105 L 70 90" fill="#00CED1" />
        {/* 옆 지느러미 */}
        <ellipse cx="45" cy="65" rx="10" ry="6" fill="#FFD700" opacity="0.8" />
        {/* 눈 */}
        <circle cx="85" cy="55" r="10" fill="white" />
        <circle cx="87" cy="55" r="6" fill="#1a1a1a" />
        <circle cx="89" cy="53" r="2" fill="white" />
        {/* 입 */}
        <ellipse cx="102" cy="60" rx="4" ry="3" fill="#FF6347" />
      </svg>
    )
  };

  return animals[type] || animals.fox;
};

// 머리카락 SVG - 얼굴(눈 위치 y=45) 위에 자연스럽게 배치
// 앞머리는 y=35 정도까지만 내려와서 눈을 가리지 않음
export const HairSVG = ({ style = 'default', color = '#1a1a1a', size = 120, gender = 'male' }) => {
  // 그라데이션 색상인지 확인하고 파싱
  const isGradient = color && color.includes('linear-gradient');
  let gradientColors = [];
  let baseColor = color;

  if (isGradient) {
    // linear-gradient(90deg, #ff6b6b, #4ecdc4) 형태에서 색상 추출
    const colorMatch = color.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
    if (colorMatch && colorMatch.length >= 2) {
      gradientColors = colorMatch;
      baseColor = gradientColors[0]; // 첫 번째 색상을 기본으로 사용
    }
  }

  // 색상을 어둡게/밝게 조정하는 헬퍼 함수
  const adjustColor = (hex, percent) => {
    if (!hex || hex.includes('linear-gradient')) return hex;
    // hex -> RGB
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const num = parseInt(c, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    // 조정
    r = Math.min(255, Math.max(0, Math.round(r * (1 + percent))));
    g = Math.min(255, Math.max(0, Math.round(g * (1 + percent))));
    b = Math.min(255, Math.max(0, Math.round(b * (1 + percent))));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // 밝은 하이라이트 색상 계산 (30% 밝게)
  const lighterColor = adjustColor(baseColor, 0.3);
  // 어두운 그림자 색상 (30% 어둡게)
  const darkerColor = adjustColor(baseColor, -0.3);

  // 그라데이션용 fill 값
  const fillColor = isGradient ? 'url(#hairGradientCustom)' : baseColor;

  // 그라데이션 defs 생성
  const gradientDefs = isGradient ? (
    <defs>
      <linearGradient id="hairGradientCustom" x1="0%" y1="0%" x2="100%" y2="0%">
        {gradientColors.map((c, i) => (
          <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
  ) : null;

  const hairStyles = {
    // 기본 - 자연스러운 짧은 머리 (남성형)
    default: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 머리 전체 - 자연스러운 둥근 형태 */}
        <path d="M 18 35 Q 18 5 60 2 Q 102 5 102 35 L 102 40 Q 95 42 60 42 Q 25 42 18 40 Z" fill={fillColor} />
        {/* 옆머리 (귀 위) */}
        <path d="M 18 35 Q 12 42 14 52 L 20 50 Q 18 44 20 38 Z" fill={fillColor} />
        <path d="M 102 35 Q 108 42 106 52 L 100 50 Q 102 44 100 38 Z" fill={fillColor} />
        {/* 앞머리 - 자연스럽게 */}
        <path d="M 28 32 Q 44 26 60 28 Q 76 26 92 32 Q 82 40 60 38 Q 38 40 28 32 Z" fill={fillColor} />
        {/* 하이라이트 */}
        {!isGradient && <path d="M 35 15 Q 50 10 65 12 Q 80 10 90 15" stroke={lighterColor} strokeWidth="4" opacity="0.2" fill="none" strokeLinecap="round" />}
      </svg>
    ),
    // 단발 - 볼 정도 길이 (여성형 단발)
    short: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 머리 전체 */}
        <path d="M 16 30 Q 16 4 60 1 Q 104 4 104 30" fill={fillColor} />
        {/* 옆머리 - 볼까지 내려옴 */}
        <path d="M 16 28 Q 10 45 12 68 Q 14 76 22 76 L 24 45 Q 22 35 16 30 Z" fill={fillColor} />
        <path d="M 104 28 Q 110 45 108 68 Q 106 76 98 76 L 96 45 Q 98 35 104 30 Z" fill={fillColor} />
        {/* 앞머리 뱅 */}
        <path d="M 24 28 Q 42 22 60 24 Q 78 22 96 28 Q 86 38 60 36 Q 34 38 24 28 Z" fill={fillColor} />
        {/* 하이라이트 */}
        <path d="M 35 12 Q 50 8 65 10 Q 80 8 92 12" stroke={lighterColor} strokeWidth="4" opacity="0.2" fill="none" strokeLinecap="round" />
        <path d="M 14 40 Q 12 52 14 65" stroke={lighterColor} strokeWidth="2" opacity="0.15" fill="none" />
        <path d="M 106 40 Q 108 52 106 65" stroke={lighterColor} strokeWidth="2" opacity="0.15" fill="none" />
      </svg>
    ),
    // 긴머리 - 어깨까지
    long: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 머리 전체 */}
        <path d="M 18 28 Q 18 4 60 1 Q 102 4 102 28" fill={fillColor} />
        {/* 왼쪽 긴 머리 */}
        <path d="M 18 26 Q 10 45 12 70 Q 14 95 24 100 Q 32 96 30 75 L 26 50 Q 24 38 18 30 Z" fill={fillColor} />
        {/* 오른쪽 긴 머리 */}
        <path d="M 102 26 Q 110 45 108 70 Q 106 95 96 100 Q 88 96 90 75 L 94 50 Q 96 38 102 30 Z" fill={fillColor} />
        {/* 앞머리 */}
        <path d="M 26 28 Q 42 22 60 24 Q 78 22 94 28 Q 84 38 60 36 Q 36 38 26 28 Z" fill={fillColor} />
        {/* 하이라이트 */}
        <path d="M 35 10 Q 50 6 65 8 Q 80 6 90 10" stroke={lighterColor} strokeWidth="3" opacity="0.2" fill="none" strokeLinecap="round" />
        <path d="M 16 40 Q 14 58 16 75 Q 18 88 22 95" stroke={lighterColor} strokeWidth="2" opacity="0.15" fill="none" />
        <path d="M 104 40 Q 106 58 104 75 Q 102 88 98 95" stroke={lighterColor} strokeWidth="2" opacity="0.15" fill="none" />
      </svg>
    ),
    // 곱슬머리 (짧은 곱슬)
    curly: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 곱슬 볼륨 - 여러 원으로 자연스럽게 */}
        <circle cx="35" cy="18" r="14" fill={fillColor} />
        <circle cx="60" cy="12" r="15" fill={fillColor} />
        <circle cx="85" cy="18" r="14" fill={fillColor} />
        <circle cx="22" cy="32" r="12" fill={fillColor} />
        <circle cx="98" cy="32" r="12" fill={fillColor} />
        {/* 옆 곱슬 */}
        <circle cx="14" cy="48" r="10" fill={fillColor} />
        <circle cx="106" cy="48" r="10" fill={fillColor} />
        {/* 앞머리 곱슬 */}
        <circle cx="42" cy="30" r="10" fill={fillColor} />
        <circle cx="60" cy="28" r="11" fill={fillColor} />
        <circle cx="78" cy="30" r="10" fill={fillColor} />
        {/* 하이라이트 */}
        <circle cx="55" cy="10" r="4" fill={lighterColor} opacity="0.2" />
        <circle cx="40" cy="16" r="3" fill={lighterColor} opacity="0.15" />
        <circle cx="80" cy="16" r="3" fill={lighterColor} opacity="0.15" />
      </svg>
    ),
    // 웨이브 (긴 웨이브 머리)
    wave: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 머리 전체 */}
        <path d="M 18 28 Q 18 4 60 1 Q 102 4 102 28" fill={fillColor} />
        {/* 왼쪽 웨이브 */}
        <path d="M 18 26 Q 10 42 14 58 Q 10 74 16 88 L 26 85 Q 22 72 26 58 Q 22 44 24 32 Z" fill={fillColor} />
        {/* 오른쪽 웨이브 */}
        <path d="M 102 26 Q 110 42 106 58 Q 110 74 104 88 L 94 85 Q 98 72 94 58 Q 98 44 96 32 Z" fill={fillColor} />
        {/* 앞머리 */}
        <path d="M 26 28 Q 42 22 60 24 Q 78 22 94 28 Q 84 38 60 36 Q 36 38 26 28 Z" fill={fillColor} />
        {/* 하이라이트 */}
        <path d="M 35 10 Q 50 6 65 8 Q 80 6 90 10" stroke={lighterColor} strokeWidth="3" opacity="0.2" fill="none" strokeLinecap="round" />
        <path d="M 16 38 Q 12 52 16 68 Q 12 80 16 88" stroke={lighterColor} strokeWidth="2" opacity="0.15" fill="none" />
        <path d="M 104 38 Q 108 52 104 68 Q 108 80 104 88" stroke={lighterColor} strokeWidth="2" opacity="0.15" fill="none" />
      </svg>
    ),
    // 뾰족 스파이크 (남성형 기본)
    spiky: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 베이스 - 자연스러운 둥근 형태 */}
        <path d="M 18 32 Q 18 12 60 8 Q 102 12 102 32 L 102 38 Q 95 40 60 40 Q 25 40 18 38 Z" fill={fillColor} />
        {/* 스파이크들 - 자연스럽게 솟아오르는 머리카락 */}
        <path d="M 20 30 Q 15 15 12 0 Q 25 18 35 25 Z" fill={fillColor} />
        <path d="M 35 25 Q 35 5 38 -8 Q 45 15 55 22 Z" fill={fillColor} />
        <path d="M 50 22 Q 55 0 60 -12 Q 65 0 70 22 Z" fill={fillColor} />
        <path d="M 65 22 Q 75 5 82 -8 Q 85 15 85 25 Z" fill={fillColor} />
        <path d="M 85 25 Q 95 15 108 0 Q 105 18 100 30 Z" fill={fillColor} />
        {/* 옆머리 */}
        <path d="M 16 32 Q 8 42 10 55 L 20 52 Q 18 42 20 34 Z" fill={fillColor} />
        <path d="M 104 32 Q 112 42 110 55 L 100 52 Q 102 42 100 34 Z" fill={fillColor} />
        {/* 하이라이트 */}
        <path d="M 55 22 Q 60 5 65 22" stroke={lighterColor} strokeWidth="3" opacity="0.3" fill="none" />
      </svg>
    ),
    // 히어로컷 (슈퍼히어로 스타일 - 뒤로 넘긴 머리)
    herocut: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 뒤로 넘긴 볼륨감 있는 베이스 - 자연스러운 둥근 형태 */}
        <path d="M 14 28 Q 14 5 60 0 Q 106 5 106 28 L 106 35 Q 95 38 60 38 Q 25 38 14 35 Z" fill={fillColor} />
        {/* 뒤로 빗은 웨이브 - 자연스러운 곡선 */}
        <path d="M 20 25 Q 40 12 60 15 Q 80 12 100 25 Q 85 30 60 28 Q 35 30 20 25 Z" fill={fillColor} />
        {/* 옆머리 - 깔끔하게 */}
        <path d="M 14 28 Q 6 42 10 55 L 20 52 Q 16 42 18 32 Z" fill={fillColor} />
        <path d="M 106 28 Q 114 42 110 55 L 100 52 Q 104 42 102 32 Z" fill={fillColor} />
        {/* 이마 위 살짝 떠있는 앞머리 */}
        <path d="M 35 30 Q 50 24 65 30 L 62 35 Q 50 30 38 35 Z" fill={fillColor} />
        {/* 광택 */}
        <path d="M 35 10 Q 55 5 80 12" stroke={lighterColor} strokeWidth="4" opacity="0.2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    // 락스타 (펑크 모히칸 스타일)
    rockstar: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 옆면 짧은 머리 */}
        <path d="M 15 30 Q 10 45 15 60 L 25 58 Q 22 45 25 32 Z" fill={fillColor} opacity="0.7" />
        <path d="M 105 30 Q 110 45 105 60 L 95 58 Q 98 45 95 32 Z" fill={fillColor} opacity="0.7" />
        {/* 중앙 모히칸 베이스 - 자연스러운 둥근 형태 */}
        <path d="M 35 30 Q 35 18 60 15 Q 85 18 85 30 Q 75 32 60 32 Q 45 32 35 30 Z" fill={fillColor} />
        {/* 높이 솟은 모히칸 스파이크 - 자연스럽게 */}
        <path d="M 38 28 Q 38 10 40 -5 Q 48 15 52 25 Z" fill={fillColor} />
        <path d="M 48 22 Q 50 0 55 -15 Q 58 8 62 20 Z" fill={fillColor} />
        <path d="M 55 18 Q 60 -5 65 -20 Q 68 -5 65 18 Z" fill={fillColor} />
        <path d="M 62 20 Q 68 8 70 -15 Q 72 0 72 22 Z" fill={fillColor} />
        <path d="M 68 25 Q 75 15 82 -5 Q 82 18 82 28 Z" fill={fillColor} />
        {/* 모히칸 하이라이트 */}
        <path d="M 58 18 Q 60 -5 62 18" stroke={lighterColor} strokeWidth="3" opacity="0.3" fill="none" />
        {/* 옆면 면도 라인 */}
        <path d="M 18 35 L 28 35" stroke={darkerColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M 17 42 L 27 42" stroke={darkerColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M 102 35 L 92 35" stroke={darkerColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M 103 42 L 93 42" stroke={darkerColor} strokeWidth="1.5" opacity="0.3" />
      </svg>
    ),
    // 묶음머리 (번/상투)
    bun: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 윗부분 - 자연스러운 둥근 형태 */}
        <path d="M 16 22 Q 16 5 60 0 Q 104 5 104 22 L 104 30 Q 95 32 60 32 Q 25 32 16 30 Z" fill={fillColor} />
        {/* 번 (상투) - 위에 */}
        <circle cx="60" cy="-8" r="18" fill={fillColor} />
        <path d="M 50 -12 Q 60 -20 70 -12" stroke={lighterColor} strokeWidth="3" opacity="0.15" fill="none" />
        {/* 앞머리 - 자연스럽게 위로 빗어 넘긴 느낌 */}
        <path d="M 25 25 Q 42 18 60 20 Q 78 18 95 25 Q 85 32 60 30 Q 35 32 25 25 Z" fill={fillColor} />
        {/* 옆머리 */}
        <path d="M 16 24 Q 8 35 10 48 L 18 46 Q 16 36 18 26 Z" fill={fillColor} />
        <path d="M 104 24 Q 112 35 110 48 L 102 46 Q 104 36 102 26 Z" fill={fillColor} />
        {/* 하이라이트 */}
        <path d="M 35 8 Q 55 2 80 10" stroke={lighterColor} strokeWidth="3" opacity="0.2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    // 공주머리 (웨이브 긴머리)
    princess: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 머리 윗부분 - 자연스러운 둥근 형태 */}
        <path d="M 16 25 Q 16 5 60 2 Q 104 5 104 25 L 104 32 Q 95 34 60 34 Q 25 34 16 32 Z" fill={fillColor} />
        {/* 왼쪽 웨이브 - 부드럽게 */}
        <path d="M 16 25 Q 6 40 10 60 Q 6 80 12 100 Q 18 115 28 112 Q 32 95 30 75 Q 34 55 28 40 Q 22 30 16 28 Z" fill={fillColor} />
        {/* 오른쪽 웨이브 - 부드럽게 */}
        <path d="M 104 25 Q 114 40 110 60 Q 114 80 108 100 Q 102 115 92 112 Q 88 95 90 75 Q 86 55 92 40 Q 98 30 104 28 Z" fill={fillColor} />
        {/* 앞머리 - 가르마 */}
        <path d="M 22 28 Q 38 22 56 26 L 52 35 Q 36 33 22 30 Z" fill={fillColor} />
        <path d="M 98 28 Q 82 22 64 26 L 68 35 Q 84 33 98 30 Z" fill={fillColor} />
        {/* 가르마 라인 */}
        <path d="M 60 6 L 60 32" stroke={lighterColor} strokeWidth="1.5" opacity="0.25" />
        {/* 하이라이트 */}
        <path d="M 12 35 Q 8 55 12 75 Q 8 90 14 105" stroke={lighterColor} strokeWidth="2" opacity="0.2" fill="none" />
        <path d="M 108 35 Q 112 55 108 75 Q 112 90 106 105" stroke={lighterColor} strokeWidth="2" opacity="0.2" fill="none" />
        <path d="M 35 10 Q 55 5 80 12" stroke={lighterColor} strokeWidth="4" opacity="0.2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    // 스포츠컷 - 짧고 깔끔한 스타일
    sportscut: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 아주 짧은 머리 베이스 - 자연스러운 둥근 형태 */}
        <path d="M 18 30 Q 18 8 60 4 Q 102 8 102 30 L 102 36 Q 95 38 60 38 Q 25 38 18 36 Z" fill={fillColor} />
        {/* 옆머리 - 아주 짧게 */}
        <path d="M 18 30 Q 12 38 14 48 L 20 46 Q 18 38 20 32 Z" fill={fillColor} />
        <path d="M 102 30 Q 108 38 106 48 L 100 46 Q 102 38 100 32 Z" fill={fillColor} />
        {/* 짧은 앞머리 - 이마에 살짝만 */}
        <path d="M 30 30 Q 45 26 60 27 Q 75 26 90 30 Q 82 34 60 33 Q 38 34 30 30 Z" fill={fillColor} />
        {/* 민머리 느낌의 하이라이트 */}
        <path d="M 35 12 Q 55 6 85 14" stroke={lighterColor} strokeWidth="5" opacity="0.25" fill="none" strokeLinecap="round" />
        {/* 두피 느낌 텍스처 */}
        <circle cx="35" cy="20" r="2" fill={darkerColor} opacity="0.15" />
        <circle cx="50" cy="16" r="2" fill={darkerColor} opacity="0.15" />
        <circle cx="70" cy="16" r="2" fill={darkerColor} opacity="0.15" />
        <circle cx="85" cy="20" r="2" fill={darkerColor} opacity="0.15" />
      </svg>
    ),
    // 엘프머리 - 부드러운 긴 생머리 스타일
    elf: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {gradientDefs}
        {/* 머리 윗부분 - 자연스러운 둥근 형태 */}
        <path d="M 16 26 Q 16 5 60 2 Q 104 5 104 26 L 104 34 Q 95 36 60 36 Q 25 36 16 34 Z" fill={fillColor} />
        {/* 왼쪽 긴 머리 - 자연스럽게 */}
        <path d="M 16 26 Q 8 45 10 70 Q 8 95 15 115 Q 22 113 25 90 L 24 55 Q 20 40 16 30 Z" fill={fillColor} />
        {/* 오른쪽 긴 머리 - 자연스럽게 */}
        <path d="M 104 26 Q 112 45 110 70 Q 112 95 105 115 Q 98 113 95 90 L 96 55 Q 100 40 104 30 Z" fill={fillColor} />
        {/* 앞머리 - 가르마 스타일 */}
        <path d="M 22 30 Q 40 24 58 28 L 52 38 Q 35 36 22 32 Z" fill={fillColor} />
        <path d="M 98 30 Q 80 24 62 28 L 68 38 Q 85 36 98 32 Z" fill={fillColor} />
        {/* 하이라이트 */}
        <path d="M 12 40 Q 10 60 12 80 Q 10 95 14 110" stroke={lighterColor} strokeWidth="2" opacity="0.2" fill="none" />
        <path d="M 108 40 Q 110 60 108 80 Q 110 95 106 110" stroke={lighterColor} strokeWidth="2" opacity="0.2" fill="none" />
        {/* 정수리 하이라이트 */}
        <path d="M 35 10 Q 55 4 80 12" stroke={lighterColor} strokeWidth="4" opacity="0.25" fill="none" strokeLinecap="round" />
      </svg>
    ),
    // 인어머리 - 물결치는 긴 머리
    mermaid: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="mermaidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00CED1" />
            <stop offset="50%" stopColor="#20B2AA" />
            <stop offset="100%" stopColor="#008B8B" />
          </linearGradient>
        </defs>
        {/* 머리 윗부분 - 자연스러운 둥근 형태 */}
        <path d="M 14 24 Q 14 4 60 1 Q 106 4 106 24 L 106 32 Q 95 34 60 34 Q 25 34 14 32 Z" fill="url(#mermaidGrad)" />
        {/* 왼쪽 물결 머리 */}
        <path d="M 14 24 Q 0 40 10 55 Q 0 70 10 85 Q 0 100 10 115 Q 20 125 30 120 Q 25 100 30 85 Q 25 70 30 55 Q 25 40 14 28 Z" fill="url(#mermaidGrad)" />
        {/* 오른쪽 물결 머리 */}
        <path d="M 106 24 Q 120 40 110 55 Q 120 70 110 85 Q 120 100 110 115 Q 100 125 90 120 Q 95 100 90 85 Q 95 70 90 55 Q 95 40 106 28 Z" fill="url(#mermaidGrad)" />
        {/* 앞머리 */}
        <path d="M 22 28 Q 40 22 60 26 Q 80 22 98 28 Q 88 38 60 36 Q 32 38 22 28 Z" fill="url(#mermaidGrad)" />
        {/* 물결 하이라이트 */}
        <path d="M 8 35 Q 0 50 8 65 Q 0 80 8 95 Q 2 110 10 120" stroke="#40E0D0" strokeWidth="3" opacity="0.4" fill="none" />
        <path d="M 112 35 Q 120 50 112 65 Q 120 80 112 95 Q 118 110 110 120" stroke="#40E0D0" strokeWidth="3" opacity="0.4" fill="none" />
        {/* 정수리 하이라이트 */}
        <path d="M 35 10 Q 55 4 85 12" stroke="#40E0D0" strokeWidth="4" opacity="0.35" fill="none" strokeLinecap="round" />
        {/* 반짝임 */}
        <circle cx="18" cy="60" r="2" fill="white" opacity="0.5" />
        <circle cx="102" cy="75" r="2" fill="white" opacity="0.5" />
        <circle cx="15" cy="95" r="1.5" fill="white" opacity="0.4" />
      </svg>
    ),
    // 산타머리 - 산타 모자 + 머리카락
    santa: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리카락 베이스 - 자연스러운 둥근 형태 */}
        <path d="M 16 28 Q 16 8 60 4 Q 104 8 104 28 L 104 36 Q 95 38 60 38 Q 25 38 16 36 Z" fill={fillColor} />
        {/* 옆머리 */}
        <path d="M 16 28 Q 8 42 10 55 L 18 53 Q 16 42 18 32 Z" fill={fillColor} />
        <path d="M 104 28 Q 112 42 110 55 L 102 53 Q 104 42 102 32 Z" fill={fillColor} />
        {/* 산타 모자 - 머리 위에 */}
        <path d="M 20 18 Q 60 -20 100 18 Q 70 22 20 18" fill="#DC143C" />
        <path d="M 92 10 Q 108 -5 116 15 Q 118 25 110 28" fill="#DC143C" />
        {/* 모자 흰 테두리 */}
        <path d="M 18 20 Q 60 14 102 20 Q 100 28 60 28 Q 20 28 18 20 Z" fill="white" />
        {/* 모자 끝 폼폼 */}
        <circle cx="113" cy="20" r="9" fill="white" />
        {/* 모자 하이라이트 */}
        <path d="M 35 8 Q 55 -10 75 2" stroke="#FF6B6B" strokeWidth="3" opacity="0.4" fill="none" />
      </svg>
    ),
    // 우주비행사 - 헬멧 + 머리카락
    astronaut: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="50%" stopColor="#E8E8E8" />
            <stop offset="100%" stopColor="#C0C0C0" />
          </linearGradient>
        </defs>
        {/* 머리카락 베이스 - 자연스러운 둥근 형태 */}
        <path d="M 16 28 Q 16 8 60 4 Q 104 8 104 28 L 104 36 Q 95 38 60 38 Q 25 38 16 36 Z" fill={fillColor} />
        {/* 옆머리 */}
        <path d="M 16 28 Q 8 42 10 55 L 18 53 Q 16 42 18 32 Z" fill={fillColor} />
        <path d="M 104 28 Q 112 42 110 55 L 102 53 Q 104 42 102 32 Z" fill={fillColor} />
        {/* 헬멧 외부 프레임 - 머리 위에 */}
        <path d="M 15 25 Q 15 -10 60 -12 Q 105 -10 105 25" fill="url(#helmetGrad)" />
        {/* 헬멧 아래 테두리 */}
        <path d="M 15 25 Q 60 32 105 25" stroke="#808080" strokeWidth="3" fill="none" />
        {/* 바이저 반사광 */}
        <path d="M 30 8 Q 50 2 70 10" stroke="white" strokeWidth="4" opacity="0.3" fill="none" strokeLinecap="round" />
        {/* 귀 부분 */}
        <circle cx="13" cy="22" r="5" fill="url(#helmetGrad)" stroke="#808080" strokeWidth="2" />
        <circle cx="107" cy="22" r="5" fill="url(#helmetGrad)" stroke="#808080" strokeWidth="2" />
        {/* 안테나 */}
        <rect x="57" y="-18" width="4" height="10" fill="#808080" />
        <circle cx="59" cy="-18" r="3" fill="#FF0000" />
      </svg>
    )
  };

  return hairStyles[style] || hairStyles.default;
};

// 옷 SVG - 목과 팔 포함된 상반신
export const ClothesSVG = ({ type = 'tshirt', color = '#4A90D9', size = 120, skinColor = '#FFD5B8' }) => {
  const fillColor = color; // color prop을 fillColor로 사용
  const clothesTypes = {
    tshirt: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="20" fill={skinColor} />
        {/* 어깨와 팔 */}
        <ellipse cx="18" cy="50" rx="12" ry="18" fill={skinColor} /> {/* 왼팔 */}
        <ellipse cx="102" cy="50" rx="12" ry="18" fill={skinColor} /> {/* 오른팔 */}
        {/* 몸통 */}
        <path d="M 30 15 L 8 35 L 8 70 L 25 70 L 25 120 L 95 120 L 95 70 L 112 70 L 112 35 L 90 15 L 75 20 Q 60 28 45 20 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 15 L 8 35 L 8 70 L 25 70 L 25 45 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 15 L 112 35 L 112 70 L 95 70 L 95 45 Z" fill={fillColor} opacity="0.85" />
        {/* 목 라인 */}
        <path d="M 45 20 Q 60 28 75 20" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
      </svg>
    ),
    shirt: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="18" fill={skinColor} />
        {/* 어깨와 팔 */}
        <ellipse cx="18" cy="50" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="102" cy="50" rx="12" ry="18" fill={skinColor} />
        {/* 몸통 */}
        <path d="M 30 15 L 8 35 L 8 70 L 25 70 L 25 120 L 95 120 L 95 70 L 112 70 L 112 35 L 90 15 L 75 20 Q 60 28 45 20 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 15 L 8 35 L 8 70 L 25 70 L 25 45 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 15 L 112 35 L 112 70 L 95 70 L 95 45 Z" fill={fillColor} opacity="0.85" />
        {/* 셔츠 버튼 라인 */}
        <rect x="57" y="25" width="6" height="95" fill="white" opacity="0.3" />
        <circle cx="60" cy="35" r="3" fill="white" opacity="0.5" />
        <circle cx="60" cy="55" r="3" fill="white" opacity="0.5" />
        <circle cx="60" cy="75" r="3" fill="white" opacity="0.5" />
        <circle cx="60" cy="95" r="3" fill="white" opacity="0.5" />
        {/* 칼라 */}
        <path d="M 45 20 L 50 12 L 60 18 L 70 12 L 75 20" fill="white" opacity="0.9" />
        <path d="M 43 15 L 50 20 L 55 10" fill={fillColor} opacity="0.95" />
        <path d="M 77 15 L 70 20 L 65 10" fill={fillColor} opacity="0.95" />
      </svg>
    ),
    dress: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 어깨와 팔 */}
        <ellipse cx="20" cy="35" rx="10" ry="15" fill={skinColor} />
        <ellipse cx="100" cy="35" rx="10" ry="15" fill={skinColor} />
        {/* 드레스 */}
        <path d="M 40 15 Q 60 22 80 15 L 100 120 L 20 120 Z" fill={fillColor} />
        {/* 어깨끈 */}
        <path d="M 40 15 L 30 25 L 35 28 L 35 50" fill={fillColor} opacity="0.85" />
        <path d="M 80 15 L 90 25 L 85 28 L 85 50" fill={fillColor} opacity="0.85" />
        {/* 리본 장식 */}
        <ellipse cx="60" cy="30" rx="20" ry="4" fill="white" opacity="0.2" />
        <circle cx="60" cy="30" r="5" fill="rgba(255,255,255,0.4)" />
      </svg>
    ),
    hoodie: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 - 후드로 대체 */}
        {/* 어깨와 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 후디 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill={fillColor} opacity="0.85" />
        {/* 후드 */}
        <path d="M 30 15 Q 60 25 90 15 Q 80 40 60 48 Q 40 40 30 15" fill={fillColor} stroke={color} strokeWidth="2" />
        <ellipse cx="60" cy="38" rx="15" ry="10" fill="rgba(0,0,0,0.15)" />
        {/* 앞주머니 */}
        <rect x="40" y="70" width="40" height="30" rx="3" fill="rgba(0,0,0,0.1)" />
      </svg>
    ),
    suit: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 어깨와 팔 */}
        <ellipse cx="15" cy="50" rx="10" ry="16" fill={skinColor} />
        <ellipse cx="105" cy="50" rx="10" ry="16" fill={skinColor} />
        {/* 정장 */}
        <path d="M 30 15 L 8 35 L 8 65 L 25 65 L 25 120 L 95 120 L 95 65 L 112 65 L 112 35 L 90 15 L 75 20 Q 60 28 45 20 Z" fill="#1a1a1a" />
        {/* 소매 */}
        <path d="M 30 15 L 8 35 L 8 65 L 25 65 L 25 45 Z" fill="#1a1a1a" opacity="0.85" />
        <path d="M 90 15 L 112 35 L 112 65 L 95 65 L 95 45 Z" fill="#1a1a1a" opacity="0.85" />
        {/* 셔츠와 넥타이 */}
        <path d="M 48 20 L 55 120 L 65 120 L 72 20" fill="white" />
        <polygon points="48,20 60,12 72,20 60,32" fill="white" />
        <polygon points="52,28 60,23 68,28 62,70 58,70" fill="#C41E3A" />
        {/* 라펠 */}
        <path d="M 30 15 L 48 20 L 40 50 L 25 65 L 25 45 Z" fill="#1a1a1a" opacity="0.95" />
        <path d="M 90 15 L 72 20 L 80 50 L 95 65 L 95 45 Z" fill="#1a1a1a" opacity="0.95" />
      </svg>
    ),
    hanbok: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="12" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="38" rx="10" ry="12" fill={skinColor} />
        <ellipse cx="108" cy="38" rx="10" ry="12" fill={skinColor} />
        {/* 치마 - 높은 허리에서 시작하는 풍성한 A라인 */}
        <path d="M 25 38 Q 10 75 5 120 L 115 120 Q 110 75 95 38 Z" fill="#DC143C" />
        {/* 치마 주름선 */}
        <path d="M 30 45 Q 22 80 18 120" stroke="#A01028" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M 45 42 Q 38 80 32 120" stroke="#A01028" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M 60 40 Q 60 80 60 120" stroke="#A01028" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M 75 42 Q 82 80 88 120" stroke="#A01028" strokeWidth="1.5" fill="none" opacity="0.4" />
        <path d="M 90 45 Q 98 80 102 120" stroke="#A01028" strokeWidth="1.5" fill="none" opacity="0.4" />
        {/* 저고리 (짧은 상의) - 한복 특유의 짧은 형태 */}
        <path d="M 42 12 L 22 28 L 22 48 L 32 48 L 32 38 L 88 38 L 88 48 L 98 48 L 98 28 L 78 12 Z" fill="#FFC0CB" />
        {/* 색동 소매 - 한복 특유의 다색 줄무늬 */}
        <path d="M 42 12 L 22 28 L 22 35 L 32 38 L 35 25 Z" fill="#FFD700" />
        <path d="M 22 35 L 22 42 L 28 42 L 32 38 Z" fill="#FF6B6B" />
        <path d="M 22 42 L 22 48 L 32 48 L 28 42 Z" fill="#4169E1" />
        <path d="M 78 12 L 98 28 L 98 35 L 88 38 L 85 25 Z" fill="#FFD700" />
        <path d="M 98 35 L 98 42 L 92 42 L 88 38 Z" fill="#FF6B6B" />
        <path d="M 98 42 L 98 48 L 88 48 L 92 42 Z" fill="#4169E1" />
        {/* 동정 (흰 깃) - 한복의 특징적인 V자 흰 깃 */}
        <path d="M 48 12 L 60 38 L 72 12" fill="white" stroke="white" strokeWidth="1" />
        <path d="M 51 14 L 60 34 L 69 14" fill="#FFC0CB" />
        {/* 옷고름 - 한복 특유의 리본 */}
        <ellipse cx="48" cy="40" rx="8" ry="4" fill="#DC143C" />
        <ellipse cx="72" cy="40" rx="8" ry="4" fill="#DC143C" />
        <circle cx="60" cy="40" r="5" fill="#DC143C" />
        {/* 고름 끈 - 길게 늘어뜨린 리본 */}
        <path d="M 48 44 Q 40 60 30 85" stroke="#DC143C" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 72 44 Q 80 60 90 85" stroke="#DC143C" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* 치마 허리선 - 저고리 아래 */}
        <rect x="24" y="36" width="72" height="5" fill="#FFD700" rx="1" />
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
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 갑옷 몸통 */}
        <path d="M 30 15 L 8 40 L 8 70 L 25 70 L 25 120 L 95 120 L 95 70 L 112 70 L 112 40 L 90 15 Z" fill="url(#metalGradient)" />
        {/* 어깨 보호대 */}
        <ellipse cx="15" cy="45" rx="15" ry="12" fill="url(#metalGradient)" />
        <ellipse cx="105" cy="45" rx="15" ry="12" fill="url(#metalGradient)" />
        {/* 팔 (갑옷 아래) */}
        <ellipse cx="8" cy="60" rx="8" ry="12" fill={skinColor} />
        <ellipse cx="112" cy="60" rx="8" ry="12" fill={skinColor} />
        {/* 가슴판 */}
        <ellipse cx="60" cy="55" rx="22" ry="28" fill="#606060" />
        <path d="M 45 38 L 60 32 L 75 38 L 75 68 L 60 75 L 45 68 Z" fill="#808080" stroke="#404040" strokeWidth="2" />
      </svg>
    ),
    jacket: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="18" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 자켓 */}
        <path d="M 30 18 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 18 L 75 22 Q 60 28 45 22 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 18 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 18 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill={fillColor} opacity="0.85" />
        {/* 앞판 */}
        <path d="M 45 22 L 50 120 L 57 120 L 57 28" fill="rgba(0,0,0,0.15)" />
        <path d="M 75 22 L 70 120 L 63 120 L 63 28" fill="rgba(0,0,0,0.15)" />
        {/* 지퍼 */}
        <rect x="58" y="28" width="4" height="92" fill="#888" />
        {/* 주머니 */}
        <rect x="25" y="75" width="18" height="12" rx="2" fill="rgba(0,0,0,0.12)" />
        <rect x="77" y="75" width="18" height="12" rx="2" fill="rgba(0,0,0,0.12)" />
        {/* 칼라 */}
        <path d="M 45 22 Q 38 15 30 18 L 42 25" fill={fillColor} opacity="0.95" />
        <path d="M 75 22 Q 82 15 90 18 L 78 25" fill={fillColor} opacity="0.95" />
      </svg>
    ),
    sweater: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 (터틀넥 안에 살짝 보이는) */}
        <rect x="52" y="0" width="16" height="8" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 스웨터 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill={fillColor} opacity="0.85" />
        {/* 터틀넥 */}
        <path d="M 42 15 Q 60 8 78 15 Q 78 25 60 28 Q 42 25 42 15" fill={fillColor} stroke={color} strokeWidth="3" />
        {/* 편물 패턴 */}
        <path d="M 25 40 Q 30 45 35 40 Q 40 45 45 40 Q 50 45 55 40 Q 60 45 65 40 Q 70 45 75 40 Q 80 45 85 40 Q 90 45 95 40"
              stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        <path d="M 25 60 Q 30 65 35 60 Q 40 65 45 60 Q 50 65 55 60 Q 60 65 65 60 Q 70 65 75 60 Q 80 65 85 60 Q 90 65 95 60"
              stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        <path d="M 25 80 Q 30 85 35 80 Q 40 85 45 80 Q 50 85 55 80 Q 60 85 65 80 Q 70 85 75 80 Q 80 85 85 80 Q 90 85 95 80"
              stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
      </svg>
    ),
    coat: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="8" cy="55" rx="10" ry="16" fill={skinColor} />
        <ellipse cx="112" cy="55" rx="10" ry="16" fill={skinColor} />
        {/* 코트 */}
        <path d="M 28 15 L 0 45 L 0 75 L 18 75 L 18 120 L 102 120 L 102 75 L 120 75 L 120 45 L 92 15 L 78 20 Q 60 26 42 20 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 28 15 L 0 45 L 0 75 L 18 75 L 18 50 Z" fill={fillColor} opacity="0.85" />
        <path d="M 92 15 L 120 45 L 120 75 L 102 75 L 102 50 Z" fill={fillColor} opacity="0.85" />
        {/* 단추들 */}
        <circle cx="60" cy="35" r="4" fill="#DAA520" stroke="#8B6914" strokeWidth="1" />
        <circle cx="60" cy="55" r="4" fill="#DAA520" stroke="#8B6914" strokeWidth="1" />
        <circle cx="60" cy="75" r="4" fill="#DAA520" stroke="#8B6914" strokeWidth="1" />
        <circle cx="60" cy="95" r="4" fill="#DAA520" stroke="#8B6914" strokeWidth="1" />
        {/* 칼라 */}
        <path d="M 42 20 L 28 15 L 38 25 L 45 30" fill={fillColor} opacity="0.95" />
        <path d="M 78 20 L 92 15 L 82 25 L 75 30" fill={fillColor} opacity="0.95" />
        {/* 주머니 */}
        <path d="M 22 85 Q 22 98 32 98 L 32 85" fill="rgba(0,0,0,0.15)" />
        <path d="M 98 85 Q 98 98 88 98 L 88 85" fill="rgba(0,0,0,0.15)" />
      </svg>
    ),
    kimono: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="12" fill={skinColor} />
        {/* 팔 - 기모노 소매 안 */}
        <ellipse cx="5" cy="55" rx="8" ry="12" fill={skinColor} />
        <ellipse cx="115" cy="55" rx="8" ry="12" fill={skinColor} />
        {/* 기모노 */}
        <path d="M 35 12 L 0 50 L 0 75 L 15 75 L 15 120 L 105 120 L 105 75 L 120 75 L 120 50 L 85 12 Z" fill={fillColor} />
        {/* 넓은 소매 */}
        <path d="M 35 12 L 0 50 L 0 75 L 15 75 L 20 55 Z" fill={fillColor} opacity="0.9" />
        <path d="M 85 12 L 120 50 L 120 75 L 105 75 L 100 55 Z" fill={fillColor} opacity="0.9" />
        {/* 깃 (V자형) */}
        <path d="M 45 12 L 52 50 L 60 20 L 68 50 L 75 12" fill="white" opacity="0.9" />
        {/* 오비 (허리띠) */}
        <rect x="15" y="60" width="90" height="22" fill="#8B0000" />
        <rect x="20" y="63" width="80" height="4" fill="#DAA520" />
        <rect x="20" y="75" width="80" height="4" fill="#DAA520" />
        {/* 무늬 */}
        <circle cx="30" cy="30" r="4" fill="rgba(255,255,255,0.3)" />
        <circle cx="90" cy="35" r="4" fill="rgba(255,255,255,0.3)" />
        <circle cx="35" cy="100" r="4" fill="rgba(255,255,255,0.3)" />
        <circle cx="85" cy="105" r="4" fill="rgba(255,255,255,0.3)" />
      </svg>
    ),
    robe: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 로브 (후드 달린 의상이라 목/얼굴이 후드 안에) */}
        {/* 로브 몸통 */}
        <path d="M 30 15 Q 60 22 90 15 L 110 120 L 10 120 Z" fill={fillColor} />
        {/* 넓은 소매 */}
        <path d="M 30 15 L 0 50 L 0 75 L 15 75 L 20 45 Z" fill={fillColor} opacity="0.9" />
        <path d="M 90 15 L 120 50 L 120 75 L 105 75 L 100 45 Z" fill={fillColor} opacity="0.9" />
        {/* 팔 - 소매 끝 */}
        <ellipse cx="5" cy="65" rx="8" ry="12" fill={skinColor} />
        <ellipse cx="115" cy="65" rx="8" ry="12" fill={skinColor} />
        {/* 후드 */}
        <path d="M 30 15 Q 60 -5 90 15 Q 82 30 60 35 Q 38 30 30 15" fill={fillColor} stroke={color} strokeWidth="2" />
        <ellipse cx="60" cy="25" rx="18" ry="8" fill="rgba(0,0,0,0.25)" />
        {/* 별 무늬 */}
        <polygon points="40,55 42,61 48,61 43,65 45,71 40,67 35,71 37,65 32,61 38,61" fill="#FFD700" opacity="0.7" />
        <polygon points="70,75 72,81 78,81 73,85 75,91 70,87 65,91 67,85 62,81 68,81" fill="#FFD700" opacity="0.7" />
        <polygon points="50,95 52,101 58,101 53,105 55,111 50,107 45,111 47,105 42,101 48,101" fill="#FFD700" opacity="0.7" />
      </svg>
    ),
    ninja: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 (닌자 복면 안에 살짝) */}
        <rect x="52" y="0" width="16" height="10" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 닌자복 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill="#1a1a1a" />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill="#1a1a1a" opacity="0.85" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill="#1a1a1a" opacity="0.85" />
        {/* 벨트 */}
        <rect x="20" y="60" width="80" height="8" fill="#8B0000" />
        {/* 가슴 보호대 */}
        <path d="M 40 30 L 45 25 L 60 25 L 60 55 L 45 55 L 40 50 Z" fill="#2d2d2d" />
        <path d="M 80 30 L 75 25 L 60 25 L 60 55 L 75 55 L 80 50 Z" fill="#2d2d2d" />
        {/* 어깨 보호대 */}
        <ellipse cx="25" cy="28" rx="10" ry="12" fill="#2d2d2d" />
        <ellipse cx="95" cy="28" rx="10" ry="12" fill="#2d2d2d" />
      </svg>
    ),
    superhero: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="18" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="50" rx="12" ry="16" fill={fillColor} /> {/* 히어로 슈트 팔 */}
        <ellipse cx="108" cy="50" rx="12" ry="16" fill={fillColor} />
        {/* 슈퍼히어로 복장 */}
        <path d="M 30 18 L 8 40 L 8 70 L 25 70 L 25 120 L 95 120 L 95 70 L 112 70 L 112 40 L 90 18 L 75 22 Q 60 28 45 22 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 18 L 8 40 L 8 70 L 25 70 L 25 48 Z" fill={fillColor} opacity="0.9" />
        <path d="M 90 18 L 112 40 L 112 70 L 95 70 L 95 48 Z" fill={fillColor} opacity="0.9" />
        {/* 망토 */}
        <path d="M 8 45 Q -2 70 5 95 Q 10 115 15 120 L 25 70" fill="#C41E3A" opacity="0.8" />
        <path d="M 112 45 Q 122 70 115 95 Q 110 115 105 120 L 95 70" fill="#C41E3A" opacity="0.8" />
        {/* 가슴 엠블럼 */}
        <circle cx="60" cy="55" r="15" fill="#FFD700" />
        <polygon points="60,45 65,55 60,65 55,55" fill={fillColor} />
        {/* 벨트 */}
        <rect x="25" y="80" width="70" height="8" fill="#FFD700" />
        <rect x="55" y="78" width="10" height="12" rx="2" fill="#DAA520" />
      </svg>
    ),
    school: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="18" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="15" cy="50" rx="10" ry="16" fill={skinColor} />
        <ellipse cx="105" cy="50" rx="10" ry="16" fill={skinColor} />
        {/* 교복 */}
        <path d="M 30 18 L 8 40 L 8 65 L 25 65 L 25 120 L 95 120 L 95 65 L 112 65 L 112 40 L 90 18 L 75 22 Q 60 28 45 22 Z" fill="#1a1a1a" />
        {/* 소매 */}
        <path d="M 30 18 L 8 40 L 8 65 L 25 65 L 25 45 Z" fill="#1a1a1a" opacity="0.85" />
        <path d="M 90 18 L 112 40 L 112 65 L 95 65 L 95 45 Z" fill="#1a1a1a" opacity="0.85" />
        {/* 흰 셔츠 */}
        <path d="M 48 22 L 53 120 L 67 120 L 72 22" fill="white" />
        {/* 넥타이 */}
        <polygon points="55,28 60,22 65,28 62,60 58,60" fill="#C41E3A" />
        {/* 주머니 */}
        <rect x="28" y="50" width="14" height="3" fill="white" opacity="0.5" />
      </svg>
    ),
    sportswear: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="18" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 운동복 */}
        <path d="M 30 18 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 18 L 75 22 Q 60 28 45 22 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 18 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 18 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill={fillColor} opacity="0.85" />
        {/* 줄무늬 */}
        <rect x="18" y="45" width="6" height="75" fill="white" opacity="0.6" />
        <rect x="96" y="45" width="6" height="75" fill="white" opacity="0.6" />
        {/* 로고 */}
        <polygon points="55,50 60,45 65,50 60,55" fill="white" opacity="0.7" />
        {/* 지퍼 */}
        <rect x="58" y="22" width="4" height="45" fill="rgba(255,255,255,0.3)" />
      </svg>
    ),
    princess: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="12" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="18" cy="35" rx="10" ry="14" fill={skinColor} />
        <ellipse cx="102" cy="35" rx="10" ry="14" fill={skinColor} />
        {/* 공주 드레스 */}
        <defs>
          <linearGradient id="princessGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path d="M 40 12 Q 60 18 80 12 L 110 120 L 10 120 Z" fill="url(#princessGradient)" />
        {/* 어깨 장식 (퍼프 슬리브) */}
        <ellipse cx="28" cy="18" rx="14" ry="10" fill={fillColor} opacity="0.8" />
        <ellipse cx="92" cy="18" rx="14" ry="10" fill={fillColor} opacity="0.8" />
        {/* 프릴 */}
        <path d="M 20 45 Q 25 50 30 45 Q 35 50 40 45 Q 45 50 50 45 Q 55 50 60 45 Q 65 50 70 45 Q 75 50 80 45 Q 85 50 90 45 Q 95 50 100 45"
              stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
        <path d="M 22 85 Q 27 90 32 85 Q 37 90 42 85 Q 47 90 52 85 Q 57 90 62 85 Q 67 90 72 85 Q 77 90 82 85 Q 87 90 92 85 Q 97 90 98 85"
              stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
        {/* 리본 */}
        <ellipse cx="60" cy="28" rx="8" ry="5" fill="#FF69B4" />
      </svg>
    ),
    chef: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 요리사 복장 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill="white" />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill="white" opacity="0.9" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill="white" opacity="0.9" />
        {/* 더블 버튼 */}
        <circle cx="45" cy="45" r="4" fill="#1a1a1a" />
        <circle cx="45" cy="65" r="4" fill="#1a1a1a" />
        <circle cx="45" cy="85" r="4" fill="#1a1a1a" />
        <circle cx="75" cy="45" r="4" fill="#1a1a1a" />
        <circle cx="75" cy="65" r="4" fill="#1a1a1a" />
        <circle cx="75" cy="85" r="4" fill="#1a1a1a" />
        {/* 앞치마 */}
        <rect x="35" y="55" width="50" height="65" rx="3" fill={fillColor} opacity="0.3" />
      </svg>
    ),
    doctor: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="10" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="110" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 의사 가운 */}
        <path d="M 28 15 L 2 45 L 2 75 L 18 75 L 18 120 L 102 120 L 102 75 L 118 75 L 118 45 L 92 15 Z" fill="white" />
        {/* 소매 */}
        <path d="M 28 15 L 2 45 L 2 75 L 18 75 L 18 50 Z" fill="white" opacity="0.9" />
        <path d="M 92 15 L 118 45 L 118 75 L 102 75 L 102 50 Z" fill="white" opacity="0.9" />
        {/* 십자가 */}
        <rect x="55" y="40" width="10" height="25" fill="#FF0000" />
        <rect x="47" y="48" width="26" height="10" fill="#FF0000" />
        {/* 청진기 */}
        <path d="M 75 60 Q 85 65 85 75" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        <circle cx="85" cy="78" r="5" fill="#1a1a1a" />
        {/* 주머니 */}
        <rect x="22" y="75" width="22" height="18" rx="2" fill={fillColor} opacity="0.2" />
      </svg>
    ),
    pirate: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 해적 복장 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill={fillColor} />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill={fillColor} opacity="0.85" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill={fillColor} opacity="0.85" />
        {/* 조끼 */}
        <path d="M 40 25 L 35 30 L 35 85 L 45 95 L 60 30" fill="#654321" />
        <path d="M 80 25 L 85 30 L 85 85 L 75 95 L 60 30" fill="#654321" />
        {/* 벨트 */}
        <rect x="20" y="75" width="80" height="10" fill="#8B4513" />
        <rect x="55" y="73" width="10" height="14" rx="2" fill="#FFD700" />
        {/* 해골 마크 */}
        <circle cx="60" cy="50" r="8" fill="white" />
        <rect x="52" y="58" width="4" height="8" fill="white" />
        <rect x="64" y="58" width="4" height="8" fill="white" />
      </svg>
    ),
    wizard: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="12" fill={skinColor} />
        {/* 마법사 로브 */}
        <path d="M 30 12 Q 60 22 90 12 L 110 120 L 10 120 Z" fill={fillColor} />
        {/* 넓은 소매 */}
        <path d="M 30 15 L -5 50 L 5 75 L 25 55 Z" fill={fillColor} opacity="0.9" />
        <path d="M 90 15 L 125 50 L 115 75 L 95 55 Z" fill={fillColor} opacity="0.9" />
        {/* 소매 끝 손 */}
        <ellipse cx="5" cy="68" rx="10" ry="8" fill={skinColor} />
        <ellipse cx="115" cy="68" rx="10" ry="8" fill={skinColor} />
        {/* 소매 금테두리 */}
        <path d="M -5 50 L 5 75" stroke="#FFD700" strokeWidth="3" fill="none" />
        <path d="M 125 50 L 115 75" stroke="#FFD700" strokeWidth="3" fill="none" />
        {/* 로브 금테두리 */}
        <path d="M 30 12 Q 60 22 90 12" stroke="#FFD700" strokeWidth="3" fill="none" />
        {/* 별과 달 무늬 */}
        <polygon points="30,40 32,46 38,46 33,50 35,56 30,52 25,56 27,50 22,46 28,46" fill="#FFD700" />
        <polygon points="75,60 77,66 83,66 78,70 80,76 75,72 70,76 72,70 67,66 73,66" fill="#FFD700" />
        <polygon points="50,85 51,89 55,89 52,92 53,96 50,94 47,96 48,92 45,89 49,89" fill="#C0C0C0" opacity="0.8" />
        {/* 달 */}
        <circle cx="85" cy="45" r="8" fill="#FFD700" opacity="0.7" />
        <circle cx="88" cy="43" r="6" fill={fillColor} />
        {/* 신비로운 룬 문자 */}
        <path d="M 40 100 L 45 110 L 50 100" stroke="#FFD700" strokeWidth="2" fill="none" />
        <circle cx="65" cy="105" r="4" stroke="#FFD700" strokeWidth="2" fill="none" />
        <path d="M 75 100 L 80 108" stroke="#FFD700" strokeWidth="2" fill="none" />
      </svg>
    ),
    tuxedo: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 턱시도 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill="#000000" />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill="#000000" opacity="0.85" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill="#000000" opacity="0.85" />
        {/* 흰 셔츠 */}
        <path d="M 48 20 L 52 120 L 68 120 L 72 20" fill="white" />
        {/* 나비 넥타이 */}
        <ellipse cx="50" cy="25" rx="8" ry="4" fill="#000000" />
        <ellipse cx="70" cy="25" rx="8" ry="4" fill="#000000" />
        <rect x="57" y="23" width="6" height="4" fill="#000000" />
        {/* 단추 */}
        <circle cx="60" cy="40" r="2" fill="white" />
        <circle cx="60" cy="55" r="2" fill="white" />
        <circle cx="60" cy="70" r="2" fill="white" />
        {/* 포켓 */}
        <rect x="28" y="50" width="12" height="3" fill="white" opacity="0.3" />
      </svg>
    ),
    taekwondo: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="12" cy="55" rx="12" ry="18" fill={skinColor} />
        <ellipse cx="108" cy="55" rx="12" ry="18" fill={skinColor} />
        {/* 도복 몸통 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 15 Z" fill="white" />
        {/* 소매 */}
        <path d="M 30 15 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill="white" opacity="0.95" />
        <path d="M 90 15 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill="white" opacity="0.95" />
        {/* V자 깃 */}
        <path d="M 45 15 L 60 55 L 75 15" fill="white" stroke="#1a1a1a" strokeWidth="2" />
        <path d="M 48 18 L 60 50 L 72 18" fill="#1a1a1a" opacity="0.1" />
        {/* 검은 띠 */}
        <rect x="20" y="60" width="80" height="12" fill="#1a1a1a" />
        {/* 띠 매듭 */}
        <path d="M 55 72 L 45 95 L 50 95 L 58 78" fill="#1a1a1a" />
        <path d="M 65 72 L 75 95 L 70 95 L 62 78" fill="#1a1a1a" />
        {/* 띠 금줄 (단) */}
        <rect x="20" y="63" width="80" height="2" fill="#FFD700" />
        <rect x="20" y="67" width="80" height="2" fill="#FFD700" />
        {/* 도복 주름 */}
        <path d="M 40 75 L 40 120" stroke="#ddd" strokeWidth="1" opacity="0.5" />
        <path d="M 60 75 L 60 120" stroke="#ddd" strokeWidth="1" opacity="0.5" />
        <path d="M 80 75 L 80 120" stroke="#ddd" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    santasuit: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="12" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="8" cy="55" rx="10" ry="16" fill={skinColor} />
        <ellipse cx="112" cy="55" rx="10" ry="16" fill={skinColor} />
        {/* 산타 복장 몸통 */}
        <path d="M 28 12 L 0 45 L 0 75 L 18 75 L 18 120 L 102 120 L 102 75 L 120 75 L 120 45 L 92 12 Z" fill="#DC143C" />
        {/* 소매 */}
        <path d="M 28 12 L 0 45 L 0 75 L 18 75 L 18 50 Z" fill="#DC143C" opacity="0.95" />
        <path d="M 92 12 L 120 45 L 120 75 L 102 75 L 102 50 Z" fill="#DC143C" opacity="0.95" />
        {/* 흰 털 테두리 - 목 */}
        <ellipse cx="60" cy="15" rx="25" ry="8" fill="white" />
        {/* 흰 털 테두리 - 소매 끝 */}
        <ellipse cx="0" cy="72" rx="8" ry="5" fill="white" />
        <ellipse cx="120" cy="72" rx="8" ry="5" fill="white" />
        {/* 검은 벨트 */}
        <rect x="18" y="70" width="84" height="14" fill="#1a1a1a" />
        {/* 금색 버클 */}
        <rect x="50" y="68" width="20" height="18" rx="3" fill="#FFD700" />
        <rect x="54" y="72" width="12" height="10" rx="2" fill="#1a1a1a" />
        {/* 흰 털 테두리 - 하단 */}
        <rect x="18" y="112" width="84" height="8" rx="2" fill="white" />
        {/* 금색 단추 */}
        <circle cx="60" cy="40" r="5" fill="#FFD700" />
        <circle cx="60" cy="55" r="5" fill="#FFD700" />
      </svg>
    ),
    rockstarjacket: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목 */}
        <rect x="50" y="0" width="20" height="15" fill={skinColor} />
        {/* 팔 */}
        <ellipse cx="8" cy="55" rx="10" ry="16" fill={skinColor} />
        <ellipse cx="112" cy="55" rx="10" ry="16" fill={skinColor} />
        {/* 가죽 재킷 몸통 */}
        <path d="M 28 15 L 2 45 L 2 75 L 18 75 L 18 120 L 102 120 L 102 75 L 118 75 L 118 45 L 92 15 Z" fill="#1a1a1a" />
        {/* 소매 */}
        <path d="M 28 15 L 2 45 L 2 75 L 18 75 L 18 50 Z" fill="#1a1a1a" opacity="0.95" />
        <path d="M 92 15 L 118 45 L 118 75 L 102 75 L 102 50 Z" fill="#1a1a1a" opacity="0.95" />
        {/* 라펠 (깃) */}
        <path d="M 45 15 L 35 20 L 40 55 L 55 35" fill="#2d2d2d" />
        <path d="M 75 15 L 85 20 L 80 55 L 65 35" fill="#2d2d2d" />
        {/* 지퍼 라인 */}
        <rect x="58" y="35" width="4" height="85" fill="#C0C0C0" />
        <rect x="57" y="35" width="6" height="8" fill="#808080" />
        {/* 스터드 장식 - 어깨 */}
        <circle cx="25" cy="25" r="3" fill="#C0C0C0" />
        <circle cx="32" cy="22" r="3" fill="#C0C0C0" />
        <circle cx="95" cy="25" r="3" fill="#C0C0C0" />
        <circle cx="88" cy="22" r="3" fill="#C0C0C0" />
        {/* 스터드 장식 - 라펠 */}
        <circle cx="42" cy="35" r="2" fill="#C0C0C0" />
        <circle cx="45" cy="45" r="2" fill="#C0C0C0" />
        <circle cx="78" cy="35" r="2" fill="#C0C0C0" />
        <circle cx="75" cy="45" r="2" fill="#C0C0C0" />
        {/* 주머니 지퍼 */}
        <path d="M 22 80 L 40 75" stroke="#C0C0C0" strokeWidth="3" />
        <path d="M 98 80 L 80 75" stroke="#C0C0C0" strokeWidth="3" />
        {/* 번개 무늬 (뒷면 느낌) */}
        <polygon points="60,60 55,75 62,75 58,95 68,72 61,72 65,60" fill="#FFD700" opacity="0.8" />
      </svg>
    ),
    spacesuit: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="spacesuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="50%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#BDBDBD" />
          </linearGradient>
        </defs>
        {/* 목 (헬멧 연결부) */}
        <ellipse cx="60" cy="8" rx="18" ry="10" fill="#808080" />
        {/* 팔 - 우주복 팔 */}
        <ellipse cx="5" cy="55" rx="12" ry="18" fill="url(#spacesuitGrad)" />
        <ellipse cx="115" cy="55" rx="12" ry="18" fill="url(#spacesuitGrad)" />
        {/* 장갑 */}
        <ellipse cx="2" cy="72" rx="8" ry="6" fill="#FF6600" />
        <ellipse cx="118" cy="72" rx="8" ry="6" fill="#FF6600" />
        {/* 우주복 몸통 */}
        <path d="M 30 10 L 5 40 L 5 75 L 20 75 L 20 120 L 100 120 L 100 75 L 115 75 L 115 40 L 90 10 Z" fill="url(#spacesuitGrad)" />
        {/* 소매 */}
        <path d="M 30 10 L 5 40 L 5 75 L 20 75 L 20 50 Z" fill="url(#spacesuitGrad)" opacity="0.95" />
        <path d="M 90 10 L 115 40 L 115 75 L 100 75 L 100 50 Z" fill="url(#spacesuitGrad)" opacity="0.95" />
        {/* 파란 줄무늬 - NASA 스타일 */}
        <rect x="18" y="45" width="8" height="75" fill="#1565C0" />
        <rect x="94" y="45" width="8" height="75" fill="#1565C0" />
        {/* 가슴 패널 */}
        <rect x="35" y="25" width="50" height="40" rx="5" fill="#424242" />
        {/* 디스플레이/버튼 */}
        <rect x="40" y="30" width="18" height="12" rx="2" fill="#00E676" opacity="0.8" />
        <rect x="62" y="30" width="18" height="12" rx="2" fill="#FF5722" opacity="0.8" />
        <circle cx="50" cy="52" r="4" fill="#2196F3" />
        <circle cx="60" cy="52" r="4" fill="#FFC107" />
        <circle cx="70" cy="52" r="4" fill="#4CAF50" />
        {/* NASA 로고 위치 */}
        <ellipse cx="60" cy="85" rx="15" ry="10" fill="#1565C0" />
        <text x="60" y="88" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">NASA</text>
        {/* 어깨 패드 */}
        <ellipse cx="22" cy="25" rx="12" ry="8" fill="#808080" />
        <ellipse cx="98" cy="25" rx="12" ry="8" fill="#808080" />
        {/* 생명유지장치 연결 호스 */}
        <path d="M 38 35 Q 25 40 22 55" stroke="#424242" strokeWidth="4" fill="none" />
        <path d="M 82 35 Q 95 40 98 55" stroke="#424242" strokeWidth="4" fill="none" />
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
        {/* 왕관 본체 - 머리 위에 위치 (더 위로) */}
        <path d="M 25 18 L 35 -10 L 50 8 L 60 -20 L 70 8 L 85 -10 L 95 18 L 90 23 L 30 23 Z" fill="url(#crownGradient)" />
        {/* 보석 */}
        <circle cx="35" cy="-10" r="5" fill="#FF0000" />
        <circle cx="60" cy="-20" r="6" fill="#00BFFF" />
        <circle cx="85" cy="-10" r="5" fill="#00FF00" />
        {/* 왕관 밑단 */}
        <rect x="30" y="18" width="60" height="8" fill="url(#crownGradient)" />
        <circle cx="45" cy="22" r="3" fill="#FF69B4" />
        <circle cx="60" cy="22" r="3" fill="#FF69B4" />
        <circle cx="75" cy="22" r="3" fill="#FF69B4" />
      </svg>
    ),
    bow: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 머리 오른쪽 옆 위에 리본 (더 위로, 끈 없음) */}
        <defs>
          <linearGradient id="bowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF85A2" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>
        </defs>
        {/* 왼쪽 날개 */}
        <ellipse cx="78" cy="8" rx="14" ry="10" fill="url(#bowGradient)" transform="rotate(-20, 78, 8)" />
        <ellipse cx="78" cy="8" rx="7" ry="4" fill="#FFB6C1" opacity="0.5" transform="rotate(-20, 78, 8)" />
        {/* 오른쪽 날개 */}
        <ellipse cx="105" cy="14" rx="14" ry="10" fill="url(#bowGradient)" transform="rotate(20, 105, 14)" />
        <ellipse cx="105" cy="14" rx="7" ry="4" fill="#FFB6C1" opacity="0.5" transform="rotate(20, 105, 14)" />
        {/* 중앙 매듭 */}
        <circle cx="92" cy="11" r="6" fill="#FF1493" />
        <ellipse cx="92" cy="10" rx="3" ry="2" fill="#FFB6C1" opacity="0.4" />
      </svg>
    ),
    hat: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 신사 모자 - 머리 위에 위치 (더 위로) */}
        <ellipse cx="60" cy="18" rx="50" ry="12" fill="#1a1a1a" />
        <ellipse cx="60" cy="15" rx="35" ry="8" fill="#2d2d2d" />
        {/* 모자 본체 */}
        <path d="M 30 15 Q 30 -15 60 -20 Q 90 -15 90 15" fill="#1a1a1a" />
        {/* 모자 띠 */}
        <rect x="30" y="8" width="60" height="8" fill="#8B4513" />
      </svg>
    ),
    strawhat: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 밀짚모자 - 머리 위 (둥근 모양) */}
        <defs>
          <linearGradient id="strawGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4D03F" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
        {/* 넓은 챙 */}
        <ellipse cx="60" cy="20" rx="55" ry="15" fill="url(#strawGradient)" />
        <ellipse cx="60" cy="18" rx="48" ry="12" fill="#E8C547" />
        {/* 둥근 모자 본체 */}
        <ellipse cx="60" cy="8" rx="30" ry="18" fill="url(#strawGradient)" />
        <ellipse cx="60" cy="5" rx="25" ry="14" fill="#E8C547" />
        {/* 빨간 리본 */}
        <rect x="30" y="12" width="60" height="6" fill="#DC2626" />
        <rect x="55" y="8" width="10" height="14" rx="2" fill="#DC2626" />
        {/* 짚 패턴 */}
        <path d="M 35 22 L 40 18" stroke="#C4A017" strokeWidth="1" opacity="0.5" />
        <path d="M 50 24 L 55 20" stroke="#C4A017" strokeWidth="1" opacity="0.5" />
        <path d="M 65 24 L 70 20" stroke="#C4A017" strokeWidth="1" opacity="0.5" />
        <path d="M 80 22 L 85 18" stroke="#C4A017" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
    cap: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 캡모자 - 머리 위 (챙이 앞으로) */}
        <defs>
          <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
        {/* 모자 본체 */}
        <path d="M 25 25 Q 25 0 60 -5 Q 95 0 95 25 L 95 30 L 25 30 Z" fill="url(#capGradient)" />
        {/* 앞 챙 */}
        <ellipse cx="60" cy="32" rx="35" ry="10" fill="#1E40AF" />
        <ellipse cx="60" cy="30" rx="30" ry="8" fill="#2563EB" />
        {/* 모자 꼭대기 단추 */}
        <circle cx="60" cy="-3" r="4" fill="#1E40AF" />
        {/* 로고 (간단한 별) */}
        <polygon points="60,10 62,16 68,16 63,20 65,26 60,22 55,26 57,20 52,16 58,16" fill="#FFD700" transform="scale(0.6) translate(40, 0)" />
      </svg>
    ),
    headphones: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 헤드밴드 - 머리 위에 (좌우로 더 넓게) */}
        <path d="M 8 55 Q 8 10 60 5 Q 112 10 112 55" stroke="#1a1a1a" strokeWidth="8" fill="none" />
        {/* 이어컵 - 귀 위치에 (더 바깥쪽) */}
        <rect x="-2" y="45" width="26" height="38" rx="6" fill="#1a1a1a" />
        <rect x="96" y="45" width="26" height="38" rx="6" fill="#1a1a1a" />
        <ellipse cx="11" cy="64" rx="10" ry="15" fill="#404040" />
        <ellipse cx="109" cy="64" rx="10" ry="15" fill="#404040" />
        {/* LED 라이트 */}
        <circle cx="11" cy="54" r="2" fill="#00FF00" />
        <circle cx="109" cy="54" r="2" fill="#00FF00" />
        {/* 쿠션 */}
        <ellipse cx="11" cy="64" rx="6" ry="10" fill="#2d2d2d" />
        <ellipse cx="109" cy="64" rx="6" ry="10" fill="#2d2d2d" />
      </svg>
    ),
    wand: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 마법 지팡이 - 몸통 오른쪽에 들고 있음 */}
        <defs>
          <linearGradient id="wandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#4a2810" />
          </linearGradient>
        </defs>
        <g transform="translate(110, 65) rotate(-35)">
          <rect x="-2.5" y="0" width="5" height="40" rx="2" fill="url(#wandGradient)" />
          {/* 손잡이 장식 */}
          <rect x="-3.5" y="28" width="7" height="12" rx="2" fill="#654321" />
          <rect x="-2.5" y="30" width="5" height="2" fill="#DAA520" />
          <rect x="-2.5" y="35" width="5" height="2" fill="#DAA520" />
          {/* 별 끝 */}
          <polygon points="0,-8 2,-2.5 8,-2 3,1.5 5,7.5 0,4 -5,7.5 -3,1.5 -8,-2 -2,-2.5" fill="#FFD700" />
          <polygon points="0,-6 1.5,-2 5,-1.5 2,1 3,4 0,2 -3,4 -2,1 -5,-1.5 -1.5,-2" fill="#FFFF00" />
          {/* 반짝임 */}
          <circle cx="-6" cy="-6" r="1.5" fill="#FFD700" opacity="0.8" />
          <circle cx="6" cy="-7" r="1.2" fill="#FFD700" opacity="0.8" />
          <circle cx="0" cy="-13" r="1.5" fill="#FFD700" opacity="0.6" />
          {/* 마법 파티클 */}
          <circle cx="-10" cy="-2" r="1.2" fill="#FF69B4" opacity="0.6" />
          <circle cx="8" cy="-10" r="1.2" fill="#00FFFF" opacity="0.6" />
        </g>
      </svg>
    ),
    ring: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 반지 - 오른쪽 아래 손 위치 (더 아래로) */}
        <g transform="translate(100, 110)">
          <ellipse cx="0" cy="0" rx="10" ry="7" fill="#FFD700" />
          <ellipse cx="0" cy="-2" rx="8" ry="5" fill="#FFA500" />
          {/* 보석 */}
          <circle cx="0" cy="-8" r="5" fill="#FF0000" />
          <circle cx="0" cy="-8" r="3" fill="#FF69B4" opacity="0.6" />
          <circle cx="-1" cy="-9" r="1.5" fill="white" opacity="0.7" />
          {/* 작은 보석들 */}
          <circle cx="-6" cy="-4" r="2" fill="#00BFFF" />
          <circle cx="6" cy="-4" r="2" fill="#00BFFF" />
        </g>
      </svg>
    ),
    necklace: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 목걸이 - 목 바로 아래 가슴 위치 */}
        <path d="M 35 25 Q 40 22 50 20 Q 55 19 60 18 Q 65 19 70 20 Q 80 22 85 25"
              stroke="#FFD700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 체인이 아래로 내려옴 */}
        <path d="M 35 25 Q 32 35 35 45" stroke="#FFD700" strokeWidth="2" fill="none" />
        <path d="M 85 25 Q 88 35 85 45" stroke="#FFD700" strokeWidth="2" fill="none" />
        <path d="M 35 45 Q 45 55 60 58 Q 75 55 85 45" stroke="#FFD700" strokeWidth="2" fill="none" />
        {/* 체인 패턴 */}
        <circle cx="40" cy="23" r="1.5" fill="#DAA520" />
        <circle cx="50" cy="20" r="1.5" fill="#DAA520" />
        <circle cx="70" cy="20" r="1.5" fill="#DAA520" />
        <circle cx="80" cy="23" r="1.5" fill="#DAA520" />
        {/* 하트 펜던트 */}
        <path d="M 60 58 C 56 54 52 57 52 60 C 52 64 60 70 60 70 C 60 70 68 64 68 60 C 68 57 64 54 60 58"
              fill="#FF1493" stroke="#C71585" strokeWidth="1" />
        <circle cx="57" cy="61" r="1.5" fill="#FFB6C1" opacity="0.5" />
      </svg>
    ),
    mask: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 마스크 - 눈 부분 가리기 */}
        <defs>
          <linearGradient id="maskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="48" rx="45" ry="18" fill="url(#maskGradient)" />
        {/* 눈 구멍 */}
        <ellipse cx="42" cy="48" rx="10" ry="12" fill="#2d2d2d" />
        <ellipse cx="78" cy="48" rx="10" ry="12" fill="#2d2d2d" />
        {/* 끈 */}
        <path d="M 15 48 Q 10 48 5 50" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        <path d="M 105 48 Q 110 48 115 50" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        {/* 장식 */}
        <path d="M 55 40 Q 60 38 65 40" stroke="gold" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 별 장식 - 머리 오른쪽 옆 (미리보기에서 안 잘리게) */}
        <g transform="translate(100, 25)">
          <polygon points="0,-12 3,-4 12,-4 5,2 8,10 0,5 -8,10 -5,2 -12,-4 -3,-4"
                   fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
          <polygon points="0,-8 2,-3 7,-3 3,0 5,5 0,2 -5,5 -3,0 -7,-3 -2,-3"
                   fill="#FFFF00" opacity="0.6" />
          {/* 반짝임 */}
          <circle cx="5" cy="-8" r="1.5" fill="white" opacity="0.8" />
        </g>
      </svg>
    ),
    flower: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 꽃 장식 - 머리 오른쪽 옆 (미리보기에서 안 잘리게) */}
        <g transform="translate(100, 25)">
          {/* 꽃잎 */}
          <ellipse cx="0" cy="-10" rx="6" ry="9" fill="#FF69B4" />
          <ellipse cx="10" cy="0" rx="6" ry="9" fill="#FF69B4" transform="rotate(72)" />
          <ellipse cx="6" cy="8" rx="6" ry="9" fill="#FFB6C1" transform="rotate(144)" />
          <ellipse cx="-6" cy="8" rx="6" ry="9" fill="#FF69B4" transform="rotate(216)" />
          <ellipse cx="-10" cy="0" rx="6" ry="9" fill="#FFB6C1" transform="rotate(288)" />
          {/* 꽃 중심 */}
          <circle cx="0" cy="0" r="5" fill="#FFD700" />
          <circle cx="0" cy="0" r="3" fill="#FFA500" />
          <circle cx="-1" cy="-1" r="1" fill="white" opacity="0.5" />
        </g>
      </svg>
    ),
    butterfly: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 나비 장식 - 머리 위 오른쪽 */}
        <g transform="translate(95, 10)">
          <defs>
            <linearGradient id="butterflyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          {/* 왼쪽 날개 */}
          <ellipse cx="-10" cy="-5" rx="10" ry="12" fill="url(#butterflyGradient)" />
          <ellipse cx="-12" cy="8" rx="7" ry="8" fill="url(#butterflyGradient)" opacity="0.8" />
          {/* 오른쪽 날개 */}
          <ellipse cx="10" cy="-5" rx="10" ry="12" fill="url(#butterflyGradient)" />
          <ellipse cx="12" cy="8" rx="7" ry="8" fill="url(#butterflyGradient)" opacity="0.8" />
          {/* 날개 무늬 */}
          <circle cx="-8" cy="-5" r="4" fill="#FFD700" opacity="0.6" />
          <circle cx="8" cy="-5" r="4" fill="#FFD700" opacity="0.6" />
          <circle cx="-10" cy="6" r="2" fill="white" opacity="0.4" />
          <circle cx="10" cy="6" r="2" fill="white" opacity="0.4" />
          {/* 몸통 */}
          <ellipse cx="0" cy="0" rx="2" ry="10" fill="#1a1a1a" />
          {/* 더듬이 */}
          <path d="M -1 -10 Q -5 -15 -8 -14" stroke="#1a1a1a" strokeWidth="1" fill="none" />
          <path d="M 1 -10 Q 5 -15 8 -14" stroke="#1a1a1a" strokeWidth="1" fill="none" />
          <circle cx="-8" cy="-14" r="1.5" fill="#1a1a1a" />
          <circle cx="8" cy="-14" r="1.5" fill="#1a1a1a" />
        </g>
      </svg>
    ),
    bone: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 뼈다귀 - 머리 위 장식 (애완동물 스타일) */}
        <g transform="translate(60, 5) rotate(-15)">
          <ellipse cx="-18" cy="0" rx="6" ry="8" fill="#F5F5DC" />
          <ellipse cx="-18" cy="-6" rx="5" ry="5" fill="#F5F5DC" />
          <ellipse cx="-18" cy="6" rx="5" ry="5" fill="#F5F5DC" />
          <ellipse cx="18" cy="0" rx="6" ry="8" fill="#F5F5DC" />
          <ellipse cx="18" cy="-6" rx="5" ry="5" fill="#F5F5DC" />
          <ellipse cx="18" cy="6" rx="5" ry="5" fill="#F5F5DC" />
          <rect x="-18" y="-4" width="36" height="8" rx="3" fill="#F5F5DC" />
          {/* 하이라이트 */}
          <ellipse cx="-16" cy="-2" rx="3" ry="4" fill="#FFFFF0" opacity="0.5" />
          <ellipse cx="16" cy="-2" rx="3" ry="4" fill="#FFFFF0" opacity="0.5" />
        </g>
      </svg>
    ),
    crystal_ball: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 수정구슬 - 몸통 왼쪽에 들고 있음 */}
        <g transform="translate(8, 75)">
          {/* 받침대 */}
          <ellipse cx="0" cy="10" rx="10" ry="3" fill="#4a3728" />
          <path d="M -8 10 Q -6 5 0 0 Q 6 5 8 10" fill="#5c4033" />
          <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#6b4423" />
          {/* 수정구슬 본체 */}
          <circle cx="0" cy="-10" r="14" fill="url(#crystalGradient)" />
          <defs>
            <radialGradient id="crystalGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#E0E0FF" />
              <stop offset="50%" stopColor="#9090FF" />
              <stop offset="100%" stopColor="#4040AA" />
            </radialGradient>
          </defs>
          {/* 반사광 */}
          <ellipse cx="-4" cy="-15" rx="3" ry="2.5" fill="white" opacity="0.7" />
          <circle cx="-6" cy="-12" r="1.5" fill="white" opacity="0.4" />
          {/* 신비로운 빛 */}
          <circle cx="2" cy="-8" r="2.5" fill="#FF69B4" opacity="0.3" />
          <circle cx="-1" cy="-6" r="1.5" fill="#00FFFF" opacity="0.3" />
          {/* 글로우 효과 */}
          <circle cx="0" cy="-10" r="17" fill="none" stroke="#8080FF" strokeWidth="2" opacity="0.3" />
        </g>
      </svg>
    ),
    sword: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 검 - 몸통 오른쪽에 들고 있음 */}
        <g transform="translate(112, 70) rotate(20)">
          {/* 검날 */}
          <path d="M 0 0 L 3.5 -40 L 0 -50 L -3.5 -40 L 0 0" fill="#C0C0C0" />
          <path d="M 0 0 L 1.2 -40 L 0 -48 L 0 0" fill="#E8E8E8" />
          {/* 가드 */}
          <rect x="-9" y="-2" width="18" height="4" rx="2" fill="#DAA520" />
          <circle cx="-7" cy="0" r="2" fill="#FFD700" />
          <circle cx="7" cy="0" r="2" fill="#FFD700" />
          {/* 손잡이 */}
          <rect x="-2" y="2" width="4" height="15" rx="2" fill="#8B4513" />
          <rect x="-2.5" y="4" width="5" height="2" fill="#654321" />
          <rect x="-2.5" y="9" width="5" height="2" fill="#654321" />
          <rect x="-2.5" y="14" width="5" height="2" fill="#654321" />
          {/* 폼멜 */}
          <circle cx="0" cy="19" r="3" fill="#DAA520" />
        </g>
      </svg>
    ),
    bow_weapon: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 활 - 몸통 왼쪽에 들고 있음 */}
        <g transform="translate(8, 70)">
          {/* 활 몸체 */}
          <path d="M 0 -30 Q -15 0 0 30" stroke="#8B4513" strokeWidth="4" fill="none" />
          <path d="M 2 -28 Q -12 0 2 28" stroke="#A0522D" strokeWidth="2.5" fill="none" />
          {/* 활 끝 장식 */}
          <circle cx="0" cy="-30" r="2.5" fill="#DAA520" />
          <circle cx="0" cy="30" r="2.5" fill="#DAA520" />
          {/* 활 시위 */}
          <path d="M 0 -28 Q 18 0 0 28" stroke="#D2691E" strokeWidth="1.5" fill="none" />
          {/* 화살 (시위에 걸림) */}
          <line x1="16" y1="0" x2="45" y2="0" stroke="#654321" strokeWidth="2.5" />
          <polygon points="47,0 41,-2.5 41,2.5" fill="#808080" />
          <path d="M 16 0 L 12 -2.5 L 12 2.5 Z" fill="#8B0000" />
          <path d="M 14 0 L 10 -3 L 10 3 Z" fill="#8B0000" />
        </g>
      </svg>
    ),
    guitar: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 기타 - 몸통 앞에서 연주하는 자세 */}
        <g transform="translate(60, 80) rotate(-10)">
          {/* 기타 바디 */}
          <ellipse cx="0" cy="12" rx="18" ry="24" fill="#8B4513" />
          <ellipse cx="0" cy="4" rx="14" ry="16" fill="#8B4513" />
          <ellipse cx="0" cy="12" rx="15" ry="20" fill="#D2691E" />
          <ellipse cx="0" cy="4" rx="10" ry="13" fill="#D2691E" />
          {/* 사운드홀 */}
          <circle cx="0" cy="10" r="6" fill="#1a1a1a" />
          <circle cx="0" cy="10" r="4.5" fill="#2d2d2d" />
          {/* 넥 */}
          <rect x="-3" y="-40" width="6" height="42" fill="#654321" />
          <rect x="-2.5" y="-40" width="5" height="42" fill="#8B4513" />
          {/* 프렛 */}
          <rect x="-3" y="-32" width="6" height="1.5" fill="#C0C0C0" />
          <rect x="-3" y="-24" width="6" height="1.5" fill="#C0C0C0" />
          <rect x="-3" y="-16" width="6" height="1.5" fill="#C0C0C0" />
          {/* 헤드 */}
          <rect x="-4" y="-50" width="8" height="11" rx="2" fill="#1a1a1a" />
          {/* 튜닝 페그 */}
          <circle cx="-6" cy="-47" r="2" fill="#C0C0C0" />
          <circle cx="-6" cy="-42" r="2" fill="#C0C0C0" />
          <circle cx="6" cy="-47" r="2" fill="#C0C0C0" />
          <circle cx="6" cy="-42" r="2" fill="#C0C0C0" />
          {/* 줄 */}
          <line x1="-1.5" y1="-40" x2="-1.5" y2="28" stroke="#D4AF37" strokeWidth="0.4" />
          <line x1="0" y1="-40" x2="0" y2="28" stroke="#D4AF37" strokeWidth="0.4" />
          <line x1="1.5" y1="-40" x2="1.5" y2="28" stroke="#D4AF37" strokeWidth="0.4" />
          {/* 브릿지 */}
          <rect x="-4" y="25" width="8" height="3" rx="1" fill="#1a1a1a" />
        </g>
      </svg>
    ),
    trumpet: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 트럼펫 - 몸통 앞에서 연주하는 자세 */}
        <defs>
          <linearGradient id="trumpetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        <g transform="translate(100, 62)">
          {/* 벨 (나팔 부분) */}
          <ellipse cx="12" cy="0" rx="12" ry="16" fill="url(#trumpetGradient)" />
          <ellipse cx="12" cy="0" rx="8" ry="11" fill="#1a1a1a" />
          <ellipse cx="12" cy="0" rx="6" ry="9" fill="#2d2d2d" />
          {/* 본체 튜브 (수평) */}
          <rect x="-40" y="-4" width="52" height="8" rx="3" fill="url(#trumpetGradient)" />
          {/* 밸브들 */}
          <rect x="-28" y="-12" width="6" height="10" rx="2" fill="#DAA520" />
          <rect x="-19" y="-12" width="6" height="10" rx="2" fill="#DAA520" />
          <rect x="-10" y="-12" width="6" height="10" rx="2" fill="#DAA520" />
          {/* 밸브 캡 */}
          <circle cx="-25" cy="-14" r="3" fill="#FFD700" />
          <circle cx="-16" cy="-14" r="3" fill="#FFD700" />
          <circle cx="-7" cy="-14" r="3" fill="#FFD700" />
          {/* 마우스피스 (왼쪽) */}
          <rect x="-48" y="-2.5" width="10" height="5" rx="2" fill="#C0C0C0" />
          <ellipse cx="-48" cy="0" rx="2.5" ry="3" fill="#A0A0A0" />
        </g>
      </svg>
    ),
    palette: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 팔레트 - 몸통 왼쪽에 */}
        <g transform="translate(5, 72)">
          {/* 팔레트 본체 */}
          <ellipse cx="18" cy="8" rx="18" ry="14" fill="#8B4513" />
          {/* 엄지 구멍 */}
          <ellipse cx="10" cy="15" rx="4" ry="5" fill="#654321" />
          {/* 물감들 */}
          <circle cx="8" cy="1" r="3.5" fill="#FF0000" />
          <circle cx="17" cy="-2" r="3.5" fill="#0000FF" />
          <circle cx="26" cy="1" r="3.5" fill="#FFFF00" />
          <circle cx="30" cy="10" r="3.5" fill="#00FF00" />
          <circle cx="26" cy="17" r="3.5" fill="#FF69B4" />
          <circle cx="15" cy="6" r="2.5" fill="#FFA500" />
          {/* 섞인 물감 */}
          <ellipse cx="19" cy="11" rx="3.5" ry="2.5" fill="#8B008B" opacity="0.7" />
          {/* 붓 */}
          <g transform="translate(30, -5) rotate(25)">
            <rect x="-1.5" y="0" width="3" height="22" fill="#8B4513" />
            <ellipse cx="0" cy="-2.5" rx="2.5" ry="4" fill="#2d2d2d" />
            <rect x="-1.5" y="18" width="3" height="6" rx="1" fill="#C0C0C0" />
          </g>
        </g>
      </svg>
    ),
    camera: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 카메라 - 가슴에 걸린 상태 */}
        {/* 끈 */}
        <path d="M 42 55 Q 38 65 42 80" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
        <path d="M 78 55 Q 82 65 78 80" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
        <g transform="translate(60, 90)">
          {/* 카메라 본체 */}
          <rect x="-15" y="-10" width="30" height="20" rx="2.5" fill="#2d2d2d" />
          <rect x="-13" y="-8" width="26" height="16" rx="2" fill="#1a1a1a" />
          {/* 렌즈 */}
          <circle cx="0" cy="0" r="8" fill="#1a1a1a" stroke="#404040" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5.5" fill="#2d2d2d" />
          <circle cx="0" cy="0" r="3" fill="#4a4a4a" />
          <circle cx="-1.5" cy="-1.5" r="1.5" fill="white" opacity="0.3" />
          {/* 플래시 */}
          <rect x="-12" y="-8" width="6" height="4" rx="1" fill="#404040" />
          {/* 셔터 버튼 */}
          <circle cx="10" cy="-8" r="2.5" fill="#FF0000" />
          {/* 뷰파인더 */}
          <rect x="5" y="-13" width="6" height="4" rx="1" fill="#2d2d2d" />
        </g>
      </svg>
    ),
    microphone: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 마이크 - 몸통 오른쪽에 들고 있음 */}
        <g transform="translate(108, 65) rotate(-20)">
          {/* 마이크 헤드 (그릴) */}
          <ellipse cx="0" cy="-10" rx="7" ry="11" fill="#2d2d2d" />
          <ellipse cx="0" cy="-10" rx="6" ry="9" fill="#404040" />
          {/* 그릴 패턴 */}
          <line x1="-4" y1="-16" x2="-4" y2="-4" stroke="#1a1a1a" strokeWidth="0.4" />
          <line x1="-1.5" y1="-18" x2="-1.5" y2="-2" stroke="#1a1a1a" strokeWidth="0.4" />
          <line x1="1.5" y1="-18" x2="1.5" y2="-2" stroke="#1a1a1a" strokeWidth="0.4" />
          <line x1="4" y1="-16" x2="4" y2="-4" stroke="#1a1a1a" strokeWidth="0.4" />
          {/* 반짝임 */}
          <ellipse cx="-2.5" cy="-12" rx="1.5" ry="2.5" fill="white" opacity="0.2" />
          {/* 바디 */}
          <rect x="-4" y="1" width="8" height="24" rx="2.5" fill="#1a1a1a" />
          {/* 링 장식 */}
          <rect x="-5" y="-1" width="10" height="3" rx="1" fill="#C0C0C0" />
          <rect x="-4" y="6" width="8" height="1.5" fill="#404040" />
          <rect x="-4" y="13" width="8" height="1.5" fill="#404040" />
          {/* 바닥 */}
          <ellipse cx="0" cy="25" rx="4" ry="1.5" fill="#2d2d2d" />
        </g>
      </svg>
    ),
    shining_star: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 빛나는 별 - 머리 옆에 떠있는 효과 (미리보기에서 안 잘리게) */}
        {/* 메인 별 */}
        <g transform="translate(60, 15)">
          <polygon points="0,-15 4,-5 15,-5 7,2 10,12 0,6 -10,12 -7,2 -15,-5 -4,-5"
                   fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
          <polygon points="0,-10 2.5,-3 8,-3 4,1 6,7 0,4 -6,7 -4,1 -8,-3 -2.5,-3"
                   fill="#FFFF00" />
        </g>
        {/* 작은 별들 */}
        <g transform="translate(25, 25)">
          <polygon points="0,-6 1.5,-2 6,-2 2.5,0.5 4,5 0,3 -4,5 -2.5,0.5 -6,-2 -1.5,-2" fill="#FFD700" opacity="0.7" />
        </g>
        <g transform="translate(95, 25)">
          <polygon points="0,-6 1.5,-2 6,-2 2.5,0.5 4,5 0,3 -4,5 -2.5,0.5 -6,-2 -1.5,-2" fill="#FFD700" opacity="0.7" />
        </g>
        {/* 빛나는 효과 */}
        <line x1="60" y1="-2" x2="60" y2="-8" stroke="#FFD700" strokeWidth="2" opacity="0.8" />
        <line x1="48" y1="5" x2="42" y2="2" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
        <line x1="72" y1="5" x2="78" y2="2" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
        {/* 반짝임 파티클 */}
        <circle cx="38" cy="15" r="2" fill="#FFFF00" opacity="0.6" />
        <circle cx="82" cy="15" r="2" fill="#FFFF00" opacity="0.6" />
        <circle cx="50" cy="28" r="1.5" fill="#FFD700" opacity="0.5" />
        <circle cx="70" cy="28" r="1.5" fill="#FFD700" opacity="0.5" />
      </svg>
    ),
    meteor: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 유성 - 머리 옆에서 날아가는 모습 (미리보기에서 안 잘리게) */}
        <g transform="translate(95, 20)">
          {/* 유성 본체 */}
          <circle cx="0" cy="0" r="10" fill="#FF6B00" />
          <circle cx="0" cy="0" r="7" fill="#FFD700" />
          <circle cx="0" cy="0" r="4" fill="#FFFF00" />
          <circle cx="-2" cy="-2" r="2" fill="white" opacity="0.8" />
          {/* 꼬리 */}
          <path d="M -10 3 Q -25 0 -50 5" stroke="#FF6B00" strokeWidth="6" opacity="0.7" strokeLinecap="round" />
          <path d="M -10 1 Q -25 5 -45 8" stroke="#FFD700" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
          <path d="M -10 5 Q -25 10 -50 18" stroke="#FF8C00" strokeWidth="5" opacity="0.6" strokeLinecap="round" />
          {/* 스파크 */}
          <circle cx="-20" cy="2" r="2" fill="#FFFF00" opacity="0.7" />
          <circle cx="-30" cy="8" r="1.5" fill="#FFD700" opacity="0.6" />
          <circle cx="-25" cy="12" r="2" fill="#FF8C00" opacity="0.5" />
          <circle cx="-40" cy="5" r="1" fill="#FFFF00" opacity="0.4" />
        </g>
        {/* 작은 유성 */}
        <g transform="translate(35, 35) scale(0.4)">
          <circle cx="0" cy="0" r="8" fill="#FF6B00" />
          <circle cx="0" cy="0" r="5" fill="#FFD700" />
          <path d="M -8 2 Q -18 0 -30 5" stroke="#FF6B00" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
        </g>
      </svg>
    ),
    moon: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 달 - 머리 옆에 떠있는 느낌 (미리보기에서 안 잘리게) */}
        <g transform="translate(100, 30)">
          {/* 달 그림자 (글로우 효과) */}
          <circle cx="0" cy="0" r="18" fill="#FFD700" opacity="0.2" />
          {/* 달 본체 */}
          <circle cx="0" cy="0" r="14" fill="#FFF8DC" />
          <circle cx="5" cy="0" r="12" fill="#1e293b" opacity="0.15" />
          {/* 크레이터 */}
          <circle cx="-4" cy="-5" r="3" fill="#E8D8B0" opacity="0.5" />
          <circle cx="3" cy="5" r="2.5" fill="#E8D8B0" opacity="0.4" />
          <circle cx="-2" cy="3" r="2" fill="#E8D8B0" opacity="0.3" />
          <circle cx="5" cy="-3" r="1.5" fill="#E8D8B0" opacity="0.3" />
          {/* 반짝임 */}
          <circle cx="-6" cy="-6" r="2" fill="white" opacity="0.6" />
        </g>
        {/* 작은 별들 */}
        <g transform="translate(75, 20)">
          <polygon points="0,-5 1,-2 5,-2 2,1 3,5 0,3 -3,5 -2,1 -5,-2 -1,-2" fill="#FFD700" opacity="0.6" />
        </g>
        <g transform="translate(115, 55)">
          <polygon points="0,-4 1,-1 4,-1 2,1 2,4 0,2 -2,4 -2,1 -4,-1 -1,-1" fill="#FFD700" opacity="0.5" />
        </g>
        <g transform="translate(85, 55)">
          <polygon points="0,-3 1,-1 3,-1 1,0 2,3 0,2 -2,3 -1,0 -3,-1 -1,-1" fill="#FFD700" opacity="0.4" />
        </g>
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
