// The admin dashboard: sign-in, the not-an-admin message, and the numbers for an admin.
const { test, expect } = require('@playwright/test');

const FAKE = `
window.supabase = { createClient() {
  let session = JSON.parse(localStorage.getItem('fs') || 'null'); const ls = [];
  return {
    auth: {
      async getSession() { return { data: { session } }; },
      onAuthStateChange(cb) { ls.push(cb); },
      async signInWithPassword({ email, password }) { if (password !== 'pw123456') return { error: { message: 'Invalid login credentials' } }; session = { user: { email } }; localStorage.setItem('fs', JSON.stringify(session)); return { data: { session }, error: null }; },
      async signOut() { session = null; localStorage.removeItem('fs'); ls.forEach(c => c('SIGNED_OUT')); return {}; },
    },
    async rpc(name, args) {
      if (session.user.email !== 'admin@example.com') return { data: null, error: { message: 'Only R Quest admins can see these numbers' } };
      const today = new Date().toISOString().slice(0, 10);
      return { data: { totals: { learners_today: 3, learners_period: 12, learners_7d: 9, completions_period: 40, yoruba_learners: 2, families: 4, children: 6, errors_period: 1 },
        daily: [{ day: today, learners: 3, completions: 7 }],
        items: [{ item: 'E4', completed: 2, played: 0, wins: 0, run_errors: 4, not_yet: 6 }, { item: 'L1', completed: 12, played: 0, wins: 0, run_errors: 0, not_yet: 0 }],
        errors: [{ message: 'R failed to start: timeout', n: 1, last_seen: new Date().toISOString(), version: '2026.10.16' }] }, error: null };
    },
    from() { return { delete() { return { gte: async () => ({ error: null }) }; } }; },
  };
} };`;

test.beforeEach(async ({ context }) => {
  await context.route('**/supabase-js@*/dist/umd/supabase.js', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE }));
});

test('non-admins are told how to become an admin', async ({ page }) => {
  await page.goto('/admin.html');
  await page.fill('#em', 'parent@example.com'); await page.fill('#pw', 'nope'); await page.click('form.signin button');
  await expect(page.locator('.msg')).toContainText('do not match');
  await page.fill('#pw', 'pw123456'); await page.click('form.signin button');
  await expect(page.locator('main')).toContainText('not an admin yet');
  await expect(page.locator('pre')).toContainText("email = 'parent@example.com'");
});

test('admins see learners, stuck points and errors', async ({ page }) => {
  await page.goto('/admin.html');
  await page.fill('#em', 'admin@example.com'); await page.fill('#pw', 'pw123456'); await page.click('form.signin button');
  await expect(page.locator('.tile.hero .value')).toHaveText('3');
  await expect(page.locator('.chart .col').first()).toBeAttached();
  await expect(page.locator('main')).toContainText('Top score');
  await expect(page.locator('main')).toContainText('Children get stuck');
  await expect(page.locator('main')).toContainText('R failed to start');
});
