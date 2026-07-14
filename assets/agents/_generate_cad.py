#!/usr/bin/env python3
"""Generate the CAD Knowledge Assistant illustration (800x336).

Concept: A floating CAD drawing canvas (orthographic views + dimension
annotations) on the right, with a chat bubble on the left asking a
design-engineer style question. The user is currently inside SolidWorks
or NX and needs to look up a standard.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 800, 336
BG = (250, 249, 245)
INK = (58, 58, 54)
INK2 = (138, 138, 130)
RULE = (217, 214, 204)
RULE_SOFT = (234, 231, 218)
SURFACE = (255, 255, 255)
GREEN = (0, 166, 81)
GREEN_LT = (123, 208, 163)
GREEN_BG = (233, 245, 238)
ORANGE = (229, 138, 42)
BLUE = (21, 101, 192)
BLUE_BG = (227, 240, 252)

OUT = "/Users/st/agent-portal/assets/agents/agent-7-cad.png"


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def text(d, s, x, y, f, fill=INK):
    d.text((x, y), s, fill=fill, font=f)


def wrap(d, s, x, y, max_w, f, fill=INK, spacing=4):
    line, yy = "", y
    for ch in s:
        bbox = f.getbbox(line + ch)
        if (bbox[2] - bbox[0]) > max_w and line:
            text(d, line, x, yy, f, fill=fill)
            yy += f.size + spacing
            line = ch
        else:
            line += ch
    if line:
        text(d, line, x, yy, f, fill=fill)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Soft green flowing lines
for y0, amp, freq in [(60, 80, 0.012), (90, 60, 0.015), (130, 100, 0.010)]:
    pts = []
    for x in range(-20, W + 20, 4):
        y = y0 + amp * (0.5 + 0.5 * (x * freq % 1 - 0.5))
        y += 20 * (x * 0.013 % 1 - 0.5)
        pts.append((x, y))
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=GREEN_LT, width=1)


# ── Left: User query bubble ──────────────────────────────────────
qx, qy = 28, 44
# Avatar
d.ellipse([qx, qy, qx + 36, qy + 36], fill=SURFACE, outline=RULE)
d.ellipse([qx + 11, qy + 8, qx + 25, qy + 22], fill=(188, 186, 176))
d.pieslice([qx + 4, qy + 18, qx + 32, qy + 46], 180, 360, fill=(188, 186, 176))
# Bubble
bx, by, bw, bh = qx + 44, qy - 4, 300, 64
d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, fill=SURFACE, outline=RULE)
d.polygon([(bx - 10, by + 18), (bx, by + 26), (bx, by + 36)], fill=SURFACE)
d.line([(bx - 10, by + 18), (bx, by + 26), (bx, by + 36)], fill=RULE, width=1)
ftitle = font(11, bold=True)
fdesc = font(10)
wrap(d, "Q6.3 标准件的孔径偏差?", bx + 14, by + 10, bw - 28, ftitle, fill=INK)
wrap(d, "风轮轮毂螺栓的许用扭矩", bx + 14, by + 28, bw - 28, ftitle, fill=INK)
wrap(d, "12.9 级 M24 螺栓的标准扭矩上限是多少?", bx + 14, by + 48, bw - 28, fdesc, fill=INK2)


# ── Left bottom: Answer card ────────────────────────────────────
ax, ay, aw, ah = 80, 130, 320, 110
d.rounded_rectangle([ax, ay, ax + aw, ay + ah], radius=12,
                    fill=(250, 249, 245), outline=GREEN, width=2)
# Badge
d.ellipse([ax + 14, ay + 14, ax + 32, ay + 32], fill=GREEN)
d.line([(ax + 18, ay + 23), (ax + 22, ay + 27), (ax + 28, ay + 19)],
       fill=(255, 255, 255), width=2)
# Headline
fhh = font(11, bold=True)
text(d, "检索到 2 条规范 · GB/T 3098.1", ax + 38, ay + 16, fhh, fill=(14, 107, 61))
# Body lines
yy = ay + 38
for line_w in (260, 200, 240, 180):
    d.rounded_rectangle([ax + 14, yy, ax + 14 + line_w, yy + 5], radius=2,
                        fill=(212, 210, 197))
    yy += 9
# Source chip
chip_x, chip_y = ax + 14, ay + ah - 24
d.rounded_rectangle([chip_x, chip_y, chip_x + 120, chip_y + 18], radius=9,
                    fill=GREEN_BG, outline=GREEN)
text(d, "Standard.md · p.42", chip_x + 10, chip_y + 3, font(9), fill=(14, 107, 61))


# ── Right: CAD drawing canvas ───────────────────────────────────
cx, cy, cw, ch = 430, 26, 340, 284
# Frame
d.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=10,
                    fill=SURFACE, outline=RULE)
# Title bar
d.rounded_rectangle([cx, cy, cx + cw, cy + 28], radius=10, fill=(243, 246, 250))
d.rectangle([cx, cy + 18, cx + cw, cy + 28], fill=(243, 246, 250))
# App badge
d.rounded_rectangle([cx + 12, cy + 8, cx + 102, cy + 22], radius=4,
                    fill=GREEN, outline=GREEN)
text(d, "SolidWorks 2024", cx + 18, cy + 10, font(8, bold=True), fill=(255, 255, 255))
# Drawing file label
text(d, "Rotor-2026-018.SLDPRT", cx + 116, cy + 11, font(8), fill=INK2)
text(d, "Sheet 1 / 1", cx + cw - 60, cy + 11, font(8), fill=INK2)

# 2D views (front + side + top)
def frame_view(x, y, w, h, label):
    d.rectangle([x, y, x + w, y + h], outline=INK2, width=1)
    text(d, label, x - 4, y - 14, font(7), fill=INK2)

# Front view — top-left
fv_x, fv_y, fv_w, fv_h = cx + 24, cy + 44, 130, 110
frame_view(fv_x, fv_y, fv_w, fv_h, "前视图")

# Side view (right of front)
sv_x = fv_x + fv_w + 24
sv_y = fv_y
sv_w, sv_h = 96, fv_h
frame_view(sv_x, sv_y, sv_w, sv_h, "侧视图")

# Drawing: a rotor hub in front view
# Center hub circle
hub_cx, hub_cy = fv_x + fv_w // 2, fv_y + fv_h // 2 + 8
d.ellipse([hub_cx - 16, hub_cy - 16, hub_cx + 16, hub_cy + 16],
          fill=(243, 246, 250), outline=INK, width=1)
d.ellipse([hub_cx - 6, hub_cy - 6, hub_cx + 6, hub_cy + 6],
          outline=INK, width=1)
# Bolt circle
d.ellipse([hub_cx - 11, hub_cy - 11, hub_cx + 11, hub_cy + 11],
          outline=INK, width=1, fill=None)
# 8 bolt holes
import math
for i in range(8):
    a = math.radians(i * 45)
    bx, by = hub_cx + 11 * math.cos(a), hub_cy + 11 * math.sin(a)
    d.ellipse([bx - 1.5, by - 1.5, bx + 1.5, by + 1.5], fill=INK)
# Center cross
d.line([(hub_cx - 22, hub_cy), (hub_cx - 18, hub_cy)], fill=INK2, width=0)
d.line([(hub_cx + 18, hub_cy), (hub_cx + 22, hub_cy)], fill=INK2, width=0)
d.line([(hub_cx, hub_cy - 22), (hub_cx, hub_cy - 18)], fill=INK2, width=0)
d.line([(hub_cx, hub_cy + 18), (hub_cx, hub_cy + 22)], fill=INK2, width=0)
# Highlighted dimension
d.line([(hub_cx - 18, hub_cy + 30), (hub_cx + 18, hub_cy + 30)], fill=ORANGE, width=1)
d.line([(hub_cx - 18, hub_cy + 27), (hub_cx - 18, hub_cy + 33)], fill=ORANGE, width=1)
d.line([(hub_cx + 18, hub_cy + 27), (hub_cx + 18, hub_cy + 33)], fill=ORANGE, width=1)
text(d, "⌀ 32", hub_cx - 10, hub_cy + 33, font(7, bold=True), fill=ORANGE)

# Side view — a rectangle representing hub side
sv_cx, sv_cy = sv_x + sv_w // 2, sv_y + sv_h // 2 + 8
d.rectangle([sv_cx - 10, sv_cy - 18, sv_cx + 10, sv_cy + 18],
            fill=(243, 246, 250), outline=INK, width=1)
d.line([(sv_cx, sv_cy - 18), (sv_cx, sv_cy + 18)], fill=INK2, width=0)
# Bolt axis
d.line([(sv_cx - 16, sv_cy), (sv_cx - 10, sv_cy)], fill=INK2, width=0)
d.line([(sv_cx + 10, sv_cy), (sv_cx + 16, sv_cy)], fill=INK2, width=0)

# Highlighted 标注 (callout) from bolt to AI
cb_x, cb_y = hub_cx + 18, hub_cy - 30
cb_w, cb_h = 96, 28
d.rounded_rectangle([cb_x, cb_y, cb_x + cb_w, cb_y + cb_h], radius=4,
                    fill=GREEN_BG, outline=GREEN, width=1)
# Connector
d.line([(hub_cx + 18, hub_cy - 6), (cb_x, cb_y + cb_h // 2)], fill=GREEN, width=1)
# Sparkle icon
d.ellipse([cb_x + 6, cb_y + 7, cb_x + 14, cb_y + 15], fill=GREEN)
text(d, "✦", cb_x + 7, cb_y + 6, font(7, bold=True), fill=(255, 255, 255))
# Callout text
text(d, "M24 扭矩", cb_x + 22, cb_y + 6, font(8, bold=True), fill=(14, 107, 61))
text(d, "≥ 800 N·m", cb_x + 22, cb_y + 16, font(7), fill=(14, 107, 61))

# KB Plugin floating chip (top-right)
kx, ky, kw, kh = cx + cw - 100, cy + 44, 86, 22
d.rounded_rectangle([kx, ky, kx + kw, ky + kh], radius=11, fill=BLUE_BG, outline=BLUE)
d.ellipse([kx + 6, ky + 5, kx + 16, ky + 15], fill=BLUE)
text(d, "K", kx + 8, ky + 6, font(8, bold=True), fill=(255, 255, 255))
text(d, "KB Plugin ✓", kx + 20, ky + 6, font(8, bold=True), fill=BLUE)

# Status bar
sb_x, sb_y = cx + 14, cy + ch - 22
text(d, "●", sb_x, sb_y - 2, font(10), fill=GREEN)
text(d, "knowledge synced · 2026-03-18 14:22", sb_x + 14, sb_y, font(8), fill=INK2)

img.save(OUT, optimize=True)
print("Saved:", OUT)