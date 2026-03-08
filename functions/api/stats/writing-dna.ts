import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("user_id") || user.id;

    // Get all writings for DNA analysis
    const { results: writings } = await context.env.DB.prepare(
      `SELECT content, word_count, vocabulary_diversity, avg_sentence_length,
              score_total, score_content, score_organization, score_expression, score_mechanics,
              submitted_at
       FROM writings WHERE student_id = ? AND is_draft = 0
       ORDER BY submitted_at DESC LIMIT 100`,
    )
      .bind(userId)
      .all();

    if (!writings || writings.length === 0) {
      return jsonResponse({ dna: null });
    }

    // Analyze favorite words across all writings
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      "이",
      "그",
      "저",
      "것",
      "수",
      "등",
      "때",
      "중",
      "나",
      "우리",
      "를",
      "을",
      "에",
      "의",
      "가",
      "는",
      "은",
      "도",
      "와",
      "과",
      "에서",
      "으로",
      "하다",
      "있다",
      "되다",
      "없다",
      "같다",
    ]);

    for (const w of writings as any[]) {
      const words = (w.content || "")
        .replace(/[^\uAC00-\uD7A3a-zA-Z\s]/g, " ")
        .split(/\s+/)
        .filter((w: string) => w.length >= 2);
      for (const word of words) {
        if (!stopWords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      }
    }

    const favoriteWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Error patterns
    const { results: errorPatterns } = await context.env.DB.prepare(
      "SELECT pattern_type, count, first_seen, last_seen FROM error_patterns WHERE user_id = ? ORDER BY count DESC",
    )
      .bind(userId)
      .all();

    const commonErrors = (errorPatterns || []).map((ep: any) => {
      const daysSinceFirst = Math.floor(
        (Date.now() - new Date(ep.first_seen).getTime()) / 86400000,
      );
      const daysSinceLast = Math.floor(
        (Date.now() - new Date(ep.last_seen).getTime()) / 86400000,
      );
      let trend = "stable";
      if (daysSinceLast > 14) trend = "decreasing";
      else if (daysSinceFirst < 7 && ep.count > 3) trend = "increasing";
      return { type: ep.pattern_type, count: ep.count, trend };
    });

    // Monthly progress
    const { results: monthlyStats } = await context.env.DB.prepare(
      "SELECT * FROM writing_stats WHERE user_id = ? ORDER BY month DESC LIMIT 12",
    )
      .bind(userId)
      .all();

    // Determine strengths
    const avgContent =
      writings.reduce((s: number, w: any) => s + (w.score_content || 0), 0) /
      writings.length;
    const avgOrg =
      writings.reduce(
        (s: number, w: any) => s + (w.score_organization || 0),
        0,
      ) / writings.length;
    const avgExp =
      writings.reduce((s: number, w: any) => s + (w.score_expression || 0), 0) /
      writings.length;
    const avgMech =
      writings.reduce((s: number, w: any) => s + (w.score_mechanics || 0), 0) /
      writings.length;

    const strengths: string[] = [];
    const scores = [
      { name: "내용", score: avgContent, max: 30 },
      { name: "조직", score: avgOrg, max: 25 },
      { name: "표현", score: avgExp, max: 25 },
      { name: "표기", score: avgMech, max: 20 },
    ];
    scores.sort((a, b) => b.score / b.max - a.score / a.max);
    if (scores[0].score / scores[0].max >= 0.7) {
      strengths.push(`${scores[0].name} 영역이 가장 강해요`);
    }

    const avgVocab =
      writings.reduce(
        (s: number, w: any) => s + (w.vocabulary_diversity || 0),
        0,
      ) / writings.length;
    if (avgVocab >= 0.6) strengths.push("어휘가 다양해요");

    const avgSentLen =
      writings.reduce(
        (s: number, w: any) => s + (w.avg_sentence_length || 0),
        0,
      ) / writings.length;

    return jsonResponse({
      dna: {
        totalWritings: writings.length,
        avgSentenceLength: Math.round(avgSentLen * 10) / 10,
        vocabularyDiversity: Math.round(avgVocab * 100) / 100,
        favoriteWords,
        commonErrors,
        strengths,
        monthlyProgress: (monthlyStats || []).reverse(),
        domainAverages: {
          content: Math.round(avgContent * 10) / 10,
          organization: Math.round(avgOrg * 10) / 10,
          expression: Math.round(avgExp * 10) / 10,
          mechanics: Math.round(avgMech * 10) / 10,
        },
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};
