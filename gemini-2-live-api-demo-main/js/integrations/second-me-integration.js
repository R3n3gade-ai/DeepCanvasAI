/**
 * Second-Me Integration
 * Main integration point for Second-Me features
 */
import { SecondMeAdapter } from './second-me-adapter.js';
import { MCPClient } from '../mcp/mcp-client.js';
import { registerVeo2Tools } from './veo2-integration.js';
import { SecondMeMemory } from '../memory/second-me-memory.js';
import { EnhancedChatManager } from '../chat/enhanced-chat-manager.js';
import { getSecondMeApiUrl, getSecondMeAppUrl, getSecondMeEnabled } from '../config/config.js';

/**
 * Second-Me Integration Manager
 * Handles initialization and management of Second-Me features
 */
class SecondMeIntegration {
  constructor() {
    this.initialized = false;
    this.adapter = null;
    this.mcpClient = null;
    this.memory = null;
    this.enhancedChatManager = null;
    this.eventListeners = {};
    
    // Log initialization
    console.log('[SecondMeIntegration] Created - always enabled by default');
  }
  
  /**
   * Initialize the integration
   * @param {Object} options - Initialization options
   * @param {Object} options.chatManager - Original chat manager
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize(options = {}) {
    if (this.initialized) {
      console.log('[SecondMeIntegration] Already initialized');
      return true;
    }
    
    try {
      console.log('[SecondMeIntegration] Initializing Second-Me integration');
      
      // Create adapter assuming user is already authenticated via the app
      this.adapter = new SecondMeAdapter({
        apiEndpoint: getSecondMeApiUrl(),
        // No auth token needed as user is already authenticated in app
        autoAuthenticate: true
      });
      
      // Initialize adapter
      await this.adapter.initialize();
      
      // Create MCP client
      this.mcpClient = new MCPClient(this.adapter);
      
      // Create memory instance
      this.memory = new SecondMeMemory(this.adapter);
      
      // Register Veo2 tools
      await registerVeo2Tools(this.mcpClient);
      
      // Create enhanced chat manager if original chat manager is provided
      if (options.chatManager) {
        this.enhancedChatManager = new EnhancedChatManager({
          chatManager: options.chatManager,
          secondMe: {
            apiEndpoint: getSecondMeApiUrl(),
            autoAuthenticate: true
          }
        });
        
        await this.enhancedChatManager.initialize();
      }
      
      this.initialized = true;
      this.emitEvent('initialized', { success: true });
      
      console.log('[SecondMeIntegration] Initialization complete');
      return true;
    } catch (error) {
      console.error('[SecondMeIntegration] Initialization error:', error);
      this.emitEvent('error', {
        source: 'initialization',
        error,
        message: 'Failed to initialize Second-Me integration'
      });
      return false;
    }
  }
  
  /**
   * Check if Second-Me is initialized
   * @returns {boolean} True if initialized
   */
  isActive() {
    return this.initialized;
  }
  
  /**
   * Get the Second-Me adapter
   * @returns {SecondMeAdapter|null} Second-Me adapter
   */
  getAdapter() {
    return this.adapter;
  }
  
  /**
   * Get the MCP client
   * @returns {MCPClient|null} MCP client
   */
  getMCPClient() {
    return this.mcpClient;
  }
  
  /**
   * Get the memory manager
   * @returns {SecondMeMemory|null} Memory manager
   */
  getMemory() {
    return this.memory;
  }
  
  /**
   * Get the enhanced chat manager
   * @returns {EnhancedChatManager|null} Enhanced chat manager
   */
  getEnhancedChatManager() {
    return this.enhancedChatManager;
  }
  
  /**
   * Event handling methods
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
        console.error(`[SecondMeIntegration] Error in event listener for '${event}':`, error);
      }
    });
  }
  
  /**
   * Shutdown the integration
   */
  async shutdown() {
    console.log('[SecondMeIntegration] Shutting down');
    
    // Nothing specific to clean up right now, but this could be expanded
    // if we need to close connections or clean up resources
    
    this.initialized = false;
    this.emitEvent('shutdown', { success: true });
  }
}

// Export singleton instance
export const secondMeIntegration = new SecondMeIntegration();