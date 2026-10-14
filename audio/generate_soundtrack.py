"""Original NOIR soundtrack, synthesised from scratch (no samples, no third-party assets).

Every cue is placed from src/timeline.json so sound and picture share one clock.
Output: public/noir-soundtrack.wav (48 kHz, 16-bit stereo, 15.0 s).
"""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "timeline.json").read_text())
SR = 48000
FPS = T["fps"]
DUR = T["durationInFrames"] / FPS
N = int(SR * DUR)
rng = np.random.default_rng(1977)
t = np.arange(N) / SR


def sec(frame):
    return frame / FPS


def env_adsr(n, a, d, sustain=0.0, curve=4.0):
    """Attack in seconds, then exponential decay of length d seconds."""
    x = np.arange(n) / SR
    att = np.clip(x / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(x - a, 0, None) / max(d, 1e-4))
    return att * (sustain + (1 - sustain) * dec)


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be a scalar or a per-sample array."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    mask = np.ones_like(f)
    if lo:
        mask *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        mask *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * mask, len(x))


def place(buf, sig, start_s, gain=1.0, pan=0.0):
    i = int(start_s * SR)
    j = min(len(buf), i + len(sig))
    if j <= i:
        return
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    buf[i:j, 0] += sig[: j - i] * gain * l * np.sqrt(2)
    buf[i:j, 1] += sig[: j - i] * gain * r * np.sqrt(2)


def metallic(freq, dur, decay, brightness=1.0):
    """Inharmonic struck-metal partials (bar/bell ratios)."""
    n = int(dur * SR)
    x = np.arange(n) / SR
    ratios = [1.0, 2.76, 5.40, 8.93, 13.34]
    amps = [1.0, 0.55, 0.35 * brightness, 0.2 * brightness, 0.1 * brightness]
    s = np.zeros(n)
    for k, (rt, am) in enumerate(zip(ratios, amps)):
        s += am * np.sin(2 * np.pi * freq * rt * x + k) * np.exp(-x * (1 + k * 0.9) / decay)
    return s * env_adsr(n, 0.002, dur, 1.0)


def liquid_drop(freq=900.0, dur=0.22):
    """Resonant bubble: a sine whose pitch rises quickly as the cavity closes."""
    n = int(dur * SR)
    x = np.arange(n) / SR
    f = freq * (1 + 0.9 * (1 - np.exp(-x / 0.025)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-x / 0.045)
    tick = rng.standard_normal(n) * np.exp(-x / 0.002) * 0.25
    return s + fft_filter(tick, lo=2000)


def reverb(x, seconds=3.2, wet=0.35, seed=3):
    """Convolve with a decaying stereo noise tail (synthetic hall)."""
    g = np.random.default_rng(seed)
    n = int(seconds * SR)
    decay = np.exp(-6.0 * np.arange(n) / n)
    out = np.zeros((len(x) + n - 1, 2))
    for ch in range(2):
        ir = g.standard_normal(n) * decay
        ir = fft_filter(ir, lo=180, hi=7000)
        ir /= np.sqrt(np.sum(ir ** 2))
        L = len(x[:, ch]) + n - 1
        size = 1 << (L - 1).bit_length()
        y = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[:L]
        out[:, ch] = y
    dry = np.zeros_like(out)
    dry[: len(x)] = x
    return dry * (1 - wet) + out * wet


mix = np.zeros((N, 2))
fx = np.zeros((N, 2))  # goes through the hall

impact_s = sec(T["impact"])
hero_s = sec(T["wordmark"])
tag_s = sec(T["tagline"])

# --- Bed: dark sub drone + slow chord pad, swells into the impact ---------
drone_env = np.interp(t, [0, 2.5, 7, impact_s - 0.05, impact_s, 13, DUR], [0.0, 0.55, 0.7, 0.85, 0.5, 0.45, 0.0])
drone = (np.sin(2 * np.pi * 36.7 * t) + 0.4 * np.sin(2 * np.pi * 73.4 * t + 0.4)) * drone_env
mix[:, 0] += drone * 0.32
mix[:, 1] += drone * 0.32

# D minor(add9) voicing, detuned saws, slowly opening filter
pad = np.zeros(N)
for f0 in [73.42, 110.0, 174.61, 220.0, 329.63]:
    for det in (-0.12, 0.0, 0.11):
        ph = rng.uniform(0, 1)
        pad += 2 * (((f0 + det) * t + ph) % 1.0) - 1
pad /= 15
cut = np.interp(t, [0, 3, 7, impact_s, impact_s + 0.4, 12, DUR], [180, 420, 900, 1800, 1100, 900, 300])
pad = lowpass(lowpass(pad, cut), cut)
pad_env = np.interp(t, [0, 2.8, 4.0, impact_s - 0.06, impact_s, impact_s + 0.3, 13.5, DUR], [0, 0, 0.5, 0.75, 0.0, 0.55, 0.45, 0])
place(fx, pad * pad_env, 0, 0.55, -0.1)
place(fx, np.roll(pad, 1200) * pad_env, 0, 0.55, 0.1)

# --- Shot 1: air, metallic textures and the light sweep -------------------
air = fft_filter(rng.standard_normal(N), lo=1500, hi=9000) * np.interp(t, [0, 1, 3, 7, DUR], [0.0, 0.03, 0.025, 0.02, 0.01])
mix[:, 0] += air
mix[:, 1] += np.roll(air, 900)

sweep_n = int(3.0 * SR)
sweep = rng.standard_normal(sweep_n)
xs = np.arange(sweep_n) / SR
sweep = lowpass(sweep, 300 + 5200 * np.sin(np.pi * xs / 3.0) ** 2)
sweep *= np.sin(np.pi * xs / 3.0) ** 2
for k in range(sweep_n // 4800 + 1):
    seg = slice(k * 4800, min(sweep_n, (k + 1) * 4800))
    pan = -0.8 + 1.6 * (k * 4800) / sweep_n  # travels left -> right with the light
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    fx[seg.start : seg.stop, 0] += sweep[seg] * 0.12 * l
    fx[seg.start : seg.stop, 1] += sweep[seg] * 0.12 * r

place(fx, metallic(1318.5, 2.6, 0.9, 0.6), 0.35, 0.05, 0.4)
place(fx, metallic(987.8, 2.6, 1.1, 0.5), 1.4, 0.045, -0.3)
place(fx, metallic(1760.0, 2.2, 0.7, 0.4), 2.45, 0.035, 0.2)
# low "glass resonance" as the silhouette appears
place(fx, metallic(146.8, 3.0, 1.4, 0.3), 2.85, 0.12, 0.0)

# --- Shot 2: liquid drops, each in sync with a droplet running down the glass
for i, fr in enumerate(T["liquidDrops"]):
    place(fx, liquid_drop(700 + 130 * i), sec(fr), 0.16, [-0.4, 0.35, -0.2, 0.45, 0.0][i])
    place(fx, liquid_drop(1400 + 90 * i, 0.12), sec(fr) + 0.09, 0.05, [0.3, -0.3, 0.2, -0.4, 0.1][i])

# --- Shot 3: build, a breath of silence, then the impact ------------------
riser_start = sec(T["shot3Start"])
riser_len = impact_s - riser_start - 0.06
rn = int(riser_len * SR)
xr = np.arange(rn) / SR
p = xr / riser_len
riser_noise = lowpass(rng.standard_normal(rn), 400 + 7000 * p ** 2) * p ** 2.2
riser_tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2.0 * p ** 1.6)) / SR) * p ** 3
place(fx, riser_noise * 0.22 + riser_tone * 0.06, riser_start, 1.0)

