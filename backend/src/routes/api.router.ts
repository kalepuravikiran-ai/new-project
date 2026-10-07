import { Router } from 'express';
import {
  runAdvisoryController,
  listAdvisoriesController,
  getAdvisoryByIdController,
  handleHumanDecisionController,
  updateTaskStatusController
} from '../controllers/advisory.controller.js';
import { getDemoScenariosController } from '../controllers/scenario.controller.js';
import { getMetricsController, getAgentMonitoringController } from '../controllers/metrics.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  CropAdvisoryInputSchema,
  HumanApprovalInputSchema,
  UpdateTaskStatusSchema
} from '../types/index.js';

export const apiRouter = Router();

// Advisory routes
apiRouter.post(
  '/advisories/run',
  authMiddleware,
  validateBody(CropAdvisoryInputSchema),
  runAdvisoryController
);

apiRouter.get('/advisories', authMiddleware, listAdvisoriesController);

apiRouter.get('/advisories/:id', authMiddleware, getAdvisoryByIdController);

apiRouter.post(
  '/advisories/:id/decision',
  authMiddleware,
  validateBody(HumanApprovalInputSchema),
  handleHumanDecisionController
);

apiRouter.patch(
  '/advisories/:id/tasks/:taskId',
  authMiddleware,
  validateBody(UpdateTaskStatusSchema),
  updateTaskStatusController
);

// Demo scenarios
apiRouter.get('/scenarios/demo', getDemoScenariosController);

// Metrics & Agent Monitoring Telemetry
apiRouter.get('/metrics', getMetricsController);
apiRouter.get('/monitoring/agents', getAgentMonitoringController);
