# Development Setup 🛠️

Complete development environment setup for contributing to the Instagram AI Agent project.

## Development Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.0+ | JavaScript runtime |
| **npm** | 8.0+ | Package manager |
| **Git** | 2.20+ | Version control |
| **VS Code** | Latest | Recommended IDE |
| **Docker** | 20.10+ | MongoDB container |
| **TypeScript** | 5.0+ | Type checking |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

## Clone and Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/david-patrick-chuks/Instagram-AI-Agent.git
cd Instagram-AI-Agent

# Install dependencies
npm install

# Install global development tools
npm install -g typescript ts-node nodemon
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your development credentials
nano .env
```

**Development `.env` configuration:**

```env
# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
HEADLESS_MODE=false

# Instagram Test Account (recommended)
IGusername=your_test_instagram_account
IGpassword=your_test_password

# Development API Keys
GEMINI_API_KEY=your_development_api_key

# Local Database
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent-dev

# Development Server
PORT=3000
```

### 3. Database Setup

```bash
# Start MongoDB for development
docker run -d \
  --name instagram-ai-mongodb-dev \
  -p 27017:27017 \
  -v mongodb_dev_data:/data/db \
  mongodb/mongodb-community-server:latest

# Verify connection
docker exec -it instagram-ai-mongodb-dev mongosh
```

## Development Workflow

### 1. Code Organization

Understanding the project structure:

```
src/
├── Agent/               # AI engine and training
│   ├── characters/      # AI personality configs
│   ├── schema/          # Response schemas
│   ├── training/        # Training pipeline
│   └── index.ts         # Main AI controller
├── client/              # Platform automation
│   ├── Instagram.ts     # Instagram client
│   ├── Twitter.ts       # Twitter client (planned)
│   └── Github.ts        # GitHub client (planned)
├── config/              # Configuration
│   ├── db.ts           # Database connection
│   └── logger.ts       # Logging setup
├── utils/               # Utility functions
├── services/            # Business logic
└── types/               # TypeScript definitions
```

### 2. Development Scripts

Available npm scripts for development:

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Training scripts
npm run train:link        # YouTube training
npm run train:audio       # Audio training
npm run train-model       # Document training
```

### 3. Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build and run production version
npm run build && npm start

# Run specific training scripts
npm run train:link

# Type check without compilation
npx tsc --noEmit

# Run with debugging
DEBUG=* npm run dev
```

## Code Style and Standards

### 1. TypeScript Configuration

The project uses strict TypeScript settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./build",
    "rootDir": "./src"
  }
}
```

### 2. Code Formatting

```bash
# Format all code
npx prettier --write "src/**/*.{ts,js,json}"

# Check formatting
npx prettier --check "src/**/*.{ts,js,json}"
```

### 3. Linting Rules

```bash
# Run ESLint
npx eslint src/ --ext .ts

# Fix auto-fixable issues
npx eslint src/ --ext .ts --fix
```

## Testing Setup

### 1. Unit Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 2. Integration Testing

```bash
# Test Instagram client
npm run test:instagram

# Test AI agent
npm run test:agent

# Test database connection
npm run test:db
```

## Debugging

### 1. VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Instagram Agent",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/build/**/*.js"],
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "debug"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

### 2. Logging for Development

```typescript
// Enhanced logging for development
import logger from './config/logger';

// Debug level logging
logger.debug('Detailed debugging information');
logger.info('General information');
logger.warn('Warning messages');
logger.error('Error messages');

// Structured logging
logger.info('User interaction', {
  action: 'comment_posted',
  postId: 'post_123',
  viralRate: 85,
  timestamp: new Date().toISOString()
});
```

### 3. Browser Debugging

For Puppeteer debugging:

```typescript
// Development browser configuration
const browser = await puppeteer.launch({
  headless: false,        // Show browser window
  devtools: true,         // Open DevTools
  slowMo: 250,           // Slow down actions
  args: [
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ]
});
```

