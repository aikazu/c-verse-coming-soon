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

- **Hero**: `CREATOR` / `VERSE` flip ke `クリエイター` / `の世界` (neon frame per huruf), `REVOLUTION`, `COMING SOON` typewriter + cursor. `ARCADE MODE · READY` pill, clock, `SOUND` toggle.
- **Vapor horizon + EQ**: neon grid, low-poly mountains, 32 bar equalizer bumpy bottom→top beat-reactive (idle muted, play jadi blue fire), star dome, shooting stars, jet kecil, particles/bokeh, CRT+vignette.
- **Motion**: mouse/touch X+Y + gyro full 2D parallax, camera Z breathing + lookAt, ring/light/particles reaktif ke `bass/kick`.
- **Audio**: `public/audio/ambient.mp3` + `ambient.ogg` bundled ke `dist/audio/` (~3.6 MB drop). Bisa dipisah ke R2/S3 kalau mau.

## Deploy (Vercel)

- **Drop**: `cverse-coming-soon--vercel-drop.zip` — prebuilt `dist/` drag langsung.
- **Git**: push repo ini, framework preset **Vite**.

## Stack

Vite 5 · Three 0.160 · GSAP 3 · Noto Sans JP.
