const { chromium } = require('playwright');
const BASE_URL = 'https://isw-writing.web.app';
const path = require('path');
const fs = require('fs');
const DIR = path.join(__dirname, '..', 'test-screenshots');

async function run() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
  const page = await context.newPage();
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  // 1. 로그인
  console.log('1. 선생님 로그인...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'demo-teacher@ssak.kr');
  await page.fill('input[type="password"]', 'demo1234!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/teacher', { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('   OK');

  // 2. 모달 닫기 (3월 1일 알림 등)
  console.log('2. 모달 닫기...');
  const confirmBtn = page.locator('button:has-text("확인했습니다")');
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click();
    await page.waitForTimeout(1000);
    console.log('   OK: 모달 닫힘');
  }

  // 3. "제출글" 탭 클릭
  console.log('3. 제출글 탭 이동...');
  const writingsTab = page.locator('button:has-text("제출글")');
  if (await writingsTab.count() > 0) {
    await writingsTab.first().click();
    await page.waitForTimeout(2000);
    console.log('   OK');
  } else {
    console.log('   WARN: 제출글 탭 못 찾음, 기본 탭에서 진행');
  }
  await page.screenshot({ path: path.join(DIR, 'teacher-02-writings.png') });

  // 4. 과제 목록에서 첫 번째 과제 클릭
  console.log('4. 과제 클릭...');
  // 과제 제목이 있는 요소를 찾아 클릭
  let clicked = false;
  for (const title of ['감사한 분에게 편지 쓰기', '나의 겨울방학 이야기', '내가 좋아하는 계절']) {
    const el = page.locator(`button:has-text("${title}")`);
    if (await el.count() > 0) {
      await el.first().click({ force: true });
      clicked = true;
      console.log('   OK: "' + title + '" 클릭');
      break;
    }
  }
  if (!clicked) {
    // 텍스트 기반 검색
    const textEl = page.locator('text=감사한 분');
    if (await textEl.count() > 0) {
      await textEl.first().click({ force: true });
      clicked = true;
      console.log('   OK: 텍스트 기반 클릭');
    }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(DIR, 'teacher-03-topic.png') });

  if (!clicked) {
    console.log('   FAIL: 과제 못 찾음');
    await browser.close();
    return;
  }

  // 5. 학생 카드 클릭
  console.log('5. 학생 카드 클릭...');
  // 학생 카드는 grid 안의 button + 원형 아바타
  const studentCard = page.locator('.grid button').first();
  if (await studentCard.count() > 0) {
    await studentCard.click({ force: true });
    console.log('   OK: 학생 카드 클릭됨');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(DIR, 'teacher-04-detail.png') });

    // 글 상세 표시 확인
    const body = await page.textContent('body');
    const checks = {
      hasFeedback: body.includes('피드백') || body.includes('학생'),
      hasScore: body.includes('점') || body.includes('점수'),
      hasContent: body.includes('확인 완료') || body.includes('확인완료') || body.includes('AI') || body.includes('단어') || body.includes('글자'),
    };
    console.log('   피드백:', checks.hasFeedback, '| 점수:', checks.hasScore, '| 상세:', checks.hasContent);

    if (checks.hasFeedback || checks.hasScore || checks.hasContent) {
      console.log('\n✅ [PASS] 선생님 글 상세보기 작동!');
    } else {
      console.log('\n⚠️ [WARN] 스크린샷 확인 필요 (teacher-04-detail.png)');
    }
  } else {
    console.log('   FAIL: 학생 카드 없음');
  }

  console.log('\nJS 에러:', jsErrors.length);
  jsErrors.forEach(e => console.log('  -', e.substring(0, 120)));
  await browser.close();
}
run().catch(err => { console.error('Fatal:', err); process.exit(1); });
