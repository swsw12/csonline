"""zombie_pain (v6.85): the zombie's pain grunt, made from numbers — no recording of any kind goes into it.

    python3 source/tools/zombie_pain.py   -> source/sound/zombie_pain_1.ogg … _4.ogg and the same as .mp3 (numpy, scipy, ffmpeg)

The voice: glottal flow pulses placed at their exact times and drawn at 4x the rate (so nothing folds back), the pitch rising for a
moment and falling with a small tremor and wander, each period, pulse height and opening jittered, every other pulse weaker (period
doubling: the growl); breath noise riding on the open phase and flapping at 25-50 Hz (a throat rattle); four formant resonators
moving from an open "aah" to a closed "uh", each wandering a little, over a low chest resonance. Up to three such voices stacked,
each a little off in pitch and formants with its own randomness (a thick throat, not one buzzing oscillator); a breathy onset and a
few wet blips; then, at 4x the rate, a slightly lopsided saturation (warmth), the envelope, a gentle limit and a 24 dB/oct
low-pass that closes as the voice fades; 48 kHz out, a low and a high shelf (body below, a clean top), TPDF-dithered to 16 bits. Four variants: other seeds, pitch, formants and
length a little apart, so that hits in a row do not sound the same (the game picks one at random each time).
The numbers in P were found by measuring a reference grunt — its loudness every 20 ms, its coarse spectral envelope in 32 mel
bands, its brightness and roughness frame by frame, its energy in six octaves, the modulation of its envelope and how much its
spectrum moves from frame to frame — and searching for the settings whose synthesis measures closest. The reference was only
measured: nothing of it is cut, filtered or mixed into this one.
"""
import os, subprocess
import numpy as np, scipy.signal as sg, scipy.io.wavfile as wf
SR = 48000; OS = 4; FS = SR * OS
P = {"dur": 0.63, "att": 0.036742005127489256, "hold": 0.31398811546048255, "rel": 0.28020628212292953, "f0a": 177.94904293341023, "f0b": 264.4958664624374, "f0c": 294.30116601316985, "jit": 0.16814495237938948, "shim": 0.36420849825368473, "sub": 0.38295395716734015, "noise": 0.6, "nmod": 1.0, "F1a": 906.4796359383919, "F1b": 278.19274232827604, "F2a": 722.9378002961377, "F2b": 993.2526085939454, "F3a": 2360.928346189763, "F3b": 2173.431443919977, "F4": 3297.3986721587144, "B1": 218.4098278632589, "B2": 500.0, "B3": 649.6145796608546, "B4": 488.6419275956084, "drive": 8.616345417499415, "lpa": 6730.283028002686, "lpb": 1200.0, "tilt": 0.5121943495403207, "dry": 0.0, "Fb": 191.54958100953195, "Bb": 60.0, "gb": 0.6948916252752211, "lpx": 0.9036434233675674, "lpo": 4, "ba": 0.8990762762062428, "bd": 0.06, "bf": 1403.8508116609682, "seed": 7, "g2": 0.37880958152819866, "g3": 0.48962951337140015, "g4": 1.0, "lim": 1.4183687341869464, "oq": 0.558439052738974, "sq": 5.0, "vib": 0.00661746228149186, "vibf": 8.430983010859933, "drift": 0.021886810424222275, "fj": 0.02, "ga": 0.135713830740268, "gr": 70.14477694771197, "v2": 0.8525870929139914, "v3": 0.5446947850416731, "dt": 0.038166981543124416, "ft": 0.02584956398275415, "rat": 0.3995208790215236, "ratf": 33.412496591291216, "asy": 0.03789310068562536, "fjr": 7.956291373055894, "oqj": 0.09767318324566324, "ls_g": 4.248423650066532, "ls_f": 284.6914581982615, "hs_g": -9.584851118947372, "hs_f": 5889.308001338103}
# the variants: (seed, pitch ×, formants ×, length ×)
VARIANTS = [[7, 1.0, 1.0, 1.0], [11, 0.97, 0.99, 1.03], [13, 1.03, 1.02, 0.97], [17, 0.985, 1.0, 0.95]]

