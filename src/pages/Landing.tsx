import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PenLine,
  BarChart3,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: PenLine,
    title: "규칙 기반 채점",
    desc: "AI 비용 없이 맞춤법, 어휘, 구조를 자동 분석",
  },
  {
    icon: MessageSquare,
    title: "문장별 피드백",
    desc: "모든 문장에 구체적인 개선 포인트 제공",
  },
  {
    icon: TrendingUp,
    title: "성장 추적",
    desc: "과거 글과 비교하여 성장 과정을 시각화",
  },
  {
    icon: BarChart3,
    title: "글쓰기 DNA",
    desc: "나만의 글쓰기 특성 분석 리포트",
  },
  { icon: Sparkles, title: "표현 추천", desc: "더 풍부한 어휘와 표현을 추천" },
  {
    icon: Users,
    title: "학급 통계",
    desc: "교사를 위한 학급 전체 분석 대시보드",
  },
  {
    icon: BookOpen,
    title: "자기 평가",
    desc: "메타인지 훈련으로 스스로 글을 평가",
  },
  {
    icon: Award,
    title: "업적 & 레벨",
    desc: "32개 업적과 10단계 레벨로 동기 부여",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <header className="px-4 py-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌱</span>
          <span className="text-xl font-bold text-ssak-700 dark:text-ssak-400">
            싹
          </span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary text-sm">
            로그인
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            시작하기
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            글쓰기 실력을
            <br />
            <span className="text-ssak-600">싹</span> 틔우세요
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            규칙 기반 자동 채점으로 비용 0원. 문장별 피드백, 성장 추적, 글쓰기
            DNA까지. 학생은 실력을 키우고, 교사는 시간을 아끼세요.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              무료로 시작하기
            </Link>
            <Link
              to="/register?role=teacher"
              className="btn-secondary text-lg px-8 py-3"
            >
              교사 가입
            </Link>
          </div>
        </motion.section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-10">
          {[
            { label: "채점 비용", value: "0원" },
            { label: "평가 영역", value: "4개" },
            { label: "업적", value: "32개" },
            { label: "표현 사전", value: "100+" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl font-bold text-ssak-600">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            핵심 기능
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card hover:shadow-md transition-shadow"
              >
                <f.icon className="w-8 h-8 text-ssak-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16">
          <div className="card bg-ssak-600 border-ssak-600 text-white p-10">
            <h2 className="text-2xl font-bold mb-3">지금 바로 시작하세요</h2>
            <p className="mb-6 opacity-90">
              가입만 하면 모든 기능을 무료로 사용할 수 있어요.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-ssak-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition"
            >
              무료 가입하기
            </Link>
          </div>
        </section>

        <footer className="text-center py-8 text-sm text-gray-400">
          <p>싹(SSAK) - 글쓰기 학습 플랫폼 &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
