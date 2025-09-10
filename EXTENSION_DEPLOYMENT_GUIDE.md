# Firebase Extension Deployment Guide

This guide explains how to deploy the Firestore Search Extension following Firebase Extensions best practices.

## 🚀 Quick Deployment

### Option 1: Deploy as Firebase Extension (Recommended)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Extensions (if not already done)
firebase init extensions

# Deploy the extension
firebase ext:dev:upload your-publisher-id/firestore-search-extension
```

### Option 2: Deploy as Regular Cloud Functions

```bash
# Deploy functions directly
npm run deploy

# Or use the deployment script
npm run deploy-search
```

## 📋 Pre-Deployment Checklist

### 1. Firebase Project Setup
- ✅ Firebase project created
- ✅ Billing enabled (Blaze plan required)
- ✅ Firestore database initialized
- ✅ Firebase CLI installed and authenticated

### 2. Extension Configuration
- ✅ `extension.yaml` configured correctly
- ✅ Parameters defined and validated
- ✅ Resource declarations complete
- ✅ API requirements specified

### 3. Function Implementation
- ✅ All functions implemented and tested
- ✅ Lifecycle event handlers included
- ✅ Error handling comprehensive
- ✅ Configuration management working

### 4. Documentation
- ✅ PREINSTALL.md complete
- ✅ POSTINSTALL.md complete
- ✅ README.md comprehensive
- ✅ Examples tested and working

## 🔧 Extension Development Workflow

### 1. Local Development and Testing

```bash
# Install dependencies
cd functions
npm install

# Start Firebase emulators
firebase emulators:start --only functions,firestore

# Test functions locally
npm run test-search
```

### 2. Extension Validation

```bash
# Validate extension configuration
firebase ext:dev:validate

# Test extension installation locally
firebase ext:dev:emulators:start
```

### 3. Extension Upload and Publishing

```bash
# Upload extension to Firebase
firebase ext:dev:upload your-publisher-id/firestore-search-extension

# Publish to marketplace (after approval)
firebase ext:dev:publish your-publisher-id/firestore-search-extension@1.0.0
```

## 📦 Extension Package Structure

```
firestore-search-extension/
├── extension.yaml              # Extension configuration
├── functions/
│   ├── index.js               # Main function implementation
│   ├── package.json           # Dependencies
│   └── package-lock.json      # Dependency lock
├── PREINSTALL.md              # Pre-installation guide
├── POSTINSTALL.md             # Post-installation guide
├── README.md                  # Main documentation
├── CHANGELOG.md               # Version history
├── examples/
│   └── search-extension-usage.js  # Usage examples
└── docs/                      # Additional documentation
    ├── FIREBASE_EXTENSION_COMPLIANCE.md
    └── EXTENSION_DEPLOYMENT_GUIDE.md
```

## ⚙️ Configuration Parameters

The extension supports the following configurable parameters:

### Required Parameters
- **LOCATION**: Cloud Functions deployment region
  - Default: `us-central1`
  - Options: All Firebase-supported regions
- **SEARCH_COLLECTION**: The Firestore collection to search
  - Must be a valid collection name
  - Example: `products`, `users`, `articles`
- **SEARCHABLE_FIELDS**: Comma-separated list of searchable fields
  - Example: `title,description,tags`
  - Supports nested fields: `user.profile.name,user.email`

### Optional Parameters
- **DEFAULT_SEARCH_LIMIT**: Default result limit (default: 50)
- **MAX_SEARCH_LIMIT**: Maximum result limit (default: 1000)
- **ENABLE_CASE_SENSITIVE_SEARCH**: Case sensitivity (default: false)
- **ENABLE_LOGGING**: Detailed logging (default: true)

## 🔐 Security Configuration

### Firestore Security Rules
Ensure your Firestore rules allow the extension to read collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow extension to read from specific collections
    match /users/{document} {
      allow read: if true; // Adjust based on your requirements
    }
    match /products/{document} {
      allow read: if true; // Adjust based on your requirements
    }
    // Add more collections as needed
  }
}
```

### IAM Permissions
The extension requires these permissions (automatically granted):
- `datastore.user`: Read access to Firestore
- Cloud Functions execution permissions

## 📊 Monitoring and Maintenance

### Function Monitoring
Monitor extension functions in Firebase Console:
1. Go to Firebase Console > Functions
2. Look for functions with prefix `ext-firestore-search-extension-`
3. Monitor invocations, errors, and performance

### Logging Configuration
Control logging detail with the `ENABLE_LOGGING` parameter:
- `true`: Detailed request/response logging
- `false`: Error logging only

### Performance Monitoring
Key metrics to monitor:
- Function execution time
- Firestore read operations
- Error rates
- Memory usage

## 🚨 Troubleshooting

### Common Deployment Issues

**Extension validation fails**
```bash
# Check extension.yaml syntax
firebase ext:dev:validate

# Common issues:
# - Invalid parameter types
# - Missing required fields
# - Incorrect resource declarations
```

**Function deployment fails**
```bash
# Check function dependencies
cd functions
npm install

# Verify Node.js version compatibility
node --version  # Should be 18 or higher
```

**Permission errors**
```bash
# Ensure proper Firebase authentication
firebase login

# Check project permissions
firebase projects:list
```

### Runtime Issues

**Search returns no results**
- Verify Firestore security rules
- Check collection and field names
- Ensure data exists in searchable fields

**Permission denied errors**
- Update Firestore security rules
- Verify collection access permissions
- Check allowed collections configuration

## 🔄 Update and Maintenance

### Updating the Extension

1. **Make changes** to functions or configuration
2. **Update version** in extension.yaml
3. **Test changes** locally with emulators
4. **Upload new version**:
   ```bash
   firebase ext:dev:upload your-publisher-id/firestore-search-extension
   ```
5. **Publish update**:
   ```bash
   firebase ext:dev:publish your-publisher-id/firestore-search-extension@1.1.0
   ```

### Version Management
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md with each release
- Test thoroughly before publishing
- Provide migration guides for breaking changes

## 📈 Performance Optimization

### Firestore Optimization
1. **Create indexes** for frequently searched fields
2. **Limit collection sizes** or implement pagination
3. **Use specific field queries** when possible
4. **Monitor read operations** and costs

### Function Optimization
1. **Configure appropriate memory** allocation
2. **Set reasonable timeouts**
3. **Use connection pooling** for database connections
4. **Implement caching** for frequent queries

## 🎯 Production Deployment Checklist

Before deploying to production:

- ✅ **Thoroughly tested** with real data
- ✅ **Security rules** properly configured
- ✅ **Monitoring** set up
- ✅ **Error handling** tested
- ✅ **Performance** validated
- ✅ **Documentation** complete
- ✅ **Backup strategy** in place
- ✅ **Rollback plan** prepared

## 📞 Support and Resources

- **Documentation**: Complete API reference in README.md
- **Examples**: Working examples in `/examples` directory
- **Custom Domain Setup**: See POSTINSTALL.md for Firebase Hosting integration
- **Issues**: Report bugs on GitHub
- **Updates**: Check CHANGELOG.md for version history

## 🌐 New in v1.3.0: Custom Domain Support

After deployment, users can optionally set up custom domains for branded API URLs:
- Default: `https://region-project.cloudfunctions.net/ext-instance-searchCollectionHttp/{collection}`
- Custom: `https://yourdomain.com/api/search/{collection}`

See POSTINSTALL.md for complete setup instructions.

---

**Ready to deploy?** Follow the quick deployment steps above and refer to this guide for any issues.
