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
  Ruang bebas 0,25 H dijaga lewat padding; tinggi lockup minimum 44 px (52 px di 375 px).
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
dengan `Platform/scripts/brand-assets.py`): simbol atau lockup tinta `#181818` di atas lime.
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

## Deck kreator: join.c-verse.co

Versi web interaktif dari deck kolaborasi kreator (Dream
`40_operations/decks/creator-20261031/`). Naskah dan angka mengikuti
`build_deck.py` deck tersebut; perubahan isi dilakukan di kedua tempat.
Kode ada di `join/` dan dibangun terpisah dari halaman Coming Soon; Worker
`join/worker.js` hanya mengalihkan HTTP ke HTTPS lalu melayani aset.

```bash
npm run dev:join       # http://localhost:5175
npm run test:join      # aturan angka: 30%/15% dibulatkan ke bawah, 7,5%/5% dan fee Seed 15% ke atas
npm run cf:check:join  # build ke dist-join/ + dry-run Worker c-verse-join
npm run deploy:join    # build ulang + deploy ke Custom Domain join.c-verse.co
```

- **Isi**: layar pertama memilih jalur kreator atau ilustrator, dengan tombol
  ganti peran dan navigasi kembali browser. Jalur kreator mempertahankan 10 slide
  layar penuh (snap pada layar >= 960 x 680 px, gulir bebas pada layar kecil),
  tombol, panah, titik slide, dan tautan lama seperti `#s5`. Jalur ilustrator
  menjelaskan peran dan perhitungan kolaborasi. Kedua jalur menampilkan contoh
  Nekonoi Katsu dan Clarissa Punipun (ilustrasi Riryeee) serta Hezky Joe
  (ilustrasi Kang Cilok’s); contoh tidak menyatakan izin publikasi atau rilis.
- **Interaksi**: kartu sampul miring mengikuti pointer, kartu slide 2 dapat
  dibalik, kalkulator contoh Seed (fee 15%), rilis perdana (30%, atau 15% + 15%
  bersama ilustrator), dan royalti (7,5%, atau 5% + 5%), serta tombol salin
  contoh balasan. Rumus ada di `join/src/economy.js`, sama dengan
  `Platform/packages/shared/src/economy.ts`. Harga rilis perdana tetap 30 C.Coin per kartu. Jumlah kartu, harga jual
  kembali, dan jumlah penjualan pada kalkulator diberi label contoh.
- **Brand**: empat warna guideline saja, satu aksen per slide (lime dan oranye
  tidak bersama), teks pada hitam memakai abu-abu `#CCCCCC` seperti deck PDF,
  logo dari master alpha lewat CSS mask. Muka kartu hanya diperkecil ke WebP;
  sudut 3 mm dan bayangan dibuat di CSS. `prefers-reduced-motion: reduce`
  mematikan reveal, hitungan angka, tilt, dan demo balik kartu.
- **Aset**: `scripts/brand-assets.py` juga menulis `join/src/assets/` (logo dan
  kartu contoh dari Dream `20_product/assets/drops/`) dan menyalin ikon serta
  OG image ke `join/public/`.
- **Indeks mesin pencari**: ditutup (`noindex` di HTML, `X-Robots-Tag` di
  `join/public/_headers`, dan `robots.txt` disallow) karena ketentuan kreator
  masih menunggu review legal dan kartu contoh memerlukan izin pemiliknya.
  Buka hanya atas keputusan owner.

Verifikasi setelah deploy: root `200` dengan `X-Robots-Tag`, aset hash
`immutable`, favicon, OG image, `robots.txt`, dan path tidak dikenal `404`.

Deploy join 2026-11-07 dari commit `8208a21` menghasilkan Worker
`c-verse-join` versi `25555125-e8e9-470b-a930-73cf1424dc65`. Browser live
desktop memeriksa pilihan kedua peran, tiga contoh kartu beserta kredit ilustrator,
dan batas royalti penjualan kembali di C.Verse tanpa overflow. Pemeriksaan
lokal pada lebar 390 px mencakup kedua jalur dan ganti peran; kalkulator dari
100 ke 105 C.Coin menghasilkan royalti 6 C.Gems serta pembagian Seed 8 C.Coin
untuk C.Verse, 8 C.Gems untuk ilustrator, dan sisa pemilik 89 C.Gems. Deep link
lama `#s5` dan navigasi kembali juga diperiksa setelah perbaikan. Root HTTP
`200`, `noindex` HTML dan
`X-Robots-Tag` tersedia, keenam aset hash `200` dengan cache immutable,
favicon, OG image, dan robots `200`, serta path tidak dikenal `404`.
Override managed robots Cloudflare yang dicatat di bawah tetap berlaku.

Percobaan deploy join 2026-11-06 untuk revisi harga dan tanda tangan: build
berhasil, tetapi dua percobaan `npm run deploy:join` gagal sebelum deploy
karena API Cloudflare mengembalikan `503 no healthy upstream` saat membaca
Worker `c-verse-join`. Tidak ada versi deployment baru yang dikonfirmasi;
verifikasi lokal dan dry-run terpisah dari hasil deploy ini. [Insiden jaringan
Singapura Cloudflare](https://www.cloudflarestatus.com/incidents/3ehw20ozwlkr) aktif saat percobaan;
korelasinya dengan galat API ini belum terbukti.

Deploy ulang yang diotorisasi berhasil pada 2026-11-06 14:41:14 UTC dari
commit `ecba286`, Worker `c-verse-join` versi
`6e249b2d-94aa-437e-a87b-e3d75a3aa13d` (100% traffic). Smoke test live
memeriksa harga 30 C.Coin dan tanda tangan setiap kartu, kalkulator rilis
perdana, Seed dan royalti, serta root, aset, favicon, OG image, robots,
`noindex`, dan 404. Aset hash memakai cache immutable. Tampilan desktop
1280 × 800 tidak menunjukkan overflow atau field terpotong. Override robots
Cloudflare yang dicatat di bawah tetap berlaku.

Deploy pertama 2026-11-01 (Worker `c-verse-join`, Custom Domain
`join.c-verse.co`): semua cek di atas lulus, deep link `#s6` dan kalkulator
diperiksa di browser. Dua catatan zone yang tidak diubah:

- Managed robots.txt Cloudflare pada zone menambahkan blok `User-agent: *` /
  `Allow: /` sebelum `Disallow: /` milik situs ini, jadi `robots.txt` tidak
  efektif menutup crawl. `noindex` di HTML dan `X-Robots-Tag` tetap berlaku
  dan itulah yang mencegah indeks.
- HTTP ke HTTPS (`308`, path dan query utuh) dilakukan `join/worker.js`, yang
  berjalan sebelum aset (`run_worker_first`). Ruleset redirect zone hanya
  mencakup apex, dan token OAuth Wrangler tidak punya izin mengubah ruleset
  zone. Pengecualian: `http://join.c-verse.co/robots.txt` tetap `200` karena
  Managed robots.txt Cloudflare menimpa respons itu di edge.

## Stack

Vite 5 · Three 0.160 · Inter (Google Fonts).

## Sumber

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
