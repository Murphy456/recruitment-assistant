/**
 * Background Service Worker
 * 处理后台任务、消息通信和定时器
 */

import { DEFAULT_SETTINGS } from '../types/settings';

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 首次安装，初始化默认设置
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    console.log('招聘助手已安装，默认设置已初始化');
  }
});

// 消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // 保持消息通道开启
});

async function handleMessage(
  message: { type: string; payload?: unknown },
  _sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'GET_SETTINGS':
      return await getSettings();

    case 'SAVE_SETTINGS':
      return await saveSettings(message.payload as Record<string, unknown>);

    case 'LOG_ACTION':
      return await logAction(message.payload as LogEntry);

    case 'CHECK_DAILY_LIMIT':
      return await checkDailyLimit();

    case 'RECORD_SEND':
      return await recordSend();

    default:
      return { error: 'Unknown message type' };
  }
}

interface LogEntry {
  action: string;
  resumeId?: string;
  jdId?: string;
  score?: number;
  timestamp: number;
}

async function getSettings(): Promise<Record<string, unknown>> {
  const result = await chrome.storage.local.get('settings');
  return result.settings || DEFAULT_SETTINGS;
}

async function saveSettings(settings: Record<string, unknown>): Promise<boolean> {
  await chrome.storage.local.set({ settings });
  return true;
}

async function logAction(entry: LogEntry): Promise<boolean> {
  const result = await chrome.storage.local.get('logs');
  const logs: LogEntry[] = result.logs || [];
  logs.push({ ...entry, timestamp: Date.now() });
  // 只保留最近1000条日志
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  await chrome.storage.local.set({ logs });
  return true;
}

async function checkDailyLimit(): Promise<{ canSend: boolean; count: number }> {
  const result = await chrome.storage.local.get(['sendRecords', 'settings']);
  const records: number[] = result.sendRecords || [];
  const settings = result.settings || DEFAULT_SETTINGS;
  const dailyLimit = (settings as { send: { dailyLimit: number } }).send.dailyLimit;

  // 清理过期记录（超过24小时）
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const validRecords = records.filter((t) => t > oneDayAgo);

  return {
    canSend: validRecords.length < dailyLimit,
    count: validRecords.length,
  };
}

async function recordSend(): Promise<boolean> {
  const result = await chrome.storage.local.get('sendRecords');
  const records: number[] = result.sendRecords || [];
  records.push(Date.now());

  // 清理过期记录
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const validRecords = records.filter((t) => t > oneDayAgo);

  await chrome.storage.local.set({ sendRecords: validRecords });
  return true;
}

// 定时清理过期数据
chrome.alarms.create('cleanup', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cleanup') {
    const result = await chrome.storage.local.get('sendRecords');
    const records: number[] = result.sendRecords || [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const validRecords = records.filter((t) => t > oneDayAgo);
    await chrome.storage.local.set({ sendRecords: validRecords });
  }
});

export {};
