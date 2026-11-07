import './style.css';
import { num, primaryShare, royalty, rp, seedFee } from './economy.js';
import { roleFromLocation, slideIndexForRole } from './role.js';

document.documentElement.classList.add('js');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const creatorView = document.querySelector('#creator-view');
const illustratorView = document.querySelector('#illustrator-view');
const decks = {
  creator: [...creatorView.querySelectorAll('.slide')],
  illustrator: [...illustratorView.querySelectorAll('.slide')],
};
let slides = decks.creator;
let dots = [...document.querySelectorAll('.dots a')];
const counter = document.querySelector('[data-current]');
const progress = document.querySelector('.progress');
const [prevBtn, nextBtn] = document.querySelectorAll('[data-go]');
const chooser = document.querySelector('#role-choice');
const deckChrome = [...document.querySelectorAll('.dots, .progress, .chrome, .skip')];
let current = 0;
let displayedRole = null;

// ---------------------------------------------------------------- navigation
function setActive(index) {
  if (!displayedRole || index < 0) return;
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
  if (location.hash !== `#${slide.id}`) {
    const url = new URL(location.href);
    if (index === 0 || displayedRole === 'illustrator') url.searchParams.set('role', displayedRole);
    url.hash = index === 0 ? '' : slide.id;
    history.replaceState(null, '', url);
  }
}

function go(index, { focus = false } = {}) {
  const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
  target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  if (focus) {
    const heading = target.querySelector('h1, h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
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
  { threshold: 0 },
);
for (const slide of [...decks.creator, ...decks.illustrator]) {
  activeObserver.observe(slide);
  revealObserver.observe(slide);
}

prevBtn.addEventListener('click', () => go(current - 1));
nextBtn.addEventListener('click', () => go(current + 1));

document.addEventListener('keydown', (event) => {
  if (!displayedRole) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const field = event.target.closest('input, textarea, select, [contenteditable]');
  if (field) return;
  if (event.key === 'ArrowRight') go(current + 1, { focus: true });
  else if (event.key === 'ArrowLeft') go(current - 1, { focus: true });
  else return;
  event.preventDefault();
});

// ---------------------------------------------------------------- cover tilt
for (const tilt of document.querySelectorAll('[data-tilt]')) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) continue;
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

const choiceTilt = document.querySelector('[data-choice-tilt]');
if (choiceTilt && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  choiceTilt.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    const box = choiceTilt.getBoundingClientRect();
    choiceTilt.classList.add('is-tilting');
    choiceTilt.style.setProperty('--ry', `${((event.clientX - box.left) / box.width - 0.5) * 10}deg`);
    choiceTilt.style.setProperty('--rx', `${((event.clientY - box.top) / box.height - 0.5) * -7}deg`);
  });
  choiceTilt.addEventListener('pointerleave', () => {
    choiceTilt.classList.remove('is-tilting');
    choiceTilt.style.setProperty('--ry', '0deg');
    choiceTilt.style.setProperty('--rx', '0deg');
  });
}

// ---------------------------------------------------------------- card flip
for (const flip of document.querySelectorAll('.flip')) {
  const flipLabel = flip.closest('.flip-wrap').querySelector('.flip__label');
  const setFlip = (back) => {
    flip.setAttribute('aria-pressed', String(back));
    flipLabel.textContent = back ? 'Belakang: identitas kolaborasi' : 'Depan: artwork';
  };
  let demoTimers = [];
  flip.addEventListener('click', () => {
    demoTimers.forEach(clearTimeout);
    demoTimers = [];
    setFlip(flip.getAttribute('aria-pressed') !== 'true');
  });
  flip.closest('.slide').addEventListener('seen', () => {
    if (reduceMotion.matches) return;
    const demoFlip = (back) => {
      if (!flip.closest('main').hidden) setFlip(back);
    };
    demoTimers = [setTimeout(() => demoFlip(true), 900), setTimeout(() => demoFlip(false), 2600)];
  });
}

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
    const fixedPrice = root.dataset.calc === 'primary' || root.dataset.calc === 'artist-primary';
    const price = fixedPrice ? 30 : Number(ranges[0].value);
    presets.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.price) === price)));
    const isCollab = Boolean(collab?.checked);
    root.querySelectorAll('[data-collab-only]').forEach((el) => {
      el.hidden = !isCollab;
    });
    render.call(root, { price, count: Number(ranges[fixedPrice ? 0 : 1]?.value ?? 1), collab: isCollab, ranges });
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

