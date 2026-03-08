import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("user_id") || user.id;

    // Basic stats
    const totalWritings = (await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM writings WHERE student_id = ? AND is_draft = 0",
    )
      .bind(userId)
      .first()) as any;

    const avgScore = (await context.env.DB.prepare(
      "SELECT AVG(score_total) as avg FROM writings WHERE student_id = ? AND is_draft = 0",
    )
      .bind(userId)
      .first()) as any;

    const maxScore = (await context.env.DB.prepare(
      "SELECT MAX(score_total) as max FROM writings WHERE student_id = ? AND is_draft = 0",
    )
      .bind(userId)
      .first()) as any;

    const rewriteCount = (await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM writings WHERE student_id = ? AND is_rewrite = 1",
    )
      .bind(userId)
      .first()) as any;

    const perfectCount = (await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM writings WHERE student_id = ? AND score_total >= 95 AND is_draft = 0",
    )
      .bind(userId)
      .first()) as any;

    const totalWords = (await context.env.DB.prepare(
      "SELECT SUM(word_count) as total FROM writings WHERE student_id = ? AND is_draft = 0",
    )
      .bind(userId)
      .first()) as any;

    // Error patterns
    const { results: errorPatterns } = await context.env.DB.prepare(
      "SELECT * FROM error_patterns WHERE user_id = ? ORDER BY count DESC LIMIT 10",
    )
      .bind(userId)
      .all();

    // Monthly stats
    const { results: monthlyStats } = await context.env.DB.prepare(
      "SELECT * FROM writing_stats WHERE user_id = ? ORDER BY month DESC LIMIT 12",
    )
      .bind(userId)
      .all();

    // Achievements
    const { results: achievements } = await context.env.DB.prepare(
      "SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?",
    )
      .bind(userId)
      .all();

    return jsonResponse({
      stats: {
        totalWritings: totalWritings?.cnt || 0,
        avgScore: Math.round((avgScore?.avg || 0) * 10) / 10,
        maxScore: maxScore?.max || 0,
        rewriteCount: rewriteCount?.cnt || 0,
        perfectCount: perfectCount?.cnt || 0,
        totalWords: totalWords?.total || 0,
      },
      errorPatterns: errorPatterns || [],
      monthlyStats: monthlyStats || [],
      achievements: (achievements || []).map((a: any) => a.achievement_id),
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};
