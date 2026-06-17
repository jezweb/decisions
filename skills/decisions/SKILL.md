---
name: decisions
description: Ask a human coworker for ONE decision, cleanly. Reduce a question to its single load-bearing choice, carry the context to them so they don't have to go look anything up, show a grounded visual, and make answering a single tap. Use when you're blocked on a person's call, when a question is about to become a wall of ten asks, when a stakeholder needs to choose between options, or when "what did you mean?" keeps bouncing. Sibling of fixer (borrows its recorder) and walkabout (borrows its narration) for the rare ask that needs a narrated screen-recording.
# Side-effecting (posts to a real human): deliberate /decisions only, never auto-fired. The shipwright
# loop still reaches it (names it + posts the framed ask via the method) — this just stops Claude
# auto-deciding to ping a coworker.
disable-model-invocation: true
---

# decisions — one clean ask, one tap back

> Part of the **shipwright** method — see the `shipwright` skill for the work-loop this move fits into and when to reach for it.

The scarce resource in async work isn't your reasoning, it's the **coworker's
attention**. A question that bundles ten asks, or names a ticket they don't
remember, or forces them to compose a paragraph, burns that attention and stalls
the work. This skill treats the *ask itself* as a produced artifact: framed,
context carried, visual where it helps, answerable in one tap.

The shape, per decision:

