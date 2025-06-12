# RIONA Agent API Implementation Guide

## Overview
This implementation transforms your Instagram agent into an API-driven system that logs all activities to Supabase in real-time.

## 🗄️ Database Setup

### 1. Create the agent_tracking table
Run the SQL script in your Supabase SQL editor:
```sql
-- Copy and paste the contents of src/database/create_agent_tracking.sql
```

### 2. Verify your template_agents table exists
Make sure you have the `template_agents` table with the structure you provided.

## 🚀 API Endpoints

### Start an Agent
```bash
POST /api/agent/start
Content-Type: application/json

{
  "agent_id": "uuid-from-template_agents",
  "config": {
    "max_posts": 10,
    "delay_ms": 5000,
    "comment_enabled": true,
    "like_enabled": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "agent_id": "uuid",
  "status": "active",
  "config": {...}
}
```

### Get Agent Status
```bash
GET /api/agent/status
```

**Response:**
```json
{
  "agent_id": "uuid",
  "status": "active",
  "total_actions": 25,
  "activity_log": [...],
  "is_running": true,
  "started_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:05:00Z"
}
```

### Stop Agent
```bash
POST /api/agent/stop
```

**Response:**
```json
{
  "success": true,
  "agent_id": "uuid",
  "stopped_at": "2024-01-15T10:10:00Z"
}
```

## 📊 Activity Logging

Every action the agent performs is logged to the `activity_log` JSONB field:

```json
[
  {
    "action": "session_started",
    "success": true,
    "timestamp": "2024-01-15T10:00:00Z",
    "metadata": {
      "config": {...}
    }
  },
  {
    "action": "like_post",
    "success": true,
    "timestamp": "2024-01-15T10:01:00Z",
    "metadata": {
      "post_index": 1,
      "already_liked": false
    }
  },
  {
    "action": "comment_generated",
    "success": true,
    "timestamp": "2024-01-15T10:01:15Z",
    "metadata": {
      "post_index": 1,
      "comment": "Great post!",
      "viral_rate": 85,
      "generation_time_ms": 1500
    }
  },
  {
    "action": "comment_posted",
    "success": true,
    "timestamp": "2024-01-15T10:01:30Z",
    "metadata": {
      "post_index": 1,
      "comment": "Great post!"
    }
  }
]
```

## 🧪 Testing

### 1. Start the server
```bash
npm start
```

### 2. Run the test script
```bash
npx ts-node src/testAgentAPI.ts
```

### 3. Manual testing with curl
```bash
# Start agent
curl -X POST http://localhost:3000/api/agent/start \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"550e8400-e29b-41d4-a716-446655440000","config":{"max_posts":5}}'

# Check status
curl http://localhost:3000/api/agent/status

# Stop agent
curl -X POST http://localhost:3000/api/agent/stop
```

## 📝 Activity Types Logged

- `session_started` - Agent begins execution
- `login_verified` / `login_success` / `login_failed` - Authentication events
- `post_discovered` - Found a new post to interact with
- `like_post` - Attempted to like a post (success/failure)
- `caption_extracted` - Extracted post caption
- `comment_generated` - AI generated a comment
- `comment_posted` - Posted comment to Instagram
- `waiting` - Waiting between actions
- `session_stopped_by_user` - User requested stop
- `session_ended` - Agent finished execution
- `*_error` - Any errors that occur

## 🔧 Configuration Options

```typescript
interface AgentConfig {
  max_posts?: number;        // Maximum posts to process (default: 50)
  delay_ms?: number;         // Delay between posts in ms (default: 5000)
  comment_enabled?: boolean; // Enable commenting (default: true)
  like_enabled?: boolean;    // Enable liking (default: true)
}
```

## 🚨 Important Notes

1. **Single Agent**: Only one agent can run at a time
2. **Error Resilience**: Agent continues even if logging fails
3. **Stop Control**: Use the stop endpoint to gracefully halt execution
4. **Database Growth**: Activity logs will grow over time - consider cleanup strategies
5. **TypeScript Issues**: Some TypeScript errors may appear but functionality works

## 🔍 Monitoring

Monitor your agent in real-time by:
1. Checking the API status endpoint
2. Viewing the Supabase `agent_tracking` table
3. Watching the server logs
4. Using the test script for automated checks

## 🛠️ Files Created/Modified

- `src/services/ActivityLogger.ts` - Activity logging service
- `src/client/InstagramWithTracking.ts` - Modified Instagram agent
- `src/app.ts` - Added API endpoints
- `src/testAgentAPI.ts` - Test script
- `src/database/create_agent_tracking.sql` - Database schema
- `AGENT_API_GUIDE.md` - This guide

## 🎯 Next Steps

1. Run the SQL script to create the database table
2. Start your server: `npm start`
3. Test with: `npx ts-node src/testAgentAPI.ts`
4. Monitor activity in your Supabase dashboard
5. Integrate with your frontend or other systems as needed