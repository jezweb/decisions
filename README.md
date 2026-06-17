# decisions

A Claude Code skill + plugin for **asking a human coworker for one decision,
cleanly** — and getting an answer back in a single tap.

The scarce resource in async work isn't the agent's reasoning, it's the **human's
attention**. A question that bundles ten asks, names a ticket they don't remember,
or forces them to compose a paragraph burns that attention and stalls the work.
`decisions` treats the *ask itself* as a produced artifact: reduced to its single
load-bearing choice, context carried in so they don't go look anything up, a grounded
visual where it helps, answerable with a 👍.

```
SCOPE → FRAME → AID → POST → WATCH → ACT
```

## The method in one screen

- **One decision per ask.** Several questions are several asks, posted one at a time.
  A wall of questions is efficient to write and miserable to answer.
- **Five-part frame** for every ask: the decision · why it needs *them* · the named
  choices · a recommendation + why · what it unblocks. If you can't name the
  recommendation, you don't understand the choice well enough to ask yet.
- **Carry the context in.** Screenshot, code line, current state, before-picture —
  bring it into the ask. Never "go look up #X".
- **Match the medium.** Text for a yes/no. A grounded matrix for options × dimensions.
  A wireframe or recording only when the choice genuinely needs it. Over-production
  wastes more attention than a plain question.
- **Ground the structural visuals.** Matrices and flows render from real facts via
  HTML / mermaid / graphviz → screenshot — accurate by construction, no hallucinated
  cell. Image models are for *pictorial* aids only (wireframes), and only with a
  **designated** key — never a client's.
- **One message per choice.** The human 👍 the option they want, or replies its
  number. No composing.

## What's in here

| Path | What |
|---|---|
| `skills/decisions/SKILL.md` | the operating method (the skill the agent loads) |
| `templates/decision.md` | the fill-in-the-blanks decision frame — filling it *is* the quality gate |
| `templates/matrix.html` | worked grounded decision-matrix, **lean by default** (glanceable, no prose); adapt rows/cols/options |
| `templates/render.mjs` | HTML → PNG (needs Playwright: `npm i playwright`, or set `CHROME_PATH`; deterministic, no key) |
| `docs/pattern.md` | the why, the lived detail, the failure modes |

## Borrows, doesn't reinvent

`decisions` owns the **frame** and the **grounded-aid renderer**. Everything else it
borrows from siblings:

- **fixer** / **walkabout** — the CDP screen-recorder + narration, for the rare ask
  that needs a walked-through video.
- an **image model** (`gpt-image-2`, `gemini-3.1-flash-image`) — for pictorial
  wireframes, with a designated key only.
- whatever **chat** channel the person lives in — to post the ask and read the tap.

## Install

Add the marketplace and install the plugin:

```
/plugin marketplace add jezweb/decisions
/plugin install decisions
```

Then invoke the skill when you're blocked on a person's call.

## Rendering a decision aid

```bash
cd templates
node render.mjs matrix.html        # writes matrix.png next to it
```

Edit `matrix.html` first — fill the rows/columns/options from the *real* facts of
your decision, highlight the row(s) actually being decided with `class="decide"`.

## Licence

MIT © 2026 Jezweb Pty Ltd
