import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const { achievement_ids } = (await context.request.json()) as any;

    if (!achievement_ids || !Array.isArray(achievement_ids)) {
      return errorResponse("업적 ID 목록이 필요합니다.");
    }

    for (const aid of achievement_ids) {
      await context.env.DB.prepare(
        `INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)
         ON CONFLICT(user_id, achievement_id) DO NOTHING`,
      )
        .bind(user.id, aid)
        .run();
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};
