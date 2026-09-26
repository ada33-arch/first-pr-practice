from PIL import Image
from collections import Counter
import colorsys, sys

im = Image.open('ref/master.webp').convert('RGB')
W, H = im.size

# the seven panels, read off the contact sheet
PANELS = {
    '01-home':      (0, 0, 610, 590),
    '02-stores':    (612, 0, 1080, 590),
    '03-how':       (1082, 0, 1536, 590),
    '04-success':   (0, 605, 392, 1020),
    '05-resources': (404, 605, 780, 1020),
    '06-about':     (790, 605, 1150, 1020),
    '07-list':      (1158, 605, 1536, 1020),
}

def hexof(c): return '#%02x%02x%02x' % c

def dominant(box, n=8, step=2):
    crop = im.crop(box)
    px = list(crop.getdata())[::step]
    # bucket to reduce noise, keep the representative original
    buckets = Counter()
    rep = {}
    for p in px:
        k = (p[0]//12, p[1]//12, p[2]//12)
        buckets[k] += 1
        rep.setdefault(k, p)
    out = []
    for k, cnt in buckets.most_common(n):
        c = rep[k]
        h, l, s = colorsys.rgb_to_hls(*[v/255 for v in c])
        out.append((hexof(c), cnt*100//len(px), round(h*360), round(s*100), round(l*100)))
    return out

for name, box in PANELS.items():
    print(f'\n=== {name} ===')
    for hx, pct, h, s, l in dominant(box):
        print(f'  {hx}  {pct:>3}%   H{h:>3} S{s:>3} L{l:>3}')
