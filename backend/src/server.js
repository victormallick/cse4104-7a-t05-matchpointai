const express = require('express');
const cors = require('cors');
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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-Demo-Role']
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interview', interviewRoutes);
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
