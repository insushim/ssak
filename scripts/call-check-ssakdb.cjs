/**
 * checkSsakDBStatus Cloud Function을 직접 호출하는 스크립트
 * Firebase REST API 사용
 */

const https = require('https');

// Firebase Functions URL
const FUNCTIONS_URL = 'https://us-central1-isw-writing.cloudfunctions.net/checkSsakDBStatus';

// 테스트용 - 인증 없이 호출 시도 (실패할 것임)
// 실제로는 Firebase Auth 토큰이 필요함

async function callWithCurl() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(FUNCTIONS_URL, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve(data);
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ data: {} }));
    req.end();
  });
}

console.log('🔍 checkSsakDBStatus 함수 호출 중...\n');
console.log('URL:', FUNCTIONS_URL);
console.log('\n(인증 없이 호출하므로 401 에러가 예상됩니다)\n');

callWithCurl()
  .then(() => {
    console.log('\n✅ 호출 완료');
    console.log('\n💡 실제 테스트는 브라우저에서 로그인 후 콘솔에서 실행하세요:');
    console.log('   const { checkSsakDBStatus } = await import("/src/utils/geminiAPI.js");');
    console.log('   await checkSsakDBStatus();');
  })
  .catch(err => console.error('Error:', err))
  .finally(() => process.exit(0));
