/**
 * Enhanced Chat Manager
 * Extends chat functionality with Second-Me integration
 */
import { SecondMeAdapter } from '../integrations/second-me-adapter.js';
import { MCPClient } from '../mcp/mcp-client.js';
import { registerVeo2Tools } from '../integrations/veo2-integration.js';
import { SecondMeMemory } from '../memory/second-me-memory.js';

/**
 * Enhanced Chat Manager that integrates Second-Me capabilities
 */
export class EnhancedChatManager {
  /**
   * Create a new enhanced chat manager
   * @param {Object} config - Configuration options
   * @param {Object} config.chatManager - Original chat manager instance
   * @param {Object} config.secondMe - Second-Me configuration options
   */
  constructor(config) {
    this.originalChatManager = config.chatManager;
    
    // Create adapter with autoAuthenticate
    this.secondMeAdapter = new SecondMeAdapter({
      apiEndpoint: config.secondMe?.apiEndpoint,
      autoAuthenticate: true
    });
    
    this.mcpClient = new MCPClient(this.secondMeAdapter);
    this.memory = new SecondMeMemory(this.secondMeAdapter);
    this.isInitialized = false;
    this.isProcessingMessage = false;
    
    // Keep original event handlers
    this.eventListeners = {};
    
    // Hook into original chat events
    if (this.originalChatManager && typeof this.originalChatManager.addEventListener === 'function') {
      this.originalChatManager.addEventListener('message', this.handleMessage.bind(this));
      this.originalChatManager.addEventListener('error', this.handleError.bind(this));
    }
  }
  
  /**
   * Initialize the enhanced chat manager
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize() {
    try {
      console.log('[EnhancedChatManager] Initializing...');
      
      // Initialize Second-Me adapter
      await this.secondMeAdapter.initialize();
      
      // Register tools
      await registerVeo2Tools(this.mcpClient);
      
      // Look for user preferences
      const preferences = await this.memory.getUserPreferences(['chat_style', 'name']);
      console.log('[EnhancedChatManager] User preferences:', preferences);
      
      this.isInitialized = true;
      this.emitEvent('initialized', { success: true });
      
      console.log('[EnhancedChatManager] Initialization complete');
      return true;
    } catch (error) {
      console.error('[EnhancedChatManager] Initialization error:', error);
      this.emitEvent('error', { 
        source: 'initialization',
        error,
        message: 'Failed to initialize Second-Me integration' 
      });
      return false;
    }
  }
  
  /**
   * Handle incoming chat messages
   * @param {Object} event - Message event
   * @private
   */
  async handleMessage(event) {
    const { message, sender } = event.detail || event;
    
    if (sender === 'user' && !this.isProcessingMessage) {
      this.isProcessingMessage = true;
      
      try {
        console.log(`[EnhancedChatManager] Processing user message: ${message}`);
        
        // Store message in Second-Me memory
        await this.memory.storeMemory('activity', {
          type: 'chat_message',
          sender: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });
        
        // Send to Second-Me for processing
        const response = await this.secondMeAdapter.sendMessage(message, {
          source: 'chat',
          timestamp: new Date().toISOString()
        });
        
        console.log('[EnhancedChatManager] Second-Me response:', response);
        
        // Handle any tool calls in the response
        if (response.toolCalls && response.toolCalls.length > 0) {
          console.log(`[EnhancedChatManager] Processing ${response.toolCalls.length} tool calls`);
          
          const toolResults = [];
          for (const toolCall of response.toolCalls) {
            try {
              const result = await this.mcpClient.handleToolCall(toolCall);
              toolResults.push(result);
            } catch (error) {
              console.error(`[EnhancedChatManager] Error in tool call '${toolCall.name}':`, error);
              toolResults.push({
                name: toolCall.name,
                status: 'error',
                error: error.message || String(error)
              });
            }
          }
          
          // Send tool results back to Second-Me
          if (toolResults.length > 0) {
            await this.secondMeAdapter.sendMessage({
              type: 'tool_results',
              results: toolResults
            });
          }
        }
        
        // Extract text response if available
        if (response.text) {
          // Send response to chat interface
          this.originalChatManager.addMessage(response.text, 'assistant');
        }
        
        this.emitEvent('second-me-processed', {
          originalMessage: message,
          response
        });
      } catch (error) {
        console.error('[EnhancedChatManager] Error processing message:', error);
        this.emitEvent('error', {
          source: 'message-processing',
          error,
          message: 'Error processing message with Second-Me'
        });
      } finally {
        this.isProcessingMessage = false;
      }
    }
  }
  
  /**
   * Handle chat errors
   * @param {Object} event - Error event
   * @private
   */
  handleError(event) {
    const { error } = event.detail || event;
    console.error('[EnhancedChatManager] Original chat error:', error);
    
    this.emitEvent('error', {
      source: 'original-chat',
      error,
      message: 'Error in original chat manager'
    });
  }
  
  /**
   * Send a message through the chat
   * @param {string} message - Message text
   * @param {string} sender - Message sender (user or assistant)
   * @returns {Promise<void>}
   */
  async sendMessage(message, sender = 'user') {
    if (this.originalChatManager && typeof this.originalChatManager.sendMessage === 'function') {
      return this.originalChatManager.sendMessage(message, sender);
    } else if (this.originalChatManager && typeof this.originalChatManager.addMessage === 'function') {
      return this.originalChatManager.addMessage(message, sender);
    } else {
      // Handle the message directly if no original chat manager method
      return this.handleMessage({
        detail: { message, sender }
      });
    }
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event]
      .filter(cb => cb !== callback);
  }
  
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  emitEvent(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EnhancedChatManager] Error in event listener for '${event}':`, error);
      }
    });
  }
}