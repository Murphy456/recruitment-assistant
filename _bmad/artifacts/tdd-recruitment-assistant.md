# 招聘助手 - 技术设计文档 (TDD)

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | 招聘助手 |
| 版本 | v1.0 MVP |
| 创建日期 | 2026-04-16 |
| 技术栈 | Chrome Extension + React + TypeScript |

---

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        招聘助手浏览器插件架构                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      用户界面层 (UI Layer)                       │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  SidebarPanel  │  ListPageOverlay  │  SettingsPage  │  HistoryPage│  │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      业务逻辑层 (Business Layer)                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  JDManager │  ResumeExtractor │  MatchEngine │  MessageGenerator │   │
│  │  SendQueue │  PreferenceLearner │  HistoryManager               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      平台适配层 (Platform Layer)                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  ZhilianAdapter  │  BossAdapter  │  (可扩展更多平台)             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      基础设施层 (Infrastructure Layer)           │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  AIProvider  │  StorageService  │  Logger  │  EventBus          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **插件框架** | Chrome Extension | Manifest V3 | 浏览器扩展基础 |
| **UI框架** | React | 18.x | 组件化UI开发 |
| **样式** | Tailwind CSS | 3.x | 快速样式开发 |
| **状态管理** | Zustand | 4.x | 轻量级状态管理 |
| **类型检查** | TypeScript | 5.x | 类型安全 |
| **DOM解析** | Cheerio | 1.x | 服务端级DOM操作 |
| **本地存储** | idb | 7.x | IndexedDB封装 |
| **构建工具** | Vite | 5.x | 快速构建 |
| **HTTP请求** | fetch API | - | AI API调用 |

---

## 2. 目录结构

```
recruitment-assistant/
├── src/
│   ├── manifest.json              # Chrome扩展配置
│   ├── background/                # Service Worker
│   │   └── index.ts
│   ├── content/                   # 内容脚本
│   │   ├── index.ts               # 入口
│   │   ├── styles/                # 样式文件
│   │   └── platforms/             # 平台适配器
│   │       ├── base.ts            # 适配器基类
│   │       ├── zhilian.ts         # 智联招聘适配器
│   │       └── boss.ts            # BOSS直聘适配器
│   ├── popup/                     # 弹窗页面
│   │   └── index.tsx
│   ├── options/                   # 设置页面
│   │   └── index.tsx
│   ├── sidebar/                   # 侧边栏组件
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   ├── MatchResult.tsx    # 匹配结果展示
│   │   │   ├── SendQueue.tsx      # 发送队列
│   │   │   ├── JDSelector.tsx     # JD选择器
│   │   │   └── ...
│   │   └── hooks/
│   ├── services/                  # 业务服务
│   │   ├── ai-provider/           # AI服务
│   │   │   ├── index.ts           # 统一接口
│   │   │   ├── openai.ts          # OpenAI实现
│   │   │   ├── qwen.ts            # 通义千问实现
│   │   │   └── zhipu.ts           # 智谱AI实现
│   │   ├── storage.ts             # 存储服务
│   │   ├── logger.ts              # 日志服务
│   │   └── event-bus.ts           # 事件总线
│   ├── stores/                    # 状态管理
│   │   ├── jd-store.ts            # JD画像状态
│   │   ├── queue-store.ts         # 发送队列状态
│   │   ├── settings-store.ts      # 设置状态
│   │   └── history-store.ts       # 历史记录状态
│   ├── utils/                     # 工具函数
│   │   ├── sanitizer.ts           # 数据脱敏
│   │   ├── matcher.ts             # 匹配算法
│   │   └── helpers.ts             # 通用工具
│   └── types/                     # 类型定义
│       ├── jd.ts
│       ├── resume.ts
│       ├── match.ts
│       └── settings.ts
├── public/
│   └── icons/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. 核心模块设计

### 3.1 平台适配器

#### 3.1.1 适配器接口

```typescript
// src/types/platform.ts

interface ResumeData {
  // 基础信息
  basic: {
    name: string;
    age: number;
    gender: string;
    education: string;
    major: string;
    school: string;
    experience: number;
    location: string;
  };
  // 求职意向
  intention: {
    position: string;
    salary: string;
    industry: string;
  };
  // 工作经历
  workHistory: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  // 技能标签
  skills: string[];
  // 自我评价
  selfEvaluation: string;
}

