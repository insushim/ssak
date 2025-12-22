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

// 가구 SVG
export const FurnitureSVG = ({ type = 'sofa', size = 60 }) => {
  const furnitureTypes = {
    sofa: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 소파 */}
        <rect x="15" y="60" width="90" height="50" rx="5" fill="#8B4513" />
        <rect x="20" y="55" width="80" height="45" rx="5" fill="#D2691E" />
        {/* 쿠션 */}
        <rect x="30" y="60" width="25" height="30" rx="3" fill="#A0522D" />
        <rect x="65" y="60" width="25" height="30" rx="3" fill="#A0522D" />
        {/* 팔걸이 */}
        <rect x="10" y="50" width="15" height="55" rx="5" fill="#8B4513" />
        <rect x="95" y="50" width="15" height="55" rx="5" fill="#8B4513" />
        {/* 다리 */}
        <rect x="20" y="105" width="8" height="10" fill="#654321" />
        <rect x="50" y="105" width="8" height="10" fill="#654321" />
        <rect x="62" y="105" width="8" height="10" fill="#654321" />
        <rect x="92" y="105" width="8" height="10" fill="#654321" />
      </svg>
    ),
    bed: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 침대 */}
        <rect x="10" y="70" width="100" height="40" rx="3" fill="#8B4513" />
        {/* 매트리스 */}
        <rect x="15" y="60" width="90" height="20" rx="5" fill="#E0E0E0" />
        <rect x="15" y="65" width="90" height="15" rx="5" fill="#F5F5F5" />
        {/* 베개 */}
        <ellipse cx="35" cy="55" rx="15" ry="8" fill="#FFFFFF" />
        <ellipse cx="85" cy="55" rx="15" ry="8" fill="#FFFFFF" />
        {/* 머리판 */}
        <rect x="10" y="30" width="100" height="30" rx="5" fill="#654321" />
        <rect x="15" y="35" width="90" height="20" rx="3" fill="#8B4513" />
        {/* 다리 */}
        <rect x="15" y="105" width="8" height="10" fill="#654321" />
        <rect x="97" y="105" width="8" height="10" fill="#654321" />
      </svg>
    ),
    chair: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 의자 */}
        <rect x="30" y="30" width="60" height="45" rx="5" fill="#8B4513" />
        <rect x="35" y="35" width="50" height="35" rx="3" fill="#D2691E" />
        {/* 등받이 */}
        <rect x="30" y="10" width="60" height="25" rx="5" fill="#654321" />
        {/* 좌석 */}
        <rect x="25" y="70" width="70" height="15" rx="5" fill="#A0522D" />
        {/* 다리 */}
        <rect x="30" y="85" width="8" height="30" fill="#654321" />
        <rect x="82" y="85" width="8" height="30" fill="#654321" />
      </svg>
    ),
    drawer: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 서랍장 */}
        <rect x="20" y="20" width="80" height="90" rx="5" fill="#8B4513" />
        <rect x="25" y="25" width="70" height="85" rx="3" fill="#A0522D" />
        {/* 서랍들 */}
        <rect x="30" y="30" width="60" height="20" rx="2" fill="#D2691E" stroke="#654321" strokeWidth="2" />
        <rect x="30" y="55" width="60" height="20" rx="2" fill="#D2691E" stroke="#654321" strokeWidth="2" />
        <rect x="30" y="80" width="60" height="20" rx="2" fill="#D2691E" stroke="#654321" strokeWidth="2" />
        {/* 손잡이 */}
        <circle cx="60" cy="40" r="3" fill="#FFD700" />
        <circle cx="60" cy="65" r="3" fill="#FFD700" />
        <circle cx="60" cy="90" r="3" fill="#FFD700" />
      </svg>
    ),
    bookshelf: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 책장 */}
        <rect x="15" y="10" width="90" height="100" rx="5" fill="#654321" />
        <rect x="20" y="15" width="80" height="90" rx="3" fill="#8B4513" />
        {/* 칸막이 */}
        <rect x="20" y="45" width="80" height="3" fill="#654321" />
        <rect x="20" y="75" width="80" height="3" fill="#654321" />
        {/* 책들 */}
        <rect x="25" y="20" width="8" height="20" fill="#FF6B6B" />
        <rect x="35" y="20" width="10" height="20" fill="#4ECDC4" />
        <rect x="47" y="20" width="7" height="20" fill="#FFD700" />
        <rect x="56" y="20" width="12" height="20" fill="#95E1D3" />
        <rect x="70" y="20" width="9" height="20" fill="#F38181" />
        <rect x="81" y="20" width="11" height="20" fill="#AA96DA" />
        <rect x="25" y="50" width="10" height="20" fill="#4ECDC4" />
        <rect x="37" y="50" width="8" height="20" fill="#FF6B6B" />
        <rect x="47" y="50" width="11" height="20" fill="#95E1D3" />
        <rect x="60" y="50" width="9" height="20" fill="#FFD700" />
        <rect x="71" y="50" width="10" height="20" fill="#AA96DA" />
        <rect x="83" y="50" width="8" height="20" fill="#F38181" />
      </svg>
    ),
    desk: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 컴퓨터 책상 */}
        <rect x="10" y="50" width="100" height="15" rx="3" fill="#654321" />
        <rect x="10" y="55" width="100" height="10" rx="2" fill="#8B4513" />
        {/* 다리 */}
        <rect x="15" y="65" width="10" height="50" fill="#654321" />
        <rect x="95" y="65" width="10" height="50" fill="#654321" />
        {/* 서랍 */}
        <rect x="40" y="70" width="40" height="35" rx="2" fill="#A0522D" />
        <rect x="45" y="75" width="30" height="12" rx="1" fill="#D2691E" />
        <rect x="45" y="90" width="30" height="12" rx="1" fill="#D2691E" />
        <circle cx="60" cy="81" r="2" fill="#FFD700" />
        <circle cx="60" cy="96" r="2" fill="#FFD700" />
      </svg>
    ),
    gaming_chair: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 게임 의자 */}
        <rect x="30" y="25" width="60" height="55" rx="8" fill="#FF0000" />
        <rect x="35" y="30" width="50" height="45" rx="5" fill="#FF4444" />
        {/* 등받이 */}
        <rect x="30" y="5" width="60" height="25" rx="8" fill="#000000" />
        <rect x="35" y="10" width="50" height="15" rx="5" fill="#1a1a1a" />
        {/* 좌석 */}
        <rect x="25" y="75" width="70" height="20" rx="8" fill="#FF0000" />
        {/* 팔걸이 */}
        <rect x="15" y="50" width="15" height="40" rx="5" fill="#000000" />
        <rect x="90" y="50" width="15" height="40" rx="5" fill="#000000" />
        {/* 다리 (바퀴) */}
        <line x1="60" y1="95" x2="30" y2="110" stroke="#000000" strokeWidth="5" />
        <line x1="60" y1="95" x2="90" y2="110" stroke="#000000" strokeWidth="5" />
        <line x1="60" y1="95" x2="60" y2="115" stroke="#000000" strokeWidth="5" />
        <circle cx="30" cy="110" r="5" fill="#555555" />
        <circle cx="90" cy="110" r="5" fill="#555555" />
        <circle cx="60" cy="115" r="5" fill="#555555" />
      </svg>
    ),
    luxury_sofa: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 럭셔리 소파 */}
        <rect x="10" y="55" width="100" height="55" rx="8" fill="#8B0000" />
        <rect x="15" y="50" width="90" height="50" rx="7" fill="#B22222" />
        {/* 쿠션 (다이아몬드 패턴) */}
        <rect x="22" y="55" width="25" height="35" rx="4" fill="#DC143C" />
        <rect x="50" y="55" width="20" height="35" rx="4" fill="#DC143C" />
        <rect x="73" y="55" width="25" height="35" rx="4" fill="#DC143C" />
        {/* 다이아몬드 패턴 */}
        <circle cx="34" cy="72" r="2" fill="#FFD700" />
        <circle cx="60" cy="72" r="2" fill="#FFD700" />
        <circle cx="85" cy="72" r="2" fill="#FFD700" />
        {/* 팔걸이 */}
        <rect x="5" y="45" width="18" height="60" rx="8" fill="#8B0000" />
        <rect x="97" y="45" width="18" height="60" rx="8" fill="#8B0000" />
        {/* 금장식 다리 */}
        <rect x="18" y="105" width="8" height="12" rx="2" fill="#DAA520" />
        <rect x="50" y="105" width="8" height="12" rx="2" fill="#DAA520" />
        <rect x="62" y="105" width="8" height="12" rx="2" fill="#DAA520" />
        <rect x="94" y="105" width="8" height="12" rx="2" fill="#DAA520" />
      </svg>
    ),
    canopy_bed: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 캐노피 침대 */}
        <rect x="10" y="70" width="100" height="40" rx="5" fill="#8B4513" />
        <rect x="15" y="60" width="90" height="20" rx="5" fill="#F0E68C" />
        {/* 기둥 */}
        <rect x="15" y="10" width="6" height="70" fill="#654321" />
        <rect x="99" y="10" width="6" height="70" fill="#654321" />
        {/* 캐노피 천 */}
        <rect x="10" y="5" width="100" height="10" rx="3" fill="#FFD700" />
        <path d="M 20 15 Q 30 25 40 15 Q 50 25 60 15 Q 70 25 80 15 Q 90 25 100 15"
              stroke="#FFA500" strokeWidth="2" fill="none" />
        <path d="M 20 15 Q 30 30 40 15 Q 50 30 60 15 Q 70 30 80 15 Q 90 30 100 15"
              stroke="#FFA500" strokeWidth="2" fill="none" opacity="0.6" />
        {/* 커튼 */}
        <rect x="10" y="15" width="8" height="55" rx="2" fill="#FFE4B5" opacity="0.7" />
        <rect x="102" y="15" width="8" height="55" rx="2" fill="#FFE4B5" opacity="0.7" />
        {/* 베개 */}
        <ellipse cx="35" cy="55" rx="18" ry="10" fill="#FFFFFF" />
        <ellipse cx="85" cy="55" rx="18" ry="10" fill="#FFFFFF" />
      </svg>
    ),
    throne: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 왕좌 */}
        <defs>
          <linearGradient id="throneGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
        {/* 등받이 - 왕관 모양 */}
        <path d="M 25 10 L 35 5 L 45 15 L 60 0 L 75 15 L 85 5 L 95 10 L 95 60 L 25 60 Z"
              fill="url(#throneGold)" stroke="#B8860B" strokeWidth="2" />
        {/* 보석 장식 */}
        <circle cx="35" cy="5" r="4" fill="#FF0000" />
        <circle cx="60" cy="0" r="5" fill="#0000FF" />
        <circle cx="85" cy="5" r="4" fill="#00FF00" />
        {/* 좌석 */}
        <rect x="20" y="55" width="80" height="25" rx="5" fill="url(#throneGold)" stroke="#B8860B" strokeWidth="2" />
        <rect x="25" y="58" width="70" height="18" rx="3" fill="#FFA500" />
        {/* 팔걸이 */}
        <rect x="10" y="45" width="15" height="40" rx="5" fill="url(#throneGold)" stroke="#B8860B" strokeWidth="2" />
        <rect x="95" y="45" width="15" height="40" rx="5" fill="url(#throneGold)" stroke="#B8860B" strokeWidth="2" />
        {/* 사자 머리 장식 */}
        <circle cx="17" cy="55" r="6" fill="#FFD700" />
        <circle cx="103" cy="55" r="6" fill="#FFD700" />
        {/* 다리 */}
        <rect x="25" y="80" width="10" height="35" rx="3" fill="url(#throneGold)" />
        <rect x="85" y="80" width="10" height="35" rx="3" fill="url(#throneGold)" />
        {/* 발판 */}
        <rect x="30" y="110" width="60" height="8" rx="2" fill="#8B0000" />
      </svg>
    )
  };

  return furnitureTypes[type] || furnitureTypes.sofa;
};

