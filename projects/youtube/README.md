# YouTube Channel Growth

Grow the channel's subscribers and watch time, and turn that into income —
not by selling the channel, by running it: organize raw footage, auto-edit
and enhance it, hold every item at a confirm-before-publish gate, then
publish on schedule. See `docs/idea.md` for the full plan and the open
questions it still depends on.

## Where everything lives

See also `.claude/skills/youtube-trend-content/SKILL.md` — a second, parallel
content source: Claude researches trending topics and generates the whole
video with vidIQ, no filming involved. Feeds the same Content Calendar.

```
projects/youtube/
├── README.md                          ← you are here
├── docs/
│   ├── idea.md                          the plan: pillars, pipeline, open questions
│   └── plan.html                        the same plan as a readable page
└── automation/                        THE WORKFLOWS — n8n JSON, importable as-is
    ├── workflow-01-intake.json          watch Drive, log new footage
    ├── workflow-02-request-approval.json   daily Telegram approval ask
    ├── workflow-03-handle-approval.json    react to the approve/reject tap
    ├── workflow-04-scheduled-publish.json  auto-publish once approved + due
    ├── youtube-automation-ALL-IN-ONE.json  all four, one file, four lanes
    ├── youtube-automation-VISUAL.json      same four, laid out as numbered Steps
    ├── build_workflows.py               generates the four workflow-0N files
    ├── build_combined.py                generates the ALL-IN-ONE file
    └── build_visual.py                  generates the numbered-step VISUAL file

    Regenerate after editing a builder script:
        python3 automation/build_workflows.py
        python3 automation/build_combined.py   # reads the workflow-0N files
        python3 automation/build_visual.py     # reads the workflow-0N files
```

## The shape of it

Four things run inside n8n. Two things deliberately don't — both are Claude,
on request, and both end at the same `Ready to schedule` status.

1. **Intake** — a Drive watch logs every new raw file as a tracked row,
   status `Needs edit`. *(Footage path only — skip this if the row came from
   trend research instead.)*
2. **Auto-edit, enhance, add a soundtrack** — **not an n8n workflow.** It
   uses vidIQ's generation tools (`vidiq_generate_music` for the soundtrack,
   `vidiq_compose` to assemble the clip + music + title overlay into a
   rendered MP4), which only exist through Claude's own chat connection. You
   ping Claude to process pending rows; it reads/writes the Sheet directly
   through a Google Drive + Sheets connector and leaves the row at
   `Ready to schedule`. *(Footage path.)*
2b. **Trend research → AI-generated video** — **also not an n8n workflow,
   and a separate entry point from Intake.** Claude searches trending topics
   in the channel's niche (vidIQ's `vidiq_outliers`/`vidiq_trending_videos`/
   `vidiq_keyword_research`), then generates a full video — script,
   voiceover, visuals, music, thumbnail — and logs a new row straight to
   `Ready to schedule`. Full procedure in
   `.claude/skills/youtube-trend-content/SKILL.md`, including the
   monetization-policy tradeoff the channel owner accepted by choosing this
   path (see `docs/idea.md`).
3. **You** fill in title, description, tags, thumbnail, and the publish
   date, then flip status to `Scheduled`.
4. **Request approval → handle the reply** — a daily Telegram ping with
   Approve/Reject buttons; nothing publishes without a tap here — AI-generated
   rows go through this gate too, no exceptions.
5. **Publish on schedule** — once `Approved` and its time has arrived, it
   uploads to YouTube on its own.

## Status — what's actually working vs. still a placeholder

| Piece | Status |
| --- | --- |
| Drive intake, Sheet logging | Built. Needs your `REPLACE_WITH_...` IDs filled in. |
| Approval request/reply, scheduled publish | Built. Needs Telegram bot + YouTube Data API v3 credentials (not set up yet — see workflow 4's note). |
| Auto-edit (soundtrack + assembly via vidIQ) | Real, working tools (`vidiq_generate_music`, `vidiq_compose`) reachable now through Claude's chat connection — no third-party account or template needed. Still needs: a Google Drive + Sheets connector granted to Claude (Drive granted; Sheets not yet — a Calendar connector was granted instead, which isn't the same product), and the Raw Uploads folder set so files are link-accessible (vidIQ imports by public HTTPS URL). |
| Trend research → AI-generated content | Design and tool chain are real (vidIQ outliers/trending/keyword research + script/voiceover/broll/video/music/compose). Same blocker as above: the Sheets connector. Not yet run end to end. |
| Monetization (ads, sponsorships, affiliate) | Deliberately last. Needs YouTube Partner Program eligibility first: 1,000 subscribers + 4,000 public watch hours in 12 months, or 10M Shorts views in 90 days — and the trend-research path carries extra monetization risk under YouTube's inauthentic/mass-produced-content policy, accepted knowingly (see idea.md). |

## Open questions the plan still depends on

- What's the channel's actual niche/content pillars?
- Current subscriber count, views, watch hours — the baseline everything
  else is measured against?
- Who shoots vs. approves — one person or several?
- A sustainable posting cadence?

## Credentials this needs, once, before anything runs

See the sticky notes inside `youtube-automation-VISUAL.json` (or any of the
`workflow-0N` files) for the full checklist: Google Drive + Sheets OAuth2
in n8n, a Telegram bot + chat id, YouTube Data API v3 OAuth2, and a Google
Drive + Sheets connector granted to Claude for the auto-edit hand-off.
vidIQ needs no separate setup — it's already connected in this chat.