interface PlatformAdapter {
  // 平台名称
  name: string;
  
  // 检测是否在目标页面
  isTargetPage(url: string): boolean;
  
  // 提取列表页候选人简要信息
  extractListItems(): Array<{
    element: HTMLElement;
    basicInfo: Partial<ResumeData>;
  }>;
  
  // 提取详情页完整简历
  extractResumeDetail(): ResumeData;
  
  // 发送打招呼消息
  sendMessage(message: string): Promise<boolean>;
  
  // 检测登录状态
  checkLoginStatus(): boolean;
}
```

#### 3.1.2 智联招聘适配器

```typescript
// src/content/platforms/zhilian.ts

class ZhilianAdapter implements PlatformAdapter {
  name = 'zhilian';
  
  // CSS选择器配置
  private selectors = {
    listPage: {
      container: '.resume-list',
      item: '.resume-item',
      name: '.name',
      position: '.position',
      experience: '.experience',
      education: '.education',
    },
    detailPage: {
      container: '.resume-detail',
      basicInfo: '.basic-info',
      workHistory: '.work-history .item',
      skills: '.skills .tag',
      selfEvaluation: '.self-evaluation',
    },
    messageButton: '.btn-greet',
    messageInput: '.message-input',
    sendButton: '.btn-send',
  };
  
  // API端点配置（用于响应监听）
  private apiEndpoints = {
    resumeDetail: '/api/resume/detail',  // 智联简历详情API
    resumeList: '/api/resume/list',       // 智联简历列表API
  };
  
  isTargetPage(url: string): boolean {
    return url.includes('zhaopin.com');
  }
  
  /**
   * 初始化API响应监听器
   * 借鉴自 get_jobs 项目：通过监听平台API响应获取结构化数据
   * 比DOM解析更稳定，直接获取JSON数据
   */
  initResponseListener(): void {
    // 监听XHR/Fetch请求响应
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // 克隆response以便读取
      const clonedResponse = response.clone();
      
      // 检查是否是目标API
      if (args[0] && typeof args[0] === 'string') {
        const url = args[0];
        if (url.includes(this.apiEndpoints.resumeDetail)) {
          clonedResponse.json().then(data => {
            this.handleResumeDetailResponse(data);
          }).catch(() => {});
        }
      }
      
      return response;
    };
  }
  
  /**
   * 处理简历详情API响应
   * 从API返回的JSON中提取结构化简历数据
   */
  private handleResumeDetailResponse(data: any): ResumeData {
    // 解析API返回的JSON结构
    // 根据智联招聘API格式提取数据
    return {
      basic: {
        name: data.name || '',
        age: data.age || 0,
        gender: data.gender || '',
        education: data.education?.name || '',
        major: data.major?.name || '',
        school: data.school?.name || '',
        experience: data.workYears || 0,
        location: data.city?.name || '',
      },
      intention: {
        position: data.expectPosition || '',
        salary: data.expectSalary || '',
        industry: data.expectIndustry || '',
      },
      workHistory: (data.workExperiences || []).map((exp: any) => ({
        company: exp.companyName || '',
        position: exp.positionName || '',
        duration: exp.workTime || '',
        description: exp.workContent || '',
      })),
      skills: data.skills || [],
      selfEvaluation: data.selfEvaluation || '',
    };
  }
  
  extractListItems(): Array<{...}> {
    // 实现列表页提取逻辑
  }
  
  extractResumeDetail(): ResumeData {
    // 优先使用API监听获取的数据
    // 如果API监听未捕获，则使用DOM解析作为兜底
    if (this.cachedResumeData) {
      return this.cachedResumeData;
    }
    return this.extractFromDOM();
  }
  
  private extractFromDOM(): ResumeData {
    // DOM解析兜底逻辑
    // CSS选择器 + AI兜底
  }
  
  async sendMessage(message: string): Promise<boolean> {
    // 实现发送逻辑
    // 模拟点击 + 输入 + 发送
  }
  
  checkLoginStatus(): boolean {
    // 检测登录态
  }
}
```

---

### 3.2 AI Provider

#### 3.2.1 统一接口

```typescript
// src/services/ai-provider/index.ts

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

