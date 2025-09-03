# Firestore Search Extension - Pre-Installation Guide

This extension provides configurable search functionality for your Firestore collections. Before installing, please review the following information.

## What this extension does

The Firestore Search Extension allows you to:

- **Search a dedicated collection** configured during installation
- **Pre-configure searchable fields** for enhanced security and performance
- **Fuzzy search with typo tolerance** (1 typo per 4 characters) for better UX
- **Automatic data transformation** (Firestore timestamps → ISO strings, references → paths)
- **Support nested field searches** using dot notation (e.g., `user.profile.name`)
- **Handle case-sensitive and case-insensitive searches**
- **Rate limiting** to prevent abuse and ensure fair usage
- **Limit search results** to prevent performance issues
- **Access via HTTP endpoint** for easy integration

## Before installing

### 1. Firestore Database Required
This extension requires a Firestore database in your Firebase project. If you haven't set up Firestore yet:

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to "Firestore Database"
4. Click "Create database" and follow the setup wizard

### 2. Billing Account Required
This extension uses Cloud Functions, which requires a billing account. Make sure your Firebase project is on the Blaze (pay-as-you-go) plan.

### 3. Security Rules Consideration
Ensure your Firestore security rules allow the extension to read from the collections you want to search. The extension will need read access to any collection specified in search requests.

Example security rule:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow the extension to read from specific collections
    match /users/{document} {
      allow read: if true; // Adjust based on your security requirements
    }
    match /products/{document} {
      allow read: if true; // Adjust based on your security requirements
    }
  }
}
```

### 4. Performance Considerations
- **Indexing**: Ensure your Firestore collections have appropriate indexes for the fields you plan to search
- **Collection Size**: For very large collections (>100k documents), consider implementing additional filtering or pagination
- **Search Frequency**: High-frequency searches may impact your Firestore read quotas

## Configuration Parameters

During installation, you'll configure these parameters:

### Required Parameters
- **Cloud Functions Location**: Choose the region closest to your users for better performance
- **Search Collection**: The specific Firestore collection this extension will search
- **Searchable Fields**: Comma-separated list of fields that can be searched within the collection

### Optional Parameters
- **Default Return Fields**: Default fields to return in results (empty = return all fields)
- **Default Search Limit**: Maximum number of results returned by default (default: 50)
- **Maximum Search Limit**: Absolute maximum results that can be returned (default: 1000)
- **Case Sensitive Search**: Whether searches are case-sensitive by default (default: false)
- **Fuzzy Search**: Enable typo tolerance for better user experience (default: enabled)
- **Rate Limiting**: Requests per minute per origin (default: 60)
- **Rate Limit Window**: Time window for rate limiting in minutes (default: 1)

## Post-Installation

After installation, you'll have access to:

1. **HTTP Endpoint**: `searchCollectionHttp` - Use for REST API calls
   - Searches the configured collection using pre-defined searchable fields
   - Simplified API with fewer parameters required
   - Enhanced security through configuration-time field locking

## Estimated Costs

This extension uses the following Firebase services:
- **Cloud Functions**: Charged per invocation and compute time
- **Firestore**: Charged per document read during searches

Typical costs for moderate usage (1000 searches/month, 10 results each):
- Cloud Functions: ~$0.10/month
- Firestore reads: ~$0.06/month

## Support

For issues, questions, or feature requests:
- Check the [documentation](./README.md)
- Review [usage examples](./examples/)
- File issues on [GitHub](https://github.com/your-username/firestore-search-extension)

## Next Steps

1. Click "Install Extension"
2. Configure the parameters based on your needs
3. Review the post-installation documentation
4. Test the extension with your data
