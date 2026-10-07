import {
  ActionTaskDefinition,
  CropAdvisoryInput,
  DecisionOutput,
  ExecutorOutput,
  ResearcherOutput,
  VerifierOutput
} from '../../types/index.js';
import { generateStructuredAgriResponse } from '../gemini.service.js';

export async function runExecutorAgent(
  input: CropAdvisoryInput,
  researcher: ResearcherOutput,
  decision: DecisionOutput,
  verifier: VerifierOutput
): Promise<ExecutorOutput> {
  const prompt = `
[Agent 5: Action Executor Agent]
You are the Action Executor Agent for Agri-AURA.
Translate the agronomic strategy into scheduled, actionable field tasks:
- Crop: ${input.crop_type} (${input.growth_stage}), ${input.field_size_acres} Acres
- Primary Treatment: ${decision.primary_treatment}
- Secondary Treatment: ${decision.secondary_treatment}
- Intervention Category: ${decision.selected_intervention_type}
- PHI Days: ${verifier.phi_days_required}
- Washoff Risk: ${verifier.rain_washoff_risk}
- Requires Human Approval: ${verifier.requires_human_approval}

Generate 2 to 4 detailed field tasks with exact dosage per acre, application method, timing, PHI, and risk classification.
Respond strictly in JSON matching the schema.
`;

  const schema = {
    type: 'object',
    properties: {
      action_tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            task_title: { type: 'string' },
            category: {
              type: 'string',
              enum: ['CHEMICAL_SYNTHETIC', 'ORGANIC_BIOLOGICAL', 'FERTIGATION_MINERAL', 'CULTURAL_MECHANICAL']
            },
            dosage_or_rate: { type: 'string' },
            application_method: { type: 'string' },
            scheduled_timing: { type: 'string' },
            pre_harvest_interval_days: { type: 'integer' },
            is_high_risk: { type: 'boolean' }
          },
          required: [
            'task_title',
            'category',
            'dosage_or_rate',
            'application_method',
            'scheduled_timing',
            'pre_harvest_interval_days',
            'is_high_risk'
          ]
        }
      },
      irrigation_adjustment_hours: {
        type: 'number',
        description: 'Hours to advance or delay irrigation cycle'
      },
      application_window: {
        type: 'string',
        description: 'Optimal meteorological execution window'
      }
    },
    required: ['action_tasks', 'application_window']
  };

  const fallback = (): ExecutorOutput => {
    const isSynthetic = decision.selected_intervention_type === 'CHEMICAL_SYNTHETIC';
    const isFertigation = decision.selected_intervention_type === 'FERTIGATION_MINERAL';
    const diag = researcher.primary_diagnosis.toLowerCase();

    const tasks: ActionTaskDefinition[] = [];

    if (diag.includes('nitrogen') || diag.includes('leaching')) {
      tasks.push({
        task_title: 'Direct Drip Fertigation: UAN-32 Injection with DCD Inhibitor',
        category: 'FERTIGATION_MINERAL',
        dosage_or_rate: '22 kg N / Acre (68.75 L UAN-32 liquid solution)',
        application_method: 'Venturi injector system into drip lines at 1.8 dS/m EC',
        scheduled_timing: 'Day 1 - Morning (06:00 - 09:30)',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      tasks.push({
        task_title: 'Soil Conditioning: Humic Acid Fluvial Bio-Extract',
        category: 'ORGANIC_BIOLOGICAL',
        dosage_or_rate: '2.5 L / Acre in 200 L water',
        application_method: 'Soil drench along crop rows to enhance cation retention',
        scheduled_timing: 'Day 3 - Late Afternoon',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      tasks.push({
        task_title: 'Canopy Chlorophyll NDVI Drone Re-Scan',
        category: 'CULTURAL_MECHANICAL',
        dosage_or_rate: 'Full field sensor scan',
        application_method: 'Multispectral UAV telemetry pass',
        scheduled_timing: 'Day 7 - Post application',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      return {
        action_tasks: tasks,
        irrigation_adjustment_hours: -2,
        application_window: 'Immediate morning calm window (wind < 8 km/h)'
      };
    }

    if (diag.includes('bollworm')) {
      tasks.push({
        task_title: 'Targeted High-Pressure Foliar Spray: Chlorantraniliprole 18.5% SC',
        category: 'CHEMICAL_SYNTHETIC',
        dosage_or_rate: '60 mL / Acre in 150 L water',
        application_method: 'Tractor boom sprayer with hollow-cone nozzles for full canopy penetration',
        scheduled_timing: 'Day 1 - Dusk (17:30 - 20:00) during peak caterpillar emergence',
        pre_harvest_interval_days: verifier.phi_days_required || 14,
        is_high_risk: true
      });
      tasks.push({
        task_title: 'Pheromone Trap Monitoring & Lure Replacement',
        category: 'CULTURAL_MECHANICAL',
        dosage_or_rate: '5 trap stations / Acre',
        application_method: 'Delta sticky traps with Helicoverpa sexual lure septum',
        scheduled_timing: 'Day 2 - Morning',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      tasks.push({
        task_title: 'Secondary Bio-Barrier: Bacillus thuringiensis (Btk) Micro-Dust',
        category: 'ORGANIC_BIOLOGICAL',
        dosage_or_rate: '400 g / Acre',
        application_method: 'Foliar mist blower to protect upper terminal growth',
        scheduled_timing: 'Day 8 - Following initial chemical dissipation',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      return {
        action_tasks: tasks,
        irrigation_adjustment_hours: 0,
        application_window: 'Evening dusk window, zero rain forecast within 36h'
      };
    }

    if (diag.includes('blight')) {
      tasks.push({
        task_title: 'Systemic Fungicide Spray: Azoxystrobin + Difenoconazole SC',
        category: 'CHEMICAL_SYNTHETIC',
        dosage_or_rate: '200 mL / Acre in 200 L water + non-ionic surfactant',
        application_method: 'Knapsack or motorized power sprayer targeting lower canopy leaf surfaces',
        scheduled_timing: 'Day 1 - Post dew-drying (09:00 - 11:30)',
        pre_harvest_interval_days: verifier.phi_days_required || 7,
        is_high_risk: true
      });
      tasks.push({
        task_title: 'Cultural Sanitation: Hand Pruning of Severely Lesioned Lower Foliage',
        category: 'CULTURAL_MECHANICAL',
        dosage_or_rate: 'Bottom 25 cm of plant stalks',
        application_method: 'Manual sanitizing cut with ethanol-sterilized shears',
        scheduled_timing: 'Day 2 - Dry midday conditions',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      tasks.push({
        task_title: 'Bio-Fungicide Inoculation: Bacillus subtilis (Strain QST 713)',
        category: 'ORGANIC_BIOLOGICAL',
        dosage_or_rate: '1.0 kg / Acre',
        application_method: 'Foliar spray to colonize clean leaves and suppress secondary sporulation',
        scheduled_timing: 'Day 6 - Morning',
        pre_harvest_interval_days: 0,
        is_high_risk: false
      });
      return {
        action_tasks: tasks,
        irrigation_adjustment_hours: 12,
        application_window: 'Immediate post-dew morning window before thermal turbulence'
      };
    }

    // Default tasks
    tasks.push({
      task_title: `Precision Application: ${decision.primary_treatment}`,
      category: decision.selected_intervention_type,
      dosage_or_rate: isFertigation ? '15 kg / Acre' : isSynthetic ? '150 mL / Acre' : '1.5 L / Acre',
      application_method: isFertigation ? 'Drip chemigation' : 'Calibrated broadcast / foliar spray',
      scheduled_timing: 'Day 1 - Early Morning',
      pre_harvest_interval_days: verifier.phi_days_required,
      is_high_risk: isSynthetic
    });
    tasks.push({
      task_title: `Cultural Management: Soil & Moisture Balancing`,
      category: 'CULTURAL_MECHANICAL',
      dosage_or_rate: 'Field-wide moisture probe check',
      application_method: 'TDR sensor logging at 15cm and 30cm depths',
      scheduled_timing: 'Day 3 - Midday',
      pre_harvest_interval_days: 0,
      is_high_risk: false
    });

    return {
      action_tasks: tasks,
      irrigation_adjustment_hours: 0,
      application_window: 'Morning 07:00 - 10:00 (Temperature < 28°C, Humidity > 45%)'
    };
  };

  return generateStructuredAgriResponse<ExecutorOutput>(prompt, schema, fallback);
}
