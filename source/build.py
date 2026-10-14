import os, subprocess, shutil, sys, base64
R = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(R, 'src')
D = os.path.join(R, os.environ.get('OUT_DIR', 'dist'))
FONTS = os.path.join(R, 'fonts')  # Galmuri11 (SIL OFL 1.1); subsetting needs: pip install fonttools brotli
os.makedirs(os.path.join(D, 'assets'), exist_ok=True)
os.makedirs(os.path.join(D, 'standalone', 'assets'), exist_ok=True)
order = ['util', 'i18n', 'design', 'world', 'tex', 'shaders', 'map', 'mapsub', 'mapit_data', 'mapit', 'mapmil_data', 'mapmil', 'maprest', 'mapbt', 'mapport', 'mapbz', 'mapho_tex', 'mapho', 'mapep1', 'mapep2', 'mapep3', 'mapep4', 'mapep5', 'nav', 'models', 'gunart', 'vm', 'vmdraw', 'vmrel', 'vmknife', 'audio', 'fx',
         'weapons', 'nyw', 'skull9', 'salamander', 'newguns', 'balrog', 'crateguns', 'katana', 'game', 'ai', 'render', 'ui', 'csoguns', 'realguns', 'minimap', 'net', 'coffin', 'drops', 'supply', 'lobby', 'main', 'scenario', 'range', 'sb', 'account', 'shop', 'rank', 'newsban', 'loadout', 'inv', 'friends', 'touch', 'hskill', 'chat', 'ping', 'epbase', 'aleph', 'argus', 'khepri', 'lyrebird', 'tiamat', 'episode', 'hof', 'invite', 'fireman', 'janus', 'crowbar', 'thanatos', 'm4dk', 'srvnote', 'mailbox', 'gunpop', 'pvp', 'bomb', 'race', 'smoke']
parts = []
for f in order:
    p = os.path.join(S, f + '.js')
    if os.path.exists(p):
        parts.append('// ---- ' + f + '.js ----\n' + open(p, encoding='utf8').read())
js = '\n'.join(parts)
css = open(os.path.join(S, 'style.css'), encoding='utf8').read()
body = open(os.path.join(S, 'body.html'), encoding='utf8').read()
# font subset: every non-ASCII char used anywhere + ASCII
chars = set(chr(c) for c in range(32, 127))
for src in (js, body, css):
    for ch in src:
        if ord(ch) > 127:
            chars.add(ch)
chars |= set('·…∞—×%/:!?+-→←↑↓▲▼◆●■□★☆♥')
open(os.path.join(D, 'chars.txt'), 'w', encoding='utf8').write(''.join(sorted(chars)))
for name, out in (('Galmuri11.ttf', 'galmuri11.woff'), ('Galmuri11-Bold.ttf', 'galmuri11b.woff')):
    subprocess.run(['pyftsubset', os.path.join(FONTS, name), '--text-file=' + os.path.join(D, 'chars.txt'),
                    '--flavor=woff', '--output-file=' + os.path.join(D, 'assets', out), '--layout-features=*'], check=True)
    shutil.copy(os.path.join(D, 'assets', out), os.path.join(D, 'standalone', 'assets', out))
title = '<title>QUARANTINE Z</title>\n'
head = title + '<style>\n' + css + '\n</style>\n'
three_cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
page = head + body + '\n' + three_cdn + '<script>\n' + js + '\n</script>\n'
open(os.path.join(D, 'index.html'), 'w', encoding='utf8').write(page)
# standalone: three.js and the fonts are inlined, so the single file also works opened straight from disk (file://)
three = open(os.path.join(R, 'vendor', 'three.min.js'), encoding='utf8').read()
css_sa = css
for out in ('galmuri11.woff', 'galmuri11b.woff'):
    b64 = base64.b64encode(open(os.path.join(D, 'assets', out), 'rb').read()).decode()
    css_sa = css_sa.replace("url('assets/" + out + "')", "url(data:font/woff;base64," + b64 + ")")
head_sa = title + '<style>\n' + css_sa + '\n</style>\n'
peer = ''
pj = os.path.join(R, 'vendor', 'peerjs.min.js')
if os.path.exists(pj):
    peer = '<script>\n' + open(pj, encoding='utf8').read() + '\n</script>\n'
standalone = ('<!doctype html>\n<html lang="ko"><head><meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n'
              '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
              + head_sa + '</head><body>\n' + body + '\n<script>\n' + three + '\n</script>\n' + peer + '<script>\n' + js + '\n</script>\n</body></html>\n')
