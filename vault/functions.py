#!/usr/bin/env python3
"""Read the spine's functions out of 16,988 game-screen slugs that already name themselves.

`harvest.mjs` pulled Interface In Game's sitemap into `EXAMPLES.json`. Each row is a URL of the
shape `/screenshots/<game>-<what-the-screen-is>/` -- `stardew-valley-crafts-repair`,
`prince-of-persia-the-lost-crown-epilepsy-warning`, `knighthood-weekly-quests`. The tail is a
screen-type label written by somebody who looked at the screen, which is the one thing an
automated harvest normally cannot get. This reads it.

The game's own name is the trap. `albion online buy` is a shop, not a network screen, and
`call of duty black ops 4 banner` is not a phone call -- but `online` and `call` are exactly the
words a function vocabulary wants. So the title is stripped before it is read: a prefix shared by
three or more slugs is a game, not a label, and only what follows it gets classified. That rule
comes out of the corpus rather than a hand-written list of games, which is why it also strips
titles nobody thought to write down.

The output is a QUEUE FOR THE EYE, never a verdict. A slug saying `loading` is a claim that the
screen is a progress surface, and the claim is the host's, not ours; a row only enters
`CATALOG.md` after the screenshot has actually been looked at. That distinction is the whole
reason the vault exists -- three of its biggest files were once labelled off text and turned out
to be a cartoon, a man falling over, and a woman holding a fan.

    python3 vault/functions.py              # counts per function, with exemplars
    python3 vault/functions.py FN=queue N=40
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# Spine function -> the words a screen-type label uses for it. Kept as whole words matched
# against the slug's own tokens, because substring matching turns `scan` into `scanner`, `scandal`
# and, memorably, `scandinavia`.
VOCAB = {
    "scope": "zoom map-view overview minimap world-map galaxy region sector layer layers "
             "detail-view breadcrumb hierarchy tree nested",
    "progress": "loading load-screen loading-screen progress progression download install "
                "installing sync syncing saving autosave research researching construction "
                "building-progress xp level-up milestone completion percent",
    "warning": "warning warnings alert alerts caution danger hazard error epilepsy seizure "
               "disclaimer low-health damage overheat malfunction failure critical",
    "access": "login log-in sign-in signin password passcode lock locked unlock keycard "
              "permission permissions authentication auth account credentials pin keypad",
    "queue": "queue queued backlog pending orders order-queue build-queue production tasks "
             "todo assignments jobs shipping requests waiting-list",
    # No `bios` and no `post`: in a game corpus those are character biographies and forum
    # posts far more often than they are a firmware screen, and 41 of the first 41 `boot`
    # candidates were Batman's character bios.
    "boot": "boot boot-up bootup startup start-up splash intro title-screen "
            "power-on initializing initialization first-launch",
    "timeline": "timeline history log logbook journal chronicle calendar schedule replay "
                "recording playback events event-log timestamps era",
    "network": "network servers server connection connections multiplayer lobby matchmaking "
               "ping latency nodes topology routing hosts uplink signal-strength",
    "sensor": "sensor sensors radar sonar scanner detector telemetry readout gauge meter "
              "instrument speedometer altimeter compass thermometer motion-tracker",
    "terminal": "terminal console command-line shell prompt cli hacking hack computer pda",
    "manifest": "inventory manifest cargo storage stash backpack loadout equipment items "
                "collection catalogue catalog库 ledger",
    "map": "map maps navigation gps route waypoint compass-map atlas",
    "identity": "profile dossier passport id-card identity biography character-sheet resume "
                "credentials-card badge",
    "comms": "chat messages mail inbox email radio comms call contacts phone",
    "vitals": "health vitals status-effects stamina hunger medical injury diagnosis",
    "diagnostic": "diagnostic diagnostics debug repair maintenance systems-check integrity",
    "analysis": "analysis statistics stats graph chart report analytics breakdown metrics",
    "tracking": "tracking tracker trace surveillance follow pursuit",
    "targeting": "targeting target lock-on crosshair reticle aim weapon-select",
    "consensus": "vote voting poll consensus approval rating review ratings verdict",
    "scan": "scan scanning scanner-view spectrograph",
}
WORDS = {fn: set(v.split()) for fn, v in VOCAB.items()}


def titles(rows, floor=3):
    """Game names, learned from the slugs. Any word-prefix that heads three or more different
    screens is a title; the longest such prefix on a given slug is the one to strip."""
    seen = {}
    for r in rows:
        words = r["title"].split()
        for n in range(1, min(len(words), 8)):
            seen[" ".join(words[:n])] = seen.get(" ".join(words[:n]), 0) + 1
    return {p for p, n in seen.items() if n >= floor}


def strip_title(title, known):
    words = title.split()
    for n in range(min(len(words) - 1, 7), 0, -1):
        if " ".join(words[:n]) in known:
            return " ".join(words[n:])
    return title


def tokens(title):
    return set(re.split(r"[^a-z0-9]+", title.lower())) | set(
        re.findall(r"[a-z]+-[a-z]+", title.lower()))


def classify(title):
    t = tokens(title)
    return sorted(fn for fn, words in WORDS.items() if t & words)


def main():
    args = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)
    rows = [r for r in json.load(open(os.path.join(HERE, "EXAMPLES.json")))
            if r.get("from") == "interfaceingame"]
    known = titles(rows)
    hits = {fn: [] for fn in WORDS}
    for r in rows:
        label = strip_title(r["title"], known)
        for fn in classify(label):
            hits[fn].append(dict(r, label=label))

    want = args.get("FN")
    limit = int(args.get("N", 6))
    out = {fn: [{"title": r["title"], "label": r["label"], "source": r["source"]} for r in v]
           for fn, v in hits.items()}
    json.dump(out, open(os.path.join(HERE, "FUNCTIONS.json"), "w"), indent=1)

    for fn in sorted(hits, key=lambda f: -len(hits[f])):
        if want and fn != want:
            continue
        print(f"\n{fn:12} {len(hits[fn]):5} candidate screens")
        for r in hits[fn][:limit]:
            print(f"   {r['label'][:26]:28} {r['title'][:34]:36} {r['source']}")
    total = len({r["source"] for v in hits.values() for r in v})
    print(f"\n{total} of {len(rows)} screens carry a label the spine recognises.")


main()
