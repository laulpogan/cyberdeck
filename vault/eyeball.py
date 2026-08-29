#!/usr/bin/env python3
"""Put the moving vault files in front of eyes, and record what the eyes said.

`vault/mark.py` decides `reference` / `look-alike` / `drift` from *text*: the tag on the page, the
caption, the anchor's title, the search the host was given. Text is what an automated harvest can
see, and text turned out not to be enough. The three largest moving files under the flagship seed
`motion-tracker` carry `work: Aliens` in the manifest, and their frames are a Mega Man cartoon, a
man falling over in a hallway, and a woman holding a fan to her face with the caption "I'M YOUR
BIGGEST FAN". Every duration statistic in the vault is measured honestly off those files — and a
100ms median delay on a fan is not a statement about sci-fi interfaces.

This tool is the missing stage. For one seed's moving files it writes an eight-frame strip per
file (sampled across that file's own decoded timeline, the same way `mark.py` counts frames), and
a checklist where a person records what the frames actually show. Until a file is marked
`yes, this is the prop`, it may not be quoted in a motion spec, and `MAPPING.md` says so.

    python3 vault/eyeball.py SEED=motion-tracker        # strips + checklist rows
    python3 vault/eyeball.py                            # every seed with moving files

Marks go in `vault/EYEBALL.json` as `{"<raw path>": {"contentVerified": true, "shows": "..."}}`.
"""
import glob
import json
import os
import subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.environ.get("OUT", "/tmp/eyeball")
SEED = os.environ.get("SEED")
TILE_W, TILE_H, COPIES = 200, 150, 8


def strip(path, dest):
    """Eight frames spread across the GIF's own frame list, coalesced so partial frames compose."""
    work = dest[:-4]
    subprocess.run(["magick", path, "-coalesce", "+adjoin", f"{work}-%04d.png"],
                   check=True, stderr=subprocess.DEVNULL)
    frames = sorted(glob.glob(f"{work}-*.png"))
    if not frames:
        return None
    picks = [frames[round(i * (len(frames) - 1) / (COPIES - 1))] for i in range(COPIES)]
    sheet = Image.new("RGB", (TILE_W * COPIES, TILE_H), (8, 8, 8))
    for index, frame in enumerate(picks):
        tile = Image.open(frame).convert("RGB")
        tile.thumbnail((TILE_W - 4, TILE_H - 4))
        sheet.paste(tile, (index * TILE_W + 2, 2))
    sheet.save(dest)
    for frame in frames:
        os.remove(frame)
    return sheet.size


def main():
    manifest = json.load(open(os.path.join(HERE, "MANIFEST.json")))["files"]
    marks_path = os.path.join(HERE, "EYEBALL.json")
    marks = {}
    if os.path.exists(marks_path):
        marks = json.load(open(marks_path))

    moving = [r for r in manifest.values()
              if (r.get("frames") or 0) > 1 and r.get("status") != "unmarked"]
    if SEED:
        moving = [r for r in moving if r["seed"] == SEED]
    moving.sort(key=lambda r: (r["seed"], -r["frames"]))

    checked = 0
    lines = ["# Eyeball log", "",
             "One row per moving file that a motion spec might quote. `marked` is a person's",
             "judgement about the *frames*, recorded in `EYEBALL.json`; nothing else here is",
             "text-derived and therefore nothing else here is trustworthy about a picture.",
             "",
             "| seed | file | frames | loop | status | marked | shows |",
             "| --- | --- | --- | --- | --- | --- | --- |"]
    for record in moving:
        rel = record["file"]
        seed_dir = os.path.join(OUT_DIR, record["seed"])
        os.makedirs(seed_dir, exist_ok=True)
        dest = os.path.join(seed_dir, os.path.basename(rel) + ".png")
        made = None
        if not os.path.exists(dest):
            try:
                made = strip(os.path.join(HERE, rel), dest)
            except (subprocess.CalledProcessError, FileNotFoundError, OSError):
                made = None
        mark = marks.get(rel, {})
        verified = {True: "**yes**", False: "no"}.get(mark.get("contentVerified"), "☐")
        loop = f"{record['loopSeconds']:.1f}s" if record.get("loopSeconds") else "—"
        lines.append(f"| {record['seed']} | `{os.path.basename(rel)[:44]}` | {record['frames']} "
                     f"| {loop} | {record['status']} | {verified} "
                     f"| {mark.get('shows') or '_awaiting eyes_'} |")
        if mark.get("contentVerified") is not None:
            checked += 1

    open(os.path.join(HERE, "EYEBALL.md"), "w").write("\n".join(lines) + "\n")
    if not os.path.exists(marks_path):
        json.dump(marks, open(marks_path, "w"), indent=1)
    print(f"{len(moving)} moving files stripped into {OUT_DIR}; "
          f"{checked} carry a person's judgement, {len(moving) - checked} do not.")


main()
