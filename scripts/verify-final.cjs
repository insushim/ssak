const { chromium } = require('playwright');
const BASE_URL = 'https://isw-writing.web.app';
const path = require('path');
const fs = require('fs');
const DIR = path.join(__dirname, '..', 'test-screenshots');

async function run() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' })).newPage();
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  // 1. 로그인 + 모달 닫기
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'demo-teacher@ssak.kr');
  await page.fill('input[type="password"]', 'demo1234!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/teacher', { timeout: 15000 });
  await page.waitForTimeout(3000);
  const confirmBtn = page.locator('button:has-text("확인했습니다")');
  if (await confirmBtn.count() > 0) await confirmBtn.click();
  await page.waitForTimeout(1000);
  console.log('1. 로그인 OK');

  // 2. 제출글 탭
  await page.locator('button:has-text("제출글")').first().click();
  await page.waitForTimeout(2000);
  console.log('2. 제출글 탭 OK');

  // 3. 과제 클릭 - "나의 겨울방학 이야기" (4명 제출)
  await page.locator('button:has-text("나의 겨울방학 이야기")').first().click();
  await page.waitForTimeout(2000);
  console.log('3. 과제 클릭 OK');
  await page.screenshot({ path: path.join(DIR, 'final-03-topic.png') });

  // 4. 학생 카드 찾기 - border-2 rounded-xl (학생 카드 특징)
  // 과제 확장 영역 내 학생 카드: p-4 rounded-xl border-2
  const studentCards = page.locator('button.rounded-xl.border-2');
  const count = await studentCards.count();
  console.log('4. 학생 카드:', count, '개');

  if (count > 0) {
    // 첫 번째 학생 카드 텍스트 확인
    const cardText = await studentCards.first().textContent();
    console.log('   첫 카드: "' + cardText.trim().substring(0, 30) + '"');
    
    // 클릭
    await studentCards.first().click();
    console.log('   카드 클릭됨');

    // 네트워크 요청 대기 (Firestore 읽기)
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(DIR, 'final-04-detail.png') });

    // 글 상세 확인 - 글 내용이나 피드백이 표시되는지
    const body = await page.textContent('body');
    
    // 글 본문 내용 체크 (WRITING_SAMPLES의 일기 내용)
    const hasWritingContent = 
      body.includes('체육') || body.includes('할머니') || body.includes('짝꿍') || 
      body.includes('비행사') || body.includes('햄스터') || body.includes('선생님께') ||
      body.includes('편지') || body.includes('피구') || body.includes('운동장');
    
    const hasScoreBreakdown = body.includes('내용') && body.includes('구성');
    const hasFeedback = body.includes('훌륭한') || body.includes('잘 썼') || body.includes('좋은 시작') || body.includes('글을 써줘서');
    
    console.log('5. 결과:');
    console.log('   글 본문:', hasWritingContent ? 'YES' : 'NO');
    console.log('   점수 상세:', hasScoreBreakdown ? 'YES' : 'NO');
    console.log('   피드백:', hasFeedback ? 'YES' : 'NO');
    console.log('   JS 에러:', jsErrors.length);
    
    if (hasWritingContent || hasFeedback) {
      console.log('\n✅ [PASS] 선생님 글 상세보기 정상 작동!');
    } else {
      console.log('\n⚠️ 스크린샷 확인 필요 (final-04-detail.png)');
    }
  }

  await browser.close();
}
run().catch(err => { console.error('Fatal:', err); process.exit(1); });
