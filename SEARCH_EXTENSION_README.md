# Firebase Search Extension

A powerful HTTP-based Firebase Extension that provides dedicated search functionality for a single configured Firestore collection with pre-defined searchable fields, advanced filtering and field selection capabilities.

## Features

- 🔍 **HTTP REST API**: Simple HTTP endpoints for easy integration with any application
- 🎯 **Pre-configured Fields**: Searchable fields configured during installation for enhanced security
- 🔗 **Nested Field Support**: Search and return nested object fields using dot notation
- 🛡️ **Error Handling**: Comprehensive error handling with structured error responses
- ⚡ **Performance Optimized**: Efficient search with configurable limits
- 🔒 **Input Validation**: Robust parameter validation and sanitization
- 📱 **CORS Enabled**: Ready for web applications
- 🔐 **Enhanced Security**: Collection and searchable fields locked during installation

## Installation

### Via Firebase Extensions Hub

Install directly using the extension link:
```
https://console.firebase.google.com/project/_/extensions/install?ref=elytron/firestore-search-extension@1.0.0-beta.0
```

### Via Firebase CLI

```bash
firebase ext:install elytron/firestore-search-extension@1.0.0-beta.0 --project=your-project-id
```

## Configuration

During installation, you'll configure these parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| **Location** | Cloud Functions deployment region | us-central1 |
| **Search Collection** | The Firestore collection to search (required) | - |
| **Searchable Fields** | Comma-separated list of fields to search in (required) | - |
| **Default Search Limit** | Default maximum number of results | 50 |
| **Maximum Search Limit** | Absolute maximum number of results | 1000 |
| **Case Sensitivity** | Default case sensitivity setting | false |
| **Logging** | Enable detailed logging for debugging | true |

## API Reference

### HTTP Endpoint

After installation, your search endpoint will be:
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp
```

### Supported Methods

- **POST**: Send parameters in JSON body (recommended)
- **GET**: Send parameters as query string

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchValue` | string | Yes | The value to search for |
| `returnFields` | string | No | Comma-separated list of fields to return (returns all if not specified) |
| `limit` | number | No | Maximum number of results (default: 50, max: 1000) |
| `caseSensitive` | boolean | No | Whether search should be case sensitive (default: false) |

**Note**: The collection and searchable fields are configured during extension installation.

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
    "message": "searchValue is required and must be a string",
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
| `QUOTA_EXCEEDED` | Rate limit or quota exceeded |
| `METHOD_NOT_ALLOWED` | Invalid HTTP method (only GET/POST allowed) |
| `INTERNAL_ERROR` | General server error |

## Usage Examples

### 1. POST Request (Recommended)

```bash
curl -X POST \
  "https://us-central1-your-project-id.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp" \
  -H 'Content-Type: application/json' \
  -d '{
    "searchValue": "laptop",
    "returnFields": "title,price,imageUrl",
    "limit": 20
  }'
```

### 2. GET Request

```bash
curl "https://us-central1-your-project-id.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp?searchValue=admin&returnFields=name,email&limit=5"
```

### 3. JavaScript/TypeScript Integration

```javascript
const searchFirestore = async (value, options = {}) => {
  const response = await fetch(
    'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp',
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

// Usage examples (assuming extension is configured for specific collection and searchable fields)
const userResults = await searchFirestore(
  'john',
  { 
    returnFields: 'name,email,profileImage',
    limit: 10,
    caseSensitive: false 
  }
);

const productResults = await searchFirestore(
  'wireless headphones',
  { 
    returnFields: 'title,price,description',
    limit: 25 
  }
);
```

### 4. React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useFirestoreSearch = (searchTerm, options = {}) => {
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
        const response = await fetch(
          'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              searchValue: searchTerm,
              limit: 20,
              ...options
            })
          }
        );
        
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

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, options]);

  return { results, loading, error };
};

