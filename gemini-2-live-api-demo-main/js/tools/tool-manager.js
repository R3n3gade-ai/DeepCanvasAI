/**
 * Managing class where tools can be registered for easier use
 * Each tool must implement execute() and getDeclaration() methods.
 *
 * Also supports Composio tools for third-party service integrations.
 */

import composioAPI from '../integrations/composio-api.js';

export class ToolManager {
    /**
     * Initializes a new ToolManager instance for getting registering, getting declarations, and executing tools.
     */
    constructor() {
        this.tools = new Map();
        this.composioTools = new Map();
    }

    /**
     * Registers a new tool in the tool registry.
     * @param {string} name - Unique identifier for the tool
     * @param {Object} toolInstance - Instance of the tool implementing required interface
     */
    registerTool(name, toolInstance) {
        if (this.tools.has(name)) {
            console.warn(`Tool ${name} is already registered`);
            return;
        }
        this.tools.set(name, toolInstance);
        console.info(`Tool ${name} registered successfully`);
    }

    /**
     * Registers a Composio tool for a specific app
     * @param {string} appName - Name of the app (e.g., 'twitter', 'gmail')
     */
    async registerComposioTool(appName) {
        if (!composioAPI.isConnected(appName)) {
            console.warn(`Cannot register Composio tool for ${appName}: not connected`);
            return;
        }

        try {
            const tools = await composioAPI.getTools(appName);
            this.composioTools.set(appName, tools);
            console.info(`Composio tools for ${appName} registered successfully`);
        } catch (error) {
            console.error(`Failed to register Composio tool for ${appName}:`, error);
        }
    }

    /**
     * Collects and returns declarations from all registered tools.
     * @returns {Array<Object>} Array of tool declarations for registered tools
     */
    getToolDeclarations() {
        const allDeclarations = [];

        // Add regular tools
        this.tools.forEach((tool) => {
            if (tool.getDeclaration) {
                allDeclarations.push(tool.getDeclaration());
            } else {
                console.warn(`Tool ${tool.name} does not have a getDeclaration method`);
            }
        });

        // Add Composio tools
        this.composioTools.forEach((tools, appName) => {
            tools.forEach(tool => {
                allDeclarations.push(tool.function);
            });
        });

        return allDeclarations;
    }

    /**
     * Parses tool arguments and runs execute() method of the requested tool.
     * @param {Object} functionCall - Function call specification
     */
    async handleToolCall(functionCall) {
        const { name, args, id } = functionCall;
        console.info(`Handling tool call: ${name}`, { args });

        // Check if this is a Composio tool (they typically have app name as prefix)
        const appNameMatch = name.match(/^([a-z]+)_/);
        if (appNameMatch && composioAPI.isConnected(appNameMatch[1])) {
            const appName = appNameMatch[1];
            console.info(`Handling Composio tool call for ${appName}`);

            try {
                // Execute the tool using the Composio API
                const result = await composioAPI.executeTool(name, args);

                return {
                    output: result.output || result,
                    id: id,
                    error: null
                };
            } catch (error) {
                console.error(`Composio tool execution failed: ${name}`, error);
                return {
                    output: null,
                    id: id,
                    error: error.message
                };
            }
        }

        // Handle regular tools
        const tool = this.tools.get(name);
        if (!tool) {
            console.error(`Tool not found: ${name}`);
            return {
                output: null,
                id: id,
                error: `Tool not found: ${name}`
            };
        }

        try {
            const result = await tool.execute(args);
            return {
                output: result,
                id: id,
                error: null
            }

        } catch (error) {
            console.error(`Tool execution failed: ${name}`, error);
            return {
                output: null,
                id: id,
                error: error.message
            };
        }
    }

}