# Checking and improving the Yorùbá

Every word a child sees in R Quest is written in English and in Yorùbá. The Yorùbá was written carefully, but it has not yet been checked by a native-speaker teacher. If you can help, thank you. Corrections from native speakers are the single most useful contribution to R Quest.

## The review sheet

[`yoruba-review.csv`](yoruba-review.csv) lists every English and Yorùbá pair (about 830 rows). Open it in Google Sheets, Excel or LibreOffice.

| Column | Meaning |
|---|---|
| `area` | Where the text appears: app text, learn, challenge, games, lesson steps, units, daily puzzles or badges |
| `id` | Which item. `L5` is lesson 5, `E3` exercise 3, `B2` bug fix 2, `P4` project 4, `C1` challenge 1, `G7` game 7, `D3` daily puzzle 3 |
| `field` | Which part of the item, for example `title`, `prompt`, `goal` or `mission` |
| `english` | The English text |
| `yoruba` | The Yorùbá text now in the app |
| `suggested_yoruba` | **Write your correction here.** Leave it empty if the Yorùbá is fine. |
| `notes` | Anything we should know, for example "too formal for children" |

## What to look for

1. **Tone marks and under-dots** (ẹ, ọ, ṣ, à, á …). They change the meaning, so please check them carefully.
2. **Natural for a child of 8 to 12.** Short, friendly sentences are better than formal ones.
3. **Words for computing ideas.** Some are borrowed (kóòdù, function, vector) and some are explained (àpótí for a variable, "a box"). If a different word is more common in Nigerian schools, please suggest it.
4. **Do not translate R code.** Anything that R runs must stay in English: `print()`, `sum()`, `TRUE`, `my_age`, column names like `Petal.Length`, and the words inside code quotes that the checks look for (such as "Drink water!").
5. **Placeholders** like `{n}`, `{t}`, `{e}`, `{a}` and `{b}` must stay exactly as they are, because the app fills them in.
6. **Bible verses.** If a standard Yorùbá Bible wording exists for a verse, please suggest it.

## Sending your corrections

- **Easiest:** email or message the filled-in sheet to the project owner, or attach it to a new issue at <https://github.com/Exelegch/rquest/issues>.
- **On GitHub:** edit `index.html` (app text, the first lessons, challenges and games), `content/lesson-steps.js` (Predict questions and missions) or `content/new-activities.js` (bug fixes, projects, unit 8, daily puzzles, ages and outcomes), then open a pull request. Yorùbá fields always end in `_yo`.

## For maintainers: making a new sheet

After changing any text, run:

```
npm run yoruba
```

This rebuilds `docs/yoruba-review.csv` from the app itself and prints how many texts have no Yorùbá yet. The tests also fail if any lesson step is missing its Yorùbá.
