# 🔍 Firebase Firestore Search Extension

A powerful HTTP-based search extension for Firebase Firestore that provides dedicated search functionality for a single configured collection with pre-defined searchable fields, advanced filtering, and comprehensive error handling.

## ✨ Features

- **HTTP REST API**: Simple HTTP endpoints with API versioning for easy integration
- **API Versioning**: Support for `/v2/` endpoints with enhanced features
- **🔐 JWT Authentication**: Optional Firebase ID token validation for secure API access
- **Pre-configured Search**: Collection and searchable fields configured during installation
- **Fuzzy Search**: Configurable typo tolerance for better UX (default: 1 typo per 4 characters)
- **Result Sorting**: Sort results by any field with ascending/descending options
- **Data Transformation**: Automatic conversion of Firestore timestamps and references to clean JSON
- **Field Filtering**: Return only specific fields to optimize response size
- **Nested Field Support**: Search and return nested fields using dot notation (e.g., `user.profile.name`)
- **Case Sensitivity Control**: Configure case-sensitive or case-insensitive searches
- **Result Limiting**: Configurable limits to prevent performance issues
- **Comprehensive Validation**: Input validation with detailed error messages
- **CORS Support**: Built-in CORS support for web applications
- **Rate Limiting**: Configurable per-origin request limiting to prevent abuse
- **Enhanced Security**: Collection and searchable fields locked during installation

## 🚀 Quick Start

### Installation via Firebase Extensions

Use the direct installation link:

**Stable Release (Recommended for Production):**
```
https://console.firebase.google.com/project/_/extensions/install?ref=elytron/firestore-search-extension@1.5.0
```

**Beta Release (v2 API with JWT Authentication & Enhanced Features):**
```
https://console.firebase.google.com/project/_/extensions/install?ref=elytron/firestore-search-extension@2.0.0-beta
```

**🔐 JWT Authentication Note**: JWT authentication is exclusively available in v2 API. This v2.0.0-beta deployment is independent of any existing v1.x installations.

Or install via Firebase CLI:

**Stable:**
```bash
firebase ext:install elytron/firestore-search-extension@1.5.0 --project=your-project-id
```

**Beta:**
```bash
firebase ext:install elytron/firestore-search-extension@2.0.0-beta --project=your-project-id
```

### Configuration Parameters

During installation, configure these parameters:
- **Location**: Cloud Functions deployment region
- **🔐 JWT Authentication**: Enable Firebase ID token validation for secure API access (default: disabled)
- **Searchable Collections**: Comma-separated list of collections that can be searched (optional, leave empty to allow all collections)
- **Searchable Fields**: Comma-separated list of fields to search in (required)
- **Default Return Fields**: Default fields to return in results (optional, returns all if empty)
- **Default Search Limit**: Default maximum results (default: 50)
- **Maximum Search Limit**: Absolute maximum results (default: 1000)
- **Case Sensitivity**: Default case sensitivity setting
- **Fuzzy Search**: Enable typo tolerance (default: enabled)
- **Typo Tolerance**: Characters per typo in fuzzy search (default: 4)
- **Rate Limiting**: Configure requests per minute per origin (default: 60)
- **Rate Limit Window**: Time window for rate limiting in minutes (default: 1)

## 📋 API Reference

### HTTP Endpoint

After installation, your search endpoint will be available at:

#### v2 API (Enhanced Features with JWT Authentication - Beta)
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/{collectionName}
```

**Examples:**
- Search products: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/products`
- Search users: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/users`
- Search orders: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/orders`

**🔐 JWT Authentication**: Available exclusively in v2 API

