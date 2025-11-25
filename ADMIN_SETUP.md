# 슈퍼 관리자 계정 설정 가이드

이 가이드는 첫 슈퍼 관리자 계정을 생성하는 방법을 단계별로 설명합니다.

## 중요 사항

⚠️ **슈퍼 관리자는 시스템의 모든 권한을 가지므로, 반드시 안전하게 관리해야 합니다.**

## 방법 1: Firebase Console 사용 (권장)

### 단계 1: Firebase Authentication에서 사용자 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: `isw-writing`
3. 좌측 메뉴 → **Authentication**
4. **Users** 탭 클릭
5. **Add user** 클릭

#### 사용자 정보 입력:
```
Email: admin@isw-writing.com (또는 원하는 이메일)
Password: (강력한 비밀번호 - 최소 8자, 대소문자, 숫자, 특수문자 포함)
```

6. **Add user** 클릭
7. 생성된 사용자의 **UID** 복사 (예: `abc123xyz789def456ghi`)

### 단계 2: .env 파일에 UID 입력

프로젝트의 `.env` 파일을 열고 UID 입력:

```env
VITE_SUPER_ADMIN_UID=abc123xyz789def456ghi
```

저장 후 개발 서버 재시작:

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

### 단계 3: Firestore에 사용자 문서 생성

1. Firebase Console → **Firestore Database**
2. **Start collection** 클릭
3. Collection ID 입력: `users`
4. **Next** 클릭

#### 첫 번째 문서 설정:

**Document ID**: 위에서 복사한 UID 입력
```
abc123xyz789def456ghi
```

**Fields** (하나씩 추가):

| Field | Type | Value |
|-------|------|-------|
| uid | string | abc123xyz789def456ghi |
| email | string | admin@isw-writing.com |
| name | string | 관리자 |
| role | string | super_admin |
| approved | boolean | true |
| createdAt | string | 2024-11-25T00:00:00.000Z |

5. **Save** 클릭

### 단계 4: 로그인 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 위에서 생성한 이메일과 비밀번호로 로그인
3. 슈퍼 관리자 대시보드가 표시되면 성공! ✅

## 방법 2: 앱을 통한 회원가입 (더 간단)

### 단계 1: 일반 회원가입

1. `http://localhost:3000` 접속
2. "회원가입" 클릭
3. 정보 입력:
   ```
   이름: 관리자
   이메일: admin@isw-writing.com
   비밀번호: (강력한 비밀번호)
   역할: 선생님 (임시)
   ```
4. 회원가입 완료

### 단계 2: UID 확인

1. Firebase Console → Authentication → Users
2. 방금 생성한 사용자의 UID 복사

### 단계 3: .env 업데이트

```env
VITE_SUPER_ADMIN_UID=복사한_UID
```

개발 서버 재시작

### 단계 4: Firestore에서 역할 변경

1. Firebase Console → Firestore Database → users 컬렉션
2. 해당 UID 문서 찾기
3. `role` 필드를 `super_admin`으로 변경
4. `approved` 필드를 `true`로 변경
5. 저장

### 단계 5: 재로그인

1. 현재 로그인 상태에서 로그아웃
2. 다시 로그인
3. 슈퍼 관리자 대시보드 확인

## 방법 3: Firebase CLI 사용 (고급)

### 사전 준비
```bash
npm install -g firebase-tools
firebase login
```

### 스크립트 실행

`scripts/createAdmin.js` 파일 생성:

```javascript
const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const firestore = admin.firestore();

async function createSuperAdmin() {
  try {
    // 1. Authentication에 사용자 생성
    const userRecord = await auth.createUser({
      email: 'admin@isw-writing.com',
      password: 'YourStrongPassword123!',
      displayName: '관리자',
      emailVerified: true
    });

    console.log('✅ 사용자 생성 완료');
    console.log('UID:', userRecord.uid);

    // 2. Firestore에 문서 생성
    await firestore.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      name: '관리자',
      role: 'super_admin',
      approved: true,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Firestore 문서 생성 완료');
    console.log('\n.env 파일에 다음을 추가하세요:');
    console.log(`VITE_SUPER_ADMIN_UID=${userRecord.uid}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

