/**
 * JWT Authentication Example for Firebase Search Extension
 * 
 * This example demonstrates how to use the Firebase Search Extension with JWT authentication enabled.
 * When REQUIRE_JWT_AUTHENTICATION is set to "true", all API requests must include a valid Firebase ID token.
 */

// Example 1: Making an authenticated request with Firebase ID token
async function searchWithAuthentication() {
  // First, get a Firebase ID token from your Firebase Auth user
  // This would typically be done in your frontend application
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error('User must be signed in to get ID token');
  }
  
  const idToken = await user.getIdToken();
  
  // Make the search request with the Authorization header (v2 API)
  const response = await fetch('https://your-project.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}` // Include the Firebase ID token
    },
    body: JSON.stringify({
      searchValue: 'laptop',
      limit: 10,
      caseSensitive: false
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Search results:', result.data);
    console.log('User info:', result.meta.user); // Contains authenticated user information
    console.log('Authentication status:', result.meta.authenticated); // true when JWT is enabled
  } else {
    console.error('Search failed:', result.error);
  }
}

// Example 2: Handling authentication errors
async function handleAuthenticationErrors() {
  try {
    const response = await fetch('https://your-project.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Missing Authorization header - will fail if JWT is required
      },
      body: JSON.stringify({
        searchValue: 'laptop'
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      // Handle different authentication error codes
      switch (result.error.code) {
        case 'NO_TOKEN':
          console.error('Authentication token is missing');
          // Redirect to login or show authentication prompt
          break;
          
        case 'TOKEN_EXPIRED':
          console.error('Authentication token has expired');
          // Refresh the token and retry
          break;
          
        case 'TOKEN_REVOKED':
          console.error('Authentication token has been revoked');
          // Force user to re-authenticate
          break;
          
        case 'INVALID_TOKEN':
          console.error('Authentication token is invalid');
          // Check token format or get a new token
          break;
          
        case 'PROJECT_ERROR':
          console.error('Firebase project configuration error');
          // Contact administrator
          break;
          
        default:
          console.error('Unknown authentication error:', result.error);
      }
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Example 3: Using with custom domain (if configured)
async function searchWithCustomDomain() {
  const user = firebase.auth().currentUser;
  const idToken = await user.getIdToken();
  
  // Using custom domain instead of default Firebase Functions URL (v2 API)
  const response = await fetch('https://yourdomain.com/api/search/v2/products', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });
  
  const result = await response.json();
  console.log('Custom domain search result:', result);
}

// Example 4: Node.js server-side usage with Firebase Admin SDK
async function serverSideAuthenticatedSearch() {
  const admin = require('firebase-admin');
  
  // Initialize Firebase Admin (if not already done)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
  
  // Create a custom token for a specific user (server-side only)
  const uid = 'user123';
  const customToken = await admin.auth().createCustomToken(uid);
  
  // In a real application, you would send this custom token to the client
  // The client would then use it to sign in and get an ID token
  // For this example, we'll simulate getting an ID token
  
  console.log('Custom token created for server-side authentication');
  console.log('Send this token to your client application to complete authentication');
}

// Example 5: Checking if JWT authentication is enabled
async function checkAuthenticationStatus() {
  // Make a request without authentication to see if it's required (v2 API)
  const response = await fetch('https://your-project.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      searchValue: 'test'
    })
  });
  
  const result = await response.json();
  
  if (response.status === 401) {
    console.log('JWT authentication is ENABLED - token required');
    console.log('Error details:', result.error);
  } else if (result.success) {
    console.log('JWT authentication is DISABLED - public access allowed');
    console.log('Authentication status in response:', result.meta.authenticated);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchWithAuthentication,
    handleAuthenticationErrors,
    searchWithCustomDomain,
    serverSideAuthenticatedSearch,
    checkAuthenticationStatus
  };
}

/**
 * Configuration Notes:
 * 
 * 1. JWT Authentication Parameter:
 *    - Set REQUIRE_JWT_AUTHENTICATION to "true" to enable JWT validation
 *    - Set to "false" (default) to disable and allow public access
 * 
 * 2. Firebase ID Tokens:
 *    - Use Firebase Authentication to generate ID tokens
 *    - Tokens are automatically validated against your Firebase project
 *    - Tokens expire after 1 hour by default
 * 
 * 3. Authorization Header Format:
 *    - Must use "Bearer" prefix: "Authorization: Bearer <your-id-token>"
 *    - Case-insensitive header name support
 * 
 * 4. Response Changes with Authentication:
 *    - Authenticated responses include user information in meta.user
 *    - meta.authenticated indicates if JWT validation is enabled
 *    - User object contains: uid, email, emailVerified
 * 
 * 5. Error Handling:
 *    - 401 status for authentication failures
 *    - Specific error codes for different failure types
 *    - Detailed error messages for debugging
 * 
 * 6. Backward Compatibility:
 *    - Existing applications work unchanged when JWT is disabled
 *    - No breaking changes to API structure or response format
 *    - CORS headers updated to support Authorization header
 * 
 * 7. Security Implementation:
 *    - Uses Firebase Admin SDK's verifyIdToken() for cryptographic validation
 *    - Validates token signature, expiration, issuer, and audience
 *    - Supports token revocation and automatic expiration
 *    - No server-side token storage (stateless validation)
 *    - Audit logging for all authentication attempts
 * 
 * 8. Security Best Practices:
 *    - Always use HTTPS for token transmission
 *    - Never store tokens in localStorage or sessionStorage
 *    - Get fresh tokens using user.getIdToken() for each request
 *    - Handle token expiration gracefully with refresh logic
 *    - Never log tokens in console or files
 *    - Use proper error handling to avoid information leakage
 */
