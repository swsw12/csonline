"""zombie_pain (v6.84): the zombie's pain grunt, made from numbers — no recording of any kind goes into it.

    python3 source/tools/zombie_pain.py      -> source/sound/zombie_pain.ogg and .mp3 (needs numpy, scipy and ffmpeg)

A rough voice: glottal pulses at a pitch that rises for a moment and then falls, each period and each pulse's strength jittered and
every other pulse weaker (period doubling: the growl), breath noise riding on the pulses; four formant resonators moving from an
open "aah" to a closed "uh", a low chest resonance under them; a short breathy onset; saturation (a dense, loud grunt); a steep
low-pass that closes as the voice fades; the loudness shaped by an envelope (about 40 ms up, held, a soft tail) and a gentle
last limit before that low-pass.
The numbers in P were found by measuring a reference grunt — its loudness every 20 ms, its coarse spectral envelope in 32 mel bands,
its brightness (spectral centroid) and roughness (YIN aperiodicity) frame by frame, its energy in six octaves, the modulation spectrum
of its envelope — and searching for the settings whose synthesis measures closest. The reference was only measured: nothing of it
is cut, filtered or mixed into this one.
"""
import os, subprocess
import numpy as np, scipy.signal as sg, scipy.io.wavfile as wf
SR = 44100
P = {"dur": 0.63, "att": 0.04380950227806673, "hold": 0.3056079281233053, "rel": 0.3, "f0a": 146.7965213165348, "f0b": 230, "f0c": 160, "jit": 0.17160847735774934, "shim": 0.4768579089659192, "sub": 0.3416352203697854, "noise": 0.8870456857192393, "nmod": 0.3525608429748509, "F1a": 756.6022483761203, "F1b": 250.0, "F2a": 910.7103856494637, "F2b": 925.1635113994703, "F3a": 2657.4160768193196, "F3b": 2362.975080942904, "F4": 3703.5518409421047, "B1": 150.0, "B2": 411.79348931438017, "B3": 337.2222234812559, "B4": 186.7756439900437, "drive": 6.909306823178877, "lpa": 6000.103000393486, "lpb": 1305.7547270366078, "tilt": 1.0, "dry": 0.0, "Fb": 219.19710428986653, "Bb": 104.77317203847817, "gb": 0.7606536238391741, "lpx": 1.066313275406204, "lpo": 8, "ba": 1.3667705952170777, "bd": 0.024956839728221797, "bf": 2280.0958481936195, "seed": 7, "g2": 0.3680920833434162, "g3": 0.4504062978053192, "g4": 0.6934965086283491, "lim": 1.3}

