const { spawn } = require('child_process');

function startTunnel() {
  console.log('[Tunnel] Initiating public SSH tunnel via Serveo...');
  const proc = spawn('ssh', ['-T', '-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:5000', 'serveo.net'], {
    stdio: 'inherit',
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel] Connection closed (code ${code}). Reconnecting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });

  proc.on('error', (err) => {
    console.error('[Tunnel] Error:', err.message);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
