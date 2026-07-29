import { useState, useEffect } from 'react';
import { Shield, Lock, UserPlus } from 'lucide-react';
import { AdminSignup } from './components/AdminSignup';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

type AuthTab = 'login' | 'signup';

interface AuthSession {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('ecwa_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem('ecwa_admin_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('ecwa_admin_session');
    }
  }, [session]);

  const handleAuthSuccess = (data: AuthSession) => {
    setSession(data);
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <div className="app-container">
      {session ? (
        <AdminDashboard session={session} onLogout={handleLogout} />
      ) : (
        <div className="auth-wrapper">
          <div className="auth-header">
            <div className="brand-badge">
              <Shield size={14} />
              <span>ECWA Administration</span>
            </div>
            <h1 className="auth-title">
              {activeTab === 'login' ? 'Admin Login' : 'Admin Portal Signup'}
            </h1>
            <p className="auth-subtitle">
              {activeTab === 'login'
                ? 'Authenticate to access executive control features'
                : 'Register a new Administrator account (No OTP needed)'}
            </p>
          </div>

          <div className="tab-container">
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              <Lock size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Admin Login
            </button>
            <button
              className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              <UserPlus size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Admin Signup
            </button>
          </div>

          {activeTab === 'login' ? (
            <AdminLogin onSuccess={handleAuthSuccess} />
          ) : (
            <AdminSignup
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      )}
    </div>
  );
}
