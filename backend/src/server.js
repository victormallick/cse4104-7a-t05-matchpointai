const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route files
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors({
  origin: '*', // Allow all origins for initial API development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/user', userRoutes);

// Root / Health-check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MatchPoint AI Backend Server running successfully.',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// 404 Route handler for unmatched endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  
  const statusCode = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start listening on port
const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 MatchPoint AI Backend running on port ${PORT}`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
});

// Graceful shutdown support for containerization/Railway deployment
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

module.exports = app; // Export for potential supertest / E2E suites
