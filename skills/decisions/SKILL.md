---
name: decisions
description: Ask a human coworker for ONE decision, cleanly. Reduce a question to its single load-bearing choice, carry the context to them so they don't have to go look anything up, show a grounded visual, and make answering a single tap. Use when you're blocked on a person's call, when a question is about to become a wall of ten asks, when a stakeholder needs to choose between options, or when "what did you mean?" keeps bouncing. Sibling of fixer (borrows its recorder) and walkabout (borrows its narration) for the rare ask that needs a narrated screen-recording.
---

# decisions — one clean ask, one tap back

The scarce resource in async work isn't your reasoning, it's the **coworker's
attention**. A question that bundles ten asks, or names a ticket they don't
remember, or forces them to compose a paragraph, burns that attention and stalls
the work. This skill treats the *ask itself* as a produced artifact: framed,
context carried, visual where it helps, answerable in one tap.

The shape, per decision:

```
SCOPE → FRAME → AID → POST → WATCH → ACT
        the ask  the visual  one-tap-back
```

You **own** two things: the **decision frame** (`decision.md`, the contract for a
single ask) and the **grounded-aid renderer** (`matrix.html` + `render.mjs`,
HTML → screenshot). Both live in this plugin's `templates/` dir — reference them as
`${CLAUDE_PLUGIN_ROOT}/templates/<file>` (they sit a level *above* `skills/`, not
inside it, so a bare `templates/…` path won't resolve from here). `render.mjs` needs
Playwright (`npm i playwright` once, or point `CHROME_PATH` at an existing Chrome —
no API key, no network). Everything else you **borrow**:

| Need | Borrow |
|---|---|
| A pictorial mockup / illustration / wireframe | an image model (`gpt-image-2`, `gemini-3.1-flash-image`) — **only with a designated key, never a client's** |
| A narrated screen-recording for a genuinely complex ask | fixer / walkabout's CDP recorder + ElevenLabs voice |
| A still of the real app / the actual issue | playwright-cli or the screenshot pipeline |
| Posting the ask + reading the answer | `google-chat` MCP (or whatever channel the person lives in) |

## The one rule above all others

**One decision per ask.** Not three bundled, not a register of twelve. If you have
several questions, they are several asks, posted one at a time, and you wait for
each answer before the next. A wall of questions is efficient for *you* to write
and inconsiderate for *them* to receive. (The failure this skill exists to kill is
real and common: the author dumps everything they're unsure about into one post.)

## 1 — SCOPE: is this even a question for a human?

Most "questions" are things you can resolve yourself: read the code, check the
data, pick the obvious default and mention it. Only escalate to a human ask when
the answer is genuinely **theirs to give**: a preference, a policy, a priority, a
fact only they hold. If you could find it by looking, look. Then, name **who owns
the decision** (the person who can actually answer), not just "the team".

## 2 — FRAME: the five parts (this is the whole craft)

Every ask answers these, in this order, and nothing else:

1. **The decision** — one, specific. ("Should nurses see all patients or only their
   assigned cases?" not "how should roles work?")
2. **Why it needs *you*** — what only they can answer. Keeps it from feeling like
   homework you should have done.
3. **The choices** — concrete, mutually exclusive, named (A/B/1/2).
4. **The recommendation + why** — so the person can *confirm* instead of *compose*.
   A recommended default turns a paragraph-reply into a 👍.
5. **What it unblocks** — the stakes, so they know why their ten seconds matters.

**Carry the context to them.** Never make them go look up "#618" or "that GH issue."
Bring the relevant thing *into* the ask: a screenshot of the issue, the line of
code, the current state, the before-picture. The person should be able to decide
without opening another tab.

`templates/decision.md` is the fill-in-the-blanks version. Filling all five fields
*is* the quality check — if you can't name the recommendation, you don't understand
the choice well enough to ask yet.

## 3 — AID: match the medium to the complexity (gate ruthlessly)

Over-production is a failure mode too. A 90-second narrated video for a yes/no
wastes *more* attention than a text question. Default to the lightest medium that
works:

| The decision is… | Use |
|---|---|
| A yes/no or pick-one, self-evident | **text + the five-part frame**. Stop here. Most asks. |
| Spatial / "what would it look like" | one **screenshot** of the real surface, or a **wireframe** image |
| A comparison across options × dimensions | a **decision matrix** (grounded HTML → screenshot, see below) |
| Approving a **set** of changes (a batch / deploy go-no-go) | a **manifest** — one row per item, short risk tag, one go/no-go (`manifest.html`) |
| A flow / sequence / branch | a **mermaid or graphviz** diagram generated from the *real* code |
| Genuinely complex, multi-branch, needs walking through | a **narrated screen-recording** (borrow fixer/walkabout) — the rare exception |

### Keep the aid glanceable — prose inside it is the failure

A visual exists to be **glanced at in seconds, not read**. The moment the decider has
to read sentences inside it, it's text wearing a table's clothes — and it costs *more*
attention than plain text would, because they came to it expecting a glance. The
coworker's attention is the scarce resource (the whole premise); a crammed visual
spends it twice and breeds the decision-fatigue that makes people defer the ask.

So the **structure carries the argument** and words are labels, not sentences:

- **No full sentences inside the card.** Title ≤ ~6 words; cell values are symbols or
  short labels; option chips ≤ ~6 words.
- **No explanatory paragraph, no reassurance text.** "Grounded / nothing invented /
  read from the live config" reassures *you*, the author — it serves your anxiety,
  not their decision. If it must be said at all, it goes in the one chat message,
  never in the aid.
- **The delete test:** strike every word that isn't load-bearing. If the decision
  still reads from the structure alone, those words were tax.
- **The tell:** if the matrix needs a legend or a sentence to be understood, the
  *columns* are wrong — fix the structure, don't annotate it. (Two cells that
  contradict — "in the menu ✓ / can open ✕" — say "broken" with no prose at all.)

The best aid is the one where the structure does so much work that almost no words
are left. If you can't get there, that's the signal the decision is better as plain
text — the lightest medium — than as a visual at all.

### Ground the visuals, or they mislead

A generated flowchart or matrix that's subtly wrong is **worse than none** — it
anchors the person on a false model of the choice. So split the visual job by tool:

- **Structure** (matrices, flows, decision trees, tables): render from the *real*
  facts with **HTML / mermaid / graphviz**, then screenshot. Accurate by
  construction, no hallucination, no key, fast. This is the default and it carries
  most asks. (`templates/matrix.html` + `render.mjs`.)
- **Pictorial** (wireframes, "what the screen feels like", illustrations): an image
  model (`gpt-image-2`, `gemini-3.1-flash-image`) is the right tool — but it
  *invents* detail, so:
  - **Client-facing decisions get the grounded structural aid**, not a generated
    image, OR a generated image with a clear "illustrative only" caption.
  - **Internal asks** can use generated images freely.
  - **Use a DESIGNATED key** allocated for this (a fleet image-gen key in the
    host's secret store with explicit agent access). **Never scavenge a client's
    or a project's key** for a cross-purpose ask — that's a credential-context
    violation. If there's no designated key, fall back to the HTML aid and say so.

## 4 — POST: one context message, each choice its own message

Post the framed ask, then **each choice as its own separate message** in the
person's channel. The grounded visual rides on the context message. The per-choice
split is what makes the answer one tap: the person **👍 the message for the option
they want**, or replies with its number. No composing required.

```
[context msg + visual]  "One decision to unblock X. <frame>. Two options below —
                         just 👍 or reply the number of the one you want."
[choice msg 1]          "1️⃣ <option A> (recommended). <one line why>. 👍 or reply 1."
[choice msg 2]          "2️⃣ <option B>. <one line why>. 👍 or reply 2."
```

Always carry a **text fallback**: if the channel can't surface reactions, the
person replies "1". Never make answering require watching a video or parsing an
image.

## 5 — WATCH: poll for the tap

Watch the thread for a 👍 on a choice message or a one-word reply. If the channel
MCP can read reactions, the 👍 is the signal; if not, the reply is. When it lands,
**confirm you've got it** ("got it, building option 1") so the person knows their
ten seconds counted, and proceed.

If it goes quiet past a sensible window, a single gentle nudge on the same thread —
never a re-post of the whole question.

## 6 — ACT

Do the thing. Then, if the decision changed course, close the loop wherever the
work is tracked.

## Quality gates (these are the point)

| Gate | Why |
|---|---|
| One decision per ask | a bundle is the failure mode this skill exists to kill |
| All five frame fields filled, including a recommendation | no recommendation means you don't understand the choice well enough to ask |
| Context carried into the ask | "go look up #X" offloads your work onto the busy person |
| Answerable in one tap | a 👍 beats a composed paragraph; if it needs a paragraph, the frame isn't done |
| Structural visuals grounded, not generated | a wrong diagram anchors a wrong decision |
| Generated images use a designated key, never a client's | credential-context is non-negotiable |
| Medium matched to complexity | a video for a yes/no wastes more attention than text would |

The earned-place test: if a clarifying question went out as a wall of asks, or made
the person go look something up, or forced a paragraph when a 👍 would do, decisions
wasn't used.
