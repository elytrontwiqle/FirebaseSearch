# Changelog

All notable changes to the Firestore Search Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-09-17

### 🚀 Major Release - API v2 with Enhanced Features

This is a major version release introducing the new v2 API with significant enhancements while maintaining full backward compatibility.

### Added
- **🆕 API v2**: New `/v2/{collectionName}` endpoints with enhanced features
  - **Enhanced Metadata**: Richer response metadata with performance and security information
  - **User Context**: Expanded user information including custom claims
  - **Feature Detection**: API capabilities exposed in response metadata
  - **Performance Metrics**: Search optimization status and configuration details
  - **Security Context**: Authentication and access control information

### API Version Support
- **v2 (New)**: Enhanced API with JWT authentication, improved metadata and user context
- **Legacy**: Original API for backward compatibility (no JWT support)

**Note**: This v2.0.0-beta deployment only includes v2 and legacy APIs. Users with existing v1.x installations will continue to have their v1 API available independently. JWT authentication is exclusively a v2 feature.

### v2 API Features
- **🔐 Integrated JWT Authentication**: Seamless Firebase ID token validation
- **📊 Rich Metadata**: Comprehensive response metadata including:
  - API feature capabilities
  - Performance optimization status
  - Security configuration details
  - Enhanced user context with custom claims
- **🎯 Future-Ready**: Foundation for advanced features like user-specific filtering
- **⚡ Performance Optimized**: Enhanced query optimization and caching strategies

