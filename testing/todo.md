# Testing Suite TODO - Critical Improvements

## Phase 1: Foundation Setup (Week 1)

### 1. Directory Restructure (Critical First Step) ✅ COMPLETED
- [x] **Create New Directory Structure**
  ```
  testing/
  ├── api/                    # API & Service Layer Tests
  │   ├── unit/              # Pure API logic tests
  │   ├── integration/       # API context integration tests
  │   └── real/             # Real API integration tests
  ├── ui/                    # Component & Screen Tests
  │   ├── components/       # Individual component tests
  │   ├── screens/          # Full screen tests
  │   ├── navigation/       # Navigation flow tests
  │   └── accessibility/    # A11y tests
  ├── build/                 # Build & Infrastructure Tests
  ├── fixtures/              # Test data & assets
  ├── utils/                 # Test utilities
  ├── __mocks__/            # Global mocks
  ├── config/               # Test configurations
  └── scripts/              # Test automation scripts
  ```

- [x] **Move Existing Tests to New Structure**
  - Move `unit/api.*.test.ts` → `testing/api/unit/`
  - Move `integration/api.*.test.ts` → `testing/api/integration/`
  - Move `__tests__/api.*.test.ts` → `testing/api/unit/`
  - Update all import paths in moved files

- [x] **Configure Separate Jest Configs**
  - Create `testing/config/jest.api.config.js`
  - Create `testing/config/jest.ui.config.js`
  - Create `testing/config/jest.build.config.js`
  - Update package.json scripts

## High Priority - Security & Reliability

### 2. Network & API Error Handling ✅ COMPLETED
- [x] **HTTP 401/403 Authentication Failures**
  - Test bearer token expiration scenarios
  - Test invalid API key responses
  - Test permission denied scenarios

- [x] **HTTP 429 Rate Limiting**
  - Test rate limit exceeded responses
  - Test retry logic with backoff

- [x] **HTTP 502/503 Server Errors**
  - Test server unavailable scenarios
  - Test gateway timeout responses

- [x] **Network Timeouts**
  - Test request timeout handling
  - Test connection timeout scenarios

- [x] **Malformed JSON Responses**
  - Test invalid JSON syntax
  - Test incomplete JSON responses
  - Test unexpected response structure

### 3. Concurrent Operations & Race Conditions ✅ COMPLETED
- [x] **Multiple Screen Data Fetching**
  - Test simultaneous API calls for different screens
  - Test cache conflicts during concurrent writes
  - Test loading state management with concurrent operations

- [x] **Cache Corruption During Writes**
  - Test interrupted file writes
  - Test concurrent cache operations
  - Test file locking scenarios

- [x] **Image Download Competition**
  - Test multiple downloads of same image
  - Test cache invalidation during downloads
  - Test partial download recovery

- [x] **Version Check Race Conditions**
  - Test version checks during active syncing
  - Test cache wipe during ongoing operations

### 4. Image Processing Edge Cases ✅ COMPLETED
- [x] **CDN Complete Failure**
  - Test all image extensions failing
  - Test fallback to assets endpoint
  - Test graceful degradation when no images available

- [x] **Disk Space & Memory Issues**
  - Test disk space exhaustion during downloads
  - Test large image file handling
  - Test memory pressure scenarios

- [x] **Image File Corruption**
  - Test partial downloads
  - Test corrupted image files
  - Test invalid file formats

- [x] **File System Permissions**
  - Test cache directory permission errors
  - Test read-only filesystem scenarios

## Medium Priority - Data Integrity

### 5. Data Validation & Schema Compliance ✅ COMPLETED
- [x] **Required Field Validation**
  - Test missing required fields in API responses
  - Test null/undefined critical fields
  - Test empty arrays vs null collections

- [x] **Data Type Validation**
  - Test string vs number ID mismatches
  - Test invalid date format handling
  - Test boolean field type coercion

- [x] **Content Validation**
  - Test UTF-8/emoji handling in text fields
  - Test extremely long strings
  - Test special characters in file names
  - Test HTML/script injection in content

### 6. Cache Corruption & Recovery ✅ COMPLETED
- [x] **File System Corruption**
  - Test truncated JSON files
  - Test corrupted cache directory structure
  - Test cache recovery mechanisms

- [x] **Data Consistency**
  - Test image paths vs cached data sync
  - Test version file corruption
  - Test partial cache states

