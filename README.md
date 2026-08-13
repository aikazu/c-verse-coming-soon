# C.Verse — Coming Soon (Arcade)

Workspace: `01_Coming_Soon` — landing page arcade-style untuk **C.Verse — Revolusi Ekonomi Kreator**.

## Anti-error Next.js
Project ini **Vite + Three.js + GSAP**, bukan Next.js. `01_Coming_Soon` tidak punya `app/` atau `pages/` Next.js, jadi tidak akan trigger error shadcn/Next di IDE.

## Run
```bash
cd C:/Users/iqbal/Projects/01_Coming_Soon
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview  # http://localhost:4173
```

## Apa yang dibangun
- **Tema arcade maximal**: CRT scanline, vignette, neon grid floor shader (Three.js), floating wireframe geometry, ring portals, particle starfield + bokeh, bloom via color.
- **Hero**: KREATOR + Coming Soon (Silkscreen gold), insert coin CTA → scroll ke waitlist, tilt/parallax Three.js mengikuti mouse + scroll.
- **Marquee** berjalan, **Select Your Class** 3 kartu (creator/collector/culture), **High Score waitlist** panel.
- **Waitlist**: validasi email, localStorage queue, animasi counter, high-score table update, modal YOU'RE IN, sound coin (WebAudio) dengan toggle. Tidak pakai elemen NFC/drop limited (sesuai instruksi).
- Stack: Vite 5, Three 0.160 (ESM), GSAP 3, fonts via Google Fonts (Syne/Space Grotesk/JetBrains Mono/Silkscreen).

## Catatan C.Verse (konteks, tidak ditampilkan di landing)
C.Verse = Creator Verse, MVP C.Card (kartu acrylic + NTAG 424 DNA) — detail ada di `00_Dream_Project/`. Landing ini sengaja tidak menampilkan istilah NFC/drop/limited agar tetap general hype.

## Deploy (preview serve)
`npm run preview` sudah diverifikasi 200 OK. Untuk produksi: `npm run build` → `dist/` siap di Cloudflare Pages / Vercel / static hosting mana pun.
