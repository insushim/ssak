import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    await requireAuth(context.request, context.env.DB);
    const id = context.params.id as string;
    const writing = await context.env.DB.prepare(
      "SELECT * FROM writings WHERE id = ?",
    )
      .bind(id)
      .first();
    if (!writing) return errorResponse("글을 찾을 수 없습니다.", 404);
    return jsonResponse({ writing });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const id = context.params.id as string;
    const data = (await context.request.json()) as any;

    const writing = (await context.env.DB.prepare(
      "SELECT * FROM writings WHERE id = ?",
    )
      .bind(id)
      .first()) as any;
    if (!writing) return errorResponse("글을 찾을 수 없습니다.", 404);
    if (writing.student_id !== user.id && user.role === "student") {
      return errorResponse("권한이 없습니다.", 403);
    }

    const sets: string[] = [];
    const values: any[] = [];
    const updatableFields = [
      "content",
      "score_content",
      "score_organization",
      "score_expression",
      "score_mechanics",
      "score_total",
      "feedback",
      "sentence_feedbacks",
      "teacher_feedback",
      "teacher_feedback_at",
      "is_draft",
      "word_count",
      "char_count",
      "sentence_count",
      "paragraph_count",
      "unique_word_count",
      "vocabulary_diversity",
      "avg_sentence_length",
      "self_assessment",
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (sets.length > 0) {
      values.push(id);
      await context.env.DB.prepare(
        `UPDATE writings SET ${sets.join(", ")} WHERE id = ?`,
      )
        .bind(...values)
        .run();
    }

    const updated = await context.env.DB.prepare(
      "SELECT * FROM writings WHERE id = ?",
    )
      .bind(id)
      .first();
    return jsonResponse({ writing: updated });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "업데이트 실패", 500);
  }
};
