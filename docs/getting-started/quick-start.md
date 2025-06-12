# Quick Start Guide ⚡

Get your Instagram AI Agent running in under 10 minutes!

## Prerequisites

- Node.js 18+ installed
- Instagram account credentials
- Google Gemini API key
- MongoDB instance (Docker recommended)

## 🚀 1. Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/david-patrick-chuks/Instagram-AI-Agent.git
cd Instagram-AI-Agent

# 2. Install dependencies
npm install
```

## 🔧 2. Quick Configuration

Create your environment file:

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Instagram credentials
IGusername=your_instagram_username
IGpassword=your_instagram_password

# Google Gemini AI API key
GEMINI_API_KEY=your_gemini_api_key

# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent
```

!!! tip "Get Gemini API Key"
    Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your free Gemini API key.

## 🗄️ 3. Start MongoDB (Docker)

The fastest way to get MongoDB running:

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name instagram-ai-mongodb \
  mongodb/mongodb-community-server:latest

# Verify it's running
docker ps
```

## 🎭 4. Choose Your AI Character

When you first run the agent, you'll be prompted to select a character:

```
Select a character:
1: ArcanEdge.System.Agent.json
2: elon.character.json  
3: sample.character.json
Enter the number of your choice: 2
```

!!! info "Character Personalities"
    - **ArcanEdge**: Technical, professional tone
    - **Elon**: Entrepreneurial, visionary style
    - **Sample**: Basic template for customization

## 🏃‍♂️ 5. Run the Agent

```bash
# Start the Instagram AI Agent
npm start
```

## 📱 6. Watch It Work

The agent will:

1. **Launch Browser**: Opens Instagram in a stealth browser
2. **Login**: Uses your credentials or saved cookies
3. **Navigate Feed**: Scrolls through Instagram posts
4. **Generate Comments**: AI analyzes posts and creates contextual comments
5. **Interact**: Likes posts and leaves thoughtful comments

## 🎯 Expected Output

```
[INFO] Server is running on port 3000
[INFO] Character selected: elon.character.json
[INFO] Checking cookies existence: false
[INFO] Logging in with credentials...
[INFO] Cookies saved after login
[INFO] Starting Instagram agent iteration...
Caption for post 1: Amazing sunset at the beach! 🌅
Commenting on post 1...
Comment posted on post 1.
Post 1 liked.
Waiting 7 seconds before moving to the next post...
```

## 🔧 Basic Customization

### Adjust Interaction Limits

Edit `src/client/Instagram.ts`:

```typescript
// 1. Change maximum posts to interact with
const maxPosts = 10; // Default: 50

// 2. Adjust wait time between interactions  
const waitTime = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
```

### Modify Comment Style

The AI generates comments based on the selected character. For quick style changes:

```typescript
// In src/client/Instagram.ts, modify the prompt
const prompt = `Create a brief, friendly comment for: "${caption}". 
Keep it under 200 characters and make it genuine.`;
```

## 🛑 Stopping the Agent

- **Keyboard**: Press `Ctrl+C` in the terminal
- **Graceful**: The agent handles shutdown signals automatically
- **Browser**: The browser window will close automatically

## 📊 Monitoring

Check the logs directory for detailed activity:

```bash
# View recent logs
tail -f logs/application-2024-01-15.log

# Check for errors
grep ERROR logs/application-2024-01-15.log
```

## 🆘 Quick Troubleshooting

### "Login Failed"
- ✅ Verify Instagram credentials in `.env`
- ✅ Check if Instagram requires verification (check email/SMS)
- ✅ Ensure account isn't restricted

### "No API Key Available"
- ✅ Add `GEMINI_API_KEY` to `.env` file
- ✅ Verify API key is valid at [Google AI Studio](https://makersuite.google.com/)

### "Database Connection Failed"
- ✅ Ensure MongoDB is running: `docker ps`
- ✅ Check MongoDB URI in `.env`
- ✅ Start MongoDB: `docker start instagram-ai-mongodb`

### "Character Selection Error"
- ✅ Ensure character JSON files exist in `src/Agent/characters/`
- ✅ Check file permissions
- ✅ Verify JSON syntax is valid

## ⚡ Performance Tips

### Optimize for Speed
```bash
# Use development mode for faster TypeScript compilation
npm run dev  # If available

# Or compile once and run
npm run build && node build/index.js
```

### Reduce Resource Usage
- Close unnecessary applications
- Use headless mode: Edit `src/client/Instagram.ts` and set `headless: true`
- Limit concurrent operations in the browser

## 🚀 Next Steps

Now that you're running:

1. **[Configure Advanced Settings](configuration.md)** - Customize behavior, proxies, and timing
2. **[Train Your AI](../guides/training-ai.md)** - Add personality with training data  
3. **[Create Custom Characters](../guides/custom-characters.md)** - Build unique AI personalities
4. **[Understand the Architecture](../architecture/overview.md)** - Learn how it all works

## 🎉 Success!

You now have a working Instagram AI Agent! The bot will continue running, engaging with posts using AI-generated comments that match your selected character's personality.

!!! success "Pro Tip"
    Let it run for 10-15 minutes to see the full interaction cycle. The AI learns and improves its responses based on the content it encounters.

---

**Having issues?** Check the [Configuration Guide](configuration.md) for detailed troubleshooting steps. 