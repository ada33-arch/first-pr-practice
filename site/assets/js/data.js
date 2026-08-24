/* ==========================================================================
   Everything you edit day-to-day lives in this file.
   Text is bilingual: { ar: "عربي", en: "English" }.
   ========================================================================== */

window.SITE = {
  /* ------------------------------------------------------------ profile -- */
  handle: "Abdullrhman",
  name: { ar: "عبدالرحمن", en: "Abdullrhman" },
  verified: true,
  avatar: "",              // e.g. "assets/img/avatar.jpg" — falls back to initials
  initials: { ar: "ع", en: "A" },
  bio: {
    ar: "أنظمة جاهزة وكتب رقمية تشتغل من أول يوم — مصمّمة بالكامل، تسلّم فوراً.",
    en: "Ready-made systems and digital books that work from day one — fully designed, delivered instantly.",
  },

  /* ------------------------------------------------------------ contact -- */
  // WhatsApp number in international format, digits only (no + and no spaces).
  // Leave "" to fall back to copy-to-clipboard checkout.
  whatsapp: "",
  email: "",
  // Newsletter form POST endpoint (Mailchimp / Buttondown / Formspree …).
  // Empty + no email = the newsletter block and its link stay hidden.
  newsletterAction: "",
  currency: { ar: "د.إ", en: "AED" },

  /* ------------------------------------------------------------ socials -- */
  socials: [
    { icon: "instagram", label: "Instagram", url: "https://instagram.com/" },
    { icon: "tiktok",    label: "TikTok",    url: "https://tiktok.com/" },
    { icon: "x",         label: "X",         url: "https://x.com/" },
    { icon: "youtube",   label: "YouTube",   url: "https://youtube.com/" },
  ],

  /* -------------------------------------------------------------- links -- */
  links: [
    {
      icon: "🛍️",
      title: { ar: "المتجر — كل المنتجات", en: "Store — all products" },
      sub:   { ar: "أنظمة وكتب رقمية، تسليم فوري", en: "Systems and digital books, instant delivery" },
      url: "store.html",
      tag: { ar: "الأهم", en: "Top" },
    },
    {
      icon: "🧾",
      title: { ar: "نظام إدارة المبيعات", en: "Sales management system" },
      sub:   { ar: "جاهز للتركيب على عملك", en: "Ready to deploy on your business" },
      url: "product.html?id=system-sales",
    },
    {
      icon: "📘",
      title: { ar: "كتاب: ابدأ متجرك الرقمي", en: "Book: Start your digital store" },
      sub:   { ar: "PDF + ملفات العمل", en: "PDF + working files" },
      url: "product.html?id=book-digital-store",
    },
    {
      icon: "📅",
      title: { ar: "جلسة تركيب وإعداد", en: "Setup and onboarding session" },
      sub:   { ar: "٦٠ دقيقة أونلاين", en: "60 minutes, online" },
      url: "product.html?id=setup-60",
    },
    {
      icon: "📮",
      title: { ar: "النشرة الأسبوعية", en: "Weekly newsletter" },
      sub:   { ar: "فكرة واحدة كل أسبوع — مجاناً", en: "One idea every week — free" },
      url: "#newsletter",
    },
    {
      icon: "💬",
      title: { ar: "تواصل معي واتساب", en: "Message me on WhatsApp" },
      sub:   { ar: "للطلبات والاستفسارات", en: "Orders and questions" },
      url: "wa",              // "wa" resolves to the WhatsApp number above
    },
  ],

  /* ----------------------------------------------------------- products -- */
  // PLACEHOLDER COPY. The shape is right — systems, books, templates, a bundle,
  // a service — but every title, price, and feature line below is a stand-in.
  // Replace them with the real products before going live.
  // art: gradient stops + emoji, used when `image` is empty.
  products: [
    {
      id: "system-sales",
      category: { ar: "أنظمة", en: "Systems" },
      title: { ar: "نظام إدارة المبيعات", en: "Sales Management System" },
      desc: {
        ar: "نظام كامل لإدارة العملاء والفواتير والمخزون — مصمّم وجاهز، تركيب في نفس اليوم.",
        en: "A complete system for customers, invoices, and stock — designed and ready, deployed the same day.",
      },
      price: 1499, oldPrice: 2200,
      badge: { ar: "الأكثر مبيعاً", en: "Bestseller" },
      featured: true,
      image: "",
      art: { emoji: "🧾", from: "#3a2f5f", to: "#0f0d1a" },
      features: [
        { ar: "لوحة تحكم كاملة بالعربي والإنجليزي", en: "Full dashboard in Arabic and English" },
        { ar: "فواتير وتقارير جاهزة للطباعة", en: "Print-ready invoices and reports" },
        { ar: "تركيب وإعداد أولي مشمول", en: "Installation and initial setup included" },
        { ar: "تحديثات مجانية لمدة سنة", en: "Free updates for one year" },
      ],
    },
    {
      id: "system-inventory",
      category: { ar: "أنظمة", en: "Systems" },
      title: { ar: "نظام المخزون والمستودعات", en: "Inventory & Warehouse System" },
      desc: {
        ar: "تتبّع الكميات والحركة والتنبيهات — يشتغل لوحده ويقول لك متى تطلب.",
        en: "Track quantities, movement, and alerts — it tells you when to reorder.",
      },
      price: 1199,
      badge: null,
      featured: true,
      image: "",
      art: { emoji: "📦", from: "#1f4a44", to: "#0b1614" },
      features: [
        { ar: "جرد فوري وتنبيهات نفاد", en: "Live stock counts and low-stock alerts" },
        { ar: "باركود ودعم أكثر من مستودع", en: "Barcode support, multiple warehouses" },
        { ar: "تصدير Excel لكل التقارير", en: "Excel export on every report" },
      ],
    },
    {
      id: "book-digital-store",
      category: { ar: "كتب", en: "Books" },
      title: { ar: "كتاب: ابدأ متجرك الرقمي", en: "Book: Start Your Digital Store" },
      desc: {
        ar: "من الفكرة إلى أول عملية بيع — خطوات عملية بدون حشو، مع ملفات جاهزة.",
        en: "From idea to first sale — practical steps with no filler, plus ready-to-use files.",
      },
      price: 89, oldPrice: 149,
      badge: { ar: "تسليم فوري", en: "Instant" },
      featured: true,
      image: "",
      art: { emoji: "📘", from: "#63451f", to: "#1a1207" },
      features: [
        { ar: "PDF بصيغة قابلة للطباعة", en: "Print-ready PDF" },
        { ar: "قوالب تسعير وحساب أرباح", en: "Pricing and margin templates" },
        { ar: "تحديثات الإصدارات القادمة مجاناً", en: "Future editions free" },
      ],
    },
    {
      id: "book-operations",
      category: { ar: "كتب", en: "Books" },
      title: { ar: "كتاب: تشغيل بلا فوضى", en: "Book: Operations Without Chaos" },
      desc: {
        ar: "كيف تبني إجراءات تشغيل واضحة لفريقك، حتى لو كنت لوحدك اليوم.",
        en: "How to build clear operating procedures for your team — even if today it's just you.",
      },
      price: 79,
      badge: null,
      featured: false,
      image: "",
      art: { emoji: "📗", from: "#2b3d63", to: "#0c1120" },
      features: [
        { ar: "١٢ إجراء تشغيل جاهز للتعديل", en: "12 editable standard procedures" },
        { ar: "قوائم فحص للتسليم اليومي", en: "Daily handover checklists" },
        { ar: "أمثلة واقعية من السوق الخليجي", en: "Real examples from the Gulf market" },
      ],
    },
    {
      id: "templates-admin",
      category: { ar: "قوالب", en: "Templates" },
      title: { ar: "حزمة قوالب إدارية — ٢٥ قالب", en: "Admin Templates Pack — 25 files" },
      desc: {
        ar: "عقود، عروض أسعار، فواتير وتقارير — مصمّمة بالعربي والإنجليزي وجاهزة للتعبئة.",
        en: "Contracts, quotes, invoices, and reports — designed in Arabic and English, ready to fill.",
      },
      price: 199, oldPrice: 299,
      badge: null,
      featured: false,
      image: "",
      art: { emoji: "✨", from: "#4a2340", to: "#160b14" },
      features: [
        { ar: "٢٥ ملف بصيغة Word و Excel", en: "25 files in Word and Excel" },
        { ar: "خطوط عربية مرفقة", en: "Arabic fonts included" },
        { ar: "نسخ RTL و LTR لكل قالب", en: "RTL and LTR versions of every template" },
      ],
    },
    {
      id: "setup-60",
      category: { ar: "خدمات", en: "Services" },
      title: { ar: "جلسة تركيب وإعداد — ٦٠ دقيقة", en: "Setup & Onboarding — 60 min" },
      desc: {
        ar: "نركّب النظام على عملك ونضبطه معك خطوة بخطوة حتى يشتغل بالكامل.",
        en: "We install the system on your business and configure it with you until it runs.",
      },
      price: 499,
      badge: { ar: "مقاعد محدودة", en: "Limited" },
      featured: false,
      image: "",
      art: { emoji: "🎯", from: "#5f4326", to: "#1a120a" },
      features: [
        { ar: "٦٠ دقيقة عبر Google Meet", en: "60 minutes over Google Meet" },
        { ar: "ضبط النظام على بياناتك", en: "Configured against your own data" },
        { ar: "متابعة لمدة أسبوع", en: "One week of follow-up" },
      ],
    },
    {
      id: "bundle-all",
      category: { ar: "باقات", en: "Bundles" },
      title: { ar: "الباقة الكاملة — كل المنتجات", en: "The Complete Bundle" },
      desc: {
        ar: "الأنظمة + الكتب + القوالب بسعر واحد، وفّر أكثر من ٤٠٪.",
        en: "Systems + books + templates in one price. Save over 40%.",
      },
      price: 1999, oldPrice: 3564,
      badge: { ar: "وفّر ٤٠٪", en: "Save 40%" },
      featured: true,
      image: "",
      art: { emoji: "🎁", from: "#63451f", to: "#1a1207" },
      features: [
        { ar: "كل المنتجات الرقمية الحالية", en: "Every current digital product" },
        { ar: "المنتجات القادمة مجاناً لمدة سنة", en: "Upcoming releases free for a year" },
        { ar: "أولوية في الرد على الاستفسارات", en: "Priority support" },
      ],
    },
  ],
};

