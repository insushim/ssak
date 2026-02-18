import { useState, useMemo, useCallback, memo } from 'react';
import {
  AVATAR_ITEMS, ROOM_ITEMS, SHOP_CATEGORIES, CATEGORY_NAMES, CATEGORY_ICONS,
  RARITY_CONFIG, ITEM_SETS, AVATAR_CATEGORY_MAP, ROOM_CATEGORY_MAP,
  getSetProgress, getCollectionStats
} from '../../config/shopItems';
import ShopItemCard from './ShopItemCard';
import CollectionBook from './CollectionBook';
import ItemRevealModal from './ItemRevealModal';
import RarityBadge from './RarityBadge';
import '../../styles/avatar-effects.css';

// 마이룸 SVG 타입 매핑
const ROOM_SVG_TYPE_MAP = {
  furniture: { furn1: 'sofa', furn2: 'bed', furn3: 'chair', furn4: 'desk', furn5: 'bookshelf', furn6: 'desk', furn7: 'chair', furn8: 'sofa', furn9: 'bed', furn10: 'throne' },
  electronics: { elec1: 'tv', elec2: 'computer', elec3: 'gameConsole', elec4: 'speaker', elec5: 'aircon', elec6: 'bigTv', elec7: 'homeTheater', elec8: 'aiRobot', elec9: 'vr' },
  vehicles: { car1: 'car', car2: 'suv', car3: 'sportsCar', car4: 'camper', car5: 'motorcycle', car6: 'helicopter', car7: 'yacht', car8: 'privateJet', car9: 'rocket' },
  pets: { pet1: 'dog', pet2: 'cat', pet3: 'hamster', pet4: 'rabbit', pet5: 'parrot', pet6: 'fish', pet7: 'fox', pet8: 'unicorn', pet9: 'dragon', pet10: 'eagle' },
  decorations: { deco1: 'painting', deco2: 'plant', deco3: 'trophy', deco4: 'tent', deco5: 'christmasTree', deco6: 'fountain', deco7: 'statue', deco8: 'rainbow', deco9: 'gem', deco10: 'castle' }
};

/**
 * 프리미엄 아바타 상점 컴포넌트
 * StudentDashboard에서 상점 영역을 대체
 */
