import { useState, useEffect, useCallback, memo } from 'react';
import { RARITY_CONFIG } from '../../config/shopItems';
import RarityBadge from './RarityBadge';

/**
 * 아이템 구매 리빌 모달
 * Fortnite/Genshin 스타일 언박싱 연출
 */
const ItemRevealModal = memo(({ item, onClose, onEquip }) => {
  const [phase, setPhase] = useState('buildup'); // buildup → reveal → details
  const rarity = item?.rarity || 'common';
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  useEffect(() => {
    if (!item) return;
    // 빌드업 → 리빌 → 디테일 시퀀스
    const t1 = setTimeout(() => setPhase('reveal'), 600);
    const t2 = setTimeout(() => setPhase('details'), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [item]);

  const handleClose = useCallback(() => {
    setPhase('buildup');
    onClose();
  }, [onClose]);

  if (!item) return null;

  // 빌드업 배경색
  const bgClass = `reveal-bg-${rarity}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleClose}
    >
      {/* 오버레이 */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        phase === 'buildup' ? 'bg-black/80' : 'bg-black/60'
      }`} />

      {/* 메인 컨텐츠 */}
      <div
        className="relative z-10 flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* 글로우 배경 */}
        {phase !== 'buildup' && (
          <div
            className={`absolute inset-0 rounded-full blur-3xl opacity-40 ${bgClass}`}
            style={{ width: 300, height: 300, transform: 'translate(-50%, -50%)', top: '40%', left: '50%' }}
          />
        )}

        {/* 빌드업: 빛나는 원 */}
        {phase === 'buildup' && (
          <div className="w-32 h-32 rounded-full bg-white/20 animate-ping" />
        )}

        {/* 리빌: 아이템 표시 */}
        {phase !== 'buildup' && (
          <div className="flex flex-col items-center gap-4 reveal-bounce">
            {/* 아이템 아이콘 */}
            <div
              className={`w-32 h-32 rounded-2xl flex items-center justify-center ${bgClass} reveal-glow
                ${config.shimmer ? 'shimmer-effect' : ''}
                ${config.particles ? 'particle-container' : ''}`}
              style={{ '--bg': 'transparent' }}
            >
              <span className="text-6xl drop-shadow-lg">{item.emoji || '🎁'}</span>
            </div>

            {/* 레어리티 라인 */}
            <div className="flex items-center gap-2">
              <div className="h-px w-8" style={{ backgroundColor: config.color }} />
              <RarityBadge rarity={rarity} size="md" />
              <div className="h-px w-8" style={{ backgroundColor: config.color }} />
            </div>
          </div>
        )}

        {/* 디테일: 이름, 설명, 버튼 */}
        {phase === 'details' && (
          <div className="mt-4 text-center animate-fade-in space-y-3" style={{ animation: 'revealBounce 0.4s ease forwards' }}>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{item.name}</h2>
            {item.description && (
              <p className="text-white/70 text-sm max-w-xs">{item.description}</p>
            )}

            {/* 세트 표시 */}
            {item.setId && (
              <div className="text-xs text-white/50 flex items-center gap-1 justify-center">
                <span>세트 아이템</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {onEquip && (
                <button
                  onClick={() => { onEquip(item); handleClose(); }}
                  className="px-6 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-xl"
                >
                  바로 장착
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-white/20 text-white rounded-xl font-medium text-sm hover:bg-white/30 transition-all backdrop-blur"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ItemRevealModal.displayName = 'ItemRevealModal';
export default ItemRevealModal;
