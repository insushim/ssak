import { Link } from 'react-router-dom';

/**
 * 이용약관 페이지
 */
export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
            <span className="text-2xl">🌱</span>
            <span className="font-bold">ISW 글쓰기 도우미</span>
          </Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
            로그인
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
          <p className="text-gray-500 mb-8">시행일: 2024년 1월 1일</p>

          <div className="prose prose-emerald max-w-none text-gray-700">
            {/* 제1조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제1조 (목적)</h2>
              <p className="leading-relaxed">
                이 약관은 ISW 글쓰기 도우미(이하 "서비스")의 이용조건 및 절차, 이용자와 서비스 제공자의
                권리, 의무, 책임사항 등을 규정함을 목적으로 합니다.
              </p>
            </section>

            {/* 제2조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제2조 (정의)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>"서비스"</strong>란 AI 기반 글쓰기 학습 및 평가 서비스를 말합니다.</li>
                <li><strong>"이용자"</strong>란 본 약관에 따라 서비스를 이용하는 학생, 교사, 관리자를 말합니다.</li>
                <li><strong>"학교"</strong>란 서비스를 도입하여 사용하는 교육기관을 말합니다.</li>
                <li><strong>"콘텐츠"</strong>란 이용자가 작성한 글, 평가 결과 등을 말합니다.</li>
              </ul>
            </section>

            {/* 제3조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제3조 (서비스 내용)</h2>
              <p className="leading-relaxed mb-4">서비스는 다음의 기능을 제공합니다:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>AI 기반 글쓰기 평가 및 피드백</li>
                <li>학년별 맞춤 글쓰기 주제 제공</li>
                <li>글쓰기 성장 추적 및 통계</li>
                <li>교사용 학급 관리 도구</li>
                <li>표절 감지 기능</li>
              </ul>
            </section>

            {/* 제4조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제4조 (이용 계약)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>이용 계약은 학교 단위로 체결됩니다.</li>
                <li>학생 계정은 담당 교사가 생성하며, 학교의 승인 하에 이용됩니다.</li>
                <li>만 14세 미만 학생의 경우, 학교장 또는 법정대리인의 동의가 필요합니다.</li>
              </ul>
            </section>

            {/* 제5조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제5조 (이용자의 의무)</h2>
              <p className="leading-relaxed mb-4">이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>타인의 계정을 무단 사용하는 행위</li>
                <li>서비스를 이용하여 타인의 명예를 훼손하는 행위</li>
                <li>음란, 폭력적인 내용의 글을 작성하는 행위</li>
                <li>서비스의 정상적 운영을 방해하는 행위</li>
                <li>AI를 속이기 위한 의도적인 조작 행위</li>
                <li>타인의 글을 무단으로 복제하는 행위</li>
              </ul>
            </section>

            {/* 제6조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제6조 (서비스 제공자의 의무)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>안정적인 서비스 제공을 위해 노력합니다.</li>
                <li>이용자의 개인정보를 보호합니다.</li>
                <li>서비스 장애 발생 시 신속히 복구합니다.</li>
                <li>이용자의 불만 및 문의에 성실히 응대합니다.</li>
              </ul>
            </section>

            {/* 제7조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제7조 (콘텐츠의 권리)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>이용자가 작성한 글의 저작권은 이용자에게 있습니다.</li>
                <li>서비스는 글쓰기 평가 및 서비스 개선 목적으로만 콘텐츠를 활용합니다.</li>
                <li>이용자의 동의 없이 콘텐츠를 외부에 공개하지 않습니다.</li>
              </ul>
            </section>

            {/* 제8조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제8조 (AI 평가의 한계)</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 font-medium">⚠️ AI 평가 관련 안내</p>
              </div>
              <ul className="list-disc ml-6 space-y-2">
                <li>AI 평가는 참고용이며, 최종 평가는 교사의 판단에 따릅니다.</li>
                <li>AI의 평가 결과가 항상 정확하지 않을 수 있습니다.</li>
                <li>AI 평가 결과에 대한 이의는 담당 교사에게 제기할 수 있습니다.</li>
                <li>AI 평가는 학생의 성장을 돕기 위한 보조 도구입니다.</li>
              </ul>
            </section>

            {/* 제9조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제9조 (서비스 중단)</h2>
              <p className="leading-relaxed mb-4">
                다음의 경우 서비스 제공을 일시적으로 중단할 수 있습니다:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>시스템 점검, 보수, 교체 시</li>
                <li>천재지변, 국가비상사태 등 불가항력의 경우</li>
                <li>서비스 제공에 필요한 설비 장애 시</li>
              </ul>
              <p className="leading-relaxed mt-4">
                서비스 중단 시 사전에 공지하며, 불가피한 경우 사후 공지할 수 있습니다.
              </p>
            </section>

            {/* 제10조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제10조 (요금 및 결제)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>서비스 요금은 별도의 요금표에 따릅니다.</li>
                <li>학교 단위 연간 계약을 기본으로 합니다.</li>
                <li>무료 체험 기간이 제공될 수 있습니다.</li>
                <li>환불 정책은 별도로 안내합니다.</li>
              </ul>
            </section>

            {/* 제11조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제11조 (면책 조항)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>서비스는 AI 평가 결과의 정확성을 보장하지 않습니다.</li>
                <li>이용자 간의 분쟁에 대해서는 관여하지 않습니다.</li>
                <li>이용자의 귀책사유로 인한 손해에 대해서는 책임지지 않습니다.</li>
              </ul>
            </section>

            {/* 제12조 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">제12조 (분쟁 해결)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>서비스 이용과 관련한 분쟁은 상호 협의하여 해결합니다.</li>
                <li>협의가 이루어지지 않을 경우, 관할 법원에 소를 제기할 수 있습니다.</li>
                <li>준거법은 대한민국 법을 따릅니다.</li>
              </ul>
            </section>

            {/* 부칙 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">부칙</h2>
              <p className="leading-relaxed">
                이 약관은 2024년 1월 1일부터 시행합니다.
              </p>
            </section>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 pt-6 border-t flex justify-center gap-4">
            <Link
              to="/privacy"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              개인정보처리방침
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
            <Link to="/privacy" className="hover:text-white">개인정보처리방침</Link>
            <Link to="/terms" className="hover:text-white">이용약관</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
