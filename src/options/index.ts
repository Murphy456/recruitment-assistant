/**
 * Options 页面脚本
 */

import { Settings, DEFAULT_SETTINGS } from '../types/settings';

// 加载设置
async function loadSettings(): Promise<void> {
  const result = await chrome.storage.local.get('settings');
  const settings: Settings = result.settings || DEFAULT_SETTINGS;

  // AI 配置
  (document.getElementById('aiProvider') as HTMLSelectElement).value = settings.ai.provider;
  (document.getElementById('aiModel') as HTMLInputElement).value = settings.ai.model;
  (document.getElementById('apiKey') as HTMLInputElement).value = settings.ai.apiKey;

  // 匹配配置
  (document.getElementById('defaultThreshold') as HTMLInputElement).value = String(
    settings.match.defaultThreshold
  );
  (document.getElementById('scoringMode') as HTMLSelectElement).value =
    settings.match.scoringRuleDefault.mode;
  (document.getElementById('strictness') as HTMLSelectElement).value =
    settings.match.scoringRuleDefault.strictness;

  // 发送配置
  (document.getElementById('dailyLimit') as HTMLInputElement).value = String(
    settings.send.dailyLimit
  );
  (document.getElementById('minInterval') as HTMLInputElement).value = String(
    settings.send.minInterval
  );
  (document.getElementById('maxInterval') as HTMLInputElement).value = String(
    settings.send.maxInterval
  );

  // 显示配置
  (document.getElementById('showTags') as HTMLInputElement).checked = settings.display.showTags;
  (document.getElementById('showReason') as HTMLInputElement).checked = settings.display.showReason;
}

// 保存设置
async function saveSettings(): Promise<void> {
  const settings: Settings = {
    ai: {
      provider: (document.getElementById('aiProvider') as HTMLSelectElement).value as Settings['ai']['provider'],
      model: (document.getElementById('aiModel') as HTMLInputElement).value,
      apiKey: (document.getElementById('apiKey') as HTMLInputElement).value,
    },
    match: {
      defaultThreshold: parseInt(
        (document.getElementById('defaultThreshold') as HTMLInputElement).value,
        10
      ),
      scoringRuleDefault: {
        mode: (document.getElementById('scoringMode') as HTMLSelectElement).value as
          | 'simple'
          | 'advanced',
        strictness: (document.getElementById('strictness') as HTMLSelectElement).value as
          | 'loose'
          | 'medium'
          | 'strict',
      },
    },
    send: {
      dailyLimit: parseInt((document.getElementById('dailyLimit') as HTMLInputElement).value, 10),
      minInterval: parseInt((document.getElementById('minInterval') as HTMLInputElement).value, 10),
      maxInterval: parseInt((document.getElementById('maxInterval') as HTMLInputElement).value, 10),
      maxRetry: 5,
    },
    display: {
      scoreColors: DEFAULT_SETTINGS.display.scoreColors,
      showTags: (document.getElementById('showTags') as HTMLInputElement).checked,
      showReason: (document.getElementById('showReason') as HTMLInputElement).checked,
      sidebarWidth: 320,
    },
    privacy: {
      enableSanitization: true,
      enableLogging: true,
    },
  };

  await chrome.storage.local.set({ settings });

  // 显示提示
  const toast = document.getElementById('toast')!;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// 绑定事件
document.getElementById('saveBtn')?.addEventListener('click', saveSettings);

// 初始化
loadSettings();
