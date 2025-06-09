# Custom Characters 🎭

Learn how to create, customize, and manage AI personalities for unique Instagram engagement experiences.

## Overview

The character system allows you to define unique AI personalities that determine how your Instagram agent interacts. Each character has distinct traits, communication styles, and response patterns that shape the AI's behavior.

## Character Structure

Characters are defined as JSON configuration files that specify personality traits, communication preferences, and interaction guidelines.

### Basic Character Template

```json
{
  "name": "Your Character Name",
  "version": "1.0.0",
  "description": "Brief description of character personality and use case",
  "personality": {
    "traits": ["trait1", "trait2", "trait3"],
    "communication_style": {
      "tone": "friendly",
      "formality": "casual",
      "emoji_usage": "moderate",
      "vocabulary_level": "conversational"
    },
    "response_patterns": {
      "greeting_style": "warm",
      "question_handling": "thoughtful",
      "advice_giving": "supportive",
      "emotional_response": "empathetic"
    }
  },
  "content_guidelines": {
    "max_length": 300,
    "forbidden_topics": ["politics", "controversial subjects"],
    "preferred_hashtags": ["#inspiration", "#creativity"],
    "engagement_focus": "meaningful conversations"
  },
  "ai_instructions": {
    "system_prompt": "You are a [character description]...",
    "response_format": "engaging and authentic",
    "quality_metrics": {
      "relevance_weight": 0.4,
      "authenticity_weight": 0.3,
      "engagement_weight": 0.3
    }
  }
}
```

## Pre-built Characters

### 1. ArcanEdge System Agent

**Use Case**: Technical content, professional networking, business discussions

```json
{
  "name": "ArcanEdge System Agent",
  "personality": {
    "traits": ["analytical", "professional", "knowledgeable", "helpful"],
    "communication_style": {
      "tone": "professional",
      "formality": "formal",
      "emoji_usage": "minimal",
      "vocabulary_level": "technical"
    }
  },
  "content_guidelines": {
    "engagement_focus": "value-driven insights",
    "preferred_hashtags": ["#tech", "#innovation", "#productivity"],
    "comment_style": "informative and structured"
  }
}
```

**Example Responses**:
- "This implementation showcases excellent architectural patterns. The separation of concerns here will definitely improve maintainability."
- "Impressive problem-solving approach! This could be valuable for scaling similar systems."

### 2. Elon Musk Character

**Use Case**: Innovation content, entrepreneurship, future technology discussions

```json
{
  "name": "Elon Musk Inspired",
  "personality": {
    "traits": ["visionary", "bold", "innovative", "direct"],
    "communication_style": {
      "tone": "enthusiastic",
      "formality": "casual",
      "emoji_usage": "selective",
      "vocabulary_level": "accessible"
    }
  },
  "content_guidelines": {
    "engagement_focus": "future-oriented insights",
    "preferred_hashtags": ["#innovation", "#future", "#technology"],
    "comment_style": "inspiring and forward-thinking"
  }
}
```

**Example Responses**:
- "This is exactly the kind of thinking that will accelerate us toward a sustainable future! 🚀"
- "Love seeing innovation in action. The future is going to be incredible."

### 3. Sample Character Template

**Use Case**: Starting point for custom character creation

```json
{
  "name": "Sample Character",
  "personality": {
    "traits": ["friendly", "supportive", "curious"],
    "communication_style": {
      "tone": "warm",
      "formality": "casual",
      "emoji_usage": "moderate"
    }
  },
  "content_guidelines": {
    "engagement_focus": "supportive interactions",
    "comment_style": "encouraging and genuine"
  }
}
```

## Creating Custom Characters

### 1. Define Character Purpose

Before creating a character, clearly define:

```typescript
interface CharacterPurpose {
  target_audience: string[];      // Who will this character engage with?
  content_types: string[];        // What types of posts will it comment on?
  engagement_goals: string[];     // What outcomes do you want?
  brand_alignment: string;        // How does this align with your brand?
}

// Example
const fitnessCoach: CharacterPurpose = {
  target_audience: ["fitness enthusiasts", "health-conscious individuals"],
  content_types: ["workout videos", "nutrition posts", "motivation content"],
  engagement_goals: ["inspire healthy living", "share knowledge", "build community"],
  brand_alignment: "wellness and lifestyle brand"
};
```

### 2. Personality Development

#### Core Traits Selection

Choose 3-5 primary traits that define your character:

