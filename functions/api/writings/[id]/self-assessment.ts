import { Env, jsonResponse, errorResponse, requireAuth } from "../../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const writingId = context.params.id as string;
    const data = (await context.request.json()) as any;

    await context.env.DB.prepare(
      `INSERT INTO self_assessments (writing_id, user_id, rating_topic, rating_length, rating_spelling, rating_expression)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(writing_id) DO UPDATE SET
         rating_topic = ?, rating_length = ?, rating_spelling = ?, rating_expression = ?`,
    )
      .bind(
        writingId,
        user.id,
        data.rating_topic || 3,
        data.rating_length || 3,
        data.rating_spelling || 3,
        data.rating_expression || 3,
        data.rating_topic || 3,
        data.rating_length || 3,
        data.rating_spelling || 3,
        data.rating_expression || 3,
      )
      .run();

    // Also store in writing
    await context.env.DB.prepare(
      "UPDATE writings SET self_assessment = ? WHERE id = ?",
    )
      .bind(JSON.stringify(data), writingId)
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "자기 평가 저장 실패", 500);
  }
};
