// Core app behaviour: onboarding, the learning path, lessons, exercises, challenges,
// games, error messages, language switching, the parent page and usage events.
const { test, expect } = require('@playwright/test');
const { makeBackend, setupContext, onboard, waitForR, run, closeCelebrations, openParents, finishLesson } = require('./helpers');

let backend;
test.beforeEach(async ({ context }) => { backend = makeBackend(); await setupContext(context, backend); });

test('onboarding needs a name, then shows the learning path @phone', async ({ page }) => {
  await page.goto('/');
  await page.click('#ob-go');
  await expect(page.locator('#ob-err')).toBeVisible();
  await page.fill('#ob-name', 'Kemi');
  await page.click('#ob-go');
  await expect(page.locator('#pathview')).toBeVisible();
  await expect(page.locator('.unit')).toHaveCount(8);
  await expect(page.locator('.unit .uage').first()).toHaveText('Ages 7+');
  await expect(page.locator('.node.current')).toHaveAttribute('data-id', 'L1');
  await expect(page.locator('.hero .bubble')).toContainText('Kemi');
  const [scrollWidth, width] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(width);
});

test('locked lessons stay locked until the one before is finished', async ({ page }) => {
  await onboard(page);
  await page.click('.node[data-id="L2"]');
  await expect(page.locator('#pathview')).toBeVisible();
  await expect(page.locator('.hero .bubble')).toContainText('Finish the lesson before');
});

test('a lesson has three steps: try it, predict, your turn', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('#continue-btn');
  await expect(page.locator('.steps .on')).toContainText('Try it');
  await expect(page.locator('[data-step="3"]')).toHaveAttribute('aria-disabled', 'true');
  await run(page);
  await expect(page.locator('#out')).toContainText('Hello from R!');
  await expect(page.locator('#stars')).toHaveText('0');
  await page.click('#next-btn');
  // Predict: a wrong answer explains nothing away, earns no bonus, and the right one shows why.
  await expect(page.locator('.quiz .qq')).toContainText('What will R print?');
  await expect(page.locator('#run')).toBeHidden();
  await page.click('.qopt[data-qopt="1"]');
  await expect(page.locator('.qwhy.bad')).toBeVisible();
  await page.click('.qopt[data-qopt="0"]');
  await expect(page.locator('.qwhy')).toContainText('quote marks');
  await page.click('#next-btn');
  // Your turn: the lesson code alone is not enough; the mission is checked.
  await expect(page.locator('#run')).toHaveText(/Check/);
  await run(page);
  await expect(page.locator('#oops')).toContainText('Not yet');
  await page.fill('#code', 'print("Hello")\nprint("Hi")\nprint("I love amala")');
  await run(page);
  await expect(page.locator('#oops')).toBeHidden();
  await expect(page.locator('#stars')).toHaveText('5', { timeout: 5000 });
  await expect(page.locator('#next-btn')).toContainText('Super calculator');
  await page.click('#back-path');
  await expect(page.locator('.node[data-id="L1"]')).toHaveClass(/done/);
  await expect(page.locator('.node[data-id="L2"]')).toHaveClass(/current/);
});

test('mistakes get a friendly explanation and earn no stars', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('#continue-btn');
  await page.fill('#code', 'print(hello)');
  await run(page);
  await expect(page.locator('#oops')).toContainText('doesn\'t know anything called “hello”');
  await page.fill('#code', 'prnt("x")');
  await run(page);
  await expect(page.locator('#oops')).toContainText('no command called prnt()');
  await expect(page.locator('#stars')).toHaveText('0');
});

test('an exercise rejects a wrong answer and accepts a right one', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('rq2-state', JSON.stringify({ name: 'Kemi', done: { L1: 1, L2: 1, L3: 1 } })));
  await page.reload();
  await waitForR(page);
  await page.click('.node[data-id="E1"]');
  await expect(page.locator('#run')).toHaveText(/Check/);
  await page.fill('#code', '24 + 60');
  await run(page);
  await expect(page.locator('#oops')).toContainText('Not yet');
  await page.fill('#code', '24 * 60');
  await run(page);
  await expect(page.locator('#oops')).toBeHidden();
  await expect(page.locator('#c-msg')).toHaveText(/Exercise complete/);
});

