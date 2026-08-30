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
import json
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, "raw", "survey", "thumb")
OPENED = os.path.join(HERE, "OPENED.json")
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)


def record_opened(names, sheet):
    """Write down which items were actually put in front of an eye, and on which sheet.

    This exists because prose could not stop the failure it guards. Told plainly not to rank
    groups it had not opened, a model asked "which should we prioritise?" ranked them anyway in
    three separate trials, quoting the rule back while breaking it. The operator's question beats
    the instruction every time, so the count has to come from a file rather than from resolve:
    `survey.py GROUPS=1` reads this and marks any group with nothing opened as UNSEEN.

    Rendering an item onto a contact sheet is the standard for "opened" here, the same one
    `eyeball.py` uses -- the sheet is named so a later reader can go back to what was seen.
    """
    ledger = json.load(open(OPENED)) if os.path.exists(OPENED) else {}
    for name in names:
        ledger[name] = sheet
    json.dump(ledger, open(OPENED, "w"), indent=1, sort_keys=True)
    return len(ledger)


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
        record_opened([n for n, _ in tiles], dest)
        written += 1
    total = json.load(open(OPENED)) if os.path.exists(OPENED) else {}
    print(f"{len(names)} thumbnails, {written} sheets at {stem}-NNN.png")
    print(f"{len(total)} items now recorded as opened (vault/OPENED.json)")


main()
