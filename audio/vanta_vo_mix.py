"""Cut the supplied voice-over into its sentences and place each on the VANTA timeline.

Each sentence (source range, target time, tempo) comes from src/vanta/timeline.json "vo".
Sentences are trimmed with short fades, time-compressed with ffmpeg atempo (pitch kept),
cleaned (high-pass, gentle compression), and the music is ducked under the voice.
Output: public/music/vanta-mix.wav
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "vanta" / "timeline.json").read_text())
SR = 48000
DUR = T["durationInFrames"] / T["fps"]
N = int(DUR * SR)


def read_wav(path):
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32767
        return x.reshape(-1, w.getnchannels())


def sentence(src, tempo):
    a, b = src
    a = max(0.0, a - 0.03)
    b = b + 0.06
    af = f"atrim={a}:{b},asetpts=PTS-STARTPTS,highpass=f=90,atempo={tempo},afade=t=in:d=0.015,afade=t=out:st={(b - a) / tempo - 0.04}:d=0.04"
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "public" / "music" / "vo-raw.mp3"),
         "-af", af, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, "<f4").astype(float)


music = read_wav(ROOT / "public" / "music" / "vanta-soundtrack.wav")[:N]
music = np.pad(music, ((0, N - len(music)), (0, 0)))
vo = np.zeros(N)
for s in T["vo"]:
    seg = sentence(s["src"], s["tempo"])
    i = int(s["at"] * SR)
    j = min(N, i + len(seg))
    vo[i:j] += seg[: j - i]
    print(f'{s["at"]:5.2f}-{s["at"] + len(seg) / SR:5.2f}  {s["text"]}')

# gentle compression on the voice, then level it
env = np.sqrt(np.convolve(vo ** 2, np.ones(480) / 480, mode="same")) + 1e-6
gain = np.minimum(1.0, (0.12 / env) ** 0.4)
vo = vo * gain
vo /= np.max(np.abs(vo)) / 10 ** (-4 / 20)

# duck the music under the voice (attack ~40 ms, release ~250 ms)
active = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.12 * SR)), mode="same") > 0
duck = np.where(active, 10 ** (-7 / 20), 1.0)
smooth = np.empty(N)
acc = 1.0
a_att = np.exp(-1 / (0.04 * SR))
a_rel = np.exp(-1 / (0.25 * SR))
for k in range(N):
    a = a_att if duck[k] < acc else a_rel
    acc = a * acc + (1 - a) * duck[k]
    smooth[k] = acc
mix = music * smooth[:, None] + vo[:, None] * 0.95
mix /= np.max(np.abs(mix)) / 10 ** (-3 / 20)

dest = ROOT / "public" / "music" / "vanta-mix.wav"
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {dest}")
