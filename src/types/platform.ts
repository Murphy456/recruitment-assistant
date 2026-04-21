/**
 * 平台适配器类型定义
 */

import { ResumeData } from './resume';

export interface PlatformAdapter {
  name: string;

  isTargetPage(url: string): boolean;

  extractListItems(): Array<{
    element: HTMLElement;
    basicInfo: Partial<ResumeData>;
  }>;

  extractResumeDetail(): ResumeData;

  sendMessage(message: string): Promise<boolean>;

  checkLoginStatus(): boolean;
}

export interface PlatformConfig {
  name: string;
  selectors: {
    listPage: ListPageSelectors;
    detailPage: DetailPageSelectors;
    message: MessageSelectors;
  };
  apiEndpoints?: Record<string, string>;
}

export interface ListPageSelectors {
  container: string;
  item: string;
  name: string;
  position: string;
  experience: string;
  education: string;
}

export interface DetailPageSelectors {
  container: string;
  basicInfo: string;
  workHistory: string;
  skills: string;
  selfEvaluation: string;
}

export interface MessageSelectors {
  button: string;
  input: string;
  send: string;
}

export type PlatformType = 'zhilian' | 'boss';
