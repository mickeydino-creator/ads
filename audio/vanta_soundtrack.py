"""Original soundtrack + SFX for the VANTA AI spot (synthesised from scratch).

120 BPM, F minor. Every hit is placed from src/vanta/timeline.json so sound and
picture share one clock: text slams, card fly-ins, the drop at frame 180, grid
and pipeline snaps, panel clicks, the knob wipe and the end-frame impact.
Output: public/music/vanta-soundtrack.wav (48 kHz stereo, 15.0 s).
"""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "vanta" / "timeline.json").read_text())
SR = 48000
FPS = T["fps"]
DUR = T["durationInFrames"] / FPS
N = int(DUR * SR)
BEAT = 60 / T["bpm"]
rng = np.random.default_rng(42)


def sec(fr):
    return fr / FPS


def filt(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m /= np.sqrt(1 + (lo / np.maximum(f, 1)) ** (2 * order))
    if hi:
        m /= np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * m, len(x))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def saw(freq, n, detune=(0.0,)):
    x = np.arange(n) / SR
    out = np.zeros(n)
    for d in detune:
        ph = rng.uniform()
        out += 2 * (((freq * (1 + d)) * x + ph) % 1) - 1
    return out / len(detune)


# ---------------- instruments ----------------
def kick(big=False):
    n = int((0.9 if big else 0.4) * SR)
    x = np.arange(n) / SR
    f = 42 + 140 * np.exp(-x / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / (0.45 if big else 0.18))
    click = filt(rng.standard_normal(n), lo=2500) * np.exp(-x / 0.003) * 0.35
    return np.tanh((s + click) * 1.8)


def clap():
    n = int(0.3 * SR)
    x = np.arange(n) / SR
    e = np.zeros(n)
    for o in (0, 0.009, 0.018):
        e += (x >= o) * np.exp(-np.clip(x - o, 0, None) / 0.012)
    tail = np.exp(-x / 0.09) * 0.5
    return filt(rng.standard_normal(n), 900, 6000) * (e * 0.6 + tail)


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    return filt(rng.standard_normal(n), lo=7000) * env(n, 0.001, 0.07 if open_ else 0.012)


def stab(freqs, length=0.25):
    n = int(length * SR)
    s = sum(saw(fq, n, (-0.006, 0.0, 0.007)) for fq in freqs) / len(freqs)
    return filt(s, hi=2600) * env(n, 0.004, 0.11)


def bass_note(freq, length):
    n = int(length * SR)
    s = saw(freq, n, (0.0, 0.004)) + 0.6 * np.sin(2 * np.pi * freq * np.arange(n) / SR)
    return filt(s, hi=420) * env(n, 0.005, length * 0.8)


def whoosh(length, lo=500, hi=7000, peak=0.6):
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    e = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.5)
    return filt(rng.standard_normal(n), lo, hi) * e


def riser(length):
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    noise = filt(rng.standard_normal(n), lo=1200) * x ** 2.5
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * x ** 1.4)) / SR) * x ** 3 * 0.3
    return noise * 0.6 + tone


def ding(freq=1568.0):
    n = int(0.7 * SR)
    x = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * x) + 0.35 * np.sin(2 * np.pi * freq * 2.01 * x)) * env(n, 0.002, 0.16)


def tick(freq=3200.0, length=0.035):
    n = int(length * SR)
    x = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * x) * np.exp(-x / 0.006) + filt(rng.standard_normal(n), lo=4000) * np.exp(-x / 0.002) * 0.4


def snap():
    n = int(0.12 * SR)
    x = np.arange(n) / SR
    body = np.sin(2 * np.pi * 900 * x) * np.exp(-x / 0.02)
    return body * 0.6 + filt(rng.standard_normal(n), 1500, 9000) * np.exp(-x / 0.008)


def boom():
    n = int(2.6 * SR)
    x = np.arange(n) / SR
    f = 32 + 70 * np.exp(-x / 0.08)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.9) * 1.5)


