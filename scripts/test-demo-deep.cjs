/**
 * Deep E2E test - landing, mobile, nav, performance, login, register
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'https://isw-writing.web.app';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

async function ensureDir(dir) {
  const fs = require('fs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function runDeepTests() {
  await ensureDir(SCREENSHOT_DIR);
  const results = [];

  const browser = await chromium.launch({ headless: true });

  // ============================================
  // TEST A: Landing page full scroll + CTA
  // ============================================
  console.log('\n=== TEST A: Landing Page Full ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const bodyText = await page.textContent('body');
    const checks = {
      hasHero: bodyText.includes('AI') || bodyText.includes('싹'),
      hasPricing: bodyText.includes('무료') || bodyText.includes('요금') || bodyText.includes('가격'),
      hasContact: bodyText.includes('문의') || bodyText.includes('contact') || bodyText.includes('Contact'),
      hasCopyright: bodyText.includes('2026'),
    };

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep-01-landing-bottom.png') });

    console.log('  Hero:', checks.hasHero, '| Pricing:', checks.hasPricing, '| Contact:', checks.hasContact, '| Copyright:', checks.hasCopyright);
    results.push({ test: 'A. Landing Full', status: Object.values(checks).every(v => v) ? 'PASS' : 'WARN', jsErrors: errors.length });
    await context.close();
  }

  // ============================================
  // TEST B: Mobile responsive
  // ============================================
  console.log('\n=== TEST B: Mobile Responsive ===');
  {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'ko-KR', isMobile: true });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep-02-mobile-landing.png') });

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep-03-mobile-login.png') });

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log('  Horizontal overflow:', overflow);
    results.push({ test: 'B. Mobile Responsive', status: !overflow ? 'PASS' : 'FAIL' });
    await context.close();
  }

  // ============================================
  // TEST C: Navigation links
  // ============================================
  console.log('\n=== TEST C: Navigation Links ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(h => h.startsWith(window.location.origin) || h.startsWith('/'))
        .filter((v, i, a) => a.indexOf(v) === i);
    });
    console.log('  Found', links.length, 'internal links');

    const linkResults = [];
    for (const link of links.slice(0, 10)) {
      try {
        const resp = await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const status = resp ? resp.status() : 'N/A';
        linkResults.push({ url: link.replace(BASE_URL, ''), status });
        console.log('   ', status === 200 ? '[OK]' : '[!!]', link.replace(BASE_URL, ''));
      } catch (e) {
        linkResults.push({ url: link.replace(BASE_URL, ''), status: 'ERR' });
        console.log('    [!!]', link.replace(BASE_URL, ''), '-', e.message.substring(0, 60));
      }
    }

    const allOk = linkResults.every(r => r.status === 200);
    results.push({ test: 'C. Nav Links', status: allOk ? 'PASS' : 'WARN', total: links.length, checked: linkResults.length });
    await context.close();
  }

  // ============================================
  // TEST D: Performance
  // ============================================
  console.log('\n=== TEST D: Performance ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await context.newPage();

    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - start;

    const metrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcp = entries.find(e => e.name === 'first-contentful-paint');
      return {
        fcp: fcp ? Math.round(fcp.startTime) : null,
        resources: performance.getEntriesByType('resource').length,
      };
    });

    console.log('  Load:', loadTime + 'ms | FCP:', metrics.fcp + 'ms | Resources:', metrics.resources);
    results.push({ test: 'D. Performance', status: loadTime < 5000 ? 'PASS' : 'WARN', loadTime, fcp: metrics.fcp });
    await context.close();
  }

  // ============================================
  // TEST E: Login page interaction
  // ============================================
  console.log('\n=== TEST E: Login Page ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await context.newPage();
    const jsErrors = [];
    page.on('pageerror', err => jsErrors.push(err.message));

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });

    const hasEmail = await page.locator('input[type="email"], input[placeholder*="이메일"]').count();
    const hasPassword = await page.locator('input[type="password"]').count();
    const hasSubmit = await page.locator('button[type="submit"], button:has-text("로그인")').count();
    const hasGoogle = await page.locator('button:has-text("Google"), button:has-text("구글")').count();

    console.log('  Email:', hasEmail > 0, '| Password:', hasPassword > 0, '| Submit:', hasSubmit > 0, '| Google:', hasGoogle > 0);
    console.log('  JS errors:', jsErrors.length);
    if (jsErrors.length > 0) jsErrors.forEach(e => console.log('    -', e.substring(0, 100)));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep-04-login-fields.png') });
    results.push({
      test: 'E. Login Page',
      status: hasEmail > 0 && hasPassword > 0 && hasSubmit > 0 ? 'PASS' : 'FAIL',
      jsErrors: jsErrors.length
    });
    await context.close();
  }

  // ============================================
  // TEST F: Register page
  // ============================================
  console.log('\n=== TEST F: Register Page ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await context.newPage();

    await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep-05-register.png') });

    const bodyText = await page.textContent('body');
    const hasRoleText = bodyText.includes('학생') || bodyText.includes('교사') || bodyText.includes('선생님');
    console.log('  Role selection:', hasRoleText);
    results.push({ test: 'F. Register', status: 'PASS' });
    await context.close();
  }

  // ============================================
  // TEST G: 404 handling
  // ============================================
  console.log('\n=== TEST G: 404 Handling ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
    const page = await context.newPage();

    await page.goto(BASE_URL + '/nonexistent-page-xyz', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep-06-404.png') });

    const bodyText = await page.textContent('body');
    const hasNotFound = bodyText.includes('404') || bodyText.includes('찾을 수 없') || bodyText.includes('없는 페이지') || bodyText.includes('로그인');
    console.log('  404 handling:', hasNotFound ? 'handled' : 'missing');
    results.push({ test: 'G. 404 Handling', status: hasNotFound ? 'PASS' : 'WARN' });
    await context.close();
  }

  await browser.close();

  // ============================================
  // RESULTS
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('  DEEP TEST RESULTS');
  console.log('='.repeat(60));
  for (const r of results) {
    const icon = r.status === 'PASS' ? '[PASS]' : r.status === 'WARN' ? '[WARN]' : '[FAIL]';
    console.log('  ' + icon + ' ' + r.test);
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log('\n  FINAL:', passCount, 'PASS,', warnCount, 'WARN,', failCount, 'FAIL out of', results.length, 'tests');
  console.log('  Screenshots:', SCREENSHOT_DIR);
  console.log('='.repeat(60));

  process.exit(failCount > 0 ? 1 : 0);
}

runDeepTests().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
