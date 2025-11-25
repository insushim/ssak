import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { ROLES } from "../config/auth";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (!formData.role) {
      setError("역할을 선택해 주세요.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(formData.email, formData.password, formData.role, {
        name: formData.name
      });

      if (formData.role === ROLES.TEACHER) {
        alert("회원가입이 완료되었습니다. 관리자의 승인 후 이용 가능합니다.");
      } else {
        alert("회원가입이 완료되었습니다.");
      }

      navigate("/login");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else {
        setError(err.message || "회원가입에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-600 to-sky-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="text-white space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-100">Create Account</p>
          <h1 className="text-4xl font-extrabold leading-tight drop-shadow-sm">
            Isw 글쓰기 도우미에 오신 것을 환영합니다
          </h1>
          <p className="text-base text-indigo-100 leading-relaxed">
            학생은 바로 글쓰기 연습을 시작하고, 선생님은 승인 이후 클래스와 학생을 관리할 수 있습니다.
            간단한 정보만 입력하고 지금 바로 시작해 보세요.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">회원가입</h2>
            <p className="mt-2 text-sm text-gray-600">세련된 글쓰기 경험을 함께 만들어가요.</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                    placeholder="비밀번호 (최소 6자)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                    placeholder="비밀번호를 한 번 더 입력하세요"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  역할
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm shadow-sm"
                >
                  <option value="">역할을 선택해 주세요</option>
                  <option value={ROLES.STUDENT}>학생</option>
                  <option value={ROLES.TEACHER}>선생님</option>
                </select>
                {formData.role === ROLES.TEACHER && (
                  <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    선생님 계정은 관리자의 승인 후 사용 가능합니다.
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-500 to-sky-500 hover:from-indigo-500 hover:via-purple-400 hover:to-sky-400 shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:bg-gray-400"
              >
                {loading ? "회원가입 중..." : "회원가입"}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
