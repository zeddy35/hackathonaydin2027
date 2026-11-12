import type { Locale } from "./i18n";

export { isLocale, locales, type Locale } from "./i18n";

/*
 * All shared and home page copy. Helper pages have their own files in
 * src/content/. Rules for this file: verified facts only, no em dash, mark
 * targets and drafts as such, never write the theme.
 */

const tr = {
  meta: {
    title: "Hackathon Aydın 2027",
    description:
      "Üniversite öğrencileri için 24 saatlik ürün geliştirme maratonu. 17-18 Nisan 2027, Aydın Adnan Menderes Üniversitesi.",
  },
  skip: "İçeriğe geç",
  nav: {
    label: "Bölümler",
    event: "Etkinlik",
    schedule: "Program",
    sponsors: "Sponsorlar",
    faq: "SSS",
    menu: "Menü",
    close: "Kapat",
    switchTo: "English",
    home: "Ana sayfa",
    themeLight: "Açık temaya geç",
    themeDark: "Koyu temaya geç",
  },
  cta: {
    info: "Katılım bilgileri",
    apply: "Başvur",
    closed: "Başvurular kapandı",
    sponsor: "Sponsor ol",
    opensIn: (label: string) => `Başvurular ${label}'da açılacak, 31 Mart 2027 23:59'da kapanacak.`,
    /** Header and team card button, by application status. */
    join: { upcoming: "Başvurular Ocak'ta", open: "Başvur", closed: "Başvurular kapandı" },
    /** Header under 1024 px. */
    joinShort: { upcoming: "Ocak'ta başvur", open: "Başvur", closed: "Başvurular kapandı" },
  },
  loader: "HACKATHON AYDIN 2027",
  hero: {
    eyebrow: "Hackathon Aydın 2027",
    edition: "3. edisyon",
    /** Ticker band under the hero. Verified facts only. */
    ticker: ["24 saat", "3-5 kişilik takımlar", "Ücretsiz", "17-18 Nisan 2027", "Aydın", "Yemek ve içecek dahil"],
    /** The slogan under the name; [1] is the struck-through line (hidden from screen readers). */
    title: ["Bir fikirle gel.", "Bir yapılacaklar listesiyle çık.", "Çalışan bir ürünle çık."],
    lead: "Üniversite öğrencileri için 24 saatlik ürün geliştirme maratonu.",
    when: "17-18 Nisan 2027",
    where: "Aydın Adnan Menderes Üniversitesi",
    countdown: {
      label: "Açılış törenine kalan süre",
      units: { d: "g", h: "s", m: "d" },
      cells: { d: "Gün", h: "Saat", m: "Dakika", s: "Saniye" },
      live: "Şu an sürüyor",
      done: "2028'de görüşürüz",
    },
  },
  /** Team card (client component): plain strings only, {role} and {n} are filled in there. */
  team: {
    label: "TAKIMINI KUR",
    roles: "Rol ekle",
    you: "Sen",
    empty: "Boş koltuk",
    remove: "{role} rolünü çıkar",
    count: "{n} / 5 kişi",
    status: {
      low: "Takımlar 3-5 kişi. Eksik kalırsa Cumartesi sabahı eşleştiriyoruz.",
      ready: "Takımın hazır. İstersen bir kişi daha ekleyebilirsin.",
      full: "Tam kadro. 24 saate hazırsınız.",
    },
    tips: {
      design: "Bir tasarımcı demo gününde fark yaratır.",
      product: "Ürünü düşünen biri, 24 saati doğru işe harcamanızı sağlar.",
    },
    noTeam: "Takımım yok",
  },
  event: {
    title: "Etkinlik",
    text: "Hackathon Aydın, TEKNOFEST Kulübü ADÜ'nün düzenlediği öğrenci hackathonu. 2027 üçüncü edisyonu. Takımlar 24 saat boyunca bir fikri çalışan bir ürüne dönüştürür. Tema açılış töreninde açıklanır.",
    facts: [
      { value: "24 saat", label: "geliştirme süresi" },
      { value: "3-5 kişi", label: "takım başına" },
      { value: "Ücretsiz", label: "yemek ve içecek dahil" },
      { value: "100+", label: "öğrenci", note: "hedeflenen" },
    ],
    whyTitle: "Neden katılmalısın?",
    why: [
      "24 saatte fikirden çalışan ürüne",
      "Masalarda demo, finalde sahne ve online jüri",
      "Gece boyunca açık mekân, armut koltuklu dinlenme alanı",
      "Yemek ve içecek dahil, ücretsiz",
    ],
  },
  how: {
    title: "Nasıl katılırım?",
    steps: [
      { h: "Başvuru", p: "Başvurular Ocak 2027'de bu sitede açılacak, 31 Mart 2027 23:59'da kapanacak." },
      { h: "Takım oluşturma", p: "Takımlar 3-5 kişi. Tek başvuranları Cumartesi sabahı takımlarla eşleştiriyoruz." },
      { h: "24 saat geliştirme", p: "Cumartesi 12:00'de başlar, Pazar 12:00'de teslimle biter." },
      { h: "Proje sunumu", p: "Tüm takımlar masasında demo yapar. Jüri finale 10 takım seçer." },
    ],
  },
  past: {
    title: "Önceki yıllar",
    students: "öğrenci",
    teams: "takım",
    editions: [
      {
        year: "2026",
        label: "İkinci edisyon",
        students: 57,
        teams: 20,
        photos: [
          { src: "/img/2026-2.jpg", w: 1600, h: 1200, alt: "2026'da büyük salonda sahnede bir konuşmacı, sıralarda dinleyen öğrenciler", caption: "2026 · Salonda sunum", pos: "50% 55%" },
          { src: "/img/2026-3.jpg", w: 1600, h: 1200, alt: "2026'da yaka kartlı katılımcılar bir masanın etrafında toplanmış konuşuyor", caption: "2026 · Etkinlik alanında", pos: "50% 40%" },
          { src: "/img/2026-4.jpg", w: 1200, h: 1600, alt: "2026'da sahnede plaket tutan iki kişi, arkada Hackathon Aydın ve Game Jam Aydın bayrakları", caption: "2026 · Sahnede plaket", pos: "50% 55%" },
          { src: "/img/2026-5.jpg", w: 1200, h: 1600, alt: "2026'da iki katılımcı Hackathon Aydın ve Game Jam Aydın afişlerini tutuyor", caption: "2026 · Afişlerle", pos: "50% 45%" },
          { src: "/img/2026-1.jpg", w: 1200, h: 1600, alt: "2026'da salonun arka sıralarından sahneye bakış", caption: "2026 · Salondan", pos: "50% 60%" },
        ],
      },
      {
        year: "2025",
        label: "İlk edisyon",
        students: 36,
        teams: 12,
        photos: [
          { src: "/img/2025-2.jpg", w: 1600, h: 1067, alt: "Hackathon Aydın 2025'te dizüstü bilgisayarların başında gülen iki katılımcı", caption: "2025 · Geliştirme sırasında", pos: "50% 40%" },
          { src: "/img/2025-4.jpg", w: 1600, h: 1067, alt: "Hackathon Aydın 2025 organizasyon ekibi etkinlik afişinin iki yanında", caption: "2025 · Organizasyon ekibi", pos: "50% 45%" },
          { src: "/img/2025-5.jpg", w: 1600, h: 1067, alt: "Hackathon Aydın 2025'te kulaklıklı iki katılımcı ekranlarına odaklanmış", caption: "2025 · Ekran başında", pos: "45% 40%" },
          { src: "/img/2025-1.jpg", w: 1600, h: 1067, alt: "Hackathon Aydın 2025 ekibi masada, arkada etkinlik afişleri", caption: "2025 · Ekip masada", pos: "50% 50%" },
          { src: "/img/2025-3.jpg", w: 1600, h: 1067, alt: "Hackathon Aydın 2025'te gülümseyen bir katılımcı, arkada çalışma alanı", caption: "2025 · Etkinlik alanında", pos: "50% 35%" },
        ],
      },
    ],
  },
  schedule: {
    title: "Program",
    draft: "Taslak program",
    note: "Geliştirme Cumartesi 12:00 ile Pazar 12:00 arası, toplam 24 saat. Saatler Türkiye saatiyle (UTC+3).",
    days: { sat: "Cumartesi, 17 Nisan", sun: "Pazar, 18 Nisan" },
    break: "MOLA",
    /** After a programme line that a sponsor has taken on (src/data/sponsor-items.ts). */
    by: "{name} desteğiyle",
    build: "24 saat geliştirme",
    /** Ruler readout: which build hour the pointer is on. */
    hour: "{n}. saat",
    food: {
      title: "Kimse aç kalmadı",
      lead: "Yemek ve içecek dahil. Öğle, akşam, gece yarısı, kahvaltı ve Pazar öğle yemeği.",
      fromTr: "Türkçeden",
      rating: "{n} üzerinden 5",
    },
  },
  people: {
    title: "Jüri ve mentorlar",
    judges: "Jüri",
    mentors: "Mentorlar",
  },
  sponsors: {
    title: "Sponsorlar",
    empty: "2027 sponsorlarımız yakında açıklanacak.",
    emptyLead: "Hackathon Aydın'a destek olmak istersen partner sayfasına göz at ya da bize yaz.",
    compare: "Sponsorluk paketlerini gör",
    /** "Take on one item" cards. The items themselves are in src/data/sponsor-items.ts. */
    items: {
      title: "Bir kalemi üstlen",
      lead: "Paket seçmek zorunda değilsin. Etkinliğin bir parçasını üstlen, o parça senin adınla anılsın.",
      credit: "Üstlendiğin kalemde adın kalem kartında, programda ilgili satırda ve sahnede anılır.",
      open: "Açık",
      takenBy: "Üstlenen",
      inSchedule: "Taslak programda",
      other: "Aklında başka bir kalem ya da ayni destek mi var?",
      otherCta: "Bize yaz",
    },
    tiers: {
      title: "Ana sponsor",
      gold: "Altın sponsorlar",
      silver: "Gümüş sponsorlar",
      inkind: "Ayni destekçiler",
      tech: "Teknoloji destekçileri",
      community: "Topluluk ortakları",
    },
    newTab: "(yeni sekmede açılır)",
  },
  venue: {
    title: "Mekân ve ulaşım",
    place: "Aydın Adnan Menderes Üniversitesi Tıp Fakültesi",
    placeNote: "Salon ve adres ayrıntıları yakında.",
    map: "Google Haritalar'da aç",
    items: [
      { h: "Gece", p: "Mekân gece boyunca açık. Armut koltuklu bir dinlenme alanı olacak." },
      { h: "Yemek", p: "Katılım ücretsiz. Etkinlik boyunca yemek ve içecek dahil." },
    ],
    /** Third card; it also holds the map button. No directions until they are confirmed. */
    travel: { h: "Ulaşım ve erişilebilirlik", p: "Aydın otogarından ve şehir merkezinden ulaşım bilgisi ile erişilebilirlik ayrıntıları yakında." },
  },
  faq: {
    title: "Sıkça sorulanlar",
    items: [
      {
        q: "Kimler katılabilir?",
        a: "Etkinlik üniversite öğrencilerine yönelik ve 18 yaş ve üstüne açık. Diğer uygunluk koşullarının ayrıntıları Ocak'ta başvurularla birlikte açıklanacak.",
      },
      { q: "Ücret var mı?", a: "Hayır. Katılım ücretsiz, etkinlik boyunca yemek ve içecek dahil." },
      {
        q: "Takım olmadan katılabilir miyim?",
        a: "Evet. Takımlar 3-5 kişi. Tek başvuranları Cumartesi sabahı takımlarla eşleştiriyoruz.",
      },
      {
        q: "AI araçları kullanılabilir mi?",
        a: "Evet, serbest. Hangi araçları kullandığınızı projenizin README dosyasında belirtmeniz yeterli.",
      },
      {
        q: "Ne getirmeliyim?",
        a: "Geliştirme yapacağın bilgisayarını ve şarj aletini getirmeni öneririz. Ayrıntılı liste Ocak'ta başvurularla birlikte açıklanacak.",
      },
      {
        q: "Yemek ve gece dinlenmesi nasıl olacak?",
        a: "Etkinlik boyunca yemek ve içecek dahil. Mekân gece boyunca açık ve armut koltuklu bir dinlenme alanı olacak. Otel veya yatak sağlanması planlanmıyor.",
      },
      {
        q: "Başvuru ve seçim süreci nasıl işliyor?",
        a: "Başvurular Ocak 2027'de bu sitede açılacak ve 31 Mart 2027 saat 23:59'da (Türkiye saati) kapanacak. Seçim sürecinin ayrıntıları Ocak'ta başvurularla birlikte açıklanacak.",
      },
    ],
  },
  closing: {
    upcoming: { h: "Ocak'ta başvurular açılıyor.", p: "O zamana kadar katılımcı rehberini okuyabilir, takımını şimdiden kurabilirsin." },
    open: { h: "Başvurular açık.", p: "Tek başına ya da takımınla başvur." },
    closed: { h: "Başvurular kapandı.", p: "İlgin için teşekkürler. Etkinlik bilgileri katılımcı rehberinde." },
  },
  footer: {
    org: "Düzenleyen",
    orgName: "TEKNOFEST Kulübü ADÜ",
    uni: "Aydın Adnan Menderes Üniversitesi",
    contact: "İletişim",
    copy: "Kopyala",
    copied: "Kopyalandı",
    links: "Bağlantılar",
    guide: "Katılımcı rehberi",
    rules: "Kurallar ve değerlendirme",
    coc: "Davranış kuralları",
    partners: "Partner bilgileri",
    privacy: "Gizlilik (KVKK)",
    instagram: "Instagram",
  },
};

