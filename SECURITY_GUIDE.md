# 보안 설정 가이드

이 문서는 AI 글쓰기 도우미 시스템의 보안을 강화하는 방법을 설명합니다.

## ✅ 이미 적용된 보안 조치

### 1. 환경 변수 보호
- [x] `.env` 파일에 모든 민감 정보 저장
- [x] `.gitignore`에 `.env` 파일 포함 (Git 추적 제외)
- [x] API 키가 소스 코드에 하드코딩되지 않음

### 2. Firestore Security Rules
- [x] 역할 기반 접근 제어 (RBAC)
- [x] 인증된 사용자만 데이터 접근 가능
- [x] 학생은 자신의 데이터만 수정 가능
- [x] 선생님은 자신의 학급만 관리 가능
- [x] 슈퍼 관리자는 전체 접근 가능

### 3. Firebase 호스팅 보안 헤더
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY (클릭재킹 방지)
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: 불필요한 권한 차단

### 4. 입력 검증
- [x] 이메일 형식 검증
- [x] 비밀번호 길이 검증 (최소 6자)
- [x] 학급 코드 형식 검증
- [x] 글자 수 범위 검증

## 🔒 Firebase Console에서 추가 보안 설정

### 단계 1: API 키 제한 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택: `isw-writing`
3. 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
4. Firebase API 키 찾기: `AIzaSyA6qDbJR5taBJvrpFNFE8_eIL1v9e9joGM`
5. "키 제한사항" 섹션에서 다음 설정:

#### 애플리케이션 제한사항
```
HTTP 리퍼러(웹사이트)
- http://localhost:3000/*
- https://your-domain.com/*
- https://isw-writing.web.app/*
- https://isw-writing.firebaseapp.com/*
```

#### API 제한사항
다음 API만 허용:
- Firebase Authentication API
- Cloud Firestore API
- Firebase Management API

### 단계 2: Gemini API 키 제한

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 선택: `AIzaSyDKslMDXo5JVja3EsdOOJozeyzphvIMPRs`
3. "Edit API key" 클릭
4. 다음 제한사항 설정:

#### 웹사이트 제한
```
- http://localhost:3000
- https://your-domain.com
- https://isw-writing.web.app
- https://isw-writing.firebaseapp.com
```

**⚠️ 중요**: Gemini API는 클라이언트에서 직접 호출되므로, 프로덕션 환경에서는 Cloud Functions를 통한 서버 사이드 호출로 변경하는 것을 권장합니다.

### 단계 3: Firebase Authentication 보안 설정

1. Firebase Console → Authentication → Settings
2. 다음 설정 활성화:

#### 이메일 열거 보호
- [x] "Prevent email enumeration in password account creation, sign-in, and password reset flows" 활성화

#### 비밀번호 정책
```
- 최소 길이: 8자 이상으로 변경 (권장)
- 대소문자, 숫자, 특수문자 포함 (권장)
```

#### 승인된 도메인 추가
```
- localhost (개발용)
- your-production-domain.com
- isw-writing.web.app
- isw-writing.firebaseapp.com
```

### 단계 4: Firestore Security Rules 배포

현재 프로젝트에 이미 `firestore.rules` 파일이 있습니다.

Firebase Console에서 수동 배포:
1. Firebase Console → Firestore Database → Rules
2. `firestore.rules` 파일의 내용을 복사하여 붙여넣기
3. "게시" 클릭

또는 Firebase CLI로 배포:
```bash
firebase deploy --only firestore:rules
```

### 단계 5: Firestore 인덱스 생성

```bash
firebase deploy --only firestore:indexes
```

또는 Firebase Console에서:
1. Firestore Database → Indexes
2. `firestore.indexes.json` 파일의 내용에 따라 수동으로 생성

## 🛡️ 추가 보안 강화 조치 (권장)

### 1. Cloud Functions로 Gemini API 호출 이동

**현재 문제**: Gemini API 키가 클라이언트에 노출됨

**해결 방법**:

`functions/index.js` 생성:
```javascript
const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

exports.analyzeWriting = functions.https.onCall(async (data, context) => {
  // 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  // 학생인지 확인
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  if (userDoc.data().role !== 'student') {
    throw new functions.https.HttpsError('permission-denied', '권한이 없습니다.');
  }

  const { text, gradeLevel, topic } = data;

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `당신은 학생 글쓰기를 평가하는 전문 교사입니다...`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return { analysis: response.text() };
});
```

