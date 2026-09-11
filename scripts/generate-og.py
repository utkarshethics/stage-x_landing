#!/usr/bin/env python3
"""Generate 1200x630 Open Graph images for every page on stage-x.space.

Reads each page's <title> and <meta name="description"> to build a branded,
on-brand card: near-black gradient, cyan #00d4ff accents, safe-zone padding.

Usage:  python3 scripts/generate-og.py   (writes public/og/<slug>.png)
"""

import json
import os
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "og"

W, H = 1200, 630
PAD = 72  # safe zone (60-80px recommended)

# Brand
ACCENT = "#00d4ff"
TEXT = "#ffffff"
MUTED = "#a3a3a3"
BG_TOP = (4, 4, 6)
BG_BOTTOM = (26, 26, 30)

FONT_DIR = "/System/Library/Fonts"

def font(path: str, size: int):
    return ImageFont.truetype(os.path.join(FONT_DIR, path), size)

TITLE_FONT = font("Supplemental/Arial Bold.ttf", 62)
SUB_FONT = font("SFNS.ttf", 30)
SMALL_FONT = font("SFNS.ttf", 24)
WORDMARK_FONT = font("SFNS.ttf", 30)

PAGES = [
    ("index.html", "stage-x.space | Forward Deployed Engineering"),
    ("summits.html", "Stage-X Summits | Closed-Door Frontier Model Enterprise Summits"),
    ("summits/sf-2026.html", "Stage-X Summit 2026: San Francisco | Frontier Model Architecture"),
    ("summits/nyc-2026.html", "Stage-X Summit 2026: New York | Frontier Model Architecture"),
    ("summits/boston-2026.html", "Stage-X Summit 2026: Boston | Frontier Model Architecture"),
    ("summits/toronto-2026.html", "Stage-X Summit 2026: Toronto | Frontier Model Architecture"),
    ("summits/london-2026.html", "Stage-X Summit 2026: London | Frontier Model Architecture"),
    ("summits/berlin-2026.html", "Stage-X Summit 2026: Berlin | Frontier Model Architecture"),
    ("summits/dubai-2026.html", "Stage-X Summit 2026: Dubai | Frontier Model Architecture"),
    ("summits/mumbai-2026.html", "Stage-X Summit 2026: Mumbai | Frontier Model Architecture"),
    ("summits/melbourne-2026.html", "Stage-X Summit 2026: Melbourne | Frontier Model Architecture"),
]


def wrap(draw, text, fnt, max_width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def clean_title(raw_title):
    # "Stage-X Summit 2026: Berlin | Frontier Model Architecture" -> "Stage-X Summit 2026" / "Berlin"
    parts = [p.strip() for p in raw_title.split("|")[0].split(":")]
    if len(parts) == 2 and parts[0].startswith("Stage-X Summit"):
        return parts[0], parts[1]
    if parts and parts[0] == "stage-x.space":
        return "stage-x.space", "Forward Deployed Engineering"
    return parts[0], parts[1] if len(parts) > 1 else ""


def render(page_rel, raw_title):
    html = (ROOT / page_rel).read_text()
    mdesc = re.search(r'<meta name="description" content="([^"]*)"', html)
    description = mdesc.group(1) if mdesc else ""
    # strip trailing "— Closed-door ..." boilerplate for a crisper subtitle
    sub = re.sub(r"\s*[—-]\s*Closed[- ]door.*$", "", description)

    main, city = clean_title(raw_title)
    subtitle = f"{city} · {sub}" if city else sub

    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    # vertical gradient
    for y in range(H):
        t = y / (H - 1)
        row = tuple(int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=row)

    # subtle cyan radial glow, top-right
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy, r = W - 120, 0, 460
    for i in range(r, 0, -2):
        alpha = int(26 * (1 - i / r))
        gd.ellipse([cx - i, cy - i, cx + i, cy + i], outline=(0, 212, 255, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    d = ImageDraw.Draw(img)

    # wordmark: cyan square + STAGE-X.SPACE
    sq = 16
    d.rectangle([PAD, PAD, PAD + sq, PAD + sq], fill=ACCENT)
    d.text((PAD + sq + 14, PAD - 4), "STAGE-X.SPACE", font=WORDMARK_FONT, fill=TEXT)

    # cyan divider
    d.rectangle([PAD, 96, PAD + 56, 99], fill=ACCENT)

    # title
    y = 140
    for line in wrap(d, main, TITLE_FONT, W - 2 * PAD):
        d.text((PAD, y), line, font=TITLE_FONT, fill=TEXT)
        y += 72

    # subtitle
    y += 8
    for line in wrap(d, subtitle, SUB_FONT, W - 2 * PAD):
        d.text((PAD, y), line, font=SUB_FONT, fill=MUTED)
        y += 40

    # footer
    d.text((PAD, H - PAD - 8), "stage-x.space — private technical roundtables", font=SMALL_FONT, fill=MUTED)

    return img


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for rel, title in PAGES:
        slug = rel.replace(".html", "").replace("summits/", "")
        out = OUT_DIR / f"{slug}.png"
        render(rel, title).save(out, "PNG", optimize=True)
        print(f"  {out}  ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    sys.exit(main())