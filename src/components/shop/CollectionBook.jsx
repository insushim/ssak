import { useState, useMemo, memo } from 'react';
import {
  ITEM_SETS, ACHIEVEMENT_ITEMS, RARITY_CONFIG,
  getSetProgress, getCollectionStats, checkAchievementCondition, findItemById
} from '../../config/shopItems';
import RarityBadge from './RarityBadge';

/**
 * 컬렉션 북 - 세트 & 업적 & 통계
 * Duolingo 리그 + Fortnite 배틀패스 영감
 */
const CollectionBook = memo(({ ownedItems = [], stats = {}, onClose }) => {
  const [tab, setTab] = useState('sets'); // sets | achievements | stats

  const collectionStats = useMemo(
    () => getCollectionStats(ownedItems), [ownedItems]
  );

  const setEntries = useMemo(() =>
    Object.values(ITEM_SETS).map(set => ({
      ...set,
      progress: getSetProgress(set.id, ownedItems)
    }))
  , [ownedItems]);

  const achievementEntries = useMemo(() =>
    ACHIEVEMENT_ITEMS.map(ach => ({
      ...ach,
      unlocked: checkAchievementCondition(ach.condition, stats),
      owned: ownedItems.includes(ach.id)
    }))
  , [ownedItems, stats]);

  const completedSets = setEntries.filter(s => s.progress.complete).length;
  const unlockedAchievements = achievementEntries.filter(a => a.unlocked).length;

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              📚 컬렉션 북
            </h3>
            <p className="text-white/80 text-xs mt-1">
              {collectionStats.owned}/{collectionStats.total} 수집 · 세트 {completedSets}/{collectionStats.totalSets} 완성
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mt-3">
          {[
            { id: 'sets', label: '세트', count: completedSets },
            { id: 'achievements', label: '업적', count: unlockedAchievements },
            { id: 'stats', label: '통계', count: null }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-white/25 text-white shadow-inner'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="p-4 max-h-[400px] overflow-y-auto shop-scrollbar">
        {/* 세트 탭 */}
        {tab === 'sets' && (
          <div className="space-y-3">
            {setEntries.map(set => {
              const progress = set.progress;
              const pct = Math.round((progress.owned / progress.total) * 100);
              const config = RARITY_CONFIG[set.rarity] || RARITY_CONFIG.common;

              return (
                <div
                  key={set.id}
                  className={`relative rounded-xl border-2 p-3 transition-all ${
                    progress.complete
                      ? `${config.borderClass} bg-gradient-to-r ${config.bgClass}`
                      : 'border-gray-200 bg-white'
                  } ${progress.complete ? 'set-complete-celebration' : ''}`}
                >
                  {/* 레어리티 스트라이프 */}
                  <div className={`rarity-stripe rarity-stripe-${set.rarity}`} />

                  <div className="flex items-start gap-3 mt-1">
                    {/* 아이콘 */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      progress.complete ? 'bg-white/50' : 'bg-gray-100'
                    }`}>
                      {set.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900">{set.name}</h4>
                        <RarityBadge rarity={set.rarity} size="xs" />
                        {progress.complete && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">완성!</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{set.description}</p>

                      {/* 진행률 바 */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${config.gradientFrom}, ${config.gradientTo})`
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{progress.owned}/{progress.total}</span>
                      </div>

                      {/* 아이템 목록 */}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {progress.items.map(({ id, owned }) => {
                          const itemData = findItemById(id);
                          return (
                            <div
                              key={id}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-all ${
                                owned
                                  ? 'bg-white border-gray-300 shadow-sm'
                                  : 'bg-gray-100 border-gray-200 opacity-40 grayscale'
                              }`}
                              title={itemData?.name || id}
                            >
                              {itemData?.emoji || '?'}
                            </div>
                          );
                        })}
                      </div>

                      {/* 보너스 */}
                      {progress.complete && (
                        <div className="mt-2 text-xs font-medium" style={{ color: config.color }}>
                          +{set.bonusPoints}P 보너스 획득!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 업적 탭 */}
        {tab === 'achievements' && (
          <div className="space-y-2">
            {achievementEntries.map(ach => {
              const config = RARITY_CONFIG[ach.rarity] || RARITY_CONFIG.common;
              return (
                <div
                  key={ach.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    ach.unlocked
                      ? `${config.borderClass} bg-gradient-to-r ${config.bgClass}`
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  } ${ach.unlocked && !ach.owned ? 'achievement-unlock' : ''}`}
                >
                  {/* 아이콘 */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    ach.unlocked ? 'bg-white/60' : 'bg-gray-200 grayscale'
                  }`}>
                    {ach.unlocked ? ach.emoji : '🔒'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-gray-900">{ach.name}</h4>
                      <RarityBadge rarity={ach.rarity} size="xs" />
                    </div>
                    <p className="text-[11px] text-gray-500">{ach.description}</p>
                  </div>

                  {ach.unlocked ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : (
                    <span className="text-gray-400 text-xs">미달성</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 통계 탭 */}
        {tab === 'stats' && (
          <div className="space-y-4">
            {/* 전체 수집률 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
              <h4 className="font-bold text-sm text-gray-900 mb-2">전체 수집률</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                    style={{ width: `${Math.round((collectionStats.owned / collectionStats.total) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-indigo-600">
                  {Math.round((collectionStats.owned / collectionStats.total) * 100)}%
                </span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>아바타: {collectionStats.ownedAvatar}/{collectionStats.totalAvatar}</span>
                <span>마이룸: {collectionStats.ownedRoom}/{collectionStats.totalRoom}</span>
              </div>
            </div>

            {/* 희귀도별 통계 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-3">희귀도별 수집</h4>
              <div className="space-y-2">
                {Object.entries(RARITY_CONFIG).map(([key, cfg]) => {
                  const data = collectionStats.byRarity[key] || { total: 0, owned: 0 };
                  if (data.total === 0) return null;
                  const pct = Math.round((data.owned / data.total) * 100);
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-12 text-right">
                        <span className={`text-[10px] font-bold ${cfg.textClass}`}>{cfg.name}</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 w-12">
                        {data.owned}/{data.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 세트 진행 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-2">세트 완성</h4>
              <div className="text-3xl font-black text-center text-indigo-600">
                {completedSets}<span className="text-lg text-gray-400">/{collectionStats.totalSets}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CollectionBook.displayName = 'CollectionBook';
export default CollectionBook;