def bp(fc, q, fs=SR):
    """a band-pass biquad, 0 dB at fc (RBJ): b, a"""
    w = 2 * np.pi * fc / fs; al = np.sin(w) / (2 * q); a0 = 1 + al
    return np.array([al, 0, -al]) / a0, np.array([1, -2 * np.cos(w) / a0, (1 - al) / a0])

def lp_sos(fc, order, fs):
    """a Butterworth low-pass of order 2 or 4 as biquad sections (RBJ), without scipy's design step"""
    qs = [.7071] if order <= 2 else [.5412, 1.3066]; w = 2 * np.pi * fc / fs; out = []
    for q in qs:
        al = np.sin(w) / (2 * q); c = np.cos(w); a0 = 1 + al
        out.append([(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, 1, -2 * c / a0, (1 - al) / a0])
    return np.array(out)

def lpnoise(rng, n, fc, sr=SR):
    """smooth random wander, unit std, below fc Hz"""
    b, a = sg.butter(2, fc / (sr / 2)); w = sg.filtfilt(b, a, rng.normal(0, 1, n + 400))[200:200 + n]; return w / (w.std() + 1e-9)

def contour(P, t):
    T = P['dur']; k = np.clip(t / (T * .08), 0, 1)
    return np.where(t < T * .08, P['f0a'] + (P['f0b'] - P['f0a']) * k,
                    P['f0b'] + (P['f0c'] - P['f0b']) * np.clip((t - T * .08) / (T * .80), 0, 1) ** .8)

def to16(x, rng=None):
    rng = rng or np.random.default_rng(0)
    # (TPDF dither, one step of 16 bits)
    d = rng.uniform(-.5, .5, len(x)) + rng.uniform(-.5, .5, len(x))
    return np.clip(np.round(x * 32767 + d), -32768, 32767).astype(np.int16)

def shelf(fc, gdb, kind, fs=SR):
    """a shelving biquad (RBJ, slope 1): kind 'low' or 'high', gain gdb at the shelf"""
    A = 10 ** (gdb / 40); w = 2 * np.pi * fc / fs; c = np.cos(w); al = np.sin(w) / 2 * np.sqrt(2); sA = 2 * np.sqrt(A) * al
    if kind == 'low':
        b = [A * ((A + 1) - (A - 1) * c + sA), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - sA)]; a = [(A + 1) + (A - 1) * c + sA, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - sA]
    else:
        b = [A * ((A + 1) + (A - 1) * c + sA), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sA)]; a = [(A + 1) - (A - 1) * c + sA, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sA]
    return np.array(b) / a[0], np.array(a) / a[0]

