# Hackathon Aydın 2027 sitesi

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4. TR/EN, tek açık tema. Repo herkese açık.

## Komutlar

```bash
npm run dev            # http://localhost:3000 → /tr veya /en
npx tsc --noEmit       # tip kontrolü
npm run build          # üretim build'i
SPONSORS_EXAMPLE=1 npm run dev   # sponsor yerleşimini örnek veriyle dene (sadece dev)
npm run test:db        # migration'lar + RLS ve uçtan uca SQL testleri (PGlite, Docker gerekmez)
```

`npm run lint` şu an yapılandırılmamış (ESLint kurulu değil, `next lint` etkileşimli kurulum soruyor).

## Yapı

- `src/middleware.ts`: dil seçimi (cookie → ülke → tarayıcı dili) ve `/` → `/tr|/en` yönlendirmesi.
- `src/app/[lang]/(site)/`: herkese açık site. `layout.tsx` header, footer, açılış animasyonu, metadata; `page.tsx` ana sayfa (9 bölüm).
- `src/app/[lang]/(site)/[slug]/page.tsx`: yardımcı sayfalar. Slug eşlemesi `src/lib/routes.ts` (`rehber/guide`, `kurallar/rules`, `partner/partners`, `gizlilik/privacy`). Diğer dilin slug'ı doğru olana yönlendirilir.
- `src/app/[lang]/(app)/`: ayrı kök layout, site header/footer'ı yok (sadece logo). `panel/`: katılımcı paneli (başvuru, onay, QR, takım, teslim) ve server action'ları. `giris|login`: giriş. URL'ler değişmedi (`/tr/panel`, `/tr/giris`).
- `src/app/admin/`: yönetim paneli (TR). Her sayfa `requireRole`, her action `assertRole` (`src/lib/auth.ts`) ile rolü sunucuda kontrol eder. Kılavuz: `docs/admin-kilavuzu.md`.
- `supabase/migrations/`: şema, RLS, tetikleyiciler. `supabase/tests/`: SQL testleri. `supabase/seed.dev.sql`: sadece yerel sahte veri.
- `src/emails/`: e-posta şablonları (TR/EN). `src/lib/email.ts`: Resend; anahtar yoksa gönderim atlanır ve loglanır.
- `src/lib/dict.ts`: ortak ve ana sayfa metinleri, sponsorluk paketleri. `src/content/*.ts`: yardımcı sayfa metinleri.
- `src/data/`: içerik getter'ları (`src/data/index.ts`). Ayarlar, sponsorlar ve jüri/mentorlar Supabase'den okunur (`revalidateTag("content")` ile yenilenir). `site.ts`, `sponsors.ts`, `people.ts` veritabanı yokken kullanılan varsayılanlar; `schedule.ts` hâlâ dosyada.
- `src/lib/seo.ts`: canonical/hreflang. Site adresi `NEXT_PUBLIC_SITE_URL`, yoksa `https://hackathonaydin.vercel.app`.
- `docs/organizator-notlari.md`: eksik bilgiler, kararlar, MLH/OpenAI hazırlığı.

## Sık güncellenenler

Hepsi admin panelinden (`/admin/icerik`), koda dokunmadan:
- Başvuru durumu (`upcoming` | `open` | `closed`), açılış yazısı, geliştirme başlangıcı, teslim son saati, onay son tarihi, takım kilidi.
- Sponsorlar ve jüri/mentorlar (yayında olmayan görünmez; jüri/mentor boşsa bölüm render edilmez).
- MLH bayrakları: `mlh_enabled` (form alanları), `mlh_badge` (header rozeti). Onay gelmeden açılmaz.
- Başvuru son tarihi (31 Mart 2027 23:59): `/admin/icerik`. Değişirse `dict.ts` ve `guide.ts` metinlerindeki tarihi de güncelle.
- Program taslağı: `src/data/schedule.ts` (yemek/gece kalemleri `kind: "break"`, gece kalemleri `night: true`). Geliştirme 24 saat (Cmt 12:00 - Paz 12:00), final sunumları Paz 16:00-18:15.
- Yemek yorumları: `src/data/food-reviews.ts`. Sadece gerçek alıntı ve izinle, `published: true`; yayınlanmış yorum yoksa blok görünmez.
- İletişim e-postası: `src/data/site.ts` → `contactEmail`.

## Kurallar

- Doğrulanmamış bilgi yazma. Bilinmeyen için "yakında" / "Ocak'ta açıklanacak" de. Hedefleri "hedeflenen", taslakları "taslak" diye etiketle.
- Temayı hiçbir dosyaya, koda veya commit mesajına yazma, tahmin etme, ipucu verme.
- Em dash (—) kullanma.
- Her görünür metin iki dilde olmalı (admin paneli hariç: sadece Türkçe).
- Sahte sponsor, jüri, ödül, proje veya "Official MLH Event" / "Powered by OpenAI" yok.
- Fotoğraflar `public/img/` altında (`2025-*.jpg`, `2026-*.jpg`, 1600 px, EXIF silinmiş; `og.jpg` 1200x630). Listesi ve altyazıları `dict.ts` → `past`. Yeni fotoğrafı EXIF'siz ve döndürülmüş kaydet (sharp `.rotate()`), konum bilgisi repoya girmesin.
- İçerik animasyona bağlı olmasın (opacity 0'da bekleyen içerik yok); `prefers-reduced-motion` desteklenir.
- `.env.local` commit'lenmez. `SUPABASE_SERVICE_ROLE_KEY` sadece sunucuda (`src/lib/supabase/admin.ts`, `server-only`).
- Yetki kontrolü veritabanında (RLS + tetikleyiciler) ve sunucuda; arayüzde gizlemek yetmez. Yeni tablo eklersen RLS'i aç ve `supabase/tests/`'e test ekle.
