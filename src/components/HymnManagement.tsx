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
  ArrowUp,
  ArrowDown,
  Eye,
  Globe,
  Music,
  Bookmark,
} from 'lucide-react';

interface VerseInput {
  verseNumber: number;
  text: string;
}

interface HymnData {
  id?: number;
  hymnNumber: number | '';
  title: string;
  language: string;
  category: string;
  isCorePack: boolean;
  linkedHymnId: number | '' | null;
  chorus: string;
  verses: VerseInput[];
}

const INITIAL_FORM: HymnData = {
  hymnNumber: '',
  title: '',
  language: 'English',
  category: 'Worship',
  isCorePack: false,
  linkedHymnId: '',
  chorus: '',
  verses: [
    { verseNumber: 1, text: '' },
  ],
};

// Initial sample hymns for instant interactive demonstration
const INITIAL_HYMNS: (HymnData & { id: number })[] = [
  {
    id: 1,
    hymnNumber: 1,
    title: 'Amazing Grace',
    language: 'English',
    category: 'Grace & Faith',
    isCorePack: true,
    linkedHymnId: 3,
    chorus: '',
    verses: [
      {
        verseNumber: 1,
        text: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.',
      },
      {
        verseNumber: 2,
        text: "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.",
      },
    ],
  },
  {
    id: 2,
    hymnNumber: 2,
    title: 'How Great Thou Art',
    language: 'English',
    category: 'Adoration',
    isCorePack: true,
    linkedHymnId: 4,
    chorus: 'Then sings my soul, My Saviour God, to Thee,\nHow great Thou art, How great Thou art!',
    verses: [
      {
        verseNumber: 1,
        text: 'O Lord my God, When I in awesome wonder\nConsider all the worlds Thy Hands have made;\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.',
      },
      {
        verseNumber: 2,
        text: 'When through the woods, and forest glades I wander,\nAnd hear the birds sing sweetly in the trees.\nWhen I look down, from lofty mountain grandeur\nAnd see the brook, and feel the gentle breeze.',
      },
    ],
  },
  {
    id: 3,
    hymnNumber: 1,
    title: "Ore Ofe, B'o Ti Dun To",
    language: 'Yoruba',
    category: 'Grace & Faith',
    isCorePack: true,
    linkedHymnId: 1,
    chorus: '',
    verses: [
      {
        verseNumber: 1,
        text: "Ore ofe, b'o ti dun to\nT'o gba emi rala;\nMo ti nu, O ti ri mi,\nMo fo, O si la mi.",
      },
    ],
  },
];

