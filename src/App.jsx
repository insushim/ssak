import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { getUserData } from './services/authService';
import { ROLES, SUPER_ADMIN_UID } from './config/auth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          let data = await getUserData(user.uid);

          // 슈퍼 관리자 자동 설정
          if (user.uid === SUPER_ADMIN_UID) {
            data = { ...data, role: ROLES.SUPER_ADMIN, approved: true };
          }

          setUserData(data);
        } catch (error) {
          console.error('사용자 정보 로드 에러:', error);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">로딩 중...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              userData?.role === ROLES.SUPER_ADMIN ? (
                <Navigate to="/super-admin" replace />
              ) : userData?.role === ROLES.TEACHER ? (
                userData?.approved ? (
                  <Navigate to="/teacher" replace />
                ) : userData?.rejected ? (
                  // 거절된 선생님
                  <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                      <div className="text-6xl mb-4">😔</div>
                      <h2 className="text-2xl font-bold mb-4 text-red-600">가입 요청이 거절되었습니다</h2>
                      <p className="text-gray-600 mb-2">
                        관리자가 선생님 계정 가입 요청을 거절하였습니다.
                      </p>
                      {userData?.rejectedReason && (
                        <p className="text-gray-500 mb-4 bg-gray-100 p-3 rounded">
                          사유: {userData.rejectedReason}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 mb-4">
                        문의: 관리자에게 연락해주세요.
                      </p>
                      <button
                        onClick={() => auth.signOut()}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                ) : (
                  // 승인 대기 중
                  <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <h2 className="text-2xl font-bold mb-4 text-gray-800">승인 대기 중</h2>
                      <p className="text-gray-600 mb-4">
                        계정이 아직 승인되지 않았습니다.
                        <br />
                        관리자의 승인을 기다려주세요.
                      </p>
                      <button
                        onClick={() => auth.signOut()}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )
              ) : userData?.role === ROLES.STUDENT ? (
                <Navigate to="/student" replace />
              ) : (
                <Navigate to="/role-selection" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route
          path="/super-admin"
          element={
            currentUser && userData?.role === ROLES.SUPER_ADMIN ? (
              <SuperAdminDashboard user={currentUser} userData={userData} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/teacher"
          element={
            currentUser && userData?.role === ROLES.TEACHER && userData?.approved ? (
              <TeacherDashboard user={currentUser} userData={userData} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/student"
          element={
            currentUser && userData?.role === ROLES.STUDENT ? (
              <StudentDashboard user={currentUser} userData={userData} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
