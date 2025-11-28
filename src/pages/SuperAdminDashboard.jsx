import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy, limit, startAfter } from "firebase/firestore";
import { db, auth, functions } from "../config/firebase";
import { signOut, ensureSuperAdminAccess } from "../services/authService";
import { ROLES, GRADE_LEVELS } from "../config/auth";
import { httpsCallable } from "firebase/functions";

// 🚀 페이지네이션 설정 (10,000명 대응)
const PAGE_SIZE = 50;

export default function SuperAdminDashboard({ user, userData }) {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // 🚀 페이지네이션 상태
  const [lastUserDoc, setLastUserDoc] = useState(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  useEffect(() => {
    ensureSuperAdminAccess(user);
    loadData();
  }, []);

  // 🚀 최적화: 페이지네이션으로 전체 사용자 로드 (10,000명 대응)
  const loadData = async () => {
    setLoading(true);
    try {
      // 승인 대기 선생님 (이건 보통 적음)
      const pendingQuery = query(
        collection(db, "users"),
        where("role", "==", ROLES.TEACHER),
        where("approved", "==", false)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pending = [];
      pendingSnapshot.forEach((docSnap) => {
        pending.push({ ...docSnap.data(), id: docSnap.id });
      });
      setPendingTeachers(pending);

      // 🚀 전체 사용자: 페이지네이션으로 첫 페이지만 로드
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = [];
      usersSnapshot.forEach((docSnap) => {
        users.push({ ...docSnap.data(), id: docSnap.id });
      });
      setAllUsers(users);

      // 다음 페이지 여부 확인
      if (usersSnapshot.docs.length === PAGE_SIZE) {
        setLastUserDoc(usersSnapshot.docs[usersSnapshot.docs.length - 1]);
        setHasMoreUsers(true);
      } else {
        setLastUserDoc(null);
        setHasMoreUsers(false);
      }

      setTotalUsersCount(users.length);
    } catch (error) {
      console.error("데이터 로드 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 다음 페이지 로드
  const loadMoreUsers = async () => {
    if (!hasMoreUsers || loadingMore || !lastUserDoc) return;

    setLoadingMore(true);
    try {
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        startAfter(lastUserDoc),
        limit(PAGE_SIZE)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const newUsers = [];
      usersSnapshot.forEach((docSnap) => {
        newUsers.push({ ...docSnap.data(), id: docSnap.id });
      });

      setAllUsers(prev => [...prev, ...newUsers]);
      setTotalUsersCount(prev => prev + newUsers.length);

      // 다음 페이지 여부 확인
      if (usersSnapshot.docs.length === PAGE_SIZE) {
        setLastUserDoc(usersSnapshot.docs[usersSnapshot.docs.length - 1]);
        setHasMoreUsers(true);
      } else {
        setLastUserDoc(null);
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error("추가 로드 에러:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const approveTeacher = async (teacherId) => {
    try {
      await updateDoc(doc(db, "users", teacherId), {
        approved: true
      });
      alert("선생님 계정이 승인되었습니다.");
      loadData();
    } catch (error) {
      console.error("승인 에러:", error);
      alert("승인에 실패했습니다.");
    }
  };

  const rejectTeacher = async (teacherId) => {
    if (!confirm("정말 승인 요청을 거절하시겠어요?")) return;

    try {
      await updateDoc(doc(db, "users", teacherId), {
        approved: false,
        rejected: true
      });
      alert("요청이 거절되었습니다.");
      loadData();
    } catch (error) {
      console.error("거절 에러:", error);
      alert("처리에 실패했습니다.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`정말 ${userName} 사용자를 삭제하시겠습니까?\n\nFirebase Authentication과 Firestore 데이터가 모두 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const deleteUserFn = httpsCallable(functions, 'deleteUser');
      await deleteUserFn({ userId });

      alert(`${userName} 사용자가 완전히 삭제되었습니다.`);
      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      console.error("사용자 삭제 에러:", error);
      alert("사용자 삭제에 실패했습니다: " + error.message);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedUsers.size === 0) {
      alert("삭제할 사용자를 선택하세요.");
      return;
    }

    const userIds = Array.from(selectedUsers);
    if (!confirm(`선택한 ${userIds.length}명의 사용자를 삭제하시겠습니까?\n\nFirebase Authentication과 Firestore 데이터가 모두 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const batchDeleteFn = httpsCallable(functions, 'batchDeleteUsers');
      const result = await batchDeleteFn({ userIds });

      alert(`${result.data.deleted}/${result.data.attempted}명의 사용자가 삭제되었습니다.`);
      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      console.error("일괄 삭제 에러:", error);
      alert("일괄 삭제에 실패했습니다: " + error.message);
    }
  };

  const toggleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === allUsers.filter(u => u.role !== ROLES.SUPER_ADMIN).length) {
      setSelectedUsers(new Set());
    } else {
      const newSelected = new Set(allUsers.filter(u => u.role !== ROLES.SUPER_ADMIN).map(u => u.id));
      setSelectedUsers(newSelected);
    }
  };

  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = prompt(
      `사용자 역할을 변경하세요:\n\n현재: ${currentRole}\n\n입력 가능: teacher, student, super_admin`,
      currentRole
    );

    if (!newRole || newRole === currentRole) return;

    if (!['teacher', 'student', 'super_admin'].includes(newRole)) {
      alert('잘못된 역할입니다. teacher, student, super_admin 중 하나를 입력하세요.');
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        approved: newRole === 'student' ? true : false // 학생은 자동 승인
      });
      alert("역할이 변경되었습니다.");
      loadData();
    } catch (error) {
      console.error("역할 변경 에러:", error);
      alert("역할 변경에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  // 🚀 classCode 마이그레이션 실행
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);

  const handleMigrateClassCode = async () => {
    if (!confirm("기존 글에 classCode를 일괄 추가하시겠습니까?\n\n이 작업은 학급별 데이터 분리를 위해 필요합니다.")) {
      return;
    }

    setMigrating(true);
    setMigrateResult(null);

    try {
      const migrateFn = httpsCallable(functions, 'migrateWritingsClassCode');
      const result = await migrateFn();
      setMigrateResult(result.data);
      alert(`마이그레이션 완료!\n\n${result.data.message}`);
    } catch (error) {
      console.error("마이그레이션 에러:", error);
      alert("마이그레이션 실패: " + error.message);
      setMigrateResult({ error: error.message });
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50">
        <div className="text-xl font-semibold text-gray-700">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-600 to-sky-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-100">SSAK Admin</p>
            <h1 className="text-2xl font-bold mt-1">싹 - 슈퍼 관리자</h1>
            <p className="text-sm text-indigo-100 mt-1">{userData.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              승인 대기 ({pendingTeachers.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              전체 사용자 ({totalUsersCount}{hasMoreUsers ? '+' : ''})
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`${
                activeTab === "system"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              시스템 관리
            </button>
          </nav>
        </div>

        {/* Pending Teachers Tab */}
        {activeTab === "pending" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">승인 대기 중인 선생님</h2>
            </div>
            {pendingTeachers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">승인 대기 중인 선생님이 없습니다.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingTeachers.map((teacher) => (
                  <div key={teacher.id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{teacher.name}</p>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                      <p className="text-xs text-gray-500 mt-1">가입일: {new Date(teacher.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveTeacher(teacher.id)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => rejectTeacher(teacher.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">전체 사용자</h2>
              {selectedUsers.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                >
                  선택한 {selectedUsers.size}명 삭제
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size > 0 && selectedUsers.size === allUsers.filter(u => u.role !== ROLES.SUPER_ADMIN).length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학년</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((member) => (
                    <tr key={member.id} className={selectedUsers.has(member.id) ? "bg-indigo-50" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.role !== ROLES.SUPER_ADMIN ? (
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(member.id)}
                            onChange={() => toggleSelectUser(member.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        ) : (
                          <div className="w-4 h-4"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.role === ROLES.TEACHER && "선생님"}
                        {member.role === ROLES.STUDENT && "학생"}
                        {member.role === ROLES.SUPER_ADMIN && "슈퍼 관리자"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.gradeLevel ? GRADE_LEVELS[member.gradeLevel] : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.role === ROLES.TEACHER && (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.approved ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {member.approved ? "승인됨" : "대기중"}
                          </span>
                        )}
                        {member.role === ROLES.STUDENT && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800">
                            학생
                          </span>
                        )}
                        {member.role === ROLES.SUPER_ADMIN && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            슈퍼 관리자
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateUserRole(member.id, member.role)}
                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors font-medium shadow-sm"
                          >
                            역할 변경
                          </button>
                          {member.role !== ROLES.SUPER_ADMIN && (
                            <button
                              onClick={() => handleDeleteUser(member.id, member.name)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium shadow-sm"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🚀 더 보기 버튼 */}
            {hasMoreUsers && (
              <div className="px-6 py-4 border-t border-gray-200 text-center">
                <button
                  onClick={loadMoreUsers}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? '로딩 중...' : `더 보기 (${PAGE_SIZE}명씩)`}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  현재 {totalUsersCount}명 표시 중
                </p>
              </div>
            )}
          </div>
        )}

        {/* System Management Tab */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* classCode 마이그레이션 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">데이터 마이그레이션</h2>
                <p className="text-sm text-gray-500 mt-1">학급별 데이터 분리 및 최적화</p>
              </div>
              <div className="px-6 py-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-amber-800 mb-2">classCode 마이그레이션</h3>
                  <p className="text-sm text-amber-700 mb-3">
                    기존 글(writings)에 classCode 필드를 일괄 추가합니다.<br/>
                    이 작업을 통해 학급별 데이터가 완전히 분리되고 Firestore 읽기 비용이 절감됩니다.
                  </p>
                  <ul className="text-xs text-amber-600 mb-4 list-disc list-inside space-y-1">
                    <li>users 컬렉션에서 학생별 classCode 조회</li>
                    <li>writings 컬렉션에서 classCode가 없는 글에 업데이트</li>
                    <li>한 번만 실행하면 됩니다 (이미 완료된 경우 "업데이트할 글이 없습니다" 표시)</li>
                  </ul>
                  <button
                    onClick={handleMigrateClassCode}
                    disabled={migrating}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {migrating ? '마이그레이션 중...' : 'classCode 마이그레이션 실행'}
                  </button>
                  {migrateResult && (
                    <div className={`mt-4 p-3 rounded-lg ${migrateResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {migrateResult.error ? (
                        <p>오류: {migrateResult.error}</p>
                      ) : (
                        <p>
                          {migrateResult.message}<br/>
                          {migrateResult.totalStudents && `(총 ${migrateResult.totalStudents}명의 학생 데이터 확인)`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 시스템 정보 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">시스템 정보</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">앱 버전:</span>
                    <span className="ml-2 font-medium">1.0.0</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Firebase 프로젝트:</span>
                    <span className="ml-2 font-medium">isw-writing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
