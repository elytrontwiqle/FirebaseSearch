#!/usr/bin/env node

/**
 * Deployment script for Firebase Search Extension
 * 
 * This script helps deploy the search extension and provides
 * useful information about the deployed functions.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase Search Extension Deployment Script\n');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
  } catch (error) {
    console.error('❌ Firebase CLI is not installed');
    console.error('Please install it with: npm install -g firebase-tools');
    process.exit(1);
  }
}

// Check if Firebase project is initialized
function checkFirebaseProject() {
  if (!fs.existsSync('.firebaserc')) {
    console.error('❌ Firebase project not initialized');
    console.error('Please run: firebase init');
    process.exit(1);
  }
  
  const firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
  const projectId = firebaserc.projects?.default;
  
  if (!projectId) {
    console.error('❌ No default Firebase project found');
    console.error('Please run: firebase use --add');
    process.exit(1);
  }
  
  console.log(`✅ Firebase project: ${projectId}`);
  return projectId;
}

// Install dependencies
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    // Install root dependencies
    if (fs.existsSync('package.json')) {
      console.log('Installing root dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // Install functions dependencies
    if (fs.existsSync('functions/package.json')) {
      console.log('Installing functions dependencies...');
      execSync('cd functions && npm install', { stdio: 'inherit', shell: true });
    }
    
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Deploy functions
function deployFunctions() {
  console.log('\n🚀 Deploying Firebase Functions...');
  
  try {
    execSync('firebase deploy --only functions', { stdio: 'inherit' });
    console.log('✅ Functions deployed successfully');
  } catch (error) {
    console.error('❌ Failed to deploy functions:', error.message);
    process.exit(1);
  }
}

// Get function URLs
function getFunctionUrls(projectId) {
  console.log('\n🔗 Function URLs:');
  
  const region = 'us-central1'; // Default region, adjust if needed
  const baseUrl = `https://${region}-${projectId}.cloudfunctions.net`;

 console.log(`\n🌐 HTTP Endpoint:`);
  console.log(`   URL: ${baseUrl}/ext-firestore-search-extension-searchCollectionHttp`);
  console.log(`   Methods: GET, POST`);
  console.log(`   Note: Collection and searchable fields are configured during extension installation`);
  
  return {
    http: `${baseUrl}/ext-firestore-search-extension-searchCollectionHttp`
  };
}

// Generate example requests
function generateExamples(urls) {
  console.log('\n📋 Example Usage:\n');
  
  console.log('🔸 JavaScript (Simplified API):');
  console.log(`
// Collection and searchable fields are pre-configured during installation
const searchFirestore = async (value, options = {}) => {
  const response = await fetch('${urls.http}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchValue: value,
      ...options
    })
  });
  return await response.json();
};

const result = await searchFirestore('john', {
  returnFields: 'name,email,profileImage',
  limit: 10
});
`);

  console.log('🔸 cURL (HTTP Endpoint):');
  console.log(`
# POST request (collection and searchable fields pre-configured)
curl -X POST "${urls.http}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "searchValue": "john",
    "returnFields": "name,email,profileImage",
    "limit": 10
  }'

# GET request  
curl "${urls.http}?searchValue=john&returnFields=name,email&limit=5"
`);

  console.log('🔸 JavaScript (HTTP with fetch):');
  console.log(`
// Simple API - collection and searchable fields are pre-configured
const response = await fetch('${urls.http}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    searchValue: 'john',
    returnFields: 'name,email,profileImage', 
    limit: 10
  })
});

const result = await response.json();
`);
}

// Test deployment
function testDeployment(urls) {
  console.log('\n🧪 Testing deployment...');
  
  try {
    // Simple connectivity test
    const testCommand = `curl -s -o /dev/null -w "%{http_code}" "${urls.http}?searchValue=test"`;
    const statusCode = execSync(testCommand, { encoding: 'utf8' }).trim();
    
    if (statusCode === '200' || statusCode === '400') {
      console.log('✅ HTTP endpoint is responding');
    } else {
      console.log(`⚠️  HTTP endpoint returned status code: ${statusCode}`);
    }
  } catch (error) {
    console.log('⚠️  Could not test HTTP endpoint (curl not available)');
  }
}

// Main deployment process
async function main() {
  try {
    // Pre-deployment checks
    checkFirebaseCLI();
    const projectId = checkFirebaseProject();
    
    // Install dependencies
    installDependencies();
    
    // Deploy functions
    deployFunctions();
    
    // Get function information
    const urls = getFunctionUrls(projectId);
    
    // Generate examples
    generateExamples(urls);
    
    // Test deployment
    testDeployment(urls);
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Test the functions with the examples above');
    console.log('2. Check the Firebase Console for function logs');
    console.log('3. Set up Firestore security rules if needed');
    console.log('4. Configure authentication if required');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if script is executed directly
if (require.main === module) {
  main();
}
