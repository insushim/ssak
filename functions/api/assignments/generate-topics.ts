import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const GRADE_NAMES: Record<string, string> = {
  elementary_1_2: "초등학교 1-2학년",
  elementary_3_4: "초등학교 3-4학년",
  elementary_5_6: "초등학교 5-6학년",
  middle: "중학생",
  high: "고등학생",
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 주제를 생성할 수 있습니다.", 403);
    }

    const data = (await context.request.json()) as any;
    const { gradeLevel, count = 5, category } = data;

    if (!gradeLevel) {
      return errorResponse("학년 정보가 필요합니다.");
    }

    const gradeName = GRADE_NAMES[gradeLevel] || gradeLevel;
    const categoryText = category ? `카테고리: ${category}` : "다양한 카테고리";

    const prompt = `${gradeName} 학생들을 위한 글쓰기 주제를 ${count}개 생성해주세요.
${categoryText}

각 주제는 학생들이 흥미를 가질 수 있고, 창의적인 글을 쓸 수 있는 것이어야 합니다.

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "topics": [
    {
      "title": "주제 제목",
      "description": "주제에 대한 간단한 설명 (1-2문장)",
      "category": "카테고리명"
    }
  ]
}`;

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${context.env.GEMINI_API_KEY}`;
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `당신은 초등학생 글쓰기 주제를 만드는 전문가입니다. 반드시 요청된 JSON 형식으로만 응답하세요. 학년에 맞는 흥미롭고 창의적인 주제를 제안하세요. 한국어로 답변하세요.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return errorResponse("주제 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", 500);
    }

    const result = (await response.json()) as any;
    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return errorResponse("주제 생성 결과를 파싱할 수 없습니다.", 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return jsonResponse(parsed);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED")
      return errorResponse("인증이 필요합니다.", 401);
    console.error("주제 생성 에러:", e);
    return errorResponse("주제 생성 실패", 500);
  }
};
