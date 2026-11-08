# Teslim raporu (görev 1-5)

Tarih: 8 Kasım 2026. Dal: `overnight/2026-11-07`. Push ve deploy yapılmadı.

## 1. Uygulanan değişiklikler

**Görev 1, site:** 9 bölümlü ana sayfa, mobil menü, rehber / kurallar / partner sayfaları, TR/EN, tipli veri katmanı, `CLAUDE.md`, organizatör notları.

**Görev 2, altyapı:** Supabase (Postgres, Auth, Storage, RLS). Roller: `participant`, `judge`, `admin`, `owner`. Giriş: e-posta linki ve Google. Şema ve kurallar `supabase/migrations/` altında; her tabloda RLS açık. Owner kuralları, durum geçişleri ve takım sınırı veritabanı tetikleyicilerinde.

**Görev 3, katılımcı paneli (`/tr/panel`, `/en/panel`):**
- Başvuru formu: taslak kaydetme, gönderme, istemci ve sunucuda aynı doğrulama (zod), hatalar alanlara `aria-describedby` ile bağlı.
- Onaylar ayrı ayrı ve zaman damgalı. MLH kutuları `mlh_enabled` açılana kadar görünmez; metinler MLH'nin resmî İngilizce ifadeleri.
- 18 yaş altı engellenmez, işaretlenir (`is_minor`).
- Kabul → onay / katılamayacağım (son tarih destekli) → check-in QR kodu.
- Takım kur (8 karakterlik kod), koda katıl, ayrıl, eşleştirme isteği; en fazla 5 kişi veritabanında.
- Proje teslimi: sadece check-in yapan takım üyeleri, sunucu saatiyle pencere içinde; GitHub repo herkese açık mı kontrolü.
- E-postalar (`src/emails/`): alındı, kabul, yedek, ret, onay (QR ekli), hatırlatma, teslim alındı. Anahtar yoksa gönderim atlanır, ekranda "gönderildi" denmez.
- Taslak KVKK aydınlatma metni: `/tr/gizlilik`, `/en/privacy`.

**Görev 4, yönetim paneli (`/admin`, Türkçe):** genel bakış, başvurular (filtre, toplu karar, notlar, CV linki, CSV, MLH ve duyuru listesi dışa aktarma), takımlar ve eşleştirme, telefonda QR check-in, jüri atama ve puanlama (`/admin/juri`), sonuçlar ve finalist seçimi, içerik (başvuru durumu, tarihler, sponsorlar, jüri/mentorlar, MLH bayrakları), hesaplar (davet, rol, devre dışı bırakma), işlem geçmişi, toplu e-posta. Kılavuz: `docs/admin-kilavuzu.md`. Site ayarları, sponsorlar ve kişiler artık veritabanından okunuyor; veritabanına ulaşılamazsa varsayılan ayarlar ve boş listeler (sahte veri yok).

## 2. Yerelde çalıştırma ve önizleme

```bash
npm install
cp .env.example .env.local   # Supabase değerlerini doldur
npm run dev                  # http://localhost:3000
npm run test:db              # migration'lar + SQL testleri (Docker gerekmez)
```

Panel ve admin için Supabase projesinde migration'lar uygulanmış olmalı (bkz. 7).

