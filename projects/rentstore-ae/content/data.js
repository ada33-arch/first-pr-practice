/* ==========================================================================
   RentStore.ae — every word the site shows.

   Source of truth: RentStore_Codex_Master_Specification.md.
   Strings marked LOCKED are copied verbatim from the spec and must not be
   reworded. Anything marked SAMPLE is a design example from the reference
   sheet, not operational data (spec §5 and §14.5) — the pages render it
   behind a visible "sample" marker and it must be replaced before launch.

   No Arabic marketing translation exists yet (spec §10). The header's
   العربية control is present because the spec locks it, and is wired to a
   notice rather than to a half-translated site.
   ========================================================================== */

window.RS = {
  /* ---------------------------------------------------------- brand -- */
  brand: {
    mark: "RS",                                   // LOCKED
    name: "RentStore.ae",                         // LOCKED
    taglineEn: "YOUR SPACE TO GROW",              // LOCKED
    taglineAr: "مشروعك عليك والستور علينا",        // LOCKED
    domain: "rentstore.ae",
  },

  /* The seventh route is NOT decided (spec §4 table, §15). Both candidates
     are recorded; `listRoute` is the single place the choice is made, so
     changing it rewires every link at once and the site never carries two
     different paths to the same page. */
  routes: {
    home: "index.html",
    stores: "stores.html",
    how: "how-it-works.html",
    success: "success-stories.html",
    resources: "resources.html",
    about: "about.html",
    list: "list-your-space.html",
  },
  listRoute: {
    chosen: "/list-your-space",
    alternative: "/sell",
    status: "Not Yet Defined — awaiting the owner's decision",
  },

  /* ----------------------------------------------------------- nav -- */
  nav: [                                          // LOCKED — order and labels
    { label: "Stores", key: "stores" },
    { label: "How It Works", key: "how" },
    { label: "Success Stories", key: "success" },
    { label: "Resources", key: "resources" },
    { label: "About", key: "about" },
  ],
  navCta: "List Your Space",                      // LOCKED
  navLogin: "Login",                              // LOCKED
  navArabic: "العربية",                            // LOCKED

  /* ======================================================== 01 — Home == */
  home: {
    eyebrow: "PEOPLE | PROJECTS | OPPORTUNITIES", // LOCKED
    titleWhite: "Your Project.",                  // LOCKED
    titleGold: "Our Store.",                      // LOCKED
    lede:
      "Rent retail spaces, pop-up stores and kiosks across the UAE and turn " +
      "your ideas into real opportunities.",      // LOCKED
    locationLabel: "Choose a location",           // LOCKED
    searchPlaceholder: "Search for stores, malls or areas...", // LOCKED
    categories: [                                 // LOCKED — exactly these five
      "Pop-up Stores",
      "Retail Shops",
      "Kiosks",
      "Seasonal Spaces",
      "Home Projects",
    ],
    explore: "EXPLORE OPPORTUNITIES",             // LOCKED

    platformTitleWhite: "A Platform That",        // LOCKED
    platformTitleGold: "Grows With You.",         // LOCKED
    platformCta: "Explore Spaces",                // LOCKED
    /* Exactly four. The spec forbids a fifth. */
    pillars: [                                    // LOCKED
      { title: "Flexible Spaces", body: "Shop, kiosks and pop-up stores." },
      { title: "Across the UAE", body: "Opportunities and communities." },
      { title: "Simple & Secure", body: "Easy processes and transparent terms." },
      { title: "Real Opportunities", body: "Turn your ideas into growth." },
    ],
  },

  /* ====================================================== 02 — Stores == */
  stores: {
    eyebrow: "EXPLORE SPACES",                    // LOCKED
    titleLines: [                                 // LOCKED
      { text: "Find Your Place.", gold: false },
      { text: "Turn Your Idea", gold: false },
      { text: "Into a Real Opportunity.", gold: true },
    ],
    lede:
      "Discover retail spaces, pop-up stores and kiosks across the UAE " +
      "and the best locations for your project.",
    locationLabel: "Choose a location",           // LOCKED
    searchPlaceholder: "Search stores, malls or areas...", // LOCKED
    filters: [                                    // LOCKED
      "All", "Retail Shops", "Pop-up Stores", "Kiosks",
      "Seasonal Spaces", "Home Projects",
    ],

    /* SAMPLE — spec §5: "هذه أمثلة تصميمية في المرجع وليست إثباتاً على مخزون
       أو أسعار حقيقية". Rendered with a sample marker. */
    stats: [
      { value: "500+", label: "Spaces Across the UAE" },
      { value: "7", label: "Emirates" },
      { value: "50+", label: "Malls & Locations" },
    ],

    locationsTitle: "Popular Locations",          // LOCKED
    locationsLede: "Explore opportunities in the UAE's top destinations.", // LOCKED
    locationsCta: "View All Locations",           // LOCKED
    /* Six cards, exactly as the reference shows. Umm Al Quwain is absent
       from these six by design (spec §5) and is NOT thereby excluded from
       the emirates the platform covers. */
    locations: [                                  // names LOCKED, counts SAMPLE
      { name: "Abu Dhabi", count: "120+ Spaces" },
      { name: "Dubai", count: "180+ Spaces" },
      { name: "Sharjah", count: "60+ Spaces" },
      { name: "Ajman", count: "40+ Spaces" },
      { name: "Ras Al Khaimah", count: "30+ Spaces" },
      { name: "Fujairah", count: "20+ Spaces" },
    ],

    featuredTitle: "Featured Spaces",             // LOCKED
    featuredLede: "Handpicked spaces in the most popular destinations.", // LOCKED
    featuredCta: "View All Spaces",               // LOCKED
    /* SAMPLE — prices and specs are the reference sheet's design examples. */
    featured: [
      {
        type: "Retail Shop", where: "Yas Mall, Abu Dhabi",
        price: "AED 120,000", period: "/year",
        meta: ["50 m²", "High Footfall", "Ready Now"],
      },
      {
        type: "Pop-up Store", where: "The Dubai Mall",
        price: "AED 85,000", period: "/season",
        meta: ["25 m²", "Prime Location", "Flexible Terms"],
      },
      {
        type: "Kiosk", where: "City Centre Sharjah",
        price: "AED 45,000", period: "/year",
        meta: ["12 m²", "Main Atrium", "Ready Now"],
      },
    ],
  },

  /* ================================================= 03 — How It Works == */
  how: {
    eyebrow: "A SIMPLE PATH. A BIGGER FUTURE.",   // LOCKED
    titleWhite: "How It Works",                   // LOCKED
    titleGold: "From Idea to Launch.",            // LOCKED
    lede:
      "Six simple steps to help you find, rent and launch your space " +
      "with confidence.",                         // LOCKED
    /* Exactly six. The spec forbids changing the count. */
    steps: [                                      // LOCKED
      { n: "01", title: "Have an Idea", body: "Turn your passion into a real business." },
      { n: "02", title: "Find Your Space", body: "Browse and choose from verified locations." },
      { n: "03", title: "Book & Confirm", body: "Select your space, dates and terms securely." },
      { n: "04", title: "Set Up Your Space", body: "Get ready with full support and clear guidelines." },
      { n: "05", title: "Launch Your Project", body: "Open your doors and welcome customers." },
      { n: "06", title: "Grow Your Business", body: "Reach more customers and explore new opportunities." },
    ],
    closingTitle: "We're With You at Every Step.", // LOCKED
    closingBody: "Support, guidance and opportunities to help your project grow.", // LOCKED
    closingCta: "Start Your Journey",             // LOCKED
  },

  /* ============================================== 04 — Success Stories == */
  success: {
    eyebrow: "REAL PEOPLE. REAL PROJECTS.",       // LOCKED
    titleWhite: "Success Stories",                // LOCKED
    titleGold: "Ideas That Found Their Place.",   // LOCKED
    lede:
      "Discover how entrepreneurs across the UAE turned their ideas into " +
      "real opportunities with RentStore.",       // LOCKED
    filters: ["All", "Home Businesses", "Inspiring Brands", "Established Brands"], // LOCKED
    /* LOCKED quote. Spec §5 forbids inventing a person or brand to attach
       to it: "لا تنشئ أسماء أشخاص أو علامات أو شهادات حقيقية". So it is
       rendered unattributed until a real person approves their name. */
    quote:
      "RentStore gave me the opportunity to turn my home business into a " +
      "real store. Today, our brand is reaching so many more customers.",
    quoteAttribution: null,                       // awaiting a real, consenting person
    stories: [                                    // titles LOCKED
      { title: "From Home Kitchen to a Mall Outlet" },
      { title: "A Handmade Brand with a UAE Presence" },
      { title: "A Seasonal Store That Became Permanent" },
    ],
    closingTitle: "Your Story Could Be Next.",    // LOCKED
    closingCta: "Share Your Story",               // LOCKED
  },

  /* =================================================== 05 — Resources == */
  resources: {
    titleWhite: "Know More.",                     // LOCKED
    titleGold: "Build Better.",                   // LOCKED
    lede:
      "Guides, tips and insights to help you make the right decisions " +
      "and grow your business.",                  // LOCKED
    searchPlaceholder: "Search articles, guides or topics...", // LOCKED
    filters: [                                    // LOCKED
      "Company", "Starting a Business", "Retail Tips",
      "UAE Regulations", "Success Stories",
    ],
    /* Six cards. Titles LOCKED; the bodies below summarise each title and
       are marked for review because the reference's body text is not legible
       at the resolution supplied. Read times are SAMPLE. */
    articles: [
      { title: "A Guide to Retail Spaces in the UAE", body: "Learn about different space types and how to choose the right one.", read: "5 min read" },
      { title: "How to Launch a Pop-up Store", body: "A step-by-step guide to a successful launch.", read: "7 min read" },
      { title: "Tips for Home Projects", body: "Turn your home business into a growing brand.", read: "6 min read" },
      { title: "UAE Business Regulations", body: "Key rules and requirements.", read: "8 min read" },
      { title: "Marketing Your Store", body: "Practical tips to attract more customers.", read: "5 min read" },
      { title: "Seasonal Opportunities", body: "Make the most of events and festivals.", read: "6 min read" },
    ],
    helpfulTitle: "Helpful Resources",            // LOCKED
    helpful: [                                    // LOCKED
      "Business Setup Guide",
      "Legal & Permits",
      "Design & Fit-Out Tips",
      "Marketing Your Brand",
      "Community & Events",
    ],
  },

  /* ======================================================= 06 — About == */
  about: {
    titleWhite: "People. Projects.",              // LOCKED
    titleGold: "Opportunities.",                  // LOCKED
    lede:
      "We believe in the power of people and the potential of every idea. " +
      "RentStore connects entrepreneurs with retail spaces across the UAE, " +
      "creating opportunities for communities, businesses and a stronger " +
      "local economy.",
    cta: "Our Story",                             // LOCKED
    mission: { title: "Our Mission", body: "To make retail opportunities accessible for everyone." }, // LOCKED
    vision: { title: "Our Vision", body: "A thriving community of businesses across the UAE." },      // LOCKED
    valuesTitle: "Our Values",                    // LOCKED
    values: [                                     // LOCKED
      "People First",
      "Opportunity for All",
      "Trusted Partnerships",
      "Growth Together",
    ],
    closingTitle: "The UAE. A Place of Possibilities.", // LOCKED
    closingBody:
      "From iconic destinations to vibrant communities, RentStore brings " +
      "people and opportunities together across all seven Emirates.",
    closingCta: "Learn More",                     // LOCKED
  },

  /* ============================================= 07 — List Your Space == */
  list: {
    titleWhite: "Open the Door to",               // LOCKED
    titleGold: "New Opportunities.",              // LOCKED
    lede:
      "List your retail space, kiosk or pop-up location on RentStore and " +
      "connect with entrepreneurs across the UAE.", // LOCKED
    benefits: [                                   // LOCKED
      { title: "Reach Verified Businesses", body: "Connect with serious entrepreneurs." },
      { title: "Flexible Listing Options", body: "Short term or long term." },
      { title: "Secure & Trusted Platform", body: "We handle the process." },
    ],
    formTitle: "List Your Space",                 // LOCKED
    /* The visible form carries exactly these four fields plus the submit
       (spec §5). Option lists, validation, the submit target and the
       success/failure messages are all Not Yet Defined, so the form does
       NOT pretend to send: see code/site.js. */
    fields: [                                     // LOCKED
      { name: "propertyType", label: "Property Type", placeholder: "Select type", kind: "select" },
      { name: "location", label: "Location", placeholder: "Enter location", kind: "text" },
      { name: "size", label: "Size (m²)", placeholder: "", kind: "text" },
      { name: "availability", label: "Availability", placeholder: "Select dates", kind: "select" },
    ],
    submit: "Submit Your Space",                  // LOCKED
    /* Shown instead of a fake success state. Spec §5: "لا تعرض نجاحاً وهمياً
       ولا تدّعِ أن النموذج يرسل بيانات فعلياً من دون خدمة استقبال معتمدة." */
    noBackendNotice:
      "This form is not connected to a service yet, so it cannot be " +
      "submitted. The receiving endpoint has not been defined.",
  },

  /* ------------------------------------------------------- notices -- */
  notices: {
    sample: "Sample data",
    sampleExplain:
      "Figures shown are design examples from the approved reference, not " +
      "live inventory or current prices.",
    imagePending: "Image pending",
    arabicPending:
      "The Arabic site is not ready yet. No approved Arabic translation of " +
      "these pages exists.",
  },

  footer: {
    line: "© 2026 RentStore.ae",
    note: "Phase 1B — public pages. Not connected to a booking or listing service.",
  },
};
