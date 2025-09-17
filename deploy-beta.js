#!/usr/bin/env node

/**
 * Firebase Search Extension - Beta Deployment Script
 * 
 * This script helps deploy the Firebase Search Extension v2.0.0-beta
 * with proper validation and safety checks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Validate extension configuration
 */
function validateExtension() {
  logHeader('🔍 Validating Extension Configuration');
  
  // Check extension.yaml exists
  if (!fs.existsSync('extension.yaml')) {
    throw new Error('extension.yaml not found');
  }
  
  // Read and validate extension.yaml
  const extensionConfig = fs.readFileSync('extension.yaml', 'utf8');
  
  // Check version is beta
  if (!extensionConfig.includes('version: 2.0.0-beta')) {
    throw new Error('Version must be 2.0.0-beta for beta deployment');
  }
  
  // Check functions directory exists
  if (!fs.existsSync('functions')) {
    throw new Error('functions directory not found');
  }
  
  // Check functions/index.js exists
  if (!fs.existsSync('functions/index.js')) {
    throw new Error('functions/index.js not found');
  }
  
  // Validate functions code includes v2 support
  const functionsCode = fs.readFileSync('functions/index.js', 'utf8');
  if (!functionsCode.includes('case \'v2\':')) {
    throw new Error('functions/index.js does not include v2 API support');
  }
  
  logSuccess('Extension configuration validated');
}

/**
 * Run tests if available
 */
function runTests() {
  logHeader('🧪 Running Tests');
  
  try {
    // Check if test script exists
    const packageJson = JSON.parse(fs.readFileSync('functions/package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.test) {
      logInfo('Running test suite...');
      execSync('cd functions && npm test', { stdio: 'inherit' });
      logSuccess('All tests passed');
    } else {
      logWarning('No test script found - skipping tests');
    }
  } catch (error) {
    logError('Tests failed');
    throw error;
  }
}

/**
 * Install dependencies
 */
function installDependencies() {
  logHeader('📦 Installing Dependencies');
  
  try {
    logInfo('Installing function dependencies...');
    execSync('cd functions && npm install', { stdio: 'inherit' });
    logSuccess('Dependencies installed');
  } catch (error) {
    logError('Failed to install dependencies');
    throw error;
  }
}

/**
 * Build extension
 */
function buildExtension() {
  logHeader('🔨 Building Extension');
  
  try {
    // Check if build script exists
    const packageJson = JSON.parse(fs.readFileSync('functions/package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      logInfo('Running build script...');
      execSync('cd functions && npm run build', { stdio: 'inherit' });
      logSuccess('Extension built successfully');
    } else {
      logInfo('No build script found - skipping build step');
    }
  } catch (error) {
    logError('Build failed');
    throw error;
  }
}

/**
 * Deploy to Firebase Extensions
 */
function deployExtension() {
  logHeader('🚀 Deploying Beta Extension');
  
  try {
    logInfo('Publishing extension to Firebase Extensions...');
    
    // Use Firebase CLI to publish extension
    const publishCommand = 'firebase ext:dev:publish elytron/firestore-search-extension';
    
    logInfo(`Running: ${publishCommand}`);
    execSync(publishCommand, { stdio: 'inherit' });
    
    logSuccess('Extension published successfully!');
    
    // Display installation instructions
    console.log('\n' + '='.repeat(60));
    log('📋 Beta Installation Instructions', 'bright');
    console.log('='.repeat(60));
    
    logInfo('Install the beta extension using:');
    console.log('');
    log('Firebase Console:', 'cyan');
    console.log('https://console.firebase.google.com/project/_/extensions/install?ref=elytron/firestore-search-extension@2.0.0-beta');
    console.log('');
    log('Firebase CLI:', 'cyan');
    console.log('firebase ext:install elytron/firestore-search-extension@2.0.0-beta --project=your-project-id');
    console.log('');
    
    logWarning('This is a BETA release - use for testing only');
    logInfo('Report issues and feedback for improvements');
    
  } catch (error) {
    logError('Deployment failed');
    throw error;
  }
}

/**
 * Create deployment summary
 */
function createDeploymentSummary() {
  logHeader('📊 Deployment Summary');
  
  const summary = {
    version: '2.0.0-beta',
    timestamp: new Date().toISOString(),
    features: [
      'v2 API with enhanced metadata',
      'JWT authentication support',
      'Rich performance insights',
      'Enhanced security context',
      'User custom claims support',
      'Feature detection capabilities'
    ],
    apiVersions: ['v2 (beta)', 'v1 (stable)', 'legacy (compatibility)'],
    deployment: {
      status: 'success',
      environment: 'beta'
    }
  };
  
  // Write summary to file
  fs.writeFileSync('deployment-summary.json', JSON.stringify(summary, null, 2));
  
  logSuccess('Deployment completed successfully!');
  logInfo('Summary saved to deployment-summary.json');
  
  console.log('\n' + JSON.stringify(summary, null, 2));
}

/**
 * Main deployment function
 */
async function deployBeta() {
  try {
    logHeader('🚀 Firebase Search Extension v2.0.0-beta Deployment');
    
    logInfo('Starting beta deployment process...');
    
    // Pre-deployment checks
    validateExtension();
    installDependencies();
    buildExtension();
    runTests();
    
    // Deployment
    deployExtension();
    createDeploymentSummary();
    
    logHeader('🎉 Beta Deployment Complete!');
    
    logSuccess('Firebase Search Extension v2.0.0-beta deployed successfully');
    logInfo('Extension is now available for beta testing');
    logWarning('Remember: This is a beta release - monitor for issues');
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Firebase Search Extension Beta Deployment Script

Usage:
  node deploy-beta.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Validate configuration without deploying
  --skip-tests   Skip running tests (not recommended)

Examples:
  node deploy-beta.js                    # Full deployment
  node deploy-beta.js --dry-run          # Validation only
  node deploy-beta.js --skip-tests       # Deploy without tests
`);
    process.exit(0);
  }
  
  if (args.includes('--dry-run')) {
    logHeader('🔍 Dry Run - Validation Only');
    try {
      validateExtension();
      installDependencies();
      buildExtension();
      if (!args.includes('--skip-tests')) {
        runTests();
      }
      logSuccess('Validation completed - ready for deployment');
    } catch (error) {
      logError(`Validation failed: ${error.message}`);
      process.exit(1);
    }
  } else {
    deployBeta();
  }
}

module.exports = {
  deployBeta,
  validateExtension,
  runTests,
  installDependencies,
  buildExtension,
  deployExtension
};
