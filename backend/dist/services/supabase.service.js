"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseService = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const ws_1 = __importDefault(require("ws"));
if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = ws_1.default;
}
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dcefeonddylxehepkrzl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    realtime: {
        transport: ws_1.default
    }
});
// Resilient local persistence storage for offline / pre-migration fallback
const DATA_DIR = path_1.default.resolve(process.cwd(), 'data');
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path_1.default.join(DATA_DIR, 'agri_aura_store.json');
function loadLocalStore() {
    if (fs_1.default.existsSync(DB_FILE)) {
        try {
            return JSON.parse(fs_1.default.readFileSync(DB_FILE, 'utf-8'));
        }
        catch {
            // ignore
        }
    }
    const initialStore = {
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
function saveLocalStore(db) {
    try {
        fs_1.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    catch (err) {
        console.error('Failed to write local database file:', err);
    }
}
let localDb = loadLocalStore();
exports.supabaseService = {
    // Profiles
    async getProfile(userId) {
        try {
            const { data, error } = await exports.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (!error && data)
                return data;
        }
        catch (e) {
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
    async upsertProfile(profile) {
        try {
            const { data, error } = await exports.supabase
                .from('profiles')
                .upsert(profile)
                .select()
                .single();
            if (!error && data)
                return data;
        }
        catch {
            // fallback
        }
        localDb.profiles[profile.id] = profile;
        saveLocalStore(localDb);
        return profile;
    },
    // Crop Advisories
    async createAdvisory(input) {
        const newId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const record = {
            ...input,
            id: newId,
            created_at: now,
            updated_at: now
        };
        try {
            const { data, error } = await exports.supabase
                .from('crop_advisories')
                .insert(record)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
        }
        catch {
            // fallback
        }
        localDb.crop_advisories[newId] = record;
        saveLocalStore(localDb);
        return record;
    },
    async updateAdvisory(id, updates) {
        const now = new Date().toISOString();
        const fullUpdates = { ...updates, updated_at: now };
        try {
            const { data, error } = await exports.supabase
                .from('crop_advisories')
                .update(fullUpdates)
                .eq('id', id)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
        }
        catch {
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
    async getAdvisoryById(id) {
        try {
            const { data, error } = await exports.supabase
                .from('crop_advisories')
                .select('*')
                .eq('id', id)
                .single();
            if (!error && data) {
                return data;
            }
        }
        catch {
            // fallback
        }
        return localDb.crop_advisories[id] || null;
    },
    async listAdvisories(userId, statusFilter) {
        try {
            let query = exports.supabase.from('crop_advisories').select('*').order('created_at', { ascending: false });
            if (userId) {
                query = query.eq('user_id', userId);
            }
            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }
            const { data, error } = await query;
            if (!error && data && data.length > 0) {
                return data;
            }
        }
        catch {
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
    async createAgentEvent(event) {
        const newId = (0, uuid_1.v4)();
        const record = {
            ...event,
            id: newId,
            created_at: new Date().toISOString()
        };
        try {
            const { data, error } = await exports.supabase
                .from('advisory_agent_events')
                .insert(record)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
        }
        catch {
            // fallback
        }
        localDb.advisory_agent_events.push(record);
        saveLocalStore(localDb);
        return record;
    },
    async getAgentEvents(advisoryId) {
        try {
            const { data, error } = await exports.supabase
                .from('advisory_agent_events')
                .select('*')
                .eq('advisory_id', advisoryId)
                .order('step_number', { ascending: true });
            if (!error && data && data.length > 0) {
                return data;
            }
        }
        catch {
            // fallback
        }
        return localDb.advisory_agent_events
            .filter(e => e.advisory_id === advisoryId)
            .sort((a, b) => a.step_number - b.step_number);
    },
    // Action Tasks
    async createActionTasks(tasks) {
        const formatted = tasks.map(t => ({
            ...t,
            id: (0, uuid_1.v4)(),
            created_at: new Date().toISOString()
        }));
        try {
            const { data, error } = await exports.supabase
                .from('advisory_action_tasks')
                .insert(formatted)
                .select();
            if (!error && data && data.length > 0) {
                return data;
            }
        }
        catch {
            // fallback
        }
        localDb.advisory_action_tasks.push(...formatted);
        saveLocalStore(localDb);
        return formatted;
    },
    async getActionTasks(advisoryId) {
        try {
            const { data, error } = await exports.supabase
                .from('advisory_action_tasks')
                .select('*')
                .eq('advisory_id', advisoryId)
                .order('created_at', { ascending: true });
            if (!error && data && data.length > 0) {
                return data;
            }
        }
        catch {
            // fallback
        }
        return localDb.advisory_action_tasks.filter(t => t.advisory_id === advisoryId);
    },
    async updateTaskStatus(taskId, status) {
        try {
            const { data, error } = await exports.supabase
                .from('advisory_action_tasks')
                .update({ status })
                .eq('id', taskId)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
        }
        catch {
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
    async getSystemMetrics() {
        try {
            const { data, error } = await exports.supabase.from('system_metrics').select('*');
            if (!error && data && data.length > 0) {
                const metricsMap = {};
                for (const item of data) {
                    metricsMap[item.metric_key] = Number(item.numeric_value);
                }
                return metricsMap;
            }
        }
        catch {
            // fallback
        }
        const result = {};
        for (const [k, v] of Object.entries(localDb.system_metrics)) {
            result[k] = v.numeric_value;
        }
        return result;
    },
    async incrementMetric(metricKey, amount = 1) {
        try {
            const current = await this.getSystemMetrics();
            const newVal = (current[metricKey] || 0) + amount;
            await exports.supabase
                .from('system_metrics')
                .upsert({ metric_key: metricKey, numeric_value: newVal, updated_at: new Date().toISOString() });
        }
        catch {
            // fallback
        }
        if (!localDb.system_metrics[metricKey]) {
            localDb.system_metrics[metricKey] = {
                metric_key: metricKey,
                numeric_value: amount
            };
        }
        else {
            localDb.system_metrics[metricKey].numeric_value += amount;
        }
        saveLocalStore(localDb);
    }
};
