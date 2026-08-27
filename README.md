# Tatildokya Travels

Astro + Supabase tabanlı çok dilli tur, rezervasyon ve içerik sitesi.

## Gereksinimler

- Node.js 22.12 veya üzeri
- npm
- Supabase projesi
- Vercel (production deployment için mevcut adapter)

## Temiz kurulum

```bash
cp .env.example .env
npm ci
npm run dev
```

> `node_modules`, `dist`, `.astro` ve `.vercel` kaynak pakete dahil edilmemelidir. Farklı işletim sisteminden kopyalanmış `node_modules` native dependency hatalarına yol açabilir; her ortamda `npm ci` ile yeniden kurulmalıdır.

## Komutlar

```bash
npm run dev              # geliştirme sunucusu
npm run build            # SEO audit + sitemap + production build
npm run preview          # production build önizleme
npm run clean            # build/cache çıktısını temizle
npm run verify           # temizle + production build
npm run seo:audit        # SEO audit üret
npm run sitemap:generate # sitemap üret
npm run seo:sync         # SEO verilerini senkronize et
```

## Environment variables

Örnek ve açıklamalar `.env.example` dosyasındadır. `RESEND_*` ve `CALLMEBOT_*` değerleri yalnızca server-side kullanılmalıdır ve repoya yazılmamalıdır.

## Ana klasörler

- `src/` — Astro sayfaları, componentler ve client/server scriptleri
- `public/` — statik görseller, sitemap ve public dosyalar
- `supabase/` — veritabanı migration/schema dosyaları
- `scripts/` — SEO, sitemap ve bakım scriptleri
- `reports/archive/` — geçmiş audit/QA raporları

## Deployment notu

ZIP içinden gelen `node_modules` kullanılmamalıdır. Vercel veya Linux CI ortamında temiz `npm ci` çalıştırılmalı ve ardından `npm run build` kullanılmalıdır.
