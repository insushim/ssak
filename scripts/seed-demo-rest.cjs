/**
 * 🌱 싹 AI 글쓰기 플랫폼 - 데모 시드 데이터 (REST API 버전)
 *
 * firebase-admin / serviceAccountKey 불필요!
 * .env.local의 Firebase Web API Key만 사용합니다.
 *
 * 사용법: node scripts/seed-demo-rest.cjs
 */
const fs = require("fs");
const path = require("path");

// ──────────────────────────────────────────
// 🔧 Firebase 설정 읽기 (빌드 출력물 → .env.local 순서)
// ──────────────────────────────────────────
function loadFirebaseConfig() {
  // 1차: 빌드된 JS에서 추출
  const distDir = path.join(__dirname, "..", "dist", "assets");
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir).filter(f => f.endsWith(".js"));
    for (const f of files) {
      const content = fs.readFileSync(path.join(distDir, f), "utf-8");
      const match = content.match(/apiKey:"([^"]+)",authDomain:"([^"]+)",projectId:"([^"]+)"/);
      if (match) return { apiKey: match[1], projectId: match[3] };
    }
  }
  // 2차: .env.local에서 읽기
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    const env = {};
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
    if (env.VITE_FIREBASE_API_KEY) return { apiKey: env.VITE_FIREBASE_API_KEY, projectId: env.VITE_FIREBASE_PROJECT_ID || "isw-writing" };
  }
  return null;
}

const config = loadFirebaseConfig();
if (!config) {
  console.error("❌ Firebase 설정을 찾을 수 없습니다. 먼저 npm run build를 실행하세요.");
  process.exit(1);
}
const API_KEY = config.apiKey;
const PROJECT_ID = config.projectId;

console.log("🔑 Firebase Project:", PROJECT_ID);

// ──────────────────────────────────────────
// 🌐 Firebase REST API helpers
// ──────────────────────────────────────────
const AUTH_URL = "https://identitytoolkit.googleapis.com/v1";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function authSignUp(email, password, displayName) {
  const res = await fetch(`${AUTH_URL}/accounts:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) {
    if (data.error.message === "EMAIL_EXISTS") {
      // 이미 존재하면 로그인
      return authSignIn(email, password);
    }
    throw new Error(`Auth 오류: ${data.error.message}`);
  }
  return { uid: data.localId, idToken: data.idToken, isNew: true };
}

async function authSignIn(email, password) {
  const res = await fetch(`${AUTH_URL}/accounts:signInWithPassword?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`로그인 오류 (${email}): ${data.error.message}`);
  return { uid: data.localId, idToken: data.idToken, isNew: false };
}

// Firestore value converters
function toFsValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFsValue) } };
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFsValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFsFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFsValue(v);
  }
  return fields;
}

async function fsSet(collection, docId, data, idToken) {
  const url = `${FIRESTORE_URL}/${collection}/${docId}`;
  const res = await fetch(url + "?currentDocument.exists=true", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: toFsFields(data) }),
  });
  if (!res.ok) {
    // doc doesn't exist yet, create it
    const res2 = await fetch(`${FIRESTORE_URL}/${collection}?documentId=${docId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields: toFsFields(data) }),
    });
    if (!res2.ok) {
      const err = await res2.json();
      throw new Error(`Firestore 쓰기 실패 (${collection}/${docId}): ${JSON.stringify(err.error?.message || err)}`);
    }
    return res2.json();
  }
  return res.json();
}

async function fsPatch(collection, docId, data, idToken) {
  const fieldPaths = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join("&");
  const url = `${FIRESTORE_URL}/${collection}/${docId}?${fieldPaths}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: toFsFields(data) }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Firestore patch 실패 (${collection}/${docId}): ${JSON.stringify(err.error?.message || err)}`);
  }
  return res.json();
}

async function fsAdd(collection, data, idToken) {
  const res = await fetch(`${FIRESTORE_URL}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields: toFsFields(data) }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Firestore 추가 실패 (${collection}): ${JSON.stringify(err.error?.message || err)}`);
  }
  const result = await res.json();
  // Extract doc ID from name: "projects/.../documents/collection/DOC_ID"
  const docId = result.name.split("/").pop();
  return { id: docId };
}

// Firestore query + batch delete: delete all docs matching a field value
async function fsDeleteWhere(collection, field, value, idToken) {
  // Query using structuredQuery
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const res = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: value } }
        },
        limit: 500,
      }
    }),
  });
  const results = await res.json();
  let count = 0;
  if (Array.isArray(results)) {
    for (const r of results) {
      if (r.document && r.document.name) {
        const docName = r.document.name;
        const delRes = await fetch(`https://firestore.googleapis.com/v1/${docName}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (delRes.ok) count++;
      }
    }
  }
  return count;
}

// ──────────────────────────────────────────
// 👤 데모 사용자 정의
// ──────────────────────────────────────────
const CLASS_CODE = "DEMO2026";
const GRADE_LEVEL = "elementary-3";

const TEACHER = {
  email: "demo-teacher@ssak.kr",
  password: "demo1234!",
  name: "김싹쌤",
  role: "teacher",
};

