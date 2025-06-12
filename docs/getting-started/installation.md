# Installation Guide 🛠️

Complete installation instructions for setting up the Instagram AI Agent development environment.

## System Requirements

### Operating System
- **Windows**: Windows 10/11 (WSL2 recommended)
- **macOS**: macOS 10.15+ (Catalina or later)
- **Linux**: Ubuntu 18.04+, Debian 10+, or equivalent

### Required Software

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|---------|
| **Node.js** | 18.0+ | 20.0+ | JavaScript runtime |
| **npm** | 8.0+ | 10.0+ | Package manager |
| **Git** | 2.20+ | Latest | Version control |
| **Docker** | 20.10+ | Latest | MongoDB container |

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 4GB | 8GB+ |
| **Storage** | 5GB free | 10GB+ free |
| **CPU** | 2 cores | 4+ cores |
| **Network** | Stable internet | High-speed connection |

## Pre-Installation Setup

### 1. Install Node.js

=== "Windows"
    ```bash
    # Using Chocolatey (recommended)
    choco install nodejs
    
    # Or download from official site
    # Visit: https://nodejs.org/en/download/
    ```

=== "macOS"
    ```bash
    # Using Homebrew (recommended)
    brew install node
    
    # Or using MacPorts
    sudo port install nodejs18
    ```

=== "Linux (Ubuntu/Debian)"
    ```bash
    # Using NodeSource repository (recommended)
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    node --version
    npm --version
    ```

### 2. Install Git

=== "Windows"
    ```bash
    # Using Chocolatey
    choco install git
    
    # Or download from: https://git-scm.com/download/win
    ```

=== "macOS"
    ```bash
    # Using Homebrew
    brew install git
    
    # Or using Xcode Command Line Tools
    xcode-select --install
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    sudo apt update
    sudo apt install git
    
    # CentOS/RHEL
    sudo yum install git
    ```

### 3. Install Docker

=== "Windows"
    1. Download [Docker Desktop for Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
    2. Run installer and follow setup wizard
    3. Enable WSL2 backend when prompted
    4. Restart computer when installation completes

=== "macOS"
    ```bash
    # Using Homebrew
    brew install --cask docker
    
    # Or download Docker Desktop from:
    # https://desktop.docker.com/mac/main/amd64/Docker.dmg
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    newgrp docker
    
    # Start Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    ```

## Project Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/david-patrick-chuks/Instagram-AI-Agent.git

# Navigate to project directory
cd Instagram-AI-Agent

# Check repository status
git status
```

### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install

# Verify installation
npm list --depth=0
```

!!! warning "Node Version Compatibility"
    If you encounter dependency issues, ensure you're using Node.js 18+ and npm 8+:
    ```bash
    node --version  # Should be v18.0.0 or higher
    npm --version   # Should be 8.0.0 or higher
    ```

### 3. Install Global Tools (Optional)

For development convenience:

```bash
# TypeScript compiler (if not already installed)
npm install -g typescript

# Process manager for development
npm install -g pm2

# MkDocs for documentation (if editing docs)
pip install mkdocs-material
```

## Database Setup

### Option 1: Docker MongoDB (Recommended)

```bash
# Pull MongoDB image
docker pull mongodb/mongodb-community-server:latest

# Create and run MongoDB container
docker run -d \
  --name instagram-ai-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongodb/mongodb-community-server:latest

# Verify container is running
docker ps
```

### Option 2: Local MongoDB Installation

=== "Windows"
    1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
    2. Run installer with default settings
    3. MongoDB will run as a Windows service automatically

=== "macOS"
    ```bash
    # Using Homebrew
    brew tap mongodb/brew
    brew install mongodb-community
    
    # Start MongoDB service
    brew services start mongodb/brew/mongodb-community
    ```

=== "Linux"
    ```bash
    # Ubuntu/Debian
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt update
    sudo apt install mongodb-org
    
    # Start MongoDB service
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```

### Verify Database Connection

```bash
# Test connection using Docker
docker exec -it instagram-ai-mongodb mongosh

# Or test with local installation
mongosh

# In MongoDB shell, run:
# > show dbs
# > exit
```

## Environment Configuration

### 1. Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Or create manually if .env.example doesn't exist
touch .env
```

### 2. Get Required API Keys

#### Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

#### Instagram Credentials

Use your existing Instagram account credentials:
- Username (without @ symbol)
- Password

!!! danger "Security Warning"
    - Use a dedicated Instagram account for automation
    - Never commit credentials to version control
    - Consider using a test account for development

### 3. Configure Environment Variables

Edit your `.env` file:

```env
# Instagram Authentication
IGusername=your_instagram_username
IGpassword=your_instagram_password

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/instagram-ai-agent

# Server Configuration (optional)
PORT=3000

# Logging Configuration (optional)
LOG_LEVEL=info

# Proxy Configuration (optional)
PROXY_HOST=
PROXY_PORT=
PROXY_USERNAME=
PROXY_PASSWORD=
```

## Build and Test Installation

### 1. Compile TypeScript

```bash
# Compile TypeScript to JavaScript
npm run build

# Or use TypeScript compiler directly
tsc
```

### 2. Verify Build

```bash
# Check build directory exists
ls -la build/

# Verify main files are compiled
ls build/index.js build/app.js
```

### 3. Test Basic Functionality

```bash
# Run a quick test (this won't start the full automation)
npm test

# Or test compilation and basic imports
node -e "console.log('Installation test successful')"
```

## Post-Installation Verification

### 1. Check Dependencies

```bash
# Verify all dependencies are installed
npm audit

# Check for security vulnerabilities
npm audit fix
```

### 2. Test Database Connection

```bash
# Start MongoDB (if using Docker)
docker start instagram-ai-mongodb

# Test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test')
  .then(() => { console.log('✅ Database connection successful'); process.exit(0); })
  .catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });
