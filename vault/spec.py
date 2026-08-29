#!/usr/bin/env python3
"""Read a motion spec off the frames of a verified vault file, in real units.

`vault/MAPPING.md` has carried the component side of this for a while and nothing on the
reference side, because a motion spec has to come out of pictures. Only files an eye has
marked `contentVerified: true` are measured here (see `vault/eyeball.py`), and each row says
what the eye saw, so a number is never the whole of a claim.

What is measurable off frames, and what is not:

  loop / rate      the GIF's own frame delays, summed; and the frame at which the picture is
                   again within a hair of frame zero, which is the period in seconds rather
                   than in frames.
  entry order      a 4x3 grid over the frame; the first frame at which each cell changes. The
                   sequence is the reference's argument about what enters first.
  what stays still the cells that never change. This is the half most often missing from a
                   spec, and the half the library keeps getting wrong.
  easing           for motion that is an extent growing in one saturated ink (a bar filling, a
                   trail being drawn): the share of the final extent present at half the
                   duration. 0.5 is linear; below is front-loaded (ease-out), above is
                   back-loaded (ease-in). Reported as N/A where the motion is not an extent —
                   a rotating word or a cycling dot has no extent to measure, and saying so is
                   the honest answer.

    python3 vault/spec.py                      # every verified file
    python3 vault/spec.py OUT=vault/SPECS.md   # where to write (default vault/SPECS.md)
"""
import json
import os
from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("OUT", os.path.join(HERE, "SPECS.md"))
CELLS = (4, 3)          # cols, rows of the entry-order grid
MAX_FRAMES = 80


def frames_of(path):
    im = Image.open(path)
    out, delays = [], []
    try:
        i = 0
        while i < MAX_FRAMES:
            im.seek(i)
            delays.append(float(im.info.get("duration", 100) or 100))
            out.append(im.convert("RGB").resize((160, 120)))
            i += 1
    except EOFError:
        pass
    return out, delays


