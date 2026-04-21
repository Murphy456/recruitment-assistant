/**
 * Zustand 状态管理 - JD 画像
 */

import { create } from 'zustand';
import { JDProfile } from '../types/jd';
import { storageService } from '../services/storage';

interface JDState {
  jds: JDProfile[];
  activeJD: JDProfile | null;
  loading: boolean;
  loadJDs: () => Promise<void>;
  setActiveJD: (jd: JDProfile | null) => void;
  createJD: (jd: Omit<JDProfile, 'id' | 'createdAt' | 'updatedAt' | 'matchCount'>) => Promise<JDProfile>;
  updateJD: (id: string, partial: Partial<JDProfile>) => Promise<void>;
  deleteJD: (id: string) => Promise<void>;
}

export const useJDStore = create<JDState>((set, get) => ({
  jds: [],
  activeJD: null,
  loading: true,

  loadJDs: async () => {
    set({ loading: true });
    try {
      await storageService.init();
      const jds = await storageService.getAllJDs();
      set({ jds, loading: false });
    } catch (error) {
      console.error('加载JD列表失败:', error);
      set({ loading: false });
    }
  },

  setActiveJD: (jd: JDProfile | null) => {
    set({ activeJD: jd });
  },

  createJD: async (jdData) => {
    const jd: JDProfile = {
      ...jdData,
      id: `jd-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      matchCount: 0,
    };

    await storageService.saveJD(jd);
    set((state) => ({ jds: [...state.jds, jd] }));

    return jd;
  },

  updateJD: async (id: string, partial: Partial<JDProfile>) => {
    const jd = get().jds.find((j) => j.id === id);
    if (!jd) return;

    const updatedJD = {
      ...jd,
      ...partial,
      updatedAt: new Date(),
    };

    await storageService.saveJD(updatedJD);
    set((state) => ({
      jds: state.jds.map((j) => (j.id === id ? updatedJD : j)),
      activeJD: state.activeJD?.id === id ? updatedJD : state.activeJD,
    }));
  },

  deleteJD: async (id: string) => {
    await storageService.deleteJD(id);
    set((state) => ({
      jds: state.jds.filter((j) => j.id !== id),
      activeJD: state.activeJD?.id === id ? null : state.activeJD,
    }));
  },
}));
