#!/usr/bin/env python3
"""Tile a derived clip's frames into one strip an eye can read.

`vault/clip.mjs` derives a GIF from a window of a longer film; this puts its frames on one sheet
with each frame's own index and the window it came from, because the thing being decided is
"does an interface fill this frame, and what moves" — and a 6 fps window of a descent looks
different from a loop of a spinner. The strip is labelled with what the derivation was, so the
eye is never asked to guess how many seconds it is looking at.

    python3 vault/clip-sheet.py <frames-dir> <out.png> <caption>
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

frames_dir, out, caption = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
files = sorted(f for f in os.listdir(frames_dir) if f.endswith(".png"))
if not files:
    sys.exit("no frames to sheet -- the derivation produced nothing, which is a finding, not a sheet")

try:
    font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 14)
except OSError:
    font = ImageFont.load_default()

ims = [Image.open(os.path.join(frames_dir, f)).convert("RGB") for f in files]
w, h = ims[0].size
PER_ROW = 8
rows = (len(ims) + PER_ROW - 1) // PER_ROW
HEAD, LAB, PAD = 30, 16, 6
canvas = Image.new("RGB", (PER_ROW * (w + PAD) + PAD, HEAD + rows * (h + LAB + 2 * PAD) + PAD), (11, 12, 14))
d = ImageDraw.Draw(canvas)
d.text((PAD + 2, PAD), caption, font=font, fill=(215, 215, 215))
for i, im in enumerate(ims):
    cx = PAD + (i % PER_ROW) * (w + PAD)
    cy = HEAD + PAD + (i // PER_ROW) * (h + LAB + 2 * PAD)
    d.text((cx + 2, cy), f"#{i + 1}", font=font, fill=(190, 190, 190))
    canvas.paste(im, (cx, cy + LAB))
canvas.save(out)
print(f"{out}  ({len(ims)} frames, {rows} row(s))")
