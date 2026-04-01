import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { motion } from "framer-motion";
import {
  LogOut,
  Plus,
  Users,
  ClipboardList,
  BarChart3,
  ChevronRight,
  Eye,
  MessageSquare,
  Copy,
  Check,
  AlertTriangle,
  Star as StarIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { formatDate, getScoreColor, truncate } from "../lib/utils";
import type { ClassInfo, Writing } from "../types";

const QUICK_FEEDBACKS = [
  { type: "good", label: "잘했어", icon: "👍", message: "잘했어요! 👍" },
  {
    type: "content",
    label: "내용 보충",
    icon: "📝",
    message: "내용을 좀 더 보충해보세요 📝",
  },
  {
    type: "spelling",
    label: "맞춤법 주의",
    icon: "🔤",
    message: "맞춤법에 주의해주세요 🔤",
  },
  {
    type: "structure",
    label: "구성 다듬기",
    icon: "📐",
    message: "글의 구성을 다듬어보세요 📐",
  },
  {
    type: "expression",
    label: "표현 다양하게",
    icon: "✨",
    message: "다양한 표현을 써보세요 ✨",
  },
];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classStats, setClassStats] = useState<any>(null);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [tab, setTab] = useState<"overview" | "writings" | "students">(
    "overview",
  );
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [feedbackWritingId, setFeedbackWritingId] = useState<string | null>(
    null,
  );
  const [customFeedback, setCustomFeedback] = useState("");
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [aiTopics, setAiTopics] = useState<{ title: string; description: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showBatchCreate, setShowBatchCreate] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchCount, setBatchCount] = useState(30);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{ created: { loginId: string; password: string }[]; skipped: string[] } | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getClasses({ teacher_id: user.id })
      .then(({ classes: c }) => {
        setClasses(c);
        if (c.length > 0) setSelectedClass(c[0].code);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;
    Promise.all([
      api.getClassStats(selectedClass).catch(() => ({ stats: null })),
      api
        .getWritings({ class_code: selectedClass, limit: 50 })
        .catch(() => ({ writings: [] })),
    ]).then(([s, w]) => {
      setClassStats(s.stats);
      setWritings(w.writings);
    });
  }, [selectedClass]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      const { classInfo } = await api.createClass({ name: newClassName });
      setClasses((prev) => [{ ...classInfo, student_count: 0 }, ...prev]);
      setSelectedClass(classInfo.code);
      setShowCreateClass(false);
      setNewClassName("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFeedback = async (
    writingId: string,
    type: string,
    message?: string,
  ) => {
    try {
      await api.submitTeacherFeedback(writingId, { type, message });
      setWritings((prev) =>
        prev.map((w) =>
          w.id === writingId
            ? {
                ...w,
                teacher_feedback:
                  QUICK_FEEDBACKS.find((f) => f.type === type)?.message ||
                  message ||
                  "",
                teacher_feedback_at: new Date().toISOString(),
              }
            : w,
        ),
      );
      setFeedbackWritingId(null);
      setCustomFeedback("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim() || !selectedClass) return;
    try {
      await api.createAssignment({
        title: assignTitle,
        description: assignDesc,
        class_code: selectedClass,
        topic: assignTitle,
        grade_level: currentClass?.grade_level || "",
      });
      setShowCreateAssignment(false);
      setAssignTitle("");
      setAssignDesc("");
      setAiTopics([]);
      alert("과제가 출제되었습니다!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateTopics = async () => {
    setAiLoading(true);
    try {
      const { topics } = await api.generateTopics(
        currentClass?.grade_level || "elementary_3_4",
        5,
      );
      setAiTopics(topics);
    } catch (err: any) {
      alert("주제 생성 실패: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleBatchCreate = async () => {
    if (!batchPrefix.trim() || !selectedClass) return;
    setBatchLoading(true);
    try {
      const result = await api.batchCreateStudents(selectedClass, batchPrefix.trim(), batchCount);
      setBatchResult(result);
      // 학급 통계 새로고침
      api.getClassStats(selectedClass).then((s) => setClassStats(s.stats)).catch(() => {});
    } catch (err: any) {
      alert("생성 실패: " + err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const copyBatchResult = () => {
    if (!batchResult) return;
    const text = "아이디\t비밀번호\n" + batchResult.created.map((s) => `${s.loginId}\t${s.password}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("복사되었습니다!");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentClass = classes.find((c) => c.code === selectedClass);

  if (loading)
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-4xl animate-bounce-slow">🌱</div>
      </div>
    );

  return (
    <div className="page-container pb-20">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                {user?.name} 선생님
              </h1>
              <p className="text-xs text-gray-500">교사 대시보드</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </header>

      <div className="content-container space-y-6">
        {/* Class Selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {classes.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedClass(c.code)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedClass === c.code
                  ? "bg-ssak-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {c.name} ({c.student_count || 0})
            </button>
          ))}
          <button
            onClick={() => setShowCreateClass(true)}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1"
          >
            <Plus size={14} /> 학급 추가
          </button>
        </div>

        {/* Class Code */}
        {currentClass && (
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">학급 코드</p>
              <p className="text-xl font-bold tracking-widest text-ssak-600">
                {currentClass.code}
              </p>
            </div>
            <button
              onClick={() => copyCode(currentClass.code)}
              className="btn-secondary flex items-center gap-1 text-sm"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { key: "overview", label: "현황", icon: BarChart3 },
            { key: "writings", label: "글 목록", icon: ClipboardList },
            { key: "students", label: "학생", icon: Users },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 ${
                tab === t.key
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* 과제 출제 */}
        {tab === "overview" && currentClass && (
          <div className="card">
            {!showCreateAssignment ? (
              <button
                onClick={() => setShowCreateAssignment(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-ssak-300 text-ssak-600 font-medium flex items-center justify-center gap-2 hover:bg-ssak-50 transition"
              >
                <Plus size={18} /> 새 과제 출제하기
              </button>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">새 과제</h3>
                <div>
                  <input
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="주제 / 제목"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-sm"
                  />
                </div>
                <textarea
                  value={assignDesc}
                  onChange={(e) => setAssignDesc(e.target.value)}
                  placeholder="설명 (선택)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-sm"
                />

                {/* AI 주제 추천 */}
                <button
                  onClick={handleGenerateTopics}
                  disabled={aiLoading}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  {aiLoading ? (
                    <><Loader2 size={14} className="animate-spin" /> 생성 중...</>
                  ) : (
                    <><Sparkles size={14} /> AI 주제 추천</>
                  )}
                </button>

                {aiTopics.length > 0 && (
                  <div className="space-y-1">
                    {aiTopics.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setAssignTitle(t.title); setAssignDesc(t.description); }}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                          assignTitle === t.title
                            ? "border-ssak-500 bg-ssak-50 dark:bg-ssak-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-ssak-300"
                        }`}
                      >
                        <span className="font-medium">{t.title}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">{t.description}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowCreateAssignment(false); setAiTopics([]); }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateAssignment}
                    disabled={!assignTitle.trim()}
                    className="flex-1 btn-primary text-sm disabled:opacity-50"
                  >
                    출제하기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-4">
            {classStats && (<>
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <div className="text-2xl font-bold text-ssak-600">
                  {classStats.totalStudents}
                </div>
                <div className="text-xs text-gray-500">학생 수</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {classStats.submissionRate}%
                </div>
                <div className="text-xs text-gray-500">이번 주 제출률</div>
              </div>
            </div>

            {classStats.needAttention?.length > 0 && (
              <div className="card border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} /> 관심 필요
                </h3>
                {classStats.needAttention.map((s: any, i: number) => (
                  <p
                    key={i}
                    className="text-sm text-orange-600 dark:text-orange-500"
                  >
                    • {s.name}: {s.reason}
                  </p>
                ))}
              </div>
            )}

            {classStats.praiseWorthy?.length > 0 && (
              <div className="card border-green-200 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                  <StarIcon size={16} /> 칭찬 대상
                </h3>
                {classStats.praiseWorthy.map((s: any, i: number) => (
                  <p
                    key={i}
                    className="text-sm text-green-600 dark:text-green-500"
                  >
                    • {s.name}: {s.reason}
                  </p>
                ))}
              </div>
            )}

            {classStats.commonWeakness?.length > 0 && (
              <div className="card">
                <h3 className="section-title">학급 공통 약점</h3>
                {classStats.commonWeakness.map((w: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-sm">{w.pattern}</span>
                    <span className="badge-yellow">{w.count}명</span>
                  </div>
                ))}
              </div>
            )}
            </>)}

            {!classStats && (
              <div className="card text-center py-8 text-gray-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>학생이 글을 제출하면 통계가 표시됩니다.</p>
              </div>
            )}
          </div>
        )}

        {/* Writings Tab - with 1-click feedback */}
        {tab === "writings" && (
          <div className="space-y-2">
            {writings.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>아직 제출된 글이 없어요.</p>
              </div>
            ) : (
              writings.map((w) => (
                <div key={w.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {w.topic || truncate(w.content, 30)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(w.submitted_at || w.created_at)} ·{" "}
                        {w.word_count}단어
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${getScoreColor(w.score_total)}`}
                    >
                      {w.score_total}
                    </span>
                  </div>

                  {w.teacher_feedback ? (
                    <div className="bg-ssak-50 dark:bg-ssak-900/20 rounded-lg px-3 py-2 text-sm text-ssak-700 dark:text-ssak-400">
                      {w.teacher_feedback}
                    </div>
                  ) : feedbackWritingId === w.id ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_FEEDBACKS.map((fb) => (
                          <button
                            key={fb.type}
                            onClick={() => handleFeedback(w.id, fb.type)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-700 hover:bg-ssak-100 dark:hover:bg-ssak-900/30 transition"
                          >
                            {fb.icon} {fb.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customFeedback}
                          onChange={(e) => setCustomFeedback(e.target.value)}
                          className="input-field text-sm flex-1"
                          placeholder="직접 입력..."
                        />
                        <button
                          onClick={() =>
                            handleFeedback(w.id, "custom", customFeedback)
                          }
                          className="btn-primary text-sm px-3"
                          disabled={!customFeedback.trim()}
                        >
                          전송
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFeedbackWritingId(w.id)}
                      className="text-sm text-ssak-600 flex items-center gap-1 mt-1"
                    >
                      <MessageSquare size={14} /> 피드백 주기
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Students Tab */}
        {tab === "students" && (
          <div className="space-y-3">
            {/* 학급 코드 안내 */}
            {currentClass && (
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-1 font-medium">학생 참여 방법</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">학생이 회원가입 시 학급 코드 <strong className="text-blue-800 dark:text-blue-300">{currentClass.code}</strong>를 입력하면 자동으로 이 학급에 참여됩니다.</p>
              </div>
            )}

            {/* 학생 일괄 생성 */}
            {!batchResult ? (
              !showBatchCreate ? (
                <button
                  onClick={() => setShowBatchCreate(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-ssak-300 text-ssak-600 font-medium flex items-center justify-center gap-2 hover:bg-ssak-50 transition"
                >
                  <Plus size={18} /> 학생 일괄 생성
                </button>
              ) : (
                <div className="card space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">학생 일괄 생성</h3>
                  <p className="text-xs text-gray-500">접두어 + 번호로 아이디가 자동 생성됩니다. (예: 5반01, 5반02...)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">접두어</label>
                      <input
                        value={batchPrefix}
                        onChange={(e) => setBatchPrefix(e.target.value)}
                        placeholder="예: 5반"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">인원수</label>
                      <input
                        type="number"
                        value={batchCount}
                        onChange={(e) => setBatchCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                        min={1}
                        max={50}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-sm"
                      />
                    </div>
                  </div>
                  {batchPrefix && (
                    <p className="text-xs text-gray-400">미리보기: <strong>{batchPrefix}01</strong> ~ <strong>{batchPrefix}{String(batchCount).padStart(2, "0")}</strong> (비밀번호 = 아이디와 동일)</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowBatchCreate(false); setBatchPrefix(""); }} className="flex-1 btn-secondary text-sm">취소</button>
                    <button
                      onClick={handleBatchCreate}
                      disabled={!batchPrefix.trim() || batchLoading}
                      className="flex-1 btn-primary text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {batchLoading ? <><Loader2 size={14} className="animate-spin" /> 생성 중...</> : `${batchCount}명 생성`}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-green-700 dark:text-green-400">생성 완료! ({batchResult.created.length}명)</h3>
                  <button onClick={copyBatchResult} className="btn-secondary text-xs flex items-center gap-1"><Copy size={12} /> 복사</button>
                </div>
                {batchResult.skipped.length > 0 && (
                  <p className="text-xs text-orange-500">건너뜀 (이미 존재): {batchResult.skipped.join(", ")}</p>
                )}
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-200 dark:border-gray-600"><th className="text-left py-1 text-xs text-gray-500">아이디</th><th className="text-left py-1 text-xs text-gray-500">비밀번호</th></tr></thead>
                    <tbody>
                      {batchResult.created.map((s, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700"><td className="py-1 font-mono">{s.loginId}</td><td className="py-1 font-mono text-gray-500">{s.password}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => { setBatchResult(null); setShowBatchCreate(false); setBatchPrefix(""); }} className="w-full btn-secondary text-sm">닫기</button>
              </div>
            )}

            {classStats?.students && classStats.students.length > 0 ? (
              classStats.students.map((s: any) => (
                <div
                  key={s.id}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Lv.{s.level} · {s.writing_count}편 · 평균 {s.avg_score}점
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.streak_days >= 3 && (
                      <span className="badge-green text-[10px]">
                        🔥 {s.streak_days}일
                      </span>
                    )}
                    <span className={`font-bold ${getScoreColor(s.avg_score)}`}>
                      {s.avg_score}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-10 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>아직 참여한 학생이 없어요.</p>
                <p className="text-xs mt-1">학생에게 학급 코드를 알려주세요!</p>
              </div>
            )}
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">새 학급 만들기</h2>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="input-field mb-4"
                placeholder="학급 이름 (예: 3학년 2반)"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateClass(false)}
                  className="btn-secondary flex-1"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateClass}
                  className="btn-primary flex-1"
                  disabled={!newClassName.trim()}
                >
                  만들기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
