# Bad Apple!! In-Browser Easter Egg 🍎

> **万物皆可 Bad Apple!!**
> 将网页活体博文文字撕裂脱离页面，沿四阶减速三维旋涡流场疾驰，严丝合缝拼合为博丽灵梦剪影；前奏鼓点引爆脉冲冲击波，同帧无缝接棒 60 FPS 动态汉字流与全息透明双模态起舞！

[![npm version](https://img.shields.io/npm/v/bad-apple-easter-egg.svg?style=flat-square)](https://www.npmjs.com/package/bad-apple-easter-egg)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![bundle size](https://img.shields.io/badge/bundle%20size-~8KB%20(gzipped)-success?style=flat-square)](./dist)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](./package.json)

---

## ✨ 核心亮点 (Features)

- 🌀 **活体博文文字流变粒子系统 (Live DOM Text Vortex)**
  - 拒绝预制静态字库，实时萃取视口内博文标题、段落与代码字符。
  - 四阶减速曲线（Quartic Ease-Out），平滑贴合目标坐标，零生硬定格顿挫。
  - 1:1 字符序号深度锁相（`corpus[i % corpus.length]`），粒子归位到点阵矩阵瞬间 **0 字符跳变**。
- 🪟 **全息透明剪影双模态 (Dual Modes)**
  - **模式 1：汉字矩阵文字流 (`matrix`)**：页面文字脱离暗化，暗黑舞台中万千汉字沿鼓点跃动。
  - **模式 2：全息透明剪影 (`silhouette`)**：博客背景 100% 完整透出，32 位像素级通道抠像，人物直接在博文上方奔跑。
- ⚡ **极致性能与 60 FPS 锁相**
  - 提前 400ms 离屏预热 GPU 纹理缓存，彻底消灭切入正片瞬间的 GPU-to-CPU 读回卡顿。
  - 汇聚落拍处同帧向下贯穿渲染，消灭 1 帧黑屏闪烁。
  - 350ms 脉冲冲击波光环伴随前奏鼓点优雅扩散。
- 🛡️ **优雅退场与零页面污染**
  - 按下 `ESC` 或点击屏幕任意位置，400ms 优雅淡出复原，滚动位置与 DOM 样式完全保留。
- 📦 **零运行时依赖 (Zero Dependencies)**
  - 原生 TypeScript 编写，无任何第三方运行时库，Gzip 后仅约 8 KB。
  - 内置样式自注入机制，普通 HTML `<script>` 标签无需额外配置 `<link>` 即可开箱即用。

---

## ⚠️ 播放必要要求与排坑指南 (Prerequisites & Gotchas)

> [!IMPORTANT]
> **为了避免“在我电脑上能跑，别人拉下来却无法播放”的兼容性问题，请务必仔细阅读以下浏览器规范：**

### 1. 浏览器自动播放限制 (Autoplay Policy & User Gesture)
- **规则**：现代浏览器（Chrome、Edge、Safari、Firefox）为防止骚扰用户，**严格禁止未经用户手势交互的有声媒体自动播放**。
- **最佳实践**：本库默认设计为 **多连击彩蛋（例如 5 连击头像或昼夜按钮）**。用户的多击行为会被浏览器认定为合法的用户手势（User Gesture），从而允许以 0.8 音量秒起播放。
- **若需代码主动调用**：若在网页加载时未经任何点击直接调用 `startBadApple()`，浏览器控制台会拦截并输出 `NotAllowedError`。如需免交互测试，可设置 `{ volume: 0 }` 静音起播。

### 2. Canvas 跨域安全策略 (CORS & Tainted Canvas)
- **规则**：库中的汉字矩阵与剪影算法依赖 `ctx.getImageData()` 提取视频帧像素。
- **跨域风险**：如果视频存放在外部 CDN 或不同域名的 OSS/COS 上，服务器响应头**必须包含 `Access-Control-Allow-Origin: *`**。否则，浏览器将触发安全拦截并报错：
  ```text
  DOMException: Failed to execute 'getImageData' on 'CanvasRenderingContext2D':
  The canvas has been tainted by cross-origin data.
  ```
- **强烈推荐方案**：将视频文件下载到您网站自身的静态资源目录中（如 `/public/media/bad-apple.mp4`）。**同源加载 100% 杜绝跨域问题，且无外链带宽限制或防盗链阻断**。

### 3. 视频编码规格要求 (Video Codec Compatibility)
如果自行准备或转码 Bad Apple 视频，请务必使用以下通用工业标准：
- **容器格式**：`.mp4`
- **视频编码**：**H.264 / AVC (High Profile, YUV420p 像素格式)**
- **音频编码**：**AAC (44.1kHz / 48kHz 立体声)**
- **推荐分辨率**：`480x360` 或 `640x480`（兼顾极低体积与 60 FPS 流畅提取）
- **避坑提示**：
  - ❌ 严禁使用 WebM (VP8/VP9/AV1) 或 H.265/HEVC：iOS Safari 与部分微信/QQ 内置 WebView 无法硬解。
  - ❌ 严禁使用 YUV444p 色彩空间：大多数硬件解码芯片不支持，会导致黑屏。
  - 💡 **FFmpeg 标准转码命令**：
    ```bash
    ffmpeg -i input.mp4 -c:v libx264 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart bad-apple.mp4
    ```

### 4. DOM 文字密度说明
- 汉字点阵由 1427 个字符点构成。若宿主页面文字极少（如空白页），本库会自动降级使用内置的高能东方歌词作为文本语料，保证粒子风暴的视觉丰满度。

---

## 🚀 快速上手 (Quick Start)

### 方式 1：CDN / 传统 HTML 引入 (极简)
无需配置打包工具，直接在页面底部引入脚本，样式会自动注入：

```html
<!-- 引入 IIFE 单文件 -->
<script src="https://cdn.jsdelivr.net/npm/bad-apple-easter-egg/dist/bad-apple-easter-egg.iife.js"></script>

<script>
  // 一键初始化彩蛋
  BadAppleEasterEgg.init({
    // 推荐提供本地同源视频路径
    videoUrl: '/media/bad-apple.mp4',
    clicks: 5,
  });
</script>
```

默认行为：
- 快速连击页面上的 `#theme-toggle` 按钮 5 次 ➔ 唤醒 **汉字矩阵文字流**
- 快速连击页面上的 `.avatar` 头像 5 次 ➔ 唤醒 **全息透明剪影**

---

### 方式 2：现代前端工程 (Vue / React / Astro / VitePress / Next.js)

1. 安装依赖：
```bash
npm install bad-apple-easter-egg
# 或
pnpm add bad-apple-easter-egg
# 或
yarn add bad-apple-easter-egg
```

2. 在入口文件或主布局组件中引入：
```typescript
import { initBadApple, startBadApple, stopBadApple } from 'bad-apple-easter-egg';
// 样式已包含自动注入逻辑，也可显式导入：
import 'bad-apple-easter-egg/style.css';

// 初始化监听器
const controller = initBadApple({
  videoUrl: '/media/bad-apple.mp4',
  clicks: 5,
  mode: 'matrix', // 'matrix' 或 'silhouette'
  volume: 0.8,
  showToast: true,
  onStart: (mode) => console.log('Bad Apple started:', mode),
  onEnd: () => console.log('Bad Apple exited'),
});

// 也可在任何需要的地方手动触发：
// startBadApple('matrix');
// startBadApple('silhouette');
// stopBadApple();
```

---

## ⚙️ 配置项全览 (API Options)

`initBadApple(options)` 支持的所有配置项：

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `trigger` | `string \| HTMLElement` | `undefined` | 自定义触发元素选择器（若未指定，默认自动绑定昼夜按钮与头像） |
| `clicks` | `number` | `5` | 唤醒彩蛋所需的连续点击次数 |
| `clickTimeout` | `number` | `2200` | 判定连续点击的时间窗口（毫秒） |
| `mode` | `'matrix' \| 'silhouette'` | `'matrix'` | 默认播放模式：`matrix`（文字粒子旋涡）或 `silhouette`（全息透明剪影） |
| `videoUrl` | `string` | 本地/CDN 默认源 | 主视频源 URL（推荐本地同源路径，如 `/media/bad-apple.mp4`） |
| `fallbackVideoUrl` | `string` | jsDelivr CDN 源 | 主视频加载失败时的自动降级备用源 |
| `volume` | `number` | `0.8` | 音量大小（`0.0` 至 `1.0`） |
| `showToast` | `boolean` | `true` | 是否在充能时显示 3/5、4/5 微交互 Toast 提示 |
| `textSelector` | `string` | 常见正文元素 | 动态萃取博文文字的 CSS 选择器 |
| `defaultTextCorpus` | `string` | 内置东方歌词 | 页面文字极少时的备选文字字库 |
| `keyboardControls` | `boolean` | `true` | 是否允许键盘快捷键（`ESC` 退出，`空格` 暂停/播放） |
| `clickToExit` | `boolean` | `true` | 是否允许点击屏幕任意位置退出 |
| `onStart` | `(mode) => void` | `undefined` | 播放启动回调 |
| `onEnd` | `() => void` | `undefined` | 退出复原回调 |
| `onPlayError` | `(error) => void` | `undefined` | 播放异常或被浏览器拦截时的回调 |

---

## 🛠️ 本地开发与体验 Demo

克隆本项目即可立即运行带有真实博文排版与控制面板的独立测试页：

```bash
# 1. 克隆仓库
git clone https://github.com/eryuemu/bad-apple-easter-egg.git
cd bad-apple-easter-egg

# 2. 安装依赖
npm install

# 3. 启动本地开发服务与 Demo
npm run dev

# 4. 构建发布产物
npm run build
```

浏览器打开 `http://localhost:5173`，即可体验：
- 连击昼夜切换按钮 5 次
- 连击博主头像 5 次
- 交互面板一键切换模式与停止

---

## 📄 开源许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。
欢迎 Star、Fork 与在你的个人博客中嵌入！