const STUDENTS = [
  {
    email: "demo-student1@ssak.kr", password: "demo1234!", name: "이하늘", role: "student",
    points: 2800, totalPoints: 4500, writingCount: 32, avgScore: 88,
    currentStreak: 12, longestStreak: 21,
    ownedItems: ["face1","face4","face6","face10","face11","hair1","hair2","hair3","hair5","hair9","hc1","hc2","hc3","hc5","cloth1","cloth2","cloth3","cloth5","acc1","acc2","acc3","acc5","expr1","expr2","expr3","eff1","bg1","bg2","bg3","frame1","frame2","furn1","furn2","furn3","elec1","elec2","wall1","wall2"],
    equippedItems: { face:"face6", hair:"hair5", hairColor:"hc3", clothes:"cloth5", accessory:"acc5", expression:"expr2", effect:"eff1", background:"bg3", frame:"frame2" },
    achievements: ["first_submit","submit_3","submit_5","submit_10","submit_20","submit_30","score_60","score_70","score_80","score_85","score_90","score_95","avg_70","avg_80","streak_2","streak_3","streak_5","streak_7","streak_14","streak_21","words_100","words_300","words_500","words_700","words_1000","total_words_10000","points_100","points_300","points_500","points_1000","points_2000","points_3000","early_bird","afternoon_writer","evening_writer","type_diary","type_letter","type_story","rewrite_first","rewrite_5","rank_top10","rank_top5","rank_top3","rank_1st","first_day"],
  },
  {
    email: "demo-student2@ssak.kr", password: "demo1234!", name: "박서준", role: "student",
    points: 1200, totalPoints: 1800, writingCount: 15, avgScore: 82,
    currentStreak: 5, longestStreak: 14,
    ownedItems: ["face1","face2","face10","hair1","hair2","hair6","hc1","hc2","cloth1","cloth2","cloth3","acc1","acc2","expr1","bg1","bg2","frame1","furn1","furn2","elec1","wall1"],
    equippedItems: { face:"face2", hair:"hair6", hairColor:"hc2", clothes:"cloth3", accessory:"acc2", expression:"expr1", effect:null, background:"bg2", frame:"frame1" },
    achievements: ["first_submit","submit_3","submit_5","submit_10","score_60","score_70","score_80","score_85","avg_70","avg_80","streak_2","streak_3","streak_5","streak_7","streak_14","words_100","words_300","words_500","words_700","total_words_10000","points_100","points_300","points_500","points_1000","afternoon_writer","evening_writer","type_diary","rank_top10","first_day"],
  },
  {
    email: "demo-student3@ssak.kr", password: "demo1234!", name: "최은비", role: "student",
    points: 450, totalPoints: 800, writingCount: 8, avgScore: 75,
    currentStreak: 2, longestStreak: 7,
    ownedItems: ["face1","face4","hair1","hair3","hc1","cloth1","cloth2","acc1","expr1","bg1","frame1","furn1","elec1","wall1"],
    equippedItems: { face:"face4", hair:"hair3", hairColor:"hc1", clothes:"cloth2", accessory:"acc1", expression:null, effect:null, background:"bg1", frame:"frame1" },
    achievements: ["first_submit","submit_3","submit_5","score_60","score_70","score_80","avg_70","streak_2","streak_3","streak_5","streak_7","words_100","words_300","words_500","points_100","points_300","points_500","afternoon_writer","first_day"],
  },
  {
    email: "demo-student4@ssak.kr", password: "demo1234!", name: "정민수", role: "student",
    points: 150, totalPoints: 200, writingCount: 3, avgScore: 70,
    currentStreak: 1, longestStreak: 3,
    ownedItems: ["face1","hair1","hc1","cloth1","acc1","expr1","bg1","frame1","furn1","elec1","wall1"],
    equippedItems: { face:"face1", hair:"hair1", hairColor:"hc1", clothes:"cloth1", accessory:"acc1", expression:null, effect:null, background:"bg1", frame:"frame1" },
    achievements: ["first_submit","submit_3","score_60","score_70","streak_2","streak_3","words_100","words_300","points_100","first_day"],
  },
  {
    email: "demo-student5@ssak.kr", password: "demo1234!", name: "김도현", role: "student",
    points: 50, totalPoints: 1200, writingCount: 10, avgScore: 78,
    currentStreak: 3, longestStreak: 10,
    ownedItems: ["face1","face2","face3","face7","face10","face11","face12","face14","face15","hair1","hair2","hair3","hair4","hair5","hair6","hair7","hc1","hc2","hc3","hc4","cloth1","cloth2","cloth3","cloth4","acc1","acc2","acc3","acc4","expr1","expr2","bg1","bg2","bg3","frame1","frame2","furn1","furn2","furn3","furn4","elec1","elec2","wall1","wall2","wall3"],
    equippedItems: { face:"face12", hair:"hair1", hairColor:"hc1", clothes:"cloth4", accessory:"acc4", expression:"expr2", effect:null, background:"bg3", frame:"frame2" },
    achievements: ["first_submit","submit_3","submit_5","submit_10","score_60","score_70","score_80","avg_70","streak_2","streak_3","streak_5","streak_7","streak_10","words_100","words_300","words_500","points_100","points_300","points_500","points_1000","morning_writer","afternoon_writer","type_diary","type_story","rewrite_first","first_day"],
  },
];

