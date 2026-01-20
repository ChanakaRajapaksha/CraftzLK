# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
CONNECTION_STRING=mongodb+srv://username:password@cluster0.earth.mongodb.net/marketplace?retryWrites=true&w=majority

# Server Configuration
PORT=5000

# JWT Secret (replace with your actual secret)
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration (replace with your actual credentials)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (replace with your actual credentials)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Payment Gateway Configuration (replace with your actual credentials)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. MongoDB Setup
- Create a MongoDB Atlas account at https://www.mongodb.com/atlas
- Create a new cluster
- Get your connection string and replace the placeholder values in your `.env` file
- Make sure to whitelist your IP address in MongoDB Atlas

### 4. Run the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

## Fixed Issues
- ✅ Removed deprecated MongoDB connection options (`useNewUrlParser`, `useUnifiedTopology`)
- ✅ Added proper error handling for missing environment variables
- ✅ Added development script (`npm run dev`)
- ✅ Improved error messages and logging
- ✅ Fixed MongoDB hostname typo (earhh → earth)

## Troubleshooting

### Common Issues:

1. **"Missing required environment variables"**
   - Make sure you have created a `.env` file with all required variables
   - Check that the `.env` file is in the root directory

2. **"Database connection failed"**
   - Verify your MongoDB connection string is correct
   - Check that your MongoDB Atlas cluster is running
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Verify your username and password are correct

3. **"Authentication failed"**
   - Double-check your MongoDB username and password
   - Make sure the user has proper permissions in MongoDB Atlas
   - Verify the database name in your connection string

## API Endpoints
The server will run on `http://localhost:5000` (or your configured PORT) with the following main routes:
- `/api/user` - User management
- `/api/products` - Product management
- `/api/category` - Category management
- `/api/cart` - Shopping cart
- `/api/orders` - Order management
- And many more...