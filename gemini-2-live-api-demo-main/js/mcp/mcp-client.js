/**
 * Model Context Protocol (MCP) Client
 * Handles communication between Second-Me and local tools
 */
export class MCPClient {
  /**
   * Create a new MCP client
   * @param {Object} adapter - SecondMeAdapter instance
   */
  constructor(adapter) {
    this.adapter = adapter;
    this.tools = new Map();
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for the adapter
   * @private
   */
  setupEventListeners() {
    // Listen for tool calls from Second-Me
    this.adapter.addEventListener('message', async (event) => {
      const { content } = event;
      
      // Check if this message contains tool calls
      if (content && content.toolCalls && Array.isArray(content.toolCalls)) {
        try {
          const results = await Promise.all(
            content.toolCalls.map(toolCall => this.handleToolCall(toolCall))
          );
          
          // Send tool results back to Second-Me
          await this.adapter.sendMessage({
            type: 'tool_results',
            results
          });
        } catch (error) {
          console.error('[MCPClient] Error handling tool calls:', error);
        }
      }
    });
  }

  /**
   * Register a tool with the MCP client and Second-Me
   * @param {string} name - Tool name
   * @param {string} description - Tool description
   * @param {Function} handler - Tool handler function
   * @param {Object} schema - Tool parameter schema
   * @returns {Promise<Object>} Registration result
   */
  async registerTool(name, description, handler, schema) {
    // Store tool information locally
    this.tools.set(name, {
      description,
      handler,
      schema
    });
    
    // Register with Second-Me
    const toolDefinition = {
      name,
      description,
      schema
    };
    
    try {
      return await this.adapter.registerTool(toolDefinition);
    } catch (error) {
      console.error(`[MCPClient] Failed to register tool '${name}':`, error);
      throw error;
    }
  }
  
  /**
   * Handle a tool call from Second-Me
   * @param {Object} toolCall - Tool call information
   * @returns {Promise<Object>} Tool execution result
   * @private
   */
  async handleToolCall(toolCall) {
    const { name, id, arguments: args } = toolCall;
    console.log(`[MCPClient] Handling tool call: ${name}`, args);
    
    const tool = this.tools.get(name);
    
    if (!tool) {
      const error = `Tool not found: ${name}`;
      console.error(`[MCPClient] ${error}`);
      return {
        toolCallId: id,
        name,
        status: 'error',
        error
      };
    }
    
    try {
      // Parse arguments if they are provided as a string
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
      
      // Execute the tool handler
      const result = await tool.handler(parsedArgs);
      
      // Return the result
      return {
        toolCallId: id,
        name,
        status: 'success',
        result
      };
    } catch (error) {
      console.error(`[MCPClient] Error executing tool '${name}':`, error);
      return {
        toolCallId: id,
        name,
        status: 'error',
        error: error.message || String(error)
      };
    }
  }
  
  /**
   * Manually execute a tool by name
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @returns {Promise<any>} Tool execution result
   */
  async executeTool(name, args) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    return await tool.handler(args);
  }
  
  /**
   * Get all registered tools
   * @returns {Array<Object>} List of registered tools
   */
  getRegisteredTools() {
    const tools = [];
    
    for (const [name, tool] of this.tools.entries()) {
      tools.push({
        name,
        description: tool.description,
        schema: tool.schema
      });
    }
    
    return tools;
  }
}