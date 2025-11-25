import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-600 to-sky-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full grid md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:block text-white space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-100">Isw Writing Lab</p>
          <h1 className="text-4xl font-extrabold leading-tight drop-shadow-sm">
            Isw 글쓰기 도우미
          </h1>
          <p className="text-base text-indigo-100 leading-relaxed">
            아이디어를 현실로 만들고 AI 피드백을 받아보세요. 학생의 잠재력을 깨우는
            최적의 글쓰기 플랫폼입니다.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Isw 글쓰기 도우미</h2>
            <p className="mt-2 text-sm text-gray-600">AI와 함께 더 나은 글을, 빠르게 작성하세요.</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-500 to-sky-500 hover:from-indigo-500 hover:via-purple-400 hover:to-sky-400 shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:bg-gray-400"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                계정이 없으신가요? 가입하기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}