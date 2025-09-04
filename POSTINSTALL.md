# Firestore Search Extension - Post-Installation Guide

🎉 **Congratulations!** The Firestore Search Extension has been successfully installed in your Firebase project.

## What was installed

The extension has created the following Cloud Function in your project:

### HTTP Endpoint: `searchCollectionHttp`
- **Purpose**: Search Firestore collections via REST API
- **Usage**: Web applications, server-to-server communication, external integrations
- **Methods**: GET and POST requests supported
- **CORS**: Enabled for web application integration

### Key Features Enabled
- **🔍 Fuzzy Search**: Configurable typo tolerance for better user experience
- **🔄 Data Transformation**: Automatic conversion of Firestore timestamps and references to clean JSON
- **🛡️ Rate Limiting**: Per-origin request limiting to prevent abuse
- **🔐 Security**: Pre-configured collection and searchable fields for enhanced security

## Function URL

Your extension HTTP endpoint is available at:
```
https://${param:LOCATION}-${param:PROJECT_ID}.cloudfunctions.net/ext-${param:EXT_INSTANCE_ID}-searchCollectionHttp
```

This endpoint searches your configured collection (${param:SEARCH_COLLECTION}). When you have multiple search extensions installed, each gets a unique instance ID in the URL.

## Quick Start

### Basic HTTP Request Examples

#### POST Request (Recommended)
```bash
curl -X POST "https://${param:LOCATION}-${param:PROJECT_ID}.cloudfunctions.net/ext-${param:EXT_INSTANCE_ID}-searchCollectionHttp" \
  -H "Content-Type: application/json" \
  -d '{
    "returnFields": "title,price,imageUrl",
    "searchValue": "laptop",
    "limit": 20,
    "sortBy": "price",
    "direction": "desc"
  }'
```

#### GET Request
```bash
curl "https://${param:LOCATION}-${param:PROJECT_ID}.cloudfunctions.net/ext-${param:EXT_INSTANCE_ID}-searchCollectionHttp?searchValue=admin&limit=5"
```

### JavaScript Integration

```javascript
const searchFirestore = async (value, options = {}) => {
  const response = await fetch(
    'https://${param:LOCATION}-${param:PROJECT_ID}.cloudfunctions.net/ext-${param:EXT_INSTANCE_ID}-search${param:SEARCH_COLLECTION}Http',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchValue: value,
        ...options
      })
    }
  );
  
  return await response.json();
};

// Usage example (collection and searchable fields are configured during extension installation)
const results = await searchFirestore(
  'john',
  { 
    returnFields: 'name,email,profileImage',
    limit: 10,
    caseSensitive: false 
  }
);

console.log('Search results:', results.data);
```

## Configuration Summary

Your extension was configured with:
- **Search Collection**: ${param:SEARCH_COLLECTION}
- **Searchable Fields**: ${param:SEARCHABLE_FIELDS}
- **Default Return Fields**: ${param:DEFAULT_RETURN_FIELDS} (empty = return all fields)
- **Default Search Limit**: ${param:DEFAULT_SEARCH_LIMIT}
- **Maximum Search Limit**: ${param:MAX_SEARCH_LIMIT}
- **Case Sensitive Search**: ${param:ENABLE_CASE_SENSITIVE_SEARCH}
- **Fuzzy Search**: ${param:ENABLE_FUZZY_SEARCH}
- **Typo Tolerance**: 1 typo per ${param:FUZZY_SEARCH_TYPO_TOLERANCE} characters
- **Rate Limit (per minute)**: ${param:RATE_LIMIT_REQUESTS_PER_MINUTE}
- **Rate Limit Window**: ${param:RATE_LIMIT_WINDOW_MINUTES} minute(s)

