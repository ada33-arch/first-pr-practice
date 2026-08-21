/* ==========================================================================
   Everything you edit day-to-day lives in this file.
   Text is bilingual: { ar: "عربي", en: "English" }.
   ========================================================================== */

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
    "footer.built": "صُنع بحب",
    "a11y.theme": "تبديل الوضع",
    "a11y.lang": "تغيير اللغة",
    "a11y.cart": "السلة",
  },
  en: {
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
    "footer.built": "Made with care",
    "a11y.theme": "Toggle theme",
    "a11y.lang": "Change language",
    "a11y.cart": "Cart",
  },
};
