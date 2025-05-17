/**
 * Tool Manager Module
 * 
 * This module provides functionality for fetching and executing tools from Composio.
 * It integrates with the Composio Integration module to manage tool access.
 */

import composioIntegration from './composio-integration.js';

/**
 * Tool Manager class
 * Handles fetching and executing tools from Composio
 */
class ToolManager {
    constructor() {
        this.initialized = false;
        this.toolCache = {};
    }
    
    /**
     * Initialize the tool manager
     * @returns {Promise<boolean>} - True if initialization is successful
     */
    async initialize() {
        try {
            console.log('[ToolManager] Initializing...');
            
            // Initialize the Composio integration if not already initialized
            if (!composioIntegration.initialized) {
                await composioIntegration.initialize();
            }
            
            this.initialized = true;
            console.log('[ToolManager] Initialization complete');
            return true;
        } catch (error) {
            console.error('[ToolManager] Initialization error:', error);
            return false;
        }
    }
    
    /**
     * Get tools for a specific app
     * @param {string} appName - The name of the app
     * @param {Array<string>} actions - Optional list of specific actions to get tools for
     * @param {Array<string>} tags - Optional list of tags to filter tools by
     * @returns {Promise<Array>} - Array of tools
     */
    async getTools(appName, actions = [], tags = []) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        console.log(`[ToolManager] Getting tools for ${appName}...`);
        
        try {
            // Check if the app is connected
            if (!composioIntegration.isConnected(appName)) {
                throw new Error(`Not connected to ${appName}. Please connect first.`);
            }
            
            // Generate a cache key
            const cacheKey = `${appName}_${actions.join(',')}_${tags.join(',')}`;
            
            // Check if we have cached tools
            if (this.toolCache[cacheKey]) {
                console.log(`[ToolManager] Using cached tools for ${appName}`);
                return this.toolCache[cacheKey];
            }
            
            // Get the tools from Composio
            const tools = await composioIntegration.getTools(appName, actions, tags);
            
            // Cache the tools
            this.toolCache[cacheKey] = tools;
            
            return tools;
        } catch (error) {
            console.error(`[ToolManager] Error getting tools for ${appName}:`, error);
            throw error;
        }
    }
    
    /**
     * Get tools for multiple apps
     * @param {Array<string>} appNames - Array of app names
     * @returns {Promise<Array>} - Array of tools from all apps
     */
    async getToolsForApps(appNames) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        console.log(`[ToolManager] Getting tools for multiple apps: ${appNames.join(', ')}...`);
        
        try {
            // Get tools for each app
            const toolPromises = appNames.map(appName => {
                // Only get tools for connected apps
                if (composioIntegration.isConnected(appName)) {
                    return this.getTools(appName);
                } else {
                    console.warn(`[ToolManager] App ${appName} is not connected, skipping`);
                    return Promise.resolve([]);
                }
            });
            
            // Wait for all promises to resolve
            const toolArrays = await Promise.all(toolPromises);
            
            // Flatten the array of arrays
            const allTools = toolArrays.flat();
            
            return allTools;
        } catch (error) {
            console.error('[ToolManager] Error getting tools for multiple apps:', error);
            throw error;
        }
    }
    
    /**
     * Execute a tool
     * @param {Object} toolCall - The tool call from the LLM
     * @returns {Promise<Object>} - The result of the tool execution
     */
    async executeTool(toolCall) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        console.log(`[ToolManager] Executing tool: ${toolCall.function?.name}...`);
        
        try {
            // Create a response object with the tool call
            const response = {
                choices: [{
                    message: {
                        tool_calls: [toolCall]
                    }
                }]
            };
            
            // Execute the tool call
            const result = await composioIntegration.handleToolCalls(response);
            
            return result;
        } catch (error) {
            console.error(`[ToolManager] Error executing tool:`, error);
            throw error;
        }
    }
    
    /**
     * Execute an action directly
     * @param {string} action - The action to execute
     * @param {Object} params - The parameters for the action
     * @returns {Promise<Object>} - The result of the action
     */
    async executeAction(action, params = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        console.log(`[ToolManager] Executing action: ${action}...`);
        
        try {
            // Execute the action
            const result = await composioIntegration.executeAction(action, params);
            
            return result;
        } catch (error) {
            console.error(`[ToolManager] Error executing action:`, error);
            throw error;
        }
    }
    
    /**
     * Clear the tool cache
     */
    clearCache() {
        this.toolCache = {};
        console.log('[ToolManager] Tool cache cleared');
    }
}

// Create and export a singleton instance
const toolManager = new ToolManager();
export default toolManager;
