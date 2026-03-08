import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    await requireAuth(context.request, context.env.DB);
    const code = context.params.code as string;

    const classInfo = await context.env.DB.prepare(
      "SELECT * FROM classes WHERE code = ?",
    )
      .bind(code)
      .first();
    if (!classInfo) return errorResponse("학급을 찾을 수 없습니다.", 404);

    const { results: students } = await context.env.DB.prepare(
      `SELECT id, name, nickname, points, level, streak_days, last_submit_date, created_at
       FROM users WHERE class_code = ? AND role = 'student' ORDER BY name`,
    )
      .bind(code)
      .all();

    return jsonResponse({ classInfo, students: students || [] });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

// Join class
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const code = context.params.code as string;

    const classInfo = (await context.env.DB.prepare(
      "SELECT * FROM classes WHERE code = ?",
    )
      .bind(code)
      .first()) as any;
    if (!classInfo) return errorResponse("존재하지 않는 학급 코드입니다.", 404);

    // Check max students
    const count = (await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM users WHERE class_code = ? AND role = ?",
    )
      .bind(code, "student")
      .first()) as any;
    if (count?.cnt >= classInfo.max_students) {
      return errorResponse("학급 정원이 초과되었습니다.");
    }

    await context.env.DB.prepare(
      "UPDATE users SET class_code = ?, updated_at = datetime('now') WHERE id = ?",
    )
      .bind(code, user.id)
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "학급 가입 실패", 500);
  }
};
