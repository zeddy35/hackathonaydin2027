import { COC_URL } from "@/lib/dict";
import type { Locale } from "@/lib/i18n";
import type { DocPage } from "./types";

export const rules: Record<Locale, DocPage> = {
  tr: {
    title: "Kurallar ve değerlendirme",
    description: "Hackathon Aydın 2027 takım kuralları, geliştirme süresi, teslim, jüri değerlendirmesi ve davranış kuralları. Taslak.",
    eyebrow: "Hackathon Aydın 2027",
    lead: "Takımlar, geliştirme süresi, teslim ve değerlendirme.",
    banner: "Bu sayfa taslaktır; kurallar başvurular açılmadan önce kesinleşecek.",
    sections: [
      {
        id: "takim",
        h: "Takımlar",
        blocks: [
          {
            ul: [
              "Her takım 3-5 kişiden oluşur.",
              "Tek başvuranlar Cumartesi sabahı takımlarla eşleştirilir.",
            ],
          },
        ],
      },
      {
        id: "sure",
        h: "Geliştirme süresi",
        blocks: [
          { p: "Geliştirme Cumartesi 12:00'de başlar ve Pazar 12:00'de biter. Toplam 24 saat. Saatler Türkiye saatiyle." },
          { p: "Tema açılış töreninde açıklanır." },
        ],
      },
      {
        id: "kod",
        h: "Önceden yazılmış kod",
        blocks: [
          { p: "Proje kodu etkinlik içinde yazılır. Açık kaynak kütüphaneler ve framework'ler serbest." },
          { note: "Bu madde organizatör onayı bekliyor." },
        ],
      },
      {
        id: "ai",
        h: "AI araçları",
        blocks: [{ p: "AI araçlarını kullanmak serbest. Takımlar hangi araçları kullandıklarını projenin README dosyasında belirtir." }],
      },
      {
        id: "teslim",
        h: "Teslim",
        blocks: [
          {
            ul: [
              "Teslim Pazar 12:00'de kapanır.",
              "README dosyasında kullanılan AI araçları belirtilir.",
            ],
          },
          { note: "Teslim biçimi (ör. depo bağlantısı, demo) başvurular açılmadan önce kesinleşecek." },
        ],
      },
      {
        id: "degerlendirme",
        h: "Değerlendirme",
        blocks: [
          {
            p: "Finalist seçimi: Teslimden sonra tüm takımlar masalarında demo yapar. Jüri final sahnesi için 10 takım seçer. Kimse etkinlikten gönderilmez; diğer takımlar etkinlikte kalır ve finali izler.",
          },
          { p: "Final: Seçilen 10 takım sahnede sunum yapar. Akademisyenler ve sektörden kuruculardan oluşan jüri finali online değerlendirir. Ödüller Pazar akşamı verilir." },
          { p: "Jüri ölçütleri (taslak):" },
          {
            ul: [
              "Teknik uygulama",
              "Etki ve problem",
              "Yenilik",
              "Demo ve sunum",
              "Tamamlanmışlık ve kullanıcı deneyimi",
            ],
          },
          { note: "Ölçütler ve ağırlıkları başvurular açılmadan önce kesinleşecek. Jüri isimleri henüz açıklanmadı." },
        ],
      },
      {
        id: "davranis",
        h: "Davranış kuralları",
        blocks: [
          { p: "Etkinlikteki herkes (katılımcılar, mentorlar, jüri, sponsorlar, gönüllüler ve organizatörler) MLH Code of Conduct'a uyar." },
          { links: [{ label: "MLH Code of Conduct", href: COC_URL }] },
          { p: "Bir sorun yaşarsan ya da tanık olursan mekândaki organizasyon ekibine haber ver ya da e-posta gönder:" },
          { email: true },
        ],
      },
    ],
  },
  en: {
    title: "Rules and judging",
    description: "Hackathon Aydın 2027 team rules, building window, submissions, judging and code of conduct. Draft.",
    eyebrow: "Hackathon Aydın 2027",
    lead: "Teams, building window, submissions and judging.",
    banner: "This page is a draft. The rules will be final before applications open.",
    sections: [
      {
        id: "teams",
        h: "Teams",
        blocks: [
          {
            ul: [
              "Every team has 3 to 5 people.",
              "If you apply alone, we match you with a team on Saturday morning.",
            ],
          },
        ],
      },
      {
        id: "window",
        h: "Building window",
        blocks: [
          { p: "Building starts Saturday 12:00 and ends Sunday 12:00. 24 hours in total, Türkiye time (UTC+3)." },
          { p: "The theme is announced at the opening ceremony." },
        ],
      },
      {
        id: "code",
        h: "Pre-written code",
        blocks: [
          { p: "Project code is written during the event. Open source libraries and frameworks are allowed." },
          { note: "This rule is awaiting organizer approval." },
        ],
      },
      {
        id: "ai",
        h: "AI tools",
        blocks: [{ p: "AI tools are allowed. Teams list the tools they used in their project's README." }],
      },
      {
        id: "submission",
        h: "Submission",
        blocks: [
          {
            ul: [
              "Submissions close Sunday 12:00.",
              "The README lists the AI tools used.",
            ],
          },
          { note: "The submission format (for example repository link, demo) will be final before applications open." },
        ],
      },
      {
        id: "judging",
        h: "Judging",
        blocks: [
          {
            p: "Finalist selection: after submissions, every team demos at their table and the jury picks 10 teams for the final stage. Nobody is sent home: the other teams stay at the event and watch the finals.",
          },
          { p: "Finals: the 10 selected teams present on stage. A jury of academics and startup founders judges the finals online. Awards are given on Sunday evening." },
          { p: "Judging criteria (draft):" },
          {
            ul: [
              "Technical execution",
              "Impact and problem",
              "Innovation",
              "Demo and presentation",
              "Completeness and user experience",
            ],
          },
          { note: "Criteria and weights will be final before applications open. Judges have not been announced yet." },
        ],
      },
      {
        id: "conduct",
        h: "Code of conduct",
        blocks: [
          { p: "Everyone at the event (participants, mentors, judges, sponsors, volunteers and organizers) follows the MLH Code of Conduct." },
          { links: [{ label: "MLH Code of Conduct", href: COC_URL }] },
          { p: "If you experience or witness a problem, tell the organizing team at the venue or email us:" },
          { email: true },
        ],
      },
    ],
  },
};
