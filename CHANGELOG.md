# Changelog

All notable changes to the Firestore Search Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
