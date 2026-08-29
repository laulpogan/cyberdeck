#!/usr/bin/env python3
"""Measure what each vault file actually is, and say what it is good for.

Two jobs, both of them measurements over `MANIFEST.json`:

**Frame count and speed.** Acquisition recorded a GIF's frames by scanning its bytes for
the image-separator byte, which counts every one of those bytes that happens to sit inside
LZW-compressed pixel data: one file came back as "805 frames" and, finding no graphic
control records where it expected them, was labelled *still*. A counter that reads 805 and
a label that reads *still* in the same row is the kind of row nobody should have to
adjudicate. The frame count, per-frame delays and loop length are taken here instead, off
decoded frames, and cross-checked against ImageMagick before this file was trusted. The
sheet says *still* only when a file really holds one frame.

**Status.**

The first haul kept 102 files and 61 of them did not name their subject: a MAGI query
returned `cat6cable-system-cable-management`, a motion-tracker query returned
`presidents-day`. They are on disk with honest provenance, and they are useless for reading
motion off, because the motion in `presidents-day` has nothing to do with a motion tracker.
The manifest cannot simply stay silent about that — a record with no statement of what it
is good for will be used as if it were good.

So this pass writes two fields onto every record and nothing else:

* `haul` — 1 for the pre-filter acquisition, 2 for the run that carries a `relevanceBasis`.
* `status` — `reference` when the file's own URL names its seed's subject, when it was
  reached by walking a tag that names the idiom, or when the host was trusted for a
  declared reason (a keyword search says "same idiom, not the prop"); `drift` otherwise.

`vault/sheet.py` refuses `drift` by default, so the sheets that get looked at are the ones a
person can act on. Re-run after every acquisition; the rule is a measurement over the
manifest, not a manual list anyone has to remember.

    python3 vault/mark.py            # rewrite the manifest with status fields
    python3 vault/mark.py --report   # print the counts, change nothing
"""
import json
import os
import sys

from PIL import Image, ImageSequence

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "MANIFEST.json")
SEEDS = os.path.join(HERE, "seeds.json")

REPORT = "--report" in sys.argv
manifest = json.load(open(MANIFEST))
words = json.load(open(SEEDS))["seeds"]

def motion(path):
    """Frames and timing, off decoded frames rather than a byte scan."""
    try:
        with Image.open(path) as im:
            delays = []
            count = 0
            for frame in ImageSequence.Iterator(im):
                count += 1
                delay = frame.info.get("duration")
                if delay:
                    delays.append(int(delay))
            return {
                "frames": count,
                "frameDelaysMs": [min(delays), max(delays)] if delays else None,
                "loopSeconds": round(sum(delays) / 1000, 2) if delays else None,
                "still": count == 1,
            }
    except Exception as error:  # unreadable by the decoder is a fact about the file
        return {"frames": None, "frameDelaysMs": None, "loopSeconds": None, "still": None,
                "unreadable": str(error)[:80]}


counts = {}
for record in manifest["files"].values():
    record.update(motion(os.path.join(HERE, record["file"])))
    seed = record["seed"]
    vocabulary = (words.get(seed) or {}).get("words")
    basis = record.get("relevanceBasis")
    record["haul"] = 2 if basis else 1
    named = bool(vocabulary) and any(w in (record.get("mediaUrl") or "").lower() for w in vocabulary)
    if basis and basis.startswith("tag:"):
        record["status"] = "reference"
        record["statusNote"] = f"reached through {basis}"
    elif basis and basis.startswith("returned by the host search"):
        record["status"] = "look-alike"
        record["statusNote"] = "the host's keyword or semantic search matched the words, not the prop"
    elif named:
        record["status"] = "reference"
        record["statusNote"] = "the file's own URL names the subject"
    else:
        record["status"] = "drift"
        record["statusNote"] = "no word from the seed's vocabulary appears in the URL or the page caption"
        if not vocabulary:
            record["statusNote"] += " (and the seed has no vocabulary in seeds.json)"
    counts.setdefault(record["status"], []).append(seed)

if not REPORT:
    json.dump(manifest, open(MANIFEST, "w"), indent=2)

total = len(manifest["files"])
print(f"{total} files")
for status, seeds in sorted(counts.items(), key=lambda kv: -len(kv[1])):
    print(f"  {status:11} {len(seeds):4}  across {len(set(seeds))} seeds: {', '.join(sorted(set(seeds))[:6])}")
print("haul 1 (no relevance basis recorded):", sum(1 for r in manifest["files"].values() if r["haul"] == 1))
print("haul 2:", sum(1 for r in manifest["files"].values() if r["haul"] == 2))
gifs = [r for r in manifest["files"].values() if r["kind"] == "gif"]
print(f"gifs: {len(gifs)}, of them one-frame: {sum(1 for r in gifs if r.get('still'))}")
print("  frame counts:", ", ".join(str(r.get("frames")) for r in sorted(gifs, key=lambda r: -(r.get("frames") or 0))[:8]), "…")
print("  unreadable by PIL:", sum(1 for r in manifest["files"].values() if r.get("unreadable")) or "none")
