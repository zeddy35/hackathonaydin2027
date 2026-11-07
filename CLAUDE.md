# Hackathon Aydın 2027 sitesi

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4. TR/EN, tek açık tema. Repo herkese açık.

## Komutlar

```bash
npm run dev            # http://localhost:3000 → /tr veya /en
npx tsc --noEmit       # tip kontrolü
npm run build          # üretim build'i
SPONSORS_EXAMPLE=1 npm run dev   # sponsor yerleşimini örnek veriyle dene (sadece dev)
```

`npm run lint` şu an yapılandırılmamış (ESLint kurulu değil, `next lint` etkileşimli kurulum soruyor).

## Yapı

- `src/middleware.ts`: dil seçimi (cookie → ülke → tarayıcı dili) ve `/` → `/tr|/en` yönlendirmesi.
- `src/app/[lang]/layout.tsx`: header, footer, metadata. `src/app/[lang]/page.tsx`: ana sayfa (9 bölüm).
- `src/app/[lang]/[slug]/page.tsx`: yardımcı sayfalar. Slug eşlemesi `src/lib/routes.ts` (`rehber/guide`, `kurallar/rules`, `partner/partners`, görev 3 için `basvuru/apply`). Diğer dilin slug'ı doğru olana yönlendirilir.
- `src/lib/dict.ts`: ortak ve ana sayfa metinleri, sponsorluk paketleri. `src/content/*.ts`: yardımcı sayfa metinleri.
- `src/data/`: tipli içerik (`site.ts`, `sponsors.ts`, `people.ts`, `schedule.ts`). Bileşenler veriyi sadece `src/data/index.ts` içindeki async getter'lardan alır; görev 4'te bunlar veritabanına bağlanacak.
- `src/lib/seo.ts`: canonical/hreflang. Site adresi `NEXT_PUBLIC_SITE_URL`, yoksa `https://hackathonaydin.vercel.app`.
- `docs/organizator-notlari.md`: eksik bilgiler, kararlar, MLH/OpenAI hazırlığı.

## Sık güncellenenler

- Başvuru durumu: `src/data/site.ts` → `application.status` (`upcoming` | `open` | `closed`).
- Sponsorlar: `src/data/sponsors.ts` (`published: true` olmayan görünmez), logolar `public/sponsors/`.
- Jüri/mentor: `src/data/people.ts`. Boşsa bölüm render edilmez.
- MLH rozeti: `src/data/site.ts` → `mlh` (onay gelmeden `badge: false`).

## Kurallar

- Doğrulanmamış bilgi yazma. Bilinmeyen için "yakında" / "Ocak'ta açıklanacak" de. Hedefleri "hedeflenen", taslakları "taslak" diye etiketle.
- Temayı hiçbir dosyaya, koda veya commit mesajına yazma, tahmin etme, ipucu verme.
- Em dash (—) kullanma.
- Her görünür metin iki dilde olmalı.
- Sahte sponsor, jüri, ödül, proje veya "Official MLH Event" / "Powered by OpenAI" yok.
- Fotoğraflar `public/img/` altında; `stage.jpg`, `winners.jpg`, `builder.jpg` 480 px, büyütme.
- İçerik animasyona bağlı olmasın (opacity 0'da bekleyen içerik yok); `prefers-reduced-motion` desteklenir.
- `.env.local` commit'lenmez.
