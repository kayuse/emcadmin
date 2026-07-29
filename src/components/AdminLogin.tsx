import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (data: { token: string; user: any }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + '/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Invalid credentials.');
      }

      onSuccess({
        token: data.accessToken,
        user: data.user,
      });
    } catch (err: any) {
      setError(err.message || 'Network error. Could not authenticate admin.');
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
        <label className="form-label" htmlFor="login-email">Admin Email</label>
        <div className="input-wrapper">
          <input
            id="login-email"
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
        <label className="form-label" htmlFor="login-password">Password</label>
        <div className="input-wrapper">
          <input
            id="login-password"
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
            <span>Authenticate Admin</span>
            <LogIn size={18} />
          </>
        )}
      </button>
    </form>
  );
};
