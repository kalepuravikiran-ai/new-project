import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  CropAdvisoryEntity,
  AdvisoryAgentEvent,
  AdvisoryActionTask,
  SystemMetricRecord,
  UserProfile,
  AdvisoryStatus,
  TaskStatus
} from '../types/index.js';

import WebSocket from 'ws';

if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dcefeonddylxehepkrzl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket as any
  }
});

// Resilient local persistence storage for offline / pre-migration fallback
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'agri_aura_store.json');

interface LocalDatabase {
  profiles: Record<string, UserProfile>;
  crop_advisories: Record<string, CropAdvisoryEntity>;
  advisory_agent_events: AdvisoryAgentEvent[];
  advisory_action_tasks: AdvisoryActionTask[];
  system_metrics: Record<string, SystemMetricRecord>;
}

function loadLocalStore(): LocalDatabase {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }
  const initialStore: LocalDatabase = {
    profiles: {
      '00000000-0000-0000-0000-000000000001': {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Dr. Sarah Vance',
        email: 'agronomist@agriaura.io',
        farm_name: 'Verdant Horizon Agriculture Labs',
        role: 'agronomist'
      }
    },
    crop_advisories: {},
    advisory_agent_events: [],
    advisory_action_tasks: [],
    system_metrics: {
      total_advisories_executed: {
        metric_key: 'total_advisories_executed',
        numeric_value: 142.0
      },
      successful_interventions: {
        metric_key: 'successful_interventions',
        numeric_value: 137.0
      },
      chemical_risks_prevented: {
        metric_key: 'chemical_risks_prevented',
        numeric_value: 39.0
      },
      water_cubic_meters_saved: {
        metric_key: 'water_cubic_meters_saved',
        numeric_value: 18450.0
      }
    }
  };
  saveLocalStore(initialStore);
  return initialStore;
}

function saveLocalStore(db: LocalDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local database file:', err);
  }
}

let localDb = loadLocalStore();

