import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, AlertCircle, Medal } from 'lucide-react';

interface LeaderboardEntry {
  userId: number;
  name: string;
  score: number;
}

export const QuizLeaderboard: React.FC<{ token: string }> = ({ token }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'https://api.ecwamediacenter.com') + `/quiz/leaderboard/${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [year]);

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-titles">
          <div className="brand-badge" style={{ margin: 0, marginBottom: '0.5rem' }}>
            <Trophy size={14} />
            <span>Sunday School Quiz</span>
          </div>
          <h2>Leaderboard</h2>
          <p className="auth-subtitle">View the top performers for the selected year</p>
        </div>
        <div className="header-actions">
          <select 
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <button className="btn btn-secondary" onClick={fetchLeaderboard} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Participant Name</th>
              <th>Total Score (pts)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading leaderboard...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No participants have taken quizzes this year.
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, index) => (
                <tr key={entry.userId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {index === 0 && <Medal size={20} color="#fbbf24" />}
                      {index === 1 && <Medal size={20} color="#94a3b8" />}
                      {index === 2 && <Medal size={20} color="#b45309" />}
                      {index > 2 && <span style={{ width: '20px', display: 'inline-block', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{index + 1}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{entry.name}</div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                      {entry.score.toFixed(1)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
