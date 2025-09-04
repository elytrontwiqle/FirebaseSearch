/**
 * Firebase Search Extension
 * Provides configurable search functionality for Firestore collections
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onTaskDispatched} = require("firebase-functions/v2/tasks");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Extension configuration from environment variables
const config = {
  location: process.env.LOCATION || 'us-central1',
  defaultSearchLimit: parseInt(process.env.DEFAULT_SEARCH_LIMIT) || 50,
  maxSearchLimit: parseInt(process.env.MAX_SEARCH_LIMIT) || 1000,
  enableCaseSensitiveSearch: process.env.ENABLE_CASE_SENSITIVE_SEARCH === 'true',
  searchableCollections: process.env.SEARCHABLE_COLLECTIONS ? 
    process.env.SEARCHABLE_COLLECTIONS.split(',').map(f => f.trim()) : [],
  searchableFields: process.env.SEARCHABLE_FIELDS ? 
    process.env.SEARCHABLE_FIELDS.split(',').map(f => f.trim()) : [],
  rateLimitRequestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE) || 60,
  rateLimitWindowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 1,
  defaultReturnFields: process.env.DEFAULT_RETURN_FIELDS ? 
    process.env.DEFAULT_RETURN_FIELDS.split(',').map(f => f.trim()) : [],
  enableFuzzySearch: process.env.ENABLE_FUZZY_SEARCH === 'true',
  fuzzySearchTypoTolerance: parseInt(process.env.FUZZY_SEARCH_TYPO_TOLERANCE) || 4
};

// In-memory rate limiting storage
// In production, consider using Redis or Firestore for distributed rate limiting
const rateLimitStore = new Map();

/**
 * Extract collection name from URL path
 * Firebase Functions URL format: /ext-{instanceId}-searchCollectionHttp/{collectionName}
 * Full URL: https://region-project.cloudfunctions.net/ext-{instanceId}-searchCollectionHttp/{collectionName}
 */
function extractCollectionFromPath(request) {
  const path = request.path || request.url;
  console.log('Debug - Full path:', path); // Debug logging
  
  // Remove query parameters if present
  const pathWithoutQuery = path.split('?')[0];
  const pathParts = pathWithoutQuery.split('/').filter(part => part.length > 0);
  
  console.log('Debug - Path parts:', pathParts); // Debug logging
  
  // For Firebase Functions, the path is just the collection name after the function name
  // The function name is handled by Firebase routing, so we get the remaining path
  // If path is just "/" or empty, no collection specified
  if (pathParts.length === 0) {
    return null;
  }
  
  // The first path part should be the collection name
  // Handle cases where the path might have the function name included
  let collectionName = null;
  
  // Check if the path contains the function name (for local testing or direct calls)
  const functionNameIndex = pathParts.findIndex(part => 
    part.includes('searchCollectionHttp')
  );
  
  if (functionNameIndex >= 0) {
    // Function name found in path, collection is the next part
    if (pathParts.length > functionNameIndex + 1) {
      collectionName = pathParts[functionNameIndex + 1];
    }
  } else {
    // Function name not in path (normal Firebase Functions routing)
    // First path part should be the collection name
    collectionName = pathParts[0];
  }
  
  console.log('Debug - Extracted collection:', collectionName); // Debug logging
  return collectionName;
}

/**
 * Validate collection access permissions
 */