createSuperAdmin();
```

### Service Account Key 다운로드

1. Firebase Console → Project Settings → Service Accounts
2. "Generate new private key" 클릭
3. `serviceAccountKey.json`으로 저장
4. `scripts/` 폴더에 저장

### 실행

```bash
node scripts/createAdmin.js
```

## 보안 권장사항

### 1. 강력한 비밀번호 사용

✅ 좋은 예:
```
Adm!n2024#iSw$Wr1t!ng
```

❌ 나쁜 예:
```
admin123
password
```

### 2. 비밀번호 관리자 사용

- 1Password
- LastPass
- Bitwarden

### 3. 2단계 인증 활성화 (권장)

Firebase Console에서 설정 가능

### 4. UID 보안 관리

- `.env` 파일을 Git에 커밋하지 않기 (이미 .gitignore에 포함)
- 프로덕션 환경에서는 환경 변수로 관리
- UID를 공개 저장소에 노출하지 않기

## 여러 슈퍼 관리자 계정 만들기

시스템은 기본적으로 `.env`의 UID 하나만 슈퍼 관리자로 인식합니다.

### 여러 관리자가 필요한 경우:

#### 방법 1: 코드 수정

`src/config/auth.js` 수정:

```javascript
// 단일 관리자
export const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID || '';

// 여러 관리자
export const SUPER_ADMIN_UIDS = [
  import.meta.env.VITE_SUPER_ADMIN_UID,
  'second_admin_uid',
  'third_admin_uid'
];
```

`src/services/authService.js` 수정:

```javascript
// 변경 전
if (user.uid === SUPER_ADMIN_UID) {

// 변경 후
if (SUPER_ADMIN_UIDS.includes(user.uid)) {
```

#### 방법 2: Firestore에서 role 확인 (권장)

코드 수정 없이 Firestore의 `role` 필드만 확인:

`src/App.jsx`에서 이미 Firestore role을 확인하므로, Firestore에서 `role: 'super_admin'`인 사용자는 모두 슈퍼 관리자로 작동합니다.

## 문제 해결

### 문제 1: "승인 대기 중" 메시지 표시

**원인**: Firestore 문서가 생성되지 않았거나 `approved: false`

**해결**:
1. Firestore에서 해당 UID 문서 확인
2. `approved` 필드를 `true`로 변경
3. `role` 필드가 `super_admin`인지 확인

### 문제 2: 로그인 후 학생/선생님 대시보드로 이동

**원인**: `.env`의 UID가 올바르지 않음

**해결**:
1. Firebase Authentication에서 정확한 UID 확인
2. `.env` 파일의 `VITE_SUPER_ADMIN_UID` 재확인
3. 개발 서버 재시작

### 문제 3: "사용자 정보를 찾을 수 없습니다" 오류

**원인**: Firestore에 users 문서가 없음

**해결**:
1. Firestore Database 확인
2. `users` 컬렉션에 해당 UID 문서 생성
3. 필수 필드 모두 입력

## 테스트 체크리스트

슈퍼 관리자 계정 생성 후 확인:

- [ ] 로그인 성공
- [ ] 슈퍼 관리자 대시보드 표시
- [ ] "승인 대기" 탭에서 대기 중인 선생님 확인
- [ ] 선생님 승인 기능 작동
- [ ] "전체 사용자" 탭에서 모든 사용자 확인
- [ ] 이메일 주소 정확히 표시
- [ ] 역할 정확히 표시
- [ ] 로그아웃 기능 작동

## 다음 단계

슈퍼 관리자 계정 생성 후:

1. **선생님 계정 생성 및 승인**
   - 선생님이 회원가입
   - 슈퍼 관리자가 승인

2. **학급 생성**
   - 승인된 선생님이 로그인
   - 학급 생성

3. **학생 초대**
   - 학급 코드를 학생들에게 공유
   - 학생들이 회원가입 후 학급 가입

## 보안 베스트 프랙티스

### DO ✅
- 강력한 비밀번호 사용
- 비밀번호 관리자 사용
- 정기적으로 비밀번호 변경
- 로그인 활동 모니터링
- `.env` 파일 보안 관리

### DON'T ❌
- 비밀번호 공유
- 공용 컴퓨터에서 로그인 유지
- UID를 공개 저장소에 커밋
- 약한 비밀번호 사용
- 의심스러운 링크 클릭

## 긴급 상황 대응

### 계정 탈취 의심 시

1. **즉시 조치**
   ```bash
   # Firebase Console에서 사용자 비활성화
   # 또는 비밀번호 재설정 이메일 발송
   ```

2. **조사**
   - Firebase Authentication → Users → 로그인 기록 확인
   - Firestore → 최근 활동 확인

3. **복구**
   - 비밀번호 재설정
   - 필요시 새 관리자 계정 생성
   - 이전 계정 비활성화

## 지원

문제가 계속되면:
1. `TEST_CHECKLIST.md` 확인
2. `SECURITY_GUIDE.md` 참조
3. Firebase 문서 확인

---

**중요**: 슈퍼 관리자 계정은 시스템의 핵심이므로, 안전하게 관리하고 절대 공유하지 마세요!
