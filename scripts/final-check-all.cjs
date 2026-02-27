const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const BASE_URL = 'https://isw-writing.web.app';
const DIR = path.join(__dirname, '..', 'test-screenshots');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const results = [];

async function run() {
  const browser = await chromium.launch({ headless: true });

  // A. 랜딩
  console.log('\n=== A. 랜딩 페이지 ===');
  {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' })).newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const t0 = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const loadMs = Date.now() - t0;
    const body = await page.textContent('body');
    const hero = body.includes('AI') || body.includes('싹');
    const login = body.includes('로그인') || body.includes('시작');
    console.log('  로드:', loadMs + 'ms | Hero:', hero, '| 로그인:', login, '| JS에러:', errors.length);
    results.push({ test: 'A. 랜딩', status: hero && login ? 'PASS' : 'FAIL', errors: errors.length });
    await page.context().close();
  }

  // B. 로그인 폼
  console.log('\n=== B. 로그인 페이지 ===');
  {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' })).newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    const hasEmail = await page.locator('input[type="email"]').count();
    const hasPw = await page.locator('input[type="password"]').count();
    const hasAC = await page.locator('input[autocomplete="current-password"]').count();
    const hasSubmit = await page.locator('button[type="submit"]').count();
    console.log('  Email:', hasEmail > 0, '| PW:', hasPw > 0, '| autoComplete:', hasAC > 0, '| Submit:', hasSubmit > 0);
    results.push({ test: 'B. 로그인 폼', status: hasEmail && hasPw && hasSubmit ? 'PASS' : 'FAIL', errors: errors.length });
    await page.context().close();
  }

  // C. 모바일
  console.log('\n=== C. 모바일 반응형 ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ko-KR', isMobile: true });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const ov1 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    const ov2 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('  랜딩 오버플로:', ov1, '| 로그인 오버플로:', ov2);
    results.push({ test: 'C. 모바일', status: !ov1 && !ov2 ? 'PASS' : 'WARN' });
    await ctx.close();
  }

  // D. 404
  console.log('\n=== D. 404 처리 ===');
  {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' })).newPage();
    await page.goto(BASE_URL + '/nonexistent-xyz', { waitUntil: 'networkidle', timeout: 30000 });
    const body = await page.textContent('body');
    const has404 = body.includes('404') || body.includes('찾을 수 없');
    console.log('  404 표시:', has404);
    results.push({ test: 'D. 404', status: has404 ? 'PASS' : 'WARN' });
    await page.context().close();
  }

  // E. 학생 대시보드
  console.log('\n=== E. 학생 대시보드 ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('chrome-extension'))
        errors.push('[err] ' + msg.text().substring(0, 100));
    });

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'demo-student1@ssak.kr');
    await page.fill('input[type="password"]', 'demo1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const body = await page.textContent('body');
    const hasNick = body.includes('이하늘');
    const noModal = !body.includes('닉네임을 설정');
    console.log('  닉네임:', hasNick, '| 모달없음:', noModal);
    await page.screenshot({ path: path.join(DIR, 'final-e-student.png') });

    // 탭 순회
    const tabNames = ['글쓰기', '제출', '상점', '업적', '내 정보'];
    for (const name of tabNames) {
      const allBtns = await page.locator('button').all();
      for (const btn of allBtns) {
        const t = (await btn.textContent()).trim();
        if (t.includes(name)) { await btn.click(); break; }
      }
      await page.waitForTimeout(1500);
    }

    const bodyFinal = await page.textContent('body');
    const hasInvalid = bodyFinal.includes('Invalid Date');
    console.log('  Invalid Date:', hasInvalid ? 'BAD' : 'OK', '| JS에러:', errors.length);
    errors.forEach(e => console.log('    -', e));
    results.push({ test: 'E. 학생 대시보드', status: hasNick && !hasInvalid && errors.length === 0 ? 'PASS' : 'FAIL', errors: errors.length });
    await ctx.close();
  }

  // F. 선생님 대시보드 + 글 상세보기
  console.log('\n=== F. 선생님 + 글 상세보기 ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'demo-teacher@ssak.kr');
    await page.fill('input[type="password"]', 'demo1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // 모달 닫기
    const modal = page.locator('button:has-text("확인했습니다")');
    if (await modal.count() > 0) await modal.click();
    await page.waitForTimeout(1000);

    // 4개 탭
    for (const name of ['과제', '제출글', '랭킹', '클래스']) {
      const btn = page.locator('button:has-text("' + name + '")').first();
      if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(1500); }
    }
    console.log('  4개 탭 순회 OK');

    // 글 상세보기 테스트
    await page.locator('button:has-text("제출글")').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("나의 겨울방학 이야기")').first().click();
    await page.waitForTimeout(2000);

    const cards = page.locator('button.rounded-xl.border-2');
    const cardCount = await cards.count();
    console.log('  학생 카드:', cardCount);

    let detailOK = false;
    if (cardCount > 0) {
      await cards.first().click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(DIR, 'final-f-detail.png') });
      const body = await page.textContent('body');
      detailOK = body.includes('체육') || body.includes('할머니') || body.includes('짝꿍') ||
                 body.includes('피구') || body.includes('작성한 글') || body.includes('선생님께');
      console.log('  글 상세:', detailOK ? 'OK' : 'FAIL');
    }

    console.log('  JS에러:', errors.length);
    errors.forEach(e => console.log('    -', e.substring(0, 120)));
    results.push({ test: 'F. 선생님+글상세', status: cardCount > 0 && detailOK && errors.length === 0 ? 'PASS' : 'FAIL', errors: errors.length });
    await ctx.close();
  }

  // G. 정책 페이지
  console.log('\n=== G. 정책 페이지 ===');
  {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' })).newPage();
    await page.goto(BASE_URL + '/privacy', { waitUntil: 'networkidle', timeout: 30000 });
    const p = await page.textContent('body');
    const priv = p.includes('개인정보') || p.includes('처리방침');
    await page.goto(BASE_URL + '/terms', { waitUntil: 'networkidle', timeout: 30000 });
    const t = await page.textContent('body');
    const terms = t.includes('이용약관') || t.includes('서비스');
    console.log('  개인정보:', priv, '| 이용약관:', terms);
    results.push({ test: 'G. 정책 페이지', status: priv && terms ? 'PASS' : 'WARN' });
    await page.context().close();
  }

  await browser.close();

  // RESULTS
  console.log('\n' + '='.repeat(55));
  console.log('  최종 점검 결과');
  console.log('='.repeat(55));
  for (const r of results) {
    const icon = r.status === 'PASS' ? '[PASS]' : r.status === 'WARN' ? '[WARN]' : '[FAIL]';
    console.log('  ' + icon + ' ' + r.test + (r.errors ? ' (에러: ' + r.errors + ')' : ''));
  }
  const pass = results.filter(r => r.status === 'PASS').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  console.log('\n  결과: ' + pass + ' PASS, ' + warn + ' WARN, ' + fail + ' FAIL / ' + results.length + ' 테스트');
  console.log('='.repeat(55));
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(2); });
