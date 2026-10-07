# 🌾 Agri-AURA (Autonomous Agricultural Reasoning & Action System)

> **Enterprise-Ready, Multi-Agent Precision Agriculture Crop Advisory Platform**  
> Powered by Google Gemini (`@google/genai`), Supabase PostgreSQL with RLS, Node.js + Express (TypeScript), and React + Vite + Tailwind CSS.

---

## 🌟 Executive Summary

Modern farmers and agricultural enterprises manage fragmented, volatile variables: shifting weather patterns, soil nutrient depletion, emerging pest infestations, complex chemical rotations, and localized irrigation demands. Traditional farming portals provide static, disconnected charts; standard chatbots emit unverified, hallucinated text without structured decision logic.

**Agri-AURA** is a **deterministic, multi-agent agricultural intelligence platform** where agronomic challenges (e.g., *“Yellowing lower leaves in Stage V3 maize under sandy loam with recent heavy rainfall”*) are systematically decomposed into diagnostic sub-tasks, matched against soil chemistry and weather data, verified through agronomic safety checks, approved via human-in-the-loop controls for high-risk interventions, and translated into verified execution schedules.

---

## 🔗 Live Public Access

The full-stack application is deployed and accessible publicly:
- **Public URL**: [https://0e00c74f6776a26c-157-50-158-195.serveousercontent.com](https://0e00c74f6776a26c-157-50-158-195.serveousercontent.com)
- **Alternative Mirror**: [https://major-berries-battle.loca.lt](https://major-berries-battle.loca.lt) *(Tunnel Password: `157.50.158.195`)*
- **Local Address**: `http://localhost:5000`

---

## 🤖 The 6-Agent Sequential Architecture

```
[User / Field Sensor Intake]
      │
      ▼
[POST /api/advisories/run]
      │
      ├──► Agent 1: Crop Planner (Decomposes scenario into 4-6 investigation subtasks)
      ├──► Agent 2: Soil & Agronomic Researcher (Matches symptoms against N-P-K, pH & pathology vectors)
      ├──► Agent 3: Intervention Decision Agent (Weighs biological vs synthetic treatments with confidence scoring)
      ├──► Agent 4: Safety & Regulatory Verifier (Audits WHO toxicity, PHI days, rain washoff & biosecurity)
      │
      ▼
[Is High-Risk Intervention Flagged?]
      │
     ├── YES ──► State: AWAITING_APPROVAL ──► [Frontend Shows HITL Modal]
     │                                               │
     │                                    ┌──────────┴──────────┐
     │                                    ▼                     ▼
     │                               [Approve Action]     [Reject / Re-reason]
     │                                    │                     │
     │                                    ▼                     ▼
     │                         [State: APPROVED]       [Update State / Abort]
     │                                    │
     └── NO ──────────────────────────────┘
      │
      ▼
[Agent 5: Action Executor] ──► Generates exact task schedule, dosages & delivery steps
      │
      ▼
[Agent 6: Field Communicator] ──► Generates worker-ready plain language instructions & warnings
      │
      ▼
[Database Record Finalized] ──► [Interactive Report Rendered on /advisor/:advisoryId]
```

1. **Crop Planner Agent**: Parses complex farm situations into chronological investigation steps and identifies root focus.
2. **Soil & Agronomic Researcher Agent**: Synthesizes N-P-K levels, soil texture, pH fixation dynamics, and crop growth stages.
3. **Intervention Decision Agent**: Computes treatment alternatives, weighs biological vs. synthetic treatments, and provides confidence-scored decisions.
4. **Safety & Regulatory Verifier Agent**: Cross-references restricted chemical active ingredients, mandatory Pre-Harvest Intervals (PHI), rain washoff, and environmental toxicity. Enforces mandatory HITL approval for Class II pesticides.
5. **Action Executor Agent**: Generates actionable spray schedules, irrigation volume recommendations, and field labor tasks.
6. **Field Communicator Agent**: Translates technical chemical formulations into plain, multilingual field instructions for farm workers.

---

## 🛡️ Human-In-The-Loop (HITL) Gatekeeper

- **Low-Risk Interventions**: (e.g. drip fertigation adjustments, biological inoculants, compost extracts) are auto-cleared.
- **High-Risk Interventions**: (e.g. Class II synthetic pesticides, systemic fungicides, nitrogen surge applications) enforce explicit farm-manager approval modals (`Approve`, `Modify`, `Reject`, `Re-reason`).

---

## 🎯 4 Pre-Seeded Precision Ag Scenarios (1-Click Demos)

1. **Scenario 1: Maize Nitrogen Leaching Post-Downpour**
   - *Stage*: Vegetative V3-V4 in Sandy Loam
   - *Weather*: 48mm rainfall downpour
   - *Outcome*: Prescribes split-fertigation with nitrification inhibitor; auto-cleared low chemical hazard.
2. **Scenario 2: Cotton Late-Season Bollworm Infestation**
   - *Stage*: Boll Development with green bolls open 60%
   - *Pest*: *Helicoverpa armigera* larval boring
   - *Outcome*: Recommends Chlorantraniliprole 18.5% SC; triggers **MANDATORY HIGH-RISK HITL APPROVAL** with 14-day PHI.
3. **Scenario 3: Tomato Early Blight under High Humidity**
   - *Stage*: Flowering & Early Fruit Set in Silt Loam
   - *Pathogen*: *Alternaria solani* concentric ring lesions under 91% humidity
   - *Outcome*: Dual mode-of-action systemic fungicide + biological barrier; flags 18mm rain washoff intervals.
4. **Scenario 4: Vineyard Drip Irrigation & Potassium Deficiency Balancing**
   - *Stage*: Veraison (Berry Softening) in alkaline clay loam (pH 7.8)
   - *Symptoms*: Marginal leaf scorch
   - *Outcome*: Sulfate of Potash (SOP) micro-fertigation, avoiding chloride toxicity.

---

## 💻 Tech Stack

- **Frontend**: React 18+, TypeScript, Vite, Tailwind CSS, `@tailwindcss/forms`, Lucide React, React Router v6.
- **Backend**: Node.js 20+, Express.js, TypeScript (`tsx` / `tsc`), Zod schemas, Rate Limiting, CORS.
- **AI / LLM**: Google Gemini (`@google/genai` SDK) with low-latency structured schema generation and rule-based agronomic synthesis fallback.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies and dual-mode persistent local store fallback.

---

## 🗄️ Database Setup (Supabase)

The production schema is located at [`database/schema.sql`](file:///c:/new%20project/database/schema.sql). To provision the tables, enums, metrics, and RLS policies:
1. Open your Supabase Project Dashboard: `https://dcefeonddylxehepkrzl.supabase.co`
2. Navigate to the **SQL Editor** tab.
3. Paste the contents of `database/schema.sql` and click **Run**.

---

## 🚀 Getting Started

### 1. Environment Configuration

Separate `.env` files are configured for both backend and frontend:

**`backend/.env`**:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**`frontend/.env`**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

### 2. Install & Run Locally

```bash
# Install root dependencies
npm install

# Run both Backend & Frontend concurrently
npm run dev

# Or build for single-port production server (port 5000)
npm run build
npm start
```

---

## 📡 API Reference

- `POST /api/advisories/run`: Executes full 6-agent sequential pipeline (Zod validated).
- `GET /api/advisories`: Lists all field advisories with optional status filters.
- `GET /api/advisories/:id`: Fetches single advisory with full agent traces and action items.
- `POST /api/advisories/:id/decision`: Handles human-in-the-loop review (`APPROVE`, `REJECT`, `MODIFY`).
- `PATCH /api/advisories/:id/tasks/:taskId`: Updates execution state of individual field tasks.
- `GET /api/scenarios/demo`: Delivers the 4 pre-configured demo scenarios.
- `GET /api/metrics`: Aggregates automation metrics (water saved, hazards prevented, acres advised).
- `GET /api/monitoring/agents`: Real-time operational telemetry for all 6 agents.

---

## 🔒 Security & Biosecurity Standards

- **Server-Side API Key Confinement**: Neither Gemini API keys nor Supabase Service Role keys are ever exposed to the client.
- **Input Sanitization**: All incoming payloads pass strict Zod boundary validation before model invocation.
- **EPA / WHO Safety Alignment**: Synthetic Class II chemical treatments strictly mandate Pre-Harvest Interval compliance and manager sign-off.