interface AIProvider {
  name: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
}

// Provider工厂
function createProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'qwen':
      return new QwenProvider(config);
    case 'zhipu':
      return new ZhipuProvider(config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

#### 3.2.2 通义千问实现

```typescript
// src/services/ai-provider/qwen.ts

class QwenProvider implements AIProvider {
  name = 'qwen';
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'qwen-plus';
  }
  
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          messages: messages,
        },
        parameters: {
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        },
      }),
    });
    
    const data = await response.json();
    return data.output.text;
  }
}
```

---

### 3.3 匹配引擎

#### 3.3.1 列表页粗筛

```typescript
// src/utils/matcher.ts

interface QuickMatchResult {
  score: number;
  tags: string[];
  needDetail: boolean;
}

function quickMatch(
  basicInfo: Partial<ResumeData>,
  jdRequirements: JDRequirements
): QuickMatchResult {
  let score = 0;
  let tags: string[] = [];
  
  // 学历匹配 (25分)
  if (matchEducation(basicInfo.education, jdRequirements.education)) {
    score += 25;
    tags.push('学历匹配');
  }
  
  // 年限匹配 (25分)
  if (matchExperience(basicInfo.experience, jdRequirements.experience)) {
    score += 25;
    tags.push('年限匹配');
  }
  
  // 职位匹配 (25分)
  if (matchPosition(basicInfo.intention?.position, jdRequirements.position)) {
    score += 25;
  }
  
  // 薪资匹配 (25分)
  if (matchSalary(basicInfo.intention?.salary, jdRequirements.salary)) {
    score += 25;
  }
  
  return {
    score,
    tags,
    needDetail: score >= 60,
  };
}
```

#### 3.3.2 详情页深度分析

```typescript
// src/services/match-engine.ts

interface MatchResult {
  score: number;
  hardConditions: {
    education: { match: boolean; reason: string };
    experience: { match: boolean; reason: string };
    major: { match: boolean; reason: string };
  };
  workMatch: {
    score: number;
    highlights: string[];
    gaps: string[];
  };
  skillMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  overall: {
    score: number;
    impression: string;
  };
  tags: string[];
  recommendReason: string;
  concerns: string[];
  interviewQuestions: string[];
}

async function deepMatch(
  resume: ResumeData,
  jd: JDProfile,
  aiProvider: AIProvider
): Promise<MatchResult> {
  // 1. 数据脱敏
  const sanitizedResume = sanitizeResume(resume);
  
  // 2. 构建Prompt
  const prompt = buildMatchPrompt(sanitizedResume, jd);
  
  // 3. 调用AI
  const response = await aiProvider.chat([
    { role: 'system', content: MATCH_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]);
  
  // 4. 解析结果
  return parseMatchResult(response);
}
```

#### 3.3.3 匹配Prompt模板

```typescript
// src/services/prompts/match.ts

const MATCH_SYSTEM_PROMPT = `
你是一位资深HR招聘专家，擅长根据JD画像评估候选人匹配度。
请严格按照评分规则进行评估，确保客观公正。
`;

function buildMatchPrompt(resume: ResumeData, jd: JDProfile): string {
  return `
## JD画像
职位名称: ${jd.name}
学历要求: ${jd.requirements.education}
年限要求: ${jd.requirements.experience}年
专业要求: ${jd.requirements.major.join(', ')}
薪资范围: ${jd.requirements.salary.min}-${jd.requirements.salary.max}K
技能要求: ${jd.requirements.skills.join(', ')}
加分项: ${jd.requirements.plus.join(', ')}
排除条件: ${jd.requirements.exclude.join(', ')}

## 评分规则
- 硬性条件匹配（学历、年限、专业）: ${jd.scoringRule.hardConditions}分
- 工作经历相关性: ${jd.scoringRule.workMatch}分
- 技能匹配度: ${jd.scoringRule.skillMatch}分
- 综合印象: ${jd.scoringRule.overall}分

## 候选人简历
${JSON.stringify(resume, null, 2)}

## 输出要求
请以JSON格式输出匹配结果:
{
  "score": 0-100,
  "hardConditions": {
    "education": { "match": boolean, "reason": string },
    "experience": { "match": boolean, "reason": string },
    "major": { "match": boolean, "reason": string }
  },
  "workMatch": { "score": 0-30, "highlights": string[], "gaps": string[] },
  "skillMatch": { "score": 0-20, "matched": string[], "missing": string[] },
  "overall": { "score": 0-10, "impression": string },
  "tags": string[],
  "recommendReason": string,
  "concerns": string[],
  "interviewQuestions": string[]
}
`;
}
```

#### 3.3.4 打招呼语生成Prompt模板

```typescript
// src/services/prompts/greeting.ts

/**
 * 打招呼语生成Prompt
 * 借鉴自 get_jobs 项目，优化生成逻辑
 */

interface GreetingContext {
  // 招聘者信息
  recruiterName: string;
  recruiterTitle: string;
  companyName: string;
  
  // 候选人信息
  candidateName: string;
  candidatePosition: string;
  candidateHighlights: string[];
  
  // JD信息
  jdName: string;
  jdKeywords: string[];
  
  // 用户配置
  userIntro: string;
  defaultMessage: string;
}

const GREETING_SYSTEM_PROMPT = `
你是一位专业的招聘助手，擅长撰写简洁友好的打招呼语。
请根据候选人信息和职位要求，生成个性化的打招呼消息。
要求：
1. 语言简洁，不超过60字
2. 突出候选人亮点，表达诚意
3. 自然友好，避免模板化
4. 如果候选人不匹配，返回 "false"
`;

function buildGreetingPrompt(context: GreetingContext): string {
  return `
请基于以下信息生成简洁友好的中文打招呼语，不超过60字：

## 招聘者信息
- 姓名：${context.recruiterName}
- 职位：${context.recruiterTitle}
- 公司：${context.companyName}

## 候选人信息
- 姓名：${context.candidateName}
- 当前职位：${context.candidatePosition}
- 亮点：${context.candidateHighlights.join('、')}

## 职位信息
- 职位名称：${context.jdName}
- 关键词：${context.jdKeywords.join('、')}

## 个人介绍
${context.userIntro || '（未提供）'}

## 参考语
${context.defaultMessage}

## 输出要求
- 直接输出打招呼语，不要有任何前缀或解释
- 如果候选人与职位不匹配，仅返回 "false"
`;
}

/**
 * 生成打招呼语
 */
async function generateGreeting(
  context: GreetingContext,
  aiProvider: AIProvider
): Promise<string> {
  const response = await aiProvider.chat([
    { role: 'system', content: GREETING_SYSTEM_PROMPT },
    { role: 'user', content: buildGreetingPrompt(context) },
  ], {
    temperature: 0.7,
    maxTokens: 200,
  });
  
  // 如果AI返回false或包含false，使用默认消息
  if (response.toLowerCase().includes('false')) {
    return context.defaultMessage;
  }
  
  return response.trim();
}
```

---

### 3.4 发送队列

#### 3.4.1 队列管理

```typescript
// src/stores/queue-store.ts

interface QueueItem {
  id: string;
  resumeId: string;
  jdId: string;
  candidateName: string;
  score: number;
  message: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  retryCount: number;
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

interface QueueStore {
  items: QueueItem[];
  isProcessing: boolean;
  
  // Actions
  addItem(item: Omit<QueueItem, 'id' | 'status' | 'retryCount' | 'createdAt'>): void;
  removeItem(id: string): void;
  clearItems(): void;
  
  // 批量操作
  selectAll(): void;
  deselectAll(): void;
  removeSelected(): void;
  
  // 发送处理
  startProcessing(): void;
  stopProcessing(): void;
}
```

#### 3.4.2 安全发送策略

```typescript
// src/services/sender.ts

class SafeSender {
  private config: SendConfig;
  private sentToday: number = 0;
  private lastSentAt: Date | null = null;
  
  async sendNext(queueStore: QueueStore, adapter: PlatformAdapter): Promise<void> {
    const nextItem = queueStore.items.find(i => i.status === 'pending');
    if (!nextItem) return;
    
    // 检查每日上限
    if (this.sentToday >= this.config.dailyLimit) {
      throw new Error('已达到每日发送上限');
    }
    
    // 随机延迟
    const delay = this.getRandomDelay();
    await this.sleep(delay);
    
    // 执行发送
    try {
      queueStore.updateItemStatus(nextItem.id, 'sending');
      const success = await adapter.sendMessage(nextItem.message);
      
      if (success) {
        queueStore.updateItemStatus(nextItem.id, 'sent');
        this.sentToday++;
        this.lastSentAt = new Date();
      } else {
        throw new Error('发送失败');
      }
    } catch (error) {
      queueStore.incrementRetry(nextItem.id);
      if (nextItem.retryCount >= this.config.maxRetry) {
        queueStore.updateItemStatus(nextItem.id, 'failed', error.message);
      }
    }
  }
  
  private getRandomDelay(): number {
    const min = this.config.minInterval * 1000;
    const max = this.config.maxInterval * 1000;
    return Math.random() * (max - min) + min;
  }
}
```

---

### 3.5 数据存储

#### 3.5.1 存储服务

```typescript
// src/services/storage.ts

import { openDB, IDBPDatabase } from 'idb';

interface RecruitAssistantDB {
  jdProfiles: JDProfile;
  history: HistoryRecord;
  preferences: UserPreferences;
  logs: LogEntry;
}

class StorageService {
  private db: IDBPDatabase<RecruitAssistantDB>;
  
  async init(): Promise<void> {
    this.db = await openDB<RecruitAssistantDB>('recruit-assistant', 1, {
      upgrade(db) {
        // JD画像存储
        db.createObjectStore('jdProfiles', { keyPath: 'id' });
        
        // 历史记录存储
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('jdId', 'jdId');
        historyStore.createIndex('date', 'date');
        
        // 用户偏好存储
        db.createObjectStore('preferences', { keyPath: 'key' });
        
        // 日志存储
        const logStore = db.createObjectStore('logs', { keyPath: 'id' });
        logStore.createIndex('date', 'date');
      },
    });
  }
  
  // JD画像操作
  async saveJD(jd: JDProfile): Promise<void> {
    await this.db.put('jdProfiles', jd);
  }
  
  async getJD(id: string): Promise<JDProfile | undefined> {
    return await this.db.get('jdProfiles', id);
  }
  
  async getAllJDs(): Promise<JDProfile[]> {
    return await this.db.getAll('jdProfiles');
  }
  
  async deleteJD(id: string): Promise<void> {
    await this.db.delete('jdProfiles', id);
  }
  
  // 历史记录操作
  async addHistory(record: HistoryRecord): Promise<void> {
    await this.db.put('history', record);
  }
  
  async getHistoryByJD(jdId: string): Promise<HistoryRecord[]> {
    return await this.db.getAllFromIndex('history', 'jdId', jdId);
  }
  
  async getHistoryByDate(date: string): Promise<HistoryRecord[]> {
    return await this.db.getAllFromIndex('history', 'date', date);
  }
  
  // 统计
  async getTodayStats(): Promise<TodayStats> {
    const today = new Date().toISOString().split('T')[0];
    const records = await this.getHistoryByDate(today);
    
    return {
      screened: records.filter(r => r.action === 'screen').length,
      sent: records.filter(r => r.action === 'send' && r.status === 'sent').length,
      successRate: this.calculateSuccessRate(records),
    };
  }
}
```

---

### 3.6 用户偏好学习

```typescript
// src/services/preference-learner.ts

interface UserFeedback {
  resumeId: string;
  jdId: string;
  aiScore: number;
  userAction: 'accept' | 'reject' | 'adjust';
  userScore?: number;
  timestamp: Date;
}

interface LearnedPreferences {
  // 标签权重调整
  tagWeights: Map<string, number>;
  
  // 常选标签
  preferredTags: string[];
  
  // 排除标签
  excludedTags: string[];
  
  // 学习数据量
  sampleCount: number;
}

class PreferenceLearner {
  private feedbacks: UserFeedback[] = [];
  private preferences: LearnedPreferences;
  
  addFeedback(feedback: UserFeedback): void {
    this.feedbacks.push(feedback);
    this.updatePreferences();
  }
  
  private updatePreferences(): void {
    // 分析用户偏好模式
    const acceptFeedbacks = this.feedbacks.filter(f => f.userAction === 'accept');
    const rejectFeedbacks = this.feedbacks.filter(f => f.userAction === 'reject');
    
    // 计算标签权重
    // 接受的候选人中常见标签 → 增加权重
    // 拒绝的候选人中常见标签 → 降低权重
    
    this.preferences.sampleCount = this.feedbacks.length;
  }
  
  getPreferences(): LearnedPreferences {
    return this.preferences;
  }
  
  reset(): void {
    this.feedbacks = [];
    this.preferences = this.getDefaultPreferences();
  }
  
  // 应用偏好到匹配结果
  applyPreferences(result: MatchResult): MatchResult {
    // 根据学到的偏好调整分数
    result.tags.forEach(tag => {
      const weight = this.preferences.tagWeights.get(tag) || 0;
      result.score += weight;
    });
    
    return result;
  }
}
```

---

## 4. 数据模型

### 4.1 JD画像

```typescript
// src/types/jd.ts

interface JDProfile {
  id: string;
  name: string;
  content: string;
  requirements: {
    education: string;
    experience: number;
    major: string[];
    salary: {
      min: number;
      max: number;
    };
    skills: string[];
    plus: string[];
    exclude: string[];
  };
  scoringRule: {
    mode: 'simple' | 'advanced';
    strictness?: 'loose' | 'medium' | 'strict';
    hardConditions?: number;
    workMatch?: number;
    skillMatch?: number;
    overall?: number;
  };
  messageTemplate: string;
  createdAt: Date;
  updatedAt: Date;
  matchCount: number;
}
```

### 4.2 简历数据

```typescript
// src/types/resume.ts

interface ResumeData {
  id: string;
  source: 'zhilian' | 'boss';
  sourceUrl: string;
  
  basic: {
    name: string;
    age: number;
    gender: string;
    education: string;
    major: string;
    school: string;
    experience: number;
    location: string;
    phone?: string;      // 脱敏后隐藏
    email?: string;      // 脱敏后隐藏
  };
  
  intention: {
    position: string;
    salary: string;
    industry: string;
  };
  
  workHistory: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  
  skills: string[];
  selfEvaluation: string;
  
  extractedAt: Date;
}
```

### 4.3 设置

```typescript
// src/types/settings.ts

interface Settings {
  ai: {
    provider: 'openai' | 'qwen' | 'zhipu' | 'moonshot' | 'custom';
    model: string;
    apiKey: string;
    proxy?: {
      enabled: boolean;
      address: string;
    };
  };
  
  match: {
    defaultThreshold: number;
    scoringRuleDefault: {
      mode: 'simple' | 'advanced';
      strictness: 'loose' | 'medium' | 'strict';
    };
  };
  
  send: {
    dailyLimit: number;
    minInterval: number;
    maxInterval: number;
    maxRetry: number;
  };
  
  display: {
    scoreColors: {
      high: string;
      medium: string;
      low: string;
    };
    showTags: boolean;
    showReason: boolean;
    sidebarWidth: number;
  };
  
  privacy: {
    enableSanitization: boolean;
    enableLogging: boolean;
  };
}
```

---

## 5. 关键流程

### 5.1 列表页粗筛流程

```
用户打开智联招聘搜索结果页
        ↓
Content Script检测页面URL
        ↓
加载智联适配器
        ↓
注入侧边栏UI
        ↓
监听DOM变化，检测候选人列表
        ↓
提取可见候选人的基础信息
        ↓
调用quickMatch进行粗筛
        ↓
在候选人卡片上显示分数和标签
        ↓
用户滚动页面 → 继续提取和粗筛
```

### 5.2 详情页深度分析流程

```
用户点击候选人进入详情页
        ↓
适配器提取完整简历数据
        ↓
数据脱敏处理
        ↓
构建匹配Prompt
        ↓
调用AI API
        ↓
解析匹配结果
        ↓
应用用户偏好调整
        ↓
在侧边栏展示匹配结果
        ↓
用户操作：加入队列/跳过/标记
```

### 5.3 发送队列流程

```
用户点击"加入队列"
        ↓
生成个性化话术
        ↓
添加到待发送队列
        ↓
用户确认批量发送
        ↓
启动安全发送器
        ↓
随机延迟 → 检查限制 → 发送
        ↓
更新发送状态
        ↓
记录历史 + 学习偏好
```

---

## 7. UI组件设计

### 7.1 多选下拉组件

```typescript
// src/sidebar/components/MultiSelect.tsx

/**
 * 多选下拉组件
 * 借鉴自 get_jobs 项目的 MultiSelect 组件设计
 * 支持多选、分组显示、Portal渲染避免遮挡
 */

interface MultiSelectOption {
  id: number;
  code: string;
  name: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = '请选择',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 计算下拉框位置
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  // 点击外部关闭
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);
      if (!clickedButton && !clickedDropdown) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const selectedNames = options
    .filter((o) => selected.includes(o.code))
    .map((o) => o.name);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <span className="truncate">
          {selectedNames.length > 0 ? selectedNames.join('，') : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 rounded-md border bg-popover p-2 shadow-md"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div className="flex flex-col gap-1">
            {options.map((opt) => {
              const isSelected = selected.includes(opt.code);
              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors",
                    isSelected 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => toggle(opt.code)}
                >
                  <Check className={cn("h-4 w-4", !isSelected && "opacity-0")} />
                  <span className="text-sm">{opt.name}</span>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
```

### 7.2 黑名单/排除条件组件

```typescript
// src/sidebar/components/ExcludeConditions.tsx

/**
 * 排除条件组件
 * 借鉴自 get_jobs 项目的黑名单管理UI设计
 * 支持三种类型：公司、岗位、HR
 */

interface ExcludeItem {
  id: number;
  type: 'company' | 'job' | 'recruiter';
  value: string;
}

interface ExcludeConditionsProps {
  items: ExcludeItem[];
  onAdd: (type: ExcludeItem['type'], value: string) => void;
  onRemove: (id: number) => void;
}

const TYPE_CONFIG = {
  company: { label: '公司', icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
  job: { label: '岗位', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
  recruiter: { label: 'HR', icon: User, color: 'text-green-500', bg: 'bg-green-50' },
};

export function ExcludeConditions({ items, onAdd, onRemove }: ExcludeConditionsProps) {
  const [newItem, setNewItem] = useState('');
  const [selectedType, setSelectedType] = useState<ExcludeItem['type']>('company');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(selectedType, newItem.trim());
      setNewItem('');
    }
  };

  // 按类型分组
  const groupedItems = {
    company: items.filter(i => i.type === 'company'),
    job: items.filter(i => i.type === 'job'),
    recruiter: items.filter(i => i.type === 'recruiter'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="text-destructive" />
          排除条件 ({items.length} 条)
        </CardTitle>
        <CardDescription>添加不想考虑的公司、岗位或HR</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 添加输入 */}
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ExcludeItem['type'])}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">公司</SelectItem>
              <SelectItem value="job">岗位</SelectItem>
              <SelectItem value="recruiter">HR</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`输入${TYPE_CONFIG[selectedType].label}关键词`}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 分组显示 */}
        {(Object.keys(TYPE_CONFIG) as ExcludeItem['type'][]).map((type) => {
          const config = TYPE_CONFIG[type];
          const typeItems = groupedItems[type];
          const Icon = config.icon;

          return (
            <div key={type}>
              <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                <Icon className={config.color} />
                <span>{config.label}黑名单 ({typeItems.length})</span>
              </h4>
              <div className="space-y-2">
                {typeItems.length === 0 ? (
                  <div className="text-center py-3 text-muted-foreground text-xs bg-muted/30 rounded-md">
                    暂无{config.label}黑名单
                  </div>
                ) : (
                  typeItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md border",
                        config.bg
                      )}
                    >
                      <span className="text-sm">{item.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

### 7.3 配置管理页面布局

```typescript
// src/options/index.tsx

/**
 * 设置页面布局
 * 借鉴自 get_jobs 项目的配置页面设计
 * 使用 Tabs 组件分组管理不同配置
 */

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <PageHeader
          icon={<Settings className="h-6 w-6" />}
          title="招聘助手设置"
          subtitle="配置AI、匹配规则、发送策略等"
        />

        <Tabs defaultValue="ai" className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai">AI配置</TabsTrigger>
            <TabsTrigger value="match">匹配设置</TabsTrigger>
            <TabsTrigger value="send">发送设置</TabsTrigger>
            <TabsTrigger value="display">显示设置</TabsTrigger>
            <TabsTrigger value="privacy">隐私设置</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-6">
            <AIConfigCard />
          </TabsContent>

          <TabsContent value="match" className="mt-6">
            <MatchConfigCard />
          </TabsContent>

          <TabsContent value="send" className="mt-6">
            <SendConfigCard />
          </TabsContent>

          <TabsContent value="display" className="mt-6">
            <DisplayConfigCard />
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <PrivacyConfigCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

### 7.4 侧边栏主面板

```typescript
// src/sidebar/index.tsx

/**
 * 侧边栏主面板
 * 借鉴自 get_jobs 项目的面板设计
 * 支持拖拽调整宽度
 */

export function SidebarPanel() {
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 拖拽调整宽度
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(280, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      ref={sidebarRef}
      className="fixed right-0 top-0 h-full bg-background border-l shadow-lg z-50"
      style={{ width: `${width}px` }}
    >
      {/* 拖拽手柄 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* 内容区域 */}
      <div className="h-full flex flex-col">
        {/* 顶部：JD选择器 */}
        <div className="p-4 border-b">
          <JDSelector />
        </div>

        {/* 中间：匹配结果 */}
        <div className="flex-1 overflow-auto p-4">
          <MatchResult />
        </div>

        {/* 底部：发送队列 */}
        <div className="border-t p-4">
          <SendQueue />
        </div>
      </div>
    </div>
  );
}
```

---

## 9. 安全考虑

### 9.1 数据脱敏

```typescript
// src/utils/sanitizer.ts

function sanitizeResume(resume: ResumeData): ResumeData {
  return {
    ...resume,
    basic: {
      ...resume.basic,
      name: maskName(resume.basic.name),
      phone: '***',
      email: '***',
    },
  };
}

function maskName(name: string): string {
  if (name.length <= 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}
```

### 9.2 API Key保护

- API Key仅存储在用户本地IndexedDB
- 不发送到任何第三方服务器
- 设置页面显示时默认隐藏

### 9.3 平台风控规避

- 随机延迟发送
- 每日发送上限
- 模拟人工操作节奏
- 不使用自动化框架（如Puppeteer）

---

## 10. 性能优化

### 10.1 列表页优化

- 使用Intersection Observer监听可见元素
- 粗筛使用本地规则，不调用API
- 批量更新DOM，减少重绘

### 10.2 AI调用优化

- 并发控制（最多3个并发）
- 请求去重
- 结果缓存

### 10.3 存储优化

- IndexedDB事务批量写入
- 历史记录分页查询
- 定期清理过期日志

---

## 11. 测试策略

### 11.1 单元测试

- 匹配算法测试
- 数据脱敏测试
- 工具函数测试

### 11.2 集成测试

- 平台适配器测试
- AI Provider测试
- 存储服务测试

### 11.3 E2E测试

- 完整筛选流程测试
- 发送队列测试
- 用户偏好学习测试

---

## 12. 部署

### 12.1 开发环境

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

### 12.2 安装插件

1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录

---

## 13. 后续扩展

### 13.1 BOSS直聘适配器

- 分析BOSS直聘页面结构
- 实现简历提取和发送逻辑
- 注意BOSS的聊天式交互模式

### 13.2 更多AI模型

- 支持更多国内AI服务商
- 支持自定义API端点
- 支持本地模型（如用户有GPU）

### 13.3 高级功能

- 定时发送
- 导出人才库
- 多设备同步

---

## 附录：借鉴来源

本技术设计文档借鉴了 [get_jobs](https://github.com/loks666/get_jobs) 开源项目的以下设计：

| 借鉴内容 | 原项目实现 | 本项目应用 |
|---------|-----------|-----------|
| **API响应监听** | 监听平台API获取结构化数据 | 智联招聘适配器中实现响应监听 |
| **打招呼语生成** | AI生成个性化打招呼消息 | 优化Prompt模板，支持候选人亮点 |
| **配置管理UI** | 多选下拉、分组显示、Tabs布局 | 侧边栏组件、设置页面设计 |
| **黑名单机制** | 三种类型黑名单分组管理 | 排除条件组件设计 |
