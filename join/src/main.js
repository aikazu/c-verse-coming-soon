import './style.css';
import { num, primaryShare, royalty, rp, seedFee } from './economy.js';

document.documentElement.classList.add('js');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dots a')];
const counter = document.querySelector('[data-current]');
const progress = document.querySelector('.progress');
const [prevBtn, nextBtn] = document.querySelectorAll('[data-go]');
let current = 0;

// ---------------------------------------------------------------- navigation
function setActive(index) {
  current = index;
  const slide = slides[index];
  document.body.dataset.theme = slide.dataset.theme;
  counter.textContent = String(index + 1).padStart(2, '0');
  progress.style.setProperty('--p', (index + 1) / slides.length);
  dots.forEach((dot, i) => {
    if (i === index) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;
  if (location.hash !== `#${slide.id}`) history.replaceState(null, '', index === 0 ? location.pathname : `#${slide.id}`);
}

function go(index) {
  const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
  target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
}

// The slide covering the middle of the viewport is the active one. Scroll snap
// events would settle later and are Chromium-only, so IntersectionObserver
// drives both the chrome and the one-time reveal.
const activeObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) setActive(slides.indexOf(entry.target));
    }
  },
  { rootMargin: '-50% 0px -50% 0px' },
);
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-seen');
      entry.target.dispatchEvent(new CustomEvent('seen'));
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.25 },
);
for (const slide of slides) {
  activeObserver.observe(slide);
  revealObserver.observe(slide);
}

prevBtn.addEventListener('click', () => go(current - 1));
nextBtn.addEventListener('click', () => go(current + 1));

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const field = event.target.closest('input, textarea, select, [contenteditable]');
  if (field) return;
  if (event.key === 'ArrowRight') go(current + 1);
  else if (event.key === 'ArrowLeft') go(current - 1);
  else return;
  event.preventDefault();
});

// ---------------------------------------------------------------- cover tilt
const tilt = document.querySelector('[data-tilt]');
if (tilt && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cover = tilt.closest('.slide');
  cover.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    const box = cover.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    tilt.classList.add('is-tilting');
    tilt.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
    tilt.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
  });
  cover.addEventListener('pointerleave', () => {
    tilt.classList.remove('is-tilting');
    tilt.style.setProperty('--ry', '0deg');
    tilt.style.setProperty('--rx', '0deg');
  });
}

// ---------------------------------------------------------------- card flip
const flip = document.querySelector('.flip');
const flipLabel = document.querySelector('.flip__label');
function setFlip(back) {
  flip.setAttribute('aria-pressed', String(back));
  flipLabel.textContent = back ? 'Belakang: identitas kolaborasi' : 'Depan: artwork';
}
flip.addEventListener('click', () => setFlip(flip.getAttribute('aria-pressed') !== 'true'));
// One demonstration turn the first time the slide is seen, so the back is discovered.
flip.closest('.slide').addEventListener('seen', () => {
  if (reduceMotion.matches) return;
  setTimeout(() => setFlip(true), 900);
  setTimeout(() => setFlip(false), 2600);
});

// ---------------------------------------------------------------- big numbers
for (const el of document.querySelectorAll('[data-count]')) {
  const end = Number(el.dataset.count);
  const decimals = Number.isInteger(end) ? 0 : 1;
  const format = (v) => v.toFixed(decimals).replace('.', ',');
  el.closest('.slide').addEventListener('seen', () => {
    if (reduceMotion.matches) return;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1100);
      el.textContent = format(end * (1 - (1 - t) ** 3));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // Background tabs pause rAF; never leave the figure on a partial value.
    setTimeout(() => {
      el.textContent = format(end);
    }, 1300);
  });
}

// ---------------------------------------------------------------- calculators
const gems = (n) => `${num(n)} C.Gems · ${rp(n)}`;
const coins = (n) => `${num(n)} C.Coin · ${rp(n)}`;

function syncRange(input) {
  input.style.setProperty('--attr-min', input.min);
  input.style.setProperty('--attr-max', input.max);
  input.style.setProperty('--control-value', input.value);
}

