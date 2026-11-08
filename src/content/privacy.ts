import type { Locale } from "@/lib/i18n";
import type { DocPage } from "./types";

/*
 * DRAFT privacy notice (KVKK aydınlatma metni). Needs organizer and legal
 * review before applications open. Do not remove the banner until approved.
 */
export const privacy: Record<Locale, DocPage> = {
  tr: {
    title: "Kişisel verilerin korunması (KVKK aydınlatma metni)",
    description: "Hackathon Aydın 2027 başvurusunda toplanan kişisel veriler, işlenme amaçları ve hakların. Taslak.",
    eyebrow: "Hackathon Aydın 2027",
    lead: "Başvuru ve katılım sırasında hangi bilgileri neden topladığımızı ve bu bilgiler üzerindeki haklarını anlatır.",
    banner: "Bu metin taslaktır; organizatör ve hukuk onayı bekliyor. Onaylanan metin başvurular açılmadan önce burada yayınlanacak.",
    sections: [
      {
        id: "sorumlu",
        h: "Veri sorumlusu",
        blocks: [
          { p: "Hackathon Aydın, Aydın Adnan Menderes Üniversitesi bünyesindeki TEKNOFEST Kulübü ADÜ tarafından düzenlenir. Veri sorumlusunun resmî unvanı ve iletişim bilgileri onaylanan metinde yer alacak." },
          { email: true },
        ],
      },
      {
        id: "veriler",
        h: "Toplanan veriler",
        blocks: [
          {
            ul: [
              "Kimlik ve iletişim: ad, soyad, e-posta, telefon, yaş.",
              "Eğitim: üniversite, bölüm, öğrenim düzeyi, mezuniyet yılı.",
              "Konum: yaşadığın ülke ve şehir.",
              "Katılım: takım durumu, deneyim, motivasyon metni, tişört bedeni, beslenme tercihi veya alerji bilgisi (isteğe bağlı), acil durum kişisinin adı ve telefonu.",
              "İsteğe bağlı: GitHub, LinkedIn, portfolyo linki, CV dosyası.",
              "Etkinlik: başvuru durumu, check-in zamanı, takım ve proje teslimi bilgileri.",
              "Onaylar: her onayın verildiği zaman.",
            ],
          },
        ],
      },
      {
        id: "amac",
        h: "İşleme amaçları",
        blocks: [
          {
            ul: [
              "Başvuruyu değerlendirmek ve sonucu bildirmek.",
              "Etkinlik günü kayıt (check-in), takım eşleştirme ve proje teslimini yönetmek.",
              "Gece boyu süren etkinlikte acil bir durumda belirttiğin kişiye ulaşmak.",
              "Yemek planlamasında beslenme tercihlerini ve alerjileri dikkate almak.",
              "Ayrıca izin verirsen gelecek etkinlik duyurularını göndermek.",
            ],
          },
        ],
      },
      {
        id: "aktarim",
        h: "Aktarım",
        blocks: [
          { p: "Veriler etkinliğin yürütülmesi için kullanılan hizmet sağlayıcılarda saklanır: veritabanı ve giriş sistemi (Supabase, Avrupa Birliği bölgesi), e-posta gönderimi (Resend), barındırma (Vercel)." },
          { p: "Jüri üyeleri sadece proje teslimlerini görür; başvuru cevaplarını ve kişisel bilgilerini görmez." },
          { p: "Etkinlik bir MLH üye etkinliği olarak onaylanırsa, bilgilerin yalnızca başvuru formunda ayrıca onay verirsen MLH ile paylaşılır." },
        ],
      },
      {
        id: "sure",
        h: "Saklama süresi",
        blocks: [{ note: "Saklama süresi organizatör ve hukuk onayıyla belirlenecek." }],
      },
      {
        id: "haklar",
        h: "Hakların",
        blocks: [
          { p: "KVKK'nın 11. maddesi kapsamında verilerinin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsin. Talebini e-posta ile iletebilirsin." },
          { p: "Duyuru izni isteğe bağlıdır; panelinden ya da e-posta ile istediğin zaman geri alabilirsin." },
        ],
      },
    ],
  },
  en: {
    title: "Privacy notice",
    description: "What personal data Hackathon Aydın 2027 collects when you apply, why, and your rights. Draft.",
    eyebrow: "Hackathon Aydın 2027",
    lead: "Which information we collect when you apply and attend, why we need it, and your rights over it.",
    banner: "This notice is a draft awaiting organizer and legal review. The approved text will be published here before applications open.",
    sections: [
      {
        id: "controller",
        h: "Data controller",
        blocks: [
          { p: "Hackathon Aydın is organized by TEKNOFEST Kulübü ADÜ, a student club at Aydın Adnan Menderes University. The controller's official name and contact details will be in the approved notice." },
          { email: true },
        ],
      },
      {
        id: "data",
        h: "Data we collect",
        blocks: [
          {
            ul: [
              "Identity and contact: first and last name, email, phone, age.",
              "Education: university, field of study, level of study, graduation year.",
              "Location: country and city of residence.",
              "Attendance: team status, experience, motivation, T-shirt size, dietary needs or allergies (optional), emergency contact name and phone.",
              "Optional: GitHub, LinkedIn, portfolio link, CV file.",
              "Event: application status, check-in time, team and project submission.",
              "Consents: the time each consent was given.",
            ],
          },
        ],
      },
      {
        id: "purpose",
        h: "Why we use it",
        blocks: [
          {
            ul: [
              "To review your application and tell you the result.",
              "To run check-in, team matching and project submission on event day.",
              "To reach your emergency contact if something happens during the overnight event.",
              "To plan meals around dietary needs and allergies.",
              "If you opt in, to send you announcements about future events.",
            ],
          },
        ],
      },
      {
        id: "sharing",
        h: "Sharing",
        blocks: [
          { p: "Data is stored with the service providers we use to run the event: database and sign-in (Supabase, European Union region), email delivery (Resend), hosting (Vercel)." },
          { p: "Judges only see project submissions, never application answers or personal details." },
          { p: "If the event is approved as an MLH Member Event, your information is shared with MLH only if you give that separate consent on the form." },
        ],
      },
      {
        id: "retention",
        h: "Retention",
        blocks: [{ note: "The retention period will be set with organizer and legal approval." }],
      },
      {
        id: "rights",
        h: "Your rights",
        blocks: [
          { p: "Under Article 11 of the Turkish Personal Data Protection Law (KVKK), you can ask whether your data is processed, ask for it to be corrected or deleted, and object to processing. Send your request by email." },
          { p: "Announcement emails are optional; you can withdraw consent from your panel or by email at any time." },
        ],
      },
    ],
  },
};
