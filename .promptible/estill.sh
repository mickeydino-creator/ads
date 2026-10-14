#!/bin/bash
# usage: estill.sh frame...   (editorial composition)
cd /home/user/ads
mkdir -p .promptible/eframes
for f in "$@"; do
  npx remotion still NoirEditorial .promptible/eframes/f$(printf %03d $f).png --frame=$f --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
done
