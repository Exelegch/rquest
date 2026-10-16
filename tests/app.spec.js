// Core app behaviour: onboarding, the learning path, lessons, exercises, challenges,
// games, error messages, language switching, the parent page and usage events.
const { test, expect } = require('@playwright/test');
const { makeBackend, setupContext, onboard, waitForR, run, closeCelebrations, openParents } = require('./helpers');

let backend;
test.beforeEach(async ({ context }) => { backend = makeBackend(); await setupContext(context, backend); });

test('onboarding needs a name, then shows the learning path @phone', async ({ page }) => {
  await page.goto('/');
  await page.click('#ob-go');
  await expect(page.locator('#ob-err')).toBeVisible();
  await page.fill('#ob-name', 'Kemi');
  await page.click('#ob-go');
  await expect(page.locator('#pathview')).toBeVisible();
  await expect(page.locator('.unit')).toHaveCount(7);
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

test('a lesson runs R, earns stars and unlocks the next one', async ({ page }) => {
  await onboard(page);
  await waitForR(page);
  await page.click('#continue-btn');
  await run(page);
  await expect(page.locator('#out')).toContainText('Hello from R!');
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
  await run(page);
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
