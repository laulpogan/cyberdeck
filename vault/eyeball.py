#!/usr/bin/env python3
"""Put the vault's moving files in front of eyes, and record what those eyes said.

`vault/mark.py` decides `reference` / `look-alike` / `drift` from *text*: the tag on the page,
the caption, the anchor's title, the search the host was given. Text is what an automated
harvest can see, and text turned out not to be enough. The three largest moving files under
the flagship seed `motion-tracker` carry `work: Aliens` in the manifest, and their frames are a
Mega Man cartoon, a man falling over in a hallway, and a woman holding a kitchen fan to her
face. Every duration statistic in the vault was measured honestly off those files — and a
100ms median delay on a fan is not a statement about sci-fi interfaces.

This is the missing stage. For each seed it writes sheets: one row per file, eight frames
sampled across that file's own decoded timeline, next to a label carrying the seed, the frame
count, the loop, and how the haul thought it was relevant. Then the mark says what the frames
actually show, and until a file carries that mark it may not be quoted in a motion spec.

**Provenance of a mark is part of the mark.** The first nine rows recorded `eyeballedBy:
"person"`, which was a tool default and not true: an agent looked at the strips. A file whose
whole job is to say how a picture became trustworthy may not carry a guess about who looked at
it, so the actor is written explicitly, and the sheet the eyes were on is named.

    python3 vault/eyeball.py SEED=magi                     # sheets + checklist for one seed
    python3 vault/eyeball.py                               # every seed with moving files
    python3 vault/eyeball.py MARK 'raw/x.gif=yes|no=what the frames show'   # record a verdict
"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.environ.get("OUT", "/tmp/eyeball")
SEED = os.environ.get("SEED")
PER_SHEET = int(os.environ.get("ROWS", "5"))
TILE_W, TILE_H, COPIES = 168, 126, 8
LABEL_W = 300
# Whoever actually looked. The default is the backbone that read the first nine sheets, and it
# stayed correct only for as long as one actor did the looking. A second model reading a sheet
# and writing that default would be the exact substitution this file was rewritten to stop --
# the mark would name eyes that never saw the frames. So the actor is an input.
EYE = os.environ.get("EYE", "agent-eye(qwen/dot-backbone)")


def font(size=13):
    for name in ("DejaVuSans-Bold.ttf", "Helvetica.ttc", "Arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def frames_of(path, limit=400):
    """The GIF's own frames, coalesced by the decoder. Falls back to one frame for a still."""
    try:
        im = Image.open(path)
    except OSError:
        return []
    out = []
    try:
        index = 0
        while index < limit:
            im.seek(index)
            out.append(im.convert("RGB"))
            index += 1
    except EOFError:
        pass
    return out


def row(record, sheet_index):
    """One file: label block then eight frames across its own timeline."""
    frames = frames_of(os.path.join(HERE, record["file"]))
    height = TILE_H + 44
    sheet = Image.new("RGB", (LABEL_W + TILE_W * COPIES, height), (12, 12, 14))
    draw = ImageDraw.Draw(sheet)
    picks = [frames[round(i * (len(frames) - 1) / (COPIES - 1))] for i in range(COPIES)] \
        if len(frames) >= COPIES else frames
    label = (f"#{sheet_index} {os.path.basename(record['file'])[:34]}\n"
             f"seed {record['seed']}  frames {record.get('frames')}\n"
             f"loop {'%.1fs' % record['loopSeconds'] if record.get('loopSeconds') else 'none'}"
             f"  {record['status']}\n{record.get('caption', '')[:44]}")
    draw.multiline_text((8, 8), label, fill=(222, 226, 228), font=font(12), spacing=4)
    for i, tile in enumerate(picks):
        tile = tile.copy()
        tile.thumbnail((TILE_W - 6, TILE_H - 6))
        sheet.paste(tile, (LABEL_W + i * TILE_W + 3, 6))
    return sheet


