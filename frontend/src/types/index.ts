export type SoilType =
  | 'Sandy'
  | 'Sandy Loam'
  | 'Clay Loam'
  | 'Silt Loam'
  | 'Heavy Clay'
  | 'Peat'
  | 'Saline/Alkaline';

export type NutrientStatus = 'Deficient' | 'Low' | 'Optimal' | 'Excess';

export type SymptomDistribution =
  | 'Isolated Patches'
  | 'Field-Wide Uniform'
  | 'Along Irrigation Lines'
  | 'Perimeter/Edge Only';

export type AdvisoryStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTED'
  | 'REJECTED'
  | 'FAILED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AgentRole =
  | 'PLANNER'
  | 'RESEARCHER'
  | 'DECISION'
  | 'VERIFIER'
  | 'EXECUTOR'
  | 'COMMUNICATOR';

export type InterventionCategory =
  | 'CHEMICAL_SYNTHETIC'
  | 'ORGANIC_BIOLOGICAL'
  | 'FERTIGATION_MINERAL'
  | 'CULTURAL_MECHANICAL';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface CropAdvisoryInput {
  field_name: string;
  field_size_acres: number;
  crop_type: string;
  growth_stage: string;
  soil_type: SoilType;
  soil_ph: number;
  soil_n_status: NutrientStatus;
  soil_p_status: NutrientStatus;
  soil_k_status: NutrientStatus;
  soil_moisture_pct: number;
  recent_rainfall_mm: number;
  temperature_celsius: number;
  humidity_pct: number;
  observed_symptoms: string;
  symptom_distribution: SymptomDistribution;
}

export interface CropAdvisoryEntity extends CropAdvisoryInput {
  id: string;
  user_id: string;
  status: AdvisoryStatus;
  overall_risk_level: RiskLevel;
  requires_human_approval: boolean;
  is_approved: boolean;
  approved_by?: string | null;
  approval_timestamp?: string | null;
  final_summary?: string | null;
  worker_instructions?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvisoryAgentEvent {
  id: string;
  advisory_id: string;
  agent: AgentRole;
  step_number: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'WARNING';
  summary: string;
  reasoning_trace: Record<string, any>;
  output_data: Record<string, any>;
  latency_ms: number;
  created_at: string;
}

export interface AdvisoryActionTask {
  id: string;
  advisory_id: string;
  task_title: string;
  category: InterventionCategory;
  dosage_or_rate?: string | null;
  application_method: string;
  scheduled_date?: string | null;
  pre_harvest_interval_days: number;
  is_high_risk: boolean;
  status: TaskStatus;
  created_at: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  expectedOutcome: string;
  highRisk: boolean;
  data: CropAdvisoryInput;
}

export interface SystemMetrics {
  total_advisories_executed: number;
  successful_interventions: number;
  chemical_risks_prevented: number;
  water_cubic_meters_saved: number;
  total_acres_protected: number;
  pending_approvals: number;
  active_advisories: number;
  average_confidence_pct: number;
  average_pipeline_latency_ms: number;
}

export interface AgentTelemetry {
  role: AgentRole;
  name: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  executionCount: number;
  successRatePct: number;
  avgLatencyMs: number;
  description: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  farm_name?: string | null;
  role: 'farm_manager' | 'agronomist' | 'field_worker';
}
