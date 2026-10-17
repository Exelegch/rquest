// Family accounts: sign up, save a child's progress, pick the child on a second device,
// and merge progress earned on two devices without losing any.
const { test, expect } = require('@playwright/test');
const { makeBackend, setupContext, onboard, waitForR, run, closeCelebrations, openParents, finishLesson } = require('./helpers');

test('progress follows a child across two devices', async ({ browser }) => {
  test.setTimeout(600_000);
  const backend = makeBackend();
  const phoneCtx = await browser.newContext(); await setupContext(phoneCtx, backend);
  const laptopCtx = await browser.newContext(); await setupContext(laptopCtx, backend);
  const phone = await phoneCtx.newPage(); const laptop = await laptopCtx.newPage();

  // Phone: a child learns first, then a parent creates the family account.
  await onboard(phone, 'Kemi', '🐑');
  await waitForR(phone);
  await phone.click('#continue-btn'); await finishLesson(phone); await closeCelebrations(phone);
  await openParents(phone);
  await phone.fill('#au-email', 'mum@example.com'); await phone.fill('#au-pass', '123');
  await phone.click('#au-create');
  await expect(phone.locator('.family .msg')).toContainText('at least 6');
  await expect(phone.locator('#au-email')).toHaveValue('mum@example.com');
  await phone.fill('#au-pass', 'secret12'); await phone.click('#au-create');
  await expect(phone.locator('#link-local')).toBeVisible();
  await phone.click('#link-local');
  await expect(phone.locator('.family .kids')).toContainText('Kemi');
  await expect(phone.locator('#cloud-pill')).toHaveText('☁️✓');
  await phone.fill('#kid-name', 'Tobi'); await phone.click('[data-nava="🦁"]'); await phone.click('#kid-form button[type=submit]');
  await expect(phone.locator('.family .kids')).toContainText('Tobi');
  expect(backend.rows.find(r => r.name === 'Kemi').state.stars).toBe(7);

  // Laptop: a wrong password is explained; then the child is picked from the list.
  await laptop.goto('/');
  await laptop.click('#ob-family');
  await openParents(laptop);
  await laptop.fill('#au-email', 'mum@example.com'); await laptop.fill('#au-pass', 'wrong-one');
  await laptop.click('#auth-form button[type=submit]');
  await expect(laptop.locator('.family .msg')).toContainText('do not match');
  await laptop.fill('#au-pass', 'secret12'); await laptop.click('#auth-form button[type=submit]');
  await expect(laptop.locator('#whopick')).toBeVisible();
  await laptop.click('#wp-grid [data-kid] >> text=Kemi');
  await expect(laptop.locator('#who')).toContainText('Kemi');
  await expect(laptop.locator('.node[data-id="L1"]')).toHaveClass(/done/);

  // Both devices earn stars before syncing; the totals must add up, not overwrite each other.
  await waitForR(laptop);
  await laptop.click('#continue-btn'); await finishLesson(laptop); await closeCelebrations(laptop);
  await phone.click('[data-tab="challenge"]'); await phone.click('[data-id="C2"]'); await phone.fill('#code', '50 + 50'); await run(phone); await closeCelebrations(phone);
  await laptop.waitForTimeout(3500); await phone.waitForTimeout(3500);
  await phone.reload(); await phone.waitForTimeout(2500);
  const kemi = backend.rows.find(r => r.name === 'Kemi').state;
  expect(Object.keys(kemi.done).sort()).toEqual(['C2', 'L1', 'L2']);
  expect(kemi.stars).toBe(29);
  await expect(phone.locator('#stars')).toHaveText('29', { timeout: 5000 });

  // Signing out keeps the device usable.
  await openParents(phone);
  await phone.click('#au-out');
  await expect(phone.locator('#auth-form')).toBeVisible();
  await expect(phone.locator('#cloud-pill')).toBeHidden();
  await phoneCtx.close(); await laptopCtx.close();
});
