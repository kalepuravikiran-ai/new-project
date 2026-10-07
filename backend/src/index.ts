import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/api.router.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin during dev/tunnels, or if no origin (mobile/curl)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

app.use(express.json({ limit: '5mb' }));

// Rate limiting on advisory generation (Section 18)
const advisoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // generous limit for hackathons and demos
  message: { error: 'Too many advisory requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/advisories/run', advisoryLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Agri-AURA (Autonomous Agricultural Reasoning & Action System)',
    version: '1.0.0',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRouter);

// Serve frontend build if available (enabling single unified public URL deployment)
const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
const localDistPath = path.resolve(process.cwd(), 'frontend_dist');

let staticPath = '';
if (fs.existsSync(frontendDistPath)) {
  staticPath = frontendDistPath;
} else if (fs.existsSync(localDistPath)) {
  staticPath = localDistPath;
}

if (staticPath) {
  console.log(`[Static] Serving frontend from ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌾 Agri-AURA Core Backend running on port ${PORT}`);
  console.log(`⚡ API available at http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

export default app;
