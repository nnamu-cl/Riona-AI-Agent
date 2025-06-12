// src/runSupabaseTest.ts
import { supabaseService } from './services/supabase';
import logger from './config/logger';

// Example interface for a typical table
interface User {
  id?: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface Post {
  id?: string;
  title: string;
  content: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

async function main() {
  try {
    logger.info("Starting Supabase service test...");

    // Test 1: Health check
    logger.info("Testing database connection...");
    const isHealthy = await supabaseService.healthCheck();
    logger.info(`Database health check: ${isHealthy ? 'PASSED' : 'FAILED'}`);

    // Test 2: Insert a user (example)
    logger.info("Testing insert operation...");
    try {
      const newUsers = await supabaseService.insert<User>(
        'users', // Replace with your actual table name
        {
          email: 'test@example.com',
          name: 'Test User'
        }
      );
      logger.info("Insert test completed:", newUsers);
    } catch (error) {
      logger.warn("Insert test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    // Test 3: Select records (example)
    logger.info("Testing select operation...");
    try {
      const users = await supabaseService.select<User>(
        'users', // Replace with your actual table name
        {
          limit: 5,
          orderBy: { column: 'created_at', ascending: false }
        }
      );
      logger.info(`Select test completed. Found ${users.length} users`);
    } catch (error) {
      logger.warn("Select test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    // Test 4: Count records (example)
    logger.info("Testing count operation...");
    try {
      const userCount = await supabaseService.count('users');
      logger.info(`Count test completed. Total users: ${userCount}`);
    } catch (error) {
      logger.warn("Count test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    // Test 5: Update records (example)
    logger.info("Testing update operation...");
    try {
      const updatedUsers = await supabaseService.update<User>(
        'users',
        { name: 'Updated Test User' },
        { email: 'test@example.com' }
      );
      logger.info("Update test completed:", updatedUsers);
    } catch (error) {
      logger.warn("Update test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    // Test 6: Check if record exists (example)
    logger.info("Testing exists operation...");
    try {
      const userExists = await supabaseService.exists(
        'users',
        { email: 'test@example.com' }
      );
      logger.info(`Exists test completed. User exists: ${userExists}`);
    } catch (error) {
      logger.warn("Exists test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    // Test 7: Upsert operation (example)
    logger.info("Testing upsert operation...");
    try {
      const upsertedUsers = await supabaseService.upsert<User>(
        'users',
        {
          email: 'upsert@example.com',
          name: 'Upsert Test User'
        },
        false // useServiceRole parameter
      );
      logger.info("Upsert test completed:", upsertedUsers);
    } catch (error) {
      logger.warn("Upsert test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    // Test 8: Batch operations (example)
    logger.info("Testing batch operations...");
    try {
      const batchResults = await supabaseService.batch([
        () => supabaseService.count('users'),
        () => supabaseService.exists('users', { email: 'test@example.com' }),
        () => supabaseService.select<User>('users', { limit: 1 })
      ]);
      logger.info("Batch test completed:", batchResults);
    } catch (error) {
      logger.warn("Batch test failed (this is expected if 'users' table doesn't exist):", (error as Error).message);
    }

    logger.info("Supabase service test completed!");

  } catch (error) {
    logger.error("Error in Supabase service test:", error);
    if (error instanceof Error && error.cause) {
      logger.error("Cause:", error.cause);
    }
  }
}

main().catch(e => {
  logger.error("Unhandled error in Supabase test:", e);
  process.exit(1);
});