// Usage in component (assuming extension is configured for 'articles' collection)
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const { results, loading, error } = useFirestoreSearch(
    searchTerm,
    { returnFields: 'title,excerpt,publishedAt' }
  );

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search articles..."
      />
      
      {loading && <p>Searching...</p>}
      {error && <p>Error: {error}</p>}
      
      <ul>
        {results.map(article => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. Nested Fields

Search and return nested object fields using dot notation:

```javascript
// Assuming extension is configured with 'orders' collection and nested searchable fields
const orderSearch = await searchFirestore(
  'premium',
  {
    returnFields: 'orderId,customer.name,totalAmount,status',
    limit: 15
  }
);
```

### 6. Case-Sensitive Search

```javascript
// Assuming extension is configured with 'articles' collection
const exactSearch = await searchFirestore(
  'JavaScript',
  { caseSensitive: true }  // Exact case match
);
```

## Advanced Features

### Single Collection Configuration

The extension is configured to search a single, specific collection during installation:

```javascript
// Simple search - collection and searchable fields are pre-configured
const results = await searchFirestore('john', {
  returnFields: 'name,email,profileImage',
  limit: 10
});

// All searches use the same configured collection and searchable fields
const moreResults = await searchFirestore('developer', {
  returnFields: 'name,skills,department'
});
```

### Field Validation Rules

#### Collection Names
- Must contain only alphanumeric characters, hyphens, and underscores
- Pattern: `/^[a-zA-Z0-9_-]+$/`

#### Field Names
- Must contain only alphanumeric characters, dots, and underscores
- Pattern: `/^[a-zA-Z0-9_.]+$/`
- Dots are used for nested field access (e.g., `user.profile.name`)

## Common Use Cases

### E-commerce Product Search
```javascript
// Assuming extension is configured for 'products' collection with relevant searchable fields
const productSearch = await searchFirestore(
  'wireless headphones',
  {
    returnFields: 'name,price,imageUrl,brand,rating,inStock',
    limit: 50
  }
);
```

### User Directory Search
```javascript
// Assuming extension is configured for 'users' collection with relevant searchable fields
const userSearch = await searchFirestore(
  'marketing',
  {
    returnFields: 'displayName,email,profilePhoto,department',
    limit: 20
  }
);
```

### Content Management
```javascript
// Assuming extension is configured for 'articles' collection with relevant searchable fields
const contentSearch = await searchFirestore(
  'firebase tutorial',
  {
    returnFields: 'title,excerpt,author.name,publishedAt,featuredImage',
    limit: 15
  }
);
```

## Performance Considerations

1. **Indexing**: Ensure your Firestore collections have appropriate indexes for frequently searched fields
2. **Limits**: Use reasonable limits to prevent performance issues (max 1000 results)
3. **Field Selection**: Use `returnFields` to limit the data returned and improve performance
4. **Collection Size**: For very large collections, consider implementing pagination or more specific search criteria
5. **Caching**: Consider caching frequently accessed search results

## Security Considerations

1. **Firestore Rules**: Ensure your Firestore security rules allow read access to the collections you want to search
2. **Input Sanitization**: The extension includes comprehensive input validation
3. **Collection Whitelist**: Use the allowed collections feature to restrict access
4. **Rate Limiting**: The extension includes built-in limits to prevent abuse
5. **Error Handling**: Error messages are sanitized to prevent information leakage

## Troubleshooting

### Common Issues

1. **"Firestore API not enabled"**: Enable Firestore API in Google Cloud Console
2. **"Permission Denied"**: Check Firestore security rules and ensure read access
3. **"Collection not found"**: Verify collection name spelling and existence
4. **"No Results"**: Check field names and ensure data exists in searchable fields
5. **"Invalid field name"**: Field names must follow the validation pattern

### Debug Mode

The extension logs detailed information when logging is enabled:

- Search parameters and configuration
- Number of documents processed
- Performance metrics
- Error details

Check Firebase Console > Functions > Logs for detailed information.

## Best Practices

1. **Use Field Filtering**: Always specify `returnFields` to reduce bandwidth usage
2. **Set Reasonable Limits**: Don't request more data than you need
3. **Handle Errors Gracefully**: Always check the `success` field in responses
4. **Implement Debouncing**: For real-time search, debounce user input
5. **Cache Results**: Consider caching frequently accessed search results
6. **Monitor Performance**: Keep track of search patterns and response times

## Extension Management

### Updating the Extension

To update to a newer version:

```bash
firebase ext:update elytron/firestore-search-extension --project=your-project-id
```

### Viewing Extension Status

```bash
firebase ext:list --project=your-project-id
```

### Extension Configuration

View or modify extension configuration in the Firebase Console:
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/extensions
```

## Support

- **Documentation**: This README and inline code comments
- **Examples**: See usage examples above
- **Issues**: Report issues through the Firebase Extensions support channels
- **Community**: Firebase community forums and Stack Overflow

## License

Apache-2.0 License - see the extension documentation for details.