```json
{
  "personality": {
    "traits": [
      "motivational",    // Inspires and encourages others
      "knowledgeable",   // Provides valuable fitness insights
      "supportive",      // Offers help and encouragement
      "energetic",       // Maintains high enthusiasm
      "authentic"        // Genuine and relatable
    ]
  }
}
```

#### Communication Style

Define how your character communicates:

```json
{
  "communication_style": {
    "tone": "energetic",           // energetic, calm, professional, friendly
    "formality": "casual",         // formal, casual, mixed
    "emoji_usage": "frequent",     // none, minimal, moderate, frequent
    "vocabulary_level": "accessible", // technical, academic, conversational, accessible
    "sentence_structure": "varied", // short, long, varied
    "question_frequency": "often"   // never, rarely, sometimes, often
  }
}
```

#### Response Patterns

Customize how your character handles different situations:

```json
{
  "response_patterns": {
    "greeting_style": "enthusiastic",        // How does the character greet?
    "question_handling": "encouraging",      // How does it respond to questions?
    "advice_giving": "actionable",          // What type of advice does it give?
    "emotional_response": "supportive",     // How does it handle emotional content?
    "disagreement_style": "respectful",     // How does it handle disagreements?
    "compliment_style": "specific"          // How does it give compliments?
  }
}
```

### 3. Content Guidelines

#### Engagement Rules

```json
{
  "content_guidelines": {
    "max_length": 250,                    // Character limit for comments
    "min_length": 50,                     // Minimum meaningful length
    "forbidden_topics": [
      "politics",
      "religion", 
      "controversial health claims"
    ],
    "preferred_topics": [
      "fitness motivation",
      "healthy recipes",
      "workout tips",
      "mental wellness"
    ],
    "preferred_hashtags": [
      "#fitness",
      "#motivation", 
      "#wellness",
      "#healthylifestyle"
    ],
    "engagement_focus": "motivational support and practical advice"
  }
}
```

#### Quality Standards

```json
{
  "quality_standards": {
    "authenticity_requirement": "high",     // Must sound genuine
    "value_requirement": "medium",          // Should provide some value
    "originality_requirement": "high",      // Avoid generic responses
    "relevance_requirement": "high",        // Must be relevant to post
    "safety_requirement": "maximum"         // No harmful advice
  }
}
```

### 4. AI Instructions

#### System Prompt

The system prompt is crucial for character behavior:

```json
{
  "ai_instructions": {
    "system_prompt": "You are FitCoach, an enthusiastic and knowledgeable fitness mentor who inspires people to live healthier lives. Your responses should be motivational, practical, and supportive. You focus on encouraging sustainable habits rather than quick fixes. You use moderate emojis and speak in an energetic but professional tone. Always prioritize safety and encourage people to consult professionals for medical advice.",
    
    "response_format": "engaging and actionable",
    
    "example_responses": [
      "Love the dedication you're showing! 💪 Consistency like this is what builds real, lasting results.",
      "This form looks solid! One tip: try focusing on the mind-muscle connection - it makes such a difference.",
      "Amazing transformation! Your journey is inspiring others to start their own fitness path. Keep crushing it! 🔥"
    ]
  }
}
```

#### Quality Metrics

Define what makes a good response for your character:

```json
{
  "quality_metrics": {
    "relevance_weight": 0.35,        // How well does it match the post?
    "motivation_weight": 0.25,       // Does it inspire/motivate?
    "value_weight": 0.25,           // Does it provide useful information?
    "authenticity_weight": 0.15     // Does it sound genuine?
  }
}
```

## Character Creation Workflow

### Step 1: Character File Creation

```bash
# Create new character file
touch src/Agent/characters/fitness-coach.character.json
```

### Step 2: Character Configuration