function write(root, key, text) {
  const el = root.querySelector(`[data-out="${key}"]`);
  if (!el || el.textContent === text) return;
  el.textContent = text;
  if (el.tagName === 'DD') {
    el.classList.remove('is-bump');
    void el.offsetWidth; // restart the animation
    el.classList.add('is-bump');
  }
}

function setupCalc(root, render) {
  const ranges = [...root.querySelectorAll('input[type="range"]')];
  const presets = [...root.querySelectorAll('[data-price]')];
  const collab = root.querySelector('[data-collab]');
  const update = () => {
    ranges.forEach(syncRange);
    const price = Number(ranges[0].value);
    presets.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.price) === price)));
    const isCollab = Boolean(collab?.checked);
    root.querySelectorAll('[data-collab-only]').forEach((el) => {
      el.hidden = !isCollab;
    });
    render.call(root, { price, count: Number(ranges[1]?.value ?? 1), collab: isCollab, ranges });
  };
  ranges.forEach((r) => r.addEventListener('input', update));
  collab?.addEventListener('change', update);
  presets.forEach((b) =>
    b.addEventListener('click', () => {
      ranges[0].value = b.dataset.price;
      update();
    }),
  );
  update();
}

setupCalc(document.querySelector('[data-calc="seed"]'), function ({ price, ranges }) {
  const fee = seedFee(price);
  write(this, 'price', `${num(price)} C.Coin`);
  write(this, 'fee', `${num(fee)} C.Coin`);
  write(this, 'net', coins(price - fee));
  ranges[0].setAttribute('aria-valuetext', `${price} C.Coin`);
});

setupCalc(document.querySelector('[data-calc="primary"]'), function ({ price, count, collab, ranges }) {
  const share = primaryShare(price, collab);
  write(this, 'price', coins(price));
  write(this, 'count', `${num(count)} kartu`);
  write(this, 'share', gems(share));
  write(this, 'partner', gems(primaryShare(price, true)));
  write(this, 'total-label', `Total untuk ${num(count)} kartu`);
  write(this, 'total', gems(share * count));
  write(this, 'note', collab
    ? '30% dibagi 15% untuk Anda dan 15% untuk ilustrator. Dibulatkan ke bawah ke C.Gems utuh, sebelum biaya pencairan dan pajak. Harga dan jumlah kartu di sini contoh.'
    : 'Dibulatkan ke bawah ke C.Gems utuh, sebelum biaya pencairan dan pajak. Harga dan jumlah kartu di sini contoh; harga final disepakati untuk setiap rilis.');
  ranges[0].setAttribute('aria-valuetext', `${price} C.Coin`);
  ranges[1].setAttribute('aria-valuetext', `${count} kartu`);
});

setupCalc(document.querySelector('[data-calc="royalty"]'), function ({ price, count, collab, ranges }) {
  const share = royalty(price, collab);
  write(this, 'price', coins(price));
  write(this, 'count', `${num(count)} kali`);
  write(this, 'share', gems(share));
  write(this, 'partner', gems(royalty(price, true)));
  write(this, 'total-label', `Total dari ${num(count)} penjualan`);
  write(this, 'total', gems(share * count));
  write(this, 'note', collab
    ? 'Rilis bersama ilustrator: 5% untuk Anda dan 5% untuk ilustrator. Dibulatkan ke atas ke C.Gems utuh, sebelum biaya transfer pencairan dan pajak. Harga dan jumlah penjualan di sini contoh.'
    : 'Dibulatkan ke atas ke C.Gems utuh, sebelum biaya transfer pencairan dan pajak. Seed C.Card tidak memakai royalti ini; pemilik menerima sisa setelah fee 15%, sekitar 85%.');
  ranges[0].setAttribute('aria-valuetext', `${price} C.Coin`);
  ranges[1].setAttribute('aria-valuetext', `${count} kali`);
});

// ---------------------------------------------------------------- copy reply
for (const button of document.querySelectorAll('[data-copy]')) {
  const source = document.querySelector(button.dataset.copy);
  const status = button.parentElement.querySelector('[role="status"]');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(source.textContent);
      status.textContent = 'Tersalin. Tempel di balasan Anda.';
    } catch {
      getSelection().selectAllChildren(source);
      status.textContent = 'Teks sudah dipilih. Salin dengan Ctrl+C atau tahan lalu salin.';
    }
  });
}
