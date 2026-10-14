"""Original soundtrack + SFX for the FORM Studio spot, 120 BPM in A minor.

Every hit is read from src/form/timeline.json, so the score and the animation
share one clock. The last accent lands on 14.5 s and the track stops on the
15.0 s beat. Output: public/music/form-soundtrack.wav
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from synth import (SR, bass_note, boom, clap, ding, env, filt, hat, kick, rev_cymbal,  # noqa: E402
                   riser, rng, snap, stab, tick, whoosh)

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "form" / "timeline.json").read_text())
FPS = T["fps"]
DUR = T["durationInFrames"] / FPS
N = int(DUR * SR)
BEAT = 60 / T["bpm"]


def sec(fr):
    return fr / FPS


music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
kicks = []


def put(buf, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    buf[i:j, 0] += sig[: j - i] * gain * l
    buf[i:j, 1] += sig[: j - i] * gain * r


def blip(freq, length=0.12, up=True):
    n = int(length * SR)
    x = np.arange(n) / SR
    f = freq * (1 + (0.6 if up else -0.4) * (1 - np.exp(-x / 0.02)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, length / 3)


def zip_up(length):
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    f = 300 * 2 ** (3 * x)
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3) * np.sin(np.pi * x) ** 2


# A minor: Am - F - C - G (one chord per bar)
A1, F1, C2, G1 = 55.0, 43.65, 65.41, 49.0
prog = [(A1, [440.0, 523.3, 659.3]), (F1, [349.2, 440.0, 523.3]), (C2, [392.0, 523.3, 659.3]), (G1, [392.0, 493.9, 587.3])]


def groove(t0, t1, gain=1.0, hats=True, bass=True, stabs=True, claps=True):
    t = t0
    while t < t1 - 1e-6:
        b = int(round(t / BEAT))
        put(music, kick(), t, 0.9 * gain)
        kicks.append(t)
        if hats:
            put(music, hat(), t + BEAT / 4, 0.1 * gain)
            put(music, hat(open_=True), t + BEAT / 2, 0.15 * gain)
            put(music, hat(), t + 3 * BEAT / 4, 0.1 * gain)
        if claps and b % 2 == 1:
            put(music, clap(), t, 0.42 * gain)
        root, chord = prog[(b // 4) % 4]
        if bass:
            put(music, bass_note(root, BEAT / 2 * 0.9), t, 0.5 * gain)
            put(music, bass_note(root * 2, BEAT / 4), t + BEAT / 2, 0.32 * gain)
            put(music, bass_note(root, BEAT / 4), t + 3 * BEAT / 4, 0.32 * gain)
        if stabs:
            put(music, stab(chord, 0.2), t + BEAT / 2, 0.22 * gain, 0.25 if b % 2 else -0.25)
        t += BEAT


h = T["hook"]
bd = T["build"]
tr = T["transform"]
sg = T["signature"]
fn = T["finale"]

# ---------------- 0-3 s: the hook ----------------
put(music, kick(big=True), sec(h["slam"]), 1.0)
kicks.append(0.0)
put(music, boom(), 0, 0.6)
put(music, stab(prog[0][1], 0.5), 0, 0.4)
put(sfx, clap(), 0, 0.5)
put(sfx, zip_up(0.45), sec(h["split"]), 0.22)
put(sfx, whoosh(0.35, 1500, 9000, 0.4), sec(h["browser"]), 0.35)
put(sfx, whoosh(0.45, 500, 6000, 0.5), sec(h["sweep"]), 0.4, 0.5)
put(music, kick(), sec(h["flip"]), 0.9)
kicks.append(sec(h["flip"]))
put(sfx, snap(), sec(h["flip"]), 0.5)
put(sfx, whoosh(0.18, 3000, 12000, 0.2), sec(h["strike"]), 0.5, -0.4)
for k in range(5):
    put(sfx, tick(2000 + 400 * k, 0.03), sec(h["shatter"] + 2 + k * 2), 0.25, (k - 2) / 3)
for fr in (h["not"], h["here"]):
    put(music, kick(), sec(fr), 0.9)
    kicks.append(sec(fr))
    put(music, stab(prog[0][1], 0.3), sec(fr), 0.3)
put(music, kick(), sec(60), 0.9)
kicks.append(sec(60))
put(sfx, clap(), sec(60), 0.45)
t = 0.0
while t < sec(75):
    put(music, hat(), t + BEAT / 2, 0.14)
    t += BEAT
put(sfx, riser(sec(15)), sec(h["wipe"]), 0.4)
put(sfx, whoosh(0.5, 300, 5000, 0.6), sec(T["s2"] - 8), 0.45)

# ---------------- 3-6 s: building the site ----------------
groove(sec(T["s2"]), sec(T["s3"]), gain=0.8, stabs=False)
pops = [bd["nav"], bd["hero"], bd["image"], bd["button"], *bd["cards"], bd["footer"]]
for i, fr in enumerate(pops):
    put(sfx, blip(660 * 2 ** (i / 7)), sec(fr), 0.16, -0.5 + i / 7)
    put(sfx, whoosh(0.2, 1200, 8000, 0.7), sec(fr) - 0.12, 0.18, 0.5 - i / 7)
put(sfx, whoosh(0.4, 800, 6000, 0.7), sec(148), 0.15)
put(sfx, tick(1600, 0.05), sec(bd["click"]), 0.5)
put(sfx, blip(1320, 0.2), sec(bd["click"]) + 0.03, 0.12)
put(sfx, riser(sec(T["s3"] - 160)), sec(160), 0.35)

# ---------------- 6-10 s: transformations ----------------
groove(sec(T["s3"]), sec(T["s4"]), gain=1.0)
put(music, boom(), sec(tr["expand"]), 0.8)
put(sfx, whoosh(0.5, 300, 7000, 0.4), sec(tr["expand"]), 0.45)
put(sfx, whoosh(1.6, 200, 2500, 0.5), sec(tr["typeSwap"] - 6), 0.25, 0.6)
put(sfx, snap(), sec(212), 0.35)
put(sfx, whoosh(0.35, 900, 7000, 0.5), sec(tr["shuffle"]), 0.35, -0.4)
put(sfx, whoosh(0.5, 400, 9000, 0.6), sec(tr["scroll"]), 0.45)
put(sfx, blip(330, 0.35), sec(tr["morph"]), 0.25)
put(sfx, whoosh(0.3, 1000, 10000, 0.45), sec(tr["wipe"]), 0.45, 0.5)
put(sfx, zip_up(0.6), sec(tr["reflow"] + 4), 0.15)
put(sfx, snap(), sec(tr["reflow"] + 22), 0.35)

# ---------------- 10-13 s: signature ----------------
groove(sec(T["s4"]), sec(sg["shapes"]), gain=0.9, stabs=False)
put(sfx, rev_cymbal(sec(sg["shapes"] - sg["converge"])), sec(sg["converge"]), 0.5)
for i in range(4):
    put(sfx, blip([440, 523.3, 659.3, 880][i], 0.18, up=False), sec(sg["shapes"] + i * 2), 0.22, -0.45 + i * 0.3)
put(music, kick(big=True), sec(sg["shapes"]), 0.8)
kicks.append(sec(sg["shapes"]))
# the calm: groove drops out, only a held chord and ticks
n = int(sec(sg["form"] - sg["calm"] + 4) * SR)
pad = sum(np.sin(2 * np.pi * fq * np.arange(n) / SR) for fq in (220, 261.6, 329.6)) / 3
put(music, pad * np.sin(np.linspace(0, np.pi, n)) ** 1.5, sec(sg["calm"]), 0.18)
for k in range(4):
    put(sfx, tick(3000, 0.02), sec(sg["calm"] + k * 3.75), 0.1)
for i in range(4):
    put(sfx, ding([523.3, 659.3, 784.0, 1046.5][i]), sec(sg["form"] + i * 3), 0.16, -0.45 + i * 0.3)
    put(music, kick(), sec(sg["form"] + i * 3), 0.35)
put(sfx, whoosh(0.45, 600, 8000, 0.5), sec(sg["studio"]), 0.4)
put(music, stab([440.0, 523.3, 659.3, 880.0], 0.35), sec(sg["studio"]), 0.35)
groove(sec(sg["studio"]), sec(T["s5"]), gain=0.7, stabs=False, bass=False)
k = 0
while sec(375) + k * BEAT / 4 < sec(T["s5"]) - BEAT / 4:
    put(music, clap(), sec(375) + k * BEAT / 4, 0.12 + 0.05 * k)
    k += 1
put(sfx, rev_cymbal(sec(15)), sec(T["s5"] - 15), 0.45)

# ---------------- 13-15 s: finale ----------------
put(music, kick(big=True), sec(fn["lock"]), 1.0)
kicks.append(sec(fn["lock"]))
put(music, boom(), sec(fn["lock"]), 0.9)
put(music, stab([440.0, 523.3, 659.3, 880.0], 0.6), sec(fn["lock"]), 0.4)
groove(sec(fn["lock"]) + BEAT, sec(fn["button"]), gain=0.85)
put(sfx, snap(), sec(fn["lock"]), 1.1)
put(sfx, clap(), sec(fn["lock"]), 0.7)
put(sfx, whoosh(0.3, 2000, 12000, 0.15), sec(fn["lock"]), 0.4, 0.4)
put(sfx, whoosh(0.55, 1200, 10000, 0.5), sec(fn["accent"]), 0.35, -0.5)
put(sfx, snap(), sec(fn["line1"]), 0.3)
put(sfx, snap(), sec(fn["line2"]), 0.4)
put(music, kick(big=True), sec(fn["button"]), 1.0)
kicks.append(sec(fn["button"]))
put(music, stab([220.0, 440.0, 523.3, 659.3, 880.0], 0.5), sec(fn["button"]), 0.5)
put(sfx, ding(1760), sec(fn["button"]), 0.15)
put(music, boom(), sec(fn["button"]), 0.6)

# ---------------- dynamics & master ----------------
pump = np.ones(N)
for kt in kicks:
    i = int(kt * SR)
    m = int(0.2 * SR)
    j = min(N, i + m)
    pump[i:j] = np.minimum(pump[i:j], 0.4 + 0.6 * np.linspace(0, 1, j - i) ** 0.8)
music *= pump[:, None]
for kt in kicks:
    put(music, kick(big=True), kt, 0.35)

# widen the effects bus: right channel lags 11 ms
d = int(0.011 * SR)
sfx[:, 1] = np.concatenate([np.zeros(d), sfx[:-d, 1]])
mix = music + sfx
# the last accent rings out from 14.5 s and settles to silence on the 15.0 s beat
tt = np.arange(N) / SR
ring = np.clip((tt - sec(fn["button"])) / (DUR - sec(fn["button"])), 0, 1)
mix *= (np.cos(ring * np.pi / 2) ** 2)[:, None]
mix = np.tanh(mix * 0.7) / np.tanh(0.7)
mix /= np.max(np.abs(mix)) / 10 ** (-3.0 / 20)

dest = ROOT / "public" / "music" / "form-soundtrack.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {dest}")
