# 🚀 시작하기 - AI 글쓰기 도우미

환영합니다! 이 문서는 시스템을 빠르게 시작하는 방법을 안내합니다.

## ✅ 현재 상태

모든 코딩이 **완료**되었으며, API 키가 **설정**되었습니다!

### 설정된 항목
- ✅ Firebase 프로젝트: `isw-writing`
- ✅ Firebase API 키: 적용 완료
- ✅ Gemini API 키: 적용 완료
- ✅ 보안 설정: `.env` 파일 생성 및 `.gitignore` 적용
- ✅ 개발 서버: 실행 중 (`http://localhost:3000`)

### 아직 해야 할 것
- ⏳ 슈퍼 관리자 계정 생성
- ⏳ Firestore Security Rules 배포
- ⏳ 첫 로그인 및 테스트

## 📋 빠른 시작 (3단계)

### 1단계: 슈퍼 관리자 계정 생성 (5분)

#### 방법 A: Firebase Console 사용 (권장)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: **isw-writing**
3. **Authentication** → **Users** → **Add user**
4. 이메일과 비밀번호 입력
5. 생성된 **UID** 복사 (예: `abc123xyz789`)

6. `.env` 파일 열기 (프로젝트 루트)
7. 마지막 줄 수정:
   ```env
   VITE_SUPER_ADMIN_UID=복사한_UID
   ```
8. 저장 후 개발 서버 재시작 (Ctrl+C 후 `npm run dev`)

9. **Firestore Database** → **Start collection**
10. Collection ID: `users`
11. Document ID: 위에서 복사한 UID
12. 다음 필드 추가:
    ```
    uid: abc123xyz789 (string)
    email: admin@example.com (string)
    name: 관리자 (string)
    role: super_admin (string)
    approved: true (boolean)
    createdAt: 2024-11-25T00:00:00.000Z (string)
    ```

13. 완료!

**자세한 가이드**: `ADMIN_SETUP.md` 참조

### 2단계: Firestore Security Rules 배포 (2분)

#### 옵션 A: Firebase Console에서 수동 배포

