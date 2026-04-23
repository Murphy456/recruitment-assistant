/**
 * 设置面板组件
 */

import React from 'react';
import { useSettingsStore } from '../stores/settings';

const SettingsPanel: React.FC = () => {
  const { settings, updateAIConfig, updateSendConfig, updateDisplayConfig } = useSettingsStore();

  const isCustomProvider = settings.ai.provider === 'custom';

  return (
    <div className="settings-panel">
      <h3>设置</h3>

      {/* AI 配置 */}
      <div className="settings-section">
        <h4>AI 配置</h4>
        <div className="form-group">
          <label>提供商</label>
          <select
            value={settings.ai.provider}
            onChange={(e) => updateAIConfig({ provider: e.target.value as any })}
          >
            <option value="qwen">通义千问</option>
            <option value="openai">OpenAI</option>
            <option value="zhipu">智谱AI</option>
            <option value="moonshot">Moonshot</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        {isCustomProvider && (
          <div className="form-group">
            <label>API 地址</label>
            <input
              type="text"
              value={settings.ai.customBaseUrl || ''}
              onChange={(e) => updateAIConfig({ customBaseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
            />
          </div>
        )}

        <div className="form-group">
          <label>模型</label>
          <input
            type="text"
            value={settings.ai.model}
            onChange={(e) => updateAIConfig({ model: e.target.value })}
            placeholder="模型名称"
          />
        </div>

        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            value={settings.ai.apiKey}
            onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
            placeholder="请输入 API Key"
          />
        </div>
      </div>

      {/* 发送配置 */}
      <div className="settings-section">
        <h4>发送配置</h4>
        <div className="form-group">
          <label>每日发送上限</label>
          <input
            type="number"
            value={settings.send.dailyLimit}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 200) {
                updateSendConfig({ dailyLimit: value });
              }
            }}
            min={1}
            max={200}
          />
        </div>

        <div className="form-group">
          <label>最小间隔（秒）</label>
          <input
            type="number"
            value={settings.send.minInterval}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 10 && value <= 300) {
                updateSendConfig({ minInterval: value });
              }
            }}
            min={10}
            max={300}
          />
        </div>

        <div className="form-group">
          <label>最大间隔（秒）</label>
          <input
            type="number"
            value={settings.send.maxInterval}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 30 && value <= 600) {
                updateSendConfig({ maxInterval: value });
              }
            }}
            min={30}
            max={600}
          />
        </div>
      </div>

      {/* 显示配置 */}
      <div className="settings-section">
        <h4>显示配置</h4>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.display.showTags}
              onChange={(e) => updateDisplayConfig({ showTags: e.target.checked })}
            />
            显示标签
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.display.showReason}
              onChange={(e) => updateDisplayConfig({ showReason: e.target.checked })}
            />
            显示推荐理由
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