클라이언트에서 호출:
```javascript
const analyzeWriting = httpsCallable(functions, 'analyzeWriting');
const result = await analyzeWriting({ text, gradeLevel, topic });
```

### 2. Rate Limiting 설정

Firebase App Check 활성화:
```bash
firebase init appcheck
```

App Check 설정:
1. Firebase Console → App Check
2. reCAPTCHA v3 또는 reCAPTCHA Enterprise 활성화
3. 강제 모드 활성화

### 3. 사용자 입력 검증 및 살균

현재 구현에서 개선:

```javascript
// XSS 방지를 위한 입력 살균
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// 사용 예
const sanitizedContent = sanitizeInput(userInput);
```

### 4. CORS 설정

`firebase.json`에 이미 포함되어 있지만, Cloud Functions 사용 시 추가:

```javascript
exports.analyzeWriting = functions
  .runWith({
    cors: ['https://your-domain.com']
  })
  .https.onCall(async (data, context) => {
    // ...
  });
```

### 5. 로깅 및 모니터링

Firebase Console에서 활성화:
1. Analytics → 활성화
2. Performance Monitoring → 활성화
3. Crashlytics → 활성화 (모바일 앱)

추가 로깅:
```javascript
// src/utils/logger.js
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

export const logSecurityEvent = (eventName, params) => {
  logEvent(analytics, eventName, {
    ...params,
    timestamp: new Date().toISOString()
  });
};

// 사용 예
logSecurityEvent('suspicious_activity', {
  userId: user.uid,
  activity: 'multiple_failed_logins'
});
```

### 6. 비밀번호 정책 강화

`src/pages/Register.jsx`에서 개선:

```javascript
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }
  if (!hasUpperCase || !hasLowerCase) {
    return '비밀번호는 대문자와 소문자를 포함해야 합니다.';
  }
  if (!hasNumber) {
    return '비밀번호는 숫자를 포함해야 합니다.';
  }
  if (!hasSpecialChar) {
    return '비밀번호는 특수문자를 포함해야 합니다.';
  }
  return null;
};
```

## 🚨 보안 체크리스트

프로덕션 배포 전 확인사항:

### 환경 변수
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] Git 히스토리에 `.env` 파일이 없음
- [ ] 프로덕션 서버에 환경 변수 별도 설정

### Firebase 설정
- [ ] Firestore Security Rules 배포됨
- [ ] Firebase API 키 제한 설정 완료
- [ ] Authentication 도메인 제한 설정
- [ ] App Check 활성화 (권장)

### API 보안
- [ ] Gemini API 키 제한 설정
- [ ] API 호출 빈도 제한 (Rate Limiting)
- [ ] 서버 사이드 API 호출로 이동 (권장)

### 코드 보안
- [ ] 모든 사용자 입력 검증
- [ ] XSS 공격 방어
- [ ] CSRF 토큰 사용 (Firebase 자동 처리)
- [ ] SQL Injection 방어 (Firestore 사용으로 자동 방어)

### 모니터링
- [ ] Firebase Analytics 활성화
- [ ] 에러 로깅 시스템 구축
- [ ] 의심스러운 활동 감지 시스템

## 📊 보안 감사 로그

정기적으로 다음 항목 점검:

### 매주
- [ ] 의심스러운 로그인 시도 확인
- [ ] API 사용량 모니터링
- [ ] 에러 로그 검토

### 매월
- [ ] 사용자 권한 검토
- [ ] 비활성 계정 정리
- [ ] 보안 업데이트 적용

### 분기별
- [ ] 전체 보안 감사
- [ ] 침투 테스트 (선택)
- [ ] 백업 복구 테스트

## 🆘 보안 사고 대응

보안 사고 발생 시:

1. **즉시 조치**
   - API 키 비활성화
   - 영향받은 사용자 계정 차단
   - 로그 백업

2. **조사**
   - Firebase Console에서 로그 확인
   - 영향 범위 파악
   - 원인 분석

3. **복구**
   - 새 API 키 발급
   - 보안 패치 적용
   - 사용자 알림

4. **사후 관리**
   - 보안 정책 업데이트
   - 재발 방지 조치
   - 문서화

## 📞 문의

보안 관련 문의:
- 이메일: security@your-domain.com
- 긴급: 24시간 핫라인

## 참고 자료

- [Firebase Security Rules 문서](https://firebase.google.com/docs/firestore/security/get-started)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
