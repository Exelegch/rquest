// Accessibility: automated WCAG 2.1 A and AA checks (axe-core) on every main screen and pop-up,
// in normal and high-contrast mode. This does not replace testing with a real screen reader.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { makeBackend, setupContext, onboard, openParents } = require('./helpers');

test.beforeEach(async ({ context }) => { await setupContext(context, makeBackend()); });

async function check(page, label) {
  await page.waitForTimeout(700);   // let entrance animations finish so colours are final
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map(v => `${label}: ${v.id} (${v.impact}) ${v.help} -> ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
}

test('every screen passes automated accessibility checks', async ({ page }) => {
  test.setTimeout(240_000);
  const found = [];
  await page.goto('/');
  found.push(...await check(page, 'onboarding'));
  await page.fill('#ob-name', 'Kemi'); await page.click('#ob-go');
  found.push(...await check(page, 'path'));
  await page.click('#continue-btn');
  found.push(...await check(page, 'lesson'));
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('rq2-state')); s.stepAt = { L1: 3 }; localStorage.setItem('rq2-state', JSON.stringify(s)); });
  await page.reload(); await page.click('.node[data-id="L1"]'); await page.click('[data-step="2"]');
  found.push(...await check(page, 'predict'));
  await page.click('#fb-btn');
  found.push(...await check(page, 'feedback'));
  await page.keyboard.press('Escape');
  await page.click('#back-path'); await page.click('[data-speed]');
  found.push(...await check(page, 'speed quiz'));
  await page.keyboard.press('Escape');
  await page.click('[data-tab="challenge"]');
  found.push(...await check(page, 'challenges'));
  await page.click('[data-tab="games"]');
  found.push(...await check(page, 'games'));
  await page.click('[data-tab="stuff"]');
  found.push(...await check(page, 'my stuff'));
  await page.click('[data-set="contrast"]');
  found.push(...await check(page, 'my stuff, high contrast'));
  await page.click('[data-tab="learn"]');
  found.push(...await check(page, 'path, high contrast'));
  await page.click('[data-tab="stuff"]'); await page.click('[data-set="contrast"]');
  await openParents(page);
  found.push(...await check(page, 'parents'));
  await page.click('#lang-btn');
  found.push(...await check(page, 'parents in Yorùbá'));
  await page.goto('/privacy.html');
  found.push(...await check(page, 'privacy'));
  expect(found).toEqual([]);
});
