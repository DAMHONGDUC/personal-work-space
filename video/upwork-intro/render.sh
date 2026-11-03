#!/bin/bash
# Re-makes the Upwork intro video and its YouTube thumbnail: installs Remotion
# here if needed, copies the portfolio portrait in, synthesises music as long as
# the film, then renders both into the site's public folder
# (ResourceConstant.UPWORK_INTRO_VIDEO, UPWORK_INTRO_THUMBNAIL).
# Usage, from the repo root: npm run video:upwork   (CHROME=<path> to use your own Chrome)
set -euo pipefail
cd "$(dirname "$0")"
ROOT=../..
OUT=$ROOT/public/personal/upwork/duc-upwork-intro-1920x1080.mp4
THUMB=$ROOT/public/personal/upwork/duc-upwork-intro-youtube-thumbnail-1280x720.png
[ -d node_modules ] || npm install --silent
mkdir -p public
cp "$ROOT/public/personal/porfolio-avt.png" public/portrait.png
BROWSER=(); [ -n "${CHROME:-}" ] && BROWSER=(--browser-executable="$CHROME")
FRAMES=$(npx remotion compositions src/index.ts "${BROWSER[@]}" 2>/dev/null | awk '$1 == "Editorial" {print $4}')
node synth.mjs "$(awk -v f="$FRAMES" 'BEGIN{printf "%.2f", f/60}')"
npx remotion render src/index.ts Editorial "$OUT" "${BROWSER[@]}" --codec=h264 --crf=17 \
  --audio-codec=aac --audio-bitrate=320k --concurrency=4 --log=error
npx remotion still src/index.ts Thumbnail "$THUMB" "${BROWSER[@]}" --log=error
echo "rendered $OUT and $THUMB"
