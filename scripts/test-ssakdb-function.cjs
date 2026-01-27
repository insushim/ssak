/**
 * Cloud Function을 통해 싹DB 상태 확인
 *
 * 이 스크립트는 Firebase Auth로 로그인 후 checkSsakDBStatus 함수를 호출합니다.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA6qDbJR5taBJvrpFNFE8_eIL1v9e9joGM",
  authDomain: "isw-writing.firebaseapp.com",
  projectId: "isw-writing",
  storageBucket: "isw-writing.firebasestorage.app",
  messagingSenderId: "121740708708",
  appId: "1:121740708708:web:5d2477030a946bdbac0871"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');

async function main() {
  console.log('🌱 싹DB 상태 확인 (Cloud Function 호출)\n');

  // 환경변수에서 이메일/비밀번호 가져오기 또는 수동 입력
  const email = process.env.FIREBASE_TEST_EMAIL || 'test@example.com';
  const password = process.env.FIREBASE_TEST_PASSWORD || 'password123';

  console.log('📧 로그인 시도:', email);

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ 로그인 성공:', userCred.user.uid);

    console.log('\n🔍 checkSsakDBStatus 함수 호출 중...\n');
    const checkSsakDBStatus = httpsCallable(functions, 'checkSsakDBStatus');
    const result = await checkSsakDBStatus();

    console.log('=' .repeat(60));
    console.log('📊 싹DB 상태 결과:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(result.data, null, 2));
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ 오류:', error.message);

    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log('\n💡 테스트 계정이 필요합니다.');
      console.log('   환경변수 설정 예시:');
      console.log('   set FIREBASE_TEST_EMAIL=admin@example.com');
      console.log('   set FIREBASE_TEST_PASSWORD=yourpassword');
    }
  }

  process.exit(0);
}

main();
