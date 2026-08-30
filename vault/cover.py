#!/usr/bin/env python3
"""Recompute the function-coverage table in `CATALOG.md` from the instance rows above it.

The spine has 21 functions and a function is covered when it holds instances from at least three
different media. Three, because two is a coincidence and three is a convention -- and because a
catalog drawn from one medium teaches you about that medium's habits rather than about the job.
The whole point is falsification, so the count has to come from the rows rather than from
somebody's memory of the rows.

It reads the `## Instances, by function` table and writes the `## Function coverage` table. A
function cell may name several functions separated by ` · `; a row counts once per function, and
the medium is the row's own vein.

The parser splits on UNESCAPED pipes only. An earlier hand-count of this table read the Tron row
as holding a medium called "grep` pipeline, a process list with real PIDs..." -- the row quotes a
shell command containing a literal `|`, which split the cell and shunted every later column one
place left. A table that silently gains a column is worse than one that fails, because the
failure looked exactly like a covered function.

    python3 vault/cover.py            # rewrite the table
    python3 vault/cover.py CHECK      # print it, change nothing
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.join(HERE, "CATALOG.md")
SPINE = ("terminal scope scan analysis warning map tracking manifest access diagnostic queue "
         "comms boot progress targeting vitals timeline network consensus identity sensor").split()
CELL = re.compile(r"(?<!\\)\|")


def cells(line):
    return [c.strip() for c in CELL.split(line.strip())[1:-1]]


def read_instances(text):
    body = text.split("## Instances, by function", 1)[1].split("\n## ", 1)[0]
    held = {fn: set() for fn in SPINE}
    rows = 0
    for line in body.splitlines():
        if not line.startswith("|"):
            continue
        parts = cells(line)
        if len(parts) < 3 or parts[0] in ("function", "---"):
            continue
        functions, _what, vein = parts[0], parts[1], parts[2]
        if set(functions) <= set("- "):
            continue
        rows += 1
        for fn in (f.strip() for f in functions.split("·")):
            if fn in held:
                held[fn].add(vein)
            elif fn:
                print(f"  not a spine function, ignored: {fn!r}")
    return held, rows


def table(held, rows):
    out = ["## Function coverage", "",
           "The comparison spine from `MISSION.md`, counted off the instance rows above by",
           "`vault/cover.py`. A function is covered when it holds instances from at least three",
           "different media. Three, because two is a coincidence and three is a convention.",
           "",
           f"Counted from {rows} instance rows. The functions still short are the bookkeeping ones,",
           "and that is a finding about the sources rather than about the spine: an inventory, a",
           "pending-work list and an instrument sitting at a nominal reading are the things a",
           "showreel skips, so they have to be fetched from the games, the control rooms and the",
           "obsolete computing instead.",
           "",
           "| function | media held | status |", "| --- | --- | --- |"]
    for fn in SPINE:
        media = sorted(held[fn])
        status = "COVERED" if len(media) >= 3 else f"{len(media)} of 3"
        out.append(f"| {fn} | {', '.join(media) or '—'} | {status} |")
    covered = sum(1 for fn in SPINE if len(held[fn]) >= 3)
    out += ["", f"{covered} of {len(SPINE)} covered."]
    return "\n".join(out) + "\n"


def main():
    text = open(DOC).read()
    held, rows = read_instances(text)
    new = table(held, rows)
    if "CHECK" in sys.argv[1:]:
        print(new)
        return
    head = text.split("## Function coverage", 1)[0]
    open(DOC, "w").write(head + new)
    covered = sum(1 for fn in SPINE if len(held[fn]) >= 3)
    print(f"{rows} instance rows; {covered} of {len(SPINE)} functions covered.")
    for fn in SPINE:
        if len(held[fn]) < 3:
            print(f"  short: {fn:9} {len(held[fn])} of 3  ({', '.join(sorted(held[fn])) or 'nothing'})")


main()
