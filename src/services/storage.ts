/**
 * IndexedDB 存储服务
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ResumeData } from '../types/resume';
import { JDProfile } from '../types/jd';
import { Settings, DEFAULT_SETTINGS } from '../types/settings';
import { MatchResult, UserFeedback, LearnedPreferences } from '../types/match';

interface RecruitmentDB extends DBSchema {
  resumes: {
    key: string;
    value: ResumeData;
    indexes: { 'by-source': string; 'by-date': Date };
  };
  jds: {
    key: string;
    value: JDProfile;
    indexes: { 'by-date': Date };
  };
  matchResults: {
    key: string;
    value: MatchResult & { resumeId: string; jdId: string; timestamp: Date };
    indexes: { 'by-resume': string; 'by-jd': string };
  };
  feedbacks: {
    key: string;
    value: UserFeedback;
    indexes: { 'by-resume': string };
  };
  preferences: {
    key: string;
    value: LearnedPreferences;
  };
}

const DB_NAME = 'recruitment-assistant';
const DB_VERSION = 1;

class StorageService {
  private db: IDBPDatabase<RecruitmentDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // 防止并发初始化
    if (this.db) return;
    if (!this.initPromise) {
      this.initPromise = openDB<RecruitmentDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // 简历存储
          if (!db.objectStoreNames.contains('resumes')) {
            const resumeStore = db.createObjectStore('resumes', { keyPath: 'id' });
            resumeStore.createIndex('by-source', 'source');
            resumeStore.createIndex('by-date', 'extractedAt');
          }

          // JD 画像存储
          if (!db.objectStoreNames.contains('jds')) {
            const jdStore = db.createObjectStore('jds', { keyPath: 'id' });
            jdStore.createIndex('by-date', 'updatedAt');
          }

          // 匹配结果存储
          if (!db.objectStoreNames.contains('matchResults')) {
            const matchStore = db.createObjectStore('matchResults', {
              keyPath: 'id',
              autoIncrement: true,
            });
            matchStore.createIndex('by-resume', 'resumeId');
            matchStore.createIndex('by-jd', 'jdId');
          }

          // 用户反馈存储
          if (!db.objectStoreNames.contains('feedbacks')) {
            const feedbackStore = db.createObjectStore('feedbacks', {
              keyPath: 'id',
              autoIncrement: true,
            });
            feedbackStore.createIndex('by-resume', 'resumeId');
          }

          // 学习偏好存储
          if (!db.objectStoreNames.contains('preferences')) {
            db.createObjectStore('preferences', { keyPath: 'id' });
          }
        },
      }).then((db) => {
        this.db = db;
      });
    }
    await this.initPromise;
  }

  private ensureDb(): IDBPDatabase<RecruitmentDB> {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
    return this.db;
  }

  // 简历操作
  async saveResume(resume: ResumeData): Promise<void> {
    const db = this.ensureDb();
    await db.put('resumes', resume);
  }

  async getResume(id: string): Promise<ResumeData | undefined> {
    const db = this.ensureDb();
    return db.get('resumes', id);
  }

  async getAllResumes(): Promise<ResumeData[]> {
    const db = this.ensureDb();
    return db.getAll('resumes');
  }

  async deleteResume(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('resumes', id);
  }

  // JD 操作
  async saveJD(jd: JDProfile): Promise<void> {
    const db = this.ensureDb();
    await db.put('jds', jd);
  }

  async getJD(id: string): Promise<JDProfile | undefined> {
    const db = this.ensureDb();
    return db.get('jds', id);
  }

  async getAllJDs(): Promise<JDProfile[]> {
    const db = this.ensureDb();
    return db.getAll('jds');
  }

  async deleteJD(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('jds', id);
  }

  // 匹配结果操作
  async saveMatchResult(
    resumeId: string,
    jdId: string,
    result: MatchResult
  ): Promise<void> {
    const db = this.ensureDb();
    await db.put('matchResults', {
      ...result,
      resumeId,
      jdId,
      timestamp: new Date(),
    });
  }

  async getMatchResultsByResume(resumeId: string): Promise<
    (MatchResult & { resumeId: string; jdId: string; timestamp: Date })[]
  > {
    const db = this.ensureDb();
    return db.getAllFromIndex('matchResults', 'by-resume', resumeId);
  }

  // 用户反馈操作
  async saveFeedback(feedback: UserFeedback): Promise<void> {
    const db = this.ensureDb();
    await db.put('feedbacks', feedback);
  }

  async getFeedbacks(): Promise<UserFeedback[]> {
    const db = this.ensureDb();
    return db.getAll('feedbacks');
  }

  // 学习偏好操作
  async savePreferences(prefs: LearnedPreferences): Promise<void> {
    const db = this.ensureDb();
    await db.put('preferences', { ...prefs, id: 'main' } as LearnedPreferences & { id: string });
  }

  async getPreferences(): Promise<LearnedPreferences | undefined> {
    const db = this.ensureDb();
    return db.get('preferences', 'main');
  }

  // 设置操作（使用 chrome.storage）
  async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  }

  async saveSettings(settings: Settings): Promise<void> {
    await chrome.storage.local.set({ settings });
  }

  // 导出数据
  async exportData(): Promise<{
    resumes: ResumeData[];
    jds: JDProfile[];
    feedbacks: UserFeedback[];
  }> {
    const db = this.ensureDb();
    return {
      resumes: await db.getAll('resumes'),
      jds: await db.getAll('jds'),
      feedbacks: await db.getAll('feedbacks'),
    };
  }

  // 清空数据
  async clearAll(): Promise<void> {
    const db = this.ensureDb();
    await db.clear('resumes');
    await db.clear('jds');
    await db.clear('matchResults');
    await db.clear('feedbacks');
    await db.clear('preferences');
    await chrome.storage.local.clear();
  }
}

export const storageService = new StorageService();
