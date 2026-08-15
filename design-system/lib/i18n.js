/* Language for the generated deliverable.
 *
 * This covers the words that end up in the *customer's* page and files — the
 * scaffolding the generator writes around their own text. The intake's own
 * interface is translated separately, at build time, because it is markup
 * rather than data.
 *
 * Arabic is not a swap of one string for another. Three things change with it:
 * the document direction, the typography (a connected script must never be
 * letter-spaced, and uppercase means nothing in it), and the punctuation —
 * Arabic uses ، and ؟ rather than , and ?.
 */

export const LANGS = {
  en: { dir: 'ltr', name: 'English' },
  ar: { dir: 'rtl', name: 'العربية' },
};

export const isRtl = lang => LANGS[lang]?.dir === 'rtl';

const EN = {
  // Page scaffolding
  presentation: 'Presentation',
  cover: 'Cover',
  closing: 'Closing',
  whatWeDo: 'What we do',
  whatWeOffer: 'What we offer',
  whyUs: 'Why us',
  forWhom: who => `Made for ${who.toLowerCase()}.`,
  offerFallback: ['Something you offer', 'Something else', 'A third thing'],
  cardFillerShort: 'A sentence about this.',
  cardFiller: "A sentence about this. Replace it with the real thing when you're ready.",
  nameHere: 'Your name here',
  getInTouch: 'Get in touch',
  subFallback: 'A line about what you do and who it helps.',
  emailPlaceholder: 'your@email.com',
  forBadge: who => `For ${who}`,

  // The comment carrying their brief, inside the delivered page
  briefTitle: 'Your brief',
  briefNote: 'The wording below is a first draft built from your answers.\n  Change anything you like — it is a starting point, not the final copy.',
  briefFor: 'For',
  briefNeed: 'You need',
  briefLook: 'The look',
  briefLogo: 'Logo',
  briefLogoNotes: 'Logo notes',
  briefWords: 'Words',

  // Files in the package
  copyHeading: 'Your words',
  copyFromDoc: 'This is what we read from your document. Edit freely.',
  copyDraftNote: 'A first draft, written from your answers. Change anything.',
  copyHeadline: 'Headline',
  copySub: 'Underneath it',
  copyOffers: 'What you offer',
  copyAction: 'What you want people to do',
  copyContact: 'Contact',
  copyContactMissing: '(add your contact details)',

  briefFileHeading: 'Your brief',
  briefYouNeeded: 'You needed',
  briefLogoType: 'Logo type',
  briefApproved: d => `Approved on ${d}.`,

  readmeKeep: 'Everything here is yours to keep.',
  readmeFiles: 'The files',
  readmeFile: 'File',
  readmeWhat: 'What it is',
  readmeIndex: 'Your page. Double-click it to open in any browser.',
  readmeCopy: 'Your words on their own, so you can edit them without touching the page.',
  readmeBrief: 'What you chose, for your records.',
  readmeChanging: 'Changing the words',
  readmeChangingBody: 'Open `index.html` in any text editor and edit the text between the tags. The\nwording in it is a first draft — replace it with your own.',
  readmeOnline: 'Putting it online',
  readmeOnlineBody: 'The page is a single file with nothing else to install, so almost anywhere works:',
  readmeHost1: '**Netlify Drop** — drag the folder onto netlify.com/drop',
  readmeHost2: '**GitHub Pages** — put `index.html` in a repository and turn Pages on',
  readmeHost3: '**Your own host** — upload `index.html` by FTP',
  readmeLater: 'Making changes later',
  readmeLaterBody: c => `Nothing here expires and nothing phones home. If you'd rather we made the\nchanges, get in touch: ${c}`,

  // Summaries of what they answered
  sumSupplied: n => `Supplied — ${n}`,
  sumReadyUpload: 'Ready to upload',
  sumToDescribe: 'To be described',
  sumNameOnly: 'Name only, for now',
  sumFromDoc: n => `Your document — ${n} words`,
  sumWeDraft: (a, b) => `We'll draft it — ${a} of ${b} answered`,
  sumFromScratch: "We'll draft it from scratch",

  locale: 'en-GB',
};

