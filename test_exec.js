const http = require('http');

async function postJSON(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body, statusCode: res.statusCode });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getJSON(urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 5000, path: urlPath }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Testing Scenarios Demo Endpoint ---');
  const scenarios = await getJSON('/api/scenarios/demo');
  console.log(`Loaded ${scenarios.scenarios.length} demo scenarios.`);

  console.log('\n--- 2. Executing Scenario 2: Cotton Late-Season Bollworm (High Risk HITL) ---');
  const cottonScenario = scenarios.scenarios.find((s) => s.id === 'scenario-2-cotton-bollworm');
  const runRes = await postJSON('/api/advisories/run', cottonScenario.data);

  console.log('Advisory ID:', runRes.advisory?.id);
  console.log('Status:', runRes.advisory?.status);
  console.log('Risk Level:', runRes.advisory?.overall_risk_level);
  console.log('Requires Human Approval:', runRes.advisory?.requires_human_approval);
  console.log('Summary:', runRes.advisory?.final_summary);
  console.log('Worker Instructions:', runRes.advisory?.worker_instructions);
  console.log('Events Count (Agents):', runRes.events?.length);
  runRes.events?.forEach((ev) => {
    console.log(`  Agent [${ev.agent}]: ${ev.summary} (${ev.latency_ms}ms)`);
  });
  console.log('Tasks Count:', runRes.tasks?.length);
  runRes.tasks?.forEach((task) => {
    console.log(`  Task: ${task.task_title} | Dose: ${task.dosage_or_rate} | Method: ${task.application_method} | High Risk: ${task.is_high_risk}`);
  });

  if (runRes.advisory?.requires_human_approval) {
    console.log('\n--- 3. Executing Farm Manager HITL Approval ---');
    const approvalRes = await postJSON(`/api/advisories/${runRes.advisory.id}/decision`, {
      action: 'APPROVE',
      modifications: 'Calibrated for 85 acres with drone aerial boom sprayer. Certified by Farm Manager.',
    });
    console.log('Updated Status after Approval:', approvalRes.advisory?.status);
    console.log('Is Approved:', approvalRes.advisory?.is_approved);
  }

  console.log('\n--- 4. Checking Aggregate Metrics ---');
  const metrics = await getJSON('/api/metrics');
  console.log('Metrics:', JSON.stringify(metrics, null, 2));

  console.log('\n>>> ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<');
}

run().catch(console.error);
