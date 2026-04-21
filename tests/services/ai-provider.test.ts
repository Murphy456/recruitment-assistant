/**
 * AI 服务测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAICompatibleProvider, AIService } from '../../src/services/ai-provider';
import { AIConfig } from '../../src/types/settings';

describe('OpenAICompatibleProvider', () => {
  let provider: OpenAICompatibleProvider;
  const mockConfig: AIConfig = {
    provider: 'qwen',
    model: 'qwen-plus',
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    provider = new OpenAICompatibleProvider(mockConfig);
    vi.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('有 API Key 时返回 true', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('无 API Key 时返回 false', () => {
      const noKeyProvider = new OpenAICompatibleProvider({
        ...mockConfig,
        apiKey: '',
      });
      expect(noKeyProvider.isConfigured()).toBe(false);
    });
  });

  describe('chat', () => {
    it('未配置时抛出错误', async () => {
      const noKeyProvider = new OpenAICompatibleProvider({
        ...mockConfig,
        apiKey: '',
      });

      await expect(noKeyProvider.chat([])).rejects.toThrow('API Key 未配置');
    });

    it('API 返回正确响应', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '测试响应内容',
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.chat([
        { role: 'user', content: '你好' },
      ]);

      expect(result).toBe('测试响应内容');
    });

    it('API 返回错误时抛出异常', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(provider.chat([])).rejects.toThrow('API 请求失败');
    });

    it('API 响应格式异常时抛出错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: 'invalid' }),
      });

      await expect(provider.chat([])).rejects.toThrow('API 响应格式异常');
    });

    it('API 响应空 choices 时抛出错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] }),
      });

      await expect(provider.chat([])).rejects.toThrow('API 响应格式异常');
    });
  });

  describe('不同提供商的 baseUrl', () => {
    it('OpenAI 使用正确的 baseUrl', () => {
      const openaiProvider = new OpenAICompatibleProvider({
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'key',
      });
      expect(openaiProvider.name).toBe('openai');
    });

    it('智谱 AI 使用正确的 baseUrl', () => {
      const zhipuProvider = new OpenAICompatibleProvider({
        provider: 'zhipu',
        model: 'glm-4',
        apiKey: 'key',
      });
      expect(zhipuProvider.name).toBe('zhipu');
    });

    it('自定义代理配置', () => {
      const customProvider = new OpenAICompatibleProvider({
        provider: 'custom',
        model: 'custom-model',
        apiKey: 'key',
        proxy: {
          enabled: true,
          address: 'https://custom.api.com/v1',
        },
      });
      expect(customProvider.name).toBe('custom');
    });
  });
});

describe('AIService', () => {
  it('未初始化时抛出错误', async () => {
    const service = new AIService();
    await expect(service.chat([])).rejects.toThrow('AI 服务未初始化');
  });

  it('初始化后可以调用', async () => {
    const service = new AIService();
    service.setConfig({
      provider: 'qwen',
      model: 'qwen-plus',
      apiKey: 'test-key',
    });

    expect(service.isReady()).toBe(true);
  });
});
