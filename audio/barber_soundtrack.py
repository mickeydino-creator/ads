"""Original soundtrack + SFX for the BEFORE / AFTER barbershop spot, 120 BPM.

0-2 s: a tinny, cheap square-wave jingle (the "before"), killed by a tape stop
on the tear. From 3 s a clean, deep groove in D minor takes over (the "after").
Every hit is read from src/barber/timeline.json. Output:
public/music/barber-soundtrack.wav
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
T = json.loads((ROOT / "src" / "barber" / "timeline.json").read_text())
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


def square(freq, length):
    n = int(length * SR)
    x = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * freq * x)) * env(n, 0.003, length * 0.5)


def blip(freq, length=0.12, up=True):
    n = int(length * SR)
    x = np.arange(n) / SR
    f = freq * (1 + (0.6 if up else -0.4) * (1 - np.exp(-x / 0.02)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, length / 3)


def boing(length=0.35):
    n = int(length * SR)
    x = np.arange(n) / SR
    f = 260 + 220 * np.sin(2 * np.pi * 14 * x) * np.exp(-x / 0.12) + 300 * np.exp(-x / 0.05)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.12)


def rip(length=0.22):
    n = int(length * SR)
    x = np.arange(n) / SR
    flutter = (np.sin(2 * np.pi * 70 * x) > 0.2) * 0.7 + 0.3
    return filt(rng.standard_normal(n), 900, 7000) * flutter * env(n, 0.004, length / 2.5)


def snip():
    # two metallic blade clicks plus a short shear of noise
    n = int(0.16 * SR)
    x = np.arange(n) / SR
    out = np.zeros(n)
    for o, fq in ((0.0, 4200), (0.035, 5200)):
        m = x >= o
        xx = np.clip(x - o, 0, None)
        out += m * (np.sin(2 * np.pi * fq * xx) * np.exp(-xx / 0.007))
    out += filt(rng.standard_normal(n), 3000, 11000) * np.exp(-x / 0.03) * 0.5
    return out


# ---------------- 0-2 s: the cheap jingle ----------------
jingle = np.zeros(int(sec(T["hook"]["tear"] + 14) * SR))


def jput(sig, t, gain):
    i = int(t * SR)
    j = min(len(jingle), i + len(sig))
    if i < len(jingle):
        jingle[i:j] += sig[: j - i] * gain


melody = [659.3, 784.0, 880.0, 784.0, 659.3, 587.3, 523.3, 587.3]
t = 0.0
k = 0
while t < len(jingle) / SR:
    jput(square(melody[k % 8], BEAT / 2 * 0.8), t, 0.25)
    if k % 2 == 0:
        jput(np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-np.arange(int(0.12 * SR)) / SR / 0.02)) / SR) * env(int(0.12 * SR), 0.001, 0.05), t, 0.6)
    else:
        jput(filt(rng.standard_normal(int(0.06 * SR)), lo=5000) * env(int(0.06 * SR), 0.001, 0.015), t, 0.25)
    t += BEAT / 2
    k += 1
jingle = filt(jingle, lo=500, hi=3200)
# tape stop: from the tear the playback speed falls to zero over 0.4 s
tear_t = sec(T["hook"]["tear"])
ti = int(tear_t * SR)
stop_len = int(0.4 * SR)
speed = np.concatenate([np.ones(ti), np.linspace(1, 0, stop_len) ** 1.6])
pos = np.cumsum(speed)
pos = pos[pos < len(jingle) - 1]
jingle_out = np.interp(pos, np.arange(len(jingle)), jingle)
jingle_out[ti:] *= np.linspace(1, 0, len(jingle_out) - ti)
put(music, jingle_out, 0, 0.9)

h = T["hook"]
for i, fr in enumerate(h["jolt"]):
    put(sfx, boing(), sec(fr), 0.35, (-0.4, 0.4, 0.0)[i])
    put(sfx, clap(), sec(fr), 0.2)
put(sfx, whoosh(0.25, 1500, 9000, 0.4), sec(h["band"]) - 0.05, 0.35, 0.6)
put(sfx, tick(1800, 0.05), sec(h["band"] + 8), 0.35)
for i in range(6):
    put(sfx, rip(), sec(h["strips"] + i * 2), 0.85, -0.6 if i % 2 == 0 else 0.6)
put(sfx, whoosh(0.5, 300, 6000, 0.3), sec(h["strips"]), 0.45)

# ---------------- 2-5 s: restyle, the clean groove arrives ----------------
D1, Bb0, F1, C1 = 36.71, 29.14, 43.65, 32.70
prog = [(D1, [293.7, 349.2, 440.0]), (Bb0, [293.7, 349.2, 466.2]), (F1, [349.2, 440.0, 523.3]), (C1, [329.6, 392.0, 523.3])]


def groove(t0, t1, gain=1.0, hats=True, bass=True, stabs=True, claps=True):
    t = t0
    while t < t1 - 1e-6:
        b = int(round(t / BEAT))
        put(music, kick(), t, 0.9 * gain)
        kicks.append(t)
        if hats:
            put(music, hat(), t + BEAT / 4, 0.08 * gain)
            put(music, hat(open_=True), t + BEAT / 2, 0.12 * gain)
            put(music, hat(), t + 3 * BEAT / 4, 0.08 * gain)
        if claps and b % 2 == 1:
            put(music, clap(), t, 0.38 * gain)
        root, chord = prog[(b // 4) % 4]
        if bass:
            put(music, bass_note(root * 2, BEAT * 0.45), t, 0.55 * gain)
            put(music, bass_note(root * 2, BEAT / 4), t + 3 * BEAT / 4, 0.35 * gain)
        if stabs:
            put(music, stab(chord, 0.22), t + BEAT / 2, 0.18 * gain, 0.25 if b % 2 else -0.25)
        t += BEAT


rs = T["restyle"]
for i in range(5):
    put(sfx, whoosh(0.5, 400, 6000, 0.55), sec(rs["travel"] + i * 3), 0.16, -0.5 + i / 4)
n = int(sec(rs["settle"] - rs["travel"] + 10) * SR)
pad = sum(np.sin(2 * np.pi * fq * np.arange(n) / SR) for fq in (146.8, 174.6, 220.0)) / 3
put(music, pad * np.sin(np.linspace(0, np.pi, n)) ** 1.5, sec(rs["travel"]), 0.2)
groove(sec(90), sec(T["ad"]["start"]), gain=0.6, stabs=False, claps=False)
put(sfx, snap(), sec(rs["header"]), 0.4)
put(sfx, whoosh(0.3, 1500, 9000, 0.5), sec(rs["rule"]), 0.2, -0.5)
put(sfx, blip(990, 0.15), sec(rs["dot"]), 0.18)
put(sfx, tick(1600, 0.05), sec(rs["press"]), 0.5)
put(sfx, blip(1320, 0.2), sec(rs["press"]) + 0.03, 0.14)
put(sfx, rev_cymbal(sec(20)), sec(T["ad"]["start"] - 20), 0.35)

# ---------------- 5-11 s: the ad ----------------
ad = T["ad"]
put(music, kick(big=True), sec(ad["start"]), 1.0)
kicks.append(sec(ad["start"]))
put(music, boom(), sec(ad["start"]), 0.6)
put(music, stab(prog[0][1], 0.5), sec(ad["start"]), 0.35)
put(sfx, whoosh(0.4, 600, 8000, 0.4), sec(ad["band"]), 0.35, 0.6)
groove(sec(ad["start"]) + BEAT, sec(ad["gather"]), gain=1.0)
put(sfx, whoosh(0.3, 1200, 9000, 0.5), sec(ad["first"] - 10), 0.3, -0.6)
put(sfx, snip(), sec(ad["first"]), 0.4)
for i, fr in enumerate(ad["words"]):
    put(sfx, snip(), sec(fr), 0.6, -0.3 + i * 0.2)
    put(sfx, whoosh(0.2, 2000, 12000, 0.3), sec(fr), 0.18)
put(sfx, riser(sec(ad["drop"] - ad["gather"])), sec(ad["gather"]), 0.45)
put(sfx, whoosh(0.4, 300, 5000, 0.6), sec(ad["gather"]), 0.3)
put(music, kick(big=True), sec(ad["drop"]), 1.0)
kicks.append(sec(ad["drop"]))
put(music, boom(), sec(ad["drop"]), 0.6)
put(sfx, snip(), sec(ad["drop"]), 0.9)
put(sfx, clap(), sec(ad["drop"]), 1.0)
put(sfx, snap(), sec(ad["drop"]), 0.9)
put(music, stab([293.7, 349.2, 440.0, 587.3], 0.6), sec(ad["drop"]), 0.4)
put(sfx, whoosh(0.5, 300, 7000, 0.4), sec(ad["drop"] + 12), 0.4)
groove(sec(ad["drop"]) + BEAT, sec(T["compare"]["split"]), gain=1.0)
put(sfx, tick(2400, 0.04), sec(ad["info"]), 0.3)
for i, fr in enumerate(ad["stack"]):
    put(sfx, clap(), sec(fr), 0.55)
    put(music, kick(), sec(fr), 0.6)
    put(music, stab([[293.7, 349.2, 440.0], [349.2, 440.0, 523.3], [440.0, 523.3, 659.3]][i], 0.3), sec(fr), 0.3)

# ---------------- 11-13 s: before / after ----------------
cp = T["compare"]
put(sfx, whoosh(0.45, 400, 8000, 0.5), sec(cp["split"]), 0.45)
put(sfx, tick(2400, 0.04), sec(cp["labels"]), 0.3, 0.4)
put(sfx, tick(3000, 0.04), sec(cp["labels"] + 2), 0.3, -0.4)
groove(sec(cp["split"]), sec(cp["wipe"]), gain=0.8, stabs=False)
put(sfx, snip(), sec(cp["cut"]), 0.8, 0.4)
put(sfx, rip(0.3), sec(cp["cut"] + 1), 0.5, 0.4)
put(sfx, whoosh(0.5, 200, 3000, 0.8), sec(cp["cut"] + 5), 0.4, 0.5)
put(sfx, whoosh(0.5, 600, 9000, 0.6), sec(cp["grow"]), 0.45, -0.4)
put(sfx, whoosh(0.4, 400, 8000, 0.5), sec(cp["wipe"]), 0.5)
put(sfx, rev_cymbal(sec(T["end"]["line1"]) - sec(cp["grow"])), sec(cp["grow"]), 0.35)

# ---------------- 13-15 s: end frame ----------------
e = T["end"]
put(music, kick(big=True), sec(e["line1"]), 1.0)
kicks.append(sec(e["line1"]))
put(music, boom(), sec(e["line1"]), 0.7)
put(sfx, snap(), sec(e["line1"]), 0.5)
put(sfx, snap(), sec(e["line2"]), 0.5)
groove(sec(e["line1"]) + BEAT / 2, sec(e["pill"]), gain=0.7, stabs=False, bass=False)
put(music, kick(big=True), sec(e["pill"]), 1.0)
kicks.append(sec(e["pill"]))
put(music, stab([146.8, 293.7, 349.2, 440.0, 587.3], 0.6), sec(e["pill"]), 0.45)
put(sfx, ding(1174.7), sec(e["pill"]), 0.16)
put(sfx, blip(1320, 0.2), sec(e["plane"]), 0.14)
put(sfx, whoosh(0.25, 2000, 11000, 0.3), sec(e["plane"]), 0.18, -0.4)

# ---------------- dynamics & master ----------------
pump = np.ones(N)
for kt in kicks:
    i = int(kt * SR)
    m = int(0.2 * SR)
    j = min(N, i + m)
    pump[i:j] = np.minimum(pump[i:j], 0.45 + 0.55 * np.linspace(0, 1, j - i) ** 0.8)
music *= pump[:, None]

d = int(0.011 * SR)
sfx[:, 1] = np.concatenate([np.zeros(d), sfx[:-d, 1]])
mix = music + sfx
tt = np.arange(N) / SR
ring = np.clip((tt - sec(e["note"])) / (DUR - sec(e["note"])), 0, 1)
mix *= (np.cos(ring * np.pi / 2) ** 2)[:, None]
mix = np.tanh(mix * 0.7) / np.tanh(0.7)
mix /= np.max(np.abs(mix)) / 10 ** (-1.5 / 20)

dest = ROOT / "public" / "music" / "barber-soundtrack.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {dest}")