def cells_of(frame):
    w, h = frame.size
    return [frame.crop((c * w // CELLS[0], r * h // CELLS[1],
                        (c + 1) * w // CELLS[0], (r + 1) * h // CELLS[1]))
            for r in range(CELLS[1]) for c in range(CELLS[0])]


def head(prev, frame):
    """The centroid of the pixels that changed: where the moving part of a HUD is.

    Two wrong versions came first. The extent measure counted saturated ink and found 1176
    pixels on every frame of the green progress bar, because the *track* is green ink and the
    thing that travels is a bright head along it. The bright-centroid measure then found the
    two white terminal glyphs parked at the ends of that track and called the centre still.
    What moves is what changed between frames, so that is what gets averaged — and a marker
    crossing a named lane is the quantity these references actually carry.
    """
    diff = ImageChops.difference(prev, frame).convert("L")
    w, h = diff.size
    data = list(diff.getdata())
    sx = sy = n = 0
    for index, value in enumerate(data):
        if value > 40:
            sx += index % w
            sy += index // w
            n += 1
    return (sx / n / w, sy / n / h) if n > 12 else None


def energy_of(diff):
    """Mean absolute difference per pixel, averaged over the three channels."""
    return sum(sum(ch.getdata()) for ch in diff.split()) / (3.0 * diff.width * diff.height)


def saturated(frame):
    """Pixels that are strongly one colour — the ink a HUD draws its moving parts in."""
    hsv = frame.convert("HSV").split()
    sat, val = list(hsv[1].getdata()), list(hsv[2].getdata())
    return sum(1 for s, v in zip(sat, val) if s > 140 and v > 90)


def measure(path):
    frames, delays = frames_of(path)
    if len(frames) < 3:
        return None
    base = frames[0]
    seconds = sum(delays) / 1000.0
    # Return to frame zero, which is the loop in seconds rather than in frames. The threshold
    # has to be relative: the first cut here asked only for a *small* difference, and on a
    # frame of mostly black a couple of moving pixels is already small, so a 2.4s rotating word
    # reported a loop of 0.16s. A loop is a return to the start, not a quiet frame.
    away = [energy_of(ImageChops.difference(base, frame)) for frame in frames]
    ceiling = max(away) if any(away) else 0.0
    floor = max(0.35, ceiling * 0.08)
    # A return only counts as a trough: lower than the floor *and* lower than the typical
    # frame, after the picture has actually left. A bar that fills once and stops never
    # returns, and "one-shot, no loop" is the spec rather than a missing measurement.
    median_away = sorted(away)[len(away) // 2]
    period = None
    for index in range(2, len(frames)):
        if away[index] <= floor and away[index] < 0.5 * median_away and max(away[1:index] or [0]) > floor:
            period = sum(delays[:index]) / 1000.0
            break
    # Entry order and stillness, cell by cell.
    grid = [cells_of(frame) for frame in frames]
    starts, never = [], []
    for cell in range(CELLS[0] * CELLS[1]):
        first = None
        moved = 0.0
        for index in range(1, len(frames)):
            energy = energy_of(ImageChops.difference(grid[index - 1][cell], grid[index][cell]))
            moved = max(moved, energy)
            if first is None and energy > 1.5:
                first = index
        starts.append(first)
        if moved < 0.6:
            never.append(cell)
    # Extent curve, where an extent exists.
    curve = [saturated(f) for f in frames]
    peak = max(curve)
    extent = None
    if peak > 40:
        norm = [c / peak for c in curve]
        half = len(norm) // 2
        mid = norm[:half][-1] if half else 0.0
        # Is the extent growing at all, or merely flickering in place?
        growth = norm[-1] - norm[0]
        monotone = sum(1 for a, b in zip(curve, curve[1:]) if b >= a - peak * 0.05) >= len(curve) - 2
        if abs(growth) > 0.25 and monotone:
            kind = "linear"
            if mid < 0.42:
                kind = "front-loaded (ease-out)"
            elif mid > 0.58:
                kind = "back-loaded (ease-in)"
            extent = {"shareAtHalf": round(mid, 2), "character": kind}
    heads = [h for h in (head(frames[i - 1], frames[i]) for i in range(1, len(frames)))
             if h]
    travel = None
    if len(heads) >= 4:
        xs = [h[0] for h in heads]
        ys = [h[1] for h in heads]
        span_x, span_y = max(xs) - min(xs), max(ys) - min(ys)
        distance = (span_x ** 2 + span_y ** 2) ** 0.5
        if distance > 0.04:
            # Rate profile: how far along the way the head is at half the frames, measured
            # between its own extremes. 0.5 is a constant rate; the idiom is honest about
            # whether a marker crosses a lane evenly or rushes and settles.
            half = len(xs) // 2
            at_half = (xs[half] - min(xs)) / span_x if span_x > 0.02 else 0.5
            travel = {"spanOfFrame": round(distance, 3),
                      "atHalfOfDuration": round(at_half, 2),
                      "character": ("constant rate" if 0.38 <= at_half <= 0.62
                                    else "front-loaded" if at_half < 0.38 else "back-loaded"),
                      "monotone": sum(1 for a, b in zip(xs, xs[1:]) if b >= a - 0.02) >= len(xs) - 3}
    return {
        "frames": len(frames),
        "seconds": round(seconds, 2),
        "medianDelayMs": round(sorted(delays)[len(delays) // 2], 1),
        "periodSeconds": round(period, 2) if period else None,
        "entryOrder": [i for i, s in enumerate(starts) if s is not None][:8],
        "firstChangeByCell": starts,
        "stillCells": len(never),
        "extent": extent,
        "travel": travel,
        "motionAmplitude": round(ceiling, 2),
    }


def main():
    marks = json.load(open(os.path.join(HERE, "EYEBALL.json")))
    manifest = json.load(open(os.path.join(HERE, "MANIFEST.json")))["files"]
    # The manifest is keyed by basename and the marks by the `file` field, which carries the
    # `raw/` prefix. Index by the latter, or every mark looks orphaned -- a false alarm that
    # cost a detour here.
    by_path = {record["file"]: record for record in manifest.values()}
    verified = [rel for rel, mark in marks.items() if mark.get("contentVerified")]
    lines = ["# Motion specs read off the vault's verified frames",
             "",
             "Generated by `python3 vault/spec.py`. Only files an eye marked `contentVerified:",
             "true` in `vault/EYEBALL.json` appear; the sentence under each measurement is what",
             "the eye saw, because a number without a description of its picture is how the last",
             "harvest ended up quoting a kitchen fan for a motion tracker.",
             "",
             "Durations are the GIF's own frame delays. `period` is when the picture is again",
             "within a hair of frame zero — a loop in seconds rather than in frames. `first change",
             "by cell` walks a 4x3 grid, left-to-right then top-to-bottom, and gives the first",
             "frame index at which that cell moved: the reference's own argument about what enters",
             "first. `N/A` on an extent is a finding, not a gap in the tool — a rotating word has",
             "no extent, and saying so is the point.",
             ""]
    # The judgement table: which specimen each verified file is evidence about. It lives in
    # `SPECS-FOR.json` so it can be argued with in a diff, and it is checked against the eye's
    # own marks -- a ledger naming a file nobody verified is the exact failure this vault has
    # been built to make impossible.
    for_path = os.path.join(HERE, "SPECS-FOR.json")
    if os.path.exists(for_path):
        ledger = json.load(open(for_path))
        verified_set = {os.path.basename(rel) for rel in verified}
        stray = [name for name in ledger if not name.startswith("_")
                 and name not in verified_set]
        if stray:
            raise SystemExit("SPECS-FOR.json quotes files no eye verified: " + ", ".join(stray))
        lines += ["", "## What the specs say to do", "", "| file | quoted for | the reading |",
                  "| --- | --- | --- |"]
        for name, entry in ledger.items():
            if name.startswith("_"):
                continue
            lines.append(f"| `{name[:40]}…` | `{'`, `'.join(entry['for'])}` | {entry['reading']} |")
        lines += ["", "The rows underneath are measured out of the files; the table above is the",
                  "judgement step and is meant to be disagreed with."]

    for rel in sorted(verified):
        record = by_path.get(rel)
        mark = marks[rel]
        m = measure(os.path.join(HERE, rel))
        lines.append(f"## `{os.path.basename(rel)}`")
        lines.append("")
        lines.append(f"- seed: `{record['seed']}`  ·  source: {record['mediaUrl'] or record['sourcePage']}")
        lines.append(f"- eye: {mark['shows']}")
        if not m:
            lines.append("- **not measurable**: fewer than three decodable frames.")
            lines.append("")
            continue
        lines.append(f"- measured: {m['frames']} frames over {m['seconds']}s, median delay "
                     f"{m['medianDelayMs']}ms, loop {m['periodSeconds'] or 'no return to frame zero'}")
        lines.append(f"- first change by cell (4x3, index = frame): `{m['firstChangeByCell']}`")
        lines.append(f"- cells that never move: {m['stillCells']} of {CELLS[0] * CELLS[1]}")
        lines.append(f"- extent (area of one saturated ink): " + (
            "`N/A` — the ink does not grow; see travel" if not m["extent"] else
            f"{m['extent']['shareAtHalf']} of its final extent present at half the duration — "
            f"{m['extent']['character']}"))
        lines.append(f"- travel of the bright head: " + (
            "`N/A` — no bright marker crosses the frame" if not m["travel"] else
            f"{m['travel']['spanOfFrame']} of the frame crossed, "
            f"{m['travel']['atHalfOfDuration']} of the way along at half the duration — "
            f"{m['travel']['character']}"
            + (", monotone" if m["travel"]["monotone"] else ", not monotone (it comes back)")))
        lines.append(f"- motion amplitude (max difference from frame zero): {m['motionAmplitude']}"
                     + (" — **below 0.4: the sampled frames barely change, so no rate or period "
                        "is quotable from this file**" if m["motionAmplitude"] < 0.4 else ""))
        lines.append("")
    open(OUT, "w").write("\n".join(lines) + "\n")
    print(f"{len(verified)} verified files measured into {os.path.relpath(OUT, HERE)}")


main()
