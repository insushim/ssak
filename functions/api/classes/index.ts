import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    const url = new URL(context.request.url);
    const teacherId = url.searchParams.get("teacher_id") || user.id;

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM classes WHERE teacher_id = ? ORDER BY created_at DESC",
    )
      .bind(teacherId)
      .all();

    // Get student counts
    const classes = await Promise.all(
      (results || []).map(async (c: any) => {
        const count = (await context.env.DB.prepare(
          "SELECT COUNT(*) as cnt FROM users WHERE class_code = ? AND role = ?",
        )
          .bind(c.code, "student")
          .first()) as any;
        return { ...c, student_count: count?.cnt || 0 };
      }),
    );

    return jsonResponse({ classes });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 학급을 생성할 수 있습니다.", 403);
    }

    const { name, school_name } = (await context.request.json()) as any;
    if (!name) return errorResponse("학급 이름을 입력해주세요.");

    // Generate unique class code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    let attempts = 0;
    do {
      code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      const existing = await context.env.DB.prepare(
        "SELECT code FROM classes WHERE code = ?",
      )
        .bind(code)
        .first();
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    await context.env.DB.prepare(
      "INSERT INTO classes (code, name, school_name, teacher_id, teacher_name) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(code, name, school_name || "", user.id, user.name)
      .run();

    const classInfo = await context.env.DB.prepare(
      "SELECT * FROM classes WHERE code = ?",
    )
      .bind(code)
      .first();
    return jsonResponse({ classInfo });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "학급 생성 실패", 500);
  }
};
