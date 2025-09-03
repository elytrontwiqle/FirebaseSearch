# 🔍 Firebase Firestore Search Extension

[![Firebase Extension](https://img.shields.io/badge/Firebase-Extension-orange.svg)](https://firebase.google.com/products/extensions)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/Version-1.0.0--beta.10-green.svg)](https://github.com/elytrontwiqle/FirebaseSearch/releases)

A powerful HTTP-based Firebase Extension that provides intelligent search functionality for Firestore collections with fuzzy matching, automatic data transformation, and advanced filtering capabilities.

## ✨ Key Features

- 🔍 **Intelligent Fuzzy Search** - Typo tolerance (1 per 4 characters) for better UX
- 🔄 **Automatic Data Transformation** - Clean JSON with converted timestamps and references
- 🎯 **Dynamic Endpoint Naming** - Collection-specific endpoints for multiple instances
- 🛡️ **Rate Limiting** - Configurable per-origin request protection
- 🔐 **Enhanced Security** - Pre-configured collections and searchable fields
- ⚡ **High Performance** - Optimized queries with configurable limits
- 📱 **CORS Ready** - Built-in support for web applications

## 🚀 Quick Install

[![Install Extension](https://img.shields.io/badge/Install-Firebase%20Extension-orange.svg)](https://console.firebase.google.com/project/_/extensions/install?ref=elytron/firestore-search-extension@1.0.0-beta.10)

```bash
firebase ext:install elytron/firestore-search-extension@1.0.0-beta.10 --project=your-project-id
```

## 📖 Documentation

- **[Installation Guide](PREINSTALL.md)** - Pre-installation requirements and setup
- **[Configuration Guide](POSTINSTALL.md)** - Post-installation configuration and usage
- **[API Reference](README.md)** - Complete API documentation and examples
- **[Usage Examples](examples/basic-usage.js)** - Comprehensive code examples

## 🔧 How It Works

### 1. Install & Configure
Configure your collection and searchable fields during installation:
```yaml
Search Collection: "users"
Searchable Fields: "name,email,bio"
Default Return Fields: "name,email,profileImage"
```

### 2. Get Your Endpoint
Each installation creates a collection-specific endpoint:
```
https://us-central1-YOUR_PROJECT.cloudfunctions.net/ext-firestore-search-extension-searchUsersHttp
```

### 3. Search with Intelligence
```javascript
// Fuzzy search with typo tolerance
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    searchValue: 'jhon doe',  // Will match "John Doe"
    limit: 10
  })
});

const results = await response.json();
```

### 4. Get Clean Data
```json
{
  "success": true,
  "data": [{
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-09T14:01:33.753Z",  // Clean ISO string
    "profile": "profiles/abc123"              // Clean path
  }]
}
```

## 🎯 Use Cases

- **User Search** - Find users by name, email, or profile information
- **Product Catalog** - Search products with typo-tolerant queries
- **Content Discovery** - Search articles, posts, or documents
- **Customer Support** - Quick customer lookup with fuzzy matching
- **Admin Dashboards** - Powerful search for management interfaces

## 🛡️ Security & Performance

- **Pre-configured Access** - Collections and fields locked during installation
- **Input Validation** - Comprehensive parameter validation and sanitization
- **Rate Limiting** - Configurable per-origin protection (default: 60/min)
- **Optimized Queries** - Efficient Firestore operations with result limits
- **Error Handling** - Structured error responses without information leakage

## 📊 Pricing

This extension uses Firebase services with standard pricing:
- **Cloud Functions** - Pay per invocation and compute time
- **Firestore** - Pay per document read during searches

Estimated costs for moderate usage (1000 searches/month, 10 results each):
- Cloud Functions: ~$0.10/month
- Firestore reads: ~$0.06/month

## 🤝 Support

- 📚 **Documentation** - Comprehensive guides and examples
- 🐛 **Issues** - [Report bugs or request features](https://github.com/elytrontwiqle/FirebaseSearch/issues)
- 💬 **Discussions** - [Community support](https://github.com/elytrontwiqle/FirebaseSearch/discussions)
- 💝 **Donations** - [Support development](https://pay.yoco.com/twiqle)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🏗️ Development

### Prerequisites
- Node.js 18+
- Firebase CLI
- Firebase project with Firestore enabled

### Local Development
```bash
git clone https://github.com/elytrontwiqle/FirebaseSearch.git
cd FirebaseSearch
cd functions && npm install
firebase emulators:start
```

### Testing
```bash
cd functions
node test-search.js
```

### Deployment
```bash
firebase ext:dev:upload elytron/firestore-search-extension --local
```

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Built with ❤️ for the Firebase community**

[![Firebase](https://img.shields.io/badge/Built%20for-Firebase-orange.svg)](https://firebase.google.com)
[![Firestore](https://img.shields.io/badge/Powered%20by-Firestore-blue.svg)](https://firebase.google.com/products/firestore)
