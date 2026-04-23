/**
 * AI 服务提供者
 */

import { AIConfig } from '../../types/settings';

export interface AIProvider {
  name: string;
  chat(messages: ChatMessage[]): Promise<string>;
  isConfigured(): boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI 兼容 API 提供者
 */
export class OpenAICompatibleProvider implements AIProvider {
  name: string;
  private config: AIConfig;
  private baseUrl: string;

  constructor(config: AIConfig) {
    this.config = config;
    this.name = config.provider;

    // 根据提供者设置基础URL
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    switch (this.config.provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'qwen':
        return 'https://dashscope.aliyuncs.com/compatible-mode/v1';
      case 'zhipu':
        return 'https://open.bigmodel.cn/api/paas/v4';
      case 'moonshot':
        return 'https://api.moonshot.cn/v1';
      case 'custom':
        return this.config.customBaseUrl || 'https://api.openai.com/v1';
      default:
        return this.config.proxy?.enabled
          ? this.config.proxy.address
          : 'https://api.openai.com/v1';
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(`${this.name} API Key 未配置`);
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // 验证响应结构
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('API 响应格式异常');
    }

    return data.choices[0].message.content;
  }
}

/**
 * AI 服务管理器
 */
export class AIService {
  private provider: AIProvider | null = null;

  setConfig(config: AIConfig) {
    this.provider = new OpenAICompatibleProvider(config);
  }

  getProvider(): AIProvider | null {
    return this.provider;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.provider) {
      throw new Error('AI 服务未初始化');
    }
    return this.provider.chat(messages);
  }

  isReady(): boolean {
    return this.provider?.isConfigured() ?? false;
  }
}

// 单例实例
export const aiService = new AIService();
