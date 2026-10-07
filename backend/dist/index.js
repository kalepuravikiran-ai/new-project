"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api_router_js_1 = require("./routes/api.router.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
// CORS configuration
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow any origin during dev/tunnels, or if no origin (mobile/curl)
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(express_1.default.json({ limit: '5mb' }));
// Rate limiting on advisory generation (Section 18)
const advisoryLimiter = (0, express_rate_limit_1.default)({
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
app.use('/api', api_router_js_1.apiRouter);
// Serve frontend build if available (enabling single unified public URL deployment)
const frontendDistPath = path_1.default.resolve(process.cwd(), '../frontend/dist');
const localDistPath = path_1.default.resolve(process.cwd(), 'frontend_dist');
let staticPath = '';
if (fs_1.default.existsSync(frontendDistPath)) {
    staticPath = frontendDistPath;
}
else if (fs_1.default.existsSync(localDistPath)) {
    staticPath = localDistPath;
}
if (staticPath) {
    console.log(`[Static] Serving frontend from ${staticPath}`);
    app.use(express_1.default.static(staticPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api'))
            return next();
        res.sendFile(path_1.default.join(staticPath, 'index.html'));
    });
}
// Global error handler
app.use(error_middleware_js_1.errorHandler);
const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌾 Agri-AURA Core Backend running on port ${PORT}`);
    console.log(`⚡ API available at http://localhost:${PORT}/api`);
    console.log(`====================================================`);
});
exports.default = app;
