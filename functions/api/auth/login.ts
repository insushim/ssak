import { Env, jsonResponse, errorResponse, verifyPassword } from "../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password } = (await context.request.json()) as any;

    if (!email || !password) {
      return errorResponse("이메일과 비밀번호를 입력해주세요.");
    }

    const user = (await context.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?",
    )
      .bind(email)
      .first()) as any;
    if (!user) {
      return errorResponse("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return errorResponse("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    if (user.role === "teacher" && !user.approved) {
      return errorResponse(
        "교사 계정 승인 대기 중입니다. 관리자 승인 후 로그인할 수 있습니다.",
      );
    }

    // Clean old sessions
    await context.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?")
      .bind(user.id)
      .run();

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    )
      .bind(sessionId, user.id, expiresAt)
      .run();

    return new Response(
      JSON.stringify({ user: { ...user, password_hash: undefined } }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
        },
      },
    );
  } catch (e: any) {
    return errorResponse(e.message || "로그인 실패", 500);
  }
};
