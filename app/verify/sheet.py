#!/usr/bin/env python3
"""Build one review sheet per component from the frames filmstrip.mjs captured.

Four strips stacked, so the eye compares the thing it is supposed to compare:

    measured · entrance      frames left to right at their measured timestamps
    measured · loop          the same specimen watched for seconds
    refused  · entrance      the same specimen with the rack's evidence switch off
    refused  · loop

Each tile is labelled with when it was taken and whether its bytes differed from the
frame before it, so a strip that looks static can be read as "static" or as "captured
too slowly" without guessing. The caption carries the mark inventory the sampler read in
the page, and the specimen's height, because a refusal that shrank the drawing is a
different defect from a refusal that stopped it.

    python3 app/verify/sheet.py /tmp/film gauge radar
"""
import json
import os
import sys

from PIL import Image, ImageDraw

TILE_MAX_W = 320
SHEET_W = 1600
LABEL_H = 16
CAPTION_H = 15
GAP = 4


def draw_strip(sheet, x, y, strip, frames, title, tile_w):
    draw = ImageDraw.Draw(sheet)
    draw.text((x + 2, y), title, fill=(240, 180, 90))
    y += LABEL_H
    if not frames:
        draw.text((x + 4, y + 4), "no frames", fill=(150, 150, 150))
        return y + 20
    percol = max(1, min(len(frames), max(1, SHEET_W // tile_w)))
    rows = (len(frames) + percol - 1) // percol
    row_h = 0
    for r in range(rows):
        cx = x
        tallest = 0
        for c in range(percol):
            index = r * percol + c
            if index >= len(frames):
                break
            frame = frames[index]
            path = os.path.join(sheet_dir, frame["file"])
            if not os.path.exists(path):
                continue
            tile = Image.open(path).convert("RGB")
            scale = min(1.0, tile_w / tile.size[0])
            tile = tile.resize((max(1, int(tile.size[0] * scale)), max(1, int(tile.size[1] * scale))))
            sheet.paste(tile, (cx, y))
            mark = "▲" if frame["changed"] else " "
            colour = (150, 220, 140) if frame["changed"] else (120, 120, 120)
            draw.text((cx + 1, y + tile.size[1] + 1),
                      f"{mark}+{frame['t']}ms a{frame['animations']}", fill=colour)
            cx += tile_w + GAP
            tallest = max(tallest, tile.size[1])
        y += tallest + LABEL_H + GAP
        row_h = tallest
    return y + 4, row_h


if __name__ == "__main__":
    out = sys.argv[1]
    keys = sys.argv[2:] or [
        name[:-5] for name in sorted(os.listdir(out)) if name.endswith(".json")
    ]
    for key in keys:
        meta_path = os.path.join(out, f"{key}.json")
        if not os.path.exists(meta_path):
            print("missing", meta_path)
            continue
        sheet_dir = out
        meta = json.load(open(meta_path))
        conditions = meta.get("conditions", {})

        measured = conditions.get("measured", {})
        refused = conditions.get("refused", {})
        frames = [f for shot in (measured, refused) for strip in ("enter", "loop")
                  for f in (shot.get(strip) or [])]
        if not frames:
            print("no frames for", key)
            continue
        widest = max(Image.open(os.path.join(out, f["file"])).size[0] for f in frames)
        tallest = max(Image.open(os.path.join(out, f["file"])).size[1] for f in frames)
        tile_w = min(TILE_MAX_W, max(120, SHEET_W // 6))
        tile_h = int(tallest * (tile_w / widest)) if widest else 120
        rows_needed = max(1, (len(measured.get("enter") or []) + 5) // 6) \
            + max(1, (len(measured.get("loop") or []) + 5) // 6) \
            + max(1, (len(refused.get("enter") or []) + 5) // 6) \
            + max(1, (len(refused.get("loop") or []) + 5) // 6)
        height = rows_needed * (tile_h + LABEL_H + GAP) + 4 * (LABEL_H + CAPTION_H + 12) + 40
        sheet = Image.new("RGB", (SHEET_W, max(400, height)), (12, 12, 14))
        draw = ImageDraw.Draw(sheet)
        inv_m = measured.get("inventory") or {}
        inv_r = refused.get("inventory") or {}
        draw.text((4, 4), f"{key} — frames from {meta.get('base')}", fill=(240, 240, 240))
        draw.text((4, 20),
                  f"measured: marks={len(inv_m.get('marks') or [])} moving={inv_m.get('moving')} "
                  f"still={inv_m.get('still')} h={inv_m.get('height')}   |   "
                  f"refused: marks={len(inv_r.get('marks') or [])} moving={inv_r.get('moving')} "
                  f"still={inv_r.get('still')} h={inv_r.get('height')}",
                  fill=(150, 190, 220))
        y = 42
        for title, shot in (("measured", measured), ("refused", refused)):
            for strip, label in (("enter", "entrance"), ("loop", "loop")):
                result = draw_strip(sheet, 4, y, strip, shot.get(strip) or [],
                                    f"{title} · {label}", tile_w)
                y = result[0] if isinstance(result, tuple) else result
        path = os.path.join(out, f"{key}-sheet.png")
        sheet.save(path)
        print(path, sheet.size)
