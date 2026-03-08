import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    await requireAuth(context.request, context.env.DB);
    const url = new URL(context.request.url);
    const classCode = url.searchParams.get("class_code");
    if (!classCode) return errorResponse("학급 코드가 필요합니다.");

    const { results } = await context.env.DB.prepare(
      `SELECT a.*,
        (SELECT COUNT(*) FROM writings w WHERE w.assignment_id = a.id AND w.is_draft = 0) as submission_count
       FROM assignments a WHERE a.class_code = ? ORDER BY a.created_at DESC`,
    )
      .bind(classCode)
      .all();

    return jsonResponse({ assignments: results || [] });
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
      return errorResponse("교사만 과제를 생성할 수 있습니다.", 403);
    }

    const data = (await context.request.json()) as any;
    if (!data.title || !data.class_code) {
      return errorResponse("과제 제목과 학급을 선택해주세요.");
    }

    const id = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO assignments (id, class_code, teacher_id, title, description, due_date,
       grade_level, writing_type, topic, min_word_count, ideal_word_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        data.class_code,
        user.id,
        data.title,
        data.description || "",
        data.due_date || "",
        data.grade_level || "",
        data.writing_type || "",
        data.topic || "",
        data.min_word_count || 0,
        data.ideal_word_count || 0,
      )
      .run();

    const assignment = await context.env.DB.prepare(
      "SELECT * FROM assignments WHERE id = ?",
    )
      .bind(id)
      .first();
    return jsonResponse({ assignment });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "과제 생성 실패", 500);
  }
};