async function validateCollectionAccess(collectionName) {
  // Check if collection name is valid format
  if (!collectionName || typeof collectionName !== 'string') {
    return {
      valid: false,
      error: 'Collection name is required in URL path (e.g., /searchCollectionHttp/products)'
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(collectionName)) {
    return {
      valid: false,
      error: 'Collection name must contain only alphanumeric characters, hyphens, and underscores'
    };
  }

  // Check if collection is in allowed list (if configured)
  if (config.searchableCollections.length > 0) {
    if (!config.searchableCollections.includes(collectionName)) {
      return {
        valid: false,
        error: `Collection '${collectionName}' is not allowed. Allowed collections: ${config.searchableCollections.join(', ')}`
      };
    }
  }

  // Check if collection exists in Firestore
  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.limit(1).get();
    
    // Collection exists if it has at least one document or if it's empty but the reference is valid
    // Note: Firestore collections don't exist until they have documents, but we'll allow empty collections
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Collection '${collectionName}' does not exist or is not accessible`
    };
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(request) {
  // Check various headers for the real IP address
  const forwarded = request.headers['x-forwarded-for'];
  const realIP = request.headers['x-real-ip'];
  const cfConnectingIP = request.headers['cf-connecting-ip'];
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || request.connection?.remoteAddress || 'unknown';
}

/**
 * Check if request is within rate limit
 */
function checkRateLimit(clientIP) {
  // If rate limiting is disabled (0 requests per minute), allow all requests
  if (config.rateLimitRequestsPerMinute === 0) {
    return { allowed: true, remaining: Infinity };
  }

  const now = Date.now();
  const windowMs = config.rateLimitWindowMinutes * 60 * 1000; // Convert minutes to milliseconds
  const key = clientIP;

  // Get or create rate limit data for this IP
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      requests: [],
      firstRequest: now
    });
  }

  const rateLimitData = rateLimitStore.get(key);

  // Remove requests outside the current window
  rateLimitData.requests = rateLimitData.requests.filter(
    requestTime => now - requestTime < windowMs
  );

  // Check if we're within the limit
  if (rateLimitData.requests.length >= config.rateLimitRequestsPerMinute) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimitData.requests[0] + windowMs
    };
  }

  // Add current request
  rateLimitData.requests.push(now);
  rateLimitStore.set(key, rateLimitData);

  // Clean up old entries periodically (simple cleanup)
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupRateLimitStore();
  }

  const remaining = config.rateLimitRequestsPerMinute - rateLimitData.requests.length;
  
  return {
    allowed: true,
    remaining: remaining,
    currentCount: rateLimitData.requests.length,
    windowMs: windowMs
  };
}

/**
 * Clean up old rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  const windowMs = config.rateLimitWindowMinutes * 60 * 1000;

  for (const [key, data] of rateLimitStore.entries()) {
    // Remove entries that haven't been used in the last window
    if (data.requests.length === 0 || now - Math.max(...data.requests) > windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching with typo tolerance
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a matrix to store distances
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]; // No operation needed
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // Deletion
          matrix[i][j - 1] + 1,     // Insertion
          matrix[i - 1][j - 1] + 1  // Substitution
        );
      }
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calculate maximum allowed typos based on string length
 * Rule: 1 typo per N characters (configurable via FUZZY_SEARCH_TYPO_TOLERANCE)
 */
function getMaxTypos(length) {
  return Math.floor(length / config.fuzzySearchTypoTolerance);
}

/**
 * Check if two strings match with fuzzy tolerance
 * Allows 1 typo per N characters (configurable via FUZZY_SEARCH_TYPO_TOLERANCE)
 */
function fuzzyMatch(searchTerm, fieldValue, caseSensitive = false) {
  if (!config.enableFuzzySearch) {
    // Fall back to exact matching if fuzzy search is disabled
    return caseSensitive ? 
      fieldValue.includes(searchTerm) : 
      fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
  }
  
  // Normalize case if needed
  const normalizedSearchTerm = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  const normalizedFieldValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
  
  // For very short search terms (1-3 chars), use exact matching
  if (normalizedSearchTerm.length <= 3) {
    return normalizedFieldValue.includes(normalizedSearchTerm);
  }
  
  // Calculate maximum allowed typos for the search term
  const maxTypos = getMaxTypos(normalizedSearchTerm.length);
  
  // Check if the search term appears as a substring with fuzzy matching
  // We'll check each possible substring of the field value
  const searchLen = normalizedSearchTerm.length;
  const fieldLen = normalizedFieldValue.length;
  
  // If search term is longer than field value, check direct distance
  if (searchLen > fieldLen) {
    const distance = levenshteinDistance(normalizedSearchTerm, normalizedFieldValue);
    return distance <= maxTypos;
  }
  
  // Check all possible substrings of the field value
  for (let i = 0; i <= fieldLen - searchLen; i++) {
    const substring = normalizedFieldValue.substring(i, i + searchLen);
    const distance = levenshteinDistance(normalizedSearchTerm, substring);
    
    if (distance <= maxTypos) {
      return true;
    }
  }
  
  // Also check if the entire field value is similar to search term (for shorter field values)
  if (fieldLen <= searchLen + maxTypos) {
    const distance = levenshteinDistance(normalizedSearchTerm, normalizedFieldValue);
    return distance <= maxTypos;
  }
  
  return false;
}

/**
 * HTTP endpoint for searching the configured Firestore collection
 * 
 * Supported Methods: GET, POST
 * 
 * Parameters:
 * - searchValue: The value to search for
 * - limit: Maximum number of results to return (optional, default: 50)
 * - caseSensitive: Whether search should be case sensitive (optional, default: false)
 * - sortBy: Field name to sort results by (optional, supports nested fields with dot notation)
 * - direction: Sort direction - 'asc', 'desc', 'ascending', or 'descending' (optional, default: 'asc')
 * 
 * Note: returnFields are configured during extension installation and cannot be overridden via request
 * 
 * Note: The collection and searchable fields are configured during extension installation
 */

// Export function with static name (required for Firebase Extensions)
exports.searchCollectionHttp = onRequest({
  cors: true,
  region: config.location
}, async (request, response) => {
  try {
    // Set CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);
    
    // Add rate limit headers
    response.set('X-RateLimit-Limit', config.rateLimitRequestsPerMinute.toString());
    response.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.set('X-RateLimit-Window', `${config.rateLimitWindowMinutes}min`);
    
    if (rateLimitResult.resetTime) {
      response.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());
    }
    
    // Add debug information in headers
    if (rateLimitResult.currentCount !== undefined) {
      response.set('X-RateLimit-Current', rateLimitResult.currentCount.toString());
    }

    if (!rateLimitResult.allowed) {
      response.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit reached. Please wait before making more requests.',
          details: {
            limit: `${config.rateLimitRequestsPerMinute} requests per ${config.rateLimitWindowMinutes} minute(s)`,
            retryAfter: `${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds`
          },
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Only allow GET and POST methods
    if (!['GET', 'POST'].includes(request.method)) {
      response.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET and POST methods are allowed'
        }
      });
      return;
    }

    // Extract parameters from query (GET) or body (POST)
    const params = request.method === 'GET' ? request.query : request.body;
    
    const {
      searchValue,
      limit = config.defaultSearchLimit,
      caseSensitive = config.enableCaseSensitiveSearch,
      sortBy,
      direction = 'asc'
    } = params;

    // Extract collection from URL path
    const searchCollection = extractCollectionFromPath(request);
    
    // Validate collection access
    const collectionValidation = await validateCollectionAccess(searchCollection);
    if (!collectionValidation.valid) {
      response.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLLECTION',
          message: collectionValidation.error,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    // Use configured searchable fields
    const searchableFields = config.searchableFields;

    // Input validation
    const validationError = validateSearchParameters({
      searchValue,
      sortBy,
      direction
    });
    
    if (validationError) {
      response.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationError
        }
      });
      return;
    }

    // Use configured searchable fields and return fields
    const searchFields = searchableFields; // Already parsed in config
    const returnFieldsList = config.defaultReturnFields.length > 0 ? config.defaultReturnFields : null;

    // Validate limit
    const searchLimit = Math.min(Math.max(parseInt(limit) || config.defaultSearchLimit, 1), config.maxSearchLimit);



    // Perform the search
    const results = await performSearch({
      collection: searchCollection,
      searchFields,
      returnFields: returnFieldsList,
      searchValue,
      limit: searchLimit,
      caseSensitive,
      sortBy,
      direction
    });



    response.status(200).json({
      success: true,
      data: results,
      meta: {
        totalResults: results.length,
        searchCollection,
        searchValue,
        searchFields,
        returnFields: returnFieldsList,
        sortBy: sortBy || null,
        direction: direction || null
      }
    });

  } catch (error) {
    response.status(500).json({
      success: false,
      error: {
        code: getErrorCode(error),
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * Validate search parameters
 */
function validateSearchParameters({searchValue, sortBy, direction}) {
  // Validate extension configuration
  if (!config.searchableFields || !Array.isArray(config.searchableFields) || config.searchableFields.length === 0) {
    return 'Extension configuration error: SEARCHABLE_FIELDS is required and must contain at least one field';
  }

  // Validate search value
  if (!searchValue || typeof searchValue !== 'string') {
    return 'searchValue is required and must be a string';
  }

  if (searchValue.trim().length === 0) {
    return 'searchValue cannot be empty';
  }

  // Validate sorting parameters
  if (sortBy !== undefined && sortBy !== null && sortBy !== '') {
    if (typeof sortBy !== 'string') {
      return 'sortBy must be a string';
    }
    
    // Validate field name format
    if (!/^[a-zA-Z0-9_.]+$/.test(sortBy)) {
      return 'sortBy field name must contain only alphanumeric characters, dots, and underscores';
    }
  }

  if (direction !== undefined && direction !== null && direction !== '') {
    if (typeof direction !== 'string') {
      return 'direction must be a string';
    }
    
    const validDirections = ['asc', 'desc', 'ascending', 'descending'];
    if (!validDirections.includes(direction.toLowerCase())) {
      return 'direction must be one of: asc, desc, ascending, descending';
    }
  }

  return null;
}

/**
 * Parse comma-separated field list and validate field names
 */
function parseFieldList(fieldString) {
  if (!fieldString) return [];
  
  const fields = fieldString.split(',').map(field => field.trim()).filter(field => field.length > 0);
  
  // Validate field names
  for (const field of fields) {
    if (!/^[a-zA-Z0-9_.]+$/.test(field)) {
      throw new Error(`Invalid field name: ${field}. Field names must contain only alphanumeric characters, dots, and underscores.`);
    }
  }
  
  return fields;
}

/**
 * Perform the actual search operation
 */
async function performSearch({
  collection,
  searchFields,
  returnFields,
  searchValue,
  limit,
  caseSensitive,
  sortBy,
  direction
}) {
  const collectionRef = db.collection(collection);
  const results = [];
  const processedValue = caseSensitive ? searchValue : searchValue.toLowerCase();

  try {
    // Get all documents from the collection (with limit)
    const snapshot = await collectionRef.limit(limit * 10).get(); // Get more docs to account for filtering
    
    if (snapshot.empty) {
      return [];
    }

    let matchCount = 0;

    snapshot.forEach((doc) => {
      if (matchCount >= limit) return;

      const data = doc.data();
      let isMatch = false;

      // Check if any of the searchable fields contain the search value
      for (const field of searchFields) {
        const fieldValue = getNestedFieldValue(data, field);
        
        if (fieldValue !== null && fieldValue !== undefined) {
          const stringValue = String(fieldValue);
          
          // Use fuzzy matching if enabled, otherwise fall back to exact matching
          if (fuzzyMatch(searchValue, stringValue, caseSensitive)) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        let resultDoc = { id: doc.id };
        
        // If returnFields is specified, only include those fields
        if (returnFields && returnFields.length > 0) {
          for (const field of returnFields) {
            const fieldValue = getNestedFieldValue(data, field);
            setNestedFieldValue(resultDoc, field, fieldValue);
          }
        } else {
          // Return all fields
          resultDoc = { id: doc.id, ...data };
        }
        
        // Store the raw document for sorting before transformation
        results.push({
          rawDoc: resultDoc,
          originalData: data
        });
        matchCount++;
      }
    });

    // Sort results if sortBy is specified (before transformation)
    if (sortBy && sortBy.trim() !== '') {
      const sortDirection = direction && ['desc', 'descending'].includes(direction.toLowerCase()) ? -1 : 1;
      
      results.sort((a, b) => {
        const valueA = getNestedFieldValue(a.originalData, sortBy);
        const valueB = getNestedFieldValue(b.originalData, sortBy);
        
        // Handle null/undefined values - put them at the end
        if (valueA === null || valueA === undefined) {
          if (valueB === null || valueB === undefined) return 0;
          return 1; // Put nulls at the end regardless of sort direction
        }
        if (valueB === null || valueB === undefined) {
          return -1; // Put nulls at the end regardless of sort direction
        }
        
        // Convert to strings for comparison if they're not numbers or dates
        let compareA = valueA;
        let compareB = valueB;
        
        // Handle different data types
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          // String comparison (case-insensitive, trimmed)
          compareA = valueA.trim().toLowerCase();
          compareB = valueB.trim().toLowerCase();
        } else if (typeof valueA === 'number' && typeof valueB === 'number') {
          // Numeric comparison - use as is
        } else if (valueA instanceof Date && valueB instanceof Date) {
          // Date comparison - use as is
        } else {
          // Mixed types - convert to strings (case-insensitive, trimmed)
          compareA = String(valueA).trim().toLowerCase();
          compareB = String(valueB).trim().toLowerCase();
        }
        
        if (compareA < compareB) return -1 * sortDirection;
        if (compareA > compareB) return 1 * sortDirection;
        return 0;
      });
    }

    // Transform the sorted results to clean JSON
    const transformedResults = results.map(item => transformFirestoreData(item.rawDoc));

    return transformedResults;

  } catch (error) {
    throw new Error(`Failed to search collection: ${error.message}`);
  }
}

/**
 * Transform Firestore data to clean JSON format
 * - Converts Firestore timestamps to UTC strings
 * - Converts Firestore references to document path strings
 * - Ensures all primitive values are strings, numbers, or booleans
 * - Keeps maps and arrays as-is
 */
function transformFirestoreData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Firestore Timestamp
  if (data && typeof data === 'object' && data._seconds !== undefined && data._nanoseconds !== undefined) {
    const timestamp = new Date(data._seconds * 1000 + data._nanoseconds / 1000000);
    return timestamp.toISOString();
  }

  // Handle Firestore DocumentReference
  if (data && typeof data === 'object' && data._path && data._path.segments) {
    return data._path.segments.join('/');
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => transformFirestoreData(item));
  }

  // Handle Objects (Maps)
  if (data && typeof data === 'object') {
    const transformed = {};
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = transformFirestoreData(value);
    }
    return transformed;
  }

  // Return primitive values as-is (strings, numbers, booleans)
  return data;
}

/**
 * Get nested field value using dot notation (e.g., "user.profile.name")
 */
function getNestedFieldValue(obj, fieldPath) {
  return fieldPath.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Set nested field value using dot notation
 */
function setNestedFieldValue(obj, fieldPath, value) {
  const keys = fieldPath.split('.');
  const lastKey = keys.pop();
  
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  target[lastKey] = value;
}

/**
 * Get appropriate error code based on error type
 */
function getErrorCode(error) {
  if (error.message.includes('permission')) {
    return 'PERMISSION_DENIED';
  }
  if (error.message.includes('not found') || error.message.includes('does not exist')) {
    return 'NOT_FOUND';
  }
  if (error.message.includes('Invalid') || error.message.includes('validation')) {
    return 'VALIDATION_ERROR';
  }
  if (error.message.includes('quota') || error.message.includes('limit')) {
    return 'QUOTA_EXCEEDED';
  }
  if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
    return 'RATE_LIMIT_EXCEEDED';
  }
  return 'INTERNAL_ERROR';
}

/**
 * Lifecycle Event Handlers
 */

/**
 * Handles extension installation
 */
exports.onInstallHandler = onTaskDispatched({
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 1
  },
  rateLimits: {
    maxConcurrentDispatches: 10
  }
}, async (req) => {
  try {
    // Perform any initialization tasks here
    // For example, create indexes, validate configuration, etc.
    
    return { success: true, message: 'Extension installed successfully' };
  } catch (error) {
    throw error;
  }
});

/**
 * Handles extension updates
 */
exports.onUpdateHandler = onTaskDispatched({
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 1
  },
  rateLimits: {
    maxConcurrentDispatches: 10
  }
}, async (req) => {
  try {
    // Perform any update tasks here
    // For example, migrate data, update indexes, etc.
    
    return { success: true, message: 'Extension updated successfully' };
  } catch (error) {
    throw error;
  }
});

/**
 * Handles extension configuration changes
 */
exports.onConfigureHandler = onTaskDispatched({
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 1
  },
  rateLimits: {
    maxConcurrentDispatches: 10
  }
}, async (req) => {
  try {
    // Perform any configuration tasks here
    // For example, validate new settings, update runtime configuration, etc.
    
    return { success: true, message: 'Extension configured successfully' };
  } catch (error) {
    throw error;
  }
});
