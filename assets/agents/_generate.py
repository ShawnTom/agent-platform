#!/usr/bin/env python3
"""Generate placeholder illustrations for the 5 agents on the home page.

The style mirrors the reference example: a soft cream background, faint
green flowing lines as a watermark, a query bubble + an answer card /
scene specific to each agent. Images are saved as .png so the user can
replace them later with their own artwork.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 800, 336
BG = (250, 249, 245)         # #faf9f5 — matches the cream site palette
INK = (58, 58, 54)            # #3a3a36
INK2 = (138, 138, 130)        # #8a8a82
RULE = (217, 214, 204)        # #d9d6cc
RULE_SOFT = (234, 231, 218)   # #eae7da
SURFACE = (255, 255, 255)
GREEN = (0, 166, 81)
GREEN_LT = (123, 208, 163)
GREEN_BG = (233, 245, 238)
ORANGE = (229, 138, 42)

OUT_DIR = "/Users/st/agent-portal/assets/agents"

# ---- shared drawing helpers ----------------------------------------------------

def bg_canvas():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)


def flowing_lines(draw):
    """Soft green flowing-line watermark across the canvas."""
    for y0, amp, freq in [(60, 80, 0.012), (90, 60, 0.015), (130, 100, 0.010)]:
        pts = []
        for x in range(-20, W + 20, 4):
            y = y0 + amp * (0.5 + 0.5 * (x * freq % 1 - 0.5))
            y += 20 * (x * 0.013 % 1 - 0.5)
            pts.append((x, y))
        for i in range(len(pts) - 1):
            draw.line([pts[i], pts[i + 1]], fill=(123, 208, 163), width=1)


def rounded_rect(d, xy, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def query_bubble(d, x, y, text):
    """User query bubble on the left side."""
    # Avatar
    d.ellipse([x, y, x + 30, y + 30], fill=SURFACE, outline=RULE)
    d.ellipse([x + 10, y + 7, x + 20, y + 17], fill=(188, 186, 176))
    d.pieslice([x + 4, y + 14, x + 26, y + 36], 180, 360, fill=(188, 186, 176))
    # Bubble
    bx, by, bw, bh = x + 38, y - 6, 300, 50
    rounded_rect(d, [bx, by, bx + bw, by + bh], 10, fill=SURFACE, outline=RULE)
    # Pointer triangle
    d.polygon([(bx - 8, by + 16), (bx, by + 22), (bx, by + 30)], fill=SURFACE)
    d.line([(bx - 8, by + 16), (bx, by + 22), (bx, by + 30)], fill=RULE, width=1)
    # Text (try to load a CJK font; fall back to default)
    font = _font(15)
    draw_text_wrapped(d, text, bx + 14, by + 12, bw - 28, font, fill=INK)


def answer_card(d, x, y, w, h, headline, lines, accent=GREEN, badge="✓"):
    """A cream-tinted answer card with a small accent badge + summary lines."""
    rounded_rect(d, [x, y, x + w, y + h], 10, fill=(250, 249, 245), outline=accent, width=2)
    # Badge dot
    d.ellipse([x + 14, y + 14, x + 30, y + 30], fill=accent)
    # Badge check
    draw_check(d, x + 17, y + 17, 8, color=(255, 255, 255))
    # Headline
    font_h = _font(11, bold=True)
    draw_text(d, headline, x + 38, y + 14, font_h, fill=accent)
    # Body lines (decorative bars)
    line_y = y + 34
    for line_w in lines:
        d.rounded_rectangle([x + 14, line_y, x + 14 + line_w, line_y + 5], radius=2,
                            fill=(212, 210, 197))
        line_y += 9


def draw_check(d, cx, cy, size, color):
    d.line([(cx, cy + size * 0.4),
            (cx + size * 0.35, cy + size * 0.75),
            (cx + size, cy)], fill=color, width=2)


def _font(size, bold=False):
    """Best-effort CJK font; falls back to PIL default."""
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


def draw_text(d, text, x, y, font, fill=INK):
    d.text((x, y), text, fill=fill, font=font)


def draw_text_wrapped(d, text, x, y, max_w, font, fill=INK, line_spacing=4):
    """Naive CJK-friendly wrap: break on Chinese chars, English by spaces."""
    chars = list(text)
    line, cur_w = "", 0
    yy = y
    for ch in chars:
        bbox = font.getbbox(line + ch)
        w = bbox[2] - bbox[0]
        if w > max_w and line:
            draw_text(d, line, x, yy, font, fill=fill)
            yy += font.size + line_spacing
            line, cur_w = ch, font.getbbox(ch)[2] - font.getbbox(ch)[0]
        else:
            line += ch
    if line:
        draw_text(d, line, x, yy, font, fill=fill)


def paper_frame(d, x, y, w, h, title="风轮叶片制造图纸检索结果", meta=None):
    """Big paper-like canvas (the visual centerpiece)."""
    rounded_rect(d, [x, y, x + w, y + h], 10, fill=SURFACE, outline=RULE)
    # Title bar
    rounded_rect(d, [x, y, x + w, y + 26], 10, fill=(243, 246, 250), outline=(243, 246, 250))
    d.rectangle([x, y + 16, x + w, y + 26], fill=(243, 246, 250))
    # Title text
    font_t = _font(13, bold=True)
    draw_text(d, title, x + 12, y + 6, font_t, fill=INK)
    if meta:
        font_m = _font(9)
        bbox = font_m.getbbox(meta)
        draw_text(d, meta, x + w - bbox[2] - 12, y + 8, font_m, fill=INK2)


def wind_turbine_blade(d, cx, cy, scale=1.0, color=GREEN):
    """Draw a simple 3-bladed wind turbine viewed from front."""
    # Hub
    hub_r = int(8 * scale)
    d.ellipse([cx - hub_r, cy - hub_r, cx + hub_r, cy + hub_r], fill=color)
    d.ellipse([cx - int(hub_r * 0.5), cy - int(hub_r * 0.5),
               cx + int(hub_r * 0.5), cy + int(hub_r * 0.5)], fill=(255, 255, 255))

    def blade():
        pts = [
            (0, 0),
            (int(20 * scale), int(-4 * scale)),
            (int(36 * scale), int(-20 * scale)),
            (int(48 * scale), int(-50 * scale)),
            (int(56 * scale), int(-64 * scale)),
            (int(46 * scale), int(-58 * scale)),
            (int(28 * scale), int(-46 * scale)),
            (int(10 * scale), int(-22 * scale)),
        ]
        return [(cx + x, cy + y) for (x, y) in pts]

    for angle in (0, 120, 240):
        # Rotate around (cx, cy)
        import math
        rad = math.radians(angle)
        rot = []
        for px, py in blade():
            dx, dy = px - cx, py - cy
            rx = dx * math.cos(rad) - dy * math.sin(rad)
            ry = dx * math.sin(rad) + dy * math.cos(rad)
            rot.append((cx + rx, cy + ry))
        d.polygon(rot, fill=(233, 245, 238), outline=color)


# ---- per-agent illustrations ----------------------------------------------------

def agent1_knowledge():
    """Knowledge assistant — query + blade blueprint + summary card."""
    img, d = bg_canvas()
    flowing_lines(d)
    query_bubble(d, 30, 60, "帮我查一下风轮叶片的制造图纸")
    answer_card(d, 80, 130, 320, 100,
                headline="已找到 1 份相关图纸与说明",
                lines=[260, 200, 230, 180])

    # Big paper — blade drawing
    px, py, pw, ph = 430, 30, 340, 280
    paper_frame(d, px, py, pw, ph,
                title="风轮叶片制造图纸检索结果",
                meta="BL-2026-018 · Rev.04")
    # Subtle grid
    for gx in range(px + 16, px + pw, 40):
        for gy in range(py + 36, py + ph - 12, 28):
            d.line([(gx, py + 36), (gx, py + ph - 12)], fill=RULE_SOFT, width=0)
    for gy in range(py + 36, py + ph - 12, 28):
        d.line([(px + 16, gy), (px + pw - 16, gy)], fill=RULE_SOFT, width=0)

    # Blade in the centre of the paper
    wind_turbine_blade(d, px + pw // 2, py + ph // 2 + 10, scale=1.6)

    # Meta info strip
    meta_y = py + ph - 60
    font_m = _font(11)
    rows = [
        ("图纸编号", "BL-2026-018"),
        ("部件名称", "风轮叶片"),
        ("版本", "V3.2"),
        ("最近更新", "2026 年 3 月"),
    ]
    for i, (k, v) in enumerate(rows):
        yy = meta_y + i * 11
        draw_text(d, k, px + 16, yy, font_m, fill=INK2)
        draw_text(d, v, px + 80, yy, font_m, fill=INK)

    img.save(f"{OUT_DIR}/agent-1-knowledge.png", optimize=True)


def agent2_quality():
    """Quality root-cause — query + line-chart with anomaly marker."""
    img, d = bg_canvas()
    flowing_lines(d)
    query_bubble(d, 30, 50, "14:22 那批齿轮箱异响，原因是什么？")
    answer_card(d, 80, 120, 320, 100,
                headline="定位到 2 项共因 · 建议先排查润滑压力",
                lines=[260, 180, 220])

    # Right side — chart card
    px, py, pw, ph = 430, 30, 340, 280
    paper_frame(d, px, py, pw, ph,
                title="关键参数 24 小时趋势",
                meta="Param: lube-pressure · 0.1s")
    # Chart axes
    cx0, cy0 = px + 20, py + ph - 36
    cx1, cy1 = px + pw - 20, py + 50
    d.line([(cx0, cy0), (cx1, cy0)], fill=INK, width=1)  # x-axis
    d.line([(cx0, cy0), (cx0, cy1)], fill=INK, width=1)  # y-axis
    # Grid
    for gy in range(cy1, cy0, 20):
        d.line([(cx0, gy), (cx1, gy)], fill=RULE_SOFT, width=1)
    # Baseline line
    pts = [(x, cy0 - 30 + (i % 3 - 1) * 4) for i, x in enumerate(range(cx0, cx1, 5))]
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=(188, 186, 176), width=1)
    # Spike
    spike_x = cx0 + int((cx1 - cx0) * 0.55)
    spike_pts = [(cx0, cy0 - 32), (cx0 + 60, cy0 - 36),
                 (spike_x - 10, cy0 - 30), (spike_x, cy0 - 110),
                 (spike_x + 20, cy0 - 50), (spike_x + 60, cy0 - 60), (cx1, cy0 - 40)]
    for i in range(len(spike_pts) - 1):
        d.line([spike_pts[i], spike_pts[i + 1]], fill=ORANGE, width=2)
    # Anomaly marker
    d.ellipse([spike_x - 6, cy0 - 116, spike_x + 6, cy0 - 104], fill=GREEN)
    d.line([(spike_x, cy0 - 116), (spike_x, py + 50)], fill=GREEN, width=1)
    # Anomaly label
    rounded_rect(d, [spike_x - 38, py + 36, spike_x + 42, py + 58], 10,
                fill=SURFACE, outline=GREEN)
    font_lab = _font(10)
    draw_text(d, "Root cause · 14:22", spike_x - 30, py + 41, font_lab, fill=(14, 107, 61))

    img.save(f"{OUT_DIR}/agent-2-quality.png", optimize=True)


def agent3_meeting():
    """Meeting minutes — query + meeting timeline."""
    img, d = bg_canvas()
    flowing_lines(d)
    query_bubble(d, 30, 50, "整理一下今天风电例会的内容")
    answer_card(d, 80, 120, 320, 100,
                headline="已生成 4 项待办 · 2 项风险",
                lines=[260, 200, 240, 180])

    # Right side — meeting window card
    px, py, pw, ph = 430, 30, 340, 280
    paper_frame(d, px, py, pw, ph,
                title="Q2 风电机型评审 · 会议纪要",
                meta="2026-03-18 · 14:00-15:30")
    # Window dots
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([px + 12 + i * 14, py + 6, px + 12 + i * 14 + 8, py + 14], fill=c)

    # Section: 待办
    font_t = _font(11, bold=True)
    draw_text(d, "● 待办事项", px + 14, py + 30, font_t, fill=GREEN)
    items = [
        ("叶片模具图纸会签",  "王工",   "本周五"),
        ("塔筒焊接工艺确认",  "李工",   "下周一"),
        ("振动数据周报模板",  "陈博",   "本周三"),
        ("现场测试方案评审",  "团队",   "下周二"),
    ]
    font_i = _font(10)
    yy = py + 48
    for label, owner, due in items:
        d.rectangle([px + 14, yy + 4, px + 18, yy + 8], fill=GREEN)
        draw_text(d, label, px + 24, yy, font_i, fill=INK)
        draw_text(d, owner, px + 200, yy, font_i, fill=INK2)
        draw_text(d, due,   px + 250, yy, font_i, fill=ORANGE)
        yy += 18

    # Section: 风险
    yy += 8
    draw_text(d, "▲ 风险提示", px + 14, yy, font_t, fill=ORANGE)
    risks = [
        ("叶片原材料交付延期 3 天", "供应链"),
        ("测试场地需重新预约",      "行政"),
    ]
    yy += 18
    for label, owner in risks:
        d.rectangle([px + 14, yy + 4, px + 18, yy + 8], fill=ORANGE)
        draw_text(d, label, px + 24, yy, font_i, fill=INK)
        draw_text(d, owner, px + 220, yy, font_i, fill=INK2)
        yy += 16

    img.save(f"{OUT_DIR}/agent-3-meeting.png", optimize=True)


def agent4_mes():
    """MES integration — query + process flow diagram."""
    img, d = bg_canvas()
    flowing_lines(d)
    query_bubble(d, 30, 50, "把今天的工艺变更同步到 MES")
    answer_card(d, 80, 120, 320, 100,
                headline="已生成工艺包 v12 · 同步 3 台设备",
                lines=[260, 220, 200])

    # Right side — process flow
    px, py, pw, ph = 430, 30, 340, 280
    paper_frame(d, px, py, pw, ph,
                title="工艺包生成 · P-2026-03",
                meta="Auto-sync · 3 devices")
    # Pipeline stages
    stages = [
        ("变更检测",   GREEN),
        ("工艺汇总",   (31, 159, 91)),
        ("MES 同步",   (123, 208, 163)),
        ("完成",       (188, 186, 176)),
    ]
    node_w, node_h = 60, 38
    gap = (pw - 40 - node_w * len(stages)) // (len(stages) - 1)
    yy = py + ph // 2 - node_h // 2 + 8
    xs = []
    for i, (label, color) in enumerate(stages):
        x = px + 20 + i * (node_w + gap)
        xs.append(x)
        rounded_rect(d, [x, yy, x + node_w, yy + node_h], 8, fill=SURFACE, outline=color, width=2)
        d.ellipse([x + 8, yy + 6, x + 18, yy + 16], fill=color)
        draw_check(d, x + 10, yy + 8, 8, color=(255, 255, 255))
        font_s = _font(10)
        draw_text(d, label, x + 22, yy + 13, font_s, fill=INK)
    # Arrows between
    for i in range(len(xs) - 1):
        x_a = xs[i] + node_w + 2
        x_b = xs[i + 1] - 2
        ay = yy + node_h // 2
        d.line([(x_a, ay), (x_b - 4, ay)], fill=INK2, width=1)
        d.polygon([(x_b, ay), (x_b - 6, ay - 3), (x_b - 6, ay + 3)], fill=INK2)

    # Status list
    yy = py + ph - 70
    font_m = _font(10)
    rows = [("• 设备 #A1 — OK", GREEN),
            ("• 设备 #A2 — OK", GREEN),
            ("• 设备 #B2 — pending", INK2)]
    for t, c in rows:
        draw_text(d, t, px + 14, yy, font_m, fill=c)
        yy += 14

    img.save(f"{OUT_DIR}/agent-4-mes.png", optimize=True)


def agent5_contract():
    """Contract review — query + clause comparison."""
    img, d = bg_canvas()
    flowing_lines(d)
    query_bubble(d, 30, 50, "帮我审一下这份采购合同的付款条款")
    answer_card(d, 80, 120, 320, 100,
                headline="识别 3 处风险 · 建议修改 1 项条款",
                lines=[260, 220, 200, 240])

    # Right side — clause comparison
    px, py, pw, ph = 430, 30, 340, 280
    paper_frame(d, px, py, pw, ph,
                title="合同条款对照",
                meta="CT-2026-0034 · 付款条款")
    # Two columns
    col_w = (pw - 30) // 2
    font_t = _font(11, bold=True)
    draw_text(d, "原条款", px + 12, py + 30, font_t, fill=INK2)
    draw_text(d, "建议修改", px + 22 + col_w, py + 30, font_t, fill=GREEN)
    # Clause blocks
    yy = py + 50
    font_c = _font(9)
    clauses = [
        "付款方式：货物到达后 60 日内",
        "违约金：合同总额 5%",
        "验收标准：以买方书面确认为准",
    ]
    for c in clauses:
        rounded_rect(d, [px + 12, yy, px + 12 + col_w - 6, yy + 44], 6,
                    fill=(250, 249, 245), outline=RULE)
        draw_text_wrapped(d, c, px + 18, yy + 8, col_w - 24, font_c, fill=INK)
        # Arrow
        d.line([(px + 12 + col_w - 3, yy + 22),
                (px + 22 + col_w, yy + 22)], fill=GREEN, width=2)
        d.polygon([(px + 22 + col_w, yy + 22),
                   (px + 16 + col_w, yy + 19),
                   (px + 16 + col_w, yy + 25)], fill=GREEN)
        # Suggested box
        rounded_rect(d, [px + 22 + col_w, yy, px + 22 + col_w + col_w - 6, yy + 44], 6,
                    fill=GREEN_BG, outline=GREEN)
        suggested = c.replace("60 日", "30 日").replace("买方书面确认", "第三方检测报告")
        draw_text_wrapped(d, suggested, px + 28 + col_w, yy + 8, col_w - 24, font_c,
                          fill=(14, 107, 61))
        yy += 54

    img.save(f"{OUT_DIR}/agent-5-contract.png", optimize=True)


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    agent1_knowledge()
    agent2_quality()
    agent3_meeting()
    agent4_mes()
    agent5_contract()
    print("Generated 5 agent illustrations →", OUT_DIR)