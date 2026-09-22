# The idea

Not selling the channel. Growing it — subscribers, watch time — and turning
that growth into income, in that order. Income follows the audience; it
isn't the first lever.

## The pipeline

1. **Foundation** — confirm the niche, baseline current subscribers/views/
   watch hours, brand the channel, pick 3–5 recurring content pillars.
2. **Collect & log** — raw video/photo dropped into one Drive folder, one
   naming rule, logged automatically as a tracked row.
3. **Auto-edit, enhance, add a soundtrack** — a generated soundtrack
   (`vidiq_generate_music`), then assembly into a rendered cut
   (`vidiq_compose`: clip + music + title overlay). Mechanical assembly,
   not creative judgment — that's why it's a composition tool rather than
   an editor's eye. This step is Claude, not n8n: see the README for why.
4. **Calendar** — title, description, tags, thumbnail, and a publish date,
   picked by a person, once per item.
5. **Confirm before publish** — the one mandatory human checkpoint. Nothing
   downstream fires until this gate is passed, on Telegram.
6. **Publish on schedule** — runs on its own once approved.
7. **Grow, then earn** — replies and community posts in the hours after
   publish (what the algorithm rewards early), collabs for cross-promo,
   and only then the income switches: ads first (lowest effort once
   eligible), sponsorships and affiliate links once the audience justifies
   them.

## The numbers this plan relies on

**YouTube Partner Program eligibility:** 1,000 subscribers **and** 4,000
public watch hours in the trailing 12 months, **or** 10M Shorts views in
the trailing 90 days. Everything else — niche, current stats, posting
cadence — is not yet known; see the open questions in the README rather
than guessing at them here.

## Why the auto-edit step isn't an n8n workflow

It needs two things n8n can't reach on its own:

- **vidIQ's generation tools** — `vidiq_generate_music` and `vidiq_compose`
  exist as tools inside Claude's own chat connection (MCP), not as a public
  REST endpoint an n8n HTTP Request node could call directly.
- **A human decision about when to run it** — the user chose on-request
  processing ("ping me") over a standing schedule, so there's no cron
  trigger polling for this step the way there is for the other four.

So instead: n8n logs a raw file as `Needs edit` and stops. The user pings
Claude, who generates the soundtrack, composes the final cut (clip + music
+ title overlay) with vidIQ, and writes the finished cut back to Drive and
the Sheet through a Google Drive + Sheets connector — closing the loop
without n8n's involvement in this one step. vidIQ also has real tools for
scored title/thumbnail suggestions (`vidiq_generate_titles`,
`vidiq_generate_thumbnail`, and their `_score_` counterparts) that can
speed up the Calendar step, though the final pick stays a human call.

**What this drops from the earlier design:** no Creatomate account or
template to build, and no separate "upscale" call — vidIQ's compose step
doesn't include a quality-upscale pass. If footage quality turns out to
need it, that's a gap to revisit, not something silently assumed solved.

## Open questions

- What's the channel's actual niche/content pillars?
- Current subscriber count, views, watch hours?
- Who shoots vs. edits/approves — one person or several?
- A sustainable posting cadence — how many uploads a week?

Answer these before the pipeline above is more than a shape.
