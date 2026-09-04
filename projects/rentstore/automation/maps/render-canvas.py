# -*- coding: utf-8 -*-
"""Draws the map JSON as the canvas itself — same coordinates n8n uses."""
import json, pathlib, html, textwrap

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "docs" / "canvas.html"
PAL = {1: "#c9a227", 2: "#9a6b3f", 3: "#c05a55", 4: "#2f8a63", 5: "#3d78c0", 6: "#8367b8", 7: "#6b6b73"}
NW, NH = 202, 74

def esc(t): return html.escape(t or "")

def wrap(text, width, limit):
    lines = textwrap.wrap(text, width)[:limit]
    if len(textwrap.wrap(text, width)) > limit:
        lines[-1] = lines[-1][:width - 1] + "…"
    return lines

def draw(path):
    wf = json.loads(path.read_text(encoding="utf-8"))
    sticky = [n for n in wf["nodes"] if n["type"] == "n8n-nodes-base.stickyNote"]
    nodes = [n for n in wf["nodes"] if n["type"] != "n8n-nodes-base.stickyNote"]
    xs = [s["position"][0] for s in sticky] + [n["position"][0] for n in nodes]
    ys = [s["position"][1] for s in sticky] + [n["position"][1] for n in nodes]
    x2 = [s["position"][0] + s["parameters"]["width"] for s in sticky] + [n["position"][0] + NW for n in nodes]
    y2 = [s["position"][1] + s["parameters"]["height"] for s in sticky] + [n["position"][1] + NH for n in nodes]
    pad = 40
    minx, miny, maxx, maxy = min(xs) - pad, min(ys) - pad, max(x2) + pad, max(y2) + pad
    w, h = maxx - minx, maxy - miny
    at = lambda p: (p[0] - minx, p[1] - miny)

    parts = [f'<rect x="0" y="0" width="{w}" height="{h}" fill="#1b1b20"/>',
             f'<rect x="0" y="0" width="{w}" height="{h}" fill="url(#dots)"/>']

    for s in sorted(sticky, key=lambda s: -s["parameters"]["width"]):
        x, y = at(s["position"]); c = PAL[s["parameters"].get("color", 7)]
        sw, sh = s["parameters"]["width"], s["parameters"]["height"]
        body = s["parameters"]["content"].split("\n")
        head = body[0].lstrip("# ").strip()
        rest = " ".join(l for l in body[1:] if l.strip()).replace("**", "")
        big = body[0].startswith("## ")
        parts.append(f'<rect x="{x}" y="{y}" width="{sw}" height="{sh}" rx="14" fill="{c}" fill-opacity="{.10 if big else .16}" stroke="{c}" stroke-opacity=".55"/>')
        parts.append(f'<text x="{x+18}" y="{y+30}" fill="{c}" font-size="{19 if big else 15}" font-weight="700">{esc(head)}</text>')
        for i, line in enumerate(wrap(rest, 36 if sw < 420 else 52, 6)):
            parts.append(f'<text x="{x+18}" y="{y+56+i*19}" fill="#a7a39b" font-size="13">{esc(line)}</text>')

    for a, conns in wf["connections"].items():
        src = next((n for n in nodes if n["name"] == a), None)
        for out in conns.get("main", []):
            for c in out:
                dst = next((n for n in nodes if n["name"] == c["node"]), None)
                if not src or not dst: continue
                x1, y1 = at(src["position"]); x1 += NW; y1 += NH / 2
                x3, y3 = at(dst["position"]); y3 += NH / 2
                mid = (x1 + x3) / 2
                parts.append(f'<path d="M{x1} {y1} C{mid} {y1} {mid} {y3} {x3} {y3}" fill="none" stroke="#6f6a62" stroke-width="1.6" marker-end="url(#ar)"/>')

    for n in nodes:
        x, y = at(n["position"])
        off = n.get("disabled")
        name = n["name"]
        num, _, label = name.partition(" · ")
        dash = ' stroke-dasharray="5 4"' if off else ''
        edge = "#4a4a52" if off else "#5f5a52"
        parts.append(f'<rect x="{x}" y="{y}" width="{NW}" height="{NH}" rx="11" fill="#26262c" stroke="{edge}" stroke-width="1.4"{dash}/>')
        parts.append(f'<text x="{x+12}" y="{y+24}" fill="{"#8a857c" if off else "#f0ece3"}" font-size="14.5" font-weight="700">{esc((num if label else name)[:21])}</text>')
        if label:
            parts.append(f'<text x="{x+12}" y="{y+43}" fill="#cfc9bf" font-size="12.5" font-weight="500">{esc(label[:23])}</text>')
        for i, line in enumerate(wrap(n.get("notes", ""), 27, 1)):
            parts.append(f'<text x="{x+12}" y="{y+64}" fill="#918c83" font-size="11.5">{esc(line)}</text>')

    svg = (f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" '
           f'role="img" aria-label="{esc(wf["name"])}"><defs>'
           '<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">'
           '<circle cx="1.5" cy="1.5" r="1.2" fill="#2c2c33"/></pattern>'
           '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
           '<polygon points="0,1 10,5 0,9" fill="#6f6a62"/></marker></defs>'
           + "".join(parts) + "</svg>")
    return wf["name"], svg

blocks = []
for f in sorted(HERE.glob("map-*.json")):
    name, svg = draw(f)
    blocks.append(f'<section><h2>{esc(name.split("· ")[1])}</h2>'
                  f'<div class="canvas">{svg}</div></section>')

OUT.write_text(
    '<title>RentStore Canvas</title>\n'
    '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap" rel="stylesheet">\n'
    '<style>'
    'body{margin:0;background:#141418;color:#f0ece3;font-family:"IBM Plex Sans",system-ui,sans-serif}'
    '.wrap{width:min(100% - 2rem,1200px);margin-inline:auto;padding:2.5rem 0 3rem}'
    'h1{font-size:1.7rem;margin:0 0 .3rem}p.sub{color:#918c83;margin:0 0 2rem;font-size:.92rem}'
    'h2{font-size:1.05rem;margin:0 0 .6rem;color:#d9ad5f}'
    'section{margin-bottom:2.2rem}'
    '.canvas{overflow-x:auto;border:1px solid #2c2c33;border-radius:14px;background:#1b1b20}'
    '.canvas svg{display:block;max-width:none}'
    '</style>'
    '<div class="wrap"><h1>RentStore — the business on one canvas</h1>'
    '<p class="sub">Four journeys, drawn exactly as they appear in n8n. Scroll each canvas sideways.</p>'
    + "".join(blocks) + "</div>", encoding="utf-8")
print("canvas.html:", OUT.stat().st_size // 1024, "KB")
