// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// R Quest lesson steps. Every lesson has three steps:
//   1. Try it    - run the example code (the lesson's own `code` in index.html)
//   2. Predict   - a "What will R print?" question. `code` is real R; the tests run it and check
//                  that the option at `answer` is exactly what R prints (unless verify: false).
//   3. Your turn - a small mission. `check` looks at the output and code, `rcheck` is R that must
//                  be TRUE. The lesson's example code must NOT pass, and the example code plus the
//                  hint (or `solution`, if given) must pass. The tests check all of this.
// Yorùbá fields end in _yo. Options that are R output are the same in both languages.

export const LESSON_STEPS = {
  L1: {
    quiz: { code: `print("Jesus loves you")`,
      options: ['[1] "Jesus loves you"', 'Jesus loves you', 'An error'], answer: 0,
      options_yo: ['[1] "Jesus loves you"', 'Jesus loves you', 'Àṣìṣe'],
      why: 'print() shows words inside quote marks. The [1] means "this is item number 1".',
      why_yo: 'print() ń fi ọ̀rọ̀ hàn nínú àmì ọ̀rọ̀. [1] túmọ̀ sí "èyí ni nǹkan kìíní".' },
    mission: {
      text: 'Add a third line that prints your favourite food.',
      text_yo: 'Fi ìlà kẹta kún un tí yóò tẹ oúnjẹ àyànfẹ́ rẹ jáde.',
      goal: 'R prints 3 lines, using print() 3 times', goal_yo: 'R tẹ ìlà mẹ́ta jáde, pẹ̀lú print() lẹ́ẹ̀mẹ́ta',
      hint: 'print("I love jollof rice!")',
      check: (out, code) => (code.match(/print\s*\(/g) || []).length >= 3 && out.split('\n').filter(l => /^\[1\]/.test(l)).length >= 3 },
  },
  L2: {
    quiz: { code: `10 - 2 * 3`, options: ['[1] 4', '[1] 24', '[1] 6'], answer: 0,
      why: 'R does × before −, just like in school. 2 × 3 is 6, and 10 − 6 is 4.',
      why_yo: 'R máa ń ṣe × kí ó tó ṣe −, gẹ́gẹ́ bí ní ilé-ìwé. 2 × 3 jẹ́ 6, 10 − 6 sì jẹ́ 4.' },
    mission: {
      text: 'How many days are in 12 weeks? Make R work it out with *.',
      text_yo: 'Ọjọ́ mélòó ló wà nínú ọ̀sẹ̀ méjìlá? Jẹ́ kí R ṣírò rẹ̀ pẹ̀lú *.',
      goal: 'R prints 84', goal_yo: 'R tẹ 84 jáde',
      hint: '12 * 7',
      check: (out, code) => /\b84\b/.test(out) && /\*/.test(code) },
  },
  L3: {
    quiz: { code: `x <- 5\nx <- x + 2\nx`, options: ['[1] 7', '[1] 5', '[1] 2'], answer: 0,
      why: 'First the box x holds 5. Then we put x + 2 (that is 7) back into the same box.',
      why_yo: 'Lákọ̀ọ́kọ́ àpótí x ní 5 nínú. Lẹ́yìn náà a fi x + 2 (ìyẹn 7) padà sínú àpótí kan náà.' },
    mission: {
      text: 'Make a box called food with your favourite food in it. Then use cat() to say that you like it.',
      text_yo: 'Ṣe àpótí kan tí a ń pè ní food pẹ̀lú oúnjẹ àyànfẹ́ rẹ nínú rẹ̀. Lẹ́yìn náà lo cat() láti sọ pé o fẹ́ràn rẹ̀.',
      goal: 'food holds words, and cat() prints it', goal_yo: 'food ní ọ̀rọ̀ nínú, cat() sì tẹ̀ ẹ́ jáde',
      hint: 'food <- "amala"\ncat("I like", food, "\\n")',
      check: (out, code) => /cat\s*\([^\n]*\bfood\b/.test(code),
      rcheck: `exists("food", envir = globalenv(), inherits = FALSE) && is.character(food) && nchar(food[1]) > 0` },
  },
  L4: {
    quiz: { code: `length(c(4, 8, 15))`, options: ['[1] 3', '[1] 27', '[1] 15'], answer: 0,
      why: 'length() counts how many items are in the list. It does not add them up.',
      why_yo: 'length() ń ka iye nǹkan tí ó wà nínú àkọsílẹ̀. Kì í ṣe àròpọ̀ wọn.' },
    mission: {
      text: 'Your football team played 4 matches. Make a list called goals with the goals scored in each match, then add them up with sum().',
      text_yo: 'Ẹgbẹ́ bọ́ọ̀lù rẹ gbá ìdíje mẹ́rin. Ṣe àkọsílẹ̀ kan tí a ń pè ní goals pẹ̀lú góòlù tí wọ́n gbà nínú ìdíje kọ̀ọ̀kan, lẹ́yìn náà ṣe àròpọ̀ wọn pẹ̀lú sum().',
      goal: 'goals has 4 numbers, and sum(goals) prints the total', goal_yo: 'goals ní nọ́mbà mẹ́rin, sum(goals) sì tẹ àròpọ̀ jáde',
      hint: 'goals <- c(2, 0, 3, 1)\nsum(goals)',
      check: (out, code) => /sum\s*\(\s*goals\s*\)/.test(code),
      rcheck: `exists("goals", envir = globalenv(), inherits = FALSE) && is.numeric(goals) && length(goals) == 4` },
  },
  L5: {
    quiz: { code: `animals <- c("lion", "sheep")\nlength(animals)`, options: ['[1] 2', '[1] "lion" "sheep"', '[1] 9'], answer: 0,
      why: 'There are 2 words in the list, so length() gives 2.',
      why_yo: 'Ọ̀rọ̀ méjì ló wà nínú àkọsílẹ̀ náà, nítorí náà length() fún wa ní 2.' },
    mission: {
      text: 'Make a list called teachers with the names of 3 people who teach you, at school or at church. Then count them with length().',
      text_yo: 'Ṣe àkọsílẹ̀ kan tí a ń pè ní teachers pẹ̀lú orúkọ ènìyàn mẹ́ta tí ń kọ́ ọ, ní ilé-ìwé tàbí ní ṣọ́ọ̀ṣì. Lẹ́yìn náà kà wọ́n pẹ̀lú length().',
      goal: 'teachers has 3 names, and length(teachers) prints 3', goal_yo: 'teachers ní orúkọ mẹ́ta, length(teachers) sì tẹ 3 jáde',
      hint: 'teachers <- c("Mrs Ade", "Mr Okon", "Pastor Femi")\nlength(teachers)',
      check: (out, code) => /length\s*\(\s*teachers\s*\)/.test(code) && /\b3\b/.test(out),
      rcheck: `exists("teachers", envir = globalenv(), inherits = FALSE) && is.character(teachers) && length(teachers) == 3` },
  },
  L6: {
    quiz: { code: `x <- 1:4\nx`, options: ['[1] 1 2 3 4', '[1] 4', '[1] 1 4'], answer: 0,
      why: '1:4 means "every whole number from 1 to 4".',
      why_yo: '1:4 túmọ̀ sí "gbogbo nọ́mbà odidi láti 1 dé 4".' },
    mission: {
      text: 'Draw a new picture where the dots are green triangles. Use col = "darkgreen" and pch = 17, and give it a title with main.',
      text_yo: 'Ya àwòrán tuntun níbi tí àwọn ààmì ti jẹ́ onígun mẹ́ta aláwọ̀ ewé. Lo col = "darkgreen" àti pch = 17, kí o sì fún un ní àkọlé pẹ̀lú main.',
      goal: 'A plot with pch = 17, a green colour and a title', goal_yo: 'Àwòrán pẹ̀lú pch = 17, àwọ̀ ewé àti àkọlé',
      hint: 'plot(x, y, col = "darkgreen", pch = 17, cex = 2, main = "Green triangles")',
      check: (out, code, ctx) => ctx.images > 0 && /pch\s*=\s*17\b/.test(code) && /green/.test(code) },
  },
  L7: {
    quiz: { code: `snacks <- c(PufPuf = 9, Chinchin = 6, Plantain = 11)\nsum(snacks)`, options: ['[1] 26', '[1] 3', 'PufPuf Chinchin Plantain'], answer: 0,
      why: 'The names are just labels. sum() adds the numbers: 9 + 6 + 11 = 26.',
      why_yo: 'Orúkọ wọ̀nyí jẹ́ àmì lásán. sum() ń ṣe àròpọ̀ àwọn nọ́mbà: 9 + 6 + 11 = 26.' },
    mission: {
      text: 'Add a fifth snack, like Meat pie, to the poll with c(). Then draw the chart again with horiz = TRUE to lay the bars on their side.',
      text_yo: 'Fi ìpanu karùn-ún, bíi Meat pie, kún ìdìbò náà pẹ̀lú c(). Lẹ́yìn náà tún àwòrán náà yà pẹ̀lú horiz = TRUE kí àwọn ọ̀pá dùbúlẹ̀.',
      goal: 'snacks has 5 items and the bars lie on their side', goal_yo: 'snacks ní nǹkan márùn-ún, àwọn ọ̀pá sì dùbúlẹ̀',
      hint: 'snacks <- c(snacks, MeatPie = 7)\nbarplot(snacks, horiz = TRUE, col = "orange", main = "Favourite snacks")',
      check: (out, code, ctx) => ctx.images > 0 && /horiz\s*=\s*TRUE/.test(code),
      rcheck: `exists("snacks", envir = globalenv(), inherits = FALSE) && length(snacks) >= 5` },
  },
  L8: {
    quiz: { q: 'There are 20 pets and 12 are dogs. What will R print?', q_yo: 'Ẹran ọ̀sìn 20 ló wà, 12 nínú wọn sì jẹ́ ajá. Kí ni R yóò tẹ̀ jáde?',
      code: `round(12 / 20 * 100)`, options: ['[1] 60', '[1] 12', '[1] 32'], answer: 0,
      why: '12 out of 20 is 60 out of 100, so 60% of the pets are dogs. A pie chart shows parts like this.',
      why_yo: '12 nínú 20 jẹ́ 60 nínú 100, nítorí náà 60% àwọn ẹran ọ̀sìn jẹ́ ajá. Àwòrán àkàrà ń fi irú ìpín bẹ́ẹ̀ hàn.' },
    mission: {
      text: 'Make a pie chart of your Saturday. Put your hours of sleep, play, chores and study in a list called day, then draw it with a title.',
      text_yo: 'Ṣe àwòrán àkàrà nípa ọjọ́ Sátidé rẹ. Fi wákàtí oorun, eré, iṣẹ́ ilé àti ẹ̀kọ́ rẹ sínú àkọsílẹ̀ kan tí a ń pè ní day, lẹ́yìn náà yà á pẹ̀lú àkọlé.',
      goal: 'day has at least 4 parts, drawn with pie() and a title', goal_yo: 'day ní ìpín mẹ́rin ó kéré tán, tí a fi pie() yà pẹ̀lú àkọlé',
      hint: 'day <- c(Sleep = 9, Play = 5, Chores = 3, Study = 2)\npie(day, main = "My Saturday")',
      check: (out, code, ctx) => ctx.images > 0 && /pie\s*\(\s*day\b/.test(code) && /main\s*=/.test(code),
      rcheck: `exists("day", envir = globalenv(), inherits = FALSE) && is.numeric(day) && length(day) >= 4` },
  },
  L9: {
    quiz: { q: 'Which day was the hottest? What will R print?', q_yo: 'Ọjọ́ wo ló gbóná jù? Kí ni R yóò tẹ̀ jáde?',
      code: `temperature <- c(31, 32, 29, 33)\nwhich.max(temperature)`, options: ['[1] 4', '[1] 33', '[1] 1'], answer: 0,
      why: 'which.max() tells you WHERE the biggest number is. 33 is in place number 4.',
      why_yo: 'which.max() ń sọ IBI tí nọ́mbà tí ó tóbi jù wà. 33 wà ní ipò kẹrin.' },
    mission: {
      text: 'Draw a line chart of how much rain fell in your town over 5 days (you can make up the numbers). Use type = "o", a blue colour, and label the bottom with xlab.',
      text_yo: 'Ya àwòrán ìlà nípa iye òjò tí ó rọ̀ ní ìlú rẹ fún ọjọ́ márùn-ún (o lè dá àwọn nọ́mbà náà). Lo type = "o", àwọ̀ búlúù, kí o sì kọ orúkọ sísàlẹ̀ pẹ̀lú xlab.',
      goal: 'A blue line chart with type = "o" and xlab', goal_yo: 'Àwòrán ìlà búlúù pẹ̀lú type = "o" àti xlab',
      hint: 'rain <- c(2, 5, 0, 3, 6)\nplot(1:5, rain, type = "o", col = "blue", lwd = 3, xlab = "Day", main = "Rainy days")',
      check: (out, code, ctx) => ctx.images > 0 && /type\s*=\s*["']o["']/.test(code) && /xlab\s*=/.test(code) && /blue/.test(code) },
  },
  L10: {
    quiz: { code: `age <- 15\nif (age >= 13) print("Teenager!") else print("Kid!")`, options: ['[1] "Teenager!"', '[1] "Kid!"', 'Both of them'], answer: 0,
      options_yo: ['[1] "Teenager!"', '[1] "Kid!"', 'Méjèèjì'],
      why: '15 is 13 or more, so the rule is TRUE and R takes the first path.',
      why_yo: '15 jẹ́ 13 tàbí jù bẹ́ẹ̀ lọ, nítorí náà òfin náà jẹ́ òtítọ́, R sì gba ọ̀nà àkọ́kọ́.' },
    mission: {
      text: 'Make a weather helper. Set temp <- 34. If temp is more than 30, print "Drink water!", otherwise print "Nice weather!".',
      text_yo: 'Ṣe olùrànlọ́wọ́ ojú ọjọ́. Kọ temp <- 34. Bí temp bá ju 30 lọ, tẹ "Drink water!" jáde, bí kò bá rí bẹ́ẹ̀ tẹ "Nice weather!" jáde.',
      goal: 'Uses if and else, and prints "Drink water!" when temp is 34', goal_yo: 'Lo if àti else, kí ó sì tẹ "Drink water!" jáde nígbà tí temp jẹ́ 34',
      hint: 'temp <- 34\nif (temp > 30) {\n  print("Drink water!")\n} else {\n  print("Nice weather!")\n}',
      check: (out, code) => /\bif\s*\(\s*temp/.test(code) && /\belse\b/.test(code) && /Drink water/.test(out) && !/Nice weather/.test(out) },
  },
  L11: {
    quiz: { code: `for (i in 1:3) print(i * 2)`, options: ['[1] 2\n[1] 4\n[1] 6', '[1] 1\n[1] 2\n[1] 3', '[1] 6'], answer: 0,
      why: 'The loop runs 3 times. i is 1, then 2, then 3, and each time R prints i × 2.',
      why_yo: 'Ìyípo náà ṣiṣẹ́ lẹ́ẹ̀mẹ́ta. i jẹ́ 1, lẹ́yìn náà 2, lẹ́yìn náà 3, ní ìgbà kọ̀ọ̀kan R sì tẹ i × 2 jáde.' },
    mission: {
      text: 'Use a for-loop to print "Thank you, God!" three times.',
      text_yo: 'Lo for-loop láti tẹ "Thank you, God!" jáde lẹ́ẹ̀mẹ́ta.',
      goal: '"Thank you, God!" appears 3 times, using for', goal_yo: '"Thank you, God!" hàn lẹ́ẹ̀mẹ́ta, pẹ̀lú for',
      hint: 'for (i in 1:3) {\n  print("Thank you, God!")\n}',
      check: (out, code) => /\bfor\s*\(/.test(code) && (out.match(/Thank you, God!/g) || []).length >= 3 },
  },
  L12: {
    quiz: { code: `n <- 1\nwhile (n < 20) n <- n * 2\nn`, options: ['[1] 32', '[1] 20', '[1] 16'], answer: 0,
      why: 'n goes 1, 2, 4, 8, 16. 16 is still less than 20, so it doubles once more to 32, and then the loop stops.',
      why_yo: 'n lọ láti 1, 2, 4, 8, 16. 16 ṣì kéré sí 20, nítorí náà ó di ìlọ́po méjì lẹ́ẹ̀kan sí i sí 32, lẹ́yìn náà ìyípo náà dúró.' },
    mission: {
      text: 'Savings goal! Start with money <- 0. Use a while-loop to keep adding 300 until you have at least 2000. Then print money.',
      text_yo: 'Àfojúsùn ìfowópamọ́! Bẹ̀rẹ̀ pẹ̀lú money <- 0. Lo while-loop láti máa fi 300 kún un títí tí yóò fi tó 2000 ó kéré tán. Lẹ́yìn náà tẹ money jáde.',
      goal: 'Uses while, and R prints 2100', goal_yo: 'Lo while, R sì tẹ 2100 jáde',
      hint: 'money <- 0\nwhile (money < 2000) {\n  money <- money + 300\n}\nmoney',
      check: (out, code) => /\bwhile\s*\(/.test(code) && /\b2100\b/.test(out) },
  },
  L13: {
    quiz: { code: `double <- function(x) x * 2\ndouble(21)`, options: ['[1] 42', '[1] 21', '[1] "x * 2"'], answer: 0,
      why: 'double() takes the number you give it and multiplies it by 2.',
      why_yo: 'double() ń mú nọ́mbà tí o fún un, ó sì ń fi 2 sọ ọ́ di púpọ̀.' },
    mission: {
      text: 'Write a function called bless that takes a name and says "God bless you, <name>!". Then use it for 2 people.',
      text_yo: 'Kọ function kan tí a ń pè ní bless tí ó gba orúkọ, tí ó sì sọ pé "God bless you, <orúkọ>!". Lẹ́yìn náà lò ó fún ènìyàn méjì.',
      goal: 'bless is a function, and "God bless you" appears twice', goal_yo: 'bless jẹ́ function, "God bless you" sì hàn lẹ́ẹ̀mejì',
      hint: 'bless <- function(name) {\n  cat("God bless you,", name, "!\\n")\n}\nbless("Mama")\nbless("Tunde")',
      check: (out, code) => /bless\s*<-\s*function/.test(code) && (out.match(/God bless you/g) || []).length >= 2 },
  },
  L14: {
    quiz: { q: 'You run sample(1:6, 1) two times. What happens?', q_yo: 'O ṣe sample(1:6, 1) lẹ́ẹ̀mejì. Kí ló máa ṣẹlẹ̀?', verify: false,
      options: ['You might get different numbers', 'You always get 6', 'R shows an error'], answer: 0,
      options_yo: ['O lè rí nọ́mbà tí ó yàtọ̀', 'Ìgbà gbogbo ni o máa rí 6', 'R máa fi àṣìṣe hàn'],
      why: 'sample() picks at random, like rolling a dice. Each roll can be different.',
      why_yo: 'sample() ń yan láìròtẹ́lẹ̀, bí ìgbà tí a bá ju dáìsì. Ìjù kọ̀ọ̀kan lè yàtọ̀.' },
    mission: {
      text: 'Make a dice! Use sample() to roll a 6-sided dice 3 times at once, with size = 3 and replace = TRUE (so the same number can come again).',
      text_yo: 'Ṣe dáìsì kan! Lo sample() láti ju dáìsì oníhà mẹ́fà lẹ́ẹ̀mẹ́ta lẹ́ẹ̀kan náà, pẹ̀lú size = 3 àti replace = TRUE (kí nọ́mbà kan náà lè tún jáde).',
      goal: 'R prints 3 dice rolls between 1 and 6', goal_yo: 'R tẹ ìjù dáìsì mẹ́ta láàrin 1 àti 6 jáde',
      hint: 'sample(1:6, size = 3, replace = TRUE)',
      check: (out, code) => /sample\s*\(/.test(code) && /replace\s*=\s*TRUE/.test(code) && /^\[1\]\s+[1-6]\s+[1-6]\s+[1-6]\s*$/m.test(out) },
  },
  L15: {
    quiz: { code: `c(1, 2, 3) * 10`, options: ['[1] 10 20 30', '[1] 60', '[1] 1 2 3 10'], answer: 0,
      why: 'R multiplies every item in the list by 10, all at once.',
      why_yo: 'R ń fi 10 sọ gbogbo nǹkan inú àkọsílẹ̀ di púpọ̀, lẹ́ẹ̀kan náà.' },
    mission: {
      text: 'Prices went up! Make a list called prices with 3 prices in Naira. Then show the new prices if each one goes up by 500.',
      text_yo: 'Owó ọjà gòkè! Ṣe àkọsílẹ̀ kan tí a ń pè ní prices pẹ̀lú iye owó mẹ́ta ní Náírà. Lẹ́yìn náà fi iye owó tuntun hàn bí ọ̀kọ̀ọ̀kan bá fi 500 gòkè.',
      goal: 'prices has 3 numbers, and R prints prices + 500', goal_yo: 'prices ní nọ́mbà mẹ́ta, R sì tẹ prices + 500 jáde',
      hint: 'prices <- c(1000, 2500, 800)\nprices + 500',
      check: (out, code) => /prices\s*\+\s*500/.test(code),
      rcheck: `exists("prices", envir = globalenv(), inherits = FALSE) && is.numeric(prices) && length(prices) == 3` },
  },
  L16: {
    quiz: { code: `sort(c(5, 2, 9))`, options: ['[1] 2 5 9', '[1] 9 5 2', '[1] 5 2 9'], answer: 0,
      why: 'sort() puts the numbers in order, smallest first.',
      why_yo: 'sort() ń tò àwọn nọ́mbà, láti kékeré jù lọ.' },
    mission: {
      text: 'Make a list called books with 4 books of the Bible, then put them in ABC order with sort().',
      text_yo: 'Ṣe àkọsílẹ̀ kan tí a ń pè ní books pẹ̀lú ìwé mẹ́rin nínú Bíbélì, lẹ́yìn náà tò wọ́n ní ìlànà ABD pẹ̀lú sort().',
      goal: 'books has 4 names, sorted with sort()', goal_yo: 'books ní orúkọ mẹ́rin, tí a fi sort() tò',
      hint: 'books <- c("Ruth", "Genesis", "Mark", "Esther")\nsort(books)',
      check: (out, code) => /sort\s*\(\s*books/.test(code),
      rcheck: `exists("books", envir = globalenv(), inherits = FALSE) && is.character(books) && length(books) == 4` },
  },
  L17: {
    quiz: { code: `days <- c("Mon", "Tue", "Wed")\ndays[2]`, options: ['[1] "Tue"', '[1] "Mon"', '[1] "Wed"'], answer: 0,
      why: 'R starts counting at 1, so days[2] is the second item.',
      why_yo: 'R ń bẹ̀rẹ̀ kíkà láti 1, nítorí náà days[2] ni nǹkan kejì.' },
    mission: {
      text: 'Make a list called week with the 7 days of the week, from Monday to Sunday. Then print only Sunday using [ ].',
      text_yo: 'Ṣe àkọsílẹ̀ kan tí a ń pè ní week pẹ̀lú ọjọ́ méje inú ọ̀sẹ̀, láti Monday dé Sunday. Lẹ́yìn náà tẹ Sunday nìkan jáde pẹ̀lú [ ].',
      goal: 'week has 7 days, and week[ ] prints "Sunday"', goal_yo: 'week ní ọjọ́ méje, week[ ] sì tẹ "Sunday" jáde',
      hint: 'week <- c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")\nweek[7]',
      check: (out, code) => /week\s*\[/.test(code) && /"Sunday"/.test(out),
      rcheck: `exists("week", envir = globalenv(), inherits = FALSE) && length(week) == 7` },
  },
  L18: {
    quiz: { code: `5 + 5 == 10`, options: ['[1] TRUE', '[1] FALSE', '[1] 10'], answer: 0,
      why: '5 + 5 is 10, so "is it equal to 10?" is TRUE.',
      why_yo: '5 + 5 jẹ́ 10, nítorí náà "ṣé ó dọ́gba pẹ̀lú 10?" jẹ́ TRUE (òtítọ́).' },
    mission: {
      text: 'Make a list called heights with the heights of 5 children in cm. Then ask R which ones are taller than 120 with >.',
      text_yo: 'Ṣe àkọsílẹ̀ kan tí a ń pè ní heights pẹ̀lú gíga ọmọdé márùn-ún ní cm. Lẹ́yìn náà bi R èyí tí ó ga ju 120 lọ pẹ̀lú >.',
      goal: 'heights has 5 numbers, and R prints TRUE and FALSE answers', goal_yo: 'heights ní nọ́mbà márùn-ún, R sì tẹ ìdáhùn TRUE àti FALSE jáde',
      hint: 'heights <- c(110, 125, 132, 118, 140)\nheights > 120',
      check: (out, code) => /heights\s*>\s*120/.test(code) && /TRUE|FALSE/.test(out),
      rcheck: `exists("heights", envir = globalenv(), inherits = FALSE) && is.numeric(heights) && length(heights) == 5` },
  },
  L19: {
    quiz: { code: `market <- data.frame(item = c("Yam", "Rice"), price = c(2500, 3000))\nsum(market$price)`, options: ['[1] 5500', '[1] 2', '[1] 2500 3000'], answer: 0,
      why: 'market$price is the price column. sum() adds it up: 2500 + 3000 = 5500.',
      why_yo: 'market$price ni òpó iye owó. sum() ń ṣe àròpọ̀ rẹ̀: 2500 + 3000 = 5500.' },
    mission: {
      text: 'Find the cheapest price on the market list with min(), and count how many items there are with nrow().',
      text_yo: 'Wá iye owó tí ó kéré jù nínú àkọsílẹ̀ ọjà pẹ̀lú min(), kí o sì ka iye nǹkan tí ó wà pẹ̀lú nrow().',
      goal: 'R prints 600 using min(), and 5 using nrow()', goal_yo: 'R tẹ 600 jáde pẹ̀lú min(), àti 5 pẹ̀lú nrow()',
      hint: 'min(market$price)\nnrow(market)',
      check: (out, code) => /min\s*\(\s*market\$price\s*\)/.test(code) && /nrow\s*\(\s*market\s*\)/.test(code) && /\[1\] 600\b/.test(out) && /\[1\] 5\b/.test(out) },
  },
  L20: {
    quiz: { code: `cumsum(c(100, 200, 300))`, options: ['[1] 100 300 600', '[1] 600', '[1] 100 200 300'], answer: 0,
      why: 'cumsum() keeps a running total: 100, then 100 + 200, then 100 + 200 + 300.',
      why_yo: 'cumsum() ń ṣe àròpọ̀ bí ó ti ń lọ: 100, lẹ́yìn náà 100 + 200, lẹ́yìn náà 100 + 200 + 300.' },
    mission: {
      text: 'You save ₦200 in week 1, and ₦50 more every week after that (200, 250, 300 …) for 6 weeks. seq(200, by = 50, length.out = 6) makes that list. Use cumsum() to see your savings grow, print them, and draw them.',
      text_yo: 'O fi ₦200 pamọ́ ní ọ̀sẹ̀ kìíní, ₦50 sì ń lékún sí i ní ọ̀sẹ̀ kọ̀ọ̀kan lẹ́yìn náà (200, 250, 300 …) fún ọ̀sẹ̀ mẹ́fà. seq(200, by = 50, length.out = 6) ń ṣe àkọsílẹ̀ yẹn. Lo cumsum() láti rí bí owó rẹ ṣe ń pọ̀ sí i, tẹ̀ ẹ́ jáde, kí o sì yà á.',
      goal: 'Uses seq() and cumsum(), prints 1950, and draws a chart', goal_yo: 'Lo seq() àti cumsum(), tẹ 1950 jáde, kí o sì ya àwòrán',
      hint: 'weekly <- seq(200, by = 50, length.out = 6)\nsavings <- cumsum(weekly)\nsavings\nbarplot(savings, col = "#1F9D63", main = "Saving more each week")',
      check: (out, code, ctx) => /seq\s*\(/.test(code) && /cumsum\s*\(/.test(code) && /\b1950\b/.test(out) && ctx.images > 0 },
  },
  L21: {
    quiz: { code: `5000 / 5`, options: ['[1] 1000', '[1] 5005', '[1] 25000'], answer: 0,
      why: '5000 people shared 5 loaves: that is 1000 people for every loaf. Only God could do that!',
      why_yo: 'Ènìyàn 5000 pín búrẹ́dì márùn-ún: ìyẹn ni ènìyàn 1000 fún búrẹ́dì kọ̀ọ̀kan. Ọlọ́run nìkan ló lè ṣe bẹ́ẹ̀!' },
    mission: {
      text: 'Let\'s pretend each of the 12 baskets held 30 pieces of bread. Make R work out how many pieces were left over, and say it with cat().',
      text_yo: 'Ẹ jẹ́ ká díbọ́n pé agbọ̀n méjìlá kọ̀ọ̀kan gba búrẹ́dì 30. Jẹ́ kí R ṣírò iye búrẹ́dì tí ó ṣẹ́kù, kí o sì sọ ọ́ pẹ̀lú cat().',
      goal: 'R works out 12 × 30 = 360 and says it with cat()', goal_yo: 'R ṣírò 12 × 30 = 360, ó sì sọ ọ́ pẹ̀lú cat()',
      hint: 'pieces <- 12 * 30\ncat("About", pieces, "pieces were left over!\\n")',
      check: (out, code) => /\b360\b/.test(out) && /cat\s*\(/.test(code) && /12\s*\*\s*30|30\s*\*\s*12/.test(code) },
  },
  L22: {
    quiz: { code: `paste0("Ola", "tunde")`, options: ['[1] "Olatunde"', '[1] "Ola tunde"', 'An error'], answer: 0,
      options_yo: ['[1] "Olatunde"', '[1] "Ola tunde"', 'Àṣìṣe'],
      why: 'paste0() glues words together with no space in between.',
      why_yo: 'paste0() ń lẹ ọ̀rọ̀ pọ̀ láìsí àlàfo láàrin wọn.' },
    mission: {
      text: 'Make a username for a game: glue "ada" and 2026 together with paste0(), so R prints "ada2026".',
      text_yo: 'Ṣe orúkọ olùmúlò fún eré kan: lẹ "ada" àti 2026 pọ̀ pẹ̀lú paste0(), kí R tẹ "ada2026" jáde.',
      goal: 'R prints "ada2026" using paste0()', goal_yo: 'R tẹ "ada2026" jáde pẹ̀lú paste0()',
      hint: 'paste0("ada", 2026)',
      check: (out, code) => /"ada2026"/.test(out) && /paste0\s*\(/.test(code) },
  },
  L23: {
    quiz: { code: `nchar("Jesus")`, options: ['[1] 5', '[1] "JESUS"', '[1] 1'], answer: 0,
      why: 'nchar() counts the letters: J-e-s-u-s is 5 letters.',
      why_yo: 'nchar() ń ka lẹ́tà: J-e-s-u-s jẹ́ lẹ́tà márùn-ún.' },
    mission: {
      text: 'Put the name of your town in a box called town. Make R shout it in capital letters, and count its letters.',
      text_yo: 'Fi orúkọ ìlú rẹ sínú àpótí kan tí a ń pè ní town. Jẹ́ kí R kígbe rẹ̀ ní lẹ́tà ńlá, kí o sì ka lẹ́tà rẹ̀.',
      goal: 'Uses toupper(town) and nchar(town)', goal_yo: 'Lo toupper(town) àti nchar(town)',
      hint: 'town <- "Ibadan"\ntoupper(town)\nnchar(town)',
      check: (out, code) => /toupper\s*\(\s*town\s*\)/.test(code) && /nchar\s*\(\s*town\s*\)/.test(code),
      rcheck: `exists("town", envir = globalenv(), inherits = FALSE) && is.character(town) && nchar(town[1]) > 1` },
  },
  L24: {
    quiz: { code: `substr("Hallelujah", 1, 5)`, options: ['[1] "Halle"', '[1] "Hallelujah"', '[1] "lujah"'], answer: 0,
      why: 'substr(word, 1, 5) takes letters number 1 to 5.',
      why_yo: 'substr(word, 1, 5) ń mú lẹ́tà kìíní dé ìkarùn-ún.' },
    mission: {
      text: 'Split "The Lord is my shepherd" (Psalm 23:1) into words with strsplit(). Count the words with length(), then print the first word.',
      text_yo: 'Gé "The Lord is my shepherd" (Orin Dáfídì 23:1) sí ọ̀rọ̀ kọ̀ọ̀kan pẹ̀lú strsplit(). Ka àwọn ọ̀rọ̀ náà pẹ̀lú length(), lẹ́yìn náà tẹ ọ̀rọ̀ àkọ́kọ́ jáde.',
      goal: 'R prints 5 and "The"', goal_yo: 'R tẹ 5 àti "The" jáde',
      hint: 'psalm <- "The Lord is my shepherd"\npsalm_words <- strsplit(psalm, " ")[[1]]\nlength(psalm_words)\npsalm_words[1]',
      check: (out, code) => /strsplit\s*\(/.test(code) && /shepherd/.test(code) && /\[1\] "The"/.test(out) && /\[1\] 5\b/.test(out) },
  },
  L25: {
    quiz: { code: `rev(c(1, 2, 3))`, options: ['[1] 3 2 1', '[1] 1 2 3', '[1] 6'], answer: 0,
      why: 'rev() turns the list around, so the last item comes first.',
      why_yo: 'rev() ń yí àkọsílẹ̀ padà, kí nǹkan ìkẹyìn lè wá ṣáájú.' },
    mission: {
      text: 'Make your own function is_pal(word) that gives TRUE when a word reads the same backwards. Test it on "racecar" and "Lagos".',
      text_yo: 'Ṣe function tìrẹ is_pal(word) tí yóò fún wa ní TRUE nígbà tí ọ̀rọ̀ kan bá rí bákan náà tí a bá kà á sẹ́yìn. Dán an wò lórí "racecar" àti "Lagos".',
      goal: 'is_pal is a function that says TRUE for racecar and FALSE for Lagos', goal_yo: 'is_pal jẹ́ function tí ó sọ TRUE fún racecar àti FALSE fún Lagos',
      hint: 'is_pal <- function(word) {\n  back <- paste(rev(strsplit(word, "")[[1]]), collapse = "")\n  word == back\n}\nis_pal("racecar")\nis_pal("Lagos")',
      check: (out, code) => /is_pal\s*<-\s*function/.test(code) && /TRUE/.test(out) && /FALSE/.test(out),
      rcheck: `exists("is_pal", envir = globalenv(), inherits = FALSE) && is.function(is_pal) && isTRUE(is_pal("level")) && !isTRUE(is_pal("Ibadan"))` },
  },
  L26: {
    quiz: { code: `ncol(iris)`, options: ['[1] 5', '[1] 150', '[1] 4'], answer: 0,
      why: 'ncol() counts the columns. iris has 5: four measurements and the Species name.',
      why_yo: 'ncol() ń ka àwọn òpó. iris ní márùn-ún: ìwọ̀n mẹ́rin àti orúkọ Species.' },
    mission: {
      text: 'R has another dataset called trees, about 31 cherry trees. Show its first 3 rows with head(trees, 3), and count the trees with nrow().',
      text_yo: 'R ní dátà mìíràn tí a ń pè ní trees, nípa igi ṣẹ́rì 31. Fi ìlà mẹ́ta àkọ́kọ́ rẹ̀ hàn pẹ̀lú head(trees, 3), kí o sì ka àwọn igi náà pẹ̀lú nrow().',
      goal: 'Uses head(trees, 3), and R prints 31', goal_yo: 'Lo head(trees, 3), R sì tẹ 31 jáde',
      hint: 'head(trees, 3)\nnrow(trees)',
      check: (out, code) => /head\s*\(\s*trees\s*,\s*3\s*\)/.test(code) && /\[1\] 31\b/.test(out) },
  },
  L27: {
    quiz: { code: `table(c("yes", "no", "yes"))`, options: [' no yes\n  1   2', 'yes no\n  2  1', '[1] 3'], answer: 0,
      why: 'table() counts each kind and lists them in ABC order, so "no" comes before "yes".',
      why_yo: 'table() ń ka irú kọ̀ọ̀kan, ó sì ń tò wọ́n ní ìlànà ABD, nítorí náà "no" ló ṣáájú "yes".' },
    mission: {
      text: 'Girth means how thick a tree is. Find the average Girth of the trees, rounded to 1 decimal place.',
      text_yo: 'Girth túmọ̀ sí bí igi ṣe nípọn tó. Wá ìpíndọ́gba Girth àwọn igi náà, kí o sì yí i sí ibi ìdámẹ́wàá kan.',
      goal: 'Uses mean() and round(), and R prints 13.2', goal_yo: 'Lo mean() àti round(), R sì tẹ 13.2 jáde',
      hint: 'round(mean(trees$Girth), 1)',
      check: (out, code) => /round\s*\(/.test(code) && /mean\s*\(\s*trees\$Girth/.test(code) && /\b13\.2\b/.test(out) },
  },
  L28: {
    quiz: { code: `range(iris$Sepal.Length)`, options: ['[1] 4.3 7.9', '[1] 150', '[1] 5.84'], answer: 0,
      why: 'range() gives the smallest and the biggest value. A histogram shows everything in between.',
      why_yo: 'range() ń fún wa ní iye tí ó kéré jù àti èyí tí ó tóbi jù. Histogram ń fi gbogbo èyí tí ó wà láàrin wọn hàn.' },
    mission: {
      text: 'Draw a histogram of how tall the trees are (trees$Height). Pick your own colour, and add a title with main and a label with xlab.',
      text_yo: 'Ya histogram nípa bí àwọn igi ṣe ga tó (trees$Height). Yan àwọ̀ tìrẹ, kí o sì fi àkọlé kún un pẹ̀lú main àti orúkọ pẹ̀lú xlab.',
      goal: 'A histogram of trees$Height with main and xlab', goal_yo: 'Histogram trees$Height pẹ̀lú main àti xlab',
      hint: 'hist(trees$Height, col = "forestgreen", main = "How tall are the trees?", xlab = "Height (feet)")',
      check: (out, code, ctx) => ctx.images > 0 && /hist\s*\(\s*trees\$Height/.test(code) && /main\s*=/.test(code) && /xlab\s*=/.test(code) },
  },
  L29: {
    quiz: { code: `median(c(3, 9, 4))`, options: ['[1] 4', '[1] 9', '[1] 5.333333'], answer: 0,
      why: 'The median is the middle number after sorting: 3, 4, 9. The thick line in a box plot is the median.',
      why_yo: 'Median ni nọ́mbà àárín lẹ́yìn títò: 3, 4, 9. Ìlà tí ó nípọn nínú box plot ni median.' },
    mission: {
      text: 'Compare the Sepal.Width of the three iris species with a box plot. Which species has the widest sepals?',
      text_yo: 'Fi Sepal.Width irú iris mẹ́ta wéra pẹ̀lú box plot. Irú wo ló ní sepal tí ó fẹ̀ jù?',
      goal: 'A box plot of Sepal.Width ~ Species', goal_yo: 'Box plot Sepal.Width ~ Species',
      hint: 'boxplot(Sepal.Width ~ Species, data = iris, col = "skyblue", main = "Sepal width")',
      check: (out, code, ctx) => ctx.images > 0 && /boxplot\s*\(\s*Sepal\.Width\s*~\s*Species/.test(code) },
  },
  L30: {
    quiz: { code: `order(c(30, 10, 20))`, options: ['[1] 2 3 1', '[1] 10 20 30', '[1] 1 2 3'], answer: 0,
      why: 'order() gives the PLACES in sorted order. The smallest, 10, is in place 2, then 20 in place 3, then 30 in place 1.',
      why_yo: 'order() ń fún wa ní IPÒ wọn ní títò. Èyí tí ó kéré jù, 10, wà ní ipò 2, lẹ́yìn náà 20 ní ipò 3, lẹ́yìn náà 30 ní ipò 1.' },
    mission: {
      text: 'Show the class table sorted from the lowest score to the highest. Then print only the name of the top student, using which.max().',
      text_yo: 'Fi tábìlì kíláàsì hàn ní títò láti máàkì tí ó kéré jù dé èyí tí ó ga jù. Lẹ́yìn náà tẹ orúkọ akẹ́kọ̀ọ́ tí ó ṣe dáadáa jù nìkan jáde, pẹ̀lú which.max().',
      goal: 'Sorts with order(), and R prints "Chidi"', goal_yo: 'Tò pẹ̀lú order(), R sì tẹ "Chidi" jáde',
      hint: 'class_scores[order(class_scores$score), ]\ntop <- class_scores[which.max(class_scores$score), ]\ntop$name',
      check: (out, code) => /order\s*\(\s*class_scores\$score\s*\)/.test(code) && /which\.max\s*\(/.test(code) && /\[1\] "Chidi"/.test(out) },
  },
};
