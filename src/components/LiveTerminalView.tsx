import { useState, useRef, useEffect } from 'react';
import { useWebSocket, type CoraEvent } from '../hooks';

interface TermLine {
  time: string;
  level: 'info' | 'warn' | 'error' | 'ok' | 'sys';
  source: string;
  message: string;
}

const levelColors: Record<string, string> = {
  info: 'var(--color-text-secondary)',
  warn: 'var(--color-warning)',
  error: 'var(--color-danger)',
  ok: 'var(--color-success)',
  sys: 'var(--color-cora)',
};

const levelTags: Record<string, string> = {
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERR  ',
  ok: ' OK  ',
  sys: 'SYS  ',
};

function fmtTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

const BOOT_LINES: TermLine[] = [
  { time: fmtTime(), level: 'sys', source: 'kernel', message: 'CORA v0.1.0 — Cognitive Optimization & Resilience Architecture' },
  { time: fmtTime(), level: 'sys', source: 'kernel', message: 'Initializing self-healing engine...' },
  { time: fmtTime(), level: 'ok', source: 'db', message: 'SQLite connected (WAL mode)' },
  { time: fmtTime(), level: 'ok', source: 'auth', message: 'Session store initialized' },
  { time: fmtTime(), level: 'info', source: 'brightdata', message: 'API client ready (mode: mock)' },
  { time: fmtTime(), level: 'ok', source: 'collectors', message: '3 collectors loaded from database' },
  { time: fmtTime(), level: 'ok', source: 'missions', message: '3 missions loaded' },
  { time: fmtTime(), level: 'ok', source: 'memory', message: '4 repair patterns in memory' },
  { time: fmtTime(), level: 'info', source: 'websocket', message: 'Event stream listening on /ws/events' },
  { time: fmtTime(), level: 'sys', source: 'engine', message: 'All systems nominal. Listening for mutations...' },
];

export function LiveTerminalView() {
  const [lines, setLines] = useState<TermLine[]>(BOOT_LINES);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paused) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, paused]);

  const addLine = (level: TermLine['level'], source: string, message: string) => {
    setLines((prev) => [...prev, { time: fmtTime(), level, source, message }].slice(-500));
  };

  useWebSocket((event: CoraEvent) => {
    if (paused) return;
    switch (event.event) {
      case 'anomaly.detected':
        addLine('error', 'anomaly', `${event.data?.type || 'UNKNOWN'} on field=${event.data?.field || '?'} collector=${event.collector_id}`);
        break;
      case 'repair.started':
        addLine('warn', 'repair', `Shadow test initiated mut=${event.mutation_id}`);
        break;
      case 'candidate.found':
        addLine('info', 'adapt', `Candidate: ${event.data?.selector} (conf=${event.data?.confidence})`);
        break;
      case 'shadow.completed':
        addLine(event.data?.passed ? 'ok' : 'error', 'shadow', `${event.data?.passed ? 'PASSED' : 'FAILED'} coverage=${(event.data?.coverage * 100 || 0).toFixed(1)}%`);
        break;
      case 'repair.promoted':
        addLine('ok', 'repair', `Repair promoted → collector=${event.collector_id} repair=${event.repair_id}`);
        break;
      case 'repair.rejected':
        addLine('warn', 'repair', `Candidate rejected → collector=${event.collector_id}`);
        break;
      case 'collector.completed':
        addLine('ok', 'collector', `Run completed → ${event.collector_id} records=${event.data?.record_count || 0}`);
        break;
      case 'collector.started':
        addLine('info', 'collector', `Run started → ${event.collector_id}`);
        break;
      case 'collector.failed':
        addLine('error', 'collector', `Run failed → ${event.collector_id} error="${event.data?.error}"`);
        break;
      default:
        addLine('info', 'event', `${event.event}`);
    }
  });

  const filtered = filter === 'all' ? lines : lines.filter((l) => l.level === filter);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fadeIn mt-14 md:mt-14">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-success)' }}>terminal</span>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Live Terminal</h2>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
            <span className="text-[8px] font-mono" style={{ color: 'var(--color-success)' }}>LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'ok', 'warn', 'error', 'info'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-colors ${filter === f ? 'bg-[var(--color-cora)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
              {f}
            </button>
          ))}
          <button onClick={() => setPaused(!paused)}
            className={`px-2 py-1 rounded text-[8px] font-mono uppercase transition-colors ${paused ? 'bg-[var(--color-warning)] text-black' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            {paused ? 'PAUSED' : 'LIVE'}
          </button>
          <button onClick={() => setLines([])} className="px-2 py-1 rounded text-[8px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">
            CLEAR
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 font-mono text-[11px] leading-relaxed" style={{ backgroundColor: '#0a0e14' }}>
        {filtered.map((line, i) => (
          <div key={i} className="flex px-4 hover:bg-white/[0.02]">
            <span className="text-[var(--color-text-muted)] shrink-0 w-[90px]">{line.time}</span>
            <span className="shrink-0 w-[50px] font-medium" style={{ color: levelColors[line.level] }}>[{levelTags[line.level]}]</span>
            <span className="shrink-0 w-[90px] text-[var(--color-text-muted)]">{line.source}</span>
            <span style={{ color: levelColors[line.level] }}>{line.message}</span>
          </div>
        ))}
        <div className="flex px-4 items-center">
          <span className="text-[var(--color-text-muted)] shrink-0 w-[90px]">{fmtTime()}</span>
          <span className="shrink-0 w-[50px] font-medium" style={{ color: 'var(--color-cora)' }}>[SYS  ]</span>
          <span className="shrink-0 w-[90px] text-[var(--color-text-muted)]">prompt</span>
          <span className="inline-block w-2 h-4 animate-pulse" style={{ backgroundColor: 'var(--color-cora)' }} />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[var(--color-border-subtle)] text-[8px] font-mono text-[var(--color-text-muted)]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <span>{lines.length} lines</span>
        <span>{filter !== 'all' ? `filtered: ${filter}` : 'no filter'}</span>
        <span>CORA v0.1.0 | WebSocket connected</span>
      </div>
    </div>
  );
}
