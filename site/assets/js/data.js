/* ==========================================================================
   Everything you edit day-to-day lives in this file.
   Text is bilingual: { ar: "عربي", en: "English" }.
   ========================================================================== */

/* ==========================================================================
   THE PLATFORM — the business itself.
   Signing up is free and gives you a profile page. Adding a store is monthly.
   ========================================================================== */
window.PLATFORM = {
  name: { ar: "متجري", en: "Matjari" },          // ← your brand name
  mark: { ar: "م", en: "M" },
  domain: "matjari.ae",                           // ← used in the @handle preview

  // where signups arrive: the same WhatsApp trick the orders use
  whatsapp: "971508400886",
  email: "",

  plans: {
    free: {
      name: { ar: "الملف الشخصي", en: "Profile" },
      price: 0,
      note: { ar: "دائماً", en: "forever" },
      lines: [
        { ar: "صفحة روابط باسمك", en: "A link page under your name" },
        { ar: "رابط قصير تحطه في البايو", en: "A short link for your bio" },
        { ar: "روابط ومواقع تواصل بلا حد", en: "Unlimited links and socials" },
        { ar: "زر واتساب مباشر", en: "A direct WhatsApp button" },
        { ar: "عربي وإنجليزي، فاتح وداكن", en: "Arabic and English, light and dark" },
      ],
    },
    store: {
      name: { ar: "المتجر", en: "Store" },
      price: 29,                                  // ← your monthly price
      period: { ar: "شهرياً", en: "per month" },
      note: { ar: "تقدر توقفه في أي وقت", en: "Cancel whenever you want" },
      badge: { ar: "الأكثر طلباً", en: "Most popular" },
      lines: [
        { ar: "كل مزايا الملف الشخصي", en: "Everything in Profile" },
        { ar: "منتجات بلا حد مع صور وأسعار", en: "Unlimited products with images and prices" },
        { ar: "صفحة لكل منتج وتصنيفات وبحث", en: "A page per product, categories, and search" },
        { ar: "سلة مشتريات وطلبات تصلك واتساب", en: "A cart, with orders arriving on WhatsApp" },
        { ar: "تستلم المبلغ مباشرة من الزبون", en: "You take payment directly from the buyer" },
      ],
    },
  },

  // what people sell on it — the perfume shop is only one example
  sells: [
    { icon: "🧴", label: { ar: "عطور ومستحضرات", en: "Perfume and beauty" } },
    { icon: "📚", label: { ar: "كتب ومطبوعات", en: "Books and print" } },
    { icon: "🎓", label: { ar: "دورات وملفات", en: "Courses and files" } },
    { icon: "💻", label: { ar: "أنظمة وبرامج", en: "Software and systems" } },
    { icon: "🛠️", label: { ar: "خدمات وحجوزات", en: "Services and bookings" } },
    { icon: "🔁", label: { ar: "اشتراكات شهرية", en: "Monthly subscriptions" } },
  ],

  steps: [
    {
      title: { ar: "سجّل مجاناً", en: "Sign up free" },
      body: { ar: "اسمك ورابطك فقط. بدون بطاقة بنكية وبدون التزام.", en: "Just your name and your handle. No card, no commitment." },
    },
    {
      title: { ar: "جهّز صفحتك", en: "Set up your page" },
      body: { ar: "صورتك، نبذتك، روابطك وحساباتك — وصفحتك جاهزة للبايو.", en: "Photo, bio, links, socials — ready for your bio." },
    },
    {
      title: { ar: "فعّل المتجر وقت ما تحتاج", en: "Turn the store on when you need it" },
      body: { ar: "أضف منتجاتك وتبدأ الطلبات توصلك على واتساب مباشرة.", en: "Add your products and orders start arriving on WhatsApp." },
    },
  ],

  faq: [
    {
      q: { ar: "التسجيل مجاني فعلاً؟", en: "Is signing up really free?" },
      a: { ar: "نعم. الملف الشخصي وصفحة الروابط مجانية دائماً، والاشتراك الشهري فقط لمن يبي متجر بمنتجات وسلة وطلبات.",
           en: "Yes. The profile and link page are free forever. The monthly fee is only for a store with products, a cart, and orders." },
    },
    {
      q: { ar: "كيف تصلني الطلبات والمبالغ؟", en: "How do orders and payments reach me?" },
      a: { ar: "الطلب يوصلك على واتساب بتفاصيله كاملة، وتتفق مع الزبون على الدفع مباشرة. ما ناخذ نسبة من مبيعاتك.",
           en: "Each order arrives on WhatsApp in full, and you settle payment with the buyer directly. We take no cut of your sales." },
    },
    {
      q: { ar: "وش أقدر أبيع؟", en: "What can I sell?" },
      a: { ar: "أي شيء: عطور، كتب، دورات، أنظمة وبرامج، خدمات، اشتراكات. المتجر ما يفرض عليك نوع منتج.",
           en: "Anything: perfume, books, courses, software, services, subscriptions. The store doesn't limit you to one kind of product." },
    },
    {
      q: { ar: "أقدر ألغي الاشتراك؟", en: "Can I cancel?" },
      a: { ar: "في أي وقت. لو أوقفت الاشتراك يرجع ملفك الشخصي مجاني وتبقى روابطك شغالة.",
           en: "Any time. If you stop, your profile goes back to free and your links keep working." },
    },
  ],
};

