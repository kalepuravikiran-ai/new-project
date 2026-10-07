import { CropAdvisoryInput, DecisionOutput, ResearcherOutput, VerifierOutput } from '../../types/index.js';
import { generateStructuredAgriResponse } from '../gemini.service.js';

export async function runVerifierAgent(
  input: CropAdvisoryInput,
  researcher: ResearcherOutput,
  decision: DecisionOutput
): Promise<VerifierOutput> {
  const prompt = `
[Agent 4: Safety & Regulatory Verifier Agent]
You are the Safety & Regulatory Verifier Agent for Agri-AURA.
Audit the proposed intervention for biosecurity and compliance:
- Proposed Treatment: ${decision.primary_treatment} (Category: ${decision.selected_intervention_type})
- Crop: ${input.crop_type} at Growth Stage "${input.growth_stage}"
- Weather Forecast: ${input.recent_rainfall_mm}mm rain, ${input.temperature_celsius}°C, ${input.humidity_pct}% RH
- Soil Condition: ${input.soil_type}, pH ${input.soil_ph}, Moisture: ${input.soil_moisture_pct}%

Verification Rules:
1. If rain > 10mm or forecast within 24h, flag liquid foliar sprays as high rain_washoff_risk.
2. Any synthetic pesticide classified under WHO Class II or higher, or synthetic chemical treatment with Pre-Harvest Interval (PHI) >= 7 days triggers MANDATORY human approval (\`requires_human_approval = true\`).
3. Biological/organic or mild fertigation that carries no phytotoxicity risks or MRL exceedance is marked \`requires_human_approval = false\`.
4. Provide flagged hazards and clear biosecurity evaluation.

Respond strictly in JSON matching the schema.
`;

  const schema = {
    type: 'object',
    properties: {
      is_safe_for_growth_stage: { type: 'boolean' },
      rain_washoff_risk: { type: 'boolean' },
      phi_days_required: { type: 'integer' },
      requires_human_approval: { type: 'boolean' },
      flagged_hazards: {
        type: 'array',
        items: { type: 'string' },
        description: 'Regulatory or agronomic safety flags'
      },
      biosecurity_evaluation: {
        type: 'string',
        description: 'Comprehensive regulatory verification rationale'
      },
      overall_risk_level: {
        type: 'string',
        enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
      }
    },
    required: [
      'is_safe_for_growth_stage',
      'rain_washoff_risk',
      'phi_days_required',
      'requires_human_approval',
      'flagged_hazards',
      'biosecurity_evaluation',
      'overall_risk_level'
    ]
  };

  const fallback = (): VerifierOutput => {
    const isSynthetic = decision.selected_intervention_type === 'CHEMICAL_SYNTHETIC';
    const isRainy = input.recent_rainfall_mm > 10;
    const isLateSeason = input.growth_stage.toLowerCase().includes('boll') ||
                         input.growth_stage.toLowerCase().includes('fruit') ||
                         input.growth_stage.toLowerCase().includes('maturity');

    let phi = 0;
    let requiresApproval = false;
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    const hazards: string[] = [];

    if (isSynthetic) {
      phi = isLateSeason ? 14 : 7;
      requiresApproval = true;
      riskLevel = 'HIGH';
      hazards.push('WHO Class II / Synthetic Active Ingredient: Regulated residue threshold');
      hazards.push(`Mandatory Pre-Harvest Interval (PHI) of ${phi} days before mechanical or hand harvest`);
      hazards.push('Strict Personal Protective Equipment (PPE) mandatory: chemical-resistant gloves, respirator');
    }

    if (isRainy) {
      hazards.push(`High precipitation (${input.recent_rainfall_mm}mm): Foliar contact wash-off risk if applied prior to rain-dry interval`);
      if (riskLevel === 'LOW') riskLevel = 'MODERATE';
    }

    if (input.soil_ph < 5.0 || input.soil_ph > 8.5) {
      hazards.push(`Extreme soil pH (${input.soil_ph}): Monitor for localized root salt burn upon fertilizer incorporation`);
    }

    if (decision.selected_intervention_type === 'ORGANIC_BIOLOGICAL') {
      phi = 0;
      requiresApproval = false;
      riskLevel = isRainy ? 'MODERATE' : 'LOW';
    } else if (decision.selected_intervention_type === 'FERTIGATION_MINERAL') {
      phi = 0;
      requiresApproval = false;
      riskLevel = 'MODERATE';
      hazards.push('Electrical Conductivity (EC) surge watch: Keep fertigation solution below 2.2 dS/m');
    } else if (decision.selected_intervention_type === 'CULTURAL_MECHANICAL') {
      phi = 0;
      requiresApproval = false;
      riskLevel = 'LOW';
    }

    return {
      is_safe_for_growth_stage: true,
      rain_washoff_risk: isRainy,
      phi_days_required: phi,
      requires_human_approval: requiresApproval,
      flagged_hazards: hazards,
      biosecurity_evaluation: requiresApproval
        ? `Synthetic agrochemical requires certified farm manager sign-off under Agri-AURA Safety Protocol. PHI is ${phi} days with strict buffer zone requirements.`
        : `Intervention cleared within standard agronomic safety thresholds. No synthetic biocide residue restrictions detected.`,
      overall_risk_level: riskLevel
    };
  };

  return generateStructuredAgriResponse<VerifierOutput>(prompt, schema, fallback);
}
