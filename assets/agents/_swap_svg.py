#!/usr/bin/env python3
"""Drop the now-unused SVG bodies for agents 4 and 5, leaving just <img>."""
import re
from pathlib import Path

p = Path("/Users/st/agent-portal/index.html")
src = p.read_text(encoding="utf-8")

# Agent 4 — delete the residual SVG block sitting between <img ...> and </div>
# Pattern: from the first "<g fill" after the agent-4 <img> down to the closing </svg>
pat4 = re.compile(
    r'(alt="工艺技术准备[^"]*"\s+loading="lazy"\s+decoding="async">)\s*<g[\s\S]*?</svg>',
    flags=re.MULTILINE,
)
src2, n4 = pat4.subn(r'\1', src, count=1)
assert n4 == 1, f"Agent 4 SVG residual not matched (n={n4})"

# Agent 5 — replace from "<!-- 5 · 智能合同审核 — ... --><div class="agent-card"... <div class="agent-illu"><svg ..."
# down to closing </svg> with the img block.
pat5 = re.compile(
    r'(<!-- 5 · 智能合同审核 — 语义化插图：合同文档 \+ 高亮标注 -->\s*'
    r'<div class="agent-card" onclick="void\(0\)">\s*'
    r'<div class="agent-illu">\s*'
    r')<svg[\s\S]*?</svg>',
    flags=re.MULTILINE,
)
repl5 = (
    '\1<img src="assets/agents/agent-5-contract.png"\n'
    '             alt="智能合同审核 · 帮我审一下这份采购合同的付款条款"\n'
    '             loading="lazy"\n'
    '             decoding="async">'
)
src3, n5 = pat5.subn(repl5, src2, count=1)
assert n5 == 1, f"Agent 5 SVG not matched (n={n5})"

p.write_text(src3, encoding="utf-8")
print(f"Removed Agent 4 SVG body, replaced Agent 5 SVG with <img>.")
print(f"HTML size: {len(src)} → {len(src3)} chars")