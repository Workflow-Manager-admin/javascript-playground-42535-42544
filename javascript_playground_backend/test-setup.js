const express = require('express');
const app = require('./src/app');

// Simple test to verify the application can be imported and basic functionality works
console.log('Testing JavaScript Playground Backend Setup...\n');

// Test 1: App can be imported
try {
  console.log('✓ App module imported successfully');
} catch (error) {
  console.error('✗ Failed to import app module:', error.message);
  process.exit(1);
}

// Test 2: Database service can be imported
try {
  const database = require('./src/services/database');
  console.log('✓ Database service imported successfully');
} catch (error) {
  console.error('✗ Failed to import database service:', error.message);
  process.exit(1);
}

// Test 3: Code execution service can be imported
try {
  const codeExecution = require('./src/services/codeExecution');
  console.log('✓ Code execution service imported successfully');
} catch (error) {
  console.error('✗ Failed to import code execution service:', error.message);
  process.exit(1);
}

// Test 4: All models can be imported
try {
  const User = require('./src/models/User');
  const CodeSnippet = require('./src/models/CodeSnippet');
  const ExecutionHistory = require('./src/models/ExecutionHistory');
  console.log('✓ All models imported successfully');
} catch (error) {
  console.error('✗ Failed to import models:', error.message);
  process.exit(1);
}

// Test 5: All controllers can be imported
try {
  const authController = require('./src/controllers/auth');
  const executionController = require('./src/controllers/execution');
  const snippetsController = require('./src/controllers/snippets');
  console.log('✓ All controllers imported successfully');
} catch (error) {
  console.error('✗ Failed to import controllers:', error.message);
  process.exit(1);
}

// Test 6: Swagger spec can be generated
try {
  const swaggerSpec = require('./swagger');
  console.log('✓ Swagger specification generated successfully');
  console.log(`  - API Title: ${swaggerSpec.info.title}`);
  console.log(`  - API Version: ${swaggerSpec.info.version}`);
  console.log(`  - Available paths: ${Object.keys(swaggerSpec.paths).length}`);
} catch (error) {
  console.error('✗ Failed to generate Swagger spec:', error.message);
  process.exit(1);
}

console.log('\n🎉 All setup tests passed! The JavaScript Playground Backend is ready.');
console.log('\nNext steps:');
console.log('1. Configure your database connection in .env file');
console.log('2. Start the server with: npm run dev');
console.log('3. Visit http://localhost:3000/docs for API documentation');
console.log('4. The database tables will be created automatically on first run');
