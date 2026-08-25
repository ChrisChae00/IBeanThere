import os, re, sys, hashlib, urllib.request

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
OUT_DIR = 'public/fonts'
def fetch(url, ua=True):
    req = urllib.request.Request(url, headers={'User-Agent': UA} if ua else {})
    return urllib.request.urlopen(req).read()

def gf_css(query):
    return fetch(f'https://fonts.googleapis.com/css2?family={query}&display=swap').decode()

# Google serves Korean faces with no subset comment at all - only the Latin ones are
# labelled - so the label is optional and carried forward from the last comment seen.
TOKEN = re.compile(r'/\*\s*([^*]+?)\s*\*/|@font-face\s*\{(.*?)\}', re.S)


def faces_of(css):
    label = ''
    for comment, body in TOKEN.findall(css):
        if comment:
            label = comment
        else:
            yield label, body
            label = ''


def process(css, slug, keep_subsets=None, base=None):
    """Rewrites one family's @font-face blocks to local files and downloads them."""
    os.makedirs(f'{OUT_DIR}/{slug}', exist_ok=True)
    seen, out = {}, []
    for subset, body in faces_of(css):
        if keep_subsets and subset not in keep_subsets:
            continue
        m = re.search(r'url\((.*?)\)', body)
        if not m:
            continue
        url = m.group(1)
        full = url if url.startswith('http') else base + url.lstrip('./')
        if full not in seen:
            data = fetch(full, ua=not full.startswith('https://cdn.jsdelivr'))
            name = f'{slug}-{len(seen):03d}.woff2'
            open(f'{OUT_DIR}/{slug}/{name}', 'wb').write(data)
            seen[full] = (name, len(data))
        name, _ = seen[full]
        out.append('@font-face {' + body.replace(url, f'/fonts/{slug}/{name}').rstrip() + '\n}')
    total = sum(s for _, s in seen.values())
    print(f'{slug}: {len(seen)} files, {total//1024} KB, {len(out)} faces', file=sys.stderr)
    return out

blocks = {}
blocks['instrument-serif'] = process(gf_css('Instrument+Serif:ital@0;1'), 'instrument-serif')
blocks['inter'] = process(gf_css('Inter:wght@400;500;600;700'), 'inter',
                          keep_subsets={'latin', 'latin-ext'})
blocks['noto-sans-kr'] = process(gf_css('Noto+Sans+KR:wght@400;500;700'), 'noto-sans-kr')

pd = fetch('https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/'
           'pretendardvariable-dynamic-subset.css', ua=False).decode()
pd = re.sub(r'/\* \[(\d+)\] \*/', r'/* subset-\1 */', pd)
blocks['pretendard'] = process(pd, 'pretendard',
                               base='https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/')

header = """/*
  Self-hosted webfaces. The Content-Security-Policy in next.config.js allows fonts only
  from 'self', so nothing here may come from a CDN at runtime.

  Korean faces are split by unicode-range, which is why the file count is large: the
  browser fetches only the ranges a page actually uses. Serving either Korean family as
  a single file would cost megabytes on every first visit instead.

  Regenerate with scripts/build-fonts.py after changing a family or weight.

  Instrument Serif  OFL 1.1  https://fonts.google.com/specimen/Instrument+Serif
  Inter             OFL 1.1  https://fonts.google.com/specimen/Inter
  Noto Sans KR      OFL 1.1  https://fonts.google.com/specimen/Noto+Sans+KR
  Pretendard        OFL 1.1  https://github.com/orioncactus/pretendard
*/
"""

parts = [header]
for slug, faces in blocks.items():
    parts.append(f'\n/* ---- {slug} ---- */\n')
    parts.extend(faces)
open('src/styles/fonts.css', 'w').write('\n'.join(parts) + '\n')
print('fonts.css written', file=sys.stderr)
