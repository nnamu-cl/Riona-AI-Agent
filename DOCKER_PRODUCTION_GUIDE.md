# RIONA Backend System: Docker Production Readiness Guide

## 1. Introduction

This document outlines the critical architectural considerations and recommended changes to prepare the RIONA Instagram Agent backend system for a production-level Dockerized deployment. The current implementation, while functional for testing and single-instance use, requires refactoring to ensure stability, scalability, and resilience in a containerized environment.

## 2. Current Architecture Overview

The existing system consists of:
- An Express.js API server providing endpoints for agent control (`/start`, `/stop`, `/status`).
- An `ActivityLogger` service that records agent actions to a Supabase `agent_tracking` table.
- An `InstagramWithTracking` client that performs Instagram automation using Puppeteer.
- Global in-memory variables (`currentAgentId`, `shouldStopAgent`) to manage the state of a single running agent.
- Local file system usage for cookies and screenshots.

## 3. Key Challenges for Dockerization & Production

The current architecture presents several challenges when considering a Dockerized, production environment:

### 3.1. Global In-Memory State Management (Critical)
- **Problem**: The variables `currentAgentId` and `shouldStopAgent` in [`src/app.ts`](src/app.ts) are stored in the Node.js process memory.
- **Impact in Docker**:
    - **State Loss on Restart**: If a Docker container restarts (due to crashes, updates, or scaling events), this in-memory state is lost. The application will "forget" which agent was running or if it was signaled to stop.
    - **Inconsistency**: The Supabase database might indicate an agent is "active", but a newly restarted container instance won't have this information in its memory, leading to inconsistent behavior.
    - **Not Scalable**: If you run multiple instances of the container (e.g., for load balancing), each instance will have its own independent `currentAgentId`, making it impossible to manage agents cohesively.

### 3.2. Single Agent Limitation (Critical)
- **Problem**: The API logic in [`src/app.ts`](src/app.ts) explicitly prevents more than one agent from running concurrently within a single application instance (`if (currentAgentId) { ... return 409 Conflict ... }`).
- **Impact in Docker**:
    - **Underutilization of Resources**: Each Docker container, even if capable of handling more, will be restricted to a single agent. This means to run N agents, you'd need N containers, which is inefficient.
    - **Scaling Complexity**: Managing a large number of single-agent containers is more complex than managing fewer multi-agent containers.

### 3.3. Local File System Dependencies (Medium)
- **Problem**: The Instagram client in [`src/client/InstagramWithTracking.ts`](src/client/InstagramWithTracking.ts) uses the local file system for:
    - `cookiesPath = "./cookies/Instagramcookies.json"`
    - `await page.screenshot({ path: "logged_in.png" });`
- **Impact in Docker**:
    - **Data Volatility**: Files written to a container's ephemeral file system are lost when the container stops or restarts. Cookies and screenshots would disappear.
    - **Requires Volume Mounting**: To persist this data, Docker volumes would need to be configured, adding complexity.
    - **Concurrency Issues**: If multiple agents run in one container (after addressing 3.2), they might overwrite each other's cookie files or screenshots if paths are not uniquely managed.

### 3.4. Proxy Port Conflicts (Partially Addressed)
- **Problem**: The Instagram client uses `proxy-chain` on a network port. While dynamic port allocation was introduced (`8000 + Math.floor(Math.random() * 1000)`), this is not a robust solution for a multi-container or heavily used single-container environment.
- **Impact in Docker**:
    - **Port Exhaustion/Collision**: Random port selection can still lead to collisions, especially if many agents are started quickly or across multiple containers on the same host.
    - **Firewall/Networking Complexity**: Dynamically assigned ports can be harder to manage with container networking rules and firewalls.

## 4. Recommended Architectural Changes for Production

To address these challenges, the following refactoring is recommended:

### 4.1. Transition to Database-Driven State Management

**Goal**: Eliminate global in-memory state variables. The database should be the single source of truth for agent status.

**Implementation Steps**:

1.  **Remove Global Variables**: Delete `currentAgentId` and `shouldStopAgent` from [`src/app.ts`](src/app.ts).

