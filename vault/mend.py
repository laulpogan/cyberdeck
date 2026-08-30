#!/usr/bin/env python3
"""Repair the are.na rows in `EXAMPLES.json`: point them at are.na's copy, not the original host.

`harvest.mjs` recorded each block's `source.url`, which is where the person who saved it found
it. For a block uploaded straight to are.na that happens to be the CDN and everything works. For
a block saved off someone else's page it is that page's host, and those hosts mostly refuse a
hotlink — which is why `sci-fi-control-panels` yielded four images out of ninety-seven while
`sci-fi-ui`, whose blocks are nearly all direct uploads, yielded five hundred out of five hundred
and forty-nine. The shortfall looked like a thin channel and was a broken field.

Are.na keeps its own copy of every image block at `image.original.url`. This re-reads each
channel and prefers that, falling back to the source URL only when there is no copy. It also
records `origin`, so a block saved from the Met or from Typeset In The Future can still be traced
back to where it actually came from.

Are.na disallows agents in robots.txt. The operator authorised overriding that for private
non-commercial reference; the override is recorded on the commit. No challenge is bypassed.

    python3 vault/mend.py              # every channel already in EXAMPLES.json
    python3 vault/mend.py CHANNELS=sci-fi-control-panels,cockpit
"""
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.join(HERE, "EXAMPLES.json")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf8"))


def contents(slug):
    out, page = [], 1
    while True:
        try:
            data = get(f"https://api.are.na/v2/channels/{slug}/contents?per=100&page={page}")
        except Exception as err:
            print(f"  {slug} page {page}: {type(err).__name__} {err}")
            break
        block = data.get("contents") or []
        out += block
        if len(block) < 100:
            break
        page += 1
        time.sleep(0.4)  # the API is free and this is a courtesy, not a requirement
    return out


def main():
    rows = json.load(open(DOC))
    arena = [r for r in rows if r["from"] == "are.na"]
    others = [r for r in rows if r["from"] != "are.na"]
    slugs = sorted({r["set"] for r in arena})
    if args.get("CHANNELS"):
        slugs = args["CHANNELS"].split(",")

    fresh, gained = [], 0
    for slug in slugs:
        blocks = contents(slug)
        kept = 0
        for b in blocks:
            cdn = ((b.get("image") or {}).get("original") or {}).get("url")
            src = (b.get("source") or {}).get("url")
            if not (cdn or src):
                continue
            if cdn and src and not src.startswith("https://d2w9rnfcy7mm78"):
                gained += 1
            fresh.append({
                "from": "are.na", "set": slug,
                "title": b.get("title") or b.get("generated_title") or "",
                "kind": b.get("class") or "Image",
                "source": cdn or src,
                # Where the person who saved it actually found it. Worth keeping: a block from
                # the Met and a block from a designer's portfolio are not the same kind of thing,
                # and once the URL is rewritten to the CDN that difference is otherwise lost.
                "origin": src or "",
            })
            kept += 1
        print(f"  {slug:46} {kept:4} blocks")
    json.dump(others + fresh, open(DOC, "w"), indent=1, ensure_ascii=False)
    print(f"\n{len(fresh)} are.na rows (was {len(arena)}); "
          f"{gained} now point at are.na's copy instead of a host that would refuse the fetch.")


main()
