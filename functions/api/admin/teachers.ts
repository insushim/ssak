import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "super_admin")
      return errorResponse("권한이 없습니다.", 403);

    const { results } = await context.env.DB.prepare(
      "SELECT id, email, name, approved, created_at FROM users WHERE role = 'teacher' ORDER BY created_at DESC",
    ).all();

    return jsonResponse({ teachers: results || [] });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "super_admin")
      return errorResponse("권한이 없습니다.", 403);

    const { teacher_id, action } = (await context.request.json()) as any;
    if (!teacher_id) return errorResponse("교사 ID가 필요합니다.");

    if (action === "approve") {
      await context.env.DB.prepare(
        "UPDATE users SET approved = 1, updated_at = datetime('now') WHERE id = ? AND role = 'teacher'",
      )
        .bind(teacher_id)
        .run();
    } else if (action === "reject") {
      await context.env.DB.prepare(
        "DELETE FROM users WHERE id = ? AND role = 'teacher'",
      )
        .bind(teacher_id)
        .run();
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};
