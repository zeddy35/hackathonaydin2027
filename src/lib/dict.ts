export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** Opening ceremony, Saturday 17 April 2027, 10:00 Istanbul time. */
export const KICKOFF = "2027-04-17T10:00:00+03:00";
export const CONTACT = "zerdendereli@gmail.com";

const en = {
  meta: {
    title: "Hackathon Aydın 2027",
    description: "A 28-hour student hackathon. 17 to 18 April 2027, Aydın Adnan Menderes University.",
  },
  nav: { about: "About", schedule: "Schedule", sponsors: "Sponsors", last: "Past", faq: "FAQ", apply: "Apply" },
  hero: {
    date: "17 to 18 April 2027",
    place: "Aydın Adnan Menderes University",
    countLabel: "Starts in",
    units: ["days", "hrs", "min", "sec"],
    started: "Happening now",
    cta: "Apply",
    note: "Applications open in January",
  },
  about: {
    title: "About",
    text: "A 28-hour hackathon for university students. Teams of 3 to 5 build a product from scratch and pitch it to the jury on Sunday evening. The theme is announced at the opening ceremony.",
    facts: [
      ["28", "hours"],
      ["100+", "students"],
      ["Free", "food included"],
    ],
  },
  schedule: {
    title: "Schedule",
    days: [
      {
        d: "Saturday, 17 April",
        items: [
          ["08:30", "Check-in"],
          ["10:00", "Opening and theme"],
          ["11:00", "Hacking starts"],
          ["19:00", "Dinner"],
        ],
      },
      {
        d: "Sunday, 18 April",
        items: [
          ["15:00", "Submissions close"],
          ["15:15", "Pre-judging"],
          ["18:00", "Finals"],
          ["20:15", "Awards"],
        ],
      },
    ],
  },
  sponsors: {
    title: "Sponsors",
    text: "Each package lists exactly where your logo appears.",
    head: ["", "Title", "Gold", "Silver", "In-kind"],
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
    contact: "Sponsorship",
    copy: "Copy",
    copied: "Copied",
  },
  last: {
    title: "Past editions",
    editions: [
      {
        year: "2026",
        label: "Second edition",
        stats: [
          ["57", "students"],
          ["20", "teams"],
        ],
        photos: [
          ["/img/stage.jpg", "The first-place team with their plaques on stage, 2026", "1st place"],
          ["/img/winners.jpg", "The second-place team holding their plaque, 2026", "2nd place"],
        ],
      },
      {
        year: "2025",
        label: "First edition",
        stats: [
          ["36", "students"],
          ["12", "teams"],
        ],
        photos: [
          ["/img/team.jpg", "The organizing team in front of the Hackathon Aydın backdrop, 2025", "Organizing team"],
          ["/img/builder.jpg", "A participant at Hackathon Aydın 2025", ""],
        ],
      },
    ] as { year: string; label: string; stats: string[][]; photos: string[][] }[],
  },
  faq: {
    title: "FAQ",
    items: [
      ["Who can join?", "Students from any university, and graduates from the last 12 months."],
      ["Is it free?", "Yes. Food, drinks and a place to rest are included."],
      ["Do I need a team?", "No. Apply alone and we will match you on Saturday morning."],
      ["Can we use AI tools?", "Yes. Note which ones in your README."],
      ["Where do we sleep?", "The venue stays open all night. There is a rest area with couches."],
    ],
  },
  footer: { org: "TEKNOFEST Club ADÜ", coc: "Code of conduct" },
};

export type Dict = typeof en;

const tr: Dict = {
  meta: {
    title: "Hackathon Aydın 2027",
    description: "28 saatlik öğrenci hackathonu. 17-18 Nisan 2027, Aydın Adnan Menderes Üniversitesi.",
  },
  nav: { about: "Hakkında", schedule: "Program", sponsors: "Sponsorlar", last: "Geçmiş", faq: "SSS", apply: "Başvur" },
  hero: {
    date: "17-18 Nisan 2027",
    place: "Aydın Adnan Menderes Üniversitesi",
    countLabel: "Başlamasına",
    units: ["gün", "saat", "dk", "sn"],
    started: "Şu an devam ediyor",
    cta: "Başvur",
    note: "Başvurular Ocak'ta açılıyor",
  },
  about: {
    title: "Hakkında",
    text: "Üniversite öğrencileri için 28 saatlik bir hackathon. 3-5 kişilik takımlar sıfırdan bir ürün geliştirir ve pazar akşamı jüriye sunar. Tema açılış töreninde açıklanır.",
    facts: [
      ["28", "saat"],
      ["100+", "öğrenci"],
      ["Ücretsiz", "yemek dahil"],
    ],
  },
  schedule: {
    title: "Program",
    days: [
      {
        d: "Cumartesi, 17 Nisan",
        items: [
          ["08:30", "Kayıt"],
          ["10:00", "Açılış ve tema"],
          ["11:00", "Geliştirme başlıyor"],
          ["19:00", "Akşam yemeği"],
        ],
      },
      {
        d: "Pazar, 18 Nisan",
        items: [
          ["15:00", "Teslimler kapanıyor"],
          ["15:15", "Ön eleme"],
          ["18:00", "Final"],
          ["20:15", "Ödüller"],
        ],
      },
    ],
  },
  sponsors: {
    title: "Sponsorlar",
    text: "Her paket logonuzun tam olarak nerede görüneceğini gösterir.",
    head: ["", "Ana", "Gold", "Silver", "Ayni"],
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
    contact: "Sponsorluk",
    copy: "Kopyala",
    copied: "Kopyalandı",
  },
  last: {
    title: "Önceki yıllar",
    editions: [
      {
        year: "2026",
        label: "İkinci edisyon",
        stats: [
          ["57", "öğrenci"],
          ["20", "takım"],
        ],
        photos: [
          ["/img/stage.jpg", "Sahnede plaketleriyle birinci takım, 2026", "Birinci"],
          ["/img/winners.jpg", "Plaketiyle ikinci takım, 2026", "İkinci"],
        ],
      },
      {
        year: "2025",
        label: "İlk edisyon",
        stats: [
          ["36", "öğrenci"],
          ["12", "takım"],
        ],
        photos: [
          ["/img/team.jpg", "Hackathon Aydın panosunun önünde organizasyon ekibi, 2025", "Organizasyon ekibi"],
          ["/img/builder.jpg", "Hackathon Aydın 2025'te bir katılımcı", ""],
        ],
      },
    ],
  },
  faq: {
    title: "SSS",
    items: [
      ["Kimler katılabilir?", "Tüm üniversitelerin öğrencileri ve son 12 ayda mezun olanlar."],
      ["Ücretli mi?", "Hayır. Yemek, içecek ve dinlenme alanı dahil."],
      ["Takımım olmak zorunda mı?", "Hayır. Tek başvurursan cumartesi sabahı seni bir takımla eşleştiriyoruz."],
      ["AI araçları kullanabilir miyiz?", "Evet. Hangilerini kullandığınızı README'ye yazın."],
      ["Nerede uyuyoruz?", "Mekan gece boyu açık. Kanepeli bir dinlenme alanı var."],
    ],
  },
  footer: { org: "TEKNOFEST Kulübü ADÜ", coc: "Davranış kuralları" },
};

export const dictionaries: Record<Locale, Dict> = { en, tr };
export const getDict = (l: Locale) => dictionaries[l];
