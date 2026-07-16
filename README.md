# Agent Portal · 智能体中心

一个 Mintlify 风格的 AI 智能体入口页面，参考 [reactbits.dev](https://reactbits.dev) 的高级动效。

## 效果

- 🌊 **Hero 区域**：3 层正弦波动线条（FloatingLines 风格），鼠标移动会让附近线条弯折
- 💎 **智能体卡片**：CSS conic-gradient 实现的 Border Glow，鼠标悬停时绿色光晕跟随指针
- 🎨 **配色**：蓝色品牌色（`#1565c0` / `#0d4a96`）+ 绿色交互色（`#00a651`），米色背景
- ✏️ **字体**：InstrumentSans + InstrumentSerif（衬线斜体点缀大标题）

## 技术栈

- 纯静态 HTML（无构建步骤）
- 外部 CSS + JS 文件，按功能模块拆分
- API 服务层（stub 实现，后端就绪后替换）
- 本地字体（InstrumentSans / InstrumentSerif）

## 目录结构

```
agent-portal/
├── index.html                 # 主页面（HTML 结构）
├── _shared/
│   ├── css/
│   │   └── styles.css         # 全部样式（含 @font-face）
│   ├── js/
│   │   ├── config.js          # 全局配置（API 地址、存储键名）
│   │   ├── api.js             # API 服务层（stub，后端对接后替换）
│   │   ├── main.js            # Tab 切换
│   │   ├── skills.js          # 技能与工具页面逻辑
│   │   ├── admin.js           # 管理员登录逻辑
│   │   └── hero-lines.js      # Hero 区域 Canvas 动画
│   └── fonts/                 # 本地字体
│       ├── InstrumentSans-Regular.ttf
│       ├── InstrumentSans-Bold.ttf
│       ├── InstrumentSerif-Regular.ttf
│       └── InstrumentSerif-Italic.ttf
├── assets/
│   └── agents/                # 智能体卡片插图
├── vercel.json                # Vercel 部署配置
└── README.md
```

## 后端对接指南

### 1. 修改 API 地址

编辑 `_shared/js/config.js`，设置 `apiBase` 为后端地址：

```js
const APP_CONFIG = {
  apiBase: 'http://localhost:3000',  // 后端地址
  apiPrefix: '/api/v1',
  // ...
};
```

也可通过 URL 参数临时覆盖：`http://localhost:8765/index.html?api=http://localhost:3000`

### 2. 替换 API stub

`_shared/js/api.js` 中每个方法都有对应的 TODO 注释，将 mock 实现替换为真实 `fetch` 调用即可：

```js
// Before (stub)
async getAgents() {
  return [];
}

// After (real)
async getAgents() {
  return this._request('/agents');
}
```

### 3. 需要实现的后端接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/v1/agents` | 智能体列表 |
| GET  | `/api/v1/agents/:id` | 智能体详情 |
| GET  | `/api/v1/skills` | 技能列表（支持 filter/sort/query 参数） |
| GET  | `/api/v1/skills/:id` | 技能详情 |
| POST | `/api/v1/chat/send` | 发送聊天消息 |
| POST | `/api/v1/auth/login` | 管理员登录 |
| POST | `/api/v1/auth/logout` | 登出 |
| PUT  | `/api/v1/user/favorites` | 同步收藏列表 |

### 4. 认证

登录成功后，`api.js` 的 `_request` 方法会自动从 localStorage 读取 token 并附加到请求头：

```
Authorization: Bearer <token>
```

## 本地预览

```bash
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

## 浏览器兼容性

- ✅ Chrome / Edge / Safari 最新版
- ✅ Firefox 最新版
- ⚠️ 不支持 IE（用了 `conic-gradient`、`mask-composite` 等现代特性）