setupCalc(document.querySelector('[data-calc="seed"]'), function ({ price, collab, ranges }) {
  const fee = seedFee(price, collab);
  write(this, 'price', `${num(price)} C.Coin`);
  write(this, 'fee', `${num(fee)} C.Coin`);
  write(this, 'fee-label', collab ? 'Total fee 2 × 7,5%' : 'Fee 15%');
  write(this, 'claim', collab
    ? 'Bila dijual, Anda menerima sisa harga setelah fee C.Verse dan ilustrator, masing-masing 7,5% dibulatkan ke atas.'
    : 'Bila dijual, Anda menerima sisa harga jual setelah fee 15% yang dibulatkan ke atas.');
  write(this, 'net', gems(price - fee));
  write(this, 'note', collab
    ? 'Fee dibagi 7,5% untuk C.Verse dan 7,5% untuk ilustrator, masing-masing dibulatkan ke atas. Harga di sini contoh. Sebelum diserahkan ke pembeli, kartu dikirim ke Vault C.Verse untuk verifikasi chip dan kondisi.'
    : 'Fee dibulatkan ke atas ke C.Coin utuh. Harga di sini contoh. Sebelum diserahkan ke pembeli, kartu dikirim ke Vault C.Verse untuk verifikasi chip dan kondisi.');
  ranges[0].setAttribute('aria-valuetext', `${price} C.Coin`);
});

setupCalc(document.querySelector('[data-calc="primary"]'), function ({ price, count, collab, ranges }) {
  const share = primaryShare(price, collab);
  document.querySelector('[data-creator-primary-rate]').textContent = collab ? '15' : '30';
  write(this, 'count', `${num(count)} kartu`);
  write(this, 'share', gems(share));
  write(this, 'partner', gems(primaryShare(price, true)));
  write(this, 'total-label', `Total untuk ${num(count)} kartu`);
  write(this, 'total', gems(share * count));
  write(this, 'note', collab
    ? '30% dibagi 15% untuk Anda dan 15% untuk ilustrator. Dibulatkan ke atas ke C.Gems utuh, sebelum biaya pencairan dan pajak. Jumlah kartu di sini contoh; contoh harga rilis adalah 30 C.Coin per kartu.'
    : 'Dibulatkan ke atas ke C.Gems utuh, sebelum biaya pencairan dan pajak. Jumlah kartu di sini contoh; contoh harga rilis adalah 30 C.Coin per kartu.');
  ranges[0].setAttribute('aria-valuetext', `${count} kartu`);
});

