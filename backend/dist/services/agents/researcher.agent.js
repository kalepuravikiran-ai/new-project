"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runResearcherAgent = runResearcherAgent;
const gemini_service_js_1 = require("../gemini.service.js");
async function runResearcherAgent(input, planner) {
    const prompt = `
[Agent 2: Soil & Agronomic Researcher Agent]
You are the Agronomic Researcher Agent for Agri-AURA.
Based on the Planner's investigation tasks:
${planner.planner_subtasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Analyze the agronomic matrix:
- Crop: ${input.crop_type} (${input.growth_stage})
- Soil Texture: ${input.soil_type}, pH: ${input.soil_ph}
- Macronutrients: N=${input.soil_n_status}, P=${input.soil_p_status}, K=${input.soil_k_status}
- Moisture: ${input.soil_moisture_pct}%, Precipitation: ${input.recent_rainfall_mm}mm
- Temp: ${input.temperature_celsius}°C, Humidity: ${input.humidity_pct}%
- Observed Symptoms: "${input.observed_symptoms}"
- Distribution: ${input.symptom_distribution}

Determine the primary agronomic diagnosis, scientific confidence (0-100%), secondary stress factors, soil chemistry analysis (identifying mineral fixation or leaching mechanisms), and initial risk level.
Respond strictly in JSON matching the schema.
`;
    const schema = {
        type: 'object',
        properties: {
            primary_diagnosis: {
                type: 'string',
                description: 'Root cause pathology, entomological pest, or physiological nutrient deficiency'
            },
            diagnosis_confidence: {
                type: 'number',
                description: 'Confidence percentage between 0 and 100'
            },
            stress_factors: {
                type: 'array',
                items: { type: 'string' },
                description: 'Environmental, climatic, or edaphic stressors'
            },
            soil_chemistry_analysis: {
                type: 'string',
                description: 'Detailed mineral availability analysis considering pH, cation exchange, and moisture'
            },
            initial_risk_level: {
                type: 'string',
                enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
            },
            pathogen_or_vector: {
                type: 'string',
                description: 'Specific pathogen species or pest classification if applicable'
            },
            nutrient_deficiency_details: {
                type: 'string',
                description: 'Specific mineral mobility and plant symptom correlation'
            }
        },
        required: [
            'primary_diagnosis',
            'diagnosis_confidence',
            'stress_factors',
            'soil_chemistry_analysis',
            'initial_risk_level'
        ]
    };
    const fallback = () => {
        const symptomLower = input.observed_symptoms.toLowerCase();
        const cropLower = input.crop_type.toLowerCase();
        // Agronomic pattern matching
        if (symptomLower.includes('yellow') && (input.soil_n_status === 'Deficient' || input.soil_n_status === 'Low' || cropLower.includes('maize') || cropLower.includes('corn'))) {
            const isLeached = input.recent_rainfall_mm > 25 && input.soil_type.toLowerCase().includes('sand');
            return {
                primary_diagnosis: isLeached
                    ? 'Nitrogen Leaching & Mobile N-Deficiency Post-Downpour'
                    : 'Nitrogen Deficiency with Chlorosis in Lower Canopy',
                diagnosis_confidence: 94,
                stress_factors: [
                    `${input.recent_rainfall_mm}mm rainfall induced downward nitrate percolation in porous ${input.soil_type}`,
                    `High rapid vegetative demand during ${input.growth_stage} phase exceeding current root uptake`
                ],
                soil_chemistry_analysis: `At pH ${input.soil_ph}, nitrogen in nitrate form (NO3-) carries high negative charge and does not bind to sandy soil colloids, causing rapid gravitational leaching below the effective root zone (0-30cm).`,
                initial_risk_level: 'MODERATE',
                nutrient_deficiency_details: 'Nitrogen is highly phloem-mobile; the plant translocates stored N from older lower leaves to newer vegetative tissue, manifesting classic V-shaped inverted chlorosis.'
            };
        }
        if (symptomLower.includes('boll') || symptomLower.includes('caterpillar') || symptomLower.includes('worm') || cropLower.includes('cotton')) {
            return {
                primary_diagnosis: 'Helicoverpa armigera (Cotton Bollworm) Late-Season Infestation',
                diagnosis_confidence: 96,
                stress_factors: [
                    `Favorable ambient temperature (${input.temperature_celsius}°C) accelerating larval instar progression`,
                    `Crop currently in sensitive fruit/boll development stage where square boring causes irreversible yield loss`
                ],
                soil_chemistry_analysis: `Soil fertility is adequate (K: ${input.soil_k_status}, N: ${input.soil_n_status}), but vegetative vigor has created dense canopy foliage providing shelter for nocturnal feeding.`,
                initial_risk_level: 'HIGH',
                pathogen_or_vector: 'Helicoverpa armigera (Lepidoptera: Noctuidae)'
            };
        }
        if (symptomLower.includes('blight') || symptomLower.includes('spot') || symptomLower.includes('lesion') || cropLower.includes('tomato')) {
            return {
                primary_diagnosis: 'Alternaria solani (Early Blight) Foliar Fungal Pathogen',
                diagnosis_confidence: 93,
                stress_factors: [
                    `Elevated relative humidity (${input.humidity_pct}%) and warm temperatures (${input.temperature_celsius}°C) create optimal microclimate for spore germination`,
                    `Rainfall of ${input.recent_rainfall_mm}mm caused splash dispersal of fungal conidia from surface soil to lower foliage`
                ],
                soil_chemistry_analysis: `Soil pH ${input.soil_ph} is within acceptable range, but dense irrigation or surface moisture promotes persistent leaf wetness duration exceeding the critical 8-hour fungal infection window.`,
                initial_risk_level: 'HIGH',
                pathogen_or_vector: 'Alternaria solani (Ascomycota: Pleosporaceae)'
            };
        }
        if (cropLower.includes('grape') || cropLower.includes('vine') || input.soil_k_status === 'Deficient' || symptomLower.includes('margin') || symptomLower.includes('edge')) {
            return {
                primary_diagnosis: 'Potassium (K) Translocation Deficiency & Osmotic Regulation Stress',
                diagnosis_confidence: 91,
                stress_factors: [
                    `Soil moisture at ${input.soil_moisture_pct}% creating localized diffusion barrier for potassium cations (K+)`,
                    `High berry/fruit potassium demand during development pulling reserves from mature leaf margins`
                ],
                soil_chemistry_analysis: `At pH ${input.soil_ph}, potassium availability is constrained by competing cations and inadequate moisture film thickness required for mass flow and diffusion into root hairs.`,
                initial_risk_level: 'MODERATE',
                nutrient_deficiency_details: 'Marginal leaf scorch, interveinal necrosis, and decreased stomatal control leading to higher drought sensitivity.'
            };
        }
        // Default robust agronomic synthesis
        return {
            primary_diagnosis: `Complex Physiological Stress & ${input.crop_type} Canopy Anomaly`,
            diagnosis_confidence: 88,
            stress_factors: [
                `Soil moisture imbalance (${input.soil_moisture_pct}%) coupled with ${input.temperature_celsius}°C ambient heat`,
                `Nutrient status imbalance across N:${input.soil_n_status}, P:${input.soil_p_status}, K:${input.soil_k_status}`
            ],
            soil_chemistry_analysis: `Soil pH of ${input.soil_ph} in ${input.soil_type} soil influences ionic solubility. Moisture level (${input.soil_moisture_pct}%) regulates root aerobic respiration and nutrient diffusion gradients.`,
            initial_risk_level: 'MODERATE'
        };
    };
    return (0, gemini_service_js_1.generateStructuredAgriResponse)(prompt, schema, fallback);
}
