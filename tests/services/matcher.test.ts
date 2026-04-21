/**
 * 匹配服务测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quickMatch, detailedMatch } from '../../src/services/matcher';
import { ResumeData } from '../../src/types/resume';
import { JDProfile } from '../../src/types/jd';

// Mock AI 服务
vi.mock('../../src/services/ai-provider', () => ({
  aiService: {
    chat: vi.fn(),
  },
}));

const mockResume: ResumeData = {
  id: 'test-resume-1',
  source: 'zhilian',
  sourceUrl: 'https://example.com/resume/1',
  basic: {
    name: '张三',
    age: 28,
    gender: '男',
    education: '本科',
    major: '计算机科学',
    school: '北京大学',
    experience: 5,
    location: '北京',
  },
  intention: {
    position: '前端工程师',
    salary: '20-30K',
    industry: '互联网',
  },
  workHistory: [
    {
      company: 'ABC科技',
      position: '前端工程师',
      duration: '2020-2024',
      description: '负责公司核心产品的前端开发',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
  selfEvaluation: '熟练掌握前端技术栈',
  extractedAt: new Date(),
};

const mockJD: JDProfile = {
  id: 'test-jd-1',
  name: '高级前端工程师',
  content: '负责公司前端架构设计和核心功能开发',
  requirements: {
    education: '本科',
    experience: 3,
    major: ['计算机', '软件工程'],
    salary: { min: 20, max: 40 },
    skills: ['React', 'TypeScript', 'Node.js'],
    plus: ['Vue', 'Webpack'],
    exclude: [],
  },
  scoringRule: {
    mode: 'simple',
    strictness: 'medium',
  },
  messageTemplate: '您好{name}，期待与您沟通',
  createdAt: new Date(),
  updatedAt: new Date(),
  matchCount: 0,
};

describe('quickMatch', () => {
  it('完全匹配时返回高分', () => {
    const result = quickMatch(mockResume, mockJD);

    expect(result.score).toBeGreaterThan(50);
    expect(result.tags).toContain('学历符合');
    expect(result.tags).toContain('经验充足');
    expect(result.needDetail).toBe(true);
  });

  it('学历不符时返回相应标签', () => {
    const lowEduResume: ResumeData = {
      ...mockResume,
      basic: { ...mockResume.basic, education: '大专' },
    };

    const result = quickMatch(lowEduResume, mockJD);

    expect(result.tags).toContain('学历不符');
  });

  it('经验不足时返回相应标签', () => {
    const juniorResume: ResumeData = {
      ...mockResume,
      basic: { ...mockResume.basic, experience: 1 },
    };

    const result = quickMatch(juniorResume, mockJD);

    expect(result.tags).toContain('经验不足');
  });

  it('技能匹配时返回匹配数量', () => {
    const result = quickMatch(mockResume, mockJD);

    expect(result.tags.some(t => t.includes('技能匹配'))).toBe(true);
  });

  it('无技能匹配时返回低分', () => {
    const noSkillsResume: ResumeData = {
      ...mockResume,
      skills: ['Java', 'Spring'],
    };

    const result = quickMatch(noSkillsResume, mockJD);

    // 学历和经验匹配，分数为40，仍需详细分析
    expect(result.score).toBe(40);
    expect(result.needDetail).toBe(true);
  });

  it('空简历数据时不会崩溃', () => {
    const emptyResume = {
      id: 'empty',
      source: 'zhilian' as const,
      sourceUrl: '',
      basic: {
        name: '',
        age: 0,
        gender: '',
        education: '',
        major: '',
        school: '',
        experience: 0,
        location: '',
      },
      intention: { position: '', salary: '', industry: '' },
      workHistory: [],
      skills: [],
      selfEvaluation: '',
      extractedAt: new Date(),
    };

    const result = quickMatch(emptyResume, mockJD);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.tags).toBeDefined();
  });
});

describe('detailedMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('返回完整的匹配结果', async () => {
    const mockAIResponse = JSON.stringify({
      score: 85,
      hardConditions: {
        education: { match: true, reason: '学历符合要求' },
        experience: { match: true, reason: '经验充足' },
        major: { match: true, reason: '专业相关' },
      },
      workMatch: {
        score: 80,
        highlights: ['大厂经验'],
        gaps: [],
      },
      skillMatch: {
        score: 90,
        matched: ['React', 'TypeScript'],
        missing: [],
      },
      overall: {
        score: 85,
        impression: '优秀候选人',
      },
      tags: ['技术扎实', '经验丰富'],
      recommendReason: '技能匹配度高',
      concerns: [],
      interviewQuestions: ['请介绍项目经验'],
    });

    const { aiService } = await import('../../src/services/ai-provider');
    vi.mocked(aiService.chat).mockResolvedValue(mockAIResponse);

    const result = await detailedMatch(mockResume, mockJD);

    expect(result.score).toBe(85);
    expect(result.tags).toContain('技术扎实');
    expect(result.recommendReason).toBe('技能匹配度高');
  });

  it('AI 服务失败时返回默认结果', async () => {
    const { aiService } = await import('../../src/services/ai-provider');
    vi.mocked(aiService.chat).mockRejectedValue(new Error('AI 服务错误'));

    const result = await detailedMatch(mockResume, mockJD);

    expect(result.score).toBe(0);
    expect(result.tags).toContain('分析失败');
  });
});
