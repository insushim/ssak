import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Dna,
  Trophy,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Brain,
} from "lucide-react";
import { api } from "../lib/api";
import { ACHIEVEMENTS, calculateLevel } from "../lib/achievements";
import { getScoreColor } from "../lib/utils";
import type { WritingDNA, ErrorPattern } from "../types";

export default function MyStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dna, setDna] = useState<WritingDNA | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    [],
  );
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [tab, setTab] = useState<"dna" | "growth" | "errors" | "achievements">(
    "dna",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getWritingDNA(user.id).catch(() => ({ dna: null })),
      api.getStudentStats(user.id).catch(() => ({
        stats: {},
        errorPatterns: [],
        monthlyStats: [],
        achievements: [],
      })),
    ])
      .then(([d, s]: any[]) => {
        setDna(d.dna);
        setStats(s.stats);
        setUnlockedAchievements(s.achievements || []);
        setErrorPatterns(s.errorPatterns || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading)
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-4xl animate-bounce-slow">🌱</div>
      </div>
    );

  return (
    <div className="page-container">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-900 dark:text-white">
            나의 글쓰기
          </h1>
        </div>
      </header>

      <div className="content-container space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {[
            { key: "dna", label: "DNA", icon: Dna },
            { key: "growth", label: "성장", icon: TrendingUp },
            { key: "errors", label: "약점", icon: AlertCircle },
            { key: "achievements", label: "업적", icon: Trophy },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                tab === t.key
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* DNA Tab */}
        {tab === "dna" && (
          <div className="space-y-4">
            {!dna ? (
              <div className="card text-center py-10 text-gray-400">
                <Dna className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>글을 3개 이상 쓰면 글쓰기 DNA가 생성돼요!</p>
              </div>
            ) : (
              <>
                <div className="card">
                  <h3 className="section-title flex items-center gap-2">
                    <Brain size={16} /> 나의 글쓰기 DNA
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {dna.totalWritings}
                      </div>
                      <div className="text-xs text-gray-500">총 글 수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(dna.vocabularyDiversity * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">어휘 다양성</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">
                        {dna.avgSentenceLength}
                      </div>
                      <div className="text-xs text-gray-500">
                        평균 문장 길이
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {dna.strengths.length}
                      </div>
                      <div className="text-xs text-gray-500">강점 수</div>
                    </div>
                  </div>
                  {dna.strengths.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        나의 강점
                      </p>
                      {dna.strengths.map((s, i) => (
                        <p
                          key={i}
                          className="text-sm text-green-600 dark:text-green-500"
                        >
                          • {s}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {dna.favoriteWords.length > 0 && (
                  <div className="card">
                    <h3 className="section-title">자주 쓰는 단어</h3>
                    <div className="flex flex-wrap gap-2">
                      {dna.favoriteWords.slice(0, 15).map((fw, i) => (
                        <span
                          key={i}
                          className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          style={{
                            fontSize: `${Math.max(11, Math.min(16, 11 + fw.count))}px`,
                          }}
                        >
                          {fw.word} ({fw.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Growth Tab */}
        {tab === "growth" && (
          <div className="space-y-4">
            {dna?.monthlyProgress && dna.monthlyProgress.length > 0 ? (
              <>
                <div className="card">
                  <h3 className="section-title flex items-center gap-2">
                    <TrendingUp size={16} /> 월별 성장
                  </h3>
                  <div className="space-y-3">
                    {dna.monthlyProgress.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-16">
                          {m.month}
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-ssak-500 h-3 rounded-full transition-all"
                              style={{ width: `${m.avg_score}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium w-12 text-right ${getScoreColor(m.avg_score)}`}
                        >
                          {Math.round(m.avg_score)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {dna.monthlyProgress.length >= 2 &&
                  (() => {
                    const recent = dna.monthlyProgress[
                      dna.monthlyProgress.length - 1
                    ] as any;
                    const prev = dna.monthlyProgress[
                      dna.monthlyProgress.length - 2
                    ] as any;
                    const scoreDiff = Math.round(
                      recent.avg_score - prev.avg_score,
                    );
                    return (
                      <div
                        className={`card ${scoreDiff >= 0 ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-orange-200 bg-orange-50 dark:bg-orange-900/20"}`}
                      >
                        <p className="text-sm">
                          {scoreDiff >= 0
                            ? `지난달보다 평균 점수가 ${scoreDiff}점 올랐어요! 잘하고 있어요!`
                            : `지난달보다 평균 점수가 ${Math.abs(scoreDiff)}점 내렸어요. 더 연습해볼까요?`}
                        </p>
                      </div>
                    );
                  })()}
              </>
            ) : (
              <div className="card text-center py-10 text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>글을 더 쓰면 성장 그래프가 나타나요!</p>
              </div>
            )}
          </div>
        )}

        {/* Errors Tab */}
        {tab === "errors" && (
          <div className="space-y-4">
            {errorPatterns.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>아직 발견된 오류 패턴이 없어요!</p>
              </div>
            ) : (
              <>
                {errorPatterns.slice(0, 5).map((ep, i) => (
                  <div key={i} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {ep.pattern_type}
                      </span>
                      <span className="badge-red">{ep.count}회</span>
                    </div>
                    {ep.pattern_detail && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {ep.pattern_detail}
                      </p>
                    )}
                    {ep.last_example && (
                      <p className="text-xs text-gray-400 mt-1">
                        최근 예: "{ep.last_example}"
                      </p>
                    )}
                  </div>
                ))}
                <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    반복되는 실수를 의식하면 고칠 수 있어요. 글을 쓸 때 위
                    패턴에 주의해보세요!
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {tab === "achievements" && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title mb-0">업적</h3>
                <span className="text-sm text-gray-500">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = unlockedAchievements.includes(a.id);
                  return (
                    <motion.div
                      key={a.id}
                      whileHover={{ scale: 1.05 }}
                      className={`rounded-xl p-3 text-center transition ${
                        unlocked
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                          : "bg-gray-50 dark:bg-gray-800 opacity-50"
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {unlocked ? a.icon : "🔒"}
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {a.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {a.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