/* the same spec list for every bottle — edit once */
const NOTES = [
  { ar: "١٢ مل رول أون", en: "12 ml roll-on" },
  { ar: "زيت مركّز خالٍ من الكحول", en: "Alcohol-free concentrated oil" },
  { ar: "ثبات ٦ إلى ٨ ساعات", en: "6 to 8 hours of wear" },
  { ar: "علبة هدية مع كل قطعة", en: "Gift box with every bottle" },
];

window.SITE = {
  /* ------------------------------------------------------------ profile -- */
  handle: "_ys",
  name: { ar: "احمد العامري", en: "Ahmed Alameri" },
  verified: true,
  avatar: "",              // e.g. "assets/img/avatar.jpg" — falls back to initials
  initials: { ar: "أ", en: "A" },
  bio: {
    ar: "زيوت عطرية مركّزة، تُخلط وتُعبّأ بعناية. اختر عطرك واطلبه مباشرة على واتساب.",
    en: "Concentrated perfume oils, blended and bottled with care. Pick your scent and order straight over WhatsApp.",
  },

  /* ------------------------------------------------------------ contact -- */
  // WhatsApp number in international format, digits only (no + and no spaces).
  // Leave "" to fall back to copy-to-clipboard checkout.
  whatsapp: "971508400886",
  email: "",
  // Newsletter form POST endpoint (Mailchimp / Buttondown / Formspree …).
  // Empty + no email = the newsletter block and its link stay hidden.
  newsletterAction: "",
  currency: { ar: "د.إ", en: "AED" },

  /* ------------------------------------------------------------ socials -- */
  socials: [
    { icon: "instagram", label: "Instagram", url: "https://instagram.com/_ys" },
    { icon: "snapchat",  label: "Snapchat",  url: "https://snapchat.com/add/ahmad536" },
    { icon: "whatsapp",  label: "WhatsApp",  url: "https://wa.me/971508400886" },
  ],

  /* -------------------------------------------------------------- links -- */
  links: [
    {
      icon: "🕌",
      title: { ar: "المتجر — كل العطور", en: "Shop — every fragrance" },
      sub:   { ar: "زيوت عطرية مركّزة · ١٥٠ د.إ", en: "Concentrated perfume oils · AED 150" },
      url: "store.html",
      tag: { ar: "الأهم", en: "Top" },
    },
    {
      icon: "🥇",
      title: { ar: "الأكثر مبيعاً: عود ملكي", en: "Bestseller: Royal Oud" },
      sub:   { ar: "عود دخوني دافئ يدوم طويلاً", en: "Warm smoky oud with long wear" },
      url: "product.html?id=oud-royal",
    },
    {
      icon: "🌙",
      title: { ar: "الجديد: ياسمين الليل", en: "New: Night Jasmine" },
      sub:   { ar: "ياسمين أبيض لليالي الصيف", en: "White jasmine for summer nights" },
      url: "product.html?id=jasmine-night",
    },
    {
      icon: "💬",
      title: { ar: "تواصل معي واتساب", en: "Message me on WhatsApp" },
      sub:   { ar: "للطلبات والاستفسارات · ٠٥٠ ٨٤٠ ٠٨٨٦", en: "Orders and questions · 050 840 0886" },
      url: "wa",
    },
  ],

  /* ----------------------------------------------------------- products -- */
  // art: gradient stops + emoji, used when `image` is empty.
  products: [
    {
      id: "oud-royal",
      category: { ar: "عود", en: "Oud" },
      title: { ar: "عود ملكي", en: "Royal Oud" },
      desc: {
        ar: "عود دخوني دافئ مع لمسة عنبر — عطر المناسبات والليالي الطويلة.",
        en: "Warm smoky oud with a touch of amber — for occasions and long evenings.",
      },
      price: 150,
      badge: { ar: "الأكثر مبيعاً", en: "Bestseller" },
      featured: true,
      image: "",
      art: { motif: "bottle", oil: "#8a4b1d", cap: "#d8b475", from: "#3b2412", to: "#140b06" },
      features: NOTES,
      notes: {
        ar: "عود · عنبر · مسك",
        en: "Oud · Amber · Musk",
      },
    },
    {
      id: "musk-white",
      category: { ar: "مسك", en: "Musk" },
      title: { ar: "مسك أبيض", en: "White Musk" },
      desc: {
        ar: "مسك نظيف وهادئ، خفيف على البشرة ومناسب للدوام والاستخدام اليومي.",
        en: "Clean, quiet musk — light on skin and easy to wear every day.",
      },
      price: 150,
      badge: null,
      featured: true,
      image: "",
      art: { motif: "bottle", oil: "#e6e1d6", cap: "#d8b475", from: "#2f3138", to: "#111216" },
      features: NOTES,
      notes: {
        ar: "مسك أبيض · قطن · فانيلا خفيفة",
        en: "White musk · Cotton · Soft vanilla",
      },
    },
    {
      id: "amber-noir",
      category: { ar: "عنبر", en: "Amber" },
      title: { ar: "عنبر أسود", en: "Amber Noir" },
      desc: {
        ar: "عنبر راتنجي دافئ مع بخور خفيف — ثقيل بما يكفي لليل، ناعم بما يكفي للنهار.",
        en: "Warm resinous amber over soft incense — heavy enough for night, smooth enough for day.",
      },
      price: 150,
      badge: null,
      featured: true,
      image: "",
      art: { motif: "bottle", oil: "#c8791f", cap: "#d8b475", from: "#4a2f10", to: "#170e04" },
      features: NOTES,
      notes: {
        ar: "عنبر · بخور · صندل",
        en: "Amber · Incense · Sandalwood",
      },
    },
    {
      id: "rose-taif",
      category: { ar: "ورد", en: "Rose" },
      title: { ar: "ورد طائفي", en: "Taif Rose" },
      desc: {
        ar: "ورد طائفي صافٍ بلمسة عسل — عطر أنثوي كلاسيكي يناسب المناسبات.",
        en: "Pure Taif rose with a drop of honey — a classic feminine scent for occasions.",
      },
      price: 150,
      badge: { ar: "كمية محدودة", en: "Limited" },
      featured: true,
      image: "",
      art: { motif: "bottle", oil: "#c0455f", cap: "#d8b475", from: "#4a1c2c", to: "#170810" },
      features: NOTES,
      notes: {
        ar: "ورد طائفي · عسل · مسك",
        en: "Taif rose · Honey · Musk",
      },
    },
    {
      id: "sandal-cream",
      category: { ar: "خشبي", en: "Woody" },
      title: { ar: "صندل كريمي", en: "Creamy Sandalwood" },
      desc: {
        ar: "صندل ناعم بقوام كريمي، هادئ ودافئ — من أسهل العطور في الاستخدام.",
        en: "Soft sandalwood with a creamy body, calm and warm — the easiest one to wear.",
      },
      price: 150,
      badge: null,
      featured: false,
      image: "",
      art: { motif: "bottle", oil: "#c9a06a", cap: "#d8b475", from: "#3f3222", to: "#15100a" },
      features: NOTES,
      notes: {
        ar: "صندل · جوز الهند · مسك",
        en: "Sandalwood · Coconut · Musk",
      },
    },
    {
      id: "jasmine-night",
      category: { ar: "زهري", en: "Floral" },
      title: { ar: "ياسمين الليل", en: "Night Jasmine" },
      desc: {
        ar: "ياسمين أبيض يفتح بقوة ثم يهدأ على قاعدة مسك — عطر ليالي الصيف.",
        en: "White jasmine that opens loud and settles onto musk — made for summer nights.",
      },
      price: 150,
      badge: { ar: "جديد", en: "New" },
      featured: false,
      image: "",
      art: { motif: "bottle", oil: "#cfd8a8", cap: "#d8b475", from: "#24382c", to: "#0c1410" },
      features: NOTES,
      notes: {
        ar: "ياسمين · زهر البرتقال · مسك",
        en: "Jasmine · Orange blossom · Musk",
      },
    },
  ],
};

