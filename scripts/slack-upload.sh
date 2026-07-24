#!/usr/bin/env bash
# Upload a file to Slack and share it to a channel, using Slack's
# three-step external upload flow:
#   1. files.getUploadURLExternal  -> upload_url + file_id
#   2. POST the raw bytes to upload_url
#   3. files.completeUploadExternal -> file exists and is shared
#
# Usage:
#   SLACK_TOKEN=xoxb-... ./scripts/slack-upload.sh <file> <channel_id> [comment]
#
# Requirements:
#   - SLACK_TOKEN with the files:write scope
#   - The app must be a member of <channel_id> (/invite @yourapp),
#     and channel_id is the C... ID, not the #name.
#
# Note: Slack signals failure inside the JSON body ({"ok":false,...})
# with HTTP 200, so each step checks the body rather than the exit code.
set -euo pipefail

if [[ $# -lt 2 || -z "${SLACK_TOKEN:-}" ]]; then
  echo "usage: SLACK_TOKEN=xoxb-... $0 <file> <channel_id> [comment]" >&2
  exit 2
fi

FILE="$1"; CHANNEL="$2"; COMMENT="${3:-}"
LENGTH=$(wc -c < "$FILE")
NAME=$(basename "$FILE")

# step 1: get upload URL (length must be the exact byte count)
RESP=$(curl -sS 'https://slack.com/api/files.getUploadURLExternal' \
  -H "Authorization: Bearer $SLACK_TOKEN" \
  --form "filename=$NAME" --form "length=$LENGTH")
echo "$RESP" | grep -q '"ok":true' || { echo "step 1 failed: $RESP" >&2; exit 1; }
UPLOAD_URL=$(echo "$RESP" | sed -n 's/.*"upload_url":"\([^"]*\)".*/\1/p')
FILE_ID=$(echo "$RESP" | sed -n 's/.*"file_id":"\([^"]*\)".*/\1/p')

# step 2: upload the bytes (skipping this leaves the file in limbo)
curl -sS -X POST "$UPLOAD_URL" --data-binary @"$FILE" > /dev/null

# step 3: finalize + share
RESP=$(curl -sS 'https://slack.com/api/files.completeUploadExternal' \
  -H "Authorization: Bearer $SLACK_TOKEN" \
  --form "files=[{\"id\":\"$FILE_ID\",\"title\":\"$NAME\"}]" \
  --form "channel_id=$CHANNEL" \
  --form "initial_comment=$COMMENT")
echo "$RESP" | grep -q '"ok":true' || { echo "step 3 failed: $RESP" >&2; exit 1; }

echo "uploaded $NAME ($LENGTH bytes) to $CHANNEL as $FILE_ID"
