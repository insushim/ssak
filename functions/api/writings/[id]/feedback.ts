import { Env, jsonResponse, errorResponse, requireAuth } from "../../_helpers";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 피드백을 줄 수 있습니다.", 403);
    }

    const writingId = context.params.id as string;
    const { type, message } = (await context.request.json()) as any;

    const feedbackMessages: Record<string, string> = {
      good: "잘했어요! 👍",
      content: "내용을 좀 더 보충해보세요 📝",
      spelling: "맞춤법에 주의해주세요 🔤",
      structure: "글의 구성을 다듬어보세요 📐",
      expression: "다양한 표현을 써보세요 ✨",
    };

    const feedbackMsg =
      type === "custom" ? message || "" : feedbackMessages[type] || "";

    await context.env.DB.prepare(
      `UPDATE writings SET teacher_feedback = ?, teacher_feedback_at = datetime('now') WHERE id = ?`,
    )
      .bind(feedbackMsg, writingId)
      .run();

    await context.env.DB.prepare(
      "INSERT INTO teacher_feedbacks (writing_id, teacher_id, feedback_type, custom_message) VALUES (?, ?, ?, ?)",
    )
      .bind(writingId, user.id, type, message || "")
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message || "피드백 저장 실패", 500);
  }
};
