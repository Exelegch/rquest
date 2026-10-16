// Every lesson must run without an R error, and every exercise must reject its starter code
// and accept its own hint. Run this after adding or editing lessons.
const { test, expect } = require('@playwright/test');
const { makeBackend, setupContext, waitForR, run } = require('./helpers');

test('every lesson runs and every exercise can be solved with its hint', async ({ page, context }) => {
  test.setTimeout(900_000);
  await setupContext(context, makeBackend());
  await page.goto('/');
  const ids = await page.evaluate(() => [...document.querySelectorAll('.node')].map(n => n.dataset.id));
  expect(ids.length).toBeGreaterThan(40);
  await page.evaluate((all) => localStorage.setItem('rq2-state', JSON.stringify({ name: 'Tester', done: Object.fromEntries(all.map(i => [i, 1])) })), ids);
  await page.reload();
  await waitForR(page);
  const problems = [];
  for (const id of ids) {
    if (!(await page.locator('#pathview').isVisible())) await page.click('#back-path');
    await page.click(`.node[data-id="${id}"]`);
    if (id.startsWith('L')) {
      await run(page);
      if (await page.locator('#oops').isVisible()) problems.push(`${id}: ${await page.textContent('#oops')}`);
    } else {
      await run(page);
      const starterRejected = await page.locator('#oops').isVisible();
      await page.click('#hint');
      const hint = await page.innerText('#hint-box code');
      const starter = await page.inputValue('#code');
      await page.fill('#code', starter + '\n' + hint);
      await run(page);
      const hintAccepted = !(await page.locator('#oops').isVisible());
      if (!starterRejected || !hintAccepted) problems.push(`${id}: starter rejected=${starterRejected}, hint accepted=${hintAccepted}`);
    }
  }
  expect(problems).toEqual([]);
});
