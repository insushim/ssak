import { memo } from 'react';
import { RARITY_CONFIG } from '../../config/shopItems';

/**
 * 희귀도 뱃지 컴포넌트
 * 아이템 카드 및 상세에서 사용
 */
const RarityBadge = memo(({ rarity, size = 'sm', showLabel = true }) => {
  const config = RARITY_CONFIG[rarity];
  if (!config || rarity === 'common') return null;

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClasses[size]} ${config.badgeBg}`}
      style={{ letterSpacing: '0.02em' }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {showLabel && config.name}
    </span>
  );
});

RarityBadge.displayName = 'RarityBadge';
export default RarityBadge;
