#!/bin/bash
# usage: fstill.sh frame...   (FORM composition)
cd /home/user/ads
mkdir -p .promptible/fframes
for f in "$@"; do
  npx remotion still FormAd .promptible/fframes/f$(printf %03d $f).png --frame=$f --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
done
