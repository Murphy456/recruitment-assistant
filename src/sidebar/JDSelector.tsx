/**
 * JD 选择器组件
 */

import React from 'react';
import { JDProfile } from '../types/jd';

interface JDSelectorProps {
  jds: JDProfile[];
  activeJD: JDProfile | null;
  onSelect: (jd: JDProfile | null) => void;
  onManage: () => void;
}

const JDSelector: React.FC<JDSelectorProps> = ({ jds, activeJD, onSelect, onManage }) => {
  return (
    <div className="jd-selector">
      <div className="jd-selector-header">
        <label>当前职位画像</label>
        <button className="manage-btn" onClick={onManage} title="管理职位画像">
          管理
        </button>
      </div>
      <select
        value={activeJD?.id || ''}
        onChange={(e) => {
          const jd = jds.find((j) => j.id === e.target.value);
          onSelect(jd || null);
        }}
      >
        <option value="">请选择职位画像</option>
        {jds.map((jd) => (
          <option key={jd.id} value={jd.id}>
            {jd.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default JDSelector;
