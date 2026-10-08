import os, subprocess, shutil, sys, base64
R = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(R, 'src')
D = os.path.join(R, os.environ.get('OUT_DIR', 'dist'))
FONTS = os.path.join(R, 'fonts')  # Galmuri11 (SIL OFL 1.1); subsetting needs: pip install fonttools brotli
os.makedirs(os.path.join(D, 'assets'), exist_ok=True)
os.makedirs(os.path.join(D, 'standalone', 'assets'), exist_ok=True)
order = ['util', 'i18n', 'world', 'tex', 'shaders', 'map', 'mapsub', 'mapit_data', 'mapit', 'mapmil_data', 'mapmil', 'maprest', 'mapbt', 'nav', 'models', 'gunart', 'vm', 'audio', 'fx',
         'weapons', 'nyw', 'game', 'ai', 'render', 'ui', 'minimap', 'net', 'coffin', 'drops', 'lobby', 'main', 'scenario', 'touch']
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
print('page bytes', len(page.encode()), 'js', len(js.encode()), 'fonts',
      [os.path.getsize(os.path.join(D, 'assets', f)) for f in ('galmuri11.woff', 'galmuri11b.woff')], 'chars', len(chars),
      'standalone', len(standalone.encode()))
