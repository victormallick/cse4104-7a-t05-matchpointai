const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');
const userRoutes = require('./routes/user');
const interviewRoutes = require('./routes/interview');
const jobsRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');
const { isSupabaseConfigured } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false // Handled per-client
}));

// 2. CORS Policy: Allow local dev origins + environment FRONTEND_URL + Vercel deployments
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl requests (no origin) or verified origins or Vercel preview/production URLs
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production' ||
      origin.includes('vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS request blocked by MatchPoint AI security policy.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Demo-Role'],
  credentials: true
}));

// 3. Body parsers with defensive payload size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Rate Limiters (DDoS & Abuse Prevention)
const isProd = process.env.NODE_ENV === 'production';

// Trust reverse proxy headers on Render / cloud deployments
app.set('trust proxy', 1);

// Health check endpoints (placed BEFORE rate limiters so Render health checks & pings never get 429)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MatchPoint AI Backend Server is running.',
    data: {
      environment: process.env.NODE_ENV || 'development',
      mode: isSupabaseConfigured ? 'supabase' : 'demo',
      time: new Date().toISOString()
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MatchPoint AI API is healthy.',
    data: {
      database: isSupabaseConfigured ? 'configured' : 'demo',
      ai: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY ? 'configured' : 'demo'
    }
  });
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 60 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' }
});

const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI evaluation quota limit reached. Please wait a few minutes before scanning again.' }
});

app.use(globalLimiter);

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Mounted Routes with Layered Rate Limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/upload', aiAnalysisLimiter, uploadRoutes);
app.use('/api/analysis', aiAnalysisLimiter, analysisRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interview', aiAnalysisLimiter, interviewRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

if (require.main === module) {
  // Auto Keep-Alive Heartbeat for Free-Tier Cloud Hosting (Render / Railway)
  const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://matchpointsai.onrender.com' : null);
  if (keepAliveUrl) {
    const https = require('https');
    const http = require('http');
    const client = keepAliveUrl.startsWith('https') ? https : http;
    const pingInterval = 12 * 60 * 1000; // Ping every 12 minutes (Render sleeps after 15m)

    setInterval(() => {
      try {
        const pingEndpoint = `${keepAliveUrl.replace(/\/$/, '')}/api/health`;
        client.get(pingEndpoint, (res) => {
          console.log(`[Keep-Alive] Heartbeat ping sent to ${pingEndpoint} (HTTP ${res.statusCode})`);
        }).on('error', (err) => {
          console.warn('[Keep-Alive] Heartbeat notice:', err.message);
        });
      } catch (err) {
        console.warn('[Keep-Alive] Heartbeat error:', err.message);
      }
    }, pingInterval);
    console.log(`[Keep-Alive] Self-ping heartbeat worker active for ${keepAliveUrl}`);
  }

  const server = app.listen(PORT, () => {
    console.log('=================================================');
    console.log(`MatchPoint AI Backend running on port ${PORT}`);
    console.log(`Data mode: ${isSupabaseConfigured ? 'Supabase' : 'Demo / in-memory'}`);
    console.log('=================================================');
  });

  const closeServer = (signal) => {
    console.log(`${signal} received: closing HTTP server...`);
    server.close(() => console.log('HTTP server closed.'));
  };

  process.on('SIGTERM', () => closeServer('SIGTERM'));
  process.on('SIGINT', () => closeServer('SIGINT'));
}

module.exports = app;
