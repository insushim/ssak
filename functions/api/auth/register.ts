import { Env, jsonResponse, errorResponse, hashPassword } from "../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password, name, role, classCode, gradeLevel } =
      (await context.request.json()) as any;

    if (!email || !password || !name || !role) {
      return errorResponse("필수 항목을 모두 입력해주세요.");
    }

    if (password.length < 6) {
      return errorResponse("비밀번호는 6자 이상이어야 합니다.");
    }

    if (!["student", "teacher"].includes(role)) {
      return errorResponse("올바른 역할을 선택해주세요.");
    }

    // Check duplicate email
    const existing = await context.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?",
    )
      .bind(email)
      .first();
    if (existing) {
      return errorResponse("이미 사용 중인 이메일입니다.");
    }

    // For students, verify class code
    if (role === "student" && classCode) {
      const classInfo = await context.env.DB.prepare(
        "SELECT code FROM classes WHERE code = ?",
      )
        .bind(classCode)
        .first();
      if (!classInfo) {
        return errorResponse("존재하지 않는 학급 코드입니다.");
      }
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await context.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, class_code, grade_level, approved, privacy_agreed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    )
      .bind(
        id,
        email,
        passwordHash,
        name,
        role,
        classCode || "",
        gradeLevel || "",
        role === "student" ? 1 : 0, // teachers need approval
      )
      .run();

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    )
      .bind(sessionId, id, expiresAt)
      .run();

    const user = await context.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?",
    )
      .bind(id)
      .first();

    return new Response(
      JSON.stringify({ user: { ...(user as any), password_hash: undefined } }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
        },
      },
    );
  } catch (e: any) {
    return errorResponse(e.message || "회원가입 실패", 500);
  }
};
