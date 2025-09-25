const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || `http://localhost:${PORT}`,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter); // Only apply rate limiting to API routes

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meanapp')
    .then(() => {
      console.log('✅ Connected to MongoDB successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1);
    });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MEAN Stack API is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Serve Angular static files
app.use(express.static(path.join(__dirname, '../client/dist/mean-app')));

// API 404 handler (only for /api routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API Route not found',
    message: `The requested API route ${req.originalUrl} does not exist`
  });
});

// Catch all handler: send back Angular's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/mean-app/index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error.message);

  // Check if it's an API request
  if (req.originalUrl.startsWith('/api')) {
    res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } else {
    // For non-API requests, serve the Angular app
    res.sendFile(path.join(__dirname, '../client/dist/mean-app/index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;