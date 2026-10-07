import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables. Falling back to agronomic engine.');
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];

export const AGRI_AURA_SYSTEM_PROMPT = `
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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Model request timed out after ${ms}ms`)), ms))
  ]);
}

const disabledModels = new Set<string>();

export async function generateStructuredAgriResponse<T>(
  prompt: string,
  schema: any,
  fallbackGenerator: () => T
): Promise<T> {
  const candidateModels = [GEMINI_MODEL, ...FALLBACK_MODELS.filter(m => m !== GEMINI_MODEL)]
    .filter(m => !disabledModels.has(m));

  for (const model of candidateModels) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: AGRI_AURA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: schema
          }
        }),
        2500
      );

      const responseText = response.text?.trim();
      if (responseText) {
        const cleaned = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed as T;
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('404') || msg.includes('not found') || msg.includes('no longer available')) {
        disabledModels.add(model);
      }
      console.warn(`[Gemini Service] Model ${model} unavailable: ${msg}. Falling back...`);
    }
  }

  return fallbackGenerator();
}
