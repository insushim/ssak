import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../App";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Home,
  RefreshCw,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Star,
  ThumbsUp,
} from "lucide-react";
import { api } from "../lib/api";
import { compareSelfAssessment } from "../lib/scoring";
import { getScoreColor, getScoreBgColor, getScoreLabel } from "../lib/utils";
import type { Writing, SentenceFeedback, SelfAssessment } from "../types";

export default function WritingResult() {
  const { writingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [writing, setWriting] = useState<Writing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"score" | "sentences" | "self">(
    "score",
  );

  useEffect(() => {
    if (!writingId) return;
    api
      .getWriting(writingId)
      .then(({ writing: w }) => setWriting(w))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [writingId]);

  const sentenceFeedbacks: SentenceFeedback[] = useMemo(() => {
    if (!writing?.sentence_feedbacks) return [];
    try {
      return JSON.parse(writing.sentence_feedbacks);
    } catch {
      return [];
    }
  }, [writing]);

  const selfAssessment: SelfAssessment | null = useMemo(() => {
    if (!writing?.self_assessment) return null;
    try {
      return JSON.parse(writing.self_assessment);
    } catch {
      return null;
    }
  }, [writing]);

  const selfComparison = useMemo(() => {
    if (!selfAssessment || !writing) return null;
    return compareSelfAssessment(selfAssessment, {
      content: writing.score_content,
      organization: writing.score_organization,
      expression: writing.score_expression,
      mechanics: writing.score_mechanics,
      total: writing.score_total,
      feedback: "",
      sentenceFeedbacks: [],
      textStats: {
        charCount: writing.char_count,
        wordCount: writing.word_count,
        sentenceCount: writing.sentence_count,
        paragraphCount: writing.paragraph_count,
        uniqueWordCount: writing.unique_word_count,
        vocabularyDiversity: writing.vocabulary_diversity,
        avgSentenceLength: writing.avg_sentence_length,
        longestSentence: 0,
        shortestSentence: 0,
      },
    });
  }, [selfAssessment, writing]);

  if (loading)
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-4xl animate-bounce-slow">🌱</div>
      </div>
    );
  if (!writing)
    return (
      <div className="page-container flex items-center justify-center">
        <p>글을 찾을 수 없습니다.</p>
      </div>
    );

  const domains = [
    {
      name: "내용",
      score: writing.score_content,
      max: 30,
      color: "bg-blue-500",
    },
    {
      name: "조직",
      score: writing.score_organization,
      max: 25,
      color: "bg-purple-500",
    },
    {
      name: "표현",
      score: writing.score_expression,
      max: 25,
      color: "bg-pink-500",
    },
    {
      name: "표기",
      score: writing.score_mechanics,
      max: 20,
      color: "bg-orange-500",
    },
  ];

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
          <h1 className="font-bold text-gray-900 dark:text-white">채점 결과</h1>
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Home size={20} />
          </Link>
        </div>
      </header>

      <div className="content-container space-y-6">
        {/* Total Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card text-center"
        >
          <div
            className={`score-circle mx-auto mb-3 ${getScoreBgColor(writing.score_total)}`}
          >
            {writing.score_total}
          </div>
          <p
            className={`text-lg font-bold ${getScoreColor(writing.score_total)}`}
          >
            {getScoreLabel(writing.score_total)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {writing.word_count}단어 · {writing.sentence_count}문장
          </p>
        </motion.div>

        {/* Domain Scores */}
        <div className="card">
          <h3 className="section-title">영역별 점수</h3>
          <div className="space-y-3">
            {domains.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    {d.name}
                  </span>
                  <span className="font-medium">
                    {d.score}/{d.max}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`${d.color} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.score / d.max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Feedback */}
        {writing.teacher_feedback && (
          <div className="card border-ssak-200 bg-ssak-50 dark:bg-ssak-900/20">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp size={16} className="text-ssak-600" />
              <span className="font-semibold text-ssak-700 dark:text-ssak-400">
                선생님 피드백
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {writing.teacher_feedback}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { key: "score", label: "피드백" },
            { key: "sentences", label: `문장별 (${sentenceFeedbacks.length})` },
            { key: "self", label: "자기 평가" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "score" && (
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <MessageCircle size={16} /> 전체 피드백
            </h3>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
              {writing.feedback}
            </div>
          </div>
        )}

        {activeTab === "sentences" && (
          <div className="space-y-2">
            {sentenceFeedbacks.length === 0 ? (
              <div className="card text-center py-6 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p>문장별 특별한 지적 사항이 없어요. 잘 썼어요!</p>
              </div>
            ) : (
              sentenceFeedbacks.map((sf, i) => (
                <div
                  key={i}
                  className={`card border-l-4 ${
                    sf.type === "error"
                      ? "border-l-red-500 bg-red-50 dark:bg-red-900/10"
                      : sf.type === "warning"
                        ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
                        : "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10"
                  }`}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                    "{sf.sentence}"
                  </p>
                  {sf.issues.map((issue, j) => (
                    <div
                      key={j}
                      className="flex items-start gap-2 text-sm mb-1"
                    >
                      {sf.type === "error" ? (
                        <AlertTriangle
                          size={14}
                          className="text-red-500 mt-0.5 shrink-0"
                        />
                      ) : sf.type === "warning" ? (
                        <AlertTriangle
                          size={14}
                          className="text-yellow-500 mt-0.5 shrink-0"
                        />
                      ) : (
                        <Lightbulb
                          size={14}
                          className="text-blue-500 mt-0.5 shrink-0"
                        />
                      )}
                      <span>{issue}</span>
                    </div>
                  ))}
                  {sf.suggestions.length > 0 && (
                    <div className="mt-2 pl-6 text-xs text-gray-500">
                      {sf.suggestions.map((s, j) => (
                        <p key={j}>{s}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "self" && selfComparison && (
          <div className="space-y-3">
            {selfComparison.map((c, i) => (
              <div key={i} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {c.category}
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">
                      나: {"★".repeat(c.selfRating)}
                      {"☆".repeat(5 - c.selfRating)}
                    </span>
                    <span className="text-ssak-600">
                      실제: {"★".repeat(c.actualLevel)}
                      {"☆".repeat(5 - c.actualLevel)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {c.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Rewrite Button */}
        <Link
          to={`/write`}
          className="card flex items-center justify-center gap-2 text-ssak-600 hover:bg-ssak-50 dark:hover:bg-ssak-900/20 transition"
        >
          <RefreshCw size={18} />
          <span className="font-medium">고쳐쓰기</span>
        </Link>
      </div>
    </div>
  );
}
