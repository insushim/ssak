const { chromium } = require('playwright');
const BASE_URL = 'https://isw-writing.web.app';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' })).newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) errors.push('[error] ' + msg.text());
    if (msg.type() === 'warn' && msg.text().includes('마이그레이션')) errors.push('[warn] ' + msg.text());
  });

  console.log('1. 학생 로그인...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'demo-student1@ssak.kr');
  await page.fill('input[type="password"]', 'demo1234!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/student', { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('   OK: 학생 대시보드');

  // 콘솔 에러 확인
  const body = await page.textContent('body');
  const hasNickname = body.includes('이하늘');
  const hasPoints = body.includes('2800') || body.includes('P') || body.includes('포인트');
  console.log('   닉네임:', hasNickname, '| 포인트:', hasPoints);

  // 제출기록 탭
  console.log('2. 제출기록 탭...');
  const tabs = await page.locator('button').all();
  for (const tab of tabs) {
    const text = (await tab.textContent()).trim();
    if (text.includes('제출') || text.includes('기록')) {
      await tab.click();
      break;
    }
  }
  await page.waitForTimeout(2000);
  
  const bodyAfter = await page.textContent('body');
  const hasInvalidDate = bodyAfter.includes('Invalid Date');
  const hasUndefined = bodyAfter.includes('undefined');
  console.log('   Invalid Date:', hasInvalidDate ? 'YES (BAD)' : 'NO (GOOD)');
  console.log('   undefined 표시:', hasUndefined ? 'YES' : 'NO');

  // 에러 확인
  const filteredErrors = errors.filter(e => 
    !e.includes('chrome-extension') && 
    !e.includes('favicon') &&
    !e.includes('workbox') &&
    !e.includes('[warn]') // warn은 별도 표시
  );
  const warnErrors = errors.filter(e => e.includes('[warn]'));
  console.log('\n콘솔 에러:', filteredErrors.length);
  filteredErrors.forEach(e => console.log('  -', e.substring(0, 150)));
  console.log('마이그레이션 경고:', warnErrors.length);
  warnErrors.forEach(e => console.log('  -', e.substring(0, 150)));

  const pass = !hasInvalidDate && filteredErrors.length === 0 && warnErrors.length === 0;
  console.log(pass ? '\n✅ [PASS] 학생 대시보드 정상' : '\n⚠️ [WARN] 이슈 있음');
  
  await browser.close();
}
run().catch(err => { console.error('Fatal:', err); process.exit(1); });