def voice(P, rng, n, t, det, fsc):
    """one voice through the formants: det = its pitch ratio, fsc = its formant ratio"""
    T = P['dur']
    f0 = contour(P, t) * det * (1 + P['vib'] * np.sin(2 * np.pi * P['vibf'] * t + rng.uniform(0, 6.28)) + P['drift'] * lpnoise(rng, n, 6))
    N = n * OS; flow = np.zeros(N); tk = rng.uniform(0, .004); i = 0
    oq, sq = P['oq'], P['sq']; tp = oq * sq / (1 + sq); tn = oq / (1 + sq)
    while tk < T:
        f = np.interp(tk, t, f0); per = max((1 / f) * (1 + rng.normal(0, P['jit'])), 1 / 500)
        a = max(.05, (1 + rng.normal(0, P['shim'])) * (1 - P['sub'] * (i % 2)))
        # (each pulse opens a little differently: its tilt, and so the spectrum, moves pulse by pulse)
        oq_i = min(.95, max(.3, oq * (1 + rng.normal(0, P['oqj'])))); tp = oq_i * sq / (1 + sq); tn = oq_i / (1 + sq)
        i0 = int(np.ceil(tk * FS)); i1 = min(N, int((tk + per) * FS) + 1)
        if i0 < N:
            ph = (np.arange(i0, i1) / FS - tk) / per
            flow[i0:i1] += a * np.where(ph < tp, .5 * (1 - np.cos(np.pi * ph / tp)), np.where(ph < tp + tn, np.cos(np.pi / 2 * (ph - tp) / tn), 0.0))
        tk += per; i += 1
    src = sg.resample_poly(np.diff(flow, prepend=0) * OS, 1, OS)[:n]; flw = sg.resample_poly(flow, 1, OS)[:n]
    src /= np.abs(src).max() + 1e-9
    # breath noise: open-phase weighted, and flapping (the rattle)
    nz = rng.normal(0, 1, n); fm = np.clip(flw / (np.abs(flw).max() + 1e-9), 0, 1)
    rat = 1 + P['rat'] * np.sin(2 * np.pi * np.cumsum(P['ratf'] * (1 + .15 * lpnoise(rng, n, 4))) / SR)
    nz *= ((1 - P['nmod']) + P['nmod'] * fm) * np.clip(rat, 0, None); nz /= np.abs(nz).max() + 1e-9
    x = src + P['noise'] * nz
    b, a = sg.butter(1, 900 / (SR / 2)); x = (1 - P['tilt']) * x + P['tilt'] * sg.lfilter(b, a, x) * 2.2
    B = 16; y = np.zeros(n); u_all = np.minimum(1, t / T / .85) ** .9
    F = [(P['F1a'], P['F1b'], P['B1'], 1.0), (P['F2a'], P['F2b'], P['B2'], P['g2']), (P['F3a'], P['F3b'], P['B3'], P['g3']), (P['F4'], P['F4'], P['B4'], P['g4'])]
    wander = [fsc * (1 + P['fj'] * lpnoise(rng, n, P['fjr'])) for _ in F]; zs = [np.zeros(2) for _ in range(len(F) + 1)]
    for s0 in range(0, n, B):
        seg = x[s0:s0 + B]; u = u_all[s0]; acc = np.zeros(len(seg))
        for j, (fa, fb, bw, gain) in enumerate(F):
            fc = min((fa + (fb - fa) * u) * wander[j][s0], SR * .45); bb, aa = bp(fc, fc / bw); o, zs[j] = sg.lfilter(bb, aa, seg, zi=zs[j]); acc += gain * o
        bb, aa = bp(P['Fb'] * fsc, P['Fb'] / P['Bb']); o, zs[-1] = sg.lfilter(bb, aa, seg, zi=zs[-1]); acc += P['gb'] * o
        y[s0:s0 + B] = acc
    return y / (np.abs(y).max() + 1e-9)

