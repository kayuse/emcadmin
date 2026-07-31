import React, { useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  UserCheck,
  Key,
  CheckCircle,
  Music,
  LayoutDashboard,
  Users,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { HymnManagement } from './HymnManagement';
import { ManualManagement } from './ManualManagement';
import { AdminList } from './AdminList';
import { QuizLeaderboard } from './QuizLeaderboard';

interface AdminDashboardProps {
  session: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      isVerified: boolean;
    };
  };
  onLogout: () => void;
}

type NavSection = 'hymns' | 'manuals' | 'quizzes' | 'admins' | 'overview';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onLogout }) => {
  const { user, token } = session;
  const [activeSection, setActiveSection] = useState<NavSection>('hymns');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navItems = [
    {
      id: 'hymns' as NavSection,
      label: 'Hymn & Chorus Registry',
      icon: Music,
      description: 'Manage ECWA hymns, verses, and choruses',
    },
    {
      id: 'manuals' as NavSection,
      label: 'Sunday School Manuals',
      icon: BookOpen,
      description: 'Manage manuals, lesson topics, and free/paid access',
    },
    {
      id: 'quizzes' as NavSection,
      label: 'Quiz Leaderboards',
      icon: CheckCircle,
      description: 'View Sunday School Quiz Leaderboards',
    },
    {
      id: 'admins' as NavSection,
      label: 'Administrators',
      icon: Users,
      description: 'View ECWA executive admin list & roles',
    },
    {
      id: 'overview' as NavSection,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      description: 'System health, token details & session status',
    },
  ];

  return (
    <div className="admin-portal-container">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo-glow">
              <ShieldCheck size={22} style={{ color: '#818cf8' }} />
            </div>
            <div className="brand-titles">
              <span className="brand-title-main">ECWA Executive</span>
              <span className="brand-title-sub">ADMIN PORTAL</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">MAIN MANAGEMENT</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
              >
                <div className="nav-item-icon">
                  <Icon size={18} />
                </div>
                <div className="nav-item-text">
                  <span className="nav-item-title">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="nav-item-chevron" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="logged-admin-card">
            <div className="admin-mini-avatar">
              {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="logged-admin-info">
              <span className="logged-admin-name">{user.name}</span>
              <span className="logged-admin-role">{user.role || 'Administrator'}</span>
            </div>
          </div>

          <button onClick={onLogout} className="sidebar-logout-btn" title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Right Content Area */}
      <div className="admin-main-area">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="mobile-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="topbar-breadcrumb">
              <span className="breadcrumb-sub">ECWA Portal</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">
                {navItems.find((n) => n.id === activeSection)?.label}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-live-pill">
              <span className="live-dot pulse"></span>
              <span>Backend Connected</span>
            </div>

            <div className="user-top-pill">
              <div className="user-top-avatar">
                {user.name[0]?.toUpperCase() || 'A'}
              </div>
              <span className="user-top-name">{user.name}</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="admin-content-viewport">
          {activeSection === 'hymns' && <HymnManagement token={token} />}

          {activeSection === 'manuals' && <ManualManagement token={token} />}

          {activeSection === 'quizzes' && <QuizLeaderboard token={token} />}

          {activeSection === 'admins' && (
            <AdminList currentSessionAdmin={user} token={token} />
          )}

          {activeSection === 'overview' && (
            <div className="overview-container">
              <div className="hymn-header-card" style={{ marginBottom: '1.5rem' }}>
                <div className="hymn-header-title-box">
                  <div className="brand-badge" style={{ margin: 0 }}>
                    <Sparkles size={14} />
                    <span>System Credentials & Overview</span>
                  </div>
                  <h2 className="hymn-main-title">Executive Dashboard</h2>
                  <p className="auth-subtitle">
                    Manage session tokens, system privileges, and administrator account profile.
                  </p>
                </div>
              </div>

              <div className="alert-box alert-success" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle size={18} />
                <span>Authentication verified. You have full administrative control privileges.</span>
              </div>

              <div className="user-info-card" style={{ marginBottom: '1.5rem' }}>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)' }}>Admin ID:</span>
                  <strong>#{user.id}</strong>
                </div>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                  <strong>{user.name}</strong>
                </div>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)' }}>Role Access:</span>
                  <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>{user.role}</span>
                </div>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)' }}>Verification Status:</span>
                  <span style={{ color: '#6ee7b7', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={14} /> Verified Executive
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Key size={14} />
                  <span>Active JWT Authorization Bearer:</span>
                </div>
                <code style={{ fontSize: '0.75rem', color: '#c7d2fe', wordBreak: 'break-all', display: 'block', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  {token}
                </code>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
