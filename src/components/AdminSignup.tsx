import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminSignupProps {
  onSuccess: (data: { token: string; user: any }) => void;
  onSwitchToLogin: () => void;
}

export const AdminSignup: React.FC<AdminSignupProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/auth/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      onSuccess({
        token: data.accessToken,
        user: data.user,
      });
    } catch (err: any) {
      setError(err.message || 'Network error. Could not complete signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="admin-name">Full Name</label>
        <div className="input-wrapper">
          <input
            id="admin-name"
            type="text"
            className="form-input"
            placeholder="e.g. Administrator John"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
          <User className="input-icon" size={18} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="admin-email">Admin Email</label>
        <div className="input-wrapper">
          <input
            id="admin-email"
            type="email"
            className="form-input"
            placeholder="admin@ecwa.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Mail className="input-icon" size={18} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="admin-password">Password</label>
        <div className="input-wrapper">
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <Lock className="input-icon" size={18} />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            <span>Create Admin Account</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="no-otp-badge">
        <ShieldCheck size={16} />
        <span>Direct Admin Access &bull; No OTP Code Required</span>
      </div>
    </form>
  );
};
