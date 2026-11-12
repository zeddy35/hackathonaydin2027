import type { Locale } from "@/lib/i18n";
import type { DocPage } from "./types";

export const partners: Record<Locale, DocPage> = {
  tr: {
    title: "Partner bilgileri",
    description: "Hackathon Aydın 2027'ye sponsor veya partner olarak destek olmak isteyen kurumlar için etkinlik özeti, geçmiş veriler ve sponsorluk paketleri.",
    eyebrow: "Sponsorlar ve partnerler için",
    lead: "Hackathon Aydın 2027, üniversite öğrencileri için 24 saatlik ürün geliştirme maratonu. 17-18 Nisan 2027, Aydın Adnan Menderes Üniversitesi Tıp Fakültesi.",
    sections: [
      {
        id: "ozet",
        h: "Etkinlik",
        blocks: [
          {
            ul: [
              "Üçüncü edisyon. Tarih: 17-18 Nisan 2027 (Cumartesi-Pazar).",
              "24 saat geliştirme, 3-5 kişilik takımlar.",
              "Katılım ücretsiz, yemek ve içecek dahil, mekân gece boyunca açık.",
              "Tema açılış töreninde açıklanır.",
              "Finalde akademisyenler ve sektörden kuruculardan oluşan jüri.",
            ],
          },
        ],
      },
      {
        id: "organizator",
        h: "Organizatör",
        blocks: [{ p: "TEKNOFEST Kulübü ADÜ, Aydın Adnan Menderes Üniversitesi öğrenci kulübü." }],
      },
      {
        id: "kitle",
        h: "Hedef kitle",
        blocks: [{ p: "Ürün geliştirmek isteyen üniversite öğrencileri: yazılım, tasarım ve ürün tarafında çalışan takımlar." }],
      },
      {
        id: "gecmis",
        h: "Geçmiş edisyonlar",
        blocks: [{ history: true }],
      },
      {
        id: "hedefler",
        h: "2027 hedefleri",
        blocks: [
          { ul: ["100+ öğrenci (hedeflenen)"] },
        ],
      },
      {
        id: "destek",
        h: "Destek seçenekleri",
        blocks: [
          {
            ul: [
              "Nakdi sponsorluk: aşağıdaki paketler.",
              "Ayni destek: yemek, içecek, ekipman veya ödül.",
              "Teknoloji desteği: API kredisi, araç ve yazılım lisansı.",
              "Atölye, mentorluk ve jüri katkısı.",
              "Topluluk ortaklığı: duyuru ve katılımcı erişimi.",
            ],
          },
        ],
      },
      {
        id: "paketler",
        h: "Sponsorluk paketleri",
        blocks: [{ packages: true }],
      },
      {
        id: "iletisim",
        h: "İletişim",
        blocks: [{ p: "Paketler veya özel bir iş birliği için bize yaz." }, { email: true }],
      },
    ],
  },
  en: {
    title: "Partner information",
    description: "Event summary, past numbers and sponsorship packages for organizations that want to support Hackathon Aydın 2027.",
    eyebrow: "For sponsors and partners",
    lead: "Hackathon Aydın 2027 is a 24-hour product building marathon for university students. 17-18 April 2027, Faculty of Medicine, Aydın Adnan Menderes University, Türkiye.",
    sections: [
      {
        id: "summary",
        h: "The event",
        blocks: [
          {
            ul: [
              "Third edition. Dates: 17-18 April 2027 (Saturday to Sunday).",
              "24 hours of building, teams of 3 to 5.",
              "Free to attend, food and drinks included, venue open overnight.",
              "The theme is announced at the opening ceremony.",
              "Finals judged by academics and startup founders.",
            ],
          },
        ],
      },
      {
        id: "organizer",
        h: "Organizer",
        blocks: [{ p: "TEKNOFEST Club ADÜ, a student club at Aydın Adnan Menderes University." }],
      },
      {
        id: "audience",
        h: "Audience",
        blocks: [{ p: "University students who want to build products: teams working across software, design and product." }],
      },
      {
        id: "history",
        h: "Past editions",
        blocks: [{ history: true }],
      },
      {
        id: "goals",
        h: "2027 goals",
        blocks: [{ ul: ["100+ students (target)"] }],
      },
      {
        id: "support",
        h: "Ways to support",
        blocks: [
          {
            ul: [
              "Cash sponsorship: the packages below.",
              "In-kind support: food, drinks, equipment or prizes.",
              "Technology support: API credits, tools and software licenses.",
              "Workshops, mentoring and judging.",
              "Community partnership: announcements and outreach to participants.",
            ],
          },
        ],
      },
      {
        id: "packages",
        h: "Sponsorship packages",
        blocks: [{ packages: true }],
      },
      {
        id: "contact",
        h: "Contact",
        blocks: [{ p: "Write to us about the packages or a custom partnership." }, { email: true }],
      },
    ],
  },
};
