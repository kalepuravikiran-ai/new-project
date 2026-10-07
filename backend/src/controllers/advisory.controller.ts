import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { supabaseService } from '../services/supabase.service.js';
import { orchestrateAdvisoryPipeline } from '../services/orchestrator.service.js';
import { AdvisoryStatus, HumanApprovalInput } from '../types/index.js';

export async function runAdvisoryController(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    const result = await orchestrateAdvisoryPipeline(req.body, userId);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('Error in runAdvisoryController:', err);
    return res.status(500).json({
      error: 'Failed to process multi-agent advisory',
      message: err.message || 'Unknown agent pipeline error'
    });
  }
}

export async function listAdvisoriesController(req: AuthenticatedRequest, res: Response) {
  try {
    const status = req.query.status as AdvisoryStatus | undefined;
    const advisories = await supabaseService.listAdvisories(undefined, status);
    return res.json({ advisories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list advisories' });
  }
}

export async function getAdvisoryByIdController(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const advisory = await supabaseService.getAdvisoryById(id);
    if (!advisory) {
      return res.status(404).json({ error: 'Advisory not found' });
    }

    const events = await supabaseService.getAgentEvents(id);
    const tasks = await supabaseService.getActionTasks(id);

    return res.json({
      advisory,
      events,
      tasks
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get advisory details' });
  }
}

export async function handleHumanDecisionController(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { action, modifications } = req.body as HumanApprovalInput;
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';

    const existing = await supabaseService.getAdvisoryById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Advisory not found' });
    }

    const now = new Date().toISOString();
    let updatedStatus: AdvisoryStatus = 'APPROVED';
    let isApproved = true;

    if (action === 'REJECT') {
      updatedStatus = 'REJECTED';
      isApproved = false;
    } else if (action === 'MODIFY') {
      updatedStatus = 'APPROVED';
      isApproved = true;
    }

    const summaryAddition = modifications
      ? `\n\n[Human-in-the-Loop Override by Agronomist]: ${modifications}`
      : '';

    const updatedAdvisory = await supabaseService.updateAdvisory(id, {
      status: updatedStatus,
      is_approved: isApproved,
      approved_by: userId,
      approval_timestamp: now,
      final_summary: (existing.final_summary || '') + summaryAddition
    });

    // Record decision in agent events for transparency
    await supabaseService.createAgentEvent({
      advisory_id: id,
      agent: 'VERIFIER',
      step_number: 7,
      status: action === 'REJECT' ? 'WARNING' : 'COMPLETED',
      summary: `Human-in-the-Loop Gatekeeper: Action '${action}' submitted by Farm Manager`,
      reasoning_trace: {
        action,
        modifications: modifications || 'Standard authorization granted without changes'
      },
      output_data: { action, timestamp: now },
      latency_ms: 12
    });

    if (action === 'APPROVE' || action === 'MODIFY') {
      await supabaseService.incrementMetric('successful_interventions', 1);
    }

    const tasks = await supabaseService.getActionTasks(id);

    return res.json({
      advisory: updatedAdvisory,
      tasks,
      message: `Intervention ${action.toLowerCase()}d successfully.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to register approval decision' });
  }
}

export async function updateTaskStatusController(req: AuthenticatedRequest, res: Response) {
  try {
    const taskId = req.params.taskId as string;
    const { status } = req.body;
    const task = await supabaseService.updateTaskStatus(taskId, status);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json({ task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update task status' });
  }
}
