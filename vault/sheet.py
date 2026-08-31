#!/usr/bin/env python3
"""Turn the vault into sheets that show motion, not thumbnails.

`vault/MANIFEST.json` says what is on disk and where it came from. This takes each file and
puts its frames side by side on one row: a GIF is sampled at four points along its own
timeline -- frame counts and per-frame delays come out of the file's bytes, so the sampling
is in the loop's own time, not an arbitrary interval -- and the row carries the caption the
source page gave the picture, the page it came from, and how the acquisition decided it was
relevant at all. The last one matters when deciding whether to trust a row: a reference
reached by walking the tag `radar-sweep` is evidence, and a GIF a keyword search handed back
is a look-alike.

Rows are stacked into one PNG per seed, so the comparison with the app's own filmstrips
(`app/verify/filmstrip.mjs`, `app/verify/sheet.py`) happens in a single image: reference on
top, ours underneath, and the difference is something you see rather than something you are
told about.

    python3 vault/sheet.py                    # every seed, one sheet each
    python3 vault/sheet.py SEED=hologlobe     # one seed
    python3 vault/sheet.py OUT=/tmp/vsheets   # where to write
    python3 vault/sheet.py VERIFIED=1 FRAMES=8 PER_SHEET=4   # only files an eye passed

`VERIFIED=1` is the mode the motion reading is done in. The seed sheets answer "what did the
search bring back"; this answers "what did an eye actually pass", which is the only question a
frame reading may be written against — the seed sheets still carry the meme cards, and a reading
written off one of those is a reading of a meme.
"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "MANIFEST.json")
OUT = os.environ.get("OUT", "/tmp/vsheets")
SEED = os.environ.get("SEED", "")
# mark.py decides what a file is good for. The default sheet shows only the rows a person
# can act on, and says what it left out -- a silent filter is how a bad reference set keeps
# looking respectable.
INCLUDE = set(filter(None, os.environ.get("INCLUDE", "").split(",")))
INCLUDE_DRIFT = "drift" in INCLUDE
INCLUDE_LOOKALIKE = "look-alike" in INCLUDE
ROW_H = 132
LABEL_W = 460
CELL_W = 150
FRAMES = int(os.environ.get("FRAMES", "4"))
VERIFIED = os.environ.get("VERIFIED") == "1"
PER_SHEET = int(os.environ.get("PER_SHEET", "4"))

FONT_CANDIDATES = [
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/SFMono-Regular.otf",
    "/Library/Fonts/DejaVuSansMono.ttf",
    "/System/Library/Fonts/Supplemental/Courier New.ttf",
]


def font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def wrap(draw, text, font, width):
    words, lines, line = text.split(), [], ""
    for word in words:
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=font) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines[:4]


def frame_times(n):
    if n <= 1:
        return [0]
    return [round(i * (n - 1) / (FRAMES - 1)) for i in range(FRAMES)]


def cells(path):
    """Sample the asset across its own timeline. A still gives one cell and says so."""
    im = Image.open(path)
    frames = []
    try:
        count = getattr(im, "n_frames", 1)
    except Exception:
        count = 1
    for index in frame_times(count):
        try:
            im.seek(index)
            frames.append(im.convert("RGB").copy())
        except (EOFError, OSError):
            break
    return frames, count


def row(draw_path, label_font, small_font, record):
    strip = Image.new("RGB", (CELL_W * FRAMES, ROW_H - 34), (12, 12, 12))
    path = os.path.join(HERE, record["file"])
    if not os.path.exists(path):
        return None
    frames, count = cells(path)
    for i, frame in enumerate(frames[:FRAMES]):
        thumb = frame.copy()
        thumb.thumbnail((CELL_W - 4, ROW_H - 40))
        strip.paste(thumb, (i * CELL_W + 2, 2))
    caption = "  ".join([
        record.get("captionOnPage") or "(no caption on page)",
    ])
    frames = record.get("frames")
    timing = ("still" if record.get("still")
              else f"{frames}f · {record.get('loopSeconds')}s" if frames and record.get("loopSeconds")
              else f"{frames}f · no delay in file" if frames
              else "not decoded — run vault/mark.py")
    second = " · ".join([
        record["kind"], timing,
        record.get("statusNote") or record.get("relevanceBasis") or "basis unrecorded",
    ])
    if VERIFIED:
        # The verified mode groups files across seeds, so the seed tag on the title line says
        # nothing about this row. The basename is what lets a reading name its evidence.
        second = os.path.basename(record["file"])[:58] + "\n" + second
    return strip, caption, second


def build(seed, records, name=None):
    os.makedirs(OUT, exist_ok=True)
    big, small = font(15), font(12)
    probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    rows = []
    for record in records:
        built = row(None, big, small, record)
        if built:
            rows.append((built, record))
    if not rows:
        return None
    height = 46 + len(rows) * ROW_H
    sheet = Image.new("RGB", (LABEL_W + CELL_W * FRAMES + 12, height), (18, 18, 18))
    draw = ImageDraw.Draw(sheet)
    draw.text((12, 12), f"{seed} — {len(rows)} reference assets, sampled across each one's own timeline", font=big, fill=(230, 230, 230))
    y = 46
    for (strip, caption, second), record in rows:
        lines = wrap(draw, caption, big, LABEL_W - 16)
        lines += wrap(draw, second, small, LABEL_W - 16)
        for offset, line in enumerate(lines[:5]):
            draw.text((12, y + 6 + offset * 17), line, font=big if offset == 0 else small,
                      fill=(226, 226, 226) if offset == 0 else (150, 150, 150))
        sheet.paste(strip, (LABEL_W + 8, y))
        draw.rectangle([LABEL_W + 6, y - 2, LABEL_W + CELL_W * FRAMES + 10, y + ROW_H - 34], outline=(60, 60, 60))
        y += ROW_H
    out = os.path.join(OUT, name or f"{seed}-references.png")
    sheet.save(out)
    return out


def main():
    manifest = json.load(open(MANIFEST))["files"]
    seeds = {}
    skipped = {}
    for record in manifest.values():
        status = record.get("status", "unmarked -- run vault/mark.py")
        if status == "drift" and not INCLUDE_DRIFT:
            skipped[status] = skipped.get(status, 0) + 1
            continue
        if status == "look-alike" and not INCLUDE_LOOKALIKE:
            skipped[status] = skipped.get(status, 0) + 1
            continue
        seeds.setdefault(record["seed"], []).append(record)
    if skipped:
        print("excluded from sheets (set INCLUDE=drift,look-alike to see them): "
              + ", ".join(f"{n} {k}" for k, n in sorted(skipped.items())))
    if VERIFIED:
        eye = json.load(open(os.path.join(HERE, "EYEBALL.json")))
        passed = [r for r in manifest.values() if eye.get(r["file"], {}).get("contentVerified")]
        passed.sort(key=lambda r: (r["seed"], r["file"]))
        os.makedirs(OUT, exist_ok=True)
        written = []
        for start in range(0, len(passed), PER_SHEET):
            group = passed[start:start + PER_SHEET]
            out = build(f"verified {start // PER_SHEET + 1}", group,
                        f"verified-{start // PER_SHEET + 1:02d}.png")
            if out:
                written.append(out)
        print(f"{len(passed)} files an eye passed, in sheets of {PER_SHEET} at {FRAMES} frames")
        print("\n".join(written))
        return

    written = []
    for seed, records in sorted(seeds.items()):
        if SEED and seed != SEED:
            continue
        out = build(seed, records)
        if out:
            written.append(out)
    print("\n".join(written) or "nothing to build")


main()