### Enhanced Response Format (v2)
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "apiVersion": "v2",
    "features": {
      "supportsJwtAuthentication": true,
      "supportsUserContext": true,
      "supportsEnhancedMetadata": true
    },
    "performance": {
      "searchOptimized": true,
      "fuzzySearchEnabled": true,
      "rateLimitingEnabled": true
    },
    "security": {
      "jwtAuthenticationEnabled": true,
      "collectionRestricted": true,
      "fieldRestricted": true
    },
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "emailVerified": true,
      "customClaims": {}
    }
  }
}
```

### Migration Guide
- **Existing Applications**: Continue using v1 or legacy endpoints (no changes required)
- **New Applications**: Use v2 endpoints for enhanced features
- **Gradual Migration**: Migrate endpoints individually at your own pace

### Beta Release Notes
- This is a beta release for testing and feedback
- Production deployments should continue using v1.5.0 stable
- Report issues and feedback for v2 API improvements

## [1.5.0] - 2025-09-17

### Added
- **🔐 JWT Authentication Support**: Optional JWT token validation for secure API access
  - **Configurable Security**: New `REQUIRE_JWT_AUTHENTICATION` parameter to enable/disable JWT validation
  - **Firebase ID Token Integration**: Uses Firebase Admin Auth for native token validation
  - **Bearer Token Format**: Standard `Authorization: Bearer <token>` header support
  - **Backward Compatibility**: When disabled, API works exactly as before (default: disabled)
  - **User Context**: Authenticated requests include user information in response metadata

### Security Features
- **Firebase Native**: Leverages Firebase ID tokens - no custom JWT implementation needed
- **Comprehensive Validation**: Handles token expiration, revocation, and format validation
- **Detailed Error Responses**: Specific error codes for different authentication failures
  - `NO_TOKEN`: Missing authentication token
  - `TOKEN_EXPIRED`: Token has expired
  - `TOKEN_REVOKED`: Token has been revoked
  - `INVALID_TOKEN`: Invalid token format or signature
  - `PROJECT_ERROR`: Firebase project configuration issues

### Technical Implementation
- **Zero Breaking Changes**: Existing APIs continue working when JWT is disabled
- **Enhanced CORS**: Updated CORS headers to support Authorization header
- **User Metadata**: Authenticated responses include user UID, email, and verification status
- **Performance Optimized**: Uses Firebase Admin SDK's built-in token validation
- **Audit Logging**: Authenticated requests log user information for security tracking

### Configuration
- **Easy Setup**: Single boolean parameter to enable secure mode
- **Flexible Deployment**: Can be enabled/disabled per extension installation
- **Professional Security**: Enterprise-ready authentication for production APIs

### Benefits
- **Secure APIs**: Protect sensitive data with Firebase authentication
- **User-Specific Access**: Foundation for user-based permissions and filtering
- **Compliance Ready**: Meets security requirements for regulated industries
- **Developer Friendly**: Simple Bearer token authentication that works with all HTTP clients

## [1.4.0] - 2025-09-12

### Added
- **🔄 API Versioning**: Comprehensive API versioning system for future-proof development
  - **Versioned Endpoints**: New `/v1/{collectionName}` URL format (recommended for new applications)
  - **Legacy Support**: Backward compatibility with existing `/{collectionName}` format
  - **Version Validation**: Automatic validation of API versions with detailed error messages
  - **Response Metadata**: Version information included in all API responses (`version` and `isVersioned` fields)
  - **Future-Ready**: Framework for introducing breaking changes in future versions (v2, v3, etc.)

### Features
- **Seamless Migration**: Existing applications continue to work without changes
- **Gradual Adoption**: Developers can migrate to versioned endpoints at their own pace
- **Clear API Evolution**: Explicit versioning makes API changes transparent and predictable
- **Version-Specific Features**: Framework for version-specific functionality and configurations

### Documentation
- **Comprehensive Updates**: All documentation updated to reflect versioning system
  - Updated README.md with versioning examples and migration guide
  - Enhanced SEARCH_EXTENSION_README.md with version-specific usage patterns
  - Improved POSTINSTALL.md with versioned endpoint examples
  - Updated examples/basic-usage.js with versioning demonstration
- **Migration Guide**: Clear guidance for adopting versioned endpoints
- **Best Practices**: Recommendations for version selection and future-proofing

### Technical Details
- **URL Structure**: Support for both `/v1/{collection}` and `/{collection}` formats
- **Version Detection**: Automatic parsing and validation of version information from URLs
- **Error Handling**: New `UNSUPPORTED_VERSION` error code for invalid versions
- **Backward Compatibility**: Zero breaking changes - all existing functionality preserved
- **Response Format**: Enhanced metadata with version tracking

### Benefits for Developers
- **Future-Proof Applications**: Prepare for future API changes without disruption
- **Controlled Migration**: Update applications on your timeline
- **Clear Versioning**: Know exactly which API version you're using
- **Stable Development**: Confidence in API stability and evolution path

## [1.3.1] - 2025-09-10

### Changed
- **🎯 Simplified API Endpoints**: Streamlined custom domain support to use only `/api/search/**` pattern
  - Removed alternative `/search/**` endpoint for cleaner, more consistent API structure
  - Updated all documentation to reflect single endpoint pattern

### Documentation
- **📚 Comprehensive Documentation Updates**: Updated all documentation files for custom domain support
  - Enhanced POSTINSTALL.md with complete Firebase Hosting integration guide
  - Updated SEARCH_EXTENSION_README.md with custom domain examples and setup instructions
  - Improved SEARCH_EXTENSION_SUMMARY.md with v1.3.0+ features overview
  - Updated examples/basic-usage.js with custom domain URL options
  - Enhanced EXTENSION_DEPLOYMENT_GUIDE.md with new feature information
  - Ensured consistent documentation across all files

### Technical Details
- **Consistent API Structure**: All custom domain configurations now use `/api/search/**` pattern only
- **Improved User Experience**: Cleaner documentation with step-by-step setup guides
- **Better Examples**: Updated code examples to show both default and custom domain usage patterns

## [1.3.0] - 2025-09-10

### Added
- **🌐 Custom Domain Support**: Enable custom domains for Firebase Functions via Firebase Hosting
  - Added Firebase Hosting configuration with URL rewrites in `firebase.json`
  - Support for `/api/search/**` endpoint pattern
  - Automatic CORS headers configuration for API endpoints
  - Professional landing page with API documentation at domain root

### Features
- **Branded API URLs**: Use your own domain instead of default Firebase Functions URLs
  - Example: `https://yourdomain.com/api/search/products` instead of `https://us-central1-project.cloudfunctions.net/ext-firestore-search-extension-searchCollectionHttp/products`
- **Automatic SSL**: Firebase manages SSL certificates for custom domains
- **Same Performance**: Custom domain routing maintains full Firebase Functions performance
- **Easy Setup**: Simple three-step process to enable custom domains

### Documentation
- **Setup Guide**: Comprehensive custom domain setup instructions in README
- **API Landing Page**: Professional documentation page served at custom domain root
- **Usage Examples**: Updated examples showing both default and custom domain URLs

### Technical Details
- **URL Rewrites**: Firebase Hosting rewrites route custom domain requests to extension functions
- **CORS Support**: Proper CORS headers for cross-origin API requests
- **Backward Compatibility**: Default Firebase Functions URLs continue to work alongside custom domains

## [1.2.3] - 2025-01-28

### Added
- **🏷️ Search Category Tag**: Added `search` tag to extension.yaml for proper categorization in Firebase Extensions Hub
  - Extension will now appear under the "Search" category
  - Improves discoverability for users looking for search solutions

## [1.2.2] - 2025-01-28

### Added
- **🔍 Enhanced Debugging**: Comprehensive logging for search troubleshooting
  - Document-level field checking with detailed logs for first 3 documents
  - Field value logging to identify data structure issues
  - Match detection logging to trace search logic
  
- **🛡️ Bulletproof Fallback**: Automatic fallback search mechanism
  - If optimized query returns no results, automatically tries simple collection scan
  - Ensures search results are found even if query optimization fails
  - Separate fallback logic with independent error handling

### Improved
- **Search Reliability**: Multiple layers of search logic to ensure results are found
- **Debugging Capabilities**: Detailed logging to identify why searches might fail
- **Error Recovery**: Graceful fallback when optimized queries don't work as expected

### Technical Details
- **Debug Logging**: Shows field values, search comparisons, and match results for first 3 documents
- **Fallback Strategy**: Tries simple collection scan (limit 100 docs) if optimized query returns 0 results
- **Error Isolation**: Fallback errors don't affect main search logic

## [1.2.1] - 2025-01-28

### Fixed
- **🐛 Search Results Bug**: Fixed issue where optimized range queries were not finding results
  - Range queries now only used for case-sensitive searches (exact matches)
  - Case-insensitive searches properly fall back to collection scan with fuzzy matching
  - Added enhanced debugging logs to help troubleshoot search issues
- **Query Logic**: Improved query selection criteria for better reliability
  - Increased minimum search length for range queries from 2 to 3 characters
  - More conservative approach to using optimized queries vs. collection scans

### Technical Details
- **Root Cause**: Range queries (`>=`, `<`) only work for exact case matches in Firestore
- **Solution**: Restrict range queries to case-sensitive searches only
- **Fallback**: Case-insensitive searches use collection scan with proper fuzzy matching
- **Debug Logging**: Added search configuration logging for troubleshooting

## [1.2.0] - 2025-01-28

### Added
- **🚀 Performance Optimization**: Major performance improvements for search operations
  - **Intelligent Query Optimization**: Uses range queries instead of full collection scans when possible
  - **Automatic Index Recommendations**: Provides detailed index creation guidance during installation
  - **Performance Monitoring**: Real-time performance metrics and slow query warnings
  - **Smart Query Strategy**: Automatically chooses between optimized queries and limited scans
- **📊 Performance Metrics**: Comprehensive logging of search performance
  - Query execution time tracking
  - Document scan vs. result ratio analysis
  - Automatic warnings for queries taking >1 second
  - Index recommendations for slow queries

### Improved
- **Query Efficiency**: Reduced document scanning by up to 90% with proper indexes
- **Response Times**: Potential 5-10x speed improvement with recommended indexes
- **Resource Usage**: Lower Firestore read costs through optimized queries
- **Monitoring**: Enhanced logging for performance troubleshooting

### Technical Details
- **Range Queries**: Uses `>=` and `<` operators for prefix matching when fuzzy search is disabled
- **Composite Indexes**: Supports sorting + filtering with proper index recommendations
- **Fallback Strategy**: Gracefully falls back to collection scan if optimized queries fail
- **Limited Scanning**: Caps collection scans to prevent timeouts (max 500 documents)

### Documentation
- **Performance Guide**: Added comprehensive performance optimization section to POSTINSTALL.md
- **Index Creation**: Step-by-step guide for creating recommended indexes
- **Monitoring**: Instructions for tracking performance via Cloud Functions logs

## [1.1.2] - 2025-01-28

### Fixed
- **URL Path Parsing**: Fixed collection name extraction from Firebase Functions URL structure
  - Improved `extractCollectionFromPath` function to handle Firebase Functions routing
  - Added debug logging to help troubleshoot path parsing issues
  - Now correctly extracts collection name from URLs like `/ext-{instanceId}-searchCollectionHttp/{collection}`
- **Documentation URLs**: Added `readmeUrl` to extension.yaml for proper documentation linking

### Technical Details
- Enhanced path parsing logic to handle both direct function calls and Firebase Functions routing
- Added comprehensive logging for debugging URL path issues
- Improved error handling for malformed URLs

## [1.1.1] - 2025-01-28

### Fixed
- **Return Fields Security**: Removed `returnFields` as a request parameter for enhanced security
  - Return fields are now configuration-only (set during installation)
  - Prevents users from accessing unauthorized fields via API requests
  - Maintains consistency with `searchableFields` approach
- **API Consistency**: All field access is now controlled by extension configuration
- **Documentation**: Updated all examples to remove `returnFields` parameter

### Changed
- **API Breaking Change**: `returnFields` parameter no longer accepted in requests
- **Security Model**: Return fields now locked at installation time like searchable fields

### Migration Guide
- **Remove `returnFields`**: Remove `returnFields` parameter from all API calls
- **Configure Return Fields**: Set desired return fields during extension installation/configuration
- **Update Client Code**: Remove any `returnFields` parameters from request bodies/query strings

## [1.1.0] - 2025-01-28

### Added
- **Dynamic Collection Selection**: Collections are now selected via URL path instead of configuration
  - New URL format: `/ext-firestore-search-extension-searchCollectionHttp/{collectionName}`
  - Examples: `/searchCollectionHttp/products`, `/searchCollectionHttp/users`
- **Multiple Collection Support**: Configure multiple searchable collections or allow all collections
  - New `SEARCHABLE_COLLECTIONS` parameter (comma-separated list, optional)
  - Leave empty to allow searching all collections (less secure but more flexible)
  - Specify collections to restrict access (more secure)
- **Collection Validation**: Comprehensive validation for collection access
  - Validates collection name format (alphanumeric, hyphens, underscores only)
  - Checks against configured allowed collections list
  - Verifies collection exists in Firestore
  - Returns detailed error messages for invalid collections

### Changed
- **URL Structure**: Breaking change - collection name now required in URL path
- **Configuration**: Replaced single `SEARCH_COLLECTION` with multiple `SEARCHABLE_COLLECTIONS`
- **Security Model**: Collection access now controlled by URL path + configuration instead of just configuration
- **Error Handling**: Added specific `INVALID_COLLECTION` error code for collection-related issues

### Removed
- **Single Collection Mode**: No longer supports configuring just one collection
- **Static Collection Configuration**: Collection is no longer hardcoded in configuration

### Migration Guide
- **URL Updates**: Update all API calls to include collection name in path
  - Old: `/searchCollectionHttp?searchValue=test`
  - New: `/searchCollectionHttp/products?searchValue=test`
- **Configuration**: Replace `SEARCH_COLLECTION` with `SEARCHABLE_COLLECTIONS` (comma-separated)
- **Security**: Review collection access - empty configuration now allows all collections

## [1.0.9] - 2025-01-28

### Added
- **Configurable Typo Tolerance**: New `FUZZY_SEARCH_TYPO_TOLERANCE` parameter allows users to configure the character-to-typo ratio for fuzzy search
  - Default: 4 characters per typo (maintains backward compatibility)
  - Configurable range: Any positive integer (minimum 1)
  - Lower values = stricter matching, higher values = more lenient matching
  - Examples: 3 = stricter (1 typo per 3 chars), 5 = more lenient (1 typo per 5 chars)

### Changed
- **Fuzzy Search Logic**: Updated to use configurable typo tolerance instead of hardcoded 4-character rule
- **Documentation**: Updated all documentation to reflect configurable typo tolerance feature

## [1.0.8] - 2025-01-28

### Fixed
- **Final Deployment**: Guaranteed deployment with all sorting and rate limiting fixes
- **Version Increment**: Ensure clean deployment without version conflicts

## [1.0.7] - 2025-01-28

### Fixed
- **Force Deploy**: Ensure all sorting and rate limiting fixes are properly deployed
- **Guaranteed Implementation**: Version bump to force deployment of all recent changes
  - Sorting logic with proper string trimming and case handling
  - Correct meta data in response (sortBy and direction)
  - Improved rate limit error messages
  - Enhanced debug headers

### Technical Details
- This version ensures all previous fixes are properly deployed and active
- Sorting should now work correctly for ascending/descending order
- Meta data should accurately reflect sorting parameters
- Rate limiting should show improved error messages

## [1.0.6] - 2025-01-28

### Improved
- **Rate Limit Error Message**: Simplified and user-friendly error message
  - Changed from technical message to "Rate limit reached. Please wait before making more requests."
  - Added structured `details` object with limit and retry information
  - Removed confusing external service references
- **Rate Limit Debugging**: Enhanced rate limit headers for better debugging
  - Added `X-RateLimit-Window` header showing time window
  - Added `X-RateLimit-Current` header showing current request count
  - Better visibility into rate limiting behavior

### Technical Details
- Rate limit error now returns structured response with clear message
- Additional debug headers help identify rate limiting issues
- Maintains existing rate limiting logic and thresholds
- Improved error response format for better client handling

## [1.0.5] - 2025-01-28

### Fixed
- **String Sorting Improvement**: Enhanced string comparison in sorting logic
  - Added `.trim()` to remove leading/trailing whitespace before comparison
  - Improved consistency between values like `"Mhlanga"` vs `"Mhlanga "` (with trailing space)
  - Better handling of mixed case values in sorting (case-insensitive comparison)
  - Ensures proper ascending/descending order for string fields

### Technical Details
- String values are now trimmed and converted to lowercase before comparison
- Mixed type values are also trimmed when converted to strings
- Maintains existing null/undefined handling (placed at end)
- Preserves numeric and date sorting behavior

## [1.0.4] - 2025-01-28

### Fixed
- **Sorting Bug**: Fixed critical sorting issue where results were not properly sorted
  - Moved sorting logic to occur before data transformation instead of after
  - Sorting now works correctly with original Firestore data types
  - Results are now properly sorted alphabetically/numerically as expected
- **Data Flow**: Corrected the order of operations: Search → Sort → Transform (was Search → Transform → Sort)

### Technical Details
- Sorting now accesses original Firestore field values before transformation
- Maintains proper null/undefined handling (placed at end)
- Preserves case-insensitive string sorting and proper numeric/date sorting
- Data transformation still occurs after sorting to provide clean JSON output

## [1.0.3] - 2025-01-28

### Fixed
- **Function Naming Issue**: Fixed deployment error caused by dynamic function naming
  - Changed from `search${param:SEARCH_COLLECTION}Http` to static `searchCollectionHttp`
  - Resolves Cloud Functions deployment error with parameter substitution in resource names
- **Icon Configuration**: Added `icon.png` configuration to extension.yaml
- **Contact Information**: Updated author and contributor email to `buyiledmhlanga@gmail.com`

### Changed
- **Endpoint URL**: Function endpoint is now consistently named `searchCollectionHttp`
- **Documentation**: Updated all documentation to reflect static endpoint naming
- **Multiple Instances**: Clarified how multiple extension instances work with unique instance IDs

### Breaking Changes
- **Endpoint Name**: The function endpoint is now always `searchCollectionHttp` instead of dynamic collection-based naming
- **Migration**: If upgrading from previous versions, update your API calls to use the new static endpoint name

## [1.0.2] - 2025-01-28

### Added
- **Result Sorting**: Sort search results by any field with ascending/descending options
  - `sortBy` parameter: Field name to sort by (supports nested fields with dot notation)
  - `direction` parameter: Sort direction (`asc`, `desc`, `ascending`, `descending`)
  - Intelligent handling of null/undefined values (placed at end)
  - Mixed data type support with consistent string comparison
  - Case-insensitive string sorting by default
  - Proper numeric and date value sorting
- Enhanced response metadata with sorting information (`sortBy` and `direction` fields)

### Improved
- API documentation updated with sorting examples
- Usage examples enhanced with sorting demonstrations
- Response format documentation includes sorting metadata

## [1.0.1] - 2025-01-28

### Added
- Intelligent fuzzy search with typo tolerance (1 typo per 4 characters)
- Automatic data transformation for clean JSON output:
  - Firestore Timestamps converted to UTC ISO strings
  - Firestore DocumentReferences converted to database paths
- Configurable default return fields during installation
- Per-origin rate limiting with configurable limits
- Dynamic endpoint naming based on collection (e.g., `searchUsersHttp` for `users` collection)
- Enhanced security with pre-configured searchable fields (no longer accepted as request parameters)

### Changed
- Extension now HTTP-only (removed callable function for better REST API focus)
- Searchable fields are now configuration-only (cannot be overridden via API requests)
- Improved error handling with `RATE_LIMIT_EXCEEDED` error code
- Enhanced documentation with comprehensive feature descriptions

### Removed
- Callable function interface (`searchCollection`)
- Detailed logging feature (simplified for better performance)
- Client-side searchable fields parameter (security enhancement)

### Fixed
- Repository URLs corrected to point to proper GitHub location
- Extension metadata updated for accurate publication information

## [1.0.0] - 2024-01-15

### Added
- Initial release of Firestore Search Extension
- Configurable search functionality for Firestore collections
- Support for multiple searchable fields (comma-separated)
- Configurable return fields (optional, returns all if not specified)
- Nested field support using dot notation (e.g., `user.profile.name`)
- Array field search capability
- Case-sensitive and case-insensitive search options
- Configurable search result limits (default: 50, max: 1000)
- Two interface options:
  - Callable function (`searchCollection`) for Firebase SDK usage
  - HTTP endpoint (`searchCollectionHttp`) for REST API access
- Comprehensive input validation and error handling
- Structured error responses with error codes:
  - `VALIDATION_ERROR`: Invalid input parameters
  - `PERMISSION_DENIED`: Insufficient permissions
  - `NOT_FOUND`: Collection or document not found
  - `QUOTA_EXCEEDED`: Rate limits exceeded
  - `METHOD_NOT_ALLOWED`: Invalid HTTP method
  - `INTERNAL_ERROR`: General server errors
- CORS support for web applications
- Extension lifecycle event handlers:
  - Installation handler
  - Update handler
  - Configuration handler
- Configurable extension parameters:
  - Cloud Functions deployment location
  - Default and maximum search limits
  - Case sensitivity default setting
  - Allowed collections restriction
  - Detailed logging toggle
- Security features:
  - Collection access control (optional whitelist)
  - Input sanitization and validation
  - Field name format validation
- Performance optimizations:
  - Configurable result limits
  - Efficient field filtering
  - Optional detailed logging
- Comprehensive documentation:
  - Pre-installation guide
  - Post-installation guide
  - API reference
  - Usage examples
  - Troubleshooting guide
- Test suite with validation tests
- Deployment automation script

### Security
- Input validation for all parameters
- Collection name format validation
- Field name format validation
- Optional collection access restriction
- Proper error handling without information leakage

### Performance
- Configurable search limits to prevent performance issues
- Efficient nested field access
- Optional return field filtering
- Optimized Firestore queries

### Documentation
- Complete API reference
- Multiple usage examples
- Security considerations
- Performance guidelines
- Troubleshooting guide
- Extension configuration documentation

## [Unreleased]

### Planned Features
- Full-text search integration
- Search result ranking and scoring
- Pagination support for large result sets
- Search analytics and metrics
- Custom search operators (AND, OR, NOT)
- Fuzzy search capabilities
- Search result caching
- Bulk search operations
- Search history and suggestions
- Integration with Firebase ML for semantic search

### Potential Improvements
- Enhanced error messages with suggestions
- More granular permission controls
- Custom field transformers
- Search result highlighting
- Performance monitoring integration
- Advanced filtering options
- Search query optimization
- Multi-language search support

---

## Version History

- **1.0.0**: Initial release with core search functionality
- **Future versions**: Will include enhanced features and improvements based on user feedback

## Migration Guide

### From Custom Search Implementation
If you're migrating from a custom Firestore search implementation:

1. Install the extension following the pre-installation guide
2. Update your client code to use the extension functions
3. Configure the extension parameters to match your current setup
4. Test thoroughly with your existing data
5. Update security rules if necessary

### Breaking Changes
None in this initial release.

## Support

For questions about specific versions or migration help:
- Check the documentation for your version
- Review the examples in the repository
- File issues on GitHub with version information
