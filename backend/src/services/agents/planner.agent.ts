import { CropAdvisoryInput, PlannerOutput } from '../../types/index.js';
import { generateStructuredAgriResponse } from '../gemini.service.js';

export async function runPlannerAgent(input: CropAdvisoryInput): Promise<PlannerOutput> {
  const prompt = `
[Agent 1: Crop Planner Agent]
You are the Crop Planner Agent for Agri-AURA.
Analyze the following farm field intake parameters:
- Field: "${input.field_name}" (${input.field_size_acres} Acres)
- Crop: ${input.crop_type} at Growth Stage "${input.growth_stage}"
- Soil Profile: ${input.soil_type}, pH ${input.soil_ph}, N: ${input.soil_n_status}, P: ${input.soil_p_status}, K: ${input.soil_k_status}, Moisture: ${input.soil_moisture_pct}%
- Weather Telemetry: ${input.recent_rainfall_mm}mm rain forecast, ${input.temperature_celsius}°C, ${input.humidity_pct}% RH
- Observed Symptoms: "${input.observed_symptoms}" (Distribution: ${input.symptom_distribution})

Decompose this complex situation into 4-6 chronological diagnostic subtasks, identify the primary investigation focus, and highlight immediate agronomic risk factors.
Respond strictly in JSON according to the schema.
`;

  const schema = {
    type: 'object',
    properties: {
      planner_subtasks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Chronological investigation steps planned to address the scenario'
      },
      primary_focus: {
        type: 'string',
        description: 'Core agronomic question to resolve'
      },
      risk_factors_to_investigate: {
        type: 'array',
        items: { type: 'string' },
        description: 'Vulnerabilities such as leaching, vector transmission, or canopy humidity'
      }
    },
    required: ['planner_subtasks', 'primary_focus', 'risk_factors_to_investigate']
  };

  const fallback = (): PlannerOutput => {
    const isRainy = input.recent_rainfall_mm > 15;
    const isNutrientSkewed = input.soil_n_status === 'Deficient' || input.soil_k_status === 'Deficient' || input.soil_p_status === 'Deficient';
    const subtasks = [
      `Audit ${input.crop_type} growth stage (${input.growth_stage}) nutrient demand curve against current soil status`,
      `Correlate visual symptom "${input.observed_symptoms.slice(0, 40)}..." with ${input.soil_type} chemistry and pH ${input.soil_ph}`,
      `Evaluate weather interactions: ${input.recent_rainfall_mm}mm precipitation and ${input.humidity_pct}% RH risk factors`,
      `Investigate spatial pattern (${input.symptom_distribution}) for biotic infection vs abiotic leaching vectors`,
      `Formulate stratified biological and chemical intervention options with regulatory threshold checks`
    ];

    return {
      planner_subtasks: subtasks,
      primary_focus: `Differentiate ${isNutrientSkewed ? 'soil mineral imbalance' : 'pathological/entomological vectors'} under ${input.soil_type} conditions at ${input.growth_stage} stage`,
      risk_factors_to_investigate: [
        isRainy ? 'High post-precipitation leaching and foliar wash-off' : 'Thermal and transpiration stress',
        input.soil_ph < 6.0 ? 'Phosphorus lockup & low cation exchange capacity' : input.soil_ph > 7.5 ? 'Iron/Zinc chlorosis risk' : 'Optimal soil mineral assimilation window',
        `${input.symptom_distribution} symptom progression speed`
      ]
    };
  };

  return generateStructuredAgriResponse<PlannerOutput>(prompt, schema, fallback);
}
