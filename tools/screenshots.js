// Regenerates the README screenshots:  WEBR_DIR=... node tools/screenshots.js  (with `npm start` running)
const { chromium } = require('@playwright/test');
const { FAKE_SUPABASE } = require('../tests/helpers');
const OUT = __dirname + '/../docs/screenshots/';
const BASE = 'http://localhost:8080/';
(async () => {
  const b = await chromium.launch();
  const init = (process.env.WEBR_DIR ? 'window.RQ_WEBR_BASE="/webr/";' : '') + 'window.RQ_CLOUD={url:"",key:""};';
  const day = (d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)(new Date());
  const progress = { name: 'Kemi', avatar: '🐑', stars: 46, streak: 4, lastDay: new Date().toDateString(), done: { L1: 1, L2: 1, L3: 1, E1: 1, E2: 1, B1: 1, P1: 1, L4: 1, L5: 1, L15: 1, L16: 1, L17: 1, E3: 1, E4: 1, B2: 1, P2: 1 }, stepAt: { L6: 3 }, certs: { u1: day, u2: day },
    badges: { first_run: 1, first_plot: 1, five_lessons: 1, unit_done: 1, bug_hunter: 1, builder: 1 }, daily: {}, day: { date: day, stars: 14 }, hist: { [day]: 14 } };
  async function page(opts) {
    const ctx = await b.newContext(opts); await ctx.addInitScript(init);
    await ctx.addInitScript((st) => { if (!localStorage.getItem('rq2-state')) localStorage.setItem('rq2-state', JSON.stringify(st)); }, progress);
    return ctx.newPage();
  }
  const ready = (p) => p.waitForFunction(() => document.getElementById('status').className.includes('ready'), null, { timeout: 180000 });
  const runIt = async (p) => { await p.click('#run'); await p.waitForFunction(() => !document.getElementById('run').hasAttribute('aria-busy')); await p.waitForTimeout(2600); if (await p.isVisible('#levelup')) await p.click('#lu-ok'); };

  const p = await page({ viewport: { width: 1280, height: 860 } });
  await p.goto(BASE); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'path.png' });
  await ready(p);
  await p.click('.node[data-id="L6"]'); await runIt(p); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + 'lesson.png' });
  await p.click('[data-step="2"]'); await p.click('.qopt[data-qopt="0"]'); await p.waitForTimeout(700);
  await p.screenshot({ path: OUT + 'predict.png' });
  await p.click('#back-path'); await p.click('.unit .cert-btn'); await p.waitForTimeout(900);
  await p.locator('#cert .sheet').screenshot({ path: OUT + 'certificate.png' });
  await p.click('#cert-close');
  await p.click('[data-tab="games"]'); await p.click('[data-id="G15"]'); await runIt(p);
  await p.screenshot({ path: OUT + 'game.png' });
  await p.click('[data-tab="parents"]');
  const q = await p.textContent('label[for="gate-in"]'); const [x, y] = q.match(/(\d+) × (\d+)/).slice(1).map(Number);
  await p.fill('#gate-in', String(x * y)); await p.click('#gate-form button[type=submit]'); await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + 'parents.png' });

  const m = await page({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  await m.goto(BASE); await m.click('#lang-btn'); await m.waitForTimeout(3800);
  await m.screenshot({ path: OUT + 'phone-yoruba.png' });
  await b.close();
})();
