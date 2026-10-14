#!/bin/bash
# usage: still.sh frame...
cd /home/user/ads
for f in "$@"; do
  npx remotion still NoirCommercial .promptible/frames/f$(printf %03d $f).png --frame=$f --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
done
