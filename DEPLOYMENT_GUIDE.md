# 배포 가이드

이 가이드는 AI 글쓰기 도우미를 Firebase Hosting에 배포하는 방법을 설명합니다.

## 사전 준비

- [x] Firebase 프로젝트 생성 완료 (`isw-writing`)
- [x] API 키 설정 완료
- [x] 로컬 테스트 완료
- [ ] Firebase CLI 설치

## 단계 1: Firebase CLI 설치

### Windows
```bash
npm install -g firebase-tools
```

### 설치 확인
```bash
firebase --version
```

## 단계 2: Firebase 로그인

```bash
firebase login
```

브라우저가 열리면 Google 계정으로 로그인

## 단계 3: Firebase 프로젝트 초기화

프로젝트 디렉토리에서:

```bash
firebase init
```

### 선택 항목:

1. **Which Firebase features do you want to set up?**
   - [x] Firestore
   - [x] Hosting

2. **Please select an option:**
   - [x] Use an existing project
   - 프로젝트 선택: `isw-writing`

3. **Firestore Rules**
   - What file should be used for Firestore Rules? → `firestore.rules` (Enter)
   - File already exists. Overwrite? → No

4. **Firestore Indexes**
   - What file should be used for Firestore indexes? → `firestore.indexes.json` (Enter)
   - File already exists. Overwrite? → No

5. **Hosting Setup**
   - What do you want to use as your public directory? → `dist`
   - Configure as a single-page app? → Yes
   - Set up automatic builds and deploys with GitHub? → No
   - File dist/index.html already exists. Overwrite? → No

## 단계 4: Firestore Security Rules 및 Indexes 배포

```bash
firebase deploy --only firestore
```

이 명령어는:
- Firestore Security Rules 배포
- Firestore Indexes 생성

## 단계 5: 프로덕션 빌드

```bash
npm run build
```

빌드 결과는 `dist` 폴더에 생성됩니다.

### 빌드 검증

```bash
npm run preview
```

`http://localhost:4173`에서 프로덕션 빌드 미리보기

## 단계 6: Firebase Hosting 배포

```bash
firebase deploy --only hosting
```

배포 완료 후 다음 URL에서 접속 가능:
- `https://isw-writing.web.app`
- `https://isw-writing.firebaseapp.com`

## 단계 7: 커스텀 도메인 설정 (선택사항)

### 7.1 Firebase Console에서 도메인 추가

1. Firebase Console → Hosting
2. "Add custom domain" 클릭
3. 도메인 입력 (예: `writing.yourdomain.com`)

### 7.2 DNS 레코드 설정

도메인 제공업체 (가비아, 카페24 등)에서:

```
Type: A
Name: writing (또는 @)
Value: Firebase가 제공한 IP 주소
```

### 7.3 SSL 인증서

