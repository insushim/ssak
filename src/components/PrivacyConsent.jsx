import { useState } from 'react';

/**
 * 개인정보 처리 동의 컴포넌트
 * 교육기관 개인정보보호 기준 준수
 */
export default function PrivacyConsent({ onConsent, userName }) {
  const [agreed, setAgreed] = useState({
    privacy: false,
    ai: false,
    marketing: false // 선택
  });
  const [showDetail, setShowDetail] = useState(null);

  const canProceed = agreed.privacy && agreed.ai;

  const handleSubmit = () => {
    if (canProceed) {
      onConsent({
        privacyAgreed: true,
        aiProcessingAgreed: true,
        marketingAgreed: agreed.marketing,
        agreedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">개인정보 처리 동의</h2>
          <p className="text-emerald-100 mt-1">
            {userName ? `${userName}님, ` : ''}ISW 글쓰기 도우미 이용을 위해 아래 내용에 동의해주세요.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* 필수: 개인정보 처리 동의 */}
          <div className={`border rounded-xl p-4 transition-all ${agreed.privacy ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed.privacy}
                onChange={(e) => setAgreed(prev => ({ ...prev, privacy: e.target.checked }))}
                className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">[필수] 개인정보 수집 및 이용 동의</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">필수</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDetail(showDetail === 'privacy' ? null : 'privacy')}
                  className="text-sm text-emerald-600 hover:underline mt-2"
                >
                  {showDetail === 'privacy' ? '접기 ▲' : '자세히 보기 ▼'}
                </button>
              </div>
            </label>

            {showDetail === 'privacy' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">1. 수집 항목</h4>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li><strong>학생:</strong> 이름, 학년, 학급, 학번</li>
                    <li><strong>교사:</strong> 이름, 이메일, 담당 학급</li>
                    <li><strong>생성 콘텐츠:</strong> 작성한 글, 평가 결과, 수정 이력</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">2. 수집 목적</h4>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>글쓰기 학습 서비스 제공</li>
                    <li>AI 기반 글쓰기 평가 및 피드백</li>
                    <li>학습 진도 및 성장 추적</li>
                    <li>교사의 학생 관리</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">3. 보유 기간</h4>
                  <p className="mt-1">학년도 종료 후 1년간 보관, 이후 자동 삭제 (교육기관 요청 시 즉시 삭제 가능)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">4. 개인정보 보호</h4>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>암호화된 데이터베이스 저장 (Firebase Security Rules)</li>
                    <li>HTTPS 통신으로 전송 구간 암호화</li>
                    <li>학생 정보는 해당 학급 교사만 열람 가능</li>
                    <li>제3자 제공 없음 (AI 평가 제외)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 필수: AI 처리 동의 */}
          <div className={`border rounded-xl p-4 transition-all ${agreed.ai ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed.ai}
                onChange={(e) => setAgreed(prev => ({ ...prev, ai: e.target.checked }))}
                className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">[필수] AI 글쓰기 평가 동의</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">필수</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  작성한 글이 AI(Google Gemini)로 전송되어 평가됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDetail(showDetail === 'ai' ? null : 'ai')}
                  className="text-sm text-emerald-600 hover:underline mt-2"
                >
                  {showDetail === 'ai' ? '접기 ▲' : '자세히 보기 ▼'}
                </button>
              </div>
            </label>

            {showDetail === 'ai' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">1. AI 처리 내용</h4>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>작성한 글 내용 (이름, 학번 등 개인식별정보 제외)</li>
                    <li>학년 정보 (적절한 평가 기준 적용을 위함)</li>
                    <li>글쓰기 주제</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">2. AI 서비스 제공자</h4>
                  <p className="mt-1">Google LLC (Gemini AI) - 미국 소재</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Google의 개인정보처리방침: https://policies.google.com/privacy
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">3. 데이터 보호</h4>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>학생 이름, 학번 등 개인식별정보는 AI에 전송되지 않음</li>
                    <li>글 내용만 익명화되어 전송</li>
                    <li>Google은 해당 데이터를 AI 학습에 사용하지 않음 (API 정책)</li>
                    <li>전송 데이터는 평가 후 Google 서버에서 즉시 삭제</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 font-medium">⚠️ 중요 안내</p>
                  <p className="text-amber-700 mt-1">
                    글에 개인정보(주소, 전화번호, 가족 이름 등)를 포함하지 않도록 주의해주세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 선택: 마케팅 동의 */}
          <div className={`border rounded-xl p-4 transition-all ${agreed.marketing ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed.marketing}
                onChange={(e) => setAgreed(prev => ({ ...prev, marketing: e.target.checked }))}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">[선택] 서비스 개선 및 안내 동의</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">선택</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  새로운 기능 안내, 글쓰기 팁, 교육 자료를 받아보실 수 있습니다.
                </p>
              </div>
            </label>
          </div>

          {/* 안내 문구 */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p>• 필수 항목에 동의하지 않으면 서비스 이용이 제한됩니다.</p>
            <p>• 동의는 언제든지 설정에서 철회할 수 있습니다.</p>
            <p>• 문의: support@isw-writing.com</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setAgreed({ privacy: true, ai: true, marketing: true });
              }}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              전체 동의
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                canProceed
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              동의하고 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
