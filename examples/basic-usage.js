/**
 * Basic Usage Examples for Firebase Firestore Search Extension
 * 
 * This file demonstrates common usage patterns for the HTTP-based search functionality.
 * Replace YOUR_PROJECT_ID and YOUR_REGION with your actual Firebase project details.
 * 
 * Features demonstrated:
 * - Basic search with configurable return fields
 * - Fuzzy search with typo tolerance (1 typo per 4 characters)
 * - Result sorting by field with direction control
 * - Rate limiting with headers and error handling
 * - Data transformation (timestamps → ISO strings, references → paths)
 * - Case sensitivity options
 * - Nested field support
 * 
 * NOTE: Searchable collections and fields are configured during extension installation.
 * Collection name is specified in the URL path. Only configured collections (or all if none specified) can be accessed.
 * You only need to provide the searchValue and optional parameters like returnFields, limit, etc.
 */

// Base URL for your search extension (latest version)
// Collection name is now specified in the URL path: {baseURL}/{collectionName}
const BASE_URL = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp';

// Helper function to build collection-specific URL
const getSearchURL = (collection) => `${BASE_URL}/${collection}`;

// Example 1: Basic search functionality with specific return fields
async function basicSearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        searchValue: 'john',
        returnFields: 'name,email,profileImage', // Override default return fields
        limit: 10
    })
  });

  const result = await response.json();
    
    // Check rate limiting headers
    console.log('Rate Limit Info:');
    console.log('- Limit:', response.headers.get('X-RateLimit-Limit'));
    console.log('- Remaining:', response.headers.get('X-RateLimit-Remaining'));
    console.log('- Reset:', response.headers.get('X-RateLimit-Reset'));
    
    if (result.success) {
      console.log('Search results:', result.data);
      console.log('Total results:', result.meta.totalResults);
    } else {
      console.error('Search failed:', result.error.message);
      if (result.error.code === 'RATE_LIMIT_EXCEEDED') {
        console.log('Rate limit exceeded. Retry after:', result.error.retryAfter, 'seconds');
      }
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

// Example 2: Search using default return fields (configured during installation)
async function searchWithDefaultFields() {
  try {
    const response = await fetch(getSearchURL('users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        searchValue: 'firebase',
        // No returnFields specified - uses default fields configured during installation
        limit: 5
    })
  });

  const result = await response.json();
    
    if (result.success) {
      console.log('Search with default fields:', result.data);
      console.log('Fields returned:', Object.keys(result.data[0] || {}));
    } else {
      console.error('Search failed:', result.error.message);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

// Example 3: Fuzzy search demonstration (typo tolerance)
async function fuzzySearchDemo() {
  try {
    console.log('=== Fuzzy Search Demo ===');
    
    // Search with intentional typos - these should still find matches
    const typoSearches = [
      'Firebas',    // Missing 'e' - should match "Firebase"
      'Jhon',       // Swapped letters - should match "John"
      'Googl',      // Missing 'e' - should match "Google"
      'Reactt'      // Extra 't' - should match "React"
    ];
    
    for (const searchTerm of typoSearches) {
      const response = await fetch(getSearchURL('users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
          searchValue: searchTerm,
          limit: 3
    })
  });

  const result = await response.json();
      
      if (result.success) {
        console.log(`\nSearch: "${searchTerm}" found ${result.meta.totalResults} results`);
        result.data.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name || item.title || item.id}`);
        });
      } else {
        console.log(`\nSearch: "${searchTerm}" - ${result.error.message}`);
      }
    }
  } catch (error) {
    console.error('Fuzzy search demo failed:', error.message);
  }
}

// Example 4: Sorting search results
async function sortedSearchDemo() {
  try {
    console.log('=== Sorted Search Demo ===');
    
    // Example 1: Sort by name in ascending order (default)
    console.log('\n1. Sort by name (ascending):');
    const ascendingResponse = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchValue: 'user',
        sortBy: 'name',
        direction: 'asc', // or 'ascending'
        limit: 5
      })
    });
    
    const ascendingResult = await ascendingResponse.json();
    if (ascendingResult.success) {
      console.log('Results sorted by name (A-Z):');
      ascendingResult.data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name || 'N/A'} (ID: ${item.id})`);
      });
      console.log(`Sort info: ${ascendingResult.meta.sortBy} ${ascendingResult.meta.direction}`);
    }
    
    // Example 2: Sort by date in descending order (newest first)
    console.log('\n2. Sort by date (descending - newest first):');
    const descendingResponse = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchValue: 'user',
        sortBy: 'createdAt', // or 'date', 'timestamp', etc.
        direction: 'desc', // or 'descending'
        limit: 5
      })
    });
    
    const descendingResult = await descendingResponse.json();
    if (descendingResult.success) {
      console.log('Results sorted by date (newest first):');
      descendingResult.data.forEach((item, index) => {
        const date = item.createdAt || item.date || 'N/A';
        console.log(`  ${index + 1}. ${item.name || item.id} - ${date}`);
      });
    }
    
    // Example 3: Sort by nested field
    console.log('\n3. Sort by nested field (user.profile.score):');
    const nestedSortResponse = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchValue: 'user',
        sortBy: 'user.profile.score', // Nested field with dot notation
        direction: 'desc', // Highest scores first
        limit: 5
      })
    });
    
    const nestedSortResult = await nestedSortResponse.json();
    if (nestedSortResult.success) {
      console.log('Results sorted by nested score (highest first):');
      nestedSortResult.data.forEach((item, index) => {
        const score = item.user?.profile?.score || 'N/A';
        console.log(`  ${index + 1}. ${item.name || item.id} - Score: ${score}`);
      });
    }
    
    // Example 4: Search without sorting (original order)
    console.log('\n4. Search without sorting (original order):');
    const unsortedResponse = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchValue: 'user',
        // No sortBy parameter - results returned in original order
        limit: 5
      })
    });
    
    const unsortedResult = await unsortedResponse.json();
    if (unsortedResult.success) {
      console.log('Results in original order (no sorting):');
      unsortedResult.data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name || item.id}`);
      });
      console.log(`Sort info: ${unsortedResult.meta.sortBy} ${unsortedResult.meta.direction}`);
    }
    
  } catch (error) {
    console.error('Sorted search demo failed:', error.message);
  }
}

// Example 5: Search with specific return fields
async function searchWithReturnFields() {
  try {
    const response = await fetch(getSearchURL('users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        searchValue: 'laptop',
        returnFields: 'title,price,imageUrl,brand',
        limit: 20
    })
  });

  const result = await response.json();
    
    if (result.success) {
      console.log('Product search results:');
      result.data.forEach(product => {
        console.log(`- ${product.title}: $${product.price} (${product.brand})`);
      });
    } else {
      console.error('Product search failed:', result.error.message);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

// Example 3: Case-sensitive search
async function caseSensitiveSearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchValue: 'JavaScript',
        returnFields: 'title,author,publishedAt',
        caseSensitive: true,
        limit: 15
      })
    });

  const result = await response.json();
  
    if (result.success) {
      console.log('Case-sensitive search results:', result.data.length);
      result.data.forEach(article => {
        console.log(`- ${article.title}`);
      });
    }
  } catch (error) {
    console.error('Case-sensitive search failed:', error.message);
  }
}

// Example 4: Nested field search
async function nestedFieldSearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        searchValue: 'premium',
        returnFields: 'orderId,customer.name,totalAmount,status,shipping.address.city',
        limit: 25
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Nested field search results:');
      result.data.forEach(order => {
        console.log(`Order ${order.orderId}: ${order.customer.name} - $${order.totalAmount}`);
      });
    }
  } catch (error) {
    console.error('Nested field search failed:', error.message);
  }
}

// Example 5: GET request (query parameters)
async function getRequestExample() {
  try {
    const params = new URLSearchParams({
      searchValue: 'developer',
      returnFields: 'name,email,profileImage',
      limit: '10',
      caseSensitive: 'false'
    });

    const response = await fetch(`${SEARCH_URL}?${params}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('GET request results:', result.data);
    }
  } catch (error) {
    console.error('GET request failed:', error.message);
  }
}