// ──────────────────────────────────────────
// 📝 글쓰기 샘플 데이터
// ──────────────────────────────────────────
const WRITING_SAMPLES = [
  { writingType:"일기", topic:"오늘 하루", title:"신나는 체육 시간", content:"오늘 체육 시간에 피구를 했다. 우리 팀은 파란 팀이었다. 처음에는 공이 무서워서 뒤에 숨어 있었는데, 서준이가 \"하늘아, 같이 앞에 가자!\"라고 했다. 용기를 내서 앞에 나갔더니 공을 잡았다! 선생님이 \"이하늘, 잘했어!\"라고 칭찬해 주셨다. 공을 던져서 상대편 한 명도 맞혔다. 우리 팀이 이겨서 정말 기뻤다. 다음에도 체육 시간이 빨리 왔으면 좋겠다." },
  { writingType:"일기", topic:"가족과 함께", title:"할머니 댁에 간 날", content:"주말에 할머니 댁에 갔다. 할머니는 내가 좋아하는 잡채를 만들어 주셨다. 할머니가 만든 잡채는 세상에서 제일 맛있다. 먹고 나서 할머니랑 같이 텃밭에 가서 고추를 땄다. 빨간 고추가 예뻤다. 할아버지는 수박을 잘라 주셨는데 정말 달았다. 돌아올 때 할머니가 눈물을 글썽이셨다. 나도 코끝이 찡했다. 할머니, 다음에 또 갈게요!" },
  { writingType:"일기", topic:"학교 생활", title:"짝꿍이 바뀐 날", content:"오늘 자리를 바꿨다. 새 짝꿍은 은비다. 은비는 조용하지만 웃을 때 보조개가 생긴다. 처음에는 어색해서 말을 못 했는데 은비가 먼저 \"연필 빌려줄까?\"라고 말해줬다. 그래서 나도 용기를 내서 \"고마워, 은비야\"라고 했다. 점심시간에 같이 밥 먹으면서 좋아하는 만화 이야기를 했는데 은비도 짱구를 좋아한다고 했다. 새 짝꿍이랑 빨리 친해지고 싶다." },
  { writingType:"편지", topic:"감사한 분에게", title:"선생님께 드리는 편지", content:"사랑하는 선생님께\n\n선생님, 안녕하세요? 저는 3학년 1반 이하늘입니다.\n\n선생님이 매일 재미있는 수업을 해 주셔서 학교 오는 게 즐거워요. 특히 과학 시간에 화산 실험을 한 게 정말 신기했어요.\n\n그리고 제가 수학을 어려워할 때 포기하지 말라고 응원해 주셔서 감사해요. 덕분에 지난 시험에서 90점을 받았어요.\n\n선생님, 항상 건강하세요. 사랑해요!\n\n제자 이하늘 올림" },
  { writingType:"독후감", topic:"책 읽기", title:"어린 왕자를 읽고", content:"나는 '어린 왕자'라는 책을 읽었다. 이 책은 사막에 불시착한 비행사가 어린 왕자를 만나는 이야기다.\n\n가장 기억에 남는 장면은 여우가 어린 왕자에게 \"길들인다는 것은 관계를 맺는 거야\"라고 말하는 부분이다. 처음에는 무슨 뜻인지 잘 몰랐는데, 곰곰이 생각해 보니 친구를 사귀는 것과 비슷한 것 같다.\n\n내 짝꿍 은비도 처음에는 낯설었지만 매일 이야기하면서 소중한 친구가 되었다. 이 책을 친구들에게 추천하고 싶다." },
  { writingType:"설명문", topic:"동물", title:"우리 반 햄스터 뭉치", content:"우리 반에는 '뭉치'라는 햄스터가 있다. 뭉치는 골든 햄스터로, 몸 색깔이 갈색과 흰색이 섞여 있다.\n\n햄스터는 야행성 동물이라서 낮에는 주로 자고, 저녁에 활발하게 움직인다. 뭉치도 수업 시간에는 톱밥 속에서 자고 있지만, 방과 후에 가면 쳇바퀴를 열심히 돌린다.\n\n햄스터를 키울 때 가장 중요한 것은 물을 매일 갈아주는 것이다. 뭉치는 우리 반 친구들 모두의 인기 스타다." },
  { writingType:"논설문", topic:"학교 생활", title:"학교에서 핸드폰을 써도 될까?", content:"나는 학교에서 핸드폰 사용을 제한해야 한다고 생각한다.\n\n첫째, 수업 시간에 집중할 수 없기 때문이다. 핸드폰을 보면 게임이나 영상이 생각나서 선생님 말씀에 집중하기 어렵다.\n\n둘째, 쉬는 시간에 친구들과 놀지 않게 된다. 다 같이 핸드폰만 보고 있으면 대화도 없고 재미없다.\n\n그러므로 수업 시간에는 핸드폰을 선생님께 맡기고, 쉬는 시간에는 친구들과 함께 노는 것이 좋겠다." },
  { writingType:"시", topic:"자연", title:"봄비", content:"봄비가 내려요\n조용히 사르르 내려요\n\n꽃잎에 떨어진 빗방울이\n동그란 보석처럼 빛나요\n\n개나리가 활짝 웃으며\n\"고마워, 목이 말랐어!\" 하고\n\n봄비야, 봄비야\n더 많이 내려줘\n우리 학교 화단에도\n예쁜 꽃이 피게" },
  { writingType:"상상글", topic:"미래", title:"내가 과학자가 된다면", content:"만약 내가 과학자가 된다면 무엇을 만들까 상상해 보았다.\n\n첫 번째로, 숙제를 도와주되 답을 알려주지 않고 힌트만 주는 로봇을 만들고 싶다.\n\n두 번째로, 바다에 떠다니는 쓰레기를 빨아들이는 거대한 청소기 같은 것이다.\n\n세 번째로, 아픈 사람을 낫게 하는 약을 만들고 싶다. 할머니가 무릎이 아프신데, 한 알만 먹으면 씩씩하게 걸을 수 있는 약이 있으면 좋겠다.\n\n과학자가 되려면 공부를 열심히 해야겠다!" },
  { writingType:"기행문", topic:"여행", title:"제주도 가족 여행", content:"겨울 방학에 가족과 함께 제주도에 다녀왔다. 비행기를 처음 탔는데 구름 위를 날아가는 게 정말 신기했다.\n\n첫째 날은 성산일출봉에 갔다. 정상까지 올라가는 게 힘들었지만 위에서 본 바다가 너무 예뻤다.\n\n둘째 날은 한라산 1100고지에서 눈을 봤다. 아빠랑 눈싸움을 했다.\n\n제주도는 정말 아름다운 곳이다. 커서 또 가고 싶다." },
  { writingType:"묘사", topic:"계절", title:"가을 운동장", content:"가을이 되자 우리 학교 운동장이 변했다.\n\n운동장 옆 은행나무가 노랗게 물들었다. 바람이 불면 은행잎이 나비처럼 하나둘 떨어진다.\n\n하늘은 높고 파랗다. 공기가 시원해서 숨을 깊이 들이쉬면 기분이 상쾌하다.\n\n쉬는 시간에 운동장에서 뛰어놀면 땀이 잘 안 나서 좋다.\n\n가을 운동장에서 친구들과 함께 뛰어노는 이 시간이 참 좋다." },
  { writingType:"보고서", topic:"관찰", title:"강낭콩 키우기 관찰 보고서", content:"관찰 주제: 강낭콩이 싹 트는 과정\n관찰 기간: 3월 4일 ~ 3월 18일 (2주)\n\n3월 4일: 종이컵에 흙을 넣고 강낭콩 2알을 심었다.\n3월 9일: 흙이 갈라지면서 작은 초록색 싹이 올라왔다!\n3월 12일: 싹이 5cm로 자랐다. 작은 잎 두 장이 펼쳐졌다.\n3월 18일: 줄기가 15cm까지 자랐고, 잎이 여섯 장이다.\n\n결론: 강낭콩은 심은 지 5일 만에 싹이 트고, 2주 만에 15cm까지 자란다." },
  { writingType:"일기", topic:"오늘 하루", title:"비 오는 날", content:"오늘은 아침부터 비가 왔다. 우산을 가져가지 않아서 엄마가 학교까지 데려다주셨다.\n\n쉬는 시간에 밖에 나가지 못해서 교실에서 친구들이랑 보드게임을 했다. 민수가 루미큐브를 가져왔는데 내가 이겼다!\n\n하교할 때는 비가 그쳐서 걸어서 왔다. 집에 오니까 엄마가 따뜻한 호떡을 만들어 주셨다. 비 오는 날은 호떡이 최고다!" },
  { writingType:"일기", topic:"특별한 하루", title:"내 생일 파티", content:"오늘은 내 생일이다. 엄마가 아침부터 딸기 케이크를 만들어 주셨다. 학교에서 친구들이 생일 축하 노래를 불러줬는데 얼굴이 빨개졌다.\n\n민수가 편지를 써 줬는데 \"하늘아, 항상 건강해. 우리 영원히 친구하자.\"라고 적혀 있었다. 감동받아서 눈물이 날 뻔했다.\n\n집에 와서 가족이랑 케이크 촛불을 끄고 소원을 빌었다. 소원은 비밀이다!" },
  { writingType:"편지", topic:"친구에게", title:"전학 간 친구에게", content:"서연아, 잘 지내고 있어? 나 하늘이야.\n\n네가 전학 간 지 벌써 한 달이 됐어. 아직도 교실에서 네 자리를 보면 좀 슬퍼.\n\n새 학교는 어때? 친구들은 잘 사귀었어? 우리 반에서는 어제 현장학습으로 과학관에 갔는데 네가 있었으면 더 재미있었을 텐데...\n\n방학 때 꼭 만나자! 보고 싶은 하늘이가" },
  { writingType:"독후감", topic:"책 읽기", title:"마당을 나온 암탉", content:"'마당을 나온 암탉' 잎싹이 이야기를 읽었다. 잎싹이는 양계장을 나와 자유롭게 살고 싶어하는 암탉이다.\n\n가장 감동적인 부분은 잎싹이가 아기 오리를 품어서 키우는 장면이었다. 자기 아기가 아닌데도 사랑으로 키워주는 모습이 우리 엄마 같았다.\n\n이 책을 읽고 나서 엄마한테 \"사랑해요\"라고 말했다." },
  { writingType:"설명문", topic:"과학", title:"무지개는 왜 생길까?", content:"비가 온 뒤에 하늘에 무지개가 뜰 때가 있다. 무지개는 왜 생기는 걸까?\n\n무지개는 빛과 물방울이 만나서 생긴다. 햇빛은 사실 여러 가지 색이 섞여 있는데, 물방울을 통과하면서 색깔이 나누어진다.\n\n무지개의 색은 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라 이렇게 일곱 가지다.\n\n재미있는 사실은, 무지개는 실제로 원 모양이라는 것이다. 비행기에서 보면 동그란 무지개를 볼 수도 있다고 한다." },
  { writingType:"논설문", topic:"환경", title:"급식을 남기지 말자", content:"나는 급식을 남기지 말아야 한다고 생각한다.\n\n첫째, 음식을 남기면 쓰레기가 많아져서 환경이 나빠진다.\n\n둘째, 음식을 만들어 주시는 급식 아주머니들의 노력을 생각해야 한다.\n\n물론 정말 싫어하는 음식이 있을 수 있다. 하지만 한 입만이라도 먹어보면 맛있는 것도 있다.\n\n우리 모두 급식을 남기지 않도록 노력하자." },
  { writingType:"상상글", topic:"모험", title:"구름 위의 나라", content:"어느 날 아침에 일어났더니 내 방 창문 밖에 커다란 구름 사다리가 놓여 있었다. 호기심에 올라가 보니 구름 위에 나라가 있었다!\n\n구름 나라 사람들은 모두 날개가 달려 있었다. 가장 신기한 건 여기서는 걱정을 하면 회색 구름이 되고, 웃으면 무지개가 뜬다는 것이었다.\n\n나는 구름 나라 친구 '뭉게'를 만났다. 뭉게는 나에게 임시 날개를 빌려줬다. 하늘을 나는 것은 정말 자유로웠다.\n\n해가 지자 뭉게가 \"내일 또 와!\"라고 했다. 꿈이었을까?" },
  { writingType:"일기", topic:"학교 생활", title:"발표를 잘한 날", content:"오늘 국어 시간에 발표를 했다. 주제는 \"나의 꿈\"이었다.\n\n앞에 나가니까 다리가 후들후들 떨렸다. 그런데 선생님이 웃으면서 고개를 끄덕여 주셔서 용기가 났다.\n\n\"저의 꿈은 수의사입니다. 아픈 동물들을 치료해 주고 싶습니다.\" 이렇게 말했더니 친구들이 박수를 쳐줬다.\n\n처음으로 발표가 재미있다고 느꼈다. 다음에도 손 들고 발표해야겠다." },
  { writingType:"묘사", topic:"음식", title:"우리 집 된장찌개", content:"우리 집 된장찌개는 세상에서 제일 맛있다.\n\n엄마가 된장찌개를 끓이기 시작하면 집 안이 구수한 냄새로 가득 찬다. 보글보글 끓는 소리가 들리면 배가 꼬르륵 소리를 낸다.\n\n한 숟가락 떠서 불면서 먹으면, 짜지도 싱겁지도 않은 딱 좋은 맛이다. 밥이랑 같이 먹으면 밥 한 그릇이 금방 없어진다.\n\n나도 커서 이 맛을 똑같이 내고 싶다." },
  { writingType:"독후감", topic:"책 읽기", title:"아낌없이 주는 나무", content:"'아낌없이 주는 나무'라는 그림책을 읽었다. 나무가 소년에게 계속 뭔가를 주는 이야기이다.\n\n처음에는 소년이 나쁜 사람이라고 생각했다. 받기만 하고 고맙다는 말도 안 하니까. 하지만 다시 읽어보니 나도 부모님한테 그런 것 같아서 부끄러웠다.\n\n오늘부터 \"감사합니다\"를 더 자주 말해야겠다." },
  { writingType:"일기", topic:"오늘 하루", title:"축구를 한 날", content:"오늘 점심시간에 운동장에서 축구를 했다. 서준이, 민수, 도현이랑 같이 팀이 됐다.\n\n후반전에 내가 공을 빼앗아서 서준이에게 패스했는데, 서준이가 다시 나한테 패스해줬다. 나는 있는 힘껏 찼는데... 골대 왼쪽으로 들어갔다! 내 인생 첫 골이었다!\n\n2-1로 이겼다. 너무 행복하다!" },
  { writingType:"설명문", topic:"생활", title:"분리수거하는 방법", content:"분리수거는 쓰레기를 종류별로 나누어 버리는 것이다.\n\n종이: 상자, 신문지, 책 등은 종이류로 분리한다.\n플라스틱: 페트병, 용기는 라벨을 떼고 버린다.\n캔: 음료수 캔은 씻어서 찌그러뜨려 버린다.\n유리: 유리병은 깨지지 않게 조심해서 넣는다.\n\n분리수거를 잘 하면 지구를 지킬 수 있다." },
];

