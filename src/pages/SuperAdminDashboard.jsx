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

  // 🚀 선생님 수 (classes에서 계산 - 추가 DB 읽기 없음)
  const [teacherCount, setTeacherCount] = useState(0);

  // 🚀 선택된 사용자 상세 정보
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  // 🚀 거절된 사용자 목록
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loadingRejected, setLoadingRejected] = useState(false);

  useEffect(() => {
    ensureSuperAdminAccess(user);
    loadData();
  }, []);

  // 🚀 최적화: userData.classesSummary 사용 (DB 읽기 0회!)
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[📊 SuperAdmin] 데이터 로드 시작');

      // 1. 🚀 학급 요약은 userData에서 가져옴 (DB 읽기 0회!)
      if (userData.classesSummary && userData.classesSummary.length > 0) {
        console.log('[📊 캐시] userData.classesSummary 사용 (DB 읽기 0회!)');
        const classes = userData.classesSummary;
        setClassSummaries(classes);

        // 고유 선생님 수 계산
        const uniqueTeacherIds = new Set();
        classes.forEach(cls => {
          if (cls.teacherId) {
            uniqueTeacherIds.add(cls.teacherId);
          }
        });
        setTeacherCount(uniqueTeacherIds.size);
        console.log(`[📊 캐시] 학급 ${classes.length}개, 선생님 ${uniqueTeacherIds.size}명 (캐시에서 로드)`);
      } else {
        // classesSummary가 없는 경우 (최초 1회만) - DB에서 로드 후 동기화 트리거
        console.log('[📊 DB읽기] classesSummary 없음 - 동기화 실행');
        try {
          const syncFn = httpsCallable(functions, 'syncClassesSummary');
          await syncFn();
          console.log('[📊 동기화] classesSummary 동기화 완료 - 새로고침 필요');

          // 동기화 후 classes에서 직접 로드 (1회성)
          const classesQuery = query(collection(db, "classes"));
          const classesSnapshot = await getDocs(classesQuery);
          const classes = [];
          const uniqueTeacherIds = new Set();

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
            if (data.teacherId) {
              uniqueTeacherIds.add(data.teacherId);
            }
          });

          setClassSummaries(classes);
          setTeacherCount(uniqueTeacherIds.size);
        } catch (syncError) {
          console.warn('[📊 동기화] 실패:', syncError);
          setClassSummaries([]);
          setTeacherCount(0);
        }
      }

      // 2. 승인 대기 선생님 (보통 적음 - 1회 쿼리)
      // 🔧 수정: rejected가 true인 선생님은 제외
      console.log('[📊 DB읽기] 승인 대기 선생님 조회');
      const pendingQuery = query(
        collection(db, "users"),
        where("role", "==", ROLES.TEACHER),
        where("approved", "==", false)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pending = [];
      pendingSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // 🔧 rejected된 선생님은 목록에서 제외
        if (!data.rejected) {
          pending.push({ ...data, id: docSnap.id });
        }
      });
      setPendingTeachers(pending);
      console.log(`[📊 DB읽기] 승인 대기 선생님 ${pending.length}명 로드`);

      // 🚀 로그인 완료 요약
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[📊 슈퍼관리자 로그인 완료] 총 DB 읽기: 1회');
      console.log('  - users (승인대기): 1회 쿼리');
      console.log('  - classes: 0회 (userData.classesSummary 캐시 사용)');
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

  // 🚀 선생님 목록 생성 (classes에서 추출 - DB 읽기 0회!)
  // classSummaries가 변경될 때마다 선생님 목록 자동 생성
  const teachersFromClasses = (() => {
    const teacherMap = new Map();
    classSummaries.forEach(cls => {
      if (cls.teacherId && !teacherMap.has(cls.teacherId)) {
        teacherMap.set(cls.teacherId, {
          id: cls.teacherId,
          name: cls.teacherName || '알 수 없음',
          role: 'teacher'
        });
      }
    });
    return Array.from(teacherMap.values());
  })();

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

  const rejectTeacher = async (teacherId, teacherEmail) => {
    const reason = prompt(
      "거절 사유를 입력해주세요 (선생님이 로그인할 때 이 메시지를 볼 수 있습니다):",
      "선생님 인증 정보가 확인되지 않았습니다."
    );

    if (reason === null) return; // 취소 누름

    try {
      await updateDoc(doc(db, "users", teacherId), {
        approved: false,
        rejected: true,
        rejectedReason: reason || "관리자에 의해 거절되었습니다.",
        rejectedAt: new Date().toISOString()
      });
      alert(`요청이 거절되었습니다.\n\n${teacherEmail}님이 로그인하면 거절 메시지를 확인할 수 있습니다.`);
      loadData();
    } catch (error) {
      console.error("거절 에러:", error);
      alert("처리에 실패했습니다.");
    }
  };

  // 🚀 거절된 사용자 목록 조회
  const loadRejectedUsers = async () => {
    setLoadingRejected(true);
    try {
      console.log('[📊 DB읽기] 거절된 사용자 조회');
      // 🔧 인덱스 없이도 동작하도록 approved=false인 사용자를 가져와서 rejected 필터링
      const pendingQuery = query(
        collection(db, "users"),
        where("approved", "==", false)
      );
      const snapshot = await getDocs(pendingQuery);
      const users = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // rejected가 true인 사용자만 필터링
        if (data.rejected === true) {
          users.push({ ...data, id: docSnap.id });
        }
      });
      setRejectedUsers(users);
      console.log(`[📊 DB읽기] 거절된 사용자 ${users.length}명 로드`);
      if (users.length === 0) {
        alert("거절된 사용자가 없습니다.");
      }
    } catch (error) {
      console.error("거절된 사용자 조회 에러:", error);
      alert("조회에 실패했습니다: " + error.message);
    } finally {
      setLoadingRejected(false);
    }
  };

  // 🚀 거절된 사용자를 학생으로 변경
  const convertRejectedToStudent = async (userId, userName) => {
    if (!confirm(`${userName}님을 학생으로 변경하시겠습니까?\n\n변경 후 바로 로그인이 가능해집니다.`)) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), {
        role: 'student',
        approved: true,
        rejected: false,
        rejectedReason: null,
        rejectedAt: null
      });
      alert(`${userName}님이 학생으로 변경되었습니다.`);
      loadRejectedUsers(); // 목록 새로고침
    } catch (error) {
      console.error("역할 변경 에러:", error);
      alert("변경에 실패했습니다.");
    }
  };

  // 🚀 거절된 사용자를 선생님으로 승인
  const approveRejectedAsTeacher = async (userId, userName) => {
    if (!confirm(`${userName}님을 선생님으로 승인하시겠습니까?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), {
        role: 'teacher',
        approved: true,
        rejected: false,
        rejectedReason: null,
        rejectedAt: null
      });
      alert(`${userName}님이 선생님으로 승인되었습니다.`);
      loadRejectedUsers(); // 목록 새로고침
      loadData(); // 전체 데이터 새로고침
    } catch (error) {
      console.error("승인 에러:", error);
      alert("승인에 실패했습니다.");
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

  // 🧪 테스트 학생 지정/해제
  const handleToggleTestStudent = async (userId, currentIsTest) => {
    const newIsTest = !currentIsTest;
    const message = newIsTest
      ? '이 학생을 테스트 학생으로 지정하시겠습니까?\n\n테스트 학생은 글 제출 시 점수를 직접 선택할 수 있습니다.'
      : '테스트 학생 지정을 해제하시겠습니까?';

    if (!confirm(message)) return;

    try {
      await updateDoc(doc(db, "users", userId), {
        isTestStudent: newIsTest
      });
      alert(newIsTest ? '🧪 테스트 학생으로 지정되었습니다.' : '테스트 학생 지정이 해제되었습니다.');
      if (selectedClass) {
        loadClassStudents(selectedClass);
      }
    } catch (error) {
      console.error("테스트 학생 지정 에러:", error);
      alert("테스트 학생 지정에 실패했습니다.");
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
    // 🚀 선생님 목록은 classes에서 자동 생성되므로 별도 로드 불필요 (DB 읽기 0회)
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

  // 🚀 학급 정보 동기화 (선생님 이름 포함)
  const [syncing, setSyncing] = useState(false);

  const handleSyncClassesSummary = async () => {
    setSyncing(true);
    try {
      console.log('[📊 동기화] 학급 정보 동기화 시작');
      const syncFn = httpsCallable(functions, 'syncClassesSummary');
      await syncFn();
      alert('동기화 완료! 페이지를 새로고침합니다.');
      window.location.reload();
    } catch (error) {
      console.error("동기화 에러:", error);
      alert("동기화 실패: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // 🚀 중복 미제출글 정리
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  // 🚀 통과 점수 70점 마이그레이션
  const [migratingMinScore, setMigratingMinScore] = useState(false);
  const [minScoreResult, setMinScoreResult] = useState(null);

  const handleMigrateMinScore = async () => {
    if (!confirm("기존 글의 통과 점수를 70점으로 마이그레이션하시겠습니까?\n\n• 모든 writings의 minScore가 70점으로 업데이트됩니다\n• 모든 학생의 writingSummary가 업데이트됩니다\n• 모든 학급의 랭킹이 70점 기준으로 재계산됩니다")) {
      return;
    }

    setMigratingMinScore(true);
    setMinScoreResult(null);

    try {
      const migrateFn = httpsCallable(functions, 'migrateMinScoreTo70');
      const result = await migrateFn();
      setMinScoreResult(result.data);
      alert(`마이그레이션 완료!\n\n${result.data.message}`);
    } catch (error) {
      console.error("통과 점수 마이그레이션 에러:", error);
      alert("마이그레이션 실패: " + error.message);
      setMinScoreResult({ error: error.message });
    } finally {
      setMigratingMinScore(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!confirm("동일 주제의 중복 미제출글을 정리하시겠습니까?\n\n같은 주제에 여러 미제출글이 있는 경우, 가장 점수가 높은 글만 남기고 나머지는 삭제됩니다.")) {
      return;
    }

    setCleaningDuplicates(true);
    setCleanupResult(null);

    try {
      const cleanupFn = httpsCallable(functions, 'cleanupDuplicateFailedWritings');
      const result = await cleanupFn();
      setCleanupResult(result.data);
      alert(`정리 완료!

${result.data.message}`);
    } catch (error) {
      console.error("중복 정리 에러:", error);
      alert("정리 실패: " + error.message);
      setCleanupResult({ error: error.message });
    } finally {
      setCleaningDuplicates(false);
    }
  };

  // 🚀 학급 삭제 (학생 포함, 선생님 제외)
  const [deletingClass, setDeletingClass] = useState(null);

  const handleDeleteClass = async (classCode, className, studentCount) => {
    const confirmMessage = `정말 학급 "${className}" (${classCode})을 삭제하시겠습니까?\n\n⚠️ 경고: 이 작업은 취소할 수 없습니다!\n- 학생 ${studentCount}명의 계정이 완전히 삭제됩니다\n- 해당 학생들의 모든 글이 삭제됩니다\n- 학급의 모든 과제가 삭제됩니다\n- 선생님 계정은 유지됩니다\n\n삭제하려면 학급 코드 "${classCode}"를 입력하세요:`;

    const inputCode = prompt(confirmMessage);
    if (inputCode !== classCode) {
      if (inputCode !== null) {
        alert("학급 코드가 일치하지 않습니다. 삭제가 취소되었습니다.");
      }
      return;
    }

    setDeletingClass(classCode);

    try {
      const deleteClassFn = httpsCallable(functions, 'deleteClassWithStudents');
      const result = await deleteClassFn({ classCode });

      alert(`삭제 완료!\n\n${result.data.message}`);

      // 목록 새로고침
      setSelectedClass(null);
      setClassStudents([]);
      loadData();
    } catch (error) {
      console.error("학급 삭제 에러:", error);
      alert("학급 삭제 실패: " + error.message);
    } finally {
      setDeletingClass(null);
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
            <p className="text-2xl font-bold text-purple-600">{teacherCount}명</p>
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
                        onClick={() => rejectTeacher(teacher.id, teacher.email)}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(cls.classCode, cls.className, cls.studentCount);
                            }}
                            disabled={deletingClass === cls.classCode}
                            className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingClass === cls.classCode ? '삭제 중...' : '학급 삭제'}
                          </button>
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
                                            onClick={() => handleToggleTestStudent(student.id, student.isTestStudent)}
                                            className={`px-3 py-1.5 border rounded-lg transition-colors font-medium shadow-sm ${
                                              student.isTestStudent
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                            title={student.isTestStudent ? '테스트 모드 해제' : '테스트 학생 지정'}
                                          >
                                            {student.isTestStudent ? '🧪 테스트' : '테스트'}
                                          </button>
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

        {/* Teachers Tab - 🚀 classes에서 추출한 데이터 사용 (DB 읽기 0회) */}
        {activeTab === "teachers" && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">승인된 선생님</h2>
              <p className="text-sm text-gray-500">학급을 담당하는 선생님 목록 (DB 읽기 0회)</p>
            </div>
            {teachersFromClasses.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">학급을 담당하는 선생님이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당 학급</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">총 학생 수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachersFromClasses.map((teacher) => {
                      const teacherClasses = classSummaries.filter(c => c.teacherId === teacher.id);
                      const totalStudents = teacherClasses.reduce((sum, c) => sum + c.studentCount, 0);
                      return (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {teacherClasses.map(c => c.className).join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{totalStudents}명</td>
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

                {/* 학생 classCode 마이그레이션 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">학생 classCode 마이그레이션</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    특정 학급의 모든 학생에게 classCode를 일괄 적용합니다.<br/>
                    학급 코드가 삭제되었다가 복구된 경우나 학생 데이터가 누락된 경우 사용합니다.
                  </p>
                  <div className="flex gap-2 items-center">
                    <select
                      id="migrateClassSelect"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="">학급 선택...</option>
                      {classSummaries.map(cls => (
                        <option key={cls.classCode} value={cls.classCode}>
                          {cls.className} ({cls.classCode}) - {cls.studentCount || 0}명
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        const selectEl = document.getElementById('migrateClassSelect');
                        const classCode = selectEl?.value;
                        if (!classCode) {
                          alert('학급을 선택해주세요.');
                          return;
                        }
                        if (!confirm(`"${classSummaries.find(c => c.classCode === classCode)?.className}" 학급의 모든 학생에게 classCode를 적용하시겠습니까?`)) {
                          return;
                        }
                        try {
                          const migrateFn = httpsCallable(functions, 'migrateStudentsClassCode');
                          const result = await migrateFn({ classCode });
                          alert(`마이그레이션 완료!\n\n학급: ${result.data.className}\n학생: ${result.data.studentsUpdated}명\n글: ${result.data.writingsUpdated}개`);
                        } catch (error) {
                          console.error("학생 마이그레이션 에러:", error);
                          alert("마이그레이션 실패: " + error.message);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      학생 classCode 적용
                    </button>
                    <button
                      onClick={async () => {
                        const selectEl = document.getElementById('migrateClassSelect');
                        const classCode = selectEl?.value;
                        if (!classCode) {
                          alert('학급을 선택해주세요.');
                          return;
                        }
                        const className = classSummaries.find(c => c.classCode === classCode)?.className;
                        if (!confirm(`"${className}" 학급의 제출 현황을 복구하시겠습니까?\n\n기존 글(writings)에서 과제 제출 현황(submissions)을 다시 계산합니다.`)) {
                          return;
                        }
                        try {
                          const { migrateAssignmentSubmissions } = await import('../services/assignmentService');
                          const result = await migrateAssignmentSubmissions(classCode);
                          if (result.success) {
                            alert(`제출 현황 복구 완료!\n\n학급: ${className}\n과제: ${result.migratedCount}개 업데이트됨`);
                          } else {
                            alert('복구 실패: ' + result.error);
                          }
                        } catch (error) {
                          console.error("제출 현황 복구 에러:", error);
                          alert("복구 실패: " + error.message);
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      제출 현황 복구
                    </button>
                  </div>
                </div>

                {/* 통과 점수 70점 마이그레이션 */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-purple-800 mb-2">통과 점수 70점 마이그레이션</h3>
                  <p className="text-sm text-purple-700 mb-3">
                    기존 글과 통계의 통과 기준을 70점으로 일괄 변경합니다.<br/>
                    이전에 80점 기준으로 "미통과"였던 글이 70점 이상이면 "통과"로 바뀝니다.
                  </p>
                  <ul className="text-xs text-purple-600 mb-4 list-disc list-inside space-y-1">
                    <li>모든 writings 문서의 minScore → 70점</li>
                    <li>모든 학생의 writingSummary 업데이트</li>
                    <li>모든 학급 랭킹 재계산 (70점 통과 기준)</li>
                  </ul>
                  <button
                    onClick={handleMigrateMinScore}
                    disabled={migratingMinScore}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {migratingMinScore ? '마이그레이션 중...' : '통과 점수 70점 마이그레이션 실행'}
                  </button>
                  {minScoreResult && (
                    <div className={`mt-4 p-3 rounded-lg ${minScoreResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {minScoreResult.error ? (
                        <p>오류: {minScoreResult.error}</p>
                      ) : (
                        <div>
                          <p className="font-medium">{minScoreResult.message}</p>
                          {minScoreResult.details && (
                            <p className="text-sm mt-1">
                              글 {minScoreResult.details.writingsUpdated}개, 사용자 {minScoreResult.details.usersUpdated}명,
                              랭킹 {minScoreResult.details.classesUpdated}개 학급 업데이트
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 중복 미제출글 정리 */}
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <h3 className="font-medium text-rose-800 mb-2">중복 미제출글 정리</h3>
                  <p className="text-sm text-rose-700 mb-3">
                    같은 주제에 여러 미제출글이 있는 경우, 점수가 가장 높은 글만 남기고 나머지를 삭제합니다.<br/>
                    24시간 이내 글도 포함됩니다.
                  </p>
                  <ul className="text-xs text-rose-600 mb-4 list-disc list-inside space-y-1">
                    <li>학생별 + 주제별로 미제출글 그룹화</li>
                    <li>같은 주제에서 최고 점수 글만 유지</li>
                    <li>users.writingSummary에서도 동기화 삭제</li>
                  </ul>
                  <button
                    onClick={handleCleanupDuplicates}
                    disabled={cleaningDuplicates}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cleaningDuplicates ? '정리 중...' : '중복 미제출글 정리 실행'}
                  </button>
                  {cleanupResult && (
                    <div className={`mt-4 p-3 rounded-lg ${cleanupResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {cleanupResult.error ? (
                        <p>오류: {cleanupResult.error}</p>
                      ) : (
                        <div>
                          <p className="font-medium">{cleanupResult.message}</p>
                          {cleanupResult.summaryUpdated > 0 && (
                            <p className="text-sm mt-1">{cleanupResult.summaryUpdated}명의 writingSummary 업데이트됨</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 학급/선생님 정보 동기화 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-blue-800 mb-2">학급 정보 동기화</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    학급 정보와 담당 선생님 이름을 동기화합니다.<br/>
                    선생님 이름이 "알 수 없음"으로 표시될 때 실행하세요.
                  </p>
                  <ul className="text-xs text-blue-600 mb-4 list-disc list-inside space-y-1">
                    <li>모든 학급의 담당 선생님 이름 조회</li>
                    <li>classes 문서에 teacherName 저장</li>
                    <li>슈퍼관리자 userData에 캐시 저장 (DB 읽기 최적화)</li>
                  </ul>
                  <button
                    onClick={handleSyncClassesSummary}
                    disabled={syncing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncing ? '동기화 중...' : '학급 정보 동기화 실행'}
                  </button>
                </div>
              </div>
            </div>

            {/* 🚀 거절된 사용자 관리 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">거절된 사용자 관리</h2>
                  <p className="text-sm text-gray-500 mt-1">승인 거부된 사용자를 학생/선생님으로 변경할 수 있습니다</p>
                </div>
                <button
                  onClick={loadRejectedUsers}
                  disabled={loadingRejected}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loadingRejected ? '조회 중...' : '거절된 사용자 조회'}
                </button>
              </div>
              {rejectedUsers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {rejectedUsers.map((user) => (
                    <div key={user.id} className="px-6 py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{user.name || user.nickname || '이름 없음'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          역할: {user.role === 'teacher' ? '선생님' : '학생'} ·
                          거절일: {user.rejectedAt ? new Date(user.rejectedAt).toLocaleDateString() : '-'}
                        </p>
                        {user.rejectedReason && (
                          <p className="text-xs text-red-500 mt-1">사유: {user.rejectedReason}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => convertRejectedToStudent(user.id, user.name || user.email)}
                          className="bg-emerald-500 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-600"
                        >
                          학생으로 변경
                        </button>
                        <button
                          onClick={() => approveRejectedAsTeacher(user.id, user.name || user.email)}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600"
                        >
                          선생님으로 승인
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  {loadingRejected ? '조회 중...' : '위의 "거절된 사용자 조회" 버튼을 클릭하세요'}
                </div>
              )}
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
