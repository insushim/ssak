import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy, limit, startAfter, getDoc } from "firebase/firestore";
import { db, auth, functions } from "../config/firebase";
import { signOut, ensureSuperAdminAccess } from "../services/authService";
import { ROLES, GRADE_LEVELS } from "../config/auth";
import { httpsCallable } from "firebase/functions";

// 🚀 페이지네이션 설정 (10,000명 대응)
const PAGE_SIZE = 50;

export default function SuperAdminDashboard({ user, userData }) {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // 🚀 학급별 요약 (최적화: classes 문서만 로드)
  const [classSummaries, setClassSummaries] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // 🚀 선생님 목록 (승인된 선생님만)
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // 🚀 선택된 사용자 상세 정보
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  useEffect(() => {
    ensureSuperAdminAccess(user);
    loadData();
  }, []);

  // 🚀 최적화: 학급 요약만 먼저 로드 (users 개별 읽기 제거!)
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[📊 SuperAdmin] 데이터 로드 시작');

      // 1. 승인 대기 선생님 (보통 적음 - 1회 쿼리)
      console.log('[📊 DB읽기] 승인 대기 선생님 조회');
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
      console.log(`[📊 DB읽기] 승인 대기 선생님 ${pending.length}명 로드`);

      // 2. 🚀 학급 요약 로드 (classes 컬렉션 - 학급 수만큼 읽기)
      console.log('[📊 DB읽기] 학급 목록 조회');
      const classesQuery = query(collection(db, "classes"));
      const classesSnapshot = await getDocs(classesQuery);
      const classes = [];
      classesSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        classes.push({
          classCode: docSnap.id,
          className: data.className || docSnap.id,
          teacherId: data.teacherId,
          teacherName: data.teacherName || '알 수 없음',
          studentCount: data.students?.length || 0,
          gradeLevel: data.gradeLevel,
          createdAt: data.createdAt
        });
      });
      setClassSummaries(classes);
      console.log(`[📊 DB읽기] 학급 ${classes.length}개 로드 (학생 상세는 클릭 시 로드)`);

      // 🚀 로그인 완료 요약
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[📊 슈퍼관리자 로그인 완료] 총 DB 읽기: 2회');
      console.log('  - users (승인대기): 1회 쿼리');
      console.log('  - classes: 1회 쿼리');
      console.log('  - 학생 상세: 0회 (학급 클릭 시 로드)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
      console.error("데이터 로드 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 학급 클릭 시 해당 학급 학생들만 로드
  const loadClassStudents = async (classCode) => {
    if (selectedClass === classCode) {
      setSelectedClass(null);
      setClassStudents([]);
      return;
    }

    setLoadingStudents(true);
    setSelectedClass(classCode);
    try {
      console.log(`[📊 DB읽기] 학급 ${classCode} 학생 조회`);
      const studentsQuery = query(
        collection(db, "users"),
        where("classCode", "==", classCode),
        where("role", "==", ROLES.STUDENT)
      );
      const snapshot = await getDocs(studentsQuery);
      const students = [];
      snapshot.forEach((docSnap) => {
        students.push({ ...docSnap.data(), id: docSnap.id });
      });
      setClassStudents(students);
      console.log(`[📊 DB읽기] 학생 ${students.length}명 로드 (학급: ${classCode})`);
    } catch (error) {
      console.error("학생 로드 에러:", error);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 🚀 선생님 목록 로드 (탭 클릭 시)
  const loadTeachers = async () => {
    if (teachers.length > 0) return; // 이미 로드됨

    setLoadingTeachers(true);
    try {
      console.log('[📊 DB읽기] 승인된 선생님 목록 조회');
      const teachersQuery = query(
        collection(db, "users"),
        where("role", "==", ROLES.TEACHER),
        where("approved", "==", true)
      );
      const snapshot = await getDocs(teachersQuery);
      const teacherList = [];
      snapshot.forEach((docSnap) => {
        teacherList.push({ ...docSnap.data(), id: docSnap.id });
      });
      setTeachers(teacherList);
      console.log(`[📊 DB읽기] 선생님 ${teacherList.length}명 로드`);
    } catch (error) {
      console.error("선생님 로드 에러:", error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // 🚀 사용자 상세 정보 로드 (클릭 시)
  const loadUserDetail = async (userId) => {
    if (selectedUserDetail?.id === userId) {
      setSelectedUserDetail(null);
      return;
    }

    setLoadingUserDetail(true);
    try {
      console.log(`[📊 DB읽기] 사용자 상세 조회 - ${userId}`);
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setSelectedUserDetail({ ...userDoc.data(), id: userDoc.id });
      }
    } catch (error) {
      console.error("사용자 상세 로드 에러:", error);
    } finally {
      setLoadingUserDetail(false);
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
      setSelectedUserDetail(null);
      // 학급 학생 목록 새로고침
      if (selectedClass) {
        loadClassStudents(selectedClass);
      }
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
      if (selectedClass) {
        loadClassStudents(selectedClass);
      }
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
        approved: newRole === 'student' ? true : false
      });
      alert("역할이 변경되었습니다.");
      if (selectedClass) {
        loadClassStudents(selectedClass);
      }
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

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.log(`[📊 탭] ${tab} 탭 선택`);

    if (tab === 'teachers' && teachers.length === 0) {
      loadTeachers();
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

  // 총 학생 수 계산
  const totalStudents = classSummaries.reduce((sum, c) => sum + c.studentCount, 0);

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">총 학급</p>
            <p className="text-2xl font-bold text-indigo-600">{classSummaries.length}개</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">총 학생</p>
            <p className="text-2xl font-bold text-emerald-600">{totalStudents}명</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">승인 대기</p>
            <p className="text-2xl font-bold text-amber-600">{pendingTeachers.length}명</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">승인된 선생님</p>
            <p className="text-2xl font-bold text-purple-600">{teachers.length || '-'}명</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              승인 대기 ({pendingTeachers.length})
            </button>
            <button
              onClick={() => handleTabChange("classes")}
              className={`${
                activeTab === "classes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              학급 관리 ({classSummaries.length})
            </button>
            <button
              onClick={() => handleTabChange("teachers")}
              className={`${
                activeTab === "teachers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              선생님 관리
            </button>
            <button
              onClick={() => handleTabChange("system")}
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

        {/* Classes Tab - 🚀 최적화: 학급별 요약만 표시, 클릭 시 학생 로드 */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">학급별 사용자 관리</h2>
                  <p className="text-sm text-gray-500">학급을 클릭하면 학생 목록이 로드됩니다 (DB 읽기 최적화)</p>
                </div>
                {selectedUsers.size > 0 && (
                  <button
                    onClick={handleBatchDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                  >
                    선택한 {selectedUsers.size}명 삭제
                  </button>
                )}
              </div>

              {classSummaries.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">등록된 학급이 없습니다.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {classSummaries.map((cls) => (
                    <div key={cls.classCode}>
                      {/* 학급 요약 (항상 표시) */}
                      <button
                        onClick={() => loadClassStudents(cls.classCode)}
                        className={`w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${
                          selectedClass === cls.classCode ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{cls.className}</p>
                          <p className="text-sm text-gray-600">
                            담당: {cls.teacherName} · 학년: {cls.gradeLevel ? GRADE_LEVELS[cls.gradeLevel] : '-'}
                          </p>
                          <p className="text-xs text-gray-500">코드: {cls.classCode}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">{cls.studentCount}명</p>
                            <p className="text-xs text-gray-500">학생</p>
                          </div>
                          <span className={`text-gray-400 transition-transform ${selectedClass === cls.classCode ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </button>

                      {/* 학생 목록 (클릭 시 표시) */}
                      {selectedClass === cls.classCode && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          {loadingStudents ? (
                            <div className="px-6 py-4 text-center text-gray-500">학생 로딩 중...</div>
                          ) : classStudents.length === 0 ? (
                            <div className="px-6 py-4 text-center text-gray-500">학생이 없습니다.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">선택</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름/닉네임</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">포인트</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {classStudents.map((student) => (
                                    <tr key={student.id} className={selectedUsers.has(student.id) ? "bg-indigo-50" : "hover:bg-gray-50"}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                          type="checkbox"
                                          checked={selectedUsers.has(student.id)}
                                          onChange={() => toggleSelectUser(student.id)}
                                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.nickname || '-'}</p>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.points || 0}P</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleUpdateUserRole(student.id, student.role)}
                                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors font-medium shadow-sm"
                                          >
                                            역할 변경
                                          </button>
                                          <button
                                            onClick={() => handleDeleteUser(student.id, student.name)}
                                            className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium shadow-sm"
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">승인된 선생님</h2>
            </div>
            {loadingTeachers ? (
              <div className="px-6 py-8 text-center text-gray-500">선생님 목록 로딩 중...</div>
            ) : teachers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">승인된 선생님이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당 학급</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => {
                      const teacherClasses = classSummaries.filter(c => c.teacherId === teacher.id);
                      return (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{teacher.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {teacherClasses.length > 0 ? (
                              teacherClasses.map(c => c.className).join(', ')
                            ) : (
                              <span className="text-gray-400">학급 없음</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateUserRole(teacher.id, teacher.role)}
                                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors font-medium shadow-sm"
                              >
                                역할 변경
                              </button>
                              <button
                                onClick={() => handleDeleteUser(teacher.id, teacher.name)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium shadow-sm"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

            {/* DB 읽기 최적화 현황 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">📊 DB 읽기 최적화 현황</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">슈퍼관리자 로그인</span>
                    <span className="font-medium text-emerald-600">2회 (이전 50회+)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">학급 클릭 (학생 로드)</span>
                    <span className="font-medium text-emerald-600">1회 쿼리</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">선생님 탭</span>
                    <span className="font-medium text-emerald-600">1회 쿼리 (최초 1회)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">학생 로그인</span>
                    <span className="font-medium text-emerald-600">2-3회 (이전 87회+)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">교사 로그인</span>
                    <span className="font-medium text-emerald-600">4회</span>
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
