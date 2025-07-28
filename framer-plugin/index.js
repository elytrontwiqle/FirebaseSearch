import { framer } from "framer-plugin";

// Configuration for the Firebase sync
let syncConfig = {
  firebaseCloudFunctionUrl: '',
  collections: {}
};

// Initialize the plugin
framer.showUI({
  position: "top right",
  width: 400,
  height: 600,
});

/**
 * Main sync function that connects to Firebase Cloud Function
 */
async function syncWithFirebase(collectionName, firestoreCollectionName) {
  try {
    // Show loading state
    await framer.notify("Starting sync with Firebase...", { variant: "info" });

    // Get the managed collection
    const collection = await framer.getManagedCollection();
    
    if (!collection) {
      throw new Error("No managed collection found. Please create a managed collection first.");
    }

    // Make request to Firebase Cloud Function
    const response = await fetch(`${syncConfig.firebaseCloudFunctionUrl}/syncToFramer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionName: firestoreCollectionName || collectionName,
        framerWebhookUrl: null, // We'll handle the data directly
        mappingConfig: syncConfig.collections[collectionName]?.mappingConfig || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const syncResult = await response.json();
    
    if (!syncResult.success) {
      throw new Error(syncResult.error || 'Sync failed');
    }

    // Process the synced data
    await processFramerData(collection, syncResult.syncedData, syncResult.fieldMapping);

    await framer.notify(`Successfully synced ${syncResult.syncedData.length} items!`, { 
      variant: "success" 
    });

    return syncResult;

  } catch (error) {
    console.error('Sync error:', error);
    await framer.notify(`Sync failed: ${error.message}`, { variant: "error" });
    throw error;
  }
}

/**
 * Process and add data to Framer CMS collection
 */
async function processFramerData(collection, data, fieldMapping) {
  // Set up fields based on the mapping
  const fields = Object.entries(fieldMapping).map(([fieldId, mapping]) => ({
    id: fieldId,
    name: formatFieldName(fieldId),
    type: mapping.framerType,
    ...(mapping.framerType === 'enum' && mapping.cases ? { cases: mapping.cases } : {}),
    ...(mapping.framerType === 'collectionReference' && mapping.collectionId ? { collectionId: mapping.collectionId } : {}),
  }));

  // Update collection fields
  await collection.setFields(fields);

  // Transform and add items
  const items = data.map(item => ({
    id: item.id,
    slug: item.slug,
    fieldData: transformFieldData(item.fieldData)
  }));

  // Clear existing items and add new ones
  const existingItemIds = await collection.getItemIds();
  if (existingItemIds.length > 0) {
    await collection.removeItems(existingItemIds);
  }

  await collection.addItems(items);
}

/**
 * Transform field data from Firebase format to Framer format
 */
function transformFieldData(fieldData) {
  const transformed = {};
  
  for (const [fieldId, fieldValue] of Object.entries(fieldData)) {
    // The data is already in the correct format from the Cloud Function
    transformed[fieldId] = fieldValue;
  }
  
  return transformed;
}

/**
 * Format field name for display
 */
function formatFieldName(fieldId) {
  return fieldId
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Setup automatic sync when collection changes
 */
async function setupAutoSync(collectionName, firestoreCollectionName) {
  try {
    // Save sync configuration to Firebase
    const response = await fetch(`${syncConfig.firebaseCloudFunctionUrl}/setSyncConfig`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionName: firestoreCollectionName || collectionName,
        config: {
          enabled: true,
          framerWebhookUrl: null, // We'll use manual sync for now
          mappingConfig: syncConfig.collections[collectionName]?.mappingConfig || {},
          autoSync: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to setup auto-sync: ${response.statusText}`);
    }

    await framer.notify("Auto-sync enabled for this collection!", { variant: "success" });

  } catch (error) {
    console.error('Auto-sync setup error:', error);
    await framer.notify(`Auto-sync setup failed: ${error.message}`, { variant: "error" });
  }
}

/**
 * Get sync logs from Firebase
 */
async function getSyncLogs(collectionName) {
  try {
    const response = await fetch(`${syncConfig.firebaseCloudFunctionUrl}/getSyncLogs?collectionName=${encodeURIComponent(collectionName)}&limit=20`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const result = await response.json();
    return result.logs || [];

  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

/**
 * Handle different plugin modes
 */
if (framer.mode === "syncManagedCollection") {
  // Auto-sync mode - sync without showing UI
  (async () => {
    try {
      const collection = await framer.getManagedCollection();
      const collectionName = collection.name || 'default';
      
      // Get the stored configuration
      const storedConfig = await collection.getPluginData('syncConfig');
      if (storedConfig) {
        syncConfig = JSON.parse(storedConfig);
      }

      if (!syncConfig.firebaseCloudFunctionUrl) {
        throw new Error('Firebase Cloud Function URL not configured');
      }

      await syncWithFirebase(collectionName, syncConfig.firestoreCollectionName || collectionName);
      await framer.closePlugin();

    } catch (error) {
      console.error('Auto-sync failed:', error);
      await framer.notify(`Auto-sync failed: ${error.message}`, { variant: "error" });
      await framer.closePlugin();
    }
  })();

} else if (framer.mode === "configureManagedCollection") {
  // Configuration mode - show UI for setup
  framer.showUI({
    position: "center",
    width: 500,
    height: 700,
  });
}

// Export functions for UI interaction
window.syncWithFirebase = syncWithFirebase;
window.setupAutoSync = setupAutoSync;
window.getSyncLogs = getSyncLogs;
window.syncConfig = syncConfig;