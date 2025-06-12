# Code Structure 📁

Understanding the Instagram AI Agent codebase organization, patterns, and conventions.

## Project Overview

The Instagram AI Agent follows a modular architecture with clear separation of concerns, making it easy to understand, maintain, and extend.

```
Instagram-AI-Agent/
├── src/                     # Source code
│   ├── Agent/              # AI engine and training
│   ├── client/             # Platform automation clients
│   ├── config/             # Configuration and infrastructure
│   ├── services/           # Business logic layer
│   ├── utils/              # Shared utilities
│   └── types/              # TypeScript type definitions
├── docs/                   # Documentation (MkDocs)
├── logs/                   # Application logs
├── cookies/                # Session cookies
├── build/                  # Compiled JavaScript output
└── tests/                  # Test files
```

## Core Directories

### 1. AI Engine (`src/Agent/`)

The brain of the application, handling AI interactions and character management.

```
src/Agent/
├── index.ts                # Main AI controller and agent initialization
├── characters/             # AI personality definitions
│   ├── ArcanEdge.System.Agent.json
│   ├── elon.character.json
│   └── sample.character.json
├── schema/                 # Response structure definitions
│   └── index.ts
├── training/               # AI training pipeline
│   ├── youtubeURL.ts      # YouTube transcript processing
│   ├── TrainWithAudio.ts  # Audio file training
│   ├── FilesTraining.ts   # Document processing
│   ├── WebsiteScraping.ts # Website content extraction
│   └── sample/            # Sample training data
└── script/                # Training automation scripts
```

#### Key Files

**`Agent/index.ts`** - Main AI Controller
```typescript
/**
 * Core AI agent functions for content generation and character management
 * 
 * Key Functions:
 * - runAgent(): Execute AI content generation with schema validation
 * - chooseCharacter(): Interactive character selection from JSON files
 * - initAgent(): Initialize AI system with character loading
 */

// 1. AI content generation with Google Gemini integration
export async function runAgent(schema: InstagramCommentSchema, prompt: string): Promise<any>

// 2. Character selection and loading system
export function chooseCharacter(): any

// 3. Agent initialization and setup
export function initAgent(): any
```

**`Agent/schema/index.ts`** - Response Schemas
```typescript
/**
 * Defines structured response formats for AI-generated content
 * 
 * Ensures consistent output from Google Gemini AI:
 * - Comment text and length constraints
 * - Viral rate scoring (0-100)
 * - Token counting for rate limiting
 */

export interface InstagramCommentSchema { /* ... */ }
export const getInstagramCommentSchema = (): InstagramCommentSchema => { /* ... */ }
```

### 2. Platform Clients (`src/client/`)

Platform-specific automation and interaction handlers.

```
src/client/
├── Instagram.ts            # Main Instagram automation client
├── Twitter.ts              # Twitter client (planned - minimal implementation)
├── Github.ts               # GitHub client (planned - empty)
├── IG-bot/                 # Instagram-specific utilities
└── X-bot/                  # Twitter-specific utilities (planned)
```

#### Key Files

**`client/Instagram.ts`** - Instagram Automation Engine
```typescript
/**
 * Complete Instagram automation implementation
 * 
 * Core Workflow:
 * 1. Browser setup with stealth configuration
 * 2. Authentication with cookie persistence
 * 3. Feed navigation and content extraction
 * 4. AI-powered comment generation
 * 5. Human-like interaction execution
 */

// Main automation orchestrator
async function runInstagram(): Promise<void>

// Individual post interaction handler
async function interactWithPosts(page: any): Promise<void>

// Authentication and session management
async function loginWithCredentials(page: any, browser: Browser): Promise<void>
```

### 3. Configuration (`src/config/`)

Infrastructure configuration and shared services.

```
src/config/
├── db.ts                   # MongoDB connection management
└── logger.ts               # Winston logging configuration
```

#### Key Files

