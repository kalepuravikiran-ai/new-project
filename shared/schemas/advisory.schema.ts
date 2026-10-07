import { z } from 'zod';

export const SoilTypeEnum = z.enum([
  'Sandy',
  'Sandy Loam',
  'Clay Loam',
  'Silt Loam',
  'Heavy Clay',
  'Peat',
  'Saline/Alkaline'
]);
export type SoilType = z.infer<typeof SoilTypeEnum>;

export const NutrientStatusEnum = z.enum(['Deficient', 'Low', 'Optimal', 'Excess']);
export type NutrientStatus = z.infer<typeof NutrientStatusEnum>;

export const SymptomDistributionEnum = z.enum([
  'Isolated Patches',
  'Field-Wide Uniform',
  'Along Irrigation Lines',
  'Perimeter/Edge Only'
]);
export type SymptomDistribution = z.infer<typeof SymptomDistributionEnum>;

export const AdvisoryStatusEnum = z.enum([
  'DRAFT',
  'ANALYZING',
  'AWAITING_APPROVAL',
  'APPROVED',
  'EXECUTED',
  'REJECTED',
  'FAILED'
]);
export type AdvisoryStatus = z.infer<typeof AdvisoryStatusEnum>;

export const RiskLevelEnum = z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const AgentRoleEnum = z.enum([
  'PLANNER',
  'RESEARCHER',
  'DECISION',
  'VERIFIER',
  'EXECUTOR',
  'COMMUNICATOR'
]);
export type AgentRole = z.infer<typeof AgentRoleEnum>;

export const InterventionCategoryEnum = z.enum([
  'CHEMICAL_SYNTHETIC',
  'ORGANIC_BIOLOGICAL',
  'FERTIGATION_MINERAL',
  'CULTURAL_MECHANICAL'
]);
export type InterventionCategory = z.infer<typeof InterventionCategoryEnum>;

export const TaskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// Core intake input schema
export const CropAdvisoryInputSchema = z.object({
  field_name: z.string().min(2, 'Field identifier must be at least 2 characters').max(60),
  field_size_acres: z.number().positive('Field size must be greater than 0'),
  crop_type: z.string().min(2, 'Crop type is required'),
  growth_stage: z.string().min(2, 'Growth stage is required'),
  soil_type: SoilTypeEnum,
  soil_ph: z.number().min(3.5, 'pH cannot be below 3.5').max(10.0, 'pH cannot exceed 10.0'),
  soil_n_status: NutrientStatusEnum,
  soil_p_status: NutrientStatusEnum,
  soil_k_status: NutrientStatusEnum,
  soil_moisture_pct: z.number().min(0, 'Moisture cannot be negative').max(100, 'Moisture cannot exceed 100%'),
  recent_rainfall_mm: z.number().min(0, 'Rainfall cannot be negative').default(0),
  temperature_celsius: z.number().min(-20, 'Temperature too low').max(60, 'Temperature too high'),
  humidity_pct: z.number().min(0, 'Humidity cannot be negative').max(100, 'Humidity cannot exceed 100%'),
  observed_symptoms: z.string().min(10, 'Provide a detailed symptom description (min 10 characters)'),
  symptom_distribution: SymptomDistributionEnum
});
export type CropAdvisoryInput = z.infer<typeof CropAdvisoryInputSchema>;

// Human approval action input
export const HumanApprovalInputSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'MODIFY']),
  modifications: z.string().optional()
});
export type HumanApprovalInput = z.infer<typeof HumanApprovalInputSchema>;

// Task Update Schema
export const UpdateTaskStatusSchema = z.object({
  status: TaskStatusEnum
});
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;

// Full database entities
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  farm_name?: string | null;
  role: 'farm_manager' | 'agronomist' | 'field_worker';
  created_at?: string;
  updated_at?: string;
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

export interface SystemMetricRecord {
  id?: string;
  metric_key: string;
  numeric_value: number;
  metadata?: Record<string, any>;
  updated_at?: string;
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
