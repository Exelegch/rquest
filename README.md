# R Quest 🕊️

**A free, bilingual (English and Yorùbá) R coding playground for children.**
Kids learn real R by drawing charts, playing games, solving puzzles and exploring Bible stories, right in the browser on a phone or computer. Nothing to install.

### ▶ [Open R Quest](https://exelegch.github.io/rquest/)

[![Tests](https://github.com/Exelegch/rquest/actions/workflows/test.yml/badge.svg)](https://github.com/Exelegch/rquest/actions/workflows/test.yml)

<p>
  <img src="docs/screenshots/path.png" alt="The learning path with units, lessons and today's goal" width="64%">
  <img src="docs/screenshots/phone-yoruba.png" alt="R Quest on a phone, in Yorùbá" width="30%">
</p>

---

## What children get

- **A learning path of 7 units:** 30 short lessons and 14 auto-checked exercises, unlocked one step at a time.
- **15 challenges** that check the answer inside R, labelled Easy, Medium or Hard.
- **20 games** children change by typing or tapping, such as Guess the number, Treasure hunt, Ludo race, Music maker and Bible quiz. Several have Easy, Medium and Hard levels with bonus stars.
- **Real R, really running:** code runs on [webR](https://docs.r-wasm.org/webr/latest/), R compiled for the browser, so charts, loops, data frames and real datasets like `iris` all work.
- **Friendly help:** R's error messages are explained in plain words, there's a 💡 hint on every exercise, and a 🔈 button reads instructions aloud.
- **Phone-first:** a light code editor with a row of symbol keys (`<-`, `( )`, `" "`), a Blocks mode for beginners, and a bigger-text button.
- **Motivation:** stars, levels, a daily goal, streaks, 17 badges, confetti, an animated dove mascot, and a gallery of saved drawings.
- **Culture and faith:** Nigerian examples (market prices in Naira, jollof votes, adire cloth, Ludo) and Bible activities (memory verses, Noah's ark, the feeding of the 5,000). Verses are from the King James Version.
- **Two languages:** every screen, lesson and hint is in English and Yorùbá. R code itself stays in English.

<p>
  <img src="docs/screenshots/lesson.png" alt="A lesson: the code, R's answer, and the chart it drew" width="49%">
  <img src="docs/screenshots/game.png" alt="Noah's rainbow game" width="49%">
</p>

## What parents get

- **A parent page** behind a simple sum, so children don't wander in. It shows progress, stars this week, minutes spent coding, skills learned, and tips for helping.
- **Family accounts:** a grown-up signs in once with an email. Each child is only a first name and an animal picture. Progress follows the child to any phone or computer, and if a child uses two devices before they sync, the progress is combined, never overwritten.

<img src="docs/screenshots/parents.png" alt="The parent page" width="80%">

## Curriculum

| Unit | Lessons | Exercises |
|---|---|---|
| 1. Talk to R *(Bá R sọ̀rọ̀)* | Say hello, Super calculator, Variables | Minutes in a day, My age box |
| 2. Lists and words *(Àkọsílẹ̀ àti ọ̀rọ̀)* | Make a list, Words too!, Math on lists, Sorting, Pick from a list | Five friends, Top score |
| 3. Draw with R *(Ya àwòrán pẹ̀lú R)* | Draw dots, Bar chart, Pie chart, Line chart | My own bar chart, Growing bean |
| 4. Decisions and loops *(Ìpinnu àti ìyípo)* | TRUE or FALSE, If / else, Loops, While loops, Functions, Random stuff | Pass or try again, Seven times table |
| 5. R in real life *(R nínú ayé gidi)* | Market day, Piggy bank, Twelve baskets | Shopping total, The four Gospels |
| 6. Words and text *(Ọ̀rọ̀ àti lẹ́tà)* | Glue words, Big and small letters, Cut words up, Backwards words | Shout it out, How long is my name? |
| 7. Data detective *(Aṣàwárí dátà)* | Meet a dataset, Count and average, Histogram, Compare groups, Sort a table | Average sepal, Longest petal |

**Challenges:** Print your name, Make 100, Make it blue, Count to ten, Three colours, Big average, Giant dots, Say it 3 times, Days of creation, Doubling machine, Big and small, Line it up, Even numbers, Jollof wins, Saving ₦10,000.

**Games:** Guess the number, Rock Paper Scissors, Dice roller, Ludo race, Treasure hunt, A verse for you ✝, Coin flip, Silly story, Memory verse ✝, Secret code, Spiral art, Flower maths, Heart shape ✝, Starry night ✝, Noah's rainbow ✝, Adire cloth, Bible book finder ✝, Two by two ✝, Bible quiz ✝, Music maker ✝.

---

## How it works

```mermaid
flowchart LR
  child["Child's browser<br/>(phone or computer)"]
  pages["GitHub Pages<br/>index.html, sw.js, icons"]
  webr["webR CDN<br/>R compiled to WebAssembly"]
  sb["Supabase (free plan)<br/>family accounts, progress,<br/>anonymous usage counts"]
  admin["admin.html<br/>private dashboard"]
  child -- "loads the app" --> pages
  child -- "downloads R once (~20 MB),<br/>then keeps it" --> webr
  child -- "saves progress, sends<br/>usage counts and errors" --> sb
  admin -- "admins only" --> sb
```

- **The app** is one HTML file (`index.html`). There's no build step and no server to run.
- **R runs on each child's device.** The server never runs code, so it costs nothing however many children use it.
- **Saving:** progress is always saved on the device first. With a family account it also syncs to Supabase a couple of seconds after each activity, and catches up after being offline.
- **Saving data on mobile plans:** a service worker keeps the app and the 20 MB R engine on the device after the first visit. R still needs a connection to start; offline, the app opens and says so, then starts R when the connection returns.

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | The whole app: lessons, games, styles and code |
| `admin.html` | Private usage dashboard (admins only) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and "add to home screen" |
| `supabase/001_family_accounts.sql` | Family accounts, children and their privacy rules |
| `supabase/002_usage_monitoring.sql` | Anonymous usage events, error reports, admin access |
| `supabase/003_rate_limits.sql` | Limits that stop anyone flooding the database, and automatic clean-up |
| `tests/` | Automated browser tests (Playwright) |
| `tools/screenshots.js` | Regenerates the screenshots in this README |
| `.github/workflows/` | Tests, keep-Supabase-awake, weekly encrypted backup |

## Running it yourself

```bash
npm install
npm start            # serves the app at http://localhost:8080
npm test             # runs every test in a real browser with real R
```

The tests use a pretend Supabase, so they never touch real data. One test opens every lesson and exercise and checks that lessons run without errors and that every exercise rejects its starter code but accepts its hint. Run it after changing content.

## Setting up Supabase (one time)

1. **Create the project:** create a free project at [supabase.com](https://supabase.com).
2. **Create the tables:** in **SQL Editor**, run `supabase/001_family_accounts.sql`, then `supabase/002_usage_monitoring.sql`, then `supabase/003_rate_limits.sql`.
3. **Connect the app:** in **Project Settings → API**, copy the **Project URL** and the **publishable** key into `CLOUD_CONFIG` in `index.html`. Both are safe to publish, because row-level security keeps each family's data private. Never put the secret key in this repository.
4. **Point sign-in emails at the site:** in **Authentication → URL Configuration**, set **Site URL** to `https://exelegch.github.io/rquest/` and add `https://exelegch.github.io/rquest/**` under **Redirect URLs**.
5. **Make yourself an admin:** sign up in the app, then run this in SQL Editor, using your email:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
6. **Open the dashboard** at [`/admin.html`](https://exelegch.github.io/rquest/admin.html).

### The usage dashboard

`admin.html` shows:
- learners today and over the last 7, 30 or 90 days
- activities finished each day
- how many children use Yorùbá
- family and child counts
- **where children get stuck:** each lesson's "not yet" answers and code errors, flagged when most attempts go wrong
- **error reports** sent by the app itself, with the browser and app version

Counts come from a random device id with no names, so one child on two phones counts twice.

### GitHub Actions

| Workflow | When | What it needs |
|---|---|---|
| **Tests** | Every push and pull request | Nothing |
| **Keep Supabase awake** | Every 3 days | Nothing. It reads the public key from `index.html`. Free projects pause after a week without activity, which would stop sign-in. |
| **Weekly database backup** | Sundays | Two repository secrets: `SUPABASE_DB_URL` (Supabase → **Connect** → *Session pooler* string, with your database password) and `BACKUP_PASSPHRASE`. Backups are encrypted, because this repository is public. To open one: `gpg --decrypt rquest-backup-DATE.sql.gpg > backup.sql`. |

## Adding a lesson or exercise

Lessons live in the `CONTENT` object near the top of the script in `index.html`. A lesson looks like this:

```js
{ id: 'L31', icon: '🌍', title: 'My new lesson', title_yo: 'Ẹ̀kọ́ tuntun mi',
  prompt: 'What the child should try.', prompt_yo: 'Ohun tí ọmọ náà yóò gbìyànjú.',
  code: `print("Hello")` },
```

An exercise adds `exercise: true`, `points`, a `goal`, a `hint` (the hint must be a working answer when added below the `starter`), and a check. There are two kinds of check:
- `check(out, code, ctx)` looks at R's printed output and the child's code.
- `rcheck` is an R expression that must return `TRUE`.

Then add the new `id` to a unit's `ids` list in `UNITS`, and run `npm test`.

- **Ids:** lessons start with `L`, exercises `E`, challenges `C`, games `G`, and Free-play pages `F`. Never reuse or renumber an id, because children's saved progress refers to it.
- **Pretend numbers:** mark content that uses made-up numbers with `pretend: true`.
- **Bible content:** mark it with `bible: true`.

## Security and limits

- **Public key:** the key in `index.html` is Supabase's public *publishable* key. It's meant to be visible. Row-level security decides what each request may read or write.
- **Families:** a family can only see and change its own children, and can have at most 10.
- **Usage counts and error reports:** the app can add them but can't read them back. The database quietly drops anything above 300 events or 20 error reports per device per hour, and above 20,000 events or 1,000 reports per hour in total, so nobody can fill the free plan on purpose. Usage older than 400 days and errors older than 90 days are deleted automatically.
- **Copies:** online saving switches itself off when a copy of the app runs at another address with the official Supabase project still in `CLOUD_CONFIG`.

## Running your own copy

You're welcome to run R Quest for your school, church or community, within the licence terms below.
1. **Fork the repository** and turn on GitHub Pages for your fork.
2. **Use your own Supabase project.** Create a free one, run the three files in `supabase/`, and put your own project URL and publishable key in `CLOUD_CONFIG` in `index.html`. Until you do, online saving stays switched off on your copy, and lessons still work with progress saved on each device.
3. **Keep the credit** to R Quest and the link to the source code, and share your changes under the same licences.

## Privacy

- **What's stored:** R Quest stores a parent's email, and each child's first name, animal picture and progress. Usage counts and error reports never include names.
- **How it's protected:** every table uses row-level security, so a family can only see its own children, and only admins can read usage counts.
- **Before inviting families publicly,** publish a short privacy policy that says this, in line with Nigeria's Data Protection Act 2023.

## Credits

- [webR](https://docs.r-wasm.org/webr/latest/) by the R Consortium / Posit team
- [Supabase](https://supabase.com)
- Fonts: Baloo 2, Nunito and JetBrains Mono from Google Fonts
- Bible verses from the King James Version (public domain)
- Yorùbá translations should be reviewed by a native speaker; corrections are welcome.

## License

R Quest is © 2026 Olatunde Akanbi.

- **Code** (the app, dashboard, service worker, SQL, tests and tools) is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE). You may use, change and share it, but if you run a changed version for others, including as a website, you must offer them your source code under the same licence and keep the credit.
- **Educational content** (lesson, exercise, challenge and game texts and their example R code, hints, English and Yorùbá translations, the dove mascot, icons and screenshots) is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](LICENSE-CONTENT). You may share and adapt it for non-commercial purposes with credit, under the same licence.
- **Earlier versions:** versions published before 16 October 2026 (up to commit `1339b21`) were released under the MIT licence, and copies made from those versions keep it.
- **Third-party parts:** Bible verses are from the King James Version (public domain). webR, Supabase and the fonts keep their own licences.
