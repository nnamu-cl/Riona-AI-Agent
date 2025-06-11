# Adding Tests for New Features

## 🎯 **Testing Standards for New Development**

When adding any new feature to the Instagram campaign system, you **must** include comprehensive tests. This ensures reliability and prevents regressions in production campaigns.

## 📋 **Required Test Coverage for New Features**

### **1. Unit Tests (REQUIRED)**
- ✅ **Every public method** must have unit tests
- ✅ **Error cases** must be tested
- ✅ **Edge cases** must be covered
- ✅ **95%+ coverage** for critical services

### **2. Integration Tests (REQUIRED for Services)**
- ✅ **Database interactions** must be tested
- ✅ **External API calls** must be mocked and tested
- ✅ **Service-to-service communication** must be validated

### **3. E2E Tests (REQUIRED for User-Facing Features)**
- ✅ **Complete workflows** must be tested
- ✅ **Error recovery** scenarios must be validated
- ✅ **Performance under load** must be verified

## 🛠️ **Step-by-Step Test Implementation**

### **Step 1: Create Test Factory (If Needed)**

```typescript
// src/__tests__/factories/newFeatureFactory.ts

import { NewFeatureInterface } from '../../types/newFeature';

export const createMockNewFeature = (overrides: Partial<NewFeatureInterface> = {}): Partial<NewFeatureInterface> => {
  return {
    id: 'test-feature-123',
    name: 'Test Feature',
    enabled: true,
    settings: {
      option1: 'default',
      option2: 42
    },
    ...overrides
  };
};

// Specialized factories for different scenarios
export const createEnabledFeature = (overrides = {}) => 
  createMockNewFeature({ enabled: true, ...overrides });

export const createDisabledFeature = (overrides = {}) => 
  createMockNewFeature({ enabled: false, ...overrides });
```

### **Step 2: Write Unit Tests**

```typescript
// src/features/__tests__/NewFeatureService.test.ts

import { NewFeatureService } from '../services/NewFeatureService';
import { createMockNewFeature } from '../../__tests__/factories/newFeatureFactory';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../../__tests__/setup';

describe('NewFeatureService', () => {
  let service: NewFeatureService;
  let mockFeature: any;

  beforeEach(async () => {
    await connectTestDB();
    await clearTestDB();
    service = new NewFeatureService();
    mockFeature = createMockNewFeature();
  });

  afterEach(async () => {
    await disconnectTestDB();
  });

  describe('processFeature', () => {
    it('should process enabled features successfully', async () => {
      // 1. Arrange - Set up test data
      const enabledFeature = createEnabledFeature({
        settings: { option1: 'test-value' }
      });

      // 2. Act - Call the method
      const result = await service.processFeature(enabledFeature);

      // 3. Assert - Verify results
      expect(result.success).toBe(true);
      expect(result.processedCount).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip disabled features', async () => {
      // Test disabled state
      const disabledFeature = createDisabledFeature();
      
      const result = await service.processFeature(disabledFeature);
      
      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(0);
      expect(result.message).toBe('Feature disabled');
    });

    it('should handle invalid input gracefully', async () => {
      // Test error handling
      const invalidFeature = createMockNewFeature({
        settings: null // Invalid settings
      });
      
      await expect(service.processFeature(invalidFeature))
        .rejects.toThrow('Invalid feature settings');
    });

    it('should handle network errors with retry logic', async () => {
      // Mock network failure
      const networkFailureFeature = createMockNewFeature();
      jest.spyOn(service, 'makeNetworkCall')
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({ success: true });
      
      const result = await service.processFeature(networkFailureFeature);
      
      expect(result.success).toBe(true);
      expect(service.makeNetworkCall).toHaveBeenCalledTimes(2); // Initial + retry
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined input', () => {
      expect(() => service.processFeature(undefined))
        .toThrow('Feature cannot be undefined');
    });

    it('should handle concurrent processing', async () => {
      // Test concurrent calls
      const features = Array.from({ length: 5 }, () => createMockNewFeature());
      
      const promises = features.map(feature => service.processFeature(feature));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('performance tests', () => {
    it('should process features within time limit', async () => {
      const feature = createMockNewFeature();
      
      const start = Date.now();
      await service.processFeature(feature);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
```

### **Step 3: Write Integration Tests**

```typescript
// src/features/__integration__/feature-integration.test.ts

import { NewFeatureService } from '../services/NewFeatureService';
import { CampaignOrchestrator } from '../../campaign/services/CampaignOrchestrator';
import { connectTestDB, clearTestDB } from '../../__tests__/setup';
import { createMockCampaign } from '../../__tests__/factories/campaignFactory';

describe('Feature Integration Tests', () => {
  let featureService: NewFeatureService;
  let orchestrator: CampaignOrchestrator;

  beforeEach(async () => {
    await connectTestDB();
    await clearTestDB();
    featureService = new NewFeatureService();
    orchestrator = new CampaignOrchestrator();
  });

  afterEach(async () => {
    await orchestrator.shutdown();
  });

  it('should integrate with campaign workflow', async () => {
    // 1. Create campaign with new feature
    const campaign = createMockCampaign({
      settings: {
        ...createMockCampaign().settings,
        newFeatureEnabled: true
      }
    });

    // 2. Schedule campaign
    await orchestrator.scheduleCampaign(campaign);

    // 3. Verify feature integration
    const result = await featureService.getCampaignFeatureStatus(campaign.id);
    expect(result.enabled).toBe(true);
    expect(result.integrated).toBe(true);
  });

  it('should handle database persistence', async () => {
    // Test database operations
    const feature = createMockNewFeature();
    
    await featureService.saveFeature(feature);
    const saved = await featureService.getFeature(feature.id);
    
    expect(saved).toBeDefined();
    expect(saved.id).toBe(feature.id);
    expect(saved.settings).toEqual(feature.settings);
  });
});
```