// Example 6: E-commerce product search
async function ecommerceProductSearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchValue: 'wireless headphones',
        returnFields: 'name,price,imageUrl,brand,rating,inStock,category',
        limit: 50
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('E-commerce search results:');
      result.data.forEach(product => {
        const availability = product.inStock ? 'In Stock' : 'Out of Stock';
        console.log(`${product.name} - $${product.price} (${product.brand}) - ${availability}`);
      });
    }
  } catch (error) {
    console.error('E-commerce search failed:', error.message);
  }
}

// Example 7: User directory search
async function userDirectorySearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchValue: 'marketing',
        returnFields: 'displayName,email,profilePhoto,department,jobTitle',
        limit: 20
    })
  });

  const result = await response.json();
    
    if (result.success) {
      console.log('Employee directory search:');
      result.data.forEach(employee => {
        console.log(`${employee.displayName} - ${employee.jobTitle} (${employee.department})`);
      });
    }
  } catch (error) {
    console.error('User directory search failed:', error.message);
  }
}

// Example 8: Content management search
async function contentSearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        searchValue: 'firebase tutorial',
        returnFields: 'title,excerpt,author.name,publishedAt,featuredImage,category',
        limit: 15
    })
  });

  const result = await response.json();
    
    if (result.success) {
      console.log('Content search results:');
      result.data.forEach(article => {
        const publishDate = new Date(article.publishedAt).toLocaleDateString();
        console.log(`"${article.title}" by ${article.author.name} - ${publishDate}`);
      });
    }
  } catch (error) {
    console.error('Content search failed:', error.message);
  }
}

