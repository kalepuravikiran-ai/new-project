"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDecisionAgent = runDecisionAgent;
const gemini_service_js_1 = require("../gemini.service.js");
async function runDecisionAgent(input, planner, researcher) {
    const prompt = `
[Agent 3: Intervention Decision Agent]
You are the Intervention Decision Agent for Agri-AURA.
Based on the validated diagnosis:
- Primary Root Cause: ${researcher.primary_diagnosis} (Confidence: ${researcher.diagnosis_confidence}%)
- Soil Chemistry Context: ${researcher.soil_chemistry_analysis}
- Crop: ${input.crop_type} (${input.growth_stage})
- Weather Context: ${input.recent_rainfall_mm}mm rain forecast, ${input.temperature_celsius}°C, ${input.humidity_pct}% RH

Rules:
- Strictly evaluate biological alternatives before synthetic chemicals.
- If pests or pathogens exceed economic thresholds, evaluate targeted active ingredients.
- If nutrient deficient, evaluate targeted fertigation or foliar mineral remedies.
- Formulate a clear decision rationale explaining why this treatment was selected over alternatives.

Respond strictly in JSON matching the schema.
`;
    const schema = {
        type: 'object',
        properties: {
            selected_intervention_type: {
                type: 'string',
                enum: ['ORGANIC_BIOLOGICAL', 'FERTIGATION_MINERAL', 'CHEMICAL_SYNTHETIC', 'CULTURAL_MECHANICAL']
            },
            primary_treatment: {
                type: 'string',
                description: 'Specific primary active ingredient, mineral formulation, or biological agent'
            },
            secondary_treatment: {
                type: 'string',
                description: 'Complementary or backup treatment option'
            },
            decision_rationale: {
                type: 'string',
                description: 'Clear agronomic justification for selecting this intervention over alternative options'
            },
            treatment_alternatives_considered: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of alternative therapies evaluated and discarded'
            }
        },
        required: [
            'selected_intervention_type',
            'primary_treatment',
            'secondary_treatment',
            'decision_rationale',
            'treatment_alternatives_considered'
        ]
    };
    const fallback = () => {
        const diag = researcher.primary_diagnosis.toLowerCase();
        if (diag.includes('nitrogen') || diag.includes('leaching')) {
            return {
                selected_intervention_type: 'FERTIGATION_MINERAL',
                primary_treatment: 'Split-Application Ammonium Nitrate / Urea (UAN-32) with Nitrification Inhibitor',
                secondary_treatment: 'Humic Acid Soil Conditioning + Light Calcium Nitrate Foliar Boost',
                decision_rationale: `Selected targeted split-fertigation with a nitrification inhibitor (DCD) over bulk dry urea broadcasting to prevent further downward leaching in porous ${input.soil_type} while rapidly restoring leaf chlorophyll density.`,
                treatment_alternatives_considered: [
                    'Bulk surface Urea broadcast (rejected due to immediate volatilization and leaching under wet profile)',
                    'Heavy organic compost tea alone (rejected due to slow mineralization rate during critical V3-V6 surge)'
                ]
            };
        }
        if (diag.includes('bollworm') || diag.includes('helicoverpa')) {
            return {
                selected_intervention_type: 'CHEMICAL_SYNTHETIC',
                primary_treatment: 'Chlorantraniliprole 18.5% SC (Anthranilic Diamide, IRAC Group 28)',
                secondary_treatment: 'Bacillus thuringiensis kurstaki (Btk) microbial foliar application',
                decision_rationale: `Larval pressure in late-season boll stage requires high-efficacy, rainfast systemic ingestion ovicide/larvicide. Chlorantraniliprole selected for exceptional specificity, preserving beneficial predators, while avoiding older broad-spectrum organophosphates.`,
                treatment_alternatives_considered: [
                    'Pyrethroid lambda-cyhalothrin (rejected due to documented regional target-site resistance and non-target mite flare)',
                    'Bacillus thuringiensis spray exclusively (rejected as primary due to high instar caterpillars already boring inside bracts)'
                ]
            };
        }
        if (diag.includes('blight') || diag.includes('alternaria')) {
            return {
                selected_intervention_type: 'CHEMICAL_SYNTHETIC',
                primary_treatment: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Dual Mode of Action Strobilurin + Triazole)',
                secondary_treatment: 'Bacillus subtilis biological biofungicide + Copper Octanoate barrier',
                decision_rationale: `Active sporulation under ${input.humidity_pct}% humidity demands translaminar curative plus protectant synergy. Difenoconazole halts internal hyphal growth while Azoxystrobin prevents new spore germination.`,
                treatment_alternatives_considered: [
                    'Single-site Mancozeb protectant (rejected because active lesions already present requiring curative reach)',
                    'Trichoderma harzianum bio-inoculant (retained as post-recovery preventative soil amendment)'
                ]
            };
        }
        if (diag.includes('potassium') || diag.includes('osmotic')) {
            return {
                selected_intervention_type: 'FERTIGATION_MINERAL',
                primary_treatment: 'Sulfate of Potash (SOP / Potassium Sulfate, 0-0-50 + 17S) Micro-Fertigation',
                secondary_treatment: 'Foliar Potassium Silicate spray for epidermal cell wall reinforcement',
                decision_rationale: `SOP selected over Muriate of Potash (MOP) to prevent chloride toxicity and salinity burn in sensitive vines while delivering readily available sulfur for enzyme synthesis.`,
                treatment_alternatives_considered: [
                    'Potassium Chloride / MOP (rejected due to chloride burn risk on leaf margins)',
                    'Deep dry ripping of rock potash (rejected due to delayed bioavailability during active berry fill)'
                ]
            };
        }
        return {
            selected_intervention_type: 'ORGANIC_BIOLOGICAL',
            primary_treatment: 'Balanced Botanical & Micronutrient Bio-Stimulant Foliar Solution',
            secondary_treatment: 'Aerated Compost Extract & Controlled Drip Rebalancing',
            decision_rationale: `Initial moderate severity permits ecological biological stabilization without synthetic residues, restoring soil microbial biomass while correcting mild leaf stress.`,
            treatment_alternatives_considered: [
                'Broad-spectrum synthetic cocktail (rejected due to beneficial soil fauna mortality)',
                'No intervention (rejected due to persistent visual symptom progression)'
            ]
        };
    };
    return (0, gemini_service_js_1.generateStructuredAgriResponse)(prompt, schema, fallback);
}
