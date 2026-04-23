/**
 * 智联招聘平台适配器
 */

import { PlatformAdapter, PlatformConfig } from '../../types/platform';
import { ResumeData, WorkExperience } from '../../types/resume';
import { waitForElement, safeExtractText } from '../utils/dom';

const ZHILIAN_CONFIG: PlatformConfig = {
  name: 'zhilian',
  selectors: {
    listPage: {
      container: '.resume-list',
      item: '.resume-item',
      name: '.name',
      position: '.position',
      experience: '.experience',
      education: '.education',
    },
    detailPage: {
      container: '.resume-detail',
      basicInfo: '.basic-info',
      workHistory: '.work-history',
      skills: '.skills',
      selfEvaluation: '.self-evaluation',
    },
    message: {
      button: '.chat-btn',
      input: '.chat-input',
      send: '.send-btn',
    },
  },
};

export class ZhilianAdapter implements PlatformAdapter {
  name = 'zhilian';
  private config = ZHILIAN_CONFIG;

  isTargetPage(url: string): boolean {
    // 支持的页面路径
    const supportedPaths = [
      '/app/search',      // 搜索列表页
      '/app/potential',   // 潜在人才页
    ];

    try {
      const urlObj = new URL(url);
      // 检查是否是智联招聘域名
      if (!urlObj.hostname.endsWith('zhaopin.com')) {
        return false;
      }
      // 检查是否是支持的页面路径
      // 搜索列表页和简历详情页（简历详情页路径也是 /app/search 但带有 resumeNumber 参数）
      return supportedPaths.some(path => urlObj.pathname.startsWith(path));
    } catch {
      return false;
    }
  }

  extractListItems(): Array<{
    element: HTMLElement;
    basicInfo: Partial<ResumeData>;
  }> {
    const items: Array<{
      element: HTMLElement;
      basicInfo: Partial<ResumeData>;
    }> = [];

    const itemElements = document.querySelectorAll(this.config.selectors.listPage.item);

    itemElements.forEach((el, index) => {
      const name = safeExtractText(el.querySelector(this.config.selectors.listPage.name));
      const position = safeExtractText(el.querySelector(this.config.selectors.listPage.position));
      const experience = safeExtractText(el.querySelector(this.config.selectors.listPage.experience));
      const education = safeExtractText(el.querySelector(this.config.selectors.listPage.education));

      items.push({
        element: el as HTMLElement,
        basicInfo: {
          id: `zhilian-${index}-${Date.now()}`,
          source: 'zhilian',
          sourceUrl: window.location.href,
          basic: {
            name,
            age: 0,
            gender: '',
            education,
            major: '',
            school: '',
            experience: this.parseExperience(experience),
            location: '',
          },
          intention: {
            position,
            salary: '',
            industry: '',
          },
          workHistory: [],
          skills: [],
          selfEvaluation: '',
          extractedAt: new Date(),
        },
      });
    });

    return items;
  }

  extractResumeDetail(): ResumeData {
    const container = document.querySelector(this.config.selectors.detailPage.container);

    if (!container) {
      throw new Error('未找到简历详情容器');
    }

    // 提取基本信息
    const basicInfoEl = container.querySelector(this.config.selectors.detailPage.basicInfo);
    const basic = this.extractBasicInfo(basicInfoEl);

    // 提取工作经历
    const workHistoryEl = container.querySelector(this.config.selectors.detailPage.workHistory);
    const workHistory = this.extractWorkHistory(workHistoryEl);

    // 提取技能
    const skillsEl = container.querySelector(this.config.selectors.detailPage.skills);
    const skills = this.extractSkills(skillsEl);

    // 提取自我评价
    const evaluationEl = container.querySelector(this.config.selectors.detailPage.selfEvaluation);
    const selfEvaluation = safeExtractText(evaluationEl);

    return {
      id: `zhilian-${Date.now()}`,
      source: 'zhilian',
      sourceUrl: window.location.href,
      basic,
      intention: {
        position: '',
        salary: '',
        industry: '',
      },
      workHistory,
      skills,
      selfEvaluation,
      extractedAt: new Date(),
    };
  }

