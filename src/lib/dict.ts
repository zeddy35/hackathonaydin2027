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
      "Üniversite öğrencileri için 28 saatlik ürün geliştirme maratonu. 17-18 Nisan 2027, Aydın Adnan Menderes Üniversitesi.",
  },
  skip: "İçeriğe geç",
  nav: {
    label: "Bölümler",
    event: "Etkinlik",
    schedule: "Program",
    sponsors: "Sponsorlar",
    faq: "SSS",
    join: "Katılım",
    menu: "Menü",
    close: "Kapat",
    switchTo: "English",
    home: "Ana sayfa",
  },
  cta: {
    info: "Katılım bilgileri",
    apply: "Başvur",
    closed: "Başvurular kapandı",
    sponsor: "Sponsor ol",
    opensIn: (label: string) => `Başvurular ${label}'da açılacak, 31 Mart 2027 23:59'da kapanacak.`,
  },
  countdown: {
    label: "Açılış törenine",
    days: "gün",
    hours: "sa",
    minutes: "dk",
    live: "Etkinlik devam ediyor",
    done: "Hackathon Aydın 2027 tamamlandı",
  },
  hero: {
    eyebrow: "Hackathon Aydın 2027",
    title: ["Bir fikirle gel.", "Çalışan bir ürünle çık."],
    lead: "Üniversite öğrencileri için 28 saatlik ürün geliştirme maratonu.",
    when: "17-18 Nisan 2027",
    where: "Aydın Adnan Menderes Üniversitesi",
  },
  event: {
    title: "Etkinlik",
    text: "Hackathon Aydın, TEKNOFEST Kulübü ADÜ'nün düzenlediği öğrenci hackathonu. 2027 üçüncü edisyonu. Takımlar 28 saat boyunca bir fikri çalışan bir ürüne dönüştürür. Tema açılış töreninde açıklanır.",
    facts: [
      { value: "28 saat", label: "geliştirme süresi" },
      { value: "3-5 kişi", label: "takım başına" },
      { value: "Ücretsiz", label: "yemek ve içecek dahil" },
      { value: "100+", label: "öğrenci", note: "hedeflenen" },
    ],
  },
  how: {
    title: "Nasıl katılırım?",
    steps: [
      { h: "Başvuru", p: "Başvurular Ocak 2027'de bu sitede açılacak, 31 Mart 2027 23:59'da kapanacak." },
      { h: "Takım oluşturma", p: "Takımlar 3-5 kişi. Tek başvuranları Cumartesi sabahı takımlarla eşleştiriyoruz." },
      { h: "28 saat geliştirme", p: "Cumartesi 11:00'de başlar, Pazar 15:00'te teslimle biter." },
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
          { src: "/img/stage.jpg", w: 480, h: 640, alt: "2026'da birinci olan takım plaketleriyle sahnede", caption: "Birinci olan takım", pos: "50% 50%" },
          { src: "/img/winners.jpg", w: 480, h: 640, alt: "2026'da ikinci olan iki kişilik takım plaketleriyle", caption: "İkinci olan takım", pos: "50% 40%" },
        ],
      },
      {
        year: "2025",
        label: "İlk edisyon",
        students: 36,
        teams: 12,
        photos: [
          { src: "/img/team.jpg", w: 1280, h: 959, alt: "Hackathon Aydın 2025 organizasyon ekibi etkinlik panosunun önünde", caption: "Organizasyon ekibi", pos: "50% 40%" },
          { src: "/img/builder.jpg", w: 480, h: 320, alt: "Hackathon Aydın 2025'te bir katılımcı", caption: "Bir katılımcı", pos: "50% 30%" },
        ],
      },
    ],
  },
  schedule: {
    title: "Program",
    draft: "Taslak program",
    note: "Geliştirme süresi Cumartesi 11:00 ile Pazar 15:00 arası, toplam 28 saat. Saatler Türkiye saatiyle.",
    days: { sat: "Cumartesi, 17 Nisan", sun: "Pazar, 18 Nisan" },
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
    compare: "Sponsorluk paketlerini karşılaştır",
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
      { h: "Ulaşım ve erişilebilirlik", p: "Ayrıntılar yakında." },
    ],
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
      "A 28-hour product building marathon for university students. 17-18 April 2027, Aydın Adnan Menderes University.",
  },
  skip: "Skip to content",
  nav: {
    label: "Sections",
    event: "Event",
    schedule: "Schedule",
    sponsors: "Sponsors",
    faq: "FAQ",
    join: "Join",
    menu: "Menu",
    close: "Close",
    switchTo: "Türkçe",
    home: "Home",
  },
  cta: {
    info: "How to join",
    apply: "Apply",
    closed: "Applications closed",
    sponsor: "Become a sponsor",
    opensIn: (label: string) => `Applications open in ${label} and close on 31 March 2027 at 23:59.`,
  },
  countdown: {
    label: "Until the opening ceremony",
    days: "d",
    hours: "h",
    minutes: "min",
    live: "The event is happening now",
    done: "Hackathon Aydın 2027 has ended",
  },
  hero: {
    eyebrow: "Hackathon Aydın 2027",
    title: ["Come with an idea.", "Leave with a working product."],
    lead: "A 28-hour product building marathon for university students.",
    when: "17-18 April 2027",
    where: "Aydın Adnan Menderes University",
  },
  event: {
    title: "The event",
    text: "Hackathon Aydın is a student hackathon run by TEKNOFEST Club ADÜ. 2027 is the third edition. Teams spend 28 hours turning an idea into a working product. The theme is announced at the opening ceremony.",
    facts: [
      { value: "28 hours", label: "of building" },
      { value: "3-5", label: "people per team" },
      { value: "Free", label: "food and drinks included" },
      { value: "100+", label: "students", note: "target" },
    ],
  },
  how: {
    title: "How to join",
    steps: [
      { h: "Apply", p: "Applications open on this site in January 2027 and close on 31 March 2027 at 23:59." },
      { h: "Form a team", p: "Teams have 3 to 5 people. If you apply alone, we match you with a team on Saturday morning." },
      { h: "Build for 28 hours", p: "Starts Saturday 11:00, ends with submissions on Sunday 15:00." },
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
          { src: "/img/stage.jpg", w: 480, h: 640, alt: "The first-place team of 2026 on stage with their plaques", caption: "First place", pos: "50% 50%" },
          { src: "/img/winners.jpg", w: 480, h: 640, alt: "The two-person team that placed second in 2026 with their plaque", caption: "Second place", pos: "50% 40%" },
        ],
      },
      {
        year: "2025",
        label: "First edition",
        students: 36,
        teams: 12,
        photos: [
          { src: "/img/team.jpg", w: 1280, h: 959, alt: "The Hackathon Aydın 2025 organizing team in front of the event backdrop", caption: "Organizing team", pos: "50% 40%" },
          { src: "/img/builder.jpg", w: 480, h: 320, alt: "A participant at Hackathon Aydın 2025", caption: "A participant", pos: "50% 30%" },
        ],
      },
    ],
  },
  schedule: {
    title: "Schedule",
    draft: "Draft schedule",
    note: "Building runs from Saturday 11:00 to Sunday 15:00, 28 hours in total. Times are Türkiye time (UTC+3).",
    days: { sat: "Saturday, 17 April", sun: "Sunday, 18 April" },
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
    compare: "Compare sponsorship packages",
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
      { h: "Travel and accessibility", p: "Details coming soon." },
    ],
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