def rev_cymbal(length):
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    return filt(rng.standard_normal(n), lo=3000) * x ** 3


# ---------------- arrangement ----------------
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))


def put(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    buf[i:j, 0] += sig[: j - i] * gain * l
    buf[i:j, 1] += sig[: j - i] * gain * r


drop = sec(T["drop"])
s2 = sec(T["s2"])
impact = sec(T["impact"])

# F minor progression, one chord per bar (2 s) from the drop
F1, Db2, Ab1, Eb2 = 43.65, 69.30, 51.91, 77.78
prog = [(F1, [349.2, 415.3, 523.3]), (Db2, [277.2, 349.2, 415.3]), (Ab1, [311.1, 415.3, 523.3]), (Eb2, [311.1, 392.0, 466.2])]

kicks = []
# Opening: hits on the type
for fr, g in [(0, 1.0), (30, 0.8), (60, 1.0)]:
    put(music, kick(), sec(fr), g)
    kicks.append(sec(fr))
for fr in (33, 36, 39, 42):
    put(sfx, tick(2400 + fr * 20), sec(fr), 0.25, (fr - 37) / 10)
for fr in (52, 56):
    put(sfx, snap(), sec(fr), 0.35)
put(music, stab(prog[0][1], 0.5), 0, 0.35)
put(music, stab(prog[0][1], 0.5), sec(60), 0.35)
put(sfx, whoosh(0.35, 800, 8000, 0.5), sec(14), 0.35)               # purple bar wipe
put(sfx, whoosh(0.3, 1500, 9000, 0.3), sec(T["s2"] - 14), 0.25)
put(sfx, riser(sec(15)), sec(75), 0.25)                               # dot grows
# hats ticking under the opening
t = 0.0
while t < s2:
    put(music, hat(), t + BEAT / 2, 0.18)
    t += BEAT

# Build (3-6 s): four on the floor, offbeat hats, claps, pulse bass
t = s2
while t < drop - 1e-6:
    put(music, kick(), t, 0.85)
    kicks.append(t)
    put(music, hat(), t + BEAT / 2, 0.22)
    t += BEAT
for b in range(1, 6, 2):
    put(music, clap(), s2 + b * BEAT, 0.4)
t = s2
while t < drop - 0.25:
    put(music, bass_note(F1 * 2, BEAT / 2 * 0.9), t + BEAT / 4, 0.32)
    t += BEAT / 2
for i, fr in enumerate(T["entries"]):
    put(sfx, whoosh(0.28, 600, 7000, 0.55), sec(fr) - 0.08, 0.28, -0.6 if i % 2 == 0 else 0.6)
    if i in (1, 4, 5, 7, 8):
        put(sfx, ding(1568 if i % 2 else 1760), sec(fr) + 0.12, 0.11, -0.3 if i % 2 == 0 else 0.3)
# snare roll + riser into the drop, with a breath before it
roll_start = sec(150)
k = 0
while roll_start + k * BEAT / 4 < drop - BEAT / 4:
    tt = roll_start + k * BEAT / 4
    put(music, clap(), tt, 0.12 + 0.3 * (tt - roll_start) / (drop - roll_start))
    k += 1
put(sfx, riser(drop - sec(135)), sec(135), 0.75)                     # 4.5 s -> drop
# reverse swell in the last beat before the drop
put(sfx, rev_cymbal(BEAT / 2), drop - BEAT / 2, 0.6)

# Drop (6-13 s): full groove
t = drop
bar = 0
while t < impact - 1e-6:
    put(music, kick(big=(abs(t - drop) < 1e-6)), t, 1.0)
    kicks.append(t)
    put(music, hat(), t + BEAT / 4, 0.12)
    put(music, hat(open_=True), t + BEAT / 2, 0.16)
    put(music, hat(), t + 3 * BEAT / 4, 0.12)
    beat_idx = int(round((t - drop) / BEAT))
    if beat_idx % 2 == 1:
        put(music, clap(), t, 0.45)
    root, chord = prog[(beat_idx // 4) % 4]
    put(music, bass_note(root, BEAT / 2 * 0.9), t, 0.55)
    put(music, bass_note(root * 2, BEAT / 4), t + BEAT / 2, 0.35)
    put(music, bass_note(root, BEAT / 4), t + 3 * BEAT / 4, 0.35)
    put(music, stab(chord), t + BEAT / 2, 0.26, -0.25 if beat_idx % 2 else 0.25)
    t += BEAT
put(music, boom(), drop, 1.0)
put(music, clap(), drop, 0.8)
put(sfx, whoosh(0.5, 1200, 9000, 0.25), drop, 0.3)                   # line zips through
for fr in (T["gridSnap"], T["pipeSnap"]):
    put(sfx, snap(), sec(fr), 0.5)
    put(sfx, tick(1800), sec(fr) + 0.03, 0.25)
put(sfx, stab([698.5, 830.6, 1046.5], 0.4), sec(T["whiteCut"]), 0.35)
for fr in (262, 277, 292):
    put(sfx, ding(2093), sec(fr), 0.08)
put(sfx, whoosh(0.65, 300, 6000, 0.85), sec(T["s4"]), 0.45)           # dive into the AI node
for fr in T["panels"]:
    put(sfx, snap(), sec(fr), 0.3, 0.2)
for fr in range(T["panels"][1], T["panels"][1] + 30, 3):
    put(sfx, tick(4200, 0.02), sec(fr), 0.07)                           # counters
put(sfx, tick(1400, 0.05), sec(T["panels"][3] + 3), 0.4)              # switch on
put(sfx, whoosh(0.55, 400, 5000, 0.7), sec(362), 0.3)                  # camera push
put(sfx, rev_cymbal(sec(T["impact"] - T["circleWipe"])), sec(T["circleWipe"]), 0.4)

# Impact and tail (13-15 s)
put(music, kick(big=True), impact, 1.0)
kicks.append(impact)
put(music, boom(), impact, 0.85)
put(music, stab([349.2, 415.3, 523.3, 698.5], 1.4), impact, 0.4)
put(sfx, ding(1046.5), sec(T["tagline"]), 0.12)
put(sfx, ding(1396.9), sec(T["tagline"] + 6), 0.1)
t = impact + BEAT
while t < DUR - 0.6:
    put(music, hat(), t + BEAT / 2, 0.1)
    t += BEAT

# dynamics: duck the build and the hold so the drop and the impact land harder,
# and drop the groove out for the half beat before the drop
dyn = np.ones(N)
tt = np.arange(N) / SR
dyn[(tt >= s2) & (tt < drop)] = 0.68
dyn[(tt >= drop - BEAT / 2) & (tt < drop)] = 0.08
dyn[(tt >= sec(250)) & (tt < sec(300))] = 0.8
music[:, 0] *= dyn
music[:, 1] *= dyn

# sidechain pump on the music bus from every kick
pump = np.ones(N)
for kt in kicks:
    i = int(kt * SR)
    n = int(0.22 * SR)
    j = min(N, i + n)
    pump[i:j] = np.minimum(pump[i:j], 0.35 + 0.65 * np.linspace(0, 1, j - i) ** 0.8)
music[:, 0] *= pump
music[:, 1] *= pump
# kicks themselves should not be ducked: re-add a dry kick layer
for kt in kicks:
    g = 0.45 * (0.7 if s2 <= kt < drop else 1.0)
    put(music, kick(big=abs(kt - drop) < 1e-6 or abs(kt - impact) < 1e-6), kt, g)

mix = music + sfx * 1.1
fade = np.ones(N)
fade[-int(0.7 * SR):] = np.linspace(1, 0, int(0.7 * SR)) ** 2
mix *= fade[:, None]
mix = np.tanh(mix * 0.9) / np.tanh(0.9)
mix /= np.max(np.abs(mix)) / 10 ** (-1.5 / 20)

dest = ROOT / "public" / "music" / "vanta-soundtrack.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {dest}")
