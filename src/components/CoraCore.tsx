export type SystemState = 'calm' | 'monitoring' | 'mutation' | 'adapting' | 'recovering';

export interface CoraCoreProps {
  health: number;
  collectors: number;
  records: number;
  repairs: number;
  resilience: number;
  systemState: SystemState;
  onCoreClick?: () => void;
}

const STATE_INFO: Record<SystemState, { label: string; color: string; bg: string }> = {
  calm: { label: 'Stable', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  monitoring: { label: 'Monitoring', color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
  mutation: { label: 'Mutation Detected', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  adapting: { label: 'Adapting', color: '#0EA293', bg: 'rgba(14,162,147,0.12)' },
  recovering: { label: 'Recovering', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
};

export const CoraCore = ({ health, collectors, records, repairs, resilience, systemState, onCoreClick }: CoraCoreProps) => {
  const info = STATE_INFO[systemState];
  const healthColor = health > 95 ? '#34D399' : health >= 80 ? '#FBBF24' : '#F87171';
  const circumference = 2 * Math.PI * 92;
  const offset = circumference - (health / 100) * circumference;

  return (
    <div className="w-full flex flex-col items-center gap-8 py-2 select-none">
      {/* Hero ring — Apple Watch / Linear premium */}
      <button onClick={onCoreClick} className="group relative flex flex-col items-center gap-6 cursor-pointer">
        <div className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px]">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-border-subtle)" strokeWidth="10" />
            <circle
              cx="100" cy="100" r="92" fill="none" stroke={healthColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1), stroke 0.5s ease', filter: `drop-shadow(0 0 12px ${healthColor}30)` }}
            />
          </svg>
          <div className="absolute inset-[14px] rounded-full flex flex-col items-center justify-center"
            style={{ background: 'var(--color-bg-elevated)', border: '0.5px solid var(--color-border-subtle)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.12)' }}>
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: 'var(--color-text-muted)' }}>Health</span>
            <span className="text-[56px] md:text-[64px] font-bold tracking-[-0.04em] leading-none mt-1 tabular-nums" style={{ color: healthColor }}>{Math.round(health)}</span>
            <span className="text-[11px] font-medium tracking-wide mt-1" style={{ color: 'var(--color-text-secondary)' }}>resilience {Math.round(resilience)}%</span>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border"
              style={{ color: info.color, background: info.bg, borderColor: `${info.color}30` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: info.color }} />{info.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[13px] font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}>
            <span className="w-2 h-2 rounded-full bg-[var(--color-cora)]" />{collectors} collectors
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
            {records.toLocaleString()} records
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
            {repairs} repairs
          </span>
        </div>
        <span className="text-[12px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">Click to deploy repair →</span>
      </button>
    </div>
  );
};

export default CoraCore;
