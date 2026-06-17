# decisions — the pattern, in depth

`SKILL.md` is the operating method. This is the why, the lived detail, and the
failure modes — read it once so the gates in the skill make sense, then work from
the skill.

## The problem it solves

Async work between an AI agent and a human coworker breaks at one specific seam:
**the agent gets blocked on something only the human can decide, and asks badly.**
"Badly" is consistent and recognisable:

- **The wall.** Ten questions in one post. Efficient to write, miserable to answer.
  The human reads three, loses the thread, and replies to none — or replies to the
  easy one and the rest rot.
- **The lookup tax.** "Can you confirm the behaviour on #618?" The human now has to
  go open a ticket, reconstruct context the agent already had loaded, and come back.
  The agent offloaded its own context-assembly onto the busiest person in the loop.
- **The blank page.** "How should roles work?" An open-ended question demands the
  human *compose* an answer from scratch. A framed one with a recommendation demands
  only that they *confirm or correct*.
- **The over-production.** The opposite failure: a 90-second narrated video, three
  generated mockups, and a spec doc — for a yes/no. That wastes *more* attention
  than a plain text question would have.

Every one of these is the same root error: **treating the ask as a side-effect of
the agent's thinking, instead of as a deliverable for the human's attention.** The
skill exists to make the ask a produced artifact.

## Why one decision per ask is non-negotiable

Bundling feels efficient because the cost is invisible to the writer. But a person
answering async can hold exactly one decision in working memory at a time. Two
bundled decisions don't take 2× the attention — they take more, because now they
also have to *track which answer maps to which question* and structure a reply that
addresses both. The reply becomes a composing task, which is the thing we're trying
to eliminate.

Posted one at a time, each ask is a clean 👍. If the second decision genuinely
depends on the first, you *couldn't* have asked them together anyway — you needed
the first answer to frame the second. And if they're independent, there's no cost to
sequencing them except a few minutes, which async already absorbs.

The discipline that makes this bearable: **resolve everything you can yourself
first.** Most "questions" aren't decisions — they're things you can settle by
reading the code, checking the data, or picking the obvious default and noting it.
Only what's genuinely *theirs* (a preference, a policy, a priority, a fact they
alone hold) survives to become an ask.

## The five-part frame, and why each part earns its place

```
1. The decision      one, specific, answerable
2. Why it needs YOU   what only they hold — kills the "shouldn't you know this?" reflex
3. The choices        concrete, named, mutually exclusive
4. Recommendation+why turns compose → confirm
5. What it unblocks    the stakes — why ten seconds now matters
```

Part 4 is the one people skip and the one that does the most work. A recommendation
is not you being pushy — it's you having done the thinking so the human doesn't have
to. It converts the reply from "let me consider the options and write back" into
"yep, 1" or "no, 2 because…". The act of *writing* the recommendation is also the
quality gate: **if you can't name a recommended option, you don't understand the
decision well enough to ask it yet.** Go learn it, then ask.

## Carry the context in

The single highest-leverage habit. Never reference something the person has to go
open. Bring it into the ask:

- the **screenshot** of the screen in question
- the **line of code** or the **current value**
- the **before-state** they're being asked to change
- a **grounded matrix** of the options across the dimensions that matter

The test: *could they decide from your message alone, on their phone, without
opening another tab?* If not, you haven't carried enough.

## Match the medium — the aid ladder

Gate ruthlessly downward. Use the lightest that actually conveys the choice:

| Decision shape | Aid |
|---|---|
| yes/no, pick-one, self-evident | text + frame. **Most asks stop here.** |
| spatial / "what would it look like" | one screenshot of the real surface, or a wireframe image |
| options × dimensions | grounded **HTML matrix** → screenshot |
| flow / sequence / branch | **mermaid / graphviz** from the *real* code → screenshot |
| genuinely multi-branch, needs walking | **narrated screen-recording** (borrow fixer/walkabout) — rare |

## Grounding: structural vs pictorial

This is the rule that keeps the visuals from backfiring. A diagram that's subtly
wrong is **worse than no diagram** — it anchors the person on a false model and they
decide against the wrong picture.

- **Structural** (matrices, flows, trees, tables): the values are *facts you know*.
  Render them with **HTML / mermaid / graphviz** and screenshot. Accurate by
  construction — no model gets to invent a cell. No key, no network, fast. This is
  the default and it carries the large majority of asks. (`templates/matrix.html` +
  `render.mjs`.)
- **Pictorial** (wireframes, "the feel of the screen", illustrations): an image model
  is the right tool, *but it invents detail*. So:
  - client-facing decisions get the grounded structural aid, or a generated image
    clearly captioned "illustrative only";
  - internal asks may use generated images freely;
  - **always with a designated image-gen key** — a fleet key provisioned for this,
    held in the host's secret store with explicit agent access. **Never scavenge a
    client's or a project's key** for a cross-purpose ask. If no designated key
    exists, fall back to the HTML aid and say so. (This boundary was set in a real
    session: reaching for an unrelated project's key to render a mockup is a
    credential-context violation even when convenient.)

## The answer mechanism: one message per choice

The frame goes in a **context message** (carrying the visual). Then **each choice is
its own message**. That split is the whole trick — the human answers by **👍-ing the
message for the option they want**, or replying its number. No composing.

```
[context + visual] "One decision to unblock <X>. <the frame, tight>. Two options
                    below — 👍 the one you want, or reply its number."
[choice 1]         "1️⃣  <option A>  (recommended). <one line why>.  👍 or reply 1."
[choice 2]         "2️⃣  <option B>.  <one line why / trade-off>.   👍 or reply 2."
```

Always keep a **text fallback**. If the channel can't surface reactions, the reply
"1" still works. Never make answering require watching a video or decoding an image.

When the tap lands, **acknowledge it** ("got it — building option 1"). The human
spent ten seconds; confirming they counted is what keeps them willing to spend the
next ten. If it goes quiet, one gentle nudge on the same thread — never a re-post of
the whole question.

## Worked example (anonymised)

A real ask this skill was built from: an access-control decision where a role's
visibility scope was undecided. The shape that worked:

1. **Resolved first what could be resolved** — read the code, confirmed which roles
   were already settled and which one genuinely needed a human policy call. Only the
   undecided row survived to become the ask.
2. **Built a grounded matrix** — roles down the side, capabilities across the top,
   the settled rows filled from the actual code, the one undecided row highlighted
   amber with "A or B?". Rendered HTML → PNG. Every cell was a fact, so the picture
   couldn't mislead.
3. **Framed it** — the decision (one role's patient-visibility scope), why it needed
   the stakeholder (a clinical-workflow + privacy policy call, not a code question),
   the two named options, a recommendation with a one-line why, and the stakes (it
   unblocks the whole enforcement build).
4. **Posted context + matrix, then two option messages** for 👍.

The matrix did something extra the author didn't expect: **it helped the stakeholder
think**, not just answer. Laying the options against the dimensions made the
trade-off legible at a glance. That's the upside of grounding — a correct picture is
a thinking aid; a wrong one is a trap.

## Failure modes to watch

- **Scope creep back into a wall.** You start with one ask, then "while I'm here…"
  Resist. The next decision is the next message.
- **Recommendation-free asks.** A tell that you're outsourcing your thinking. Frame
  it or don't send it.
- **Generated-image drift.** A pretty wireframe with invented labels reads as
  authoritative. Caption it or ground it.
- **Key scavenging.** The convenient key is the wrong key if it belongs to a
  different context. Designated key or HTML fallback.
- **Over-production.** Three aids for a yes/no. The ladder goes *down* first.