def synth3(P, seed=None):
    rng = np.random.default_rng(P['seed'] if seed is None else seed)
    T = P['dur']; n = int(T * SR); t = np.arange(n) / SR
    # the stack: the main voice, then a lower one and a higher one (each its own randomness)
    y = voice(P, rng, n, t, 1.0, 1.0)
    if P['v2'] > 0: y = y + P['v2'] * voice(P, rng, n, t, 1 - P['dt'], 1 - P['ft'])
    if P['v3'] > 0: y = y + P['v3'] * voice(P, rng, n, t, 1 + P['dt'] * .8, 1 + P['ft'] * .7)
    y /= np.abs(y).max() + 1e-9
    if P['ba'] > 0:
        nb = int(P['bd'] * SR * 3); bz = rng.normal(0, 1, nb); hb, ha = sg.butter(2, P['bf'] / (SR / 2), 'high'); bz = sg.lfilter(hb, ha, bz)
        bz *= np.exp(-np.arange(nb) / (P['bd'] * SR)) * P['ba'] / (np.abs(bz).max() + 1e-9); y[:nb] += bz
    if P['ga'] > 0:
        for _ in range(rng.poisson(P['gr'] * T * .8)):
            s = int(rng.uniform(.03, T * .8) * SR); fr = rng.uniform(500, 2400); d = rng.uniform(.002, .008); L = min(n - s, int(d * SR * 5))
            tt = np.arange(L) / SR; y[s:s + L] += P['ga'] * rng.uniform(.4, 1) * np.sin(2 * np.pi * fr * tt * (1 + 2 * tt)) * np.exp(-tt / d)
    # at 4x: a lopsided saturation (warmth: the even harmonics), the envelope, the limit, the closing low-pass; back down
    N = n * OS; Y = sg.resample_poly(y, OS, 1)[:N]
    dr = P['drive']; asy = P['asy']; Y = np.tanh(dr * (Y + asy)) - np.tanh(dr * asy); Y /= np.abs(Y).max() + 1e-9
    e = np.ones(N); ka = int(P['att'] * FS); e[:ka] = np.sin(np.linspace(0, np.pi / 2, ka)) ** 2
    h = int((P['att'] + P['hold']) * FS); r = P['rel'] * FS
    if h < N: e[h:] = np.exp(-np.arange(N - h) / (r / 3.2)) * np.clip(1 - np.arange(N - h) / max(1, N - h), 0, 1) ** .5
    Y *= e
    if P['lim'] > 0: Y = np.tanh(P['lim'] * Y) / np.tanh(P['lim'])
    o = np.zeros(N); z = None; BB = 64
    for s0 in range(0, N, BB):
        u = s0 / N; fc = P['lpa'] * (P['lpb'] / P['lpa']) ** (u ** P['lpx']); sos = lp_sos(min(fc, FS * .2), int(P['lpo']), FS)
        if z is None: z = np.zeros((sos.shape[0], 2))
        o[s0:s0 + BB], z = sg.sosfilt(sos, Y[s0:s0 + BB], zi=z)
    out = sg.resample_poly(o, 1, OS)[:n]
    hb, ha = sg.butter(1, 30 / (SR / 2), 'high'); out = sg.lfilter(hb, ha, out)
    # the tone, as a mixing desk would set it: body below, air above
    if P.get('ls_g', 0): b, a = shelf(P['ls_f'], P['ls_g'], 'low'); out = sg.lfilter(b, a, out)
    if P.get('hs_g', 0): b, a = shelf(P['hs_f'], P['hs_g'], 'high'); out = sg.lfilter(b, a, out)
    fz = int(.004 * SR); out[-fz:] *= np.linspace(1, 0, fz)
    return out / (np.abs(out).max() + 1e-9) * .966

def variant(P, f0x, fx, lx):
    Q = dict(P)
    for k in ('f0a', 'f0b', 'f0c'): Q[k] = P[k] * f0x
    for k in ('F1a', 'F1b', 'F2a', 'F2b', 'F3a', 'F3b', 'F4', 'Fb'): Q[k] = P[k] * fx
    for k in ('dur', 'hold', 'rel'): Q[k] = P[k] * lx
    return Q

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); snd = os.path.join(here, '..', 'sound')
    for i, (seed, f0x, fx, lx) in enumerate(VARIANTS, 1):
        x = synth3(variant(P, f0x, fx, lx), seed); out = os.path.join(snd, 'zombie_pain_%d' % i); wav = out + '.wav'
        wf.write(wav, SR, to16(x, np.random.default_rng(seed)))
        # ogg for most browsers, mp3 for the iPhone (design.js lists both: the first one the browser can read is used)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'libvorbis', '-q:a', '8', out + '.ogg'], check=True)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', out + '.mp3'], check=True)
        os.remove(wav); print('zombie_pain_%d' % i, '%.2f s' % (len(x) / SR))
