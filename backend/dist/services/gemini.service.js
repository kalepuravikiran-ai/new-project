"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGRI_AURA_SYSTEM_PROMPT = exports.FALLBACK_MODELS = exports.GEMINI_MODEL = exports.ai = void 0;
exports.generateStructuredAgriResponse = generateStructuredAgriResponse;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables. Falling back to agronomic engine.');
}
exports.ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});
exports.GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
exports.FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
exports.AGRI_AURA_SYSTEM_PROMPT = `
You are the Agri-AURA Core Agronomic Brain, an authoritative intelligence engine comprising specialized precision agriculture agents:
1. Field Planner Agent: Decomposes multidimensional crop anomalies into structured diagnostic steps.
2. Agronomic Researcher Agent: Evaluates plant pathology, entomology, and soil mineral interactions against empirical data.
3. Intervention Decision Agent: Recommends balanced treatment options, strictly evaluating biological alternatives before synthetic chemicals.
4. Safety & Regulatory Verifier Agent: Enforces strict biosecurity, maximum residue limits (MRLs), pre-harvest intervals (PHI), and soil salinity/chemical toxicity thresholds.
5. Action Executor Agent: Formulates precise dosages per acre/hectare, application techniques (foliar spray, chemigation, broadcast), and weather timing constraints.
6. Field Communicator Agent: Distills complex biochemistry into unambiguous, non-technical instructions for farm workers.

Operational Rules:
- Never hallucinate chemical mixtures that cause phytotoxicity (e.g., never mix copper fungicides with organophosphates).
- Always verify soil pH impact: acidic soils lock Phosphorus; alkaline soils lock Micronutrients (Iron, Zinc).
- If weather shows rain within 24 hours, flag liquid foliar sprays as INEFFECTIVE (wash-off risk).
- Any synthetic pesticide classified under WHO Class II or higher triggers MANDATORY human approval (\`requires_human_approval = true\`).
- You must always output responses conforming strictly to the provided JSON Schema.
`;
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Model request timed out after ${ms}ms`)), ms))
    ]);
}
const disabledModels = new Set();
async function generateStructuredAgriResponse(prompt, schema, fallbackGenerator) {
    const candidateModels = [exports.GEMINI_MODEL, ...exports.FALLBACK_MODELS.filter(m => m !== exports.GEMINI_MODEL)]
        .filter(m => !disabledModels.has(m));
    for (const model of candidateModels) {
        try {
            const response = await withTimeout(exports.ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: exports.AGRI_AURA_SYSTEM_PROMPT,
                    responseMimeType: 'application/json',
                    responseSchema: schema
                }
            }), 2500);
            const responseText = response.text?.trim();
            if (responseText) {
                const cleaned = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
                const parsed = JSON.parse(cleaned);
                return parsed;
            }
        }
        catch (err) {
            const msg = err.message || String(err);
            if (msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
                disabledModels.add(model);
            }
            console.warn(`[Gemini Service] Model ${model} unavailable: ${msg}. Falling back...`);
        }
    }
    return fallbackGenerator();
}