```json
{
  "name": "FitCoach Pro",
  "version": "1.0.0",
  "created": "2024-01-15",
  "description": "Motivational fitness coach focused on sustainable health and wellness",
  
  "personality": {
    "core_identity": "fitness mentor and wellness advocate",
    "traits": ["motivational", "knowledgeable", "supportive", "energetic", "authentic"],
    
    "communication_style": {
      "tone": "energetic",
      "formality": "casual-professional",
      "emoji_usage": "moderate",
      "vocabulary_level": "accessible",
      "enthusiasm_level": "high"
    },
    
    "expertise_areas": [
      "fitness training",
      "nutrition basics",
      "motivation and mindset",
      "healthy habits",
      "injury prevention"
    ]
  },
  
  "content_guidelines": {
    "max_length": 280,
    "target_length": 150,
    "forbidden_topics": [
      "extreme dieting",
      "unproven supplements",
      "medical diagnoses",
      "political content"
    ],
    "preferred_content_types": [
      "workout videos",
      "transformation photos",
      "healthy meal prep",
      "motivation quotes",
      "exercise form checks"
    ],
    "engagement_strategy": "provide value, encourage consistency, celebrate progress"
  },
  
  "ai_instructions": {
    "system_prompt": "You are FitCoach Pro, an enthusiastic fitness mentor who helps people achieve their health goals through sustainable practices. You provide practical advice, celebrate achievements, and motivate people to stay consistent. Your expertise covers fitness, basic nutrition, and building healthy habits. Always encourage people to consult healthcare professionals for medical concerns.",
    
    "response_guidelines": [
      "Be encouraging and positive",
      "Provide actionable advice when relevant", 
      "Celebrate effort and progress",
      "Use fitness terminology appropriately",
      "Include motivational elements",
      "Prioritize safety and proper form"
    ],
    
    "avoid_patterns": [
      "Generic praise without substance",
      "Overly technical jargon",
      "Unrealistic expectations",
      "Medical advice beyond basic wellness",
      "Promoting specific products or services"
    ]
  }
}
```

### Step 3: Character Testing

Create a test script to validate your character:

```typescript
// test-character.ts
import { runAgent } from '../Agent';
import { getInstagramCommentSchema } from '../Agent/schema';

async function testCharacter() {
    const testPosts = [
        "Just finished my first 5K run! Feeling exhausted but proud 🏃‍♀️",
        "Struggling to stay motivated with my fitness goals...",
        "Check out my meal prep for the week! #healthy #mealprep",
        "New deadlift PR today! Form check please? 💪"
    ];
    
    console.log("Testing FitCoach Pro character...\n");
    
    for (const post of testPosts) {
        const schema = getInstagramCommentSchema();
        const prompt = `As FitCoach Pro, create an engaging comment for: "${post}"`;
        
        try {
            const response = await runAgent(schema, prompt);
            console.log(`Post: ${post}`);
            console.log(`Response: ${response[0]?.comment}`);
            console.log(`Viral Rate: ${response[0]?.viralRate}/100`);
            console.log('---\n');
        } catch (error) {
            console.error(`Error testing post: ${post}`, error);
        }
    }
}

testCharacter();
```

### Step 4: Character Refinement

Based on test results, refine your character:

```typescript
// Character improvement process
interface CharacterMetrics {
    response_quality: number;
    authenticity_score: number;
    engagement_potential: number;
    brand_alignment: number;
}

function evaluateCharacterPerformance(responses: string[]): CharacterMetrics {
    return {
        response_quality: analyzeQuality(responses),
        authenticity_score: measureAuthenticity(responses),
        engagement_potential: predictEngagement(responses),
        brand_alignment: checkBrandConsistency(responses)
    };
}
```

## Advanced Character Features

### 1. Contextual Adaptation

Enable your character to adapt based on context:

```json
{
  "contextual_adaptations": {
    "time_of_day": {
      "morning": "more energetic and motivational",
      "evening": "more reflective and supportive"
    },
    "post_type": {
      "achievement": "celebratory and encouraging",
      "struggle": "supportive and helpful",
      "question": "informative and actionable"
    },
    "user_level": {
      "beginner": "more explanatory and encouraging",
      "intermediate": "more specific and challenging",
      "advanced": "more technical and collaborative"
    }
  }
}
```

### 2. Learning and Evolution

Track character performance and evolution:

```json
{
  "learning_config": {
    "feedback_sources": ["engagement_rates", "user_responses", "manual_review"],
    "adaptation_frequency": "weekly",
    "performance_tracking": {
      "engagement_rate": "track average likes/replies per comment",
      "response_quality": "manual quality assessment",
      "brand_consistency": "alignment with brand voice"
    }
  }
}
```

### 3. Multi-Platform Support

Design characters for multiple platforms:

```json
{
  "platform_adaptations": {
    "instagram": {
      "max_length": 300,
      "emoji_usage": "moderate",
      "hashtag_strategy": "2-3 relevant hashtags"
    },
    "twitter": {
      "max_length": 280,
      "emoji_usage": "minimal", 
      "hashtag_strategy": "1-2 trending hashtags"
    },
    "linkedin": {
      "max_length": 500,
      "tone": "more professional",
      "emoji_usage": "minimal"
    }
  }
}
```

