# Training the AI 🎓

Learn how to train and customize your Instagram AI Agent with various data sources to create unique personalities and improve response quality.

## Overview

The AI training system allows you to enhance your agent's personality and knowledge by processing various types of content:

- **YouTube Videos** - Extract speaking patterns and vocabulary
- **Audio Files** - Analyze tone and conversational style  
- **Documents** - Process knowledge from PDFs, DOCs, and text files
- **Websites** - Scrape and learn from web content

## Training Data Sources

### 1. YouTube Video Training

Extract personality traits and vocabulary from YouTube content:

#### Usage
```bash
# Run YouTube training script
npm run train:link

# Or direct execution
tsc && node build/Agent/training/youtubeURL.js
```

#### Configuration
Edit `src/Agent/training/youtubeURL.ts`:

```typescript
// Example YouTube video processing
const videoUrl = "https://www.youtube.com/watch?v=your_video_id";

async function processYouTubeVideo(url: string) {
    // 1. Extract transcript from YouTube video
    const transcript = await YouTubeTranscript.fetchTranscript(url);
    
    // 2. Clean and process text
    const cleanedText = transcript
        .map(entry => entry.text)
        .join(' ')
        .replace(/\[.*?\]/g, '') // Remove timestamps
        .trim();
    
    // 3. Analyze speaking patterns
    const analysis = {
        vocabulary: extractKeyTerms(cleanedText),
        tone: analyzeTone(cleanedText),
        topics: extractTopics(cleanedText),
        style: analyzeStyle(cleanedText)
    };
    
    return analysis;
}
```

#### Best Practices
- **Choose Relevant Content**: Select videos that match your desired character personality
- **Diverse Sources**: Use multiple videos to avoid overfitting to one style
- **Length Matters**: Longer videos (10+ minutes) provide better training data
- **Quality Over Quantity**: Better to use 3-5 high-quality videos than 20 poor ones

### 2. Audio File Training

Train with audio content to capture tone and conversational patterns:

#### Usage
```bash
# Run audio training script
npm run train:audio

# Or direct execution  
tsc && node build/Agent/training/TrainWithAudio.js
```

#### Supported Formats
- **MP3** - Most common format
- **WAV** - High quality audio
- **M4A** - Apple audio format
- **OGG** - Open source format

#### Configuration
```typescript
// src/Agent/training/TrainWithAudio.ts
async function processAudioFile(audioPath: string) {
    // 1. Convert audio to text using speech-to-text
    const transcription = await convertSpeechToText(audioPath);
    
    // 2. Analyze emotional markers and tone
    const toneAnalysis = {
        emotionalMarkers: extractEmotions(transcription),
        speakingPace: analyzePace(transcription),
        enthusiasm: measureEnthusiasm(transcription),
        formality: assessFormality(transcription)
    };
    
    // 3. Extract conversational patterns
    const patterns = {
        questionStyle: analyzeQuestions(transcription),
        responsePatterns: extractResponses(transcription),
        transitionWords: findTransitions(transcription)
    };
    
    return { transcription, toneAnalysis, patterns };
}
```

#### Tips for Audio Training
- **Clear Audio Quality**: Use high-quality recordings for better transcription
- **Diverse Speakers**: Include different speakers if training for versatility
- **Contextual Content**: Choose audio relevant to your target engagement style
- **Language Consistency**: Ensure audio matches your target language and dialect

### 3. Document Training

Process text documents to build knowledge and writing style:

#### Usage
```bash
# Run document training
npm run train-model

# Or direct execution
tsc && node build/Agent/training/FilesTraining.js
```

#### Supported Document Types

| Format | Purpose | Example Use Cases |
|--------|---------|-------------------|
| **PDF** | Research papers, guides | Technical knowledge, formal writing style |
| **DOCX** | Business documents | Professional communication patterns |
| **TXT** | Raw text content | Social media posts, informal writing |
| **DOC** | Legacy documents | Historical writing samples |

#### Configuration
```typescript
// src/Agent/training/FilesTraining.ts
async function processDocument(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();
    let text = '';
    
    // 1. Extract text based on file type
    switch (extension) {
        case '.pdf':
            text = await pdfParse(fs.readFileSync(filePath));
            break;
        case '.docx':
            const result = await mammoth.extractRawText({path: filePath});
            text = result.value;
            break;
        case '.txt':
            text = fs.readFileSync(filePath, 'utf8');
            break;
    }
    
    // 2. Analyze content structure
    const analysis = {
        topics: extractTopics(text),
        writingStyle: analyzeWritingStyle(text),
        vocabulary: buildVocabulary(text),
        concepts: extractKeyConcepts(text)
    };
    
    return analysis;
}
```

#### Document Selection Guidelines
- **Relevance**: Choose documents related to your target engagement topics
- **Quality**: Use well-written, professionally edited content
- **Variety**: Mix formal and informal writing styles
- **Recency**: Include recent content for current language patterns

### 4. Website Scraping

Extract knowledge and communication patterns from websites:

#### Usage
```bash
# Run website scraping training
tsc && node build/Agent/training/WebsiteScraping.js
```

