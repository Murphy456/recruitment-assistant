/**
 * JD 管理组件
 */

import React, { useState } from 'react';
import { JDProfile } from '../types/jd';
import { useJDStore } from '../stores/jds';

interface JDManagerProps {
  onBack: () => void;
}

const JDManager: React.FC<JDManagerProps> = ({ onBack }) => {
  const { jds, activeJD, createJD, updateJD, deleteJD, setActiveJD } = useJDStore();
  const [editingJD, setEditingJD] = useState<JDProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingJD(null);
  };

  const handleEdit = (jd: JDProfile) => {
    setEditingJD(jd);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    await deleteJD(id);
    setShowDeleteConfirm(null);
  };

  const handleSelect = (jd: JDProfile) => {
    setActiveJD(jd);
    onBack();
  };

  return (
    <div className="jd-manager">
      <div className="jd-manager-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h3>职位画像管理</h3>
        <button className="add-btn" onClick={handleCreate}>+ 新建</button>
      </div>

      {isCreating ? (
        <JDEditor
          onSave={async (data) => {
            await createJD(data);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      ) : editingJD ? (
        <JDEditor
          initialData={editingJD}
          onSave={async (data) => {
            await updateJD(editingJD.id, data);
            setEditingJD(null);
          }}
          onCancel={() => setEditingJD(null)}
        />
      ) : (
        <div className="jd-list">
          {jds.length === 0 ? (
            <div className="empty-state">
              <p>暂无职位画像</p>
              <p className="hint">点击"新建"创建第一个职位画像</p>
            </div>
          ) : (
            jds.map((jd) => (
              <div
                key={jd.id}
                className={`jd-card ${activeJD?.id === jd.id ? 'active' : ''}`}
              >
                <div className="jd-card-header">
                  <span className="jd-name">{jd.name}</span>
                  {activeJD?.id === jd.id && <span className="active-badge">当前</span>}
                </div>
                <div className="jd-card-info">
                  <span>匹配次数: {jd.matchCount}</span>
                  <span>创建于: {new Date(jd.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="jd-card-actions">
                  <button className="select-btn" onClick={() => handleSelect(jd)}>
                    选择
                  </button>
                  <button className="edit-btn" onClick={() => handleEdit(jd)}>
                    编辑
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => setShowDeleteConfirm(jd.id)}
                  >
                    删除
                  </button>
                </div>

                {showDeleteConfirm === jd.id && (
                  <div className="delete-confirm">
                    <p>确定删除此职位画像？</p>
                    <div className="confirm-actions">
                      <button onClick={() => handleDelete(jd.id)}>确认</button>
                      <button onClick={() => setShowDeleteConfirm(null)}>取消</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface JDEditorProps {
  initialData?: JDProfile;
  onSave: (data: Omit<JDProfile, 'id' | 'createdAt' | 'updatedAt' | 'matchCount'>) => Promise<void>;
  onCancel: () => void;
}

const JDEditor: React.FC<JDEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [education, setEducation] = useState(initialData?.requirements.education || '');
  const [experience, setExperience] = useState(initialData?.requirements.experience || 0);
  const [skills, setSkills] = useState(initialData?.requirements.skills.join(', ') || '');
  const [messageTemplate, setMessageTemplate] = useState(initialData?.messageTemplate || '');

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入职位名称');
      return;
    }

    await onSave({
      name: name.trim(),
      content: content.trim(),
      requirements: {
        education,
        experience,
        major: [],
        salary: { min: 0, max: 0 },
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        plus: [],
        exclude: [],
      },
      scoringRule: {
        mode: 'simple',
        strictness: 'medium',
      },
      messageTemplate: messageTemplate.trim(),
    });
  };

  return (
    <div className="jd-editor">
      <div className="form-group">
        <label>职位名称 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如：高级前端工程师"
        />
      </div>

      <div className="form-group">
        <label>职位描述</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="粘贴职位JD内容..."
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>学历要求</label>
          <select value={education} onChange={(e) => setEducation(e.target.value)}>
            <option value="">不限</option>
            <option value="大专">大专</option>
            <option value="本科">本科</option>
            <option value="硕士">硕士</option>
            <option value="博士">博士</option>
          </select>
        </div>

        <div className="form-group">
          <label>经验要求（年）</label>
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(parseInt(e.target.value, 10) || 0)}
            min={0}
          />
        </div>
      </div>

      <div className="form-group">
        <label>技能要求（逗号分隔）</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="React, TypeScript, Node.js"
        />
      </div>

      <div className="form-group">
        <label>打招呼模板</label>
        <textarea
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          placeholder="您好，我看到您的简历..."
          rows={3}
        />
      </div>

      <div className="editor-actions">
        <button className="save-btn" onClick={handleSave}>保存</button>
        <button className="cancel-btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

export default JDManager;
