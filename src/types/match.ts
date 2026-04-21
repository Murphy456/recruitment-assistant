/**
 * 匹配结果类型定义
 */

export interface MatchResult {
  score: number;
  hardConditions: {
    education: ConditionMatch;
    experience: ConditionMatch;
    major: ConditionMatch;
  };
  workMatch: {
    score: number;
    highlights: string[];
    gaps: string[];
  };
  skillMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  overall: {
    score: number;
    impression: string;
  };
  tags: string[];
  recommendReason: string;
  concerns: string[];
  interviewQuestions: string[];
}

export interface ConditionMatch {
  match: boolean;
  reason: string;
}

export interface QuickMatchResult {
  score: number;
  tags: string[];
  needDetail: boolean;
}

export interface UserFeedback {
  resumeId: string;
  jdId: string;
  aiScore: number;
  userAction: 'accept' | 'reject' | 'adjust';
  userScore?: number;
  timestamp: Date;
}

export interface LearnedPreferences {
  tagWeights: Record<string, number>;
  preferredTags: string[];
  excludedTags: string[];
  sampleCount: number;
}