export const HymnManagement: React.FC<{ token?: string }> = ({ token }) => {
  const [hymns, setHymns] = useState<(HymnData & { id: number })[]>(() => {
    const saved = localStorage.getItem('ecwa_hymns_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_HYMNS;
      }
    }
    return INITIAL_HYMNS;
  });

  const [formData, setFormData] = useState<HymnData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'form' | 'preview'>('form');

  useEffect(() => {
    localStorage.setItem('ecwa_hymns_data', JSON.stringify(hymns));
  }, [hymns]);

  useEffect(() => {
    const fetchHymns = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + '/hymns');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHymns(data);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using initial/cached state', err);
      }
    };
    fetchHymns();
  }, []);

  const handleAddVerse = () => {
    setFormData((prev) => ({
      ...prev,
      verses: [
        ...prev.verses,
        { verseNumber: prev.verses.length + 1, text: '' },
      ],
    }));
  };

  const handleRemoveVerse = (index: number) => {
    if (formData.verses.length <= 1) {
      alert('A hymn must have at least one verse!');
      return;
    }
    const updated = formData.verses
      .filter((_, idx) => idx !== index)
      .map((v, i) => ({ ...v, verseNumber: i + 1 }));
    setFormData((prev) => ({ ...prev, verses: updated }));
  };

  const handleVerseTextChange = (index: number, text: string) => {
    const updated = [...formData.verses];
    updated[index] = { ...updated[index], text };
    setFormData((prev) => ({ ...prev, verses: updated }));
  };

  const handleMoveVerse = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.verses.length) return;
    const list = [...formData.verses];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    // re-number
    const renumbered = list.map((v, i) => ({ ...v, verseNumber: i + 1 }));
    setFormData((prev) => ({ ...prev, verses: renumbered }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      hymnNumber: hymns.length > 0 ? Math.max(...hymns.map((h) => Number(h.hymnNumber) || 0)) + 1 : 1,
    });
    setActivePreviewTab('form');
    setShowFormModal(true);
  };

  const handleOpenEdit = (hymn: HymnData & { id: number }) => {
    setEditingId(hymn.id);
    setFormData({
      hymnNumber: hymn.hymnNumber,
      title: hymn.title,
      language: hymn.language,
      category: hymn.category,
      isCorePack: hymn.isCorePack,
      linkedHymnId: hymn.linkedHymnId ?? '',
      chorus: hymn.chorus || '',
      verses: hymn.verses && hymn.verses.length > 0 ? hymn.verses : [{ verseNumber: 1, text: '' }],
    });
    setActivePreviewTab('form');
    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this hymn?')) {
      try {
        await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + `/hymns/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch (err) {
        console.warn('Backend unavailable, deleting locally', err);
      }
      setHymns((prev) => prev.filter((h) => h.id !== id));
      setNotification({ type: 'success', message: 'Hymn deleted successfully.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setNotification({ type: 'error', message: 'Hymn title is required.' });
      return;
    }
    if (!formData.hymnNumber) {
      setNotification({ type: 'error', message: 'Hymn number is required.' });
      return;
    }

    setIsSubmitting(true);

    const validVerses = formData.verses.filter((v) => v.text.trim().length > 0);

    const payload: HymnData & { id?: number } = {
      hymnNumber: Number(formData.hymnNumber),
      title: formData.title.trim(),
      language: formData.language,
      category: formData.category,
      isCorePack: formData.isCorePack,
      linkedHymnId: formData.linkedHymnId ? Number(formData.linkedHymnId) : null,
      chorus: formData.chorus.trim(),
      verses: validVerses,
    };

    try {
      const endpoint = (import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + (editingId ? `/hymns/${editingId}` : '/hymns');
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
      message: editingId ? `Hymn #${formData.hymnNumber} updated successfully!` : `Hymn #${formData.hymnNumber} added successfully!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const saveLocally = (payload: HymnData, serverId?: number) => {
    if (editingId) {
      setHymns((prev) =>
        prev.map((h) => (h.id === editingId ? { ...payload, id: editingId } : h)),
      );
    } else {
      setHymns((prev) => [...prev, { ...payload, id: serverId || Date.now() }]);
    }
  };

  const filteredHymns = hymns.filter((h) => {
    const matchesLang = selectedLangFilter === 'All' || h.language === selectedLangFilter;
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hymnNumber.toString().includes(searchQuery) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.chorus && h.chorus.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLang && matchesSearch;
  });

  return (
    <div className="hymn-mgmt-wrapper">
      {/* Header section */}
      <div className="hymn-header-card">
        <div className="hymn-header-title-box">
          <div className="brand-badge" style={{ margin: 0 }}>
            <Music size={14} />
            <span>ECWA Hymnal Registry</span>
          </div>
          <h2 className="hymn-main-title">Hymn & Chorus Management</h2>
          <p className="auth-subtitle">
            Create, publish, and structure hymns with choruses and verses for the ECWA Mobile app.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="submit-btn create-hymn-btn">
          <Plus size={18} />
          <span>Add New Hymn</span>
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
            placeholder="Search by hymn #, title, category, or lyrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="language-pills">
          <Globe size={15} style={{ color: 'var(--text-muted)' }} />
          {['All', 'English', 'Yoruba', 'Hausa', 'Igbo'].map((lang) => (
            <button
              key={lang}
              className={`lang-pill ${selectedLangFilter === lang ? 'active' : ''}`}
              onClick={() => setSelectedLangFilter(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Hymns Registry List */}
      <div className="hymns-table-card">
        <div className="table-summary-header">
          <span>Showing {filteredHymns.length} of {hymns.length} Hymns</span>
          <span className="core-pack-badge">
            <Bookmark size={12} /> Core Pack items: {hymns.filter((h) => h.isCorePack).length}
          </span>
        </div>

        {filteredHymns.length === 0 ? (
          <div className="empty-hymns-box">
            <BookOpen size={48} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
            <h4>No Hymns Found</h4>
            <p>Try adjusting your search query or language filter, or click "Add New Hymn".</p>
          </div>
        ) : (
          <div className="hymns-grid">
            {filteredHymns.map((hymn) => (
              <div key={hymn.id} className="hymn-card-item">
                <div className="hymn-card-badge-row">
                  <span className="hymn-num-pill">#{hymn.hymnNumber}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="lang-tag">{hymn.language}</span>
                    <span className="cat-tag">{hymn.category}</span>
                    {hymn.isCorePack && <span className="core-tag">Core</span>}
                  </div>
                </div>

                <h3 className="hymn-card-title">{hymn.title}</h3>

                <div className="hymn-card-stats">
                  <span>
                    <Layers size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {hymn.verses.length} {hymn.verses.length === 1 ? 'Verse' : 'Verses'}
                  </span>
                  <span>
                    <Music size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {hymn.chorus ? 'Chorus Included' : 'No Chorus'}
                  </span>
                </div>

                {hymn.chorus && (
                  <div className="hymn-chorus-snippet">
                    <strong>Chorus: </strong>"{hymn.chorus.slice(0, 75)}{hymn.chorus.length > 75 ? '...' : ''}"
                  </div>
                )}

                <div className="hymn-card-actions">
                  <button onClick={() => handleOpenEdit(hymn)} className="action-btn edit-action" title="Edit Hymn">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(hymn.id)} className="action-btn delete-action" title="Delete Hymn">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Hymn Modal Drawer */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-content-large">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                <h3>{editingId ? `Edit Hymn #${formData.hymnNumber}` : 'Add New Hymn'}</h3>
              </div>

              <div className="modal-tab-toggle">
                <button
                  type="button"
                  className={`modal-tab ${activePreviewTab === 'form' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('form')}
                >
                  <Edit size={14} /> Editor
                </button>
                <button
                  type="button"
                  className={`modal-tab ${activePreviewTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab('preview')}
                >
                  <Eye size={14} /> Mobile Preview
                </button>
              </div>

              <button onClick={() => setShowFormModal(false)} className="close-modal-btn">
                ✕
              </button>
            </div>

            {activePreviewTab === 'form' ? (
              <form onSubmit={handleSubmit} className="hymn-editor-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Hymn Number *</label>
                    <input
                      type="number"
                      className="form-input text-input-padded"
                      placeholder="e.g. 12"
                      value={formData.hymnNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, hymnNumber: e.target.value ? Number(e.target.value) : '' })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Language *</label>
                    <select
                      className="form-input text-input-padded"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Yoruba">Yoruba</option>
                      <option value="Hausa">Hausa</option>
                      <option value="Igbo">Igbo</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Hymn Title *</label>
                  <input
                    type="text"
                    className="form-input text-input-padded"
                    placeholder="e.g. Holy, Holy, Holy! Lord God Almighty"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input text-input-padded"
                      placeholder="e.g. Worship, Praise, Grace"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Linked Translation ID (Optional)</label>
                    <input
                      type="number"
                      className="form-input text-input-padded"
                      placeholder="e.g. 3 (Link to Yoruba ID)"
                      value={formData.linkedHymnId ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedHymnId: e.target.value ? Number(e.target.value) : '' })
                      }
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isCorePack}
                        onChange={(e) => setFormData({ ...formData, isCorePack: e.target.checked })}
                      />
                      <span>Include in Offline Core Pack</span>
                    </label>
                  </div>
                </div>

                {/* Chorus Section */}
                <div className="section-card chorus-card-bg">
                  <div className="section-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={16} style={{ color: '#a5b4fc' }} />
                      <strong style={{ color: '#e0e7ff' }}>Chorus Section (Optional)</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Chorus is displayed between or after verses on mobile.
                    </span>
                  </div>
                  <textarea
                    className="form-input text-area-input"
                    rows={3}
                    placeholder="Enter chorus text here if applicable (e.g. Then sings my soul, My Saviour God to Thee...)"
                    value={formData.chorus}
                    onChange={(e) => setFormData({ ...formData, chorus: e.target.value })}
                  />
                </div>

                {/* Verses Section */}
                <div className="section-card verses-builder-card">
                  <div className="section-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={16} style={{ color: 'var(--primary)' }} />
                      <strong>Hymn Verses Builder ({formData.verses.length})</strong>
                    </div>
                    <button type="button" onClick={handleAddVerse} className="add-verse-btn">
                      <Plus size={14} /> Add Verse
                    </button>
                  </div>

                  <div className="verses-list">
                    {formData.verses.map((verse, index) => (
                      <div key={index} className="verse-editor-row">
                        <div className="verse-meta-col">
                          <span className="verse-number-badge">Verse {verse.verseNumber}</span>
                          <div className="reorder-btns">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveVerse(index, 'up')}
                              className="icon-mini-btn"
                              title="Move Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={index === formData.verses.length - 1}
                              onClick={() => handleMoveVerse(index, 'down')}
                              className="icon-mini-btn"
                              title="Move Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="verse-input-col">
                          <textarea
                            className="form-input text-area-input"
                            rows={3}
                            placeholder={`Enter text for Verse ${verse.verseNumber}...`}
                            value={verse.text}
                            onChange={(e) => handleVerseTextChange(index, e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVerse(index)}
                          className="delete-verse-btn"
                          title="Remove Verse"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="form-actions-row">
                  <button type="button" onClick={() => setShowFormModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? (
                      <span className="spinner" />
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>{editingId ? 'Save Changes' : 'Publish Hymn'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Mobile Preview Render */
              <div className="mobile-preview-container">
                <div className="phone-frame">
                  <div className="phone-screen">
                    <div className="phone-app-bar">
                      <span className="phone-title">Hymn #{formData.hymnNumber || '00'}</span>
                      <span className="phone-lang-tag">{formData.language}</span>
                    </div>

                    <div className="phone-body">
                      <span className="phone-category-pill">{formData.category || 'General'}</span>
                      <h2 className="phone-hymn-title">{formData.title || 'Untitled Hymn'}</h2>

                      {/* Chorus preview if present */}
                      {formData.chorus.trim() && (
                        <div className="phone-chorus-box">
                          <div className="phone-chorus-tag">
                            <Music size={12} /> CHORUS
                          </div>
                          <p className="phone-chorus-text">{formData.chorus}</p>
                        </div>
                      )}

                      {/* Verses list preview */}
                      <div className="phone-verses-list">
                        {formData.verses.map((v, i) => (
                          <div key={i} className="phone-verse-item">
                            <div className="phone-verse-num">Verse {v.verseNumber}</div>
                            <p className="phone-verse-text">{v.text || 'Verse lyrics will appear here...'}</p>
                          </div>
                        ))}
                      </div>
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