// 가전제품 SVG
export const ElectronicsSVG = ({ type = 'tv', size = 60 }) => {
  const electronicsTypes = {
    tv: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* TV */}
        <rect x="10" y="20" width="100" height="70" rx="5" fill="#1a1a1a" />
        <rect x="15" y="25" width="90" height="60" rx="3" fill="#2d2d2d" />
        {/* 화면 */}
        <rect x="20" y="30" width="80" height="50" rx="2" fill="#4169E1" />
        <rect x="22" y="32" width="76" height="46" rx="1" fill="#87CEEB" />
        {/* 스탠드 */}
        <rect x="50" y="90" width="20" height="8" rx="2" fill="#1a1a1a" />
        <rect x="35" y="98" width="50" height="5" rx="2" fill="#2d2d2d" />
        {/* 전원 표시등 */}
        <circle cx="60" cy="93" r="2" fill="#00FF00" />
      </svg>
    ),
    monitor: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 모니터 */}
        <rect x="20" y="15" width="80" height="60" rx="3" fill="#2d2d2d" />
        <rect x="25" y="20" width="70" height="50" rx="2" fill="#000000" />
        {/* 화면 */}
        <rect x="28" y="23" width="64" height="44" fill="#1E90FF" />
        {/* 스탠드 */}
        <rect x="55" y="75" width="10" height="20" fill="#2d2d2d" />
        <rect x="40" y="95" width="40" height="5" rx="2" fill="#1a1a1a" />
        {/* 베젤 */}
        <rect x="24" y="19" width="72" height="2" fill="#555555" />
      </svg>
    ),
    console: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 게임기 */}
        <rect x="25" y="45" width="70" height="25" rx="5" fill="#1a1a1a" />
        <rect x="28" y="48" width="64" height="19" rx="3" fill="#2d2d2d" />
        {/* 디스크 슬롯 */}
        <rect x="40" y="55" width="40" height="5" rx="1" fill="#000000" />
        {/* 버튼 */}
        <circle cx="85" cy="57" r="3" fill="#00FF00" />
        {/* 로고 */}
        <rect x="45" y="50" width="15" height="3" fill="#4169E1" />
        {/* 컨트롤러 */}
        <rect x="10" y="80" width="35" height="20" rx="8" fill="#4169E1" />
        <circle cx="18" cy="90" r="4" fill="#1a1a1a" />
        <circle cx="32" cy="87" r="3" fill="#FF0000" />
        <circle cx="37" cy="92" r="3" fill="#00FF00" />
      </svg>
    ),
    speaker: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 스피커 */}
        <rect x="30" y="10" width="60" height="100" rx="8" fill="#1a1a1a" />
        <rect x="35" y="15" width="50" height="90" rx="6" fill="#2d2d2d" />
        {/* 트위터 */}
        <circle cx="60" cy="35" r="12" fill="#555555" />
        <circle cx="60" cy="35" r="8" fill="#1a1a1a" />
        {/* 우퍼 */}
        <circle cx="60" cy="75" r="25" fill="#555555" />
        <circle cx="60" cy="75" r="20" fill="#1a1a1a" />
        <circle cx="60" cy="75" r="15" fill="#2d2d2d" />
        {/* 그릴 패턴 */}
        <circle cx="60" cy="75" r="18" fill="none" stroke="#555555" strokeWidth="1" />
        <circle cx="60" cy="75" r="12" fill="none" stroke="#555555" strokeWidth="1" />
      </svg>
    ),
    ac: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 에어컨 */}
        <rect x="10" y="30" width="100" height="40" rx="5" fill="#F5F5F5" />
        <rect x="15" y="35" width="90" height="30" rx="3" fill="#FFFFFF" />
        {/* 디스플레이 */}
        <rect x="70" y="42" width="30" height="8" rx="2" fill="#1a1a1a" />
        <text x="85" y="48" fontSize="6" fill="#00FF00" textAnchor="middle">24°C</text>
        {/* 버튼 */}
        <circle cx="75" cy="55" r="3" fill="#4169E1" />
        <circle cx="85" cy="55" r="3" fill="#FF6B6B" />
        <circle cx="95" cy="55" r="3" fill="#4ECDC4" />
        {/* 바람 표시 */}
        <path d="M 20 45 L 30 45" stroke="#87CEEB" strokeWidth="2" />
        <path d="M 22 50 L 35 50" stroke="#87CEEB" strokeWidth="2" />
        <path d="M 20 55 L 32 55" stroke="#87CEEB" strokeWidth="2" />
        {/* 송풍구 */}
        <rect x="10" y="70" width="100" height="15" rx="3" fill="#E0E0E0" />
        <path d="M 15 75 L 105 75 M 15 78 L 105 78 M 15 81 L 105 81" stroke="#CCCCCC" strokeWidth="1" />
      </svg>
    ),
    large_tv: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 대형 TV */}
        <rect x="5" y="10" width="110" height="85" rx="5" fill="#000000" />
        <rect x="8" y="13" width="104" height="79" rx="3" fill="#1a1a1a" />
        {/* 화면 */}
        <rect x="10" y="15" width="100" height="75" rx="2" fill="#000080" />
        <rect x="12" y="17" width="96" height="71" fill="#4169E1" />
        {/* 반사광 */}
        <rect x="15" y="20" width="40" height="30" rx="5" fill="rgba(255,255,255,0.1)" />
        {/* 스탠드 */}
        <polygon points="45,95 75,95 70,105 50,105" fill="#2d2d2d" />
        <rect x="40" y="105" width="40" height="5" rx="2" fill="#1a1a1a" />
        {/* 로고 */}
        <text x="60" y="103" fontSize="8" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">4K</text>
      </svg>
    ),
    hometheater: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 홈시어터 시스템 */}
        {/* 중앙 유닛 */}
        <rect x="30" y="50" width="60" height="25" rx="3" fill="#1a1a1a" />
        <rect x="33" y="53" width="54" height="19" rx="2" fill="#2d2d2d" />
        {/* 디스플레이 */}
        <rect x="45" y="58" width="30" height="8" rx="1" fill="#00FF00" />
        {/* 버튼들 */}
        <circle cx="40" cy="67" r="2" fill="#4169E1" />
        <circle cx="80" cy="67" r="2" fill="#FF6B6B" />
        {/* 좌우 스피커 */}
        <rect x="5" y="35" width="20" height="50" rx="5" fill="#1a1a1a" />
        <circle cx="15" cy="50" r="6" fill="#555555" />
        <circle cx="15" cy="65" r="6" fill="#555555" />
        <rect x="95" y="35" width="20" height="50" rx="5" fill="#1a1a1a" />
        <circle cx="105" cy="50" r="6" fill="#555555" />
        <circle cx="105" cy="65" r="6" fill="#555555" />
        {/* 서브우퍼 */}
        <rect x="45" y="80" width="30" height="30" rx="5" fill="#1a1a1a" />
        <circle cx="60" cy="95" r="10" fill="#2d2d2d" />
      </svg>
    ),
    robot: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* AI 로봇 */}
        {/* 머리 */}
        <rect x="40" y="15" width="40" height="30" rx="8" fill="#E0E0E0" />
        {/* 안테나 */}
        <rect x="58" y="5" width="4" height="12" fill="#555555" />
        <circle cx="60" cy="5" r="4" fill="#FF0000" />
        {/* 눈 */}
        <circle cx="50" cy="28" r="5" fill="#00BFFF" />
        <circle cx="70" cy="28" r="5" fill="#00BFFF" />
        <circle cx="50" cy="28" r="3" fill="#FFFFFF" />
        <circle cx="70" cy="28" r="3" fill="#FFFFFF" />
        {/* 몸통 */}
        <rect x="35" y="45" width="50" height="40" rx="10" fill="#C0C0C0" />
        {/* 디스플레이 */}
        <rect x="45" y="55" width="30" height="20" rx="3" fill="#1a1a1a" />
        <circle cx="60" cy="65" r="6" fill="#00FF00" />
        {/* 팔 */}
        <rect x="20" y="50" width="15" height="30" rx="5" fill="#A0A0A0" />
        <rect x="85" y="50" width="15" height="30" rx="5" fill="#A0A0A0" />
        {/* 손 */}
        <circle cx="27" cy="82" r="5" fill="#808080" />
        <circle cx="93" cy="82" r="5" fill="#808080" />
        {/* 다리 (바퀴) */}
        <rect x="42" y="85" width="15" height="20" rx="3" fill="#909090" />
        <rect x="63" y="85" width="15" height="20" rx="3" fill="#909090" />
        <ellipse cx="49" cy="105" rx="10" ry="5" fill="#1a1a1a" />
        <ellipse cx="70" cy="105" rx="10" ry="5" fill="#1a1a1a" />
      </svg>
    ),
    vr: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* VR 장비 */}
        {/* 헤드셋 */}
        <ellipse cx="60" cy="50" rx="40" ry="35" fill="#1a1a1a" />
        <ellipse cx="60" cy="50" rx="35" ry="30" fill="#2d2d2d" />
        {/* 렌즈 */}
        <ellipse cx="45" cy="50" rx="12" ry="15" fill="#4169E1" />
        <ellipse cx="75" cy="50" rx="12" ry="15" fill="#4169E1" />
        <ellipse cx="45" cy="48" rx="8" ry="10" fill="#87CEEB" />
        <ellipse cx="75" cy="48" rx="8" ry="10" fill="#87CEEB" />
        {/* 스트랩 */}
        <path d="M 20 45 Q 10 50 20 55" stroke="#1a1a1a" strokeWidth="8" fill="none" />
        <path d="M 100 45 Q 110 50 100 55" stroke="#1a1a1a" strokeWidth="8" fill="none" />
        {/* 센서 */}
        <circle cx="60" cy="30" r="4" fill="#00FF00" />
        <circle cx="50" cy="35" r="3" fill="#FF0000" />
        <circle cx="70" cy="35" r="3" fill="#FF0000" />
        {/* 컨트롤러 왼쪽 */}
        <ellipse cx="30" cy="90" rx="10" ry="15" fill="#2d2d2d" transform="rotate(-15, 30, 90)" />
        <circle cx="30" cy="85" r="4" fill="#4169E1" />
        {/* 컨트롤러 오른쪽 */}
        <ellipse cx="90" cy="90" rx="10" ry="15" fill="#2d2d2d" transform="rotate(15, 90, 90)" />
        <circle cx="90" cy="85" r="4" fill="#FF6B6B" />
      </svg>
    )
  };

  return electronicsTypes[type] || electronicsTypes.tv;
};

