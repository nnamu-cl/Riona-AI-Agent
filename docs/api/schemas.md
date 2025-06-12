# Schema Reference 📋

Complete reference for AI response schemas and data models used throughout the Instagram AI Agent.

## Overview

Schemas define the structure and validation rules for AI-generated content, ensuring consistent and predictable responses from the Google Gemini AI model.

## Core Schemas

### Instagram Comment Schema

The primary schema for generating Instagram comments with engagement optimization.

```typescript
export interface InstagramCommentSchema {
    description: string;
    type: SchemaType;
    items: {
        type: SchemaType;
        properties: {
            comment: {
                type: SchemaType;
                description: string;
                nullable: boolean;
            };
            viralRate: {
                type: SchemaType;
                description: string;
                nullable: boolean;
            };
            commentTokenCount: {
                type: SchemaType;
                description: string;
                nullable: boolean;
            };
        };
        required: string[];
    };
}
```

#### Implementation

```typescript
export const getInstagramCommentSchema = (): InstagramCommentSchema => {
    return {
        description: `Generate engaging comments with viral potential`,
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                comment: {
                    type: SchemaType.STRING,
                    description: "Comment between 150-300 characters",
                    nullable: false,
                },
                viralRate: {
                    type: SchemaType.NUMBER,
                    description: "Viral potential score 0-100",
                    nullable: false,
                },
                commentTokenCount: {
                    type: SchemaType.NUMBER,
                    description: "Token count for rate limiting",
                    nullable: false,
                },
            },
            required: ["comment", "viralRate", "commentTokenCount"],
        },
    };
};
```

#### Response Example

```json
[
    {
        "comment": "The creativity in this post is absolutely inspiring! 🎨 Love how you captured the emotion.",
        "viralRate": 85,
        "commentTokenCount": 67
    }
]
```

## Database Models

### Tweet Model

Schema for storing and managing tweet data (future Twitter integration).

```typescript
interface ITweet extends Document {
    tweetContent: string;
    imageUrl: string;
    timeTweeted: Date;
    engagement?: {
        likes: number;
        retweets: number;
        replies: number;
    };
}

const tweetSchema = new Schema({
    tweetContent: { 
        type: String, 
        required: true,
        maxLength: 280
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    timeTweeted: { 
        type: Date, 
        default: Date.now 
    },
    engagement: {
        likes: { type: Number, default: 0 },
        retweets: { type: Number, default: 0 },
        replies: { type: Number, default: 0 }
    }
});
```

### Character Configuration Schema

Structure for AI character personality definitions.

```typescript
interface CharacterConfig {
    name: string;
    version: string;
    description: string;
    personality: {
        traits: string[];
        communication_style: {
            tone: string;
            formality: string;
            emoji_usage: string;
            vocabulary_level: string;
        };
    };
    content_guidelines: {
        max_length: number;
        forbidden_topics: string[];
        preferred_hashtags: string[];
    };
    ai_instructions: {
        system_prompt: string;
        response_format: string;
    };
}
```

### Training Data Schema

Structure for AI training data from various sources.

```typescript
interface TrainingData {
    source: 'youtube' | 'audio' | 'document' | 'website';
    content: string;
    metadata: {
        extractedAt: string;
        characterId?: string;
        sourceUrl?: string;
        fileType?: string;
    };
    analysis: {
        vocabulary?: string[];
        topics?: string[];
        style?: object;
        tone?: object;
    };
}
```

## Custom Schema Creation

### Platform-Specific Schemas

Create schemas for different platforms:

```typescript
// Twitter schema (planned)
export const getTwitterTweetSchema = () => {
    return {
        description: "Generate engaging tweets with hashtag optimization",
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                tweet: {
                    type: SchemaType.STRING,
                    description: "Tweet content up to 280 characters",
                    nullable: false,
                },
                hashtags: {
                    type: SchemaType.ARRAY,
                    description: "Relevant hashtags for the tweet",
                    nullable: true,
                },
                engagement_score: {
                    type: SchemaType.NUMBER,
                    description: "Predicted engagement score 0-100",
                    nullable: false,
                }
            },
            required: ["tweet", "engagement_score"]
        }
    };
};
```

### Content Analysis Schema

Schema for analyzing content quality and engagement potential:

```typescript
export const getContentAnalysisSchema = () => {
    return {
        description: "Analyze content for quality and engagement metrics",
        type: SchemaType.OBJECT,
        properties: {
            sentiment: {
                type: SchemaType.STRING,
                description: "Content sentiment: positive, neutral, negative",
                nullable: false,
            },
            topics: {
                type: SchemaType.ARRAY,
                description: "Main topics identified in the content",
                nullable: false,
            },
            readability: {
                type: SchemaType.NUMBER,
                description: "Readability score 0-100",
                nullable: false,
            },
            engagement_potential: {
                type: SchemaType.NUMBER,
                description: "Predicted engagement likelihood 0-100",
                nullable: false,
            },
            improvements: {
                type: SchemaType.ARRAY,
                description: "Suggested improvements for better engagement",
                nullable: true,
            }
        },
        required: ["sentiment", "topics", "readability", "engagement_potential"]
    };
};
```

## Schema Validation

### Runtime Validation

```typescript
export function validateResponse(response: any, schema: any): boolean {
    // Extract required fields from schema
    const required = schema.items?.required || [];
    
    // Validate structure
    if (!Array.isArray(response)) {
        logger.error('Response must be an array');
        return false;
    }
    
    // Validate each item
    return response.every(item => {
        return required.every(field => {
            if (!item.hasOwnProperty(field)) {
                logger.error(`Missing required field: ${field}`);
                return false;
            }
            return true;
        });
    });
}
```

