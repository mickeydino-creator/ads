"""Mix for the NOIR editorial spot.

Music: the user-supplied licensed track (public/music/track-full.mp3), cut so its
first bass drop (15.99 s in the track) lands exactly on frame 240 of the spot.
SFX: quiet, synthesised from scratch, each placed on a cut from src/editorial/timeline.json.
Output: public/music/noir-editorial-mix.wav (48 kHz stereo, 15.0 s).
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "editorial" / "timeline.json").read_text())
SR = 48000
FPS = T["fps"]
DUR = T["durationInFrames"] / FPS
N = int(DUR * SR)
rng = np.random.default_rng(7)


def sec(frame):
    return frame / FPS


raw = subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-ss", str(T["musicStartSec"]), "-t", str(DUR),
     "-i", str(ROOT / "public" / "music" / "track-full.mp3"),
     "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
    capture_output=True, check=True,
).stdout
music = np.frombuffer(raw, "<f4").reshape(-1, 2).astype(float)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

t = np.arange(N) / SR
fade = np.ones(N)
fade[: int(0.04 * SR)] = np.linspace(0, 1, int(0.04 * SR))
fs = sec(T["musicFadeStart"])
tail = t >= fs
fade[tail] = np.cos(np.clip((t[tail] - fs) / (DUR - fs), 0, 1) * np.pi / 2) ** 1.5
music *= fade[:, None]


def hp(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (cutoff / np.maximum(f, 1)) ** 4), len(x))


def bp(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4) / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def tick(level=1.0):
    n = int(0.06 * SR)
    x = np.arange(n) / SR
    click = hp(rng.standard_normal(n), 3500) * np.exp(-x / 0.0025)
    body = np.sin(2 * np.pi * 1900 * x) * np.exp(-x / 0.012) * 0.4
    return (click + body) * level


def swish(dur, lo=600, hi=7000, curve=1.0):
    n = int(dur * SR)
    x = np.linspace(0, 1, n)
    env = np.sin(np.pi * x ** curve) ** 2
    return bp(rng.standard_normal(n), lo, hi) * env


def shutter():
    a = tick(1.0)
    b = tick(0.7)
    out = np.zeros(int(0.12 * SR))
    out[: len(a)] += a
    out[int(0.055 * SR): int(0.055 * SR) + len(b)] += b
    return out


def chime(freq=1318.5, dur=2.5):
    n = int(dur * SR)
    x = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * freq * r * x) * np.exp(-x * (1 + k) / 1.2)
            for k, (r, a) in enumerate([(1, 1), (2.76, 0.4), (5.4, 0.15)]))
    return s * np.minimum(1, x / 0.003)


sfx = np.zeros((N, 2))


def place(sig, start_s, gain, pan=0.0):
    i = int(start_s * SR)
    j = min(N, i + len(sig))
    if j <= i:
        return
    sfx[i:j, 0] += sig[: j - i] * gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    sfx[i:j, 1] += sig[: j - i] * gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)


place(swish(0.75, 2500, 9000, 0.6), sec(2), 0.035, -0.4)        # hairline draws
place(swish(0.6, 300, 4000, 0.5), sec(24), 0.06, 0.0)            # slit opens
place(swish(0.45, 200, 2500, 0.4), sec(46), 0.05, 0.0)           # band takes the frame
for i, fr in enumerate(T["letters"]):
    place(tick(), sec(fr), 0.11, [-0.5, -0.15, 0.15, 0.5][i])   # each letter cut
place(swish(0.5, 800, 6000, 0.5), sec(T["window"]), 0.045, 0.0)  # window opens
for i, fr in enumerate(T["sheetFrames"]):
    place(shutter(), sec(fr), 0.12, [-0.45, 0.45][i])            # contact-sheet frames
for i, fr in enumerate(T["words"]):
    place(tick(0.8), sec(fr), 0.09, -0.3 + 0.3 * i)
for fr in T["slices"]:
    place(swish(0.22, 1500, 10000, 0.3), sec(fr), 0.07, 0.0)     # the slice
place(swish(0.9, 300, 5000, 0.7), sec(T["wipe"]), 0.06, 0.0)     # page wipe
place(chime(), sec(T["wordmark"]), 0.035, 0.0)                    # signature

mix = music + sfx
mix /= np.max(np.abs(mix)) / 10 ** (-1.5 / 20)

dest = ROOT / "public" / "music" / "noir-editorial-mix.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {dest}")
