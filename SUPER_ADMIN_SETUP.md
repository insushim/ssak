# 슈퍼 관리자 계정 생성 가이드 (완전판)

## ⚠️ 먼저 해야 할 것: Firebase Authentication 활성화

현재 `auth/configuration-not-found` 오류가 발생하는 이유는 **Firebase Authentication이 활성화되지 않았기 때문**입니다.

### 1단계: Firebase Authentication 활성화 (필수!)

1. **[Firebase Console](https://console.firebase.google.com/project/isw-writing/authentication) 접속**

2. **"시작하기" 또는 "Get Started" 클릭**

3. **"Sign-in method" 탭 선택**

4. **"이메일/비밀번호" 찾기**
   - "Email/Password" 클릭
   - **첫 번째 옵션(이메일/비밀번호) 활성화** (토글 ON)
   - "저장" 또는 "Save" 클릭

5. ✅ **완료!** 이제 회원가입이 작동합니다.

---

## 방법 1: 웹앱에서 직접 회원가입 (가장 쉬움!) ⭐⭐⭐

**Authentication을 활성화한 후**, 가장 쉬운 방법입니다!

### Step 1: 웹앱에서 회원가입

1. **https://isw-writing.web.app** 접속
2. **"회원가입"** 클릭
3. 다음 정보 입력:
   ```
   이름: 관리자
   이메일: admin@isw-writing.com (원하는 이메일)
   비밀번호: ********** (강력한 비밀번호!)
   비밀번호 확인: **********
   역할: 선생님 (일단 선택)
   ```
4. **"회원가입"** 클릭

### Step 2: UID 확인

1. [Firebase Console - Authentication](https://console.firebase.google.com/project/isw-writing/authentication/users) 접속
2. 방금 생성한 사용자 찾기
3. **UID 복사** (예: `Kx7mN9pQr2sT8uVwYz3A`)

### Step 3: .env 파일 수정

프로젝트 폴더의 `.env` 파일을 열고:

```env
VITE_SUPER_ADMIN_UID=복사한_UID_여기에_붙여넣기
```

예시:
```env
VITE_SUPER_ADMIN_UID=Kx7mN9pQr2sT8uVwYz3A
```

### Step 4: Firestore에서 역할 변경

1. [Firestore Database](https://console.firebase.google.com/project/isw-writing/firestore) 접속

2. **users** 컬렉션 찾기 (없으면 생성됨)

3. 해당 UID의 문서 클릭

4. 다음 필드 수정:
   - `role`: `teacher` → **`super_admin`** (수정)
   - `approved`: `false` → **`true`** (수정)

5. **저장** 클릭

### Step 5: 재배포

```bash
npm run build
firebase deploy --only hosting
```

### Step 6: 로그인!

1. **https://isw-writing.web.app** 접속
2. 위에서 만든 이메일/비밀번호로 로그인
3. **슈퍼 관리자 대시보드** 확인! 🎉

---

## 방법 2: Firebase Console에서 직접 생성

### Step 1: Authentication에서 사용자 생성

1. [Firebase Console - Authentication](https://console.firebase.google.com/project/isw-writing/authentication/users) 접속

2. **"Add user"** 클릭

3. 정보 입력:
   ```
   Email: admin@isw-writing.com
   Password: (강력한 비밀번호 입력)
   ```

4. **"Add user"** 클릭

5. 생성된 사용자의 **UID 복사**

### Step 2: .env 파일 수정

```env
VITE_SUPER_ADMIN_UID=복사한_UID
```

### Step 3: Firestore에 문서 생성

1. [Firestore Database](https://console.firebase.google.com/project/isw-writing/firestore) 접속

2. **"Start collection"** 클릭

3. Collection ID 입력: **`users`**

4. **"Next"** 클릭

5. Document ID: **복사한 UID 붙여넣기**

6. 다음 필드 하나씩 추가:

| Field | Type | Value |
|-------|------|-------|
| **uid** | string | 복사한_UID |
| **email** | string | admin@isw-writing.com |
| **name** | string | 관리자 |
| **role** | string | **super_admin** |
| **approved** | boolean | **true** |
| **createdAt** | string | 2024-11-25T00:00:00.000Z |

7. **"Save"** 클릭

### Step 4: 재배포

```bash
npm run build
firebase deploy --only hosting
```

### Step 5: 로그인 테스트

**https://isw-writing.web.app** 접속 후 로그인!

---

## 빠른 체크리스트 ✅

배포 후 슈퍼 관리자 계정 생성:

- [ ] **Firebase Authentication 활성화** (이메일/비밀번호)
- [ ] **사용자 생성** (웹앱 또는 Firebase Console)
- [ ] **UID 복사**
- [ ] **`.env` 파일에 UID 입력**
- [ ] **Firestore에서 `role: super_admin`, `approved: true` 설정**
- [ ] **재배포**: `npm run build && firebase deploy --only hosting`
- [ ] **로그인 테스트**

---

## 🐛 문제 해결

### 오류: "auth/configuration-not-found"

**원인**: Firebase Authentication이 활성화되지 않음

**해결**:
1. [Firebase Console - Authentication](https://console.firebase.google.com/project/isw-writing/authentication) 접속
2. "시작하기" 클릭
3. "이메일/비밀번호" 활성화
4. 저장

### 오류: "승인 대기 중"

**원인**: Firestore에서 `approved: false` 또는 `role`이 잘못됨

**해결**:
1. Firestore에서 해당 사용자 문서 찾기
2. `role: super_admin` 확인
3. `approved: true` 확인

### 로그인 후 학생/선생님 대시보드로 이동

**원인**: `.env`의 UID가 잘못됨

**해결**:
1. Firebase Authentication에서 정확한 UID 재확인
2. `.env` 파일 수정
3. 재배포

---

## 🎯 완료 후 다음 단계

슈퍼 관리자로 로그인하면:

1. **선생님 계정 승인**
   - 선생님들이 회원가입하면
   - 슈퍼 관리자 대시보드에서 승인

2. **학급 생성**
   - 승인된 선생님이 로그인
   - "새 학급 만들기" 클릭
   - 학급 코드를 학생들에게 공유

3. **학생 초대**
   - 학생들이 회원가입
   - 학급 코드로 가입
   - 글쓰기 시작!

---

## 📞 추가 도움이 필요하면

- Firebase Console 링크:
  - [Authentication](https://console.firebase.google.com/project/isw-writing/authentication)
  - [Firestore](https://console.firebase.google.com/project/isw-writing/firestore)
  - [Project Overview](https://console.firebase.google.com/project/isw-writing/overview)

- 상세 문서:
  - `START_HERE.md` - 빠른 시작
  - `DEPLOYMENT_SUCCESS.md` - 배포 성공 가이드
  - `SECURITY_GUIDE.md` - 보안 설정

---

## 🎉 완료!

슈퍼 관리자 계정이 생성되면 **https://isw-writing.web.app**에서 바로 시스템을 사용할 수 있습니다!

**가장 중요**: Firebase Authentication 활성화를 먼저 해야 합니다!