#### Legacy: Backward Compatibility
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/{collectionName}
```

**Examples:**
- Search products: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/products`
- Search users: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/users`

**Note**: The collection name in the URL path determines which collection to search. Only collections configured during installation (or all collections if none specified) can be accessed. Versioned endpoints are recommended for new applications.

### 🌐 Custom Domain Support

You can use your own custom domain instead of the default Firebase Functions URL by setting up Firebase Hosting with URL rewrites. This provides a cleaner, branded API experience.

#### Setup Steps:

1. **Configure Firebase Hosting** in your `firebase.json`:
```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "/api/search/**",
        "function": "ext-firestore-search-extension-searchCollectionHttp"
      }
    ]
  }
}
```

2. **Add your custom domain** in the Firebase Console under Hosting → Add custom domain

3. **Deploy your configuration**:
```bash
firebase deploy
```

#### Custom Domain URLs:

With a custom domain configured, your API endpoints become:

**v2 API (JWT Authentication & Enhanced Features - Beta):**
- **API Endpoint**: `https://yourdomain.com/api/search/v2/{collectionName}`
- Search products: `https://yourdomain.com/api/search/v2/products`
- Search users: `https://yourdomain.com/api/search/v2/users`
- Search orders: `https://yourdomain.com/api/search/v2/orders`

**Legacy (Backward Compatibility):**
- **API Endpoint**: `https://yourdomain.com/api/search/{collectionName}`
- Search products: `https://yourdomain.com/api/search/products`
- Search users: `https://yourdomain.com/api/search/users`

**Benefits:**
- ✅ Branded URLs that match your domain
- ✅ Automatic SSL certificates managed by Firebase
- ✅ Same performance as default Firebase domains
- ✅ Easy integration with existing Firebase projects

### Multiple Extension Instances

When you install this extension multiple times for different collections, each instance gets its own unique endpoint based on the extension instance ID:

- **First instance**: `...ext-firestore-search-extension-**abc1**-searchCollectionHttp`
- **Second instance**: `...ext-firestore-search-extension-**def2**-searchCollectionHttp`
- **Third instance**: `...ext-firestore-search-extension-**ghi3**-searchCollectionHttp`

Each instance can be configured to search a different collection, making it easy to manage multiple search endpoints.

### Supported Methods

- **GET**: Pass parameters as query string
- **POST**: Pass parameters in JSON body

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `searchValue` | string | The value to search for |

**Note**: The collection and searchable fields are configured during extension installation.

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum number of results |
| `caseSensitive` | boolean | false | Whether search should be case-sensitive |
| `sortBy` | string | none | Field name to sort results by (supports nested fields with dot notation) |
| `direction` | string | asc | Sort direction: `asc`, `desc`, `ascending`, or `descending` |

**Note**: Return fields are configured during extension installation and cannot be overridden via API requests.

## 🔧 Usage Examples

### POST Request (JSON Body)

**v2 API (with JWT Authentication):**
```bash
curl -X POST "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -d '{
    "searchValue": "john",
    "limit": 10,
    "caseSensitive": false,
    "sortBy": "name",
    "direction": "asc"
  }'
```

**Legacy (Backward Compatibility):**
```bash
curl -X POST "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/users" \
  -H "Content-Type: application/json" \
  -d '{
    "searchValue": "john",
    "limit": 10,
    "caseSensitive": false,
    "sortBy": "name",
    "direction": "asc"
  }'
```

### GET Request (Query Parameters)

**v2 API (with JWT Authentication):**
```bash
curl "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/products?searchValue=laptop&limit=20&sortBy=price&direction=desc" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**Legacy (Backward Compatibility):**
```bash
curl "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/products?searchValue=laptop&limit=20&sortBy=price&direction=desc"
```

### JavaScript/TypeScript Example

```javascript
// Helper function for versioned endpoints (recommended)
const getSearchURL = (collection, version = 'v1') => 
  `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/${version}/${collection}`;

// Helper function for legacy endpoints (backward compatibility)
const getLegacySearchURL = (collection) => 
  `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/${collection}`;

const searchFirestore = async (collection, value, options = {}, useVersioned = true) => {
  const url = useVersioned ? getSearchURL(collection) : getLegacySearchURL(collection);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchValue: value,
      ...options
    })
  });
  
  return await response.json();
};

// Usage examples
// Versioned endpoint (recommended)
const results = await searchFirestore(
  'articles',
  'firebase',
  { 
    limit: 15,
    caseSensitive: false,
    sortBy: 'publishedAt',
    direction: 'desc'
  },
  true // Use versioned endpoint
);

