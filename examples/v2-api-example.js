/**
 * Firebase Search Extension v2 API Examples
 * 
 * This file demonstrates the enhanced features available in the v2 API,
 * including richer metadata, enhanced user context, and improved performance insights.
 * 
 * v2 API Features:
 * - Enhanced response metadata with feature detection
 * - Performance and security configuration details
 * - Expanded user context including custom claims
 * - Future-ready foundation for advanced features
 */

// Base URL for v2 API endpoints
const BASE_URL_V2 = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2';

// Custom domain URL (if configured)
const CUSTOM_DOMAIN_V2 = 'https://yourdomain.com/api/search/v2';

/**
 * Example 1: Basic v2 API Search with Enhanced Metadata
 */
async function basicV2Search() {
  try {
    console.log('=== v2 API Basic Search ===');
    
    const response = await fetch(`${BASE_URL_V2}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify({
        searchValue: 'laptop',
        limit: 5,
        sortBy: 'price',
        direction: 'asc'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Search Results:', result.data);
      
      // v2 API Enhanced Metadata
      console.log('\n=== Enhanced v2 Metadata ===');
      console.log('API Version:', result.meta.apiVersion);
      console.log('Features:', result.meta.features);
      console.log('Performance:', result.meta.performance);
      console.log('Security:', result.meta.security);
      console.log('User Context:', result.meta.user);
    } else {
      console.error('Search failed:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

/**
 * Example 2: Feature Detection with v2 API
 */
async function featureDetection() {
  try {
    console.log('=== v2 API Feature Detection ===');
    
    const response = await fetch(`${BASE_URL_V2}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify({
        searchValue: 'john',
        limit: 1
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.meta.features) {
      console.log('Available Features:');
      console.log('- JWT Authentication:', result.meta.features.supportsJwtAuthentication);
      console.log('- User Context:', result.meta.features.supportsUserContext);
      console.log('- Enhanced Metadata:', result.meta.features.supportsEnhancedMetadata);
      console.log('- Fuzzy Search:', result.meta.features.supportsFuzzySearch);
      console.log('- Advanced Sorting:', result.meta.features.supportsAdvancedSorting);
      
      // Use feature detection to enable/disable UI features
      if (result.meta.features.supportsUserContext) {
        console.log('\n✅ User context available - can implement user-specific features');
      }
      
      if (result.meta.security.jwtAuthenticationEnabled) {
        console.log('✅ JWT authentication is enabled - secure mode active');
      }
    }
  } catch (error) {
    console.error('Feature detection failed:', error);
  }
}

/**
 * Example 3: Performance Monitoring with v2 API
 */
async function performanceMonitoring() {
  try {
    console.log('=== v2 API Performance Monitoring ===');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL_V2}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify({
        searchValue: 'pending',
        limit: 20,
        sortBy: 'createdAt',
        direction: 'desc'
      })
    });
    
    const result = await response.json();
    const requestTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`Request completed in ${requestTime}ms`);
      console.log('Results found:', result.meta.totalResults);
      
      // v2 Performance Insights
      if (result.meta.performance) {
        console.log('\n=== Performance Configuration ===');
        console.log('Search Optimized:', result.meta.performance.searchOptimized);
        console.log('Fuzzy Search Enabled:', result.meta.performance.fuzzySearchEnabled);
        console.log('Rate Limiting Enabled:', result.meta.performance.rateLimitingEnabled);
        
        // Performance recommendations
        if (!result.meta.performance.searchOptimized) {
          console.warn('⚠️  Consider creating Firestore indexes for better performance');
        }
        
        if (requestTime > 1000) {
          console.warn('⚠️  Slow request detected - consider optimizing query or adding indexes');
        }
      }
    }
  } catch (error) {
    console.error('Performance monitoring failed:', error);
  }
}

/**
 * Example 4: Security Context Analysis
 */
