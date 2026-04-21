/**
 * 消息模板工具
 */

import { ResumeData } from '../types/resume';
import { JDProfile } from '../types/jd';

/**
 * 默认消息模板
 */
export const DEFAULT_MESSAGE_TEMPLATE = `您好{name}，我是{company}的HR，看到您的简历觉得非常匹配我们正在招聘的{position}岗位，期待与您进一步沟通！`;

/**
 * 模板变量
 */
const TEMPLATE_VARIABLES = {
  '{name}': (resume: ResumeData) => resume.basic.name,
  '{position}': (resume: ResumeData) => resume.intention.position,
  '{company}': (_resume: ResumeData, jd: JDProfile) => jd.name,
  '{salary}': (resume: ResumeData) => resume.intention.salary,
  '{experience}': (resume: ResumeData) => `${resume.basic.experience}年`,
  '{education}': (resume: ResumeData) => resume.basic.education,
  '{school}': (resume: ResumeData) => resume.basic.school,
  '{major}': (resume: ResumeData) => resume.basic.major,
} as const;

/**
 * 渲染消息模板
 */
export function renderMessageTemplate(
  template: string,
  resume: ResumeData,
  jd: JDProfile
): string {
  let message = template;

  for (const [variable, getter] of Object.entries(TEMPLATE_VARIABLES)) {
    const value = getter(resume, jd) || '';
    message = message.replace(new RegExp(variable, 'g'), value);
  }

  return message;
}

/**
 * 验证模板是否有效
 */
export function validateTemplate(template: string): { valid: boolean; error?: string } {
  if (!template || template.trim().length === 0) {
    return { valid: false, error: '模板不能为空' };
  }

  if (template.length > 500) {
    return { valid: false, error: '模板长度不能超过500字' };
  }

  // 检查是否有未知的模板变量
  const variablePattern = /\{(\w+)\}/g;
  let match;
  const knownVariables = Object.keys(TEMPLATE_VARIABLES).map((v) => v.slice(1, -1));

  while ((match = variablePattern.exec(template)) !== null) {
    const variable = match[1];
    if (!knownVariables.includes(variable)) {
      return { valid: false, error: `未知的模板变量: {${variable}}` };
    }
  }

  return { valid: true };
}

/**
 * 获取模板变量列表
 */
export function getTemplateVariables(): string[] {
  return Object.keys(TEMPLATE_VARIABLES);
}
