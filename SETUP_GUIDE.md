# 완전한 설치 가이드

이 가이드를 따라하면 AI 글쓰기 도우미 시스템을 완벽하게 설정할 수 있습니다.

## 단계 1: Firebase 프로젝트 생성 및 설정

### 1.1 Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "ai-writing-assistant")
4. Google 애널리틱스 설정 (선택사항)
5. 프로젝트 생성 완료

### 1.2 웹 앱 추가

1. 프로젝트 개요 페이지에서 웹 아이콘(</>) 클릭
2. 앱 닉네임 입력 (예: "AI Writing Assistant Web")
3. "앱 등록" 클릭
4. Firebase SDK 구성 정보가 표시됨 - 이 정보를 복사해두세요

### 1.3 Authentication 설정

1. 좌측 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭 선택
4. "이메일/비밀번호" 활성화
5. "저장" 클릭

### 1.4 Firestore Database 생성

1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "프로덕션 모드에서 시작" 선택
4. 리전 선택 (asia-northeast3 추천 - 한국)
5. "사용 설정" 클릭

### 1.5 Security Rules 설정

Firestore Database에서 "규칙" 탭으로 이동하여 다음 규칙을 입력:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }

    // Classes collection
    match /classes/{classCode} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      allow update, delete: if request.auth != null &&
                                resource.data.teacherId == request.auth.uid;
    }

    // Writings collection
    match /writings/{writingId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null &&
                               request.resource.data.studentId == request.auth.uid;
      allow delete: if request.auth != null &&
                       (resource.data.studentId == request.auth.uid ||
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' ||
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin');
    }

    // Student stats collection
    match /studentStats/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

"게시" 버튼을 클릭하여 규칙 적용

## 단계 2: Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. "Create API Key" 클릭
3. 프로젝트 선택 또는 새 프로젝트 생성
4. API 키 복사

## 단계 3: 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일 생성:

```env
# Firebase Configuration (1.2에서 복사한 정보)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Gemini API Configuration (단계 2에서 복사한 키)
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Super Admin UID (단계 4에서 설정)
VITE_SUPER_ADMIN_UID=
```

**중요**: `.env` 파일은 `.gitignore`에 포함되어 있으므로 Git에 커밋되지 않습니다.

## 단계 4: 슈퍼 관리자 계정 생성

### 4.1 첫 번째 사용자 생성

1. Firebase Console의 Authentication 페이지로 이동
2. "사용자 추가" 클릭
3. 이메일과 비밀번호 입력 (예: admin@example.com / password123)
4. "사용자 추가" 클릭
5. 생성된 사용자의 **UID**를 복사 (예: `abc123def456ghi789`)

### 4.2 환경 변수 업데이트

`.env` 파일의 `VITE_SUPER_ADMIN_UID`에 복사한 UID 입력:

```env
VITE_SUPER_ADMIN_UID=abc123def456ghi789
```

### 4.3 Firestore 문서 생성

1. Firestore Database로 이동
2. "컬렉션 시작" 클릭
3. 컬렉션 ID: `users`
4. 첫 번째 문서:
   - 문서 ID: 위에서 복사한 UID 입력
   - 필드 추가:
     ```
     uid (string): abc123def456ghi789
     email (string): admin@example.com
     name (string): 관리자
     role (string): super_admin
     approved (boolean): true
     createdAt (string): 2024-01-01T00:00:00.000Z
     ```
5. "저장" 클릭

## 단계 5: 프로젝트 실행

### 5.1 의존성 설치

```bash
npm install
```

### 5.2 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 단계 6: 시스템 테스트

### 6.1 슈퍼 관리자 로그인 테스트

1. 로그인 페이지에서 4.1에서 생성한 계정으로 로그인
2. 슈퍼 관리자 대시보드가 표시되는지 확인

### 6.2 선생님 계정 생성 및 승인 테스트

1. 새 브라우저 창(시크릿 모드)에서 회원가입
2. 역할: "선생님" 선택
3. 회원가입 완료 후 승인 대기 메시지 확인
4. 슈퍼 관리자 계정으로 돌아가 승인 처리
5. 선생님 계정으로 재로그인하여 대시보드 접근 확인

### 6.3 학급 생성 테스트

1. 선생님 계정으로 로그인
2. "새 학급 만들기" 클릭
3. 학급 정보 입력 후 생성
4. 학급 코드 확인 (6자리 영문+숫자)

### 6.4 학생 계정 테스트

1. 새 브라우저 창에서 학생 계정 회원가입
2. 학년 선택 (예: 초등학교 3학년)
3. 로그인 후 학급 코드 입력하여 가입
4. 추천 주제 선택
5. 글 작성 (자동 저장 기능 확인)
6. 제출 전 글자 수 피드백 확인
7. 제출 후 AI 분석 결과 확인

### 6.5 표절 검사 테스트

1. 학생 계정으로 동일한 주제로 두 번째 글 작성
2. 이전 글과 유사한 내용(50% 이상) 작성
3. 제출 시 표절 감지 메시지 확인

### 6.6 통계 확인 테스트

1. 학생 대시보드의 "통계" 탭 확인
2. 점수 추이 그래프 확인
3. 평균 점수 등 통계 확인

## 단계 7: 프로덕션 배포 (선택사항)

### 7.1 빌드

```bash
npm run build
```

### 7.2 Firebase Hosting 설정 (추천)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# dist 폴더를 public directory로 선택
firebase deploy
```

## 문제 해결

### 문제 1: Firebase 연결 오류

**증상**: 앱이 로드되지 않거나 "Firebase configuration error" 메시지

**해결**:
1. `.env` 파일의 모든 Firebase 설정 값 재확인
2. `VITE_` 접두사가 올바르게 붙어있는지 확인
3. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 문제 2: Gemini API 오류

**증상**: 글 제출 시 "분석 실패" 메시지

**해결**:
1. Gemini API 키 유효성 확인
2. [Google AI Studio](https://makersuite.google.com/)에서 API 사용량 확인
3. API 키 재생성 후 `.env` 업데이트

### 문제 3: 슈퍼 관리자 로그인 불가

**증상**: 관리자 계정 로그인 시 승인 대기 화면

**해결**:
1. `.env`의 `VITE_SUPER_ADMIN_UID` 확인
2. Firestore의 users 컬렉션에서 해당 UID 문서 확인
3. 문서의 `role` 필드가 `super_admin`인지 확인
4. `approved` 필드가 `true`인지 확인

### 문제 4: 학급 가입 오류

**증상**: "학급 정원 초과" 또는 "존재하지 않는 학급 코드"

**해결**:
1. 학급 코드 정확히 입력했는지 확인 (대소문자 구분 없음)
2. Firestore의 classes 컬렉션에서 해당 학급 확인
3. 학생 수가 30명 미만인지 확인

### 문제 5: 자동 저장 작동 안함

**증상**: 글 작성 중 새로고침 시 내용 사라짐

**해결**:
1. 브라우저 콘솔에서 "자동 저장 완료" 로그 확인
2. 30초 이상 대기 후 테스트
3. 주제가 선택되어 있는지 확인

## 추가 설정

### 이메일 인증 활성화 (선택)

Firebase Console > Authentication > Templates에서 이메일 템플릿 커스터마이징 가능

### 데이터 백업 설정

Firebase Console > Firestore Database > 백업에서 자동 백업 설정 권장

### 모니터링 설정

Firebase Console > Performance에서 성능 모니터링 활성화 가능

## 지원

문제가 계속되면 다음을 확인하세요:

1. Node.js 버전: v18 이상 권장
2. npm 버전: v9 이상 권장
3. 브라우저: Chrome, Firefox, Edge 최신 버전

## 다음 단계

시스템이 정상적으로 작동하면:

1. 실제 선생님 계정을 생성하여 승인
2. 학급을 만들고 학생들을 초대
3. 추천 주제를 커스터마이징 (`src/data/recommendedTopics.js`)
4. UI 색상 및 스타일 조정 (Tailwind CSS)
5. 점수 기준 조정 (`src/config/auth.js`)

축하합니다! AI 글쓰기 도우미 시스템이 완전히 설정되었습니다.
