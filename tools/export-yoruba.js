// Exports every English / Yorùbá text pair to docs/yoruba-review.csv for a native speaker to check.
//   npm run yoruba
// Open the CSV in Excel, Google Sheets or LibreOffice. See docs/TRANSLATING.md.
const fs = require('fs');
const path = require('path');
const { withApp } = require('./content');

withApp(async ({ data }) => {
  const { CONTENT, STEPS, UNITS, I18N, DAILY, BADGES } = data;
  const rows = [['area', 'id', 'field', 'english', 'yoruba', 'suggested_yoruba', 'notes']];
  const add = (area, id, field, en, yo) => {
    if (en == null || en === '') return;
    const e = Array.isArray(en) ? en.join(' | ') : String(en);
    const y = yo == null ? 'MISSING' : Array.isArray(yo) ? yo.join(' | ') : String(yo);
    rows.push([area, id, field, e, y, '', '']);
  };
  const pair = (area, id, obj, field) => { if (obj && obj[field] != null) add(area, id, field, obj[field], obj[field + '_yo']); };

  for (const k of Object.keys(I18N.en)) add('app text', k, 'text', I18N.en[k], I18N.yo[k]);
  for (const track of ['learn', 'challenge', 'games', 'free']) {
    for (const it of CONTENT[track]) {
      for (const f of ['title', 'prompt', 'goal', 'clue']) pair(track, it.id, it, f);
      if (it.hint && it.hint_yo && it.hint_yo !== it.hint) pair(track, it.id, it, 'hint');
      (it.parts || []).forEach((p, n) => add(track, it.id, `part ${n + 1}`, p.text, p.text_yo));
      (it.inputs || []).forEach((inp, n) => { if (inp.label && !I18N.en[inp.label]) add(track, it.id, `input ${n + 1} label`, inp.label, inp.label_yo); });
    }
  }
  for (const [id, st] of Object.entries(STEPS)) {
    if (st.quiz.q) add('lesson steps', id, 'predict question', st.quiz.q, st.quiz.q_yo);
    if (st.quiz.options_yo) add('lesson steps', id, 'predict options', st.quiz.options, st.quiz.options_yo);
    add('lesson steps', id, 'predict explanation', st.quiz.why, st.quiz.why_yo);
    add('lesson steps', id, 'mission', st.mission.text, st.mission.text_yo);
    add('lesson steps', id, 'mission goal', st.mission.goal, st.mission.goal_yo);
  }
  for (const u of UNITS) {
    add('units', u.id, 'name', u.en, u.yo);
    add('units', u.id, 'skill', u.skill_en, u.skill_yo);
    (u.outcomes || []).forEach((o, n) => add('units', u.id, `outcome ${n + 1}`, o, (u.outcomes_yo || [])[n]));
  }
  for (const d of DAILY) for (const f of ['title', 'prompt', 'goal']) pair('daily puzzles', d.id, d, f);
  for (const b of BADGES) { add('badges', b.id, 'name', b.en[0], b.yo && b.yo[0]); add('badges', b.id, 'how to earn', b.en[1], b.yo && b.yo[1]); }

  const cell = (v) => /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  const csv = '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';
  const out = path.join(__dirname, '..', 'docs', 'yoruba-review.csv');
  fs.writeFileSync(out, csv);
  const missing = rows.filter(r => r[4] === 'MISSING').length;
  console.log(`Wrote ${rows.length - 1} rows to docs/yoruba-review.csv (${missing} without Yorùbá)`);
}).catch((e) => { console.error(e); process.exit(1); });
