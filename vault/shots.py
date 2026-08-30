#!/usr/bin/env python3
"""Fetch the game screens `functions.py` nominated, and put them in front of eyes.

`functions.py` reads a screen-type label off Interface In Game's own URL slug. That label is a
claim, not a verdict -- somebody else looked at the screen and named it, and a name is exactly
the kind of evidence this vault has been burned by before. So this closes the loop: it fetches
the actual picture and stacks it into a contact sheet, and only what survives that look goes into
`CATALOG.md`.

The page carries the image; the image URL is not derivable from the slug alone because the upload
directory is the publisher's own, so each page is fetched once and the `-1920x1080` variant read
out of it. Some of them are not images at all. Interface In Game publishes an MP4 wherever the
screen's behaviour is the point -- `stellaris-zoom`, `duskers-boot-utility` and
`endless-space-2-galaxy-transition` are all video -- which is a fact about the source worth
knowing: it films the ones that move. So the payload is sniffed rather than trusted, and a video
is sampled into a filmstrip instead of being written under a `.jpg` name that will not open.

Files land under `vault/raw/iig/`, which is gitignored: this is a private reference copy for
design study and no third-party image is ever committed. Only notes travel.

Interface In Game disallows agents in robots.txt. The operator authorised overriding that for
private non-commercial reference, and the override is recorded on every commit that uses it. It
does not extend to bot-detection: a Cloudflare challenge is a control, not a fence, and this tool
does not try to pass one.

    python3 vault/shots.py SLUGS=/tmp/picks.txt SHEET=/tmp/short-functions
"""
import os
import re
import subprocess
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw", "iig")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read() if binary else r.read().decode("utf8", "replace")


def kind(blob):
    """What the bytes actually are. A URL's extension is the publisher's filing convention, not a
    promise about the payload, and this source keeps that promise less than half the time."""
    if blob[:3] == b"\xff\xd8\xff":
        return "jpg"
    if blob[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if blob[4:8] == b"ftyp":
        return "mp4"
    return None


def existing(slug):
    for ext in ("jpg", "png", "mp4"):
        path = os.path.join(RAW, f"{slug}.{ext}")
        if os.path.exists(path) and os.path.getsize(path) > 20_000:
            return path
    return None


def filmstrip(video, slug, shots=6):
    """A video sampled evenly across its own length and tiled into one still. The transition is
    the interface in these clips -- a zoom, a boot, a tech tree opening -- so one frame pulled out
    of the middle would be the least informative thing available."""
    out = os.path.join(RAW, f"{slug}.strip.png")
    if os.path.exists(out):
        return out
    stage = os.path.join("/tmp", f".strip-{slug}")
    subprocess.run(["rm", "-rf", stage], check=False)
    os.makedirs(stage)
    secs = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
         "default=nw=1:nk=1", video], capture_output=True, text=True).stdout.strip() or 0)
    step = max(secs / shots, 0.1)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", video, "-vf",
                    f"fps=1/{step:.3f},scale=640:-2", "-fps_mode", "vfr",
                    os.path.join(stage, "f-%03d.png")], check=False)
    frames = sorted(f for f in os.listdir(stage) if f.endswith(".png"))[:shots]
    if not frames:
        print(f"  video decoded to nothing: {slug}")
        return None
    ims = [Image.open(os.path.join(stage, f)).convert("RGB") for f in frames]
    cols, w, h = 3, ims[0].width, ims[0].height
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h), (10, 11, 13))
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    sheet.save(out)
    return out


def fetch(slug):
    have = existing(slug)
    if have:
        return filmstrip(have, slug) if have.endswith(".mp4") else have
    page = get(f"https://interfaceingame.com/screenshots/{slug}/")
    urls = [u for u in re.findall(r'https://interfaceingame\.com/wp-content/uploads/[^"\' ]+', page)
            if slug in u and "favicon" not in u]
    # The `-1920x1080` derivative is the full screen; bare and thumbnail variants also appear on
    # the page and the smallest of them is a 150px tile, which is not something an eye can read.
    urls.sort(key=lambda u: ("1920x1080" not in u, len(u)))
    if not urls:
        print(f"  no image on page: {slug}")
        return None
    blob = get(urls[0], binary=True)
    ext = kind(blob)
    if not ext:
        print(f"  neither an image nor a video: {slug}")
        return None
    dest = os.path.join(RAW, f"{slug}.{ext}")
    open(dest, "wb").write(blob)
    return filmstrip(dest, slug) if ext == "mp4" else dest


def main():
    slugs = [l.strip() for l in open(args["SLUGS"]) if l.strip() and not l.startswith("#")]
    os.makedirs(RAW, exist_ok=True)
    got = []
    for slug in slugs:
        try:
            path = fetch(slug)
        except Exception as err:  # a dead page is a fact about the source, not a crash
            print(f"  {type(err).__name__}: {slug} — {err}")
            continue
        if path:
            got.append((slug, path))
            print(f"  ok {slug}")

    # Two screens to a sheet, and no smaller. `clip-sheet.py` is not reused here: it tiles eight
    # uniform GIF frames eight-across, and eight-across of a 1920x1080 screenshot puts the
    # on-screen text at roughly a fifth of its size. The whole value of these rows is the
    # verbatim text, so the sheet is sized to keep the text readable and the count per sheet low.
    per = int(args.get("PER", "2"))
    stem = args.get("SHEET", "/tmp/shots")
    width = int(args.get("WIDTH", "1400"))
    for start in range(0, len(got), per):
        block = got[start:start + per]
        tiles = []
        for slug, path in block:
            im = Image.open(path).convert("RGB")
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
            tiles.append((slug, im))
        head = 26
        sheet = Image.new("RGB", (width, sum(t.height + head for _, t in tiles)), (10, 11, 13))
        draw = ImageDraw.Draw(sheet)
        try:
            face = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 16)
        except OSError:
            face = ImageFont.load_default()
        y = 0
        for slug, im in tiles:
            draw.text((6, y + 4), slug, font=face, fill=(220, 222, 226))
            sheet.paste(im, (0, y + head))
            y += im.height + head
        dest = f"{stem}-{start // per + 1:02d}.png"
        sheet.save(dest)
        print("sheet:", dest)
    print(f"{len(got)} of {len(slugs)} screens fetched.")


main()
