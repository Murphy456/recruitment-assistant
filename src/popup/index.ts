/**
 * Popup 脚本
 */

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

  // 检查是否在支持的平台上
  const supportedPlatforms = ['zhaopin.com'];
  const url = tab.url || '';
  const isSupported = supportedPlatforms.some((p) => url.includes(p));

  if (isSupported) {
    statusEl!.textContent = '当前页面支持招聘助手';
    statusEl!.style.background = '#dcfce7';
    openBtn.disabled = false;
  } else {
    statusEl!.textContent = '当前页面不在支持的招聘平台上';
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
