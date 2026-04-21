/**
 * DOM 工具函数
 */

export function createSidebarContainer(): HTMLElement {
  // 检查是否已存在
  let container = document.getElementById('recruitment-assistant-sidebar');
  if (container) {
    return container;
  }

  // 创建新容器
  container = document.createElement('div');
  container.id = 'recruitment-assistant-sidebar';
  document.body.appendChild(container);

  return container;
}

export function removeSidebarContainer(): void {
  const container = document.getElementById('recruitment-assistant-sidebar');
  if (container) {
    container.remove();
  }
}

/**
 * 等待元素出现
 */
export function waitForElement(
  selector: string,
  timeout = 10000
): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * 批量等待元素
 */
export function waitForElements(
  selector: string,
  timeout = 10000
): Promise<Element[]> {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      resolve(Array.from(elements));
      return;
    }

    const observer = new MutationObserver(() => {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        observer.disconnect();
        resolve(Array.from(els));
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve([]);
    }, timeout);
  });
}

/**
 * 安全提取文本
 */
export function safeExtractText(element: Element | null): string {
  if (!element) return '';
  return element.textContent?.trim() || '';
}

/**
 * 安全提取属性
 */
export function safeExtractAttr(
  element: Element | null,
  attr: string
): string {
  if (!element) return '';
  return element.getAttribute(attr) || '';
}
