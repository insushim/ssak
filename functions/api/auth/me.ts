import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    return jsonResponse({ user: { ...user, password_hash: undefined } });
  } catch {
    return errorResponse("인증이 필요합니다.", 401);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const updates = (await context.request.json()) as any;

    const allowedFields = [
      "name",
      "nickname",
      "grade_level",
      "class_code",
      "privacy_agreed",
    ];
    const sets: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sets.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updates.points !== undefined && typeof updates.points === "number") {
      sets.push("points = ?");
      values.push(updates.points);
    }
    if (updates.level !== undefined && typeof updates.level === "number") {
      sets.push("level = ?");
      values.push(updates.level);
    }
    if (updates.streak_days !== undefined) {
      sets.push("streak_days = ?");
      values.push(updates.streak_days);
    }
    if (updates.last_submit_date !== undefined) {
      sets.push("last_submit_date = ?");
      values.push(updates.last_submit_date);
    }

    if (sets.length > 0) {
      sets.push("updated_at = datetime('now')");
      values.push(user.id);
      await context.env.DB.prepare(
        `UPDATE users SET ${sets.join(", ")} WHERE id = ?`,
      )
        .bind(...values)
        .run();
    }

    const updated = await context.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?",
    )
      .bind(user.id)
      .first();
    return jsonResponse({
      user: { ...(updated as any), password_hash: undefined },
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "업데이트 실패", 500);
  }
};
