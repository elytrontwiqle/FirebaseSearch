const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors');
const _ = require('lodash');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// CORS configuration
const corsHandler = cors({ origin: true });

/**
 * Dynamic Firestore to Framer CMS Sync Function
 * This function syncs any Firestore collection to Framer CMS collections
 * It automatically detects field types and handles the mapping dynamically
 */
exports.syncToFramer = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { 
        collectionName, 
        framerWebhookUrl, 
        framerApiKey,
        mappingConfig = {},
        syncDirection = 'firestore-to-framer' 
      } = req.body;

      if (!collectionName) {
        return res.status(400).json({ 
          error: 'Collection name is required' 
        });
      }

      if (!framerWebhookUrl && !framerApiKey) {
        return res.status(400).json({ 
          error: 'Either framerWebhookUrl or framerApiKey is required' 
        });
      }

      // Get all documents from the Firestore collection
      const snapshot = await db.collection(collectionName).get();
      const documents = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...data,
          _firestoreId: doc.id,
          _lastUpdated: new Date().toISOString()
        });
      });

      // Dynamically analyze the data structure
      const fieldMapping = await analyzeDataStructure(documents, mappingConfig);
      
      // Transform data for Framer CMS format
      const framerData = await transformDataForFramer(documents, fieldMapping);

      // Send to Framer (webhook or API)
      const result = await sendToFramer(framerData, framerWebhookUrl, framerApiKey, collectionName);

      // Log the sync operation
      await logSyncOperation(collectionName, documents.length, 'success', result);

      res.status(200).json({
        success: true,
        message: `Successfully synced ${documents.length} documents from ${collectionName}`,
        fieldMapping,
        syncedData: framerData
      });

    } catch (error) {
      console.error('Sync error:', error);
      
      // Log the error
      await logSyncOperation(req.body.collectionName || 'unknown', 0, 'error', error.message);

      res.status(500).json({
        error: 'Sync failed',
        details: error.message
      });
    }
  });
});

/**
 * Firestore Trigger Function
 * Automatically syncs when documents are created, updated, or deleted
 */
exports.autoSyncOnChange = functions.firestore
  .document('{collectionId}/{docId}')
  .onWrite(async (change, context) => {
    try {
      const { collectionId, docId } = context.params;
      
      // Get sync configuration for this collection
      const syncConfig = await getSyncConfig(collectionId);
      
      if (!syncConfig || !syncConfig.enabled) {
        console.log(`Auto-sync not enabled for collection: ${collectionId}`);
        return null;
      }

      // Determine the type of change
      const changeType = !change.before.exists ? 'create' : 
                        !change.after.exists ? 'delete' : 'update';

      console.log(`Auto-sync triggered: ${changeType} in ${collectionId}/${docId}`);

      // Get all documents in the collection for full sync
      const snapshot = await admin.firestore().collection(collectionId).get();
      const documents = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...data,
          _firestoreId: doc.id,
          _lastUpdated: new Date().toISOString()
        });
      });

      // Analyze and transform data
      const fieldMapping = await analyzeDataStructure(documents, syncConfig.mappingConfig || {});
      const framerData = await transformDataForFramer(documents, fieldMapping);

      // Send to Framer
      const result = await sendToFramer(
        framerData, 
        syncConfig.framerWebhookUrl, 
        syncConfig.framerApiKey, 
        collectionId
      );

      // Log the operation
      await logSyncOperation(collectionId, documents.length, 'success', result, changeType);

      return result;

    } catch (error) {
      console.error('Auto-sync error:', error);
      await logSyncOperation(context.params.collectionId, 0, 'error', error.message, 'auto');
      throw error;
    }
  });

/**
 * Bi-directional sync from Framer to Firestore
 */
