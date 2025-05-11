/**
 * Second-Me Memory Integration
 * Provides an interface for storing and retrieving memories from Second-Me
 */
import { SecondMeAdapter } from '../integrations/second-me-adapter.js';

/**
 * Memory management class for Second-Me
 */
export class SecondMeMemory {
  /**
   * Create a new memory manager
   * @param {SecondMeAdapter} adapter - Second-Me adapter instance 
   */
  constructor(adapter) {
    this.adapter = adapter;
    
    // Validate adapter
    if (!adapter) {
      throw new Error('[SecondMeMemory] Adapter is required');
    }
  }
  
  /**
   * Store a user preference in memory
   * @param {string} key - Preference key 
   * @param {any} value - Preference value
   * @returns {Promise<Object>} Storage result
   */
  async storeUserPreference(key, value) {
    console.log(`[SecondMeMemory] Storing user preference: ${key}`);
    
    return await this.storeMemory('preference', {
      key,
      value,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Store a video generation record in memory
   * @param {Object} videoData - Video generation data
   * @returns {Promise<Object>} Storage result
   */
  async storeVideoGeneration(videoData) {
    console.log('[SecondMeMemory] Storing video generation record');
    
    return await this.storeMemory('activity', {
      type: 'video_generation',
      data: videoData,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Store data in Second-Me's memory
   * @param {string} memoryType - Type of memory (preference, context, activity)
   * @param {Object} data - Memory data to store
   * @returns {Promise<Object>} Storage result
   */
  async storeMemory(memoryType, data) {
    try {
      return await this.adapter.sendMessage({
        type: 'memory',
        action: 'store',
        memoryType,
        data
      });
    } catch (error) {
      console.error(`[SecondMeMemory] Error storing ${memoryType} memory:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve memories from Second-Me based on a query
   * @param {Object} query - Query parameters
   * @param {Object} options - Retrieval options
   * @returns {Promise<Object>} Retrieved memories
   */
  async retrieveMemories(query, options = {}) {
    try {
      // Set default options
      const retrievalOptions = {
        limit: options.limit || 10,
        offset: options.offset || 0,
        sortBy: options.sortBy || 'timestamp',
        sortDirection: options.sortDirection || 'desc',
        ...options
      };
      
      console.log('[SecondMeMemory] Retrieving memories:', query);
      
      return await this.adapter.sendMessage({
        type: 'memory',
        action: 'retrieve',
        query,
        options: retrievalOptions
      });
    } catch (error) {
      console.error('[SecondMeMemory] Error retrieving memories:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve user preferences
   * @param {string|Array<string>} keys - Preference key(s) to retrieve
   * @returns {Promise<Object>} Retrieved preferences
   */
  async getUserPreferences(keys) {
    const query = {
      memoryType: 'preference',
      keys: Array.isArray(keys) ? keys : [keys]
    };
    
    return await this.retrieveMemories(query);
  }
  
  /**
   * Retrieve video generation history
   * @param {Object} options - Retrieval options
   * @returns {Promise<Array>} Video generation history
   */
  async getVideoGenerationHistory(options = {}) {
    const query = {
      memoryType: 'activity',
      type: 'video_generation'
    };
    
    return await this.retrieveMemories(query, options);
  }
  
  /**
   * Search through all memories based on a text query
   * @param {string} searchText - Text to search for
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchMemories(searchText, options = {}) {
    const query = {
      text: searchText
    };
    
    return await this.retrieveMemories(query, options);
  }
  
  /**
   * Delete specific memories
   * @param {Array<string>} memoryIds - IDs of memories to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteMemories(memoryIds) {
    try {
      return await this.adapter.sendMessage({
        type: 'memory',
        action: 'delete',
        ids: memoryIds
      });
    } catch (error) {
      console.error('[SecondMeMemory] Error deleting memories:', error);
      throw error;
    }
  }
  
  /**
   * Clear all memories of a specific type
   * @param {string} memoryType - Type of memory to clear (preference, context, activity)
   * @returns {Promise<Object>} Clear result
   */
  async clearMemoryType(memoryType) {
    try {
      return await this.adapter.sendMessage({
        type: 'memory',
        action: 'clear',
        memoryType
      });
    } catch (error) {
      console.error(`[SecondMeMemory] Error clearing ${memoryType} memories:`, error);
      throw error;
    }
  }
}