// Legacy endpoint (backward compatibility)
const legacyResults = await searchFirestore(
  'articles',
  'firebase',
  { 
    limit: 15,
    caseSensitive: false,
    sortBy: 'publishedAt',
    direction: 'desc'
  },
  false // Use legacy endpoint
);
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useFirestoreSearch = (searchTerm, options = {}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm) return;

    const search = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Replace with your actual endpoint (includes your collection name)
        const response = await fetch('https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-search[COLLECTION_NAME]Http', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchValue: searchTerm,
            limit: 20,
            ...options
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.error.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [searchTerm, options]);

  return { results, loading, error };
};
```

### 🔐 JWT Authentication Examples (v2 API Only)

**Important**: JWT authentication is exclusively available in the v2 API. When JWT authentication is enabled (`REQUIRE_JWT_AUTHENTICATION = "true"`), all v2 API requests must include a valid Firebase ID token in the Authorization header.

#### Authenticated POST Request (v2 API)
```bash
curl -X POST "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/v2/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -d '{
    "searchValue": "laptop",
    "limit": 10
  }'
```

#### JavaScript with Firebase Auth
```javascript
// Get Firebase ID token from authenticated user
const user = firebase.auth().currentUser;
const idToken = await user.getIdToken();

// Make authenticated search request (v2 API)
const response = await fetch('/v2/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({
    searchValue: 'laptop',
    limit: 10
  })
});

const result = await response.json();
if (result.success) {
  console.log('Results:', result.data);
  console.log('User info:', result.meta.user); // Authenticated user details
} else {
  console.error('Error:', result.error);
}
```

#### Authentication Error Handling
```javascript
const response = await fetch('/v2/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ searchValue: 'test' })
});

if (response.status === 401) {
  const error = await response.json();
  switch (error.error.code) {
    case 'NO_TOKEN':
      console.log('Please sign in to access this API');
      break;
    case 'TOKEN_EXPIRED':
      console.log('Session expired, please sign in again');
      break;
    case 'INVALID_TOKEN':
      console.log('Invalid authentication token');
      break;
  }
}
```

**Note**: See `examples/jwt-authentication-example.js` for comprehensive authentication examples and error handling patterns.

## 🔒 Security Implementation Details

### JWT Token Parsing & Validation (v2 API)

The extension implements enterprise-grade security for JWT token handling:

#### **Secure Token Extraction**
```javascript
// Extension securely extracts tokens from Authorization header
// Supports both 'authorization' and 'Authorization' header names
const authHeader = request.headers.authorization || request.headers.Authorization;

// Validates Bearer token format with case-insensitive matching
const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
```

#### **Firebase Admin SDK Validation**
```javascript
// Uses Firebase Admin Auth for cryptographic verification
const auth = getAuth();
const decodedToken = await auth.verifyIdToken(token);

// Validates:
// ✅ Token signature using Firebase public keys
// ✅ Token expiration (1 hour default)
// ✅ Token issuer (your Firebase project)
// ✅ Token audience (your Firebase project ID)
// ✅ Token format and structure
```

#### **Security Features**
- **🔐 Cryptographic Verification**: Uses Firebase's RSA256 signature validation
- **⏰ Automatic Expiration**: Tokens expire after 1 hour (configurable in Firebase)
- **🚫 Revocation Support**: Detects and rejects revoked tokens
- **🛡️ Project Isolation**: Tokens only valid for the specific Firebase project
- **📝 Audit Logging**: All authentication attempts are logged
- **🔄 Token Refresh**: Supports automatic token refresh on client side

#### **Error Handling & Security**
```javascript
// Specific error codes for different security scenarios
switch (error.code) {
  case 'NO_TOKEN':        // Missing Authorization header
  case 'TOKEN_EXPIRED':   // Token past expiration time
  case 'TOKEN_REVOKED':   // Token manually revoked
  case 'INVALID_TOKEN':   // Invalid signature or format
  case 'PROJECT_ERROR':   // Wrong Firebase project
}
```

#### **Best Practices Implemented**
- **✅ No Token Storage**: Tokens are validated and discarded immediately
- **✅ Secure Headers**: Case-insensitive header parsing
- **✅ Input Sanitization**: Regex validation of Bearer format
- **✅ Error Masking**: Generic error messages to prevent information leakage
- **✅ Rate Limiting**: Combined with JWT to prevent abuse
- **✅ HTTPS Only**: Extension requires HTTPS for token transmission

#### **Client-Side Security Requirements**
```javascript
// ✅ SECURE: Get fresh token from Firebase Auth
const user = firebase.auth().currentUser;
const idToken = await user.getIdToken(); // Always fresh token

