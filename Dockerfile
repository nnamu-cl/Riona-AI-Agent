# STAGE 1: Dependencies and Build
# Use an official Node.js runtime. 'slim' variants are Debian-based, offering a good balance
# of size and compatibility for native dependencies often required by Puppeteer/Playwright.
# Ensure Node 18 is compatible with all your project dependencies.
FROM node:18-slim AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or other lock files if you use yarn/pnpm)
COPY package*.json ./

# Install all dependencies. This includes:
# - Production dependencies
# - Development dependencies if they were listed in 'dependencies' (like typescript, copyfiles in your case)
# - Puppeteer and Playwright, which will also attempt to download their respective browser binaries.
RUN npm install

# Copy the rest of your application's source code into the image
COPY . .

# Build the application:
# 1. Compile TypeScript to JavaScript (output to 'build' directory)
RUN npx tsc
# 2. Run the postbuild script (copies character JSON files to 'build/Agent/characters/')
RUN npm run postbuild

# STAGE 2: Production Runner
# Start from a fresh Node.js slim image for the production environment
FROM node:18-slim AS runner

# Set the environment to production
ENV NODE_ENV=production
# The PORT environment variable will be used by your application (defaults to 3000 if not set)
# You can set it here or when running the container, e.g., ENV PORT=3000

# Set the working directory
WORKDIR /usr/src/app

# Install OS-level dependencies required by Puppeteer and Playwright to run headless browsers.
# This list is for Debian-based systems (like node:18-slim).
# For the most up-to-date list, always refer to the official Puppeteer and Playwright documentation.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    # Clean up apt cache to reduce image size
    && rm -rf /var/lib/apt/lists/*

# Copy necessary artifacts from the 'builder' stage:
# 1. The compiled application code (the 'build' directory)
COPY --from=builder /usr/src/app/build ./build
# 2. The 'node_modules' directory (which includes production dependencies and browser binaries)
COPY --from=builder /usr/src/app/node_modules ./node_modules
# 3. Copy package.json for metadata (optional, but good practice)
COPY package.json .

# Expose the port your application listens on.
# Your app uses process.env.PORT || 3000. This informs Docker the container listens on this port.
# You'll still need to map it with -p when running the container.
EXPOSE ${PORT:-3000}

# Define the command to run your application.
# This is taken from the last part of your 'start' script in package.json.
CMD ["node", "build/index.js"]