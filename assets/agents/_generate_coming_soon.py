#!/usr/bin/env python3
"""Generate a 'Coming Soon' placeholder illustration that matches the
style of the other 5 agent images (800x336, cream background, soft green
flowing lines watermark, then dashed circles and 'coming soon' text in
the center)."""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 800, 336
BG = (250, 249, 245)
INK = (58, 58, 54)
INK2 = (138, 138, 130)
GREEN = (123, 208, 163)

OUT = "/Users/st/agent-portal/assets/agents/agent-6-coming-soon.png"


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
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


def draw_text(d, text, x, y, font, fill=INK):
    d.text((x, y), text, fill=fill, font=font)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# 1. Soft green flowing lines (same as other 5)
for y0, amp, freq in [(60, 80, 0.012), (90, 60, 0.015), (130, 100, 0.010)]:
    pts = []
    for x in range(-20, W + 20, 4):
        y = y0 + amp * (0.5 + 0.5 * (x * freq % 1 - 0.5))
        y += 20 * (x * 0.013 % 1 - 0.5)
        pts.append((x, y))
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=GREEN, width=1)

# 2. Three dashed concentric circles
cx, cy = W // 2, H // 2
for r in (110, 90, 70):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(188, 186, 176), width=1)

# 3. Big "+" symbol
arm = 40
gap = 10
d.line([(cx - arm, cy), (cx - gap, cy)], fill=INK2, width=6)
d.line([(cx + gap, cy), (cx + arm, cy)], fill=INK2, width=6)
d.line([(cx, cy - arm), (cx, cy - gap)], fill=INK2, width=6)
d.line([(cx, cy + gap), (cx, cy + arm)], fill=INK2, width=6)

# 4. Text below: "更多智能体 · 敬请期待"
f1 = font(20, bold=True)
f2 = font(13)
title = "更多智能体 即将上线"
subtitle = "智能体协调员 · 自定义智能体 · 团队空间"
bbox1 = d.textbbox((0, 0), title, font=f1)
bbox2 = d.textbbox((0, 0), subtitle, font=f2)
draw_text(d, title,    cx - (bbox1[2] - bbox1[0]) // 2, cy + 90, f1, fill=INK)
draw_text(d, subtitle, cx - (bbox2[2] - bbox2[0]) // 2, cy + 122, f2, fill=INK2)

img.save(OUT, optimize=True)
print("Saved:", OUT)