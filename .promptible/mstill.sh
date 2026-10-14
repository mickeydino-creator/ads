#!/bin/bash
# usage: mstill.sh frame...   (MusicInMotion composition)
cd /home/user/ads
mkdir -p .promptible/mframes
for f in "$@"; do
  npx remotion still MusicInMotion .promptible/mframes/f$(printf %03d $f).png --frame=$f --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
done
