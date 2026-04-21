/**
 * 数据脱敏工具
 */

import { ResumeData } from '../types/resume';

/**
 * 脱敏简历数据
 * 移除敏感信息如手机号、邮箱
 */
export function sanitizeResume(resume: ResumeData): ResumeData {
  return {
    ...resume,
    basic: {
      ...resume.basic,
      phone: undefined,
      email: undefined,
    },
  };
}

/**
 * 脱敏手机号
 */
export function sanitizePhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 脱敏邮箱
 */
export function sanitizeEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 2
    ? localPart[0] + '***' + localPart[localPart.length - 1]
    : '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * 检查是否包含敏感信息
 */
export function containsSensitiveInfo(text: string): boolean {
  const phonePattern = /1[3-9]\d{9}/;
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
  const idCardPattern = /\d{17}[\dXx]/;

  return (
    phonePattern.test(text) ||
    emailPattern.test(text) ||
    idCardPattern.test(text)
  );
}

/**
 * 移除文本中的敏感信息
 */
export function removeSensitiveInfo(text: string): string {
  let result = text;

  // 注意：必须先匹配更长的模式（身份证号），再匹配更短的模式（手机号）
  // 否则手机号正则会误匹配身份证号的一部分

  // 移除身份证号（18位数字或17位数字+X/x）
  result = result.replace(/\d{18}/g, '******************');
  result = result.replace(/\d{17}[Xx]/g, '******************');

  // 移除手机号（11位，以1开头，第二位3-9）
  result = result.replace(/1[3-9]\d{9}/g, '***********');

  // 移除邮箱
  result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, '***@***.***');

  return result;
}
