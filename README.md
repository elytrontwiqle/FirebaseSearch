# 🔥 Firebase Firestore ↔ Framer CMS Dynamic Sync

A powerful Firebase Cloud Function solution that dynamically syncs Firestore collections with Framer CMS collections, automatically detecting field types and handling bi-directional synchronization.

## ✨ Features

- **Dynamic Field Detection**: Automatically analyzes Firestore documents and maps field types to appropriate Framer CMS field types
- **Bi-directional Sync**: Sync data from Firestore to Framer CMS and vice versa
- **Real-time Auto-sync**: Automatically syncs when Firestore documents are created, updated, or deleted
- **Custom Field Mapping**: Override automatic field detection with custom mappings
- **Comprehensive Logging**: Track all sync operations with detailed logs
- **Framer Plugin**: Easy-to-use UI for configuration and manual sync operations
- **Type Safety**: Handles all Firestore data types including timestamps, arrays, and nested objects

## 🚀 Quick Start

### 1. Deploy Firebase Cloud Functions

```bash
# Clone the repository
git clone <repository-url>
cd firestore-framer-sync

# Install dependencies
npm install

# Initialize Firebase (if not already done)
firebase init

# Deploy the functions
firebase deploy --only functions
```

### 2. Install the Framer Plugin

```bash
cd framer-plugin
npm install

# For development
npm run dev

# For production build
npm run build
```

### 3. Configure the Sync

1. In Framer, create a new Managed Collection
2. Install and configure the Firestore CMS Sync plugin
3. Enter your Firebase Cloud Function URL
4. Specify the Firestore collection name
5. Optionally configure custom field mappings
6. Test the connection and sync!

## 📋 Supported Field Types

The system automatically detects and converts between Firestore and Framer field types:

| Firestore Type | Framer CMS Type | Notes |
|----------------|-----------------|-------|
| `string` | `string` | Basic text content |
| `number` | `number` | Numeric values |
| `boolean` | `boolean` | True/false values |
| `timestamp` | `date` | Firebase timestamps |
| `array` | `array` | Arrays (supports image galleries) |
| `object` | `string` | Serialized as JSON string |
| Email fields | `string` | Auto-detected by field name |
| URL fields | `link` | Auto-detected by field name |
| Image fields | `image` | Auto-detected by field name |
| HTML content | `formattedText` | Auto-detected by content |

## 🔧 API Endpoints

### Manual Sync: Firestore → Framer

```bash
POST /syncToFramer
Content-Type: application/json

{
  "collectionName": "posts",
  "framerWebhookUrl": "https://your-webhook-url.com", // optional
  "framerApiKey": "your-api-key", // optional
  "mappingConfig": {
    "title": { "type": "string", "framerType": "string" },
    "publishDate": { "type": "timestamp", "framerType": "date" }
  }
}
```

### Bi-directional Sync: Framer → Firestore

```bash
POST /syncFromFramer
Content-Type: application/json

{
  "collectionName": "posts",
  "framerData": [
    {
      "id": "post-1",
      "slug": "my-first-post",
      "fieldData": {
        "title": { "type": "string", "value": "My First Post" },
        "publishDate": { "type": "date", "value": "2024-01-15T10:00:00Z" }
      }
    }
  ],
  "mappingConfig": {
    "title": { "type": "string", "framerType": "string" },
    "publishDate": { "type": "timestamp", "framerType": "date" }
  }
}
```

### Configuration Management

```bash
# Set sync configuration
POST /setSyncConfig
{
  "collectionName": "posts",
  "config": {
    "enabled": true,
    "framerWebhookUrl": "https://your-webhook.com",
    "mappingConfig": { ... },
    "autoSync": true
  }
}

# Get sync configuration
GET /getSyncConfig?collectionName=posts

# Get sync logs
GET /getSyncLogs?collectionName=posts&limit=50
```

## 🔄 Auto-Sync Setup

The system can automatically sync whenever Firestore documents change:

1. **Configure Auto-sync**: Use the `/setSyncConfig` endpoint or Framer plugin to enable auto-sync
2. **Firestore Triggers**: The `autoSyncOnChange` function automatically triggers on document changes
3. **Selective Sync**: Only collections with `enabled: true` in their config will auto-sync

Example auto-sync configuration:

```javascript
{
  "collectionName": "posts",
  "config": {
    "enabled": true,
    "framerWebhookUrl": "https://your-framer-webhook.com",
    "mappingConfig": {
      "title": { "type": "string", "framerType": "string" },
      "content": { "type": "string", "framerType": "formattedText" },
      "publishDate": { "type": "timestamp", "framerType": "date" },
      "featured": { "type": "boolean", "framerType": "boolean" }
    },
    "autoSync": true
  }
}
```

## 🎨 Framer Plugin Usage

### Configuration Mode
1. Create a new Managed Collection in Framer
2. The plugin will open in configuration mode
3. Enter your Firebase Cloud Function URL
4. Specify the Firestore collection name
5. Optionally configure custom field mappings
6. Test the connection

### Sync Mode
- **Manual Sync**: Click "Sync Now" to immediately sync data
- **Auto-Sync**: Enable automatic synchronization on Firestore changes
- **View Logs**: Monitor sync operations and troubleshoot issues

### Field Mapping Override
If the automatic field detection doesn't work perfectly for your use case, you can override specific fields:

```javascript
{
  "description": { "type": "string", "framerType": "formattedText" },
  "priority": { "type": "number", "framerType": "number" },
  "tags": { "type": "array", "framerType": "array", "arrayItemType": "string" }
}
```

## 🏗️ Architecture

```
Firestore Collection
       ↓
Firebase Cloud Function (Analysis & Transformation)
       ↓
Framer CMS Collection (via Plugin/Webhook)
```

### Key Components

1. **Field Analysis Engine**: Automatically detects field types and patterns
2. **Data Transformation Layer**: Converts between Firestore and Framer formats
3. **Sync Orchestrator**: Manages bi-directional synchronization
4. **Configuration Manager**: Stores and retrieves sync settings
5. **Logging System**: Tracks all operations for debugging and monitoring

## 🔐 Security Considerations

- **CORS Configuration**: Properly configured for Framer domain access
- **API Key Support**: Optional API key authentication for webhooks
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling with detailed logging

## 📊 Monitoring & Logging

All sync operations are logged with:
- Timestamp
- Collection name
- Number of documents processed
- Operation type (create, update, delete, manual)
- Success/error status
- Detailed error messages

Access logs via:
- Framer plugin UI
- `/getSyncLogs` API endpoint
- Firebase Console logs

## 🛠️ Development

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Develop Framer plugin
cd framer-plugin
npm run dev
```

### Testing

```bash
# Test the sync function
curl -X POST http://localhost:5001/your-project/us-central1/syncToFramer \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "test-collection",
    "mappingConfig": {}
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Open an issue on GitHub
- **Documentation**: Check the inline code comments
- **Examples**: See the `examples/` directory for sample configurations

---

**Built with ❤️ using Firebase Cloud Functions and Framer CMS**
