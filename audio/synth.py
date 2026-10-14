"""Shared synthesis toolkit (all sounds generated from scratch, no samples)."""
import numpy as np

SR = 48000
rng = np.random.default_rng(42)


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