## 3. Çalıştırılan kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npx tsc --noEmit` | Hatasız |
| `npm run build` | Başarılı, uyarı yok. Canlı Supabase'de tablolar henüz olmadığı için build sırasında "settings unavailable, using defaults" logları çıkıyor; beklenen davranış. |
| `npm run lint` | Yapılandırılmamış (ESLint kurulu değil) |
| `npm run test:db` | 130 kontrol geçti: RLS (70) ve uçtan uca akış (60). `seed.dev.sql` temiz uygulanıyor. |
| Playwright, 1440/768/390/320 px, 15 sayfa (TR/EN site, giriş, panel ve admin bileşenleri) | Yatay taşma yok, konsol hatası yok |
| axe-core (WCAG 2.1 A/AA), 1440 ve 390 px | İhlal yok (logo ve dil linkinin erişilebilir adı düzeltildikten sonra) |
| `prefers-reduced-motion` | Görünmez kalan içerik yok |
| Tek h1, başlık sırası, canonical, hreflang, Open Graph | Tüm sayfalarda doğru; giriş sayfaları `noindex` |
| Dokunma hedefleri (390 px) | 44 px altı hedef yok (footer e-posta linki ve "paketleri karşılaştır" linki büyütüldü) |
| Başvuru durumu `upcoming` / `open` / `closed` | Butonlar doğru hedefe gidiyor; `open` iken "Başvur" panele, giriş yapılmamışsa girişe yönlendiriyor |
| Sponsor ve jüri bölümü boş / dolu | İkisi de doğru render ediliyor |
| Geri sayım öncesi / sırası / sonrası (saat taklidi) | Doğru metinler |
| Mobil menü | Klavye ile açılıyor, Escape kapatıyor, odak düğmeye dönüyor |
| Dil değişimi | Her sayfada karşılığına gidiyor |
| İç ve dış linkler | 21 benzersiz link, hepsi 200 |
| `service_role` ve Resend anahtarı istemci paketinde mi | Değil (sahte anahtarla build edilip `.next/static` tarandı) |
| `.env*` git'te mi | Sadece `.env.example` |
| Repo'da tema, kişisel telefon, iç bütçe | Bulunmadı |
| Em dash | Yok |
| Sayılar ve iddialar | 2025: 36 öğrenci / 12 takım, 2026: 57 / 20, 3-5 kişi, 28 saat, Tıp Fakültesi, 100+ "hedeflenen" etiketli. MLH ve OpenAI için onay varmış gibi bir ifade yok. |
| MLH bayrağı kapalıyken | Formda MLH kutusu, header'da rozet yok |

**Test edilemeyenler:** Supabase migration'ları canlı projeye uygulanmadığı ve Docker olmadığı için giriş yapmış kullanıcıyla tarayıcıdan uçtan uca akış (gerçek magic link, gerçek e-posta, kamera ile QR okuma) çalıştırılmadı. Aynı akış veritabanı seviyesinde (`supabase/tests/flow_test.sql`) baştan sona test edildi ve panel/admin bileşenleri ayrı bir önizleme sayfasında tarayıcıda kontrol edildi.

## 4. Eksik bilgiler ve kararlar

`docs/organizator-notlari.md` içinde. Yeni eklenenler: yaş sınırı ve veli izni, KVKK metninin onayı (veri sorumlusu unvanı, saklama süresi), katılım onayı son tarihi, takım kilitleme saati, jüri ölçütleri ve ağırlıkları.

## 5. MLH ve OpenAI için kalanlar

- MLH: bölge uygunluğunu league@mlh.io ile teyit et; onaydan sonra admin panelinden `mlh_enabled` ve rozeti aç. MLH dışa aktarma şablonu hazır. Proje teslim alanlarını MLH'nin istediği alanlarla karşılaştır (mlh.link/projectdata).
- OpenAI: etkinlikten en az bir ay önce başvur; mentorluk planı hâlâ eksik.

## 6. Nereden ne güncellenir

`/admin/icerik`: başvuru durumu, açılış yazısı, tarihler, MLH bayrakları, sponsorlar, jüri ve mentorlar. Program taslağı: `src/data/schedule.ts`. Metinler: `src/lib/dict.ts`, `src/content/`.

## Organizatör kararları (8 Kasım 2026, sonradan eklendi)

- Yaş sınırı 18+: formda ve veritabanında zorunlu.
- Başvurular Ocak 2027'de açılır, 31 Mart 2027 23:59'da kapanır: `application_deadline` ayarı, veritabanında zorunlu, site metinlerinde yazıyor.
- Veri sorumlusu TeknoFest ADÜ; saklama süresi KVKK md. 4 ve silme/yok etme/anonimleştirme yönetmeliğine göre.
- Jüri ölçütleri: bekliyor.
- Ek migration: `supabase/migrations/20261108120000_deadline_age.sql` (SQL editöründe çalıştırılmalı).

## 7. Yayına almadan önce

1. Supabase SQL editöründe sırayla çalıştır: `supabase/migrations/20261107120000_init.sql`, `20261108090000_panel_admin.sql`, `20261108090100_storage.sql`.
2. Supabase Auth → URL Configuration: Site URL ve redirect URL'leri (`http://localhost:3000/**`, Vercel önizleme ve üretim adresleri).
3. Vercel ortam değişkenleri: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAILS`, `NEXT_PUBLIC_SITE_URL`.
4. Resend: domain doğrula, `EMAIL_FROM` o domainden olsun.
5. Domain alınınca `NEXT_PUBLIC_SITE_URL`.
6. `OWNER_EMAILS` adresiyle bir kez giriş yap, owner olduğunu `/admin`'de kontrol et.