exports.syncFromFramer = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { collectionName, framerData, mappingConfig = {} } = req.body;

      if (!collectionName || !framerData) {
        return res.status(400).json({ 
          error: 'Collection name and framer data are required' 
        });
      }

      // Transform Framer data to Firestore format
      const firestoreData = await transformDataFromFramer(framerData, mappingConfig);

      // Batch write to Firestore
      const batch = db.batch();
      let updateCount = 0;

      for (const item of firestoreData) {
        const docRef = item.id ? 
          db.collection(collectionName).doc(item.id) : 
          db.collection(collectionName).doc();
        
        const dataToWrite = { ...item };
        delete dataToWrite.id; // Remove id from the data object
        dataToWrite._lastSyncFromFramer = new Date().toISOString();

        batch.set(docRef, dataToWrite, { merge: true });
        updateCount++;
      }

      await batch.commit();

      // Log the sync operation
      await logSyncOperation(collectionName, updateCount, 'success', null, 'framer-to-firestore');

      res.status(200).json({
        success: true,
        message: `Successfully synced ${updateCount} documents to ${collectionName}`,
        updatedCount: updateCount
      });

    } catch (error) {
      console.error('Framer to Firestore sync error:', error);
      await logSyncOperation(req.body.collectionName || 'unknown', 0, 'error', error.message, 'framer-to-firestore');
      
      res.status(500).json({
        error: 'Sync from Framer failed',
        details: error.message
      });
    }
  });
});

/**
 * Configuration management endpoints
 */
exports.setSyncConfig = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { collectionName, config } = req.body;

      if (!collectionName || !config) {
        return res.status(400).json({ 
          error: 'Collection name and config are required' 
        });
      }

      await db.collection('_syncConfigs').doc(collectionName).set({
        ...config,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: `Sync configuration saved for ${collectionName}`
      });

    } catch (error) {
      console.error('Config save error:', error);
      res.status(500).json({
        error: 'Failed to save configuration',
        details: error.message
      });
    }
  });
});

exports.getSyncConfig = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { collectionName } = req.query;

      if (!collectionName) {
        return res.status(400).json({ 
          error: 'Collection name is required' 
        });
      }

      const config = await getSyncConfig(collectionName);

      res.status(200).json({
        success: true,
        config: config || null
      });

    } catch (error) {
      console.error('Config fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch configuration',
        details: error.message
      });
    }
  });
});

/**
 * Get sync logs and status
 */
exports.getSyncLogs = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { collectionName, limit = 50 } = req.query;

      let query = db.collection('_syncLogs').orderBy('timestamp', 'desc').limit(parseInt(limit));
      
      if (collectionName) {
        query = query.where('collectionName', '==', collectionName);
      }

      const snapshot = await query.get();
      const logs = [];

      snapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        logs
      });

    } catch (error) {
      console.error('Logs fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch logs',
        details: error.message
      });
    }
  });
});

/**
 * Helper Functions
 */

async function analyzeDataStructure(documents, mappingConfig) {
  if (documents.length === 0) return {};

  const fieldTypes = {};
  const sampleDoc = documents[0];

  // Analyze each field in the sample document
  for (const [key, value] of Object.entries(sampleDoc)) {
    if (key.startsWith('_')) continue; // Skip internal fields

    // Check if there's a manual mapping
    if (mappingConfig[key]) {
      fieldTypes[key] = mappingConfig[key];
      continue;
    }

    // Auto-detect field type
    fieldTypes[key] = detectFieldType(value, key);
  }

  return fieldTypes;
}

function detectFieldType(value, fieldName) {
  if (value === null || value === undefined) {
    return { type: 'string', framerType: 'string' };
  }

  // Check for specific field patterns
  if (fieldName.toLowerCase().includes('email')) {
    return { type: 'string', framerType: 'string', validation: 'email' };
  }

  if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('link')) {
    return { type: 'string', framerType: 'link' };
  }

  if (fieldName.toLowerCase().includes('image') || fieldName.toLowerCase().includes('photo')) {
    return { type: 'string', framerType: 'image' };
  }

  if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('time')) {
    return { type: 'timestamp', framerType: 'date' };
  }

  // Type-based detection
  switch (typeof value) {
    case 'boolean':
      return { type: 'boolean', framerType: 'boolean' };
    
    case 'number':
      return { type: 'number', framerType: 'number' };
    
    case 'string':
      // Check if it's a date string
      if (isDateString(value)) {
        return { type: 'string', framerType: 'date' };
      }
      // Check if it's HTML content
      if (isHtmlContent(value)) {
        return { type: 'string', framerType: 'formattedText' };
      }
      return { type: 'string', framerType: 'string' };
    
    case 'object':
      if (Array.isArray(value)) {
        return { type: 'array', framerType: 'array' };
      }
      if (value.seconds !== undefined) { // Firestore timestamp
        return { type: 'timestamp', framerType: 'date' };
      }
      return { type: 'object', framerType: 'string' }; // Serialize as JSON string
    
    default:
      return { type: 'string', framerType: 'string' };
  }
}

