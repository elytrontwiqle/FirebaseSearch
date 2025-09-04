# Changelog

All notable changes to the Firestore Search Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