async function securityContextAnalysis() {
  try {
    console.log('=== v2 API Security Context ===');
    
    const response = await fetch(`${BASE_URL_V2}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify({
        searchValue: 'admin',
        limit: 5
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.meta.security) {
      console.log('Security Configuration:');
      console.log('- JWT Authentication:', result.meta.security.jwtAuthenticationEnabled);
      console.log('- Collection Restricted:', result.meta.security.collectionRestricted);
      console.log('- Field Restricted:', result.meta.security.fieldRestricted);
      
      // User context with custom claims (v2 feature)
      if (result.meta.user && result.meta.user.customClaims) {
        console.log('\n=== User Custom Claims ===');
        console.log('Custom Claims:', result.meta.user.customClaims);
        
        // Example: Check for admin role
        if (result.meta.user.customClaims.role === 'admin') {
          console.log('✅ User has admin privileges');
        }
        
        // Example: Check for specific permissions
        if (result.meta.user.customClaims.permissions) {
          console.log('User Permissions:', result.meta.user.customClaims.permissions);
        }
      }
    }
  } catch (error) {
    console.error('Security context analysis failed:', error);
  }
}

/**
 * Example 5: Comparing v1 vs v2 API Responses
 */
async function compareApiVersions() {
  try {
    console.log('=== API Version Comparison ===');
    
    const searchParams = {
      searchValue: 'test',
      limit: 1
    };
    
    // v1 API Request
    const v1Response = await fetch(`${BASE_URL_V2.replace('/v2', '/v1')}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify(searchParams)
    });
    
    // v2 API Request
    const v2Response = await fetch(`${BASE_URL_V2}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify(searchParams)
    });
    
    const v1Result = await v1Response.json();
    const v2Result = await v2Response.json();
    
    console.log('\n=== v1 API Metadata ===');
    console.log('Keys:', Object.keys(v1Result.meta));
    console.log('Version:', v1Result.meta.version);
    
    console.log('\n=== v2 API Metadata ===');
    console.log('Keys:', Object.keys(v2Result.meta));
    console.log('Version:', v2Result.meta.version);
    console.log('Additional v2 Features:');
    console.log('- apiVersion:', v2Result.meta.apiVersion);
    console.log('- features:', !!v2Result.meta.features);
    console.log('- performance:', !!v2Result.meta.performance);
    console.log('- security:', !!v2Result.meta.security);
    console.log('- enhanced user context:', !!v2Result.meta.user?.customClaims);
    
  } catch (error) {
    console.error('API comparison failed:', error);
  }
}

/**
 * Example 6: Error Handling with v2 API
 */
async function v2ErrorHandling() {
  try {
    console.log('=== v2 API Error Handling ===');
    
    // Intentionally trigger an error (missing search value)
    const response = await fetch(`${BASE_URL_V2}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getFirebaseIdToken()}`
      },
      body: JSON.stringify({
        limit: 10
        // Missing searchValue - will cause validation error
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.log('Error Code:', result.error.code);
      console.log('Error Message:', result.error.message);
      console.log('Timestamp:', result.error.timestamp);
      
      // v2 API maintains same error structure as v1
      // Handle errors the same way across all API versions
      switch (result.error.code) {
        case 'VALIDATION_ERROR':
          console.log('🔧 Fix validation issues and retry');
          break;
        case 'NO_TOKEN':
          console.log('🔐 Authentication required');
          break;
        case 'TOKEN_EXPIRED':
          console.log('🔄 Refresh authentication token');
          break;
        default:
          console.log('❌ Handle other error types');
      }
    }
  } catch (error) {
    console.error('Error handling test failed:', error);
  }
}

/**
 * Helper function to get Firebase ID token
 * In a real application, this would get the token from your Firebase Auth user
 */
async function getFirebaseIdToken() {
  // This is a placeholder - replace with actual Firebase Auth implementation
  if (typeof firebase !== 'undefined' && firebase.auth) {
    const user = firebase.auth().currentUser;
    if (user) {
      return await user.getIdToken();
    }
  }
  
  // For testing purposes, return a placeholder
  // In production, ensure user is authenticated first
  throw new Error('User must be authenticated to get ID token');
}

/**
 * Run all v2 API examples
 */
async function runAllV2Examples() {
  console.log('🚀 Firebase Search Extension v2 API Examples\n');
  
  try {
    await basicV2Search();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await featureDetection();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await performanceMonitoring();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await securityContextAnalysis();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await compareApiVersions();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await v2ErrorHandling();
    
    console.log('\n✅ All v2 API examples completed!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    basicV2Search,
    featureDetection,
    performanceMonitoring,
    securityContextAnalysis,
    compareApiVersions,
    v2ErrorHandling,
    runAllV2Examples
  };
}

/**
 * v2 API Benefits Summary:
 * 
 * 1. **Enhanced Metadata**: Rich response metadata for better client-side decision making
 * 2. **Feature Detection**: Programmatically discover API capabilities
 * 3. **Performance Insights**: Monitor and optimize search performance
 * 4. **Security Context**: Detailed security configuration and user context
 * 5. **User Custom Claims**: Access to Firebase Auth custom claims for advanced permissions
 * 6. **Future-Ready**: Foundation for upcoming features like user-specific filtering
 * 7. **Backward Compatibility**: Same core functionality as v1 with enhanced features
 * 
 * Migration Strategy:
 * - v1 API: Continue using for production applications (stable)
 * - v2 API: Use for new applications or when enhanced features are needed
 * - Legacy API: Maintain for backward compatibility (no JWT support)
 */
