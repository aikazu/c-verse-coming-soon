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
    "creatorverse-symbol.png": ("components/CreatorVerse-symbol-CV04-D.png", None, 512),
}
# icon file -> (side, symbol fill). 60 % keeps >= 0.25 H clear space and the
# maskable safe zone; the two small favicons use more so the symbol's inner cut
# stays visible (guideline: enlarge the logo when the gap is not clearly visible).
ICONS = {
    "favicon-16x16.png": (16, 0.84),
    "favicon-32x32.png": (32, 0.80),
    "apple-touch-icon.png": (180, 0.6),
    "android-chrome-192x192.png": (192, 0.6),
    "android-chrome-512x512.png": (512, 0.6),
}
ICO_SIZES = [(16, 16), (32, 32), (48, 48)]
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
    """Scale so the longest side equals limit."""
    scale = limit / max(image.size)
    return resize(image, max(1, round(image.width * scale)), None)


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

    for path in written:
        with Image.open(path) as image:
            print(f"{path.relative_to(public.parent)}  {image.width}x{image.height}  {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
