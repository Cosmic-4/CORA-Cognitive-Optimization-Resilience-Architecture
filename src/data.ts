import type { CollectorNode, Incident } from './types';

export const initialMetrics = {
  systemHealth: 0,
  systemHealthChange: 0,
  dataIntegrity: 0,
  activeCollectors: 0,
  issuesDetected: 0,
  successfulRepairs24h: 0,
  autoResolutionProgress: 0,
  totalRecords: 0,
  resilience: 0,
};

export const initialIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Node Timeout',
    severity: 'CRITICAL' as const,
    node: 'US-East-Cluster-1',
    timeAgo: '12m ago',
    timestamp: '2026-08-09 09:20:00',
    description: 'DOM render timeout exceeded. High network jitter.',
    suggestedAction: 'Apply fallback headless browser session',
  },
  {
    id: 'inc-2',
    title: 'Schema Mismatch',
    severity: 'RESOLVED' as const,
    node: 'Beta-Parser-V2',
    timeAgo: '45m ago',
    timestamp: '2026-08-09 08:47:00',
    description: 'Price type changed from Float to String. Auto-coerced.',
    suggestedAction: 'Auto-repair rule updated',
  },
  {
    id: 'inc-3',
    title: 'Selector Drift',
    severity: 'WARNING' as const,
    node: 'Gamma-Scraper',
    timeAgo: '1h 10m ago',
    timestamp: '2026-08-09 08:22:00',
    description: 'Class name obfuscation on .price-v2. Switching to semantic matching.',
    suggestedAction: 'Self-healing generated new selector',
  },
];

export const initialCollectors: CollectorNode[] = [];
