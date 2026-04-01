import { Env, jsonResponse, errorResponse, requireAuth, hashPassword } from "../../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 학생을 생성할 수 있습니다.", 403);
    }

    const classCode = context.params.code as string;
    const cls = await context.env.DB.prepare(
      "SELECT code, grade_level FROM classes WHERE code = ?",
    ).bind(classCode).first();
    if (!cls) return errorResponse("존재하지 않는 학급입니다.", 404);

    const { prefix, count } = (await context.request.json()) as any;
    if (!prefix || !count) return errorResponse("접두어와 인원수를 입력해주세요.");
    if (count < 1 || count > 50) return errorResponse("1~50명 사이로 입력해주세요.");

    const created: { loginId: string; password: string }[] = [];
    const skipped: string[] = [];

    for (let i = 1; i <= count; i++) {
      const num = String(i).padStart(2, "0");
      const loginId = `${prefix}${num}`;

      const existing = await context.env.DB.prepare(
        "SELECT id FROM users WHERE email = ?",
      ).bind(loginId).first();

      if (existing) {
        skipped.push(loginId);
        continue;
      }

      const id = crypto.randomUUID();
      const passwordHash = await hashPassword(loginId);

      await context.env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, name, role, class_code, grade_level, approved, privacy_agreed)
         VALUES (?, ?, ?, ?, 'student', ?, ?, 1, 1)`,
      ).bind(
        id, loginId, passwordHash, loginId, classCode, (cls as any).grade_level || "",
      ).run();

      created.push({ loginId, password: loginId });
    }

    return jsonResponse({ created, skipped, total: created.length });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "학생 일괄 생성 실패", 500);
  }
};
