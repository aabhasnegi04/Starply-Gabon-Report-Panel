const express = require('express');
const app = express();
const cors = require('cors');

// CORS configuration for production
const corsOptions = {
  origin: ['http://localhost:3000', 'https://rp.stpudhim.in', 'http://rp.stpudhim.in'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

// Additional CORS headers middleware (backup)
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'https://rp.stpudhim.in', 'http://rp.stpudhim.in'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// IIS provides the port via process.env.PORT (named pipe)
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Log startup information
console.log('Starting server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', __dirname);

// Import and mount routes with error handling
try {
  const authRoutes = require('./routes/authRoutes');
  const containerRoutes = require('./routes/containerRoutes');
  const orderRoutes = require('./routes/orderRoutes');

  app.use('/auth', authRoutes);
  app.use('/container', containerRoutes);
  app.use('/order', orderRoutes);
  
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Test health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/test-cors', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Time: ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
