/**
 * 候选人详情组件
 */

import React, { useState } from 'react';
import { Candidate, useCandidateStore } from '../stores/candidates';
import { JDProfile } from '../types/jd';
import { PlatformAdapter } from '../types/platform';
import { renderMessageTemplate } from '../utils/template';

interface CandidateDetailProps {
  candidate: Candidate;
  activeJD: JDProfile | null;
  onBack: () => void;
  adapter: PlatformAdapter;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  activeJD,
  onBack,
  adapter: _adapter,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const { analyzeCandidate, sendGreeting } = useCandidateStore();

  const handleAnalyze = async () => {
    if (!activeJD) return;
    setAnalyzing(true);
    await analyzeCandidate(candidate, activeJD);
    setAnalyzing(false);
  };

  const handleSendGreeting = async () => {
    if (!activeJD?.messageTemplate) {
      alert('请先设置消息模板');
      return;
    }

    // 检查发送限制
    const limitCheck = await chrome.runtime.sendMessage({ type: 'CHECK_DAILY_LIMIT' });
    if (!limitCheck || !limitCheck.canSend) {
      alert(limitCheck?.count >= 0 ? '已达到今日发送上限' : '无法检查发送限制，请稍后重试');
      return;
    }

    // 使用模板工具渲染消息
    const message = renderMessageTemplate(activeJD.messageTemplate, candidate.resume, activeJD);

    const success = await sendGreeting(candidate, message);
    if (success) {
      alert('消息发送成功');
    } else {
      alert('消息发送失败');
    }
  };

  const getScoreClass = (score: number): string => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const result = candidate.detailResult || candidate.quickResult;

  return (
    <div className="candidate-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
      </div>

      {/* 基本信息 */}
      <div className="detail-section">
        <h3>{candidate.resume.basic.name}</h3>
        <div className="basic-info">
          <span>{candidate.resume.basic.age}岁</span>
          <span>{candidate.resume.basic.gender}</span>
          <span>{candidate.resume.basic.education}</span>
          <span>{candidate.resume.basic.experience}年经验</span>
        </div>
        <div className="school-info">
          {candidate.resume.basic.school} · {candidate.resume.basic.major}
        </div>
      </div>

      {/* 匹配结果 */}
      {activeJD && (
        <div className="detail-section">
          <div className="section-header">
            <h4>匹配分析</h4>
            {!candidate.detailResult && (
              <button
                className="ra-btn ra-btn-secondary"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? '分析中...' : '详细分析'}
              </button>
            )}
          </div>

          {result ? (
            <div className="match-result">
              <div className={`overall-score ${getScoreClass(result.score)}`}>
                <span className="score">{result.score}</span>
                <span className="label">匹配度</span>
              </div>

              {candidate.detailResult && (
                <>
                  {/* 标签 */}
                  <div className="tags">
                    {candidate.detailResult.tags.map((tag, i) => (
                      <span key={i} className="tag neutral">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 推荐理由 */}
                  <div className="recommend-reason">
                    <h5>推荐理由</h5>
                    <p>{candidate.detailResult.recommendReason}</p>
                  </div>

                  {/* 顾虑 */}
                  {candidate.detailResult.concerns.length > 0 && (
                    <div className="concerns">
                      <h5>潜在顾虑</h5>
                      <ul>
                        {candidate.detailResult.concerns.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 技能匹配 */}
                  <div className="skill-match">
                    <h5>技能匹配</h5>
                    <div className="matched">
                      {candidate.detailResult.skillMatch.matched.map((s, i) => (
                        <span key={i} className="tag positive">
                          {s}
                        </span>
                      ))}
                    </div>
                    {candidate.detailResult.skillMatch.missing.length > 0 && (
                      <div className="missing">
                        <span>缺失：</span>
                        {candidate.detailResult.skillMatch.missing.map((s, i) => (
                          <span key={i} className="tag negative">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="no-result">
              <p>请选择职位画像并进行分析</p>
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="detail-actions">
        <button
          className="ra-btn ra-btn-primary"
          onClick={handleSendGreeting}
          disabled={candidate.status === 'sent'}
        >
          {candidate.status === 'sent' ? '已发送' : '发送招呼'}
        </button>
      </div>
    </div>
  );
};

export default CandidateDetail;
