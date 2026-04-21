/**
 * 数据脱敏工具测试
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeResume,
  sanitizePhone,
  sanitizeEmail,
  containsSensitiveInfo,
  removeSensitiveInfo,
} from '../../src/utils/sanitizer';
import { ResumeData } from '../../src/types/resume';

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
    phone: '13812345678',
    email: 'zhangsan@example.com',
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

describe('sanitizeResume', () => {
  it('移除手机号和邮箱', () => {
    const result = sanitizeResume(mockResume);

    expect(result.basic.phone).toBeUndefined();
    expect(result.basic.email).toBeUndefined();
  });

  it('保留其他字段', () => {
    const result = sanitizeResume(mockResume);

    expect(result.basic.name).toBe('张三');
    expect(result.basic.education).toBe('本科');
  });

  it('不修改原始数据', () => {
    const original = { ...mockResume };
    sanitizeResume(mockResume);

    expect(mockResume.basic.phone).toBe(original.basic.phone);
    expect(mockResume.basic.email).toBe(original.basic.email);
  });
});

describe('sanitizePhone', () => {
  it('正确脱敏手机号', () => {
    expect(sanitizePhone('13812345678')).toBe('138****5678');
  });

  it('处理短号码', () => {
    expect(sanitizePhone('123')).toBe('123');
  });

  it('处理空值', () => {
    expect(sanitizePhone('')).toBe('');
    expect(sanitizePhone(null as any)).toBe(null);
  });
});

describe('sanitizeEmail', () => {
  it('正确脱敏邮箱', () => {
    expect(sanitizeEmail('zhangsan@example.com')).toBe('z***n@example.com');
  });

  it('处理短邮箱前缀', () => {
    expect(sanitizeEmail('ab@test.com')).toBe('***@test.com');
  });

  it('处理无效邮箱', () => {
    expect(sanitizeEmail('invalid')).toBe('invalid');
  });

  it('处理空值', () => {
    expect(sanitizeEmail('')).toBe('');
  });
});

describe('containsSensitiveInfo', () => {
  it('检测手机号', () => {
    expect(containsSensitiveInfo('联系我：13812345678')).toBe(true);
  });

  it('检测邮箱', () => {
    expect(containsSensitiveInfo('邮箱：test@example.com')).toBe(true);
  });

  it('检测身份证号', () => {
    expect(containsSensitiveInfo('身份证：110101199001011234')).toBe(true);
  });

  it('无敏感信息返回 false', () => {
    expect(containsSensitiveInfo('这是一段普通文本')).toBe(false);
  });
});

describe('removeSensitiveInfo', () => {
  it('移除手机号', () => {
    const result = removeSensitiveInfo('联系我：13812345678');

    expect(result).toBe('联系我：***********');
  });

  it('移除邮箱', () => {
    const result = removeSensitiveInfo('邮箱：test@example.com');

    expect(result).toBe('邮箱：***@***.***');
  });

  it('移除身份证号', () => {
    const input = '身份证：110101199001011234';
    const result = removeSensitiveInfo(input);

    // 验证身份证号被移除（不包含原始号码）
    expect(result).not.toContain('110101199001011234');
    expect(result).toContain('******************');
  });

  it('同时移除多种敏感信息', () => {
    const text = '手机：13812345678，邮箱：test@example.com';
    const result = removeSensitiveInfo(text);

    expect(result).not.toContain('13812345678');
    expect(result).not.toContain('test@example.com');
  });

  it('不修改无敏感信息的文本', () => {
    const text = '这是一段普通文本';
    const result = removeSensitiveInfo(text);

    expect(result).toBe(text);
  });
});
