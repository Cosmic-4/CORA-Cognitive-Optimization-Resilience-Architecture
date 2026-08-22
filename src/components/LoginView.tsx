import { useState, ChangeEvent, FormEvent } from 'react';
import { authClient } from '../hooks';
import {
  Input,
  BoxReveal,
  Ripple,
  TechOrbitDisplay,
  Label,
  BottomGradient,
} from '@/components/ui/modern-animated-sign-in';
import { Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', password: 'admin', role: 'Full access', icon: 'shield_person', desc: 'Manage collectors & repairs', color: 'var(--color-cora)' },
  { label: 'Operator', username: 'demo', password: 'demo123', role: 'Demo access', icon: 'visibility', desc: 'Explore data (read-only)', color: 'var(--color-info)' },
] as const;

// Orbit icons — same set as demo but text changed to CORA
const orbitIcons = [
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' alt='React' />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 270, duration: 20, path: false, reverse: true,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' alt='TS' />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 210, duration: 20, path: false, reverse: false,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' alt='Tailwind' />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20, delay: 20, radius: 150, path: false, reverse: true,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' alt='JS' />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 210, duration: 20, delay: 20, path: false, reverse: false,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' alt='HTML5' />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20, delay: 20, radius: 100, path: false, reverse: false,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' alt='CSS3' />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20, delay: 10, radius: 100, path: false, reverse: false,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' alt='Next' />,
    className: 'size-[30px] border-none bg-transparent',
    duration: 20, delay: 10, radius: 150, path: false, reverse: true,
  },
  {
    component: () => <img width={100} height={100} src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' alt='Git' />,
    className: 'size-[50px] border-none bg-transparent',
    radius: 320, duration: 20, delay: 20, path: false, reverse: false,
  },
];

