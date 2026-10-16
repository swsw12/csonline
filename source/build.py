import os, subprocess, shutil, sys, base64
R = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(R, 'src')
D = os.path.join(R, os.environ.get('OUT_DIR', 'dist'))
FONTS = os.path.join(R, 'fonts')  # Galmuri11 (SIL OFL 1.1); subsetting needs: pip install fonttools brotli
os.makedirs(os.path.join(D, 'assets'), exist_ok=True)
os.makedirs(os.path.join(D, 'standalone', 'assets'), exist_ok=True)
order = ['util', 'sb', 'errlog', 'i18n', 'design', 'world', 'tex', 'shaders', 'map', 'mapsub', 'mapit_data', 'mapit', 'mapmil_data', 'mapmil', 'maprest', 'mapbt', 'mapport', 'mapbz', 'mapho_tex', 'mapho', 'mapep1', 'mapep2', 'mapep3', 'mapep4', 'mapep5', 'nav', 'models', 'gunart', 'vm', 'vmdraw', 'vmrel', 'vmknife', 'audio', 'fx',
         'weapons', 'nyw', 'skull9', 'salamander', 'newguns', 'balrog', 'crateguns', 'katana', 'game', 'ai', 'render', 'ui', 'csoguns', 'realguns', 'minimap', 'net', 'coffin', 'drops', 'supply', 'lobby', 'main', 'scenario', 'range', 'account', 'shop', 'rank', 'newsban', 'loadout', 'inv', 'friends', 'touch', 'hskill', 'chat', 'ping', 'epbase', 'aleph', 'argus', 'khepri', 'lyrebird', 'tiamat', 'episode', 'hof', 'invite', 'fireman', 'janus', 'janus2', 'sentinel', 'q7vac', 'bhound', 'crowbar', 'thanatos', 'm4dk', 'glock', 'realguns2', 'srvnote', 'mailbox', 'gunpop', 'inquiry', 'pvp', 'bomb', 'race', 'smoke', 'ach']
parts = []
for f in order:
    p = os.path.join(S, f + '.js')
    if os.path.exists(p):
        parts.append('// ---- ' + f + '.js ----\n' + open(p, encoding='utf8').read())
js = '\n'.join(parts)
# v6.67: the terms and the privacy policy — legal/legal.json holds the operator, the contact, the database region and the date the text
# takes effect; the game's LEGAL.ver (account.js, sent with an e-mail sign-up) is that date
import json, html as _html, re as _re
LG = os.path.join(R, 'legal')
LCFG = json.load(open(os.path.join(LG, 'legal.json'), encoding='utf8')) if os.path.isdir(LG) else {'effective': ''}
js = js.replace("'%LEGAL_VER%'", json.dumps(str(LCFG.get('effective', ''))))
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
# v6.67: privacy.html and terms.html next to the game: shell.html around each page's two articles (한국어 / English), {{key}} from legal.json,
# <!--if:key-->…<!--/if--> kept only when that value is set and <!--ifnot:key-->…<!--/if--> only when it is not
if os.path.isdir(LG):
    shell = open(os.path.join(LG, 'shell.html'), encoding='utf8').read()
    lcss = open(os.path.join(LG, 'page.css'), encoding='utf8').read()
    names = {'privacy': ('개인정보처리방침', 'Privacy Policy'), 'terms': ('이용약관', 'Terms of Service')}
    for name, other in (('privacy', 'terms'), ('terms', 'privacy')):
        t = shell.replace('{{content}}', open(os.path.join(LG, name + '.html'), encoding='utf8').read()).replace('{{css}}', lcss)
        t = t.replace('{{name_ko}}', names[name][0]).replace('{{name_en}}', names[name][1])
        t = t.replace('{{other_file}}', other + '.html').replace('{{other_ko}}', names[other][0]).replace('{{other_en}}', names[other][1])
        t = _re.sub(r'<!--if:(\w+)-->(.*?)<!--/if-->', lambda m: m.group(2) if str(LCFG.get(m.group(1), '')).strip() else '', t, flags=_re.S)
        t = _re.sub(r'<!--ifnot:(\w+)-->(.*?)<!--/if-->', lambda m: '' if str(LCFG.get(m.group(1), '')).strip() else m.group(2), t, flags=_re.S)
        for k, v in LCFG.items():
            if not k.startswith('_'):
                t = t.replace('{{' + k + '}}', _html.escape(str(v)))
        left = _re.findall(r'\{\{\w+\}\}', t)
        if left:
            raise SystemExit('legal/' + name + '.html: no value for ' + ', '.join(sorted(set(left))))
        for out in (D, os.path.join(D, 'standalone')):
            open(os.path.join(out, name + '.html'), 'w', encoding='utf8').write(t)
    print('legal pages', LCFG.get('effective'), 'contact', 'e-mail' if str(LCFG.get('email', '')).strip() else '문의하기 only')
print('page bytes', len(page.encode()), 'js', len(js.encode()), 'fonts',
      [os.path.getsize(os.path.join(D, 'assets', f)) for f in ('galmuri11.woff', 'galmuri11b.woff')], 'chars', len(chars),
      'standalone', len(standalone.encode()))