### 7. Sync Logic Edge Cases ✅ COMPLETED
- [x] **Timestamp Edge Cases**
  - Test null vs undefined timestamps
  - Test timezone handling
  - Test daylight saving time transitions
  - Test future timestamps

- [x] **Large Dataset Syncing**
  - Test syncing with 1000+ items
  - Test memory usage during large syncs
  - Test partial sync failure recovery

### 8. Real API Integration Tests
> **Setup Required**: Create `testing/integration-real/` directory and configure staging environment

- [ ] **Environment Configuration**
  - Add `TEST_API_URL` and `TEST_API_KEY` environment variables
  - Create separate test runner: `npm run test:real-api`
  - Configure CI/CD to run against staging only
  - Add safety checks to prevent production testing

- [ ] **Critical API Endpoint Validation**
  - Test all SCREEN_CONFIGS endpoints return valid data
  - Test authentication with real bearer tokens
  - Test update endpoint `/items/update/` returns proper timestamps
  - Validate response schemas match TypeScript interfaces

- [ ] **CDN & Image Integration**
  - Test actual CDN image downloads from `CDN_URL`
  - Test fallback to `/assets/` endpoint when CDN fails
  - Test image extension detection (.jpg, .jpeg, .png)
  - Verify cached image paths match actual downloaded files

- [ ] **Real Data Edge Cases**
  - Test with actual production-like content (UTF-8, long strings)
  - Test image names with special characters
  - Test collection endpoints with realistic dataset sizes
  - Verify date format consistency across all endpoints

- [ ] **Network Condition Testing**
  - Test with simulated slow connections
  - Test timeout handling with real network delays
  - Test partial response scenarios
  - Test intermittent connection failures

**Implementation Notes:**
```typescript
// testing/integration-real/api.real.test.ts
describe('Real API Integration', () => {
  beforeAll(() => {
    if (!process.env.TEST_API_URL || process.env.TEST_API_URL.includes('production')) {
      throw new Error('TEST_API_URL must be set to staging environment');
    }
  });
  
  it('should validate all screen config endpoints', async () => {
    for (const [screenName, config] of Object.entries(SCREEN_CONFIGS)) {
      const data = await fetchFullData(config.endpoint);
      expect(data).toBeTruthy();
      // Add schema validation based on isCollection flag
    }
  });
});
```

## Low Priority - User Experience

### 9. Performance & Memory
- [ ] **Memory Leak Testing**
  - Test repeated fetch/cache cycles
  - Test image cache memory usage
  - Test large dataset processing

- [ ] **Performance Benchmarks**
  - Test sync performance with realistic data sizes
  - Test image processing performance
  - Test cache read/write performance

### 10. Real-World Data Scenarios
- [ ] **Create Realistic Test Fixtures**
  - Add actual-sized content from production
  - Include edge case content (very long descriptions, special characters)
  - Test with real image files and sizes

- [ ] **Content Edge Cases**
  - Test markdown/rich text in content fields
  - Test URLs and links in content
  - Test multilingual content

## Critical Missing Tests

### 11. React Context Integration Tests
- [ ] **Context Provider Error Handling**
  - Test context error boundaries
  - Test loading state consistency
  - Test error recovery flows

- [ ] **State Management**
  - Test context state updates during errors
  - Test component re-rendering with error states
  - Test context cleanup on unmount

- [ ] **Hook Integration**
  - Test custom hooks with real async operations
  - Test hook error propagation
  - Test hook loading states

### 12. End-to-End Test Suite
- [ ] **Create E2E Test Directory**
  - Add `testing/e2e/` directory
  - Test full application flows
  - Test offline/online transitions

- [ ] **User Journey Tests**
  - Test complete data fetch -> display -> update cycles
  - Test app startup with various cache states
  - Test network connectivity changes

## Directory Structure Improvements

### 13. Test Organization
- [ ] **Create `testing/fixtures/`**
  - Add realistic test data files
  - Add sample image files for testing
  - Add various API response scenarios

- [ ] **Create `testing/utils/`**
  - Add test helper functions
  - Add mock factories
  - Add assertion helpers

- [ ] **Create `testing/e2e/`**
  - Add end-to-end test files
  - Add integration with real file system
  - Add performance benchmarks

## Implementation Priority

1. **Start with Network Error Handling** - Most likely to catch production bugs
2. **Add Data Validation Tests** - Prevent data corruption issues  
3. **Implement Race Condition Tests** - Critical for multi-user scenarios
4. **Setup Real API Integration Tests** - Catch schema changes and authentication issues early
5. **Create Real-World Fixtures** - Improve test realism
6. **Add Context Integration Tests** - Test actual application logic
7. **Build E2E Test Suite** - Catch integration issues

