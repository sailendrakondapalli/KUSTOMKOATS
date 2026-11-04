import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sanitizeBody } from './middleware/validation.js';

// Import routes
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import promoRoutes from './routes/promo.js';
import wholesaleRoutes from './routes/wholesale.js';
import storageRoutes from './routes/storage.js';
import cartRoutes from './routes/cart.js';
import profileRoutes from './routes/profile.js';
import contentRoutes from './routes/content.js';
import wishlistRoutes from './routes/wishlist.js';
import paymentFailuresRoutes from './routes/payment-failures.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://www.kustomkoats.in',
  'https://kustomkoats.in',
  'https://kustomkoats.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log(`⚠️  Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize input
app.use(sanitizeBody);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n🔵 [REQUEST] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(data) {
    console.log(`\n🟢 [RESPONSE] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    console.log('📤 Response Data:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    console.log('─'.repeat(80));
    return originalSend.call(this, data);
  };

  res.json = function(data) {
    console.log(`\n🟢 [RESPONSE] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    console.log('📤 Response Data:', JSON.stringify(data, null, 2));
    console.log('─'.repeat(80));
    return originalJson.call(this, data);
  };

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'KustomKoats Backend API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/wholesale', wholesaleRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment-failures', paymentFailuresRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   KustomKoats Backend API Server              ║
║   Running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                 ║
║   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'} ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