/* --------------------------------------------------------------- strings -- */
window.I18N = {
  ar: {
    "nav.start": "ابدأ مجاناً",
    "nav.example": "شوف مثال",
    "nav.pricing": "الأسعار",
    "nav.platform": "المنصّة",
    "land.eyebrow": "منصّة عربية للمتاجر الصغيرة",
    "land.title": "صفحتك مجانية. ومتجرك متى ما احتجته.",
    "land.sub": "سجّل ببلاش واحصل على صفحة روابط باسمك تحطها في البايو. وإذا بغيت تبيع، فعّل المتجر باشتراك شهري بسيط.",
    "land.ctaMain": "أنشئ صفحتك مجاناً",
    "land.ctaDemo": "شوف مثال حقيقي",
    "land.noCard": "بدون بطاقة بنكية",
    "land.sells": "بِع اللي تبيه",
    "land.sellsSub": "العطور مجرد مثال. المتجر ما يحدّد نوع منتجك.",
    "land.steps": "ثلاث خطوات وتبدأ",
    "land.pricing": "الأسعار",
    "land.pricingSub": "الصفحة مجانية دائماً. تدفع فقط لو بغيت متجر.",
    "land.faq": "أسئلة متكررة",
    "land.finalTitle": "جاهز تفتح صفحتك؟",
    "land.finalSub": "التسجيل مجاني وياخذ دقيقة.",
    "plan.freePrice": "مجاني",
    "plan.ctaFree": "ابدأ مجاناً",
    "plan.ctaStore": "فعّل المتجر",
    "signup.title": "أنشئ حسابك",
    "signup.sub": "الحساب والصفحة مجانية. تقدر تضيف المتجر بعدين وقت ما تحتاجه.",
    "signup.name": "اسمك أو اسم مشروعك",
    "signup.handle": "اسم الرابط",
    "signup.contact": "رقم واتساب",
    "signup.what": "وش تبي تبيع؟ (اختياري)",
    "signup.plan": "تبي تبدأ بإيش؟",
    "signup.submit": "أرسل طلب التسجيل",
    "signup.copy": "نسخ البيانات",
    "signup.copied": "تم نسخ بياناتك — أرسلها لنا",
    "signup.note": "التسجيل حالياً يتم عبر واتساب: تضغط الزر فتفتح المحادثة ببياناتك جاهزة، ونرد عليك ونجهّز صفحتك.",
    "signup.required": "عبّي اسمك واسم الرابط ورقم واتساب أول.",
    "signup.request": "طلب تسجيل جديد",
    "demo.ribbon": "هذه صفحة مثال على المنصّة",
    "demo.ribbonCta": "أنشئ صفحتك",
    "nav.store": "المتجر",
    "nav.links": "الروابط",
    "profile.links": "روابطي",
    "profile.featured": "عطور مختارة",
    "profile.all": "كل العطور",
    "store.eyebrow": "المتجر",
    "store.title": "زيوت عطرية تدوم معك",
    "store.sub": "زيوت مركّزة خالية من الكحول، ١٢ مل، وكل عطر بـ ١٥٠ درهم.",
    "store.search": "ابحث عن عطر…",
    "store.all": "الكل",
    "store.empty": "ما لقينا عطر بهذا البحث",
    "store.count": "عطر",
    "trust.delivery": "توصيل داخل الإمارات",
    "trust.oil": "زيت مركّز بدون كحول",
    "trust.order": "الطلب عبر واتساب",
    "product.add": "أضف للسلة",
    "product.added": "أضيف للسلة",
    "product.buy": "اشترِ الآن",
    "product.details": "التفاصيل",
    "product.includes": "تفاصيل العطر",
    "product.notes": "المكوّنات",
    "product.qty": "الكمية",
    "product.back": "رجوع لكل العطور",
    "product.missing": "هذا العطر غير موجود",
    "cart.title": "سلة المشتريات",
    "cart.empty": "سلتك فارغة",
    "cart.emptyHint": "تصفح المتجر وأضف ما يعجبك",
    "cart.total": "الإجمالي",
    "cart.checkout": "إتمام الطلب عبر واتساب",
    "cart.copy": "نسخ تفاصيل الطلب",
    "cart.copied": "تم نسخ الطلب — أرسله لي",
    "cart.close": "إغلاق",
    "cart.browse": "تصفح المتجر",
    "order.title": "طلب جديد",
    "order.total": "الإجمالي",
    "newsletter.title": "النشرة الأسبوعية",
    "newsletter.sub": "فكرة عملية واحدة كل أسبوع. بدون سبام.",
    "newsletter.placeholder": "بريدك الإلكتروني",
    "newsletter.cta": "اشترك",
    "newsletter.done": "تم! راجع بريدك لتأكيد الاشتراك",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.built": "صُنع على",
    "a11y.theme": "تبديل الوضع",
    "a11y.lang": "تغيير اللغة",
    "a11y.cart": "السلة",
  },
  en: {
    "nav.start": "Start free",
    "nav.example": "See an example",
    "nav.pricing": "Pricing",
    "nav.platform": "Platform",
    "land.eyebrow": "A storefront platform, Arabic-first",
    "land.title": "Your page is free. Your store, whenever you need it.",
    "land.sub": "Sign up for nothing and get a link page under your name for your bio. When you're ready to sell, switch the store on for a small monthly fee.",
    "land.ctaMain": "Create your page free",
    "land.ctaDemo": "See a real example",
    "land.noCard": "No card required",
    "land.sells": "Sell whatever you want",
    "land.sellsSub": "Perfume is only the example. The store doesn't care what you sell.",
    "land.steps": "Three steps to open",
    "land.pricing": "Pricing",
    "land.pricingSub": "The page is free forever. You only pay if you want a store.",
    "land.faq": "Common questions",
    "land.finalTitle": "Ready to open your page?",
    "land.finalSub": "Signing up is free and takes a minute.",
    "plan.freePrice": "Free",
    "plan.ctaFree": "Start free",
    "plan.ctaStore": "Turn on the store",
    "signup.title": "Create your account",
    "signup.sub": "The account and the page are free. You can add the store later, whenever you need it.",
    "signup.name": "Your name or your brand",
    "signup.handle": "Your handle",
    "signup.contact": "WhatsApp number",
    "signup.what": "What do you want to sell? (optional)",
    "signup.plan": "Where do you want to start?",
    "signup.submit": "Send my signup",
    "signup.copy": "Copy my details",
    "signup.copied": "Details copied — send them to us",
    "signup.note": "Signups run over WhatsApp for now: the button opens a chat with your details filled in, we reply and set your page up.",
    "signup.required": "Add your name, handle, and WhatsApp number first.",
    "signup.request": "New signup request",
    "demo.ribbon": "This is an example page on the platform",
    "demo.ribbonCta": "Create yours",
    "nav.store": "Store",
    "nav.links": "Links",
    "profile.links": "My links",
    "profile.featured": "Featured fragrances",
    "profile.all": "See all",
    "store.eyebrow": "Store",
    "store.title": "Perfume oils that stay with you",
    "store.sub": "Alcohol-free concentrated oils, 12 ml, every bottle AED 150.",
    "store.search": "Search fragrances…",
    "store.all": "All",
    "store.empty": "No fragrance matches that search",
    "store.count": "fragrances",
    "trust.delivery": "UAE-wide delivery",
    "trust.oil": "Alcohol-free oil",
    "trust.order": "Order on WhatsApp",
    "product.add": "Add to cart",
    "product.added": "Added to cart",
    "product.buy": "Buy now",
    "product.details": "Details",
    "product.includes": "Fragrance details",
    "product.notes": "Notes",
    "product.qty": "Quantity",
    "product.back": "Back to all fragrances",
    "product.missing": "Fragrance not found",
    "cart.title": "Your cart",
    "cart.empty": "Your cart is empty",
    "cart.emptyHint": "Browse the store and add something you like",
    "cart.total": "Total",
    "cart.checkout": "Checkout on WhatsApp",
    "cart.copy": "Copy order details",
    "cart.copied": "Order copied — send it to me",
    "cart.close": "Close",
    "cart.browse": "Browse the store",
    "order.title": "New order",
    "order.total": "Total",
    "newsletter.title": "Weekly newsletter",
    "newsletter.sub": "One practical idea every week. No spam.",
    "newsletter.placeholder": "Your email address",
    "newsletter.cta": "Subscribe",
    "newsletter.done": "Done! Check your inbox to confirm",
    "footer.rights": "All rights reserved",
    "footer.built": "Built on",
    "a11y.theme": "Toggle theme",
    "a11y.lang": "Change language",
    "a11y.cart": "Cart",
  },
};