Firebase가 자동으로 무료 SSL 인증서 발급 (Let's Encrypt)

## 단계 8: 환경 변수 관리

### 개발 환경
`.env` 파일 사용 (이미 설정됨)

### 프로덕션 환경

**옵션 1: Firebase Hosting 환경 변수** (권장)

Firebase Hosting 설정에서 환경 변수는 빌드 시점에 포함되므로, 현재 방식 유지.

**옵션 2: Cloud Functions 사용** (더 안전)

```bash
firebase functions:config:set gemini.key="YOUR_GEMINI_KEY"
```

## 단계 9: Firebase API 키 보안 설정

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택: `isw-writing`
3. API 및 서비스 → 사용자 인증 정보
4. Firebase API 키 편집

#### HTTP 리퍼러 제한 추가:
```
https://isw-writing.web.app/*
https://isw-writing.firebaseapp.com/*
https://your-custom-domain.com/*
```

## 단계 10: Firestore Security Rules 검증

### Firebase Console에서 Rules Playground 사용

1. Firestore Database → Rules
2. "Rules Playground" 탭
3. 다양한 시나리오 테스트

### 예제 테스트:

**테스트 1: 비인증 사용자**
```
Operation: get
Location: /users/test123
Auth: Unauthenticated
결과: Denied ✅
```

**테스트 2: 학생이 자신의 글 수정**
```
Operation: update
Location: /writings/student123_12345
Auth: student123
결과: Allowed ✅
```

## 단계 11: 배포 후 체크리스트

### 기능 테스트
- [ ] 회원가입 작동
- [ ] 로그인 작동
- [ ] 슈퍼 관리자 기능 작동
- [ ] 선생님 승인 시스템 작동
- [ ] 학급 생성 작동
- [ ] 학생 글쓰기 작동
- [ ] AI 분석 작동
- [ ] 표절 검사 작동

### 성능 테스트
- [ ] 페이지 로딩 속도 < 3초
- [ ] Lighthouse 점수 > 90
- [ ] 모바일 반응형 확인

### 보안 테스트
- [ ] Firestore Rules 적용 확인
- [ ] API 키 제한 작동 확인
- [ ] HTTPS 강제 적용 확인

## 단계 12: 모니터링 설정

### Firebase Analytics

1. Firebase Console → Analytics
2. "Get started" 클릭
3. 자동으로 추적 시작

### Performance Monitoring

`src/config/firebase.js`에 추가:

```javascript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

## 자동 배포 (CI/CD) 설정

### GitHub Actions

`.github/workflows/deploy.yml` 생성:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
          VITE_SUPER_ADMIN_UID: ${{ secrets.VITE_SUPER_ADMIN_UID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: isw-writing
```

### GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions

다음 Secrets 추가:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GEMINI_API_KEY`
- `VITE_SUPER_ADMIN_UID`
- `FIREBASE_SERVICE_ACCOUNT`

## 롤백 (이전 버전으로 되돌리기)

```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live
```

또는 Firebase Console에서:
1. Hosting → Release history
2. 이전 버전 선택
3. "Restore" 클릭

## 유지보수

### 정기 업데이트
```bash
# 의존성 업데이트
npm update

# 보안 취약점 확인
npm audit

# 취약점 수정
npm audit fix
```

### 로그 모니터링
```bash
firebase functions:log
```

### 사용량 모니터링

Firebase Console → Usage and billing

## 비용 관리

### 무료 할당량 (Spark Plan)

- **Firestore**:
  - 저장용량: 1GB
  - 문서 읽기: 50,000/일
  - 문서 쓰기: 20,000/일
  - 문서 삭제: 20,000/일

- **Hosting**:
  - 저장용량: 10GB
  - 전송량: 360MB/일

- **Authentication**:
  - 무제한 (전화 인증 제외)

### Blaze Plan (종량제)

사용량이 증가하면 Blaze Plan으로 업그레이드 권장

### 비용 알림 설정

1. Firebase Console → Project settings → Billing
2. "Set a budget" 클릭
3. 월 예산 설정 (예: $10)
4. 알림 임계값 설정 (예: 50%, 90%)

## 문제 해결

### 배포 실패

```bash
# 캐시 삭제
firebase hosting:channel:delete CHANNEL_ID

# 재배포
firebase deploy --only hosting
```

### Firestore Rules 오류

```bash
# Rules 테스트
firebase deploy --only firestore:rules --dry-run

# Rules 배포
firebase deploy --only firestore:rules
```

### 빌드 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 빌드
npm run build
```

## 성능 최적화

### 이미지 최적화

모든 이미지를 WebP 형식으로 변환

### Code Splitting

주요 페이지를 lazy loading:

```javascript
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
```

### CDN 활용

Firebase Hosting은 자동으로 CDN 사용

### 캐싱 전략

`firebase.json`에 이미 설정됨 (1년 캐싱)

## 보안 업데이트

### 정기 보안 점검

- 월 1회: npm audit 실행
- 분기 1회: 전체 보안 감사
- 연 1회: 침투 테스트

## 백업 전략

### Firestore 자동 백업

1. Google Cloud Console → Firestore
2. Import/Export
3. 자동 백업 스케줄 설정

### 코드 백업

GitHub에 자동 백업됨

## 다음 단계

1. [ ] 커스텀 도메인 설정
2. [ ] CI/CD 파이프라인 구축
3. [ ] 모니터링 대시보드 설정
4. [ ] 백업 자동화
5. [ ] 성능 최적화

---

## 빠른 배포 명령어 요약

```bash
# 1. 빌드
npm run build

# 2. Firestore Rules 배포
firebase deploy --only firestore

# 3. 호스팅 배포
firebase deploy --only hosting

# 또는 한 번에
firebase deploy
```

배포 URL: `https://isw-writing.web.app`

축하합니다! 🎉 시스템이 성공적으로 배포되었습니다!
