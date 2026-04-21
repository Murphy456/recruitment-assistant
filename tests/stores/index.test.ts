/**
 * Zustand Stores 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../../src/stores/settings';
import { useJDStore } from '../../src/stores/jds';
import { useCandidateStore } from '../../src/stores/candidates';
import { DEFAULT_SETTINGS } from '../../src/types/settings';

// Mock chrome.storage
vi.mock('../../src/services/storage', () => ({
  storageService: {
    init: vi.fn().mockResolvedValue(undefined),
    saveJD: vi.fn().mockResolvedValue(undefined),
    getAllJDs: vi.fn().mockResolvedValue([]),
    deleteJD: vi.fn().mockResolvedValue(undefined),
    saveMatchResult: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock matcher
vi.mock('../../src/services/matcher', () => ({
  quickMatch: vi.fn().mockReturnValue({
    score: 70,
    tags: ['学历符合'],
    needDetail: true,
  }),
  detailedMatch: vi.fn().mockResolvedValue({
    score: 85,
    tags: ['优秀候选人'],
    recommendReason: '技能匹配',
    concerns: [],
    interviewQuestions: [],
    hardConditions: {
      education: { match: true, reason: '' },
      experience: { match: true, reason: '' },
      major: { match: true, reason: '' },
    },
    workMatch: { score: 80, highlights: [], gaps: [] },
    skillMatch: { score: 90, matched: [], missing: [] },
    overall: { score: 85, impression: '' },
  }),
}));

describe('useSettingsStore', () => {
  beforeEach(() => {
    // 重置 store
    useSettingsStore.setState({ settings: DEFAULT_SETTINGS, loading: false });
  });

  it('初始状态正确', () => {
    const state = useSettingsStore.getState();

    expect(state.settings).toEqual(DEFAULT_SETTINGS);
    expect(state.loading).toBe(false);
  });

  it('updateAIConfig 更新 AI 配置', async () => {
    const store = useSettingsStore.getState();

    await store.updateAIConfig({ apiKey: 'new-key' });

    const newState = useSettingsStore.getState();
    expect(newState.settings.ai.apiKey).toBe('new-key');
  });

  it('updateSendConfig 更新发送配置', async () => {
    const store = useSettingsStore.getState();

    await store.updateSendConfig({ dailyLimit: 100 });

    const newState = useSettingsStore.getState();
    expect(newState.settings.send.dailyLimit).toBe(100);
  });

  it('updateDisplayConfig 更新显示配置', async () => {
    const store = useSettingsStore.getState();

    await store.updateDisplayConfig({ showTags: false });

    const newState = useSettingsStore.getState();
    expect(newState.settings.display.showTags).toBe(false);
  });
});

describe('useJDStore', () => {
  beforeEach(() => {
    useJDStore.setState({ jds: [], activeJD: null, loading: false });
    vi.clearAllMocks();
  });

  it('初始状态为空', () => {
    const state = useJDStore.getState();

    expect(state.jds).toEqual([]);
    expect(state.activeJD).toBeNull();
  });

  it('setActiveJD 设置当前 JD', () => {
    const store = useJDStore.getState();
    const mockJD = {
      id: 'jd-1',
      name: '前端工程师',
      content: '',
      requirements: {
        education: '本科',
        experience: 3,
        major: [],
        salary: { min: 0, max: 0 },
        skills: [],
        plus: [],
        exclude: [],
      },
      scoringRule: { mode: 'simple' as const },
      messageTemplate: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      matchCount: 0,
    };

    store.setActiveJD(mockJD);

    expect(useJDStore.getState().activeJD).toEqual(mockJD);
  });

  it('createJD 创建新 JD', async () => {
    const store = useJDStore.getState();

    const newJD = await store.createJD({
      name: '测试职位',
      content: '测试内容',
      requirements: {
        education: '本科',
        experience: 2,
        major: [],
        salary: { min: 10, max: 20 },
        skills: ['React'],
        plus: [],
        exclude: [],
      },
      scoringRule: { mode: 'simple' },
      messageTemplate: '您好',
    });

    expect(newJD.id).toBeDefined();
    expect(newJD.name).toBe('测试职位');
    expect(useJDStore.getState().jds).toHaveLength(1);
  });
});

describe('useCandidateStore', () => {
  const mockResume = {
    id: 'resume-1',
    source: 'zhilian' as const,
    sourceUrl: '',
    basic: {
      name: '张三',
      age: 28,
      gender: '男',
      education: '本科',
      major: '计算机',
      school: '北京大学',
      experience: 5,
      location: '北京',
    },
    intention: { position: '前端', salary: '20K', industry: '互联网' },
    workHistory: [],
    skills: ['React'],
    selfEvaluation: '',
    extractedAt: new Date(),
  };

  const mockJD = {
    id: 'jd-1',
    name: '前端工程师',
    content: '',
    requirements: {
      education: '本科',
      experience: 3,
      major: [],
      salary: { min: 0, max: 0 },
      skills: ['React'],
      plus: [],
      exclude: [],
    },
    scoringRule: { mode: 'simple' as const },
    messageTemplate: '您好',
    createdAt: new Date(),
    updatedAt: new Date(),
    matchCount: 0,
  };

  beforeEach(() => {
    useCandidateStore.setState({
      candidates: [],
      selectedCandidate: null,
      analyzing: false,
    });
    vi.clearAllMocks();
  });

  it('setCandidates 设置候选人列表', () => {
    const store = useCandidateStore.getState();

    store.setCandidates([mockResume]);

    const state = useCandidateStore.getState();
    expect(state.candidates).toHaveLength(1);
    expect(state.candidates[0].resume).toEqual(mockResume);
    expect(state.candidates[0].status).toBe('pending');
  });

  it('selectCandidate 设置选中的候选人', () => {
    const store = useCandidateStore.getState();
    const candidate = {
      resume: mockResume,
      status: 'pending' as const,
    };

    store.selectCandidate(candidate);

    expect(useCandidateStore.getState().selectedCandidate).toEqual(candidate);
  });

  it('selectCandidate(null) 清除选中', () => {
    const store = useCandidateStore.getState();
    store.selectCandidate({
      resume: mockResume,
      status: 'pending',
    });

    store.selectCandidate(null);

    expect(useCandidateStore.getState().selectedCandidate).toBeNull();
  });

  it('analyzeCandidate 更新候选人状态', async () => {
    const store = useCandidateStore.getState();
    store.setCandidates([mockResume]);

    const candidate = useCandidateStore.getState().candidates[0];
    await store.analyzeCandidate(candidate, mockJD);

    const state = useCandidateStore.getState();
    expect(state.candidates[0].status).toBe('ready');
    expect(state.candidates[0].quickResult).toBeDefined();
  });

  it('sendGreeting 处理成功响应', async () => {
    const store = useCandidateStore.getState();
    store.setCandidates([mockResume]);

    // Mock chrome.runtime.sendMessage
    vi.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue({ success: true });

    const candidate = useCandidateStore.getState().candidates[0];
    const result = await store.sendGreeting(candidate, '测试消息');

    expect(result).toBe(true);
    expect(useCandidateStore.getState().candidates[0].status).toBe('sent');
  });

  it('sendGreeting 处理失败响应', async () => {
    const store = useCandidateStore.getState();
    store.setCandidates([mockResume]);

    // Mock chrome.runtime.sendMessage 返回错误
    vi.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue({
      success: false,
      error: '发送失败',
    });

    const candidate = useCandidateStore.getState().candidates[0];
    const result = await store.sendGreeting(candidate, '测试消息');

    expect(result).toBe(false);
    expect(useCandidateStore.getState().candidates[0].status).toBe('error');
  });

  it('sendGreeting 处理无响应', async () => {
    const store = useCandidateStore.getState();
    store.setCandidates([mockResume]);

    // Mock chrome.runtime.sendMessage 返回 undefined
    vi.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue(undefined);

    const candidate = useCandidateStore.getState().candidates[0];
    const result = await store.sendGreeting(candidate, '测试消息');

    expect(result).toBe(false);
    expect(useCandidateStore.getState().candidates[0].status).toBe('error');
    expect(useCandidateStore.getState().candidates[0].error).toBe('消息发送无响应');
  });
});
