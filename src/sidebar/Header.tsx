/**
 * 侧边栏头部组件
 */

import React from 'react';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle, onSettings }) => {
  return (
    <div className="sidebar-header">
      <div className="header-title">
        <h1>招聘助手</h1>
      </div>
      <div className="header-actions">
        <button className="icon-btn" onClick={onSettings} title="设置">
          ⚙️
        </button>
        <button className="icon-btn" onClick={onToggle} title={collapsed ? '展开' : '收起'}>
          {collapsed ? '◀' : '▶'}
        </button>
      </div>
    </div>
  );
};

export default Header;
