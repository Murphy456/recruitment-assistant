/**
 * 侧边栏主组件
 */

import React, { useEffect, useState } from 'react';
import { PlatformAdapter } from '../types/platform';
import { useJDStore } from '../stores/jds';
import { useCandidateStore } from '../stores/candidates';
import { useSettingsStore } from '../stores/settings';
import Header from './Header';
import JDSelector from './JDSelector';
import CandidateList from './CandidateList';
import CandidateDetail from './CandidateDetail';
import SettingsPanel from './SettingsPanel';

interface SidebarProps {
  adapter: PlatformAdapter;
}

type ViewMode = 'list' | 'detail' | 'settings';

const Sidebar: React.FC<SidebarProps> = ({ adapter }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [collapsed, setCollapsed] = useState(false);

  const { jds, activeJD, loadJDs } = useJDStore();
  const { candidates, selectedCandidate, selectCandidate, setCandidates } = useCandidateStore();
  const { loadSettings } = useSettingsStore();

  // 初始化
  useEffect(() => {
    loadSettings();
    loadJDs();
  }, [loadSettings, loadJDs]);

  // 监听页面变化，提取简历
  useEffect(() => {
    const handleRouteChange = () => {
      extractResumes();
    };

    window.addEventListener('routeChange', handleRouteChange);
    extractResumes();

    return () => {
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, [adapter]);

  const extractResumes = () => {
    try {
      const items = adapter.extractListItems();
      const resumes = items.map((item) => item.basicInfo as any);
      setCandidates(resumes);
    } catch (error) {
      console.error('提取简历失败:', error);
    }
  };

  if (collapsed) {
    return (
      <div className="collapsed-sidebar" onClick={() => setCollapsed(false)}>
        <span>展开</span>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSettings={() => setViewMode(viewMode === 'settings' ? 'list' : 'settings')}
      />

      {viewMode === 'settings' ? (
        <SettingsPanel />
      ) : (
        <>
          <JDSelector
            jds={jds}
            activeJD={activeJD}
            onSelect={(jd) => useJDStore.getState().setActiveJD(jd)}
          />

          {viewMode === 'list' && (
            <CandidateList
              candidates={candidates}
              activeJD={activeJD}
              onSelect={(c) => {
                selectCandidate(c);
                setViewMode('detail');
              }}
            />
          )}

          {viewMode === 'detail' && selectedCandidate && (
            <CandidateDetail
              candidate={selectedCandidate}
              activeJD={activeJD}
              onBack={() => setViewMode('list')}
              adapter={adapter}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;
