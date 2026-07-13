# Agent Portal · 智能体中心

一个 Mintlify 风格的 AI 智能体入口页面，参考 [reactbits.dev](https://reactbits.dev) 的高级动效。

## 效果

- 🌊 **Hero 区域**：3 层正弦波动线条（FloatingLines 风格），鼠标移动会让附近线条弯折
- 💎 **智能体卡片**：CSS conic-gradient 实现的 Border Glow，鼠标悬停时绿色光晕跟随指针
- 🎨 **配色**：绿色品牌色（`#1f9f5b` / `#2db371` / `#7bd0a3`），米色背景
- ✏️ **字体**：InstrumentSans + InstrumentSerif（衬线斜体点缀大标题）

## 技术栈

- 纯静态 HTML（无构建）
- 内联 CSS（CSS variables 主题系统）
- 内联 JS（Canvas 动画 + Border Glow 交互）
- 本地字体（InstrumentSans / InstrumentSerif）

## 本地预览

```bash
# 任何 HTTP 服务器都行
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 部署

### Vercel
1. 在 Vercel 导入这个仓库
2. Framework Preset 选择 **"Other"**
3. 根目录保持默认（`.`）
4. 点击 Deploy

`vercel.json` 已经预设好静态托管配置。

### GitHub Pages
Settings → Pages → Source: `main` branch, root → 保存即可。

## 目录结构

```
agent-portal/
├── index.html              # 主页面
├── _shared/
│   └── fonts/              # 本地字体
│       ├── InstrumentSans-Regular.ttf
│       ├── InstrumentSans-Bold.ttf
│       ├── InstrumentSerif-Regular.ttf
│       └── InstrumentSerif-Italic.ttf
├── vercel.json             # Vercel 部署配置
└── README.md
```

## 浏览器兼容性

- ✅ Chrome / Edge / Safari 最新版
- ✅ Firefox 最新版
- ⚠️ 不支持 IE（用了 `conic-gradient`、`mask-composite` 等现代特性）