```
SCOPE → FRAME → AID → POST → WATCH → CONFIRM → ACT
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

**One decision per ask** — and pace the asks to the person's cognitive load and
availability. The thing you're protecting is the human's attention, and it fails in
*two* directions:

- **Bundling** — three decisions in one post. Now answering means composing a
  paragraph that disentangles which answer maps to which question. The load lands on
  them.
- **Flooding** — ten separate posts in a burst. Now they have to scroll back up the
  thread to reconstruct what's still open and what they've already answered. The load
  *still* lands on them, just relocated.

The goal sits between: **draw the decisions out calmly, one at a time, paced so each
lands when there's room for it.** The target experience for the human is — glance at
the options, see *within seconds* what's being decided, judge whether the proposed
default looks right, 👍 (or say otherwise), and move on to their own next thing. No
composing, no scrolling, no homework. If answering your ask requires any of those,
you've offloaded your load onto them, which is the failure this skill exists to kill.

So: several questions are several asks, generally posted one at a time, the next
following the previous answer — not fired as a barrage. Dependent decisions *must*
sequence (you need the first answer to frame the second). Independent ones can follow
in calm succession, but never bundled into one message and never dumped all at once.
Read the room: someone heads-down or mid-meeting gets the ask spaced out, not stacked.

## 1 — SCOPE: is this even a question for a human?

Most "questions" are things you can resolve yourself: read the code, check the
data, pick the obvious default and mention it. Only escalate to a human ask when
the answer is genuinely **theirs to give**: a preference, a policy, a priority, a
fact only they hold. If you could find it by looking, look. Then, name **who owns
the decision** (the person who can actually answer), not just "the team".

## 2 — FRAME: the five parts (this is the whole craft)

Every ask answers these, in this order, and nothing else:

1. **The decision** — one, specific. ("Should the 'editor' role see every project, or
   only the ones they're assigned to?" not "how should roles work?")
2. **Why it needs *you*** — what only they can answer. Keeps it from feeling like
   homework you should have done.
3. **The choices** — concrete, mutually exclusive, named (A/B/1/2).
4. **The recommendation + why** — so the person can *confirm* instead of *compose*.
   A recommended default turns a paragraph-reply into a 👍.
5. **What it unblocks** — the stakes, so they know why their ten seconds matters.

**Also judge: is it reversible?** Not a sixth part of the ask — a posture-setter for
*how hard you confirm later*. A reversible, low-stakes call leans to a lighter ask
(or just do it and mention it). An irreversible / regulated / affects-others /
multi-owner call earns the heavier CONFIRM (§6): a worded reply, a durable record,
and — for multi-owner — every owner, not the first tap. (Examples here are
domain-neutral on purpose: the method is the same whether the decision is about a
SaaS role, a deploy, a layout, or a comms schedule — don't let one domain's flavour
leak into a general skill.)

**Carry the context to them.** Never make them go look up "#618" or "that GH issue."
Bring the relevant thing *into* the ask: a screenshot of the issue, the line of
code, the current state, the before-picture. The person should be able to decide
without opening another tab.

**Redact what you carry in (a hard gate, not a nicety).** A real screenshot pulled
into an ask is a *publish surface* — it lands in a chat channel and may be seen,
forwarded, or logged. Before posting any real capture (still / annotated / GIF /
video):

- **Strip sensitive data** — PII (personal data, health records), personal names, client names, account numbers,
  secrets/tokens (including any in a visible URL). Crop or box them out. When in doubt,
  use seeded/dummy data for the capture instead of a real record.
- **Crop for confidentiality, not just attention** — the same tight crop that keeps
  the aid glanceable also keeps the off-topic sensitive stuff out of frame. Two birds.
- **Check the channel's audience** — is this a DM, an internal room, or a
  client-shared space? An aid that's fine in a private dev thread can be a leak in a
  channel the client reads. Match the data's sensitivity to who can see the post.

This is the same discipline as the fleet's strip-EXIF and no-client-names rules,
applied at the moment of the ask. A perfectly-framed decision that leaks someone's
record is a net loss.

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
| About a **specific spot** on a real screen ("what should THIS do?", "is THIS the right place?") | an **annotated screenshot** — the real screen with numbered pins on the spot(s) + a legend (`annotated.html`). Carries the actual pixels into the ask; grounded by construction. Keep to 1-3 pins or it's several decisions. |
| A change only visible **in motion** — a transition, an interaction, a before↔after | a short **silent GIF** (autoplay-loops in chat); a **narrated video** only if it's long / multi-screen / the *why* needs a voice. See *Real captures* below. |
| A comparison across options × dimensions | a **decision matrix** (grounded HTML → screenshot, see below) |
| Two genuine approaches, decided by 2-3 trade-offs | a **compare** card — A vs B, trade-offs as the rows (`compare.html`) |
| Approving a **set** of changes (a batch / deploy go-no-go) | a **manifest** — one row per item, short risk tag, one go/no-go (`manifest.html`) |
| A precedence / classification branch ("what order do the rules fire?") | a **tree** — first-match-wins ladder, contested rule highlighted (`tree.html`; pure HTML/CSS, no network — for a large graph use graphviz `dot -Tpng` instead) |
| A flow / sequence you must *walk through* | a **mermaid or graphviz** diagram generated from the *real* code |
| Genuinely complex, multi-branch, needs walking through | a **narrated screen-recording** (borrow fixer/walkabout) — the rare exception |

### Real captures: crop tight, then pick still / GIF / video by what the decision hinges on

The real-app aids — a screenshot, an annotated screenshot, a GIF, a video — are all
**grounded by construction**: real pixels, nothing invented. They're one family,
distinct from the structural aids (matrix/tree = HTML render) and the pictorial ones
(wireframe = image model, which *invents*). Within the real-capture family, **fidelity
is its own axis** — and the rule is the same as everywhere else: the lightest thing
that shows the property you're deciding on.

| The decision turns on… | Capture | Why |
|---|---|---|
| a **static** property — where a thing is, what a label says, a layout, which of two states | a **cropped still** (pin it if needed) | one frame holds the whole answer; absorbed at a glance |
| something only visible **in motion / over a sequence** — a transition, a janky interaction, "what happens when you click" | a short **silent GIF** | a still literally can't show it; autoplay-loops in chat, no controls to fight |
| a **before↔after** where the delta is subtle or spatial | an **A/B toggle GIF** (loops before→after→before) | the toggle makes the change *pop*; two side-by-side stills make the eye hunt for the difference |
| a property that needs **narration while you watch**, or is **long / multi-screen** | a **narrated video** (borrow fixer/walkabout) | the rare, heaviest case; a click-to-play friction cost, so earn it |

Two rules that do most of the work:

- **Crop to the decision.** The default still is a *partial* screenshot — just the
  region in question — not the whole page. Full-page only when the cross-page *spatial
  relationship* is itself the thing being decided ("should this section sit above that
  one"). Everything the decider doesn't weigh is noise, same as a crammed table.
- **Escalate only when the lighter medium genuinely can't show it.** Still < GIF <
  video in both production cost *and* the decider's attention. A GIF of something a
  still would've shown is **worse** than the still — it makes them wait for the loop to
  come back to the frame that mattered. That's over-production, one tier up. Motion is
  for properties that *only exist* in motion.

(The GIF/video capture itself is fixer's / walkabout's CDP recorder — `decisions`
borrows it, same as a narrated recording. This section is only about *when* to reach
for each.)

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
- **The tell:** if a *matrix* needs a sentence to be understood, the *columns* are
  wrong — fix the structure, don't annotate it. (Two cells that contradict — "in the
  menu ✓ / can open ✕" — say "broken" with no prose at all.)
- **The exception — naming labels, not explaining prose.** Some aids legitimately
  carry a short label that *names a part*: the annotated screenshot's pin legend (1 →
  "the date field") and the tree's ordering hint ("first match wins") are labels, not
  explanations. They're allowed. What's banned is the *explanatory sentence* and the
  *reassurance paragraph* — the line that argues, justifies, or soothes. Label the
  parts; never explain the decision inside the card. (So the "delete test" trims
  sentences, not the legend that makes `annotated` legible.)

The best aid is the one where the structure does so much work that almost no words
are left. If you can't get there, that's the signal the decision is better as plain
text — the lightest medium — than as a visual at all.

### Ground the visuals, or they mislead

A generated flowchart or matrix that's subtly wrong is **worse than none** — it
anchors the person on a false model of the choice. So split the visual job by tool:

- **Structure** (matrices, flows, decision trees, tables): render from the *real*
  facts with **HTML / mermaid / graphviz**, then screenshot. No hallucination *at
  render* — the screenshot is exactly the HTML you wrote, so no model invents a cell.
  (That's the guarantee; it does **not** make the content true — you still have to put
  *correct* facts in. Deterministic ≠ accurate.) No key, fast. This is the default and it carries
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
                         just 👍 or reply the number. Or tell me if I've framed it wrong."
[choice msg 1]          "1️⃣ <option A> (recommended). <one line why>. 👍 or reply 1."
[choice msg 2]          "2️⃣ <option B>. <one line why>. 👍 or reply 2."
```

