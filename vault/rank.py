#!/usr/bin/env python3
"""Rank the vault's moving files for how much of the frame looks like an interface.

The eye test is the authority — `eyeball.py` exists because text-derived relevance turned out
to be wrong about pictures — but 131 moving files at five per sheet is 26 looks at strips, and
the hit rate on the first five sheets was four in twenty-nine. The vault is thick with fan
clips of the *characters* in the works whose interfaces are famous, because that is what GIF
hosts index: a search for the RIG returns a spaceship, a search for insertion sync returns a
person in a white room.

So this is a sieve, not a judge. Three properties are measurable off the pixels and separate
diegetic-interface footage from character footage well enough to order a queue:

  flatness   -- log-entropy of a 4-bit-per-channel histogram. An interface is built from flat
                fields and a handful of inks; a filmed scene is full of gradients and texture.
  ground     -- mean luminance of a border band. The idiom is light on dark.
  hot motion -- mean chroma of pixels that actually change between sampled frames. A HUD moves
                in saturated ink; a face moves in skin.
  coverage   -- the share of pixels that change. A whole frame in motion is a camera, not a
                readout, so the middle band scores best and both ends are penalised.

Nothing here decides relevance. It prints a queue; `eyeball.py` still decides what a file
shows, and only an eye's mark lets a file into a motion spec.
"""
import json
import math
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLES = 8


def sample_frames(path, n=SAMPLES):
    try:
        im = Image.open(path)
    except OSError:
        return []
    frames = []
    try:
        i = 0
        while i < 2000:
            im.seek(i)
            frames.append(im.convert("RGB").resize((120, 90)))
            i += 1
    except EOFError:
        pass
    if not frames:
        return []
    return [frames[round(k * (len(frames) - 1) / (n - 1))] for k in range(n)] \
        if len(frames) >= n else frames


def measure(frames):
    base = frames[len(frames) // 2]
    # Flatness: entropy of a coarse colour histogram, normalised to 0..1.
    hist = base.histogram()
    total = sum(hist) or 1
    entropy = -sum((c / total) * math.log2(c / total) for c in hist if c)
    flatness = 1.0 - min(1.0, entropy / 12.0)
    # Ground: the border band, away from whatever sits in the middle.
    px = list(base.crop((0, 0, base.width, 8)).getdata()) + \
        list(base.crop((0, base.height - 8, base.width, base.height)).getdata())
    ground = sum(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in px) / len(px) / 255.0
    # Motion: which pixels change, and in what colour.
    prev, changed, chroma, n = frames[0], 0, 0.0, 0
    for frame in frames[1:]:
        a, b = list(prev.getdata()), list(frame.getdata())
        for (r0, g0, b0), (r1, g1, b1) in zip(a, b):
            if abs(r1 - r0) + abs(g1 - g0) + abs(b1 - b0) > 42:
                changed += 1
                chroma += (max(r1, g1, b1) - min(r1, g1, b1))
                n += 1
        prev = frame
    steps = max(1, len(frames) - 1)
    coverage = changed / (steps * base.width * base.height)
    hot = (chroma / n / 255.0) if n else 0.0
    return {
        "flatness": round(flatness, 3),
        "ground": round(ground, 3),
        "hotMotion": round(hot, 3),
        "coverage": round(coverage, 4),
    }


def score(m):
    # Penalise a frame that is entirely in motion (that is a camera or a body, not a readout)
    # and a frame that is entirely still (nothing to take a spec from).
    band = 1.0 - min(1.0, abs(m["coverage"] - 0.12) / 0.30)
    dark = 1.0 - min(1.0, m["ground"] / 0.42)
    return round(m["flatness"] * 0.40 + m["hotMotion"] * 0.25 + dark * 0.20 + band * 0.15, 4)


def main():
    manifest = json.load(open(os.path.join(HERE, "MANIFEST.json")))["files"]
    marks = {}
    eye_path = os.path.join(HERE, "EYEBALL.json")
    if os.path.exists(eye_path):
        marks = json.load(open(eye_path))
    only_unseen = "--seen" not in sys.argv
    rows = []
    for record in manifest.values():
        frames = record.get("frames") or 0
        if frames <= 2 or record.get("status") == "unmarked":
            continue
        if only_unseen and record["file"] in marks:
            continue
        measured = measure(sample_frames(os.path.join(HERE, record["file"])))
        if not measured:
            continue
        rows.append(dict(file=record["file"], seed=record["seed"], frames=frames,
                         **measured, score=score(measured)))
    rows.sort(key=lambda r: -r["score"])
    json.dump(rows, open(os.path.join(HERE, "RANK.json"), "w"), indent=1)
    print(f"{len(rows)} moving files ranked into vault/RANK.json"
          f"{' (already-seen files included)' if not only_unseen else ' (already-seen files skipped)'}.")
    for row in rows[:int(os.environ.get("TOP", "24"))]:
        print(f"  {row['score']:.3f}  {row['seed'][:18]:18} f={row['frames']:<4} "
              f"flat={row['flatness']:.2f} ground={row['ground']:.2f} "
              f"hot={row['hotMotion']:.2f} cov={row['coverage']:.3f}  "
              f"{os.path.basename(row['file'])[:38]}")


main()
