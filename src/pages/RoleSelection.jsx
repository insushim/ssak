import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserData } from '../services/authService';
import { auth } from '../config/firebase';
import { ROLES } from '../config/auth';

export default function RoleSelection() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 선생님으로 바로 가입 (학생은 교사가 일괄 생성)
  const handleTeacherSignup = async () => {
    setLoading(true);

    try {
      await updateUserData(auth.currentUser.uid, {
        role: ROLES.TEACHER,
        gradeLevel: null,
        approved: false // 관리자 승인 필요
      });

      navigate('/');
    } catch (error) {
      console.error('역할 설정 에러:', error);
      alert('역할 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
          선생님 가입
        </h2>
        <p className="text-center text-gray-600 mb-8">
          학생 계정은 선생님이 일괄 생성합니다
        </p>

        <div className="space-y-6">
          {/* 선생님 가입 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👩‍🏫</span>
              <div className="font-medium text-blue-900">선생님으로 가입하기</div>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              학급을 생성하고 학생들의 글쓰기를 관리할 수 있습니다.
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>✓ 학급 생성 및 학생 계정 일괄 생성</li>
              <li>✓ 글쓰기 과제 출제 및 자동 출제 설정</li>
              <li>✓ 학생 글 AI 분석 및 피드백 확인</li>
            </ul>
          </div>

          {/* 승인 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ 선생님 계정은 관리자의 승인이 필요합니다.
              승인 완료 후 모든 기능을 이용할 수 있습니다.
            </p>
          </div>

          {/* 학생 안내 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>학생인가요?</strong> 선생님께 계정을 요청하세요.
              선생님이 학생 계정을 일괄 생성해 드립니다.
            </p>
          </div>

          <button
            onClick={handleTeacherSignup}
            disabled={loading}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? '설정 중...' : '선생님으로 가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
