# 招聘助手优化实施计划

## 概述

优化招聘助手 Chrome 扩展，修复功能问题、增强配置能力、优化用户界面。

**状态：已完成 ✅**

---

## 阶段一：功能修复 ✅

### 1.1 页面检测修复 ✅

**目标**：正确识别智联招聘的搜索列表页、简历详情页、潜在人才页。

**任务**：
- [x] 更新 `src/content/platforms/zhilian.ts` 的 `isTargetPage` 方法
  - 支持路径：`/app/search`、`/app/search?resumeNumber=`、`/app/potential`
- [x] 更新 `src/popup/index.ts` 的 `checkCurrentPage` 函数
  - 使用更精确的 URL 匹配逻辑
  - 添加对三个页面的支持提示
- [x] 更新 `src/content/index.tsx` 的平台检测逻辑
  - 确保在目标页面正确初始化

**验证**：
- 在三个目标页面打开 popup，显示正确的页面状态
- 侧边栏在三个页面都能正常加载

---

### 1.2 设置页面修复 ✅

**目标**：点击设置按钮能正确打开设置页面。

**任务**：
- [x] 检查构建输出中 options 页面的实际路径
- [x] 更新 `src/options/index.html` 和 `src/popup/index.html` 脚本引用
  - 将 `options.js` 改为 `./index.ts` type="module"
- [x] 确保 CRXJS 正确编译脚本

**验证**：
- 点击 popup 中的"设置"按钮，能打开设置页面
- 设置页面能正确加载和保存配置

---

### 1.3 自定义 AI 配置增强 ✅

**目标**：支持自定义 API 地址，适配讯飞 MaaS 等第三方服务。

**任务**：
- [x] 更新 `src/types/settings.ts`
  - 在 `AIConfig` 接口添加 `customBaseUrl?: string` 字段
  - 更新 `DEFAULT_SETTINGS` 添加默认值
- [x] 更新 `src/services/ai-provider/index.ts`
  - 修改 `getBaseUrl` 方法，当 provider 为 `custom` 时使用 `customBaseUrl`
- [x] 更新 `src/sidebar/SettingsPanel.tsx`
  - 添加自定义 API 地址输入框
  - 当选择"自定义"时显示该输入框
- [x] 更新 `src/options/index.ts`
  - 添加自定义 API 地址的加载和保存逻辑
- [x] 更新 `src/options/index.html`
  - 添加自定义 API 地址输入框

**验证**：
- 选择"自定义"提供商时，显示 API 地址输入框
- 输入讯飞 MaaS 地址后能正常调用 API

---

## 阶段二：功能增强 ✅

### 2.1 JD 管理功能 ✅

**目标**：在侧边栏内添加 JD（职位画像）管理功能。

**任务**：
- [x] 创建 `src/sidebar/JDManager.tsx` 组件
  - JD 列表展示（名称、创建时间）
  - 添加新 JD 按钮
  - 编辑 JD 功能
  - 删除 JD 功能（带确认）
- [x] 更新 `src/sidebar/JDSelector.tsx`
  - 添加"管理 JD"按钮
  - 点击后切换到 JDManager 视图
- [x] 更新 `src/sidebar/index.tsx`
  - 添加 `jdManager` 视图模式
  - 集成 JDManager 组件
- [x] 检查 `src/stores/jds.ts`
  - 确保 `addJD`、`updateJD`、`deleteJD` 方法存在且正确
- [x] 检查 `src/services/storage.ts`
  - 确保 JD 的 CRUD 操作完整

**验证**：
- 能在侧边栏添加新的 JD
- 能编辑和删除现有 JD
- JD 数据持久化正确

---

## 阶段三：样式优化 ✅

### 3.1 轻量友好风格 ✅

**目标**：将侧边栏样式优化为轻量友好风格。

**设计规范**：
- 主色调：绿色系 `#10b981`（翠绿）
- 强调色：橙色 `#f59e0b`
- 背景色：`#f9fafb`（浅灰）
- 卡片背景：`#ffffff`
- 圆角：`8px`（小元素）、`12px`（卡片）
- 阴影：`0 1px 3px rgba(0,0,0,0.1)`
- 过渡：`0.2s ease`

**任务**：
- [x] 重构 `src/content/styles/main.css`
  - 更新颜色变量
  - 优化侧边栏容器样式
  - 优化候选人卡片样式
  - 优化按钮样式
  - 优化表单元素样式
  - 添加过渡动画
- [x] 更新 `src/sidebar/Header.tsx`
  - 调整布局和样式类名
- [x] 更新 `src/sidebar/JDSelector.tsx`
  - 优化下拉选择器样式
- [x] 更新 `src/sidebar/CandidateList.tsx`
  - 优化候选人卡片样式
- [x] 更新 `src/sidebar/CandidateDetail.tsx`
  - 优化详情页样式
- [x] 更新 `src/sidebar/SettingsPanel.tsx`
  - 优化设置面板样式
- [x] 更新 `src/sidebar/JDManager.tsx`
  - 应用新样式

**验证**：
- 侧边栏整体风格统一、友好
- 交互反馈清晰（hover、active 状态）
- 在目标页面测试无样式冲突

---

## 执行顺序

1. **阶段一**：功能修复（优先级最高）
   - 1.1 页面检测修复
   - 1.2 设置页面修复
   - 1.3 自定义 AI 配置增强

2. **阶段二**：功能增强
   - 2.1 JD 管理功能

3. **阶段三**：样式优化
   - 3.1 轻量友好风格

---

## 文件变更清单

| 文件 | 操作 | 状态 |
|------|------|------|
| `src/types/settings.ts` | 修改 | ✅ |
| `src/services/ai-provider/index.ts` | 修改 | ✅ |
| `src/popup/index.ts` | 修改 | ✅ |
| `src/content/index.tsx` | 检查 | ✅ 无需修改 |
| `src/content/platforms/zhilian.ts` | 修改 | ✅ |
| `src/content/styles/main.css` | 重写 | ✅ |
| `src/sidebar/index.tsx` | 修改 | ✅ |
| `src/sidebar/Header.tsx` | 检查 | ✅ 无需修改 |
| `src/sidebar/JDSelector.tsx` | 修改 | ✅ |
| `src/sidebar/CandidateList.tsx` | 检查 | ✅ 无需修改 |
| `src/sidebar/CandidateDetail.tsx` | 检查 | ✅ 无需修改 |
| `src/sidebar/SettingsPanel.tsx` | 修改 | ✅ |
| `src/sidebar/JDManager.tsx` | 新建 | ✅ |
| `src/options/index.ts` | 修改 | ✅ |
| `src/options/index.html` | 修改 | ✅ |
| `src/popup/index.html` | 修改 | ✅ |
| `src/stores/jds.ts` | 检查 | ✅ 无需修改 |
| `src/services/storage.ts` | 检查 | ✅ 无需修改 |
| `public/manifest.json` | 检查 | ✅ 无需修改 |
