import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import Confetti from "react-confetti";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { signOut } from "../services/authService";
import { joinClass, getClassByCode } from "../services/classService";
import {
  saveWriting,
  getStudentWritings,
  submitWriting,
  getStudentStats
} from "../services/writingService";
import { recommendedTopics } from "../data/recommendedTopics";
import { WORD_COUNT_STANDARDS, PASSING_SCORE, GRADE_LEVELS } from "../config/auth";

export default function StudentDashboard({ user, userData }) {
  const [classInfo, setClassInfo] = useState(null);
  const [classCode, setClassCode] = useState("");
  const [activeTab, setActiveTab] = useState("write");
  const [writings, setWritings] = useState([]);
  const [stats, setStats] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [currentWriting, setCurrentWriting] = useState({
    topic: "",
    content: "",
    wordCount: 0,
    gradeLevel: userData.gradeLevel,
    studentName: userData.name
  });

  const [debouncedContent] = useDebounce(currentWriting.content, 30000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (debouncedContent && currentWriting.topic) {
      autoSave();
    }
  }, [debouncedContent]);

  const loadData = async () => {
    try {
      if (userData.classCode) {
        const cls = await getClassByCode(userData.classCode);
        setClassInfo(cls);
      }
      const studentWritings = await getStudentWritings(user.uid);
      setWritings(studentWritings);
      const studentStats = await getStudentStats(user.uid);
      setStats(studentStats);
    } catch (error) {
      console.error("데이터 로드 에러:", error);
    }
  };

  const autoSave = useCallback(async () => {
    if (!currentWriting.topic || !currentWriting.content) return;
    try {
      await saveWriting(user.uid, currentWriting, true);
    } catch (error) {
      console.error("자동 저장 에러:", error);
    }
  }, [currentWriting, user.uid]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      await joinClass(classCode.toUpperCase(), user.uid, userData.name);
      alert("반에 성공적으로 가입했습니다.");
      loadData();
    } catch (error) {
      alert(error.message || "반 가입에 실패했습니다.");
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentWriting({
      ...currentWriting,
      topic: topic.title,
      content: "",
      wordCount: 0
    });
    setFeedback(null);
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    const wordCount = content.replace(/\s/g, "").length;
    setCurrentWriting({
      ...currentWriting,
      content,
      wordCount
    });
  };

  const getWordCountStatus = () => {
    const standard = WORD_COUNT_STANDARDS[userData.gradeLevel];
    const count = currentWriting.wordCount;

    if (count < standard.min) {
      return { status: "too-short", message: `글이 너무 짧습니다. (최소 ${standard.min}자)`, color: "text-red-600" };
    } else if (count >= standard.min && count < standard.ideal) {
      return { status: "ok", message: "좋아요! 좀 더 써볼까요?", color: "text-yellow-600" };
    } else if (count >= standard.ideal && count <= standard.max) {
      return { status: "ideal", message: "아주 좋아요!", color: "text-green-600" };
    } else {
      return { status: "too-long", message: `글이 너무 깁니다. (최대 ${standard.max}자)`, color: "text-red-600" };
    }
  };

  const handleSubmit = async () => {
    if (!currentWriting.topic || !currentWriting.content) {
      alert("주제와 내용을 모두 입력해 주세요.");
      return;
    }

    const standard = WORD_COUNT_STANDARDS[userData.gradeLevel];
    if (currentWriting.wordCount < standard.min) {
      alert(`글자 수가 부족합니다. 최소 ${standard.min}자 이상 작성해 주세요.`);
      return;
    }

    if (currentWriting.wordCount > standard.max) {
      alert(`글자 수가 너무 많습니다. 최대 ${standard.max}자 이하로 줄여 주세요.`);
      return;
    }

    if (!confirm("글을 제출하시겠습니까? 제출 후 AI가 분석합니다.")) return;

    setIsSubmitting(true);
    try {
      const result = await submitWriting(user.uid, currentWriting);
      setFeedback(result.analysis);

      if (result.score >= PASSING_SCORE) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        alert(`축하합니다! ${result.score}점을 받았습니다.`);
      } else {
        alert(`${result.score}점입니다. 기준 점수(${PASSING_SCORE}점)를 미달했습니다. 피드백을 참고해 다음에 도전해 보세요.`);
      }

      setCurrentWriting({
        topic: "",
        content: "",
        wordCount: 0,
        gradeLevel: userData.gradeLevel,
        studentName: userData.name
      });
      setSelectedTopic(null);
      loadData();
    } catch (error) {
      alert(error.message || "제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  const topics = recommendedTopics[userData.gradeLevel] || [];
  const wordCountStatus = getWordCountStatus();
  const standard = WORD_COUNT_STANDARDS[userData.gradeLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-600 to-sky-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-100">Isw Writing Lab</p>
            <h1 className="text-2xl font-bold mt-1">Isw 글쓰기 도우미</h1>
            <p className="text-sm text-indigo-100 mt-1">
              {userData.name} ({GRADE_LEVELS[userData.gradeLevel]})
            </p>
            {classInfo && (
              <p className="text-xs text-indigo-100 mt-1">소속: {classInfo.className}</p>
            )}
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
        {/* Class Join Section */}
        {!classInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">반에 가입하세요</h3>
            <p className="text-sm text-yellow-800 mb-4">
              선생님께 받은 클래스 코드를 입력해 반에 가입해 주세요.
            </p>
            <form onSubmit={handleJoinClass} className="flex space-x-2">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="클래스 코드 (예: ABC123)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={6}
              />
              <button
                type="submit"
                className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600"
              >
                가입
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("write")}
              className={`${
                activeTab === "write"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              글쓰기
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              제출 기록 ({writings.filter((w) => !w.isDraft).length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`${
                activeTab === "stats"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              통계
            </button>
          </nav>
        </div>

        {/* Write Tab */}
        {activeTab === "write" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topic Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">추천 주제</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className={`w-full text-left p-3 rounded border ${
                        selectedTopic?.id === topic.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{topic.title}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{topic.subject}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
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
                  ))}
                </div>

                <div className="mt-4 pt-4 border-top">
                  <button
                    onClick={() => {
                      const customTopic = prompt("주제를 입력하세요");
                      if (customTopic) {
                        setSelectedTopic({ id: "custom", title: customTopic });
                        setCurrentWriting({
                          ...currentWriting,
                          topic: customTopic,
                          content: "",
                          wordCount: 0
                        });
                      }
                    }}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    직접 입력하기
                  </button>
                </div>
              </div>
            </div>

            {/* Writing Area */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                {selectedTopic ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{currentWriting.topic}</h3>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">글자수</span>
                        <span className={`text-sm font-bold ${wordCountStatus.color}`}>
                          {currentWriting.wordCount}자 / {standard.ideal}자 권장
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            wordCountStatus.status === "ideal"
                              ? "bg-emerald-500"
                              : wordCountStatus.status === "ok"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min((currentWriting.wordCount / standard.max) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${wordCountStatus.color}`}>{wordCountStatus.message}</p>
                      <p className="text-xs text-gray-500 mt-1">범위: {standard.min}자 ~ {standard.max}자</p>
                    </div>

                    <textarea
                      value={currentWriting.content}
                      onChange={handleContentChange}
                      placeholder="주제에 맞춰 글을 작성해 보세요.. (30초마다 자동 저장)"
                      className="w-full h-96 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleSubmit}
                        disabled={
                          isSubmitting ||
                          !currentWriting.content ||
                          currentWriting.wordCount < standard.min ||
                          currentWriting.wordCount > standard.max
                        }
                        className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded font-semibold hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "AI 분석 중..." : "제출하기"}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentWriting({
                            topic: "",
                            content: "",
                            wordCount: 0,
                            gradeLevel: userData.gradeLevel,
                            studentName: userData.name
                          });
                          setSelectedTopic(null);
                          setFeedback(null);
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded hover:bg-gray-300"
                      >
                        취소
                      </button>
                    </div>

                    {feedback && (
                      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h4 className="font-semibold text-indigo-900 mb-3">AI 피드백</h4>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-600">내용</div>
                            <div className="text-lg font-bold text-indigo-600">{feedback.contentScore}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600">구성</div>
                            <div className="text-lg font-bold text-indigo-600">{feedback.structureScore}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600">어휘</div>
                            <div className="text-lg font-bold text-indigo-600">{feedback.vocabularyScore}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600">문법</div>
                            <div className="text-lg font-bold text-indigo-600">{feedback.grammarScore}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600">창의성</div>
                            <div className="text-lg font-bold text-indigo-600">{feedback.creativityScore}</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-gray-700 mb-1">좋은 점</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {feedback.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-3">
                          <h5 className="font-medium text-sm text-gray-700 mb-1">개선 포인트</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {feedback.improvements.map((improvement, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">종합 의견</h5>
                          <p className="text-sm text-gray-700">{feedback.overallFeedback}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">왼쪽에서 주제를 선택해 주세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {writings.filter((w) => !w.isDraft).length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">아직 제출한 글이 없습니다.</p>
              </div>
            ) : (
              writings
                .filter((w) => !w.isDraft)
                .map((writing) => (
                  <div key={writing.writingId} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{writing.topic}</h3>
                        <p className="text-sm text-gray-600">제출: {new Date(writing.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{writing.score}점</div>
                        <div className="text-sm text-gray-500">{writing.wordCount}자</div>
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
                ))
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 제출 수</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats?.totalSubmissions || 0}개</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">평균 점수</h3>
                <p className="text-3xl font-bold text-emerald-600">{stats?.averageScore || 0}점</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">최고 점수</h3>
                <p className="text-3xl font-bold text-purple-600">{stats?.scores ? Math.max(...stats.scores) : 0}점</p>
              </div>
            </div>

            {stats && stats.scores && stats.scores.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">점수 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.scores.map((score, idx) => ({
                      name: `${idx + 1}회차`,
                      score
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} name="점수" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
