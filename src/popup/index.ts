/**
 * Popup 脚本
 */

// 支持的页面配置
const SUPPORTED_PAGES = [
  { path: '/app/search', name: '搜索列表页', hasResumeDetail: true },
  { path: '/app/potential', name: '潜在人才页', hasResumeDetail: false },
];

// 检测当前标签页是否在支持的平台上
async function checkCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusEl = document.getElementById('status');
  const openBtn = document.getElementById('openBtn') as HTMLButtonElement;

  if (!tab.url) {
    statusEl!.textContent = '无法获取当前页面信息';
    openBtn.disabled = true;
    return;
  }

  try {
    const url = new URL(tab.url);

    // 检查是否是智联招聘域名
    if (!url.hostname.endsWith('zhaopin.com')) {
      statusEl!.textContent = '当前页面不在支持的招聘平台上';
      statusEl!.style.background = '#fee2e2';
      openBtn.disabled = true;
      return;
    }

    // 检查是否是支持的页面
    const matchedPage = SUPPORTED_PAGES.find(p => url.pathname.startsWith(p.path));

    if (matchedPage) {
      // 判断是简历详情页还是列表页
      const isResumeDetail = matchedPage.hasResumeDetail && url.searchParams.has('resumeNumber');
      const pageType = isResumeDetail ? '简历详情页' : matchedPage.name;

      statusEl!.textContent = `当前页面: 智联招聘 ${pageType}`;
      statusEl!.style.background = '#dcfce7';
      openBtn.disabled = false;
    } else {
      statusEl!.textContent = '请在搜索列表或潜在人才页面使用';
      statusEl!.style.background = '#fef3c7';
      openBtn.disabled = true;
    }
  } catch {
    statusEl!.textContent = '无法解析当前页面';
    statusEl!.style.background = '#fee2e2';
    openBtn.disabled = true;
  }
}

// 打开设置页面
document.getElementById('optionsBtn')?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 打开侧边栏（注入 content script）
document.getElementById('openBtn')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.id) {
    // 发送消息给 content script
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
  }
});

// 初始化
checkCurrentPage();
