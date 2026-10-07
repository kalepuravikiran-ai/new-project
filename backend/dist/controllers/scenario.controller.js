"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_SCENARIOS = void 0;
exports.getDemoScenariosController = getDemoScenariosController;
exports.DEMO_SCENARIOS = [
    {
        id: 'scenario-1-maize-nitrogen',
        title: 'Maize: Post-Downpour Nitrogen Leaching',
        badge: 'Mineral Leaching',
        tagline: 'V3-V4 vegetative stage with heavy downpour in porous sandy loam',
        expectedOutcome: 'Split-fertigation with nitrification inhibitor; auto-cleared low chemical hazard.',
        highRisk: false,
        data: {
            field_name: 'North Pivot 4 - River Basin',
            field_size_acres: 120,
            crop_type: 'Maize (Dent Corn)',
            growth_stage: 'Vegetative V3-V4',
            soil_type: 'Sandy Loam',
            soil_ph: 6.2,
            soil_n_status: 'Deficient',
            soil_p_status: 'Optimal',
            soil_k_status: 'Optimal',
            soil_moisture_pct: 78,
            recent_rainfall_mm: 48,
            temperature_celsius: 24.5,
            humidity_pct: 82,
            observed_symptoms: 'Pronounced yellowing (chlorosis) beginning along midribs of lower, older leaves forming an inverted V-shape. Crop exhibits stunted shoot elongation across the lower drainage zone.',
            symptom_distribution: 'Along Irrigation Lines'
        }
    },
    {
        id: 'scenario-2-cotton-bollworm',
        title: 'Cotton: Late-Season Bollworm Surge',
        badge: 'High-Risk Pest (HITL)',
        tagline: 'Helicoverpa armigera boring into green bolls with mandatory pre-harvest interval',
        expectedOutcome: 'Prescribes Chlorantraniliprole Class II; enforces mandatory farm manager HITL approval.',
        highRisk: true,
        data: {
            field_name: 'East Alluvial Plot 12',
            field_size_acres: 85,
            crop_type: 'Upland Cotton (Gossypium hirsutum)',
            growth_stage: 'Boll Development (Stage 60% Open)',
            soil_type: 'Clay Loam',
            soil_ph: 7.4,
            soil_n_status: 'Optimal',
            soil_p_status: 'Optimal',
            soil_k_status: 'Optimal',
            soil_moisture_pct: 42,
            recent_rainfall_mm: 0,
            temperature_celsius: 33.0,
            humidity_pct: 54,
            observed_symptoms: 'Square shedding and round bore holes observed in 18% of surveyed green bolls with visible larval frass. Third-instar caterpillars detected feeding inside flower bracts and young bolls.',
            symptom_distribution: 'Field-Wide Uniform'
        }
    },
    {
        id: 'scenario-3-tomato-early-blight',
        title: 'Tomato: Early Blight High-Humidity Outbreak',
        badge: 'Fungal Pathogen',
        tagline: 'Alternaria solani concentric ring lesions during flowering & early fruit set',
        expectedOutcome: 'Systemic curative fungicide + biological shield; flags rain washoff intervals.',
        highRisk: true,
        data: {
            field_name: 'Valley Greenhouse & Shaded Field 2',
            field_size_acres: 25,
            crop_type: 'Processing Tomato (Solanum lycopersicum)',
            growth_stage: 'Flowering & Early Fruit Set',
            soil_type: 'Silt Loam',
            soil_ph: 6.5,
            soil_n_status: 'Optimal',
            soil_p_status: 'Optimal',
            soil_k_status: 'Low',
            soil_moisture_pct: 68,
            recent_rainfall_mm: 18,
            temperature_celsius: 26.5,
            humidity_pct: 91,
            observed_symptoms: 'Dark brown to black necrotic spots with concentric target-board rings on lower mature leaves, surrounded by chlorotic yellow halos. Premature defoliation starting at base.',
            symptom_distribution: 'Isolated Patches'
        }
    },
    {
        id: 'scenario-4-vineyard-potassium',
        title: 'Grapevine: Drip Potassium Balancing',
        badge: 'Nutrient Deficiency',
        tagline: 'Marginal leaf scorch during berry veraison in alkaline gravelly clay',
        expectedOutcome: 'Sulfate of Potash (SOP) micro-fertigation; avoiding chloride salinity burn.',
        highRisk: false,
        data: {
            field_name: 'South Slope Terraced Vineyard',
            field_size_acres: 40,
            crop_type: 'Wine Grape (Cabernet Sauvignon)',
            growth_stage: 'Veraison (Berry Softening & Color Change)',
            soil_type: 'Clay Loam',
            soil_ph: 7.8,
            soil_n_status: 'Optimal',
            soil_p_status: 'Optimal',
            soil_k_status: 'Deficient',
            soil_moisture_pct: 38,
            recent_rainfall_mm: 2,
            temperature_celsius: 29.0,
            humidity_pct: 46,
            observed_symptoms: 'Marginal chlorosis advancing to necrosis and upward curling along leaf perimeters of mid-cane leaves. Uneven cluster ripening with lagging Brix sugar accumulation.',
            symptom_distribution: 'Perimeter/Edge Only'
        }
    }
];
function getDemoScenariosController(req, res) {
    return res.json({ scenarios: exports.DEMO_SCENARIOS });
}
