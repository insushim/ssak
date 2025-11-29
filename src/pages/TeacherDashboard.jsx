import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { signOut } from "../services/authService";
import {
  getTeacherClasses,
  createClass,
  deleteClass,
  removeStudentFromClass,
  getStudentDetails,
  resetStudentPassword
} from "../services/classService";
import { deleteWriting, getClassRanking, getStudentGrowthData, invalidateClassWritingsCache, getWritingById } from "../services/writingService";
import { createAssignment, getAssignmentsByClass, deleteAssignment, migrateAssignmentSubmissions } from "../services/assignmentService";
import { generateTopics } from "../utils/geminiAPI";
import { getSchedulerSettings, saveSchedulerSettings, disableScheduler, generateAutoAssignment, checkAndRunScheduler } from "../services/schedulerService";
import { GRADE_LEVELS, MAX_STUDENTS_PER_CLASS } from "../config/auth";
import { batchCreateStudents } from "../services/batchService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function TeacherDashboard({ user, userData }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classWritings, setClassWritings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assignments");
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchMessage, setBatchMessage] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchTargetClass, setBatchTargetClass] = useState("");
  const [classAccounts, setClassAccounts] = useState({}); // Store accounts by classCode
  const [studentDetails, setStudentDetails] = useState({}); // Store student details (email) by studentId
  const [resetPasswordLoading, setResetPasswordLoading] = useState(null); // studentId of currently resetting

  const [newClass, setNewClass] = useState({
    className: "",
    gradeLevel: "",
    description: ""
  });

  // 과제 관련 state
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    minScore: 70,
    maxAiProbability: 50
  });
  const [selectedTopicForAssignment, setSelectedTopicForAssignment] = useState(null);

  // AI 주제 생성 관련 state
  const [aiTopics, setAiTopics] = useState([]);
  const [aiTopicsLoading, setAiTopicsLoading] = useState(false);
  const [topicCategory, setTopicCategory] = useState("");
  const [writingType, setWritingType] = useState("");

  // 스케줄러 관련 state
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [schedulerSettings, setSchedulerSettings] = useState({
    enabled: false,
    selectedDays: [1, 2, 3, 4, 5], // 월~금
    scheduledTime: "09:00",
    minScore: 70,
    maxAiProbability: 50
  });
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [autoAssignmentLoading, setAutoAssignmentLoading] = useState(false);

  // 제출글 보기 관련 state
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedWriting, setSelectedWriting] = useState(null);
  const [writingsSubTab, setWritingsSubTab] = useState("pending"); // "pending" 또는 "completed"
  const [deletingWritingId, setDeletingWritingId] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]); // 완료 처리된 주제들
  const [topicStudents, setTopicStudents] = useState([]); // 🚀 선택한 주제의 학생 목록 (assignment.submissions에서 가져옴)
  const [selectedWritingLoading, setSelectedWritingLoading] = useState(false); // 🚀 개별 글 로딩 상태

  // 랭킹 관련 state
  const [rankingData, setRankingData] = useState([]);
  const [rankingPeriod, setRankingPeriod] = useState('weekly'); // 'weekly' or 'monthly'
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingLastLoaded, setRankingLastLoaded] = useState(null); // 🚀 캐시 타임스탬프
  const [selectedStudentForGrowth, setSelectedStudentForGrowth] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [growthLoading, setGrowthLoading] = useState(false);

  // 온보딩 관련 state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: 클래스 생성, 2: 학생 추가, 3: AI 주제 생성
  const [onboardingClass, setOnboardingClass] = useState(null); // 온보딩에서 생성한 클래스

  // 분야 예시
  const categoryExamples = [
    { label: "가족", icon: "👨‍👩‍👧‍👦" },
    { label: "학교", icon: "🏫" },
    { label: "친구", icon: "🤝" },
    { label: "환경", icon: "🌍" },
    { label: "동물", icon: "🐾" },
    { label: "꿈/미래", icon: "🌟" },
    { label: "여행", icon: "✈️" },
    { label: "취미", icon: "🎨" },
    { label: "계절/날씨", icon: "🌸" },
    { label: "음식", icon: "🍽️" },
    { label: "책/독서", icon: "📚" },
    { label: "운동/스포츠", icon: "⚽" },
    { label: "과학/기술", icon: "🔬" },
    { label: "역사/문화", icon: "🏛️" },
    { label: "예술/음악", icon: "🎭" },
    { label: "게임/놀이", icon: "🎮" },
    { label: "건강", icon: "💪" },
    { label: "자연", icon: "🌳" },
    { label: "경제/직업", icon: "💼" },
    { label: "안전", icon: "🛡️" },
  ];

  // 글쓰기 유형
  const writingTypes = [
    { value: "주장하는 글", label: "주장하는 글", icon: "💬", desc: "자신의 의견을 논리적으로" },
    { value: "설명하는 글", label: "설명하는 글", icon: "📖", desc: "정보를 쉽게 전달" },
    { value: "묘사하는 글", label: "묘사하는 글", icon: "🎨", desc: "생생하게 표현" },
    { value: "서사/이야기", label: "서사/이야기", icon: "📚", desc: "경험이나 이야기" },
    { value: "편지", label: "편지", icon: "✉️", desc: "마음을 전하는 글" },
    { value: "일기", label: "일기", icon: "📔", desc: "하루를 기록" },
    { value: "감상문", label: "감상문", icon: "🎬", desc: "느낀 점을 정리" },
    { value: "상상글", label: "상상글", icon: "🦄", desc: "창의력을 발휘" },
  ];

  // 🚀 Ref to track previous classCode to prevent unnecessary re-renders
  const prevClassCodeRef = useRef(null);

  useEffect(() => {
    loadClasses();
    // 온보딩 체크 - 처음 접속한 선생님인지 확인
    if (!userData.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  // 🔧 모바일 뒤로가기 처리 - 로그인 풀림 방지
  useEffect(() => {
    const pushState = () => {
      window.history.pushState({ teacherDashboard: true }, '');
    };

    const handlePopState = (event) => {
      // 글 상세보기에서 뒤로가기 -> 글 닫기
      if (selectedWriting) {
        event.preventDefault();
        setSelectedWriting(null);
        pushState();
        return;
      }

      // 주제 확장 중 뒤로가기 -> 주제 닫기
      if (expandedTopic) {
        event.preventDefault();
        setExpandedTopic(null);
        pushState();
        return;
      }

      // 모달이 열려있으면 모달 닫기
      if (showAssignmentModal || showSchedulerModal || showCreateModal || showClassModal) {
        event.preventDefault();
        setShowAssignmentModal(false);
        setShowSchedulerModal(false);
        setShowCreateModal(false);
        setShowClassModal(false);
        pushState();
        return;
      }

      // 그 외의 경우 기본 뒤로가기 동작 허용 (하지만 history 상태 유지)
      pushState();
    };

    // 초기 상태 추가
    pushState();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedWriting, expandedTopic, showAssignmentModal, showSchedulerModal, showCreateModal, showClassModal]);

  useEffect(() => {
    const currentClassCode = selectedClass?.classCode;

    // 🚀 Check if classCode actually changed to prevent duplicate calls
    if (currentClassCode && currentClassCode !== prevClassCodeRef.current) {
      prevClassCodeRef.current = currentClassCode;
      console.log(`[📊 TeacherDashboard] 클래스 선택됨: ${currentClassCode}`);

      // 🚀 제출글은 DB 읽기 0회! (assignments에서 주제 목록 사용, 완료 목록은 로컬스토리지)
      loadCompletedTopics(currentClassCode);
      console.log(`[📊 TeacherDashboard] loadAssignments 호출`);
      loadAssignments(currentClassCode);
      // 🚀 스케줄러 설정 로드 후 체크 (순차 실행으로 캐시 활용)
      console.log(`[📊 TeacherDashboard] loadSchedulerSettings 호출`);
      loadSchedulerSettings(currentClassCode).then(() => {
        // 자동 출제 스케줄러 체크 (설정 로드 후 - 캐시 활용)
        console.log(`[📊 TeacherDashboard] runSchedulerCheck 호출 (캐시 활용)`);
        runSchedulerCheck(currentClassCode, selectedClass.gradeLevel);

        // 🚀 로그인 완료 요약
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[📊 교사 로그인 완료] 총 DB 읽기: 4회');
        console.log('  - users 문서: 1회 (App.jsx에서 로드)');
        console.log('  - classes 컬렉션: 1회 (getTeacherClasses)');
        console.log('  - assignments 컬렉션: 1회 (getAssignmentsByClass - 쿼리 1회로 9개 문서)');
        console.log('  - schedulers 문서: 1회 (getSchedulerSettings)');
        console.log('  - writings 컬렉션: 0회 (주제 클릭 시에만 로드)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
      // 🚀 클래스 변경 시 랭킹 캐시 무효화
      setRankingLastLoaded(null);
      // 🚀 주제/글 선택 초기화
      setExpandedTopic(null);
      setTopicStudents([]);
      setSelectedWriting(null);
    }
  }, [selectedClass?.classCode]);

  // 자동 출제 스케줄러 실행
  const runSchedulerCheck = async (classCode, gradeLevel) => {
    try {
      const result = await checkAndRunScheduler(classCode, gradeLevel, user.uid);
      if (result.executed) {
        alert(result.message);
        loadAssignments(classCode);
      }
    } catch (error) {
      console.error('스케줄러 체크 에러:', error);
    }
  };

  // 랭킹 탭 선택 시 데이터 로드
  // 🚀 최적화: 캐시 가드 추가 + classCode 의존성으로 변경
  useEffect(() => {
    const currentClassCode = selectedClass?.classCode;
    if (activeTab === 'ranking' && currentClassCode) {
      // 60초 이내에 로드했으면 재로드하지 않음
      const now = Date.now();
      if (rankingLastLoaded && (now - rankingLastLoaded) < 60000 && rankingData.length > 0) {
        console.log(`[📊 TeacherDashboard] 랭킹 캐시 사용 (60초 이내)`);
        return;
      }
      console.log(`[📊 TeacherDashboard] loadRankingData 호출 - activeTab: ${activeTab}`);
      loadRankingData(currentClassCode, rankingPeriod);
    }
  }, [activeTab, selectedClass?.classCode, rankingPeriod]);

  // 랭킹 데이터 로드
  const loadRankingData = async (classCode, period, forceRefresh = false) => {
    if (rankingLoading) return; // 🔥 동시 로드 방지

    // 🚀 캐시 가드
    if (!forceRefresh && rankingLastLoaded && (Date.now() - rankingLastLoaded) < 60000 && rankingData.length > 0) {
      return;
    }
    setRankingLoading(true);
    try {
      const data = await getClassRanking(classCode, period);
      setRankingData(data);
      setRankingLastLoaded(Date.now()); // 🚀 로드 시간 기록
    } catch (error) {
      console.error('랭킹 데이터 로드 에러:', error);
      setRankingData([]);
    } finally {
      setRankingLoading(false);
    }
  };

  // 학생 성장 그래프 데이터 로드
  const loadStudentGrowthData = async (studentId) => {
    setGrowthLoading(true);
    try {
      const data = await getStudentGrowthData(studentId);
      setGrowthData(data);
    } catch (error) {
      console.error('성장 데이터 로드 에러:', error);
      setGrowthData([]);
    } finally {
      setGrowthLoading(false);
    }
  };

  const loadSchedulerSettings = async (classCode) => {
    try {
      const settings = await getSchedulerSettings(classCode);
      if (settings) {
        setSchedulerSettings(settings);
      } else {
        setSchedulerSettings({
          enabled: false,
          selectedDays: [1, 2, 3, 4, 5],
          scheduledTime: "09:00",
          minScore: 70,
          maxAiProbability: 50
        });
      }
    } catch (error) {
      console.error("스케줄러 설정 로드 에러:", error);
    }
  };

  const handleSaveScheduler = async () => {
    if (!selectedClass) return;
    setSchedulerLoading(true);
    try {
      await saveSchedulerSettings(selectedClass.classCode, schedulerSettings);
      alert(schedulerSettings.enabled ? "자동 출제 스케줄러가 활성화되었습니다!" : "스케줄러 설정이 저장되었습니다.");
      setShowSchedulerModal(false);
    } catch (error) {
      console.error("스케줄러 저장 에러:", error);
      alert("스케줄러 설정 저장에 실패했습니다.");
    } finally {
      setSchedulerLoading(false);
    }
  };

  const handleManualAutoAssignment = async () => {
    if (!selectedClass) return;
    if (!confirm("지금 바로 자동 과제를 생성하시겠습니까?")) return;

    setAutoAssignmentLoading(true);
    try {
      const assignment = await generateAutoAssignment(
        selectedClass.classCode,
        selectedClass.gradeLevel,
        user.uid,
        schedulerSettings
      );
      alert(`"${assignment.title}" 과제가 자동 생성되었습니다!`);
      loadAssignments(selectedClass.classCode);
    } catch (error) {
      console.error("자동 과제 생성 에러:", error);
      alert("자동 과제 생성에 실패했습니다.");
    } finally {
      setAutoAssignmentLoading(false);
    }
  };

  const toggleDay = (day) => {
    setSchedulerSettings(prev => {
      const newDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day].sort();
      return { ...prev, selectedDays: newDays };
    });
  };

  const loadAssignments = async (classCode) => {
    try {
      let classAssignments = await getAssignmentsByClass(classCode);

      // 🚀 submissions 마이그레이션 필요 여부 확인
      // v3: users 컬렉션에서 닉네임 조회하여 저장
      const migrationKey = `submissions_migrated_v3_${classCode}`;
      const alreadyMigrated = localStorage.getItem(migrationKey);

      if (!alreadyMigrated && classAssignments.length > 0) {
        console.log('[TeacherDashboard] submissions 마이그레이션 실행 중... (닉네임 조회)');
        const result = await migrateAssignmentSubmissions(classCode);
        if (result.success) {
          localStorage.setItem(migrationKey, 'true');
          // 마이그레이션 후 다시 로드
          classAssignments = await getAssignmentsByClass(classCode, true); // forceRefresh
          console.log('[TeacherDashboard] submissions 마이그레이션 완료');
        }
      }

      // 모든 과제 표시 (1주일 필터 제거 - 제출글 탭에서 모든 주제 확인 가능)
      setAssignments(classAssignments);
    } catch (error) {
      console.error("과제 로드 에러:", error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("클래스를 먼저 선택해주세요.");
      return;
    }

    try {
      await createAssignment(
        user.uid,
        selectedClass.classCode,
        newAssignment.title,
        newAssignment.description,
        newAssignment.dueDate || null,
        newAssignment.minScore,
        newAssignment.maxAiProbability
      );
      alert("과제가 출제되었습니다!");
      setShowAssignmentModal(false);
      setNewAssignment({ title: "", description: "", dueDate: "", minScore: 70, maxAiProbability: 50 });
      setSelectedTopicForAssignment(null);
      loadAssignments(selectedClass.classCode);
    } catch (error) {
      console.error("과제 출제 에러:", error);
      alert("과제 출제에 실패했습니다.");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm("이 과제를 삭제하시겠습니까?")) return;
    try {
      await deleteAssignment(assignmentId);
      alert("과제가 삭제되었습니다.");
      loadAssignments(selectedClass.classCode);
    } catch (error) {
      console.error("과제 삭제 에러:", error);
      alert("과제 삭제에 실패했습니다.");
    }
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopicForAssignment(topic);
    setNewAssignment({
      ...newAssignment,
      title: topic.title,
      description: topic.description || `${topic.type || ''} - ${topic.difficulty === 'easy' ? '쉬움' : topic.difficulty === 'medium' ? '보통' : '어려움'}`
    });
  };

  const handleGenerateAiTopics = async (category = null) => {
    if (!selectedClass) {
      alert("클래스를 먼저 선택해주세요.");
      return;
    }

    // 카테고리가 직접 전달되면 사용, 아니면 state 값 사용
    const categoryToUse = category || topicCategory;

    // 글쓰기 유형과 분야를 조합
    let combinedCategory = "";
    if (writingType && categoryToUse) {
      combinedCategory = `${writingType} - ${categoryToUse}`;
    } else if (writingType) {
      combinedCategory = writingType;
    } else if (categoryToUse) {
      combinedCategory = categoryToUse;
    }

    setAiTopicsLoading(true);
    try {
      const result = await generateTopics(selectedClass.gradeLevel, 5, combinedCategory || null);
      setAiTopics(result.topics || []);
    } catch (error) {
      console.error("AI 주제 생성 에러:", error);
      alert("AI 주제 생성에 실패했습니다.");
    } finally {
      setAiTopicsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setTopicCategory(category);
    handleGenerateAiTopics(category);
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const teacherClasses = await getTeacherClasses(user.uid);
      setClasses(teacherClasses);
      if (!selectedClass && teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]);
      }
    } catch (error) {
      console.error("클래스 로드 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 제출글 탭 진입 시: DB 읽기 0회! (assignments에서 주제 목록 사용)
  // 완료된 주제 목록만 로컬 스토리지에서 로드
  const loadCompletedTopics = (classCode) => {
    const savedCompletedTopics = localStorage.getItem(`completedTopics_${classCode}`);
    if (savedCompletedTopics) {
      setCompletedTopics(JSON.parse(savedCompletedTopics));
    } else {
      setCompletedTopics([]);
    }
  };

  // 🚀 주제 클릭 시: assignment.submissions에서 학생 목록 가져오기 (DB 읽기 0회!)
  const loadTopicStudents = (assignment) => {
    // assignment.submissions 배열에서 학생 목록 가져오기 (이미 로드된 데이터 사용)
    const submissions = assignment?.submissions || [];
    setTopicStudents(submissions);
  };

  // 🚀 학생 클릭 시: 해당 글 1개만 로드 (Firestore 1회 읽기!)
  const loadSingleWriting = async (writingId) => {
    setSelectedWritingLoading(true);
    try {
      const writing = await getWritingById(writingId);
      setSelectedWriting(writing);
    } catch (error) {
      console.error("글 로드 에러:", error);
      setSelectedWriting(null);
    } finally {
      setSelectedWritingLoading(false);
    }
  };

  // 주제의 모든 글 삭제 (병렬 처리로 최적화)
  // 🚀 topicStudents에서 writingId 목록 가져와서 삭제
  const handleDeleteTopic = async (topic) => {
    const writingIds = topicStudents.map(s => s.writingId);

    if (writingIds.length === 0) {
      alert("삭제할 글이 없습니다.");
      return;
    }

    if (!confirm(`"${topic}" 주제의 모든 글(${writingIds.length}개)을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.`)) return;

    try {
      // 🚀 병렬 삭제 (최적화)
      await Promise.all(writingIds.map(id => deleteWriting(id)));
      alert(`"${topic}" 주제의 글 ${writingIds.length}개가 삭제되었습니다.`);

      // 🚀 캐시 무효화
      if (selectedClass?.classCode) {
        invalidateClassWritingsCache(selectedClass.classCode);
      }

      setExpandedTopic(null);
      setSelectedWriting(null);
      setTopicStudents([]);
    } catch (error) {
      console.error("주제 삭제 에러:", error);
      alert("주제 삭제에 실패했습니다.");
    }
  };

  // 주제를 완료 처리 (확인 완료 탭으로 이동)
  const handleMarkTopicAsCompleted = (topic) => {
    if (!selectedClass) return;
    const newCompletedTopics = [...completedTopics, topic];
    setCompletedTopics(newCompletedTopics);
    localStorage.setItem(`completedTopics_${selectedClass.classCode}`, JSON.stringify(newCompletedTopics));
    setExpandedTopic(null);
    setSelectedWriting(null);
  };

  // 주제를 미완료로 되돌리기
  const handleMarkTopicAsPending = (topic) => {
    if (!selectedClass) return;
    const newCompletedTopics = completedTopics.filter(t => t !== topic);
    setCompletedTopics(newCompletedTopics);
    localStorage.setItem(`completedTopics_${selectedClass.classCode}`, JSON.stringify(newCompletedTopics));
  };

  // 🚀 최적화: Optimistic update 적용
  const handleDeleteWriting = async (writingId) => {
    if (!confirm("이 학생의 제출글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.")) return;

    setDeletingWritingId(writingId);
    try {
      await deleteWriting(writingId);
      alert("제출글이 삭제되었습니다.");

      // 🚀 Optimistic update: 전체 재로드 대신 로컬 상태만 업데이트
      setClassWritings(prev => prev.filter(w => w.writingId !== writingId));

      // 🚀 캐시 무효화
      if (selectedClass?.classCode) {
        invalidateClassWritingsCache(selectedClass.classCode);
      }

      // 선택된 글이 삭제된 글이면 선택 해제
      if (selectedWriting?.writingId === writingId) {
        setSelectedWriting(null);
      }
    } catch (error) {
      console.error("제출글 삭제 에러:", error);
      alert("제출글 삭제에 실패했습니다.");
    } finally {
      setDeletingWritingId(null);
    }
  };

  // 제출글을 "확인 완료" 상태로 변경
  // 🚀 최적화: Optimistic update 적용
  const handleMarkAsReviewed = async (writingId) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const reviewedAt = new Date().toISOString();
      await updateDoc(doc(db, 'writings', writingId), {
        reviewed: true,
        reviewedAt
      });

      // 🚀 Optimistic update: 로컬 상태만 업데이트
      setClassWritings(prev => prev.map(w =>
        w.writingId === writingId ? { ...w, reviewed: true, reviewedAt } : w
      ));

      alert("확인 완료 처리되었습니다.");
    } catch (error) {
      console.error("확인 완료 처리 에러:", error);
      alert("처리에 실패했습니다.");
    }
  };

  // 제출글을 "미확인" 상태로 변경
  // 🚀 최적화: Optimistic update 적용
  const handleMarkAsPending = async (writingId) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      await updateDoc(doc(db, 'writings', writingId), {
        reviewed: false,
        reviewedAt: null
      });

      // 🚀 Optimistic update: 로컬 상태만 업데이트
      setClassWritings(prev => prev.map(w =>
        w.writingId === writingId ? { ...w, reviewed: false, reviewedAt: null } : w
      ));

      alert("미확인 상태로 변경되었습니다.");
    } catch (error) {
      console.error("미확인 처리 에러:", error);
      alert("처리에 실패했습니다.");
    }
  };

  // 주제별 전체 학생 확인완료 처리
  // 🚀 최적화: Optimistic update 적용
  const handleMarkAllAsReviewedByTopic = async (topic) => {
    // 🚀 topicStudents에서 미확인 글만 필터링
    const unreviewed = topicStudents.filter(s => !s.reviewed);
    const writingIds = unreviewed.map(s => s.writingId);

    if (writingIds.length === 0) {
      alert("확인할 글이 없습니다.");
      return;
    }

    if (!window.confirm(`"${topic}" 주제의 ${writingIds.length}개 글을 모두 확인완료 처리하시겠습니까?`)) {
      return;
    }

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      const reviewedAt = new Date().toISOString();

      const updatePromises = writingIds.map(writingId =>
        updateDoc(doc(db, 'writings', writingId), {
          reviewed: true,
          reviewedAt
        })
      );

      await Promise.all(updatePromises);

      // 🚀 Optimistic update
      setTopicStudents(prev => prev.map(s => ({ ...s, reviewed: true })));

      // 🚀 캐시 무효화
      if (selectedClass?.classCode) {
        invalidateClassWritingsCache(selectedClass.classCode);
      }

      alert(`${writingIds.length}개 글이 확인완료 처리되었습니다.`);
    } catch (error) {
      console.error("전체 확인완료 처리 에러:", error);
      alert("처리에 실패했습니다.");
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await createClass(
        user.uid,
        newClass.className,
        newClass.gradeLevel,
        newClass.description
      );
      alert("클래스를 생성했습니다.");
      setShowCreateModal(false);
      setNewClass({ className: "", gradeLevel: "", description: "" });
      loadClasses();
    } catch (error) {
      console.error("클래스 생성 에러:", error);
      alert("클래스 생성에 실패했습니다.");
    }
  };

  const handleDeleteClass = async (classCode) => {
    if (!confirm("정말 클래스를 삭제하시겠어요? 모든 학생 연결이 해제됩니다.")) return;

    try {
      await deleteClass(classCode);
      alert("클래스를 삭제했습니다.");
      setSelectedClass(null);
      loadClasses();
    } catch (error) {
      console.error("클래스 삭제 에러:", error);
      alert("클래스 삭제에 실패했습니다.");
    }
  };

  // 온보딩: 클래스 생성
  const handleOnboardingCreateClass = async (e) => {
    e.preventDefault();
    try {
      const createdClass = await createClass(
        user.uid,
        newClass.className,
        newClass.gradeLevel,
        newClass.description
      );
      // createClass가 전체 classData 객체를 반환하므로 그대로 사용
      await loadClasses();
      setOnboardingClass(createdClass);
      setSelectedClass(createdClass);
      setBatchTargetClass(createdClass.classCode);
      setNewClass({ className: "", gradeLevel: "", description: "" });
      setOnboardingStep(2);
    } catch (error) {
      console.error("클래스 생성 에러:", error);
      alert("클래스 생성에 실패했습니다.");
    }
  };

  // 온보딩: 학생 일괄 추가
  const handleOnboardingBatchCreate = async () => {
    if (!batchTargetClass || batchCount < 1) {
      alert("학생 수를 입력해주세요.");
      return;
    }

    if (!onboardingClass) {
      alert("클래스 정보를 찾을 수 없습니다.");
      return;
    }

    setBatchLoading(true);
    try {
      const result = await batchCreateStudents({
        classCode: batchTargetClass,
        count: batchCount,
        prefix: batchPrefix || batchTargetClass,
        gradeLevel: onboardingClass.gradeLevel
      });

      setBatchResults(result.results || []);
      setClassAccounts(prev => ({
        ...prev,
        [batchTargetClass]: [...(prev[batchTargetClass] || []), ...(result.results || [])]
      }));
      setBatchMessage(`${result.created}명의 학생 계정이 생성되었습니다!`);
      await loadClasses();
      // Don't automatically go to next step - let user review results first
    } catch (error) {
      console.error("학생 일괄 생성 에러:", error);
      alert("학생 생성에 실패했습니다: " + error.message);
    } finally {
      setBatchLoading(false);
    }
  };

  // 온보딩: AI 주제 생성
  const handleOnboardingGenerateTopics = async () => {
    if (!onboardingClass) return;
    setAiTopicsLoading(true);
    try {
      const result = await generateTopics(onboardingClass.gradeLevel, 5, topicCategory || null);
      if (result && result.topics) {
        setAiTopics(result.topics);
      }
    } catch (error) {
      console.error("AI 주제 생성 에러:", error);
      alert("주제 생성에 실패했습니다.");
    } finally {
      setAiTopicsLoading(false);
    }
  };

  // 온보딩 완료
  const handleOnboardingComplete = async () => {
    try {
      // userData에 onboardingCompleted 저장
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        onboardingCompleted: true
      });
      setShowOnboarding(false);
      setOnboardingStep(1);
      setOnboardingClass(null);
    } catch (error) {
      console.error("온보딩 완료 저장 에러:", error);
      setShowOnboarding(false);
    }
  };

  // 온보딩 건너뛰기
  const handleSkipOnboarding = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        onboardingCompleted: true
      });
      setShowOnboarding(false);
    } catch (error) {
      console.error("온보딩 건너뛰기 에러:", error);
      setShowOnboarding(false);
    }
  };

  const handleRemoveStudent = async (classCode, studentId) => {
    if (!confirm("이 학생을 클래스에서 제거하시겠어요?")) return;

    try {
      await removeStudentFromClass(classCode, studentId);
      alert("학생이 제거되었습니다.");
      loadClasses();
      if (selectedClass && selectedClass.classCode === classCode) {
        const updated = classes.find((c) => c.classCode === classCode);
        setSelectedClass(updated || null);
      }
    } catch (error) {
      console.error("학생 제거 에러:", error);
      alert("학생 제거에 실패했습니다.");
    }
  };

  // 학생 상세정보 로딩 (이메일 포함)
  const loadStudentDetails = async (students) => {
    if (!students || students.length === 0) return;
    try {
      const studentIds = students.map(s => s.studentId);
      const details = await getStudentDetails(studentIds);
      const detailsMap = {};
      details.forEach(d => {
        detailsMap[d.studentId] = d;
      });
      setStudentDetails(prev => ({ ...prev, ...detailsMap }));
    } catch (error) {
      console.error("학생 상세정보 로딩 에러:", error);
    }
  };

  // 비밀번호 초기화 핸들러
  const handleResetPassword = async (studentId, classCode) => {
    if (!confirm("이 학생의 비밀번호를 초기화하시겠습니까?\n초기화 후 새 비밀번호가 표시됩니다.")) return;

    setResetPasswordLoading(studentId);
    try {
      const result = await resetStudentPassword(studentId, classCode);
      alert(`비밀번호가 초기화되었습니다.\n\n새 비밀번호: ${result.newPassword}`);
    } catch (error) {
      console.error("비밀번호 초기화 에러:", error);
      alert("비밀번호 초기화에 실패했습니다: " + (error.message || "알 수 없는 오류"));
    } finally {
      setResetPasswordLoading(null);
    }
  };

  const handleBatchCreate = async () => {
    const targetClass = classes.find(c => c.classCode === batchTargetClass);

    if (!targetClass) {
      alert("학생을 추가할 클래스를 먼저 선택하세요.");
      return;
    }

    const total = Number(batchCount);
    if (!total || total < 1 || total > 40) {
      alert("생성 인원은 1~40명까지만 가능합니다.");
      return;
    }

    if (!confirm(`${targetClass.className}에 ${total}명의 학생 계정을 생성하시겠습니까?`)) {
      return;
    }

    setBatchLoading(true);
    setBatchMessage("");
    setBatchResults([]);

    try {
      const res = await batchCreateStudents({
        classCode: targetClass.classCode,
        count: total,
        prefix: batchPrefix || targetClass.classCode,
        gradeLevel: targetClass.gradeLevel
      });

      setBatchResults(res.results || []);
      const successMsg = `생성 ${res.created}/${res.attempted}명 완료`;
      setBatchMessage(successMsg);

      // Store accounts for this class
      setClassAccounts(prev => ({
        ...prev,
        [targetClass.classCode]: [
          ...(prev[targetClass.classCode] || []),
          ...res.results.filter(r => r.status === 'created')
        ]
      }));

      alert(`${successMsg}\n\n학생 계정이 생성되었습니다.\n"자세히 보기"에서 계정 정보를 확인할 수 있습니다.`);

      await loadClasses();
    } catch (error) {
      setBatchMessage(error.message || "일괄 생성에 실패했습니다.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-xl font-semibold text-gray-700">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 text-white shadow-xl relative overflow-hidden">
        {/* 마법 효과 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 left-10 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute top-4 right-20 w-2 h-2 bg-yellow-200 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            {/* 로고 */}
            <div className="relative inline-block">
              <span className="text-3xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                싹
              </span>
              {/* 붓 터치 효과 */}
              <svg className="absolute -top-1 -right-3 w-6 h-8" viewBox="0 0 48 64" fill="none">
                <path
                  d="M8 56 Q12 48, 16 36 Q20 24, 28 14 Q34 6, 44 2"
                  stroke="url(#brushGradientTeacher)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="brushGradientTeacher" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute -top-2 right-[-14px] text-sm animate-pulse" style={{ textShadow: '0 0 8px #fef08a' }}>✨</span>
            </div>
            <span className="text-sm font-bold tracking-widest text-cyan-200 opacity-80">SSAK</span>

            {/* 사용자 정보 */}
            <div className="ml-4 pl-4 border-l border-white/20">
              <p className="text-sm text-white font-medium flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">👩‍🏫</span>
                {userData.name}
              </p>
              <p className="text-xs text-blue-200">{userData.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/15 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition-all text-sm"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 sm:space-x-2 bg-white/80 backdrop-blur p-1 sm:p-1.5 rounded-2xl shadow-sm border border-blue-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`${activeTab === "assignments"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
                } flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap`}
            >
              <span>📝</span>
              <span className="hidden xs:inline">과제출제</span>
              <span className="xs:hidden">과제</span>
            </button>
            <button
              onClick={() => setActiveTab("writings")}
              className={`${activeTab === "writings"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
                } flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap`}
            >
              <span>📋</span>
              <span className="hidden xs:inline">학생제출글</span>
              <span className="xs:hidden">제출글</span>
            </button>
            <button
              onClick={() => setActiveTab("ranking")}
              className={`${activeTab === "ranking"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
                } flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap`}
            >
              <span>🏆</span>
              <span className="hidden xs:inline">학급랭킹</span>
              <span className="xs:hidden">랭킹</span>
            </button>
            <button
              onClick={() => setActiveTab("classes")}
              className={`${activeTab === "classes"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50"
                } flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap`}
            >
              <span>🏫</span>
              <span className="hidden xs:inline">클래스관리</span>
              <span className="xs:hidden">클래스</span>
            </button>
          </nav>
        </div>

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div>
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {classes.length >= 1 ? (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm font-medium">선생님은 1개의 학급만 생성할 수 있습니다.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600"
                  >
                    클래스 만들기
                  </button>
                )}
                <select
                  value={selectedClass?.classCode || ""}
                  onChange={(e) => {
                    const cls = classes.find((c) => c.classCode === e.target.value);
                    setSelectedClass(cls || null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">작업할 클래스를 선택하세요</option>
                  {classes.map((cls) => (
                    <option key={cls.classCode} value={cls.classCode}>
                      {cls.className} ({GRADE_LEVELS[cls.gradeLevel]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">학생 일괄 추가</h3>
                  <p className="text-sm text-gray-600">
                    기본 아이디를 입력하면 자동으로 순번이 붙습니다 (예: student → student001, student002, ...)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    생성 예시: 아이디 student001@도메인 / 비밀번호 student001
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대상 클래스 선택 *
                    </label>
                    <select
                      value={batchTargetClass}
                      onChange={(e) => setBatchTargetClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">클래스 선택</option>
                      {classes.map((cls) => (
                        <option key={cls.classCode} value={cls.classCode}>
                          {cls.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">생성 인원 (1~40)</label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={batchCount}
                      onChange={(e) => setBatchCount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기본 아이디
                    </label>
                    <input
                      type="text"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                      placeholder="예: isw"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleBatchCreate}
                      disabled={batchLoading || !batchTargetClass}
                      className="w-full bg-emerald-500 text-white px-4 py-3 rounded-md hover:bg-emerald-600 disabled:bg-gray-400"
                    >
                      {batchLoading ? "생성 중..." : "학생 계정 생성"}
                    </button>
                  </div>
                </div>

                {batchMessage && (
                  <div className="mt-3 text-sm text-gray-700 bg-indigo-50 border border-indigo-100 rounded-md px-3 py-2">
                    {batchMessage}
                  </div>
                )}

                {batchResults.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">이메일</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">초기 비밀번호</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">상태</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">메시지</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {batchResults.map((item, idx) => (
                          <tr key={`${item.email}-${idx}`}>
                            <td className="px-4 py-2 text-gray-800">{item.email}</td>
                            <td className="px-4 py-2 font-mono text-gray-700">{item.password || "-"}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${item.status === "created"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-yellow-100 text-yellow-700"
                                  }`}
                              >
                                {item.status === "created" ? "생성" : "건너뜀"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600 text-xs">{item.message || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {classes.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">아직 생성한 클래스가 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">클래스를 만들고 학생을 초대해 보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <div key={classItem.classCode} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{classItem.className}</h3>
                      <p className="text-sm text-gray-600 mb-1">{GRADE_LEVELS[classItem.gradeLevel]}</p>
                      <p className="text-xs text-gray-500 mb-3">{classItem.description}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        학생 수 {classItem.students.length} / {classItem.maxStudents || MAX_STUDENTS_PER_CLASS}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedClass(classItem);
                            setShowClassModal(true);
                            loadStudentDetails(classItem.students);
                          }}
                          className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded text-sm hover:bg-indigo-600"
                        >
                          자세히 보기
                        </button>
                        <button
                          onClick={() => handleDeleteClass(classItem.classCode)}
                          className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <select
                value={selectedClass?.classCode || ""}
                onChange={(e) => {
                  const cls = classes.find((c) => c.classCode === e.target.value);
                  setSelectedClass(cls || null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">클래스를 선택하세요</option>
                {classes.map((cls) => (
                  <option key={cls.classCode} value={cls.classCode}>
                    {cls.className} ({GRADE_LEVELS[cls.gradeLevel]})
                  </option>
                ))}
              </select>
              {selectedClass && (
                <>
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 font-medium"
                  >
                    새 과제 출제하기
                  </button>
                  <button
                    onClick={() => setShowSchedulerModal(true)}
                    className={`px-6 py-2 rounded-xl font-medium flex items-center gap-2 ${
                      schedulerSettings.enabled
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>⏰</span>
                    자동 출제 {schedulerSettings.enabled ? "ON" : "설정"}
                  </button>
                  <button
                    onClick={handleManualAutoAssignment}
                    disabled={autoAssignmentLoading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-xl hover:from-amber-400 hover:to-orange-400 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {autoAssignmentLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        생성 중...
                      </>
                    ) : (
                      <>
                        <span>🎲</span>
                        랜덤 과제 생성
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {selectedClass ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 현재 출제된 과제 */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">출제된 과제 ({assignments.length})</h3>
                    <span className="text-xs text-gray-400">※ 1주일 지난 과제는 자동 숨김</span>
                  </div>
                  {assignments.length === 0 ? (
                    <p className="text-gray-500 text-sm">아직 출제된 과제가 없습니다.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {assignments.map((assignment) => {
                        // 남은 일수 계산
                        const createdAt = new Date(assignment.createdAt).getTime();
                        const expiresAt = createdAt + (7 * 24 * 60 * 60 * 1000);
                        const daysLeft = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));

                        return (
                          <div key={assignment.id} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    daysLeft <= 2 ? 'bg-red-100 text-red-600' :
                                    daysLeft <= 4 ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-green-100 text-green-600'
                                  }`}>
                                    {daysLeft}일 남음
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{assignment.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                  <span>📅 {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                  {assignment.dueDate && (
                                    <span className="text-orange-500">⏰ 마감: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                              >
                                🗑️ 삭제
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AI 주제 자동 생성 */}
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm">🤖</span>
                    AI 주제 자동 생성
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {GRADE_LEVELS[selectedClass.gradeLevel]} 수준에 맞는 글쓰기 주제를 AI가 자동으로 생성합니다.
                  </p>

                  {/* 글쓰기 유형 선택 */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">📝 글쓰기 유형</p>
                    <div className="grid grid-cols-4 gap-2">
                      {writingTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setWritingType(writingType === type.value ? "" : type.value)}
                          className={`p-2 rounded-lg border-2 text-center transition-all ${
                            writingType === type.value
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="text-lg">{type.icon}</div>
                          <div className="text-xs font-medium text-gray-700 mt-1">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 분야 예시 버튼 */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">🏷️ 분야 선택 (클릭하면 바로 생성)</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryExamples.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => handleCategoryClick(cat.label)}
                          disabled={aiTopicsLoading}
                          className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all flex items-center gap-1 ${
                            topicCategory === cat.label
                              ? "border-blue-500 bg-blue-100 text-blue-700"
                              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600"
                          } disabled:opacity-50`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 직접 입력 + 생성 버튼 */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={topicCategory}
                      onChange={(e) => setTopicCategory(e.target.value)}
                      placeholder="또는 직접 입력..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleGenerateAiTopics()}
                      disabled={aiTopicsLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                    >
                      {aiTopicsLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          생성 중...
                        </>
                      ) : (
                        <>✨ 생성</>
                      )}
                    </button>
                  </div>

                  {/* 선택된 조건 표시 */}
                  {(writingType || topicCategory) && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2 text-sm">
                      <span className="text-blue-600">🎯 선택:</span>
                      {writingType && <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">{writingType}</span>}
                      {topicCategory && <span className="bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full text-xs">{topicCategory}</span>}
                      <button
                        onClick={() => { setWritingType(""); setTopicCategory(""); }}
                        className="ml-auto text-gray-400 hover:text-gray-600 text-xs"
                      >
                        초기화
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {aiTopics.length > 0 ? (
                      aiTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSelectTopic(topic);
                            setShowAssignmentModal(true);
                          }}
                          className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                        >
                          <div className="font-semibold text-gray-900">{topic.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{topic.type}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                topic.difficulty === "easy"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : topic.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {topic.difficulty === "easy" ? "쉬움" : topic.difficulty === "medium" ? "보통" : "어려움"}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">🪄</div>
                        <p className="text-sm">AI 주제 생성 버튼을 눌러</p>
                        <p className="text-sm">맞춤 주제를 받아보세요!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">클래스를 선택해주세요.</p>
              </div>
            )}
          </div>
        )}

        {/* Writings Tab */}
        {activeTab === "writings" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <select
                value={selectedClass?.classCode || ""}
                onChange={(e) => {
                  const cls = classes.find((c) => c.classCode === e.target.value);
                  setSelectedClass(cls || null);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">클래스를 선택하세요</option>
                {classes.map((cls) => (
                  <option key={cls.classCode} value={cls.classCode}>
                    {cls.className} ({GRADE_LEVELS[cls.gradeLevel]})
                  </option>
                ))}
              </select>

              {/* 서브 탭: 미확인 / 확인 완료 */}
              {selectedClass && (
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => { setWritingsSubTab("pending"); setExpandedTopic(null); setSelectedWriting(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      writingsSubTab === "pending"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    📋 미확인 ({assignments.filter(a => !completedTopics.includes(a.title)).length}개 주제)
                  </button>
                  <button
                    onClick={() => { setWritingsSubTab("completed"); setExpandedTopic(null); setSelectedWriting(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      writingsSubTab === "completed"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    ✅ 완료 ({assignments.filter(a => completedTopics.includes(a.title)).length}개 주제)
                  </button>
                </div>
              )}
            </div>

            {selectedClass ? (
              assignments.length === 0 ? (
                <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-8 text-center border border-blue-100">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-600">아직 출제된 과제가 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-2">과제 출제 탭에서 먼저 과제를 출제해 주세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 주제 목록 (왼쪽) */}
                  {/* 🚀 주제 목록: assignments에서 가져옴 (DB 읽기 0회!) */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl border border-blue-100 overflow-hidden">
                      <div className={`px-5 py-4 ${writingsSubTab === "completed" ? "bg-gradient-to-r from-green-600 to-emerald-500" : "bg-gradient-to-r from-blue-600 to-cyan-500"}`}>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>{writingsSubTab === "completed" ? "✅" : "📋"}</span>
                          {writingsSubTab === "completed" ? "확인 완료" : "출제된 과제"}
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">
                          {(() => {
                            const isCompletedTab = writingsSubTab === "completed";
                            const filteredAssignments = assignments.filter(a =>
                              isCompletedTab ? completedTopics.includes(a.title) : !completedTopics.includes(a.title)
                            );
                            return `총 ${filteredAssignments.length}개 주제`;
                          })()}
                        </p>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {(() => {
                          const isCompletedTab = writingsSubTab === "completed";
                          const filteredAssignments = assignments.filter(a =>
                            isCompletedTab ? completedTopics.includes(a.title) : !completedTopics.includes(a.title)
                          );

                          if (filteredAssignments.length === 0) {
                            return (
                              <div className="p-8 text-center text-gray-400">
                                <div className="text-4xl mb-2">{isCompletedTab ? "📭" : "✨"}</div>
                                <p className="text-sm">
                                  {isCompletedTab
                                    ? "아직 완료 처리된 주제가 없습니다"
                                    : assignments.length === 0 ? "출제된 과제가 없습니다" : "모든 주제를 확인했습니다!"}
                                </p>
                              </div>
                            );
                          }

                          // 🚀 최근 제출 순으로 정렬 (submissions의 최신 submittedAt 기준)
                          const sortedAssignments = [...filteredAssignments].sort((a, b) => {
                            // 각 주제의 가장 최근 제출 시간 찾기
                            const getLatestSubmission = (assignment) => {
                              const submissions = assignment.submissions || [];
                              if (submissions.length === 0) return 0;
                              return Math.max(...submissions.map(s => new Date(s.submittedAt).getTime()));
                            };
                            return getLatestSubmission(b) - getLatestSubmission(a);
                          });

                          return sortedAssignments.map((assignment) => {
                            const topic = assignment.title;
                            const isExpanded = expandedTopic === topic;
                            return (
                              <button
                                key={assignment.id || topic}
                                onClick={() => {
                                  if (!isExpanded) {
                                    // 🚀 주제 클릭 시: assignment.submissions에서 학생 목록 가져오기 (DB 0회!)
                                    loadTopicStudents(assignment);
                                  }
                                  setExpandedTopic(isExpanded ? null : topic);
                                  setSelectedWriting(null);
                                  if (isExpanded) setTopicStudents([]);
                                }}
                                className={`w-full text-left p-4 transition-all hover:bg-blue-50 ${
                                  isExpanded ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{topic}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {(assignment.submissions?.length || 0)}명 제출 · 도달점수: {assignment.minScore || 70}점
                                    </p>
                                  </div>
                                  <div className={`ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* 학생 목록 및 글 상세 (오른쪽) */}
                  <div className="lg:col-span-2">
                    {expandedTopic ? (
                      <div className="space-y-4">
                        {/* 선택된 주제 헤더 */}
                        <div className={`rounded-2xl p-5 text-white ${
                          writingsSubTab === "completed"
                            ? "bg-gradient-to-r from-green-600 to-emerald-500"
                            : "bg-gradient-to-r from-blue-600 to-cyan-500"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold">{expandedTopic}</h3>
                              <p className="text-blue-100 mt-1">
                                {`${topicStudents.length}명의 학생이 제출했습니다`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* 전체 확인완료 버튼 (미확인 탭에서만) */}
                              {writingsSubTab !== "completed" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkAllAsReviewedByTopic(expandedTopic); }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/80 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-all"
                                  title="이 주제의 모든 글을 확인완료 처리"
                                >
                                  ✅ 전체 확인완료
                                </button>
                              )}
                              {/* 주제 완료/미완료 토글 버튼 */}
                              {writingsSubTab === "completed" ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkTopicAsPending(expandedTopic); }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
                                  title="미확인 탭으로 이동"
                                >
                                  ↩️ 미확인으로
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMarkTopicAsCompleted(expandedTopic); }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
                                  title="완료 탭으로 이동"
                                >
                                  📁 완료 탭으로
                                </button>
                              )}
                              {/* 주제 삭제 버튼 */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTopic(expandedTopic); }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm font-medium transition-all"
                                title="이 주제의 모든 글 삭제"
                              >
                                🗑️ 주제 삭제
                              </button>
                              {/* 닫기 버튼 */}
                              <button
                                onClick={() => { setExpandedTopic(null); setSelectedWriting(null); }}
                                className="text-white/80 hover:text-white ml-2"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 🚀 학생 카드 그리드 - assignment.submissions에서 즉시 표시 (DB 0회!) */}
                        {topicStudents.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📭</div>
                            <p>아직 제출된 글이 없습니다</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {topicStudents.map((student) => (
                              <button
                                key={student.writingId}
                                onClick={() => loadSingleWriting(student.writingId)}
                                disabled={selectedWritingLoading}
                                className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                                  selectedWriting?.writingId === student.writingId
                                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
                                } ${selectedWritingLoading ? 'opacity-50' : ''}`}
                              >
                                {student.reviewed && (
                                  <div className="absolute top-2 right-2 text-green-500">✓</div>
                                )}
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                                  {student.nickname?.charAt(0) || '?'}
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {student.nickname}
                                  </p>
                                  <p className={`text-lg font-bold mt-1 ${
                                    student.score >= 80 ? 'text-emerald-600' :
                                    student.score >= 60 ? 'text-blue-600' :
                                    'text-amber-600'
                                  }`}>
                                    {student.score}점
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 선택된 글 안내 메시지 */}
                        {selectedWriting && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 text-center">
                            <p className="text-blue-700 font-medium">
                              <span className="text-lg">📄</span> {selectedWriting.nickname || selectedWriting.studentName}님의 글이 새 창에서 열렸습니다
                            </p>
                            <button
                              onClick={() => setSelectedWriting(null)}
                              className="mt-2 text-sm text-blue-500 hover:text-blue-700 underline"
                            >
                              닫기
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-12 text-center border border-blue-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl">👈</span>
                        </div>
                        <p className="text-gray-600 text-lg font-medium">주제를 선택해 주세요</p>
                        <p className="text-gray-400 text-sm mt-2">왼쪽에서 주제를 클릭하면 학생들의 글을 확인할 수 있습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-8 text-center border border-blue-100">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-gray-600">클래스를 선택해 주세요.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">클래스 만들기</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">클래스 이름</label>
                <input
                  type="text"
                  required
                  value={newClass.className}
                  onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="예: 3학년 1반"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
                <select
                  required
                  value={newClass.gradeLevel}
                  onChange={(e) => setNewClass({ ...newClass, gradeLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">학년 선택</option>
                  {Object.entries(GRADE_LEVELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="클래스 설명을 입력하세요"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                >
                  생성
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewClass({ className: "", gradeLevel: "", description: "" });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ranking Tab */}
      {activeTab === "ranking" && (
        <div className="space-y-6">
          {/* 클래스 선택 및 기간 선택 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedClass?.classCode || ""}
                onChange={(e) => {
                  const cls = classes.find(c => c.classCode === e.target.value);
                  setSelectedClass(cls || null);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">클래스 선택</option>
                {classes.map(cls => (
                  <option key={cls.classCode} value={cls.classCode}>
                    {cls.className}
                  </option>
                ))}
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    if (rankingPeriod !== 'weekly') {
                      setRankingLastLoaded(null); // 🚀 기간 변경 시 캐시 무효화
                      setRankingPeriod('weekly');
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    rankingPeriod === 'weekly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  주간 랭킹
                </button>
                <button
                  onClick={() => {
                    if (rankingPeriod !== 'monthly') {
                      setRankingLastLoaded(null); // 🚀 기간 변경 시 캐시 무효화
                      setRankingPeriod('monthly');
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    rankingPeriod === 'monthly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  월간 랭킹
                </button>
              </div>
            </div>
          </div>

          {!selectedClass ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">🏫</div>
              <p className="text-gray-500 text-lg">클래스를 선택해주세요</p>
            </div>
          ) : rankingLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">랭킹 데이터를 불러오는 중...</p>
            </div>
          ) : rankingData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">
                {rankingPeriod === 'weekly' ? '이번 주' : '이번 달'} 제출된 글이 없습니다
              </p>
            </div>
          ) : (
            <>
              {/* 상위 3명 하이라이트 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rankingData.slice(0, 3).map((student, idx) => (
                  <div
                    key={student.studentId}
                    className={`relative overflow-hidden rounded-2xl p-6 text-white cursor-pointer transition-transform hover:scale-105 ${
                      idx === 0
                        ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500'
                        : idx === 1
                        ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
                        : 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800'
                    }`}
                    onClick={() => {
                      setSelectedStudentForGrowth(student);
                      loadStudentGrowthData(student.studentId);
                    }}
                  >
                    <div className="absolute top-2 left-2 text-4xl font-bold opacity-30">
                      {idx + 1}
                    </div>
                    <div className="relative z-10">
                      <div className="text-4xl mb-2">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{student.nickname}</h3>
                      <div className="text-sm opacity-90 space-y-1">
                        <p>제출 {student.submissionCount}편 | 평균 {student.averageScore}점</p>
                        <p>통과 {student.passCount}편 | 최고 {student.highScore}점</p>
                        <p className="font-semibold">포인트: {student.points}P</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 전체 랭킹 테이블 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <h3 className="font-bold text-lg text-gray-800">
                    {rankingPeriod === 'weekly' ? '이번 주' : '이번 달'} 학급 랭킹
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">순위</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">이름</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">제출</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">통과</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">평균점수</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">최고점수</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">포인트</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">연속일</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">성장그래프</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rankingData.map((student) => (
                        <tr key={student.studentId} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                              student.rank === 2 ? 'bg-gray-200 text-gray-700' :
                              student.rank === 3 ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {student.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{student.nickname}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{student.submissionCount}편</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-emerald-600 font-medium">{student.passCount}편</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-medium ${
                              student.averageScore >= 80 ? 'text-emerald-600' :
                              student.averageScore >= 60 ? 'text-amber-600' : 'text-gray-600'
                            }`}>
                              {student.averageScore}점
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-blue-600 font-medium">{student.highScore}점</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-purple-600 font-bold">{student.points}P</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {student.streakDays > 0 && (
                              <span className="inline-flex items-center gap-1 text-orange-500">
                                🔥 {student.streakDays}일
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedStudentForGrowth(student);
                                loadStudentGrowthData(student.studentId);
                              }}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Student Growth Modal */}
      {selectedStudentForGrowth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedStudentForGrowth.nickname} 학생 성장 그래프
                </h2>
                <p className="text-sm text-gray-500 mt-1">최근 30일 글쓰기 통계</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentForGrowth(null);
                  setGrowthData([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {growthLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : growthData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📈</div>
                  <p className="text-gray-500">아직 제출 기록이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 요약 통계 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedStudentForGrowth.submissionCount}
                      </div>
                      <div className="text-sm text-gray-600">총 제출</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {selectedStudentForGrowth.passCount}
                      </div>
                      <div className="text-sm text-gray-600">통과</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {selectedStudentForGrowth.averageScore}점
                      </div>
                      <div className="text-sm text-gray-600">평균 점수</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedStudentForGrowth.highScore}점
                      </div>
                      <div className="text-sm text-gray-600">최고 점수</div>
                    </div>
                  </div>

                  {/* 점수 추이 그래프 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-4">점수 추이</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="averageScore"
                          name="평균 점수"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="highScore"
                          name="최고 점수"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 제출 횟수 그래프 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-4">일별 제출 횟수</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="submissions" name="제출 횟수" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {showClassModal && selectedClass && activeTab === "classes" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedClass.className}</h2>
                <p className="text-sm text-gray-600">{GRADE_LEVELS[selectedClass.gradeLevel]}</p>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>

            <h3 className="font-semibold mb-2">학생 목록 ({selectedClass.students.length}/{selectedClass.maxStudents || MAX_STUDENTS_PER_CLASS})</h3>

            {selectedClass.students.length === 0 ? (
              <p className="text-gray-600 text-sm">아직 가입한 학생이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {selectedClass.students.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded gap-2"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-xs text-blue-600 font-mono">
                        {studentDetails[student.studentId]?.email || '로딩 중...'}
                      </p>
                      <p className="text-xs text-gray-500">
                        가입일: {new Date(student.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetPassword(student.studentId, selectedClass.classCode)}
                        disabled={resetPasswordLoading === student.studentId}
                        className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 disabled:opacity-50 whitespace-nowrap"
                      >
                        {resetPasswordLoading === student.studentId ? '초기화 중...' : '비밀번호 초기화'}
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(selectedClass.classCode, student.studentId)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Student Accounts Section */}
            {classAccounts[selectedClass.classCode] && classAccounts[selectedClass.classCode].length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-emerald-700">생성된 학생 계정 정보</h3>
                <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
                  <p className="text-xs text-emerald-700 mb-3">
                    ⚠️ 이 정보는 학생들에게 전달해야 합니다. 비밀번호는 로그인 후 변경할 수 있습니다.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-emerald-200">
                          <th className="px-2 py-2 text-left text-emerald-900">이메일</th>
                          <th className="px-2 py-2 text-left text-emerald-900">비밀번호</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classAccounts[selectedClass.classCode].map((account, idx) => (
                          <tr key={idx} className="border-b border-emerald-100">
                            <td className="px-2 py-2 font-mono text-xs">{account.email}</td>
                            <td className="px-2 py-2 font-mono text-xs font-semibold text-emerald-800">{account.password}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm">📝</span>
              과제 출제하기
            </h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">과제 제목 *</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 나의 꿈에 대해 쓰기"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">과제 설명</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="과제에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">마감일 (선택)</label>
                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 제출 조건 설정 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <span>⚙️</span> 제출 조건 설정
                </h3>
                <p className="text-xs text-orange-600 mb-3">조건을 충족해야만 선생님에게 제출됩니다.</p>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">최소 점수</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newAssignment.minScore}
                      onChange={(e) => setNewAssignment({ ...newAssignment, minScore: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-orange-700 w-12 text-right">{newAssignment.minScore}점</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white/60 rounded-lg text-xs text-gray-600">
                  <p>📌 <strong>{newAssignment.minScore}점</strong> 이상일 때만 제출 가능</p>
                </div>
              </div>

              {/* 포인트 획득 조건 설정 */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <span>🎯</span> 포인트 획득 조건
                </h3>
                <p className="text-xs text-emerald-600 mb-3">AI 사용 감지에 따른 포인트 지급 기준을 설정합니다.</p>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">AI 사용 허용치 (기본 50%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newAssignment.maxAiProbability}
                      onChange={(e) => setNewAssignment({ ...newAssignment, maxAiProbability: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-emerald-700 w-12 text-right">{newAssignment.maxAiProbability}%</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 p-2 bg-white/60 rounded-lg text-xs text-gray-600">
                  <p>✅ AI 가능성 <strong>{newAssignment.maxAiProbability}%</strong> 미만: <span className="text-emerald-600 font-semibold">포인트 100% 획득</span></p>
                  <p>⚠️ AI 가능성 <strong>{newAssignment.maxAiProbability}%</strong> 이상 ~ 80% 미만: <span className="text-amber-600 font-semibold">포인트 50% 획득</span></p>
                  <p>❌ AI 가능성 <strong>80%</strong> 이상: <span className="text-red-600 font-semibold">포인트 미획득</span></p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-800">
                <strong>대상 클래스:</strong> {selectedClass?.className} ({GRADE_LEVELS[selectedClass?.gradeLevel]})
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-xl hover:from-blue-500 hover:to-cyan-400 font-medium"
                >
                  출제하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setNewAssignment({ title: "", description: "", dueDate: "", minScore: 70, maxAiProbability: 50 });
                    setSelectedTopicForAssignment(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 font-medium"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduler Modal */}
      {showSchedulerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg">⏰</span>
              자동 과제 출제 설정
            </h2>

            <div className="space-y-5">
              {/* 활성화 토글 */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div>
                  <h3 className="font-semibold text-purple-900">자동 출제 활성화</h3>
                  <p className="text-sm text-purple-600">설정한 요일과 시간에 자동으로 과제가 출제됩니다</p>
                </div>
                <button
                  onClick={() => setSchedulerSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    schedulerSettings.enabled ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    schedulerSettings.enabled ? "translate-x-8" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* 요일 선택 */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📅</span> 출제 요일
                </h3>
                <div className="flex gap-2">
                  {[
                    { day: 0, label: "일" },
                    { day: 1, label: "월" },
                    { day: 2, label: "화" },
                    { day: 3, label: "수" },
                    { day: 4, label: "목" },
                    { day: 5, label: "금" },
                    { day: 6, label: "토" }
                  ].map(({ day, label }) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                        schedulerSettings.selectedDays.includes(day)
                          ? "bg-purple-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  선택: {schedulerSettings.selectedDays.length === 0
                    ? "없음"
                    : schedulerSettings.selectedDays.map(d => ["일", "월", "화", "수", "목", "금", "토"][d]).join(", ")}
                </p>
              </div>

              {/* 시간 선택 */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🕐</span> 출제 시간
                </h3>
                <input
                  type="time"
                  value={schedulerSettings.scheduledTime}
                  onChange={(e) => setSchedulerSettings(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* 제출 조건 - 최소 점수만 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <span>⚙️</span> 제출 조건 설정
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">최소 점수</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={schedulerSettings.minScore}
                      onChange={(e) => setSchedulerSettings(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-orange-700 w-12 text-right">{schedulerSettings.minScore}점</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">📌 <strong>{schedulerSettings.minScore}점</strong> 이상일 때만 제출 가능</p>
                </div>
              </div>

              {/* 포인트 획득 조건 */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <span>💎</span> 포인트 획득 조건
                </h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">AI 사용 기준</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={schedulerSettings.maxAiProbability}
                      onChange={(e) => setSchedulerSettings(prev => ({ ...prev, maxAiProbability: Number(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm font-bold text-emerald-700 w-12 text-right">{schedulerSettings.maxAiProbability}%</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="text-emerald-700">✅ AI 가능성 <strong>{schedulerSettings.maxAiProbability}% 미만</strong>: 포인트 <strong>100%</strong> 획득</p>
                    <p className="text-amber-600">⚠️ AI 가능성 <strong>{schedulerSettings.maxAiProbability}% 이상 ~ 80% 미만</strong>: 포인트 <strong>50%</strong> 획득</p>
                    <p className="text-red-600">❌ AI 가능성 <strong>80% 이상</strong>: 포인트 미획득</p>
                  </div>
                </div>
              </div>

              {/* 설명 */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <span>💡</span> 자동 출제 안내
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 글쓰기 유형과 분야가 랜덤으로 선택됩니다</li>
                  <li>• 이전에 출제한 주제와 중복되지 않습니다</li>
                  <li>• 학년 수준에 맞는 주제가 AI로 생성됩니다</li>
                  <li>• 선택한 요일의 지정 시간에 자동 출제됩니다</li>
                </ul>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveScheduler}
                  disabled={schedulerLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl hover:from-purple-500 hover:to-indigo-400 font-medium disabled:opacity-50"
                >
                  {schedulerLoading ? "저장 중..." : "설정 저장"}
                </button>
                <button
                  onClick={() => setShowSchedulerModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 학생 글 상세 보기 모달 */}
      {selectedWriting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                  {(selectedWriting.nickname || selectedWriting.studentName)?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">
                      {selectedWriting.nickname || selectedWriting.studentName}
                    </h3>
                    {selectedWriting.nickname && selectedWriting.nickname !== selectedWriting.studentName && (
                      <span className="text-sm opacity-75">({selectedWriting.studentName})</span>
                    )}
                  </div>
                  <p className="text-sm opacity-90">
                    {new Date(selectedWriting.submittedAt).toLocaleString()} · {selectedWriting.wordCount}자
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-black ${
                  selectedWriting.score >= 80 ? 'text-yellow-300' :
                  selectedWriting.score >= 60 ? 'text-white' :
                  'text-orange-300'
                }`}>
                  {selectedWriting.score}점
                </div>
                <button
                  onClick={() => setSelectedWriting(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 주제 */}
            <div className="px-6 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">주제:</span>
                <span className="font-semibold text-gray-800">{selectedWriting.topic}</span>
              </div>
            </div>

            {/* 점수 상세 */}
            {selectedWriting.analysis && (
              <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 flex flex-wrap items-center gap-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">내용</span>
                  <span className="text-lg font-bold text-blue-600">{selectedWriting.analysis.contentScore}/30</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">구성</span>
                  <span className="text-lg font-bold text-blue-600">{selectedWriting.analysis.structureScore}/25</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">어휘</span>
                  <span className="text-lg font-bold text-blue-600">{selectedWriting.analysis.vocabularyScore}/20</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">문법</span>
                  <span className="text-lg font-bold text-blue-600">{selectedWriting.analysis.grammarScore}/15</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">창의성</span>
                  <span className="text-lg font-bold text-blue-600">{selectedWriting.analysis.creativityScore}/10</span>
                </div>
              </div>
            )}

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 글 내용 */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📝</span> 작성한 글
                </h4>
                <div className="p-5 bg-gray-50 rounded-xl text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200">
                  {selectedWriting.content}
                </div>
              </div>

              {/* AI 종합 피드백 */}
              {selectedWriting.analysis?.overallFeedback && (
                <div>
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <span>🤖</span> AI 종합 평가
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                    <p className="text-purple-800 leading-relaxed">
                      {selectedWriting.analysis.overallFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* 장점 */}
              {selectedWriting.analysis?.strengths && selectedWriting.analysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <span>✨</span> 잘한 점
                  </h4>
                  <ul className="space-y-2">
                    {selectedWriting.analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 개선점 */}
              {selectedWriting.analysis?.improvements && selectedWriting.analysis.improvements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <span>💡</span> 개선할 점
                  </h4>
                  <ul className="space-y-2">
                    {selectedWriting.analysis.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
                        <span className="text-amber-500 mt-0.5">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 상세 피드백 (문장별 수정 제안) */}
              {selectedWriting.analysis?.detailedFeedback && selectedWriting.analysis.detailedFeedback.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span>✏️</span> 문장별 수정 제안
                  </h4>
                  <div className="space-y-3">
                    {selectedWriting.analysis.detailedFeedback.map((detail, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-blue-200 text-blue-700 text-xs rounded-full font-medium">
                            {detail.type === 'grammar' ? '문법' :
                             detail.type === 'vocabulary' ? '어휘' :
                             detail.type === 'structure' ? '구성' :
                             detail.type === 'expression' ? '표현' : detail.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          <span className="font-medium text-red-500">원문:</span> "{detail.original}"
                        </p>
                        <p className="text-gray-800 text-sm mb-2">
                          <span className="font-medium text-blue-600">수정:</span> "{detail.suggestion}"
                        </p>
                        {detail.reason && (
                          <p className="text-gray-500 text-xs">
                            💬 {detail.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 글쓰기 팁 */}
              {selectedWriting.analysis?.writingTips && selectedWriting.analysis.writingTips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                    <span>📚</span> 글쓰기 팁
                  </h4>
                  <ul className="space-y-2">
                    {selectedWriting.analysis.writingTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-indigo-700 bg-indigo-50 p-3 rounded-lg">
                        <span className="text-indigo-400 mt-0.5">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 하단 액션 버튼 */}
            <div className="px-6 py-4 bg-gray-50 border-t flex flex-wrap gap-3">
              {selectedWriting.reviewed ? (
                <button
                  onClick={() => {
                    handleMarkAsPending(selectedWriting.writingId);
                    setSelectedWriting(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  <span>↩️</span> 미확인으로 변경
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleMarkAsReviewed(selectedWriting.writingId);
                    setSelectedWriting(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-400 hover:to-emerald-400 transition-colors font-medium"
                >
                  <span>✅</span> 확인 완료
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm('정말 이 글을 삭제하시겠습니까?')) {
                    handleDeleteWriting(selectedWriting.writingId);
                    setSelectedWriting(null);
                  }
                }}
                disabled={deletingWritingId === selectedWriting.writingId}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium ml-auto disabled:opacity-50"
              >
                {deletingWritingId === selectedWriting.writingId ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <span>🗑️</span> 삭제
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedWriting(null)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 온보딩 가이드 모달 */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* 헤더 - 단계 표시 */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">🎉</span> 싹 시작하기
                </h2>
                <button
                  onClick={handleSkipOnboarding}
                  className="text-white/80 hover:text-white text-sm underline"
                >
                  건너뛰기
                </button>
              </div>
              <p className="text-emerald-100 mb-4">
                {userData.name} 선생님, 환영합니다! 간단한 설정으로 바로 시작해보세요.
              </p>
              {/* 단계 인디케이터 */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      onboardingStep === step
                        ? 'bg-white text-emerald-600'
                        : onboardingStep > step
                        ? 'bg-emerald-300 text-emerald-800'
                        : 'bg-emerald-400/50 text-emerald-200'
                    }`}>
                      {onboardingStep > step ? '✓' : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-1 ${onboardingStep > step ? 'bg-emerald-300' : 'bg-emerald-400/50'}`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-emerald-100">
                <span>클래스 생성</span>
                <span>학생 추가</span>
                <span>주제 생성</span>
              </div>
            </div>

            {/* 내용 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Step 1: 클래스 생성 */}
              {onboardingStep === 1 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">첫 번째, 클래스를 만들어주세요!</h3>
                    <p className="text-gray-600">학생들이 참여할 클래스를 생성합니다.</p>
                  </div>

                  <form onSubmit={handleOnboardingCreateClass} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">클래스 이름 *</label>
                      <input
                        type="text"
                        value={newClass.className}
                        onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                        placeholder="예: 6학년 1반"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">학년 선택 *</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(GRADE_LEVELS).map(([key, value]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setNewClass({ ...newClass, gradeLevel: key })}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              newClass.gradeLevel === key
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-emerald-300'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
                      <input
                        type="text"
                        value={newClass.description}
                        onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                        placeholder="예: 2024년 1학기 글쓰기 수업"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!newClass.className || !newClass.gradeLevel}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      클래스 생성하기 →
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: 학생 일괄 추가 */}
              {onboardingStep === 2 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">두 번째, 학생 계정을 만들어주세요!</h3>
                    <p className="text-gray-600">학생들이 사용할 계정을 한 번에 생성합니다.</p>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                    <p className="text-emerald-800 font-medium">
                      📌 "{onboardingClass?.className}" 클래스에 학생을 추가합니다
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">생성할 학생 수 *</label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={batchCount}
                        onChange={(e) => setBatchCount(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">최대 40명까지 가능합니다.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">아이디 접두어 (선택)</label>
                      <input
                        type="text"
                        value={batchPrefix}
                        onChange={(e) => setBatchPrefix(e.target.value)}
                        placeholder="예: 6-1 → 아이디: 6-1_student01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    {batchResults.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-700 font-medium mb-2">{batchMessage}</p>
                        <div className="text-sm text-green-600 max-h-32 overflow-y-auto">
                          {batchResults.slice(0, 5).map((acc, idx) => (
                            <div key={idx} className="flex gap-4 py-1">
                              <span>ID: {acc.email.split('@')[0]}</span>
                              <span>PW: {acc.password}</span>
                            </div>
                          ))}
                          {batchResults.length > 5 && (
                            <p className="text-green-500 mt-1">... 외 {batchResults.length - 5}명</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {batchResults.length === 0 ? (
                        <button
                          onClick={handleOnboardingBatchCreate}
                          disabled={batchLoading || batchCount < 1}
                          className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                          {batchLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              생성 중...
                            </span>
                          ) : (
                            `${batchCount}명 학생 계정 생성하기 →`
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setOnboardingStep(3)}
                          className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                        >
                          다음 단계로 →
                        </button>
                      )}
                      <button
                        onClick={() => setOnboardingStep(3)}
                        className="px-6 py-4 bg-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-300 transition-all"
                      >
                        건너뛰기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: AI 주제 생성 */}
              {onboardingStep === 3 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">마지막! AI로 글쓰기 주제를 만들어보세요</h3>
                    <p className="text-gray-600">AI가 학년에 맞는 글쓰기 주제를 추천해드려요.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">분야 선택 (선택)</label>
                      <div className="flex flex-wrap gap-2">
                        {categoryExamples.slice(0, 12).map((cat) => (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() => setTopicCategory(topicCategory === cat.label ? "" : cat.label)}
                            className={`px-3 py-2 rounded-full text-sm transition-all ${
                              topicCategory === cat.label
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
                            }`}
                          >
                            {cat.icon} {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleOnboardingGenerateTopics}
                      disabled={aiTopicsLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {aiTopicsLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          AI가 주제를 생성 중...
                        </span>
                      ) : (
                        '🤖 AI 주제 생성하기'
                      )}
                    </button>

                    {aiTopics.length > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
                        <h4 className="font-bold text-purple-800 mb-3">✨ AI 추천 주제 - 클릭하여 과제 출제하기</h4>
                        <div className="space-y-2">
                          {aiTopics.map((topic, idx) => (
                            <button
                              key={idx}
                              onClick={async () => {
                                if (!onboardingClass) {
                                  alert('클래스 정보를 찾을 수 없습니다.');
                                  return;
                                }
                                if (!confirm(`"${topic.title}" 주제로 과제를 출제하시겠습니까?`)) {
                                  return;
                                }
                                try {
                                  await createAssignment(
                                    user.uid,
                                    onboardingClass.classCode,
                                    topic.title,
                                    topic.description,
                                    null, // 마감일 없음
                                    70, // 기본 목표 점수
                                    50  // 기본 AI 확률 임계값
                                  );
                                  alert(`"${topic.title}" 과제가 출제되었습니다! 🎉`);
                                  // 해당 주제를 목록에서 제거
                                  setAiTopics(prev => prev.filter((_, i) => i !== idx));
                                } catch (error) {
                                  console.error('과제 출제 에러:', error);
                                  alert('과제 출제에 실패했습니다.');
                                }
                              }}
                              className="w-full text-left bg-white rounded-lg p-3 shadow-sm hover:shadow-md hover:bg-purple-50 transition-all border-2 border-transparent hover:border-purple-300"
                            >
                              <p className="font-medium text-gray-800">{topic.title}</p>
                              <p className="text-sm text-gray-500">{topic.description}</p>
                              <p className="text-xs text-purple-600 mt-2">👆 클릭하여 과제로 출제하기</p>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-purple-600 mt-3">
                          💡 원하는 주제를 클릭하면 바로 과제로 출제됩니다!
                        </p>
                      </div>
                    )}

                    <div className="mt-6 space-y-3">
                      {aiTopics.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            💡 위 주제를 클릭하여 과제로 출제하거나, 나중에 출제하실 수도 있습니다.
                          </p>
                        </div>
                      )}
                      <button
                        onClick={handleOnboardingComplete}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                      >
                        🎉 설정 완료! 시작하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
