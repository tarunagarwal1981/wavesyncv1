# Testing Setup Documentation

This document provides a comprehensive guide to the testing setup for the WaveSync application.

## Overview

The application has been configured with multiple testing layers to ensure code quality, reliability, and maintainability:

- **Unit Tests**: Jest + React Testing Library for component and utility testing
- **E2E Tests**: Playwright for end-to-end user journey testing
- **API Mocking**: MSW for realistic API mocking
- **Security Tests**: npm audit and Snyk for vulnerability scanning
- **Performance Tests**: Lighthouse CI for performance metrics
- **Accessibility Tests**: axe-core for WCAG compliance
- **Visual Regression**: Playwright screenshots for UI consistency

## Files Structure

```
├── jest.config.js                 # Jest configuration
├── jest.setup.js                  # Jest global setup
├── playwright.config.ts           # Playwright configuration
├── lighthouseci.js                # Lighthouse CI configuration
├── src/test-utils/                # Test utilities
│   ├── test-providers.tsx         # React providers for testing
│   ├── test-data.ts               # Mock data generators
│   ├── test-helpers.ts            # Common test functions
│   ├── supabase-mock.ts          # Supabase client mocking
│   └── setup.ts                   # Global test setup
├── src/components/__tests__/      # Component tests
├── src/lib/__tests__/             # Library/function tests
├── src/app/__tests__/             # App/route tests
├── e2e/(                         # End-to-end tests
│   ├── auth.spec.ts              # Authentication flows
│   ├── certificates.spec.ts      # Certificate management
│   ├── signoff.spec.ts           # Signoff checklist
│   ├── global-setup.ts           # E2E global setup
│   └── global-teardown.ts        # E2E global teardown
└── .github/workflows/test.yml     # CI/CD testing workflow
```

## Testing Scripts

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch mode)
npm run test:ci
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run E2E tests in headed mode
npm run test:e2e:headed

# Show E2E test report
npm run test:e2e:report
```

### Complete Test Suite
```bash
# Run all tests (unit + E2E)
npm run test:all