test('a challenge is checked inside R', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('[data-tab="challenge"]');
  await page.click('[data-id="C10"]');
  await page.fill('#code', 'double <- function(x) { x * 3 }\ndouble(21)');
  await run(page);
  await expect(page.locator('#oops')).toContainText('Not yet');
  await page.fill('#code', 'double <- function(x) { x * 2 }\ndouble(21)');
  await run(page);
  await expect(page.locator('#oops')).toBeHidden();
  await expect(page.locator('[data-id="C10"] .tag.done')).toBeVisible();
});

test('game controls change the code, and difficulty changes the range', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('[data-tab="games"]');
  await expect(page.locator('#code')).toHaveValue(/max_number <- 10/);
  await page.click('[data-diff="hard"]');
  await expect(page.locator('#code')).toHaveValue(/max_number <- 100/);
  await page.fill('#in-G1-my_guess', '50');
  await expect(page.locator('#code')).toHaveValue(/my_guess <- 50/);
  await run(page);
  await expect(page.locator('#out')).toContainText(/Higher|Lower|YES/);
  await page.click('[data-id="G2"]');
  await page.click('[data-choice="paper"]');
  await expect(page.locator('#run')).not.toHaveAttribute('aria-busy', 'true', { timeout: 60_000 });
  await expect(page.locator('#out')).toContainText('You: paper');
});

test('switching to Yorùbá translates the app', async ({ page }) => {
  await onboard(page);
  await page.click('#lang-btn');
  await expect(page.locator('[data-tab="learn"]')).toHaveText('📚 Ẹ̀kọ́');
  await expect(page.locator('.unit h3').first()).toHaveText('Bá R sọ̀rọ̀');
  await page.click('#lang-btn');
  await expect(page.locator('[data-tab="learn"]')).toHaveText('📚 Learn');
});

test('the parent page is behind a sum and shows progress', async ({ page }) => {
  await onboard(page);
  await page.click('[data-tab="parents"]');
  await page.fill('#gate-in', '1');
  await page.click('#gate-form button[type=submit]');
  await expect(page.locator('#gate-err')).toBeVisible();
  await openParents(page);
  await expect(page.locator('#parents')).toContainText("Kemi's progress");
  await expect(page.locator('#parents')).toContainText('Skills learned');
});

test('usage events are sent without names', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('#continue-btn');
  await finishLesson(page);
  await closeCelebrations(page);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => backend.events.map(e => e.kind + ':' + (e.item || '')), { timeout: 15_000 }).toContain('lesson_done:L1');
  expect(backend.events.map(e => e.kind)).toContain('open');
  expect(JSON.stringify(backend.events)).not.toContain('Kemi');
});

test('app errors are reported once, without names', async ({ page }) => {
  await onboard(page);
  await page.evaluate(() => { setTimeout(() => { throw new Error('test explosion'); }, 0); setTimeout(() => { throw new Error('test explosion'); }, 10); });
  await expect.poll(() => backend.errors.length, { timeout: 10_000 }).toBe(1);
  expect(backend.errors[0].message).toContain('test explosion');
  expect(JSON.stringify(backend.errors[0])).not.toContain('Kemi');
});

