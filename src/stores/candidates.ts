/**
 * Zustand 状态管理 - 候选人
 */

import { create } from 'zustand';
import { ResumeData } from '../types/resume';
import { MatchResult, QuickMatchResult } from '../types/match';
import { quickMatch, detailedMatch } from '../services/matcher';
import { storageService } from '../services/storage';
import { JDProfile } from '../types/jd';

export interface Candidate {
  resume: ResumeData;
  quickResult?: QuickMatchResult;
  detailResult?: MatchResult;
  status: 'pending' | 'analyzing' | 'ready' | 'sending' | 'sent' | 'error';
  error?: string;
}

interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  analyzing: boolean;
  setCandidates: (resumes: ResumeData[]) => void;
  selectCandidate: (candidate: Candidate | null) => void;
  analyzeCandidate: (candidate: Candidate, jd: JDProfile) => Promise<void>;
  analyzeAll: (jd: JDProfile) => Promise<void>;
  sendGreeting: (candidate: Candidate, message: string) => Promise<boolean>;
}

export const useCandidateStore = create<CandidateState>((set, get) => ({
  candidates: [],
  selectedCandidate: null,
  analyzing: false,

  setCandidates: (resumes: ResumeData[]) => {
    const candidates: Candidate[] = resumes.map((resume) => ({
      resume,
      status: 'pending',
    }));
    set({ candidates, selectedCandidate: null });
  },

  selectCandidate: (candidate: Candidate | null) => {
    set({ selectedCandidate: candidate });
  },

  analyzeCandidate: async (candidate: Candidate, jd: JDProfile) => {
    // 更新状态为分析中
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.resume.id === candidate.resume.id ? { ...c, status: 'analyzing' } : c
      ),
    }));

    try {
      // 快速匹配
      const quickResult = quickMatch(candidate.resume, jd);

      // 如果需要详细分析
      let detailResult: MatchResult | undefined;
      if (quickResult.needDetail) {
        detailResult = await detailedMatch(candidate.resume, jd);
      }

      // 更新结果
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.resume.id === candidate.resume.id
            ? {
                ...c,
                quickResult,
                detailResult,
                status: 'ready',
              }
            : c
        ),
      }));

      // 保存匹配结果
      if (detailResult) {
        await storageService.init();
        await storageService.saveMatchResult(candidate.resume.id, jd.id, detailResult);
      }
    } catch (error) {
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.resume.id === candidate.resume.id
            ? {
                ...c,
                status: 'error',
                error: error instanceof Error ? error.message : '分析失败',
              }
            : c
        ),
      }));
    }
  },

  analyzeAll: async (jd: JDProfile) => {
    set({ analyzing: true });
    const { candidates, analyzeCandidate } = get();

    // 按顺序分析（避免API限流）
    for (const candidate of candidates) {
      if (candidate.status === 'pending') {
        await analyzeCandidate(candidate, jd);
        // 添加延迟避免API限流
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    set({ analyzing: false });
  },

  sendGreeting: async (candidate: Candidate, message: string) => {
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.resume.id === candidate.resume.id ? { ...c, status: 'sending' } : c
      ),
    }));

    try {
      // 通过消息发送给 content script
      const response = await chrome.runtime.sendMessage({
        type: 'SEND_MESSAGE',
        payload: { resumeId: candidate.resume.id, message },
      });

      // 验证响应
      if (!response) {
        throw new Error('消息发送无响应');
      }

      if (!response.success) {
        throw new Error(response.error || '发送失败');
      }

      // 记录发送
      await chrome.runtime.sendMessage({ type: 'RECORD_SEND' });

      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.resume.id === candidate.resume.id ? { ...c, status: 'sent' } : c
        ),
      }));

      return true;
    } catch (error) {
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.resume.id === candidate.resume.id
            ? {
                ...c,
                status: 'error',
                error: error instanceof Error ? error.message : '发送失败',
              }
            : c
        ),
      }));

      return false;
    }
  },
}));
