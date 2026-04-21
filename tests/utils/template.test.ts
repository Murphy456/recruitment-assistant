/**
 * 模板工具测试
 */

import { describe, it, expect } from 'vitest';
import {
  renderMessageTemplate,
  validateTemplate,
  getTemplateVariables,
  DEFAULT_MESSAGE_TEMPLATE,
} from '../../src/utils/template';
import { ResumeData } from '../../src/types/resume';
import { JDProfile } from '../../src/types/jd';

const mockResume: ResumeData = {
  id: 'test-1',
  source: 'zhilian',
  sourceUrl: 'https://example.com',
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
  intention: {
    position: '前端工程师',
    salary: '20-30K',
    industry: '互联网',
  },
  workHistory: [],
  skills: [],
  selfEvaluation: '',
  extractedAt: new Date(),
};

const mockJD: JDProfile = {
  id: 'jd-1',
  name: 'ABC公司',
  content: '招聘前端工程师',
  requirements: {
    education: '本科',
    experience: 3,
    major: [],
    salary: { min: 20, max: 40 },
    skills: [],
    plus: [],
    exclude: [],
  },
  scoringRule: { mode: 'simple' },
  messageTemplate: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  matchCount: 0,
};

describe('renderMessageTemplate', () => {
  it('替换所有模板变量', () => {
    const template = '您好{name}，我是{company}的HR，看到您应聘{position}岗位，期待与您沟通！';

    const result = renderMessageTemplate(template, mockResume, mockJD);

    expect(result).toBe('您好张三，我是ABC公司的HR，看到您应聘前端工程师岗位，期待与您沟通！');
  });

  it('处理空值变量', () => {
    const template = '您好{name}，学校：{school}';

    const result = renderMessageTemplate(template, mockResume, mockJD);

    expect(result).toBe('您好张三，学校：北京大学');
  });

  it('变量值为空时使用空字符串', () => {
    const emptyResume = {
      ...mockResume,
      basic: { ...mockResume.basic, name: '' },
    };

    const result = renderMessageTemplate('您好{name}', emptyResume, mockJD);

    expect(result).toBe('您好');
  });

  it('不修改没有变量的模板', () => {
    const template = '这是一条固定消息';

    const result = renderMessageTemplate(template, mockResume, mockJD);

    expect(result).toBe('这是一条固定消息');
  });

  it('替换多个相同变量', () => {
    const template = '{name}您好，{name}！';

    const result = renderMessageTemplate(template, mockResume, mockJD);

    expect(result).toBe('张三您好，张三！');
  });
});

describe('validateTemplate', () => {
  it('有效模板返回 valid: true', () => {
    const result = validateTemplate('您好{name}，期待沟通');

    expect(result.valid).toBe(true);
  });

  it('空模板返回错误', () => {
    const result = validateTemplate('');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('模板不能为空');
  });

  it('超长模板返回错误', () => {
    const longTemplate = 'x'.repeat(501);

    const result = validateTemplate(longTemplate);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('模板长度不能超过500字');
  });

  it('未知变量返回错误', () => {
    const result = validateTemplate('您好{unknownVar}');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('未知的模板变量');
  });

  it('只有空白字符的模板返回错误', () => {
    const result = validateTemplate('   ');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('模板不能为空');
  });
});

describe('getTemplateVariables', () => {
  it('返回所有支持的变量列表', () => {
    const variables = getTemplateVariables();

    expect(variables).toContain('{name}');
    expect(variables).toContain('{position}');
    expect(variables).toContain('{company}');
    expect(variables).toContain('{education}');
    expect(variables).toContain('{experience}');
  });
});

describe('DEFAULT_MESSAGE_TEMPLATE', () => {
  it('包含必要的变量', () => {
    expect(DEFAULT_MESSAGE_TEMPLATE).toContain('{name}');
    expect(DEFAULT_MESSAGE_TEMPLATE).toContain('{company}');
    expect(DEFAULT_MESSAGE_TEMPLATE).toContain('{position}');
  });
});