**`config/logger.ts`** - Comprehensive Logging System
```typescript
/**
 * Winston-based logging with multiple transports and daily rotation
 * 
 * Features:
 * - Structured JSON logging
 * - Daily log file rotation
 * - Multiple log levels (error, warn, info, debug)
 * - Console and file output
 * - Error stack trace capture
 */

// Main logger instance with configured transports
const logger = winston.createLogger({ /* configuration */ });

// Error handling setup for uncaught exceptions
export function setupErrorHandlers(): void
```

**`config/db.ts`** - Database Connection
```typescript
/**
 * MongoDB connection using Mongoose ODM
 * 
 * Handles:
 * - Connection establishment with retry logic
 * - Connection state monitoring
 * - Error handling and reconnection
 */

export async function connectDB(): Promise<void>
```

### 4. Utilities (`src/utils/`)

Shared functionality and helper functions.

```
src/utils/
├── index.ts                # Main utility functions
└── download.ts             # File download utilities
```

#### Key Functions

**`utils/index.ts`** - Core Utilities
```typescript
/**
 * Shared utility functions used across the application
 * 
 * Key Areas:
 * - Cookie management and persistence
 * - Error handling with retry logic
 * - File operations and data processing
 * - HTTP utilities and API helpers
 */

// Cookie management
export async function saveCookies(path: string, cookies: any[]): Promise<void>
export async function loadCookies(path: string): Promise<any[]>
export async function Instagram_cookiesExist(): Promise<boolean>

// Error handling
export async function handleError(error: any, ...args: any[]): Promise<void>
export function setup_HandleError(error: Error, context: string): void

// Data processing utilities
export function cleanText(text: string): string
export function extractKeywords(text: string): string[]
```

### 5. Services (`src/services/`)

Business logic and service layer abstractions.

```
src/services/
└── index.ts                # Service layer exports and shutdown handling
```

**`services/index.ts`** - Service Orchestration
```typescript
/**
 * Service layer for managing application lifecycle
 * 
 * Handles:
 * - Graceful application shutdown
 * - Service cleanup and resource management
 * - Cross-cutting concerns
 */

export function shutdown(server: any): void
```

## Design Patterns

### 1. Modular Architecture

The codebase follows a modular design with clear boundaries:

```typescript
// Each module has a specific responsibility
├── Agent/          # AI and machine learning logic
├── client/         # External platform integrations
├── config/         # Infrastructure and configuration
├── utils/          # Shared utilities and helpers
└── services/       # Business logic and orchestration
```

### 2. Dependency Injection

Configuration and dependencies are injected rather than hardcoded:

```typescript
// Environment-driven configuration
const config = {
    headless: process.env.HEADLESS_MODE === 'true',
    maxPosts: parseInt(process.env.MAX_POSTS_PER_SESSION) || 50,
    delayMin: parseInt(process.env.INTERACTION_DELAY_MIN) || 5000
};

// Dependency injection for testing
export class InstagramClient {
    constructor(
        private logger: Logger,
        private aiAgent: AIAgent,
        private config: ClientConfig
    ) {}
}
```

### 3. Error Boundary Pattern

Comprehensive error handling at multiple levels:

```typescript
// Application-level error handling
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Function-level error handling with context
async function safeFunctionCall<T>(
    operation: () => Promise<T>,
    context: string
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        logger.error(`Error in ${context}:`, error);
        return null;
    }
}
```

### 4. Factory Pattern

Character and client creation uses factory patterns:

```typescript
// Character factory
export class CharacterFactory {
    static createCharacter(type: string): Character {
        switch (type) {
            case 'elon':
                return new ElonCharacter();
            case 'arcanedge':
                return new ArcanEdgeCharacter();
            default:
                return new DefaultCharacter();
        }
    }
}

// Client factory
export class ClientFactory {
    static createClient(platform: string): PlatformClient {
        switch (platform) {
            case 'instagram':
                return new InstagramClient();
            case 'twitter':
                return new TwitterClient();
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}
```

## Coding Conventions

### 1. TypeScript Usage

