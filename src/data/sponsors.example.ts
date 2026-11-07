import type { Sponsor } from "./types";

/**
 * EXAMPLE DATA. Not real sponsors. Used only in `next dev` when
 * SPONSORS_EXAMPLE=1 is set, to test the sponsor layout. Never loaded in a
 * production build (see src/data/index.ts).
 */
const logo = (w: number, h: number, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="6" fill="#171717"/><text x="50%" y="56%" font-family="sans-serif" font-size="${Math.round(h * 0.32)}" fill="#fff" text-anchor="middle">${label}</text></svg>`
  )}`;

export const exampleSponsors: Sponsor[] = [
  { id: "ex-title", name: "Örnek Ana Sponsor", tier: "title", logo: logo(480, 120, "ÖRNEK ANA"), url: "https://example.com", order: 1, published: true },
  { id: "ex-g1", name: "Örnek Altın Bir", tier: "gold", logo: logo(300, 100, "ALTIN 1"), url: "https://example.com", order: 1, published: true },
  { id: "ex-g2", name: "Örnek Altın İki", tier: "gold", logo: logo(120, 120, "A2"), url: "https://example.com", order: 2, published: true },
  { id: "ex-g3", name: "Örnek Altın Üç Uzun İsimli Şirket Anonim Şirketi", tier: "gold", logo: null, url: "https://example.com", order: 3, published: true },
  { id: "ex-s1", name: "Örnek Gümüş", tier: "silver", logo: logo(400, 80, "GÜMÜŞ"), url: "https://example.com", order: 1, published: true },
  { id: "ex-s2", name: "Gümüş İki", tier: "silver", logo: logo(160, 160, "G2"), url: "https://example.com", order: 2, published: true },
  { id: "ex-k1", name: "Örnek Ayni Destekçi", tier: "inkind", logo: null, url: "https://example.com", order: 1, published: true },
  { id: "ex-t1", name: "Örnek Teknoloji", tier: "tech", logo: logo(240, 80, "TECH"), url: "https://example.com", order: 1, published: true },
  { id: "ex-c1", name: "Örnek Topluluk", tier: "community", logo: null, url: "https://example.com", order: 1, published: true },
  { id: "ex-hidden", name: "Yayınlanmamış", tier: "gold", logo: null, url: "https://example.com", order: 9, published: false },
];
