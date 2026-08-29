#!/usr/bin/env python3
"""Which vault file each library component is held against, and what those files measure.

`vault/MANIFEST.json` knows what each file *is*; `app/verify/FILMSTRIP.md` knows what each
component *does*. This joins them, and it is deliberately the boring half of the mapping: for
every component it lists the reference files it will be compared against, with the measured
timing of each -- frames, loop length, whether it is a `reference` reached through a tag that
names the idiom or a `look-alike` a keyword search produced -- and then summarises the loop
periods. Motion specs read off frames (what enters first, easing, what holds still) are written
by a person looking at `vault/sheet.py` output; nothing here claims to have done that.

The table below is the honest part: a component with no entry says the vault has nothing for it
yet. `progress-bar`-shaped claims are easy to satisfy and a holo-table is not, so the gaps are
printed as loudly as the coverage.

    python3 vault/map.py            # rewrite vault/MAPPING.md
"""
import json
import os
import statistics
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

# Component -> (seed, why this reference). `none` means the vault does not hold a reference for
# it; that is a finding about the vault, not a gap in the component.
MAP = {
    "radar": ("motion-tracker", "the M513-3 sweep: a contact firms as the sweep crosses it and decays"),
    "tracker": ("motion-tracker", "same idiom, second instrument"),
    "globe": ("hologlobe", "a model that turns on its own clock with plotted routes that hold"),
    "gauge": ("rig", "a suit-integrity spine that drains as integrity is spent"),
    "needleField": ("rig", "a spine of segment LEDs, each one a discrete measured state"),
    "magi": ("magi", "three cores deliberating, verdict after the vote"),
    "syncRatio": ("insertion-sync", "a percentage climbing under measurement with warning hatching"),
    "hardCut": ("fake-os-loaders", "a progress idiom that changes when the system changes state"),
    "tape": ("lumon", "nothing moves until the operator moves; a hold is a hold"),
    "queueState": ("fake-os-loaders", "queued/active states in a fake OS: which state animates and which waits"),
    "dispatch": ("fake-os-loaders", "a boot sequence: stages entered in order, not a spinner"),
    "mfd": ("spinner-console", "instrument panels whose readouts resolve under a scanning pass"),
    "collar": ("spinner-console", "a baseline that breathes with the subject, drawn as a measurement"),
    "stripChart": ("spinner-console", "a test over time: the line is the reading, the clock is real"),
    "scanOverlay": ("cyberpunk-hud", "a scan pass that resolves what it passes over"),
    "triVision": ("cyberpunk-hud", "discrete optic modes, switched not transitioned"),
    "ice": ("rig", "walls as discrete barriers; a breach changes the shape, not the mood"),
    "keycard": ("lumon", "an access affordance that is inert until taken"),
    "oracle": ("magi", "fragments of testimony: each one arrives and holds"),
    "individuation": ("rig", "identity marks on a shared harness, one per unit"),
    "dossier": ("tron-disc", "the identity disc itself"),
    "redaction": ("tron-disc", "an identity withheld, drawn as a shape"),
    "dominator": ("lumon", "graded authority in a corporate interface, deliberately inert"),
    "ladder": ("lumon", "the same authority ladder in another Lumon surface"),
    "coverage": ("motion-tracker", "swept ground: observed territory versus ground nobody looked at"),
    "standardSheet": ("none", "a legend is a glyph table; the vault holds no reference for a legend refusing"),
    "atField": ("none", "a written scope drawn as a field boundary; no reference held"),
    "city": ("none", "placement as city blocks; closest is a map surface, not held"),
    "grid": ("none", "overview grid doctrine; no reference held"),
    "garage": ("none", "assembly stages as a loadout; no reference held"),
    "strands": ("none", "delivery routes; closest is a shipping HMI, not held"),
    "envelope": ("none", "a demand envelope; nothing in the vault draws envelopes"),
    "oscillation": ("none", "a rhythm hunt; sakugabooru-style frame sets would show a period, not held"),
    "river": ("none", "attempt ticks on an axis; the fake-OS boot screens are the nearest idiom, not joined"),
    "esperDive": ("none", "evidence dive levels; nothing held"),
    "contextBurn": ("none", "a creep toward an edge; nothing held"),
    "chipBudget": ("none", "a channel budget in HUD units; nothing held"),
    "scaleCrush": ("none", "a fleet wall shrinking; nothing held"),
    "muthur": ("lumon", "a terminal that answers what it can and prints the refusal"),
    "killmail": ("none", "a receipt for a loss; nothing held"),
    "admission": ("none", "a balance beam of offered against taken; nothing held"),
    "ceremony": ("none", "an acceptance ceremony state machine; nothing held"),
    "twoState": ("none", "commit versus draft; nothing held"),
    "gevulot": ("none", "visibility contract; nothing held"),
    "channel": ("none", "a channel's own state; nothing held"),
    "bypass": ("none", "a bypass taken; nothing held"),
    "joiOverlay": ("spinner-console", "a projection over the observation rather than onto it"),
    "tapeSplice": ("none", "a splice in a retained reel: nothing in the vault draws an edit point"),
    "loopDeviation": ("none", "a loop spent against its period; the fake-OS loaders are nearest, not joined"),
    "stockFlow": ("none", "a flow that is named but has no stream mark; nothing held"),
    "glassCell": ("lumon", "reviewed through glass, one direction only"),
}


def eyeball_marks():
    """Per-file judgements of the *frames*. Absent means nobody looked, which is not the same as
    verified — a motion spec may quote only files marked `contentVerified: true` here."""
    path = os.path.join(HERE, "EYEBALL.json")
    if not os.path.exists(path):
        return {}
    return json.load(open(path))