// ✅ SECURE: Use HTTPS endpoints only
const response = await fetch('https://your-domain.com/v2/products', {
  headers: {
    'Authorization': `Bearer ${idToken}` // Secure transmission
  }
});

// ❌ INSECURE: Never store tokens in localStorage/sessionStorage
// ❌ INSECURE: Never send tokens over HTTP
// ❌ INSECURE: Never log tokens in console/files
```

#### **Token Lifecycle Management**
1. **Generation**: Client gets token from Firebase Auth
2. **Transmission**: Sent via HTTPS in Authorization header
3. **Validation**: Server validates using Firebase Admin SDK
4. **Usage**: User context extracted for request processing
5. **Expiration**: Token automatically expires (no server-side storage)

#### **Security Compliance**
- **🔒 OWASP Compliant**: Follows OWASP JWT security guidelines
- **📋 SOC 2 Ready**: Audit logging and access controls
- **🛡️ Zero Trust**: Every request validated independently
- **🔐 End-to-End**: Secure from client generation to server validation

## 📊 Response Format

### Success Response

**v2 API Response (Enhanced Metadata):**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc1",
      "name": "John Doe",
      "email": "john@example.com",
      "profile": {
        "bio": "Software developer"
      }
    }
  ],
  "meta": {
    "totalResults": 1,
    "searchCollection": "users",
    "searchValue": "john",
    "searchFields": ["name", "email", "profile.bio"],
    "sortBy": "name",
    "direction": "asc",
    "version": "v2",
    "isVersioned": true,
    "authenticated": true,
    "apiVersion": "v2",
    "features": {
      "supportsFuzzySearch": true,
      "supportsJwtAuthentication": true,
      "supportsUserContext": true,
      "supportsEnhancedMetadata": true
    },
    "performance": {
      "searchOptimized": true,
      "fuzzySearchEnabled": true,
      "rateLimitingEnabled": true
    },
    "security": {
      "jwtAuthenticationEnabled": true,
      "collectionRestricted": true,
      "fieldRestricted": true
    },
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "emailVerified": true,
      "customClaims": {}
    }
  }
}
```