setupCalc(document.querySelector('[data-calc="royalty"]'), function ({ price, count, collab, ranges }) {
  const share = royalty(price, collab);
  document.querySelector('[data-creator-royalty-rate]').textContent = collab ? '5' : '7,5';
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

setupCalc(document.querySelector('[data-calc="artist-primary"]'), function ({ price, count, collab, ranges }) {
  const share = primaryShare(price, collab);
  write(this, 'count', `${num(count)} kartu`);
  write(this, 'share', gems(share));
  write(this, 'partner', gems(primaryShare(price, true)));
  write(this, 'total-label', `Total untuk ${num(count)} kartu`);
  write(this, 'total', gems(share * count));
  write(this, 'note', collab
    ? 'Contoh C.Card reguler: 15% untuk Anda dan 15% untuk kreator, masing-masing dibulatkan ke atas per kartu. Sebelum biaya pencairan dan pajak.'
    : 'Contoh C.Card reguler karya Anda sendiri: 30% dibulatkan ke atas per kartu. Sebelum biaya pencairan dan pajak.');
  document.querySelector('[data-artist-primary-rate]').textContent = collab ? '15' : '30';
  ranges[0].setAttribute('aria-valuetext', `${count} kartu`);
});

setupCalc(document.querySelector('[data-calc="artist-royalty"]'), function ({ price, count, collab, ranges }) {
  const share = royalty(price, collab);
  write(this, 'price', coins(price));
  write(this, 'count', `${num(count)} kali`);
  write(this, 'share', gems(share));
  write(this, 'partner', gems(royalty(price, true)));
  write(this, 'total-label', `Total dari ${num(count)} penjualan`);
  write(this, 'total', gems(share * count));
  write(this, 'note', collab
    ? 'Contoh C.Card reguler di C.Verse: 5% untuk Anda dan 5% untuk kreator, masing-masing dibulatkan ke atas. Fee C.Verse 5% terpisah. Jika disepakati ada Seed, fee 7,5% untuk C.Verse dan 7,5% untuk ilustrator masing-masing dibulatkan ke atas; pemilik menerima sisanya. Sebelum biaya pencairan dan pajak.'
    : 'Contoh C.Card reguler karya Anda sendiri di C.Verse: 7,5% dibulatkan ke atas, sebelum biaya pencairan dan pajak. Seed memakai aturan berbeda.');
  document.querySelector('[data-artist-royalty-rate]').textContent = collab ? '5' : '7,5';
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

// A query parameter keeps both paths shareable while preserving existing #sN links.
function showRole(role, focus = false) {
  const selected = role === 'creator' || role === 'illustrator' ? role : null;
  const previousRole = displayedRole;
  displayedRole = selected;
  chooser.hidden = Boolean(selected);
  creatorView.hidden = selected !== 'creator';
  illustratorView.hidden = selected !== 'illustrator';
  deckChrome.forEach((element) => { element.hidden = !selected; });
  document.body.dataset.role = selected ?? 'choice';
  document.documentElement.classList.toggle('role-deck', Boolean(selected));
  document.body.dataset.theme = selected ? 'lime' : 'black';
  if (selected) {
    slides = decks[selected];
    const list = document.querySelector('.dots ol');
    list.replaceChildren(...slides.map((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      const label = document.createElement('span');
      link.href = `#${item.id}`;
      label.className = 'sr-only';
      label.textContent = item.querySelector('h1, h2')?.textContent ?? 'Slide';
      link.append(label);
      li.append(link);
      return li;
    }));
    dots = [...list.querySelectorAll('a')];
    document.querySelector('.chrome__sub').textContent = selected === 'creator' ? ' / Kolaborasi kreator' : ' / Ilustrator';
    document.querySelector('.skip').href = `#${slides[1].id}`;
    const slide = slides[slideIndexForRole(selected, location.hash)];
    slide?.scrollIntoView({ behavior: 'instant', block: 'start' });
    setActive(slides.indexOf(slide));
    if (focus) {
      const heading = slide?.querySelector('h1, h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (focus) {
      const target = document.querySelector(`[data-role-choice="${previousRole ?? 'creator'}"]`);
      target?.focus({ preventScroll: true });
    }
  }
}

document.querySelectorAll('[data-role-choice]').forEach((button) => button.addEventListener('click', () => {
  const role = button.dataset.roleChoice;
  const url = new URL(location.href);
  url.searchParams.set('role', role);
  url.hash = '';
  history.pushState(null, '', url);
  showRole(role, true);
}));
document.querySelectorAll('[data-change-role]').forEach((button) => button.addEventListener('click', () => {
  const url = new URL(location.href);
  url.searchParams.delete('role');
  url.hash = '';
  history.pushState(null, '', url);
  showRole(null, true);
}));
window.addEventListener('popstate', () => {
  const role = roleFromLocation(location);
  if (role !== displayedRole) showRole(role, true);
});
showRole(roleFromLocation(location));