## API Reference

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchValue` | string | Yes | The search term |
| `returnFields` | string | No | Comma-separated fields to return (uses configured default if not specified) |
| `limit` | number | No | Max results (default: ${param:DEFAULT_SEARCH_LIMIT}) |
| `caseSensitive` | boolean | No | Case sensitivity (default: ${param:ENABLE_CASE_SENSITIVE_SEARCH}) |
| `sortBy` | string | No | Field name to sort results by (supports nested fields with dot notation) |
| `direction` | string | No | Sort direction: `asc`, `desc`, `ascending`, or `descending` (default: `asc`) |

**Note**: The collection to search and searchable fields are configured during extension installation and cannot be changed via API requests.

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "document_id",
      "field1": "value1",
      "field2": "value2"
    }
  ],
  "meta": {
    "totalResults": 10,
    "searchCollection": "users",
    "searchValue": "john",
    "searchFields": ["name", "email"],
    "returnFields": ["name", "email", "profileImage"]
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "searchCollection is required and must be a string",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input parameters |
| `PERMISSION_DENIED` | Insufficient permissions |
| `NOT_FOUND` | Collection or document not found |
| `QUOTA_EXCEEDED` | Firestore quotas exceeded |
| `RATE_LIMIT_EXCEEDED` | Too many requests from origin (HTTP 429) |
| `METHOD_NOT_ALLOWED` | Invalid HTTP method (only GET/POST allowed) |
| `INTERNAL_ERROR` | General server error |

## Advanced Usage

### Nested Field Search
Search in nested object fields using dot notation:

```javascript
const result = await searchFirestore(
  'orders',
  'customer.name,customer.email,items.title',
  'premium',
  {
    returnFields: 'orderId,customer.name,totalAmount',
    limit: 15
  }
);
```

### Array Field Search
The extension automatically handles array fields by converting them to searchable strings.

### Case-Sensitive Search
```javascript
const exactResults = await searchFirestore(
  'articles',
  'title,content',
  'JavaScript',
  { caseSensitive: true }
);
```

## React Integration Example

```javascript
import { useState, useEffect } from 'react';

const useFirestoreSearch = (collection, fields, searchTerm) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await searchFirestore(collection, fields, searchTerm);
        
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

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [collection, fields, searchTerm]);

  return { results, loading, error };
};
```

## Security Considerations

### Firestore Security Rules
Ensure your Firestore security rules allow the extension to read from collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document} {
      allow read: if true; // Adjust based on your requirements
    }
    match /products/{document} {
      allow read: if true; // Allow public product searches
    }
  }
}
```

### Collection Access Control
If you configured allowed collections, only those collections can be searched:
- **Allowed Collections**: ${param:ALLOWED_COLLECTIONS}
- **Status**: ${param:ALLOWED_COLLECTIONS ? 'Restricted to specified collections' : 'All collections allowed'}

## Monitoring and Debugging

### View Function Logs
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to "Functions"
3. Click on your extension function to view logs

### Rate Limiting
Your extension rate limiting is configured as:
- **Limit**: ${param:RATE_LIMIT_REQUESTS_PER_MINUTE} requests per ${param:RATE_LIMIT_WINDOW_MINUTES} minute(s)
- **Per-origin tracking**: Requests are tracked by IP address
- **Headers included**: All responses include rate limit information

#### Rate Limit Headers
```
X-RateLimit-Limit: ${param:RATE_LIMIT_REQUESTS_PER_MINUTE}
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

#### When Rate Limit is Exceeded
HTTP 429 response with retry information:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again later.",
    "retryAfter": 30
  }
}
```

## Performance Tips

1. **Create Firestore Indexes**: Ensure indexes exist for frequently searched fields
2. **Use Appropriate Limits**: Set reasonable limits to prevent large data transfers
3. **Specify Return Fields**: Use `returnFields` to limit returned data and improve performance
4. **Monitor Firestore Usage**: Keep an eye on read operations and costs
5. **Implement Caching**: Consider caching frequently accessed search results
6. **Debounce User Input**: For real-time search, debounce user input to reduce API calls

## Common Use Cases

### E-commerce Product Search
```javascript
const productSearch = await searchFirestore(
  'products',
  'name,description,brand,category,tags',
  'wireless headphones',
  {
    returnFields: 'name,price,imageUrl,brand,rating,inStock',
    limit: 50
  }
);
```

### User Directory
```javascript
const userSearch = await searchFirestore(
  'users',
  'displayName,email,department,skills',
  'marketing',
  {
    returnFields: 'displayName,email,profilePhoto,department',
    limit: 20
  }
);
```

### Content Management
```javascript
const contentSearch = await searchFirestore(
  'articles',
  'title,content,tags,author.name',
  'firebase tutorial',
  {
    returnFields: 'title,excerpt,author.name,publishedAt,featuredImage',
    limit: 15
  }
);
```

---

**🎯 Ready to search!** Your Firestore Search Extension is now active and ready to handle search requests. Start with the examples above and customize them for your specific use case.

## 💝 Support This Extension

If you find this extension useful, cost-saving, or it helps streamline your development workflow, consider supporting its continued development:

**[☕ Donate via Yoco](https://pay.yoco.com/twiqle)**

Your support helps maintain and improve this extension with new features, bug fixes, and comprehensive documentation. Every contribution, no matter the size, is greatly appreciated! 🙏

**Need help?** Check the documentation, examples, or reach out through Firebase support channels.