export const supabaseService = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as UserProfile;
    } catch (e) {
      // fallback
    }
    return localDb.profiles[userId] || {
      id: userId,
      full_name: 'Agricultural Manager',
      email: 'manager@agriaura.io',
      farm_name: 'Precision Fields AgriTech',
      role: 'farm_manager'
    };
  },

  async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();
      if (!error && data) return data as UserProfile;
    } catch {
      // fallback
    }
    localDb.profiles[profile.id] = profile;
    saveLocalStore(localDb);
    return profile;
  },

  // Crop Advisories
  async createAdvisory(input: Omit<CropAdvisoryEntity, 'id' | 'created_at' | 'updated_at'>): Promise<CropAdvisoryEntity> {
    const newId = uuidv4();
    const now = new Date().toISOString();
    const record: CropAdvisoryEntity = {
      ...input,
      id: newId,
      created_at: now,
      updated_at: now
    };

    try {
      const { data, error } = await supabase
        .from('crop_advisories')
        .insert(record)
        .select()
        .single();
      if (!error && data) {
        return data as CropAdvisoryEntity;
      }
    } catch {
      // fallback
    }

    localDb.crop_advisories[newId] = record;
    saveLocalStore(localDb);
    return record;
  },

  async updateAdvisory(id: string, updates: Partial<CropAdvisoryEntity>): Promise<CropAdvisoryEntity | null> {
    const now = new Date().toISOString();
    const fullUpdates = { ...updates, updated_at: now };

    try {
      const { data, error } = await supabase
        .from('crop_advisories')
        .update(fullUpdates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as CropAdvisoryEntity;
      }
    } catch {
      // fallback
    }

    if (localDb.crop_advisories[id]) {
      localDb.crop_advisories[id] = {
        ...localDb.crop_advisories[id],
        ...fullUpdates
      };
      saveLocalStore(localDb);
      return localDb.crop_advisories[id];
    }
    return null;
  },

  async getAdvisoryById(id: string): Promise<CropAdvisoryEntity | null> {
    try {
      const { data, error } = await supabase
        .from('crop_advisories')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) {
        return data as CropAdvisoryEntity;
      }
    } catch {
      // fallback
    }
    return localDb.crop_advisories[id] || null;
  },

  async listAdvisories(userId?: string, statusFilter?: AdvisoryStatus): Promise<CropAdvisoryEntity[]> {
    try {
      let query = supabase.from('crop_advisories').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as CropAdvisoryEntity[];
      }
    } catch {
      // fallback
    }

    let items = Object.values(localDb.crop_advisories);
    if (userId) {
      items = items.filter(a => a.user_id === userId);
    }
    if (statusFilter) {
      items = items.filter(a => a.status === statusFilter);
    }
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Agent Events
  async createAgentEvent(event: Omit<AdvisoryAgentEvent, 'id' | 'created_at'>): Promise<AdvisoryAgentEvent> {
    const newId = uuidv4();
    const record: AdvisoryAgentEvent = {
      ...event,
      id: newId,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('advisory_agent_events')
        .insert(record)
        .select()
        .single();
      if (!error && data) {
        return data as AdvisoryAgentEvent;
      }
    } catch {
      // fallback
    }

    localDb.advisory_agent_events.push(record);
    saveLocalStore(localDb);
    return record;
  },

  async getAgentEvents(advisoryId: string): Promise<AdvisoryAgentEvent[]> {
    try {
      const { data, error } = await supabase
        .from('advisory_agent_events')
        .select('*')
        .eq('advisory_id', advisoryId)
        .order('step_number', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as AdvisoryAgentEvent[];
      }
    } catch {
      // fallback
    }

    return localDb.advisory_agent_events
      .filter(e => e.advisory_id === advisoryId)
      .sort((a, b) => a.step_number - b.step_number);
  },

  // Action Tasks
  async createActionTasks(tasks: Omit<AdvisoryActionTask, 'id' | 'created_at'>[]): Promise<AdvisoryActionTask[]> {
    const formatted: AdvisoryActionTask[] = tasks.map(t => ({
      ...t,
      id: uuidv4(),
      created_at: new Date().toISOString()
    }));

    try {
      const { data, error } = await supabase
        .from('advisory_action_tasks')
        .insert(formatted)
        .select();
      if (!error && data && data.length > 0) {
        return data as AdvisoryActionTask[];
      }
    } catch {
      // fallback
    }

    localDb.advisory_action_tasks.push(...formatted);
    saveLocalStore(localDb);
    return formatted;
  },

  async getActionTasks(advisoryId: string): Promise<AdvisoryActionTask[]> {
    try {
      const { data, error } = await supabase
        .from('advisory_action_tasks')
        .select('*')
        .eq('advisory_id', advisoryId)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as AdvisoryActionTask[];
      }
    } catch {
      // fallback
    }

    return localDb.advisory_action_tasks.filter(t => t.advisory_id === advisoryId);
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<AdvisoryActionTask | null> {
    try {
      const { data, error } = await supabase
        .from('advisory_action_tasks')
        .update({ status })
        .eq('id', taskId)
        .select()
        .single();
      if (!error && data) {
        return data as AdvisoryActionTask;
      }
    } catch {
      // fallback
    }

    const task = localDb.advisory_action_tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      saveLocalStore(localDb);
      return task;
    }
    return null;
  },

  // System Metrics
  async getSystemMetrics(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase.from('system_metrics').select('*');
      if (!error && data && data.length > 0) {
        const metricsMap: Record<string, number> = {};
        for (const item of data) {
          metricsMap[item.metric_key] = Number(item.numeric_value);
        }
        return metricsMap;
      }
    } catch {
      // fallback
    }

    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(localDb.system_metrics)) {
      result[k] = v.numeric_value;
    }
    return result;
  },

  async incrementMetric(metricKey: string, amount: number = 1): Promise<void> {
    try {
      const current = await this.getSystemMetrics();
      const newVal = (current[metricKey] || 0) + amount;
      await supabase
        .from('system_metrics')
        .upsert({ metric_key: metricKey, numeric_value: newVal, updated_at: new Date().toISOString() });
    } catch {
      // fallback
    }

    if (!localDb.system_metrics[metricKey]) {
      localDb.system_metrics[metricKey] = {
        metric_key: metricKey,
        numeric_value: amount
      };
    } else {
      localDb.system_metrics[metricKey].numeric_value += amount;
    }
    saveLocalStore(localDb);
  }
};
