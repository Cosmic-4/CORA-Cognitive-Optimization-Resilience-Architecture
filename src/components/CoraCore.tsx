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

const STATE_INFO: Record<SystemState, { label: string; color: string }> = {
  calm: { label: 'STABLE', color: 'rgb(0,230,181)' },
  monitoring: { label: 'MONITORING', color: 'rgb(129,140,248)' },
  mutation: { label: 'MUTATION', color: 'rgb(251,191,36)' },
  adapting: { label: 'ADAPTING', color: 'rgb(0,230,181)' },
  recovering: { label: 'RECOVERING', color: 'rgb(52,211,153)' },
};

export const CoraCore = ({
  health, collectors, records, repairs, resilience, systemState, onCoreClick,
}) => {
  const info = STATE_INFO[systemState];
  const healthColor = health > 95 ? 'rgb(52,211,153)' : health >= 80 ? 'rgb(251,191,36)' : 'rgb(240,91,91)';

  return (
    <div
      className="relative flex flex-col items-center gap-2 cursor-pointer select-none"
      onClick={onCoreClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-baseline gap-1">
        <span
          className="text-6xl font-bold tabular-nums leading-none"
          style={{ color: healthColor, fontFamily: 'var(--font-sans)' }}
        >
          {Math.round(health)}
        </span>
        <span className="text-xs font-mono tracking-widest uppercase text-[var(--color-text-muted)]">
          HEALTH
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono tracking-wide">
        <span style={{ color: 'rgb(var(--sv-cyan))' }}>COL {collectors}</span>
        <span className="text-[var(--color-text-secondary)]">{records.toLocaleString()} REC</span>
        <span style={{ color: 'rgb(var(--sv-gold))' }}>{repairs} REP</span>
      </div>

      <div className="text-sm font-mono" style={{ color: healthColor }}>
        RESILIENCE {Math.round(resilience)}%
      </div>

      <span
        className="mt-1 px-3 py-0.5 rounded-full text-[0.65rem] font-mono font-bold uppercase tracking-widest border"
        style={{ borderColor: `${info.color}50`, color: info.color }}
      >
        {info.label}
      </span>
    </div>
  );
};

export default CoraCore;