// 차량 SVG
export const VehicleSVG = ({ type = 'car', size = 60 }) => {
  const vehicleTypes = {
    car: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 기본 자동차 */}
        <rect x="15" y="60" width="90" height="30" rx="5" fill="#FF6B6B" />
        {/* 차체 윗부분 */}
        <path d="M 30 60 L 40 40 L 80 40 L 90 60" fill="#FF6B6B" />
        {/* 창문 */}
        <path d="M 35 58 L 43 43 L 60 43 L 60 58" fill="#87CEEB" />
        <path d="M 65 58 L 65 43 L 77 43 L 85 58" fill="#87CEEB" />
        {/* 바퀴 */}
        <circle cx="30" cy="90" r="12" fill="#1a1a1a" />
        <circle cx="30" cy="90" r="7" fill="#555555" />
        <circle cx="90" cy="90" r="12" fill="#1a1a1a" />
        <circle cx="90" cy="90" r="7" fill="#555555" />
        {/* 헤드라이트 */}
        <circle cx="12" cy="70" r="4" fill="#FFD700" />
        {/* 테일라이트 */}
        <circle cx="108" cy="70" r="4" fill="#FF0000" />
      </svg>
    ),
    suv: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* SUV */}
        <rect x="10" y="50" width="100" height="40" rx="8" fill="#2d2d2d" />
        {/* 차체 윗부분 */}
        <path d="M 20 50 L 30 25 L 90 25 L 100 50" fill="#2d2d2d" />
        {/* 창문 */}
        <path d="M 25 48 L 33 30 L 55 30 L 55 48" fill="#4169E1" />
        <path d="M 60 48 L 60 30 L 87 30 L 95 48" fill="#4169E1" />
        {/* 바퀴 (큰 바퀴) */}
        <circle cx="25" cy="90" r="15" fill="#1a1a1a" />
        <circle cx="25" cy="90" r="10" fill="#555555" />
        <circle cx="95" cy="90" r="15" fill="#1a1a1a" />
        <circle cx="95" cy="90" r="10" fill="#555555" />
        {/* 범퍼 */}
        <rect x="5" y="75" width="10" height="10" rx="2" fill="#C0C0C0" />
        <rect x="105" y="75" width="10" height="10" rx="2" fill="#C0C0C0" />
        {/* 루프랙 */}
        <rect x="30" y="20" width="60" height="5" rx="2" fill="#555555" />
      </svg>
    ),
    sportscar: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 스포츠카 */}
        <defs>
          <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
        <path d="M 10 70 L 20 50 L 45 45 L 75 45 L 100 50 L 110 70 L 110 85 L 10 85 Z" fill="url(#carGradient)" />
        {/* 창문 */}
        <path d="M 45 48 L 50 50 L 70 50 L 75 48" fill="#1a1a1a" />
        {/* 바퀴 */}
        <circle cx="28" cy="85" r="13" fill="#1a1a1a" />
        <circle cx="28" cy="85" r="8" fill="#FFD700" />
        <circle cx="92" cy="85" r="13" fill="#1a1a1a" />
        <circle cx="92" cy="85" r="8" fill="#FFD700" />
        {/* 스포일러 */}
        <rect x="95" y="42" width="20" height="4" fill="#1a1a1a" />
        {/* 라인 */}
        <path d="M 20 65 L 105 65" stroke="#FFA500" strokeWidth="2" />
      </svg>
    ),
    camper: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 캠핑카 */}
        <rect x="10" y="40" width="100" height="50" rx="8" fill="#F5F5F5" />
        {/* 운전석 */}
        <path d="M 10 60 L 25 30 L 45 30 L 45 60" fill="#F5F5F5" />
        {/* 창문들 */}
        <rect x="15" y="35" width="20" height="15" rx="2" fill="#87CEEB" />
        <rect x="50" y="48" width="20" height="15" rx="2" fill="#87CEEB" />
        <rect x="75" y="48" width="20" height="15" rx="2" fill="#87CEEB" />
        {/* 바퀴 */}
        <circle cx="30" cy="90" r="12" fill="#1a1a1a" />
        <circle cx="30" cy="90" r="7" fill="#555555" />
        <circle cx="90" cy="90" r="12" fill="#1a1a1a" />
        <circle cx="90" cy="90" r="7" fill="#555555" />
        {/* 문 */}
        <rect x="95" y="55" width="12" height="30" rx="2" fill="#A0522D" />
        <circle cx="97" cy="70" r="2" fill="#FFD700" />
        {/* 줄무늬 장식 */}
        <path d="M 10 70 L 110 70" stroke="#4ECDC4" strokeWidth="3" />
      </svg>
    ),
    motorcycle: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 오토바이 */}
        {/* 앞바퀴 */}
        <circle cx="30" cy="85" r="15" fill="#1a1a1a" />
        <circle cx="30" cy="85" r="10" fill="#555555" />
        {/* 뒷바퀴 */}
        <circle cx="90" cy="85" r="15" fill="#1a1a1a" />
        <circle cx="90" cy="85" r="10" fill="#555555" />
        {/* 프레임 */}
        <path d="M 30 85 L 50 60 L 70 50 L 90 85" stroke="#FF0000" strokeWidth="4" fill="none" />
        <path d="M 50 60 L 60 85" stroke="#FF0000" strokeWidth="4" />
        {/* 연료탱크 */}
        <ellipse cx="60" cy="60" rx="18" ry="12" fill="#FF6B6B" />
        {/* 좌석 */}
        <ellipse cx="70" cy="65" rx="15" ry="8" fill="#1a1a1a" />
        {/* 핸들 */}
        <path d="M 45 50 L 55 50" stroke="#1a1a1a" strokeWidth="3" />
        <line x1="50" y1="50" x2="50" y2="55" stroke="#1a1a1a" strokeWidth="3" />
        {/* 헤드라이트 */}
        <circle cx="35" cy="60" r="5" fill="#FFD700" />
        {/* 머플러 */}
        <rect x="85" y="80" width="15" height="5" rx="2" fill="#2d2d2d" />
      </svg>
    ),
    helicopter: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 헬리콥터 */}
        {/* 메인 로터 */}
        <ellipse cx="60" cy="25" rx="55" ry="8" fill="#555555" opacity="0.3" />
        <rect x="58" y="20" width="4" height="15" fill="#1a1a1a" />
        {/* 기체 */}
        <ellipse cx="60" cy="55" rx="35" ry="20" fill="#4169E1" />
        {/* 조종석 */}
        <path d="M 35 50 Q 35 35 60 35 Q 85 35 85 50" fill="#87CEEB" />
        {/* 동체 */}
        <rect x="60" y="55" width="35" height="12" rx="3" fill="#3a5ba0" />
        {/* 꼬리 */}
        <rect x="95" y="58" width="20" height="6" rx="2" fill="#2d4a8a" />
        {/* 테일 로터 */}
        <ellipse cx="115" cy="61" rx="8" ry="3" fill="#555555" opacity="0.3" transform="rotate(90, 115, 61)" />
        {/* 스키드 (착륙 장치) */}
        <path d="M 30 70 Q 30 75 35 75 L 85 75 Q 90 75 90 70" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        <line x1="40" y1="65" x2="35" y2="75" stroke="#1a1a1a" strokeWidth="3" />
        <line x1="80" y1="65" x2="85" y2="75" stroke="#1a1a1a" strokeWidth="3" />
      </svg>
    ),
    yacht: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 요트 */}
        {/* 선체 */}
        <path d="M 20 80 L 10 95 L 110 95 L 100 80 Z" fill="#FFFFFF" />
        <path d="M 25 80 L 95 80 L 105 90 L 15 90 Z" fill="#F0F0F0" />
        {/* 갑판 */}
        <rect x="30" y="65" width="60" height="15" rx="5" fill="#E0E0E0" />
        {/* 조타실 */}
        <rect x="45" y="50" width="30" height="15" rx="3" fill="#FFFFFF" />
        <rect x="48" y="53" width="24" height="9" rx="2" fill="#87CEEB" />
        {/* 마스트 */}
        <rect x="58" y="15" width="4" height="50" fill="#8B4513" />
        {/* 깃발 */}
        <polygon points="62,20 85,25 62,30" fill="#FF0000" />
        {/* 돛 */}
        <polygon points="40,35 60,25 60,65" fill="#FFFFFF" opacity="0.8" />
        {/* 파도 */}
        <path d="M 0 95 Q 10 90 20 95 Q 30 100 40 95 Q 50 90 60 95 Q 70 100 80 95 Q 90 90 100 95 Q 110 100 120 95"
              stroke="#4169E1" strokeWidth="2" fill="none" />
      </svg>
    ),
    jet: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 전용기 */}
        {/* 동체 */}
        <ellipse cx="60" cy="60" rx="45" ry="15" fill="#F5F5F5" />
        {/* 기수 */}
        <ellipse cx="20" cy="60" rx="15" ry="13" fill="#E0E0E0" />
        {/* 조종석 창문 */}
        <ellipse cx="35" cy="55" rx="8" ry="5" fill="#4169E1" />
        <ellipse cx="48" cy="55" rx="8" ry="5" fill="#4169E1" />
        {/* 객실 창문들 */}
        <ellipse cx="65" cy="58" rx="4" ry="3" fill="#87CEEB" />
        <ellipse cx="75" cy="58" rx="4" ry="3" fill="#87CEEB" />
        <ellipse cx="85" cy="58" rx="4" ry="3" fill="#87CEEB" />
        <ellipse cx="95" cy="58" rx="4" ry="3" fill="#87CEEB" />
        {/* 주 날개 */}
        <rect x="40" y="60" width="40" height="5" fill="#C0C0C0" />
        <polygon points="20,60 40,60 40,65 30,65" fill="#C0C0C0" />
        <polygon points="80,60 100,60 90,65 80,65" fill="#C0C0C0" />
        {/* 꼬리 날개 */}
        <polygon points="100,55 105,45 110,55" fill="#C0C0C0" />
        {/* 엔진 */}
        <ellipse cx="45" cy="72" rx="8" ry="6" fill="#2d2d2d" />
        <ellipse cx="75" cy="72" rx="8" ry="6" fill="#2d2d2d" />
        {/* 라인 */}
        <path d="M 20 60 L 105 60" stroke="#4169E1" strokeWidth="2" />
      </svg>
    ),
    rocket: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 우주선 */}
        <defs>
          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
        {/* 로켓 본체 */}
        <ellipse cx="60" cy="60" rx="20" ry="40" fill="url(#rocketGradient)" />
        {/* 꼭대기 */}
        <path d="M 40 30 Q 60 10 80 30" fill="#FF6B6B" />
        {/* 창문 */}
        <circle cx="60" cy="40" r="8" fill="#4169E1" />
        <circle cx="60" cy="40" r="6" fill="#87CEEB" />
        {/* 날개 */}
        <polygon points="40,70 30,90 40,85" fill="#FF6B6B" />
        <polygon points="80,70 90,90 80,85" fill="#FF6B6B" />
        {/* 엔진 */}
        <rect x="48" y="95" width="24" height="15" rx="3" fill="#2d2d2d" />
        {/* 불꽃 */}
        <polygon points="52,110 56,118 60,110" fill="#FF6B6B" />
        <polygon points="60,110 64,118 68,110" fill="#FFA500" />
        <polygon points="56,112 60,120 64,112" fill="#FFD700" />
        {/* 로고 */}
        <polygon points="55,55 60,50 65,55 60,60" fill="#FFD700" />
      </svg>
    )
  };

  return vehicleTypes[type] || vehicleTypes.car;
};