test('offline: the app still opens and explains that R needs the internet', async ({ page, context }) => {
  await onboard(page);
  await waitForR(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await waitForR(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#pathview')).toBeVisible();
  await expect(page.locator('#down-card')).toContainText('You are offline');
  await context.setOffline(false);
  await page.evaluate(() => dispatchEvent(new Event('online')));
  await waitForR(page);
});

test('a Predict answer right first time earns a bonus, and steps can be revisited', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('#continue-btn');
  await finishLesson(page);
  await expect(page.locator('#stars')).toHaveText('7', { timeout: 5000 });
  await closeCelebrations(page);
  await page.click('[data-step="2"]');
  await expect(page.locator('.quiz')).toBeVisible();
  await page.click('[data-step="1"]');
  await expect(page.locator('#code')).toBeVisible();
});

test('a bug fix and a project are checked part by part', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('rq2-state', JSON.stringify({ name: 'Kemi', done: { L1: 1, L2: 1, L3: 1, E1: 1, E2: 1 } })));
  await page.reload();
  await waitForR(page);
  await page.click('.node[data-id="B1"]');
  await expect(page.locator('#prompt')).toContainText('Clue');
  await run(page);
  await expect(page.locator('#oops')).toContainText('R got stuck');
  await page.fill('#code', 'greeting <- "Welcome to R Quest"\nprint(greeting)');
  await run(page);
  await expect(page.locator('#c-msg')).toHaveText('Bug fixed!');
  await closeCelebrations(page);
  await page.click('#back-path');
  await page.click('.node[data-id="P1"]');
  await page.fill('#code', 'my_name <- "Kemi"\nmy_age <- 9');
  await run(page);
  await expect(page.locator('#oops')).toContainText('2 of 4 parts done');
  await expect(page.locator('.parts li.ok')).toHaveCount(2);
  await page.fill('#code', 'my_name <- "Kemi"\nmy_age <- 9\ncat("I am", my_name, "and I am", my_age, "\\n")\nmy_age * 12');
  await run(page);
  await expect(page.locator('.parts li.ok')).toHaveCount(4);
  await expect(page.locator('#c-msg')).toHaveText('Unit complete!');
  await closeCelebrations(page);
  await page.click('#back-path');
  await expect(page.locator('.unit').first().locator('.cert-btn')).toBeVisible();
});

test('the daily puzzle gives stars once a day and starts a streak', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  const daily = await page.evaluate(() => window.__RQ__.todayDaily());
  await expect(page.locator('[data-daily]')).toContainText(daily.title);
  await page.click('[data-daily]');
  await expect(page.locator('#list-title')).toHaveText("Today's puzzle");
  await run(page);
  await expect(page.locator('#oops')).toContainText('Not yet');
  await page.click('#hint');
  await page.fill('#code', (await page.inputValue('#code')) + '\n' + (await page.innerText('#hint-box code')));
  await run(page);
  await expect(page.locator('#stars')).toHaveText('10', { timeout: 5000 });
  await closeCelebrations(page);
  await run(page);
  await expect(page.locator('#stars')).toHaveText('10');
  await page.click('#back-path');
  await expect(page.locator('[data-daily]')).toHaveClass(/solved/);
  await expect(page.locator('[data-daily]')).toContainText('1-day puzzle streak');
});

