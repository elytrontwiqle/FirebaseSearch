/**
 * Basic Usage Examples for Firebase Firestore ↔ Framer CMS Sync
 * 
 * This file demonstrates common usage patterns for the sync system.
 */

// Example 1: Basic sync from Firestore to Framer
async function basicSync() {
  const response = await fetch('https://your-region-your-project.cloudfunctions.net/syncToFramer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName: 'blog_posts',
      // No mappingConfig needed - system will auto-detect field types
    })
  });

  const result = await response.json();
  console.log('Sync result:', result);
}

// Example 2: Sync with custom field mapping
async function customFieldMappingSync() {
  const response = await fetch('https://your-region-your-project.cloudfunctions.net/syncToFramer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName: 'products',
      mappingConfig: {
        // Override automatic detection for specific fields
        'description': { type: 'string', framerType: 'formattedText' },
        'price': { type: 'number', framerType: 'number' },
        'inStock': { type: 'boolean', framerType: 'boolean' },
        'images': { type: 'array', framerType: 'array', arrayItemType: 'image' },
        'category': { type: 'string', framerType: 'enum', cases: [
          { id: 'electronics', name: 'Electronics' },
          { id: 'clothing', name: 'Clothing' },
          { id: 'books', name: 'Books' }
        ]},
        'publishDate': { type: 'timestamp', framerType: 'date' }
      }
    })
  });

  const result = await response.json();
  console.log('Custom mapping sync result:', result);
}

// Example 3: Setup auto-sync configuration
async function setupAutoSync() {
  const response = await fetch('https://your-region-your-project.cloudfunctions.net/setSyncConfig', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName: 'news_articles',
      config: {
        enabled: true,
        autoSync: true,
        framerWebhookUrl: 'https://your-framer-webhook-url.com/webhook',
        mappingConfig: {
          'title': { type: 'string', framerType: 'string' },
          'content': { type: 'string', framerType: 'formattedText' },
          'author': { type: 'string', framerType: 'string' },
          'publishDate': { type: 'timestamp', framerType: 'date' },
          'featured': { type: 'boolean', framerType: 'boolean' },
          'tags': { type: 'array', framerType: 'array' },
          'coverImage': { type: 'string', framerType: 'image' }
        }
      }
    })
  });

  const result = await response.json();
  console.log('Auto-sync setup result:', result);
}

// Example 4: Bi-directional sync (Framer to Firestore)
async function syncFromFramer() {
  // This would typically be called from a Framer webhook or plugin
  const framerData = [
    {
      id: 'article-1',
      slug: 'my-first-article',
      fieldData: {
        title: { type: 'string', value: 'My First Article' },
        content: { type: 'formattedText', value: '<p>This is the article content...</p>' },
        author: { type: 'string', value: 'John Doe' },
        publishDate: { type: 'date', value: '2024-01-15T10:00:00Z' },
        featured: { type: 'boolean', value: true },
        tags: { type: 'array', value: ['technology', 'web-development'] }
      }
    }
  ];

  const response = await fetch('https://your-region-your-project.cloudfunctions.net/syncFromFramer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName: 'articles',
      framerData: framerData,
      mappingConfig: {
        'title': { type: 'string', framerType: 'string' },
        'content': { type: 'string', framerType: 'formattedText' },
        'author': { type: 'string', framerType: 'string' },
        'publishDate': { type: 'timestamp', framerType: 'date' },
        'featured': { type: 'boolean', framerType: 'boolean' },
        'tags': { type: 'array', framerType: 'array' }
      }
    })
  });

  const result = await response.json();
  console.log('Framer to Firestore sync result:', result);
}

// Example 5: Get sync logs for monitoring
async function getSyncLogs() {
  const response = await fetch('https://your-region-your-project.cloudfunctions.net/getSyncLogs?collectionName=blog_posts&limit=20');
  const result = await response.json();
  
  console.log('Recent sync logs:');
  result.logs.forEach(log => {
    console.log(`${log.timestamp}: ${log.status} - ${log.documentCount} items (${log.changeType})`);
    if (log.status === 'error') {
      console.error('Error details:', log.result);
    }
  });
}

