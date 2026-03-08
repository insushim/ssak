import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 접근할 수 있습니다.", 403);
    }

    const url = new URL(context.request.url);
    const classCode = url.searchParams.get("class_code");
    if (!classCode) return errorResponse("학급 코드가 필요합니다.");

    // Total students
    const { results: students } = await context.env.DB.prepare(
      `SELECT u.id, u.name, u.points, u.level, u.streak_days, u.last_submit_date,
        (SELECT COUNT(*) FROM writings w WHERE w.student_id = u.id AND w.is_draft = 0) as writing_count,
        (SELECT AVG(w.score_total) FROM writings w WHERE w.student_id = u.id AND w.is_draft = 0) as avg_score,
        (SELECT AVG(w.vocabulary_diversity) FROM writings w WHERE w.student_id = u.id AND w.is_draft = 0) as avg_vocab,
        (SELECT MAX(w.submitted_at) FROM writings w WHERE w.student_id = u.id AND w.is_draft = 0) as last_submission
       FROM users u WHERE u.class_code = ? AND u.role = 'student' ORDER BY u.name`,
    )
      .bind(classCode)
      .all();

    const totalStudents = students?.length || 0;

    // This week's submissions
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const weekSubmissions = (await context.env.DB.prepare(
      `SELECT COUNT(DISTINCT student_id) as cnt FROM writings
       WHERE class_code = ? AND is_draft = 0 AND submitted_at > ?`,
    )
      .bind(classCode, weekAgo)
      .first()) as any;

    const submissionRate =
      totalStudents > 0
        ? Math.round(((weekSubmissions?.cnt || 0) / totalStudents) * 100)
        : 0;

    // Average vocabulary diversity
    const avgVocab = (await context.env.DB.prepare(
      `SELECT AVG(vocabulary_diversity) as avg FROM writings
       WHERE class_code = ? AND is_draft = 0 AND submitted_at > ?`,
    )
      .bind(classCode, weekAgo)
      .first()) as any;

    // Common errors across class
    const { results: classErrors } = await context.env.DB.prepare(
      `SELECT pattern_type, SUM(count) as total_count, COUNT(DISTINCT user_id) as student_count
       FROM error_patterns ep
       JOIN users u ON ep.user_id = u.id
       WHERE u.class_code = ?
       GROUP BY pattern_type ORDER BY student_count DESC LIMIT 5`,
    )
      .bind(classCode)
      .all();

    // Need attention (no submission in 2 weeks, or scores dropping)
    const needAttention: any[] = [];
    const praiseWorthy: any[] = [];
    const twoWeeksAgo = new Date(
      Date.now() - 14 * 24 * 3600 * 1000,
    ).toISOString();

    for (const s of (students || []) as any[]) {
      if (!s.last_submission || s.last_submission < twoWeeksAgo) {
        needAttention.push({ name: s.name, reason: "2주 이상 미제출" });
      }
      if (s.avg_score && s.avg_score < 60 && s.writing_count >= 3) {
        needAttention.push({
          name: s.name,
          reason: `평균 점수 ${Math.round(s.avg_score)}점`,
        });
      }
      if (s.streak_days >= 7) {
        praiseWorthy.push({
          name: s.name,
          reason: `${s.streak_days}일 연속 제출`,
        });
      }
      if (s.avg_score >= 85 && s.writing_count >= 3) {
        praiseWorthy.push({
          name: s.name,
          reason: `평균 ${Math.round(s.avg_score)}점`,
        });
      }
    }

    return jsonResponse({
      stats: {
        totalStudents,
        submissionRate,
        avgVocabularyDiversity: Math.round((avgVocab?.avg || 0) * 100) / 100,
        needAttention: needAttention.slice(0, 5),
        praiseWorthy: praiseWorthy.slice(0, 5),
        commonWeakness: (classErrors || []).map((e: any) => ({
          pattern: e.pattern_type,
          count: e.student_count,
        })),
        students: (students || []).map((s: any) => ({
          ...s,
          avg_score: s.avg_score ? Math.round(s.avg_score * 10) / 10 : 0,
          avg_vocab: s.avg_vocab ? Math.round(s.avg_vocab * 100) / 100 : 0,
        })),
      },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};
