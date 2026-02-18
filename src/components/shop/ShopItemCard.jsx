import { memo } from 'react';
import { RARITY_CONFIG } from '../../config/shopItems';
import RarityBadge from './RarityBadge';

/**
 * 상점 아이템 카드 - 희귀도 비주얼 강화
 * 글로우, 시머, 파티클 이펙트 포함
 */
const ShopItemCard = memo(({
  item,
  owned,
  equipped,
  previewing,
  points,
  onPreview,
  onEquip,
  onPurchase,
  renderPreview
}) => {
  const rarity = item.rarity || 'common';
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  // 글로우 클래스
  const glowClass = config.glow ? `rarity-glow-${rarity}` : '';
  // 시머 클래스
  const shimmerClass = config.shimmer && !owned ? 'shimmer-effect' : '';
  // 파티클 클래스
  const particleClass = config.particles && !owned ? 'particle-container' : '';

  // 카드 배경 & 보더
  const cardBg = equipped
    ? 'border-blue-500 bg-blue-50/80'
    : owned
    ? 'border-emerald-300 bg-emerald-50/50'
    : previewing
    ? 'border-purple-400 bg-purple-50/50'
    : `${config.borderClass} bg-white hover:bg-gray-50/80`;

  return (
    <div
      className={`relative rounded-xl border-2 p-3 transition-all shop-item-card ${cardBg} ${glowClass} ${shimmerClass} ${particleClass}`}
      style={{ '--bg': equipped ? '#eff6ff' : owned ? '#f0fdf4' : '#ffffff' }}
    >
      {/* 레어리티 스트라이프 */}
      <div className={`rarity-stripe rarity-stripe-${rarity}`} />

      {/* 상태 뱃지 */}
      {equipped && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md z-10">
          착용중
        </div>
      )}
      {owned && !equipped && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md z-10">
          보유
        </div>
      )}

      {/* 세트 아이콘 */}
      {item.setId && (
        <div className="absolute top-1 left-1 text-[10px] bg-white/80 backdrop-blur px-1 py-0.5 rounded text-gray-500" title="세트 아이템">
          🧩
        </div>
      )}

      {/* 아이템 프리뷰 */}
      <div className="flex justify-center mb-2 h-12 items-center">
        {renderPreview ? renderPreview(item) : (
          <span className="text-3xl">{item.emoji || '🎁'}</span>
        )}
      </div>

      {/* 정보 */}
      <div className="text-center space-y-0.5">
        <p className="font-semibold text-gray-800 text-xs truncate">{item.name}</p>

        {/* 희귀도 + 가격 */}
        <div className="flex items-center justify-center gap-1">
          <RarityBadge rarity={rarity} size="xs" showLabel={false} />
          {!owned && (
            <span className={`text-xs font-bold ${item.price === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.price === 0 ? '무료' : `${item.price.toLocaleString()}P`}
            </span>
          )}
        </div>
      </div>

      {/* 설명 툴팁 (있으면) */}
      {item.description && (
        <p className="text-[10px] text-gray-400 text-center mt-1 truncate" title={item.description}>
          {item.description}
        </p>
      )}

      {/* 버튼 */}
      <div className="mt-2 space-y-1">
        {/* 미리보기 */}
        <button
          onClick={() => onPreview(item)}
          className={`w-full py-1 text-[11px] font-medium rounded-lg transition-all ${
            previewing
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          }`}
        >
          {previewing ? '👀 미리보기중' : '👀 미리보기'}
        </button>

        {/* 장착 / 구매 */}
        {owned ? (
          <button
            onClick={() => onEquip(item)}
            disabled={equipped}
            className={`w-full py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              equipped
                ? 'bg-blue-100 text-blue-500 cursor-default'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md'
            }`}
          >
            {equipped ? '✓ 착용중' : '장착'}
          </button>
        ) : (
          <button
            onClick={() => onPurchase(item)}
            disabled={points < item.price}
            className={`w-full py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              points >= item.price
                ? `bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md ${
                    rarity === 'legendary' || rarity === 'mythic' ? 'animate-pulse' : ''
                  }`
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {item.price === 0 ? '무료 획득' : '구매'}
          </button>
        )}
      </div>
    </div>
  );
});

ShopItemCard.displayName = 'ShopItemCard';
export default ShopItemCard;
