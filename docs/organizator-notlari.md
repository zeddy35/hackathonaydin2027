# Organizatör notları

Bu dosya repo ile birlikte herkese açık. Tema, bütçe, telefon numarası veya kişisel bilgi yazma.

## Eksik bilgiler ve verilmesi gereken kararlar

- [ ] Salon adı ve açık adres (Tıp Fakültesi içinde). Gelince `src/lib/dict.ts` → `venue` ve `src/content/guide.ts`.
- [ ] Ulaşım ve erişilebilirlik bilgileri (otobüs, otopark, asansör, engelli erişimi).
- [ ] Uygunluk koşulları: sadece önlisans/lisans/lisansüstü öğrenciler mi, yeni mezunlar kabul ediliyor mu? (Yaş sınırı karara bağlandı: 18+.) Eski sitede "son 12 ayda mezun olanlar" yazıyordu; doğrulanmadığı için kaldırıldı.
- [ ] Seçim süreci: başvuruların hepsi kabul mü, kontenjan ve sıralama ölçütü ne?
- [ ] Getirilecekler listesi (kimlik, öğrenci belgesi, uyku eşyası vb.).
- [ ] Önceden yazılmış kod kuralı (kurallar sayfasında "organizatör onayı bekliyor").
- [ ] Teslim biçimi: depo linki, demo videosu, sunum dosyası, README şablonu.
- [ ] Jüri ölçütleri ve ağırlıkları (aşağıdaki öneri).
- [ ] Jüri ve mentor isimleri. Onay verenleri `src/data/people.ts` içine `published: true` ile ekle.
- [ ] Ödüller. Kesinleşmeden sitede ödül veya nakit vaadi yok.
- [ ] Sponsorlar. Onaylananları `src/data/sponsors.ts` içine ekle, logoları `public/sponsors/` altına koy.
- [ ] Davranış kuralları ihlali için bildirim kanalı: şu an geçici e-posta. Ayrı bir adres (ör. kurumsal e-posta) ve etkinlikte sorumlu kişi(ler) belirlenmeli.
- [ ] **Gizlilik metni (KVKK aydınlatma metni):** `/tr/gizlilik` ve `/en/privacy`. Veri sorumlusu: TeknoFest ADÜ (organizatör kararı, 8 Kasım 2026). Saklama: KVKK md. 4 ilkesine göre amaç için gereken süre ve mevzuatın öngördüğü süreler; sonra silme/yok etme/anonimleştirme yönetmeliğine göre. KVKK tek bir sabit süre vermiyor; pratikte bir tarih seçilmeli (ör. etkinlikten sonra başvuru verilerinin ne zaman silineceği) ve takvime yazılmalı. Sayfada hâlâ "hukuki gözden geçirme bekliyor" uyarısı var. Metin: `src/content/privacy.ts`.
- [x] **Yaş sınırı:** 18 yaş ve üstü (karar: 8 Kasım 2026). Form ve veritabanı 18 yaş altının başvuru göndermesini engelliyor; rehber, SSS ve gizlilik metninde yazıyor.
- [x] **Başvuru takvimi:** Ocak 2027'de açılır (gün belli değil; admin panelinden "Açık" yapılır), 31 Mart 2027 23:59'da kapanır. Son tarih `settings.application_deadline` ile veritabanında zorunlu; geçince site "kapandı" gösterir. Tarih değişirse `src/lib/dict.ts` ve `src/content/guide.ts` içindeki metinleri de güncelle.
- [ ] **Katılım onayı son tarihi:** Kabul edilenlerin onay vermesi gereken tarih admin panelinden (İçerik) girilir. Boşken son tarih gösterilmez.
- [ ] **Takım kilitleme tarihi:** Takımların hangi saatte kilitleneceği (ör. Cumartesi eşleştirmesinden sonra) admin panelinden girilir.
- [ ] **Başvurudan sonra değiştirilebilen alanlar:** Şu an telefon, tişört, beslenme, acil durum kişisi, linkler, CV ve duyuru izinleri. Değişiklik gerekirse `settings.application_editable_after_submit`.
- [ ] Domain. Alınınca Vercel'de `NEXT_PUBLIC_SITE_URL` ayarla.
- [x] 2025 ve 2026 fotoğraflarının orijinalleri geldi (11 Kasım 2026). `public/img/2025-1..5.jpg` ve `2026-1..5.jpg`, uzun kenar 1600 px, EXIF/konum bilgisi silinmiş. Altyazılar ve alt metinler `src/lib/dict.ts` → `past`. Fotoğraf değiştirmek: dosyayı aynı adla değiştir veya `dict.ts`'teki `src`'yi güncelle.
- [ ] Fotoğraflarda görünen kişilerin sitede yer almaya izni (özellikle yakın plan portreler: `2025-3.jpg`, `2026-4.jpg`, `2026-5.jpg`).
- [x] **Geliştirme süresi:** 24 saat, Cumartesi 12:00 - Pazar 12:00 (karar: 11 Kasım 2026). Varsayılanlar `settings.hack_start` / `settings.submission_deadline` (migration `20261111120000_build_24h.sql`; admin panelinden değiştirilmiş değerlere dokunmaz), `src/data/site.ts` ve site metinleri güncellendi.
- [ ] Program taslağı (`src/data/schedule.ts`, sitede "Taslak program"): Cmt 09:30 kayıt, 11:00 açılış, 12:00 geliştirme, 13:30 öğle, 19:00 akşam, 23:00 gece mini oyunları; Paz 00:00 gece yarısı atıştırmalığı, 08:00 kahvaltı, 12:00 teslim, 12:30 öğle, 13:30 finalist seçimi, 15:30 finalistler, 16:00 final sunumları, 18:15 ödüller. Atölye ve mentorluk saatleri hâlâ yok.
- [ ] Yemek yorumları: gerçek alıntılar ve kişilerden yazılı/mesajla kullanım izni; `src/data/food-reviews.ts`'e `published: true` ile ekle. Yayınlanmış yorum yokken blok sitede görünmez. İngilizce çeviriyi (`quote.en`) sadece kişi kendisi verdiyse ekle.
- [ ] Domain e-postası (ör. iletisim@ alan adı) açılacak. Açılınca `src/data/site.ts` → `contactEmail` tek satır.
- [ ] Sponsorluk paketleri için indirilebilir dosya (PDF) hazırlanırsa partner sayfasına indirme butonu eklenebilir.
- [ ] **Yeni palet (12 Kasım 2026):** Site koyu zemin + kan kırmızısına geçti (turuncu kaldırıldı; renkler `CLAUDE.md` → "Tasarım kimliği"). Instagram, afiş, sponsor dosyası ve design system yeni palete göre güncellenecek.
- [x] **Sponsorluk yönü (12 Kasım 2026):** Paket tablosu yerine "bir kalemi üstlen" öne çıktı. Sponsora açık kalemler: kategori ödülleri, gece mini oyun turnuvası, kahve barı, gece yarısı atıştırmalığı, dinlenme alanı, sahne ve canlı yayın, tişört. Sponsorun adı kalem kartında, programda ilgili satırda ve sahnede anılır. Kalemlerde fiyat yok. Öğle, akşam ve kahvaltı sponsor kalemi olarak gösterilmez. Liste: `src/data/sponsor-items.ts`.
- [ ] Kalemler ile paketler çakışıyor mu? Paketlerde de "Tişört" ve "Adınızla ödül" hakkı var; bir kalemi üstlenen ile paket sponsoru aynı anda olursa kimin adının nerede geçeceği karara bağlanmalı. Bir kalemi birden fazla sponsor üstlenebilir mi?
- [ ] Aydın otogarından ve şehir merkezinden ulaşım bilgisi (sitede "yakında" yazıyor; gelince `src/lib/dict.ts` → `venue.travel`).