test('the speed quiz counts right answers and gives stars', async ({ page, context }) => {
  await context.addInitScript('window.RQ_SPEED_SECONDS = 6;');
  await onboard(page);
  await page.click('[data-speed]');
  await expect(page.locator('#sq-h')).toHaveText('Speed quiz');
  await page.click('#sq-go');
  const quizzes = await page.evaluate(() => Object.fromEntries(Object.values(window.__RQ__.STEPS).filter(s => s.quiz.code).map(s => [s.quiz.code, s.quiz.answer])));
  let answered = 0;
  while (answered < 3 && await page.locator('.qcode').isVisible()) {
    const code = await page.locator('.qcode').innerText();
    await page.click(`[data-sq="${quizzes[code.trim()]}"]`);
    answered++;
    await page.waitForTimeout(450);
  }
  await expect(page.locator('.sq-result b')).toHaveText(String(answered), { timeout: 10_000 });
  await expect(page.locator('#stars')).toHaveText(String(answered), { timeout: 5000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('#speedquiz')).toBeHidden();
});

test('a finished unit has a certificate that can be saved', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('rq2-state', JSON.stringify({ name: 'Kemi', done: Object.fromEntries(['L1', 'L2', 'L3', 'E1', 'E2', 'B1', 'P1'].map(i => [i, 1])) })));
  await page.reload();
  await page.click('.unit .cert-btn');
  await expect(page.locator('#cert')).toBeVisible();
  await expect(page.locator('#cert-canvas')).toHaveAttribute('aria-label', /Kemi, Talk to R/);
  const inked = await page.evaluate(() => { const c = document.getElementById('cert-canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 400) if (d[i] < 100) n++; return n; });
  expect(inked).toBeGreaterThan(500);
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#cert-save')]);
  expect(download.suggestedFilename()).toBe('r-quest-certificate-u1.png');
  await page.click('#cert-close');
  await expect(page.locator('#cert')).toBeHidden();
});

test('settings change text size, contrast and motion, and are remembered', async ({ page }) => {
  await onboard(page);
  await page.click('[data-tab="stuff"]');
  await page.click('[data-ts="2"]');
  await page.click('[data-set="contrast"]');
  await page.click('[data-set="calm"]');
  await expect(page.locator('body')).toHaveClass(/bigger/);
  await expect(page.locator('body')).toHaveClass(/contrast/);
  await expect(page.locator('body')).toHaveClass(/calm/);
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/contrast/);
  await expect(page.locator('#big-btn')).toHaveText('A++');
});

test('feedback is sent with emails and phone numbers removed', async ({ page }) => {
  await onboard(page);
  await page.click('#continue-btn');
  await page.click('#fb-btn');
  await page.click('#fb-send');
  await expect(page.locator('#fb-msg')).toHaveText('Pick a face first.');
  await page.click('[data-mood="confusing"]');
  await page.fill('#fb-text', 'Kemi here, email kemi@example.com or call 0803 123 4567');
  await page.click('#fb-send');
  await expect(page.locator('#fb-msg')).toContainText('Thank you');
  expect(backend.feedback).toHaveLength(1);
  const f = backend.feedback[0];
  expect(f).toMatchObject({ item: 'L1', mood: 'confusing', lang: 'en' });
  expect(f.message).toContain('[email removed]');
  expect(f.message).toContain('[number removed]');
  expect(f.message).not.toContain('example.com');
  await expect(page.locator('#feedback')).toBeHidden({ timeout: 5000 });
});

test('parents can stop usage counts and delete the data on this device', async ({ page }) => {
  await onboard(page);
  await openParents(page);
  await expect(page.locator('#usage-sw')).toHaveAttribute('aria-checked', 'true');
  await page.click('#usage-sw');
  await expect(page.locator('#usage-sw')).toHaveAttribute('aria-checked', 'false');
  const before = backend.events.length;
  await page.click('[data-tab="learn"]');
  await page.click('#continue-btn');
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(500);
  expect(backend.events.length).toBe(before);
  const oldDevice = await page.evaluate(() => localStorage.getItem('rq-device'));
  await page.click('[data-tab="parents"]');   // still unlocked from before
  await page.click('#del-device');
  await page.click('#del-yes');
  await expect(page.locator('#onboard')).toBeVisible({ timeout: 10_000 });
  expect(await page.evaluate(() => localStorage.getItem('rq2-state'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('rq-device'))).not.toBe(oldDevice);
});

test('a parent can delete the whole family account', async ({ page }) => {
  await onboard(page);
  await openParents(page);
  await page.fill('#au-email', 'dad@example.com'); await page.fill('#au-pass', 'secret12');
  await page.click('#au-create');
  await page.click('#link-local');
  await expect(page.locator('.family .kids')).toContainText('Kemi');
  expect(backend.rows).toHaveLength(1);
  await page.click('#del-family');
  await expect(page.locator('#del-area')).toContainText('every child in it');
  await page.click('#del-yes');
  await expect(page.locator('#del-area')).toContainText('has been deleted');
  await expect(page.locator('#onboard')).toBeVisible({ timeout: 10_000 });
  expect(backend.rows).toHaveLength(0);
  expect(Object.keys(backend.users)).toEqual([]);
});

test('the privacy page explains what is collected, in both languages', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.locator('#en h2').first()).toHaveText('The short version');
  await page.click('[data-lang="yo"]');
  await expect(page.locator('#yo')).toBeVisible();
  await expect(page.locator('#yo h2').first()).toHaveText('Ní ṣókí');
  await expect(page.locator('html')).toHaveAttribute('lang', 'yo');
});
