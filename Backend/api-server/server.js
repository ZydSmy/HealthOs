import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import patientsRouter from '../routes/patient.js';
import prescriptionsRouter from '../routes/prescription.js';
import labResultsRouter from '../routes/labResult.js';
import vitalSignsRouter from '../routes/vitalSigns.js';
import visitsRouter from '../routes/visits.js';
import dashboardRouter from '../routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthos_db';

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (Frontend) ──
const staticPath = path.join(__dirname, '../..');
app.use(express.static(staticPath));

// ── Request logger ──
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──
app.get('/api/healthz', (_req, res) => res.json({ status: 'ok', service: 'HealthOS API' }));
app.use('/api', patientsRouter);
app.use('/api', prescriptionsRouter);
app.use('/api', labResultsRouter);
app.use('/api', vitalSignsRouter);
app.use('/api', visitsRouter);
app.use('/api', dashboardRouter);

// ── Serve index.html for root ──
app.get('/', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// ── 404 fallback ──
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Connect to MongoDB then start server ──
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HealthOS Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.log('📝 Starting server without database (mock mode)...');
    // Start server even without DB for demo
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HealthOS Server running on http://localhost:${PORT} (MOCK MODE)`);
    });
  });
