import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserData } from '../services/authService';
import { auth } from '../config/firebase';
import { ROLES, GRADE_LEVELS } from '../config/auth';

export default function RoleSelection() {
  const [role, setRole] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserData(auth.currentUser.uid, {
        role,
        gradeLevel: role === ROLES.STUDENT ? gradeLevel : null,
        approved: role === ROLES.STUDENT ? true : false
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
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          역할 선택
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              역할을 선택하세요
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value={ROLES.STUDENT}
                  checked={role === ROLES.STUDENT}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">학생</div>
                  <div className="text-sm text-gray-500">글쓰기를 배우고 싶어요</div>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value={ROLES.TEACHER}
                  checked={role === ROLES.TEACHER}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">선생님</div>
                  <div className="text-sm text-gray-500">학생들을 가르치고 싶어요</div>
                </div>
              </label>
            </div>
          </div>

          {role === ROLES.STUDENT && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학년을 선택하세요
              </label>
              <select
                required
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">학년 선택</option>
                {Object.entries(GRADE_LEVELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === ROLES.TEACHER && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                선생님 계정은 관리자의 승인이 필요합니다.
                승인 후 이용 가능합니다.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !role || (role === ROLES.STUDENT && !gradeLevel)}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? '설정 중...' : '완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