## Notes

- All new tests should include both success and failure scenarios
- Use realistic data sizes and content in tests
- Mock external dependencies but test integration points
- Add performance assertions where appropriate
- Document any test data requirements or setup needs

### Getting Started with Real API Tests

**Quick Start:**
1. Create `.env.test` file with staging credentials
2. Add `testing/integration-real/api.real.test.ts` with endpoint validation
3. Add `npm run test:real-api` script to `package.json`
4. Start with testing 2-3 critical endpoints
5. Run in CI/CD against staging environment only

**Safety First:**
- Never commit API keys to repository
- Use environment variables for all credentials
- Add explicit checks to prevent production testing
- Run real API tests separately from unit tests (different npm script)

---

# Mobile App Component & Screen Testing

## High Priority - Critical User Flows

### 14. Navigation & Routing Tests
- [ ] **Tab Navigation**
  - Test tab switching between home/guide/map/report/donate
  - Test deep navigation to guides (wildflowers, birds, etc.)
  - Test back navigation from nested screens
  - Test router.push() calls in components

- [ ] **Screen Transitions** 
  - Test screen mounting/unmounting without crashes
  - Test navigation parameter passing (e.g., guide categories)
  - Test navigation state persistence

### 15. Component Rendering & Loading States
- [ ] **Screen Rendering Tests**
  - Test each major screen renders without crashing
  - Test loading states while data is fetching
  - Test error states when API calls fail
  - Test empty states when no data available

- [ ] **Critical Components**
  - Test GuideListScreen with filters and data
  - Test HomeScreen button interactions
  - Test guide card rendering with images
  - Test modal components (detail modal, image zoom)

### 16. API Context Integration
- [ ] **useScreen Hook Integration**
  - Test loading states with real useScreen hook
  - Test error handling when API context fails
  - Test data updates trigger component re-renders
  - Test multiple components using same screen data

- [ ] **Real Data Scenarios**
  - Test components with empty arrays vs null data
  - Test image path resolution in components
  - Test filter functionality with real data structures
  - Test component behavior during data refetching

### 17. User Interaction Testing
- [ ] **Touch & Press Events**
  - Test all TouchableOpacity components respond correctly
  - Test haptic feedback triggers (Haptics.impactAsync)
  - Test button disabled states during loading
  - Test swipe gestures and scroll interactions

- [ ] **Filter & Search Functionality**
  - Test filter chips in GuideListScreen
  - Test color/season filtering logic
  - Test search results update correctly
  - Test filter reset functionality

- [ ] **Modal & Overlay Interactions**
  - Test modal open/close animations
  - Test backdrop press dismissal
  - Test modal content scrolling
  - Test zoomable image modal gestures

## Medium Priority - Error Handling & UX

### 18. Error Boundaries & Crash Prevention
- [ ] **Component Error Boundaries**
  - Test components handle malformed data gracefully
  - Test error fallback UI renders correctly
  - Test error recovery after network restoration
  - Test component cleanup on unmount

- [ ] **Data Validation in Components**
  - Test components handle null/undefined props
  - Test image loading fallbacks
  - Test missing API data scenarios
  - Test component behavior with corrupt cache data

### 19. Performance & Memory
- [ ] **Large Dataset Handling**
  - Test FlatList performance with 100+ guide items
  - Test image loading in lists (lazy loading)
  - Test scroll performance with complex cards
  - Test memory usage during navigation

- [ ] **Animation Performance**
  - Test Reanimated animations don't block UI
  - Test complex screen transitions
  - Test concurrent animation performance
  - Test animation cleanup on navigation

### 20. Accessibility & Usability
- [ ] **Screen Reader Support**
  - Test all interactive elements have accessibility labels
  - Test screen reader navigation flow
  - Test important content is announced correctly
  - Test accessibility hints for complex interactions

- [ ] **Touch Target Sizes**
  - Test minimum touch target sizes (44x44pt)
  - Test button spacing prevents accidental taps
  - Test swipe areas are appropriately sized

## Implementation Approach