// ──────────────────────────────────────────
// 📝 글쓰기 생성 함수
// ──────────────────────────────────────────
function generateWritings(studentId, studentName, count, avgScore) {
  const writings = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const sample = WRITING_SAMPLES[i % WRITING_SAMPLES.length];
    const daysAgo = count - i;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const scoreVar = Math.floor(Math.random() * 24) - 12;
    const score = Math.max(50, Math.min(100, avgScore + scoreVar));
    const content = score >= 85 ? sample.content : sample.content.substring(0, Math.floor(sample.content.length * (score >= 70 ? 0.8 : 0.6)));

    const cs = Math.max(10, Math.min(25, Math.round(score * 0.25 + (Math.random() * 4 - 2))));
    const os = Math.max(10, Math.min(25, Math.round(score * 0.25 + (Math.random() * 4 - 2))));
    const es = Math.max(10, Math.min(25, Math.round(score * 0.25 + (Math.random() * 4 - 2))));
    const ns = Math.max(5, score - cs - os - es);
    const wordCount = content.replace(/\s/g, "").length;

    const feedback = score >= 90
      ? `${studentName} 학생, 정말 훌륭한 글이에요! 표현력이 뛰어나요. 👏`
      : score >= 80
      ? `${studentName} 학생, 잘 썼어요! 좀 더 구체적인 묘사를 더하면 더욱 좋아질 거예요. ✨`
      : score >= 70
      ? `${studentName} 학생, 좋은 시작이에요! '왜 그렇게 느꼈는지'를 좀 더 자세히 써 보세요. 💪`
      : `${studentName} 학생, 글을 써줘서 고마워요! 짧은 문장부터 정확하게 써보는 연습을 해 볼까요? 🌱`;

    // writingId = Firestore 문서 ID와 동일하게 설정 (선생님 상세보기에 필수)
    const writingId = `${studentId}_${date.getTime()}`;

    writings.push({
      writingId, isDraft: false,
      studentId, studentName, classCode: CLASS_CODE,
      nickname: studentName,
      title: sample.title + (i >= WRITING_SAMPLES.length ? ` (${Math.floor(i / WRITING_SAMPLES.length) + 1})` : ""),
      topic: sample.topic, writingType: sample.writingType,
      content, wordCount, score,
      scoreBreakdown: { content: cs, organization: os, expression: es, notation: ns },
      feedback,
      feedbackByDomain: {
        content: score >= 80 ? "주제를 잘 이해하고 풍부한 내용을 담았어요." : "주제에 대한 내용을 좀 더 구체적으로 써 보세요.",
        organization: score >= 80 ? "글의 흐름이 자연스럽고 구성이 좋아요." : "문단을 나누어 글의 구조를 잡아 보세요.",
        expression: score >= 80 ? "다양한 표현을 잘 사용했어요." : "비유나 감각적 표현을 더 사용해 보세요.",
        notation: score >= 80 ? "맞춤법이 정확해요." : "맞춤법을 한번 더 확인해 보세요.",
      },
      aiProbability: Math.floor(Math.random() * 15),
      reviewed: score >= 80,
      reviewedAt: score >= 80 ? date.toISOString() : null,
      createdAt: date.toISOString(),
      submittedAt: date.toISOString(),
      gradeLevel: GRADE_LEVEL,
    });
  }
  return writings;
}

