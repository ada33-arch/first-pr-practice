/* Arabic for the intake's own interface.
 *
 * Kept as an ordered list of exact source strings rather than keys, because
 * the interface is markup written in English and translating it at build time
 * avoids threading a lookup through every element of a page that already
 * works. The build fails if any of these stops matching, so an English edit
 * can never silently ship a half-translated Arabic page.
 *
 * Order matters: longer strings first, so a short phrase never eats a piece of
 * a longer one it happens to appear inside.
 */

export const UI_AR = [
  // ---- Header and the try-it banner
  ['Answer four questions and you\'ll have a real page to look at. Nothing you\n      type or upload leaves your computer — there\'s no account and no server\n      behind this.',
   'أجب عن أربعة أسئلة وستحصل على صفحة حقيقية تنظر إليها. لا شيء مما تكتبه أو ترفعه يغادر جهازك — لا حساب ولا خادم وراء هذا.'],
  ['Try it', 'جرّبه'],
  ['Four questions. There\'s a way through every one of them even if you don\'t\n      have a logo or your words written yet — just say so and we\'ll handle it.\n      Nothing you add here is uploaded anywhere; it stays on your computer.',
   'أربعة أسئلة. لكلٍّ منها مخرج حتى إن لم يكن لديك شعار أو نصوص جاهزة — قل ذلك فحسب وسنتولّى الأمر. لا شيء تضيفه هنا يُرفع إلى أي مكان؛ يبقى على جهازك.'],
  ['Tell us about your project', 'حدّثنا عن مشروعك'],
  ['Project brief', 'موجز المشروع'],
  ['My projects', 'مشاريعي'],
  ['Sign out', 'تسجيل الخروج'],

  // ---- Question 1
  ['What do you need?', 'ما الذي تحتاجه؟'],
  ['Pick the closest one. We can adjust later.', 'اختر الأقرب. يمكننا التعديل لاحقًا.'],
  ['A single page to sell something', 'صفحة واحدة لبيع شيء ما'],
  ['A website', 'موقع إلكتروني'],
  ['A presentation', 'عرض تقديمي'],
  ['A portfolio', 'معرض أعمال'],
  ['What\'s it called?', 'ما اسمه؟'],
  ['e.g. Northbrook, Kestrel Studio', 'مثال: مروج، استوديو الصقر'],

  // ---- Question 2
  ['Which look do you like?', 'أي مظهر يعجبك؟'],
  ['Pick whichever feels right — there\'s no wrong answer, and every one of\n        these is checked so your text stays easy to read.',
   'اختر ما يبدو لك مناسبًا — لا إجابة خاطئة، وكلٌّ من هذه مُختبَر ليبقى نصّك سهل القراءة.'],
  ['Your heading', 'عنوانك'],
  ['A line of your<br>text, like this', 'سطر من<br>نصّك، هكذا'],
  ['And a sentence underneath it.', 'وجملة تحته.'],
  ['Your button', 'زرّك'],

  // ---- Question 3
  ['Have one? Add it. Don\'t? Describe what you\'d like and we\'ll take it from there.',
   'لديك شعار؟ أضفه. لا؟ صِف ما تريده ونحن نكمل من هناك.'],
  ['Your logo', 'شعارك'],
  ['I have a logo', 'لديّ شعار'],
  ['I\'ll describe what I want', 'سأصف ما أريد'],
  ['Just use my name for now', 'استخدم اسمي فقط الآن'],

  // ---- Question 4
  ['Your words', 'نصوصك'],
  ['Nothing written yet', 'لا نصوص بعد'],
  ['Ask me questions instead', 'اسألني أسئلة بدلًا من ذلك'],
  ['I have a document', 'لديّ مستند'],

  // ---- Summary and actions
  ['Answer the questions above and your brief appears here.', 'أجب عن الأسئلة أعلاه وسيظهر موجزك هنا.'],
  ['Scroll inside it. Change an answer and it updates.', 'مرّر داخلها. غيّر إجابة وستتحدّث.'],
  ['Open full size', 'افتح بالحجم الكامل'],
  ['See my page', 'شاهد صفحتي'],
  ['Save my brief', 'احفظ موجزي'],
  ['Start again', 'ابدأ من جديد'],
  ['Your brief', 'موجزك'],
  ['Your page', 'صفحتك'],
  ['Close', 'إغلاق'],

  // ---- Approval
  ['Look at your page first, then approve it here to get the finished files.',
   'انظر إلى صفحتك أولًا، ثم وافق عليها هنا لتحصل على الملفات النهائية.'],
  ['Happy with it?', 'هل أعجبتك؟'],
  ['What you get', 'ما الذي تحصل عليه'],
  ['Your order', 'طلبك'],
  ['Download my files', 'نزّل ملفاتي'],

  // ---- Feedback panel
  ['Honest answers are more useful than kind ones. Nothing here is sent anywhere — you\'ll get a summary to copy and send back.',
   'الإجابات الصريحة أنفع من المجاملة. لا شيء هنا يُرسل إلى أي مكان — ستحصل على ملخّص تنسخه وترسله لنا.'],
  ['What did you think?', 'ما رأيك؟'],
  ['Was anything confusing or annoying?', 'هل كان أي شيء مربكًا أو مزعجًا؟'],
  ['A question that didn\'t make sense, a step that felt slow…', 'سؤال غير مفهوم، خطوة بدت بطيئة…'],
  ['Did the page look like something you\'d use?', 'هل بدت الصفحة شيئًا قد تستخدمه؟'],
  ['Too plain, too busy, wrong for my line of work…', 'بسيطة أكثر من اللازم، مزدحمة، لا تناسب مجالي…'],
  ['Would you pay for this? What feels fair?', 'هل ستدفع مقابل هذا؟ وما السعر العادل برأيك؟'],
  ['What\'s missing?', 'ما الذي ينقصها؟'],
  ['The one thing that would make you actually use it', 'الشيء الوحيد الذي سيجعلك تستخدمها فعلًا'],
  ['Copy my feedback', 'انسخ ملاحظاتي'],
  ['Copy this and send it back', 'انسخ هذا وأرسله لنا'],

  // ---- Messages the script sets
  ['Pick what you need and a look first, then we can show you something.',
   'اختر ما تحتاجه ومظهرًا أولًا، عندها يمكننا أن نريك شيئًا.'],
  ['Pick what you need and a look first.', 'اختر ما تحتاجه ومظهرًا أولًا.'],
  ['To preview here, open this page from a web address rather than straight off your computer.',
   'للمعاينة هنا، افتح هذه الصفحة من عنوان على الإنترنت بدلًا من فتحها مباشرة من جهازك.'],
  ['To build your files, open this page from a web address rather than straight off your computer.',
   'لبناء ملفاتك، افتح هذه الصفحة من عنوان على الإنترنت بدلًا من فتحها مباشرة من جهازك.'],
  ['Your browser blocked the new tab — the preview below is the same page.',
   'منع متصفحك فتح التبويب الجديد — المعاينة بالأسفل هي الصفحة نفسها.'],
  ['Shown below. Change an answer and press it again.', 'ظهرت بالأسفل. غيّر إجابة واضغط مرة أخرى.'],
  ['Write something in at least one box first.', 'اكتب شيئًا في خانة واحدة على الأقل أولًا.'],
  ['Copied. Paste it wherever you like.', 'تم النسخ. الصقه حيث تشاء.'],
  ['Select the text below and copy it.', 'حدّد النص بالأسفل وانسخه.'],
  ['One payment. The files are yours — no subscription and nothing to renew.',
   'دفعة واحدة. الملفات ملكك — لا اشتراك ولا تجديد.'],
];

