/* ==========================================================================
   Everything you edit day-to-day lives in this file.
   Text is bilingual: { ar: "عربي", en: "English" }.
   ========================================================================== */

/* ==========================================================================
   THE PLATFORM — the business itself.
   Four questions in, a real page out. The first two are free; after that it's
   a fair one-time fee per page — never a subscription, because the file is
   theirs to keep and nothing here depends on us staying online.
   ========================================================================== */
window.PLATFORM = {
  name: { ar: "كويك سايت", en: "QuickSite" },
  mark: { ar: "ق", en: "Q" },
  domain: "quicksite.example",

  // where a finished brief arrives: the same WhatsApp handoff RentStore uses
  whatsapp: "971508400886",
  email: "hello@quicksite.example",

  // n8n webhook (see automation/01-brief-submitted.json). Empty = WhatsApp only.
  briefWebhook: "",

  freeCount: 2,

  plans: {
    free: {
      name: { ar: "الباقة المجانية", en: "Free" },
      price: 0,
      note: { ar: "أول صفحتين", en: "your first two pages" },
      lines: [
        { ar: "أربعة أسئلة، صفحة حقيقية", en: "Four questions, a real page" },
        { ar: "تسع مظاهر جاهزة للاختيار", en: "Nine looks to choose from" },
        { ar: "عربي وإنجليزي، فاتح وداكن", en: "Arabic and English, light and dark" },
        { ar: "الملف لك بالكامل — لا اشتراك", en: "The file is fully yours — no subscription" },
      ],
    },
    template: {
      name: { ar: "كل صفحة بعدها", en: "Every page after" },
      price: 79,
      once: { ar: "دفعة واحدة لكل صفحة", en: "one-time, per page" },
      note: { ar: "بلا حد أقصى لعدد الصفحات", en: "no limit on how many you make" },
      lines: [
        { ar: "نفس الأسئلة الأربعة، بلا حدود", en: "The same four questions, unlimited" },
        { ar: "دفعة واحدة، الملف يبقى لك", en: "One payment, the file is yours to keep" },
        { ar: "لا رسوم شهرية على الإطلاق", en: "No monthly fee at all" },
      ],
    },
  },
};

/* ==========================================================================
   WHAT SOMEONE IS BUILDING — question 1.
   ========================================================================== */
window.KINDS = [
  { id: "website", name: { ar: "موقع إلكتروني", en: "A website" } },
  { id: "landing", name: { ar: "صفحة لبيع شيء ما", en: "A page to sell something" } },
  { id: "deck", name: { ar: "عرض تقديمي", en: "A presentation" } },
  { id: "portfolio", name: { ar: "معرض أعمال", en: "A portfolio" } },
];

/* ==========================================================================
   THE LOOK — question 2. Nine palettes, each a full accent ramp plus a mood
   description in both languages. `on` is the text colour already checked to
   clear 4.5:1 contrast against `500` — never hand-pick a different one.
   ========================================================================== */
