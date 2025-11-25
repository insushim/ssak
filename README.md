# AI 글쓰기 도우미

완전한 학급 관리 시스템을 갖춘 AI 기반 글쓰기 학습 플랫폼

## 주요 기능

### 학생 기능
- 학년별 맞춤 글쓰기 주제 (100개 추천 주제)
- 실시간 글자 수 표시 및 피드백
- AI 기반 글쓰기 분석 및 평가
- 표절 감지 시스템 (50% 이상 자동 차단)
- 자동 저장 (30초마다)
- 무제한 재도전
- 개인 통계 및 점수 추이 그래프
- 학급 코드를 통한 학급 가입

### 선생님 기능
- 여러 학급 생성 및 관리
- 학급 코드 자동 생성
- 학생 관리 (최대 30명/학급)
- 학생 제출물 조회 및 분석
- AI 평가 결과 확인

### 슈퍼 관리자 기능
- 선생님 계정 승인/거절
- 전체 사용자 관리
- 시스템 통계 확인

## 기술 스택

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Others**: Framer Motion, React Confetti

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Super Admin UID (Firebase에서 첫 사용자 생성 후 입력)
VITE_SUPER_ADMIN_UID=your_super_admin_uid_here
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호 방식)
3. Firestore Database 생성
4. 프로젝트 설정에서 웹 앱 추가 후 설정 정보를 `.env`에 입력

### 4. Firestore Security Rules 설정

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Classes collection
    match /classes/{classCode} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Writings collection
    match /writings/{writingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Student stats collection
    match /studentStats/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. 슈퍼 관리자 계정 생성

1. Firebase Console의 Authentication에서 첫 번째 사용자를 수동으로 생성
2. 생성된 사용자의 UID를 복사
3. `.env` 파일의 `VITE_SUPER_ADMIN_UID`에 해당 UID 입력
4. Firestore의 `users` 컬렉션에 다음 문서 생성:
   - 문서 ID: 위에서 복사한 UID
   - 필드:
     ```json
     {
       "uid": "복사한_UID",
       "email": "관리자_이메일",
       "name": "관리자_이름",
       "role": "super_admin",
       "approved": true,
       "createdAt": "2024-01-01T00:00:00.000Z"
     }
     ```

### 6. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급
2. `.env` 파일의 `VITE_GEMINI_API_KEY`에 입력

### 7. 프로젝트 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 사용 방법

### 선생님

1. 회원가입 (역할: 선생님 선택)
2. 슈퍼 관리자 승인 대기
3. 승인 후 로그인
4. 학급 생성 (학급명, 학년, 설명 입력)
5. 생성된 학급 코드를 학생들에게 공유
6. 학생 제출물 확인 및 관리

### 학생

1. 회원가입 (역할: 학생, 학년 선택)
2. 로그인
3. 선생님께 받은 학급 코드로 학급 가입
4. 추천 주제 선택 또는 직접 입력
5. 글 작성 (실시간 글자 수 피드백)
6. 제출 (AI 자동 분석)
7. 기준 점수(70점) 미달 시 재도전
8. 통계 확인

## 주요 설정

- **학급당 최대 학생 수**: 30명
- **기준 점수**: 70점
- **표절 감지 임계값**: 50%
- **자동 저장 간격**: 30초
- **학년별 글자 수 기준**:
  - 초등 1학년: 50~150자 (권장 100자)
  - 초등 2학년: 100~200자 (권장 150자)
  - 초등 3학년: 150~350자 (권장 250자)
  - 초등 4학년: 200~500자 (권장 350자)
  - 초등 5학년: 300~700자 (권장 500자)
  - 초등 6학년: 400~800자 (권장 600자)
  - 중학교 1학년: 500~900자 (권장 700자)
  - 중학교 2학년: 600~1000자 (권장 800자)
  - 중학교 3학년: 700~1200자 (권장 900자)
  - 고등학교 1학년: 800~1500자 (권장 1000자)
  - 고등학교 2학년: 900~1800자 (권장 1200자)
  - 고등학교 3학년: 1000~2000자 (권장 1500자)

## AI 평가 기준

- **내용의 충실성** (30점): 주제에 맞는 내용, 깊이 있는 사고
- **구성의 논리성** (25점): 서론-본론-결론 구조, 논리적 전개
- **어휘 사용의 적절성** (20점): 학년 수준에 맞는 어휘, 다양한 표현
- **문법과 맞춤법** (15점): 정확한 문법, 맞춤법
- **창의성과 독창성** (10점): 참신한 아이디어, 독특한 관점

## 프로젝트 구조

```
ISW 글쓰기/
├── src/
│   ├── config/
│   │   ├── firebase.js          # Firebase 설정
│   │   └── auth.js              # 인증 및 권한 설정
│   ├── data/
│   │   └── recommendedTopics.js # 추천 주제 100개
│   ├── services/
│   │   ├── authService.js       # 인증 서비스
│   │   ├── classService.js      # 학급 관리 서비스
│   │   └── writingService.js    # 글쓰기 서비스
│   ├── utils/
│   │   ├── geminiAPI.js         # Gemini AI 연동
│   │   └── classCodeGenerator.js # 학급 코드 생성
│   ├── pages/
│   │   ├── Login.jsx            # 로그인 페이지
│   │   ├── Register.jsx         # 회원가입 페이지
│   │   ├── RoleSelection.jsx    # 역할 선택 페이지
│   │   ├── SuperAdminDashboard.jsx  # 슈퍼 관리자 대시보드
│   │   ├── TeacherDashboard.jsx     # 선생님 대시보드
│   │   └── StudentDashboard.jsx     # 학생 대시보드
│   ├── App.jsx                  # 메인 앱 컴포넌트
│   ├── main.jsx                 # 앱 진입점
│   └── index.css                # 글로벌 스타일
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env

## 문제 해결

### Firebase 연결 오류
- `.env` 파일의 Firebase 설정 정보 확인
- Firebase Console에서 웹 앱이 정상적으로 등록되었는지 확인

### Gemini API 오류
- API 키 유효성 확인
- API 사용량 제한 확인

### 슈퍼 관리자 로그인 불가
- `.env`의 `VITE_SUPER_ADMIN_UID`가 올바른지 확인
- Firestore의 users 컬렉션에 해당 UID 문서가 존재하는지 확인

## 라이선스

MIT License

## 개발자

ISW 글쓰기 팀
```

## 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.