const AR = {
  presentation: 'عرض تقديمي',
  cover: 'الغلاف',
  closing: 'الختام',
  whatWeDo: 'ما الذي نقوم به',
  whatWeOffer: 'ما الذي نقدّمه',
  whyUs: 'لماذا نحن',
  /* "من أجل" rather than the لـ prefix: attaching ل to a word beginning with
     ال requires contracting it (لـالشركات → للشركات), which string
     concatenation cannot do. The standalone phrase is always correct. */
  forWhom: who => `مصمّم من أجل ${who}.`,
  offerFallback: ['شيء تقدّمه', 'شيء آخر', 'وشيء ثالث'],
  cardFillerShort: 'جملة عن هذا.',
  cardFiller: 'جملة عن هذا. استبدلها بنصّك الحقيقي حين تكون جاهزًا.',
  nameHere: 'اسمك هنا',
  getInTouch: 'تواصل معنا',
  subFallback: 'سطر يشرح ما الذي تقوم به ومَن يستفيد منه.',
  emailPlaceholder: 'your@email.com',
  forBadge: who => `من أجل ${who}`,

  briefTitle: 'موجزك',
  briefNote: 'النصّ أدناه مسوّدة أولى مبنيّة على إجاباتك.\n  غيّر منه ما تشاء — فهو نقطة بداية، وليس النصّ النهائي.',
  briefFor: 'الجهة',
  briefNeed: 'ما تحتاجه',
  briefLook: 'المظهر',
  briefLogo: 'الشعار',
  briefLogoNotes: 'ملاحظات الشعار',
  briefWords: 'النصوص',

  copyHeading: 'نصوصك',
  copyFromDoc: 'هذا ما قرأناه من مستندك. عدّله كما تشاء.',
  copyDraftNote: 'مسوّدة أولى مكتوبة من إجاباتك. غيّر منها ما تشاء.',
  copyHeadline: 'العنوان الرئيسي',
  copySub: 'السطر الذي تحته',
  copyOffers: 'ما الذي تقدّمه',
  copyAction: 'ما الذي تريد من الناس فعله',
  copyContact: 'وسيلة التواصل',
  copyContactMissing: '(أضف بيانات التواصل)',

  briefFileHeading: 'موجزك',
  briefYouNeeded: 'ما احتجته',
  briefLogoType: 'نوع الشعار',
  briefApproved: d => `تمت الموافقة بتاريخ ${d}.`,

  readmeKeep: 'كل ما هنا ملكك، تحتفظ به.',
  readmeFiles: 'الملفات',
  readmeFile: 'الملف',
  readmeWhat: 'ما هو',
  readmeIndex: 'صفحتك. انقر عليها مرتين لفتحها في أي متصفح.',
  readmeCopy: 'نصوصك وحدها، لتعدّلها دون أن تمسّ الصفحة.',
  readmeBrief: 'ما اخترته، لسجلّاتك.',
  readmeChanging: 'تغيير النصوص',
  readmeChangingBody: 'افتح `index.html` في أي محرّر نصوص وعدّل الكلام بين الوسوم. ما فيه\nمسوّدة أولى — استبدلها بنصّك أنت.',
  readmeOnline: 'نشرها على الإنترنت',
  readmeOnlineBody: 'الصفحة ملفّ واحد لا يحتاج إلى تثبيت أي شيء، لذا تعمل في أي مكان تقريبًا:',
  readmeHost1: '**Netlify Drop** — اسحب المجلّد إلى netlify.com/drop',
  readmeHost2: '**GitHub Pages** — ضع `index.html` في مستودع وفعّل Pages',
  readmeHost3: '**استضافتك الخاصة** — ارفع `index.html` عبر FTP',
  readmeLater: 'التعديل لاحقًا',
  readmeLaterBody: c => `لا شيء هنا تنتهي صلاحيته ولا شيء يتّصل بنا. وإن فضّلت أن نجري\nالتعديلات نيابة عنك، تواصل معنا: ${c}`,

  sumSupplied: n => `مُرفق — ${n}`,
  sumReadyUpload: 'جاهز للرفع',
  sumToDescribe: 'سيتم وصفه',
  sumNameOnly: 'الاسم فقط، في الوقت الحالي',
  sumFromDoc: n => `من مستندك — ${n} كلمة`,
  sumWeDraft: (a, b) => `سنكتبها لك — أجبت عن ${a} من ${b}`,
  sumFromScratch: 'سنكتبها لك من الصفر',

  locale: 'ar',
};

const TABLES = { en: EN, ar: AR };

export const t = lang => TABLES[lang] || EN;

/* Kind labels, per language, keyed the same as KIND_LABEL. */
export const KINDS = {
  en: {
    website: 'A website',
    landing: 'A page to sell something',
    deck: 'A presentation',
    portfolio: 'A portfolio',
  },
  ar: {
    website: 'موقع إلكتروني',
    landing: 'صفحة لبيع شيء ما',
    deck: 'عرض تقديمي',
    portfolio: 'معرض أعمال',
  },
};

/* Palette names and moods, so the look a customer picks is described in their
   own language rather than left in English beside translated questions. */
export const PALETTE_TEXT = {
  ar: {
    warm:     { name: 'دافئ وواثق',   tag: 'الأكثر اختيارًا', mood: 'قريب، نشِط، إنساني' },
    trusted:  { name: 'هادئ وموثوق',  tag: 'كلاسيكي',        mood: 'راسخ، آمن، جاد' },
    modern:   { name: 'عصري وحادّ',   tag: 'تقني',           mood: 'حديث، تقني، فاخر' },
    natural:  { name: 'منعش وطبيعي',  tag: '',               mood: 'صحّي، مستدام، هادئ' },
    bold:     { name: 'جريء وحيوي',   tag: '',               mood: 'إبداعي، دافئ، لافت' },
    clean:    { name: 'نظيف وواضح',   tag: '',               mood: 'دقيق، صافٍ، منفتح' },
    money:    { name: 'دقيق ومحدَّد',  tag: 'مالي',           mood: 'مضبوط، معتمَد، رصين' },
    darkprem: { name: 'داكن وفاخر',   tag: 'داكن',           mood: 'لافت، راقٍ، واثق' },
    darkgold: { name: 'داكن ودافئ',   tag: 'داكن',           mood: 'ثري، متأنٍّ، تحريري' },
  },
};