## Önerilen jüri ölçütleri (onay bekliyor)

Admin panelinde (Puanlama → Ölçütler) değiştirilebilir. Her ölçüt 1-10 puanlanır; sonuç ağırlıklı ortalamadır. Sitede (kurallar sayfası) ağırlıklar yayınlanmıyor.

| Ölçüt | Önerilen ağırlık | Ne bakılır |
| --- | --- | --- |
| Teknik uygulama | %20 | Çalışıyor mu, 24 saatte ne kadar zor bir iş yapılmış? |
| Etki ve problem | %20 | Problem gerçek mi, çözüm kime ne kazandırıyor? |
| Yenilik | %20 | Fikir ya da yaklaşım yeni mi? |
| Demo ve sunum | %20 | Canlı demo, net anlatım, süreye uyum |
| Tamamlanmışlık ve kullanıcı deneyimi | %20 | Kullanılabilir mi, akış anlaşılır mı? |

İki tur var: finalist seçimi (masalarda; her takıma en az 2 jüri atanır) ve final (sahnedeki ilk 10, online jüri). Kimse etkinlikten gönderilmez; bu cümle kurallar sayfasında açıkça var. Kurallar sayfasındaki ölçüt listesi bu tabloyla aynı değilse, onaydan sonra ikisini eşitle.

- [ ] Ölçütler ve ağırlıklar onayı.
- [ ] Online final jürisinin puanlarını aynı akşam girmesi (MLH için de gerekli).

## MLH

Kaynak: <https://github.com/MLH/mlh-policies/blob/main/member-event-guidelines.md> (2027 sezonu, 1 Temmuz 2026 - 30 Haziran 2027) ve <https://www.mlh.com/event-membership>.

