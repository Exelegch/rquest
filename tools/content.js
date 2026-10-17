// Shared helper for the tools: opens R Quest in a headless browser and returns its content
// (lessons, steps, units, text) from window.__RQ__. Starts the local server if it is not running.
const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const path = require('path');

const BASE = 'http://localhost:8080/';

async function serverUp() {
  try { const r = await fetch(BASE + 'index.html'); return r.ok; } catch { return false; }
}

async function withApp(fn) {
  let server = null;
  if (!(await serverUp())) {
    server = spawn(process.execPath, [path.join(__dirname, '..', 'tests', 'server.js')], { stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await serverUp()); i++) await new Promise(r => setTimeout(r, 100));
  }
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext();
    await ctx.addInitScript('window.RQ_CLOUD = { url: "", key: "" }; window.RQ_WEBR_BASE = "/no-webr/";');
    await ctx.route('**/no-webr/**', r => r.abort());
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.waitForFunction(() => !!window.__RQ__);
    const data = await page.evaluate(() => {
      const { CONTENT, STEPS, UNITS, I18N, DAILY, BADGES } = window.__RQ__;
      const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v));
      return strip({ CONTENT, STEPS, UNITS, I18N, DAILY, BADGES });
    });
    return await fn({ browser, page, data });
  } finally {
    await browser.close();
    if (server) server.kill();
  }
}

module.exports = { withApp, BASE };