const AvatarShop = memo(({
  // 데이터
  ownedItems = [],
  equippedItems = {},
  roomItems = {},
  points = 0,
  stats = {},
  // 핸들러
  onPurchase,
  onEquipAvatar,
  onEquipRoom,
  onPreviewAvatar,
  onPreviewRoom,
  previewItem,
  previewRoomItem,
  // 마이룸 SVG 컴포넌트
  RoomSVGComponents
}) => {
  const [shopCategory, setShopCategory] = useState('avatar');
  const [activeTab, setActiveTab] = useState('faces');
  const [sortBy, setSortBy] = useState('default'); // default | price | rarity
  const [filterRarity, setFilterRarity] = useState('all');
  const [showCollection, setShowCollection] = useState(false);
  const [revealItem, setRevealItem] = useState(null);

  const collectionStats = useMemo(() => getCollectionStats(ownedItems), [ownedItems]);

  // 현재 표시할 아이템 목록
  const shopItems = useMemo(() => {
    const items = shopCategory === 'avatar'
      ? AVATAR_ITEMS[activeTab] || []
      : ROOM_ITEMS[activeTab] || [];

    let filtered = [...items];

    // 희귀도 필터
    if (filterRarity !== 'all') {
      filtered = filtered.filter(i => (i.rarity || 'common') === filterRarity);
    }

    // 정렬
    if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rarity') {
      filtered.sort((a, b) =>
        (RARITY_CONFIG[b.rarity || 'common']?.order || 0) -
        (RARITY_CONFIG[a.rarity || 'common']?.order || 0)
      );
    }

    return filtered;
  }, [shopCategory, activeTab, sortBy, filterRarity]);

  // 현재 활성 세트
  const activeSets = useMemo(() => {
    return Object.values(ITEM_SETS)
      .filter(set => set.items.some(id =>
        shopItems.some(item => item.id === id)
      ))
      .map(set => ({
        ...set,
        progress: getSetProgress(set.id, ownedItems)
      }));
  }, [shopItems, ownedItems]);

  // 아이템 장착 확인
  const isEquipped = useCallback((item) => {
    if (shopCategory === 'avatar') {
      return equippedItems[AVATAR_CATEGORY_MAP[activeTab]] === item.id;
    }
    if (activeTab === 'decorations') {
      return (roomItems.decorations || []).includes(item.id);
    }
    return roomItems[ROOM_CATEGORY_MAP[activeTab]] === item.id;
  }, [shopCategory, activeTab, equippedItems, roomItems]);

  // 구매 핸들러 (리빌 애니메이션 포함)
  const handlePurchase = useCallback((item) => {
    if (ownedItems.includes(item.id)) return;
    if (points < item.price) return;

    const rarity = item.rarity || 'common';
    const config = RARITY_CONFIG[rarity];

    // Rare 이상이면 리빌 애니메이션
    if (config && config.order >= 2) {
      // 먼저 구매 실행
      onPurchase(item, activeTab, () => {
        setRevealItem(item);
      });
    } else {
      onPurchase(item, activeTab);
    }
  }, [ownedItems, points, activeTab, onPurchase]);

  // 장착 핸들러
  const handleEquip = useCallback((item) => {
    if (shopCategory === 'avatar') {
      onEquipAvatar(item, activeTab);
    } else {
      onEquipRoom(item, activeTab);
    }
  }, [shopCategory, activeTab, onEquipAvatar, onEquipRoom]);

  // 미리보기 핸들러
  const handlePreview = useCallback((item) => {
    if (shopCategory === 'avatar') {
      onPreviewAvatar(item, activeTab);
    } else {
      onPreviewRoom(item, activeTab);
    }
  }, [shopCategory, activeTab, onPreviewAvatar, onPreviewRoom]);

  // 아이템 프리뷰 렌더러
  const renderItemPreview = useCallback((item) => {
    if (shopCategory === 'room' && RoomSVGComponents) {
      const svgMap = ROOM_SVG_TYPE_MAP[activeTab];
      const svgType = svgMap?.[item.id];
      if (svgType) {
        const Component = RoomSVGComponents[activeTab];
        if (Component) return <Component type={svgType} size={40} />;
      }
    }

    // 색상 프리뷰 (벽지)
    if (item.color && typeof item.color === 'string' && item.color.includes('#')) {
      const colors = item.color.split(', ');
      const bg = colors.length === 3
        ? `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
        : `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1] || colors[0]} 100%)`;
      return <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ background: bg }} />;
    }

    // 프레임 프리뷰
    if (item.style) {
      return <div className={`w-10 h-10 rounded-full bg-gray-100 ${item.style}`} />;
    }

    // 배경 프리뷰
    if (item.color && !item.color.includes('#')) {
      return <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color}`} />;
    }

    // 헤어 컬러 프리뷰
    if (activeTab === 'hairColor' && item.color) {
      return (
        <div className="w-10 h-10 rounded-full border-2 border-gray-200" style={{ background: item.color }} />
      );
    }

    // 기본 이모지
    return <span className="text-3xl">{item.emoji || '🎁'}</span>;
  }, [shopCategory, activeTab, RoomSVGComponents]);

  const subcategories = shopCategory === 'avatar'
    ? SHOP_CATEGORIES.avatar.subcategories
    : SHOP_CATEGORIES.room.subcategories;

  return (
    <>
      <div className="bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl border border-blue-100 overflow-hidden">
        {/* ── 헤더 ── */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm shadow-md">
                🛒
              </span>
              상점
            </h3>

            <div className="flex items-center gap-2">
              {/* 컬렉션 버튼 */}
              <button
                onClick={() => setShowCollection(!showCollection)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showCollection
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                📚 컬렉션 {collectionStats.owned}/{collectionStats.total}
              </button>

              {/* 포인트 */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-1">
                <span className="text-amber-500 text-sm">💎</span>
                <span className="text-sm font-bold text-amber-700">{points.toLocaleString()}P</span>
              </div>
            </div>
          </div>

          {/* 대분류 탭 */}
          <div className="flex gap-2">
            <button
              onClick={() => { setShopCategory('avatar'); setActiveTab('faces'); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                shopCategory === 'avatar'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg tab-active-glow'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              👤 아바타
            </button>
            <button
              onClick={() => { setShopCategory('room'); setActiveTab('furniture'); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                shopCategory === 'room'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg tab-active-glow'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🏠 마이룸
            </button>
          </div>
        </div>

        {/* ── 컬렉션 북 (토글) ── */}
        {showCollection && (
          <div className="p-4 border-b border-blue-100">
            <CollectionBook
              ownedItems={ownedItems}
              stats={stats}
              onClose={() => setShowCollection(false)}
            />
          </div>
        )}

        {/* ── 서브카테고리 + 필터 ── */}
        <div className="px-4 pt-3">
          {/* 서브카테고리 탭 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {subcategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  activeTab === cat
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-[11px]">{CATEGORY_ICONS[cat]}</span>
                {CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>

          {/* 필터 & 정렬 바 */}
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            {/* 희귀도 필터 */}
            <div className="flex gap-1 flex-1 flex-wrap">
              <button
                onClick={() => setFilterRarity('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  filterRarity === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFilterRarity(filterRarity === key ? 'all' : key)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-0.5 ${
                    filterRarity === key ? `${cfg.badgeBg} shadow-sm` : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {cfg.name}
                </button>
              ))}
            </div>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-[10px] bg-gray-100 border-0 rounded px-2 py-1 text-gray-600 focus:ring-1 focus:ring-blue-300"
            >
              <option value="default">기본순</option>
              <option value="price">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
              <option value="rarity">희귀도순</option>
            </select>
          </div>
        </div>

        {/* ── 활성 세트 배너 ── */}
        {activeSets.length > 0 && (
          <div className="px-4 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-2 shop-scrollbar">
              {activeSets.map(set => {
                const cfg = RARITY_CONFIG[set.rarity] || RARITY_CONFIG.common;
                return (
                  <div
                    key={set.id}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      set.progress.complete
                        ? `${cfg.borderClass} bg-gradient-to-r ${cfg.bgClass}`
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span>{set.icon}</span>
                    <span className="font-medium text-gray-700">{set.name}</span>
                    <span className={`font-bold ${set.progress.complete ? 'text-green-600' : 'text-gray-400'}`}>
                      {set.progress.owned}/{set.progress.total}
                    </span>
                    {set.progress.complete && <span className="text-green-500">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 아이템 그리드 ── */}
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1 shop-scrollbar">
            {shopItems.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                owned={ownedItems.includes(item.id)}
                equipped={isEquipped(item)}
                previewing={
                  shopCategory === 'avatar'
                    ? previewItem?.item?.id === item.id
                    : previewRoomItem?.item?.id === item.id
                }
                points={points}
                onPreview={handlePreview}
                onEquip={handleEquip}
                onPurchase={handlePurchase}
                renderPreview={renderItemPreview}
              />
            ))}
          </div>

          {/* 빈 상태 */}
          {shopItems.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm">해당 조건의 아이템이 없습니다</p>
              <button
                onClick={() => setFilterRarity('all')}
                className="mt-2 text-xs text-blue-500 hover:text-blue-600"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>

        {/* ── 하단 정보 ── */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>보유 {ownedItems.length}개</span>
            <span className="text-gray-300">|</span>
            <span>수집률 {Math.round((collectionStats.owned / collectionStats.total) * 100)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Object.entries(RARITY_CONFIG).slice(2).map(([key, cfg]) => (
              <span key={key} className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} title={cfg.name} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 리빌 모달 ── */}
      {revealItem && (
        <ItemRevealModal
          item={revealItem}
          onClose={() => setRevealItem(null)}
          onEquip={(item) => handleEquip(item)}
        />
      )}
    </>
  );
});

AvatarShop.displayName = 'AvatarShop';
export default AvatarShop;
