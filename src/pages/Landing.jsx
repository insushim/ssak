import { Link } from "react-router-dom";
import { useState } from "react";

/**
 * 랜딩 페이지 - 학교 판매용 차별화 포인트 강조
 */
export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌱</span>
            <span className="text-xl font-bold text-gray-900">
              ISW 글쓰기 도우미
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 hidden md:block"
            >
              기능
            </a>
            <a
              href="#comparison"
              className="text-gray-600 hover:text-gray-900 hidden md:block"
            >
              비교
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 hidden md:block"
            >
              요금
            </a>
            <Link
              to="/login"
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              로그인
            </Link>
            <a
              href="#contact"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              도입 문의
            </a>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                AI 기반 글쓰기 교육 혁신
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                학생 글쓰기 실력,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                  AI와 함께 성장
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                6+1 Trait Writing 기반의 전문적인 평가 시스템.
                <br />
                교사의 피드백 부담은 줄이고, 학생의 글쓰기 실력은 높이세요.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
                >
                  무료 체험 신청
                </a>
                <button
                  onClick={() => setShowDemo(true)}
                  className="px-8 py-4 border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  데모 영상 보기
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  설치 없이 바로 사용
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  30일 무료 체험
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"
                  alt="학생 글쓰기"
                  className="w-full rounded-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                  평가 시간 90% 단축
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 차별화 포인트 */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 ISW 글쓰기 도우미인가요?
            </h2>
            <p className="text-xl text-gray-600">
              기존 서비스와는 다른, 진짜 교육 현장을 위한 솔루션
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 차별점 1 */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl mb-6">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                6+1 Trait Writing 기반
              </h3>
              <p className="text-gray-600 leading-relaxed">
                세계적으로 검증된 글쓰기 평가 프레임워크를 적용. 아이디어, 구성,
                어휘, 문장 유창성, 규범 등 6가지 영역별 상세 피드백 제공.
              </p>
              <div className="mt-4 text-emerald-600 font-medium">
                ✓ 교육부 교육과정 연계
              </div>
            </div>

            {/* 차별점 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-2xl mb-6">
                🌱
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                싹DB - 학년별 평가 기준
              </h3>
              <p className="text-gray-600 leading-relaxed">
                초1~고3까지 학년별 맞춤 평가 루브릭과 우수작 예시 1,200개+ 탑재.
                학년 수준에 맞는 공정한 평가가 가능합니다.
              </p>
              <div className="mt-4 text-blue-600 font-medium">
                ✓ 695개 평가 루브릭
              </div>
            </div>

            {/* 차별점 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-2xl mb-6">
                🔄
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                무제한 고쳐쓰기
              </h3>
              <p className="text-gray-600 leading-relaxed">
                기준 점수(70점) 이상 받을 때까지 무제한 수정 가능. "틀렸다"가
                아닌 "성장 중"이라는 메시지를 전달합니다.
              </p>
              <div className="mt-4 text-purple-600 font-medium">
                ✓ 성장 중심 피드백
              </div>
            </div>

            {/* 차별점 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center text-2xl mb-6">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI 생성 글 감지
              </h3>
              <p className="text-gray-600 leading-relaxed">
                ChatGPT 등으로 생성한 글을 자동 감지. 표절 감지(50% 이상 유사도
                차단)로 학습의 진정성을 보장합니다.
              </p>
              <div className="mt-4 text-orange-600 font-medium">
                ✓ 표절 + AI 생성 이중 감지
              </div>
            </div>

            {/* 차별점 5 */}
            <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center text-2xl mb-6">
                👨‍🏫
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                교사 친화적 관리
              </h3>
              <p className="text-gray-600 leading-relaxed">
                학급별 과제 배정, 진도 확인, 일괄 학생 계정 생성. 교사가 직접
                최종 점수를 조정하고 피드백을 추가할 수 있습니다.
              </p>
              <div className="mt-4 text-cyan-600 font-medium">
                ✓ 교사 피드백 추가 기능
              </div>
            </div>

            {/* 차별점 6 */}
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center text-2xl mb-6">
                💰
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                합리적인 가격
              </h3>
              <p className="text-gray-600 leading-relaxed">
                학교당 연 30만원부터. 학생 수 무관 정액제. 30일 무료 체험 후
                결정하세요.
              </p>
              <div className="mt-4 text-rose-600 font-medium">
                ✓ 학생당 비용 X
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 경쟁 비교 */}
      <section id="comparison" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              기존 서비스와 비교
            </h2>
            <p className="text-xl text-gray-600">
              왜 ISW가 교육 현장에 더 적합할까요?
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <th className="px-6 py-4 text-left">기능</th>
                  <th className="px-6 py-4 text-center">ISW 글쓰기 도우미</th>
                  <th className="px-6 py-4 text-center text-white/80">
                    EBS 온라인클래스
                  </th>
                  <th className="px-6 py-4 text-center text-white/80">
                    클래스팅
                  </th>
                  <th className="px-6 py-4 text-center text-white/80">
                    아이스크림
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 font-medium">AI 글쓰기 평가</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    ✓ 6+1 Trait
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">
                    제한적
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">학년별 맞춤 평가</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    ✓ 초1~고3
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">
                    초등만
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">무제한 고쳐쓰기</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">AI 생성 글 감지</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">표절 감지</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                  <td className="px-6 py-4 text-center text-gray-400">✗</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">글쓰기 전문 서비스</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    ✓ 전문
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">범용</td>
                  <td className="px-6 py-4 text-center text-gray-400">범용</td>
                  <td className="px-6 py-4 text-center text-gray-400">범용</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">가격 (연간)</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-bold">
                    30만원~
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">무료</td>
                  <td className="px-6 py-4 text-center text-gray-600">유료</td>
                  <td className="px-6 py-4 text-center text-gray-600">유료</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 요금제 */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              합리적인 요금제
            </h2>
            <p className="text-xl text-gray-600">
              학교 규모에 관계없이 동일한 가격
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 무료 체험 */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">무료 체험</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">0</span>
                  <span className="text-gray-600">원</span>
                </div>
                <p className="text-gray-500 mt-2">30일간</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  학급 2개까지
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  모든 기능 사용
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  이메일 지원
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full py-3 text-center border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
              >
                무료로 시작하기
              </a>
            </div>

            {/* 기본 */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 text-white transform scale-105 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-bold">
                인기
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">학교 기본</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">30만</span>
                  <span className="text-emerald-100">원/년</span>
                </div>
                <p className="text-emerald-100 mt-2">학생 수 무관</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  학급 무제한
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  모든 기능 사용
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  일일 1,000회 평가
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  우선 이메일 지원
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full py-3 text-center bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
              >
                도입 문의하기
              </a>
            </div>

            {/* 프리미엄 */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  교육청/대규모
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">협의</span>
                </div>
                <p className="text-gray-500 mt-2">맞춤 견적</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  다중 학교 관리
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  전용 서버 (옵션)
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  맞춤형 루브릭
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  전담 매니저
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full py-3 text-center border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
              >
                견적 요청
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 문의 섹션 */}
      <section
        id="contact"
        className="py-20 px-4 bg-gradient-to-br from-emerald-500 to-teal-600"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            무료 체험을 시작하세요
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            30일간 모든 기능을 무료로 사용해보세요.
            <br />
            신용카드 정보 없이 바로 시작할 수 있습니다.
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="학교명"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="담당자 성함"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="이메일"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="연락처"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <textarea
                placeholder="문의 내용 (선택)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                무료 체험 신청하기
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              * 신청 후 1영업일 이내에 연락드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌱</span>
                <span className="text-white font-bold">ISW 글쓰기 도우미</span>
              </div>
              <p className="text-sm">
                AI 기반 글쓰기 교육 솔루션으로
                <br />
                학생들의 글쓰기 실력 향상을 돕습니다.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white">
                    기능 소개
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    요금제
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white">
                    로그인
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">고객 지원</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#contact" className="hover:text-white">
                    도입 문의
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@isw-writing.com"
                    className="hover:text-white"
                  >
                    이메일 문의
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">법적 고지</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 ISW 글쓰기 도우미. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 데모 모달 */}
      {showDemo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 rounded-xl flex flex-col items-center justify-center gap-6 p-8">
              <div className="text-6xl">🌱</div>
              <h3 className="text-white text-2xl font-bold">
                싹 AI 글쓰기 플랫폼
              </h3>
              <div className="text-emerald-300 text-center space-y-2 max-w-md">
                <p className="text-lg font-medium">직접 체험해보세요!</p>
                <p className="text-sm text-emerald-400/80">
                  로그인 후 학생 대시보드에서 AI 글쓰기 평가, 아바타 꾸미기,
                  학급 랭킹 등을 경험할 수 있습니다.
                </p>
              </div>
              <a
                href="/login"
                className="mt-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors text-lg"
              >
                무료로 시작하기 →
              </a>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="mt-4 w-full py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
