"""Original score for MUSIC IN MOTION (unofficial portfolio concept), 120 BPM.

Synthesised from scratch with audio/synth.py, so it is fully cleared for portfolio use.
Each section changes groove to match the picture: a burst and type hits, a
player groove, three different worlds (bright house, half-time night, heavy bass),
the converge build and a final hit on 14.5 s that rings out to silence at 15.0 s.
Every cue reads src/pulse/timeline.json. Output: public/music/music-in-motion.wav
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from synth import (SR, bass_note, boom, clap, ding, env, filt, hat, kick, rev_cymbal,  # noqa: E402
                   riser, saw, snap, stab, tick, whoosh)

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "pulse" / "timeline.json").read_text())
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


def K(t, g=0.9, big=False):
    put(music, kick(big=big), t, g)
    kicks.append(t)


def pluck(freq, length=0.22):
    n = int(length * SR)
    x = np.arange(n) / SR
    s = saw(freq, n, (0.0, 0.005))
    return filt(s, hi=3200) * np.exp(-x / 0.06)


def pop(freq=880.0):
    n = int(0.12 * SR)
    x = np.arange(n) / SR
    f = freq * (1 + 0.8 * np.exp(-x / 0.01))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.035)


def wobble(freq, length, rate=4.0):
    n = int(length * SR)
    x = np.arange(n) / SR
    s = saw(freq, n, (0.0, 0.01, -0.008))
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * rate * x)
    lo = filt(s, hi=180)
    hi = filt(s, hi=1400)
    return (lo * (1 - lfo) + hi * lfo) * np.minimum(1, x / 0.01)


def pad(freqs, length):
    n = int(length * SR)
    s = sum(saw(fq, n, (-0.004, 0.0, 0.005)) for fq in freqs) / len(freqs)
    return filt(s, hi=900) * np.sin(np.linspace(0, np.pi, n)) ** 1.2


o, p, w, c, fn = T["open"], T["player"], T["worlds"], T["converge"], T["final"]
Am = [220.0, 261.6, 329.6]
F = [174.6, 220.0, 261.6]
C = [261.6, 329.6, 392.0]
G = [196.0, 246.9, 293.7]

# ---------------- 0-3 s: burst and type ----------------
K(0, 1.0, big=True)
put(music, boom(), 0, 1.0)
put(music, clap(), 0, 0.6)
put(sfx, whoosh(0.5, 2000, 12000, 0.08), 0, 0.5)
put(music, stab(Am, 0.4), sec(o["press"]), 0.35)
put(music, stab([329.6, 440.0, 523.3], 0.4), sec(o["play"]), 0.4)
K(sec(o["play"]), 0.8)
for i in range(5):
    put(sfx, tick(1800 + i * 300, 0.03), sec(o["press"] + i), 0.18, -0.4 + i * 0.2)
    put(sfx, tick(2600 + i * 300, 0.03), sec(o["play"] + i), 0.18, -0.4 + i * 0.2)
put(sfx, whoosh(0.25, 3000, 12000, 0.3), sec(o["split"]), 0.3)
t = sec(o["split"])
while t < sec(T["s2"]) - 1e-6:
    K(t, 0.85)
    put(music, hat(), t + BEAT / 2, 0.16)
    t += BEAT
for k in range(8):
    put(sfx, pop(660 * 2 ** ((k % 4) / 4)), sec(o["bars"]) + k * BEAT / 2, 0.12, -0.5 + (k % 4) / 3)
put(sfx, whoosh(0.4, 600, 7000, 0.6), sec(o["radial"]), 0.35)
put(sfx, whoosh(0.35, 1000, 9000, 0.4), sec(o["iris"]), 0.3)
put(sfx, riser(sec(15)), sec(o["iris"]), 0.25)

# ---------------- 3-6 s: the player ----------------
t = sec(T["s2"])
b = 0
while t < sec(T["s3"]) - 1e-6:
    K(t, 0.85)
    put(music, hat(), t + BEAT / 4, 0.08)
    put(music, hat(open_=True), t + BEAT / 2, 0.12)
    if b % 2:
        put(music, clap(), t, 0.35)
    root = [110.0, 87.3, 130.8, 98.0][(b // 4) % 4]
    put(music, bass_note(root / 2, BEAT / 2 * 0.9), t, 0.45)
    put(music, pluck([440, 523.3, 659.3, 783.9][b % 4]), t + BEAT / 2, 0.16, 0.3 if b % 2 else -0.3)
    t += BEAT
    b += 1
put(sfx, whoosh(0.35, 800, 8000, 0.5), sec(p["art"]), 0.3)
put(sfx, whoosh(0.2, 2000, 10000, 0.6), sec(p["title"]), 0.2, 0.4)
put(sfx, tick(2200, 0.05), sec(p["progress"]), 0.25)
for i in range(3):
    put(sfx, pop(880 * 2 ** (i / 5)), sec(p["controls"] + i * 2), 0.18, (i - 1) * 0.5)
for i, fr in enumerate(p["tracks"]):
    put(sfx, pop(1320 + 110 * i), sec(fr), 0.12, 0.5)
put(sfx, whoosh(0.5, 3000, 12000, 0.9), sec(p["scrub"]), 0.15)
put(sfx, whoosh(0.5, 400, 6000, 0.3), sec(p["breakup"]), 0.45)
put(sfx, riser(sec(T["s3"] - p["breakup"])), sec(p["breakup"]), 0.4)
for k in range(3):
    put(sfx, snap(), sec(p["compose"]) + k * BEAT / 6, 0.35, (k - 1) * 0.5)
put(music, stab([523.3, 659.3, 783.9], 0.3), sec(p["compose"] + 4), 0.35)
put(sfx, rev_cymbal(BEAT), sec(T["s3"]) - BEAT, 0.35)

# ---------------- 6-7.3 s: SUMMER FEVER (bright house) ----------------
t = sec(w["sun"])
b = 0
while t < sec(w["moon"]) - 1e-6:
    K(t, 1.0, big=(b == 0))
    put(music, hat(open_=True), t + BEAT / 2, 0.18)
    put(music, hat(), t + BEAT / 4, 0.1)
    put(music, hat(), t + 3 * BEAT / 4, 0.1)
    if b % 2:
        put(music, clap(), t, 0.45)
    put(music, stab(C if b % 2 else F, 0.18), t + BEAT / 2, 0.28, 0.3 if b % 2 else -0.3)
    put(music, bass_note(87.3 if b % 2 == 0 else 130.8, BEAT / 2), t + BEAT / 2, 0.45)
    t += BEAT
    b += 1
put(music, boom(), sec(w["sun"]), 0.7)
put(sfx, whoosh(0.4, 500, 9000, 0.5), sec(w["moon"]) - 0.2, 0.4, -0.3)
K(sec(w["moon"]), 0.9, big=True)
put(sfx, snap(), sec(w["moon"]), 0.5)

# ---------------- 7.3-8.7 s: MIDNIGHT DRIVE (half-time night) ----------------
put(music, pad([110.0, 164.8, 220.0, 261.6], sec(w["bass"] - w["moon"]) + 0.3), sec(w["moon"]), 0.35)
K(sec(w["moon"]) + 2 * BEAT, 0.8)
put(music, clap(), sec(w["moon"]) + BEAT * 1, 0.3)
put(music, clap(), sec(w["moon"]) + BEAT * 3, 0.3)
for k in range(8):
    tt = sec(w["moon"]) + k * BEAT / 2
    put(music, pluck([659.3, 523.3, 440.0, 392.0][k % 4], 0.3), tt, 0.14, -0.5 if k % 2 else 0.5)
    put(music, pluck([659.3, 523.3, 440.0, 392.0][k % 4], 0.3), tt + 0.19, 0.06, 0.5 if k % 2 else -0.5)  # delay echo
put(sfx, whoosh(0.3, 1500, 10000, 0.7), sec(w["bass"]) - 0.25, 0.35)

# ---------------- 8.7-10 s: BASS THEORY (heavy) ----------------
t = sec(w["bass"])
b = 0
while t < sec(T["s4"]) - 1e-6:
    K(t, 1.0, big=(b == 0))
    for q in range(4):
        put(music, hat(), t + q * BEAT / 4, 0.08 + 0.04 * (q == 2))
    if b % 2:
        put(music, clap(), t, 0.5)
    t += BEAT
    b += 1
put(music, wobble(55.0, sec(T["s4"] - w["bass"]), rate=4.0), sec(w["bass"]), 0.45)
put(music, boom(), sec(w["bass"]), 0.9)
put(sfx, snap(), sec(w["bass"]), 0.6)
put(music, clap(), sec(w["bass"]), 0.5)

# ---------------- 10-13 s: converge ----------------
put(sfx, rev_cymbal(sec(c["rings"] - c["rush"])), sec(c["rush"]), 0.5)
put(music, stab(Am + [440.0], 0.5), sec(c["rings"]), 0.3)
for i in range(3):
    put(sfx, pop(523.3 * 2 ** (i / 3)), sec(c["frames"] + i * 2), 0.18, (i - 1) * 0.6)
K(sec(c["world"]), 1.0, big=True)
put(music, boom(), sec(c["world"]), 0.7)
put(music, stab(Am, 0.3), sec(c["world"]), 0.35)
t = sec(c["world"]) + BEAT
b = 1
while t < sec(T["s5"]) - 1e-6:
    K(t, 0.85)
    put(music, hat(open_=True), t + BEAT / 2, 0.14)
    if b % 2:
        put(music, clap(), t, 0.35)
    put(music, bass_note(55.0, BEAT / 2), t + BEAT / 2, 0.4)
    t += BEAT
    b += 1
for i in range(6):
    put(sfx, tick(2000 + i * 250, 0.03), sec(c["sound"] + i * 1.5), 0.2, -0.5 + i * 0.2)
put(music, stab([329.6, 415.3, 493.9], 0.3), sec(c["sound"] + 8), 0.35)
k = 0
while sec(375) + k * BEAT / 4 < sec(T["s5"]) - BEAT / 4:
    put(music, clap(), sec(375) + k * BEAT / 4, 0.1 + 0.05 * k)
    k += 1
put(sfx, riser(sec(T["s5"] - 360)), sec(360), 0.3)

# ---------------- 13-15 s: final ----------------
K(sec(fn["cut"]), 1.0, big=True)
put(music, boom(), sec(fn["cut"]), 0.85)
put(music, stab(Am + [440.0], 0.6), sec(fn["cut"]), 0.4)
for i in range(4):
    put(sfx, pop(700 + 120 * i), sec(fn["mood"] + i * 1.6), 0.12)
K(sec(fn["beat"]), 0.95)
put(music, stab(C + [523.3], 0.5), sec(fn["beat"]), 0.4)
t = sec(fn["beat"]) + BEAT
while t < sec(fn["full"]) - 1e-6:
    K(t, 0.8)
    put(music, hat(open_=True), t + BEAT / 2, 0.14)
    t += BEAT
n = int(sec(fn["full"] - fn["fill"]) * SR)
x = np.linspace(0, 1, n)
put(sfx, np.sin(2 * np.pi * np.cumsum(330 * 2 ** (1.5 * x)) / SR) * x ** 2 * 0.25, sec(fn["fill"]), 0.4)
K(sec(fn["full"]), 1.0, big=True)
put(music, boom(), sec(fn["full"]), 0.7)
put(music, stab([220.0, 329.6, 440.0, 523.3, 659.3], 0.5), sec(fn["full"]), 0.5)
put(sfx, ding(1760), sec(fn["full"]), 0.15)

# ---------------- master ----------------
pump = np.ones(N)
for kt in kicks:
    i = int(kt * SR)
    m = int(0.2 * SR)
    j = min(N, i + m)
    pump[i:j] = np.minimum(pump[i:j], 0.4 + 0.6 * np.linspace(0, 1, j - i) ** 0.8)
music *= pump[:, None]
for kt in kicks:
    put(music, kick(big=True), kt, 0.3)
d = int(0.011 * SR)
sfx[:, 1] = np.concatenate([np.zeros(d), sfx[:-d, 1]])
mix = music + sfx
tt = np.arange(N) / SR
ring = np.clip((tt - sec(fn["full"])) / (DUR - sec(fn["full"])), 0, 1)
mix *= (np.cos(ring * np.pi / 2) ** 2)[:, None]
mix = np.tanh(mix * 0.7) / np.tanh(0.7)
mix /= np.max(np.abs(mix)) / 10 ** (-3.0 / 20)

dest = ROOT / "public" / "music" / "music-in-motion.wav"
with wave.open(str(dest), "wb") as wv:
    wv.setnchannels(2)
    wv.setsampwidth(2)
    wv.setframerate(SR)
    wv.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {dest}")
