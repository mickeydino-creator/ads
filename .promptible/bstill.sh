#!/bin/bash
# usage: bstill.sh frame...   (BarberAd composition)
cd /home/user/ads
mkdir -p .promptible/bframes
for f in "$@"; do
  npx remotion still BarberAd .promptible/bframes/f$(printf %03d $f).png --frame=$f --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
done