// Example 9: Search with error handling and retry logic
async function searchWithErrorHandling(value, options = {}) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(getSearchURL('users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchValue: value,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error.message || 'Search failed');
      }

      console.log('Search successful:', result.meta);
      return result.data;

    } catch (error) {
      retryCount++;
      console.error(`Search attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('Max retries reached. Search failed permanently.');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Example 10: Reusable search function
async function searchFirestore(value, options = {}) {
  try {
    const response = await fetch(getSearchURL('users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchValue: value,
        ...options
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        data: result.data,
        meta: result.meta,
        success: true
      };
    } else {
      return {
        error: result.error,
        success: false
      };
    }
  } catch (error) {
    return {
      error: { message: error.message, code: 'NETWORK_ERROR' },
      success: false
    };
  }
}

// Example usage of the reusable function
async function demonstrateReusableFunction() {
  // Search for users (assuming extension is configured for users collection)
  const userResults = await searchFirestore(
    'john',
    { 
      returnFields: 'name,email,profileImage',
      limit: 10,
      caseSensitive: false 
    }
  );

  if (userResults.success) {
    console.log('Found users:', userResults.data.length);
  } else {
    console.error('User search failed:', userResults.error.message);
  }

  // Another search with different parameters
  const moreResults = await searchFirestore(
    'wireless',
    { 
      returnFields: 'title,price,brand',
      limit: 25 
    }
  );

  if (moreResults.success) {
    console.log('Found more results:', moreResults.data.length);
  } else {
    console.error('Second search failed:', moreResults.error.message);
  }
}

// Example 11: Array field search
async function arrayFieldSearch() {
  try {
    const response = await fetch(getSearchURL('users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchValue: 'tutorial',
        returnFields: 'title,tags,categories,publishedAt',
        limit: 20
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Articles with "tutorial" in arrays:');
      result.data.forEach(article => {
        console.log(`- ${article.title} (Tags: ${article.tags?.join(', ') || 'None'})`);
      });
    }
  } catch (error) {
    console.error('Array field search failed:', error.message);
  }
}

// Example 12: Rate limiting test
async function testRateLimit() {
  console.log('Testing rate limiting...');
  
  for (let i = 1; i <= 65; i++) {
    try {
      const response = await fetch(getSearchURL('users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchValue: 'test',
          limit: 1
        })
      });

      const result = await response.json();
      const remaining = response.headers.get('X-RateLimit-Remaining');
      
      console.log(`Request ${i}: Status ${response.status}, Remaining: ${remaining}`);
      
      if (response.status === 429) {
        console.log('Rate limit exceeded!');
        console.log('Error:', result.error.message);
        console.log('Retry after:', result.error.retryAfter, 'seconds');
        break;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Request ${i} failed:`, error.message);
    }
  }
}

// Export functions for use in other files or testing
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
    basicSearch,
    searchWithDefaultFields,
    fuzzySearchDemo,
    sortedSearchDemo,
    searchWithReturnFields,
    caseSensitiveSearch,
    nestedFieldSearch,
    getRequestExample,
    ecommerceProductSearch,
    userDirectorySearch,
    contentSearch,
    searchWithErrorHandling,
    searchFirestore,
    demonstrateReusableFunction,
    arrayFieldSearch,
    testRateLimit
  };
}

// Run examples if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  console.log('Running Firestore Search Extension examples...\n');
  
  // Uncomment the examples you want to test
  // basicSearch();
  // searchWithReturnFields();
  // caseSensitiveSearch();
  // nestedFieldSearch();
  // getRequestExample();
  // ecommerceProductSearch();
  // userDirectorySearch();
  // contentSearch();
  // demonstrateReusableFunction();
  // arrayFieldSearch();
}