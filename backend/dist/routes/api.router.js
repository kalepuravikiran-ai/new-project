"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const advisory_controller_js_1 = require("../controllers/advisory.controller.js");
const scenario_controller_js_1 = require("../controllers/scenario.controller.js");
const metrics_controller_js_1 = require("../controllers/metrics.controller.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const index_js_1 = require("../types/index.js");
exports.apiRouter = (0, express_1.Router)();
// Advisory routes
exports.apiRouter.post('/advisories/run', auth_middleware_js_1.authMiddleware, (0, validate_middleware_js_1.validateBody)(index_js_1.CropAdvisoryInputSchema), advisory_controller_js_1.runAdvisoryController);
exports.apiRouter.get('/advisories', auth_middleware_js_1.authMiddleware, advisory_controller_js_1.listAdvisoriesController);
exports.apiRouter.get('/advisories/:id', auth_middleware_js_1.authMiddleware, advisory_controller_js_1.getAdvisoryByIdController);
exports.apiRouter.post('/advisories/:id/decision', auth_middleware_js_1.authMiddleware, (0, validate_middleware_js_1.validateBody)(index_js_1.HumanApprovalInputSchema), advisory_controller_js_1.handleHumanDecisionController);
exports.apiRouter.patch('/advisories/:id/tasks/:taskId', auth_middleware_js_1.authMiddleware, (0, validate_middleware_js_1.validateBody)(index_js_1.UpdateTaskStatusSchema), advisory_controller_js_1.updateTaskStatusController);
// Demo scenarios
exports.apiRouter.get('/scenarios/demo', scenario_controller_js_1.getDemoScenariosController);
// Metrics & Agent Monitoring Telemetry
exports.apiRouter.get('/metrics', metrics_controller_js_1.getMetricsController);
exports.apiRouter.get('/monitoring/agents', metrics_controller_js_1.getAgentMonitoringController);
