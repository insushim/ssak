# 빠른 시작 가이드

이 가이드는 AI 글쓰기 도우미를 5분 안에 실행할 수 있도록 도와줍니다.

## 1단계: 의존성 설치 (1분)

```bash
npm install
```

## 2단계: Firebase 설정 (2분)

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. 웹 앱 추가 후 설정 정보 복사
3. Authentication 활성화 (이메일/비밀번호)
4. Firestore Database 생성

## 3단계: 환경 변수 설정 (1분)

`.env` 파일 생성:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPER_ADMIN_UID=your_admin_uid
```

## 4단계: 슈퍼 관리자 생성 (1분)

1. Firebase Authentication에서 첫 사용자 생성
2. UID 복사하여 `.env`의 `VITE_SUPER_ADMIN_UID`에 입력
3. Firestore에 users 컬렉션 생성 후 해당 UID로 문서 추가:

```json
{
  "uid": "복사한_UID",
  "email": "admin@example.com",
  "name": "관리자",
  "role": "super_admin",
  "approved": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 5단계: 실행! (즉시)

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 다음 단계

1. 슈퍼 관리자로 로그인
2. 선생님 계정 생성 및 승인
3. 학급 생성
4. 학생 계정으로 학급 가입
5. 글쓰기 시작!

## 문제 해결

### Firebase 오류
- `.env` 파일 설정 확인
- 개발 서버 재시작

### Gemini API 오류
- [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급
- `.env`에 올바르게 입력했는지 확인

### 더 자세한 가이드
- `SETUP_GUIDE.md` 참조
- `TEST_CHECKLIST.md` 참조

## 주요 기능

### 학생
- 100개 추천 주제
- 실시간 글자 수 피드백
- AI 분석 및 평가
- 표절 검사 (50% 이상 차단)
- 자동 저장 (30초)
- 무제한 재도전

### 선생님
- 여러 학급 관리
- 학급 코드 자동 생성
- 학생 제출물 확인
- AI 평가 결과 조회

### 슈퍼 관리자
- 선생님 승인/거절
- 전체 사용자 관리

## 기술 스택

- React 18
- Firebase (Auth + Firestore)
- Google Gemini AI
- Tailwind CSS
- Recharts

즐거운 글쓰기 되세요! ✍️