# Setup test environment
npm run test:setup
```

## Configuration Files

### Jest Configuration
- **jest.config.js**: Main Jest configuration with Next.js integration
- **jest.setup.js**: Global setup file with mocks and matchers

### Playwright Configuration
- **playwright.config.ts**: Browser and test configuration
- **e2e/global-setup.ts**: Authentication setup for E2E tests
- **e2e/global-teardown.ts**: Cleanup after E2E tests

### Lighthouse CI
- **lighthouseci.js**: Performance testing configuration
- Tests performance, accessibility, best practices, and SEO

## Test Utilities

### Mock Data (`src/test-utils/test-data.ts`)
Provides realistic mock data for all application entities:
- Users and profiles
- Certificates (valid, expiring, expired)
- Assignments and vessels
- Circulars and acknowledgments
- Tickets and travel bookings
- Signoff checklist items
- Notifications and dashboard data

### Test Helpers (`src/test-utils/test-helpers.ts`)
Utility functions for testing:
- Async operation helpers
- Storage mocking
- Media query mocking
- Event simulation
- Date manipulation utilities

### Supabase Mocking (`src/test-utils/supabase-mock.ts`)
Comprehensive Supabase client mocking:
- Authentication methods
- Database operations
- Query builder chaining
- Error simulation
- Success/error response helpers

### Test Providers (`src/test-utils/test-providers.tsx`)
React context providers for testing:
- Query client setup
- Theme provider
- Router provider
- Custom render function

## Example Tests

### Component Tests (`src/components/__tests__/CertificateCard.test.tsx`)
Demonstrates component testing best practices:
- Multiple variant testing
- Event handling verification
- Accessibility testing
- Edge case handling
- Mock integration

### Library Tests (`src/lib/__tests__/auth.test.ts`)
Shows utility function testing:
- Input validation testing
- Error handling
- API integration mocking
- Edge case coverage

### App Tests (`src/app/__tests__/dashboard.test.tsx`)
Route and page component testing:
- Data loading states
- Error handling
- User interaction flows
- Integration testing

## E2E Test Scenarios

### Authentication (`e2e/auth.spec.ts`)
Tests the complete authentication flow:
- Login/logout functionality
- Form validation
- Password reset
- Registration flow
- Session management

### Certificate Management (`e2e/certificates.spec.ts`)
Tests certificate-related functionality:
- Certificate listing and filtering
- Add/edit/delete operations
- Document management
- Expiry warnings
- Export functionality

### Signoff Checklist (`e2e/signoff.spec.ts`)
Tests the signoff workflow:
- Checklist completion
- Notes management
- Progress tracking
- Report generation
- Validation and confirmation

## CI/CD Integration

### GitHub Actions Workflow (`.github/workflows/test.yml`)
Comprehensive testing pipeline:
- **Unit Tests**: Jest tests with coverage
- **E2E Tests**: Playwright browser automation
- **Visual Regression**: UI consistency checks
- **Performance Tests**: Lighthouse CI metrics
- **Security Tests**: Vulnerability scanning
- **Accessibility Tests**: WCAG compliance
- **Compatibility Tests**: Multi-platform testing

### Matrix Testing
Tests across multiple configurations:
- Node.js versions (18, 20)
- Operating systems (Ubuntu, Windows, macOS)
- Browsers (Chromium, Firefox, WebKit)

## Coverage Requirements

The testing setup includes coverage requirements:
- Minimum 80% line coverage
- Minimum 75% function coverage
- Minimum 70% branch coverage
- Minimum 80% statement coverage

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: One concept per test
4. **Mock External Dependencies**: Use mocks for API calls
5. **Test Edge Cases**: Cover error conditions and edge cases

### Test Data
1. **Realistic Data**: Use faker.js for realistic test data
2. **Consistent Mocks**: Use consistent mock implementations
3. **Isolated Tests**: Each test should be independent
4. **Cleanup**: Clean up after each test

### E2E Testing
1. **User-Focused**: Test actual user workflows
2. **Realistic Scenarios**: Use real-world test scenarios
3. **Wait Strategies**: Use appropriate wait strategies
4. **Error Handling**: Test error scenarios
5. **Data Cleanup**: Clean up test data

## Debugging Tests

### Jest Tests
```bash
# Debug specific test
npm test -- --testNamePattern="should render certificate"

# Debug with coverage
npm test -- --coverage --testNamePattern="CertificateCard"

# Coverage reports in browser
open coverage/lcov-report/index.html
```

### Playwright Tests
```bash
# Debug with UI
npm run test:e2e:ui

# Debug specific test
npm run test:e2e:debug -- --grep="should login successfully"

# Headed mode for visual debugging
npm run test:e2e:headed
```

## Environment Variables

Set up these environment variables for testing:

```bash
# Test database
TEST_DB_URL=postgresql://test:test@localhost:5432/test

# Supabase test instance
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key

# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123

# Staging environment
STAGING_URL=https://staging.example.com
```

## Troubleshooting

### Common Issues

1. **Tests failing due to async operations**
   - Use `waitFor` for async operations
   - Check for proper cleanup
   - Verify mock configurations

2. **Playwright tests timing out**
   - Increase timeout in config
   - Check for application startup
   - Verify test environment

3. **Coverage not meeting thresholds**
   - Review uncovered code
   - Add targeted tests
   - Adjust coverage thresholds

4. **MSW not intercepting requests**
   - Verify request URLs match patterns
   - Check MSW setup
   - Confirm handlers are registered

### Performance Testing
- Monitor test execution time
- Optimize slow tests
- Use parallel execution where possible
- Cache dependencies and browsers

## Future Enhancements

### Planned Improvements
1. **Visual Regression Testing**: Implement screenshot comparisons
2. **API Testing**: Dedicated API endpoint testing
3. **Load Testing**: Performance under load
4. **Cross-browser Testing**: Expanded browser matrix
5. **Mobile Testing**: Mobile-specific test scenarios

### Monitoring
1. **Test Metrics**: Track test performance and reliability
2. **Flake Detection**: Identify and fix unreliable tests
3. **Coverage Trends**: Monitor coverage over time
4. **CI Performance**: Optimize CI pipeline speed

This comprehensive testing setup ensures the WaveSync application maintains high quality, reliability, and maintainability throughout its development lifecycle.
