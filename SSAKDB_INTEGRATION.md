# 싹DB → iswssak SaaS 이식 가이드

## 개요

싹DB(글쓰기 평가 지식베이스)를 iswssak SaaS에 이식하여 AI 평가 정확도를 향상시킵니다.

### 싹DB 구성
- **평가 루브릭**: 620개 (학령대×장르×영역)
- **우수작 예시**: 366개 (학령대×장르×수준)
- **첨삭 패턴**: 41개 (영역별 피드백 템플릿)
- **글쓰기 주제**: 53개 (학령대×장르)
- **글쓰기 이론**: 12개
- **AI 판별 기준**: 8개
- **총 1,117개** 마크다운 파일

---

## 1단계: Firebase 서비스 계정 키 발급

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 → 설정(톱니바퀴) → 프로젝트 설정
3. **서비스 계정** 탭 클릭
4. **새 비공개 키 생성** 버튼 클릭
5. 다운로드된 JSON 파일을 `C:\iswssak\scripts\serviceAccountKey.json`에 저장

---

## 2단계: 싹DB Firestore 업로드

```bash
# iswssak 프로젝트 폴더로 이동
cd C:\iswssak

# 필요한 패키지 설치
npm install firebase-admin

# 업로드 스크립트 실행
node scripts/upload-ssakdb.js
```

### 예상 결과
```
🌱 싹DB → Firestore 업로드 시작...

📂 마크다운 파일 검색 중...
  발견된 파일: 1117개

📄 파일 파싱 중...
  파싱 완료!

📊 컬렉션별 문서 수:
  - rubrics: 620개
  - examples: 366개
  - feedbackPatterns: 41개
  - topics: 53개
  - writingTheory: 12개
  - aiDetection: 8개
  - learningPaths: 7개
  - system: 6개
  - metadata: 3개
  - evaluationTools: 1개

🚀 Firestore 업로드 시작...
  업로드: 500/1117
  업로드: 1000/1117
  업로드: 1117/1117

✅ 업로드 완료!
📊 총 1117개 문서 업로드됨

🎉 모든 작업 완료!
```

---

## 3단계: Cloud Functions 배포

```bash
cd C:\iswssak\functions

# 패키지 설치
npm install

# Functions 배포
firebase deploy --only functions
```

---

## 4단계: 동작 확인

싹DB가 정상적으로 연동되면, 글쓰기 평가 시 다음 로그가 표시됩니다:

```
[싹DB] 루브릭 로드: 초등학교 1-2학년 일기
[싹DB] 예시 로드: 초등학교 일기 (high)
[싹DB] 컨텍스트 로드 성공 (2300자)
```

---

## Firestore 컬렉션 구조

### rubrics (평가 루브릭)
```javascript
{
  id: "elem_1_2_일기_종합",
  title: "초등 1-2학년 일기 총괄 평가 루브릭",
  education_level: "초등학교",
  grade: "1-2학년",
  genre: "일기",
  domain: "종합",
  content: "루브릭 본문...",
  tags: ["루브릭", "초등학교", "1-2학년", "일기"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### examples (우수작 예시)
```javascript
{
  id: "elem_일기_high",
  title: "초등1-2 일기 우수작 예시 (상)",
  education_level: "초등",
  genre: "일기",
  level: "high",  // high, mid, low
  content: "예시 글 본문...",
  createdAt: Timestamp
}
```

### feedbackPatterns (첨삭 패턴)
```javascript
{
  id: "content_주제이탈",
  domain: "내용",
  patternType: "주제이탈",
  content: "패턴 설명 및 피드백 템플릿...",
  createdAt: Timestamp
}
```

### ssakdb_meta (메타 정보)
```javascript
{
  id: "stats",
  totalDocuments: 1117,
  collections: {
    rubrics: 620,
    examples: 366,
    feedbackPatterns: 41,
    ...
  },
  lastUpdated: Timestamp,
  version: "1.0.0"
}
```

---

## 프론트엔드에서 싹DB 사용

### 루브릭 검색
```javascript
import { getRubric, getAllRubrics } from '../services/ssakDBService';

// 특정 루브릭 가져오기
const rubric = await getRubric(grade, '일기', '종합');

// 모든 영역 루브릭 가져오기
const rubrics = await getAllRubrics(grade, '논설문');
// { total, content, organization, expression, mechanics }
```

### 우수작 예시 검색
```javascript
import { getExample, getAllExamples } from '../services/ssakDBService';

// 상위 예시 가져오기
const example = await getExample(grade, '일기', 'high');

// 모든 수준 예시 가져오기
const examples = await getAllExamples(grade, '논설문');
// { high, mid, low }
```

### 평가 컨텍스트 통합 검색
```javascript
import { getEvaluationContext, buildPromptContext } from '../services/ssakDBService';

// 평가에 필요한 모든 데이터 한번에 가져오기
const context = await getEvaluationContext(grade, '자유글쓰기');
// { rubrics, examples, feedbackPatterns, ... }

// 프롬프트용 문자열 생성
const promptContext = buildPromptContext(context);
```

---

## 학년 → 학령대 매핑

| 학년 (grade) | gradeLevel | educationLevel | gradeGroup |
|-------------|------------|----------------|------------|
| 1-2 | elementary_1_2 | 초등학교 | 1-2학년 |
| 3-4 | elementary_3_4 | 초등학교 | 3-4학년 |
| 5-6 | elementary_5_6 | 초등학교 | 5-6학년 |
| 7-9 | middle | 중학교 | 1-3학년 |
| 10-12 | high | 고등학교 | 1-3학년 |

---

## 글쓰기 유형 → 장르 매핑

| 글쓰기 유형 | 초등 저학년 | 초등 고학년 | 중고등 |
|------------|-----------|-----------|--------|
| 자유글쓰기 | 일기 | 생활문 | 수필 |
| 주제글쓰기 | 생활문 | 설명문 | 논설문 |
| 독후감 | 독후감 | 독후감 | 독서감상문 |

---

## 캐싱 전략

### 서버 사이드 (Cloud Functions)
- 루브릭/예시 캐시: 1시간 TTL
- 메모리 캐시 (Map) 사용
- 캐시 히트 시 Firestore 읽기 0회

### 클라이언트 사이드
- 루브릭/예시 캐시: 24시간 TTL
- Map + localStorage 이중 캐시
- 앱 시작 시 localStorage에서 복원

---

## 비용 영향

| 항목 | 변경 전 | 변경 후 | 비고 |
|------|--------|---------|------|
| Firestore 읽기 | - | +1-2회/평가 | 캐시로 최소화 |
| Firestore 저장 | - | +3MB | 1회성 |
| Gemini 토큰 | 500토큰 | 700-900토큰 | 컨텍스트 추가 |
| **예상 비용 증가** | - | **+$5-10/월** | 1만회 평가 기준 |

---

## 트러블슈팅

### 싹DB 로드 실패 시
```
[싹DB] 컨텍스트 로드 실패 (기본 평가 사용)
```
→ 싹DB 없이도 기존 6+1 Trait 평가가 정상 동작합니다.

### 루브릭을 찾을 수 없을 때
- 해당 장르가 없으면 자동으로 '일기' 장르로 폴백
- 학령대가 없으면 '초등학교 3-4학년'으로 폴백

### 캐시 강제 초기화
```javascript
import { clearSsakCache } from '../services/ssakDBService';
clearSsakCache();
```

---

## 버전 정보

- 싹DB 버전: 1.0.0
- 생성일: 2025-01-18
- 총 문서: 1,117개
