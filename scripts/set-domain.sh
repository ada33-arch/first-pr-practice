#!/usr/bin/env bash
#
# Point the site at a real domain.
#
# Writes site/CNAME and replaces the placeholder domain everywhere it appears:
# the canonical tags, the Open Graph URLs, robots.txt, and sitemap.xml.
#
#   scripts/set-domain.sh yourbrand.ae
#
# Re-runnable: it rewrites whatever domain is currently set, so running it again
# with a different name moves the site cleanly.

set -euo pipefail

PLACEHOLDER="example.ae"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$ROOT/site"

usage() {
  cat >&2 <<'USAGE'
usage: scripts/set-domain.sh <domain>

  <domain>  bare domain, no scheme and no trailing slash (e.g. yourbrand.ae)
USAGE
  exit 2
}

[ $# -eq 1 ] || usage
DOMAIN="$1"

case "$DOMAIN" in
  http://*|https://*) echo "error: pass the bare domain, without https://" >&2; exit 2 ;;
  */*)                echo "error: pass the bare domain, without a path" >&2;   exit 2 ;;
esac

# Letters, digits, hyphens, at least one dot — enough to catch typos and paste errors.
if ! printf '%s' "$DOMAIN" | grep -Eq '^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$'; then
  echo "error: '$DOMAIN' does not look like a domain name" >&2
  exit 2
fi

# Whatever domain is live right now — the placeholder on a fresh checkout, or the
# last one this script wrote.
CURRENT="$PLACEHOLDER"
if [ -s "$SITE/CNAME" ]; then
  CURRENT="$(tr -d '[:space:]' < "$SITE/CNAME")"
fi

if [ "$CURRENT" = "$DOMAIN" ]; then
  echo "Already set to $DOMAIN — nothing to do."
  exit 0
fi

printf '%s\n' "$DOMAIN" > "$SITE/CNAME"

# CNAME is written above, not rewritten here.
for f in "$SITE"/*.html "$SITE/robots.txt" "$SITE/sitemap.xml"; do
  [ -f "$f" ] || continue
  # sed -i is not portable between GNU and BSD; write a temp file and move it.
  sed "s|$CURRENT|$DOMAIN|g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done

echo "Domain set to $DOMAIN (was $CURRENT)."
echo
echo "Next:"
echo "  1. git add -A && git commit -m 'Point site at $DOMAIN' && git push"
echo "  2. Settings -> Pages -> Source: GitHub Actions"
echo "  3. Add the DNS records from docs/ae-domain-and-launch.md at your registrar"