open(os.path.join(D, 'standalone', 'index.html'), 'w', encoding='utf8').write(standalone)
# sound files (design.js SOUND_DESIGN[...].file = 'sound/…') sit next to the page: copy sound/ into both builds
if os.path.isdir(os.path.join(R, 'sound')):
    for out in (D, os.path.join(D, 'standalone')):
        shutil.copytree(os.path.join(R, 'sound'), os.path.join(out, 'sound'), dirs_exist_ok=True)
# v6.42: the admin page (admin.html) — a page of its own: sb.js (the same Supabase project), the gun and map names read out of the game's
# sources, admin/admin.js + admin.css, Galmuri11 subset to its own characters. Nothing of the game itself goes in.
import re, json
A = os.path.join(R, 'admin')
if os.path.isdir(A):
    guns = {}
    for m in re.finditer(r"(?:WPN\.([a-z0-9_]+)\s*=\s*(?:Object\.assign\(\{\},WPN\.[a-z0-9_]+,)?\{|(?<![\w.$'\"])([a-z0-9_]+):\{)([^{}]{0,500}?)\bn:\['([^']*)','([^']*)'\]", js):
        k = m.group(1) or m.group(2)
        if k not in guns:
            kd = re.search(r"kind:'([a-z]+)'", m.group(3) + js[m.end():m.end() + 200])
            guns[k] = [m.group(4), m.group(5), kd.group(1) if kd else '']
    i = js.index('const MAPDEFS={') + len('const MAPDEFS=')
    d, j = 0, i
    while True:
        c = js[j]
        d += 1 if c == '{' else -1 if c == '}' else 0
        j += 1
        if d == 0:
            break
    maps = {}
    lit = js[i:j]
    d = 0
    for k2, ch in enumerate(lit):
        if ch == '{':
            d += 1
            if d == 2:
                mm = re.search(r"([a-z0-9_]+):$", lit[max(0, k2 - 24):k2])
                nn = re.match(r"\{n:\['([^']*)'", lit[k2:k2 + 120])
                if mm and nn:
                    maps[mm.group(1)] = nn.group(1)
        elif ch == '}':
            d -= 1
    for m in re.finditer(r"MAPDEFS\.([a-z0-9_]+)\s*=\s*\{n:\['([^']*)'", js):
        maps.setdefault(m.group(1), m.group(2))
    ajs = (open(os.path.join(S, 'sb.js'), encoding='utf8').read() + '\nconst GUN_NAMES=' + json.dumps(guns, ensure_ascii=False, separators=(',', ':'))
           + ';\nconst MAP_NAMES=' + json.dumps(maps, ensure_ascii=False, separators=(',', ':')) + ';\n' + open(os.path.join(A, 'admin.js'), encoding='utf8').read())
    acss = open(os.path.join(A, 'admin.css'), encoding='utf8').read()
    ach = set(chr(c) for c in range(32, 127)) | set('·…—×→←↑↓−')
    for ch in ajs + acss:
        if ord(ch) > 127:
            ach.add(ch)
    open(os.path.join(D, 'achars.txt'), 'w', encoding='utf8').write(''.join(sorted(ach)))
    ff = ''
    for name, out, wt in (('Galmuri11.ttf', 'adm11.woff', 'normal'), ('Galmuri11-Bold.ttf', 'adm11b.woff', 'bold')):
        subprocess.run(['pyftsubset', os.path.join(FONTS, name), '--text-file=' + os.path.join(D, 'achars.txt'),
                        '--flavor=woff', '--output-file=' + os.path.join(D, out), '--layout-features=*'], check=True)
        ff += ("@font-face{font-family:'Galmuri11';font-weight:" + wt + ";font-display:swap;src:url(data:font/woff;base64,"
               + base64.b64encode(open(os.path.join(D, out), 'rb').read()).decode() + ") format('woff')}\n")
    admin = ('<!doctype html>\n<html lang="ko"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
             '<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta name="theme-color" content="#07080c">\n'
             '<title>QUARANTINE Z 관리</title>\n<style>\n' + ff + acss + '\n</style>\n</head><body>\n<div id="app"><div class="gate"><div class="card"><p>불러오는 중…</p></div></div></div>\n'
             '<noscript>이 페이지는 자바스크립트가 켜져 있어야 해요.</noscript>\n<script>\n' + ajs + '\n</script>\n</body></html>\n')
    for out in (D, os.path.join(D, 'standalone')):
        open(os.path.join(out, 'admin.html'), 'w', encoding='utf8').write(admin)
    print('admin bytes', len(admin.encode()), 'guns', len(guns), 'maps', len(maps), 'chars', len(ach))
print('page bytes', len(page.encode()), 'js', len(js.encode()), 'fonts',
      [os.path.getsize(os.path.join(D, 'assets', f)) for f in ('galmuri11.woff', 'galmuri11b.woff')], 'chars', len(chars),
      'standalone', len(standalone.encode()))
