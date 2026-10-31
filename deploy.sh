#!/usr/bin/env bash
# Deploy main -> GitHub Pages (gh-pages branch) with CNAME pinned.
#
# Why this exists: stage-x.space DNS now points at GitHub Pages
# (apex A x4 -> 185.199.{108,109,110,111}.153, www CNAME -> utkarshethics.github.io).
# The gh-pages branch must ALWAYS carry a CNAME file containing "stage-x.space"
# or GitHub drops the custom-domain mapping. This script rebuilds gh-pages
# from the exact `main` tree and re-adds CNAME, so a plain `git push origin main`
# can never orphan the custom domain.
#
# Usage: ./deploy.sh   (run after pushing main)
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
SHA="$(git -C "$REPO" rev-parse --short main)"
BUILD="${GH_BUILD_DIR:-/tmp/stagex-ghpages-build}"
BRANCH=gh-pages
REMOTE=origin
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

# 5. IndexNow: ping Bing/Yandex for instant indexing of changed URLs.
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
      -d "{\"host\":\"www.stage-x.space\",\"key\":\"${INDEXNOW_KEY}\",\"keyLocation\":\"https://www.stage-x.space/${INDEXNOW_KEY}.txt\",\"urlList\":[\"https://www.stage-x.space/\",\"https://www.stage-x.space/summits\",\"https://www.stage-x.space/summits/sf-2026\",\"https://www.stage-x.space/summits/nyc-2026\",\"https://www.stage-x.space/summits/boston-2026\",\"https://www.stage-x.space/summits/toronto-2026\",\"https://www.stage-x.space/summits/london-2026\",\"https://www.stage-x.space/summits/berlin-2026\",\"https://www.stage-x.space/summits/dubai-2026\",\"https://www.stage-x.space/summits/mumbai-2026\",\"https://www.stage-x.space/summits/melbourne-2026\"]}" || true
  else
    echo "==> SKIP IndexNow: $INDEXNOW_KEY.txt missing from repo root"
  fi
fi

echo "==> Done. Live: http://stage-x.space (HTTPS auto-enables once the GH cert is issued)"