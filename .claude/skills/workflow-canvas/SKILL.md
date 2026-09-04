---
name: workflow-canvas
description: Draw any plan, workflow, or automation as an n8n canvas with numbered step zones, colour-coded groups, and notes carrying the real details - plus a readable page of the same thing. Use this whenever the user asks for a workflow, a plan, an automation, a launch plan, a marketing or advertisement plan, a process, "how will this work", or the steps for building something. Always start here before writing the plan as prose.
---

# Draw the plan before writing it

When someone asks for a workflow or a plan, they are asking to *see* it. A list
of bullet points forces them to hold the shape in their head; a canvas hands it
to them. Draw first, then write only what the drawing cannot say.

**Every plan gets two outputs, from one definition:**

1. **An n8n canvas** (`.json`) — importable, pannable, self-explaining.
2. **A readable page** (`.html`) — the same content for anyone without n8n, or
   on a phone.

Defining them once and generating both is what stops them drifting apart. Use
`canvas.py` in this folder; `projects/rentstore/automation/maps/build-maps.py` is
a worked example of both outputs from one definition.

## The grammar

**Numbered step zones.** Every phase sits in a big grey sticky titled
`## Step 1️⃣ <what happens>`, with one line underneath saying why the phase
exists. Numbers give the reader something to point at: "step 3 is wrong".

**Colour-coded groups inside each step.** Colour carries meaning, always the
same meaning:

| Role | Colour | Used for |
| --- | --- | --- |
| `input` | green | what a person gives us; approval gates |
| `prepare` | blue | deciding, shaping, formatting |
| `engine` | purple | the work itself — the thing that produces the value |
| `create` | red | money, or anything irreversible |
| `optional` | yellow | alternatives and offers the owner may or may not run |
| `note` | grey | credentials, links, rules, warnings |

**Every node explains itself.** Set `notes` and `notesInFlow: true` so the
description shows on the canvas under the box. A canvas that needs a separate
document to be understood has failed.

**Notes panels carry the real details.** Credentials and their links, the actual
prices, the grace period, the rule that protects the business. This is where a
reader checks the plan against reality — never leave it to memory.

**Optional branches are visibly optional.** Mark them `disabled: true` and put
them in a yellow group. The reader sees the choice instead of assuming it is
decided.

**Maps are not automations.** A drawing of a business or a plan uses `noOp`
nodes: it does nothing, sends nothing, charges nobody. Every map carries a
sticky saying so and a warning never to activate it, and lives in a `maps/`
folder separate from workflows that really run.

## Rules that keep it honest

- **Layout is computed, never eyeballed.** `Canvas.check()` fails the build if
  two nodes overlap. A canvas that reads wrong is a bug, not a cosmetic issue.
- **Steps run in one direction.** Left to right, wrapping down. A connector that
  flies backwards across the canvas means the phases are in the wrong order.
- **Name the arrows and the boxes in the reader's language**, not the system's:
  "Payment clears", not "Stripe webhook handler".
- **Say what is assumed.** If the plan rests on a decision the user never made,
  put it in a note panel and say it is an assumption.
- **Never invent numbers** to fill a notes panel. Quote the ones from the
  project's own config, or say the number is still open.

## Using it

```python
import sys; sys.path.insert(0, ".claude/skills/workflow-canvas")
from canvas import Canvas

c = Canvas("PLAN · Launch the marketplace")
c.note("⚠️ Map, not automation", "Every node is a No-Op…", at_step=-280, height=300, width=300)
start = c.trigger("The plan starts", "Press Execute to walk it.")
step1 = c.step(1, "Get the brand live", "Everything else carries it, so it goes first.", [
    ("input",  "🏷️ Decide",  [("P1 · Register the name", "Trade name and domain, checked for availability.")]),
    ("create", "💳 Pay for it", [("P2 · Buy the domain", "One year, on the business card.")]),
])
c.link(start, *step1)
print(c.save("plans/launch.json"))
```

Then render the same definition to a page for the people who will never open
n8n — most of them.
