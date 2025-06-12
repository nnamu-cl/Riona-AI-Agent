# Instagram Bot Guide 📱

**⚠️ Note**: This guide has been moved and expanded. Please use the new comprehensive guide at [Instagram Bot Guide](guides/instagram-bot.md).

## Quick Setup

For immediate setup, follow these essential steps:

### 1. Prerequisites & File Structure

Ensure your project has the following structure:

```
Instagram-AI-Agent/
├── .env                    # Environment variables (IGusername, IGpassword, etc.)
├── cookies/               # Directory for session cookies
│   └── Instagramcookies.json
├── src/
│   ├── secret/
│   │   └── index.ts       # Exports Instagram credentials  
│   ├── Agent/
│   │   ├── characters/    # AI personality definitions
│   │   └── training/      # Training data files (PDFs, MP3s, TXT, URLs)
│   └── client/
│       └── Instagram.ts   # Main Instagram automation logic
└── logs/                  # Application logs
```

## 2. Setup Checklist

### Credentials & Secret Management
- Place your Instagram credentials in the `.env` file:
  ```env
  IGusername=your_instagram_username
  IGpassword=your_instagram_password
  ```
- Ensure `src/secret/index.ts` exports these credentials correctly.

### Cookie Management
- On the first run, the bot will handle cookie creation automatically and store them in `cookies/Instagramcookies.json`.
- For subsequent runs, ensure the `cookies` directory exists to allow the bot to load valid sessions.

## 3. Agent Training Data Configuration

The bot uses training data to refine and tailor the comments it posts. In this context, "training" refers to the process where the bot:
- **Uses Input Data Types Such As:**
  - **Text Files (.txt):** Provide sample responses and templates.
  - **PDF Documents:** Contain technical documents or guidelines to improve response relevancy.
  - **Audio Files (.mp3):** Supply samples for tone and conversational style.
  - **URLs:** Allow scraping of website content for context.
- **Training Process:**
  1. Add your training files to `src/Agent/training/`.
  2. On execution, the bot processes these files to update its response generation model.
  3. The model updates periodically (e.g., weekly) as new data is added.
- **Customization:**
  - Modify the training data to adjust how the bot crafts its responses.
  - Supported formats offer flexibility in providing contextual data for improved accuracy.

## 4. Core Customization Points

### Comment Generation Engine
- **Location:** `src/Agent/schema/index.ts`
- **Details:**
  - Defines response length limits (e.g., 300 characters).
  - Sets tone rules to ensure responses are professional and empathetic.
  - Specifies banned topics or phrases, maintaining compliance with Instagram's community guidelines.

### Interaction Patterns
- **Location:** `src/client/Instagram.ts`
- **Configurable Parameters:**
  - **maxPosts:** The maximum number of posts the bot will interact with (default is 50).
  - **waitTime:** A randomized delay between interactions to mimic natural behavior.
  ```javascript
  const maxPosts = 50; // Maximum posts to process
  const waitTime = Math.floor(Math.random() * 5000) + 5000; // Delay range: 5 to 10 seconds
  ```

### Personality Configuration
- **Location:** `src/Agent/characters/`
- **Details:**
  - Customize the bot's personality by modifying JSON files.
  - Adjust vocabulary, tone, and emoji usage.
  - Set cultural reference preferences to better tailor interactions.
  - To use a new custom character:
    1. Add its JSON file to the `src/Agent/characters/` directory.
    2. Update the configuration in **`src/Agent/index.ts`**.
- **Example usage:**
  ```javascript
  // In src/Agent/index.ts:
  // Set the character file path to the custom character JSON file you created:
  const characterFile = 'src/Agent/characters/YourCustomCharacter.json';
  
  // Also, update the import statement to load your custom character:
  import character from './characters/YourCustomCharacter.json';
  ```

## 5. Running the Bot

Once the setup is complete:
1. Confirm that your credentials and training data are correctly placed.
2. Run the Instagram bot using your preferred method (e.g., via a start script or command line).
3. Monitor console logs to verify successful login and post interactions.
4. Check the `cookies/Instagramcookies.json` file after the first run for session management.

## 6. Additional Considerations

- **Safety & Rate Limiting:** The bot includes built-in delays and interaction limits to avoid spam-like behavior.
- **Proxy & Stealth Settings:** Proxy configurations and stealth plugins (configured in `src/client/Instagram.ts`) help reduce detection risks.
- **Maintenance:** Regularly update your training data in `src/Agent/training/` to keep the bot effective and engaging.
