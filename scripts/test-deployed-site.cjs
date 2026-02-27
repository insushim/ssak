/**
 * Playwright headless test for deployed site: https://isw-writing.web.app
 * Tests: landing page, /terms, /privacy, /login + console errors
 */
const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'https://isw-writing.web.app';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

async function ensureDir(dir) {
  const fs = require('fs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function runTests() {
  await ensureDir(SCREENSHOT_DIR);

  const results = [];
  const consoleErrors = {};

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'ko-KR',
  });

  // ============================================
  // TEST 1: Main Landing Page
  // ============================================
  console.log('\n=== TEST 1: Main Landing Page ===');
  {
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    try {
      const response = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 'N/A';
      console.log(`  Status: ${status}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-landing.png'), fullPage: true });

      const title = await page.title();
      console.log(`  Title: ${title}`);

      // Check for 2026 copyright
      const bodyText = await page.textContent('body');
      const has2026Copyright = bodyText.includes('2026') && (bodyText.includes('©') || bodyText.includes('copyright') || bodyText.includes('Copyright'));
      console.log(`  2026 Copyright found: ${has2026Copyright}`);

      // Try to find the specific copyright element
      const footerText = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        return footer ? footer.textContent : '';
      });
      console.log(`  Footer text: ${footerText.trim().substring(0, 200)}`);

      results.push({
        test: '1. Main Landing Page',
        status: status === 200 ? 'PASS' : 'FAIL',
        details: {
          httpStatus: status,
          title,
          has2026Copyright,
          footerSnippet: footerText.trim().substring(0, 200),
        }
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ test: '1. Main Landing Page', status: 'FAIL', details: { error: err.message } });
    }
    consoleErrors['landing'] = errors;
    await page.close();
  }

  // ============================================
  // TEST 2: /terms Page
  // ============================================
  console.log('\n=== TEST 2: /terms Page ===');
  {
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    try {
      const response = await page.goto(`${BASE_URL}/terms`, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 'N/A';
      console.log(`  Status: ${status}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-terms.png'), fullPage: true });

      const bodyText = await page.textContent('body');
      const has2026 = bodyText.includes('2026년');
      console.log(`  "2026년" found: ${has2026}`);

      // Find 2026년 context
      const idx = bodyText.indexOf('2026년');
      if (idx >= 0) {
        const snippet = bodyText.substring(Math.max(0, idx - 30), idx + 40).trim();
        console.log(`  Context: "...${snippet}..."`);
      }

      results.push({
        test: '2. /terms Page',
        status: status === 200 && has2026 ? 'PASS' : 'FAIL',
        details: { httpStatus: status, has2026 }
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ test: '2. /terms Page', status: 'FAIL', details: { error: err.message } });
    }
    consoleErrors['terms'] = errors;
    await page.close();
  }

  // ============================================
  // TEST 3: /privacy Page
  // ============================================
  console.log('\n=== TEST 3: /privacy Page ===');
  {
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    try {
      const response = await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 'N/A';
      console.log(`  Status: ${status}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-privacy.png'), fullPage: true });

      const bodyText = await page.textContent('body');
      const has국외이전 = bodyText.includes('국외 이전');
      const has법정대리인 = bodyText.includes('법정대리인');
      const has2026 = bodyText.includes('2026년');

      console.log(`  "국외 이전" found: ${has국외이전}`);
      console.log(`  "법정대리인" found: ${has법정대리인}`);
      console.log(`  "2026년" found: ${has2026}`);

      const allPass = status === 200 && has국외이전 && has법정대리인 && has2026;

      results.push({
        test: '3. /privacy Page',
        status: allPass ? 'PASS' : 'FAIL',
        details: { httpStatus: status, has국외이전, has법정대리인, has2026 }
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ test: '3. /privacy Page', status: 'FAIL', details: { error: err.message } });
    }
    consoleErrors['privacy'] = errors;
    await page.close();
  }

  // ============================================
  // TEST 4: /login Page
  // ============================================
  console.log('\n=== TEST 4: /login Page ===');
  {
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    try {
      const response = await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 'N/A';
      console.log(`  Status: ${status}`);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-login.png'), fullPage: true });

      const title = await page.title();
      console.log(`  Title: ${title}`);

      // Check for login-related elements
      const hasLoginForm = await page.evaluate(() => {
        const body = document.body.textContent;
        return body.includes('로그인') || body.includes('Login') || body.includes('Google');
      });
      console.log(`  Login form found: ${hasLoginForm}`);

      results.push({
        test: '4. /login Page',
        status: status === 200 && hasLoginForm ? 'PASS' : 'FAIL',
        details: { httpStatus: status, title, hasLoginForm }
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ test: '4. /login Page', status: 'FAIL', details: { error: err.message } });
    }
    consoleErrors['login'] = errors;
    await page.close();
  }

  await browser.close();

  // ============================================
  // RESULTS SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('  RESULTS SUMMARY');
  console.log('='.repeat(60));

  for (const r of results) {
    const icon = r.status === 'PASS' ? '[PASS]' : '[FAIL]';
    console.log(`  ${icon} ${r.test}`);
    if (r.details) {
      for (const [k, v] of Object.entries(r.details)) {
        console.log(`       ${k}: ${v}`);
      }
    }
  }

  console.log('\n--- Console Errors by Page ---');
  let totalSevere = 0;
  for (const [page, errors] of Object.entries(consoleErrors)) {
    const severe = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('third-party') &&
      !e.includes('cookie') &&
      !e.includes('SameSite')
    );
    totalSevere += severe.length;
    console.log(`  [${page}] Total errors: ${errors.length}, Severe: ${severe.length}`);
    if (severe.length > 0) {
      severe.forEach(e => console.log(`    - ${e.substring(0, 200)}`));
    }
    if (errors.length > 0 && severe.length < errors.length) {
      const minor = errors.filter(e =>
        e.includes('favicon') || e.includes('404') || e.includes('third-party') || e.includes('cookie') || e.includes('SameSite')
      );
      if (minor.length > 0) {
        console.log(`    Minor (ignored): ${minor.length} (favicon/404/cookie related)`);
      }
    }
  }

  console.log(`\n  Total severe console errors across all pages: ${totalSevere}`);
  console.log(`  Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`\n  FINAL: ${passCount} PASS, ${failCount} FAIL out of ${results.length} tests`);

  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
