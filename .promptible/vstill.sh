#!/bin/bash
# usage: vstill.sh frame...   (VANTA composition)
cd /home/user/ads
mkdir -p .promptible/vframes
for f in "$@"; do
  npx remotion still VantaAd .promptible/vframes/f$(printf %03d $f).png --frame=$f --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
done
