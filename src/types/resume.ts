/**
 * 简历数据类型定义
 */

export interface ResumeData {
  id: string;
  source: 'zhilian' | 'boss';
  sourceUrl: string;

  basic: {
    name: string;
    age: number;
    gender: string;
    education: string;
    major: string;
    school: string;
    experience: number;
    location: string;
    phone?: string;      // 脱敏后隐藏
    email?: string;      // 脱敏后隐藏
  };

  intention: {
    position: string;
    salary: string;
    industry: string;
  };

  workHistory: WorkExperience[];

  skills: string[];
  selfEvaluation: string;

  extractedAt: Date;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface BasicInfo {
  name: string;
  age: number;
  gender: string;
  education: string;
  major: string;
  school: string;
  experience: number;
  location: string;
}

export interface Intention {
  position: string;
  salary: string;
  industry: string;
}
