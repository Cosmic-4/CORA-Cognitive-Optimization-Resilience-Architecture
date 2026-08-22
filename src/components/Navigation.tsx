import { useState } from 'react';
import { NavTab } from '../types';
import { NotificationBell } from './NotificationBell';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSettingsModal: () => void;
  systemHealth: number;
  onLogout?: () => void;
  userName?: string;
  bdMode?: 'mock' | 'live';
  collectorCount?: number;
  recordCount?: number;
}

const navItems: { id: NavTab; label: string; icon: string; category: string }[] = [
  { id: 'dashboard', label: 'Overview', icon: 'space_dashboard', category: 'COMMAND' },
  { id: 'missions', label: 'Missions', icon: 'assignment', category: 'OPERATIONS' },
  { id: 'collectors', label: 'Collectors', icon: 'dataset', category: 'OPERATIONS' },
  { id: 'data-explorer', label: 'Data Explorer', icon: 'search', category: 'OPERATIONS' },
  { id: 'mutation-center', label: 'Mutation Centre', icon: 'difference', category: 'RESILIENCE' },
  { id: 'resilience-lab', label: 'Resilience Lab', icon: 'science', category: 'RESILIENCE' },
  { id: 'ai-intelligence', label: 'Intelligence', icon: 'psychology', category: 'INTELLIGENCE' },
  { id: 'memory', label: 'Memory', icon: 'hub', category: 'INTELLIGENCE' },
  { id: 'ai-chat', label: 'CORA AI', icon: 'smart_toy', category: 'TOOLS' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal', category: 'TOOLS' },
];

const CoraLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="var(--color-cora)" />
    <path d="M32 38 C 32 28, 42 22, 50 28 C 58 22, 68 28, 68 38 C 68 48, 58 54, 50 62 C 42 54, 32 48, 32 38 Z" fill="white" fillOpacity="0.95" />
    <circle cx="50" cy="50" r="2.5" fill="var(--color-cora)" />
  </svg>
);

export const Navigation = ({
  activeTab,
  setActiveTab,
  onOpenSettingsModal,
  systemHealth,
  onLogout,
  userName,
  bdMode = 'mock',
  collectorCount,
  recordCount,
}: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bdConnected = bdMode === 'live';
  const categories = ['COMMAND', 'OPERATIONS', 'RESILIENCE', 'INTELLIGENCE'];

  return (
    <>
      {/* Mobile header — Apple: clean 56px, hairline */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-[56px] px-4 z-40 flex items-center justify-between"
        style={{ background: 'rgba(var(--color-bg-primary-rgb, 18,20,26), 0.8)', backdropFilter: 'blur(20px) saturate(1.2)', WebkitBackdropFilter: 'blur(20px) saturate(1.2)', borderBottom: '0.5px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <span className="material-symbols-outlined text-[20px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <div className="flex items-center gap-2.5">
            <CoraLogo size={26} />
            <span className="font-semibold text-[17px] tracking-[-0.02em] text-[var(--color-text-primary)]">CORA</span>
            <span className="text-[10px] font-medium tracking-widest px-1.5 py-0.5 rounded-full bg-[var(--color-cora)] text-white">RESILIENCE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${bdConnected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'} shadow-sm`} />
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[56px] z-40 p-3 max-h-[70vh] overflow-y-auto"
          style={{ background: 'rgba(18,20,26,0.92)', backdropFilter: 'blur(24px)', borderBottom: '0.5px solid var(--color-border-subtle)' }}>
          {categories.map((cat) => (
            <div key={cat} className="pt-3 first:pt-0">
              <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-text-muted)] uppercase">{cat}</div>
              {navItems.filter((i) => i.category === cat).map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${activeTab === item.id ? 'bg-white text-black shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10'}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Desktop sidebar — Linear/Apple: 248px, ultra-clean */}
      <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-[248px] z-50"
        style={{ background: 'var(--color-bg-base)', borderRight: '0.5px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3 px-6 pt-7 pb-6">
          <CoraLogo size={30} />
          <div>
            <h1 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)] leading-none">CORA</h1>
            <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-muted)] uppercase mt-0.5">Resilience Engine</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-text-muted)] uppercase">{category}</div>
              {navItems.filter((item) => item.category === category).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all text-left ${isActive ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'opacity-90' : 'opacity-60'}`}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cora)]" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 space-y-3" style={{ borderTop: '0.5px solid var(--color-border-subtle)' }}>
          <div className="p-3 rounded-xl flex items-center justify-between"
            style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border-subtle)' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-[var(--color-brightdata)]">cloud</span>
              <span className="text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-primary)]">BRIGHT DATA</span>
            </div>
            <span className={`text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-full border ${bdConnected ? 'bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/20'}`}>
              {bdConnected ? 'LIVE' : 'MOCK'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
            <span className="font-mono">v0.2 • {systemHealth}% health</span>
            <button onClick={onOpenSettingsModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors border border-transparent hover:border-[var(--color-border-subtle)]">
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop top bar — Apple: 56px, centered, hairline */}
      <div className="hidden md:flex items-center justify-between md:ml-[248px] px-8 h-[56px] fixed top-0 right-0 left-0 z-30"
        style={{ background: 'color-mix(in srgb, var(--color-bg-primary) 78%, transparent)', backdropFilter: 'blur(20px) saturate(1.2)', WebkitBackdropFilter: 'blur(20px) saturate(1.2)', borderBottom: '0.5px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-5 text-[13px]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${bdConnected ? 'bg-[var(--color-success)] animate-pulse' : 'bg-[var(--color-warning)]'}`} />
            <span className={`font-medium tracking-[-0.01em] ${bdConnected ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>{bdMode === 'live' ? 'Engine Live' : 'Engine Mock'}</span>
          </div>
          <span className="w-px h-4 bg-[var(--color-border-subtle)]" />
          <span className="text-[var(--color-text-secondary)]"><strong className="text-[var(--color-text-primary)] font-semibold">{collectorCount ?? 0}</strong> collectors</span>
          <span className="w-px h-4 bg-[var(--color-border-subtle)]" />
          <span className="text-[var(--color-text-secondary)]"><strong className="text-[var(--color-text-primary)] font-semibold">{recordCount ? recordCount.toLocaleString() : '—'}</strong> records</span>
          <span className="w-px h-4 bg-[var(--color-border-subtle)]" />
          <span className="text-[var(--color-text-secondary)]"><strong className="text-[var(--color-text-primary)] font-semibold">{systemHealth}%</strong> health</span>
        </div>
        <div className="flex items-center gap-3">
          {userName && <span className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-2 hidden xl:inline">{userName}</span>}
          <NotificationBell />
          {onLogout && <button onClick={onLogout} className="px-4 py-2 rounded-full text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-secondary)] transition-colors">Logout</button>}
        </div>
      </div>
    </>
  );
};
