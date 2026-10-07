"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAdvisoryController = runAdvisoryController;
exports.listAdvisoriesController = listAdvisoriesController;
exports.getAdvisoryByIdController = getAdvisoryByIdController;
exports.handleHumanDecisionController = handleHumanDecisionController;
exports.updateTaskStatusController = updateTaskStatusController;
const supabase_service_js_1 = require("../services/supabase.service.js");
const orchestrator_service_js_1 = require("../services/orchestrator.service.js");
async function runAdvisoryController(req, res) {
    try {
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
        const result = await (0, orchestrator_service_js_1.orchestrateAdvisoryPipeline)(req.body, userId);
        return res.status(201).json(result);
    }
    catch (err) {
        console.error('Error in runAdvisoryController:', err);
        return res.status(500).json({
            error: 'Failed to process multi-agent advisory',
            message: err.message || 'Unknown agent pipeline error'
        });
    }
}
async function listAdvisoriesController(req, res) {
    try {
        const status = req.query.status;
        const advisories = await supabase_service_js_1.supabaseService.listAdvisories(undefined, status);
        return res.json({ advisories });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to list advisories' });
    }
}
async function getAdvisoryByIdController(req, res) {
    try {
        const id = req.params.id;
        const advisory = await supabase_service_js_1.supabaseService.getAdvisoryById(id);
        if (!advisory) {
            return res.status(404).json({ error: 'Advisory not found' });
        }
        const events = await supabase_service_js_1.supabaseService.getAgentEvents(id);
        const tasks = await supabase_service_js_1.supabaseService.getActionTasks(id);
        return res.json({
            advisory,
            events,
            tasks
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to get advisory details' });
    }
}
async function handleHumanDecisionController(req, res) {
    try {
        const id = req.params.id;
        const { action, modifications } = req.body;
        const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
        const existing = await supabase_service_js_1.supabaseService.getAdvisoryById(id);
        if (!existing) {
            return res.status(404).json({ error: 'Advisory not found' });
        }
        const now = new Date().toISOString();
        let updatedStatus = 'APPROVED';
        let isApproved = true;
        if (action === 'REJECT') {
            updatedStatus = 'REJECTED';
            isApproved = false;
        }
        else if (action === 'MODIFY') {
            updatedStatus = 'APPROVED';
            isApproved = true;
        }
        const summaryAddition = modifications
            ? `\n\n[Human-in-the-Loop Override by Agronomist]: ${modifications}`
            : '';
        const updatedAdvisory = await supabase_service_js_1.supabaseService.updateAdvisory(id, {
            status: updatedStatus,
            is_approved: isApproved,
            approved_by: userId,
            approval_timestamp: now,
            final_summary: (existing.final_summary || '') + summaryAddition
        });
        // Record decision in agent events for transparency
        await supabase_service_js_1.supabaseService.createAgentEvent({
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
            await supabase_service_js_1.supabaseService.incrementMetric('successful_interventions', 1);
        }
        const tasks = await supabase_service_js_1.supabaseService.getActionTasks(id);
        return res.json({
            advisory: updatedAdvisory,
            tasks,
            message: `Intervention ${action.toLowerCase()}d successfully.`
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to register approval decision' });
    }
}
async function updateTaskStatusController(req, res) {
    try {
        const taskId = req.params.taskId;
        const { status } = req.body;
        const task = await supabase_service_js_1.supabaseService.updateTaskStatus(taskId, status);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        return res.json({ task });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to update task status' });
    }
}
