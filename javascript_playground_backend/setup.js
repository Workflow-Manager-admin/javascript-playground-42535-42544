#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 JavaScript Playground Backend Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please edit .env file with your actual database credentials\n');
  } else {
    console.log('❌ .env.example file not found');
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Generate OpenAPI specification
console.log('📚 Generating OpenAPI specification...');
try {
  require('./generate_openapi.js');
  console.log('✅ OpenAPI specification generated successfully!\n');
} catch (error) {
  console.error('❌ Failed to generate OpenAPI specification:', error.message);
}

// Display setup instructions
console.log('📋 Setup Instructions:');
console.log('1. Configure your database connection in the .env file');
console.log('2. Make sure your MySQL database is running');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Visit http://localhost:3000/docs for API documentation');
console.log('\n🔧 Database Setup:');
console.log('- The application will automatically create required tables');
console.log('- Make sure the database specified in DB_NAME exists');
console.log('- Grant appropriate permissions to the database user');
console.log('\n🎉 You\'re all set! Happy coding!');
