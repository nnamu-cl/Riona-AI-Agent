import { supabase } from './supabaseClient';

/**
 * Fetches all items from a specified table.
 * @param tableName - The name of the table to fetch from.
 * @returns A promise that resolves with the data or an error.
 */
export const getAllItems = async (tableName: string) => {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching all items from ${tableName}:`, error);
    throw error;
  }
  return data;
};

/**
 * Fetches a single item by its ID from a specified table.
 * @param tableName - The name of the table to fetch from.
 * @param id - The ID of the item to fetch.
 * @returns A promise that resolves with the data or an error.
 */
export const getItemById = async (tableName: string, id: string | number) => {
  const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
  if (error) {
    console.error(`Error fetching item with id ${id} from ${tableName}:`, error);
    throw error;
  }
  return data;
};

/**
 * Creates a new item in a specified table.
 * @param tableName - The name of the table to create the item in.
 * @param item - The item data to insert.
 * @returns A promise that resolves with the created data or an error.
 */
export const createItem = async (tableName: string, item: any) => {
  const { data, error } = await supabase.from(tableName).insert([item]).select();
  if (error) {
    console.error(`Error creating item in ${tableName}:`, error);
    throw error;
  }
  return data;
};

/**
 * Updates an existing item by its ID in a specified table.
 * @param tableName - The name of the table to update the item in.
 * @param id - The ID of the item to update.
 * @param updates - The updates to apply to the item.
 * @returns A promise that resolves with the updated data or an error.
 */
export const updateItem = async (tableName: string, id: string | number, updates: any) => {
  const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select();
  if (error) {
    console.error(`Error updating item with id ${id} in ${tableName}:`, error);
    throw error;
  }
  return data;
};

/**
 * Deletes an item by its ID from a specified table.
 * @param tableName - The name of the table to delete the item from.
 * @param id - The ID of the item to delete.
 * @returns A promise that resolves with the deleted data or an error.
 */
export const deleteItem = async (tableName: string, id: string | number) => {
  const { data, error } = await supabase.from(tableName).delete().eq('id', id).select();
  if (error) {
    console.error(`Error deleting item with id ${id} from ${tableName}:`, error);
    throw error;
  }
  return data;
};