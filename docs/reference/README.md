# Reference

Where the library's design came from, and where the rest of the work lives.

Most of this existed only as published Claude artifacts or as commits on branches
nobody had merged. A page that is not in the repository cannot be reviewed, cannot
be diffed, and disappears when the link does. This directory is the fix.

## The research

| File | What it holds |
| --- | --- |
| [`idea-bank.md`](idea-bank.md) | 73 sources mined for 183 concrete interface mechanisms, each with the application proposed for it, against 15 operator roles |
| [`idea-bank.json`](idea-bank.json) | The same, machine-readable |
| [`specimens.md`](specimens.md) | The 50 motifs that survived, by family, each naming its source and the role it serves |
| [`cybernetics-canon.md`](cybernetics-canon.md) | Six diagrams — Wiener, Ashby, Beer, Forrester, Rasmussen, Shannon — and what each obliges a component to do |
| [`doctrine.md`](doctrine.md) | Motion, sound, and the spatial cut. Constraints on components that do not exist yet |
| [`substitution-matrix.md`](substitution-matrix.md) | The six patterns that serve the most roles, and the verdict vocabulary that separates *could build* from *could build honestly* |
| [`comb-instrument.md`](comb-instrument.md) | Prior art on the population-comb pattern, and 26 other populations it could carry |

## The map

| File | What it holds |
| --- | --- |
| [`branches.md`](branches.md) | Four unmerged branches, what each one built, and the measured state of the reference vault |
| [`merge-plan.md`](merge-plan.md) | The order to merge them in, the two collisions that make order matter, and the cross-test evidence behind each call |
| [`artifacts.md`](artifacts.md) | Every published page, which are preserved here, and where the rest are |

## The pages

[`pages/`](pages/) holds nine research pages as they were published. Each is the
artifact's own HTML with the host frame runtime removed and nothing else edited,
naming its source URL in a comment at the top. They are self-contained apart from
Google Fonts, so they open from the file system:

```sh
open docs/reference/pages/the-idea-bank.html
```

The three pages that run the actual library live in [`examples/`](../../examples/)
instead, because they are usage rather than research.

## Reading order

If you are new to this: [`../GOAL.md`](../GOAL.md) for the rule the library
enforces, then [`cybernetics-canon.md`](cybernetics-canon.md) for why the rule is
not arbitrary, then [`specimens.md`](specimens.md) for the vocabulary it is built
from. [`branches.md`](branches.md) last, when you want to know what is not on this
branch — and [`merge-plan.md`](merge-plan.md) when you want to change that.
