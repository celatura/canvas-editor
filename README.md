# Canvas Editor

一款基于 React + Konva.js 的专业在线绘图应用，支持多画布管理、多工具编辑、撤销重做及本地持久化。

## 功能特性

### 🖌️ 绘图模式

- 自由手绘画笔
- 多种画笔样式（实线 / 虚线 / 点线）
- 支持配置颜色、粗细、透明度

### 🧽 橡皮擦模式

- 线性擦除
- 可配置擦除宽度

### 🔲 选择模式

- 点击选择单个对象
- 框选多个对象
- 拖动、缩放、旋转
- Transformer 手柄编辑

### 📝 文本工具

- 添加文本对象
- 双击原位编辑文本
- 支持 Enter 提交、Escape 取消

### 🖼️ 图片支持

- 上传本地图片到画布
- 支持选择后拖动、缩放、旋转

### 🔧 操作栏

- 撤销 / 重做
- 复制 / 删除选区
- 添加文本
- 上传图片
- 清除画布内容
- 导出为 PNG 图片

### 📁 多文件管理

- 多个画布之间自由切换
- 每个画布支持自定义标题
- 新建 / 删除画布
- 导入导出画布文件（JSON 格式）
- localStorage 自动持久化

### 🎨 画布设置

- 自定义背景颜色
- 自定义画布尺寸（宽 / 高）

## 键盘快捷键

| 快捷键 | 功能 |
| --- | --- |
| `D` | 切换到画笔工具 |
| `E` | 切换到橡皮擦工具 |
| `V` | 切换到选择工具 |
| `T` | 切换到文本工具 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Shift + Z` / `Ctrl + Y` | 重做 |
| `Delete` / `Backspace` | 删除选中对象 |

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | React 19 + TypeScript |
| 画布引擎 | Konva.js + react-konva |
| 状态管理 | Zustand |
| 构建工具 | Vite |
| 样式 | Tailwind CSS v4 |
| UI 组件 | shadcn/ui + Lucide React |

## 项目结构

```
src/
├── types/            # 数据模型与类型定义
├── config/           # 常量与默认配置
├── store/            # Zustand 全局状态
│   ├── file-store    #   多文件管理 + 历史记录 + 持久化
│   └── tool-store    #   工具模式 + 画笔/橡皮擦配置
├── hooks/            # 业务 Hooks
│   ├── use-drawing-tool      # 自由绘图
│   ├── use-eraser-tool       # 橡皮擦
│   ├── use-selection-tool    # 选择 + 框选
│   └── use-keyboard-shortcuts# 键盘快捷键
├── components/
│   ├── canvas/       # Konva 画布核心
│   ├── toolbar/      # 工具栏 + 操作栏 + 设置面板
│   ├── panels/       # 文件管理 + 画布设置
│   └── ui/           # shadcn/ui 基础组件
├── lib/              # 工具函数
└── styles/           # 全局样式 + 主题
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 开发设计原则

- 画布逻辑与 UI 逻辑分离
- 组件、状态、工具、数据模型分层清晰
- 所有关键操作支持撤销 / 重做
- 全量 TypeScript，严格类型检查
