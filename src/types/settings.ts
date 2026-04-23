/**
 * 设置类型定义
 */

export interface Settings {
  ai: AIConfig;
  match: MatchConfig;
  send: SendConfig;
  display: DisplayConfig;
  privacy: PrivacyConfig;
}

export interface AIConfig {
  provider: 'openai' | 'qwen' | 'zhipu' | 'moonshot' | 'custom';
  model: string;
  apiKey: string;
  customBaseUrl?: string;
  proxy?: {
    enabled: boolean;
    address: string;
  };
}

export interface MatchConfig {
  defaultThreshold: number;
  scoringRuleDefault: {
    mode: 'simple' | 'advanced';
    strictness: 'loose' | 'medium' | 'strict';
  };
}

export interface SendConfig {
  dailyLimit: number;
  minInterval: number;
  maxInterval: number;
  maxRetry: number;
}

export interface DisplayConfig {
  scoreColors: {
    high: string;
    medium: string;
    low: string;
  };
  showTags: boolean;
  showReason: boolean;
  sidebarWidth: number;
}

export interface PrivacyConfig {
  enableSanitization: boolean;
  enableLogging: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  ai: {
    provider: 'qwen',
    model: 'qwen-plus',
    apiKey: '',
    customBaseUrl: '',
  },
  match: {
    defaultThreshold: 70,
    scoringRuleDefault: {
      mode: 'simple',
      strictness: 'medium',
    },
  },
  send: {
    dailyLimit: 50,
    minInterval: 30,
    maxInterval: 120,
    maxRetry: 5,
  },
  display: {
    scoreColors: {
      high: '#22c55e',
      medium: '#eab308',
      low: '#ef4444',
    },
    showTags: true,
    showReason: true,
    sidebarWidth: 320,
  },
  privacy: {
    enableSanitization: true,
    enableLogging: true,
  },
};
