/**
 * 🌱 싹 AI 글쓰기 플랫폼 - 데모 시드 데이터
 *
 * 사용법:
 *   1. Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성
 *   2. 다운받은 JSON을 scripts/serviceAccountKey.json 으로 저장
 *   3. node scripts/seed-demo-data.cjs
 *
 * 생성되는 데이터:
 *   - 교사 1명 (김싹쌤)
 *   - 학생 5명 (다양한 참여도)
 *   - 학급 1개 (3학년 1반, DEMO2026)
 *   - 글쓰기 60+편 (실제 한국어 초등 글쓰기)
 *   - 과제 3개
 *   - 학생통계 5건
 */

const path = require("path");

// firebase-admin은 functions/ 디렉토리에서 로드
const admin = require(path.join(__dirname, "..", "functions", "node_modules", "firebase-admin"));

// ──────────────────────────────────────────
// 🔧 설정
// ──────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "serviceAccountKey.json");
const CLASS_CODE = "DEMO2026";
const GRADE_LEVEL = "elementary-3";

// 서비스 계정 키가 있으면 사용, 없으면 ADC(Firebase CLI 로그인) 사용
let serviceAccount;
try {
  serviceAccount = require(SERVICE_ACCOUNT_PATH);
  console.log("🔑 serviceAccountKey.json 사용");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (e) {
  console.log("🔑 Firebase CLI Application Default Credentials 사용");
  admin.initializeApp({
    projectId: "isw-writing",
  });
}

const db = admin.firestore();
const auth = admin.auth();

// ──────────────────────────────────────────
// 👤 데모 사용자 정의
// ──────────────────────────────────────────
const TEACHER = {
  email: "demo-teacher@ssak.kr",
  password: "demo1234!",
  name: "김싹쌤",
  role: "teacher",
};

const STUDENTS = [
  {
    email: "demo-student1@ssak.kr",
    password: "demo1234!",
    name: "이하늘",
    role: "student",
    // ⭐ 스타 학생: 레벨 7 (큰나무), 많은 글, 높은 점수, 많은 아이템
    points: 2800,
    totalPoints: 4500,
    writingCount: 32,
    avgScore: 88,
    currentStreak: 12,
    longestStreak: 21,
    ownedItems: [
      "face1", "face4", "face6", "face10", "face11",
      "hair1", "hair2", "hair3", "hair5", "hair9",
      "hc1", "hc2", "hc3", "hc5",
      "cloth1", "cloth2", "cloth3", "cloth5",
      "acc1", "acc2", "acc3", "acc5",
      "expr1", "expr2", "expr3",
      "eff1",
      "bg1", "bg2", "bg3", "frame1", "frame2",
      "furn1", "furn2", "furn3", "elec1", "elec2",
      "wall1", "wall2",
    ],
    equippedItems: {
      face: "face6", hair: "hair5", hairColor: "hc3",
      clothes: "cloth5", accessory: "acc5",
      expression: "expr2", effect: "eff1",
      background: "bg3", frame: "frame2",
    },
    achievements: [
      "first_submit", "submit_3", "submit_5", "submit_10", "submit_20", "submit_30",
      "score_60", "score_70", "score_80", "score_85", "score_90", "score_95",
      "avg_70", "avg_80",
      "streak_2", "streak_3", "streak_5", "streak_7", "streak_14", "streak_21",
      "words_100", "words_300", "words_500", "words_700", "words_1000",
      "total_words_10000",
      "points_100", "points_300", "points_500", "points_1000", "points_2000", "points_3000",
      "early_bird", "afternoon_writer", "evening_writer",
      "type_diary", "type_letter", "type_story",
      "rewrite_first", "rewrite_5",
      "rank_top10", "rank_top5", "rank_top3", "rank_1st",
      "first_day",
    ],
  },
  {
    email: "demo-student2@ssak.kr",
    password: "demo1234!",
    name: "박서준",
    role: "student",
    // 👍 우수 학생: 레벨 6 (나무), 꾸준한 글쓰기
    points: 1200,
    totalPoints: 1800,
    writingCount: 15,
    avgScore: 82,
    currentStreak: 5,
    longestStreak: 14,
    ownedItems: [
      "face1", "face2", "face10",
      "hair1", "hair2", "hair6",
      "hc1", "hc2",
      "cloth1", "cloth2", "cloth3",
      "acc1", "acc2",
      "expr1",
      "bg1", "bg2", "frame1",
      "furn1", "furn2", "elec1",
      "wall1",
    ],
    equippedItems: {
      face: "face2", hair: "hair6", hairColor: "hc2",
      clothes: "cloth3", accessory: "acc2",
      expression: "expr1", effect: null,
      background: "bg2", frame: "frame1",
    },
    achievements: [
      "first_submit", "submit_3", "submit_5", "submit_10",
      "score_60", "score_70", "score_80", "score_85",
      "avg_70", "avg_80",
      "streak_2", "streak_3", "streak_5", "streak_7", "streak_14",
      "words_100", "words_300", "words_500", "words_700",
      "total_words_10000",
      "points_100", "points_300", "points_500", "points_1000",
      "afternoon_writer", "evening_writer",
      "type_diary",
      "rank_top10",
      "first_day",
    ],
  },
  {
    email: "demo-student3@ssak.kr",
    password: "demo1234!",
    name: "최은비",
    role: "student",
    // 📊 보통 학생: 레벨 4 (꽃봉오리), 보통 참여
    points: 450,
    totalPoints: 800,
    writingCount: 8,
    avgScore: 75,
    currentStreak: 2,
    longestStreak: 7,
    ownedItems: [
      "face1", "face4",
      "hair1", "hair3",
      "hc1",
      "cloth1", "cloth2",
      "acc1",
      "expr1",
      "bg1", "frame1",
      "furn1", "elec1",
      "wall1",
    ],
    equippedItems: {
      face: "face4", hair: "hair3", hairColor: "hc1",
      clothes: "cloth2", accessory: "acc1",
      expression: null, effect: null,
      background: "bg1", frame: "frame1",
    },
    achievements: [
      "first_submit", "submit_3", "submit_5",
      "score_60", "score_70", "score_80",
      "avg_70",
      "streak_2", "streak_3", "streak_5", "streak_7",
      "words_100", "words_300", "words_500",
      "points_100", "points_300", "points_500",
      "afternoon_writer",
      "first_day",
    ],
  },
  {
    email: "demo-student4@ssak.kr",
    password: "demo1234!",
    name: "정민수",
    role: "student",
    // 🌱 신규 학생: 레벨 2 (새싹), 막 시작
    points: 150,
    totalPoints: 200,
    writingCount: 3,
    avgScore: 70,
    currentStreak: 1,
    longestStreak: 3,
    ownedItems: [
      "face1",
      "hair1",
      "hc1",
      "cloth1",
      "acc1",
      "expr1",
      "bg1", "frame1",
      "furn1", "elec1",
      "wall1",
    ],
    equippedItems: {
      face: "face1", hair: "hair1", hairColor: "hc1",
      clothes: "cloth1", accessory: "acc1",
      expression: null, effect: null,
      background: "bg1", frame: "frame1",
    },
    achievements: [
      "first_submit", "submit_3",
      "score_60", "score_70",
      "streak_2", "streak_3",
      "words_100", "words_300",
      "points_100",
      "first_day",
    ],
  },
  {
    email: "demo-student5@ssak.kr",
    password: "demo1234!",
    name: "김도현",
    role: "student",
    // 🎮 게이머 학생: 레벨 3이지만 아이템 수집에 올인
    points: 50,  // 거의 다 아이템에 씀
    totalPoints: 1200,
    writingCount: 10,
    avgScore: 78,
    currentStreak: 3,
    longestStreak: 10,
    ownedItems: [
      "face1", "face2", "face3", "face7", "face10", "face11", "face12", "face14", "face15",
      "hair1", "hair2", "hair3", "hair4", "hair5", "hair6", "hair7",
      "hc1", "hc2", "hc3", "hc4",
      "cloth1", "cloth2", "cloth3", "cloth4",
      "acc1", "acc2", "acc3", "acc4",
      "expr1", "expr2",
      "bg1", "bg2", "bg3", "frame1", "frame2",
      "furn1", "furn2", "furn3", "furn4",
      "elec1", "elec2",
      "wall1", "wall2", "wall3",
    ],
    equippedItems: {
      face: "face12", hair: "hair1", hairColor: "hc1",
      clothes: "cloth4", accessory: "acc4",
      expression: "expr2", effect: null,
      background: "bg3", frame: "frame2",
    },
    achievements: [
      "first_submit", "submit_3", "submit_5", "submit_10",
      "score_60", "score_70", "score_80",
      "avg_70",
      "streak_2", "streak_3", "streak_5", "streak_7", "streak_10",
      "words_100", "words_300", "words_500",
      "points_100", "points_300", "points_500", "points_1000",
      "morning_writer", "afternoon_writer",
      "type_diary", "type_story",
      "rewrite_first",
      "first_day",
    ],
  },
];

// ──────────────────────────────────────────
// 📝 실제 초등 3학년 수준 글쓰기 데이터
// ──────────────────────────────────────────
function generateWritings(studentId, studentName, count, avgScore) {
  const writings = [];
  const now = new Date();

  const samples = [
    // ── 일기 ──
    {
      writingType: "일기", topic: "오늘 하루",
      title: "신나는 체육 시간",
      content: `오늘 체육 시간에 피구를 했다. 우리 팀은 파란 팀이었다. 처음에는 공이 무서워서 뒤에 숨어 있었는데, 서준이가 "하늘아, 같이 앞에 가자!"라고 했다. 용기를 내서 앞에 나갔더니 공을 잡았다! 선생님이 "이하늘, 잘했어!"라고 칭찬해 주셨다. 공을 던져서 상대편 한 명도 맞혔다. 우리 팀이 이겨서 정말 기뻤다. 다음에도 체육 시간이 빨리 왔으면 좋겠다.`,
    },
    {
      writingType: "일기", topic: "가족과 함께",
      title: "할머니 댁에 간 날",
      content: `주말에 할머니 댁에 갔다. 할머니는 내가 좋아하는 잡채를 만들어 주셨다. 할머니가 만든 잡채는 세상에서 제일 맛있다. 먹고 나서 할머니랑 같이 텃밭에 가서 고추를 땄다. 빨간 고추가 예뻤다. 할아버지는 수박을 잘라 주셨는데 정말 달았다. 돌아올 때 할머니가 눈물을 글썽이셨다. 나도 코끝이 찡했다. 할머니, 다음에 또 갈게요!`,
    },
    {
      writingType: "일기", topic: "학교 생활",
      title: "짝꿍이 바뀐 날",
      content: `오늘 자리를 바꿨다. 새 짝꿍은 은비다. 은비는 조용하지만 웃을 때 보조개가 생긴다. 처음에는 어색해서 말을 못 했는데 은비가 먼저 "연필 빌려줄까?"라고 말해줬다. 그래서 나도 용기를 내서 "고마워, 은비야"라고 했다. 점심시간에 같이 밥 먹으면서 좋아하는 만화 이야기를 했는데 은비도 짱구를 좋아한다고 했다. 새 짝꿍이랑 빨리 친해지고 싶다.`,
    },
    {
      writingType: "일기", topic: "특별한 하루",
      title: "내 생일 파티",
      content: `오늘은 내 생일이다. 엄마가 아침부터 케이크를 만들어 주셨다. 딸기 케이크! 학교에서 친구들이 생일 축하 노래를 불러줬는데 얼굴이 빨개졌다. 민수가 편지를 써 줬는데 "하늘아, 항상 건강해. 우리 영원히 친구하자."라고 적혀 있었다. 감동받아서 눈물이 날 뻔했다. 집에 와서 가족이랑 케이크 촛불을 끄고 소원을 빌었다. 소원은 비밀이다!`,
    },
    // ── 편지 ──
    {
      writingType: "편지", topic: "감사한 분에게",
      title: "선생님께 드리는 편지",
      content: `사랑하는 선생님께\n\n선생님, 안녕하세요? 저는 3학년 1반 이하늘입니다.\n\n선생님이 매일 재미있는 수업을 해 주셔서 학교 오는 게 즐거워요. 특히 과학 시간에 화산 실험을 한 게 정말 신기했어요. 베이킹소다랑 식초를 넣었더니 진짜 화산처럼 부글부글 올라왔거든요!\n\n그리고 제가 수학을 어려워할 때 포기하지 말라고 응원해 주셔서 감사해요. 덕분에 지난 시험에서 90점을 받았어요.\n\n선생님, 항상 건강하세요. 사랑해요!\n\n제자 이하늘 올림`,
    },
    {
      writingType: "편지", topic: "친구에게",
      title: "전학 간 친구에게",
      content: `서연이에게\n\n서연아, 잘 지내고 있어? 나 하늘이야.\n\n네가 전학 간 지 벌써 한 달이 됐어. 아직도 교실에서 네 자리를 보면 좀 슬퍼. 쉬는 시간에 같이 줄넘기 하던 게 그리워.\n\n새 학교는 어때? 친구들은 잘 사귀었어? 우리 반에서는 어제 현장학습으로 과학관에 갔는데 네가 있었으면 더 재미있었을 텐데...\n\n방학 때 꼭 만나자! 우리 집 앞에 새로 생긴 떡볶이 집 같이 가자.\n\n보고 싶은 하늘이가`,
    },
    // ── 독후감 ──
    {
      writingType: "독후감", topic: "책 읽기",
      title: "어린 왕자를 읽고",
      content: `나는 '어린 왕자'라는 책을 읽었다. 이 책은 사막에 불시착한 비행사가 어린 왕자를 만나는 이야기다.\n\n가장 기억에 남는 장면은 여우가 어린 왕자에게 "길들인다는 것은 관계를 맺는 거야"라고 말하는 부분이다. 처음에는 무슨 뜻인지 잘 몰랐는데, 곰곰이 생각해 보니 친구를 사귀는 것과 비슷한 것 같다.\n\n내 짝꿍 은비도 처음에는 낯설었지만 매일 이야기하면서 소중한 친구가 되었다. 어린 왕자처럼 나도 소중한 사람들을 더 잘 대해야겠다고 생각했다.\n\n이 책을 친구들에게 추천하고 싶다.`,
    },
    {
      writingType: "독후감", topic: "책 읽기",
      title: "마당을 나온 암탉",
      content: `'마당을 나온 암탉' 잎싹이 이야기를 읽었다. 잎싹이는 양계장을 나와 자유롭게 살고 싶어하는 암탉이다.\n\n가장 감동적인 부분은 잎싹이가 아기 오리를 품어서 키우는 장면이었다. 자기 아기가 아닌데도 사랑으로 키워주는 모습이 우리 엄마 같았다. 엄마도 나를 위해서 많은 것을 포기하시는데, 잎싹이를 보면서 엄마 마음을 조금 알 것 같았다.\n\n슬펐던 건 마지막에 잎싹이가 족제비에게 자기 몸을 내어주는 부분이다. 읽으면서 눈물이 났다. 하지만 잎싹이는 끝까지 용감했다.\n\n이 책을 읽고 나서 엄마한테 "사랑해요"라고 말했다.`,
    },
    // ── 설명문 ──
    {
      writingType: "설명문", topic: "동물",
      title: "우리 반 햄스터 뭉치",
      content: `우리 반에는 '뭉치'라는 햄스터가 있다. 뭉치는 골든 햄스터로, 몸 색깔이 갈색과 흰색이 섞여 있다.\n\n햄스터는 야행성 동물이라서 낮에는 주로 자고, 저녁에 활발하게 움직인다. 뭉치도 수업 시간에는 톱밥 속에서 자고 있지만, 방과 후에 가면 쳇바퀴를 열심히 돌린다.\n\n햄스터를 키울 때 가장 중요한 것은 물을 매일 갈아주는 것이다. 그리고 해바라기씨를 너무 많이 주면 뚱뚱해지니까 하루에 5알 정도만 줘야 한다.\n\n뭉치는 우리 반 친구들 모두의 인기 스타다. 다들 뭉치 당번을 하고 싶어해서 순서를 정해놓았다.`,
    },
    {
      writingType: "설명문", topic: "과학",
      title: "무지개는 왜 생길까?",
      content: `비가 온 뒤에 하늘에 무지개가 뜰 때가 있다. 무지개는 왜 생기는 걸까?\n\n무지개는 빛과 물방울이 만나서 생긴다. 햇빛은 사실 여러 가지 색이 섞여 있는데, 물방울을 통과하면서 색깔이 나누어진다. 이것을 '빛의 분산'이라고 한다.\n\n무지개의 색은 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라 이렇게 일곱 가지다. 외우기 쉽게 "빨주노초파남보"라고 한다.\n\n재미있는 사실은, 무지개는 실제로 원 모양이라는 것이다. 하지만 땅이 가려서 우리 눈에는 반원으로 보인다. 비행기에서 보면 동그란 무지개를 볼 수도 있다고 한다.`,
    },
    // ── 주장글 ──
    {
      writingType: "논설문", topic: "학교 생활",
      title: "학교에서 핸드폰을 써도 될까?",
      content: `나는 학교에서 핸드폰 사용을 제한해야 한다고 생각한다.\n\n첫째, 수업 시간에 집중할 수 없기 때문이다. 핸드폰을 보면 게임이나 영상이 생각나서 선생님 말씀에 집중하기 어렵다.\n\n둘째, 쉬는 시간에 친구들과 놀지 않게 된다. 다 같이 핸드폰만 보고 있으면 대화도 없고 재미없다. 같이 뛰어노는 게 더 좋다.\n\n물론 부모님과 연락해야 할 때 핸드폰이 필요할 수도 있다. 하지만 그런 경우에는 선생님께 허락을 받고 잠깐 사용하면 된다.\n\n그러므로 수업 시간에는 핸드폰을 선생님께 맡기고, 쉬는 시간에는 친구들과 함께 노는 것이 좋겠다.`,
    },
    {
      writingType: "논설문", topic: "환경",
      title: "급식을 남기지 말자",
      content: `나는 급식을 남기지 말아야 한다고 생각한다.\n\n첫째, 음식을 남기면 쓰레기가 많아져서 환경이 나빠진다. 우리 학교에서 하루에 나오는 음식물 쓰레기가 큰 통 두 개나 된다고 한다.\n\n둘째, 음식을 만들어 주시는 급식 아주머니들의 노력을 생각해야 한다. 아침 일찍부터 400명 이상의 밥을 만드시는데, 남겨진 음식을 보면 속상하실 것이다.\n\n물론 정말 싫어하는 음식이 있을 수 있다. 하지만 한 입만이라도 먹어보면 맛있는 것도 있다. 나도 시금치를 싫어했는데 한 번 먹어보니 생각보다 괜찮았다.\n\n우리 모두 급식을 남기지 않도록 노력하자.`,
    },
    // ── 시 ──
    {
      writingType: "시", topic: "자연",
      title: "봄비",
      content: `봄비가 내려요\n조용히 사르르 내려요\n\n꽃잎에 떨어진 빗방울이\n동그란 보석처럼 빛나요\n\n개나리가 활짝 웃으며\n"고마워, 목이 말랐어!" 하고\n\n개구리도 연못에서\n개굴개굴 노래해요\n\n봄비야, 봄비야\n더 많이 내려줘\n우리 학교 화단에도\n예쁜 꽃이 피게`,
    },
    {
      writingType: "시", topic: "가족",
      title: "엄마 손",
      content: `엄마 손은 마법의 손\n아픈 데를 쓱쓱 문지르면\n금세 나아버리는 마법의 손\n\n엄마 손은 따뜻한 손\n겨울밤 내 손을 꼭 잡으면\n이불보다 더 따뜻한 손\n\n엄마 손은 맛있는 손\n냉장고에 뭐가 없어도\n뚝딱뚝딱 맛있는 밥이 나오는 손\n\n세상에서 제일 좋은\n우리 엄마 손`,
    },
    // ── 상상글 ──
    {
      writingType: "상상글", topic: "미래",
      title: "내가 과학자가 된다면",
      content: `만약 내가 과학자가 된다면 무엇을 만들까 상상해 보았다.\n\n첫 번째로, 숙제를 대신 해주는 로봇을 만들고 싶다. 하지만 곰곰이 생각해 보니 그러면 내가 아무것도 배울 수 없을 것 같다. 그래서 숙제를 도와주되, 답을 알려주지 않고 힌트만 주는 로봇으로 바꿨다.\n\n두 번째로, 환경을 깨끗하게 만드는 기계를 만들고 싶다. 바다에 떠다니는 쓰레기를 빨아들이는 거대한 청소기 같은 것이다.\n\n세 번째로, 아픈 사람을 낫게 하는 약을 만들고 싶다. 할머니가 무릎이 아프신데, 한 알만 먹으면 씩씩하게 걸을 수 있는 약이 있으면 좋겠다.\n\n과학자가 되려면 공부를 열심히 해야겠다!`,
    },
    {
      writingType: "상상글", topic: "모험",
      title: "구름 위의 나라",
      content: `어느 날 아침에 일어났더니 내 방 창문 밖에 커다란 구름 사다리가 놓여 있었다. 호기심에 올라가 보니 구름 위에 나라가 있었다!\n\n구름 나라 사람들은 모두 날개가 달려 있었다. 그리고 집이 솜사탕처럼 생겼다. 가장 신기한 건 여기서는 걱정을 하면 회색 구름이 되고, 웃으면 무지개가 뜬다는 것이었다.\n\n나는 구름 나라 친구 '뭉게'를 만났다. 뭉게는 나에게 임시 날개를 빌려줬다. 하늘을 나는 것은 정말 자유로웠다. 아래를 내려다보니 우리 학교도 보였다.\n\n해가 지자 뭉게가 "내일 또 와!"라고 했다. 사다리를 내려와 침대에 누웠는데... 꿈이었을까?`,
    },
    // ── 기행문 ──
    {
      writingType: "기행문", topic: "여행",
      title: "제주도 가족 여행",
      content: `겨울 방학에 가족과 함께 제주도에 다녀왔다. 비행기를 처음 탔는데 구름 위를 날아가는 게 정말 신기했다.\n\n첫째 날은 성산일출봉에 갔다. 정상까지 올라가는 게 힘들었지만 위에서 본 바다가 너무 예뻤다. 엄마가 "힘들어도 올라온 보람이 있지?"라고 하셨는데 정말 그랬다.\n\n둘째 날은 한라산 1100고지에서 눈을 봤다. 서울에서는 눈이 안 왔는데 제주도 산에는 눈이 쌓여 있었다. 아빠랑 눈싸움을 했다. 셋째 날은 흑돼지를 먹었는데 세상에서 제일 맛있었다.\n\n제주도는 정말 아름다운 곳이다. 커서 또 가고 싶다.`,
    },
    {
      writingType: "기행문", topic: "여행",
      title: "경주 수학여행",
      content: `3학년 수학여행으로 경주에 갔다. 버스를 두 시간이나 탔는데 친구들이랑 노래를 불러서 금방 도착했다.\n\n불국사에서 석가탑과 다보탑을 봤다. 돌로 만든 탑이 천 년이나 됐다는 게 믿기지 않았다. 선생님이 석가탑에 숨은 무영탑 이야기를 해주셨는데 슬프면서도 감동적이었다.\n\n첨성대는 생각보다 작았다. 하지만 옛날 사람들이 저것으로 별을 봤다니 대단했다. 국립경주박물관에서는 에밀레종을 봤다. 종이 엄청 크고, 종에 얽힌 이야기가 무서웠다.\n\n돌아오는 버스에서 친구들이 다 잠들었는데 나는 창밖을 보며 오늘 본 것들을 떠올렸다.`,
    },
    // ── 묘사글 ──
    {
      writingType: "묘사", topic: "계절",
      title: "가을 운동장",
      content: `가을이 되자 우리 학교 운동장이 변했다.\n\n운동장 옆 은행나무가 노랗게 물들었다. 바람이 불면 은행잎이 나비처럼 하나둘 떨어진다. 친구들은 예쁜 은행잎을 주워서 책 사이에 끼워둔다.\n\n하늘은 높고 파랗다. 여름에는 뭉게구름이 많았는데 가을에는 얇은 새털구름이 떠 있다. 공기가 시원해서 숨을 깊이 들이쉬면 기분이 상쾌하다.\n\n쉬는 시간에 운동장에서 뛰어놀면 땀이 잘 안 나서 좋다. 여름에는 조금만 뛰어도 땀이 줄줄 흘렀는데.\n\n가을 운동장에서 친구들과 함께 뛰어노는 이 시간이 참 좋다.`,
    },
    // ── 보고서 ──
    {
      writingType: "보고서", topic: "관찰",
      title: "강낭콩 키우기 관찰 보고서",
      content: `관찰 주제: 강낭콩이 싹 트는 과정\n관찰 기간: 3월 4일 ~ 3월 18일 (2주)\n\n3월 4일: 종이컵에 흙을 넣고 강낭콩 2알을 심었다. 물을 충분히 주었다.\n\n3월 7일: 아직 변화가 없다. 매일 물을 주고 있다.\n\n3월 9일: 흙이 갈라지면서 작은 초록색 싹이 올라왔다! 신기했다.\n\n3월 12일: 싹이 5cm로 자랐다. 줄기가 초록색이고, 작은 잎 두 장이 펼쳐졌다.\n\n3월 15일: 잎이 네 장으로 늘었다. 키가 10cm가 됐다.\n\n3월 18일: 줄기가 15cm까지 자랐고, 잎이 여섯 장이다.\n\n결론: 강낭콩은 심은 지 5일 만에 싹이 트고, 2주 만에 15cm까지 자란다. 물과 햇빛이 중요하다.`,
    },
    // 추가 글들 (다양한 유형)
    {
      writingType: "일기", topic: "오늘 하루",
      title: "비 오는 날",
      content: `오늘은 아침부터 비가 왔다. 우산을 가져가지 않아서 엄마가 학교까지 데려다주셨다. 차 안에서 비 오는 소리를 들으니 기분이 이상했다. 좀 졸리기도 하고, 편안하기도 했다.\n\n쉬는 시간에 밖에 나가지 못해서 교실에서 친구들이랑 보드게임을 했다. 민수가 루미큐브를 가져왔는데 내가 이겼다! 기분이 좋았다.\n\n하교할 때는 비가 그쳐서 걸어서 왔다. 웅덩이가 많아서 장화를 신고 왔으면 좋았을 텐데. 집에 오니까 엄마가 따뜻한 호떡을 만들어 주셨다. 비 오는 날은 호떡이 최고다!`,
    },
    {
      writingType: "편지", topic: "감사한 분에게",
      title: "엄마에게 쓰는 편지",
      content: `사랑하는 엄마에게\n\n엄마, 안녕? 나 하늘이야.\n\n매일 아침 일찍 일어나서 밥 해주시고, 학교까지 데려다주셔서 감사해요. 가끔 엄마가 피곤해 보이실 때 마음이 아파요.\n\n지난번에 내가 시험을 못 봤을 때 혼내지 않고 "괜찮아, 다음에 잘하면 돼"라고 해주셔서 고마웠어요. 그 말을 듣고 울 뻔했어요.\n\n엄마, 나 커서 엄마한테 맛있는 거 많이 사 줄게요. 그리고 엄마 어깨도 주물러 드릴게요.\n\n항상 사랑해요, 엄마!\n\n딸 하늘이 올림`,
    },
    {
      writingType: "논설문", topic: "학교 생활",
      title: "체험학습을 늘려야 한다",
      content: `나는 체험학습을 더 많이 해야 한다고 생각한다.\n\n첫째, 교실에서 배우는 것보다 직접 보고 만지면 더 잘 기억되기 때문이다. 지난번 과학관에서 공룡 화석을 봤을 때, 교과서에서 읽었을 때보다 훨씬 실감 났다.\n\n둘째, 친구들과 함께 새로운 경험을 하면 더 친해질 수 있다. 수학여행에서 같은 방을 쓴 민수와 나는 그 뒤로 가장 친한 친구가 되었다.\n\n물론 체험학습을 가면 비용이 들고 안전에 신경 써야 한다. 하지만 학교 근처 공원이나 도서관처럼 가까운 곳이라도 괜찮다.\n\n체험학습을 통해 더 재미있고 기억에 남는 공부를 할 수 있으면 좋겠다.`,
    },
    {
      writingType: "상상글", topic: "미래",
      title: "100년 후의 학교",
      content: `100년 후의 학교는 어떤 모습일까?\n\n아마 교실 대신 가상현실(VR) 교실에서 공부할 것이다. 안경을 쓰면 바닷속으로 들어가서 물고기를 직접 볼 수 있고, 우주로 날아가서 행성을 탐험할 수도 있을 것이다.\n\n교과서 대신 AI 로봇 선생님이 내 수준에 맞춰서 가르쳐 줄 것이다. 잘 모르면 다시 설명해주고, 잘하면 다음 단계로 넘어가게 해줄 것이다.\n\n하지만 나는 진짜 선생님도 꼭 있었으면 좋겠다. 로봇은 우리 마음을 이해하고 안아줄 수 없으니까. 힘들 때 "괜찮아"라고 말해주는 건 사람만 할 수 있다고 생각한다.\n\n100년 후에도 학교는 친구를 만나는 곳이었으면 좋겠다.`,
    },
    {
      writingType: "묘사", topic: "음식",
      title: "우리 집 된장찌개",
      content: `우리 집 된장찌개는 세상에서 제일 맛있다.\n\n엄마가 된장찌개를 끓이기 시작하면 집 안이 구수한 냄새로 가득 찬다. 보글보글 끓는 소리가 들리면 배가 꼬르륵 소리를 낸다.\n\n뚜껑을 열면 김이 모락모락 올라온다. 두부가 하얗게 보이고, 호박은 초록색이고, 고추가 빨간색으로 떠 있다. 마치 작은 그림 같다.\n\n한 숟가락 떠서 불면서 먹으면, 짜지도 싱겁지도 않은 딱 좋은 맛이다. 밥이랑 같이 먹으면 밥 한 그릇이 금방 없어진다.\n\n아빠도 "엄마 된장찌개가 최고야!"라고 항상 말씀하신다. 나도 커서 이 맛을 똑같이 내고 싶다.`,
    },
    {
      writingType: "일기", topic: "학교 생활",
      title: "발표를 잘한 날",
      content: `오늘 국어 시간에 발표를 했다. 주제는 "나의 꿈"이었다. 어제 밤에 연습을 많이 했는데도 떨렸다.\n\n앞에 나가니까 다리가 후들후들 떨렸다. 목소리도 작아졌다. 그런데 선생님이 웃으면서 고개를 끄덕여 주셔서 용기가 났다.\n\n"저의 꿈은 수의사입니다. 아픈 동물들을 치료해 주고 싶습니다." 이렇게 말했더니 친구들이 박수를 쳐줬다. 특히 은비가 엄지를 올려줘서 기분이 좋았다.\n\n선생님이 "하늘이 목소리가 또렷하고 내용이 좋았어요"라고 칭찬해 주셨다. 처음으로 발표가 재미있다고 느꼈다. 다음에도 손 들고 발표해야겠다.`,
    },
    {
      writingType: "설명문", topic: "생활",
      title: "우리 동네 도서관",
      content: `우리 동네에는 '꿈나무 도서관'이라는 작은 도서관이 있다. 학교에서 걸어서 5분 거리에 있어서 자주 간다.\n\n도서관 1층에는 어린이 책이 있고, 2층에는 어른 책이 있다. 내가 좋아하는 코너는 1층 만화 코너와 과학 코너다.\n\n도서관에서는 책을 빌릴 수 있다. 한 번에 5권까지 2주 동안 빌릴 수 있다. 도서관 카드만 있으면 된다.\n\n토요일마다 독서 프로그램이 있는데, 책을 같이 읽고 이야기를 나눈다. 지난주에는 '구름빵'을 읽었다.\n\n조용히 책을 읽을 수 있는 이 공간이 나는 참 좋다. 집보다 집중이 잘 되는 것 같다.`,
    },
    {
      writingType: "일기", topic: "특별한 하루",
      title: "강아지를 만난 날",
      content: `오늘 학교 끝나고 집에 가는 길에 작은 강아지를 발견했다. 갈색 강아지인데 혼자서 떨고 있었다. 목에 목줄도 없고 주인도 안 보였다.\n\n나는 강아지한테 다가가서 천천히 손을 내밀었다. 강아지가 내 손 냄새를 맡더니 꼬리를 흔들었다! 너무 귀여웠다.\n\n엄마한테 전화해서 이야기했더니 "그 자리에 있어, 엄마가 갈게"라고 하셨다. 엄마가 와서 같이 근처 동물 보호소에 데려다줬다.\n\n보호소 아저씨가 "걱정 마, 잘 돌봐줄게"라고 하셨다. 집에 오면서 자꾸 그 강아지가 생각났다. 좋은 주인을 만나면 좋겠다. 엄마한테 우리도 강아지 키우면 안 되냐고 물어봐야지.`,
    },
    {
      writingType: "독후감", topic: "책 읽기",
      title: "아낌없이 주는 나무",
      content: `'아낌없이 주는 나무'라는 그림책을 읽었다. 나무가 소년에게 계속 뭔가를 주는 이야기이다.\n\n나무는 소년에게 사과를 주고, 가지를 주고, 줄기까지 주었다. 마지막에는 그루터기만 남았는데도 소년이 앉을 자리를 내어줬다.\n\n처음에는 소년이 나쁜 사람이라고 생각했다. 받기만 하고 고맙다는 말도 안 하니까. 하지만 다시 읽어보니 나도 부모님한테 그런 것 같아서 부끄러웠다.\n\n매일 밥을 해주시고, 학원비도 내주시고, 아프면 밤새 간호해 주시는 우리 부모님도 아낌없이 주는 나무 같다.\n\n오늘부터 "감사합니다"를 더 자주 말해야겠다.`,
    },
    // 추가 점수대 다양화용
    {
      writingType: "일기", topic: "오늘 하루",
      title: "축구를 한 날",
      content: `오늘 점심시간에 운동장에서 축구를 했다. 서준이, 민수, 도현이랑 같이 팀이 됐다. 상대편에는 지훈이네 팀이었다.\n\n전반전에 서준이가 골을 넣어서 1-0으로 이기고 있었다. 후반전에 내가 공을 빼앗아서 서준이에게 패스했는데, 서준이가 다시 나한테 패스해줬다. 나는 있는 힘껏 찼는데... 골대 왼쪽으로 들어갔다! 내 인생 첫 골이었다!\n\n친구들이 달려와서 같이 기뻐해줬다. 2-1로 이겼다. 오늘은 잠이 안 올 것 같다. 너무 행복하다!`,
    },
    {
      writingType: "편지", topic: "친구에게",
      title: "아픈 친구에게 쓰는 편지",
      content: `민수에게\n\n민수야, 감기 다 나았어? 오늘도 학교에 안 와서 걱정됐어.\n\n오늘 과학 시간에 전구 실험을 했는데 너 없어서 아쉬웠어. 네가 좋아하는 실험이었거든. 건전지로 전구에 불 켜는 거였는데 되게 신기했어. 네가 왔으면 우리 팀이 일등 했을 텐데.\n\n숙제는 수학 43쪽이랑 국어 받아쓰기 연습이야. 내가 사진 찍어서 보내줄게.\n\n푹 쉬고 빨리 나아서 와. 네 자리가 비어있으니까 허전해.\n\n쾌유를 빌며, 하늘이가`,
    },
    {
      writingType: "설명문", topic: "생활",
      title: "분리수거하는 방법",
      content: `분리수거는 쓰레기를 종류별로 나누어 버리는 것이다. 환경을 지키기 위해 반드시 해야 한다.\n\n종이: 상자, 신문지, 책 등은 종이류로 분리한다. 우유팩은 씻어서 따로 모은다.\n\n플라스틱: 페트병, 플라스틱 용기는 내용물을 비우고, 라벨을 떼고 버린다.\n\n캔: 음료수 캔, 통조림 캔은 씻어서 찌그러뜨려 버린다.\n\n유리: 유리병은 깨지지 않게 조심해서 유리류에 넣는다.\n\n가장 중요한 것은 음식물이 묻어있으면 한번 헹구고 버리는 것이다. 오염된 재활용품은 쓰레기가 되어 버리기 때문이다.\n\n분리수거를 잘 하면 지구를 지킬 수 있다.`,
    },
  ];

  for (let i = 0; i < count; i++) {
    const sample = samples[i % samples.length];
    const daysAgo = count - i; // 최신 글이 마지막
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    // 점수 분포: avgScore 기준 ±12 변동
    const scoreVariation = Math.floor(Math.random() * 24) - 12;
    const score = Math.max(50, Math.min(100, avgScore + scoreVariation));
    const content = score >= 85 ? sample.content : score >= 70 ? sample.content.substring(0, Math.floor(sample.content.length * 0.8)) : sample.content.substring(0, Math.floor(sample.content.length * 0.6));

    // 점수 세부 항목
    const contentScore = Math.max(10, Math.min(25, Math.round(score * 0.25 + (Math.random() * 4 - 2))));
    const orgScore = Math.max(10, Math.min(25, Math.round(score * 0.25 + (Math.random() * 4 - 2))));
    const exprScore = Math.max(10, Math.min(25, Math.round(score * 0.25 + (Math.random() * 4 - 2))));
    const notaScore = score - contentScore - orgScore - exprScore;

    const wordCount = content.replace(/\s/g, "").length;

    writings.push({
      studentId,
      studentName,
      classCode: CLASS_CODE,
      title: sample.title + (i >= samples.length ? ` (${i - samples.length + 2})` : ""),
      topic: sample.topic,
      writingType: sample.writingType,
      content,
      wordCount,
      score,
      scoreBreakdown: {
        content: contentScore,
        organization: orgScore,
        expression: exprScore,
        notation: Math.max(5, notaScore),
      },
      feedback: generateFeedback(score, studentName),
      feedbackByDomain: {
        content: score >= 80 ? "주제를 잘 이해하고 풍부한 내용을 담았어요." : "주제에 대한 내용을 좀 더 구체적으로 써 보세요.",
        organization: score >= 80 ? "글의 흐름이 자연스럽고 구성이 좋아요." : "문단을 나누어 글의 구조를 잡아 보세요.",
        expression: score >= 80 ? "다양한 표현을 잘 사용했어요." : "비유나 감각적 표현을 더 사용해 보세요.",
        notation: score >= 80 ? "맞춤법이 정확해요." : "맞춤법을 한번 더 확인해 보세요.",
      },
      aiProbability: Math.floor(Math.random() * 15), // 학생 직접 작성이므로 낮음
      reviewed: score >= 80,
      reviewedAt: score >= 80 ? date.toISOString() : null,
      createdAt: date.toISOString(),
      submittedAt: date.toISOString(),
      gradeLevel: GRADE_LEVEL,
    });
  }

  return writings;
}

function generateFeedback(score, name) {
  if (score >= 90)
    return `${name} 학생, 정말 훌륭한 글이에요! 주제를 깊이 있게 다루었고, 표현력이 뛰어나요. 이 조자로 계속 써 나가면 멋진 작가가 될 수 있을 거예요. 👏`;
  if (score >= 80)
    return `${name} 학생, 잘 썼어요! 내용이 풍부하고 읽기 좋은 글이에요. 조금 더 구체적인 묘사를 더하면 더욱 좋아질 거예요. 화이팅! ✨`;
  if (score >= 70)
    return `${name} 학생, 좋은 시작이에요! 생각을 잘 정리했어요. 다음에는 '왜 그렇게 느꼈는지'를 좀 더 자세히 써 보면 더 좋은 글이 될 거예요. 💪`;
  return `${name} 학생, 글을 써줘서 고마워요! 조금씩 연습하면 분명 실력이 좋아질 거예요. 먼저 짧은 문장부터 정확하게 써보는 연습을 해 볼까요? 🌱`;
}

// ──────────────────────────────────────────
// 📋 과제 데이터
// ──────────────────────────────────────────
function generateAssignments(teacherId) {
  const now = new Date();
  return [
    {
      teacherId,
      classCode: CLASS_CODE,
      title: "나의 겨울방학 이야기",
      description: "겨울방학 동안 가장 기억에 남는 일을 일기 형식으로 써 보세요. 언제, 어디서, 무엇을 했는지 자세히 적어 주세요.",
      writingType: "일기",
      minWordCount: 200,
      maxWordCount: 800,
      minScore: 60,
      maxAiProbability: 50,
      dueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2주 전 마감
      createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: "closed",
    },
    {
      teacherId,
      classCode: CLASS_CODE,
      title: "내가 좋아하는 계절",
      description: "봄, 여름, 가을, 겨울 중 좋아하는 계절을 하나 골라서 주장하는 글을 써 보세요. 왜 그 계절을 좋아하는지 이유를 세 가지 이상 써 주세요.",
      writingType: "논설문",
      minWordCount: 300,
      maxWordCount: 1000,
      minScore: 65,
      maxAiProbability: 50,
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전 마감
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "closed",
    },
    {
      teacherId,
      classCode: CLASS_CODE,
      title: "감사한 분에게 편지 쓰기",
      description: "부모님, 선생님, 친구 중 감사한 분을 한 명 골라 진심을 담은 편지를 써 보세요.",
      writingType: "편지",
      minWordCount: 200,
      maxWordCount: 600,
      minScore: 60,
      maxAiProbability: 50,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 마감 (진행중)
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
  ];
}

// ──────────────────────────────────────────
// 🚀 메인 실행
// ──────────────────────────────────────────
async function main() {
  console.log("🌱 싹 AI 글쓰기 플랫폼 - 데모 데이터 시딩 시작\n");

  // 1. Auth 사용자 생성
  console.log("👤 사용자 생성 중...");
  const allUsers = [TEACHER, ...STUDENTS];
  const uidMap = {}; // email → uid

  for (const user of allUsers) {
    try {
      // 기존 계정 확인
      const existing = await auth.getUserByEmail(user.email).catch(() => null);
      if (existing) {
        console.log(`   ⏭️  ${user.name} (${user.email}) - 이미 존재, UID: ${existing.uid}`);
        uidMap[user.email] = existing.uid;
        continue;
      }
      const created = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.name,
      });
      uidMap[user.email] = created.uid;
      console.log(`   ✅ ${user.name} (${user.email}) - UID: ${created.uid}`);
    } catch (err) {
      console.error(`   ❌ ${user.name} 생성 실패:`, err.message);
      process.exit(1);
    }
  }

  const teacherUid = uidMap[TEACHER.email];

  // 2. 교사 Firestore 문서
  console.log("\n📝 교사 문서 생성...");
  await db.collection("users").doc(teacherUid).set({
    uid: teacherUid,
    email: TEACHER.email,
    name: TEACHER.name,
    role: "teacher",
    approved: true,
    classCode: CLASS_CODE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log(`   ✅ ${TEACHER.name} 교사 문서 생성 완료`);

  // 3. 학급 문서
  console.log("\n🏫 학급 생성...");
  const studentEntries = STUDENTS.map((s) => ({
    studentId: uidMap[s.email],
    studentName: s.name,
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2개월 전 가입
  }));

  await db.collection("classes").doc(CLASS_CODE).set({
    className: "3학년 1반",
    gradeLevel: GRADE_LEVEL,
    teacherId: teacherUid,
    classCode: CLASS_CODE,
    students: studentEntries,
    maxStudents: 40,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  });
  console.log(`   ✅ ${CLASS_CODE} 학급 생성 완료 (학생 ${STUDENTS.length}명)`);

  // 4. 학생 Firestore 문서 + 글쓰기 + 통계
  console.log("\n📚 학생 데이터 생성...");
  let totalWritings = 0;

  for (const student of STUDENTS) {
    const uid = uidMap[student.email];

    // 4a. 글쓰기 생성
    const writings = generateWritings(uid, student.name, student.writingCount, student.avgScore);
    const writingSummary = [];

    for (const w of writings) {
      const docRef = await db.collection("writings").add(w);
      writingSummary.push({
        id: docRef.id,
        title: w.title,
        writingType: w.writingType,
        score: w.score,
        wordCount: w.wordCount,
        createdAt: w.createdAt,
      });
    }
    totalWritings += writings.length;

    // 4b. 학생 사용자 문서
    await db.collection("users").doc(uid).set({
      uid,
      email: student.email,
      name: student.name,
      role: "student",
      approved: true,
      classCode: CLASS_CODE,
      points: student.points,
      totalPoints: student.totalPoints,
      ownedItems: student.ownedItems,
      equippedItems: student.equippedItems,
      roomItems: { furniture: "furn1", electronics: "elec1", vehicle: null, pet: null, wallpaper: "wall1", decorations: [] },
      achievements: student.achievements,
      writingSummary,
      classInfo: {
        className: "3학년 1반",
        gradeLevel: GRADE_LEVEL,
        teacherName: TEACHER.name,
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 4c. 학생 통계
    const scores = writings.map((w) => w.score);
    const wordCounts = writings.map((w) => w.wordCount);

    await db.collection("studentStats").doc(uid).set({
      studentId: uid,
      totalSubmissions: student.writingCount,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      lastSubmitScore: scores[scores.length - 1],
      above90Count: scores.filter((s) => s >= 90).length,
      above80Count: scores.filter((s) => s >= 80).length,
      above70Count: scores.filter((s) => s >= 70).length,
      below70Count: scores.filter((s) => s < 70).length,
      currentStreak: student.currentStreak,
      longestStreak: student.longestStreak,
      lastSubmitDate: new Date().toISOString(),
      totalWordCount: wordCounts.reduce((a, b) => a + b, 0),
      averageWordCount: Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length),
      updatedAt: new Date().toISOString(),
    });

    console.log(`   ✅ ${student.name}: 글 ${student.writingCount}편, ${student.totalPoints}P, 업적 ${student.achievements.length}개`);
  }

  // 5. 과제 생성
  console.log("\n📋 과제 생성...");
  const assignments = generateAssignments(teacherUid);
  for (const assignment of assignments) {
    // 제출 정보 추가 (닫힌 과제에만)
    if (assignment.status === "closed") {
      assignment.submissions = STUDENTS.slice(0, 4).map((s) => ({
        studentId: uidMap[s.email],
        studentName: s.name,
        status: "submitted",
        submittedAt: assignment.dueDate,
      }));
    } else {
      // 진행중 과제: 일부만 제출
      assignment.submissions = STUDENTS.slice(0, 2).map((s) => ({
        studentId: uidMap[s.email],
        studentName: s.name,
        status: "submitted",
        submittedAt: new Date().toISOString(),
      }));
    }
    const ref = await db.collection("assignments").add(assignment);
    console.log(`   ✅ "${assignment.title}" (${assignment.status})`);
  }

  // 6. 완료 보고서
  console.log("\n" + "═".repeat(50));
  console.log("🎉 데모 데이터 시딩 완료!");
  console.log("═".repeat(50));
  console.log(`\n📊 생성된 데이터:`);
  console.log(`   👨‍🏫 교사: 1명 (${TEACHER.name})`);
  console.log(`   👩‍🎓 학생: ${STUDENTS.length}명`);
  console.log(`   🏫 학급: 1개 (${CLASS_CODE})`);
  console.log(`   📝 글쓰기: ${totalWritings}편`);
  console.log(`   📋 과제: ${assignments.length}개`);
  console.log(`   📊 학생통계: ${STUDENTS.length}건`);
  console.log(`\n🔐 로그인 정보:`);
  console.log(`   교사: ${TEACHER.email} / ${TEACHER.password}`);
  for (const s of STUDENTS) {
    console.log(`   학생 (${s.name}): ${s.email} / ${s.password}`);
  }
  console.log(`\n📱 학급 코드: ${CLASS_CODE}`);
  console.log(`\n🌐 사이트: https://isw-writing.web.app`);
  console.log();

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ 시딩 실패:", err);
  process.exit(1);
});