**Legacy API Response (No JWT Authentication):**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc1",
      "name": "John Doe",
      "email": "john@example.com",
      "profile": {
        "bio": "Software developer"
      }
    }
  ],
  "meta": {
    "totalResults": 1,
    "searchCollection": "users",
    "searchValue": "john",
    "searchFields": ["name", "email", "profile.bio"],
    "sortBy": "name",
    "direction": "asc",
    "version": "legacy",
    "isVersioned": false,
    "authenticated": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "searchValue is required and must be a string",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔄 API Versioning

The extension supports API versioning to accommodate future breaking changes while maintaining backward compatibility.

### Supported Versions

- **v2**: Enhanced API with JWT authentication and advanced features (recommended for new applications)
- **legacy**: Backward compatibility for existing applications

### Version Selection

**Enhanced Endpoints (Recommended):**
```
/v2/{collectionName}
```

**Legacy Endpoints (Backward Compatibility):**
```
/{collectionName}
```

### Version Information in Response

All API responses include version metadata:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "version": "v1",
    "isVersioned": true,
    ...
  }
}
```

### Migration Strategy

1. **New Applications**: Use enhanced endpoints (`/v2/`) from the start
2. **Existing Applications**: Continue using legacy endpoints, migrate when convenient
3. **Future Versions**: New versions (e.g., `v2`) will be introduced for breaking changes

### Benefits

- **Future-Proof**: Accommodate breaking changes without disrupting existing applications
- **Gradual Migration**: Update applications at your own pace
- **Clear API Evolution**: Explicit versioning makes API changes transparent
- **Backward Compatibility**: Legacy endpoints remain functional indefinitely

## 🔍 Advanced Features

### Nested Field Search

Search and return nested fields using dot notation:

```json
{
  "searchValue": "javascript",
  "limit": 20,
  "sortBy": "name"
}
```

**Note**: The extension must be configured with nested searchable fields like `profile.bio,profile.skills,contact.email` during installation.

### Array Field Search

Search within array fields:

```json
{
  "searchValue": "tutorial"
}
```

**Note**: The extension must be configured with array fields like `tags,categories` as searchable fields during installation.

### Single Collection Configuration

The extension is configured to search a single, specific collection during installation. This provides:

- **Enhanced Security**: Collection access is locked during installation
- **Simplified API**: No need to specify collection in each request
- **Better Performance**: Optimized for single collection searches
- **Reduced Complexity**: Fewer parameters to manage

```json
// Simple search request - collection is pre-configured
{
  "searchValue": "john",
  "limit": 10,
  "caseSensitive": false
}
```

## 📊 Result Sorting

The extension supports flexible result sorting to help you organize search results according to your needs.

### Sorting Parameters

- **`sortBy`**: Field name to sort by (supports nested fields with dot notation like `user.profile.score`)
- **`direction`**: Sort direction - `asc`/`ascending` (default) or `desc`/`descending`

### Sorting Examples

#### Sort by Name (Ascending)
```javascript
{
  "searchValue": "user",
  "sortBy": "name",
  "direction": "asc"  // A-Z order
}
```

#### Sort by Date (Newest First)
```javascript
{
  "searchValue": "post",
  "sortBy": "createdAt",
  "direction": "desc"  // Newest first
}
```

#### Sort by Nested Field
```javascript
{
  "searchValue": "product",
  "sortBy": "pricing.amount",  // Nested field with dot notation
  "direction": "desc"          // Highest price first
}
```

#### No Sorting (Original Order)
```javascript
{
  "searchValue": "item"
  // No sortBy parameter - results in original order
}
```

### Sorting Behavior

- **Null/Undefined Values**: Always placed at the end regardless of sort direction
- **Mixed Data Types**: Converted to strings for consistent comparison
- **String Comparison**: Case-insensitive by default
- **Numeric/Date Values**: Sorted by actual value, not string representation
- **Performance**: Sorting is applied after search filtering for optimal performance

## 🔍 Fuzzy Search

The extension includes intelligent fuzzy search with configurable typo tolerance to improve user experience.

### How It Works
- **Configurable Typo Tolerance**: Allows 1 typo per N characters (default: 4, configurable during installation)
- **Smart Matching**: Uses Levenshtein distance algorithm for accurate results
- **Configurable**: Can be enabled/disabled during installation
- **Performance Optimized**: Short terms (≤3 chars) use exact matching for speed

### Tolerance Examples
- **Tolerance = 4** (default): 4-letter words allow 1 typo, 8-letter words allow 2 typos
- **Tolerance = 3** (stricter): 3-letter words allow 1 typo, 6-letter words allow 2 typos  
- **Tolerance = 5** (more lenient): 5-letter words allow 1 typo, 10-letter words allow 2 typos

### Examples
```javascript
// These searches will all match "Firebase":
"Firebase"  // Exact match
"Firebas"   // 1 typo in 8 characters (allowed)
"Firebaes"  // 1 typo in 9 characters (allowed)
"Firebaze"  // 1 typo in 9 characters (allowed)