export type Dict = typeof tr;

const en: Dict = {
  meta: {
    title: "Hackathon Aydın 2027",
    description:
      "A 24-hour product building marathon for university students. 17-18 April 2027, Aydın Adnan Menderes University.",
  },
  skip: "Skip to content",
  nav: {
    label: "Sections",
    event: "Event",
    schedule: "Schedule",
    sponsors: "Sponsors",
    faq: "FAQ",
    menu: "Menu",
    close: "Close",
    switchTo: "Türkçe",
    home: "Home",
    themeLight: "Switch to light theme",
    themeDark: "Switch to dark theme",
  },
  cta: {
    info: "How to join",
    apply: "Apply",
    closed: "Applications closed",
    sponsor: "Become a sponsor",
    opensIn: (label: string) => `Applications open in ${label} and close on 31 March 2027 at 23:59.`,
    /** Header and team card button, by application status. */
    join: { upcoming: "Applications open in January", open: "Apply", closed: "Applications closed" },
    /** Header under 1024 px. */
    joinShort: { upcoming: "Apply in Jan", open: "Apply", closed: "Applications closed" },
  },
  loader: "HACKATHON AYDIN 2027",
  hero: {
    eyebrow: "Hackathon Aydın 2027",
    edition: "3rd edition",
    ticker: ["24 hours", "Teams of 3-5", "Free", "17-18 April 2027", "Aydın", "Food and drinks included"],
    title: ["Come with an idea.", "Leave with a to-do list.", "Leave with a working product."],
    lead: "A 24-hour product building marathon for university students.",
    when: "17-18 April 2027",
    where: "Aydın Adnan Menderes University",
    countdown: {
      label: "Time until the opening ceremony",
      units: { d: "d", h: "h", m: "m" },
      cells: { d: "Days", h: "Hours", m: "Min", s: "Sec" },
      live: "Happening now",
      done: "See you in 2028",
    },
  },
  team: {
    label: "BUILD YOUR TEAM",
    roles: "Add a role",
    you: "You",
    empty: "Empty seat",
    remove: "Remove {role}",
    count: "{n} / 5 people",
    status: {
      low: "Teams are 3-5 people. Short on people? We match you on Saturday morning.",
      ready: "Your team is ready. Room for one more.",
      full: "Full squad. Ready for 24 hours.",
    },
    tips: {
      design: "A designer makes the difference on demo day.",
      product: "Someone thinking about the product keeps 24 hours pointed at the right problem.",
    },
    noTeam: "I don't have a team",
  },
  event: {
    title: "The event",
    text: "Hackathon Aydın is a student hackathon run by TEKNOFEST Club ADÜ. 2027 is the third edition. Teams spend 24 hours turning an idea into a working product. The theme is announced at the opening ceremony.",
    facts: [
      { value: "24 hours", label: "of building" },
      { value: "3-5", label: "people per team" },
      { value: "Free", label: "food and drinks included" },
      { value: "100+", label: "students", note: "target" },
    ],
    whyTitle: "Why join?",
    why: [
      "From idea to working product in 24 hours",
      "Demos at the tables, then the stage and an online jury for the final",
      "The venue stays open all night, with a bean bag rest area",
      "Food and drinks included, free of charge",
    ],
  },
  how: {
    title: "How to join",
    steps: [
      { h: "Apply", p: "Applications open on this site in January 2027 and close on 31 March 2027 at 23:59." },
      { h: "Form a team", p: "Teams have 3 to 5 people. If you apply alone, we match you with a team on Saturday morning." },
      { h: "Build for 24 hours", p: "Starts Saturday 12:00, ends with submissions on Sunday 12:00." },
      { h: "Present", p: "Every team demos at their table. The jury picks 10 teams for the final stage." },
    ],
  },
  past: {
    title: "Past editions",
    students: "students",
    teams: "teams",
    editions: [
      {
        year: "2026",
        label: "Second edition",
        students: 57,
        teams: 20,
        photos: [
          { src: "/img/2026-2.jpg", w: 1600, h: 1200, alt: "A speaker on stage in the main hall in 2026, students listening from the seats", caption: "2026 · A talk in the hall", pos: "50% 55%" },
          { src: "/img/2026-3.jpg", w: 1600, h: 1200, alt: "Participants with badges gathered around a table talking in 2026", caption: "2026 · On the event floor", pos: "50% 40%" },
          { src: "/img/2026-4.jpg", w: 1200, h: 1600, alt: "Two people holding a plaque on stage in 2026, Hackathon Aydın and Game Jam Aydın flags behind them", caption: "2026 · A plaque on stage", pos: "50% 55%" },
          { src: "/img/2026-5.jpg", w: 1200, h: 1600, alt: "Two participants holding Hackathon Aydın and Game Jam Aydın banners in 2026", caption: "2026 · With the banners", pos: "50% 45%" },
          { src: "/img/2026-1.jpg", w: 1200, h: 1600, alt: "View of the stage from the back rows of the hall in 2026", caption: "2026 · From the hall", pos: "50% 60%" },
        ],
      },
      {
        year: "2025",
        label: "First edition",
        students: 36,
        teams: 12,
        photos: [
          { src: "/img/2025-2.jpg", w: 1600, h: 1067, alt: "Two participants laughing at their laptops at Hackathon Aydın 2025", caption: "2025 · While building", pos: "50% 40%" },
          { src: "/img/2025-4.jpg", w: 1600, h: 1067, alt: "The Hackathon Aydın 2025 organizing team on both sides of the event banner", caption: "2025 · Organizing team", pos: "50% 45%" },
          { src: "/img/2025-5.jpg", w: 1600, h: 1067, alt: "Two participants with headphones focused on their screens at Hackathon Aydın 2025", caption: "2025 · Heads down", pos: "45% 40%" },
          { src: "/img/2025-1.jpg", w: 1600, h: 1067, alt: "The Hackathon Aydın 2025 team at a desk, event banners behind them", caption: "2025 · The team at the desk", pos: "50% 50%" },
          { src: "/img/2025-3.jpg", w: 1600, h: 1067, alt: "A smiling participant at Hackathon Aydın 2025, the work area behind", caption: "2025 · On the event floor", pos: "50% 35%" },
        ],
      },
    ],
  },
  schedule: {
    title: "Schedule",
    draft: "Draft schedule",
    note: "Building runs from Saturday 12:00 to Sunday 12:00, 24 hours in total. Times are Türkiye time (UTC+3).",
    days: { sat: "Saturday, 17 April", sun: "Sunday, 18 April" },
    break: "BREAK",
    by: "supported by {name}",
    build: "24 hours of building",
    hour: "Hour {n}",
    food: {
      title: "Nobody went hungry",
      lead: "Food and drinks included. Lunch, dinner, a midnight snack, breakfast and Sunday lunch.",
      fromTr: "from Turkish",
      rating: "{n} out of 5",
    },
  },
  people: {
    title: "Judges and mentors",
    judges: "Judges",
    mentors: "Mentors",
  },
  sponsors: {
    title: "Sponsors",
    empty: "Our 2027 sponsors will be announced soon.",
    emptyLead: "If you would like to support Hackathon Aydın, see the partner page or write to us.",
    compare: "See sponsorship packages",
    items: {
      title: "Take on one item",
      lead: "You do not have to pick a package. Take on one part of the event and it carries your name.",
      credit: "Your name goes on the item card, on the matching line of the programme, and is mentioned on stage.",
      open: "Open",
      takenBy: "Taken on by",
      inSchedule: "In the draft programme",
      other: "Have another item or in-kind support in mind?",
      otherCta: "Write to us",
    },
    tiers: {
      title: "Title sponsor",
      gold: "Gold sponsors",
      silver: "Silver sponsors",
      inkind: "In-kind supporters",
      tech: "Technology partners",
      community: "Community partners",
    },
    newTab: "(opens in a new tab)",
  },
  venue: {
    title: "Venue and travel",
    place: "Faculty of Medicine, Aydın Adnan Menderes University",
    placeNote: "Hall and address details coming soon.",
    map: "Open in Google Maps",
    items: [
      { h: "Overnight", p: "The venue stays open all night. There will be a rest area with bean bags." },
      { h: "Food", p: "Participation is free. Food and drinks are included throughout the event." },
    ],
    travel: { h: "Travel and accessibility", p: "Directions from Aydın bus terminal and the city centre, and accessibility details, are coming soon." },
  },
  faq: {
    title: "FAQ",
    items: [
      {
        q: "Who can join?",
        a: "The event is for university students aged 18 and over. Other eligibility details will be published with applications in January.",
      },
      { q: "Is there a fee?", a: "No. Participation is free, and food and drinks are included throughout the event." },
      {
        q: "Can I join without a team?",
        a: "Yes. Teams have 3 to 5 people. If you apply alone, we match you with a team on Saturday morning.",
      },
      {
        q: "Can we use AI tools?",
        a: "Yes, they are allowed. List the tools you used in your project's README.",
      },
      {
        q: "What should I bring?",
        a: "We recommend bringing the laptop you will build on and its charger. A full list will be published with applications in January.",
      },
      {
        q: "How do food and overnight rest work?",
        a: "Food and drinks are included throughout the event. The venue stays open all night and there will be a rest area with bean bags. Hotel rooms or beds are not planned.",
      },
      {
        q: "How do applications and selection work?",
        a: "Applications open on this site in January 2027 and close on 31 March 2027 at 23:59 (Türkiye time). Details of the selection process will be published with applications in January.",
      },
    ],
  },
  closing: {
    upcoming: { h: "Applications open in January.", p: "Until then, read the participant guide and start forming your team." },
    open: { h: "Applications are open.", p: "Apply on your own or with your team." },
    closed: { h: "Applications are closed.", p: "Thanks for your interest. Event details are in the participant guide." },
  },
  footer: {
    org: "Organized by",
    orgName: "TEKNOFEST Club ADÜ",
    uni: "Aydın Adnan Menderes University",
    contact: "Contact",
    copy: "Copy",
    copied: "Copied",
    links: "Links",
    guide: "Participant guide",
    rules: "Rules and judging",
    coc: "Code of conduct",
    partners: "Partner information",
    privacy: "Privacy",
    instagram: "Instagram",
  },
};

