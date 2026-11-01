"""Generate the Coming Soon brand assets from the CreatorVerse logo masters.

Usage: python -I scripts/brand-assets.py <path to the Dream brand folder>

Writes into public/: trimmed logo PNGs (black shape on alpha) in brand/, the
favicon set (favicon.ico, favicon-16x16.png, favicon-32x32.png), apple-touch-icon.png,
android-chrome-192x192.png, android-chrome-512x512.png, and og-image.png.
Icons and the OG image are the black symbol or lockup on solid lime, the same
approach as Platform/scripts/brand-assets.py. Masters are read-only; logo
proportions are kept and nothing is recolored or distorted.
"""

import sys
from pathlib import Path

from PIL import Image

LIME = (204, 255, 102, 255)  # brand lime #CCFF66
MASTERS = {
    "creatorverse-horizontal.png": ("combined/CreatorVerse-logo-horizontal.png", 1200, None),
    "creatorverse-symbol.png": ("components/CreatorVerse-symbol.png", 800, None),
}
# icon file -> (side, symbol fill). The symbol is wider than tall (about 1.65:1,
# two separate pieces), so fill is the share of the square that its LONGER side
# (the width) takes; clear space is then even left and right and larger above and
# below. 60 % keeps >= 0.25 H clear space and the maskable safe zone (the corners
# stay inside the 80 % circle); the two small favicons use more so the gap between
# the pieces stays visible (guideline: enlarge the logo when the gap is not clearly
# visible).
ICONS = {
    "favicon-16x16.png": (16, 0.84),
    "favicon-32x32.png": (32, 0.80),
    "apple-touch-icon.png": (180, 0.6),
    "android-chrome-192x192.png": (192, 0.6),
    "android-chrome-512x512.png": (512, 0.6),
}
ICO_SIZES = [(16, 16), (32, 32), (48, 48)]
# Creator deck (join/): extra logo masks and the example card faces.
JOIN_LOGOS = {
    "creatorverse-horizontal.png": ("combined/CreatorVerse-logo-horizontal.png", 1200, None),
    "cverse-horizontal.png": ("combined/C.Verse-logo-horizontal.png", 900, None),
    "ccard-symbol.png": ("components/C.Card-symbol.png", 800, None),
}
JOIN_CARDS = {
    "nekonoi-front.webp": "nekonoi_katsu/print/nekonoi_katsu_front_print_v4.png",
    "nekonoi-back.webp": "nekonoi_katsu/nekonoi_katsu_back_v2.png",
    "clarissa-front.webp": "clarissa_punipun/print/clarissa_punipun_front_print_v4.png",
}
CARD_WIDTH = 720
VISIBLE_ALPHA = 8  # alpha below this is export noise, not logo
OG_SIZE = (1200, 630)
OG_LOGO_WIDTH = 660


def trim(path: Path) -> Image.Image:
    """Crop a master to the bounding box of its visible shape."""
    image = Image.open(path).convert("RGBA")
    box = image.getchannel("A").point(lambda v: 255 if v >= VISIBLE_ALPHA else 0).getbbox()
    if box is None:
        sys.exit(f"{path} has no visible pixels")
    return image.crop(box)


def resize(image: Image.Image, width: int | None, height: int | None) -> Image.Image:
    """Scale to the given width or height, keeping the aspect ratio."""
    if width is not None:
        height = round(image.height * width / image.width)
    else:
        assert height is not None
        width = round(image.width * height / image.height)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def fit(image: Image.Image, limit: int) -> Image.Image:
    """Scale so the longer side equals limit, whichever side that is."""
    if image.width >= image.height:
        return resize(image, limit, None)
    return resize(image, None, limit)


def on_lime(logo: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Center a black logo on a solid lime canvas."""
    canvas = Image.new("RGBA", size, LIME)
    canvas.alpha_composite(logo, ((size[0] - logo.width) // 2, (size[1] - logo.height) // 2))
    return canvas.convert("RGB")


def icon(symbol: Image.Image, side: int, fill: float) -> Image.Image:
    return on_lime(fit(symbol, round(side * fill)), (side, side))


def save(image: Image.Image, path: Path, written: list[Path], **kwargs) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True, **kwargs)
    written.append(path)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = Path(sys.argv[1])
    public = Path(__file__).resolve().parent.parent / "public"
    written: list[Path] = []

    logos = {}
    for name, (relative, width, height) in MASTERS.items():
        logos[name] = resize(trim(source / relative), width, height)
        save(logos[name], public / "brand" / name, written)

    symbol = logos["creatorverse-symbol.png"]
    for name, (side, fill) in ICONS.items():
        save(icon(symbol, side, fill), public / name, written)
    # favicon.ico: rendered at 256 px and downscaled by Pillow per size
    save(icon(symbol, 256, 0.8), public / "favicon.ico", written, sizes=ICO_SIZES)

    og_logo = resize(logos["creatorverse-horizontal.png"], OG_LOGO_WIDTH, None)
    save(on_lime(og_logo, OG_SIZE), public / "og-image.png", written)

    written += join_assets(source, public)

    root = public.parent
    for path in written:
        with Image.open(path) as image:
            print(f"{path.relative_to(root)}  {image.width}x{image.height}  {path.stat().st_size} bytes")


def join_assets(source: Path, public: Path) -> list[Path]:
    """Assets for the creator deck at join.c-verse.co (join/).

    Logo masks and card faces go to join/src/assets/ so Vite fingerprints them;
    the icon set and OG image are copied from the Coming Soon output above.
    Card artwork is only resized to WebP, never recolored; the 3 mm corners and
    shadow are drawn in CSS.
    """
    root = public.parent / "join"
    written: list[Path] = []
    for name, (relative, width, height) in JOIN_LOGOS.items():
        save(resize(trim(source / relative), width, height), root / "src/assets/brand" / name, written)
    drops = source.parents[1] / "20_product/assets/drops"
    for name, relative in JOIN_CARDS.items():
        card = Image.open(drops / relative).convert("RGB")
        card = card.resize((CARD_WIDTH, round(CARD_WIDTH * 88 / 63)), Image.Resampling.LANCZOS)
        save(card, root / "src/assets/cards" / name, written, quality=86, method=6)
    for name in [*ICONS, "favicon.ico", "og-image.png"]:
        target = root / "public" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((public / name).read_bytes())
        written.append(target)
    return written


if __name__ == "__main__":
    main()