def main():
    manifest = json.load(open(os.path.join(HERE, "MANIFEST.json")))["files"]
    marks_path = os.path.join(HERE, "EYEBALL.json")
    marks = json.load(open(marks_path)) if os.path.exists(marks_path) else {}

    argv = sys.argv[1:]
    if argv and argv[0] == "MARK":
        index = {}
        index_path = os.path.join(OUT_DIR, SEED or "all", "index.json")
        if os.path.exists(index_path):
            index = json.load(open(index_path))
        # A row number is only meaningful against the sheets that printed it. One run marked
        # twelve rows against a stale `index.json` left in a previous OUT directory, and the
        # descriptions landed on eleven files nobody had looked at — one of them as `verified`,
        # which is a fabricated provenance wearing a real tool default. So a row-addressed mark
        # has to name the sheet it was read off, and that sheet has to be beside the index.
        for spec in argv[1:]:
            # '<raw/path>=yes|what the frames show', or '#7=yes|...' addressed by sheet row.
            path, _, rest = spec.partition("=")
            if path.strip().startswith("#"):
                # `row_key`, not `row`: `row` is the name of the strip-drawing function, and
                # assigning it here shadowed that name for the whole of `main`, so the
                # sheet-building path died on an unbound local.
                row_key = path.strip().lstrip("#")
                named_sheet = os.environ.get("SHEET")
                if not named_sheet:
                    sys.exit("MARK refused: a row number is only meaningful against a named "
                             "sheet. Pass SHEET=/path/to/sheet-NN.png so the mark records what "
                             "was in front of the eye, and so a stale index in another OUT "
                             "directory cannot be mistaken for the one you read.")
                if os.path.dirname(os.path.abspath(named_sheet)) != os.path.dirname(index_path):
                    sys.exit("MARK refused: SHEET names %s, but the row index resolved against "
                             "%s. Those are different batches — mark by raw path, or point OUT "
                             "at the directory that made the sheet."
                             % (os.path.abspath(named_sheet), index_path))
                if row_key not in index:
                    sys.exit("MARK refused: no row " + row_key + " in the sheet index — "
                             "address a row that exists.")
                path = index[row_key]
            verdict, _, shows = rest.partition("|")
            known = {r["file"] for r in manifest.values()}
            if path.strip() not in known:
                sys.exit("MARK refused: " + repr(path.strip()) + " is not a file in "
                         "MANIFEST.json. A mark on a path that does not exist is invisible to "
                         "every checklist, which is worse than no mark at all.")
            record = {
                "contentVerified": verdict.strip().lower().startswith("y"),
                "shows": (shows or verdict).strip()[:600] or "no description recorded",
                "eyeballedBy": EYE,
                # What was actually in front of the eyes. The default describes eyeball.py's
                # own sheet; a mark made off a clip.mjs strip saw a different number, and
                # writing 8 there would misreport the evidence the verdict rests on.
                "framesViewed": os.environ.get(
                    "FRAMES_VIEWED",
                    f"{COPIES} frames sampled across the file's own timeline"),
                "sheet": os.environ.get("SHEET", "see OUT dir"),
            }
            # A re-pass must not quietly overwrite a verdict. A second eye walked this queue
            # once already and its `no` landed on a file an earlier eye had marked `verified`,
            # turning the ledger count from 18 to 17 with nothing printed about it — the later
            # mark always won because it was the later mark. Flipping a verdict is allowed,
            # arguing for it is required, and the argument is kept beside the new verdict.
            prior = marks.get(path.strip()) or {}
            if prior and bool(prior.get("contentVerified")) != record["contentVerified"]:
                reason = os.environ.get("CORRECTION", "").strip()
                if not reason:
                    sys.exit(
                        "MARK refused: %s already reads contentVerified=%s, marked by %s. "
                        "Flipping a verdict needs CORRECTION=<what the frames show that the "
                        "first reading got wrong>, so the ledger keeps both readings and the "
                        "reason the second one won. If the first reading was right, do not "
                        "mark this row again.\n  first reading said: %s"
                        % (path.strip(), bool(prior.get("contentVerified")),
                           prior.get("eyeballedBy", "unknown eye"),
                           (prior.get("shows") or "")[:200]))
                record["correction"] = reason[:600]
                record["superseded"] = {
                    "contentVerified": bool(prior.get("contentVerified")),
                    "eyeballedBy": prior.get("eyeballedBy", "unknown eye"),
                    "shows": (prior.get("shows") or "")[:300],
                }
            marks[path.strip()] = record
        json.dump(marks, open(marks_path, "w"), indent=1, ensure_ascii=False, sort_keys=True)
        print(f"{len(marks)} marks on disk.")
        return

    moving = [r for r in manifest.values()
              if (r.get("frames") or 0) > 1 and r.get("status") != "unmarked"]
    if SEED:
        moving = [r for r in moving if r["seed"] == SEED]
    moving.sort(key=lambda r: (r["seed"], -int(r.get("frames") or 0)))

    # `QUEUE` re-orders the not-yet-seen files by how much of the frame looks like an
    # interface (vault/rank.py): flat colour fields, dark ground, saturated ink in motion.
    # It is a queue for the eye, never a verdict -- only a mark below lets a file into a spec.
    queue = os.environ.get("QUEUE")
    if queue:
        rank = json.load(open(os.path.join(HERE, "RANK.json")))
        by_file = {r["file"]: r for r in moving}
        moving = [by_file[r["file"]] for r in rank
                  if r["file"] in by_file and r["file"] not in marks]
        if queue.isdigit():
            moving = moving[:int(queue)]

    os.makedirs(os.path.join(OUT_DIR, SEED or "all"), exist_ok=True)
    # A row-number index, written beside the sheets. Sheet labels are necessarily truncated and
    # a truncated hash invites a guess -- three marks in this vault were written against hashes
    # that had been filled in rather than copied, and described files that do not exist. With
    # the index, a mark is addressed by row and resolved to a real path by the tool.
    index_path = os.path.join(OUT_DIR, SEED or "all", "index.json")
    json.dump({str(i + 1): record["file"] for i, record in enumerate(moving)},
              open(index_path, "w"), indent=1)
    written = []
    for start in range(0, len(moving), PER_SHEET):
        block = moving[start:start + PER_SHEET]
        rows = [row(record, start + i + 1) for i, record in enumerate(block)]
        gap = Image.new("RGB", (rows[0].width, 6), (40, 40, 44))
        stacked = Image.new("RGB", (rows[0].width, sum(r.height for r in rows) + 6 * len(rows)),
                            (12, 12, 14))
        y = 0
        for r in rows:
            stacked.paste(r, (0, y))
            y += r.height + 6
        dest = os.path.join(OUT_DIR, SEED or "all", f"sheet-{start // PER_SHEET + 1:02d}.png")
        stacked.save(dest)
        written.append(dest)

    lines = ["# Eyeball log", "",
             "One row per moving file that a motion spec might quote. `marked` is what an eye",
             "(agent or person, named in `EYEBALL.json`) said about the *frames*. Nothing else",
             "here is text-derived, and nothing text-derived is trustworthy about a picture.",
             "",
             "| seed | file | frames | loop | status | marked | shows |",
             "| --- | --- | --- | --- | --- | --- | --- |"]
    checked = 0
    for record in moving:
        rel = record["file"]
        mark = marks.get(rel, {})
        if mark.get("contentVerified") is not None:
            checked += 1
        loop = f"{record['loopSeconds']:.1f}s" if record.get("loopSeconds") else "—"
        verified = {True: "**yes**", False: "no"}.get(mark.get("contentVerified"), "☐")
        # The full relative path, not a truncated basename. A row that reads
        # `magi--media.tenor.com_DsOG5u4CNHkAAAA1_fud` opens nothing: there is no such file, no
        # status and no way back to the sheet. A ledger whose rows cannot be reopened is a list
        # of rumours, so the path is the row.
        lines.append(f"| {record['seed']} | `{rel}` | {record['frames']} "
                     f"| {loop} | {record['status']} | {verified} "
                     f"| {(mark.get('shows') or '_awaiting eyes_')[:70]} |")
    open(os.path.join(HERE, "EYEBALL.md"), "w").write("\n".join(lines) + "\n")

    print(f"{len(moving)} moving files; {checked} carry an eye's judgement, "
          f"{len(moving) - checked} do not.")
    for path in written:
        print("  sheet:", path)


main()
