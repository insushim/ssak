import { Env, jsonResponse, errorResponse, requireAuth } from "../_helpers";

// 스케줄러 설정 저장/조회/실행 API
// 선생님이 자동 출제 규칙을 설정하면, 프론트에서 주기적으로 체크

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const WRITING_TYPES = [
  "주장하는 글", "설명하는 글", "묘사하는 글", "서사/이야기",
  "편지", "일기", "감상문", "상상글",
];
const CATEGORIES = [
  "가족", "학교", "친구", "환경", "동물", "꿈/미래", "여행", "취미", "계절/날씨", "음식",
];

const GRADE_NAMES: Record<string, string> = {
  elementary_1_2: "초등학교 1-2학년",
  elementary_3_4: "초등학교 3-4학년",
  elementary_5_6: "초등학교 5-6학년",
  middle: "중학생",
  high: "고등학생",
};

// GET: 스케줄러 설정 조회
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 접근 가능합니다.", 403);
    }

    const url = new URL(context.request.url);
    const classCode = url.searchParams.get("class_code");
    if (!classCode) return errorResponse("학급 코드가 필요합니다.");

    const schedule = await context.env.DB.prepare(
      "SELECT * FROM auto_schedules WHERE class_code = ?",
    ).bind(classCode).first();

    return jsonResponse({ schedule: schedule || null });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

// POST: 스케줄러 설정 저장 또는 자동 출제 실행
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await requireAuth(context.request, context.env.DB);
    if (user.role !== "teacher" && user.role !== "super_admin") {
      return errorResponse("교사만 접근 가능합니다.", 403);
    }

    const data = (await context.request.json()) as any;

    // action: "save" | "run"
    if (data.action === "run") {
      return await runAutoAssignment(context.env.DB, data.class_code, user.id, context.env.GEMINI_API_KEY);
    }

    // 스케줄러 설정 저장
    const { class_code, enabled, selected_days, grade_level } = data;
    if (!class_code) return errorResponse("학급 코드가 필요합니다.");

    const existing = await context.env.DB.prepare(
      "SELECT id FROM auto_schedules WHERE class_code = ?",
    ).bind(class_code).first();

    if (existing) {
      await context.env.DB.prepare(
        "UPDATE auto_schedules SET enabled = ?, selected_days = ?, grade_level = ?, updated_at = datetime('now') WHERE class_code = ?",
      ).bind(enabled ? 1 : 0, JSON.stringify(selected_days || [1,2,3,4,5]), grade_level || "", class_code).run();
    } else {
      await context.env.DB.prepare(
        "INSERT INTO auto_schedules (id, class_code, teacher_id, enabled, selected_days, grade_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      ).bind(crypto.randomUUID(), class_code, user.id, enabled ? 1 : 0, JSON.stringify(selected_days || [1,2,3,4,5]), grade_level || "").run();
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return errorResponse("인증이 필요합니다.", 401);
    return errorResponse(e.message, 500);
  }
};

async function runAutoAssignment(db: D1Database, classCode: string, teacherId: string, apiKey: string) {
  const randomType = WRITING_TYPES[Math.floor(Math.random() * WRITING_TYPES.length)];
  const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  // 학급의 학년 정보
  const cls = await db.prepare("SELECT grade_level FROM classes WHERE code = ?").bind(classCode).first() as any;
  const gradeName = GRADE_NAMES[cls?.grade_level || "elementary_3_4"] || "초등학교 3-4학년";

  const prompt = `${gradeName} 학생을 위한 글쓰기 주제 1개를 생성해주세요.
글쓰기 유형: ${randomType}, 분야: ${randomCategory}

JSON 형식으로만 응답:
{"title": "주제 제목", "description": "간단한 설명"}`;

  try {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `한국어로 답변하세요. JSON만 응답.\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 512 },
      }),
    });

    if (!response.ok) throw new Error("Gemini API error");

    const result = (await response.json()) as any;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("파싱 실패");

    const topic = JSON.parse(jsonMatch[0]);

    // 과제 생성
    const id = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO assignments (id, class_code, teacher_id, title, description, writing_type, topic, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    ).bind(id, classCode, teacherId, topic.title, topic.description || "", randomType, topic.title).run();

    return jsonResponse({ success: true, assignment: { id, title: topic.title, description: topic.description } });
  } catch (e: any) {
    return errorResponse("자동 출제 실패: " + e.message, 500);
  }
}