// ──────────────────────────────────────────
// 🚀 메인 실행
// ──────────────────────────────────────────
async function main() {
  console.log("🌱 싹 AI 글쓰기 플랫폼 - 데모 데이터 시딩 시작\n");
  const now = new Date();

  // 1. Auth 사용자 생성
  console.log("👤 사용자 생성 중...");
  const allUsers = [TEACHER, ...STUDENTS];
  const uidMap = {};
  let adminToken = null; // 교사 토큰을 Firestore 쓰기에 사용

  for (const user of allUsers) {
    try {
      const result = await authSignUp(user.email, user.password, user.name);
      uidMap[user.email] = result.uid;
      if (user.role === "teacher") adminToken = result.idToken;
      console.log(`   ${result.isNew ? "✅" : "⏭️ "} ${user.name} (${user.email}) - UID: ${result.uid}`);
    } catch (err) {
      console.error(`   ❌ ${user.name} 생성 실패:`, err.message);
      process.exit(1);
    }
  }

  // 교사 토큰으로 Firestore에 쓰기 (Firestore 규칙상 교사 권한 필요)
  // 학생 데이터는 각 학생 토큰으로 쓰기
  const teacherUid = uidMap[TEACHER.email];

  // 2. 교사 문서
  console.log("\n📝 교사 문서 생성...");
  await fsSet("users", teacherUid, {
    uid: teacherUid, email: TEACHER.email, name: TEACHER.name,
    role: "teacher", approved: true, classCode: CLASS_CODE,
    onboardingCompleted: true,
    privacyAgreed: true, aiProcessingAgreed: true,
    privacyConsentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }, adminToken);
  console.log(`   ✅ ${TEACHER.name} 교사 문서 생성 완료`);

  // 3. 학급 문서 (빈 학생 목록으로 생성 - Firestore 규칙 요구사항)
  console.log("\n🏫 학급 생성...");
  const classCreatedAt = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  // assignmentSummary를 미리 채워서 학생 대시보드 마이그레이션 방지
  const assignmentSummary = [
    { title:"나의 겨울방학 이야기", description:"겨울방학 동안 가장 기억에 남는 일을 일기 형식으로 써 보세요.", writingType:"일기", minWordCount:200, maxWordCount:800, minScore:70, dueDate:new Date(now.getTime()-14*86400000).toISOString(), createdAt:new Date(now.getTime()-21*86400000).toISOString(), status:"closed" },
    { title:"내가 좋아하는 계절", description:"좋아하는 계절을 하나 골라서 이유를 세 가지 이상 써 주세요.", writingType:"논설문", minWordCount:300, maxWordCount:1000, minScore:70, dueDate:new Date(now.getTime()-3*86400000).toISOString(), createdAt:new Date(now.getTime()-10*86400000).toISOString(), status:"closed" },
    { title:"감사한 분에게 편지 쓰기", description:"감사한 분을 한 명 골라 진심을 담은 편지를 써 보세요.", writingType:"편지", minWordCount:200, maxWordCount:600, minScore:70, dueDate:new Date(now.getTime()+7*86400000).toISOString(), createdAt:new Date(now.getTime()-2*86400000).toISOString(), status:"active" },
  ];
  await fsSet("classes", CLASS_CODE, {
    className: "3학년 1반", gradeLevel: GRADE_LEVEL,
    teacherId: teacherUid, classCode: CLASS_CODE,
    students: [], maxStudents: 40, assignmentSummary,
    createdAt: classCreatedAt,
  }, adminToken);
  console.log(`   ✅ ${CLASS_CODE} 학급 생성 완료 (빈 학급)`);

  // 4. 학생 user 문서 먼저 생성 (isStudent() 체크를 위해)
  console.log("\n👩‍🎓 학생 문서 생성...");
  const studentTokens = {};
  for (const student of STUDENTS) {
    const uid = uidMap[student.email];
    const studentAuth = await authSignIn(student.email, student.password);
    studentTokens[student.email] = studentAuth.idToken;

    // 학생 user 문서 생성 (role: student 필수 - Firestore 규칙에서 isStudent 체크)
    await fsSet("users", uid, {
      uid, email: student.email, name: student.name,
      nickname: student.name, nicknameChanged: true,
      role: "student", approved: true, classCode: CLASS_CODE,
      gradeLevel: GRADE_LEVEL,
      points: student.points, totalPoints: student.totalPoints,
      ownedItems: student.ownedItems, equippedItems: student.equippedItems,
      roomItems: { furniture:"furn1", electronics:"elec1", vehicle:null, pet:null, wallpaper:"wall1", decorations:[] },
      achievements: student.achievements, writingSummary: [],
      classInfo: { className:"3학년 1반", gradeLevel: GRADE_LEVEL, teacherName: TEACHER.name },
      privacyAgreed: true, aiProcessingAgreed: true,
      privacyConsentAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }, studentAuth.idToken);
    console.log(`   ✅ ${student.name} 문서 생성`);
  }

  // 5. 학급에 학생 추가 (교사 토큰으로 update)
  console.log("\n📋 학급에 학생 추가...");
  const studentEntries = STUDENTS.map((s) => ({
    studentId: uidMap[s.email], studentName: s.name,
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }));
  // 교사가 학급 업데이트 (teacherId 소유자)
  await fsPatch("classes", CLASS_CODE, { students: studentEntries }, adminToken);
  console.log(`   ✅ 학생 ${STUDENTS.length}명 학급 등록 완료`);

  // 5.5. 기존 writings 삭제 (이전 시딩 데이터 클린업)
  console.log("\n🗑️ 기존 글쓰기 데이터 정리...");
  for (const student of STUDENTS) {
    const uid = uidMap[student.email];
    const deleted = await fsDeleteWhere("writings", "studentId", uid, adminToken);
    if (deleted > 0) console.log(`   🗑️ ${student.name}: 기존 글 ${deleted}편 삭제`);
  }
  // 기존 assignments 삭제
  const deletedAssignments = await fsDeleteWhere("assignments", "classCode", CLASS_CODE, adminToken);
  if (deletedAssignments > 0) console.log(`   🗑️ 기존 과제 ${deletedAssignments}개 삭제`);

  // 6. 글쓰기 + 통계 생성
  console.log("\n📚 글쓰기 데이터 생성...");
  let totalWritings = 0;
  const writingsByEmail = {}; // 과제 submissions 연결용

  for (const student of STUDENTS) {
    const uid = uidMap[student.email];
    const studentToken = studentTokens[student.email];

    // 글쓰기 생성 (writingId를 Firestore 문서 ID로 사용)
    const writings = generateWritings(uid, student.name, student.writingCount, student.avgScore);
    const writingSummary = [];

    for (const w of writings) {
      await fsSet("writings", w.writingId, w, studentToken);
      writingSummary.push({
        writingId: w.writingId, topic: w.topic, title: w.title, writingType: w.writingType,
        score: w.score, wordCount: w.wordCount, isDraft: false,
        createdAt: w.createdAt, submittedAt: w.submittedAt,
      });
    }
    totalWritings += writings.length;
    writingsByEmail[student.email] = writings;

    // Cloud Function이 writingSummary를 먼저 업데이트할 수 있으므로 잠시 대기 후 덮어쓰기
    await new Promise(r => setTimeout(r, 2000));

    // user 문서에 writingSummary 업데이트 (정확한 형식으로 덮어쓰기)
    await fsPatch("users", uid, { writingSummary, updatedAt: new Date().toISOString() }, studentToken);

    // 학생 통계
    const scores = writings.map((w) => w.score);
    const wordCounts = writings.map((w) => w.wordCount);

    await fsSet("studentStats", uid, {
      studentId: uid,
      totalSubmissions: student.writingCount,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore: Math.max(...scores), minScore: Math.min(...scores),
      lastSubmitScore: scores[scores.length - 1],
      above90Count: scores.filter((s) => s >= 90).length,
      above80Count: scores.filter((s) => s >= 80).length,
      above70Count: scores.filter((s) => s >= 70).length,
      below70Count: scores.filter((s) => s < 70).length,
      currentStreak: student.currentStreak, longestStreak: student.longestStreak,
      lastSubmitDate: new Date().toISOString(),
      totalWordCount: wordCounts.reduce((a, b) => a + b, 0),
      averageWordCount: Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length),
      updatedAt: new Date().toISOString(),
    }, studentToken);

    console.log(`   ✅ ${student.name}: 글 ${student.writingCount}편, ${student.totalPoints}P, 업적 ${student.achievements.length}개`);
  }

  // 5. 과제 생성
  console.log("\n📋 과제 생성...");
  const assignments = [
    { teacherId:teacherUid, classCode:CLASS_CODE, title:"나의 겨울방학 이야기", description:"겨울방학 동안 가장 기억에 남는 일을 일기 형식으로 써 보세요.", writingType:"일기", minWordCount:200, maxWordCount:800, dueDate:new Date(now.getTime()-14*86400000).toISOString(), createdAt:new Date(now.getTime()-21*86400000).toISOString(), status:"closed" },
    { teacherId:teacherUid, classCode:CLASS_CODE, title:"내가 좋아하는 계절", description:"좋아하는 계절을 하나 골라서 이유를 세 가지 이상 써 주세요.", writingType:"논설문", minWordCount:300, maxWordCount:1000, dueDate:new Date(now.getTime()-3*86400000).toISOString(), createdAt:new Date(now.getTime()-10*86400000).toISOString(), status:"closed" },
    { teacherId:teacherUid, classCode:CLASS_CODE, title:"감사한 분에게 편지 쓰기", description:"감사한 분을 한 명 골라 진심을 담은 편지를 써 보세요.", writingType:"편지", minWordCount:200, maxWordCount:600, dueDate:new Date(now.getTime()+7*86400000).toISOString(), createdAt:new Date(now.getTime()-2*86400000).toISOString(), status:"active" },
  ];

  for (const assignment of assignments) {
    const submitters = assignment.status === "closed" ? STUDENTS.slice(0, 4) : STUDENTS.slice(0, 2);
    const submittedAt = assignment.status === "closed" ? assignment.dueDate : now.toISOString();
    assignment.submissions = submitters.map((s) => {
      // 해당 학생의 글 중 하나를 선택하여 writingId 연결
      const studentWritings = writingsByEmail[s.email] || [];
      const matched = studentWritings.find(w => w.writingType === assignment.writingType) || studentWritings[0];
      return {
        studentId: uidMap[s.email], studentName: s.name, nickname: s.name,
        writingId: matched ? matched.writingId : null,
        score: matched ? matched.score : s.avgScore,
        status: "submitted", submittedAt,
        reviewed: false,
      };
    });
    assignment.minScore = 70;
    await fsAdd("assignments", assignment, adminToken);
    console.log(`   ✅ "${assignment.title}" (${assignment.status})`);
  }

  // 6. 완료
  console.log("\n" + "═".repeat(50));
  console.log("🎉 데모 데이터 시딩 완료!");
  console.log("═".repeat(50));
  console.log(`\n📊 생성된 데이터:`);
  console.log(`   👨‍🏫 교사: 1명 (${TEACHER.name})`);
  console.log(`   👩‍🎓 학생: ${STUDENTS.length}명`);
  console.log(`   🏫 학급: 1개 (${CLASS_CODE})`);
  console.log(`   📝 글쓰기: ${totalWritings}편`);
  console.log(`   📋 과제: ${assignments.length}개`);
  console.log(`\n🔐 로그인 정보:`);
  console.log(`   교사: ${TEACHER.email} / ${TEACHER.password}`);
  for (const s of STUDENTS) console.log(`   학생 (${s.name}): ${s.email} / ${s.password}`);
  console.log(`\n📱 학급 코드: ${CLASS_CODE}`);
  console.log(`\n🌐 사이트: https://isw-writing.web.app`);
  console.log();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ 시딩 실패:", err);
  process.exit(1);
});