## Development Best Practices

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-training-method

# Make commits with descriptive messages
git commit -m "feat: add YouTube transcript training pipeline"

# Push to remote
git push origin feature/new-training-method

# Create pull request
# (Use GitHub web interface)
```

### 2. Code Documentation

Follow the project's commenting standards:

```typescript
/**
 * Processes YouTube video transcripts for AI training
 * @param videoUrl - YouTube video URL to process
 * @param characterId - Target character for training enhancement
 * @returns Training data object with extracted patterns
 */
async function processYouTubeVideo(
  videoUrl: string, 
  characterId: string
): Promise<TrainingData> {
  // 1. Extract transcript from YouTube video
  const transcript = await YouTubeTranscript.fetchTranscript(videoUrl);
  
  // 2. Process and clean transcript text
  const cleanedText = transcript
    .map(entry => entry.text)
    .join(' ')
    .replace(/\[.*?\]/g, '') // Remove timestamp markers
    .trim();
  
  // 3. Return structured training data
  return {
    source: 'youtube',
    content: cleanedText,
    characterId,
    extractedAt: new Date().toISOString()
  };
}
```

### 3. Error Handling

Implement comprehensive error handling:

```typescript
// Error handling pattern
try {
  const result = await riskyOperation();
  logger.info('Operation successful', { result });
  return result;
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: 'function_name'
  });
  
  // Graceful fallback or retry logic
  return fallbackValue;
}
```

## Development Tools

### 1. Useful Development Utilities

```bash
# Monitor file changes
npx nodemon --exec "npm run build && node build/index.js" --ext ts

# Monitor logs in real-time
tail -f logs/application-$(date +%Y-%m-%d).log

# Database inspection
docker exec -it instagram-ai-mongodb-dev mongosh

# Memory usage monitoring
node --expose-gc --inspect build/index.js
```

### 2. Performance Profiling

```typescript
// Performance monitoring
const startTime = process.hrtime.bigint();

// Your code here
await performOperation();

const endTime = process.hrtime.bigint();
const executionTime = Number(endTime - startTime) / 1000000; // Convert to ms

logger.info('Performance metric', {
  operation: 'ai_generation',
  executionTime: `${executionTime}ms`,
  memoryUsage: process.memoryUsage()
});
```

## Contributing Guidelines

### 1. Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Update documentation** if adding new features
4. **Follow code style** guidelines
5. **Create descriptive PR** with clear title and description

### 2. Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No sensitive data in commits
- [ ] Error handling implemented
- [ ] Performance considerations addressed

### 3. Feature Development

When adding new features:

```bash
# 1. Create feature branch
git checkout -b feature/twitter-integration

# 2. Implement feature with tests
# 3. Update documentation
# 4. Test thoroughly

# 5. Submit PR with description:
# - What the feature does
# - How to test it
# - Any breaking changes
# - Related issues
```

## Troubleshooting Development Issues

### Common Development Problems

#### TypeScript Compilation Errors
```bash
# Clear build directory
rm -rf build/

# Reinstall dependencies
rm -rf node_modules/ package-lock.json
npm install

# Check TypeScript configuration
npx tsc --showConfig
```

#### Database Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB container
docker restart instagram-ai-mongodb-dev

# Check database logs
docker logs instagram-ai-mongodb-dev
```

#### Environment Variable Issues
```bash
# Verify .env file is loaded
node -e "require('dotenv').config(); console.log(process.env.IGusername);"

# Check for syntax errors in .env
cat .env | grep -v '^#' | grep '='
```

## Next Steps

After setting up your development environment:

1. **[Code Structure Guide](code-structure.md)** - Understand the codebase organization
2. **[Adding Features](adding-features.md)** - Learn how to extend the platform
3. **[API Reference](../api/core.md)** - Explore the API documentation
4. **[Architecture Overview](../architecture/overview.md)** - Understand system design

---

**Ready to start coding?** Continue to [Code Structure Guide](code-structure.md) →
