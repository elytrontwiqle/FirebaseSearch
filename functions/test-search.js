/**
 * Test file for Firebase Search Extension
 * Run with: node test-search.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin for emulator testing
admin.initializeApp({
  projectId: 'demo-project' // Use demo project for emulator
});

// Connect to Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const db = admin.firestore();

// Test data setup
async function setupTestData() {
  console.log('Setting up test data...');
  
  const testUsers = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'Software developer with expertise in JavaScript',
      department: 'Engineering',
      skills: ['JavaScript', 'React', 'Node.js'],
      profile: {
        age: 30,
        location: 'San Francisco',
        experience: '5 years'
      }
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      bio: 'Product manager focused on user experience',
      department: 'Product',
      skills: ['Product Management', 'UX Design', 'Analytics'],
      profile: {
        age: 28,
        location: 'New York',
        experience: '3 years'
      }
    },
    {
      id: 'user3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      bio: 'Marketing specialist with JavaScript knowledge',
      department: 'Marketing',
      skills: ['Marketing', 'JavaScript', 'SEO'],
      profile: {
        age: 32,
        location: 'Chicago',
        experience: '7 years'
      }
    }
  ];

  const testProducts = [
    {
      id: 'prod1',
      title: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      category: 'Electronics',
      brand: 'TechCorp',
      price: 199.99,
      tags: ['wireless', 'bluetooth', 'headphones', 'audio']
    },
    {
      id: 'prod2',
      title: 'Gaming Laptop Pro',
      description: 'Powerful gaming laptop with RTX graphics',
      category: 'Computers',
      brand: 'GameTech',
      price: 1299.99,
      tags: ['gaming', 'laptop', 'computer', 'rtx']
    },
    {
      id: 'prod3',
      title: 'Wireless Gaming Mouse',
      description: 'Precision wireless mouse for gaming',
      category: 'Accessories',
      brand: 'GameTech',
      price: 79.99,
      tags: ['wireless', 'gaming', 'mouse', 'precision']
    }
  ];

  // Add test users
  for (const user of testUsers) {
    await db.collection('test_users').doc(user.id).set(user);
  }

  // Add test products
  for (const product of testProducts) {
    await db.collection('test_products').doc(product.id).set(product);
  }

  console.log('Test data setup complete!');
}

// Import the search functions (you'll need to adjust the import based on your setup)
// For testing, we'll simulate the search logic here

// Simulate the search function logic with new configuration approach
async function simulateSearch({
  searchValue,
  returnFields,
  limit = 50,
  caseSensitive = false,
  // These would be configured during extension installation
  configuredCollection = 'test_users',
  configuredSearchFields = ['name', 'email', 'bio']
}) {
  const collection = configuredCollection;
  const searchFields = configuredSearchFields;
  const collectionRef = db.collection(collection);
  const results = [];
  const processedValue = caseSensitive ? searchValue : searchValue.toLowerCase();

  try {
    const snapshot = await collectionRef.limit(limit * 10).get();
    
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
          let stringValue;
          if (Array.isArray(fieldValue)) {
            stringValue = fieldValue.join(' ');
          } else {
            stringValue = String(fieldValue);
          }
          const compareValue = caseSensitive ? stringValue : stringValue.toLowerCase();
          
          if (compareValue.includes(processedValue)) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        let resultDoc = { id: doc.id };
        
        if (returnFields && returnFields.length > 0) {
          for (const field of returnFields) {
            const fieldValue = getNestedFieldValue(data, field);
            setNestedFieldValue(resultDoc, field, fieldValue);
          }
        } else {
          resultDoc = { id: doc.id, ...data };
        }
        
        results.push(resultDoc);
        matchCount++;
      }
    });

    return results;
  } catch (error) {
    throw new Error(`Failed to search collection: ${error.message}`);
  }
}

function getNestedFieldValue(obj, fieldPath) {
  return fieldPath.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

function setNestedFieldValue(obj, fieldPath, value) {
  const keys = fieldPath.split('.');
  const lastKey = keys.pop();
  
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  target[lastKey] = value;
}

// Test cases
async function runTests() {
  console.log('Starting search tests...\n');

  try {
    // Test 1: Basic user search (collection and searchable fields pre-configured)
    console.log('Test 1: Basic user search');
    const userResults = await simulateSearch({
      searchValue: 'john',
      returnFields: ['name', 'email', 'department'],
      caseSensitive: false,
      configuredCollection: 'test_users',
      configuredSearchFields: ['name', 'email', 'bio']
    });
    console.log('Results:', JSON.stringify(userResults, null, 2));
    console.log(`Found ${userResults.length} users\n`);

    // Test 2: Product search (simulating different extension configuration)
    console.log('Test 2: Product search');
    const productResults = await simulateSearch({
      searchValue: 'wireless',
      returnFields: ['title', 'price', 'brand'],
      caseSensitive: false,
      configuredCollection: 'test_products',
      configuredSearchFields: ['title', 'description', 'tags']
    });
    console.log('Results:', JSON.stringify(productResults, null, 2));
    console.log(`Found ${productResults.length} products\n`);

    // Test 3: Nested field search
    console.log('Test 3: Nested field search');
    const nestedResults = await simulateSearch({
      searchValue: 'javascript',
      returnFields: ['name', 'profile.location', 'profile.experience'],
      caseSensitive: false,
      configuredCollection: 'test_users',
      configuredSearchFields: ['profile.location', 'skills']
    });
    console.log('Results:', JSON.stringify(nestedResults, null, 2));
    console.log(`Found ${nestedResults.length} users with JavaScript skills\n`);

    // Test 4: Case-sensitive search
    console.log('Test 4: Case-sensitive search');
    const caseResults = await simulateSearch({
      searchValue: 'JavaScript',
      returnFields: ['name', 'skills'],
      caseSensitive: true,
      configuredCollection: 'test_users',
      configuredSearchFields: ['skills']
    });
    console.log('Results:', JSON.stringify(caseResults, null, 2));
    console.log(`Found ${caseResults.length} users with exact case match\n`);

    // Test 5: Return all fields
    console.log('Test 5: Return all fields');
    const allFieldsResults = await simulateSearch({
      searchValue: 'electronics',
      returnFields: null, // Return all fields
      caseSensitive: false,
      configuredCollection: 'test_products',
      configuredSearchFields: ['category']
    });
    console.log('Results:', JSON.stringify(allFieldsResults, null, 2));
    console.log(`Found ${allFieldsResults.length} electronics\n`);

    // Test 6: No results
    console.log('Test 6: No results search');
    const noResults = await simulateSearch({
      searchValue: 'nonexistent',
      returnFields: ['name'],
      caseSensitive: false,
      configuredCollection: 'test_users',
      configuredSearchFields: ['name']
    });
    console.log('Results:', JSON.stringify(noResults, null, 2));
    console.log(`Found ${noResults.length} results (expected 0)\n`);

    console.log('All tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Validation tests
function runValidationTests() {
  console.log('Running validation tests...\n');

  // Test parameter validation for new configuration approach
  const testCases = [
    {
      name: 'Missing searchValue',
      params: {},
      expectedError: 'searchValue is required'
    },
    {
      name: 'Empty searchValue',
      params: { searchValue: '   ' },
      expectedError: 'searchValue cannot be empty'
    },
    {
      name: 'Invalid searchValue type',
      params: { searchValue: 123 },
      expectedError: 'searchValue is required and must be a string'
    },
    {
      name: 'Missing extension configuration',
      params: { searchValue: 'test' },
      config: { searchCollection: null, searchableFields: null },
      expectedError: 'Extension configuration error'
    }
  ];

  function validateSearchParameters({searchValue}, config = {}) {
    // Validate extension configuration
    if (!config.searchCollection || typeof config.searchCollection !== 'string') {
      return 'Extension configuration error: SEARCH_COLLECTION is required';
    }

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

    // Validate collection name format
    if (!/^[a-zA-Z0-9_-]+$/.test(config.searchCollection)) {
      return 'Extension configuration error: SEARCH_COLLECTION must contain only alphanumeric characters, hyphens, and underscores';
    }

    return null;
  }

  testCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    const config = testCase.config || {
      searchCollection: 'test_users',
      searchableFields: ['name', 'email', 'bio']
    };
    const error = validateSearchParameters(testCase.params, config);
    
    if (error && error.includes(testCase.expectedError.split(' ')[0])) {
      console.log('✅ Validation test passed');
    } else {
      console.log('❌ Validation test failed');
      console.log('Expected error containing:', testCase.expectedError);
      console.log('Actual error:', error);
    }
    console.log('');
  });

  console.log('Validation tests completed!\n');
}

// Main execution
async function main() {
  try {
    // Run validation tests first
    runValidationTests();

    // Setup test data
    await setupTestData();

    // Run search tests
    await runTests();

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    // Cleanup test data
    console.log('\nCleaning up test data...');
    try {
      const usersSnapshot = await db.collection('test_users').get();
      const productsSnapshot = await db.collection('test_products').get();
      
      const batch = db.batch();
      
      usersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      productsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
      console.log('Test data cleanup completed!');
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }
    
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  setupTestData,
  simulateSearch,
  runTests,
  runValidationTests
};
