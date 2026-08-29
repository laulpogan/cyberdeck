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
    room = canvas.width - 2 * PAD
    label, sub = fit(draw, label, room, FONT), fit(draw, sub, room, SMALL)
    x = PAD
    draw.text((x, y), label, font=FONT, fill=(230, 230, 230))
    draw.text((x, y + 19), sub, font=SMALL, fill=(170, 170, 170))
    y += LABEL_H
    kept = 0
    for im in frames:
        t = tile(im, H)
        if x + t.width > canvas.width - PAD:
            break
        canvas.paste(t, (x, y))
        draw.rectangle([x, y, x + t.width - 1, y + H - 1], outline=(70, 70, 70))
        x += t.width + 4
        kept += 1
    return y + H + PAD, kept, len(frames)


def fit(draw, text, maxw, font, tail=" …"):
    """Cut a line where the canvas actually ends.

    A character count is a guess about a font; `textlength` is a measurement of it. Three header
    lines on this sheet used to run past the right edge and truncate mid-word, which on a sheet
    whose whole job is a legible claim reads like the claim itself was cut short.
    """
    if draw.textlength(text, font=font) <= maxw:
        return text
    while text:
        cut = text[: -(8 if len(text) > 60 else 1)]
        if draw.textlength(cut + tail, font=font) <= maxw:
            return cut.rstrip() + tail
        text = cut
    return tail


