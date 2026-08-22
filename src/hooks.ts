import { useState, useEffect, useCallback, useRef } from 'react';
import type { CollectorNode } from './types';

export type Theme = 'dark' | 'light' | 'system';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('cora-theme', theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return { theme, setTheme };
}

// ─── API Client ────────────────────────────────────────────────────────

const API_BASE = '';

let authToken: string | null = localStorage.getItem('cora-auth-token');

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const authClient = {
  login: async (username: string, password: string) => {
    const res = await api<{ token: string; user: { id: string; username: string; display_name: string; role: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    authToken = res.token;
    localStorage.setItem('cora-auth-token', res.token);
    return res;
  },
  register: async (username: string, password: string, display_name?: string) => {
    const res = await api<{ token: string; user: { id: string; username: string; display_name: string; role: string } }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password, display_name }) });
    authToken = res.token;
    localStorage.setItem('cora-auth-token', res.token);
    return res;
  },
  me: () => api<{ id: string; username: string; display_name: string; role: string }>('/api/auth/me'),
  logout: async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
    authToken = null;
    localStorage.removeItem('cora-auth-token');
  },
  isLoggedIn: () => !!authToken,
};

export interface ApiCollector {
  id: string;
  mission_id: string;
  name: string;
  target_domain: string;
  status: string;
  health_score: number;
  data_integrity: number;
  active_selector: string;
  active: number;
  last_run_at: string | null;
  bright_data_collector_id: string;
  created_at: string;
  items_processed_24h: number;
  mutations_24h: number;
  runs_24h: number;
}

export interface ApiRunResult {
  run_id: string;
  collector_id: string;
  status: string;
  records: { id: string; data_json: Record<string, any>; validation_status: string; confidence: number }[];
  validation: { valid: boolean; confidence: number; errors: any[]; field_results: Record<string, any> };
  anomalies: any[];
  repair?: { mutation_id: string; repair_id: string; old_selector: string; new_selector: string; confidence: number } | null;
  collector: ApiCollector;
}

export function mapCollector(api: ApiCollector): CollectorNode {
  const runs_24h = api.runs_24h || 0;
  const mutations_24h = api.mutations_24h || 0;
  const mutationRate = runs_24h > 0 ? ((mutations_24h / runs_24h) * 100).toFixed(1) + '%' : '0.0%';
  return {
    id: api.id,
    name: api.name,
    targetDomain: api.target_domain,
    status: api.status as CollectorNode['status'],
    healthScore: api.health_score,
    dataIntegrity: api.data_integrity,
    itemsProcessed24h: api.items_processed_24h ?? 0,
    mutationRate,
    lastAutoRepairTime: api.last_run_at ? new Date(api.last_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never',
    active: !!api.active,
    activeSelector: api.active_selector,
  };
}

export const apiClient = {
  getHealth: () => api<{ status: string; service: string; version: string; mock_mode: boolean; bd_configured: boolean; gemini_configured: boolean; timestamp: string }>('/api/health'),
  getMetrics: () => api<any>('/api/metrics'),
  getCollectors: () => api<ApiCollector[]>('/api/collectors'),
  createCollector: (data: { mission_id: string; name: string; target_domain: string; bright_data_collector_id?: string }) =>
    api<ApiCollector>('/api/collectors', { method: 'POST', body: JSON.stringify(data) }),
  runCollector: (id: string) => api<ApiRunResult>(`/api/collectors/${id}/run`, { method: 'POST', body: '{}' }),
  runDemoPipeline: () => api<any>('/api/demo/pipeline', { method: 'POST', body: '{}' }),
  promoteMutation: (id: string) => api<any>(`/api/mutations/${id}/promote`, { method: 'POST', body: '{}' }),

  getMissions: () => api<any[]>('/api/missions'),
  createMission: (data: any) => api<any>('/api/missions', { method: 'POST', body: JSON.stringify(data) }),
  getMutations: () => api<any[]>('/api/mutations'),
  getMutation: (id: string) => api<any>(`/api/mutations/${id}`),
  getEvents: () => api<any[]>('/api/events'),
  getMemory: () => api<any[]>('/api/memory'),
  getData: (collectorId: string) => api<any[]>(`/api/data/${collectorId}`),
  getSignals: () => api<any[]>('/api/signals'),
  runResilience: (id: string, types?: string[]) => api<any>(`/api/resilience/${id}/run`, { method: 'POST', body: JSON.stringify({ types }) }),
  updateMission: (id: string, data: any) => api<any>(`/api/missions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMission: (id: string) => api<any>(`/api/missions/${id}`, { method: 'DELETE' }),
  getContracts: () => api<any[]>('/api/contracts'),
  chatAI: (message: string) => api<{ reply: string; model: string }>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};

// ─── WebSocket ─────────────────────────────────────────────────────────

export interface CoraEvent {
  event: string;
  collector_id?: string;
  mutation_id?: string;
  repair_id?: string;
  data?: Record<string, any>;
  timestamp: string;
}

export function useWebSocket(onEvent?: (event: CoraEvent) => void) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/events`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as CoraEvent;
        onEventRef.current?.(event);
      } catch {}
    };

    return () => ws.close();
  }, []);

  return connected;
}
