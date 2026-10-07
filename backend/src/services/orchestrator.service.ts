import {
  CropAdvisoryInput,
  CropAdvisoryEntity,
  AdvisoryAgentEvent,
  AdvisoryActionTask,
  FullAgentExecutionResult
} from '../types/index.js';
import { supabaseService } from './supabase.service.js';
import { runPlannerAgent } from './agents/planner.agent.js';
import { runResearcherAgent } from './agents/researcher.agent.js';
import { runDecisionAgent } from './agents/decision.agent.js';
import { runVerifierAgent } from './agents/verifier.agent.js';
import { runExecutorAgent } from './agents/executor.agent.js';
import { runCommunicatorAgent } from './agents/communicator.agent.js';

export async function orchestrateAdvisoryPipeline(
  input: CropAdvisoryInput,
  userId: string
): Promise<FullAgentExecutionResult> {
  const events: AdvisoryAgentEvent[] = [];

  // Step 0: Create initial advisory record in ANALYZING state
  const initialAdvisory = await supabaseService.createAdvisory({
    ...input,
    user_id: userId,
    status: 'ANALYZING',
    overall_risk_level: 'LOW',
    requires_human_approval: false,
    is_approved: false
  });

  const advisoryId = initialAdvisory.id;

  try {
    // ----------------------------------------------------
    // Agent 1: Crop Planner Agent
    // ----------------------------------------------------
    const t1Start = Date.now();
    const plannerOutput = await runPlannerAgent(input);
    const t1Latency = Date.now() - t1Start;

    const plannerEvent = await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'PLANNER',
      step_number: 1,
      status: 'COMPLETED',
      summary: `Formulated ${plannerOutput.planner_subtasks.length} diagnostic subtasks focusing on ${plannerOutput.primary_focus}`,
      reasoning_trace: {
        primary_focus: plannerOutput.primary_focus,
        risk_factors: plannerOutput.risk_factors_to_investigate
      },
      output_data: plannerOutput,
      latency_ms: t1Latency
    });
    events.push(plannerEvent);

    // ----------------------------------------------------
    // Agent 2: Soil & Agronomic Researcher Agent
    // ----------------------------------------------------
    const t2Start = Date.now();
    const researcherOutput = await runResearcherAgent(input, plannerOutput);
    const t2Latency = Date.now() - t2Start;

    const researcherEvent = await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'RESEARCHER',
      step_number: 2,
      status: 'COMPLETED',
      summary: `Diagnosed ${researcherOutput.primary_diagnosis} (${researcherOutput.diagnosis_confidence}% confidence)`,
      reasoning_trace: {
        soil_chemistry_analysis: researcherOutput.soil_chemistry_analysis,
        stress_factors: researcherOutput.stress_factors,
        nutrient_details: researcherOutput.nutrient_deficiency_details
      },
      output_data: researcherOutput,
      latency_ms: t2Latency
    });
    events.push(researcherEvent);

    // ----------------------------------------------------
    // Agent 3: Intervention Decision Agent
    // ----------------------------------------------------
    const t3Start = Date.now();
    const decisionOutput = await runDecisionAgent(input, plannerOutput, researcherOutput);
    const t3Latency = Date.now() - t3Start;

    const decisionEvent = await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'DECISION',
      step_number: 3,
      status: 'COMPLETED',
      summary: `Selected ${decisionOutput.selected_intervention_type}: ${decisionOutput.primary_treatment}`,
      reasoning_trace: {
        rationale: decisionOutput.decision_rationale,
        alternatives_considered: decisionOutput.treatment_alternatives_considered
      },
      output_data: decisionOutput,
      latency_ms: t3Latency
    });
    events.push(decisionEvent);

    // ----------------------------------------------------
    // Agent 4: Safety & Regulatory Verifier Agent
    // ----------------------------------------------------
    const t4Start = Date.now();
    const verifierOutput = await runVerifierAgent(input, researcherOutput, decisionOutput);
    const t4Latency = Date.now() - t4Start;

    const verifierEvent = await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'VERIFIER',
      step_number: 4,
      status: verifierOutput.requires_human_approval ? 'WARNING' : 'COMPLETED',
      summary: verifierOutput.requires_human_approval
        ? `FLAGGED FOR HUMAN APPROVAL: PHI ${verifierOutput.phi_days_required}d, ${verifierOutput.flagged_hazards.length} hazards identified`
        : `Verified biosecure with 0 restricted residues (Risk: ${verifierOutput.overall_risk_level})`,
      reasoning_trace: {
        biosecurity_evaluation: verifierOutput.biosecurity_evaluation,
        hazards: verifierOutput.flagged_hazards,
        rain_washoff_risk: verifierOutput.rain_washoff_risk
      },
      output_data: verifierOutput,
      latency_ms: t4Latency
    });
    events.push(verifierEvent);

    // ----------------------------------------------------
    // Agent 5: Action Executor Agent
    // ----------------------------------------------------
    const t5Start = Date.now();
    const executorOutput = await runExecutorAgent(input, researcherOutput, decisionOutput, verifierOutput);
    const t5Latency = Date.now() - t5Start;

    const executorEvent = await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'EXECUTOR',
      step_number: 5,
      status: 'COMPLETED',
      summary: `Generated ${executorOutput.action_tasks.length} calibrated field tasks within window "${executorOutput.application_window}"`,
      reasoning_trace: {
        application_window: executorOutput.application_window,
        irrigation_adjustment_hours: executorOutput.irrigation_adjustment_hours
      },
      output_data: executorOutput,
      latency_ms: t5Latency
    });
    events.push(executorEvent);

    // Persist action tasks
    const taskRecords = await supabaseService.createActionTasks(
      executorOutput.action_tasks.map(t => ({
        advisory_id: advisoryId,
        task_title: t.task_title,
        category: t.category,
        dosage_or_rate: t.dosage_or_rate,
        application_method: t.application_method,
        scheduled_date: new Date().toISOString().split('T')[0],
        pre_harvest_interval_days: t.pre_harvest_interval_days,
        is_high_risk: t.is_high_risk,
        status: 'PENDING'
      }))
    );

    // ----------------------------------------------------
    // Agent 6: Field Communicator Agent
    // ----------------------------------------------------
    const t6Start = Date.now();
    const communicatorOutput = await runCommunicatorAgent(
      input,
      researcherOutput,
      decisionOutput,
      verifierOutput,
      executorOutput
    );
    const t6Latency = Date.now() - t6Start;

    const communicatorEvent = await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'COMMUNICATOR',
      step_number: 6,
      status: 'COMPLETED',
      summary: `Rendered manager executive briefing and multilingual worker instructions`,
      reasoning_trace: {
        safety_warnings: communicatorOutput.safety_warnings_multilingual
      },
      output_data: communicatorOutput,
      latency_ms: t6Latency
    });
    events.push(communicatorEvent);

    // Determine final advisory status
    const requiresApproval = verifierOutput.requires_human_approval;
    const finalStatus = requiresApproval ? 'AWAITING_APPROVAL' : 'APPROVED';

    const updatedAdvisory = await supabaseService.updateAdvisory(advisoryId, {
      status: finalStatus,
      overall_risk_level: verifierOutput.overall_risk_level,
      requires_human_approval: requiresApproval,
      is_approved: !requiresApproval,
      approved_by: requiresApproval ? null : userId,
      approval_timestamp: requiresApproval ? null : new Date().toISOString(),
      final_summary: communicatorOutput.final_summary,
      worker_instructions: communicatorOutput.worker_instructions
    });

    // Update global system metrics
    await supabaseService.incrementMetric('total_advisories_executed', 1);
    if (!requiresApproval) {
      await supabaseService.incrementMetric('successful_interventions', 1);
    } else {
      await supabaseService.incrementMetric('chemical_risks_prevented', 1);
    }
    await supabaseService.incrementMetric('water_cubic_meters_saved', Math.round(input.field_size_acres * 12.5));

    return {
      advisory: updatedAdvisory || initialAdvisory,
      events,
      tasks: taskRecords,
      requires_human_approval: requiresApproval,
      overall_risk_level: verifierOutput.overall_risk_level
    };

  } catch (error: any) {
    console.error(`[Orchestrator] Error during pipeline execution for advisory ${advisoryId}:`, error);

    // Record failure in agent events
    await supabaseService.createAgentEvent({
      advisory_id: advisoryId,
      agent: 'VERIFIER',
      step_number: events.length + 1,
      status: 'FAILED',
      summary: `Pipeline encountered exception: ${error.message || 'Unknown error'}`,
      reasoning_trace: { error: String(error) },
      output_data: {},
      latency_ms: 0
    });

    const failedAdvisory = await supabaseService.updateAdvisory(advisoryId, {
      status: 'FAILED',
      final_summary: `Advisory analysis could not be completed automatically: ${error.message || 'Diagnostic error'}`
    });

    throw error;
  }
}
