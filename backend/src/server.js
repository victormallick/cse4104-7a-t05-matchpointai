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

// 2. CORS Policy: Allow local dev origins + environment FRONTEND_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
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

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 150 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' }
});

const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 45 : 300,
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
  const server = app.listen(PORT, () => {
    console.log('=================================================');
    console.log(`MatchPoint AI Backend running on http://localhost:${PORT}`);
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