def synth(P, seed=None):
    rng = np.random.default_rng(P['seed'] if seed is None else seed)
    n = int(P['dur'] * SR); t = np.arange(n) / SR; T = P['dur']
    # pitch: a quick rise to f0b by 8 % of the way, then a fall to f0c
    k = np.clip(t / (T * .08), 0, 1); f0 = np.where(t < T * .08, P['f0a'] + (P['f0b'] - P['f0a']) * k,
        P['f0b'] + (P['f0c'] - P['f0b']) * np.clip((t - T * .08) / (T * .80), 0, 1) ** .8)
    # pulses: each period jittered, each pulse's height jittered, every other one lower (period doubling: a growl)
    src = np.zeros(n); pos = 0.0; i = 0; marks = []
    while pos < n - 1:
        ip = int(pos); per = SR / f0[ip] * (1 + rng.normal(0, P['jit']))
        a = (1 + rng.normal(0, P['shim'])) * (1 - P['sub'] * (i % 2)); src[ip] += max(a, .05); marks.append(ip)
        pos += max(per, SR / 400); i += 1
    # a glottal pulse shape (an open phase rising, a sharp close) instead of a bare click
    g = np.concatenate([np.sin(np.linspace(0, np.pi / 2, 40)) ** 2, np.cos(np.linspace(0, np.pi / 2, 12))]); g = np.diff(np.concatenate([[0], g]))
    src = np.convolve(src, g)[:n]
    # breath noise, louder where a pulse just went by
    nz = rng.normal(0, 1, n); m = np.zeros(n)
    for ip in marks: m[ip:ip + 90] += np.exp(-np.arange(min(90, n - ip)) / 25)
    nz *= (1 - P['nmod']) + P['nmod'] * np.clip(m, 0, 1)
    x = src / (np.abs(src).max() + 1e-9) + P['noise'] * nz / (np.abs(nz).max() + 1e-9)
    # a gentle tilt (the source rolls off upward)
    b, a = sg.butter(1, 900 / (SR / 2)); x = (1 - P['tilt']) * x + P['tilt'] * sg.lfilter(b, a, x) * 2.2
    # formants, moving: blocks of 256 samples, each filter keeping its state
    B = 256; y = np.zeros(n); zs = [None] * 4; zs4 = [None]
    for s0 in range(0, n, B):
        u = min(1, s0 / n / .85) ** .9; seg = x[s0:s0 + B]; acc = np.zeros(len(seg))
        for j, (fa, fb, bw, gain) in enumerate([(P['F1a'], P['F1b'], P['B1'], 1.0), (P['F2a'], P['F2b'], P['B2'], P.get('g2', .55)), (P['F3a'], P['F3b'], P['B3'], P.get('g3', .28)), (P['F4'], P['F4'], P['B4'], P.get('g4', .14))]):
            fc = fa + (fb - fa) * u; q = fc / bw
            bb, aa = sg.iirpeak(fc / (SR / 2), q) if fc < SR / 2 * .95 else ([1, 0, 0], [1, 0, 0])
            if zs[j] is None: zs[j] = sg.lfilter_zi(bb, aa) * 0
            o, zs[j] = sg.lfilter(bb, aa, seg, zi=zs[j]); acc += gain * o
        # (a low chest resonance, and some of the source straight through: the body under the vowel)
        bb, aa = sg.iirpeak(P['Fb'] / (SR / 2), P['Fb'] / P['Bb'])
        if zs4[0] is None: zs4[0] = sg.lfilter_zi(bb, aa) * 0
        o, zs4[0] = sg.lfilter(bb, aa, seg, zi=zs4[0]); acc += P['gb'] * o + P['dry'] * seg
        y[s0:s0 + B] = acc
    y = y / (np.abs(y).max() + 1e-9)
    # the onset: a short breathy burst, high-passed (the "h" the grunt starts on)
    if P.get('ba', 0) > 0:
        nb = int(P['bd'] * SR * 3); bz = rng.normal(0, 1, nb); hb, ha = sg.butter(2, P['bf'] / (SR / 2), 'high'); bz = sg.lfilter(hb, ha, bz)
        bz *= np.exp(-np.arange(nb) / (P['bd'] * SR)) * P['ba'] / (np.abs(bz).max() + 1e-9); y[:nb] += bz
    # saturation; the envelope (up in att, held, then down over rel: a soft tail); a gentle limit (as loud as a grunt pushed to the
    # top, without hard clipping); then a steep low-pass closing from lpa to lpb, block-wise, which also takes what the limit adds on top
    y = np.tanh(P['drive'] * y) / np.tanh(P['drive'])
    e = np.ones(n); ka = int(P['att'] * SR); e[:ka] = np.sin(np.linspace(0, np.pi / 2, ka)) ** 2
    h = int((P['att'] + P['hold']) * SR); r = int(P['rel'] * SR)
    if h < n: tail = np.exp(-np.arange(n - h) / (r / 3.2)); e[h:] = tail * np.clip(1 - np.arange(n - h) / max(1, n - h), 0, 1) ** .5
    y *= e; k = P.get('lim', 0)
    if k > 0: y = np.tanh(k * y) / np.tanh(k)
    z = None; o = np.zeros(n)
    for s0 in range(0, n, B):
        u = s0 / n; fc = P['lpa'] * (P['lpb'] / P['lpa']) ** (u ** P.get('lpx', 1)); sos = sg.butter(int(P.get('lpo', 4)), min(fc, SR * .45) / (SR / 2), output='sos')
        if z is None: z = np.zeros((sos.shape[0], 2))
        o[s0:s0 + B], z = sg.sosfilt(sos, y[s0:s0 + B], zi=z)
    # (no DC: the pulses and the saturation lean to one side)
    hb, ha = sg.butter(1, 35 / (SR / 2), 'high'); o = sg.lfilter(hb, ha, o)
    return o / (np.abs(o).max() + 1e-9) * .98

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); out = os.path.join(here, '..', 'sound', 'zombie_pain')
    x = synth(P); wav = out + '.wav'; wf.write(wav, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    # ogg for most browsers, mp3 for the iPhone (design.js lists both: the first one the browser can read is used)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'libvorbis', '-q:a', '5', out + '.ogg'], check=True)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '128k', out + '.mp3'], check=True)
    os.remove(wav); print('zombie_pain.ogg / .mp3', '%.2f s' % (len(x) / SR))
