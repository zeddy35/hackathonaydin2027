import { COC_URL, MAPS_URL } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import type { DocPage } from "./types";

export const guide: Record<Locale, DocPage> = {
  tr: {
    title: "Katılımcı rehberi",
    description: "Hackathon Aydın 2027'ye kimler katılabilir, başvuru ve takımlar, hazırlık, etkinlik günü, mekân ve iletişim.",
    eyebrow: "Hackathon Aydın 2027",
    lead: "Başvurudan final sunumuna kadar bilmen gerekenler. Kesinleşmemiş bilgileri ayrıca belirttik.",
    sections: [
      {
        id: "kimler",
        h: "Kimler katılabilir?",
        blocks: [
          { p: "Etkinlik üniversite öğrencilerine yönelik. Katılım ücretsiz." },
          { note: "Uygunluk koşullarının ayrıntıları Ocak 2027'de başvurularla birlikte açıklanacak." },
        ],
      },
      {
        id: "basvuru",
        h: "Başvuru ve takım eşleştirme",
        blocks: [
          { p: "Başvurular Ocak 2027'de bu sitede açılacak. Şu an başvuru alınmıyor." },
          {
            ul: [
              "Takımlar 3-5 kişiden oluşur.",
              "Takımınla ya da tek başına başvurabilirsin.",
              "Tek başvuranlar Cumartesi sabahı takımlarla eşleştirilir.",
            ],
          },
          { note: "Seçim sürecinin ayrıntıları başvurularla birlikte açıklanacak." },
        ],
      },
      {
        id: "hazirlik",
        h: "Hazırlık ve getirilecekler",
        blocks: [
          {
            ul: [
              "Geliştirme yapacağın bilgisayar ve şarj aleti.",
              "Proje kodu etkinlik içinde yazılır. Açık kaynak kütüphaneleri kullanabilirsin.",
              "AI araçları serbest. Kullandıklarını projenin README dosyasında belirt.",
            ],
          },
          { note: "Ayrıntılı getirilecekler listesi Ocak'ta yayınlanacak." },
        ],
      },
      {
        id: "akis",
        h: "Etkinlik günü akışı",
        blocks: [
          { note: "Taslak program. Saatler değişebilir." },
          {
            ol: [
              "Cumartesi 08:30 · Kayıt",
              "Cumartesi 10:00 · Açılış ve temanın açıklanması",
              "Cumartesi 11:00 · Geliştirme başlar",
              "Cumartesi 19:00 · Akşam yemeği",
              "Pazar 15:00 · Teslim",
              "Pazar 15:15 · Finalist seçimi (masalarda demo)",
              "Pazar 17:30 · Finalistler açıklanır",
              "Pazar 18:00 · Final sunumları",
              "Pazar 20:15 · Ödüller",
            ],
          },
          {
            p: "Teslimden sonra tüm takımlar masalarında demo yapar. Jüri final sahnesi için 10 takım seçer. Kimse etkinlikten gönderilmez; diğer takımlar etkinlikte kalır ve finali izler.",
          },
        ],
      },
      {
        id: "mekan",
        h: "Mekân, ulaşım, yemek ve dinlenme",
        blocks: [
          { p: "Aydın Adnan Menderes Üniversitesi Tıp Fakültesi. Salon ve adres ayrıntıları yakında." },
          { links: [{ label: "Google Haritalar'da aç", href: MAPS_URL }] },
          {
            ul: [
              "Etkinlik boyunca yemek ve içecek dahil.",
              "Mekân gece boyunca açık. Armut koltuklu bir dinlenme alanı olacak.",
              "Otel veya yatak sağlanması planlanmıyor.",
            ],
          },
          { note: "Ulaşım ve erişilebilirlik ayrıntıları yakında." },
        ],
      },
      {
        id: "yardim",
        h: "Yardım ve iletişim",
        blocks: [
          { p: "Sorularını e-postayla iletebilirsin. Etkinlik sırasında organizasyon ekibi mekânda olacak." },
          { email: true },
          {
            links: [
              { label: "Kurallar ve değerlendirme", href: pagePath("tr", "rules") },
              { label: "Davranış kuralları (MLH Code of Conduct)", href: COC_URL },
            ],
          },
        ],
      },
    ],
  },
  en: {
    title: "Participant guide",
    description: "Who can join Hackathon Aydın 2027, applications and teams, preparation, the event days, venue and contact.",
    eyebrow: "Hackathon Aydın 2027",
    lead: "What you need to know from applying to the final presentations. Anything not yet confirmed is marked.",
    sections: [
      {
        id: "who",
        h: "Who can join?",
        blocks: [
          { p: "The event is for university students. Participation is free." },
          { note: "Full eligibility details will be published with applications in January 2027." },
        ],
      },
      {
        id: "apply",
        h: "Applications and team matching",
        blocks: [
          { p: "Applications open on this site in January 2027. We are not taking applications yet." },
          {
            ul: [
              "Teams have 3 to 5 people.",
              "You can apply with your team or on your own.",
              "If you apply alone, we match you with a team on Saturday morning.",
            ],
          },
          { note: "Details of the selection process will be published with applications." },
        ],
      },
      {
        id: "prepare",
        h: "Preparation and what to bring",
        blocks: [
          {
            ul: [
              "The laptop you will build on and its charger.",
              "Project code is written during the event. Open source libraries are allowed.",
              "AI tools are allowed. List the ones you used in your project's README.",
            ],
          },
          { note: "A full packing list will be published in January." },
        ],
      },
      {
        id: "flow",
        h: "The event days",
        blocks: [
          { note: "Draft schedule. Times may change." },
          {
            ol: [
              "Saturday 08:30 · Check-in",
              "Saturday 10:00 · Opening and theme reveal",
              "Saturday 11:00 · Hacking starts",
              "Saturday 19:00 · Dinner",
              "Sunday 15:00 · Submissions close",
              "Sunday 15:15 · Finalist selection (demos at tables)",
              "Sunday 17:30 · Finalists announced",
              "Sunday 18:00 · Final presentations",
              "Sunday 20:15 · Awards",
            ],
          },
          {
            p: "After submissions, every team demos at their table and the jury picks 10 teams for the final stage. Nobody is sent home: the other teams stay at the event and watch the finals.",
          },
        ],
      },
      {
        id: "venue",
        h: "Venue, travel, food and rest",
        blocks: [
          { p: "Faculty of Medicine, Aydın Adnan Menderes University. Hall and address details coming soon." },
          { links: [{ label: "Open in Google Maps", href: MAPS_URL }] },
          {
            ul: [
              "Food and drinks are included throughout the event.",
              "The venue stays open all night. There will be a rest area with bean bags.",
              "Hotel rooms or beds are not planned.",
            ],
          },
          { note: "Travel and accessibility details coming soon." },
        ],
      },
      {
        id: "help",
        h: "Help and contact",
        blocks: [
          { p: "Send your questions by email. During the event, the organizing team will be at the venue." },
          { email: true },
          {
            links: [
              { label: "Rules and judging", href: pagePath("en", "rules") },
              { label: "MLH Code of Conduct", href: COC_URL },
            ],
          },
        ],
      },
    ],
  },
};
