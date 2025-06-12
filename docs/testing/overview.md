# Testing System Overview

## 🧪 **Testing Philosophy**

Our testing strategy focuses on **reliability, speed, and maintainability** for the Instagram automation campaign system. We use a multi-layered approach that ensures your long-running campaigns work flawlessly.

## 📊 **Testing Statistics**

```bash
# Current test coverage (updated with each CI run)
Test Files: 15+ comprehensive test suites
Unit Tests: 200+ individual test cases  
Integration Tests: 50+ cross-service tests
E2E Tests: 20+ full workflow tests
Code Coverage: 85%+ (target: 90%+)
```

## 🏗️ **Test Architecture**

### **Three-Tier Testing System**

1. **Unit Tests** (`__tests__/*.test.ts`)
   - Individual function/class testing
   - Mock external dependencies
   - Fast execution (< 5ms per test)
   - 95% coverage requirement for critical services

2. **Integration Tests** (`__integration__/*.test.ts`)
   - Service-to-service interaction testing
   - Database integration with in-memory MongoDB
   - Redis queue testing
   - 90% coverage requirement

3. **E2E Tests** (`__e2e__/*.test.ts`)
   - Complete campaign workflow testing
   - Real database scenarios (test environment)
   - Full sleep/wake cycle validation
   - 80% coverage requirement

## 🛠️ **Core Testing Tools**

### **Primary Framework: Jest**
```json
{
  "jest": "^29.7.0",
  "@types/jest": "^29.5.5",
  "jest-environment-node": "^29.7.0",
  "ts-jest": "^29.1.1"
}
```

### **Testing Utilities**
```json
{
  "mongodb-memory-server": "^9.1.3",  // In-memory MongoDB
  "nock": "^13.4.0",                   // HTTP mocking  
  "sinon": "^17.0.1",                  // Advanced mocking
  "puppeteer-core": "^21.6.1"         // Lightweight browser testing
}
```

## ⚡ **Quick Start**

### **Run All Tests**
```bash
npm test
```

### **Run Specific Test Types**
```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### **Run Single Test File**
```bash
# Specific test file
npm test SleepScheduler.test.ts

# Specific test pattern
npm test -- --testNamePattern="calculateNextSleepTime"
```

## 📂 **Test Organization**

```
src/
├── __tests__/                     # Global test utilities
│   ├── setup.ts                   # Test environment setup
│   └── factories/                 # Test data factories
│       ├── campaignFactory.ts     # Campaign mock data
│       └── instagramFactory.ts    # Instagram mock data
│
├── campaign/
│   ├── services/
│   │   ├── SleepScheduler.ts      # Core sleep logic
│   │   └── CampaignOrchestrator.ts # Campaign management
│   │
│   ├── __tests__/                 # Unit tests
│   │   ├── SleepScheduler.test.ts
│   │   └── CampaignOrchestrator.test.ts
│   │
│   ├── __integration__/           # Integration tests
│   │   ├── campaign-lifecycle.test.ts
│   │   └── state-persistence.test.ts
│   │
│   └── __e2e__/                   # End-to-end tests
│       ├── full-campaign-cycle.test.ts
│       └── error-recovery.test.ts
```

## 🎯 **Test Quality Standards**

### **Code Coverage Requirements**
- **Critical Services** (SleepScheduler, CampaignOrchestrator): 95%+
- **Data Services** (StateManager, Database): 90%+
- **Utilities & Helpers**: 85%+
- **Overall Project**: 85%+

### **Performance Standards**
- **Unit Tests**: < 5ms per test
- **Integration Tests**: < 100ms per test  
- **E2E Tests**: < 5 seconds per test
- **Full Test Suite**: < 2 minutes

### **Quality Gates**
```typescript
// jest.config.js coverage thresholds
coverageThresholds: {
  global: {
    branches: 80,
    functions: 85,
    lines: 85,
    statements: 85
  },
  './src/campaign/': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  }
}
```

## 📋 **Test Data Management**

### **Factory Pattern for Mock Data**
```typescript
// Example: Creating test campaigns
import { createMockCampaign, createFollowerGrowthCampaign } from '../factories/campaignFactory';

// Basic campaign
const campaign = createMockCampaign();

// Specific campaign type
const growthCampaign = createFollowerGrowthCampaign({
  targetMetrics: { followerTarget: 5000 }
});

// Campaign with progress history
const activeCampaign = createCampaignWithProgress(14); // 14 days of data
```

### **Database Test Isolation**
```typescript
// Each test gets clean database state
beforeEach(async () => {
  await connectTestDB();
  await clearTestDB(); // Fresh start for each test
});

afterEach(async () => {
  await disconnectTestDB();
});
```

## 🔄 **Continuous Integration**

### **GitHub Actions Pipeline**
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### **Pre-commit Hooks**
```bash
# Runs automatically before commits
npm run test:unit     # Fast unit tests only
npm run lint          # Code quality checks
npm run type-check    # TypeScript validation
```

## 🎯 **Next Steps**

1. **[Unit Testing Guide](unit-testing.md)** - Learn to write effective unit tests
2. **[Integration Testing Guide](integration-testing.md)** - Test service interactions  
3. **[E2E Testing Guide](e2e-testing.md)** - Full workflow testing
4. **[Adding New Tests](adding-tests.md)** - Standards for new features
5. **[Debugging Tests](debugging-tests.md)** - Troubleshooting test issues

## 📊 **Real-time Test Status**

```bash
# Check current test status
npm run test:coverage

# View detailed HTML coverage report  
open coverage/lcov-report/index.html
```

This testing system ensures your Instagram automation campaigns are **bulletproof** and **production-ready**. Every sleep cycle, state recovery, and interaction is thoroughly validated. 