// Example 6: Complex e-commerce product sync
async function ecommerceProductSync() {
  const response = await fetch('https://your-region-your-project.cloudfunctions.net/syncToFramer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName: 'products',
      mappingConfig: {
        // Product basics
        'name': { type: 'string', framerType: 'string' },
        'description': { type: 'string', framerType: 'formattedText' },
        'shortDescription': { type: 'string', framerType: 'string' },
        
        // Pricing
        'price': { type: 'number', framerType: 'number' },
        'salePrice': { type: 'number', framerType: 'number' },
        'currency': { type: 'string', framerType: 'string' },
        
        // Inventory
        'stock': { type: 'number', framerType: 'number' },
        'inStock': { type: 'boolean', framerType: 'boolean' },
        'lowStockThreshold': { type: 'number', framerType: 'number' },
        
        // Media
        'images': { type: 'array', framerType: 'array', arrayItemType: 'image' },
        'featuredImage': { type: 'string', framerType: 'image' },
        
        // Categories and tags
        'category': { type: 'string', framerType: 'collectionReference', collectionId: 'categories' },
        'tags': { type: 'array', framerType: 'multiCollectionReference', collectionId: 'tags' },
        
        // Metadata
        'sku': { type: 'string', framerType: 'string' },
        'weight': { type: 'number', framerType: 'number' },
        'dimensions': { type: 'object', framerType: 'string' }, // Will be JSON stringified
        'createdAt': { type: 'timestamp', framerType: 'date' },
        'updatedAt': { type: 'timestamp', framerType: 'date' },
        
        // SEO
        'metaTitle': { type: 'string', framerType: 'string' },
        'metaDescription': { type: 'string', framerType: 'string' },
        'slug': { type: 'string', framerType: 'string' }
      }
    })
  });

  const result = await response.json();
  console.log('E-commerce product sync result:', result);
}

// Example 7: Blog post with author relationship
async function blogPostWithAuthorSync() {
  const response = await fetch('https://your-region-your-project.cloudfunctions.net/syncToFramer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionName: 'blog_posts',
      mappingConfig: {
        'title': { type: 'string', framerType: 'string' },
        'content': { type: 'string', framerType: 'formattedText' },
        'excerpt': { type: 'string', framerType: 'string' },
        'author': { type: 'string', framerType: 'collectionReference', collectionId: 'authors' },
        'categories': { type: 'array', framerType: 'multiCollectionReference', collectionId: 'categories' },
        'tags': { type: 'array', framerType: 'array' },
        'featuredImage': { type: 'string', framerType: 'image' },
        'publishDate': { type: 'timestamp', framerType: 'date' },
        'lastModified': { type: 'timestamp', framerType: 'date' },
        'status': { 
          type: 'string', 
          framerType: 'enum',
          cases: [
            { id: 'draft', name: 'Draft' },
            { id: 'published', name: 'Published' },
            { id: 'archived', name: 'Archived' }
          ]
        },
        'featured': { type: 'boolean', framerType: 'boolean' },
        'readTime': { type: 'number', framerType: 'number' },
        'viewCount': { type: 'number', framerType: 'number' }
      }
    })
  });

  const result = await response.json();
  console.log('Blog post sync result:', result);
}

// Example 8: Error handling and retry logic
async function syncWithErrorHandling() {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch('https://your-region-your-project.cloudfunctions.net/syncToFramer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: 'events',
          mappingConfig: {
            'title': { type: 'string', framerType: 'string' },
            'description': { type: 'string', framerType: 'formattedText' },
            'startDate': { type: 'timestamp', framerType: 'date' },
            'endDate': { type: 'timestamp', framerType: 'date' },
            'location': { type: 'string', framerType: 'string' },
            'price': { type: 'number', framerType: 'number' },
            'capacity': { type: 'number', framerType: 'number' },
            'isVirtual': { type: 'boolean', framerType: 'boolean' }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Sync failed');
      }

      console.log('Sync successful:', result);
      return result;

    } catch (error) {
      retryCount++;
      console.error(`Sync attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('Max retries reached. Sync failed permanently.');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Export examples for use in other files
module.exports = {
  basicSync,
  customFieldMappingSync,
  setupAutoSync,
  syncFromFramer,
  getSyncLogs,
  ecommerceProductSync,
  blogPostWithAuthorSync,
  syncWithErrorHandling
};