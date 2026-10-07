"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskStatusSchema = exports.HumanApprovalInputSchema = exports.CropAdvisoryInputSchema = exports.TaskStatusEnum = exports.InterventionCategoryEnum = exports.AgentRoleEnum = exports.RiskLevelEnum = exports.AdvisoryStatusEnum = exports.SymptomDistributionEnum = exports.NutrientStatusEnum = exports.SoilTypeEnum = void 0;
const zod_1 = require("zod");
exports.SoilTypeEnum = zod_1.z.enum([
    'Sandy',
    'Sandy Loam',
    'Clay Loam',
    'Silt Loam',
    'Heavy Clay',
    'Peat',
    'Saline/Alkaline'
]);
exports.NutrientStatusEnum = zod_1.z.enum(['Deficient', 'Low', 'Optimal', 'Excess']);
exports.SymptomDistributionEnum = zod_1.z.enum([
    'Isolated Patches',
    'Field-Wide Uniform',
    'Along Irrigation Lines',
    'Perimeter/Edge Only'
]);
exports.AdvisoryStatusEnum = zod_1.z.enum([
    'DRAFT',
    'ANALYZING',
    'AWAITING_APPROVAL',
    'APPROVED',
    'EXECUTED',
    'REJECTED',
    'FAILED'
]);
exports.RiskLevelEnum = zod_1.z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']);
exports.AgentRoleEnum = zod_1.z.enum([
    'PLANNER',
    'RESEARCHER',
    'DECISION',
    'VERIFIER',
    'EXECUTOR',
    'COMMUNICATOR'
]);
exports.InterventionCategoryEnum = zod_1.z.enum([
    'CHEMICAL_SYNTHETIC',
    'ORGANIC_BIOLOGICAL',
    'FERTIGATION_MINERAL',
    'CULTURAL_MECHANICAL'
]);
exports.TaskStatusEnum = zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
// Core intake input schema
exports.CropAdvisoryInputSchema = zod_1.z.object({
    field_name: zod_1.z.string().min(2, 'Field identifier must be at least 2 characters').max(60),
    field_size_acres: zod_1.z.number().positive('Field size must be greater than 0'),
    crop_type: zod_1.z.string().min(2, 'Crop type is required'),
    growth_stage: zod_1.z.string().min(2, 'Growth stage is required'),
    soil_type: exports.SoilTypeEnum,
    soil_ph: zod_1.z.number().min(3.5, 'pH cannot be below 3.5').max(10.0, 'pH cannot exceed 10.0'),
    soil_n_status: exports.NutrientStatusEnum,
    soil_p_status: exports.NutrientStatusEnum,
    soil_k_status: exports.NutrientStatusEnum,
    soil_moisture_pct: zod_1.z.number().min(0, 'Moisture cannot be negative').max(100, 'Moisture cannot exceed 100%'),
    recent_rainfall_mm: zod_1.z.number().min(0, 'Rainfall cannot be negative').default(0),
    temperature_celsius: zod_1.z.number().min(-20, 'Temperature too low').max(60, 'Temperature too high'),
    humidity_pct: zod_1.z.number().min(0, 'Humidity cannot be negative').max(100, 'Humidity cannot exceed 100%'),
    observed_symptoms: zod_1.z.string().min(10, 'Provide a detailed symptom description (min 10 characters)'),
    symptom_distribution: exports.SymptomDistributionEnum
});
// Human approval action input
exports.HumanApprovalInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REJECT', 'MODIFY']),
    modifications: zod_1.z.string().optional()
});
// Task Update Schema
exports.UpdateTaskStatusSchema = zod_1.z.object({
    status: exports.TaskStatusEnum
});