window.PALETTES = [
  { id: "warm", theme: "amber", ground: "#FFFFFF", dark: false, tag: { ar: "الأكثر اختياراً", en: "Most popular" },
    name: { ar: "دافئ وواثق", en: "Warm and confident" }, mood: { ar: "قريب، نشِط، إنساني", en: "Approachable, energetic, human" },
    c50: "#FFF8E6", c100: "#FFEDBF", c300: "#FFD24D", c500: "#F5B21A", c600: "#9B6B00", c700: "#6D4800", on: "#14181F" },
  { id: "trusted", theme: "navy", ground: "#FFFFFF", dark: false, tag: { ar: "كلاسيكي", en: "Classic" },
    name: { ar: "هادئ وموثوق", en: "Calm and trusted" }, mood: { ar: "راسخ، آمن، جاد", en: "Established, safe, serious" },
    c50: "#EEF1F8", c100: "#D6DEF0", c300: "#7C93CB", c500: "#2B4A8B", c600: "#1D3562", c700: "#132340", on: "#FFFFFF" },
  { id: "modern", theme: "violet", ground: "#FFFFFF", dark: false, tag: { ar: "تقني", en: "Tech" },
    name: { ar: "عصري وحادّ", en: "Modern and sharp" }, mood: { ar: "حديث، تقني، فاخر", en: "Current, technical, premium" },
    c50: "#F3EEFF", c100: "#E2D6FF", c300: "#A98BFF", c500: "#7C4DFF", c600: "#6534E0", c700: "#4B24A8", on: "#FFFFFF" },
  { id: "natural", theme: "green", ground: "#F7F8FA", dark: false, tag: null,
    name: { ar: "منعش وطبيعي", en: "Fresh and natural" }, mood: { ar: "صحّي، مستدام، هادئ", en: "Healthy, sustainable, calm" },
    c50: "#E7F7EF", c100: "#C2EBD8", c300: "#63CFA1", c500: "#17A673", c600: "#11855C", c700: "#0B6244", on: "#14181F" },
  { id: "bold", theme: "coral", ground: "#FAF6EC", dark: false, tag: null,
    name: { ar: "جريء وحيوي", en: "Bold and lively" }, mood: { ar: "إبداعي، دافئ، لافت", en: "Creative, warm, unmissable" },
    c50: "#FDEEEA", c100: "#FAD5CB", c300: "#F29B80", c500: "#E85D33", c600: "#C64720", c700: "#993518", on: "#14181F" },
  { id: "clean", theme: "teal", ground: "#FFFFFF", dark: false, tag: null,
    name: { ar: "نظيف وواضح", en: "Clean and clear" }, mood: { ar: "دقيق، صافٍ، منفتح", en: "Precise, clinical, open" },
    c50: "#E6F8FA", c100: "#C0EEF3", c300: "#63D6E2", c500: "#22BCCE", c600: "#14818D", c700: "#11707B", on: "#14181F" },
  { id: "money", theme: "indigo", ground: "#FFFFFF", dark: false, tag: { ar: "مالي", en: "Finance" },
    name: { ar: "دقيق ومحدَّد", en: "Sharp and precise" }, mood: { ar: "مضبوط، معتمَد، رصين", en: "Exact, dependable, quiet" },
    c50: "#EEF0FE", c100: "#D6DBFC", c300: "#8C9AF6", c500: "#4059F0", c600: "#2B41C7", c700: "#1F2F94", on: "#FFFFFF" },
  { id: "darkprem", theme: "violet", ground: "#14181F", dark: true, tag: { ar: "داكن", en: "Dark" },
    name: { ar: "داكن وفاخر", en: "Dark and premium" }, mood: { ar: "لافت، راقٍ، واثق", en: "Striking, high-end, confident" },
    c50: "#F3EEFF", c100: "#E2D6FF", c300: "#A98BFF", c500: "#7C4DFF", c600: "#6534E0", c700: "#4B24A8", on: "#FFFFFF" },
  { id: "darkgold", theme: "amber", ground: "#14181F", dark: true, tag: { ar: "داكن", en: "Dark" },
    name: { ar: "داكن ودافئ", en: "Dark and warm" }, mood: { ar: "ثري، متأنٍّ، تحريري", en: "Rich, considered, editorial" },
    c50: "#FFF8E6", c100: "#FFEDBF", c300: "#FFD24D", c500: "#F5B21A", c600: "#9B6B00", c700: "#6D4800", on: "#14181F" },
];

/* ==========================================================================
   THE INTERFACE — every fixed word site.js draws. `tx()` reads the bilingual
   content above; `t()` reads this dictionary. Keeping them separate means a
   customer's own words never collide with the app's own wording.
   ========================================================================== */
