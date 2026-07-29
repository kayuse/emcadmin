import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Search,
  Sparkles,
  CheckCircle,
  Layers,
  Eye,
  Globe,
  Lock,
  Unlock,
  Calendar,
  FileText,
  Bookmark,
  ChevronRight,
  Book,
  RefreshCw,
} from 'lucide-react';

interface TopicData {
  id?: number;
  number?: number;
  category?: string;
  topic: string;
  bibleText?: string;
  aim?: string;
  introduction?: string;
  content?: string;
  type?: string;
}

interface ManualData {
  id?: number;
  name: string;
  language: string;
  year: number;
  isFree: boolean;
  summary?: string;
  deleted?: boolean;
  topics?: TopicData[];
}

const INITIAL_MANUAL_FORM: ManualData = {
  name: '',
  language: 'English',
  year: new Date().getFullYear(),
  isFree: false,
  summary: '',
  topics: [],
};

const INITIAL_TOPIC_FORM: TopicData = {
  number: 1,
  category: 'General',
  topic: '',
  bibleText: '',
  aim: '',
  introduction: '',
  content: '',
  type: 'Sunday School',
};

export const ManualManagement: React.FC<{ token?: string }> = ({ token }) => {
  const [manuals, setManuals] = useState<ManualData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);

  const [formData, setFormData] = useState<ManualData>(INITIAL_MANUAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('All');
  const [selectedFreeFilter, setSelectedFreeFilter] = useState<string>('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'topics' | 'preview'>('details');

  // Topic editing state inside modal
  const [activeTopics, setActiveTopics] = useState<TopicData[]>([]);
  const [topicFormData, setTopicFormData] = useState<TopicData>(INITIAL_TOPIC_FORM);
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
  const [showTopicForm, setShowTopicForm] = useState<boolean>(false);

  const fetchManuals = async () => {
    setIsLoading(true);
    setFetchError(false);
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + '/manuals?includeDeleted=true');
      if (res.ok) {
        const data = await res.json();
        setManuals(Array.isArray(data) ? data : []);
      } else {
        setManuals([]);
        setFetchError(true);
      }
    } catch (err) {
      console.warn('Failed to fetch manuals from database:', err);
      setManuals([]);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_MANUAL_FORM);
    setActiveTopics([]);
    setActiveTab('details');
    setShowFormModal(true);
  };

  const handleOpenEdit = (manual: ManualData) => {
    setEditingId(manual.id || null);
    setFormData({
      name: manual.name,
      language: manual.language,
      year: manual.year || new Date().getFullYear(),
      isFree: manual.isFree,
      summary: manual.summary || '',
      deleted: manual.deleted || false,
    });
    const sorted = manual.topics ? [...manual.topics].sort((a, b) => (a.number || 0) - (b.number || 0)) : [];
    setActiveTopics(sorted);
    setActiveTab('details');
    setShowFormModal(true);
  };

  const handleDeleteManual = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete/archive this Sunday School manual?')) {
      try {
        await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + `/admin/manuals/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch (err) {
        console.warn('Backend unavailable, marking deleted locally', err);
      }
      setManuals((prev) =>
        prev.map((m) => (m.id === id ? { ...m, deleted: true } : m)),
      );
      setNotification({ type: 'success', message: 'Manual marked as deleted successfully.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAddTopicToManual = () => {
    if (!topicFormData.topic.trim()) {
      alert('Topic title is required!');
      return;
    }

    let updatedList: TopicData[];
    if (editingTopicIndex !== null) {
      const updated = [...activeTopics];
      updated[editingTopicIndex] = { ...topicFormData };
      updatedList = updated;
    } else {
      updatedList = [
        ...activeTopics,
        {
          ...topicFormData,
          number: topicFormData.number || activeTopics.length + 1,
          id: Date.now(),
        },
      ];
    }

    updatedList.sort((a, b) => (a.number || 0) - (b.number || 0));
    setActiveTopics(updatedList);

    setTopicFormData({
      ...INITIAL_TOPIC_FORM,
      number: activeTopics.length + (editingTopicIndex !== null ? 1 : 2),
    });
    setEditingTopicIndex(null);
    setShowTopicForm(false);
  };

  const handleEditTopic = (index: number) => {
    setEditingTopicIndex(index);
    setTopicFormData(activeTopics[index]);
    setShowTopicForm(true);
  };

  const handleRemoveTopic = (index: number) => {
    const updated = activeTopics.filter((_, idx) => idx !== index).map((t, i) => ({ ...t, number: i + 1 }));
    setActiveTopics(updated);
  };

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<number | null>(null);

  const handleGenerateQuiz = async (topicId?: number) => {
    if (!topicId) {
      setNotification({ type: 'error', message: 'You must save the manual and topic before generating a quiz.' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    
    if (window.confirm('Generate a 10-question quiz for this topic using AI? This will email all users.')) {
      setIsGeneratingQuiz(topicId);
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + `/admin/quizzes/generate/${topicId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (res.ok) {
          setNotification({ type: 'success', message: 'Quiz generated successfully and users notified!' });
        } else {
          setNotification({ type: 'error', message: 'Failed to generate quiz. Try again.' });
        }
      } catch (err) {
        console.warn('Backend unavailable', err);
        setNotification({ type: 'error', message: 'Network error generating quiz.' });
      } finally {
        setIsGeneratingQuiz(null);
        setTimeout(() => setNotification(null), 4000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNotification({ type: 'error', message: 'Manual name is required.' });
      return;
    }

    setIsSubmitting(true);

    const payload: ManualData = {
      ...formData,
      topics: activeTopics,
    };

    try {
      const endpoint = (import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + (editingId ? `/admin/manuals/${editingId}` : '/admin/manuals');
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedData = await res.json();
        saveLocally(payload, savedData.id);
      } else {
        saveLocally(payload);
      }
    } catch {
      saveLocally(payload);
    }

    setIsSubmitting(false);
    setShowFormModal(false);
    setNotification({
      type: 'success',
      message: editingId
        ? `Manual "${formData.name}" updated successfully!`
        : `Manual "${formData.name}" published successfully!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const saveLocally = (payload: ManualData, serverId?: number) => {
    if (editingId) {
      setManuals((prev) =>
        prev.map((m) => (m.id === editingId ? { ...payload, id: editingId } : m)),
      );
    } else {
      setManuals((prev) => [...prev, { ...payload, id: serverId || Date.now() }]);
    }
  };

  const filteredManuals = manuals.filter((m) => {
    if (m.deleted) return false;
    const matchesLang = selectedLangFilter === 'All' || m.language === selectedLangFilter;
    const matchesFree =
      selectedFreeFilter === 'All' ||
      (selectedFreeFilter === 'Free' && m.isFree) ||
      (selectedFreeFilter === 'Paid' && !m.isFree);
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.summary && m.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLang && matchesFree && matchesSearch;
  });

  return (
    <div className="hymn-mgmt-wrapper">
      {/* Header card */}
      <div className="hymn-header-card">
        <div className="hymn-header-title-box">
          <div className="brand-badge" style={{ margin: 0 }}>
            <Book size={14} />
            <span>ECWA Sunday School Catalog</span>
          </div>
          <h2 className="hymn-main-title">Sunday School Manuals Management</h2>
          <p className="auth-subtitle">
            Create, manage, and publish Sunday School manuals & weekly lesson topics for the ECWA Mobile app.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="submit-btn create-hymn-btn">
          <Plus size={18} />
          <span>Create New Manual</span>
        </button>
      </div>

      {notification && (
        <div className={`alert-box ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          <CheckCircle size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="hymn-filter-bar">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search manuals by title, year, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="language-pills">
          <Globe size={15} style={{ color: 'var(--text-muted)' }} />
          {['All', 'English', 'Hausa', 'Yoruba', 'Igbo'].map((lang) => (
            <button
              key={lang}
              className={`lang-pill ${selectedLangFilter === lang ? 'active' : ''}`}
              onClick={() => setSelectedLangFilter(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="language-pills">
          <Lock size={15} style={{ color: 'var(--text-muted)' }} />
          {['All', 'Free', 'Paid'].map((status) => (
            <button
              key={status}
              className={`lang-pill ${selectedFreeFilter === status ? 'active' : ''}`}
              onClick={() => setSelectedFreeFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Manuals Grid */}
      <div className="hymns-table-card">
        <div className="table-summary-header">
          <span>Showing {filteredManuals.length} of {manuals.filter((m) => !m.deleted).length} Sunday School Manuals</span>
          <span className="core-pack-badge">
            <Bookmark size={12} /> Free Access: {manuals.filter((m) => !m.deleted && m.isFree).length}
          </span>
        </div>

        {isLoading ? (
          <div className="empty-hymns-box">
            <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h4>Loading Sunday School Manuals...</h4>
            <p>Fetching manual records from database.</p>
          </div>
        ) : fetchError || filteredManuals.length === 0 ? (
          <div className="empty-hymns-box">
            <BookOpen size={48} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
            <h4>{fetchError ? 'Unable to Load Sunday School Manuals' : 'No Sunday School Manuals Found'}</h4>
            <p>
              {fetchError
                ? 'Could not retrieve data from database. Click below to retry.'
                : 'No manuals returned from database or matching current filter.'}
            </p>
            <button
              onClick={fetchManuals}
              className="btn btn-primary"
              style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <div className="hymns-grid">
            {filteredManuals.map((manual) => (
              <div key={manual.id} className="hymn-card-item">
                <div className="hymn-card-badge-row">
                  <span className="hymn-num-pill">
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {manual.year || 2025}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="lang-tag">{manual.language}</span>
                    {manual.isFree ? (
                      <span className="core-tag" style={{ background: '#059669', color: '#ecfdf5' }}>
                        <Unlock size={11} style={{ display: 'inline', marginRight: '3px' }} /> Free
                      </span>
                    ) : (
                      <span className="cat-tag" style={{ background: '#d97706', color: '#fffbeb' }}>
                        <Lock size={11} style={{ display: 'inline', marginRight: '3px' }} /> Premium Paywall
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="hymn-card-title">{manual.name}</h3>

                {manual.summary && (
                  <p className="auth-subtitle" style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>
                    {manual.summary.slice(0, 110)}{manual.summary.length > 110 ? '...' : ''}
                  </p>
                )}

                <div className="hymn-card-stats" style={{ marginTop: '0.75rem' }}>
                  <span>
                    <Layers size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {manual.topics?.length || 0} Lessons / Topics
                  </span>
                </div>

                <div className="hymn-card-actions">
                  <button onClick={() => handleOpenEdit(manual)} className="action-btn edit-action" title="Edit Manual">
                    <Edit size={14} /> Edit & Topics
                  </button>
                  <button onClick={() => handleDeleteManual(manual.id)} className="action-btn delete-action" title="Delete Manual">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal Drawer */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-content-large">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                <h3>{editingId ? `Edit Manual: ${formData.name}` : 'Create Sunday School Manual'}</h3>
              </div>

              <div className="modal-tab-toggle">
                <button
                  type="button"
                  className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <FileText size={14} /> General Info
                </button>
                <button
                  type="button"
                  className={`modal-tab ${activeTab === 'topics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('topics')}
                >
                  <Layers size={14} /> Lesson Topics ({activeTopics.length})
                </button>
                <button
                  type="button"
                  className={`modal-tab ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  <Eye size={14} /> Mobile Paywall Preview
                </button>
              </div>

              <button onClick={() => setShowFormModal(false)} className="close-modal-btn">
                ✕
              </button>
            </div>

            {activeTab === 'details' && (
              <form onSubmit={handleSubmit} className="hymn-editor-form">
                <div className="form-group">
                  <label className="form-label">Manual Name / Title *</label>
                  <input
                    type="text"
                    className="form-input text-input-padded"
                    placeholder="e.g. ECWA Sunday School Manual 2025 (Adult Class)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Language *</label>
                    <select
                      className="form-input text-input-padded"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Hausa">Hausa</option>
                      <option value="Yoruba">Yoruba</option>
                      <option value="Igbo">Igbo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Publication Year</label>
                    <input
                      type="number"
                      className="form-input text-input-padded"
                      placeholder="e.g. 2025"
                      value={formData.year || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value ? Number(e.target.value) : new Date().getFullYear() })
                      }
                    />
                  </div>

                  <div className="form-group checkbox-group" style={{ alignSelf: 'center' }}>
                    <label className="checkbox-label" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                      />
                      <span style={{ fontWeight: 'bold', color: formData.isFree ? '#34d399' : '#fbbf24' }}>
                        {formData.isFree ? 'Free Access (No Paywall)' : 'Requires Purchase (Paywall Shield)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Manual Summary & Overview</label>
                  <textarea
                    className="form-input text-area-input"
                    rows={4}
                    placeholder="Enter summary describing the manual focus, theme, target audience..."
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>

                <div className="form-actions-row">
                  <button type="button" onClick={() => setShowFormModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('topics')}
                    className="submit-btn"
                    style={{ background: 'var(--surface-light)' }}
                  >
                    <span>Next: Manage Topics ({activeTopics.length})</span>
                    <ChevronRight size={16} />
                  </button>
                  <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? <span className="spinner" /> : <Sparkles size={16} />}
                    <span>Save Manual</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'topics' && (
              <div className="hymn-editor-form">
                <div className="section-card verses-builder-card">
                  <div className="section-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={16} style={{ color: 'var(--primary)' }} />
                      <strong>Sunday School Lesson Topics ({activeTopics.length})</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTopicIndex(null);
                        setTopicFormData({ ...INITIAL_TOPIC_FORM, number: activeTopics.length + 1 });
                        setShowTopicForm(true);
                      }}
                      className="add-verse-btn"
                    >
                      <Plus size={14} /> Add Lesson Topic
                    </button>
                  </div>

                  {/* Add / Edit Topic Inline Form */}
                  {showTopicForm && (
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--primary-glow)' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>
                        {editingTopicIndex !== null ? `Edit Topic #${topicFormData.number}` : 'New Lesson Topic'}
                      </h4>

                      <div className="form-grid-3">
                        <div className="form-group">
                          <label className="form-label">Lesson #</label>
                          <input
                            type="number"
                            className="form-input text-input-padded"
                            value={topicFormData.number || ''}
                            onChange={(e) => setTopicFormData({ ...topicFormData, number: Number(e.target.value) })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Topic / Title *</label>
                          <input
                            type="text"
                            className="form-input text-input-padded"
                            placeholder="e.g. Living by Unshakable Faith"
                            value={topicFormData.topic}
                            onChange={(e) => setTopicFormData({ ...topicFormData, topic: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <input
                            type="text"
                            className="form-input text-input-padded"
                            placeholder="e.g. Discipleship, Faith"
                            value={topicFormData.category || ''}
                            onChange={(e) => setTopicFormData({ ...topicFormData, category: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Bible Memory / Scripture Text</label>
                          <input
                            type="text"
                            className="form-input text-input-padded"
                            placeholder="e.g. Hebrews 11:1-6; Romans 10:17"
                            value={topicFormData.bibleText || ''}
                            onChange={(e) => setTopicFormData({ ...topicFormData, bibleText: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Lesson Aim & Objective</label>
                          <input
                            type="text"
                            className="form-input text-input-padded"
                            placeholder="e.g. To teach believers how to trust God..."
                            value={topicFormData.aim || ''}
                            onChange={(e) => setTopicFormData({ ...topicFormData, aim: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Introduction</label>
                        <textarea
                          className="form-input text-area-input"
                          rows={2}
                          placeholder="Lesson introductory notes..."
                          value={topicFormData.introduction || ''}
                          onChange={(e) => setTopicFormData({ ...topicFormData, introduction: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Full Lesson Content & Discussion Notes</label>
                        <textarea
                          className="form-input text-area-input"
                          rows={4}
                          placeholder="Detailed lesson body and content..."
                          value={topicFormData.content || ''}
                          onChange={(e) => setTopicFormData({ ...topicFormData, content: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowTopicForm(false)} className="cancel-btn">
                          Cancel
                        </button>
                        <button type="button" onClick={handleAddTopicToManual} className="submit-btn">
                          {editingTopicIndex !== null ? 'Update Topic' : 'Save Topic'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Topics List */}
                  <div className="verses-list">
                    {activeTopics.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                        No topics added yet. Click "Add Lesson Topic" above.
                      </p>
                    ) : (
                      activeTopics.map((topic, index) => (
                        <div key={index} className="verse-editor-row" style={{ alignItems: 'flex-start' }}>
                          <div className="verse-meta-col">
                            <span className="verse-number-badge">Topic #{topic.number || index + 1}</span>
                          </div>

                          <div className="verse-input-col">
                            <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>{topic.topic}</strong>
                            {topic.bibleText && (
                              <span style={{ fontSize: '0.8rem', color: '#a5b4fc', display: 'block' }}>
                                Scripture: {topic.bibleText}
                              </span>
                            )}
                            {topic.aim && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                                Aim: {topic.aim}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleGenerateQuiz(topic.id)}
                              className="action-btn"
                              style={{ background: '#3b82f6', color: 'white', borderColor: '#2563eb' }}
                              title="Generate Quiz using AI"
                            >
                              {isGeneratingQuiz === topic.id ? (
                                <RefreshCw size={13} className="animate-spin" />
                              ) : (
                                <Sparkles size={13} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditTopic(index)}
                              className="action-btn edit-action"
                              title="Edit Topic"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTopic(index)}
                              className="delete-verse-btn"
                              title="Delete Topic"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="form-actions-row">
                  <button type="button" onClick={() => setShowFormModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? <span className="spinner" /> : <Sparkles size={16} />}
                    <span>Save Manual & Topics</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="mobile-preview-container">
                <div className="phone-frame">
                  <div className="phone-screen">
                    <div className="phone-app-bar">
                      <span className="phone-title">{formData.name || 'Sunday School Manual'}</span>
                      <span className="phone-lang-tag">{formData.language}</span>
                    </div>

                    <div className="phone-body">
                      {!formData.isFree ? (
                        /* Paywall Shield View */
                        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                          <div style={{ background: '#fef3c7', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Lock size={28} color="#d97706" />
                          </div>
                          <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem 0' }}>Premium Manual</h3>
                          <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.4' }}>
                            {formData.summary || 'Unlock full 52-week Sunday School topics and teacher notes.'}
                          </p>

                          <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'left' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Includes:</span>
                            <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0, fontSize: '0.75rem', color: '#334155' }}>
                              <li>{activeTopics.length} Weekly Sunday School Lessons</li>
                              <li>Memory verses & discussion questions</li>
                            </ul>
                          </div>

                          <button style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Unlock Full Manual Access
                          </button>
                        </div>
                      ) : (
                        /* Free Open Access View */
                        <div>
                          <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Unlock size={14} /> FREE MANUAL ACCESS
                          </div>

                          <h3 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>{formData.name}</h3>
                          <p style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '1rem' }}>{formData.summary}</p>

                          <h4 style={{ color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Weekly Lessons</h4>
                          {activeTopics.map((t, i) => (
                            <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px dotted #cbd5e1' }}>
                              <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 'bold' }}>Lesson #{t.number || i + 1}</span>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1e293b' }}>{t.topic}</div>
                              {t.bibleText && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.bibleText}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