// 펫 SVG
export const PetSVG = ({ type = 'dog', size = 60 }) => {
  const petTypes = {
    dog: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 강아지 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="75" rx="25" ry="20" fill="#D2691E" />
        {/* 머리 */}
        <circle cx="60" cy="45" r="18" fill="#D2691E" />
        {/* 귀 */}
        <ellipse cx="48" cy="35" rx="8" ry="15" fill="#A0522D" transform="rotate(-20, 48, 35)" />
        <ellipse cx="72" cy="35" rx="8" ry="15" fill="#A0522D" transform="rotate(20, 72, 35)" />
        {/* 눈 */}
        <circle cx="53" cy="43" r="3" fill="#1a1a1a" />
        <circle cx="67" cy="43" r="3" fill="#1a1a1a" />
        <circle cx="54" cy="42" r="1.5" fill="#FFFFFF" />
        <circle cx="68" cy="42" r="1.5" fill="#FFFFFF" />
        {/* 코 */}
        <ellipse cx="60" cy="50" rx="4" ry="3" fill="#1a1a1a" />
        {/* 입 */}
        <path d="M 60 50 L 60 54" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M 60 54 Q 55 56 52 54" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        <path d="M 60 54 Q 65 56 68 54" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        {/* 다리 */}
        <rect x="45" y="90" width="8" height="20" rx="4" fill="#A0522D" />
        <rect x="67" y="90" width="8" height="20" rx="4" fill="#A0522D" />
        {/* 꼬리 */}
        <path d="M 85 70 Q 95 65 100 60" stroke="#D2691E" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
    cat: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 고양이 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="75" rx="22" ry="18" fill="#FF8C00" />
        {/* 머리 */}
        <circle cx="60" cy="50" r="16" fill="#FF8C00" />
        {/* 귀 (뾰족하게) */}
        <polygon points="48,32 42,20 52,35" fill="#FF8C00" />
        <polygon points="72,32 78,20 68,35" fill="#FF8C00" />
        <polygon points="47,30 45,24 50,32" fill="#FFB6C1" />
        <polygon points="73,30 75,24 70,32" fill="#FFB6C1" />
        {/* 눈 */}
        <ellipse cx="53" cy="48" rx="4" ry="6" fill="#32CD32" />
        <ellipse cx="67" cy="48" rx="4" ry="6" fill="#32CD32" />
        <ellipse cx="53" cy="48" rx="1.5" ry="4" fill="#1a1a1a" />
        <ellipse cx="67" cy="48" rx="1.5" ry="4" fill="#1a1a1a" />
        {/* 코 */}
        <polygon points="60,54 58,56 62,56" fill="#FFB6C1" />
        {/* 수염 */}
        <path d="M 45 52 L 35 50" stroke="#1a1a1a" strokeWidth="1" />
        <path d="M 45 55 L 32 55" stroke="#1a1a1a" strokeWidth="1" />
        <path d="M 75 52 L 85 50" stroke="#1a1a1a" strokeWidth="1" />
        <path d="M 75 55 L 88 55" stroke="#1a1a1a" strokeWidth="1" />
        {/* 다리 */}
        <rect x="48" y="88" width="7" height="18" rx="3" fill="#FFA500" />
        <rect x="65" y="88" width="7" height="18" rx="3" fill="#FFA500" />
        {/* 꼬리 */}
        <path d="M 80 75 Q 95 70 95 55" stroke="#FF8C00" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    ),
    hamster: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 햄스터 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="70" rx="28" ry="25" fill="#F5DEB3" />
        {/* 머리 */}
        <circle cx="60" cy="50" r="20" fill="#F5DEB3" />
        {/* 귀 */}
        <circle cx="48" cy="38" r="7" fill="#DEB887" />
        <circle cx="72" cy="38" r="7" fill="#DEB887" />
        <circle cx="48" cy="38" r="4" fill="#FFB6C1" />
        <circle cx="72" cy="38" r="4" fill="#FFB6C1" />
        {/* 눈 */}
        <circle cx="53" cy="48" r="4" fill="#1a1a1a" />
        <circle cx="67" cy="48" r="4" fill="#1a1a1a" />
        <circle cx="54" cy="47" r="2" fill="#FFFFFF" />
        <circle cx="68" cy="47" r="2" fill="#FFFFFF" />
        {/* 코 */}
        <circle cx="60" cy="55" r="2.5" fill="#FFB6C1" />
        {/* 입 */}
        <path d="M 60 55 Q 57 58 54 57" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        <path d="M 60 55 Q 63 58 66 57" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        {/* 손 */}
        <ellipse cx="40" cy="65" rx="6" ry="8" fill="#F5DEB3" />
        <ellipse cx="80" cy="65" rx="6" ry="8" fill="#F5DEB3" />
        {/* 먹이 (해바라기씨) */}
        <ellipse cx="43" cy="62" rx="3" ry="4" fill="#8B4513" />
        {/* 배 (흰색) */}
        <ellipse cx="60" cy="80" rx="18" ry="15" fill="#FFFFFF" />
        {/* 꼬리 */}
        <circle cx="60" cy="95" r="3" fill="#F5DEB3" />
      </svg>
    ),
    rabbit: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 토끼 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="75" rx="24" ry="22" fill="#FFFFFF" />
        {/* 머리 */}
        <circle cx="60" cy="50" r="18" fill="#FFFFFF" />
        {/* 귀 (긴) */}
        <ellipse cx="50" cy="25" rx="7" ry="20" fill="#FFFFFF" />
        <ellipse cx="70" cy="25" rx="7" ry="20" fill="#FFFFFF" />
        <ellipse cx="50" cy="25" rx="4" ry="15" fill="#FFB6C1" />
        <ellipse cx="70" cy="25" rx="4" ry="15" fill="#FFB6C1" />
        {/* 눈 */}
        <circle cx="53" cy="48" r="4" fill="#FF69B4" />
        <circle cx="67" cy="48" r="4" fill="#FF69B4" />
        <circle cx="54" cy="47" r="2" fill="#FFFFFF" />
        <circle cx="68" cy="47" r="2" fill="#FFFFFF" />
        {/* 코 */}
        <circle cx="60" cy="55" r="3" fill="#FFB6C1" />
        {/* 입 */}
        <path d="M 60 55 L 60 58" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M 60 58 Q 56 60 54 58" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        <path d="M 60 58 Q 64 60 66 58" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        {/* 앞발 */}
        <ellipse cx="48" cy="88" rx="6" ry="10" fill="#FFFFFF" />
        <ellipse cx="72" cy="88" rx="6" ry="10" fill="#FFFFFF" />
        {/* 꼬리 */}
        <circle cx="60" cy="97" r="8" fill="#F0F0F0" />
      </svg>
    ),
    parrot: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 앵무새 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="65" rx="20" ry="28" fill="#32CD32" />
        {/* 머리 */}
        <circle cx="60" cy="40" r="16" fill="#FFD700" />
        {/* 부리 */}
        <path d="M 60 45 L 68 50 L 60 52 Z" fill="#FFA500" />
        {/* 눈 */}
        <circle cx="56" cy="38" r="5" fill="#FFFFFF" />
        <circle cx="56" cy="38" r="3" fill="#1a1a1a" />
        <circle cx="57" cy="37" r="1.5" fill="#FFFFFF" />
        {/* 볏 */}
        <path d="M 55 28 Q 58 20 60 25 Q 62 20 65 28" fill="#FF6B6B" />
        {/* 날개 */}
        <ellipse cx="45" cy="70" rx="12" ry="22" fill="#00BFFF" transform="rotate(-20, 45, 70)" />
        <ellipse cx="75" cy="70" rx="12" ry="22" fill="#00BFFF" transform="rotate(20, 75, 70)" />
        {/* 꼬리 */}
        <path d="M 60 90 L 50 110 M 60 90 L 60 115 M 60 90 L 70 110"
              stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
        <path d="M 60 90 L 48 112 M 60 90 L 60 118 M 60 90 L 72 112"
              stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        {/* 발 */}
        <line x1="55" y1="90" x2="55" y2="95" stroke="#FFA500" strokeWidth="2" />
        <line x1="65" y1="90" x2="65" y2="95" stroke="#FFA500" strokeWidth="2" />
        {/* 발가락 */}
        <path d="M 55 95 L 50 98 M 55 95 L 55 100 M 55 95 L 60 98"
              stroke="#FFA500" strokeWidth="1.5" />
        <path d="M 65 95 L 60 98 M 65 95 L 65 100 M 65 95 L 70 98"
              stroke="#FFA500" strokeWidth="1.5" />
        {/* 횃대 */}
        <rect x="35" y="95" width="50" height="5" rx="2" fill="#8B4513" />
      </svg>
    ),
    fish: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 열대어 */}
        {/* 물결 배경 */}
        <path d="M 0 40 Q 20 35 40 40 Q 60 45 80 40 Q 100 35 120 40 L 120 80 Q 100 75 80 80 Q 60 85 40 80 Q 20 75 0 80 Z"
              fill="#87CEEB" opacity="0.3" />
        {/* 몸통 */}
        <ellipse cx="60" cy="60" rx="25" ry="15" fill="#FFA500" />
        {/* 줄무늬 */}
        <ellipse cx="70" cy="60" rx="5" ry="14" fill="#FFFFFF" />
        <ellipse cx="55" cy="60" rx="5" ry="14" fill="#FFFFFF" />
        {/* 머리 */}
        <circle cx="40" cy="60" r="12" fill="#FFD700" />
        {/* 눈 */}
        <circle cx="38" cy="58" r="4" fill="#FFFFFF" />
        <circle cx="38" cy="58" r="2" fill="#1a1a1a" />
        {/* 입 */}
        <ellipse cx="32" cy="62" rx="3" ry="2" fill="#FF6B6B" />
        {/* 등지느러미 */}
        <path d="M 55 45 Q 60 35 65 45" fill="#FF6B6B" />
        {/* 배지느러미 */}
        <path d="M 55 75 Q 60 80 65 75" fill="#FF6B6B" />
        {/* 꼬리지느러미 */}
        <path d="M 85 60 Q 100 50 95 60 Q 100 70 85 60" fill="#FF6B6B" />
        {/* 물방울 */}
        <circle cx="20" cy="30" r="3" fill="#FFFFFF" opacity="0.6" />
        <circle cx="90" cy="80" r="4" fill="#FFFFFF" opacity="0.6" />
        <circle cx="100" cy="35" r="2" fill="#FFFFFF" opacity="0.6" />
      </svg>
    ),
    fox: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 여우 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="75" rx="26" ry="20" fill="#FF8C00" />
        {/* 머리 */}
        <circle cx="60" cy="50" r="19" fill="#FF8C00" />
        {/* 귀 (뾰족) */}
        <polygon points="45,28 40,12 50,30" fill="#FF8C00" />
        <polygon points="75,28 80,12 70,30" fill="#FF8C00" />
        <polygon points="45,26 43,18 48,28" fill="#FFFFFF" />
        <polygon points="75,26 77,18 72,28" fill="#FFFFFF" />
        {/* 눈 */}
        <ellipse cx="53" cy="48" rx="4" ry="5" fill="#1a1a1a" />
        <ellipse cx="67" cy="48" rx="4" ry="5" fill="#1a1a1a" />
        <circle cx="54" cy="47" r="1.5" fill="#FFFFFF" />
        <circle cx="68" cy="47" r="1.5" fill="#FFFFFF" />
        {/* 코 */}
        <polygon points="60,56 58,58 62,58" fill="#1a1a1a" />
        {/* 입 */}
        <path d="M 60 58 Q 56 60 53 58" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        <path d="M 60 58 Q 64 60 67 58" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        {/* 흰 턱 */}
        <ellipse cx="60" cy="58" rx="8" ry="10" fill="#FFFFFF" />
        {/* 다리 */}
        <rect x="46" y="90" width="7" height="20" rx="3" fill="#8B4513" />
        <rect x="67" y="90" width="7" height="20" rx="3" fill="#8B4513" />
        {/* 발 (검은색) */}
        <rect x="46" y="105" width="7" height="5" fill="#1a1a1a" />
        <rect x="67" y="105" width="7" height="5" fill="#1a1a1a" />
        {/* 꼬리 */}
        <path d="M 80 75 Q 100 70 105 60 Q 110 55 105 65 Q 100 75 95 75"
              fill="#FF8C00" stroke="#FF8C00" strokeWidth="8" />
        <path d="M 95 75 Q 100 70 105 65" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
    unicorn: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 유니콘 */}
        <defs>
          <linearGradient id="unicornGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#DDA0DD" />
            <stop offset="100%" stopColor="#87CEEB" />
          </linearGradient>
        </defs>
        {/* 몸통 */}
        <ellipse cx="60" cy="75" rx="28" ry="22" fill="#FFFFFF" />
        {/* 목 */}
        <ellipse cx="50" cy="60" rx="12" ry="18" fill="#FFFFFF" transform="rotate(-20, 50, 60)" />
        {/* 머리 */}
        <ellipse cx="45" cy="42" rx="14" ry="16" fill="#FFFFFF" />
        {/* 뿔 (반짝이는) */}
        <polygon points="40,25 43,10 46,25" fill="url(#unicornGradient)" />
        <path d="M 43 10 L 46 25" stroke="#FFD700" strokeWidth="1" />
        <circle cx="43" cy="12" r="2" fill="#FFFFFF" opacity="0.8" />
        {/* 귀 */}
        <ellipse cx="38" cy="28" rx="4" ry="8" fill="#FFB6C1" transform="rotate(-15, 38, 28)" />
        <ellipse cx="50" cy="28" rx="4" ry="8" fill="#FFB6C1" transform="rotate(15, 50, 28)" />
        {/* 눈 */}
        <circle cx="42" cy="40" r="4" fill="#1a1a1a" />
        <circle cx="43" cy="39" r="2" fill="#FFFFFF" />
        {/* 갈기 (무지개색) */}
        <path d="M 48 30 Q 55 28 58 35" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
        <path d="M 50 35 Q 57 33 60 40" stroke="#FFA500" strokeWidth="4" strokeLinecap="round" />
        <path d="M 52 40 Q 59 38 62 45" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
        <path d="M 54 45 Q 61 43 64 50" stroke="#32CD32" strokeWidth="4" strokeLinecap="round" />
        <path d="M 56 50 Q 63 48 66 55" stroke="#4169E1" strokeWidth="4" strokeLinecap="round" />
        <path d="M 58 55 Q 65 53 68 60" stroke="#9370DB" strokeWidth="4" strokeLinecap="round" />
        {/* 다리 */}
        <rect x="44" y="92" width="8" height="18" rx="4" fill="#FFFFFF" />
        <rect x="68" y="92" width="8" height="18" rx="4" fill="#FFFFFF" />
        {/* 발굽 (금색) */}
        <rect x="44" y="106" width="8" height="4" fill="#FFD700" />
        <rect x="68" y="106" width="8" height="4" fill="#FFD700" />
        {/* 꼬리 (무지개색) */}
        <path d="M 85 75 Q 95 70 100 75 Q 105 85 100 90"
              stroke="url(#unicornGradient)" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* 별 반짝임 */}
        <polygon points="30,20 31,22 33,22 31,23 32,25 30,24 28,25 29,23 27,22 29,22" fill="#FFD700" />
        <polygon points="85,35 86,37 88,37 86,38 87,40 85,39 83,40 84,38 82,37 84,37" fill="#FFD700" />
      </svg>
    ),
    dragon: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 드래곤 */}
        <defs>
          <linearGradient id="dragonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="100%" stopColor="#DC143C" />
          </linearGradient>
        </defs>
        {/* 몸통 */}
        <ellipse cx="60" cy="70" rx="30" ry="25" fill="url(#dragonGradient)" />
        {/* 목 */}
        <ellipse cx="50" cy="50" rx="15" ry="25" fill="url(#dragonGradient)" transform="rotate(-30, 50, 50)" />
        {/* 머리 */}
        <ellipse cx="40" cy="35" rx="18" ry="16" fill="url(#dragonGradient)" />
        {/* 뿔 */}
        <polygon points="32,22 30,10 35,20" fill="#FFD700" />
        <polygon points="48,22 50,10 45,20" fill="#FFD700" />
        {/* 눈 */}
        <ellipse cx="35" cy="32" rx="5" ry="6" fill="#FFD700" />
        <ellipse cx="35" cy="32" rx="2" ry="4" fill="#1a1a1a" />
        {/* 코구멍 */}
        <ellipse cx="25" cy="38" rx="3" ry="2" fill="#1a1a1a" />
        {/* 입 (불) */}
        <path d="M 22 42 Q 10 45 5 50" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
        <path d="M 22 42 Q 8 42 3 45" stroke="#FFA500" strokeWidth="2" strokeLinecap="round" />
        <path d="M 22 42 Q 12 40 8 40" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        {/* 날개 */}
        <path d="M 50 60 Q 30 45 35 30 Q 40 20 50 25 Q 55 30 50 40 Z"
              fill="#8B0000" opacity="0.7" />
        <path d="M 70 60 Q 90 45 85 30 Q 80 20 70 25 Q 65 30 70 40 Z"
              fill="#8B0000" opacity="0.7" />
        {/* 날개 뼈대 */}
        <path d="M 50 60 L 42 35 M 50 60 L 45 30" stroke="#DC143C" strokeWidth="1.5" />
        <path d="M 70 60 L 78 35 M 70 60 L 75 30" stroke="#DC143C" strokeWidth="1.5" />
        {/* 다리 */}
        <rect x="45" y="90" width="10" height="18" rx="3" fill="#8B0000" />
        <rect x="65" y="90" width="10" height="18" rx="3" fill="#8B0000" />
        {/* 발톱 */}
        <path d="M 48 108 L 45 112 M 52 108 L 52 113 M 55 108 L 58 112"
              stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <path d="M 68 108 L 65 112 M 72 108 L 72 113 M 75 108 L 78 112"
              stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        {/* 꼬리 */}
        <path d="M 85 75 Q 100 80 110 75 Q 115 70 112 78"
              stroke="#8B0000" strokeWidth="10" strokeLinecap="round" fill="none" />
        <polygon points="110,70 115,75 110,80" fill="#FFA500" />
        {/* 등 가시 */}
        <polygon points="58,55 60,48 62,55" fill="#FFD700" />
        <polygon points="68,60 70,53 72,60" fill="#FFD700" />
        <polygon points="78,65 80,58 82,65" fill="#FFD700" />
      </svg>
    ),
    eagle: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 독수리 */}
        {/* 몸통 */}
        <ellipse cx="60" cy="60" rx="22" ry="30" fill="#8B4513" />
        {/* 머리 */}
        <circle cx="60" cy="35" r="15" fill="#FFFFFF" />
        {/* 부리 */}
        <path d="M 60 38 L 70 42 L 60 45 Z" fill="#FFD700" />
        <path d="M 70 42 L 75 43 L 70 45 Z" fill="#FFA500" />
        {/* 눈 */}
        <circle cx="56" cy="33" r="4" fill="#FFD700" />
        <circle cx="56" cy="33" r="2" fill="#1a1a1a" />
        <circle cx="57" cy="32" r="1" fill="#FFFFFF" />
        {/* 날개 (펼친) */}
        <path d="M 40 55 Q 15 50 5 60 Q 10 70 25 65 Q 35 62 40 70"
              fill="#654321" />
        <path d="M 80 55 Q 105 50 115 60 Q 110 70 95 65 Q 85 62 80 70"
              fill="#654321" />
        {/* 날개 깃털 */}
        <path d="M 15 60 L 10 65 M 20 62 L 15 68 M 25 63 L 22 70 M 30 64 L 28 71"
              stroke="#8B4513" strokeWidth="2" />
        <path d="M 105 60 L 110 65 M 100 62 L 105 68 M 95 63 L 98 70 M 90 64 L 92 71"
              stroke="#8B4513" strokeWidth="2" />
        {/* 가슴 (흰색) */}
        <ellipse cx="60" cy="65" rx="14" ry="18" fill="#F5F5F5" />
        {/* 다리 */}
        <rect x="52" y="85" width="5" height="15" fill="#FFD700" />
        <rect x="63" y="85" width="5" height="15" fill="#FFD700" />
        {/* 발톱 */}
        <path d="M 50 100 L 47 105 M 54 100 L 54 106 M 57 100 L 60 105"
              stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        <path d="M 63 100 L 60 105 M 66 100 L 66 106 M 70 100 L 73 105"
              stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        {/* 꼬리 깃털 */}
        <path d="M 50 88 L 48 105 M 55 88 L 55 108 M 60 88 L 60 110 M 65 88 L 65 108 M 70 88 L 72 105"
              stroke="#654321" strokeWidth="3" />
      </svg>
    )
  };

  return petTypes[type] || petTypes.dog;
};