- [ ] **Bölgesel uygunluk:** MLH'nin desteklediği bölgeler Kuzey Amerika, Birleşik Krallık + AB + "seçili diğer Avrupa ülkeleri" ve Asya-Pasifik'in bir kısmı. Türkiye açıkça listelenmiyor; bölge dışı ülkeler onaya tabi. Başvurmadan önce league@mlh.io adresine yazıp teyit et.
- [ ] **İngilizce:** İngilizce web sitesi şart (var: `/en`), etkinlik içi duyuruların İngilizce de yapılması gerekiyor.
- [ ] **Süre:** 24-48 saat, hafta sonu. Geliştirme 24 saat (Cmt 12:00 - Paz 12:00), etkinlik Cumartesi 09:30 - Pazar 18:15 ödüller; uygun.
- [ ] **Jüri ve ödüller son gün tamamlanmalı.** Final jürisi online olsa da değerlendirme ve ödül töreni Pazar akşamı bitmeli. Programda öyle; online jürinin aynı akşam puan vermesi garanti edilmeli.
- [ ] **Gece:** Mekân gece açık kalmalı veya konaklama sağlanmalı. Mekân gece açık, uygun.
- [ ] **Yemek:** Öğün planı ve maliyet kırılımı istenir. Etkinlik öğün saatlerini kapsıyor (Cmt öğle ve akşam, Paz kahvaltı ve öğle, gece atıştırmalık).
- [ ] **Code of Conduct:** MLH Code of Conduct benimsenmeli, herkese açık olmalı ve uygulanmalı; olay olursa MLH ekibi hemen dahil edilir. Sitede link var (footer, rehber, kurallar).
- [ ] **Finalist seçimi:** Kural metninde "kimse gönderilmez, tüm takımlar finali izler" net yazıyor. Koru.
- [ ] **Başvuru formu (görev 3):** MLH'nin zorunlu temel alanları ve iki zorunlu onay kutusu:
  1. MLH Code of Conduct'ı okudum ve kabul ediyorum.
  2. Başvuru bilgilerimin etkinlik yönetimi için MLH ile paylaşılmasına izin veriyorum; MLH Contest Terms and Conditions ve MLH Privacy Policy'yi kabul ediyorum.
  3. (İsteğe bağlı) MLH'den e-posta almayı kabul ediyorum.
  Metinler MLH'nin belgesindeki İngilizce haliyle birebir kullanılmalı; Türkçe çeviri yanında verilebilir.
  **Durum:** Form hazır. Üç kutu `member-event-guidelines.md` içindeki İngilizce metinlerle birebir ekli (TR formda altında çeviri). Admin panelinde `mlh_enabled` açılana kadar hiçbiri görünmez. Form MLH'nin zorunlu alanlarını topluyor (ad, soyad, yaş, e-posta, okul, telefon, ülke, öğrenim düzeyi). MLH formu açıldığında başvurular zaten açıksa, MLH'nin önerdiği "We have applied to be a Major League Hacking (MLH) Member Event..." uyarısını eklemek gerekebilir.
- [ ] **Marka:** Üyelik onaylanınca header'da MLH Season Trust Badge ve partnerler bölümünde MLH logosu zorunlu. Kod hazır: `src/data/site.ts` → `mlh.badge = true`, `badgeHref` ve `badgeImage` (MLH brand guidelines sayfasındaki resmi rozet). Onay gelmeden açma; "Official MLH Event" yazma.

## OpenAI

Kaynak: <https://developers.openai.com/community/hackathons>.

- Sayfa, net bir programı, aktif mentorluğu ve katılımcıların çalışan demo çıkarmasına yönelik planı olan hackathon'ları hedefliyor. Üniversiteler ve öğrenci toplulukları açıkça listelenmiş.
- Etkinlikten **en az bir ay önce** başvur (17 Nisan için en geç Mart ortası; daha erken daha iyi). Başvuru desteği garanti etmiyor.
- Destek etkinliğe göre değişiyor: Codex erişimi, API kredisi, ödül, atölye materyali, mentorluk/jüri, duyuru desteği. Onay gelmeden sitede hiçbirini yazma; "Powered by OpenAI" veya logo yok.

Başvuruda istenecek bilgiler ve sitedeki yerleri:

| Bilgi | Sitedeki yeri | Durum |
| --- | --- | --- |
| Hedef kitle | Ana sayfa "Etkinlik", partner sayfası "Hedef kitle" | Var |
| Format (süre, takım yapısı) | Ana sayfa "Etkinlik", kurallar sayfası | Var |
| Program | Ana sayfa "Program", rehber "Etkinlik günü akışı" | Taslak |
| Mentorluk planı | Yok | Karar gerekiyor |
| Jüri yapısı | Kurallar "Değerlendirme" (akademisyen + kurucu, final online) | İsimler yok |
| Demo hedefi | Kurallar "Değerlendirme" (masalarda demo, finalde sahne) | Teslim biçimi taslak |
| Organizasyon hazırlığı | Partner sayfası "Organizatör", "Geçmiş edisyonlar" | Var |
| Hedef katılımcı ve proje sayısı | 100+ öğrenci (hedeflenen) | Proje sayısı hedefi yok; 3-5 kişilik takımlarla yaklaşık 20-33 proje |
