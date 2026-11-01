// Figures for the creator deck. Same rules as Platform
// packages/shared/src/economy.ts and the PDF deck build (creator-20261031):
// 1 C.Coin = Rp10.000; first-sale creator share 30% (15% each with an
// illustrator) floored to whole C.Gems; resale royalty 7,5% (5% each) ceiled;
// a Seed C.Card sale keeps a 15% fee, ceiled, and pays no separate royalty.
// Integer arithmetic avoids float drift (0.075 is not exact in binary).

export const RATE_IDR = 10_000;

export const primaryShare = (price, collab = false) => Math.floor((price * (collab ? 15 : 30)) / 100);

export const royalty = (price, collab = false) => Math.ceil((price * (collab ? 50 : 75)) / 1000);

export const seedFee = (price) => Math.ceil((price * 15) / 100);

const idr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export const rp = (ccoin) => `Rp${idr.format(ccoin * RATE_IDR)}`;

export const num = (value) => idr.format(value);
