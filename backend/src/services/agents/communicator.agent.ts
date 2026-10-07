import {
  CommunicatorOutput,
  CropAdvisoryInput,
  DecisionOutput,
  ExecutorOutput,
  ResearcherOutput,
  VerifierOutput
} from '../../types/index.js';
import { generateStructuredAgriResponse } from '../gemini.service.js';

export async function runCommunicatorAgent(
  input: CropAdvisoryInput,
  researcher: ResearcherOutput,
  decision: DecisionOutput,
  verifier: VerifierOutput,
  executor: ExecutorOutput
): Promise<CommunicatorOutput> {
  const prompt = `
[Agent 6: Field Communicator Agent]
You are the Field Communicator Agent for Agri-AURA.
Translate technical biochemistry and agronomic prescriptions into two distinct communications:
1. "final_summary": Concise executive agronomic synthesis for the Farm Manager / Lead Agronomist (mentioning diagnosis, economic rationale, and safety protocol).
2. "worker_instructions": Clear, plain-language, numbered step-by-step instructions for field hands and tractor operators (focusing on PPE, exact tank mix, spray timing, and safety).

Context:
- Field: ${input.field_name} (${input.field_size_acres} Acres)
- Crop: ${input.crop_type} (${input.growth_stage})
- Diagnosis: ${researcher.primary_diagnosis}
- Selected Treatment: ${decision.primary_treatment}
- PHI: ${verifier.phi_days_required} Days
- Tasks count: ${executor.action_tasks.length}

Respond strictly in JSON matching the schema.
`;

  const schema = {
    type: 'object',
    properties: {
      final_summary: {
        type: 'string',
        description: 'Executive agronomic summary for farm management'
      },
      worker_instructions: {
        type: 'string',
        description: 'Numbered, non-technical execution steps for field laborers'
      },
      safety_warnings_multilingual: {
        type: 'object',
        properties: {
          en: { type: 'string' },
          es: { type: 'string' },
          hi: { type: 'string' }
        },
        required: ['en']
      }
    },
    required: ['final_summary', 'worker_instructions', 'safety_warnings_multilingual']
  };

  const fallback = (): CommunicatorOutput => {
    const isSynthetic = decision.selected_intervention_type === 'CHEMICAL_SYNTHETIC';
    const phi = verifier.phi_days_required;

    const summary = `Agri-AURA multi-agent analysis diagnosed ${researcher.primary_diagnosis} on field "${input.field_name}" with ${researcher.diagnosis_confidence}% confidence. To prevent yield decline at ${input.growth_stage} stage, an intervention of ${decision.primary_treatment} (${decision.selected_intervention_type}) has been prescribed. ${verifier.requires_human_approval ? `MANDATORY HITL APPROVAL: High-risk synthetic application flagged with ${phi}-day Pre-Harvest Interval.` : 'Auto-cleared: Intervention complies with biological safety thresholds.'} Total tasks generated: ${executor.action_tasks.length}.`;

    const instructions = `FIELD WORKER PROTOCOL FOR "${input.field_name.toUpperCase()}":
1. SAFETY FIRST: ${isSynthetic ? 'Wear full chemical PPE: nitrile gloves, splash goggles, long-sleeved overalls, and half-face vapor mask.' : 'Wear standard protective gear: rubber boots, work gloves, and eye protection.'}
2. TANK MIX PREPARATION: Fill clean spray tank to 50% capacity with clean water. Add calibrated dose (${executor.action_tasks[0]?.dosage_or_rate || 'as prescribed'}). Agitate thoroughly for 3 minutes before topping with remaining water.
3. TIMING: Apply strictly during the calibrated window (${executor.application_window}). Avoid application if wind exceeds 10 km/h to prevent chemical drift.
4. SPRAY TECHNIQUE: Maintain nozzle height 45cm above crop canopy. Target underside of foliage where pests/pathogens shelter.
5. RE-ENTRY INTERVAL: ${isSynthetic ? 'Do NOT allow unprotected workers into the treated zone for 24 hours post-spray.' : 'Safe field re-entry after spray deposit has completely dried (approx. 2 hours).'}
6. HARVEST RESTRICTION: ${phi > 0 ? `DO NOT HARVEST ANY CROPS FROM THIS PLOT FOR AT LEAST ${phi} DAYS.` : 'No pre-harvest withholding period applies.'}`;

    return {
      final_summary: summary,
      worker_instructions: instructions,
      safety_warnings_multilingual: {
        en: `Mandatory PPE required. ${phi > 0 ? `Pre-harvest withholding period: ${phi} days.` : 'Biological formulation: zero residue restriction.'}`,
        es: `Equipo de protección personal obligatorio. ${phi > 0 ? `Periodo de carencia: ${phi} días antes de cosechar.` : 'Formulación biológica: sin restricción de residuos.'}`,
        hi: `व्यक्तिगत सुरक्षा उपकरण अनिवार्य हैं। ${phi > 0 ? `कटाई से पहले ${phi} दिनों का अनिवार्य अंतराल रखें।` : 'जैविक उपचार: सुरक्षित और अवशेष मुक्त।'}`
      }
    };
  };

  return generateStructuredAgriResponse<CommunicatorOutput>(prompt, schema, fallback);
}
