#!/usr/bin/env python3
"""Put the reference and the specimen in one picture, per gap the gauntlet asserted.

`app/verify/gauntlet.mjs` measures and writes `summary.json` plus the specimen's own frames.
This adds the other half of the comparison: the verified reference's frames, sampled along the
GIF's own timeline, on the row above. A rate is hard to argue about in prose and easy to see —
the beam's tilt against the plank that licensed it, the marker's lane against the level.

Row labels carry the number the instrument measured and the figure the reference was quoted
with, because the sheet is read by someone deciding whether the number is right, and a picture
without its measurement is a vibe.

    BASE=http://127.0.0.1:5299/ node app/verify/gauntlet.mjs
    python3 app/verify/gauntlet-sheet.py OUT=/tmp/gauntlet
"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
# Both spellings the rack already uses: `OUT=/tmp/x python3 …` and the npm form
# `python3 … OUT=/tmp/x`, which is how `verify:pair` passes its path.
for arg in sys.argv[1:]:
    if "=" in arg:
        k, v = arg.split("=", 1)
        os.environ[k] = v
OUT = os.environ.get("OUT") or "/tmp/gauntlet"
RAW = os.path.join(ROOT, "vault", "raw")
H = 168
LABEL_H = 46
PAD = 10

try:
    FONT = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 15)
    SMALL = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 12)
except OSError:                                     # pragma: no cover - fontless boxes
    FONT = ImageFont.load_default()
    SMALL = FONT


def ref_strip(path, n=6):
    """Sample the reference along its own timeline, in the file's frame order."""
    im = Image.open(path)
    frames = []
    try:
        i = 0
        while True:
            im.seek(i)
            frames.append(im.convert("RGB").copy())
            i += 1
    except EOFError:
        pass
    if not frames:
        return None
    picks = [frames[min(int(k * len(frames) / n), len(frames) - 1)] for k in range(n)]
    return picks


def tile(img, h):
    w = max(1, round(img.width * h / img.height))
    return img.resize((w, h))


def row(canvas, draw, y, frames, label, sub):
    x = PAD
    draw.text((x, y), label, font=FONT, fill=(230, 230, 230))
    draw.text((x, y + 19), sub, font=SMALL, fill=(170, 170, 170))
    y += LABEL_H
    for im in frames:
        t = tile(im, H)
        if x + t.width > canvas.width - PAD:
            break
        canvas.paste(t, (x, y))
        draw.rectangle([x, y, x + t.width - 1, y + H - 1], outline=(70, 70, 70))
        x += t.width + 4
    return y + H + PAD


def main():
    summary = json.load(open(os.path.join(OUT, "summary.json")))
    os.makedirs(OUT, exist_ok=True)
    for gap in summary["rows"]:
        app_files = [c["file"] for c in gap.get("clips") or []]
        app_files = [f for f in app_files if os.path.exists(f)]
        if not app_files:
            print(f"skip {gap['id']}: no specimen frames captured")
            continue
        app = [Image.open(f).convert("RGB") for f in app_files]
        ref_path = os.path.join(RAW, gap["reference"])
        refs = ref_strip(ref_path) if os.path.exists(ref_path) else None

        width = max(1180, sum(tile(a, H).width + 4 for a in app) + 2 * PAD)
        height = 2 * (LABEL_H + H + PAD) + 74
        canvas = Image.new("RGB", (width, height), (12, 13, 15))
        draw = ImageDraw.Draw(canvas)
        draw.text((PAD, PAD), f"{gap['id']}   [{gap['verdict']}]", font=FONT, fill=(235, 235, 235))
        draw.text((PAD, PAD + 21), f"gap: {gap['gap']}", font=SMALL, fill=(200, 170, 110))
        y = PAD + 44
        if refs:
            y = row(canvas, draw, y, refs, f"reference — {gap['reference']}",
                    f"quoted figure: {gap['referenceFigure']}")
        else:
            draw.text((PAD, y), f"reference NOT ON DISK: {gap['reference']}", font=SMALL, fill=(220, 120, 120))
            y += 20
        row(canvas, draw, y, app, f"specimen — {gap.get('component') or gap.get('route')}",
            f"this run: {gap.get('measured') or gap.get('detail') or 'held, not asserted'}")
        out = os.path.join(OUT, f"{gap['id']}.png")
        canvas.save(out)
        print(out)

    index = os.path.join(OUT, "sheet-index.txt")
    with open(index, "w") as f:
        for gap in summary["rows"]:
            f.write(f"{gap['verdict']:>5}  {gap['id']:<32} {gap.get('measured') or gap.get('detail') or 'held'}\n")
    print(index)


if __name__ == "__main__":
    main()