The footer "**or tell me if I've framed it wrong**" is the escape hatch — it costs a
clause and saves the worst case (a clean answer to the wrong question). Honour it in
CONFIRM (§6).

Always carry a **text fallback**: if the channel can't surface reactions, the
person replies "1". Never make answering require watching a video or parsing an
image.

## 5 — WATCH: poll for the tap

Watch the thread for a 👍 on a choice message or a one-word reply. **Treat the
worded reply as the primary signal and the 👍 as the nice-to-have** — many chat
APIs read reactions unreliably (some never surface them at all), so don't hang the
whole loop on seeing a 👍 you might miss. A reply naming the option is unambiguous
and always readable.

If it goes quiet past a sensible window, a single gentle nudge on the same thread —
never a re-post of the whole question. If the nudge also goes silent: for a
reversible call you may proceed on the recommended default *and say so* ("going with
1 unless you say otherwise"); for an irreversible / regulated one, escalate to the
owner directly or hold — never silently assume the default.

## 6 — CONFIRM: read it back before you act

The ask was a produced artifact; the *answer* deserves the same care. Don't treat a
tap as a clean, final, correct instruction — close the loop:

- **Read back the consequence, not just receipt.** Not "got it, option 1" but one
  line restating what that choice *means and does next*: "Got it — editors see every
  project; I'll wire role-enforcement to that, live next deploy." This catches a
  mis-tapped reaction or a misread before any work starts. One line — don't re-open
  the decision.
- **Leave an escape open, and honour it.** Every ask carries an implicit "none of
  these / not quite / I've mis-framed it" path (a footer line: "…or tell me if I've
  framed it wrong"). A "yes, but…" or "actually…" reply is a **reframe signal, not
  noise** — pause, don't proceed on the recommendation, fold in what they said and
  re-ask. This is the recovery SCOPE can't give once the ask is already out.
- **Match the confirmation to the stakes** (set in FRAME):
  - *Reversible / low-stakes* → the tap is enough; the read-back is a courtesy. Proceed.
  - *Irreversible, regulated, money, affects others, multi-owner* → require an
    explicit **worded** reply (not a bare reaction), and write a one-line **durable
    record** where the work is tracked — who decided / what / when / on what evidence.
    A reaction that scrolls out of the thread is not an audit trail.
- **Multi-owner → don't treat one tap as consensus.** If the decision needs two
  people (FRAME named them), get *both*; if they conflict, surface the conflict and
  let them resolve it — never pick for them.

## 7 — ACT

Do the thing. Then, if the decision changed course, close the loop wherever the
work is tracked.

## Quality gates (these are the point)

| Gate | Why |
|---|---|
| One decision per ask, paced to their load | bundling *and* flooding both dump the load back on the human |
| Real captures redacted + channel-checked before posting | an aid is a publish surface; a leaked personal or client record outweighs a perfect frame |
| All five frame fields filled, including a recommendation | no recommendation means you don't understand the choice well enough to ask |
| Context carried into the ask | "go look up #X" offloads your work onto the busy person |
| Answerable in one tap | a 👍 beats a composed paragraph; if it needs a paragraph, the frame isn't done |
| Structural visuals grounded, not generated | a wrong diagram anchors a wrong decision |
| Generated images use a designated key, never a client's | credential-context is non-negotiable |
| Medium matched to complexity | a video for a yes/no wastes more attention than text would |
| The answer is read back before you act on it | a tap is not a verified instruction — a mis-tap or misread caught after the work is the expensive one |
| An escape hatch on every ask, honoured | a clean answer to the wrong question is the costliest outcome the frame can't prevent |
| Irreversible / regulated / multi-owner → worded reply + durable record, every owner | a 👍 that scrolls away can't answer "who approved this, and when?"; one tap isn't consensus |

The earned-place test: if a clarifying question went out as a wall of asks, or made
the person go look something up, or forced a paragraph when a 👍 would do, decisions
wasn't used.