### **Step 4: Write E2E Tests (If Applicable)**

```typescript
// src/features/__e2e__/feature-e2e.test.ts

import { CampaignOrchestrator } from '../../campaign/services/CampaignOrchestrator';
import { NewFeatureService } from '../services/NewFeatureService';
import { createFullCampaignWithFeature } from '../../__tests__/factories/campaignFactory';

describe('Feature E2E Tests', () => {
  let orchestrator: CampaignOrchestrator;
  let featureService: NewFeatureService;

  beforeAll(async () => {
    // Setup test environment
    orchestrator = new CampaignOrchestrator();
    featureService = new NewFeatureService();
  });

  afterAll(async () => {
    await orchestrator.shutdown();
  });

  it('should complete full campaign lifecycle with feature', async () => {
    // 1. Create campaign with feature enabled
    const campaign = createFullCampaignWithFeature({
      duration: 1, // 1 day for testing
      featureSettings: { enabled: true }
    });

    // 2. Run complete cycle
    await orchestrator.scheduleCampaign(campaign);
    
    // 3. Wait for execution
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. Verify feature was used
    const stats = await featureService.getFeatureUsageStats(campaign.id);
    expect(stats.timesUsed).toBeGreaterThan(0);
    expect(stats.lastUsed).toBeDefined();
  }, 30000); // 30 second timeout
});
```

## 📝 **Code Quality Checklist**

Before submitting tests, ensure:

### **✅ Test Structure**
- [ ] Descriptive test names that explain what's being tested
- [ ] Proper `describe` and `it` block organization
- [ ] Clear AAA pattern (Arrange, Act, Assert)
- [ ] Proper setup/teardown in `beforeEach`/`afterEach`

### **✅ Coverage Requirements**
- [ ] All public methods tested
- [ ] Error cases covered
- [ ] Edge cases included
- [ ] Performance tests for critical paths

### **✅ Test Quality**
- [ ] Tests are independent (don't rely on other tests)
- [ ] No hardcoded delays (`setTimeout`) unless necessary
- [ ] Proper mocking of external dependencies
- [ ] Clear, specific assertions

### **✅ Documentation**
- [ ] Comments explaining complex test logic
- [ ] Clear variable names
- [ ] Proper TypeScript types

## 🚀 **Test Automation Scripts**

### **Generate Test Template**
```bash
# Create test files for new feature
npm run generate:tests -- NewFeatureService

# This creates:
# - src/features/__tests__/NewFeatureService.test.ts
# - src/features/__integration__/NewFeatureService.integration.test.ts
# - Test factory in src/__tests__/factories/
```

### **Validate Test Quality**
```bash
# Check coverage for new feature
npm run test:coverage -- --testPathPattern=NewFeature

# Run mutation testing
npm run test:mutation -- NewFeatureService

# Performance testing
npm run test:perf -- NewFeatureService
```

## 🎯 **Common Testing Patterns**

### **Testing Async Operations**
```typescript
it('should handle async operations', async () => {
  const promise = service.asyncOperation();
  
  // Test intermediate state
  expect(service.isProcessing()).toBe(true);
  
  const result = await promise;
  
  // Test final state
  expect(result.success).toBe(true);
  expect(service.isProcessing()).toBe(false);
});
```

### **Testing Error Recovery**
```typescript
it('should recover from errors', async () => {
  // Simulate error condition
  jest.spyOn(externalService, 'call')
    .mockRejectedValueOnce(new Error('Temporary failure'))
    .mockResolvedValueOnce({ success: true });
  
  const result = await service.resilientOperation();
  
  expect(result.success).toBe(true);
  expect(result.retryCount).toBe(1);
});
```

### **Testing State Changes**
```typescript
it('should manage state transitions correctly', async () => {
  expect(service.getState()).toBe('idle');
  
  const promise = service.startProcess();
  expect(service.getState()).toBe('processing');
  
  await promise;
  expect(service.getState()).toBe('completed');
});
```

## 📊 **Continuous Improvement**

### **Weekly Test Review**
1. Check coverage reports
2. Identify slow tests
3. Review flaky tests
4. Update test data factories

### **Monthly Test Optimization**
1. Refactor duplicate test code
2. Update testing dependencies
3. Review test performance
4. Add new testing utilities

This comprehensive testing approach ensures every new feature is **production-ready** and **bulletproof** from day one. 