2.  **Modify API Endpoints to Query Database**:
    *   **`/api/agent/start`**:
        - Instead of checking `currentAgentId`, query the `agent_tracking` table for an existing active record for the *specific* `agent_id` provided in the request.
        ```typescript
        // In app.ts - /api/agent/start
        const { agent_id, config = {} } = req.body;
        const existingActiveAgent = await supabaseService.select('agent_tracking', {
          filters: { agent_id: agent_id, status: 'active' },
          limit: 1
        });

        if (existingActiveAgent.length > 0) {
          return res.status(409).json({
            success: false,
            error: `Agent ${agent_id} is already active.`,
            agent_details: existingActiveAgent[0]
          });
        }
        // Proceed to initialize and start the agent...
        // ActivityLogger.initializeAgent will set status to 'active'
        ```

    *   **`/api/agent/stop`**:
        - This endpoint should accept an `agent_id` in the request body.
        - Instead of setting `shouldStopAgent = true`, directly update the specified agent's status to 'stopping' or 'stopped' in the `agent_tracking` table.
        ```typescript
        // In app.ts - /api/agent/stop
        const { agent_id } = req.body; // Expect agent_id to stop
        if (!agent_id) {
          return res.status(400).json({ error: 'agent_id is required' });
        }
        await ActivityLogger.stopAgent(agent_id); // This updates DB status to 'stopped'
        // The running agent instance will pick this up (see below)
        ```

    *   **Instagram Agent (`InstagramWithTracking.ts`)**:
        - The agent's main loop must periodically query its own status from the `agent_tracking` table to see if it should stop.
        ```typescript
        // In InstagramWithTracking.ts, inside interactWithPostsTracked loop
        async function shouldAgentStop(currentAgentId: string): Promise<boolean> {
            const record = await supabaseService.select('agent_tracking', {
                filters: { agent_id: currentAgentId },
                limit: 1
            });
            return record.length > 0 && record[0].status === 'stopped';
        }

        // In the loop:
        if (await shouldAgentStop(agentId)) {
            await ActivityLogger.logActivity(agentId, 'session_stopped_by_api_request', true, {});
            break; // Exit loop
        }
        ```

### 4.2. Enable Multi-Agent Support per Container

**Goal**: Allow a single container instance to manage multiple concurrent agent processes.

**Implementation Steps**:

1.  **Modify `/api/agent/start` Concurrency Check**: As shown in 4.1, the check should be for the *specific* `agent_id`, not a global "is any agent running?".

2.  **Manage Agent Processes**:
    - When an agent is started, the Node.js application will need to manage its lifecycle. This could involve:
        - Spawning child processes for each agent (using `child_process` module).
        - Using worker threads (`worker_threads` module) for CPU-bound or I/O-bound tasks within Puppeteer.
        - A more robust approach might involve a job queue system (e.g., BullMQ with Redis) if scaling requirements are high, though this adds complexity.
    - Each agent instance (`runInstagramWithTracking`) needs to be isolated.
    ```typescript
    // In app.ts - conceptual
    const runningAgents = new Map<string, AgentProcessType>(); // Store references to running agent processes/threads

    app.post('/api/agent/start', async (req, res) => {
        // ... (validation and existing agent check for this agent_id)
        
        // Launch the agent (e.g., as a child process or in a worker thread)
        const agentProcess = launchAgentInstance(agent_id, config); // Implement this function
        runningAgents.set(agent_id, agentProcess);

        // Handle agent completion/error within launchAgentInstance
        agentProcess.on('exit', (code) => {
            runningAgents.delete(agent_id);
            if (code !== 0) {
                ActivityLogger.logActivity(agent_id, 'agent_process_crashed', false, { exitCode: code });
                ActivityLogger.stopAgent(agent_id); // Ensure DB status is updated
            }
        });
        // ... (send response)
    });

    app.post('/api/agent/stop', async (req, res) => {
        const { agent_id } = req.body;
        // ... (validation)
        
        // 1. Update DB status to 'stopped' (via ActivityLogger.stopAgent)
        await ActivityLogger.stopAgent(agent_id);

        // 2. Signal the specific agent process to terminate (if applicable)
        const agentProcess = runningAgents.get(agent_id);
        if (agentProcess) {
            // agentProcess.terminate(); // Or send a graceful shutdown signal
            // The agent itself should also be checking DB status as per 4.1
        }
        runningAgents.delete(agent_id);
        // ... (send response)
    });
    ```

