# C.Verse — Coming Soon

Hero-only arcade coming soon untuk **C.Verse** — **CREATOR / VERSE — REVOLUTION**.

## Run

```bash
cd C:/Users/iqbal/Projects/01_Coming_Soon
npm ci
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # http://localhost:4173
```

## Apa yang ada

- **Hero**: `CREATOR` / `VERSE` flip ke `クリエイター` / `の世界` (neon frame per huruf), `REVOLUTION`, `COMING SOON` typewriter + cursor. `ARCADE MODE · READY` pill, clock, `SOUND` toggle.
- **Vapor horizon + EQ**: neon grid, low-poly mountains, 32 bar equalizer bumpy bottom→top beat-reactive (idle muted, play jadi blue fire), star dome, shooting stars, jet kecil, particles/bokeh, CRT+vignette.
- **Motion**: mouse/touch X+Y + gyro full 2D parallax, camera Z breathing + lookAt, ring/light/particles reaktif ke `bass/kick`.
- **Audio**: `public/audio/ambient.mp3` + `ambient.ogg` bundled ke `dist/audio/` (~3.6 MB drop). Bisa dipisah ke R2/S3 kalau mau.

## Deploy (Cloudflare Workers)

Situs publik di **https://c-verse.co**, dilayani Worker `c-verse-coming-soon`
melalui Workers Static Assets. Tidak memakai Cloudflare Access atau syarat WARP.
`wrangler.jsonc` menyimpan konfigurasi deploy dan kedua Custom Domain.

```bash
npx wrangler whoami # account 0252b83dcbeac8879add5c278fbc342d
npm run cf:check    # build Vite + dry-run deployment
npm run cf:types    # generated types di .wrangler/, tidak dikomit
npm run deploy     # build ulang + deploy ke kedua Custom Domain
```

Wrangler perlu login ke akun Cloudflare yang memiliki zone `c-verse.co`.
Tidak ada backend, database, atau secret aplikasi. URL `workers.dev` dan preview
dinonaktifkan; domain utama tetap publik. Deploy dijalankan melalui perintah di
atas; integrasi auto-deploy Git Cloudflare belum dikonfigurasi.

### DNS dan redirect

- `c-verse.co` dan `www.c-verse.co` memakai Custom Domain ke Worker yang sama.
  Record DNS proxied dikelola Cloudflare.
- Ruleset `7f4828f4b0ef427fa5e1a3249bb6a18d` di zone
  `63f1ca27663135365e0467619dac4ce5` mempertahankan redirect `www` ke apex
  (`307`) dan mengalihkan HTTP apex ke HTTPS (`308`), termasuk path dan query.
  Payload disimpan di `cloudflare/www-redirect.json`; ruleset ini dikelola terpisah
  dari `wrangler deploy` melalui Cloudflare Rules/API. Update ruleset yang ada,
  bukan membuat ruleset fase yang sama lagi.
- Redirect `c-verse.id` dan `www.c-verse.id` ke `https://c-verse.co` (`301`)
  tetap memakai ruleset zone `.id` yang sudah ada.

### Verifikasi setelah deploy

Periksa root `200`, `www` redirect dengan path/query utuh, aset JS/CSS, favicon,
OG image, dan kedua file audio. Path yang tidak ada tetap `404`.
Buka situs di browser dan periksa animasi serta kontrol SOUND tanpa login.
Cloudflare JavaScript Detection dapat menyisipkan script ke HTML pada domain
utama, sehingga hash respons HTML dapat berbeda dari `dist/index.html`.
Pada migrasi ini audio dilayani sebagai file lengkap (`200`), termasuk ketika
klien meminta byte range; kontrol play/pause sudah diverifikasi di browser.

## Stack

Vite 5 · Three 0.160 · GSAP 3 · Noto Sans JP.

## Sumber

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