### Component Testing Strategy
```typescript
// testing/components/guide-list-screen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ApiProvider } from '@/contexts/api';
import GuideListScreen from '@/components/guide-list-screen';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ApiProvider>
    {children}
  </ApiProvider>
);

describe('GuideListScreen', () => {
  it('renders loading state initially', () => {
    const { getByTestId } = render(
      <GuideListScreen route={{ params: { screenName: 'guide_wildflower' } }} />,
      { wrapper: TestWrapper }
    );
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('filters data when filter chips are pressed', async () => {
    const { getByText, queryByText } = render(
      <GuideListScreen route={{ params: { screenName: 'guide_wildflower' } }} />,
      { wrapper: TestWrapper }
    );
    
    // Wait for data to load
    await waitFor(() => expect(queryByText('Loading')).toBeNull());
    
    // Test filtering
    fireEvent.press(getByText('Red'));
    // Assert filtered results
  });
});
```

### Navigation Testing Strategy
```typescript
// testing/navigation/navigation.test.tsx
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '@/app/(tabs)/home';

describe('Navigation Flow', () => {
  it('navigates to guide screen when guide button pressed', () => {
    const mockRouter = { push: jest.fn() };
    jest.mock('expo-router', () => ({ router: mockRouter }));
    
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Field Guides'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/guide');
  });
});
```

### Setup Required
- [ ] **Install React Native Testing Library**: `@testing-library/react-native`
- [ ] **Configure Jest for React Native**: Update jest.config.js
- [ ] **Add test IDs to components**: For reliable element selection
- [ ] **Mock navigation**: Mock expo-router and navigation
- [ ] **Mock native modules**: Haptics, StatusBar, etc.

### Test Priority Order
1. **Start with HomeScreen** - Simple navigation testing
2. **Add GuideListScreen** - Complex data/filtering logic  
3. **Test API Context integration** - Loading/error states
4. **Add Navigation flow tests** - Tab switching
5. **Component interaction tests** - Touch, modals, filters

---

# Directory Restructure & Automation Plan

## Immediate Next Steps (Week 1)

### 21. Directory Restructure
- [ ] **Create New Directory Structure**
  - Create `testing/api/` (move existing API tests)
  - Create `testing/ui/` (for component tests)
  - Create `testing/build/` (for build validation)
  - Create `testing/fixtures/` (test data)
  - Create `testing/utils/` (test helpers)

- [ ] **Move Existing Tests**
  - Move `unit/api.*.test.ts` → `testing/api/unit/`
  - Move `integration/api.*.test.ts` → `testing/api/integration/`
  - Move `__tests__/api.*.test.ts` → `testing/api/unit/`
  - Update all import paths

### 22. Build Testing Implementation
- [ ] **EAS Build Validation**
  - Add build success tests for iOS/Android
  - Test `eas build -p ios --local` completion
  - Test `eas build -p android --local` completion
  - Validate build artifacts and bundle size
  - Add build time performance monitoring

- [ ] **Dependency Health Monitoring**
  - Security vulnerability scanning (`npm audit`)
  - Outdated dependency detection
  - Peer dependency conflict checks
  - Bundle size regression detection

### 23. Test Automation & Scheduling
- [ ] **Package.json Script Organization**
  - `npm run test:fast` - Unit tests (< 2 min)
  - `npm run test:api` - API integration tests  
  - `npm run test:ui` - Component/screen tests
  - `npm run test:build` - Build validation tests
  - `npm run test:health` - Full weekly health check

- [ ] **GitHub Actions Workflows**
  - Weekly health check workflow
  - Monthly dependency update workflow
  - Build validation on staging environment
  - Automated failure notifications

## Long-term Maintenance Plan

### Monthly Schedule
- **Week 1**: Dependency updates and security patches
- **Week 2**: Performance monitoring and bundle analysis
- **Week 3**: Comprehensive API health checks
- **Week 4**: Build process validation and infrastructure updates

### Success Metrics
- **Build Success Rate**: 100%
- **API Test Coverage**: > 90%
- **UI Test Coverage**: > 80%
- **Security Vulnerabilities**: Zero high-severity

## Additional Tools Needed

Beyond Jest, you'll need:
- **@testing-library/react-native** - Component testing
- **npm-check-updates** - Dependency monitoring
- **webpack-bundle-analyzer** - Bundle size analysis
- **audit-ci** - Security scanning
- **GitHub Actions** - Automation & scheduling

## Implementation Priority
1. **Directory restructure** (immediate)
2. **Build testing setup** (week 1)
3. **Basic automation** (week 2)
4. **Full monitoring** (week 3)
5. **Monthly maintenance process** (ongoing)

See `testing/TESTING_STRATEGY.md` for complete implementation details.