### 4.3. Implement a Persistent Storage Strategy

**Goal**: Ensure cookies, screenshots, and other necessary files persist across container restarts and are isolated per agent.

**Options**:

1.  **Supabase Storage**:
    - **Pros**: Managed service, integrates with your existing Supabase setup.
    - **Cons**: Might be slower for frequent access (like cookies); potential cost implications.
    - **Implementation**:
        - Modify [`src/utils/index.ts`](src/utils/index.ts) (`saveCookies`, `loadCookies`) to use Supabase Storage SDK.
        - Screenshots can also be uploaded to Supabase Storage.
        - File paths would be like `agent_id/cookies.json` or `agent_id/screenshots/timestamp.png`.

2.  **Docker Volumes with Agent-Specific Paths**:
    - **Pros**: Faster local disk access within the container's mounted volume.
    - **Cons**: Requires Docker volume configuration during deployment; ensure the volume itself is backed by persistent storage on the host or cloud provider.
    - **Implementation**:
        - Define a base path for persistent data, e.g., `/data/agents/`.
        - Store files in agent-specific subdirectories: `/data/agents/{agent_id}/cookies.json`.
        - This base path `/data` would be mapped to a Docker volume.

3.  **Dedicated Cache/Storage Service (e.g., Redis, S3-compatible storage)**:
    - **Pros**: Highly scalable and performant.
    - **Cons**: Adds another service to manage.
    - **Implementation**: Use appropriate SDKs to store/retrieve data.

**Recommendation**: Start with **Docker Volumes** for simplicity and performance, ensuring agent-specific paths. If scaling or sharing across many hosts becomes an issue, then consider Supabase Storage or a dedicated service.

### 4.4. Robust Proxy Port Management

**Goal**: Avoid port collisions and ensure reliable proxy operation for each agent.

**Options**:

1.  **Port Range Allocation**:
    - If running multiple agents in one container, assign each a port from a pre-defined range. Requires careful management.
2.  **Dynamic Port Management with a Central Registry (if scaling across containers)**:
    - More complex; involves a service that allocates and tracks used ports.
3.  **Use a Single Proxy with Routing (Advanced)**:
    - A single `proxy-chain` instance could potentially route traffic for multiple Puppeteer instances if it supports such a configuration or if you build a layer on top.
4.  **Container-Level Networking**:
    - If each agent runs in its own container (current implication, but not ideal for resource use), Docker handles port mapping. The internal port (e.g., 8000) can be the same, mapped to different host ports. This is less of an issue if you move to multi-agent per container.

**Recommendation for Multi-Agent per Container**:
- Each `runInstagramWithTracking` instance should still try to get a unique port. The random allocation is a start, but a more robust method would be to try ports sequentially from a base (e.g., 9000, 9001, ...) and catch `EADDRINUSE` errors, then retry with the next port. Keep track of used ports within the container instance.

### 4.5. Container Health Checks and Recovery

**Goal**: Enable Docker to monitor application health and facilitate recovery.

**Implementation Steps**:

1.  **Health Check Endpoint**:
    ```typescript
    // In app.ts
    app.get('/health', (_req, res) => {
      // Perform basic checks, e.g., Supabase connectivity
      // For now, a simple healthy response:
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    ```
    - Configure this in your `Dockerfile` using `HEALTHCHECK`.

2.  **Startup Recovery (Optional but Recommended)**:
    - On application startup, query the `agent_tracking` table for any agents that were 'active' but whose container might have crashed.
    - Decide on a recovery strategy:
        - Attempt to restart these agents.
        - Mark them as 'stopped_unexpectedly' or 'error'.
    ```typescript
    // In app.ts, during initial startup sequence
    async function recoverInterruptedAgents() {
        const potentiallyActiveAgents = await supabaseService.select('agent_tracking', {
            filters: { status: 'active' }
            // Potentially add a filter for 'updated_at' to only pick up recently active ones
        });

        for (const agent of potentiallyActiveAgents) {
            logger.warn(`Agent ${agent.agent_id} was active. Container may have restarted. Attempting recovery/cleanup.`);
            // Option 1: Try to restart it (if business logic allows)
            // launchAgentInstance(agent.agent_id, agent.config || {}); 
            // Option 2: Mark as stopped/error
            await ActivityLogger.logActivity(agent.agent_id, 'session_interrupted_recovery', false, { reason: 'Container restart or unexpected shutdown' });
            await ActivityLogger.stopAgent(agent.agent_id); // Set to 'stopped'
        }
    }
    // Call recoverInterruptedAgents() after app initialization.
    ```

