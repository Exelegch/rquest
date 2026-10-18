// Checks every activity against real R. Run this after adding or editing lessons.
//  - Lessons: the code runs without an error; the Predict answer is exactly what R prints;
//    the mission rejects the lesson code and accepts the lesson code plus its hint.
//  - Exercises, bug fixes, projects and daily puzzles reject their starter and accept their answer
//    (bug fixes: the hint is the whole fixed program; others: starter + hint).
//  - Every text a child sees has a Yorùbá version.
const { test, expect } = require('@playwright/test');
const { makeBackend, setupContext, waitForR, run } = require('./helpers');

const norm = (s) => s.replace(/\s+/g, ' ').trim();

test('every lesson step and activity can be solved, and has Yorùbá', async ({ page, context }) => {
  test.setTimeout(1_800_000);
  await setupContext(context, makeBackend());
  await page.goto('/');
  const ids = await page.evaluate(() => window.__RQ__.CONTENT.learn.map(it => it.id));
  expect(ids.length).toBeGreaterThan(60);
  // Mark everything done so every node and step is open.
  // Predict answers are marked as already answered, so no bonus stars (and no level-up pop-ups) get in the way.
  await page.evaluate((all) => localStorage.setItem('rq2-state', JSON.stringify({ name: 'Tester', done: Object.fromEntries(all.map(i => [i, 1])), quiz: Object.fromEntries(all.map(i => [i, 1])) })), ids);
  await page.reload();
  await waitForR(page);

  // Yorùbá everywhere.
  const missingYo = await page.evaluate(() => {
    const { CONTENT, STEPS, I18N, DAILY, UNITS } = window.__RQ__; const out = [];
    for (const k of Object.keys(I18N.en)) if (I18N.yo[k] === undefined) out.push('I18N ' + k);
    for (const it of [...CONTENT.learn, ...CONTENT.challenge, ...CONTENT.games, ...CONTENT.free, ...DAILY]) {
      for (const f of ['title', 'prompt', 'goal', 'clue']) if (it[f] && !it[f + '_yo']) out.push(`${it.id}.${f}`);
      (it.parts || []).forEach((p, n) => { if (!p.text_yo) out.push(`${it.id}.part${n + 1}`); });
    }
    for (const [id, s] of Object.entries(STEPS)) {
      if (s.quiz.q && !s.quiz.q_yo) out.push(id + '.quiz.q');
      if (!s.quiz.why_yo) out.push(id + '.quiz.why');
      if (!s.mission.text_yo || !s.mission.goal_yo) out.push(id + '.mission');
    }
    for (const u of UNITS) if (!u.yo || !u.skill_yo || (u.outcomes || []).length !== (u.outcomes_yo || []).length) out.push('unit ' + u.id);
    const lessons = CONTENT.learn.filter(it => !it.exercise && !it.project).map(it => it.id);
    for (const id of lessons) if (!STEPS[id]) out.push(id + ' has no steps');
    return out;
  });
  expect(missingYo).toEqual([]);

  const problems = [];
  const solve = async (id, kind) => {
    const hintMode = await page.evaluate((i) => { const it = window.__RQ__.CONTENT.learn.concat(window.__RQ__.DAILY).find(x => x.id === i); return it.fix ? 'replace' : 'append'; }, id);
    await run(page);
    const starterRejected = await page.locator('#oops').isVisible();
    await page.click('#hint');
    const hint = await page.innerText('#hint-box code');
    const starter = await page.inputValue('#code');
    await page.fill('#code', hintMode === 'replace' ? hint : starter + '\n' + hint);
    await run(page);
    const accepted = !(await page.locator('#oops').isVisible());
    if (!starterRejected || !accepted) problems.push(`${id} (${kind}): starter rejected=${starterRejected}, answer accepted=${accepted}`);
  };

  for (const id of ids) {
    if (!(await page.locator('#pathview').isVisible())) await page.click('#back-path');
    await page.click(`.node[data-id="${id}"]`);
    const isLesson = await page.evaluate((i) => !!window.__RQ__.STEPS[i], id);
    if (!isLesson) { await solve(id, 'activity'); continue; }

    // 1. Try it
    await run(page);
    if (await page.locator('#oops').isVisible()) problems.push(`${id}: lesson code error: ${await page.textContent('#oops')}`);
    const lessonCode = await page.inputValue('#code');

    // 2. Predict: R must print exactly the right option.
    const quiz = await page.evaluate((i) => { const q = window.__RQ__.STEPS[i].quiz; return { code: q.code, verify: q.verify !== false, options: q.options, answer: q.answer }; }, id);
    if (quiz.verify) {
      await page.fill('#code', quiz.code);
      await run(page);
      const printed = norm(await page.innerText('#out'));
      if (printed !== norm(quiz.options[quiz.answer])) problems.push(`${id}: Predict says ${JSON.stringify(quiz.options[quiz.answer])} but R printed ${JSON.stringify(printed)}`);
      quiz.options.forEach((o, n) => { if (n !== quiz.answer && norm(o) === printed) problems.push(`${id}: wrong option ${n} is also what R prints`); });
    }
    await page.click('[data-step="2"]');
    await page.click(`.qopt[data-qopt="${quiz.answer}"]`);
    if (!(await page.locator('.qwhy:not(.bad)').isVisible())) problems.push(`${id}: right answer not accepted`);

    // 3. Your turn: the lesson code alone must not pass; lesson code + hint must.
    await page.click('[data-step="3"]');
    await page.fill('#code', lessonCode);
    await solve(id, 'mission');
  }

  // Daily puzzles: open each one through the test hook.
  const dailies = await page.evaluate(() => window.__RQ__.DAILY.map(d => d.id));
  for (const id of dailies) {
    await page.evaluate((i) => window.__RQ__.openDaily(i), id);
    await solve(id, 'daily');
  }
  expect(problems).toEqual([]);
});
