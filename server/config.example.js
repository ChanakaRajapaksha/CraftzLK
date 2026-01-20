// Environment Configuration Example
// Copy this file to .env and update with your actual values

module.exports = {
  // Database Configuration
  CONNECTION_STRING: 'mongodb+srv://chanakaprasath456_db_user:MONGODBrcp123@ecommerce.2gvt2oq.mongodb.net/marketplace?retryWrites=true&w=majority&appName=ECommerce',
  
  // Server Configuration
  PORT: 5000,
  
  // JWT Configuration
  JWT_SECRET: 'your_super_secure_jwt_secret_key_here_change_this_in_production',
  JWT_REFRESH_SECRET: 'your_super_secure_refresh_secret_key_here_change_this_in_production',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Frontend URL
  FRONTEND_URL: 'http://localhost:3000',
  
  // Cloudinary Configuration (replace with your actual credentials)
  CLOUDINARY_CLOUD_NAME: 'your_cloudinary_cloud_name',
  CLOUDINARY_API_KEY: 'your_cloudinary_api_key',
  CLOUDINARY_API_SECRET: 'your_cloudinary_api_secret',
  
  // Email Configuration (replace with your actual credentials)
  EMAIL_USER: 'your_email@gmail.com',
  EMAIL_PASS: 'your_email_password',
  
  // Payment Gateway Configuration (replace with your actual credentials)
  RAZORPAY_KEY_ID: 'your_razorpay_key_id',
  RAZORPAY_KEY_SECRET: 'your_razorpay_key_secret',
  
  STRIPE_SECRET_KEY: 'your_stripe_secret_key',
  STRIPE_PUBLISHABLE_KEY: 'your_stripe_publishable_key'
};