## Character Management

### 1. Character Registry

Organize and manage multiple characters:

```typescript
// CharacterManager.ts
export class CharacterManager {
    private characters: Map<string, Character> = new Map();
    
    async loadCharacter(characterId: string): Promise<Character> {
        if (!this.characters.has(characterId)) {
            const characterData = await this.loadCharacterFile(characterId);
            const character = new Character(characterData);
            this.characters.set(characterId, character);
        }
        
        return this.characters.get(characterId)!;
    }
    
    async updateCharacter(characterId: string, updates: Partial<CharacterConfig>): Promise<void> {
        const character = await this.loadCharacter(characterId);
        character.update(updates);
        await this.saveCharacterFile(characterId, character.config);
    }
    
    listCharacters(): string[] {
        return Array.from(this.characters.keys());
    }
}
```

### 2. Character Versioning

Maintain character versions for rollback and testing:

```typescript
interface CharacterVersion {
    version: string;
    timestamp: string;
    changes: string[];
    performance_data?: PerformanceMetrics;
}

export class CharacterVersionManager {
    async saveVersion(characterId: string, config: CharacterConfig): Promise<string> {
        const version = this.generateVersionId();
        const versionData: CharacterVersion = {
            version,
            timestamp: new Date().toISOString(),
            changes: this.detectChanges(characterId, config)
        };
        
        await this.saveVersionFile(characterId, version, { config, metadata: versionData });
        return version;
    }
    
    async rollbackToVersion(characterId: string, version: string): Promise<void> {
        const versionData = await this.loadVersionFile(characterId, version);
        await this.saveCharacterFile(characterId, versionData.config);
    }
}
```

### 3. A/B Testing Characters

Compare character performance:

```typescript
export class CharacterTester {
    async runABTest(characterA: string, characterB: string, testDuration: number): Promise<TestResults> {
        const testPosts = await this.getTestPosts();
        const resultsA = await this.testCharacterPerformance(characterA, testPosts);
        const resultsB = await this.testCharacterPerformance(characterB, testPosts);
        
        return {
            winner: this.determineWinner(resultsA, resultsB),
            metrics: {
                characterA: resultsA,
                characterB: resultsB
            },
            recommendation: this.generateRecommendation(resultsA, resultsB)
        };
    }
}
```

## Best Practices

### 1. Character Authenticity

- **Stay Consistent**: Maintain the same voice and personality across all interactions
- **Avoid Generic Responses**: Each character should have unique patterns
- **Cultural Sensitivity**: Ensure characters respect diverse audiences
- **Value-First**: Always prioritize providing value over just engagement

### 2. Performance Optimization

- **Monitor Engagement**: Track likes, replies, and follower growth
- **Response Quality**: Regularly review generated comments for quality
- **Brand Alignment**: Ensure character aligns with your brand values
- **Safety Checks**: Implement safeguards against inappropriate content

### 3. Ethical Considerations

- **Transparency**: Consider disclosing AI-generated content when appropriate
- **Respect Boundaries**: Don't engage in sensitive or personal discussions
- **Platform Compliance**: Ensure characters follow platform community guidelines
- **User Privacy**: Respect user privacy and don't collect personal information

## Troubleshooting

### Common Character Issues

#### Generic Responses

**Problem**: Character generates bland, generic comments
**Solution**: 
- Strengthen the system prompt with specific examples
- Add more personality traits and response patterns
- Include example responses in the character configuration

#### Inconsistent Personality

**Problem**: Character behavior varies too much between responses
**Solution**:
- Simplify personality traits to 3-5 core characteristics
- Provide clear communication style guidelines
- Test with consistent prompts to validate behavior

#### Low Engagement

**Problem**: Character comments don't generate engagement
**Solution**:
- Analyze successful comments in your niche
- Adjust engagement focus in content guidelines
- Test different communication styles and tones

## Next Steps

After creating your custom character:

1. **[Training the AI](training-ai.md)** - Enhance your character with training data
2. **[Instagram Bot Guide](instagram-bot.md)** - Deploy your character in automation
3. **[Development Setup](../development/setup.md)** - Set up advanced development environment
4. **[Adding Features](../development/adding-features.md)** - Extend character capabilities

---

**Ready to deploy your character?** Continue to [Instagram Bot Guide](instagram-bot.md) →
