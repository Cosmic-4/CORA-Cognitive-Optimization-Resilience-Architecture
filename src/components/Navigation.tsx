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
  { id: 'dashboard', label: 'Overview', icon: 'monitor_heart', category: 'COMMAND' },
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

const CoraLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M75 15C55 5 25 15 15 40C5 65 20 85 45 90C65 93 80 80 85 70" stroke="var(--color-cora)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 45 L42 40 L38 52 L50 48 L44 60 L32 54 Z" fill="var(--color-cora)" fillRule="evenodd" />
    <path d="M70 55 L58 60 L62 48 L50 52 L56 40 L68 46 Z" fill="var(--color-cora)" fillRule="evenodd" opacity="0.4" />
    <circle cx="50" cy="50" r="3" fill="var(--color-cora)" className="pulse-dot" />
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
      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-12 px-3 z-40 glass flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <div className="flex items-center gap-2">
            <CoraLogo size={20} />
            <span className="font-semibold text-xs tracking-tight">CORA</span>
          </div>
        </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${bdConnected ? 'pulse-dot' : ''}`} style={{ backgroundColor: bdConnected ? 'var(--color-success)' : 'var(--color-warning)' }} />
          </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-12 z-40 glass-heavy p-2 space-y-0.5 max-h-[70vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat} className="pt-2">
              <div className="px-2.5 pb-1 text-[8px] font-mono font-medium text-[var(--color-text-muted)] uppercase tracking-widest">{cat}</div>
              {navItems.filter((i) => i.category === cat).map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                    activeTab === item.id
                      ? 'text-[var(--color-cora)] bg-[var(--color-cora-muted)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col h-screen glass text-[var(--color-text-secondary)] text-sm fixed left-0 top-0 w-[200px] z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 pt-5 pb-4">
          <CoraLogo size={22} />
          <div>
            <h1 className="text-[13px] font-semibold text-[var(--color-text-primary)] tracking-tight leading-tight">CORA</h1>
            <p className="text-[8px] text-[var(--color-text-muted)] font-mono tracking-[0.12em] uppercase">Resilience Engine</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1">
          {categories.map((category) => (
            <div key={category} className="mb-3">
              <div className="px-2.5 pb-1 text-[8px] font-mono tracking-[0.12em] text-[var(--color-text-muted)] uppercase font-medium">{category}</div>
              {navItems.filter((item) => item.category === category).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-[6px] rounded text-[11px] font-medium transition-all duration-150 text-left ${
                      isActive
                        ? 'text-[var(--color-cora)] bg-[var(--color-cora-muted)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[15px] ${isActive ? 'text-[var(--color-cora)]' : 'text-[var(--color-text-muted)]'}`}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-auto px-3 pb-3">
          {/* Bright Data status */}
          <div className="mb-2.5 p-2.5 rounded glass-light">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[12px] text-[var(--color-brightdata)]">cloud</span>
                <span className="text-[8px] font-bold font-mono tracking-wider text-[var(--color-brightdata)]">BRIGHT DATA</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${bdConnected ? 'bg-[var(--color-success)] pulse-dot' : 'bg-[var(--color-warning)]'}`} />
                <span className={`text-[8px] font-bold font-mono ${bdConnected ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                  {bdConnected ? 'LIVE' : 'MOCK'}
                </span>
              </div>
            </div>
            <div className="text-[8px] text-[var(--color-text-muted)] leading-normal">Mode: {bdMode}</div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[8px] font-mono text-[var(--color-text-muted)]">
            <span>v0.2</span>
            <button onClick={onOpenSettingsModal} className="hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">settings</span>Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop top bar */}
      <div className="hidden md:flex items-center justify-between md:ml-[200px] px-6 h-11 glass fixed top-0 right-0 left-0 z-30">
        <div className="flex items-center gap-4 text-[9px] font-mono">
         <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${bdConnected ? 'bg-[var(--color-success)] pulse-dot' : 'bg-[var(--color-warning)]'}`} />
             <span className={bdConnected ? "text-[var(--color-success)] font-medium" : "text-[var(--color-warning)] font-medium"}>
               {bdMode === 'live' ? 'ENGINE ONLINE' : 'ENGINE (MOCK MODE)'}
             </span>
           </div>
           <span className="text-[var(--color-border-strong)]">|</span>
           <span className="text-[var(--color-text-secondary)]"><strong className="text-[var(--color-text-primary)] font-semibold">{collectorCount ?? 0}</strong> Collectors</span>
           <span className="text-[var(--color-border-strong)]">|</span>
           <span className="text-[var(--color-text-secondary)]"><strong className="text-[var(--color-text-primary)] font-semibold">{recordCount ? recordCount.toLocaleString() : '—'}</strong> Records</span>
          <span className="text-[var(--color-border-strong)]">|</span>
          <span className="text-[var(--color-text-secondary)]"><strong className="text-[var(--color-text-primary)] font-semibold">{systemHealth}%</strong> Health</span>
        </div>

        <div className="flex items-center gap-1.5">
          {userName && <span className="text-[9px] font-mono text-[var(--color-text-muted)] mr-2">{userName}</span>}
          <NotificationBell />
          {onLogout && (
            <button onClick={onLogout} className="px-2 py-1.5 rounded text-[9px] font-mono text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)] transition-colors">
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
};