  async sendMessage(message: string): Promise<boolean> {
    try {
      // 等待消息按钮出现
      const button = await waitForElement(this.config.selectors.message.button, 5000);
      if (!button) {
        console.error('未找到消息按钮');
        return false;
      }

      // 点击打开聊天窗口
      (button as HTMLElement).click();

      // 等待输入框
      const input = await waitForElement(this.config.selectors.message.input, 3000);
      if (!input) {
        console.error('未找到消息输入框');
        return false;
      }

      // 填入消息
      const inputEl = input as HTMLTextAreaElement;
      inputEl.value = message;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));

      // 等待发送按钮
      await new Promise((r) => setTimeout(r, 500));
      const sendBtn = await waitForElement(this.config.selectors.message.send, 2000);
      if (!sendBtn) {
        console.error('未找到发送按钮');
        return false;
      }

      // 点击发送
      (sendBtn as HTMLElement).click();

      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  }

  checkLoginStatus(): boolean {
    // 检查是否有登录标识
    const loginIndicator = document.querySelector('.user-info, .logged-in');
    return !!loginIndicator;
  }

  private extractBasicInfo(element: Element | null): ResumeData['basic'] {
    if (!element) {
      return {
        name: '',
        age: 0,
        gender: '',
        education: '',
        major: '',
        school: '',
        experience: 0,
        location: '',
      };
    }

    // 根据智联实际DOM结构提取
    const text = element.textContent || '';
    const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);

    return {
      name: safeExtractText(element.querySelector('.name')) || lines[0] || '',
      age: this.parseAge(text),
      gender: this.parseGender(text),
      education: this.parseEducation(text),
      major: this.parseMajor(text),
      school: this.parseSchool(text),
      experience: this.parseExperience(text),
      location: this.parseLocation(text),
    };
  }

  private extractWorkHistory(element: Element | null): WorkExperience[] {
    if (!element) return [];

    const items = element.querySelectorAll('.work-item');
    const history: WorkExperience[] = [];

    items.forEach((item) => {
      history.push({
        company: safeExtractText(item.querySelector('.company')),
        position: safeExtractText(item.querySelector('.position')),
        duration: safeExtractText(item.querySelector('.duration')),
        description: safeExtractText(item.querySelector('.description')),
      });
    });

    return history;
  }

  private extractSkills(element: Element | null): string[] {
    if (!element) return [];

    const skillEls = element.querySelectorAll('.skill-item, .skill-tag');
    return Array.from(skillEls).map((el) => safeExtractText(el)).filter(Boolean);
  }

  private parseExperience(text: string): number {
    const match = text.match(/(\d+)\s*年/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private parseAge(text: string): number {
    const match = text.match(/(\d+)\s*岁/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private parseGender(text: string): string {
    if (text.includes('男')) return '男';
    if (text.includes('女')) return '女';
    return '';
  }

  private parseEducation(text: string): string {
    const levels = ['博士', '硕士', '本科', '大专', '高中'];
    for (const level of levels) {
      if (text.includes(level)) return level;
    }
    return '';
  }

  private parseMajor(text: string): string {
    const match = text.match(/专业[：:]\s*(.+?)(?:\s|，|,|$)/);
    return match ? match[1].trim() : '';
  }

  private parseSchool(text: string): string {
    const match = text.match(/学校[：:]\s*(.+?)(?:\s|，|,|$)/);
    return match ? match[1].trim() : '';
  }

  private parseLocation(text: string): string {
    const match = text.match(/(?:现居|居住地)[：:]\s*(.+?)(?:\s|，|,|$)/);
    return match ? match[1].trim() : '';
  }
}
