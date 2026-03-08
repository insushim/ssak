import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("user_id") || user.id;

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM error_patterns WHERE user_id = ? ORDER BY count DESC",
    )
      .bind(userId)
      .all();

    return jsonResponse({ patterns: results || [] });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};
