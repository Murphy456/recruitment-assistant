/**
 * Content Script 入口
 * 注入到招聘平台页面，负责简历提取和侧边栏渲染
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Sidebar from '../sidebar';
import { createSidebarContainer } from './utils/dom';
import './styles/main.css';

// 平台适配器
import { ZhilianAdapter } from './platforms/zhilian';

const adapters = [new ZhilianAdapter()];

// 检测当前平台
function detectPlatform() {
  const url = window.location.href;
  return adapters.find((adapter) => adapter.isTargetPage(url));
}

// 初始化
function init() {
  const adapter = detectPlatform();
  if (!adapter) {
    console.log('当前页面不在支持的招聘平台范围内');
    return;
  }

  console.log(`检测到平台: ${adapter.name}`);

  // 创建侧边栏容器
  const container = createSidebarContainer();

  // 渲染侧边栏
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Sidebar adapter={adapter} />
    </React.StrictMode>
  );

  // 监听页面变化
  observePageChanges(adapter);
}

// 监听页面变化（SPA路由）
function observePageChanges(adapter: typeof adapters[0]) {
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      // 触发页面变化事件
      window.dispatchEvent(new CustomEvent('routeChange', { detail: { adapter } }));
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 页面卸载时断开观察
  window.addEventListener('unload', () => {
    observer.disconnect();
  });
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