## 5. Ideal Docker Architecture (Target State)

### 5.1. Container Design
- A single Docker image for the RIONA agent backend.
- The container should be configurable to run multiple concurrent agent instances.
- Dependencies (Node.js, Puppeteer, browser binaries) baked into the image.
- Use of a non-root user inside the container for security.

**Example `Dockerfile` Snippet**:
```dockerfile
FROM node:18-alpine # Or a version with full browser support for Puppeteer

WORKDIR /usr/src/app

COPY package*.json ./
# Install dependencies, including those for Puppeteer
RUN npm install --production \
    && npm install puppeteer \
    # Add commands to install browser dependencies if needed for Alpine
    # e.g., apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

COPY . .

# Expose the API port
EXPOSE 3000 

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=1m \
  CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD [ "node", "dist/app.js" ] # Assuming TypeScript is compiled to dist/
# Or for development/ts-node: CMD [ "npx", "ts-node", "src/app.ts" ]
```

### 5.2. Environment Variables for Configuration
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (for the API server, e.g., 3000)
- `MAX_CONCURRENT_AGENTS_PER_CONTAINER` (e.g., 5, 10) - app logic would use this.
- `LOG_LEVEL` (e.g., info, debug)
- `PERSISTENT_DATA_PATH` (e.g., `/data/agents/` - to be mapped to a volume)

### 5.3. API Enhancements
- **`POST /api/agents`**: Start a new agent instance (replaces current `/api/agent/start`).
- **`DELETE /api/agents/{agent_id}`**: Stop a specific agent instance (replaces current `/api/agent/stop`).
- **`GET /api/agents/{agent_id}/status`**: Get status of a specific agent.
- **`GET /api/agents`**: List all agents managed by this container instance and their statuses.
- **`GET /health`**: Container health check.

## 6. Refactoring Roadmap (Prioritized)

1.  **Critical - State Management**:
    *   Remove global state variables (`currentAgentId`, `shouldStopAgent`).
    *   Modify API endpoints and agent logic to rely on the database for state.
2.  **High - Multi-Agent Support**:
    *   Update API concurrency checks for per-agent_id basis.
    *   Implement a mechanism to manage multiple `runInstagramWithTracking` instances (e.g., child processes, worker threads, or an in-process manager).
3.  **Medium - Persistent Storage**:
    *   Choose a strategy (Docker Volumes recommended initially).
    *   Refactor file I/O for cookies and screenshots to use agent-specific paths within the persistent storage location.
4.  **Medium - Health & Recovery**:
    *   Implement the `/health` endpoint.
    *   Implement basic startup recovery for interrupted agents.
5.  **Low - Proxy Port Management**:
    *   Improve dynamic port allocation to be more robust within a container if running many agents.
6.  **Low - API Enhancements**:
    *   Refactor API endpoints to align with multi-agent, resource-oriented design (e.g., `/api/agents/{id}`).

## 7. Benefits of Refactoring

- **Scalability**: Ability to run multiple agents per container and multiple containers.
- **Resilience**: Graceful recovery from container restarts; state preserved in the database.
- **Maintainability**: Clearer separation of concerns; single source of truth for state.
- **Resource Efficiency**: Better utilization of container resources by supporting multiple agents.
- **Production Readiness**: A system robust enough for real-world deployment.

## 8. Conclusion

The current RIONA backend system has a solid foundation with its API structure and Supabase integration for activity logging. However, for a production Docker environment, refactoring state management, enabling multi-agent support, and ensuring data persistence are crucial. By addressing the points in this guide, the system can be transformed into a scalable, resilient, and efficient production-grade application.