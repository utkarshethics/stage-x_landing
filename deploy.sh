#!/usr/bin/env bash
# Deploy main -> Cloudflare Pages (stage-x-staging, serves www.stage-x.space)
# with GitHub Pages (gh-pages branch) kept as a mirror + CNAME pinned.
#
# Why this exists: LIVE DNS for www.stage-x.space is a CNAME -> stage-x-staging.pages.dev
# (Cloudflare Pages). GitHub Pages is NOT the serving origin, so pushing gh-pages
# alone never updates the live site. This script:
#   1. Syncs the exact `main` tree to gh-pages (historic mirror, CNAME pinned).
#   2. Deploys the same tree to Cloudflare Pages project "stage-x-staging"
#      (the real origin behind www.stage-x.space).
#
# Usage: ./deploy.sh   (run after pushing main)
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
SHA="$(git -C "$REPO" rev-parse --short main)"
BUILD="${GH_BUILD_DIR:-/tmp/stagex-ghpages-build}"
CF_BUILD="${CF_BUILD_DIR:-/tmp/stagex-cf-build}"
BRANCH=gh-pages
REMOTE=origin
CF_PROJECT="${CF_PROJECT:-stage-x-staging}"
# CNAME is www.stage-x.space: GitHub verifies custom domains via CNAME
# (faster/more reliable than apex A-record verification) and serves the apex
# domain too when apex A records point at 185.199.{108,109,110,111}.153.
CNAME="${CNAME:-www.stage-x.space}"

echo "==> Deploying main @ $SHA to $BRANCH"

# 1. Get a clean worktree of the gh-pages branch.
#    NOTE: worktree .git is a FILE (gitdir pointer), not a directory -> use -e.
if [ ! -e "$BUILD/.git" ]; then
  git -C "$REPO" worktree prune
  git -C "$REPO" worktree add --force "$BUILD" "$BRANCH" 2>/dev/null \
    || git -C "$REPO" worktree add --force -b "$BRANCH" "$BUILD" HEAD
fi
git -C "$BUILD" fetch "$REMOTE" "$BRANCH"
git -C "$BUILD" reset --hard "$REMOTE/$BRANCH"

# 2. Replace worktree contents with the main tree (tracked files only)
git -C "$BUILD" rm -rfq . 2>/dev/null || true
git -C "$REPO" archive main | tar -x -C "$BUILD"

# 3. Pin the custom domain
echo "$CNAME" > "$BUILD/CNAME"
git -C "$BUILD" add -A

# 4. Commit + push only if something actually changed
if git -C "$BUILD" diff --cached --quiet; then
  echo "==> No changes (main already deployed). CNAME is intact."
  SKIP_PING=1
else
  git -C "$BUILD" -c user.name="stage-x deploy" -c user.email="deploy@stage-x.space" \
    commit -q -m "deploy: main @ $SHA"
  git -C "$BUILD" push "$REMOTE" "$BRANCH"
  echo "==> Deployed main @ $SHA -> $BRANCH"
fi

# 5. Cloudflare Pages: deploy the same main tree to the REAL origin.
#    www.stage-x.space resolves to ${CF_PROJECT}.pages.dev; gh-pages is only a mirror.
if [ -n "${SKIP_PING:-}" ] && [ "${SKIP_CF:-0}" = "1" ]; then
  true
else
  rm -rf "$CF_BUILD" && mkdir -p "$CF_BUILD"
  git -C "$REPO" archive main | tar -x -C "$CF_BUILD"
  echo "==> Deploying main @ $SHA to Cloudflare Pages ($CF_PROJECT)"
  npx --yes wrangler pages deploy "$CF_BUILD" --project-name="$CF_PROJECT" --branch=main --commit-dirty=true
fi

# 6. IndexNow: ping Bing/Yandex for instant indexing of changed URLs.
#    Runs after every deploy (no-op frequency is fine; site is small).
INDEXNOW_KEY="${INDEXNOW_KEY:-81e649f8-dfca-431a-8852-f157b8a1c48c}"
if [ -z "${SKIP_PING:-}" ]; then
  if [ -f "$REPO/$INDEXNOW_KEY.txt" ]; then
    PING="https://www.stage-x.space/sitemap.xml"
    curl -sS -o /dev/null -w "==> IndexNow ping: HTTP %{http_code}\n" \
      "https://www.stage-x.space/indexnow?url=${PING}&key=${INDEXNOW_KEY}" || true
    curl -sS -o /dev/null -w "==> IndexNow submit: HTTP %{http_code}\n" \
      -X POST "https://api.indexnow.org/indexnow" \
      -H "Content-Type: application/json; charset=utf-8" \
      -d "{\"host\":\"www.stage-x.space\",\"key\":\"${INDEXNOW_KEY}\",\"keyLocation\":\"https://www.stage-x.space/${INDEXNOW_KEY}.txt\",\"urlList\":[\"https://www.stage-x.space/\",\"https://www.stage-x.space/summits.html\",\"https://www.stage-x.space/summits/sf-2026.html\",\"https://www.stage-x.space/summits/nyc-2026.html\",\"https://www.stage-x.space/summits/boston-2026.html\",\"https://www.stage-x.space/summits/toronto-2026.html\",\"https://www.stage-x.space/summits/london-2026.html\",\"https://www.stage-x.space/summits/berlin-2026.html\",\"https://www.stage-x.space/summits/dubai-2026.html\",\"https://www.stage-x.space/summits/mumbai-2026.html\",\"https://www.stage-x.space/summits/melbourne-2026.html\"]}" || true
  else
    echo "==> SKIP IndexNow: $INDEXNOW_KEY.txt missing from repo root"
  fi
fi

echo "==> Done. Live: http://stage-x.space (HTTPS auto-enables once the GH cert is issued)"