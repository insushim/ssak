import { useState, useEffect } from "react";
import { signOut } from "../services/authService";
import {
  getTeacherClasses,
  createClass,
  deleteClass,
  removeStudentFromClass
} from "../services/classService";
import { getClassWritings } from "../services/writingService";
import { GRADE_LEVELS, MAX_STUDENTS_PER_CLASS } from "../config/auth";
import { batchCreateStudents } from "../services/batchService";

export default function TeacherDashboard({ user, userData }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classWritings, setClassWritings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("classes");
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchMessage, setBatchMessage] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchTargetClass, setBatchTargetClass] = useState("");
  const [classAccounts, setClassAccounts] = useState({}); // Store accounts by classCode

  const [newClass, setNewClass] = useState({
    className: "",
    gradeLevel: "",
    description: ""
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassWritings(selectedClass.classCode);
    }
  }, [selectedClass]);

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

  const loadClassWritings = async (classCode) => {
    try {
      const writings = await getClassWritings(classCode);
      setClassWritings(writings);
    } catch (error) {
      console.error("클래스 글 로드 에러:", error);
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
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-100">Isw Teacher</p>
            <h1 className="text-2xl font-bold mt-1">선생님 대시보드</h1>
            <p className="text-sm text-indigo-100 mt-1">
              {userData.name} ({userData.email})
            </p>
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
              onClick={() => setActiveTab("classes")}
              className={`${activeTab === "classes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              내 클래스 ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab("writings")}
              className={`${activeTab === "writings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              학생 제출글
            </button>
          </nav>
        </div>

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div>
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600"
                >
                  클래스 만들기
                </button>
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
                      <div className="bg-indigo-50 p-3 rounded mb-3">
                        <p className="text-xs text-gray-600 mb-1">클래스 코드</p>
                        <p className="text-lg font-bold text-indigo-600">{classItem.classCode}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        학생 수 {classItem.students.length} / {classItem.maxStudents || MAX_STUDENTS_PER_CLASS}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedClass(classItem);
                            setShowClassModal(true);
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

        {/* Writings Tab */}
        {activeTab === "writings" && (
          <div>
            <div className="mb-6">
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
            </div>

            {selectedClass ? (
              classWritings.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <p className="text-gray-600">아직 제출된 글이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classWritings.map((writing) => (
                    <div key={writing.writingId} className="bg-white shadow rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{writing.topic}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            학생: {writing.studentName} | 제출: {new Date(writing.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{writing.score}점</div>
                          <div className="text-sm text-gray-500">글자수 {writing.wordCount}</div>
                        </div>
                      </div>

                      <div className="mb-4 p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{writing.content}</p>
                      </div>

                      {writing.analysis && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">AI 분석 결과</h4>
                          <div className="grid grid-cols-5 gap-2 mb-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-600">내용</div>
                              <div className="font-semibold">{writing.analysis.contentScore}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600">구성</div>
                              <div className="font-semibold">{writing.analysis.structureScore}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600">어휘</div>
                              <div className="font-semibold">{writing.analysis.vocabularyScore}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600">문법</div>
                              <div className="font-semibold">{writing.analysis.grammarScore}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600">창의성</div>
                              <div className="font-semibold">{writing.analysis.creativityScore}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{writing.analysis.overallFeedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
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

            <div className="bg-indigo-50 p-4 rounded mb-4">
              <p className="text-sm text-gray-600 mb-1">클래스 코드 (학생에게 공유)</p>
              <p className="text-2xl font-bold text-indigo-600">{selectedClass.classCode}</p>
            </div>

            <h3 className="font-semibold mb-2">학생 목록 ({selectedClass.students.length}/{selectedClass.maxStudents || MAX_STUDENTS_PER_CLASS})</h3>

            {selectedClass.students.length === 0 ? (
              <p className="text-gray-600 text-sm">아직 가입한 학생이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {selectedClass.students.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-xs text-gray-500">
                        가입일: {new Date(student.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(selectedClass.classCode, student.studentId)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      제거
                    </button>
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
    </div>
  );
}
