import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const url = new URL(context.request.url);
    const studentId = url.searchParams.get("student_id") || user.id;
    const classCode = url.searchParams.get("class_code");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    let query = "SELECT * FROM writings WHERE is_draft = 0";
    const params: any[] = [];

    if (classCode && (user.role === "teacher" || user.role === "super_admin")) {
      query += " AND class_code = ?";
      params.push(classCode);
    } else {
      query += " AND student_id = ?";
      params.push(studentId);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const { results } = await context.env.DB.prepare(query)
      .bind(...params)
      .all();
    return jsonResponse({ writings: results });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const data = (await context.request.json()) as any;

    if (!data.content || data.content.trim().length < 10) {
      return errorResponse("글 내용이 너무 짧습니다. 최소 10자 이상 써주세요.");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await context.env.DB.prepare(
      `INSERT INTO writings (id, student_id, class_code, assignment_id, content, writing_type, topic, grade_level,
        score_content, score_organization, score_expression, score_mechanics, score_total,
        feedback, sentence_feedbacks, is_draft, is_rewrite, previous_score, rewrite_count,
        word_count, char_count, sentence_count, paragraph_count, unique_word_count,
        vocabulary_diversity, avg_sentence_length, self_assessment, created_at, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        user.id,
        data.class_code || user.class_code || "",
        data.assignment_id || "",
        data.content,
        data.writing_type || "",
        data.topic || "",
        data.grade_level || user.grade_level || "",
        data.score_content || 0,
        data.score_organization || 0,
        data.score_expression || 0,
        data.score_mechanics || 0,
        data.score_total || 0,
        data.feedback || "",
        data.sentence_feedbacks || "[]",
        data.is_draft ? 1 : 0,
        data.is_rewrite ? 1 : 0,
        data.previous_score || 0,
        data.rewrite_count || 0,
        data.word_count || 0,
        data.char_count || 0,
        data.sentence_count || 0,
        data.paragraph_count || 0,
        data.unique_word_count || 0,
        data.vocabulary_diversity || 0,
        data.avg_sentence_length || 0,
        data.self_assessment || "",
        now,
        data.is_draft ? "" : now,
      )
      .run();

    // Update error patterns if provided
    if (data.error_patterns && Array.isArray(data.error_patterns)) {
      for (const ep of data.error_patterns) {
        await context.env.DB.prepare(
          `INSERT INTO error_patterns (user_id, pattern_type, pattern_detail, count, last_example, last_seen, first_seen)
           VALUES (?, ?, ?, 1, ?, datetime('now'), datetime('now'))
           ON CONFLICT(user_id, pattern_type) DO UPDATE SET
             count = count + 1, last_example = ?, last_seen = datetime('now')`,
        )
          .bind(user.id, ep.type, ep.detail, ep.example, ep.example)
          .run();
      }
    }

    // Update monthly stats
    const month = now.substring(0, 7);
    const existingStats = await context.env.DB.prepare(
      "SELECT * FROM writing_stats WHERE user_id = ? AND month = ?",
    )
      .bind(user.id, month)
      .first();

    if (existingStats) {
      const s = existingStats as any;
      const newTotal = s.total_writings + 1;
      const newAvgScore =
        (s.avg_score * s.total_writings + (data.score_total || 0)) / newTotal;
      const newAvgWords =
        (s.avg_word_count * s.total_writings + (data.word_count || 0)) /
        newTotal;

      await context.env.DB.prepare(
        `UPDATE writing_stats SET total_writings = ?, avg_score = ?, avg_word_count = ?,
         unique_words = MAX(unique_words, ?), vocabulary_diversity = ?,
         avg_sentence_length = ?, updated_at = datetime('now')
         WHERE user_id = ? AND month = ?`,
      )
        .bind(
          newTotal,
          newAvgScore,
          newAvgWords,
          data.unique_word_count || 0,
          data.vocabulary_diversity || 0,
          data.avg_sentence_length || 0,
          user.id,
          month,
        )
        .run();
    } else {
      await context.env.DB.prepare(
        `INSERT INTO writing_stats (user_id, month, total_writings, avg_score, avg_word_count,
         unique_words, vocabulary_diversity, avg_sentence_length)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?)`,
      )
        .bind(
          user.id,
          month,
          data.score_total || 0,
          data.word_count || 0,
          data.unique_word_count || 0,
          data.vocabulary_diversity || 0,
          data.avg_sentence_length || 0,
        )
        .run();
    }

    const writing = await context.env.DB.prepare(
      "SELECT * FROM writings WHERE id = ?",
    )
      .bind(id)
      .first();
    return jsonResponse({ writing });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "글 저장 실패", 500);
  }
};