// 장식품 SVG
export const DecorationSVG = ({ type = 'picture', size = 60 }) => {
  const decorationTypes = {
    picture: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 액자 */}
        <rect x="15" y="20" width="90" height="70" rx="3" fill="#8B4513" />
        <rect x="20" y="25" width="80" height="60" rx="2" fill="#F5F5F5" />
        {/* 그림 (산 풍경) */}
        <rect x="22" y="27" width="76" height="56" fill="#87CEEB" />
        <polygon points="30,60 50,40 70,55 90,35 98,60" fill="#228B22" />
        <polygon points="45,70 60,50 75,65 83,70" fill="#32CD32" />
        <circle cx="80" cy="40" r="8" fill="#FFD700" />
        <circle cx="80" cy="40" r="10" fill="#FFA500" opacity="0.3" />
      </svg>
    ),
    plant: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 화분 */}
        <path d="M 40 80 L 35 105 L 85 105 L 80 80 Z" fill="#D2691E" />
        <ellipse cx="60" cy="80" rx="20" ry="5" fill="#8B4513" />
        {/* 흙 */}
        <ellipse cx="60" cy="82" rx="18" ry="4" fill="#654321" />
        {/* 줄기 */}
        <rect x="57" y="50" width="6" height="35" rx="3" fill="#228B22" />
        {/* 잎 */}
        <ellipse cx="45" cy="65" rx="12" ry="8" fill="#32CD32" transform="rotate(-30, 45, 65)" />
        <ellipse cx="75" cy="65" rx="12" ry="8" fill="#32CD32" transform="rotate(30, 75, 65)" />
        <ellipse cx="50" cy="55" rx="10" ry="7" fill="#32CD32" transform="rotate(-20, 50, 55)" />
        <ellipse cx="70" cy="55" rx="10" ry="7" fill="#32CD32" transform="rotate(20, 70, 55)" />
        {/* 꽃 */}
        <circle cx="60" cy="45" r="12" fill="#FFB6C1" />
        <circle cx="50" cy="40" r="8" fill="#FF69B4" />
        <circle cx="70" cy="40" r="8" fill="#FF69B4" />
        <circle cx="55" cy="50" r="8" fill="#FF69B4" />
        <circle cx="65" cy="50" r="8" fill="#FF69B4" />
        <circle cx="60" cy="45" r="6" fill="#FFD700" />
      </svg>
    ),
    trophy: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 트로피 */}
        <defs>
          <linearGradient id="trophyGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
        {/* 손잡이 */}
        <path d="M 30 30 Q 20 35 20 45 Q 20 55 30 60" stroke="url(#trophyGold)" strokeWidth="6" fill="none" />
        <path d="M 90 30 Q 100 35 100 45 Q 100 55 90 60" stroke="url(#trophyGold)" strokeWidth="6" fill="none" />
        {/* 컵 */}
        <path d="M 35 25 L 30 65 Q 30 75 40 75 L 80 75 Q 90 75 90 65 L 85 25 Z" fill="url(#trophyGold)" />
        {/* 반사광 */}
        <ellipse cx="50" cy="40" rx="8" ry="15" fill="#FFFFFF" opacity="0.3" />
        {/* 장식 */}
        <ellipse cx="60" cy="30" rx="23" ry="5" fill="#FFD700" />
        {/* 줄 */}
        <rect x="55" y="75" width="10" height="15" fill="url(#trophyGold)" />
        {/* 받침대 */}
        <rect x="45" y="90" width="30" height="8" rx="2" fill="url(#trophyGold)" />
        <rect x="40" y="98" width="40" height="8" rx="2" fill="url(#trophyGold)" />
        {/* 판 */}
        <rect x="48" y="45" width="24" height="12" rx="1" fill="#8B4513" />
        <text x="60" y="53" fontSize="6" fill="#FFD700" textAnchor="middle" fontWeight="bold">1ST</text>
      </svg>
    ),
    tent: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 텐트 */}
        <polygon points="60,20 20,90 100,90" fill="#4169E1" />
        <polygon points="60,20 100,90 60,90" fill="#1E3A8A" />
        {/* 입구 */}
        <path d="M 55 90 L 60 50 L 65 90" fill="#1a1a1a" />
        <path d="M 58 70 L 60 50 L 62 70" fill="#2d2d2d" />
        {/* 지퍼 */}
        <line x1="60" y1="50" x2="60" y2="90" stroke="#FFD700" strokeWidth="1" />
        {/* 줄 */}
        <line x1="20" y1="90" x2="10" y2="95" stroke="#CCCCCC" strokeWidth="2" />
        <line x1="100" y1="90" x2="110" y2="95" stroke="#CCCCCC" strokeWidth="2" />
        {/* 말뚝 */}
        <rect x="8" y="95" width="4" height="15" fill="#8B4513" />
        <rect x="108" y="95" width="4" height="15" fill="#8B4513" />
        {/* 바닥 */}
        <ellipse cx="60" cy="95" rx="45" ry="5" fill="#228B22" opacity="0.3" />
        {/* 장식 */}
        <polygon points="60,20 62,25 60,30" fill="#FF6B6B" />
      </svg>
    ),
    christmas_tree: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 크리스마스 트리 */}
        <polygon points="60,10 30,50 40,50 20,80 50,80 45,100 75,100 70,80 100,80 80,50 90,50" fill="#228B22" />
        {/* 줄기 */}
        <rect x="52" y="100" width="16" height="15" fill="#8B4513" />
        {/* 별 (꼭대기) */}
        <polygon points="60,5 62,12 69,12 63,16 65,23 60,19 55,23 57,16 51,12 58,12" fill="#FFD700" />
        {/* 장식품들 */}
        <circle cx="60" cy="30" r="4" fill="#FF0000" />
        <circle cx="50" cy="45" r="4" fill="#4169E1" />
        <circle cx="70" cy="45" r="4" fill="#FFD700" />
        <circle cx="40" cy="62" r="4" fill="#FF69B4" />
        <circle cx="60" cy="60" r="4" fill="#00BFFF" />
        <circle cx="80" cy="62" r="4" fill="#FF6B6B" />
        <circle cx="50" cy="88" r="4" fill="#9370DB" />
        <circle cx="70" cy="88" r="4" fill="#32CD32" />
        {/* 조명 효과 */}
        <circle cx="60" cy="30" r="5" fill="#FF0000" opacity="0.3" />
        <circle cx="50" cy="45" r="5" fill="#4169E1" opacity="0.3" />
        <circle cx="70" cy="45" r="5" fill="#FFD700" opacity="0.3" />
      </svg>
    ),
    fountain: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 분수대 */}
        <ellipse cx="60" cy="100" rx="50" ry="10" fill="#87CEEB" opacity="0.3" />
        {/* 받침대 */}
        <ellipse cx="60" cy="95" rx="40" ry="8" fill="#C0C0C0" />
        <rect x="50" y="75" width="20" height="20" fill="#A9A9A9" />
        <ellipse cx="60" cy="75" rx="15" ry="6" fill="#C0C0C0" />
        {/* 중간 층 */}
        <ellipse cx="60" cy="65" rx="25" ry="6" fill="#C0C0C0" />
        <rect x="55" y="50" width="10" height="15" fill="#A9A9A9" />
        <ellipse cx="60" cy="50" rx="10" ry="4" fill="#C0C0C0" />
        {/* 물줄기 */}
        <path d="M 60 45 Q 58 35 60 25" stroke="#4169E1" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M 60 45 Q 65 35 70 30" stroke="#4169E1" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 60 45 Q 55 35 50 30" stroke="#4169E1" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        {/* 물방울 */}
        <circle cx="60" cy="20" r="2" fill="#87CEEB" opacity="0.7" />
        <circle cx="68" cy="25" r="2" fill="#87CEEB" opacity="0.7" />
        <circle cx="52" cy="25" r="2" fill="#87CEEB" opacity="0.7" />
        <circle cx="58" cy="30" r="1.5" fill="#87CEEB" opacity="0.7" />
        <circle cx="62" cy="30" r="1.5" fill="#87CEEB" opacity="0.7" />
        {/* 물받이 */}
        <ellipse cx="60" cy="68" rx="22" ry="4" fill="#87CEEB" opacity="0.5" />
        <ellipse cx="60" cy="85" rx="35" ry="6" fill="#87CEEB" opacity="0.5" />
      </svg>
    ),
    statue: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 조각상 */}
        <ellipse cx="60" cy="105" rx="35" ry="8" fill="#A9A9A9" />
        {/* 받침대 */}
        <rect x="40" y="85" width="40" height="20" fill="#808080" />
        <rect x="35" y="80" width="50" height="5" fill="#A9A9A9" />
        {/* 몸통 */}
        <rect x="50" y="45" width="20" height="35" fill="#C0C0C0" />
        {/* 팔 */}
        <rect x="35" y="50" width="15" height="25" rx="3" fill="#B0B0B0" transform="rotate(-20, 42, 62)" />
        <rect x="70" y="50" width="15" height="25" rx="3" fill="#B0B0B0" transform="rotate(20, 78, 62)" />
        {/* 머리 */}
        <circle cx="60" cy="30" r="12" fill="#C0C0C0" />
        {/* 왕관 */}
        <path d="M 48 25 L 52 18 L 56 23 L 60 16 L 64 23 L 68 18 L 72 25" fill="#FFD700" />
        <rect x="48" y="25" width="24" height="3" fill="#DAA520" />
        {/* 망토 */}
        <path d="M 50 48 Q 45 55 42 70" stroke="#8B0000" strokeWidth="8" fill="none" />
        <path d="M 70 48 Q 75 55 78 70" stroke="#8B0000" strokeWidth="8" fill="none" />
        {/* 검 (손에 들고 있음) */}
        <rect x="74" y="55" width="4" height="25" fill="#C0C0C0" transform="rotate(30, 76, 67)" />
        <polygon points="85,48 82,55 88,55" fill="#D3D3D3" transform="rotate(30, 85, 51)" />
        <rect x="72" y="78" width="8" height="4" fill="#8B4513" transform="rotate(30, 76, 80)" />
      </svg>
    ),
    rainbow: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 무지개 장식 */}
        <path d="M 10 90 Q 60 20 110 90" stroke="#FF0000" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 15 90 Q 60 28 105 90" stroke="#FFA500" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 20 90 Q 60 36 100 90" stroke="#FFD700" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 25 90 Q 60 44 95 90" stroke="#32CD32" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 30 90 Q 60 52 90 90" stroke="#4169E1" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M 35 90 Q 60 60 85 90" stroke="#9370DB" strokeWidth="8" fill="none" strokeLinecap="round" />
        {/* 구름 */}
        <ellipse cx="20" cy="90" rx="15" ry="10" fill="#FFFFFF" />
        <ellipse cx="30" cy="88" rx="12" ry="8" fill="#FFFFFF" />
        <ellipse cx="100" cy="90" rx="15" ry="10" fill="#FFFFFF" />
        <ellipse cx="90" cy="88" rx="12" ry="8" fill="#FFFFFF" />
        {/* 반짝임 */}
        <polygon points="60,15 61,18 64,18 61,20 62,23 60,21 58,23 59,20 56,18 59,18" fill="#FFD700" />
        <polygon points="45,35 46,37 48,37 46,38 47,40 45,39 43,40 44,38 42,37 44,37" fill="#FFFFFF" />
        <polygon points="75,35 76,37 78,37 76,38 77,40 75,39 73,40 74,38 72,37 74,37" fill="#FFFFFF" />
      </svg>
    ),
    gem: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 보석 장식 */}
        <defs>
          <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="50%" stopColor="#9370DB" />
            <stop offset="100%" stopColor="#4169E1" />
          </linearGradient>
          <radialGradient id="gemShine">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* 받침대 */}
        <ellipse cx="60" cy="100" rx="30" ry="8" fill="#FFD700" />
        <rect x="50" y="80" width="20" height="20" fill="#DAA520" />
        {/* 보석 */}
        <polygon points="60,20 40,50 50,80 70,80 80,50" fill="url(#gemGradient)" />
        {/* 보석 면 */}
        <polygon points="60,20 50,40 60,50" fill="#FF69B4" opacity="0.5" />
        <polygon points="60,20 70,40 60,50" fill="#4169E1" opacity="0.5" />
        <polygon points="40,50 50,80 60,70" fill="#9370DB" opacity="0.6" />
        <polygon points="80,50 70,80 60,70" fill="#4169E1" opacity="0.6" />
        {/* 반사광 */}
        <ellipse cx="55" cy="35" rx="8" ry="12" fill="url(#gemShine)" opacity="0.7" />
        <circle cx="65" cy="45" r="4" fill="#FFFFFF" opacity="0.8" />
        {/* 빛나는 효과 */}
        <polygon points="60,10 61,15 66,15 62,18 64,23 60,20 56,23 58,18 54,15 59,15" fill="#FFFFFF" opacity="0.8" />
        <polygon points="30,40 31,43 34,43 31,45 32,48 30,46 28,48 29,45 26,43 29,43" fill="#FFFFFF" />
        <polygon points="90,40 91,43 94,43 91,45 92,48 90,46 88,48 89,45 86,43 89,43" fill="#FFFFFF" />
        <polygon points="50,90 51,93 54,93 51,95 52,98 50,96 48,98 49,95 46,93 49,93" fill="#FFD700" />
      </svg>
    ),
    castle: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* 미니 성 */}
        {/* 기단 */}
        <rect x="20" y="90" width="80" height="25" fill="#808080" />
        {/* 본성 */}
        <rect x="30" y="50" width="60" height="40" fill="#A9A9A9" />
        {/* 성벽 (톱니) */}
        <rect x="30" y="45" width="10" height="5" fill="#808080" />
        <rect x="45" y="45" width="10" height="5" fill="#808080" />
        <rect x="60" y="45" width="10" height="5" fill="#808080" />
        <rect x="75" y="45" width="10" height="5" fill="#808080" />
        {/* 탑 (왼쪽) */}
        <rect x="20" y="30" width="20" height="60" fill="#A9A9A9" />
        <rect x="20" y="25" width="3" height="5" fill="#808080" />
        <rect x="25" y="25" width="3" height="5" fill="#808080" />
        <rect x="30" y="25" width="3" height="5" fill="#808080" />
        <rect x="35" y="25" width="3" height="5" fill="#808080" />
        <polygon points="15,30 30,15 45,30" fill="#8B0000" />
        {/* 탑 (오른쪽) */}
        <rect x="80" y="30" width="20" height="60" fill="#A9A9A9" />
        <rect x="82" y="25" width="3" height="5" fill="#808080" />
        <rect x="87" y="25" width="3" height="5" fill="#808080" />
        <rect x="92" y="25" width="3" height="5" fill="#808080" />
        <rect x="97" y="25" width="3" height="5" fill="#808080" />
        <polygon points="75,30 90,15 105,30" fill="#8B0000" />
        {/* 중앙 탑 */}
        <rect x="52" y="20" width="16" height="30" fill="#C0C0C0" />
        <rect x="54" y="15" width="3" height="5" fill="#808080" />
        <rect x="59" y="15" width="3" height="5" fill="#808080" />
        <rect x="64" y="15" width="3" height="5" fill="#808080" />
        <polygon points="48,20 60,5 72,20" fill="#FF0000" />
        {/* 깃발 */}
        <rect x="59" y="0" width="2" height="15" fill="#654321" />
        <polygon points="61,3 75,8 61,13" fill="#FFD700" />
        {/* 문 */}
        <rect x="52" y="70" width="16" height="20" rx="8" fill="#654321" />
        {/* 창문들 */}
        <rect x="35" y="60" width="8" height="10" fill="#4169E1" />
        <rect x="77" y="60" width="8" height="10" fill="#4169E1" />
        <rect x="56" y="30" width="8" height="10" fill="#4169E1" />
        <rect x="25" y="50" width="6" height="8" fill="#4169E1" />
        <rect x="89" y="50" width="6" height="8" fill="#4169E1" />
      </svg>
    )
  };

  return decorationTypes[type] || decorationTypes.picture;
};

export default { FaceSVG, AnimalFaceSVG, HairSVG, ClothesSVG, AccessorySVG, BackgroundSVG };
