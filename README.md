# C.Verse — Coming Soon

Hero-only arcade coming soon untuk **C.Verse** — **CREATOR / VERSE — REVOLUTION**.

## Run

```bash
cd C:/Users/iqbal/Projects/01_Coming_Soon
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # http://localhost:4173
```

## Apa yang ada

- **Hero only**: centered `CREATOR` / `VERSE` flip ke `クリエイター` / `の世界` (neon frame per huruf), `REVOLUTION`, `COMING SOON` typewriter + cursor. `ARCADE MODE · READY` pill, clock, `SOUND` toggle.
- **Vapor horizon + EQ**: neon grid, low-poly mountains di horizon, 56 bar equalizer bumpy bottom→top beat-reactive (idle muted, play jadi blue fire), star dome, shooting stars, jet kecil, particles/bokeh, CRT+vignette.
- **Interaktivitas**: mouse/touch X+Y + gyro (iOS permission via gesture) full 2D parallax, camera Z breathing + lookAt, ring/light/particles reaktif ke `bass/kick`.
- **Audio**: `public/audio/ambient.mp3` (1.6 MB, copy strip cover) + `ambient.ogg` fallback, bundled ke `dist/audio/` — Vercel drop 3.04 MB. Bisa dipisah ke R2/S3 ganti `<source src>`.

## Deploy (Vercel)

- **Drop**: `cverse-coming-soon--vercel-drop.zip` — isi prebuilt `dist/` (5 files) drag ke Vercel.
- **Git**: push repo ini, framework preset **Vite**.

## Stack

Vite 5, Three 0.160, GSAP 3, `Noto Sans JP` untuk JP. Tidak pakai NFC/drop/limited — general hype only.