# impact: pitch-dropping sub, felt-hammer body, metallic strike, air burst
dn = int(4.5 * SR)
xd = np.arange(dn) / SR
fsub = 30 + 55 * np.exp(-xd / 0.07)
sub = np.sin(2 * np.pi * np.cumsum(fsub) / SR) * np.exp(-xd / 1.1)
sub = np.tanh(sub * 1.6) / np.tanh(1.6)
place(mix, sub, impact_s, 0.55)
body = lowpass(rng.standard_normal(dn), 900) * np.exp(-xd / 0.09)
place(mix, body, impact_s, 0.3)
click = fft_filter(rng.standard_normal(int(0.03 * SR)), lo=3000) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.004)
place(mix, click, impact_s, 0.18)
place(fx, metallic(220.0, 4.0, 1.6, 0.8), impact_s, 0.2, 0.0)
place(fx, metallic(659.3, 3.5, 1.2, 0.6), impact_s + 0.004, 0.08, 0.2)
# mist exhale following the expanding wave
mn = int(2.2 * SR)
xm = np.arange(mn) / SR
mist = lowpass(rng.standard_normal(mn), 2500 * np.exp(-xm / 0.8) + 300) * env_adsr(mn, 0.05, 2.2, 0.0, 3.0)
place(fx, mist, impact_s, 0.2, -0.3)
place(fx, np.roll(mist, 2400), impact_s, 0.2, 0.3)

# --- Shot 4: the wordmark chime and tagline, then the tail ----------------
place(fx, metallic(1174.7, 3.5, 1.5, 0.6), hero_s, 0.075, -0.15)
place(fx, metallic(1760.0, 3.5, 1.3, 0.45), hero_s + 0.03, 0.04, 0.15)
place(fx, metallic(146.8, 3.5, 1.8, 0.2), hero_s, 0.1, 0.0)
place(fx, metallic(2349.3, 2.0, 0.6, 0.3), tag_s, 0.03, 0.0)

wet = reverb(fx, 3.4, 0.42)[:N]
out = mix + wet

# master: gentle glue, fades, normalise to -1 dBFS peak
out = np.tanh(out * 1.3) / np.tanh(1.3)
fade = np.ones(N)
fade[: int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
fade[-int(0.9 * SR) :] = np.linspace(1, 0, int(0.9 * SR)) ** 1.5
out *= fade[:, None]
# normalise to -3 dBFS sample peak; leaves headroom for AAC inter-sample overs
out /= np.max(np.abs(out)) / 10 ** (-3 / 20)

dest = ROOT / "public" / "noir-soundtrack.wav"
dest.parent.mkdir(exist_ok=True)
with wave.open(str(dest), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
print(f"wrote {dest} ({DUR:.2f}s, impact at {impact_s:.3f}s)")
