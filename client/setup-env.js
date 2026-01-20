#!/usr/bin/env node

/**
 * Environment Setup Helper
 * This script helps you create a .env file with the correct Vite environment variables
 */

const fs = require('fs');
const path = require('path');

const envTemplate = `# Firebase Configuration (Required for authentication)
# Get these values from your Firebase project settings
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:5000

# Google AI Configuration (Optional)
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GEMINI_API_URL=your_gemini_api_url

# Payment Configuration (Optional)
VITE_PAYHERE_MERCHANT_ID=your_merchant_id
`;

const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📝 Please update your .env file with the correct Firebase credentials');
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with template values');
  console.log('📝 Please update the .env file with your actual Firebase credentials');
}

console.log('\n🔧 Next steps:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Add a web app to your project');
console.log('4. Copy the Firebase config values to your .env file');
console.log('5. Enable Authentication in Firebase Console');
console.log('6. Restart your development server: npm run dev');
