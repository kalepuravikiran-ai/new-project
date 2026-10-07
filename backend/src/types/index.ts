export * from '../shared/schemas/advisory.schema.js';

export interface PlannerOutput {
  planner_subtasks: string[];
  primary_focus: string;
  risk_factors_to_investigate: string[];
}

export interface ResearcherOutput {
  primary_diagnosis: string;
  diagnosis_confidence: number;
  stress_factors: string[];
  soil_chemistry_analysis: string;
  initial_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  pathogen_or_vector?: string;
  nutrient_deficiency_details?: string;
}

export interface DecisionOutput {
  selected_intervention_type: 'ORGANIC_BIOLOGICAL' | 'FERTIGATION_MINERAL' | 'CHEMICAL_SYNTHETIC' | 'CULTURAL_MECHANICAL';
  primary_treatment: string;
  secondary_treatment: string;
  decision_rationale: string;
  treatment_alternatives_considered: string[];
}

export interface VerifierOutput {
  is_safe_for_growth_stage: boolean;
  rain_washoff_risk: boolean;
  phi_days_required: number;
  requires_human_approval: boolean;
  flagged_hazards: string[];
  biosecurity_evaluation: string;
  overall_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface ActionTaskDefinition {
  task_title: string;
  category: 'CHEMICAL_SYNTHETIC' | 'ORGANIC_BIOLOGICAL' | 'FERTIGATION_MINERAL' | 'CULTURAL_MECHANICAL';
  dosage_or_rate: string;
  application_method: string;
  scheduled_timing: string;
  pre_harvest_interval_days: number;
  is_high_risk: boolean;
}

export interface ExecutorOutput {
  action_tasks: ActionTaskDefinition[];
  irrigation_adjustment_hours?: number;
  application_window: string;
}

export interface CommunicatorOutput {
  final_summary: string;
  worker_instructions: string;
  safety_warnings_multilingual: {
    en: string;
    es?: string;
    hi?: string;
  };
}

export interface FullAgentExecutionResult {
  advisory: any;
  events: any[];
  tasks: any[];
  requires_human_approval: boolean;
  overall_risk_level: string;
}