#### Target Website Types
- **Blogs and Articles** - Writing style and topic knowledge
- **Social Media Posts** - Casual communication patterns  
- **Professional Sites** - Formal business communication
- **Forums and Communities** - Conversational patterns

#### Configuration
```typescript
// src/Agent/training/WebsiteScraping.ts
async function scrapeWebsite(url: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // 1. Extract main content
        const content = await page.evaluate(() => {
            // Remove navigation, ads, and irrelevant content
            const mainContent = document.querySelector('main, article, .content') || 
                               document.body;
            
            // Clean up the text
            return mainContent?.textContent
                ?.replace(/\s+/g, ' ')
                ?.trim() || '';
        });
        
        // 2. Analyze content themes and style
        const analysis = {
            themes: extractThemes(content),
            style: analyzeWebWritingStyle(content),
            structure: analyzeContentStructure(content),
            keywords: extractKeywords(content)
        };
        
        return analysis;
        
    } finally {
        await browser.close();
    }
}
```

#### Website Selection Best Practices
- **Reputable Sources**: Use high-quality, trusted websites
- **Relevant Content**: Match your target engagement style and topics
- **Current Content**: Focus on recent posts for contemporary language
- **Diverse Perspectives**: Include various viewpoints and writing styles

## Training Workflow

### 1. Prepare Training Data

Create a structured approach to organizing your training materials:

```bash
# Create training data directory structure
mkdir -p src/Agent/training/data/{youtube,audio,documents,websites}

# Organize files by type
src/Agent/training/data/
├── youtube/
│   ├── video_urls.txt
│   └── transcripts/
├── audio/
│   ├── interviews.mp3
│   ├── podcasts.wav
│   └── speeches.m4a
├── documents/
│   ├── guides.pdf
│   ├── articles.docx
│   └── posts.txt
└── websites/
    └── urls.txt
```

### 2. Run Training Pipeline

Execute training in the correct order:

```bash
# 1. Process documents first (foundational knowledge)
npm run train-model

# 2. Add audio training (tone and style)
npm run train:audio

# 3. Include YouTube content (personality)
npm run train:link

# 4. Scrape websites (current patterns)
tsc && node build/Agent/training/WebsiteScraping.js
```

### 3. Validate Training Results

After training, test the enhanced character:

```typescript
// Test enhanced character responses
async function testTrainingResults() {
    const testPrompts = [
        "Amazing sunset at the beach! 🌅",
        "Just launched my new startup, excited for the journey!",
        "Working on some challenging code today 💻",
        "Beautiful art exhibition opening tonight ✨"
    ];
    
    for (const prompt of testPrompts) {
        const schema = getInstagramCommentSchema();
        const aiPrompt = `Craft a thoughtful comment for: "${prompt}"`;
        const response = await runAgent(schema, aiPrompt);
        
        console.log(`\nPrompt: ${prompt}`);
        console.log(`Response: ${response[0]?.comment}`);
        console.log(`Viral Rate: ${response[0]?.viralRate}/100`);
    }
}
```

## Character Enhancement

### 1. Merge Training Data

Combine insights from multiple training sources:

```typescript
// Enhanced character creation
function createEnhancedCharacter(baseCharacter: any, trainingData: any) {
    return {
        ...baseCharacter,
        personality: {
            ...baseCharacter.personality,
            enhanced_traits: trainingData.personalityTraits,
            vocabulary_expansion: trainingData.vocabulary,
            tone_preferences: trainingData.toneAnalysis
        },
        training_metadata: {
            sources: trainingData.sources,
            training_date: new Date().toISOString(),
            confidence_score: calculateConfidenceScore(trainingData)
        }
    };
}
```

### 2. A/B Testing Characters

Compare performance between trained and base characters:

```typescript
// Character comparison framework
async function compareCharacters(originalChar: any, trainedChar: any) {
    const testScenarios = loadTestScenarios();
    const results = {
        original: [],
        trained: []
    };
    
    for (const scenario of testScenarios) {
        // Test original character
        const originalResponse = await generateWithCharacter(originalChar, scenario);
        results.original.push(originalResponse);
        
        // Test trained character  
        const trainedResponse = await generateWithCharacter(trainedChar, scenario);
        results.trained.push(trainedResponse);
    }
    
    return analyzePerformanceDifference(results);
}
```

## Quality Assurance

### 1. Response Quality Metrics

Monitor training effectiveness:

```typescript
// Quality assessment framework
function assessResponseQuality(response: any) {
    const metrics = {
        relevance: calculateRelevance(response.comment),
        authenticity: measureAuthenticity(response.comment),
        engagement: predictEngagement(response.comment),
        appropriateness: checkAppropriateness(response.comment),
        viralPotential: response.viralRate
    };
    
    const overallScore = Object.values(metrics).reduce((a, b) => a + b) / 5;
    return { metrics, overallScore };
}
```

### 2. Content Filtering

Ensure training doesn't introduce problematic patterns:

