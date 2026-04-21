# 招聘助手

智能筛选候选人，自动打招呼获取简历的浏览器扩展。

## 功能特性

- **智能匹配**: 基于 AI 分析简历与 JD 的匹配度
- **自动筛选**: 快速筛选符合条件的候选人
- **自动打招呼**: 一键发送个性化招呼消息
- **多平台支持**: 支持智联招聘（BOSS 直聘待开发）

## 安装

### 开发模式

1. 安装依赖
```bash
npm install
```

2. 构建项目
```bash
npm run build
```

3. 在 Chrome 中加载扩展
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist` 目录

## 配置

1. 点击扩展图标，进入设置页面
2. 配置 AI 提供商（支持通义千问、OpenAI、智谱 AI、Moonshot）
3. 输入 API Key
4. 创建 JD 画像和消息模板

## 使用

1. 访问智联招聘简历列表页
2. 扩展会自动提取候选人信息
3. 选择 JD 画像进行分析
4. 查看匹配结果，发送招呼

## 技术栈

- Chrome Extension Manifest V3
- React 18 + TypeScript
- Tailwind CSS
- Zustand (状态管理)
- IndexedDB (本地存储)
- Vite (构建工具)

## 项目结构

```
src/
├── background/     # Service Worker
├── content/        # Content Script
│   ├── platforms/  # 平台适配器
│   └── utils/      # DOM 工具
├── popup/          # 弹窗页面
├── options/        # 设置页面
├── sidebar/        # 侧边栏组件
├── services/       # 服务层
│   ├── ai-provider/  # AI 提供者
│   ├── storage.ts    # 存储服务
│   └── matcher.ts    # 匹配服务
├── stores/         # 状态管理
├── types/          # 类型定义
└── utils/          # 工具函数
```

## License

MIT
