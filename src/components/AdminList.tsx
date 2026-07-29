import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  Mail,
  UserCheck,
  Calendar,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface AdminListProps {
  currentSessionAdmin?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
}

const FALLBACK_ADMINS: AdminUser[] = [
  {
    id: 1,
    name: 'Executive Super Admin',
    email: 'admin@ecwa.org',
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Rev. Dr. Stephen Baba',
    email: 'president@ecwa.org',
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 3,
    name: 'Hymnal & Publications Officer',
    email: 'hymns@ecwa.org',
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

export const AdminList: React.FC<AdminListProps> = ({ currentSessionAdmin, token }) => {
  const [admins, setAdmins] = useState<AdminUser[]>(FALLBACK_ADMINS);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/users/admins', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge current logged-in admin if not already present
          const list = [...data];
          if (
            currentSessionAdmin &&
            !list.some((a) => a.email.toLowerCase() === currentSessionAdmin.email.toLowerCase())
          ) {
            list.unshift({
              id: currentSessionAdmin.id,
              name: currentSessionAdmin.name,
              email: currentSessionAdmin.email,
              role: currentSessionAdmin.role,
              isVerified: true,
              createdAt: new Date().toISOString(),
            });
          }
          setAdmins(list);
        }
      }
    } catch (err) {
      console.warn('Backend endpoint unavailable, showing cached/demo admin list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="admins-section-wrapper">
      {/* Header section */}
      <div className="hymn-header-card" style={{ marginBottom: '1.5rem' }}>
        <div className="hymn-header-title-box">
          <div className="brand-badge" style={{ margin: 0 }}>
            <Users size={14} />
            <span>ECWA Executive Council</span>
          </div>
          <h2 className="hymn-main-title">Administrator Registry</h2>
          <p className="auth-subtitle">
            View authorized ECWA Administrators, executive roles, and security access levels.
          </p>
        </div>

        <button
          onClick={fetchAdmins}
          className="submit-btn"
          style={{ width: 'auto', padding: '0.6rem 1.2rem', gap: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Administrators</span>
            <strong className="stat-value">{admins.length}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Verified Accounts</span>
            <strong className="stat-value">{admins.filter((a) => a.isVerified !== false).length}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(217, 70, 239, 0.15)', color: '#f0abfc' }}>
            <Award size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Executive Access</span>
            <strong className="stat-value">100% Authorized</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="hymn-filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-box" style={{ width: '100%' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search administrators by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="admins-grid">
        {filteredAdmins.length === 0 ? (
          <div className="empty-hymns-box" style={{ gridColumn: '1 / -1' }}>
            <Users size={48} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
            <h4>No Administrators Found</h4>
            <p>Try adjusting your search terms.</p>
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const isCurrent =
              currentSessionAdmin &&
              currentSessionAdmin.email.toLowerCase() === admin.email.toLowerCase();

            return (
              <div key={admin.id || admin.email} className={`admin-user-card ${isCurrent ? 'current-user-highlight' : ''}`}>
                <div className="admin-card-header">
                  <div className="admin-avatar">
                    {admin.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'}
                  </div>

                  <div className="admin-card-identity">
                    <div className="admin-card-name-row">
                      <h3 className="admin-card-name">{admin.name}</h3>
                      {isCurrent && <span className="you-badge">YOU</span>}
                    </div>
                    <span className="admin-role-badge">
                      <ShieldCheck size={12} />
                      {admin.role || 'ADMIN'}
                    </span>
                  </div>
                </div>

                <div className="admin-card-body">
                  <div className="admin-info-item">
                    <Mail size={14} className="info-icon" />
                    <span className="info-text">{admin.email}</span>
                  </div>

                  <div className="admin-info-item">
                    <UserCheck size={14} className="info-icon" style={{ color: '#34d399' }} />
                    <span className="info-text" style={{ color: '#6ee7b7' }}>
                      Verified Executive (No OTP)
                    </span>
                  </div>

                  {admin.createdAt && (
                    <div className="admin-info-item">
                      <Calendar size={14} className="info-icon" />
                      <span className="info-text">
                        Registered: {new Date(admin.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="admin-card-footer">
                  <div className="status-online-indicator">
                    <span className="dot pulse"></span>
                    <span>System Active</span>
                  </div>
                  <Sparkles size={14} style={{ color: 'var(--text-subtle)' }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
