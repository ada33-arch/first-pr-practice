# -*- coding: utf-8 -*-
"""Builds an n8n canvas that reads like a plan: numbered step zones, colour-coded
groups inside them, notes carrying the real details, and nodes that explain
themselves. Import the result into n8n and the whole plan is one picture.

Used by the workflow-canvas skill. Layout is computed, never hand-placed, so
zones always contain their nodes and nothing overlaps.
"""
import json, pathlib

# n8n sticky palette, by the role we give each colour
YELLOW, BROWN, RED, GREEN, BLUE, PURPLE, GREY = 1, 2, 3, 4, 5, 6, 7
ROLE = {
    "input": GREEN,      # what a person gives us, and approval gates
    "engine": PURPLE,    # the thing that does the work
    "prepare": BLUE,     # shaping, formatting, deciding
    "create": RED,       # making an asset, spending money, irreversible
    "optional": YELLOW,  # alternative or skippable branches
    "note": GREY,        # credentials, links, warnings
    "step": GREY,        # the numbered container behind a phase
}
DIGITS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

NODE_DX, NODE_DY = 220, 170          # spacing between nodes
GROUP_PAD_X, GROUP_TOP, GROUP_BOT = 40, 90, 40
STEP_PAD_X, STEP_TOP, STEP_BOT = 40, 110, 40
STEP_GAP, GROUP_GAP = 170, 40


class Canvas:
    def __init__(self, name, subtitle=""):
        self.name, self.subtitle = name, subtitle
        self.nodes, self.stickies, self.links = [], [], {}
        self._x = 0            # left edge of the next step zone
        self._ids = set()

    # ---------------------------------------------------------------- pieces
    def _uid(self, base):
        uid, n = base, 2
        while uid in self._ids:
            uid, n = f"{base}-{n}", n + 1
        self._ids.add(uid)
        return uid

    def _sticky(self, content, pos, w, h, color):
        self.stickies.append({
            "parameters": {"content": content, "width": w, "height": h, "color": color},
            "id": self._uid("sticky-" + str(len(self.stickies))),
            "name": "Note " + str(len(self.stickies) + 1),
            "type": "n8n-nodes-base.stickyNote",
            "typeVersion": 1,
            "position": [round(pos[0]), round(pos[1])],
        })

    def _node(self, name, note, pos, kind="noOp", disabled=False):
        node = {
            "parameters": {},
            "id": self._uid(name.split(" ")[0].lower().strip("·")),
            "name": name,
            "type": "n8n-nodes-base." + kind,
            "typeVersion": 1,
            "position": [round(pos[0]), round(pos[1])],
            "notes": note,
            "notesInFlow": True,
        }
        if disabled:
            node["disabled"] = True
        self.nodes.append(node)
        return name

    # ------------------------------------------------------------------ api
    def step(self, number, title, note, groups):
        """groups: [(role, title, [(node_name, node_note, optional_flag), ...]), ...]"""
        widest = max(len(g[2]) for g in groups)
        inner_w = widest * NODE_DX - (NODE_DX - 210)
        gx = self._x + STEP_PAD_X
        gy = STEP_TOP
        placed = []

        for role, gtitle, items in groups:
            gw = len(items) * NODE_DX - (NODE_DX - 210) + GROUP_PAD_X * 2
            gh = GROUP_TOP + GROUP_BOT + 60
            self._sticky(f"### {gtitle}", (gx, gy), gw, gh, ROLE[role])
            for i, item in enumerate(items):
                nname, nnote = item[0], item[1]
                off = item[2] if len(item) > 2 else False
                placed.append(self._node(nname, nnote,
                                         (gx + GROUP_PAD_X + i * NODE_DX, gy + GROUP_TOP),
                                         disabled=off))
            gy += gh + GROUP_GAP

        step_w = max(inner_w + STEP_PAD_X * 2,
                     max((len(g[2]) * NODE_DX - (NODE_DX - 210) + GROUP_PAD_X * 2) for g in groups) + STEP_PAD_X * 2)
        step_h = gy - STEP_TOP + STEP_TOP + STEP_BOT - GROUP_GAP
        digits = "".join(DIGITS[int(d)] for d in str(number))
        self._sticky(f"## Step {digits} {title}\n\n{note}", (self._x, 0), step_w, step_h, ROLE["step"])
        self._x += step_w + STEP_GAP
        return placed

    def note(self, title, body, at_step=None, color="note", height=260, width=380):
        """A standalone notes panel — credentials, warnings, rules."""
        x = self._x if at_step is None else at_step
        self._sticky(f"### {title}\n\n{body}", (x, 0), width, height, ROLE[color])
        if at_step is None:
            self._x += width + STEP_GAP

    def trigger(self, name, note):
        pos = (-260, STEP_TOP + GROUP_TOP)
        return self._node(name, note, pos, kind="manualTrigger")

    def link(self, *names):
        for a, b in zip(names, names[1:]):
            self.links.setdefault(a, {"main": [[]]})["main"][0].append(
                {"node": b, "type": "main", "index": 0})

    # ---------------------------------------------------------------- output
    def check(self):
        """Nodes must not overlap each other — a canvas that reads wrong is a bug."""
        seen, clashes = {}, []
        for n in self.nodes:
            key = (n["position"][0] // 60, n["position"][1] // 60)
            if key in seen:
                clashes.append(f'{n["name"]} overlaps {seen[key]}')
            seen[key] = n["name"]
        return clashes

    def save(self, path, tag="plan"):
        clashes = self.check()
        if clashes:
            raise SystemExit("layout problem: " + "; ".join(clashes))
        wf = {
            "name": self.name,
            "nodes": self.stickies + self.nodes,
            "connections": self.links,
            "active": False,
            "settings": {"executionOrder": "v1", "timezone": "Asia/Dubai"},
            "pinData": {},
            "tags": [{"name": tag}],
        }
        p = pathlib.Path(path)
        p.write_text(json.dumps(wf, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return f"{p.name}: {len(self.nodes)} nodes, {len(self.stickies)} panels"
