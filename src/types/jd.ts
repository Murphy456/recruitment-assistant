/**
 * JD画像类型定义
 */

export interface JDProfile {
  id: string;
  name: string;
  content: string;
  requirements: {
    education: string;
    experience: number;
    major: string[];
    salary: {
      min: number;
      max: number;
    };
    skills: string[];
    plus: string[];
    exclude: string[];
  };
  scoringRule: {
    mode: 'simple' | 'advanced';
    strictness?: 'loose' | 'medium' | 'strict';
    hardConditions?: number;
    workMatch?: number;
    skillMatch?: number;
    overall?: number;
  };
  messageTemplate: string;
  createdAt: Date;
  updatedAt: Date;
  matchCount: number;
}

export interface JDRequirements {
  education: string;
  experience: number;
  major: string[];
  salary: {
    min: number;
    max: number;
  };
  skills: string[];
  plus: string[];
  exclude: string[];
}

export interface ScoringRule {
  mode: 'simple' | 'advanced';
  strictness?: 'loose' | 'medium' | 'strict';
  hardConditions?: number;
  workMatch?: number;
  skillMatch?: number;
  overall?: number;
}
