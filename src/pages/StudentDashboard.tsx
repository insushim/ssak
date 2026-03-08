import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { motion } from "framer-motion";
import {
  PenLine,
  BarChart3,
  Trophy,
  BookOpen,
  LogOut,
  Flame,
  Star,
  ChevronRight,
  Dna,
  Settings,
} from "lucide-react";
import { api } from "../lib/api";
import { calculateLevel } from "../lib/achievements";
import { formatRelativeDate, getScoreColor, truncate } from "../lib/utils";
import type { Writing } from "../types";

export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api
        .getWritings({ student_id: user.id, limit: 10 })
        .catch(() => ({ writings: [] })),
      api.getStudentStats(user.id).catch(() => ({
        stats: { totalWritings: 0, avgScore: 0, maxScore: 0 },
        errorPatterns: [],
        monthlyStats: [],
        achievements: [],
      })),
    ])
      .then(([w, s]) => {
        setWritings(w.writings);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const level = user ? calculateLevel(user.points) : calculateLevel(0);

  const handleJoinClass = async () => {
    if (!joinCode || joinCode.length < 4) return;
    setJoinError("");
    try {
      await api.joinClass(joinCode);
      await updateUser({ class_code: joinCode } as any);
      setShowJoinClass(false);
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-4xl animate-bounce-slow">🌱</div>
      </div>
    );
  }

  return (
    <div className="page-container pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{level.icon}</span>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-xs text-gray-500">
                Lv.{level.level} {level.name} · {user?.points}P
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/stats")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <BarChart3
                size={20}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="content-container space-y-6">
        {/* Level Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">다음 레벨까지</span>
            <span className="text-sm font-medium text-ssak-600">
              {Math.round(level.progress * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <motion.div
              className="bg-ssak-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${level.progress * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {user?.points} / {level.nextLevelPoints}P
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-2xl font-bold text-ssak-600">
              {stats?.stats?.totalWritings || 0}
            </div>
            <div className="text-xs text-gray-500">총 글</div>
          </div>
          <div className="card text-center">
            <div
              className={`text-2xl font-bold ${getScoreColor(stats?.stats?.avgScore || 0)}`}
            >
              {stats?.stats?.avgScore || 0}
            </div>
            <div className="text-xs text-gray-500">평균 점수</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={18} className="text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">
                {user?.streak_days || 0}
              </span>
            </div>
            <div className="text-xs text-gray-500">연속</div>
          </div>
        </div>

        {/* Class Code */}
        {!user?.class_code && (
          <div className="card border-dashed border-2 border-ssak-300">
            {showJoinClass ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="input-field text-center text-lg tracking-widest"
                  placeholder="학급 코드"
                  maxLength={6}
                />
                {joinError && (
                  <p className="text-sm text-red-500">{joinError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowJoinClass(false)}
                    className="btn-secondary flex-1"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleJoinClass}
                    className="btn-primary flex-1"
                  >
                    가입
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowJoinClass(true)}
                className="w-full text-center py-2"
              >
                <UsersIcon className="w-6 h-6 mx-auto text-ssak-500 mb-1" />
                <p className="text-sm text-ssak-600 font-medium">
                  학급 코드로 참가하기
                </p>
              </button>
            )}
          </div>
        )}

        {/* Write Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/write")}
          className="w-full card bg-ssak-600 border-ssak-600 text-white hover:bg-ssak-700 transition flex items-center justify-center gap-3 py-5"
        >
          <PenLine size={24} />
          <span className="text-lg font-bold">글쓰기 시작</span>
        </motion.button>

        {/* Recent Writings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">최근 글</h2>
            <Link
              to="/stats"
              className="text-sm text-ssak-600 flex items-center gap-1"
            >
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          {writings.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>아직 작성한 글이 없어요.</p>
              <p className="text-sm mt-1">첫 글을 써보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {writings.slice(0, 5).map((w) => (
                <Link
                  key={w.id}
                  to={`/result/${w.id}`}
                  className="card flex items-center justify-between hover:shadow-md transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {w.topic || truncate(w.content, 30)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatRelativeDate(w.submitted_at || w.created_at)}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ml-3 ${getScoreColor(w.score_total)}`}
                  >
                    {w.score_total}점
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/stats"
            className="card flex items-center gap-3 hover:shadow-md transition"
          >
            <Dna size={20} className="text-purple-500" />
            <span className="text-sm font-medium">글쓰기 DNA</span>
          </Link>
          <Link
            to="/stats#achievements"
            className="card flex items-center gap-3 hover:shadow-md transition"
          >
            <Trophy size={20} className="text-yellow-500" />
            <span className="text-sm font-medium">
              업적 {stats?.achievements?.length || 0}개
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