export const dictionaries: Record<Locale, Dict> = { tr, en };
export const getDict = (l: Locale) => dictionaries[l];

/** Sponsorship packages. Rights are fixed; only change with organizer approval. */
export const packages = {
  tr: {
    head: ["Ana", "Altın", "Gümüş", "Ayni"],
    rows: [
      ["Kontenjan", "1", "3", "5", "Açık"],
      ["Web sitesi", "●", "●", "●", "●"],
      ["Sahne afişi", "●", "●", "", ""],
      ["Tişört", "Büyük", "Orta", "Küçük", ""],
      ["Yaka ipi / kartı", "Yaka ipi", "Kart", "", ""],
      ["Sahnede süre", "5 dk", "2 dk", "", ""],
      ["Atölye", "●", "●", "", "●"],
      ["Adınızla ödül", "Birincilik", "●", "", "●"],
      ["Jüri koltuğu", "●", "", "", ""],
      ["İşe alım masası", "●", "●", "", ""],
    ],
    included: "Dahil",
  },
  en: {
    head: ["Title", "Gold", "Silver", "In-kind"],
    rows: [
      ["Spots", "1", "3", "5", "Open"],
      ["Website", "●", "●", "●", "●"],
      ["Stage banner", "●", "●", "", ""],
      ["T-shirt", "Large", "Medium", "Small", ""],
      ["Lanyard / badge", "Lanyard", "Badge", "", ""],
      ["Time on stage", "5 min", "2 min", "", ""],
      ["Workshop", "●", "●", "", "●"],
      ["Named award", "1st place", "●", "", "●"],
      ["Jury seat", "●", "", "", ""],
      ["Recruiter table", "●", "●", "", ""],
    ],
    included: "Included",
  },
} satisfies Record<Locale, { head: string[]; rows: string[][]; included: string }>;

export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Ayd%C4%B1n+Adnan+Menderes+%C3%9Cniversitesi+T%C4%B1p+Fak%C3%BCltesi";
export const COC_URL = "https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md";
