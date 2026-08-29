#!/usr/bin/env python3
"""Compact review sheets: every specimen's whole motion story in one row.

`app/verify/sheet.py` builds the full four-strip sheet per component — the right tool for
studying one specimen, useless for looking at fifty-one, which is the actual task: the motion
reading has to say something about each of them, and an instrument nobody gets through does not
get used. This puts six components on one image and each component on one row: the entrance
opening, middle and end, the loop opening and end, and the last frame after the rack's evidence
switch was clicked. Those five tiles answer the two questions that matter — did anything travel,
and did the refusal keep its drawing — and the label at the left carries what the DOM reported
(marks seen, heights on both sides of the switch), so a row that looks static can be read as
"refused" or as "captured too slowly" without going back to the JSON.

Frames are sampled at the same indices for every component, so the rows compare. Read the
entrance three tiles first: three identical tiles with a non-zero animation count is the
invisible-motion defect, and a sweep that changed between tiles and then stopped is an entrance,
not a loop.

    python3 app/verify/review-sheet.py                     # /tmp/film -> /tmp/review-sheets
    python3 app/verify/review-sheet.py IN=/tmp/film OUT=/tmp/rs PER=6
"""
import json
import math
import os
from PIL import Image, ImageDraw, ImageFont

IN = os.environ.get("IN", "/tmp/film")
OUT = os.environ.get("OUT", "/tmp/review-sheets")
PER = int(os.environ.get("PER", "6"))
TILE_W = 250
LABEL_W = 210
PAD = 6

FONTS = ["/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/SFMono-Regular.otf",
         "/Library/Fonts/DejaVuSansMono.ttf"]


def font(size):
    for path in FONTS:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def pick(frames, count):
    """Spread `count` samples across a strip's own frame list."""
    if not frames or count <= 0:
        return []
    if count == 1:
        # The last frame of a strip is the one that shows what the specimen settled into --
        # and for the refused strip, whether anything was left at all.
        return [frames[-1]]
    if len(frames) <= count:
        return frames
    return [frames[round(i * (len(frames) - 1) / (count - 1))] for i in range(count)]


def row(data):
    """One component: label block plus entrance (3) · loop (2) · refused (1)."""
    conditions = data["conditions"]
    measured, refused = conditions["measured"], conditions["refused"]
    picks = pick(measured.get("enter"), 3) + pick(measured.get("loop"), 2) + pick(refused.get("enter"), 1)
    tiles = []
    for frame in picks:
        path = os.path.join(IN, frame["file"])
        if not os.path.exists(path):
            continue
        image = Image.open(path).convert("RGB")
        image.thumbnail((TILE_W, 150))
        tiles.append((image, frame))
    if not tiles:
        return None
    height = max(image.height for image, _ in tiles) + 20
    width = LABEL_W + len(tiles) * (TILE_W + PAD) + PAD
    sheet = Image.new("RGB", (width, height), (14, 14, 14))
    draw = ImageDraw.Draw(sheet)
    big, small = font(14), font(11)

    marks = measured["inventory"]["marks"]
    kinds = sorted({mark["kind"] for mark in marks}) or ["—"]
    labels = [
        data["key"],
        f"marks: {', '.join(kinds)}",
        f"height {measured['inventory']['height']} -> {refused['inventory']['height']}px",
        f"changed {sum(1 for f in measured.get('enter') or [] if f['changed'])}/{len(measured.get('enter') or [])}"
        f" ent, {sum(1 for f in measured.get('loop') or [] if f['changed'])}/{len(measured.get('loop') or [])}"
        f" loop",
        f"refused changed {sum(1 for f in refused.get('enter') or [] if f['changed'])}"
        f"/{len(refused.get('enter') or [])}",
    ]
    for offset, line in enumerate(labels):
        draw.text((8, 4 + offset * 15), line, font=big if offset == 0 else small,
                  fill=(235, 205, 160) if offset == 0 else (160, 160, 160))

    x = LABEL_W
    for image, frame in tiles:
        sheet.paste(image, (x, 18))
        draw.rectangle([x - 1, 17, x + image.width + 1, 19 + image.height], outline=(56, 56, 56))
        tag = f"{frame['t']}ms{'·ch' if frame['changed'] else ''}"
        draw.text((x + 2, 4), tag, font=small, fill=(150, 190, 150) if frame['changed'] else (110, 110, 110))
        x += TILE_W + PAD
    return sheet


def main():
    os.makedirs(OUT, exist_ok=True)
    keys = sorted(f[:-5] for f in os.listdir(IN) if f.endswith(".json"))
    rows, sheets = [], []
    for key in keys:
        try:
            data = json.load(open(os.path.join(IN, f"{key}.json")))
        except (ValueError, KeyError):
            continue
        built = row(data)
        if built is not None:
            rows.append((key, built))
    for start in range(0, len(rows), PER):
        group = rows[start:start + PER]
        width = max(sheet.width for _, sheet in group)
        height = sum(sheet.height + PAD for _, sheet in group)
        canvas = Image.new("RGB", (width, height), (10, 10, 10))
        y = 0
        for _, sheet in group:
            canvas.paste(sheet, (0, y))
            y += sheet.height + PAD
        out = os.path.join(OUT, f"group-{start // PER + 1:02d}-"
                                + "-".join(key for key, _ in group)[:60] + ".png")
        canvas.save(out)
        sheets.append(out)
    print("\n".join(sheets))
    print(f"{len(rows)} rows over {len(sheets)} sheets")


main()