/* --------------------------------------------------------------- strings -- */
window.I18N = {
  ar: {
    "nav.store": "المتجر",
    "nav.links": "الروابط",
    "profile.links": "روابطي",
    "profile.featured": "منتجات مختارة",
    "profile.all": "كل المنتجات",
    "store.eyebrow": "المتجر",
    "store.title": "منتجات تختصر عليك الطريق",
    "store.sub": "منتجات رقمية جاهزة للتحميل فور الدفع، وخدمات محدودة المقاعد.",
    "store.search": "ابحث عن منتج…",
    "store.all": "الكل",
    "store.empty": "ما لقينا منتجات بهذا البحث",
    "store.count": "منتج",
    "trust.instant": "تسليم فوري",
    "trust.secure": "دفع آمن",
    "trust.support": "دعم مباشر",
    "product.add": "أضف للسلة",
    "product.added": "أضيف للسلة",
    "product.buy": "اشترِ الآن",
    "product.details": "التفاصيل",
    "product.includes": "المنتج يشمل",
    "product.qty": "الكمية",
    "product.back": "رجوع للمتجر",
    "product.missing": "المنتج غير موجود",
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
    "profile.featured": "Featured products",
    "profile.all": "See all",
    "store.eyebrow": "Store",
    "store.title": "Products that skip the hard part",
    "store.sub": "Digital products delivered the moment you pay, plus limited-seat services.",
    "store.search": "Search products…",
    "store.all": "All",
    "store.empty": "No products match that search",
    "store.count": "products",
    "trust.instant": "Instant delivery",
    "trust.secure": "Secure payment",
    "trust.support": "Direct support",
    "product.add": "Add to cart",
    "product.added": "Added to cart",
    "product.buy": "Buy now",
    "product.details": "Details",
    "product.includes": "What's included",
    "product.qty": "Quantity",
    "product.back": "Back to store",
    "product.missing": "Product not found",
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