```typescript
// Content safety validation
function validateTrainingContent(content: string): boolean {
    const prohibitedPatterns = [
        /spam/i,
        /follow.*for.*follow/i,
        /check.*my.*profile/i,
        /buy.*now/i,
        /click.*link/i
    ];
    
    const inappropriateTopics = [
        'politics', 'religion', 'controversial',
        'adult content', 'illegal activities'
    ];
    
    // Check for spam patterns
    if (prohibitedPatterns.some(pattern => pattern.test(content))) {
        return false;
    }
    
    // Check for inappropriate topics
    if (inappropriateTopics.some(topic => 
        content.toLowerCase().includes(topic))) {
        return false;
    }
    
    return true;
}
```

## Advanced Training Techniques

### 1. Incremental Learning

Continuously improve your character:

```typescript
// Incremental training approach
class IncrementalTrainer {
    private character: any;
    private trainingHistory: any[] = [];
    
    async addTrainingData(newData: any) {
        // 1. Validate new data quality
        const isValid = this.validateNewData(newData);
        if (!isValid) return false;
        
        // 2. Merge with existing knowledge
        this.character = this.mergeKnowledge(this.character, newData);
        
        // 3. Record training step
        this.trainingHistory.push({
            timestamp: new Date(),
            dataSource: newData.source,
            improvements: this.measureImprovement()
        });
        
        return true;
    }
    
    private measureImprovement(): any {
        // Compare recent responses to previous versions
        return {
            relevanceImprovement: 0.05,
            styleConsistency: 0.93,
            vocabularyExpansion: 15
        };
    }
}
```

### 2. Domain-Specific Training

Optimize for specific Instagram niches:

```typescript
// Niche-specific training configurations
const trainingConfigs = {
    fitness: {
        keywords: ['workout', 'fitness', 'health', 'motivation'],
        tone: 'energetic and encouraging',
        hashtags: ['#fitness', '#workout', '#motivation'],
        responseStyle: 'supportive and goal-oriented'
    },
    
    tech: {
        keywords: ['coding', 'technology', 'innovation', 'startup'],
        tone: 'analytical and forward-thinking',
        hashtags: ['#tech', '#innovation', '#coding'],
        responseStyle: 'insightful and technical'
    },
    
    art: {
        keywords: ['creative', 'artistic', 'beautiful', 'inspiring'],
        tone: 'appreciative and expressive',
        hashtags: ['#art', '#creative', '#inspiration'],
        responseStyle: 'emotional and descriptive'
    }
};
```

## Troubleshooting Training Issues

### Common Problems

#### "Low Quality Training Data"
```bash
# Solutions:
1. Review source material quality
2. Ensure content relevance to target audience
3. Check for spelling/grammar errors in source material
4. Verify file formats are supported
5. Test with smaller, high-quality datasets first
```

#### "Character Responses Too Generic"
```bash
# Solutions:
1. Add more personality-specific training data
2. Include diverse content types (audio + text + video)
3. Focus on unique vocabulary and speaking patterns
4. Increase training data volume
5. Fine-tune character configuration files
```

#### "Training Script Failures"
```bash
# Solutions:
1. Check file paths and permissions
2. Verify internet connection for YouTube/website scraping
3. Ensure all dependencies are installed
4. Review error logs for specific issues
5. Test individual training components separately
```

### Performance Optimization

#### Memory Management
```typescript
// Optimize training for large datasets
const trainingConfig = {
    batchSize: 50,           // Process in smaller batches
    maxFileSize: 10 * 1024 * 1024, // 10MB limit per file
    timeoutMs: 30000,        // 30 second timeout per operation
    retryAttempts: 3         // Retry failed operations
};
```

#### Speed Optimization
```bash
# Parallel processing for multiple files
find src/Agent/training/data -name "*.txt" | xargs -n 1 -P 4 node process-file.js
```

## Best Practices

### 1. Training Data Curation

- **Quality over Quantity**: Better to have 10 high-quality sources than 100 poor ones
- **Diverse Perspectives**: Include various viewpoints and communication styles  
- **Current Content**: Keep training data recent and relevant
- **Balanced Sources**: Mix formal and informal content appropriately

### 2. Iterative Improvement

- **Regular Updates**: Add new training data monthly
- **Performance Monitoring**: Track response quality metrics
- **A/B Testing**: Compare character versions systematically
- **User Feedback**: Monitor actual engagement results

### 3. Safety and Ethics

- **Content Filtering**: Remove inappropriate or problematic content
- **Bias Awareness**: Check for and mitigate training data biases
- **Platform Compliance**: Ensure training aligns with Instagram guidelines
- **Privacy Respect**: Don't train on private or copyrighted content

## Next Steps

After training your AI:

1. **[Create Custom Characters](custom-characters.md)** - Build unique AI personalities
2. **[Instagram Bot Guide](instagram-bot.md)** - Apply your trained character
3. **[API Reference](../api/core.md)** - Understand the technical implementation
4. **[Development Setup](../development/setup.md)** - Set up for advanced customization

---

**Ready to create custom characters?** Continue to [Custom Characters Guide](custom-characters.md) → 