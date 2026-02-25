import { Link } from "react-router-dom";

/**
 * 개인정보처리방침 페이지
 * 교육기관 기준 준수
 */
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            <span className="text-2xl">🌱</span>
            <span className="font-bold">ISW 글쓰기 도우미</span>
          </Link>
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            로그인
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            개인정보처리방침
          </h1>
          <p className="text-gray-500 mb-8">
            시행일: 2024년 1월 1일 | 최종 수정: 2024년 12월
          </p>

          <div className="prose prose-emerald max-w-none">
            {/* 제1조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제1조 (목적)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ISW 글쓰기 도우미(이하 "서비스")는 학생들의 글쓰기 학습을 돕기
                위해 개인정보를 처리하며, 「개인정보 보호법」 제30조에 따라
                정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고
                원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보
                처리방침을 수립·공개합니다.
              </p>
            </section>

            {/* 제2조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제2조 (수집하는 개인정보)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        구분
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        수집 항목
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        수집 목적
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left">
                        보유 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        학생
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        이름, 학년, 학급, 학번
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        회원 식별, 학습 관리
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        학년도 종료 후 1년
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        교사
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        이름, 이메일, 담당 학급
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        회원 식별, 학급 관리
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        탈퇴 시까지
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        학습 데이터
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        작성 글, 평가 결과, 수정 이력
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        글쓰기 평가, 성장 추적
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        학년도 종료 후 1년
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        자동 수집
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        접속 IP, 브라우저 정보, 접속 시간
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        서비스 개선, 보안
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        3개월
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제3조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제3조 (AI 처리 및 제3자 제공)
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-amber-800">
                  ⚠️ AI 평가를 위한 데이터 처리 안내
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 글쓰기 평가를 위해 작성된 글을 AI 서비스(OpenAI)에
                전송합니다.
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <strong>전송 항목:</strong> 작성된 글 내용, 학년 정보, 주제
                  (이름, 학번 등 개인식별정보 제외)
                </li>
                <li>
                  <strong>전송 목적:</strong> AI 기반 글쓰기 평가 및 피드백 생성
                </li>
                <li>
                  <strong>제공받는 자:</strong> OpenAI, Inc. (미국 소재)
                </li>
                <li>
                  <strong>보유 기간:</strong> 평가 완료 후 30일 이내 삭제
                  (OpenAI API 정책)
                </li>
                <li>
                  <strong>AI 학습 미사용:</strong> OpenAI API 정책에 따라 전송된
                  데이터는 AI 모델 학습에 사용되지 않습니다.
                </li>
              </ul>
            </section>

            {/* 제4조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제4조 (개인정보 보호 조치)
              </h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <strong>기술적 조치:</strong> 데이터베이스 암호화 (Firebase
                  Security Rules), HTTPS 통신 암호화
                </li>
                <li>
                  <strong>관리적 조치:</strong> 개인정보 취급자 최소화, 접근
                  권한 관리
                </li>
                <li>
                  <strong>접근 제한:</strong> 학생 정보는 해당 학급 담당 교사와
                  관리자만 열람 가능
                </li>
                <li>
                  <strong>비밀번호:</strong> 일방향 암호화(Hash) 저장
                </li>
              </ul>
            </section>

            {/* 제5조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제5조 (정보주체의 권리)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                정보주체(학생, 학부모, 교사)는 다음과 같은 권리를 행사할 수
                있습니다.
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>
                  <strong>열람 요구:</strong> 본인의 개인정보 처리 현황 열람
                </li>
                <li>
                  <strong>정정 요구:</strong> 잘못된 개인정보의 정정 요청
                </li>
                <li>
                  <strong>삭제 요구:</strong> 개인정보 삭제 요청 (단, 법령에
                  따른 보존 기간 중에는 삭제 불가)
                </li>
                <li>
                  <strong>처리정지 요구:</strong> 개인정보 처리 정지 요청
                </li>
                <li>
                  <strong>동의 철회:</strong> 개인정보 처리에 대한 동의 철회
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                권리 행사는 서면, 이메일을 통해 요청할 수 있으며, 요청일로부터
                10일 이내에 처리합니다.
              </p>
            </section>

            {/* 제6조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제6조 (아동의 개인정보)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                만 14세 미만 아동의 개인정보 처리 시, 법정대리인(학부모)의
                동의를 받습니다. 학교에서 교육 목적으로 사용하는 경우, 학교장이
                법정대리인의 동의를 대신할 수 있습니다.
              </p>
            </section>

            {/* 제7조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제7조 (개인정보 파기)
              </h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>보유 기간 경과 시 지체 없이 파기</li>
                <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
                <li>종이 문서: 분쇄 또는 소각</li>
                <li>학년도 종료 후 1년 경과 시 학생 데이터 자동 삭제</li>
              </ul>
            </section>

            {/* 제8조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제8조 (개인정보 보호책임자)
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>개인정보 보호책임자:</strong> ISW 글쓰기 도우미 운영팀
                </p>
                <p className="text-gray-700">
                  <strong>이메일:</strong> privacy@isw-writing.com
                </p>
                <p className="text-gray-700">
                  <strong>문의 시간:</strong> 평일 09:00 - 18:00
                </p>
              </div>
            </section>

            {/* 제9조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제9조 (권익침해 구제방법)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                개인정보침해로 인한 구제를 받기 위해 다음 기관에 상담을 신청할
                수 있습니다.
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>개인정보침해신고센터: (국번없이) 118</li>
                <li>개인정보분쟁조정위원회: 1833-6972</li>
                <li>대검찰청 사이버수사과: (국번없이) 1301</li>
                <li>경찰청 사이버안전국: (국번없이) 182</li>
              </ul>
            </section>

            {/* 제10조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">
                제10조 (방침의 변경)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                이 개인정보처리방침은 법령, 정책 또는 서비스 변경에 따라 수정될
                수 있으며, 변경 시 최소 7일 전에 공지사항을 통해 안내합니다.
              </p>
            </section>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 pt-6 border-t flex justify-center gap-4">
            <Link
              to="/terms"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              이용약관
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>© 2024 ISW 글쓰기 도우미. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-white">
              개인정보처리방침
            </Link>
            <Link to="/terms" className="hover:text-white">
              이용약관
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
