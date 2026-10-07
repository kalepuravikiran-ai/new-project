import { createClient } from '@supabase/supabase-js';
import {
  CropAdvisoryInput,
  CropAdvisoryEntity,
  AdvisoryAgentEvent,
  AdvisoryActionTask,
  DemoScenario,
  SystemMetrics,
  AgentTelemetry
} from '../types/index.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dcefeonddylxehepkrzl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWZlb25kZHlseGVoZXBrcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjY1NDIsImV4cCI6MjEwNjg0MjU0Mn0.YMhtcUFn73soKysFOEdwX7ZSzbpv0pU18chIbi9aIY4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch {
    // ignore
  }
  return headers;
}

export const api = {
  // Advisory Pipeline
  async runAdvisory(input: CropAdvisoryInput): Promise<{
    advisory: CropAdvisoryEntity;
    events: AdvisoryAgentEvent[];
    tasks: AdvisoryActionTask[];
    requires_human_approval: boolean;
    overall_risk_level: string;
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/advisories/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to run crop advisory pipeline');
    }
    return res.json();
  },

  async listAdvisories(status?: string): Promise<CropAdvisoryEntity[]> {
    const headers = await getAuthHeaders();
    const url = status ? `${API_BASE}/advisories?status=${status}` : `${API_BASE}/advisories`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Failed to fetch advisories');
    const data = await res.json();
    return data.advisories || [];
  },

  async getAdvisoryById(id: string): Promise<{
    advisory: CropAdvisoryEntity;
    events: AdvisoryAgentEvent[];
    tasks: AdvisoryActionTask[];
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/advisories/${id}`, { headers });
    if (!res.ok) throw new Error('Failed to retrieve advisory');
    return res.json();
  },

  async submitDecision(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'MODIFY',
    modifications?: string
  ): Promise<{ advisory: CropAdvisoryEntity; tasks: AdvisoryActionTask[] }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/advisories/${id}/decision`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, modifications })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit HITL decision');
    }
    return res.json();
  },

  async updateTaskStatus(
    advisoryId: string,
    taskId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  ): Promise<AdvisoryActionTask> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/advisories/${advisoryId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update task status');
    const data = await res.json();
    return data.task;
  },

  // Scenarios & Telemetry
  async getDemoScenarios(): Promise<DemoScenario[]> {
    const res = await fetch(`${API_BASE}/scenarios/demo`);
    if (!res.ok) throw new Error('Failed to load demo scenarios');
    const data = await res.json();
    return data.scenarios || [];
  },

  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to load metrics');
    const data = await res.json();
    return data.metrics;
  },

  async getAgentMonitoring(): Promise<AgentTelemetry[]> {
    const res = await fetch(`${API_BASE}/monitoring/agents`);
    if (!res.ok) throw new Error('Failed to load agent monitoring data');
    const data = await res.json();
    return data.agents || [];
  }
};
