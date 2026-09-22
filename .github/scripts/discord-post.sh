#!/usr/bin/env bash
# Post a Discord webhook message from a JSON payload file.
#
#   discord-post.sh payload.json
#
# The payload is the same shape Discohook edits (username, avatar_url, content,
# embeds), so a message designed there can be pasted into a file and sent from
# here unchanged. Embed timestamps are replaced with the current time so an
# old file does not post looking days stale.
#
# The webhook URL comes from DISCORD_WEBHOOK_URL. When it is unset - a fork, or
# before the secret has been added - this skips rather than failing, so a
# missing webhook never blocks a release.

set -euo pipefail

PAYLOAD="${1:?usage: discord-post.sh payload.json}"

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "::warning::DISCORD_WEBHOOK_URL is not set - skipping the Discord post."
  exit 0
fi

BODY=$(jq --arg now "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" '
  if .embeds then .embeds |= map(if .timestamp then .timestamp = $now else . end) else . end
' "$PAYLOAD")

# ?wait=true makes Discord answer with the created message, or a readable
# error, instead of an empty 204 - so a rejected embed fails the step loudly.
STATUS=$(curl -sS -o response.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "$BODY" \
  "${DISCORD_WEBHOOK_URL}?wait=true")

if [ "$STATUS" -ge 300 ]; then
  echo "Discord rejected the message (HTTP $STATUS):" >&2
  cat response.json >&2
  exit 1
fi
echo "Posted to Discord (HTTP $STATUS)."
