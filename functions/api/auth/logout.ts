import { Env, getSession } from "../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const session = await getSession(context.request, context.env.DB);
  if (session) {
    await context.env.DB.prepare("DELETE FROM sessions WHERE id = ?")
      .bind(session.id)
      .run();
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "session=; Path=/; HttpOnly; Max-Age=0",
    },
  });
};
