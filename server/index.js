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
const { ensureUploadsDir } = require('./utils/uploadDir');

ensureUploadsDir();

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
const productQuestions = require('./routes/productQuestions');
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
const customerRoutes = require('./routes/customers');
const compareRoutes = require('./routes/compare');
const artisanRoutes = require('./routes/artisans');
const couponRoutes = require('./routes/coupons');
const promoDiscountRoutes = require('./routes/promoDiscounts');
const homeSliderBannerRoutes = require('./routes/homeSliderBanners');
const homepageContentRoutes = require('./routes/homepageContent');
const inventoryRoutes = require('./routes/inventory');
const shippingMethodRoutes = require('./routes/shippingMethods');
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const paymentAdminRoutes = require('./routes/paymentMethods');
const cmsPageRoutes = require('./routes/cmsPages');
const notificationRoutes = require('./routes/notifications');
const adminNotificationRoutes = require('./routes/adminNotifications');
const storeSettingsRoutes = require('./routes/storeSettings');
const { apiAuthGuard } = require('./middleware/auth');

// Require login for every API route except public auth entry points.
app.use('/api', apiAuthGuard);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/products", productRoutes);
app.use("/api/imageUpload", imageUploadRoutes);
app.use("/api/productWeight", productWeightRoutes);
app.use("/api/productRAMS", productRAMSRoutes);
app.use("/api/productSIZE", productSIZESRoutes);
app.use("/api/productReviews", productReviews);
app.use("/api/productQuestions", productQuestions);
app.use("/api/cart", cartSchema);
app.use("/api/my-list", myListSchema);
app.use("/api/orders", ordersSchema);
app.use("/api/customers", customerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/promo-discounts", promoDiscountRoutes);
app.use("/api/home-slider-banners", homeSliderBannerRoutes);
app.use("/api/promo-banners", homeSliderBannerRoutes);
app.use("/api/homepage-content", homepageContentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/shipping-methods", shippingMethodRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentAdminRoutes);
app.use("/api/cms-pages", cmsPageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);
app.use("/api/settings", storeSettingsRoutes);
app.use("/api/homeBanner", homeBannerSchema);
app.use("/api/search", searchRoutes);
app.use("/api/banners", bannersSchema);
app.use("/api/homeSideBanners", homeSideBannerSchema);
app.use("/api/homeBottomBanners", homeBottomBannerSchema);
app.use("/api/payment", paymentRoutes);
app.use("/api/compare-list", compareListSchema);
app.use('/api', compareRoutes);

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
const http = require('http');
const { initAdminNotificationSocket } = require('./realtime/adminNotificationSocket');

const startServer = async () => {
  try {
    await connectDB();

    const adminNotificationsService = require('./services/adminNotificationsService');
    const removedSeedNotifications = await adminNotificationsService.removeSeedNotifications();
    if (removedSeedNotifications > 0) {
      console.log(`Removed ${removedSeedNotifications} seeded admin notification(s).`);
    }

    // Start background jobs for cleanup tasks
    const backgroundJobs = require('./utils/backgroundJobs');
    backgroundJobs.start();

    const server = http.createServer(app);
    initAdminNotificationSocket(server);

    server.listen(process.env.PORT, () => {
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