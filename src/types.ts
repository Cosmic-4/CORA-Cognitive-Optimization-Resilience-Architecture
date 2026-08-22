export type NavTab =
  | 'dashboard'
  | 'collectors'
  | 'missions'
  | 'resilience-lab'
  | 'mutation-center'
  | 'data-explorer'
  | 'ai-intelligence'
  | 'memory'
  | 'ai-chat'
  | 'terminal';

export interface SystemMetrics {
  systemHealth: number;
  systemHealthChange: number;
  dataIntegrity: number;
  activeCollectors: number;
  issuesDetected: number;
  successfulRepairs24h: number;
  autoResolutionProgress: number;
  totalRecords: number;
  resilience: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'RESOLVED' | 'INFO';
  node: string;
  timeAgo: string;
  timestamp: string;
  description: string;
  suggestedAction?: string;
}

export interface CollectorNode {
  id: string;
  name: string;
  targetDomain: string;
  status: 'HEALTHY' | 'MUTATING' | 'REPAIRING' | 'DEGRADED';
  healthScore: number;
  dataIntegrity: number;
  itemsProcessed24h: number;
  mutationRate: string;
  lastAutoRepairTime: string;
  active: boolean;
  activeSelector: string;
}