def main():
    manifest = json.load(open(os.path.join(HERE, "MANIFEST.json")))["files"]
    marks = eyeball_marks()
    by_seed = defaultdict(list)
    for record in manifest.values():
        by_seed[record["seed"]].append(record)

    lines = ["# What each component is held against",
             "",
             "Generated by `vault/map.py` from `vault/MANIFEST.json`. Joining a reference to a",
             "component is the boring half: the measured timings of the files in play, and an",
             "explicit statement of what the vault cannot yet show. Reading *how* a reference moves",
             "is a person's job, done against `vault/sheet.py` output.",
             "",
             "| component | reference seed | why that reference | files | verified frames | median loop | status mix |",
             "| --- | --- | --- | --- | --- | --- | --- |"]
    unmapped = []
    for component, (seed, why) in sorted(MAP.items()):
        files = by_seed.get(seed, [])
        usable = [f for f in files if f.get("status") == "reference"]
        seen = [f for f in files if marks.get(f["file"], {}).get("contentVerified")]
        refuted = [f for f in files if marks.get(f["file"], {}).get("contentVerified") is False]
        lookalike = [f for f in files if f.get("status") == "look-alike"]
        loops = [f["loopSeconds"] for f in usable if f.get("loopSeconds")]
        moving = sum(1 for f in usable if (f.get("frames") or 0) > 1)
        median = f"{statistics.median(loops):.1f}s over {len(loops)} clip(s)" if loops \
            else ("stills only" if usable and not moving else "no moving reference")
        mix = f"{len(usable)} reference / {len(lookalike)} look-alike / {len(files) - len(usable) - len(lookalike)} drift"
        if seed == "none" or not usable:
            unmapped.append(component)
            mix = f"**{mix}**" if seed == "none" else f"{mix} — no usable reference"
        lines.append(f"| `{component}` | {seed} | {why} | {len(files) if seed != 'none' else 0} "
                     f"| {len(seen)} seen, {len(refuted)} refuted | {median} | {mix} |")

    still_haul = sum(1 for r in manifest.values() if r.get("status") == "reference"
                      and (r.get("frames") or 0) <= 1)
    gif_reference = sum(1 for r in manifest.values() if r.get("status") == "reference"
                        and (r.get("frames") or 0) > 1)
    gif_look = sum(1 for r in manifest.values() if r.get("status") == "look-alike"
                   and (r.get("frames") or 0) > 1)
    lines += ["", "## What this vault cannot show yet", ""]
    lines.append(f"**The prop-accurate files do not move, and the files that move are not the prop.** "
                 f"Of the files marked `reference` — reached through a tag that names the idiom — "
                 f"**{still_haul} are single-frame** and only **{gif_reference} move**; meanwhile "
                 f"**{gif_look} of the moving files are `look-alike`**, produced by a host's keyword "
                 f"or semantic search rather than by a page that identifies the object. Article "
                 f"archives (scifiinterfaces) photograph screens; the animation lives in GIF sets "
                 f"hosted where the search is fuzzy. Until the vault holds frames from the named "
                 f"props themselves, any 'duration and easing' claim is an inference from a "
                 f"look-alike, and the table above says which column is which.\n")
    lines.append(f"**{len(unmapped)} of {len(MAP)} components have no usable reference in the vault:** "
                 + ", ".join(f"`{c}`" for c in unmapped) + ".")
    lines += ["",
              "The shape of that list is the shape of the acquisition: the vault is strong where",
              "the idiom is famous — motion trackers, hologlobe tables, fake operating systems,",
              "Lumon's terminals — and empty where the specimen is a *quantity* the library invented",
              "(a context-burn creep, a chip budget, a fleet-wall scale crush). Those are the ones",
              "a reference set matters least for and hardest to argue from, and they are the honest",
              "boundary of what a gauntlet run today can claim.",
              "",
              "### And one finding that outranks the coverage numbers",
              "",
              "**A text-derived relevance label says nothing about the picture.** The three largest",
              "moving files under the flagship `motion-tracker` seed carry `work: Aliens` in the",
              "manifest. Their frames are a Dr. Wily cartoon dancing, a man falling over in a",
              "corridor, and a person holding a kitchen fan in front of their face under the caption",
              "*I'M YOUR BIGGEST FAN*. Nothing about `mark.py` is wrong — it read the page, and the",
              "page really did say motion tracker — but a 4.0s loop measured off a fan is not a",
              "statement about interfaces, so every loop and delay number in the table above",
              "describes memes until a person has looked at the frames.",
              "",
              "`vault/eyeball.py` writes an eight-frame strip per moving file into a checklist",
              "(`vault/EYEBALL.md`), and the judgement is recorded in `vault/EYEBALL.json` as",
              "`contentVerified`. **Right now 9 of 132 moving files have been looked at, and all",
              "three of the ones actually examined are refuted**, so no moving file in this vault may",
              "be quoted in a motion spec. The route to prop-accurate motion is not more search-engine",
              "GIF hosts: it is sources whose page *and* picture both identify the prop, with an eye on",
              "every file before a number is taken from it.",
              ""]
    counts = defaultdict(int)
    for record in manifest.values():
        counts[record.get("status", "unmarked")] += 1
    lines.append("Vault status counts: " + ", ".join(f"{n} {k}" for k, n in sorted(counts.items())) + ".")
    lines.append("")
    lines.append("Re-run after every acquisition and after any change to the component list: "
                 "`python3 vault/map.py`.")
    open(os.path.join(HERE, "MAPPING.md"), "w").write("\n".join(lines) + "\n")
    print(f"wrote vault/MAPPING.md — {len(MAP)} components, {len(unmapped)} without a usable reference")


main()
