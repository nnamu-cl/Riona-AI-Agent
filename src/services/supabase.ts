import { createClient, SupabaseClient, PostgrestResponse } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '../secret';
import logger from '../config/logger';

// Database Types - You can extend these based on your actual database schema
export interface DatabaseRow {
  id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: { [key: string]: any };
}

export interface InsertOptions {
  returning?: string;
  onConflict?: string;
}

export interface UpdateOptions {
  returning?: string;
}

// Supabase Clients
class SupabaseService {
  private anonClient: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor() {
    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL is required');
    }

    if (!SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY is required');
    }

    // Anonymous client for public operations
    this.anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Service role client for admin operations (if service role key is provided)
    if (SUPABASE_SERVICE_ROLE_KEY) {
      this.serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    } else {
      this.serviceClient = this.anonClient;
      logger.warn('SUPABASE_SERVICE_ROLE_KEY not provided. Using anon client for all operations.');
    }
  }

  // Get the appropriate client
  getClient(useServiceRole: boolean = false): SupabaseClient {
    return useServiceRole ? this.serviceClient : this.anonClient;
  }

  // Generic CRUD Operations

  /**
   * Insert a single record or multiple records
   */
  async insert<T extends DatabaseRow>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options: InsertOptions = {},
    useServiceRole: boolean = false
  ): Promise<T[]> {
    try {
      const client = this.getClient(useServiceRole);
      
      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select(options.returning || '*');

      if (error) {
        logger.error(`Error inserting into ${table}:`, error);
        throw new Error(`Insert failed: ${error.message}`);
      }

      logger.info(`Successfully inserted ${Array.isArray(data) ? data.length : 1} record(s) into ${table}`);
      return (result as unknown as T[]) || [];
    } catch (error) {
      logger.error(`Insert operation failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Select records with optional filtering, ordering, and pagination
   */
  async select<T extends DatabaseRow>(
    table: string,
    options: QueryOptions = {},
    useServiceRole: boolean = false
  ): Promise<T[]> {
    try {
      const client = this.getClient(useServiceRole);
      let query = client.from(table).select(options.select || '*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 1000) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error selecting from ${table}:`, error);
        throw new Error(`Select failed: ${error.message}`);
      }

      logger.info(`Successfully selected ${data?.length || 0} record(s) from ${table}`);
      return (data as unknown as T[]) || [];
    } catch (error) {
      logger.error(`Select operation failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update records
   */
  async update<T extends DatabaseRow>(
    table: string,
    updates: Partial<T>,
    filters: { [key: string]: any },
    options: UpdateOptions = {},
    useServiceRole: boolean = false
  ): Promise<T[]> {
    try {
      const client = this.getClient(useServiceRole);
      let query = client.from(table).update(updates);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query.select(options.returning || '*');

      if (error) {
        logger.error(`Error updating ${table}:`, error);
        throw new Error(`Update failed: ${error.message}`);
      }

      logger.info(`Successfully updated record(s) in ${table}`);
      return (data as unknown as T[]) || [];
    } catch (error) {
      logger.error(`Update operation failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete records
   */
  async delete<T extends DatabaseRow>(
    table: string,
    filters: { [key: string]: any },
    useServiceRole: boolean = false
  ): Promise<T[]> {
    try {
      const client = this.getClient(useServiceRole);
      let query = client.from(table).delete();

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) {
        logger.error(`Error deleting from ${table}:`, error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      logger.info(`Successfully deleted record(s) from ${table}`);
      return (data as unknown as T[]) || [];
    } catch (error) {
      logger.error(`Delete operation failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Upsert (insert or update) records
   */
  async upsert<T extends DatabaseRow>(
    table: string,
    data: Partial<T> | Partial<T>[],
    useServiceRole: boolean = false
  ): Promise<T[]> {
    try {
      const client = this.getClient(useServiceRole);
      const query = client.from(table).upsert(data);

      const { data: result, error } = await query;

      if (error) {
        logger.error(`Error upserting into ${table}:`, error);
        throw new Error(`Upsert failed: ${error.message}`);
      }

      logger.info(`Successfully upserted ${Array.isArray(data) ? data.length : 1} record(s) into ${table}`);
      return (result as unknown as T[]) || [];
    } catch (error) {
      logger.error(`Upsert operation failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Execute a custom SQL query (requires service role)
   */
  async executeQuery(
    query: string,
    params: any[] = []
  ): Promise<any> {
    try {
      const { data, error } = await this.serviceClient.rpc('execute_sql', {
        query_text: query,
        query_params: params
      });

      if (error) {
        logger.error('Error executing custom query:', error);
        throw new Error(`Query execution failed: ${error.message}`);
      }

      logger.info('Successfully executed custom query');
      return data;
    } catch (error) {
      logger.error('Custom query execution failed:', error);
      throw error;
    }
  }

  /**
   * Get a single record by ID
   */
  async findById<T extends DatabaseRow>(
    table: string,
    id: string,
    select?: string,
    useServiceRole: boolean = false
  ): Promise<T | null> {
    try {
      const records = await this.select<T>(
        table,
        {
          select,
          filters: { id },
          limit: 1
        },
        useServiceRole
      );

      return records.length > 0 ? records[0] : null;
    } catch (error) {
      logger.error(`Error finding record by ID in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Count records in a table
   */
  async count(
    table: string,
    filters: { [key: string]: any } = {},
    useServiceRole: boolean = false
  ): Promise<number> {
    try {
      const client = this.getClient(useServiceRole);
      let query = client.from(table).select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) {
        logger.error(`Error counting records in ${table}:`, error);
        throw new Error(`Count failed: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      logger.error(`Count operation failed for table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(
    table: string,
    filters: { [key: string]: any },
    useServiceRole: boolean = false
  ): Promise<boolean> {
    try {
      const count = await this.count(table, filters, useServiceRole);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Batch operations with transaction-like behavior
   */
  async batch(operations: Array<() => Promise<any>>): Promise<any[]> {
    try {
      logger.info(`Executing batch of ${operations.length} operations`);
      const results = await Promise.all(operations.map(op => op()));
      logger.info('Batch operations completed successfully');
      return results;
    } catch (error) {
      logger.error('Batch operations failed:', error);
      throw error;
    }
  }

  /**
   * Health check - test database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.anonClient.from('_health_check').select('*').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
        logger.error('Database health check failed:', error);
        return false;
      }

      logger.info('Database connection is healthy');
      return true;
    } catch (error) {
      logger.error('Database health check error:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const supabaseService = new SupabaseService();

// Export the class for testing or custom instances
export { SupabaseService };

// Export commonly used types
export type { SupabaseClient, PostgrestResponse };

// Convenience exports for direct client access
export const supabaseClient = supabaseService.getClient(false);
export const supabaseAdminClient = supabaseService.getClient(true);