function isDateString(str) {
  return !isNaN(Date.parse(str)) && str.length > 8;
}

function isHtmlContent(str) {
  return /<[^>]+>/g.test(str);
}

async function transformDataForFramer(documents, fieldMapping) {
  return documents.map(doc => {
    const transformed = {
      id: doc._firestoreId || doc.id,
      slug: generateSlug(doc),
      draft: false,
      fieldData: {}
    };

    // Transform each field according to the mapping
    for (const [key, value] of Object.entries(doc)) {
      if (key.startsWith('_') && key !== '_firestoreId') continue;

      const mapping = fieldMapping[key];
      if (!mapping) continue;

      let transformedValue = transformValueForFramer(value, mapping);
      
      // Wrap in Framer's expected format
      transformed.fieldData[key] = {
        type: mapping.framerType,
        value: transformedValue
      };
    }

    return transformed;
  });
}

function transformValueForFramer(value, mapping) {
  if (value === null || value === undefined) return '';

  switch (mapping.framerType) {
    case 'date':
      if (typeof value === 'object' && value.seconds) {
        // Firestore timestamp
        return new Date(value.seconds * 1000).toISOString();
      }
      if (typeof value === 'string') {
        return new Date(value).toISOString();
      }
      return value;

    case 'boolean':
      return Boolean(value);

    case 'number':
      return Number(value);

    case 'array':
      if (Array.isArray(value)) {
        return value.map(item => {
          if (mapping.arrayItemType === 'image') {
            return { type: 'image', value: item };
          }
          return item;
        });
      }
      return [];

    case 'object':
      return JSON.stringify(value);

    default:
      return String(value);
  }
}

async function transformDataFromFramer(framerData, mappingConfig) {
  if (!Array.isArray(framerData)) {
    framerData = [framerData];
  }

  return framerData.map(item => {
    const transformed = {
      id: item.id || item.slug
    };

    // Transform fieldData back to Firestore format
    if (item.fieldData) {
      for (const [key, fieldValue] of Object.entries(item.fieldData)) {
        transformed[key] = transformValueFromFramer(fieldValue, mappingConfig[key]);
      }
    }

    return transformed;
  });
}

function transformValueFromFramer(fieldValue, mapping) {
  if (!fieldValue || fieldValue.value === undefined) return null;

  const value = fieldValue.value;

  if (!mapping) return value;

  switch (mapping.type) {
    case 'timestamp':
      return admin.firestore.Timestamp.fromDate(new Date(value));
    
    case 'number':
      return Number(value);
    
    case 'boolean':
      return Boolean(value);
    
    case 'object':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    
    default:
      return value;
  }
}

function generateSlug(doc) {
  // Try to find a suitable field for slug generation
  const titleFields = ['title', 'name', 'subject', 'heading'];
  
  for (const field of titleFields) {
    if (doc[field]) {
      return slugify(doc[field]);
    }
  }

  // Fallback to document ID
  return doc._firestoreId || doc.id || 'item';
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function sendToFramer(data, webhookUrl, apiKey, collectionName) {
  const payload = {
    collection: collectionName,
    items: data,
    timestamp: new Date().toISOString(),
    source: 'firestore'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (webhookUrl) {
    // Send via webhook
    const response = await axios.post(webhookUrl, payload, { headers });
    return {
      method: 'webhook',
      status: response.status,
      data: response.data
    };
  }

  // If no webhook URL, return the payload for manual processing
  return {
    method: 'manual',
    payload,
    message: 'Data prepared for manual import to Framer'
  };
}

async function getSyncConfig(collectionName) {
  try {
    const doc = await db.collection('_syncConfigs').doc(collectionName).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error fetching sync config:', error);
    return null;
  }
}

async function logSyncOperation(collectionName, documentCount, status, result, changeType = 'manual') {
  try {
    await db.collection('_syncLogs').add({
      collectionName,
      documentCount,
      status,
      result: typeof result === 'object' ? JSON.stringify(result) : result,
      changeType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging sync operation:', error);
  }
}