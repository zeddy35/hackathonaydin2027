# Hackathon Aydın 2027 sitesi

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4. TR/EN. Herkese açık site koyu "night" görünümünde (`html.night`, `globals.css`); panel, giriş ve admin açık renk token'larında. Repo herkese açık.

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
- Site tasarımı: koyu tema, tek vurgu rengi kan kırmızısı. Renkler `globals.css` içinde `html.night` (varsayılan) ve `html.day` token'larında; bileşenlerde sabit renk kodu yok. Ayrıntı aşağıda, "Tasarım kimliği".
- Hero: `Hero.tsx` + `RedPen.tsx` (ikinci satırın üstündeki kırmızı kalem çizgisi) + `Countdown.tsx` + `Marquee.tsx`; program çubuğu `BuildRuler.tsx` (`Schedule.tsx` içinde). Kaydırma animasyonları saf CSS (`.reveal`, `.reveal-x`), içerik hiçbir zaman tamamen gizlenmez.
- `src/lib/dict.ts`: ortak ve ana sayfa metinleri, sponsorluk paketleri. `src/content/*.ts`: yardımcı sayfa metinleri.
- `src/data/`: içerik getter'ları (`src/data/index.ts`). Ayarlar, sponsorlar ve jüri/mentorlar Supabase'den okunur (`revalidateTag("content")` ile yenilenir). `site.ts`, `sponsors.ts`, `people.ts` veritabanı yokken kullanılan varsayılanlar; `schedule.ts` hâlâ dosyada.
- `src/lib/seo.ts`: canonical/hreflang. Site adresi `NEXT_PUBLIC_SITE_URL`, yoksa `https://hackathonaydin.vercel.app`.
- `docs/organizator-notlari.md`: eksik bilgiler, kararlar, MLH/OpenAI hazırlığı.

## Tasarım kimliği

Koyu tema (`html.night`). Değerler `src/app/globals.css` içinde; Tailwind sınıfları `@theme inline` ile bu token'lara bağlı (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `border-rule`, `bg-accent`, `text-accent-ink`, `bg-accent-deep`, `bg-accent-tint`, `text-on-accent`).

| Token | Değer | Kullanım |
| --- | --- | --- |
| `--bg` | `#0E0C0C` | Sayfa zemini |
| `--surface` | `#171414` | Kartlar, navbar kapsülü |
| `--rule` | `#2A2424` | Kenarlıklar, ayraçlar |
| `--ink` | `#F5F1EA` | Ana metin |
| `--ink-muted` | `#A8A29A` | İkincil metin |
| `--accent` | `#D7263D` | Ana kırmızı: butonlar, "AYDIN", kayan bant, büyük sayılar |
| `--accent-deep` | `#8A0303` | Marka kırmızısı: detaylar, hover gölgesi, program çubuğu gradyanı |
| `--accent-ink` | `#EF4D62` | Küçük kırmızı metin (koyu zeminde 4.5:1 için) |
| `--accent-tint` | `rgb(215 38 61 / 0.14)` | Aktif nav zemini, rozetler |
| `--on-accent` | `#FFFFFF` | Kırmızı zemin üstündeki metin |

- Fontlar: Anton (`.poster`, büyük harf condensed başlıklar), Inter (gövde), JetBrains Mono (etiket, buton, sayaç).
- Kırmızı dışında vurgu rengi yok. Turuncu, amber, sarı ve Claude benzeri turuncu/terrakota tonlarından kaçın (admin panelindeki durum rozetleri hariç).
- `--accent` koyu zeminde 3.93:1; sadece büyük yazı ve dolgu için. Küçük kırmızı metin `text-accent-ink`.
- Açık varyant (`html.day`, `ThemeToggle.tsx`) aynı token adlarını kullanır. Palet değişirse `src/app/icon.svg` ve `(site)/layout.tsx` içindeki `themeColor` da güncellenir.

## Sık güncellenenler

Hepsi admin panelinden (`/admin/icerik`), koda dokunmadan:
- Başvuru durumu (`upcoming` | `open` | `closed`), açılış yazısı, geliştirme başlangıcı, teslim son saati, onay son tarihi, takım kilidi.
- Sponsorlar ve jüri/mentorlar (yayında olmayan görünmez; jüri/mentor boşsa bölüm render edilmez).
- MLH bayrakları: `mlh_enabled` (form alanları), `mlh_badge` (header rozeti). Onay gelmeden açılmaz.
- Başvuru son tarihi (31 Mart 2027 23:59): `/admin/icerik`. Değişirse `dict.ts` ve `guide.ts` metinlerindeki tarihi de güncelle.
- Program taslağı: `src/data/schedule.ts` (yemek/gece kalemleri `kind: "break"`, gece kalemleri `night: true`). Geliştirme 24 saat (Cmt 12:00 - Paz 12:00), final sunumları Paz 16:00-18:15.
- Sponsora açık kalemler ("Bir kalemi üstlen", ana sayfa ve partner sayfası): `src/data/sponsor-items.ts`. Anlaşma kesinleşince `by` alanına sponsorun adını yaz; kartta ve programdaki ilgili satırda görünür. Fiyat yazılmaz. Öğle, akşam ve kahvaltı sponsor kalemi değildir.
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
