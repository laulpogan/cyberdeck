#!/usr/bin/env python3
"""Pull the survey down as pictures and build something you can actually flip through.

The rest of this vault is careful. It tags by function, records how each row was got, and
refuses to quote a file nobody has looked at. That is the right machinery for building a
comparison, and it is the wrong machinery for the thing that comes first, which is looking at a
lot of interfaces and noticing what is good.

So this does the simple thing. It fetches the images the harvest already found, makes thumbnails,
and writes one local HTML page with everything on it, grouped by where it came from and filtered
by a text box. No tags, no verdicts, no coverage. Open `vault/raw/gallery.html` and scroll.

Two sources, two shapes. Are.na blocks carry a direct CDN URL and need no page fetch. Interface
In Game hides the image on the screenshot's own page, so that page is read first -- and the games
are chosen by feel rather than by function: a vibe list of titles whose interfaces are worth
looking at, matched against the game names the corpus already taught us in `functions.py`.

    python3 vault/survey.py                    # are.na, ~2.4k images
    python3 vault/survey.py GAMES=1            # add the games, ~2k more
    python3 vault/survey.py SETS=terminal-ruins,software-cyberdeck
    python3 vault/survey.py LIMIT=300          # a taste first

Everything lands under `vault/raw/`, which is gitignored. This is a private reference copy for
design study; nothing here is redistributed and no third-party image is ever committed.
"""
import collections
import concurrent.futures
import html
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw", "survey")
THUMBS = os.path.join(RAW, "thumb")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)

from PIL import Image  # noqa: E402  (after args, so a bad invocation fails before the import cost)


# Titles worth looking at, by feel. Not a taxonomy and not defensible -- it is a taste list, and
# the whole point of this pass is that taste comes before tagging. Matched loosely against the
# game names learned from the corpus, so a substring is enough.
VIBE = """cyberpunk deus ex system shock prey observation tacoma signalis alien duskers hacknet
uplink stellaris endless space elite eve starfield no man subnautica satisfactory factorio
barotrauma deep rock helldivers xcom frostpunk papers obra dinn orwell watch dogs death stranding
metal gear control doom fallout mass effect dead space destiny warframe titanfall apex halo
starcraft homeworld into the breach ftl rimworld dwarf kerbal outer wilds returnal ghostrunner
ruiner katana zero hardspace nier stray va 11 quadrilateral exapunks shenzhen opus beholder
not for broadcast mothergunship anno terra invicta highfleet nebulous oxygen not included void
sable citizen sleeper deathloop guilty gear""".split("\n")
VIBE = [v for line in VIBE for v in [line.strip()] if v]


def game_names(rows, floor=6):
    """The game names, learned from the slugs -- the same rule `functions.py` uses. A word-prefix
    heading six or more different screens is a title."""
    seen = collections.Counter()
    for r in rows:
        words = r["title"].split()
        for n in range(1, min(len(words), 8)):
            seen[" ".join(words[:n])] += 1
    return {p for p, n in seen.items() if n >= floor}


def title_of(row, known):
    words = row["title"].split()
    for n in range(min(len(words) - 1, 7), 0, -1):
        if " ".join(words[:n]) in known:
            return " ".join(words[:n])
    return words[0]