/* The intake's Arabic layer. The generated page carries its own copy of this
   reasoning; this one is for the questions themselves. */
export const UI_RTL_CSS = `
/* ===== Arabic build only ===== */
:root {
  --font-display: "Noto Kufi Arabic", "SF Arabic", "Geeza Pro", "Dubai", Tahoma, system-ui, sans-serif;
  --font-body: "Noto Naskh Arabic", "SF Arabic", "Geeza Pro", "Dubai", Tahoma, system-ui, sans-serif;
  --tracking-display: 0;
  --tracking-tight: 0;
  --tracking-eyebrow: 0;
}
/* Arabic is a connected script: tracking prises the joined letters apart, and
   there is no case for uppercase to act on. Both are reset everywhere the
   house style applies them. */
h1, h2, h3, h4, .h1, .h2, .h3, .display, .eyebrow, .label, .caption,
.qs__n, .pal__sub, .pal__name, .pal__tag, .btn, .opt, .trybar__tag {
  letter-spacing: 0;
  text-transform: none;
}
.eyebrow, .trybar__tag { font-weight: 700; }
/* The summary's label column sat at a fixed left width; in RTL it needs to be
   a logical start, and Arabic labels run longer than English ones. */
.sum-row dt { width: 132px; }
/* Latin runs — an email, a file name, a brand written in Latin — keep their
   own direction inside Arabic text instead of having their punctuation flipped. */
input[type="email"], #cContact, #fbOut, code, .mono { direction: ltr; text-align: left; unicode-bidi: plaintext; }
.pal__demo, .pal__name { text-align: start; }
`;