export function LoginView({ onLogin }: { onLogin: (user: { id: string; username: string; display_name: string; role: string }) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoginId, setAutoLoginId] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authClient.login(username, password)
        : await authClient.register(username, password, displayName || username);
      onLogin(res.user);
    } catch (err: any) {
      const msg = err.message || '';
      setError(msg.includes('401') ? 'Invalid credentials' : msg.includes('409') ? 'Username taken' : msg.includes('400') ? 'Username and password required' : 'Connection failed — check server');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async (u: string, p: string) => {
    setAutoLoginId(u);
    setError('');
    try {
      const res = await authClient.login(u, p);
      onLogin(res.user);
    } catch (err: any) {
      setAutoLoginId(null);
      const msg = err.message || '';
      setError(msg.includes('401') ? `Demo account "${u}" not found — restart server to seed` : 'Auto-login failed');
    }
  };

  const handleFieldChange = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => setter(e.target.value);

  return (
    <div className="min-h-screen w-full flex bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-hidden">
      {/* Left — animated branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50">
        <div className="absolute inset-0">
          <Ripple mainCircleSize={110} numCircles={9} mainCircleOpacity={0.18} />
          <TechOrbitDisplay iconsArray={orbitIcons} text="CORA" />
        </div>
        {/* subtle overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)]/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-end p-10 w-full">
          <BoxReveal boxColor="var(--color-cora)" duration={0.4}>
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded bg-[var(--color-cora)] flex items-center justify-center text-white font-bold text-sm">C</div>
              <span className="text-lg font-semibold tracking-tight">CORA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-cora-muted)] text-[var(--color-cora)] border border-[var(--color-cora)]/20">v0.1.0</span>
            </div>
          </BoxReveal>
          <BoxReveal boxColor="var(--skeleton)" duration={0.4}>
            <h1 className="text-2xl font-semibold leading-tight max-w-sm">
              Cognitive Optimization & Resilience Architecture
            </h1>
          </BoxReveal>
          <BoxReveal boxColor="var(--skeleton)" duration={0.4}>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mt-2">
              Self-healing data infrastructure — collectors, missions & mutations, auto-repaired in real time.
            </p>
          </BoxReveal>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System online • Mock mode • Bright Data ready
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-10 py-8 overflow-y-auto">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded bg-[var(--color-cora)] flex items-center justify-center text-white font-bold text-sm">C</div>
            <span className="text-lg font-semibold tracking-tight">CORA</span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] ml-auto">Cognitive Optimization & Resilience Architecture</span>
          </div>

          {/* Page toggle — "ADD OUR CUSTOM CREDENTIALS" above sample creds */}
          <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-[var(--color-text-muted)]">
                {mode === 'login' ? 'Sign in to CORA' : 'Create your credentials'}
              </h2>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] hidden sm:inline">
                {mode === 'login' ? 'New here?' : 'Have an account?'}
              </span>
            </div>
          </BoxReveal>

          {/* Custom credentials toggle — above sample creds, serves as the "page where we can add our custom credentials" */}
          <BoxReveal boxColor="var(--skeleton)" duration={0.3} width="100%">
            <div className="flex p-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] mb-5">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-1.5 text-[12px] font-mono font-medium rounded-full transition-colors ${mode === 'login' ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border-subtle)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-1.5 text-[12px] font-mono font-medium rounded-full transition-colors ${mode === 'register' ? 'bg-[var(--color-cora)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}
              >
                Add Custom Credentials
              </button>
            </div>
          </BoxReveal>

          <BoxReveal boxColor="var(--skeleton)" duration={0.3} width="100%">
            <p className="text-[11px] font-mono text-[var(--color-text-muted)] mb-4 leading-relaxed">
              {mode === 'login'
                ? 'Use your own username & password, or try a demo account below.'
                : 'Register a new operator account — stored locally in CORA. You can use any username/password you choose.'}
            </p>
          </BoxReveal>

          {/* Form — uses modern Input + BoxReveal */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="flex flex-col gap-2">
                <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                  <Label htmlFor="displayName" className="text-[var(--color-text-secondary)]">Display Name <span className="text-[var(--color-text-muted)] font-normal">(optional)</span></Label>
                </BoxReveal>
                <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                  <Input id="displayName" type="text" placeholder="CORA Operator" value={displayName} onChange={handleFieldChange(setDisplayName)} className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]" />
                </BoxReveal>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                <Label htmlFor="username" className="text-[var(--color-text-secondary)]">Username <span className="text-red-400">*</span></Label>
              </BoxReveal>
              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                <Input id="username" type="text" placeholder={mode === 'login' ? 'admin or demo' : 'choose a username'} value={username} onChange={handleFieldChange(setUsername)} required className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]" />
              </BoxReveal>
            </div>

            <div className="flex flex-col gap-2">
              <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                <Label htmlFor="password" className="text-[var(--color-text-secondary)]">Password <span className="text-red-400">*</span></Label>
              </BoxReveal>
              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3} className="flex flex-col gap-1">
                <div className="relative">
                  <Input id="password" type={showPwd ? 'text' : 'password'} placeholder={mode === 'login' ? '••••••••' : 'at least 6 characters'} value={password} onChange={handleFieldChange(setPassword)} required className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </BoxReveal>
            </div>

            {error && (
              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                <p className="text-[11px] font-mono px-3 py-2 rounded border border-red-500/20 bg-red-500/10 text-red-400">{error}</p>
              </BoxReveal>
            )}

            <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3} overflow="visible">
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full h-10 rounded-md bg-[var(--color-cora)] hover:bg-[var(--color-cora-hover)] text-white text-[13px] font-mono font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden"
              >
                {loading ? 'Connecting…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                <BottomGradient />
              </button>
            </BoxReveal>
          </form>

          {/* Divider */}
          <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--color-text-muted)]">or use sample credentials</span>
              <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
            </div>
          </BoxReveal>

          {/* Sample creds — click to LOGIN directly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isLoading = autoLoginId === acc.username;
              return (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleAutoLogin(acc.username, acc.password)}
                  disabled={!!autoLoginId || loading}
                  className="text-left relative rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-3 hover:border-[var(--color-cora)]/40 hover:bg-[var(--color-bg-tertiary)] transition-all group disabled:opacity-60 overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-cora)]/0 to-transparent group-hover:via-[var(--color-cora)]/50 transition-all" />
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider uppercase ${acc.label === 'Admin' ? 'bg-[var(--color-cora)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]'}`}>
                      <span className="material-symbols-outlined text-[11px]">{acc.icon}</span>{acc.label}
                    </span>
                    <span className={`text-[10px] font-mono font-medium ${isLoading ? 'text-[var(--color-cora)] animate-pulse' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-cora)]'}`}>
                      {isLoading ? 'Signing in…' : 'Click to login →'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)] leading-tight mb-2">{acc.desc}</p>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <code className="px-1.5 py-0.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">{acc.username}</code>
                    <span className="text-[var(--color-text-muted)]">/</span>
                    <code className="px-1.5 py-0.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">{acc.password}</code>
                  </div>
                  <p className="text-[9px] font-mono text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1.5">
                    {acc.label === 'Admin' ? 'Full access • collectors & mutations' : 'Demo • read-only exploration'}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="text-center text-[9px] font-mono text-[var(--color-text-muted)] opacity-60 mt-3">
            Demo accounts are seeded on first run — restart the server if auto-login says “not found”.
          </p>
        </div>
      </div>
    </div>
  );
}
