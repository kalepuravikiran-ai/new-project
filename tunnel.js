const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const cloudflaredPath = path.join(__dirname, 'cloudflared.exe');

function startCloudflareTunnel() {
  console.log('[Tunnel] Starting high-speed Cloudflare Tunnel on port 5000...');
  const proc = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:5000'], {
    stdio: 'inherit',
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel] Cloudflare tunnel exited with code ${code}. Restarting in 3 seconds...`);
    setTimeout(startCloudflareTunnel, 3000);
  });

  proc.on('error', (err) => {
    console.error('[Tunnel] Cloudflare error:', err.message);
    startServeoTunnel();
  });
}

function startServeoTunnel() {
  console.log('[Tunnel] Starting backup SSH tunnel via Serveo...');
  const proc = spawn('ssh', ['-T', '-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:5000', 'serveo.net'], {
    stdio: 'inherit',
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel] Serveo exited with code ${code}. Restarting in 3 seconds...`);
    setTimeout(startServeoTunnel, 3000);
  });

  proc.on('error', (err) => {
    console.error('[Tunnel] SSH error:', err.message);
    setTimeout(startServeoTunnel, 3000);
  });
}

if (fs.existsSync(cloudflaredPath)) {
  startCloudflareTunnel();
} else {
  startServeoTunnel();
}