1. [Firebase Console](https://console.firebase.google.com/) → **isw-writing**
2. **Firestore Database** → **Rules**
3. 프로젝트의 `firestore.rules` 파일 내용을 복사하여 붙여넣기
4. **게시** 클릭

#### 옵션 B: Firebase CLI 사용

```bash
# Firebase CLI 설치 (한 번만)
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화
firebase init

# Rules 배포
firebase deploy --only firestore:rules
```

### 3단계: 첫 로그인 및 테스트 (2분)

1. 브라우저에서 `http://localhost:3000` 접속
2. 1단계에서 생성한 이메일/비밀번호로 로그인
3. **슈퍼 관리자 대시보드**가 표시되면 성공! 🎉

## 📚 전체 가이드 목록

시스템을 완전히 이해하고 사용하려면 다음 문서를 참조하세요:

### 필수 문서
1. **START_HERE.md** ← 지금 보고 있는 문서
2. **ADMIN_SETUP.md** - 슈퍼 관리자 계정 생성
3. **QUICK_START.md** - 빠른 시작 가이드

### 상세 가이드
4. **README.md** - 프로젝트 전체 개요
5. **SETUP_GUIDE.md** - 상세 설치 가이드
6. **DEPLOYMENT_GUIDE.md** - 프로덕션 배포 가이드
7. **SECURITY_GUIDE.md** - 보안 설정 및 강화
8. **TEST_CHECKLIST.md** - 완전한 테스트 체크리스트
9. **PROJECT_SUMMARY.md** - 프로젝트 요약

## 🎯 다음 단계별 가이드

### 개발 환경에서 테스트

1. **슈퍼 관리자로 로그인** ✅
2. **선생님 계정 생성**
   - 새 브라우저 창(시크릿 모드)에서 회원가입
   - 역할: 선생님 선택
   - 슈퍼 관리자 대시보드에서 승인
3. **학급 생성**
   - 선생님으로 로그인
   - "새 학급 만들기" 클릭
   - 학급 코드 확인 (6자리)
4. **학생 계정으로 테스트**
   - 또 다른 브라우저 창에서 학생 회원가입
   - 학급 코드로 가입
   - 글쓰기 테스트

### 프로덕션 배포

1. **Firebase Hosting 배포**
   ```bash
   npm run build
   firebase deploy
   ```
2. **도메인 설정** (선택)
3. **API 키 제한 설정**
4. **모니터링 활성화**

**자세한 가이드**: `DEPLOYMENT_GUIDE.md` 참조

## 🔍 시스템 구조 이해하기

### 역할 3가지
1. **슈퍼 관리자** - 선생님 승인, 전체 관리
2. **선생님** - 학급 생성 및 관리
3. **학생** - 글쓰기 학습

### 주요 기능
- ✅ 100개 추천 주제 (학년별)
- ✅ AI 기반 글쓰기 분석 (Gemini)
- ✅ 표절 검사 (50% 이상 차단)
- ✅ 자동 저장 (30초마다)
- ✅ 실시간 글자 수 피드백
- ✅ 학년별 적정 분량 기준
- ✅ 통계 및 차트
- ✅ 무제한 재도전

### 기술 스택
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Gemini API
- **Charts**: Recharts

## ⚠️ 중요 보안 사항

### 절대 하지 말아야 할 것
- ❌ `.env` 파일을 Git에 커밋
- ❌ API 키를 공개 저장소에 공유
- ❌ 슈퍼 관리자 비밀번호 공유
- ❌ 프로덕션에서 API 키 제한 없이 사용

### 반드시 해야 할 것
- ✅ 강력한 비밀번호 사용
- ✅ Firestore Security Rules 배포
- ✅ API 키 제한 설정 (프로덕션)
- ✅ 정기적인 보안 업데이트

**자세한 가이드**: `SECURITY_GUIDE.md` 참조

## 🐛 문제 해결

### 자주 발생하는 문제

#### 1. "승인 대기 중" 메시지
- **원인**: Firestore 문서 누락 또는 `approved: false`
- **해결**: `ADMIN_SETUP.md` 1단계 재확인

#### 2. "Firebase configuration error"
- **원인**: `.env` 파일 설정 오류
- **해결**: `.env` 파일의 모든 값 재확인

#### 3. AI 분석 실패
- **원인**: Gemini API 키 오류
- **해결**: `.env`의 `VITE_GEMINI_API_KEY` 확인

#### 4. 학급 가입 실패
- **원인**: Firestore Rules 미배포
- **해결**: 2단계(Firestore Rules 배포) 실행

### 더 많은 문제 해결
- `TEST_CHECKLIST.md` - 전체 테스트 목록
- `SETUP_GUIDE.md` - 상세 문제 해결

## 📞 지원

### 문서
- GitHub Repository
- Firebase 공식 문서
- React 공식 문서

### 커뮤니티
- GitHub Issues
- Stack Overflow
- Firebase Community

## 🎉 성공 체크리스트

시스템이 제대로 작동하는지 확인:

### 기본 기능
- [ ] 슈퍼 관리자로 로그인 성공
- [ ] 선생님 계정 생성 및 승인
- [ ] 학급 생성 및 코드 확인
- [ ] 학생 계정으로 학급 가입
- [ ] 글 작성 및 제출
- [ ] AI 분석 결과 확인
- [ ] 통계 페이지 확인

### 보안
- [ ] `.env` 파일이 Git에 추적되지 않음
- [ ] Firestore Security Rules 배포됨
- [ ] 강력한 비밀번호 사용

### 성능
- [ ] 페이지 로딩 < 3초
- [ ] 실시간 글자 수 표시 작동
- [ ] 자동 저장 작동 (30초)

모든 항목이 체크되면 시스템이 완벽하게 작동하는 것입니다! 🎊

## 📈 다음 단계

시스템이 정상 작동하면:

1. **더 많은 테스트**
   - `TEST_CHECKLIST.md`의 모든 항목 테스트
   - 여러 역할로 동시 테스트
   - 다양한 브라우저에서 테스트

2. **커스터마이징**
   - 추천 주제 수정 (`src/data/recommendedTopics.js`)
   - UI 색상 변경 (Tailwind CSS)
   - 점수 기준 조정 (`src/config/auth.js`)

3. **프로덕션 배포**
   - `DEPLOYMENT_GUIDE.md` 참조
   - Firebase Hosting에 배포
   - 커스텀 도메인 설정

4. **모니터링 설정**
   - Firebase Analytics
   - Performance Monitoring
   - Error Tracking

## 🎁 보너스 팁

### 개발 효율성
```bash
# 의존성 업데이트
npm update

# 보안 취약점 확인
npm audit

# 코드 포맷팅 (Prettier 설치 시)
npm run format
```

### 유용한 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# Firebase 배포
firebase deploy
```

### Chrome DevTools 팁
- **F12**: 개발자 도구 열기
- **Application** 탭: Firebase 데이터 확인
- **Console** 탭: 에러 로그 확인
- **Network** 탭: API 호출 모니터링

---

## 🚀 지금 바로 시작하세요!

1. ✅ 개발 서버 실행 중: `http://localhost:3000`
2. ⏳ 슈퍼 관리자 계정 생성 → `ADMIN_SETUP.md`
3. ⏳ Firestore Rules 배포
4. 🎉 첫 로그인 및 테스트

**질문이 있으신가요?** 위의 문서들을 참조하거나 GitHub Issues에 문의하세요!

---

**행운을 빕니다! 멋진 AI 글쓰기 도우미 시스템을 만들어보세요!** ✨