// These will match "John":
"John"      // Exact match
"Jon"       // Short term, uses exact matching
"Jhon"      // 1 typo in 4 characters (allowed)
```

### Configuration
- **Default**: Enabled (recommended for better UX)
- **Disable**: Set to "No" during installation for exact matching only
- **Automatic**: Short search terms (≤3 chars) always use exact matching

## 🔄 Data Transformation

The extension automatically transforms Firestore-specific data types into clean, usable JSON:

### Automatic Conversions
- **Firestore Timestamps** → **UTC ISO Strings**
  ```javascript
  // Before: { "_seconds": 1739112493, "_nanoseconds": 753000000 }
  // After: "2025-01-09T14:01:33.753Z"
  ```

- **Firestore References** → **Document Paths**
  ```javascript
  // Before: { "_path": { "segments": ["users", "abc123"] } }
  // After: "users/abc123"
  ```

- **Primitive Values** → **Clean Types** (strings, numbers, booleans preserved)
- **Maps and Arrays** → **Preserved Structure** (with transformed contents)

### Benefits
- **Frontend Ready**: No need to handle Firestore-specific objects
- **JSON Compatible**: Perfect for REST APIs and web applications
- **Type Safe**: Consistent data types across all responses
- **Performance**: Reduced payload size and parsing overhead

## 🔐 Security Features

- **Input Validation**: All parameters are validated for type and format
- **Pre-configured Access**: Collection and searchable fields locked during installation
- **Field Name Validation**: Prevents injection attacks through field names
- **Rate Limiting**: Configurable per-origin request limiting
- **Error Sanitization**: Error messages don't leak sensitive information

## 🛡️ Rate Limiting

The extension includes configurable rate limiting to prevent abuse and ensure fair usage:

### Configuration
- **Requests per minute**: Set during installation (default: 60)
- **Time window**: Rolling window in minutes (default: 1)
- **Per-origin tracking**: Limits applied per IP address
- **Disable option**: Set to 0 to disable rate limiting

### Rate Limit Headers
All responses include rate limit information:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
When limits are exceeded (HTTP 429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit: 60 requests per 1 minute(s). Try again later.",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "retryAfter": 45
  }
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input parameters |
| `PERMISSION_DENIED` | Insufficient permissions or Firestore API not enabled |
| `NOT_FOUND` | Collection or document not found |
| `QUOTA_EXCEEDED` | Firestore quotas exceeded |
| `RATE_LIMIT_EXCEEDED` | Too many requests from origin (HTTP 429) |
| `METHOD_NOT_ALLOWED` | Invalid HTTP method (only GET/POST allowed) |
| `INTERNAL_ERROR` | General server error |

## 🛠️ Development & Testing

### Local Testing

If you want to test locally during development:

```bash
# Start Firebase emulators
firebase emulators:start

# Test the function (make sure to configure the extension with a test collection first)
curl -X POST "http://localhost:5001/YOUR_PROJECT_ID/us-central1/ext-firestore-search-extension-searchCollectionHttp" \
  -H "Content-Type: application/json" \
  -d '{
    "searchValue": "test",
    "limit": 5
  }'
```

### Performance Considerations

- **Limit Results**: Always set appropriate limits for your use case
- **Field Filtering**: Use `returnFields` to reduce response size
- **Collection Size**: Performance depends on collection size and query complexity
- **Indexing**: Consider Firestore indexes for frequently searched fields

## 📝 Best Practices

1. **Use Field Filtering**: Specify `returnFields` to reduce bandwidth
2. **Set Reasonable Limits**: Don't request more data than needed
3. **Handle Errors Gracefully**: Always check the `success` field in responses
4. **Cache Results**: Consider caching frequently accessed search results
5. **Monitor Usage**: Keep track of search patterns and performance

## 🆘 Troubleshooting

### Common Issues

1. **"Firestore API not enabled"**: Enable Firestore API in Google Cloud Console
2. **"Collection not found"**: Ensure the collection exists and has documents
3. **"Permission denied"**: Check Firestore security rules
4. **"Invalid field name"**: Field names must contain only alphanumeric characters, dots, and underscores

### Getting Help

- Check the Firebase Console logs for detailed error information
- Ensure your Firestore security rules allow read access
- Verify that the extension is properly installed and configured

## 💝 Support This Extension

If you find this extension useful, cost-saving, or it helps streamline your development workflow, consider supporting its continued development:

**[☕ Donate via Yoco](https://pay.yoco.com/twiqle)**

Your support helps maintain and improve this extension with new features, bug fixes, and comprehensive documentation. Every contribution, no matter the size, is greatly appreciated! 🙏

## 📄 License

Apache-2.0 License - see the extension documentation for details.

## 🔗 Links

- [Firebase Extensions Hub](https://extensions.dev/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Extension Installation Guide](https://firebase.google.com/docs/extensions/install-extensions)

---

**Built with ❤️ for the Firebase community**