Strong typing throughout the codebase:

```typescript
// Interface definitions for major components
interface AIAgent {
    generateContent(prompt: string, schema: Schema): Promise<AIResponse>;
    loadCharacter(characterPath: string): Promise<Character>;
}

// Type guards for runtime validation
function isValidAIResponse(response: any): response is AIResponse {
    return response && 
           typeof response.content === 'string' && 
           typeof response.confidence === 'number';
}

// Generic types for reusable functions
async function processData<T, R>(
    data: T[], 
    processor: (item: T) => Promise<R>
): Promise<R[]> {
    return Promise.all(data.map(processor));
}
```

### 2. Async/Await Patterns

Consistent asynchronous programming:

```typescript
// Preferred: async/await with proper error handling
async function performOperation(): Promise<OperationResult> {
    try {
        const step1 = await authenticateUser();
        const step2 = await loadConfiguration(step1.userId);
        const step3 = await executeProcess(step2.config);
        
        return { success: true, data: step3 };
    } catch (error) {
        logger.error('Operation failed:', error);
        throw new OperationError('Process execution failed', error);
    }
}

// Avoid: callback hell or mixed promise styles
```

### 3. Logging Standards

Structured logging with context:

```typescript
// Good: Structured logging with context
logger.info('Instagram automation started', {
    character: selectedCharacter.name,
    maxPosts: config.maxPosts,
    sessionId: generateSessionId(),
    timestamp: new Date().toISOString()
});

// Good: Error logging with full context
logger.error('AI generation failed', {
    error: error.message,
    stack: error.stack,
    prompt: prompt.substring(0, 100), // Truncated for privacy
    attempt: retryCount,
    apiKeyIndex: currentKeyIndex
});
```

### 4. Configuration Management

Environment-driven configuration:

```typescript
// Configuration interface
interface AppConfig {
    instagram: {
        maxPosts: number;
        delayMin: number;
        delayMax: number;
        headlessMode: boolean;
    };
    ai: {
        apiKeys: string[];
        maxRetries: number;
        timeoutMs: number;
    };
    database: {
        uri: string;
        options: object;
    };
}

// Configuration loading with validation
export function loadConfig(): AppConfig {
    const config = {
        instagram: {
            maxPosts: parseInt(process.env.MAX_POSTS_PER_SESSION) || 50,
            delayMin: parseInt(process.env.INTERACTION_DELAY_MIN) || 5000,
            delayMax: parseInt(process.env.INTERACTION_DELAY_MAX) || 10000,
            headlessMode: process.env.HEADLESS_MODE === 'true'
        },
        // ... other config sections
    };
    
    validateConfig(config);
    return config;
}
```

## File Naming Conventions

### 1. File Extensions

- **`.ts`** - TypeScript source files
- **`.js`** - JavaScript files (avoid in new code)
- **`.json`** - Configuration and data files
- **`.md`** - Documentation files

### 2. Naming Patterns

```typescript
// PascalCase for classes and interfaces
class InstagramClient implements PlatformClient { }
interface UserConfiguration { }

// camelCase for functions and variables
async function generateComment(prompt: string): Promise<string> { }
const maxRetryCount = 3;

// UPPER_SNAKE_CASE for constants
const DEFAULT_TIMEOUT_MS = 30000;
const API_ENDPOINTS = {
    INSTAGRAM: 'https://www.instagram.com',
    GEMINI: 'https://generativelanguage.googleapis.com'
};

// kebab-case for file names
instagram-client.ts
ai-agent-controller.ts
character-manager.ts
```

### 3. Directory Structure

```
src/
├── components/             # Reusable components (if applicable)
├── controllers/            # Request controllers
├── middleware/             # Express middleware
├── models/                 # Data models and schemas
├── routes/                 # API route definitions
├── services/               # Business logic services
└── types/                  # TypeScript type definitions
```

## Testing Structure

### 1. Test Organization

