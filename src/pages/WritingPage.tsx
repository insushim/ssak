import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Save, Lightbulb, BookOpen, Star } from "lucide-react";
import { scoreWriting, analyzeText, detectErrorPatterns } from "../lib/scoring";
import { findBetterExpressions } from "../lib/expressions";
import { calculatePoints, calculateLevel } from "../lib/achievements";
import { api } from "../lib/api";
import { getToday } from "../lib/utils";
import type { SelfAssessment } from "../types";

const WRITING_TYPES = [
  "자유글",
  "일기",
  "편지",
  "설명문",
  "논설문",
  "독후감",
  "감상문",
  "기행문",
];

export default function WritingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [writingType, setWritingType] = useState("자유글");
  const [submitting, setSubmitting] = useState(false);
  const [showSelfAssess, setShowSelfAssess] = useState(false);
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessment>({
    rating_topic: 3,
    rating_length: 3,
    rating_spelling: 3,
    rating_expression: 3,
  });
  const [showExpressions, setShowExpressions] = useState(false);

  const textStats = useMemo(() => analyzeText(content), [content]);
  const expressions = useMemo(
    () => (content.length > 20 ? findBetterExpressions(content) : []),
    [content],
  );

  const handleSubmit = async () => {
    if (!content.trim() || content.trim().length < 10) return;
    setShowSelfAssess(true);
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const result = scoreWriting(content, topic, user.grade_level || "초3-4");
      const errorPatterns = detectErrorPatterns(content);
      const points = calculatePoints(result.total, false, 0);

      const writingData = {
        content,
        topic,
        writing_type: writingType,
        grade_level: user.grade_level,
        assignment_id: assignmentId || "",
        score_content: result.content,
        score_organization: result.organization,
        score_expression: result.expression,
        score_mechanics: result.mechanics,
        score_total: result.total,
        feedback: result.feedback,
        sentence_feedbacks: JSON.stringify(result.sentenceFeedbacks),
        word_count: result.textStats.wordCount,
        char_count: result.textStats.charCount,
        sentence_count: result.textStats.sentenceCount,
        paragraph_count: result.textStats.paragraphCount,
        unique_word_count: result.textStats.uniqueWordCount,
        vocabulary_diversity: result.textStats.vocabularyDiversity,
        avg_sentence_length: result.textStats.avgSentenceLength,
        self_assessment: JSON.stringify(selfAssessment),
        error_patterns: errorPatterns,
      };

      const { writing } = await api.createWriting(writingData);

      // Update user points
      const newPoints = (user.points || 0) + points;
      const newLevel = calculateLevel(newPoints);
      const today = getToday();
      const isConsecutive =
        user.last_submit_date === getToday()
          ? user.streak_days
          : new Date(today).getTime() -
                new Date(user.last_submit_date || "").getTime() <=
              86400000 * 1.5
            ? (user.streak_days || 0) + 1
            : 1;

      await updateUser({
        points: newPoints,
        level: newLevel.level,
        streak_days: isConsecutive,
        last_submit_date: today,
      } as any);

      navigate(`/result/${writing.id}`);
    } catch (err: any) {
      alert(err.message || "제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-900 dark:text-white">글쓰기</h1>
          <div className="flex items-center gap-2">
            {expressions.length > 0 && (
              <button
                onClick={() => setShowExpressions(!showExpressions)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Lightbulb size={20} className="text-yellow-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {expressions.length}
                </span>
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={content.trim().length < 10 || submitting}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Send size={16} />
              제출
            </button>
          </div>
        </div>
      </header>

      <div className="content-container space-y-4">
        {/* Topic & Type */}
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field flex-1"
            placeholder="글의 주제 (선택)"
          />
          <select
            value={writingType}
            onChange={(e) => setWritingType(e.target.value)}
            className="input-field w-32"
          >
            {WRITING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Editor */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[400px] text-base leading-relaxed resize-none"
            placeholder="여기에 글을 쓰세요..."
            autoFocus
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 space-x-3">
            <span>{textStats.charCount}자</span>
            <span>{textStats.wordCount}단어</span>
            <span>{textStats.sentenceCount}문장</span>
          </div>
        </div>

        {/* Expression Suggestions */}
        <AnimatePresence>
          {showExpressions && expressions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="card border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
            >
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-2">
                <Lightbulb size={16} /> 표현 추천
              </h3>
              <div className="space-y-3">
                {expressions.map((exp, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-yellow-800 dark:text-yellow-300">
                      <strong>'{exp.word}'</strong>을 반복 사용했어요.
                    </p>
                    <p className="text-yellow-600 dark:text-yellow-500 mt-1">
                      이런 표현은 어때요?{" "}
                      <span className="font-medium">
                        {exp.upgrades.join(", ")}
                      </span>
                    </p>
                    <p className="text-yellow-500 dark:text-yellow-600 text-xs mt-0.5 italic">
                      예: {exp.example}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Self Assessment Modal */}
      <AnimatePresence>
        {showSelfAssess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen size={20} /> 내 글을 스스로 평가해보세요!
              </h2>
              {[
                { key: "rating_topic", label: "주제에 맞게 썼나요?" },
                { key: "rating_length", label: "충분히 길게 썼나요?" },
                { key: "rating_spelling", label: "맞춤법은 괜찮나요?" },
                { key: "rating_expression", label: "다양한 표현을 썼나요?" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setSelfAssessment((prev) => ({ ...prev, [key]: v }))
                        }
                        className="p-0.5"
                      >
                        <Star
                          size={22}
                          className={
                            v <= (selfAssessment as any)[key]
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowSelfAssess(false)}
                  className="btn-secondary flex-1"
                >
                  취소
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {submitting ? "제출 중..." : "제출하기"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
