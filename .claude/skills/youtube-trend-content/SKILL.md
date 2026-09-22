---
name: youtube-trend-content
description: Research trending YouTube topics and produce a fully AI-generated video (script, voiceover, visuals, music, thumbnail) for the projects/youtube channel, then file it into the Content Calendar to flow through the existing approval/publish pipeline. Use when asked to find trending subjects and turn one into a video, or to keep the channel fed with AI-generated content.
---

# YouTube trend research → AI-generated content

Feeds `projects/youtube`'s Content Calendar from a second entry point: instead
of a human shooting raw footage (the Drive-intake path), this researches
what's trending right now and generates the whole video — script, voice,
visuals, music, thumbnail — using vidIQ's tools. The output lands in the same
Sheet, at the same `Ready to schedule` status, so it goes through the exact
same human calendar step, Telegram approval gate, and scheduled-publish
workflow as footage-based videos. Nothing about Steps 3–5 changes.

**Read this before using it:** the channel owner explicitly chose full AI
generation over human-filmed content, aware of the tradeoff below. Don't
re-litigate that choice each time; do keep it honest per video (see
Compliance).

## Before generating anything, confirm scope

Ask (or use standing defaults the user already gave you) for:
- **Niche / pillar** to search trends within — don't generate on a whim.
- **Target length** (drives script `lengthMinutes` and compose duration; note
  vidiq_compose caps at 240s total, so long-form needs multiple compose
  passes or a shorter scope).
- **Budget appetite for `vidiq_generate_video`** — its cost scales with
  duration × model rate × 20 credits per clip, and a multi-scene video needs
  several clips. `vidiq_generate_broll` (free stock footage, 1 credit/search)
  is the cheap default; reach for `vidiq_generate_video` only for scenes stock
  footage can't cover, and say the credit cost before submitting each one.

## The pipeline

1. **Research** — `vidiq_trend_categories` to see relevant category slugs,
   then `vidiq_outliers` (filter by `keyword`/`trendCategories`, sort by
   `breakoutScore`) and/or `vidiq_trending_videos` (raw velocity) scoped to
   the niche. Cross-check demand with `vidiq_keyword_research` (mode
   `research` or `rising`). Present 3–5 topic candidates with why each is
   trending (view velocity, breakout score, search volume) and let the user
   pick — don't silently choose for them on the first run of a session.

2. **Title & script** — `vidiq_generate_titles` (scored candidates) +
   `vidiq_score_title` to settle on a working title. `vidiq_generate_script`
   with `topic`, the chosen `title`, a `concept` (the angle), and `research`
   grounded in what step 1 actually found (cite the trending videos/keywords,
   don't invent research). Poll `vidiq_job_poll` until completed.

3. **Voiceover** — `vidiq_voiceover_list_voices` (prefer `isCustom` voices if
   any exist — that's the user's own cloned voice), then
   `vidiq_voiceover_generate(script, voiceId)`. Poll for the hosted MP3 +
   duration; that duration is what the compose step's scenes need to sum to.

4. **Visuals, scene by scene** — for each beat in the script, prefer
   `vidiq_generate_broll` (free, real stock footage, 1 credit, requires
   crediting the photographer) over `vidiq_generate_video` (AI-generated,
   real cost, use only where stock can't cover the beat — confirm the credit
   cost with the user first). `vidiq_edit_media` (`trim_media`,
   `extract_thumbnail`) can shape a clip before it goes into a scene.

5. **Music** — `vidiq_generate_music` with a prompt matched to the topic's
   mood; keep it `instrumental` unless the concept wants a vocal track.

6. **Compose** — `vidiq_compose`: scenes (the b-roll/generated clips, each
   sized to fit the voiceover), `voiceover` (the step-3 MP3), `music` (ducked
   under the voiceover via `duckTo`+`fadeMs`), and `overlays` for a title
   card / key-point text. Output format matches the target: `landscape` for
   long-form, `vertical` for Shorts. Download the signed result URL
   immediately — it expires.

7. **Thumbnail** — `vidiq_generate_thumbnail` grounded in the final title +
   description, then `vidiq_score_thumbnail` to sanity-check it; iterate at
   most once or twice using the feedback field, not endlessly chasing a
   higher score.

8. **File it into the Content Calendar** — download the compose output,
   upload to the project's `Edited` Drive folder (Google Drive connector),
   then add a new row to the Content Calendar Sheet (Sheets connector) with
   `raw_file_link` empty, `edited_file_link` set, `pillar`/`format` set, and
   `status: Ready to schedule` — same schema as `projects/youtube/README.md`
   documents. From there it's identical to the footage path: a human picks
   the final title/description/tags/date and sets `Scheduled`, Telegram asks
   for approval, and the existing n8n workflow publishes it. Don't skip the
   approval gate for AI-generated content — if anything it matters more here.

## Compliance — don't skip this

- **YouTube's monetization policy** penalizes "inauthentic," mass-produced,
  or repetitive content; channels built entirely on formulaic AI video have
  had monetization denied or revoked under this rule. The channel owner
  accepted this risk explicitly (see `docs/idea.md`) — don't re-ask each
  time, but don't let quality slip to "obviously formulaic" either, since
  that's the actual failure mode the policy targets.
- **Disclose synthetic media.** When the calendar step schedules an
  AI-generated video for actual publish, the person doing that (or the
  YouTube upload step) should mark it under YouTube's "altered or synthetic
  content" disclosure — required for realistic AI-generated video. Note this
  in the Sheet row (e.g. a note in `description` or a dedicated marker) so
  it isn't lost between here and the publish step.
- **Attribution** — `vidiq_generate_broll` clips need photographer credit
  per its tool description; carry that into the video description if stock
  footage is used.
