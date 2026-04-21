/**
 * 候选人列表组件
 */

import React from 'react';
import { Candidate, useCandidateStore } from '../stores/candidates';
import { JDProfile } from '../types/jd';
import { quickMatch } from '../services/matcher';

interface CandidateListProps {
  candidates: Candidate[];
  activeJD: JDProfile | null;
  onSelect: (candidate: Candidate) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, activeJD, onSelect }) => {
  const getScore = (candidate: Candidate): number => {
    if (candidate.detailResult) {
      return candidate.detailResult.score;
    }
    if (candidate.quickResult) {
      return candidate.quickResult.score;
    }
    if (activeJD) {
      return quickMatch(candidate.resume, activeJD).score;
    }
    return 0;
  };

  const getScoreClass = (score: number): string => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getStatusText = (status: Candidate['status']): string => {
    switch (status) {
      case 'pending':
        return '待分析';
      case 'analyzing':
        return '分析中...';
      case 'ready':
        return '已分析';
      case 'sending':
        return '发送中...';
      case 'sent':
        return '已发送';
      case 'error':
        return '错误';
      default:
        return '';
    }
  };

  return (
    <div className="candidate-list">
      <div className="list-header">
        <span>候选人 ({candidates.length})</span>
        {activeJD && candidates.length > 0 && (
          <button
            className="ra-btn ra-btn-secondary"
            onClick={() => {
              useCandidateStore.getState().analyzeAll(activeJD);
            }}
          >
            批量分析
          </button>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="empty-state">
          <p>暂无候选人数据</p>
          <p className="hint">请浏览招聘平台的简历列表页</p>
        </div>
      ) : (
        <div className="list-content">
          {candidates.map((candidate) => {
            const score = getScore(candidate);
            const scoreClass = getScoreClass(score);

            return (
              <div
                key={candidate.resume.id}
                className="candidate-card"
                onClick={() => onSelect(candidate)}
              >
                <div className="card-header">
                  <span className="name">{candidate.resume.basic.name}</span>
                  <span className={`match-score ${scoreClass}`}>{score}</span>
                </div>
                <div className="card-info">
                  <span>{candidate.resume.basic.education}</span>
                  <span>{candidate.resume.basic.experience}年经验</span>
                </div>
                <div className="card-intention">
                  {candidate.resume.intention.position}
                </div>
                <div className="card-status">
                  <span className={`status ${candidate.status}`}>
                    {getStatusText(candidate.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateList;