def iig_image_url(slug):
    """Interface In Game keeps the image on the screenshot's page, under an upload directory that
    is the publisher's own and not derivable from the slug. So the page is read once."""
    req = urllib.request.Request(f"https://interfaceingame.com/screenshots/{slug}/",
                                 headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        page = r.read().decode("utf8", "replace")
    urls = [u for u in re.findall(r"https://interfaceingame\.com/wp-content/uploads/[^\"' ]+", page)
            if slug in u and "favicon" not in u]
    urls.sort(key=lambda u: ("1920x1080" not in u, len(u)))
    return urls[0] if urls else None


def fetch(row):
    """One image to disk, named by its own id so a rerun is free. Returns (row, path) or None."""
    # A handful of are.na blocks carry no image URL at all -- a Channel or a Text block that the
    # harvest filed under an image kind. Nothing to fetch, and not an error worth stopping for.
    if not row.get("source"):
        return None
    ident = row["source"].rstrip("/").split("/")[-1].split("?")[0][:80]
    dest = os.path.join(RAW, f"{row['set'][:40]}--{ident}")
    if not os.path.splitext(dest)[1]:
        dest += ".jpg"
    if os.path.exists(dest) and os.path.getsize(dest) > 8_000:
        return row, dest
    try:
        src = row["source"]
        if row["from"] == "interfaceingame":
            src = iig_image_url(ident)
            if not src:
                return None
        req = urllib.request.Request(src, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            blob = r.read()
    except Exception:
        return None
    if len(blob) < 8_000:
        return None
    # Interface In Game serves an MP4 wherever the screen's behaviour is the point, from a URL
    # that still ends .jpg. Those are worth having on disk, but they are not thumbnails, so they
    # are written under their real extension and left out of the grid.
    if blob[4:8] == b"ftyp":
        dest = os.path.splitext(dest)[0] + ".mp4"
    open(dest, "wb").write(blob)
    return row, dest


def thumb(path, width=560):
    """A thumbnail wide enough that on-screen type is still legible. A 200px tile of an interface
    is a colour swatch: you can see it is a dark panel with orange in it and nothing else."""
    dest = os.path.join(THUMBS, os.path.basename(path) + ".webp")
    if os.path.exists(dest):
        return dest
    try:
        im = Image.open(path).convert("RGB")
    except Exception:
        return None
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=82)
    return dest


PAGE = """<!doctype html><meta charset=utf-8><title>Survey</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#0b0c0e;color:#d8dade;
     font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
header{position:sticky;top:0;z-index:9;background:#0b0c0eee;backdrop-filter:blur(8px);
       padding:14px 16px;border-bottom:1px solid #22252a;display:flex;gap:12px;flex-wrap:wrap;
       align-items:baseline}
h1{font-size:14px;margin:0;font-weight:600;letter-spacing:.04em}
input{background:#15171b;border:1px solid #2a2e35;color:#d8dade;padding:6px 10px;border-radius:4px;
      font:inherit;min-width:230px}
.count{color:#7d838c}
nav a{color:#8fb4d9;text-decoration:none;margin-right:10px;white-space:nowrap}
nav a:hover{text-decoration:underline}
section{padding:22px 16px 6px}
h2{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8a9099;
   margin:0 0 12px;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
figure{margin:0;background:#131519;border:1px solid #22252a;border-radius:5px;overflow:hidden}
figure img{display:block;width:100%;height:auto;background:#000}
figcaption{padding:6px 8px;color:#767c85;font-size:11px;word-break:break-all}
a.shot{display:block}
</style>
<header>
  <h1>SURVEY</h1>
  <input id=q placeholder="filter — try: terminal, cockpit, dos, anime">
  <span class=count id=n></span>
  <nav id=jump></nav>
</header>
<main id=main>__CARDS__</main>
<script>
const q=document.getElementById('q'),figs=[...document.querySelectorAll('figure')],
      n=document.getElementById('n');
document.getElementById('jump').innerHTML=[...document.querySelectorAll('section')]
  .map(s=>`<a href="#${s.id}">${s.dataset.name}</a>`).join('');
function run(){
  const t=q.value.toLowerCase().trim();
  let shown=0;
  for(const f of figs){const hit=!t||f.dataset.k.includes(t);f.hidden=!hit;shown+=hit?1:0}
  for(const s of document.querySelectorAll('section'))
    s.hidden=![...s.querySelectorAll('figure')].some(f=>!f.hidden);
  n.textContent=shown+' shown';
}
q.addEventListener('input',run);run();
</script>
"""


def main():
    everything = json.load(open(os.path.join(HERE, "EXAMPLES.json")))
    rows = [r for r in everything
            if r["from"] == "are.na" and r["kind"] in ("Image", "Attachment")]
    if args.get("GAMES"):
        games = [r for r in everything if r["from"] == "interfaceingame"]
        known = game_names(games)
        for r in games:
            name = title_of(r, known)
            if any(v in name for v in VIBE):
                rows.append(dict(r, set=name))
    if args.get("SETS"):
        want = set(args["SETS"].split(","))
        rows = [r for r in rows if r["set"] in want]
    if args.get("LIMIT"):
        rows = rows[:int(args["LIMIT"])]

    os.makedirs(THUMBS, exist_ok=True)
    got = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for i, result in enumerate(pool.map(fetch, rows), 1):
            if result:
                got.append(result)
            if i % 200 == 0:
                print(f"  {i}/{len(rows)} fetched, {len(got)} kept")
    print(f"{len(got)} of {len(rows)} images on disk")

    by_set = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        paths = list(pool.map(lambda g: thumb(g[1]), got))
    for (row, path), tp in zip(got, paths):
        if tp and not path.endswith(".mp4"):
            by_set.setdefault(row["set"], []).append((row, path, tp))

    out = []
    for name in sorted(by_set, key=lambda s: -len(by_set[s])):
        items = by_set[name]
        cards = []
        for row, path, tp in items:
            key = html.escape(f"{name} {row.get('title', '')}".lower(), quote=True)
            cards.append(
                f'<figure data-k="{key}"><a class=shot href="{html.escape(os.path.relpath(path, RAW))}">'
                f'<img loading=lazy src="{html.escape(os.path.relpath(tp, RAW))}"></a>'
                f'<figcaption>{html.escape(row.get("title", "") or "—")[:90]}</figcaption></figure>')
        out.append(f'<section id="{html.escape(name)}" data-name="{html.escape(name)}">'
                   f'<h2>{html.escape(name)} · {len(items)}</h2>'
                   f'<div class=grid>{"".join(cards)}</div></section>')

    dest = os.path.join(RAW, "gallery.html")
    open(dest, "w").write(PAGE.replace("__CARDS__", "".join(out)))
    print("gallery:", dest)


main()
