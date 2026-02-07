const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv/config');

// Check for required environment variables
const requiredEnvVars = ['CONNECTION_STRING', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n Please create a .env file with the required variables.');
  console.error('You can use config.example.js as a reference.');
  process.exit(1);
}

// Import database connection
const connectDB = require('./config/database');

// Import security middleware
const cors = require('cors');
const {
  corsOptions,
  securityHeaders,
  sanitizeInput,
  xssProtection,
  hppProtection,
  requestLogger,
  errorHandler
} = require('./middleware/security');

// Global diagnostics to surface middleware chain issues
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason && reason.stack ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err && err.stack ? err.stack : err);
});
app.use((req, res, next) => {
  console.log(`[trace] ${req.method} ${req.originalUrl} next typeof=${typeof next}`);
  next();
});

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeInput);
app.use(xssProtection);
app.use(hppProtection);
app.use(requestLogger);

// Cookie parsing (for refresh token in httpOnly cookie)
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting - DISABLED
// app.use(generalLimiter);

// Static files
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const imageUploadRoutes = require('./helper/imageUpload');
const productWeightRoutes = require('./routes/productWeight');
const productRAMSRoutes = require('./routes/productRAMS');
const productSIZESRoutes = require('./routes/productSize');
const productReviews = require('./routes/productReviews');
const cartSchema = require('./routes/cart');
const myListSchema = require('./routes/myList');
const ordersSchema = require('./routes/orders');
const homeBannerSchema = require('./routes/homeBanner');
const searchRoutes = require('./routes/search');
const bannersSchema = require('./routes/banners');
const homeSideBannerSchema = require('./routes/homeSideBanner');
const homeBottomBannerSchema = require('./routes/homeBottomBanner');
const paymentRoutes = require("./routes/payment");
const compareListSchema = require('./routes/compareList');
const compareController = require('./routes/compareController');

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/imageUpload", imageUploadRoutes);
app.use("/api/productWeight", productWeightRoutes);
app.use("/api/productRAMS", productRAMSRoutes);
app.use("/api/productSIZE", productSIZESRoutes);
app.use("/api/productReviews", productReviews);
app.use("/api/cart", cartSchema);
app.use("/api/my-list", myListSchema);
app.use("/api/orders", ordersSchema);
app.use("/api/homeBanner", homeBannerSchema);
app.use("/api/search", searchRoutes);
app.use("/api/banners", bannersSchema);
app.use("/api/homeSideBanners", homeSideBannerSchema);
app.use("/api/homeBottomBanners", homeBottomBannerSchema);
app.use("/api/payment", paymentRoutes);
app.use("/api/compare-list", compareListSchema);
app.use('/api', compareController);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Start background jobs for cleanup tasks
    const backgroundJobs = require('./utils/backgroundJobs');
    backgroundJobs.start();

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
      console.log(`API Documentation available at http://localhost:${process.env.PORT}/api`);
      console.log(`Health check available at http://localhost:${process.env.PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing server gracefully');
      backgroundJobs.stop();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing server gracefully');
      backgroundJobs.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();