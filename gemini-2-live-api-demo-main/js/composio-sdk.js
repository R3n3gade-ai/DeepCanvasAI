/**
 * Composio SDK Mock
 *
 * This is a mock implementation of the Composio SDK for development purposes.
 * It provides the necessary methods for the white-labeled OAuth flow.
 */

(function(global) {
    // Define the Composio namespace
    const Composio = {};

    // Client class for interacting with the Composio API
    class Client {
        constructor(options = {}) {
            this.apiKey = options.apiKey || '';
            this.baseUrl = options.baseUrl || 'https://backend.composio.dev/api/v1';

            // Initialize API endpoints
            this.integrations = new IntegrationsAPI(this);
            this.connections = new ConnectionsAPI(this);
            this.tools = new ToolsAPI(this);

            console.log('[Composio SDK] Client initialized');
        }

        // Make an API request
        async request(method, path, data = null) {
            const url = `${this.baseUrl}${path}`;

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            };

            const options = {
                method,
                headers,
                credentials: 'include',
                mode: 'cors'
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(data);
            }

            console.log(`[Composio SDK] Making ${method} request to ${url}`);

            try {
                const response = await fetch(url, options);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
                }

                // Check if the response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }

                return await response.text();
            } catch (error) {
                console.error('[Composio SDK] Request error:', error);
                throw error;
            }
        }
    }

    // Integrations API
    class IntegrationsAPI {
        constructor(client) {
            this.client = client;
        }

        // Create a new integration
        async create(params) {
            console.log('[Composio SDK] Creating integration:', params);

            return this.client.request('POST', '/integrations', params);
        }

        // Get an integration by ID
        async get(params) {
            const { integration_id } = params;

            return this.client.request('GET', `/integrations/${integration_id}`);
        }

        // List all integrations
        async list() {
            return this.client.request('GET', '/integrations');
        }

        // Update an integration
        async update(params) {
            const { integration_id, ...data } = params;

            return this.client.request('PATCH', `/integrations/${integration_id}`, data);
        }

        // Delete an integration
        async delete(params) {
            const { integration_id } = params;

            return this.client.request('DELETE', `/integrations/${integration_id}`);
        }
    }

    // Connections API
    class ConnectionsAPI {
        constructor(client) {
            this.client = client;
        }

        // Initiate a connection
        async initiateConnection(params) {
            console.log('[Composio SDK] Initiating connection:', params);

            return this.client.request('POST', '/connections/initiate', params);
        }

        // Complete a connection (OAuth callback)
        async complete(params) {
            console.log('[Composio SDK] Completing connection:', params);

            return this.client.request('POST', '/connections/complete', params);
        }

        // Get a connection by ID
        async get(params) {
            const { connection_id } = params;

            return this.client.request('GET', `/connections/${connection_id}`);
        }

        // List connections for an entity
        async list(params) {
            const { entity_id } = params;

            return this.client.request('GET', `/connections?entity_id=${entity_id}`);
        }

        // Delete a connection
        async delete(params) {
            const { connection_id } = params;

            return this.client.request('DELETE', `/connections/${connection_id}`);
        }

        // Check if a connection is active
        async isActive(params) {
            const { connection_id } = params;

            try {
                const connection = await this.get({ connection_id });
                return connection.status === 'active';
            } catch (error) {
                console.error('[Composio SDK] Error checking connection status:', error);
                return false;
            }
        }

        // Wait until a connection is active
        async waitUntilActive(params) {
            const { connection_id, timeout = 60000, interval = 1000 } = params;

            console.log(`[Composio SDK] Waiting for connection ${connection_id} to become active...`);

            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                const isActive = await this.isActive({ connection_id });

                if (isActive) {
                    console.log(`[Composio SDK] Connection ${connection_id} is now active`);
                    return true;
                }

                // Wait for the specified interval
                await new Promise(resolve => setTimeout(resolve, interval));
            }

            throw new Error(`Timeout waiting for connection ${connection_id} to become active`);
        }
    }

    // Tools API
    class ToolsAPI {
        constructor(client) {
            this.client = client;
        }

        // Get tools for an entity
        async get(params) {
            const { entity_id, actions } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('entity_id', entity_id);

            if (actions && Array.isArray(actions)) {
                actions.forEach(action => {
                    queryParams.append('actions', action);
                });
            }

            return this.client.request('GET', `/tools?${queryParams.toString()}`);
        }

        // Execute a tool
        async execute(params) {
            return this.client.request('POST', '/tools/execute', params);
        }
    }

    // Assign the Client class to the Composio namespace
    Composio.Client = Client;

    // Expose the Composio namespace globally
    global.Composio = Composio;

    console.log('[Composio SDK] Mock loaded successfully');
})(typeof window !== 'undefined' ? window : global);
