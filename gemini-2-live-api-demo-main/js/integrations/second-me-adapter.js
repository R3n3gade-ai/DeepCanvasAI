/**
 * Second-Me Adapter
 * This class provides an interface to connect with Second-Me API services
 */
export class SecondMeAdapter {
  /**
   * Create a new Second-Me adapter
   * @param {Object} config - Configuration options
   * @param {string} config.apiEndpoint - Second-Me API endpoint URL
   * @param {boolean} [config.autoAuthenticate=false] - Use app authentication instead of token
   */
  constructor(config) {
    this.apiEndpoint = config.apiEndpoint || 'http://localhost:5000/api';
    this.autoAuthenticate = config.autoAuthenticate || false;
    this.contextId = null;
    this.connected = false;
    this.eventListeners = {};
    
    console.log(`[SecondMeAdapter] Created with autoAuthenticate=${this.autoAuthenticate}`);
  }

  /**
   * Initialize connection with Second-Me
   * @returns {Promise<Object>} Connection result
   */
  async initialize() {
    try {
      // Establish connection with Second-Me API
      const response = await fetch(`${this.apiEndpoint}/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.autoAuthenticate ? { 'X-App-Auth': 'true' } : {})
        },
        body: JSON.stringify({
          clientId: 'veo-platform',
          capabilities: ['video-generation', 'social-sharing', 'chat']
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.contextId = data.contextId;
      this.connected = true;
      
      console.log('[SecondMeAdapter] Successfully connected to Second-Me API');
      this.emitEvent('connected', { contextId: this.contextId });
      
      return data;
    } catch (error) {
      console.error('[SecondMeAdapter] Initialization error:', error);
      this.emitEvent('error', { error, message: 'Failed to initialize connection' });
      throw error;
    }
  }

  /**
   * Send a message to Second-Me
   * @param {string|Object} message - Message content or message object
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Response from Second-Me
   */
  async sendMessage(message, metadata = {}) {
    if (!this.contextId) {
      console.warn('[SecondMeAdapter] Attempting to send message without initialization');
      await this.initialize();
    }
    
    try {
      const payload = typeof message === 'string' 
        ? { 
            text: message, 
            type: 'text',
            metadata 
          }
        : { ...message, metadata };
      
      const response = await fetch(`${this.apiEndpoint}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.autoAuthenticate ? { 'X-App-Auth': 'true' } : {})
        },
        body: JSON.stringify({
          contextId: this.contextId,
          ...payload
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.emitEvent('message', { 
        direction: 'response', 
        content: data 
      });
      
      return data;
    } catch (error) {
      console.error('[SecondMeAdapter] Message error:', error);
      this.emitEvent('error', { error, message: 'Failed to send message' });
      throw error;
    }
  }
  
  /**
   * Register a tool with Second-Me
   * @param {Object} toolDefinition - Tool definition object
   * @returns {Promise<Object>} Registration result
   */
  async registerTool(toolDefinition) {
    try {
      const response = await this.sendMessage({
        type: 'tool_registration',
        tool: toolDefinition
      });
      
      console.log(`[SecondMeAdapter] Tool '${toolDefinition.name}' registered`);
      return response;
    } catch (error) {
      console.error(`[SecondMeAdapter] Failed to register tool '${toolDefinition.name}':`, error);
      throw error;
    }
  }
  
  /**
   * Store data in Second-Me's memory
   * @param {string} memoryType - Type of memory (preference, context, activity)
   * @param {Object} data - Memory data to store
   * @returns {Promise<Object>} Storage result
   */
  async storeMemory(memoryType, data) {
    return await this.sendMessage({
      type: 'memory',
      action: 'store',
      memoryType,
      data
    });
  }
  
  /**
   * Retrieve memories from Second-Me
   * @param {Object} query - Query parameters
   * @param {Object} options - Retrieval options
   * @returns {Promise<Object>} Retrieved memories
   */
  async retrieveMemories(query, options = {}) {
    return await this.sendMessage({
      type: 'memory',
      action: 'retrieve',
      query,
      options
    });
  }
  
  /**
   * Event system for adapter
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event]
      .filter(cb => cb !== callback);
  }
  
  emitEvent(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[SecondMeAdapter] Error in event listener for '${event}':`, error);
      }
    });
  }
}