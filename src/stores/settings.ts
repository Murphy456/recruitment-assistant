/**
 * Zustand 状态管理 - 设置
 */

import { create } from 'zustand';
import { Settings, DEFAULT_SETTINGS } from '../types/settings';

interface SettingsState {
  settings: Settings;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  updateAIConfig: (partial: Partial<Settings['ai']>) => Promise<void>;
  updateMatchConfig: (partial: Partial<Settings['match']>) => Promise<void>;
  updateSendConfig: (partial: Partial<Settings['send']>) => Promise<void>;
  updateDisplayConfig: (partial: Partial<Settings['display']>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: true,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const result = await chrome.storage.local.get('settings');
      set({
        settings: result.settings || DEFAULT_SETTINGS,
        loading: false,
      });
    } catch (error) {
      console.error('加载设置失败:', error);
      set({ loading: false });
    }
  },

  updateSettings: async (partial: Partial<Settings>) => {
    const newSettings = { ...get().settings, ...partial };
    await chrome.storage.local.set({ settings: newSettings });
    set({ settings: newSettings });
  },

  updateAIConfig: async (partial: Partial<Settings['ai']>) => {
    const newSettings = {
      ...get().settings,
      ai: { ...get().settings.ai, ...partial },
    };
    await chrome.storage.local.set({ settings: newSettings });
    set({ settings: newSettings });
  },

  updateMatchConfig: async (partial: Partial<Settings['match']>) => {
    const newSettings = {
      ...get().settings,
      match: { ...get().settings.match, ...partial },
    };
    await chrome.storage.local.set({ settings: newSettings });
    set({ settings: newSettings });
  },

  updateSendConfig: async (partial: Partial<Settings['send']>) => {
    const newSettings = {
      ...get().settings,
      send: { ...get().settings.send, ...partial },
    };
    await chrome.storage.local.set({ settings: newSettings });
    set({ settings: newSettings });
  },

  updateDisplayConfig: async (partial: Partial<Settings['display']>) => {
    const newSettings = {
      ...get().settings,
      display: { ...get().settings.display, ...partial },
    };
    await chrome.storage.local.set({ settings: newSettings });
    set({ settings: newSettings });
  },
}));