```
tests/
├── unit/                   # Unit tests for individual functions
│   ├── agent/             # AI agent tests
│   ├── client/            # Platform client tests
│   └── utils/             # Utility function tests
├── integration/           # Integration tests
│   ├── instagram/         # Instagram API integration
│   └── database/          # Database integration
├── e2e/                   # End-to-end tests
└── fixtures/              # Test data and mocks
```

### 2. Test Patterns

```typescript
// Unit test example
describe('AIAgent', () => {
    describe('generateComment', () => {
        test('should generate valid comment for given prompt', async () => {
            const agent = new AIAgent(mockConfig);
            const prompt = 'Test prompt for comment generation';
            
            const result = await agent.generateComment(prompt);
            
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThanOrEqual(300);
        });
        
        test('should handle API errors gracefully', async () => {
            const agent = new AIAgent(mockConfig);
            mockGeminiAPI.mockRejectedValueOnce(new Error('API Error'));
            
            await expect(agent.generateComment('test')).rejects.toThrow();
        });
    });
});
```

## Performance Considerations

### 1. Memory Management

```typescript
// Proper cleanup of resources
class BrowserManager {
    private browsers: Map<string, Browser> = new Map();
    
    async createBrowser(id: string): Promise<Browser> {
        const browser = await puppeteer.launch(config);
        this.browsers.set(id, browser);
        return browser;
    }
    
    async cleanup(): Promise<void> {
        for (const [id, browser] of this.browsers) {
            await browser.close();
            this.browsers.delete(id);
        }
    }
}
```

### 2. Caching Strategy

```typescript
// Response caching for expensive operations
class ResponseCache {
    private cache = new Map<string, CacheEntry>();
    private readonly TTL = 5 * 60 * 1000; // 5 minutes
    
    async get<T>(key: string, factory: () => Promise<T>): Promise<T> {
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.TTL) {
            return cached.value as T;
        }
        
        const value = await factory();
        this.cache.set(key, { value, timestamp: Date.now() });
        
        return value;
    }
}
```

### 3. Rate Limiting

```typescript
// Built-in rate limiting for API calls
class RateLimiter {
    private lastCall = 0;
    private readonly minInterval: number;
    
    constructor(callsPerSecond: number) {
        this.minInterval = 1000 / callsPerSecond;
    }
    
    async enforce(): Promise<void> {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCall;
        
        if (timeSinceLastCall < this.minInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minInterval - timeSinceLastCall)
            );
        }
        
        this.lastCall = Date.now();
    }
}
```

## Security Patterns

### 1. Input Validation

```typescript
// Input sanitization and validation
function validateAndSanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
        throw new ValidationError('Invalid input type');
    }
    
    // Remove potential XSS vectors
    const sanitized = input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    
    if (sanitized.length === 0) {
        throw new ValidationError('Input cannot be empty after sanitization');
    }
    
    return sanitized;
}
```

### 2. Secret Management

```typescript
// Secure handling of sensitive data
class SecretManager {
    private static secrets = new Map<string, string>();
    
    static loadSecrets(): void {
        // Load from environment variables only
        const requiredSecrets = ['IGusername', 'IGpassword', 'GEMINI_API_KEY'];
        
        for (const secret of requiredSecrets) {
            const value = process.env[secret];
            if (!value) {
                throw new Error(`Missing required secret: ${secret}`);
            }
            this.secrets.set(secret, value);
        }
    }
    
    static getSecret(name: string): string {
        const secret = this.secrets.get(name);
        if (!secret) {
            throw new Error(`Secret not found: ${name}`);
        }
        return secret;
    }
}
```

## Next Steps

Understanding the code structure is essential for effective development:

1. **[Development Setup](setup.md)** - Set up your development environment
2. **[Adding Features](adding-features.md)** - Learn to extend the platform
3. **[API Reference](../api/core.md)** - Explore function documentation
4. **[Architecture Overview](../architecture/overview.md)** - Understand system design

---

**Ready to start developing?** Continue to [Adding Features](adding-features.md) →