"
```

### 3. Verify AI Integration

```bash
# Test Google Gemini API connection (requires valid API key)
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'test');
console.log('✅ Gemini AI SDK loaded successfully');
"
```

## Troubleshooting Installation Issues

### Common Issues

#### "npm install" fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try using different registry
npm install --registry https://registry.npmjs.org/
```

#### TypeScript compilation errors

```bash
# Install TypeScript globally
npm install -g typescript

# Check TypeScript version
tsc --version

# Compile with verbose output
tsc --listFiles
```

#### Docker MongoDB won't start

```bash
# Check if port 27017 is in use
netstat -tulpn | grep :27017

# Remove existing container and recreate
docker rm -f instagram-ai-mongodb
docker run -d --name instagram-ai-mongodb -p 27017:27017 mongodb/mongodb-community-server:latest

# Check container logs
docker logs instagram-ai-mongodb
```

#### Permission errors (Linux/macOS)

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix project directory permissions
sudo chown -R $(whoami) /path/to/Instagram-AI-Agent

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Environment-Specific Issues

=== "Windows"
    **PowerShell Execution Policy**
    ```powershell
    # Enable script execution
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```
    
    **Windows Defender**
    - Add project folder to Windows Defender exclusions
    - Puppeteer may be flagged as malware

=== "macOS"
    **Xcode Command Line Tools**
    ```bash
    # Install if missing
    xcode-select --install
    ```
    
    **Homebrew Issues**
    ```bash
    # Update Homebrew
    brew update
    brew doctor
    ```

=== "Linux"
    **Missing Build Tools**
    ```bash
    # Ubuntu/Debian
    sudo apt install build-essential
    
    # CentOS/RHEL
    sudo yum groupinstall "Development Tools"
    ```

## Performance Optimization

### 1. Node.js Optimization

```bash
# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max-old-space-size=4096"

# Add to your shell profile (.bashrc, .zshrc)
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
```

### 2. System Optimization

- **Close unnecessary applications** during automation
- **Ensure stable internet connection** for Instagram interactions
- **Use SSD storage** for better I/O performance
- **Allocate sufficient RAM** to Docker containers

## Next Steps

✅ **Installation Complete!** Now you can:

1. **[Configure the Application](configuration.md)** - Set up advanced settings
2. **[Quick Start Guide](quick-start.md)** - Run your first automation
3. **[Architecture Overview](../architecture/overview.md)** - Understand how it works

## Getting Help

If you encounter issues:

1. **Check logs**: Look in the `logs/` directory
2. **Review error messages**: Most errors include helpful information
3. **Consult documentation**: Check relevant sections for specific components
4. **Community support**: Open an issue on GitHub with detailed error information

---

**Ready to configure your agent?** Continue to [Configuration Guide](configuration.md) → 