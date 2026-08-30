#!/usr/bin/env python3
"""Find the windows worth keeping in a reel, without asking an eye to watch the whole thing.

Every clip taken from this vault so far was chosen by a person or an agent looking at a contact
sheet and naming a start and a duration. That works and it does not scale: a hundred and
thirty-five reels is a hundred and thirty-five sheets to read, and most of the runtime of any
one of them is not the part anybody wants.

A studio process reel makes the job easier than it looks. The whole file is interface, so there
is no "find the screen" problem left to solve -- the only question is which stretches are
*moving*, and that is a measurement over frame differences rather than a judgement about
content. Two numbers do the work:

  cut     a spike in frame difference. One frame bearing no resemblance to the last is an edit,
          and an edit is a boundary, not motion. Cutting across one produces a clip that
          measures the editor's timing rather than the interface's.
  energy  the mean frame difference *inside* a segment, between its cuts. A static hold scores
          near zero however long it sits there, which is exactly the case that wasted the first
          film harvest -- a panel on screen for two and a half seconds, not animating.

So: split the file at its cuts, score each segment by energy, drop the ones too short to hold a
loop, and hand back the best few as START and DUR. The eye still decides what a clip *shows*.
This only decides where to point it.

    python3 vault/windows.py FILE=vault/raw/.src/22681804.mp4          # rank the windows
    python3 vault/windows.py FILE=... TOP=3 MIN=4                      # three, at least 4s each
    python3 vault/windows.py ALL=1                                     # every cached reel
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops, ImageStat

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "raw", ".src")
args = dict(a.split("=", 1) if "=" in a else (a, "1") for a in sys.argv[1:])

FPS = float(args.get("FPS", 4))       # sampling rate for the difference signal, not for output
MIN = float(args.get("MIN", 3))       # a segment shorter than this cannot hold a loop
TOP = int(args.get("TOP", 4))
CUT = float(args.get("CUT", 0.18))    # frame difference that reads as an edit rather than motion


def signal(path):
    """Mean absolute frame-to-frame difference, sampled small and grey. Returns (diffs, seconds).

    PIL does this without numpy: ImageChops.difference is the absolute difference per pixel and
    ImageStat hands back its mean. The vault already depends on PIL and on nothing else here, and
    a new dependency to compute one average would be a poor trade.
    """
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-vf",
                        f"fps={FPS},scale=160:-1,format=gray", "-fps_mode", "vfr",
                        os.path.join(tmp, "f-%05d.png")], check=True)
        names = sorted(os.listdir(tmp))
        if len(names) < 3:
            return [], 0.0
        frames = [Image.open(os.path.join(tmp, n)).convert("L").copy() for n in names]
    diffs = [ImageStat.Stat(ImageChops.difference(frames[i], frames[i - 1])).mean[0] / 255.0
             for i in range(1, len(frames))]
    return diffs, len(frames) / FPS


def windows(diffs):
    """Split at cuts, score what is left by how much it moves."""
    bounds = [0] + [i for i, d in enumerate(diffs) if d > CUT] + [len(diffs)]
    out = []
    for a, b in zip(bounds, bounds[1:]):
        span = diffs[a + 1:b]          # skip the cut frame itself; it is the boundary
        seconds = len(span) / FPS
        if seconds < MIN or not span:
            continue
        # Energy is the mean; steadiness rewards a segment that keeps moving rather than one
        # that twitches once and sits. A loop is steady by definition.
        energy = sum(span) / len(span)
        steady = sum(1 for d in span if d > energy * 0.4) / len(span)
        out.append({"start": round((a + 1) / FPS, 1), "seconds": round(seconds, 1),
                    "energy": round(energy, 4), "steady": round(steady, 2),
                    "score": round(energy * steady, 4)})
    return sorted(out, key=lambda w: -w["score"])


def report(path):
    diffs, total = signal(path)
    if not diffs:
        return {"file": path, "windows": [], "note": "too few frames to difference"}
    picks = windows(diffs)[:TOP]
    print(f"\n{os.path.basename(path)}  {total:.0f}s")
    if not picks:
        print("  nothing sustained -- all cuts, or all still. Recorded rather than dropped.")
    for w in picks:
        print(f"  START={w['start']:<7} DUR={w['seconds']:<6} energy {w['energy']:.4f}"
              f"  steady {w['steady']:.2f}")
    return {"file": os.path.relpath(path, HERE), "totalSeconds": round(total, 1),
            "windows": picks}


def main():
    if args.get("ALL"):
        files = [os.path.join(SRC, n) for n in sorted(os.listdir(SRC)) if n.endswith(".mp4")]
    elif args.get("FILE"):
        files = [args["FILE"]]
    else:
        sys.exit("windows.py needs FILE=<mp4> or ALL=1")
    out = [report(f) for f in files]
    dest = os.path.join(HERE, "WINDOWS.json")
    json.dump(out, open(dest, "w"), indent=1)
    print(f"\n{len(out)} file(s) -> {dest}")


main()
