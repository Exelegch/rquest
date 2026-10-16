// A copy of R Quest hosted at another address must not use the official Supabase project,
// and every copy must show where the source code is (required by the AGPL).
const { test, expect } = require('@playwright/test');

test('a copy on another address switches online saving off and links to the source', async ({ page, context }) => {
  const supabaseCalls = [];
  await context.route(/supabase\.co|supabase-js/, (route) => { supabaseCalls.push(route.request().url()); return route.abort(); });
  if (process.env.WEBR_DIR) await context.addInitScript('window.RQ_WEBR_BASE = "/webr/";');
  // 127.0.0.1 is not in OFFICIAL_HOSTS, so the page behaves like a copy hosted elsewhere.
  await page.goto('http://127.0.0.1:8080/');
  await page.fill('#ob-name', 'Ada');
  await expect(page.locator('#ob-family')).toBeHidden();
  await page.click('#ob-go');
  await page.click('[data-tab="parents"]');
  const q = await page.textContent('label[for="gate-in"]');
  const [a, b] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
  await page.fill('#gate-in', String(a * b));
  await page.click('#gate-form button[type=submit]');
  await expect(page.locator('.family')).toContainText('switched off on this copy');
  await expect(page.locator('#parents a[href="https://github.com/Exelegch/rquest"]')).toBeVisible();
  await page.click('[data-tab="stuff"]');
  await expect(page.locator('#about-line')).toContainText('AGPL-3.0');
  await page.waitForTimeout(1500);
  expect(supabaseCalls).toEqual([]);
});

test('the official address still uses online saving', async ({ page, context }) => {
  const supabaseCalls = [];
  await context.route(/supabase\.co|supabase-js/, (route) => { supabaseCalls.push(route.request().url()); return route.abort(); });
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(1500);
  expect(supabaseCalls.some((u) => u.includes('supabase-js'))).toBe(true);
});
