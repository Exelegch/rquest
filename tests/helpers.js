// Shared helpers for the R Quest tests.
// Every test runs against a pretend Supabase, so tests never touch the real database.
const { expect } = require('@playwright/test');

const FAKE_SUPABASE = `
window.RQ_CLOUD = { url: 'https://fake-project.supabase.co', key: 'sb_publishable_test' };
window.supabase = { createClient() {
  const listeners = []; let session = JSON.parse(localStorage.getItem('fake-session') || 'null');
  const emit = (ev) => listeners.forEach(cb => cb(ev, session));
  const keep = () => session ? localStorage.setItem('fake-session', JSON.stringify(session)) : localStorage.removeItem('fake-session');
  const auth = {
    async getSession() { return { data: { session } }; },
    onAuthStateChange(cb) { listeners.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
    async signInWithPassword({ email, password }) { const r = await window.__sb('signin', { email, password }); if (r.error) return { data: {}, error: { message: r.error } }; session = { user: { id: r.id, email } }; keep(); emit('SIGNED_IN'); return { data: { session }, error: null }; },
    async signUp({ email, password }) { const r = await window.__sb('signup', { email, password }); if (r.error) return { data: {}, error: { message: r.error } }; session = { user: { id: r.id, email } }; keep(); emit('SIGNED_IN'); return { data: { session, user: session.user }, error: null }; },
    async signOut() { session = null; keep(); emit('SIGNED_OUT'); return { error: null }; },
    async resetPasswordForEmail() { return { data: {}, error: null }; },
    async updateUser() { return { data: {}, error: null }; },
  };
  function from() {
    const q = { op: 'select', filters: [], payload: null, single: false };
    const b = {
      select() { return b; }, order() { return b; },
      insert(p) { q.op = 'insert'; q.payload = p; return b; },
      update(p) { q.op = 'update'; q.payload = p; return b; },
      delete() { q.op = 'delete'; return b; },
      eq(c, v) { q.filters.push([c, v]); return b; },
      single() { q.single = true; return b; },
      then(res, rej) { return window.__sb('table', { q, uid: session && session.user.id }).then(r => { if (q.single && Array.isArray(r.data)) r.data = r.data[0]; return r; }).then(res, rej); },
    };
    return b;
  }
  async function rpc(name, args) { return window.__sb('rpc', { name, args, uid: session && session.user.id }); }
  return { auth, from, rpc };
} };`;

/** A pretend Supabase backend shared by every page in one test (so two "devices" see the same data). */
function makeBackend() {
  const users = {}; const rows = []; const events = []; const errors = []; const feedback = []; let n = 0;
  const handle = (op, a) => {
    if (op === 'signup') { if (users[a.email]) return { error: 'User already registered' }; users[a.email] = { id: 'u' + (++n), password: a.password }; return { id: users[a.email].id }; }
    if (op === 'signin') { const u = users[a.email]; if (!u || u.password !== a.password) return { error: 'Invalid login credentials' }; return { id: u.id }; }
    if (op === 'rpc') {
      if (!a.uid) return { data: null, error: { message: 'Please sign in first' } };
      if (a.name === 'delete_my_account') {
        for (let i = rows.length - 1; i >= 0; i--) if (rows[i].parent_id === a.uid) rows.splice(i, 1);
        for (const e of Object.keys(users)) if (users[e].id === a.uid) delete users[e];
        return { data: null, error: null };
      }
      return { data: null, error: { message: 'unknown function' } };
    }
    const { q, uid } = a; if (!uid) return { data: null, error: { message: 'not authenticated' } };
    const mine = rows.filter(r => r.parent_id === uid && q.filters.every(([c, v]) => r[c] === v));
    if (q.op === 'select') return { data: JSON.parse(JSON.stringify(mine)), error: null };
    if (q.op === 'insert') { const list = [].concat(q.payload).map(p => ({ id: 'c' + (++n), parent_id: uid, created_at: Date.now() + n, avatar: '🕊️', state: {}, ...JSON.parse(JSON.stringify(p)) })); rows.push(...list); return { data: JSON.parse(JSON.stringify(list)), error: null }; }
    if (q.op === 'update') { mine.forEach(r => Object.assign(r, JSON.parse(JSON.stringify(q.payload)))); return { data: null, error: null }; }
    if (q.op === 'delete') { mine.forEach(r => rows.splice(rows.indexOf(r), 1)); return { data: null, error: null }; }
    return { data: null, error: { message: 'unknown' } };
  };
  return { users, rows, events, errors, feedback, handle };
}

/** Prepare a browser context: pretend Supabase, optional local webR, captured usage events. */
async function setupContext(context, backend) {
  await context.exposeFunction('__sb', (op, args) => backend.handle(op, args));
  const webr = process.env.WEBR_DIR ? 'window.RQ_WEBR_BASE = "/webr/";' : '';
  // The one-time privacy note is tested on its own; elsewhere it is marked as already seen.
  const seen = 'try { if (!window.RQ_PRIVACY_TEST) localStorage.setItem("rq-privacy-seen", "true"); } catch (e) {}';
  await context.addInitScript(webr + seen + FAKE_SUPABASE);
  await context.route('https://fake-project.supabase.co/rest/v1/**', async (route) => {
    const req = route.request();
    const body = req.postDataJSON();
    if (req.url().includes('app_events')) backend.events.push(...[].concat(body));
    if (req.url().includes('app_errors')) backend.errors.push(body);
    if (req.url().includes('/feedback')) backend.feedback.push(body);
    await route.fulfill({ status: 201, body: '' });
  });
}

async function onboard(page, name = 'Kemi', animal = '🐑') {
  await page.goto('/');
  await page.fill('#ob-name', name);
  await page.click(`[data-ava="${animal}"]`);
  await page.click('#ob-go');
  await expect(page.locator('#onboard')).toBeHidden();
}

async function waitForR(page) {
  await expect(page.locator('#status')).toHaveClass(/ready/, { timeout: 180_000 });
}

async function run(page) {
  await page.click('#run');
  await expect(page.locator('#run')).not.toHaveAttribute('aria-busy', 'true', { timeout: 60_000 });
  await page.waitForTimeout(150);
}

/** The id of the activity open in the studio. */
const currentId = (page) => page.getAttribute('#list .item[aria-current="true"]', 'data-id');

/** Finish the open lesson: try it, answer the Predict question right first time, then solve the mission with its hint. */
async function finishLesson(page) {
  await run(page);
  await page.click('#next-btn');
  const id = await currentId(page);
  const answer = await page.evaluate((i) => window.__RQ__.STEPS[i].quiz.answer, id);
  await page.click(`.qopt[data-qopt="${answer}"]`);
  await page.click('#next-btn');
  await page.click('#hint');
  const hint = await page.innerText('#hint-box code');
  await page.fill('#code', (await page.inputValue('#code')) + '\n' + hint);
  await run(page);
  await expect(page.locator('#oops')).toBeHidden();
}

async function closeCelebrations(page) {
  await page.waitForTimeout(2400);
  if (await page.locator('#levelup').isVisible()) await page.click('#lu-ok');
}

async function openParents(page) {
  await page.click('[data-tab="parents"]');
  const q = await page.textContent('label[for="gate-in"]');
  const [a, b] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
  await page.fill('#gate-in', String(a * b));
  await page.click('#gate-form button[type=submit]');
}

module.exports = { makeBackend, setupContext, onboard, waitForR, run, closeCelebrations, openParents, finishLesson, currentId, FAKE_SUPABASE };
