#!/usr/bin/env python3
"""Tile the survey's thumbnails into big contact sheets, so a lot can be looked at quickly.

`survey.py` writes a browsable page for a person. This writes sheets for an eye that has to read
several hundred interfaces in a sitting and pick out what is worth stopping on. Six to a sheet,
wide enough that on-screen type survives, which is the only size at which one of these tells you
anything a colour swatch would not.

    python3 vault/sheets.py                       # every channel, in order
    python3 vault/sheets.py SET=terminal-ruins
    python3 vault/sheets.py PER=6 WIDTH=760 OUT=/tmp/survey
"""
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, "raw", "survey", "thumb")
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)


def face(size=15):
    for name in ("/System/Library/Fonts/Menlo.ttc", "DejaVuSansMono.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    names = sorted(f for f in os.listdir(THUMBS) if f.endswith(".webp"))
    if args.get("SET"):
        names = [n for n in names if n.startswith(args["SET"])]
    if args.get("SAMPLE"):
        random.seed(int(args.get("SEED", "7")))
        names = random.sample(names, min(int(args["SAMPLE"]), len(names)))

    per = int(args.get("PER", "6"))
    width = int(args.get("WIDTH", "760"))
    cols = int(args.get("COLS", "2"))
    stem = args.get("OUT", "/tmp/survey")
    font = face()

    written = 0
    for start in range(0, len(names), per):
        block = names[start:start + per]
        tiles = []
        for name in block:
            try:
                im = Image.open(os.path.join(THUMBS, name)).convert("RGB")
            except Exception:
                continue
            im = im.resize((width, max(1, round(im.height * width / im.width))), Image.LANCZOS)
            tiles.append((name, im))
        if not tiles:
            continue
        head = 22
        rows = (len(tiles) + cols - 1) // cols
        # Rows are as tall as their tallest member: these come from every aspect ratio there is,
        # and cropping to a grid would cut the readouts off the edges of the wide ones.
        heights = [max(t.height for _, t in tiles[r * cols:(r + 1) * cols]) + head
                   for r in range(rows)]
        sheet = Image.new("RGB", (cols * width, sum(heights)), (9, 10, 12))
        draw = ImageDraw.Draw(sheet)
        y = 0
        for r in range(rows):
            for c, (name, im) in enumerate(tiles[r * cols:(r + 1) * cols]):
                x = c * width
                draw.text((x + 5, y + 3), name[:88], font=font, fill=(200, 204, 210))
                sheet.paste(im, (x, y + head))
            y += heights[r]
        dest = f"{stem}-{start // per + 1:03d}.png"
        sheet.save(dest)
        written += 1
    print(f"{len(names)} thumbnails, {written} sheets at {stem}-NNN.png")


main()
