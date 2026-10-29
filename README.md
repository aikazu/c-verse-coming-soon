# CreatorVerse — Coming Soon

Halaman coming soon satu layar untuk **CreatorVerse** di https://c-verse.co,
mengikuti brand guideline Edisi 02 (2026-10-26).

## Run

```bash
cd C:/Users/iqbal/Work/C-Verse/01_Coming_Soon
npm ci
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # http://localhost:4173
```

## Tampilan

- **Identitas**: lockup horizontal dan simbol CreatorVerse dipakai dari master
  PNG di `public/brand/` (bentuk hitam pada alpha), dirender lewat CSS mask
  (`.brand-logo`, `.brand-symbol`) sehingga warnanya mengikuti `currentColor`.
  Wordmark tidak pernah diketik ulang; teks baca `CreatorVerse` ada di `.sr-only`.
  Ruang bebas 0,25 H dijaga lewat padding; tinggi lockup minimum 40 px di 375 px.
- **Warna**: hitam `#171717` sebagai bidang, lime `#CCFF66` satu-satunya aksen
  (logo, grid, bar EQ), abu-abu `#CCCCCC` untuk teks sekunder dan garis, putih
  untuk judul. Oranye `#FF6633` tidak dipakai di halaman ini.
- **Tipografi**: Inter (Google Fonts, `opsz,wght@14..32,400..800`) untuk semua
  teks. Judul Bold, status SemiBold, isi Regular.
- **Teks** (Bahasa Indonesia, suara brand jelas, percaya diri, menghargai):
  topbar `Jakarta · jam WIB` dan status `Segera hadir`; hero lockup, judul
  `Karya favoritmu. Jadi koleksimu.`, isi `C.Card fisik edisi terbatas dari
  kreator di C.Verse. Situs kami segera hadir.`; footer `© 2026 CreatorVerse`
  dan tombol `Suara: aktif / nonaktif`. Tidak ada klaim yang belum bisa
  ditunjukkan produk.
- **Scene Three.js**: grid horizon, 32 bar equalizer (reaktif ke audio saat
  suara aktif), siluet gunung, kubah bintang, bintang jatuh, partikel, dan
  parallax mouse/sentuh/gyro dipertahankan tetapi diwarnai ulang ke palet brand
  (lime dan abu-abu di atas hitam; tanpa cyan, magenta, ungu). Jet, CRT
  scanline, flip judul Jepang, efek glitch, dan typewriter dihapus. Intro fade
  memakai animasi CSS. `prefers-reduced-motion: reduce` menampilkan satu frame
  statis tanpa intro.
- **Audio**: `public/audio/ambient.mp3` + `ambient.ogg` dibundel ke `dist/audio/`
  (~3,6 MB). Tombol `Suara` menyimpan pilihan di `localStorage`
  (`cverse_sound`, `cverse_music`).

## Aset brand

Favicon (`favicon.ico` 16/32/48, `favicon-16x16.png`, `favicon-32x32.png`),
`apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`,
`og-image.png` (1200×630), dan `public/brand/*.png` dibuat dari master logo di
Dream `40_operations/brand/` oleh `scripts/brand-assets.py` (pendekatan yang sama
dengan `Platform/scripts/brand-assets.py`): simbol atau lockup hitam di atas lime.
Master hanya tersedia sebagai PNG, jadi `favicon.svg` dan `og-image.svg` lama
dihapus. `site.webmanifest` memakai `#171717` untuk theme dan background.

```bash
python -I scripts/brand-assets.py C:/Users/iqbal/Work/C-Verse/00_Dream_Project/40_operations/brand
```

Membutuhkan Python 3 dan Pillow. Jalankan ulang hanya jika master berubah;
hasilnya dikomit.

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
Buka situs di browser dan periksa animasi serta tombol Suara tanpa login.
Cloudflare JavaScript Detection dapat menyisipkan script ke HTML pada domain
utama, sehingga hash respons HTML dapat berbeda dari `dist/index.html`.
Pada migrasi ini audio dilayani sebagai file lengkap (`200`), termasuk ketika
klien meminta byte range; kontrol play/pause sudah diverifikasi di browser.

## Stack

Vite 5 · Three 0.160 · Inter (Google Fonts).

## Sumber

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