window.I18N = {
  ar: {
    "nav.brief": "ابدأ صفحتك",
    "nav.lang": "English",
    "nav.theme": "الوضع",

    "landing.eyebrow": "أسلوب واحد، كل ما تبنيه",
    "landing.h1": "أربعة أسئلة. صفحة حقيقية.",
    "landing.sub": "اختر مظهرك، أجب عن أسئلة قليلة عن مشروعك، وشاهد صفحتك تُبنى أمامك — بكلماتك أنت، بلا كود وبلا تعقيد.",
    "landing.cta": "ابدأ الآن، مجاناً",
    "landing.cta2": "شاهد كيف تبدو النتيجة",
    "landing.free.tag": "أول صفحتين مجاناً — بلا بطاقة، بلا حساب",

    "landing.how.eyebrow": "كيف تعمل",
    "landing.how.h2": "من فكرة إلى صفحة، في دقيقتين",
    "landing.how.1.t": "اختر ما تبنيه",
    "landing.how.1.d": "موقع، صفحة بيع، عرض تقديمي، أو معرض أعمال.",
    "landing.how.2.t": "اختر مظهرك",
    "landing.how.2.d": "تسعة مظاهر جاهزة، كل واحد مُختبَر ليبقى نصّك سهل القراءة.",
    "landing.how.3.t": "أجب بكلماتك",
    "landing.how.3.d": "ما الذي تقدّمه، لمن، ولماذا يثقون بك.",
    "landing.how.4.t": "نزّل صفحتك",
    "landing.how.4.d": "ملف واحد يعمل في أي متصفح، لك بالكامل.",

    "landing.pricing.eyebrow": "السعر",
    "landing.pricing.h2": "بسيط، وواضح من أول يوم",
    "landing.pricing.free.cta": "ابدأ مجاناً",
    "landing.pricing.paid.cta": "جرّب صفحة أخرى",

    "landing.footer.rights": "كل الحقوق محفوظة",

    "brief.eyebrow": "موجز المشروع",
    "brief.h1": "حدّثنا عن مشروعك",
    "brief.sub": "أربعة أسئلة فقط. لا شيء تكتبه هنا يُرفع إلى أي مكان قبل أن تضغط زر الإرسال.",

    "brief.q1.n": "١", "brief.q1.h": "ما الذي تحتاجه؟", "brief.q1.hint": "اختر الأقرب. يمكن التعديل لاحقاً.",
    "brief.name.label": "ما اسمه؟", "brief.name.ph": "مثال: مروج للاستشارات",

    "brief.q2.n": "٢", "brief.q2.h": "أي مظهر يعجبك؟", "brief.q2.hint": "اختر ما يبدو مناسباً — كلّها مُختبَرة ليبقى نصّك سهل القراءة.",
    "brief.pal.heading": "عنوانك", "brief.pal.line": "سطر من نصّك، هكذا", "brief.pal.sub": "وجملة تحته.", "brief.pal.btn": "زرّك",

    "brief.q3.n": "٣", "brief.q3.h": "ما الذي تقدّمه؟", "brief.q3.hint": "بكلماتك أنت — لن نخترع شيئاً لم تقله.",
    "brief.what.label": "ما الذي تفعله؟", "brief.what.ph": "مثال: تخطيط ربع سنوي يصمد أمام الواقع",
    "brief.who.label": "لمن هذا؟", "brief.who.ph": "مثال: مديرو العمليات في الشركات النامية",
    "brief.why.label": "لماذا يختارونك؟", "brief.why.ph": "مثال: نبقى معك حتى التسليم، لا حتى العرض فقط",
    "brief.offer.label": "ماذا تقدّم؟ (سطر لكل شيء)", "brief.offer.ph": "التخطيط الربع سنوي\nتحليلات العمليات\nدعم التسليم",

    "brief.q4.n": "٤", "brief.q4.h": "كيف يتواصلون معك؟", "brief.q4.hint": "زرّ صفحتك سيقود إلى هذا.",
    "brief.action.label": "ماذا تريد منهم أن يفعلوا؟", "brief.action.ph": "احجز مكالمة",
    "brief.contact.label": "بريدك أو رقمك", "brief.contact.ph": "hello@example.com",

    "brief.preview.eyebrow": "معاينة صفحتك", "brief.preview.hint": "تتمرّر داخلها. تتحدّث كلما غيّرت إجابة.",
    "brief.preview.empty": "اختر ما تحتاجه ومظهراً أولاً، وسنريك شيئاً هنا.",

    "brief.usage.free": n => `متبقٍّ لك ${n} من صفحتين مجانيتين.`,
    "brief.usage.paid": "استخدمت صفحتيك المجانيتين — هذه بسعر الباقة الثانية.",

    "brief.send": "أرسل موجزي واحصل على صفحتي",
    "brief.sending": "جارٍ الإرسال…",
    "brief.sent": "تم. افتح واتساب لإكمال الطلب — سنجهّز ملفك ونرسله خلال ساعات.",
    "brief.download": "نزّل معاينة الصفحة (.html)",
    "brief.incomplete": "أجب عن السؤالين الأول والثاني على الأقل قبل الإرسال.",
  },

  en: {
    "nav.brief": "Start your page",
    "nav.lang": "العربية",
    "nav.theme": "Theme",

    "landing.eyebrow": "One house style, everything you build",
    "landing.h1": "Four questions. A real page.",
    "landing.sub": "Pick a look, answer a few plain questions about your work, and watch your page get built in front of you — in your own words, no code, no fuss.",
    "landing.cta": "Start now, it's free",
    "landing.cta2": "See what comes out",
    "landing.free.tag": "Your first two pages are free — no card, no account",

    "landing.how.eyebrow": "How it works",
    "landing.how.h2": "From an idea to a page, in two minutes",
    "landing.how.1.t": "Pick what you're building",
    "landing.how.1.d": "A website, a page to sell something, a deck, or a portfolio.",
    "landing.how.2.t": "Pick a look",
    "landing.how.2.d": "Nine palettes, each checked so your text stays easy to read.",
    "landing.how.3.t": "Answer in your own words",
    "landing.how.3.d": "What you offer, who it's for, and why they'd trust you.",
    "landing.how.4.t": "Download your page",
    "landing.how.4.d": "One file that opens in any browser — fully yours.",

    "landing.pricing.eyebrow": "Pricing",
    "landing.pricing.h2": "Simple, and honest from day one",
    "landing.pricing.free.cta": "Start free",
    "landing.pricing.paid.cta": "Build another page",

    "landing.footer.rights": "All rights reserved",

    "brief.eyebrow": "Project brief",
    "brief.h1": "Tell us about your project",
    "brief.sub": "Just four questions. Nothing here is uploaded anywhere until you press send.",

    "brief.q1.n": "1", "brief.q1.h": "What do you need?", "brief.q1.hint": "Pick the closest one. We can adjust later.",
    "brief.name.label": "What's it called?", "brief.name.ph": "e.g. Northbrook Studio",

    "brief.q2.n": "2", "brief.q2.h": "Which look do you like?", "brief.q2.hint": "Pick whichever feels right — each one is checked so your text stays easy to read.",
    "brief.pal.heading": "Your heading", "brief.pal.line": "A line of your text, like this", "brief.pal.sub": "And a sentence underneath it.", "brief.pal.btn": "Your button",

    "brief.q3.n": "3", "brief.q3.h": "What do you offer?", "brief.q3.hint": "In your own words — we won't invent anything you didn't say.",
    "brief.what.label": "What do you do?", "brief.what.ph": "e.g. Quarterly planning that survives contact with reality",
    "brief.who.label": "Who is it for?", "brief.who.ph": "e.g. Operations leads at growing firms",
    "brief.why.label": "Why do they choose you?", "brief.why.ph": "e.g. We stay through delivery, not just the pitch",
    "brief.offer.label": "What do you offer? (one line each)", "brief.offer.ph": "Quarterly planning\nOperations analytics\nDelivery support",

    "brief.q4.n": "4", "brief.q4.h": "How do they reach you?", "brief.q4.hint": "Your page's button will lead here.",
    "brief.action.label": "What do you want them to do?", "brief.action.ph": "Book a call",
    "brief.contact.label": "Your email or number", "brief.contact.ph": "hello@example.com",

    "brief.preview.eyebrow": "Your page, so far", "brief.preview.hint": "Scroll inside it. Updates as you change an answer.",
    "brief.preview.empty": "Pick what you need and a look first, and we'll show you something here.",

    "brief.usage.free": n => `${n} of your 2 free pages left.`,
    "brief.usage.paid": "Your two free pages are used — this one is at the per-page rate.",

    "brief.send": "Send my brief and get my page",
    "brief.sending": "Sending…",
    "brief.sent": "Done. Open WhatsApp to finish — we'll have your file ready within hours.",
    "brief.download": "Download a preview (.html)",
    "brief.incomplete": "Answer at least the first two questions before sending.",
  },
};
