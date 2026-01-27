import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Wand2, Zap, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* 마법 효과 배경 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 반짝이는 별들 */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-300/50"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-yellow-200 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"></div>

        {/* 마법 빛줄기 */}
        <div className="absolute top-0 left-1/4 w-px h-40 bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
        <div className="absolute top-10 right-1/3 w-px h-32 bg-gradient-to-b from-yellow-400/30 to-transparent"></div>
        <div className="absolute bottom-0 right-1/4 w-px h-48 bg-gradient-to-t from-blue-400/40 to-transparent"></div>
      </div>

      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* 왼쪽 브랜딩 영역 */}
        <div className="hidden md:block text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative inline-block">
              {/* 메인 로고 */}
              <span className="text-6xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-2xl" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                싹
              </span>
              {/* 붓 터치 효과 - 날렵하게 올라가는 선 */}
              <svg className="absolute -top-2 -right-6 w-12 h-16" viewBox="0 0 48 64" fill="none">
                {/* 메인 스우시 라인 */}
                <path
                  d="M8 56 Q12 48, 16 36 Q20 24, 28 14 Q34 6, 44 2"
                  stroke="url(#brushGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  className="drop-shadow-lg"
                />
                {/* 그라데이션 정의 */}
                <defs>
                  <linearGradient id="brushGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#67e8f9" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
              {/* 끝 부분 반짝임 */}
              <span className="absolute -top-4 right-[-30px] text-2xl animate-pulse filter drop-shadow-lg" style={{ textShadow: '0 0 10px #fef08a, 0 0 20px #fef08a, 0 0 30px #fef08a' }}>✨</span>
              {/* 추가 작은 반짝임들 */}
              <span className="absolute -top-1 right-[-18px] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></span>
              <span className="absolute top-2 right-[-26px] w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></span>
            </div>
            {/* SSAK 영문 */}
            <span className="text-2xl font-bold tracking-widest text-cyan-200 opacity-80 ml-4">SSAK</span>
          </div>

          <h1 className="text-3xl font-bold leading-tight">
            당신의 글을 빛내는
            <br />
            <span className="text-cyan-300">AI 첨삭 마법</span>
          </h1>

          <p className="text-blue-100 leading-relaxed text-sm">
            마법처럼 빠르고 정확한 AI 피드백으로
            <br />
            학생들의 글쓰기 실력을 빛나게 만들어요.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-cyan-300" />
              </span>
              <span>AI 첨삭</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-300" />
              </span>
              <span>즉시 피드백</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </span>
              <span>실력 향상</span>
            </div>
          </div>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-900/20 border border-white/20">
          <div className="text-center mb-6">
            {/* 모바일용 로고 */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-4">
              <div className="relative inline-block">
                <span className="text-4xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  싹
                </span>
                <svg className="absolute -top-1 -right-4 w-8 h-10" viewBox="0 0 48 64" fill="none">
                  <path
                    d="M8 56 Q12 48, 16 36 Q20 24, 28 14 Q34 6, 44 2"
                    stroke="url(#brushGradientMobile)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="brushGradientMobile" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#facc15" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute -top-2 right-[-20px] text-lg animate-pulse">✨</span>
              </div>
              <span className="text-lg font-bold tracking-widest text-blue-400 ml-4">SSAK</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
            <p className="mt-2 text-sm text-gray-500">글쓰기 마법의 세계로 들어가세요</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <span>로그인</span>
                  <span>✨</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                계정이 없으신가요? <span className="underline">가입하기</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