### Type Guards

```typescript
// Type guard for Instagram comment response
export function isInstagramCommentResponse(response: any): response is InstagramCommentResponse[] {
    return Array.isArray(response) && 
           response.every(item => 
               typeof item.comment === 'string' &&
               typeof item.viralRate === 'number' &&
               typeof item.commentTokenCount === 'number'
           );
}

// Type guard for training data
export function isValidTrainingData(data: any): data is TrainingData {
    return data &&
           typeof data.source === 'string' &&
           typeof data.content === 'string' &&
           data.metadata &&
           typeof data.metadata.extractedAt === 'string';
}
```

## Error Schemas

### API Error Response

```typescript
interface APIErrorResponse {
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
    requestId: string;
}
```

### Validation Error Schema

```typescript
interface ValidationError {
    field: string;
    message: string;
    value: any;
    constraint: string;
}

interface ValidationErrorResponse {
    errors: ValidationError[];
    message: string;
}
```

## Schema Evolution

### Versioning Strategy

```typescript
interface SchemaVersion {
    version: string;
    created: string;
    changes: string[];
    compatibility: 'backward' | 'breaking' | 'forward';
}

// Schema registry for version management
export class SchemaRegistry {
    private schemas: Map<string, Map<string, any>> = new Map();
    
    registerSchema(name: string, version: string, schema: any): void {
        if (!this.schemas.has(name)) {
            this.schemas.set(name, new Map());
        }
        
        this.schemas.get(name)!.set(version, schema);
    }
    
    getSchema(name: string, version: string = 'latest'): any {
        const schemaVersions = this.schemas.get(name);
        
        if (!schemaVersions) {
            throw new Error(`Schema ${name} not found`);
        }
        
        if (version === 'latest') {
            const versions = Array.from(schemaVersions.keys()).sort();
            version = versions[versions.length - 1];
        }
        
        return schemaVersions.get(version);
    }
}
```

### Migration Support

```typescript
export class SchemaMigrator {
    async migrateResponse(response: any, fromVersion: string, toVersion: string): Promise<any> {
        const migrations = this.getMigrationPath(fromVersion, toVersion);
        
        let migratedResponse = response;
        for (const migration of migrations) {
            migratedResponse = await migration.transform(migratedResponse);
        }
        
        return migratedResponse;
    }
    
    private getMigrationPath(from: string, to: string): Migration[] {
        // Implement migration logic
        return [];
    }
}
```

## Testing Schemas

### Schema Test Utilities

```typescript
export class SchemaTestUtils {
    static generateTestData(schema: any): any {
        // Generate valid test data based on schema
        if (schema.type === SchemaType.ARRAY) {
            return [this.generateObjectFromSchema(schema.items)];
        }
        
        return this.generateObjectFromSchema(schema);
    }
    
    private static generateObjectFromSchema(schema: any): any {
        const obj: any = {};
        
        for (const [key, property] of Object.entries(schema.properties)) {
            obj[key] = this.generateValueForProperty(property as any);
        }
        
        return obj;
    }
    
    private static generateValueForProperty(property: any): any {
        switch (property.type) {
            case SchemaType.STRING:
                return "Generated test string";
            case SchemaType.NUMBER:
                return Math.floor(Math.random() * 100);
            case SchemaType.ARRAY:
                return ["test", "array"];
            default:
                return null;
        }
    }
}
```

### Schema Validation Tests

```typescript
describe('Schema Validation', () => {
    test('Instagram comment schema validation', () => {
        const schema = getInstagramCommentSchema();
        const validResponse = [{
            comment: "Great post! Love the creativity 🎨",
            viralRate: 85,
            commentTokenCount: 42
        }];
        
        expect(validateResponse(validResponse, schema)).toBe(true);
    });
    
    test('Invalid response structure', () => {
        const schema = getInstagramCommentSchema();
        const invalidResponse = [{
            comment: "Missing required fields"
            // Missing viralRate and commentTokenCount
        }];
        
        expect(validateResponse(invalidResponse, schema)).toBe(false);
    });
});
```

## Performance Considerations

### Schema Optimization

```typescript
// Optimized schema for high-frequency operations
export const getOptimizedCommentSchema = () => {
    return {
        description: "Lightweight schema for high-volume comment generation",
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                comment: {
                    type: SchemaType.STRING,
                    description: "Comment text only",
                    nullable: false,
                }
            },
            required: ["comment"]
        }
    };
};
```

### Caching Strategy

```typescript
export class SchemaCache {
    private cache: Map<string, any> = new Map();
    
    getSchema(key: string): any {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const schema = this.loadSchema(key);
        this.cache.set(key, schema);
        
        return schema;
    }
    
    private loadSchema(key: string): any {
        // Load schema from file or generate dynamically
        switch (key) {
            case 'instagram-comment':
                return getInstagramCommentSchema();
            default:
                throw new Error(`Unknown schema: ${key}`);
        }
    }
}
```

## Next Steps

Explore related documentation:

1. **[Core API Reference](core.md)** - Main API functions
2. **[AI Agent System](../architecture/ai-agent.md)** - AI implementation
3. **[Development Setup](../development/setup.md)** - Development environment
4. **[Adding Features](../development/adding-features.md)** - Extending schemas

---

**Need to create custom schemas?** Check the [Adding Features](../development/adding-features.md) guide →
