import { useState } from 'react';
import { authClient } from '../hooks';

export function LoginView({ onLogin }: { onLogin: (user: { id: string; username: string; display_name: string; role: string }) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authClient.login(username, password)
        : await authClient.register(username, password, displayName || username);
      onLogin(res.user);
    } catch (err: any) {
      setError(err.message?.includes('401') ? 'Invalid credentials' : err.message?.includes('409') ? 'Username taken' : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-[var(--color-cora)] flex items-center justify-center text-white font-bold text-sm">C</div>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">CORA</span>
          </div>
          <p className="text-[11px] font-mono text-[var(--color-text-muted)]">Cognitive Optimization & Resilience Architecture</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="CORA Admin"
                className="w-full px-3 py-2 text-[12px] font-mono rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cora)]" />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus
              className="w-full px-3 py-2 text-[12px] font-mono rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cora)]" />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2 text-[12px] font-mono rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cora)]" />
          </div>

          {error && <p className="text-[11px] font-mono" style={{ color: 'var(--color-danger)' }}>{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2 text-[12px] font-mono font-medium rounded bg-[var(--color-cora)] hover:bg-[var(--color-cora-hover)] text-white transition-colors disabled:opacity-50">
            {loading ? 'Connecting…' : mode === 'login' ? 'Sign In' : 'Register'}
          </button>

          <p className="text-center text-[10px] font-mono text-[var(--color-text-muted)]">
            {mode === 'login' ? (
              <>No account? <button type="button" onClick={() => setMode('register')} className="text-[var(--color-cora)] hover:underline">Register</button></>
            ) : (
              <>Have an account? <button type="button" onClick={() => setMode('login')} className="text-[var(--color-cora)] hover:underline">Sign in</button></>
            )}
          </p>

          {mode === 'login' && (
            <p className="text-center text-[9px] font-mono text-[var(--color-text-muted)] opacity-60">Default: admin / admin</p>
          )}
        </form>
      </div>
    </div>
  );
}