def main():
    summary = json.load(open(os.path.join(OUT, "summary.json")))
    os.makedirs(OUT, exist_ok=True)
    # Two silent degradations used to live here: a row with no captured frames was printed to
    # stdout and dropped, and a reference that could not be found simply produced no reference
    # band — so a sheet could read as a completed side-by-side while showing only one side. Both
    # now go into the index, because the artifact has to state its own holes: the run's stdout is
    # something nobody re-reads, and `tail -1` hides a skip completely.
    no_frames = []
    no_ref = []
    # A strip that quietly drops its tail frames understates motion: the reader sees four frames and
    # believes the row sampled four. The count goes in the index even though the picture fits.
    thin = []
    for gap in summary["rows"]:
        app_files = [c["file"] for c in gap.get("clips") or []]
        app_files = [f for f in app_files if os.path.exists(f)]
        if not app_files:
            no_frames.append(gap["id"])
            print(f"skip {gap['id']}: no specimen frames captured")
            continue
        app = [Image.open(f).convert("RGB") for f in app_files]
        rel = gap.get("referenceRelation") or "informs"
        if rel == "self":
            # A self row cites no picture at all — it holds our own drawing to a claim our own markup
            # makes. This script crashed on os.path.join(RAW, None) the first time one existed: the
            # schema grew a third relation before the sheet knew about it. It gets a band that says so
            # in words, so the sheet never reads as a side-by-side with half of it missing.
            refs = []
        elif gap.get("reference") and os.path.exists(os.path.join(RAW, gap["reference"])):
            refs = ref_strip(os.path.join(RAW, gap["reference"]))
        else:
            refs = None
            no_ref.append((gap["id"], gap.get("reference")))

        # The canvas used to be as wide as the SPECIMEN needed. A reference frame tiled to the same
        # height is often wider than a specimen cell, so a six-frame reference silently lost four of
        # its frames to the right edge — a sheet held up as a side-by-side motion comparison while
        # showing one frame of the thing being imitated. Both strips now get room.
        app_w = sum(tile(a, H).width + 4 for a in app)
        ref_w = sum(tile(r, H).width + 4 for r in (refs or []))
        width = max(1180, app_w + 2 * PAD, ref_w + 2 * PAD)
        height = 2 * (LABEL_H + H + PAD) + 74
        canvas = Image.new("RGB", (width, height), (12, 13, 15))
        draw = ImageDraw.Draw(canvas)
        draw.text((PAD, PAD), f"{gap['id']}   [{gap['verdict']}]", font=FONT, fill=(235, 235, 235))
        room = width - 2 * PAD
        draw.text((PAD, PAD + 21), fit(draw, f"gap: {gap['gap']}", room, SMALL),
                  font=SMALL, fill=(200, 170, 110))
        y = PAD + 44
        # An origin row cites the frames where its demand was measured, not a picture that informs
        # this drawing. On paper the two look identical — a strip of frames over a specimen — so the
        # label says which claim the sheet is making, in the space the reader's eye is already in.
        if rel == "origin":
            ref_head = (f"borrowed from — {gap['reference']}   ORIGIN ONLY: these frames are where the "
                        f"demand was measured; they do not claim to inform this drawing, and the row is "
                        f"not coverage for {gap.get('component') or gap.get('route')}")
            claim = gap.get("originClaim") or ""
            ref_sub = f"why it is here: {claim}"   # measured to the edge below
        elif rel == "self":
            ref_head = ("no reference — SELF-ASSERTED: this row holds our own drawing to a claim our own "
                        "markup makes. No picture is cited, and none is missing.")
            ref_sub = f"why no reference: {gap.get('selfClaim') or ''}"
        else:
            ref_head = f"reference — {gap['reference']}"
            ref_sub = f"quoted figure: {gap['referenceFigure']}"
        ref_head = fit(draw, ref_head, room, SMALL)
        ref_sub = fit(draw, ref_sub, room, SMALL)
        if refs:
            y, kept_ref, total_ref = row(canvas, draw, y, refs, ref_head, ref_sub)
            if kept_ref < total_ref:
                thin.append((gap['id'], 'reference', kept_ref, total_ref))
        elif rel == "self":
            draw.text((PAD, y), fit(draw, ref_head, room, SMALL), font=SMALL, fill=(150, 190, 205))
            y += 18
            draw.text((PAD, y), fit(draw, ref_sub, room, SMALL), font=SMALL, fill=(150, 190, 205))
            y += 18
        else:
            draw.text((PAD, y), f"reference NOT ON DISK: {gap.get('reference')}", font=SMALL, fill=(220, 120, 120))
            y += 20
        y, kept_app, total_app = row(
            canvas, draw, y, app,
            f"specimen — {gap.get('component') or gap.get('route')}",
            f"this run: {gap.get('measured') or gap.get('detail') or 'held, not asserted'}")
        if kept_app < total_app:
            thin.append((gap['id'], 'specimen', kept_app, total_app))
        out = os.path.join(OUT, f"{gap['id']}.png")
        canvas.save(out)
        print(out)

    index = os.path.join(OUT, "sheet-index.txt")
    with open(index, "w") as f:
        for gap in summary["rows"]:
            f.write(f"{gap['verdict']:>5}  {gap['id']:<32} {gap.get('measured') or gap.get('detail') or 'held'}\n")
        # The summary carries a verdict, not the `assert` block: a held row is one that was never
        # asserted, so "asserted" means "not held". Reading a key that is not there is how this line
        # first printed "0 asserted row(s); -1 sheet(s) written" — an arithmetic sign that was the only
        # honest thing on the page.
        asserted = [g for g in summary["rows"] if g["verdict"] != "held"]
        f.write(f"\n# {len(asserted)} asserted row(s); {len(asserted) - len(no_frames)} sheet(s) written.\n")
        for gap_id in no_frames:
            f.write(f"# no filmstrip for {gap_id}: its assert kind samples markup across every "
                    "bright model, not motion — the component's frames live in the task-1 filmstrips.\n")
        for gap_id, kind, kept, total in thin:
            f.write(f"# {gap_id}'s {kind} strip shows {kept} of {total} sampled frames: the canvas ends "
                    "before them. Judge motion on the frames shown, or widen the sheet.\n")
        for gap_id, ref in no_ref:
            f.write(f"# {gap_id} was sheeted WITHOUT its reference ({ref} not found on disk): the "
                    "bottom row is an app-only strip and is not a comparison.\n")
    print(index)
    if no_frames or no_ref:
        print(f"# {len(no_frames)} row(s) without a filmstrip, {len(no_ref)} sheet(s) missing a reference "
              "— named in the index")


if __name__ == "__main__":
    main()
