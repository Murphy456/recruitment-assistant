/**
 * 匹配服务
 */

import { ResumeData } from '../types/resume';
import { JDProfile } from '../types/jd';
import { MatchResult, QuickMatchResult, ConditionMatch } from '../types/match';
import { aiService } from './ai-provider';

/**
 * 快速匹配（本地规则）
 */
export function quickMatch(resume: Partial<ResumeData>, jd: JDProfile): QuickMatchResult {
  const tags: string[] = [];
  let score = 0;

  // 学历匹配
  const educationMatch = checkEducation(resume.basic?.education || '', jd.requirements.education);
  if (educationMatch.match) {
    tags.push('学历符合');
    score += 20;
  } else {
    tags.push('学历不符');
  }

  // 经验匹配
  const expYears = resume.basic?.experience || 0;
  const requiredExp = jd.requirements.experience;
  if (expYears >= requiredExp) {
    tags.push('经验充足');
    score += 20;
  } else if (expYears >= requiredExp * 0.7) {
    tags.push('经验接近');
    score += 10;
  } else {
    tags.push('经验不足');
  }

  // 技能匹配
  const skills = resume.skills || [];
  const requiredSkills = jd.requirements.skills;
  const matchedSkills = skills.filter((s) =>
    requiredSkills.some((rs) => s.toLowerCase().includes(rs.toLowerCase()))
  );

  if (matchedSkills.length > 0) {
    tags.push(`${matchedSkills.length}项技能匹配`);
    score += Math.min(30, matchedSkills.length * 10);
  }

  // 判断是否需要详细分析
  const needDetail = score >= 40 || matchedSkills.length >= 2;

  return {
    score,
    tags,
    needDetail,
  };
}

/**
 * 详细匹配（AI 分析）
 */
export async function detailedMatch(
  resume: ResumeData,
  jd: JDProfile
): Promise<MatchResult> {
  const prompt = buildMatchPrompt(resume, jd);

  try {
    const response = await aiService.chat([
      {
        role: 'system',
        content: `你是一个专业的HR助手，负责分析简历与职位描述的匹配度。
请以JSON格式返回分析结果，格式如下：
{
  "score": 0-100的匹配分数,
  "hardConditions": {
    "education": { "match": true/false, "reason": "原因" },
    "experience": { "match": true/false, "reason": "原因" },
    "major": { "match": true/false, "reason": "原因" }
  },
  "workMatch": {
    "score": 0-100,
    "highlights": ["亮点1", "亮点2"],
    "gaps": ["不足1"]
  },
  "skillMatch": {
    "score": 0-100,
    "matched": ["技能1"],
    "missing": ["缺失技能1"]
  },
  "overall": {
    "score": 0-100,
    "impression": "整体印象"
  },
  "tags": ["标签1", "标签2"],
  "recommendReason": "推荐理由",
  "concerns": ["顾虑1"],
  "interviewQuestions": ["面试问题1"]
}`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // 解析 JSON 响应
    const result = JSON.parse(response);
    return result as MatchResult;
  } catch (error) {
    console.error('AI 匹配分析失败:', error);
    // 返回默认结果
    return getDefaultMatchResult();
  }
}

function checkEducation(actual: string, required: string): ConditionMatch {
  const levels = ['高中', '大专', '本科', '硕士', '博士'];
  const actualIndex = levels.findIndex((l) => actual.includes(l));
  const requiredIndex = levels.findIndex((l) => required.includes(l));

  if (actualIndex >= requiredIndex) {
    return { match: true, reason: `学历${actual}符合要求` };
  }
  return { match: false, reason: `学历${actual}低于要求${required}` };
}

function buildMatchPrompt(resume: ResumeData, jd: JDProfile): string {
  return `
请分析以下简历与职位描述的匹配度：

## 职位描述
${jd.content}

## 职位要求
- 学历：${jd.requirements.education}
- 经验：${jd.requirements.experience}年
- 专业：${jd.requirements.major.join('、') || '不限'}
- 必备技能：${jd.requirements.skills.join('、')}
- 加分项：${jd.requirements.plus.join('、') || '无'}
- 排除条件：${jd.requirements.exclude.join('、') || '无'}

## 候选人简历
- 姓名：${resume.basic.name}
- 年龄：${resume.basic.age}岁
- 学历：${resume.basic.education}
- 专业：${resume.basic.major}
- 学校：${resume.basic.school}
- 工作年限：${resume.basic.experience}年
- 求职意向：${resume.intention.position}
- 期望薪资：${resume.intention.salary}

## 工作经历
${resume.workHistory
  .map(
    (w) => `
- ${w.company} | ${w.position} | ${w.duration}
  ${w.description}
`
  )
  .join('\n')}

## 技能
${resume.skills.join('、')}

## 自我评价
${resume.selfEvaluation}

请给出详细的匹配分析。
`;
}

function getDefaultMatchResult(): MatchResult {
  return {
    score: 0,
    hardConditions: {
      education: { match: false, reason: '分析失败' },
      experience: { match: false, reason: '分析失败' },
      major: { match: false, reason: '分析失败' },
    },
    workMatch: {
      score: 0,
      highlights: [],
      gaps: ['AI分析失败，请重试'],
    },
    skillMatch: {
      score: 0,
      matched: [],
      missing: [],
    },
    overall: {
      score: 0,
      impression: '分析失败',
    },
    tags: ['分析失败'],
    recommendReason: 'AI分析失败，请检查配置后重试',
    concerns: ['无法完成匹配分析'],
    interviewQuestions: [],
  };
}
