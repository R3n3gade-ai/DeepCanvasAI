/**
 * Composio Client
 *
 * This module provides a client for interacting with the Composio API using the official SDK.
 * It handles authentication, connection management, and tool execution following the white-labeled OAuth flow.
 */

import { getComposioApiKey, getComposioEntityId, COMPOSIO_API_BASE_URL, COMPOSIO_APP_CONFIG } from '../config/composio-config.js';

/**
 * ComposioClient class
 * Implements the Composio integration using the official SDK
 */
class ComposioClient {
    constructor() {
        this.apiKey = getComposioApiKey();
        this.baseUrl = COMPOSIO_API_BASE_URL;
        this.entityId = getComposioEntityId();
        this.initialized = false;
        this.connections = {};
        this.sdk = null;

        console.log('[ComposioClient] Created');
        console.log('[ComposioClient] API Key:', this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'not set');
        console.log('[ComposioClient] Base URL:', this.baseUrl);
        console.log('[ComposioClient] Entity ID:', this.entityId);

        // Store API key and base URL in localStorage for auth callback
        localStorage.setItem('composio_api_key', this.apiKey);
        localStorage.setItem('composio_api_base_url', this.baseUrl);
    }

    /**
     * Initialize the client
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    async initialize() {
        if (this.initialized) {
            return true;
        }

        console.log('[ComposioClient] Initializing...');

        try {
            // Load the Composio SDK
            await this.loadComposioSDK();

            // Create the SDK client
            this.sdk = new Composio.Client({
                apiKey: this.apiKey,
                baseUrl: 'http://localhost:3002/api' // Use our proxy server
            });

            console.log('[ComposioClient] SDK client created');

            // Load existing connections from localStorage
            this.loadConnections();

            this.initialized = true;
            console.log('[ComposioClient] Initialization complete');
            return true;
        } catch (error) {
            console.error('[ComposioClient] Initialization error:', error);
            return false;
        }
    }

    /**
     * Load the Composio SDK
     * @returns {Promise<void>}
     */
    loadComposioSDK() {
        return new Promise((resolve, reject) => {
            if (typeof Composio !== 'undefined') {
                console.log('[ComposioClient] Composio SDK already loaded');
                resolve();
                return;
            }

            // Load our local mock SDK instead of the CDN version
            const script = document.createElement('script');
            script.src = '/js/composio-sdk.js';
            script.async = true;

            script.onload = () => {
                console.log('[ComposioClient] Composio SDK loaded');
                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load Composio SDK'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Load existing connections from localStorage
     */
    loadConnections() {
        try {
            const savedConnections = localStorage.getItem('composio_connections');
            if (savedConnections) {
                this.connections = JSON.parse(savedConnections);
                console.log(`[ComposioClient] Loaded ${Object.keys(this.connections).length} existing connections`);
            } else {
                // Ensure connections is initialized as an empty object
                this.connections = {};
                console.log('[ComposioClient] No saved connections found, initialized empty connections object');
            }
        } catch (error) {
            console.error('[ComposioClient] Error loading connections:', error);
            this.connections = {};
        }
    }

    /**
     * Save connections to localStorage
     */
    saveConnections() {
        try {
            localStorage.setItem('composio_connections', JSON.stringify(this.connections));
        } catch (error) {
            console.error('[ComposioClient] Error saving connections:', error);
        }
    }

    /**
     * Initiate a connection to a specific app
     * @param {string} appName - The name of the app to connect to
     * @returns {Promise<Object>} - Connection result
     */
    async initiateConnection(appName) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`[ComposioClient] Initiating connection to ${appName}...`);

        try {
            // Get the app configuration
            const appConfig = COMPOSIO_APP_CONFIG[appName];
            if (!appConfig) {
                throw new Error(`Unknown app: ${appName}`);
            }

            // Create a state parameter to identify the app in the callback
            const state = btoa(JSON.stringify({ app: appName }));

            // Set up the redirect URL for OAuth - use our proxy server's redirect endpoint
            const redirectUrl = `${window.location.origin}/redirect?state=${state}`;

            // Create an integration with our own OAuth credentials
            console.log(`[ComposioClient] Creating integration for ${appName}...`);

            // Update the auth config with our redirect URL
            const authConfig = { ...appConfig.authConfig };
            authConfig.redirect_uri = redirectUrl;

            const integration = await this.sdk.integrations.create({
                app: appConfig.appName,
                auth_mode: appConfig.authMode,
                use_composio_oauth_app: false, // Use our own OAuth app
                auth_config: authConfig
            });

            console.log(`[ComposioClient] Created integration: ${integration.id}`);

            // Initiate the connection
            console.log(`[ComposioClient] Initiating connection with integration ID: ${integration.id}`);
            const connectionRequest = await this.sdk.connections.initiateConnection({
                integration_id: integration.id,
                entity_id: this.entityId,
                redirect_url: redirectUrl // Use the same redirect URL as in the integration
            });

            console.log(`[ComposioClient] Connection initiated: ${connectionRequest.id}`);

            // Store the connection ID in localStorage for the callback
            localStorage.setItem('composio_pending_connection', JSON.stringify({
                id: connectionRequest.id,
                app: appName,
                timestamp: Date.now()
            }));

            // For OAuth, open a popup window
            if (appConfig.authMode === 'OAUTH2') {
                const oauthUrl = connectionRequest.redirect_url || connectionRequest.redirect_uri;

                if (!oauthUrl) {
                    throw new Error('No redirect URL returned from Composio');
                }

                // Open the OAuth URL in a popup window
                const width = 600;
                const height = 700;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;

                console.log(`[ComposioClient] Opening OAuth window: ${oauthUrl}`);

                const popup = window.open(
                    oauthUrl,
                    `${appName}Auth`,
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                );

                // Check if popup was blocked
                if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                    throw new Error('Popup was blocked. Please allow popups for this site.');
                }

                return {
                    success: true,
                    message: `Connecting to ${appName}...`,
                    connectionId: connectionRequest.id,
                    popup: popup
                };
            }
        } catch (error) {
            console.error(`[ComposioClient] Error connecting to ${appName}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if a specific app is connected
     * @param {string} appName - The name of the app to check
     * @returns {boolean} - True if connected, false otherwise
     */
    isConnected(appName) {
        if (!this.connections[appName]) {
            return false;
        }

        return this.connections[appName].connected === true;
    }

    /**
     * Disconnect from a specific app
     * @param {string} appName - The name of the app to disconnect from
     * @returns {Promise<Object>} - Disconnection result
     */
    async disconnect(appName) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`[ComposioClient] Disconnecting from ${appName}...`);

        try {
            // Get the connection ID
            const connection = this.connections[appName];
            if (!connection || !connection.id) {
                throw new Error(`No connection ID found for ${appName}`);
            }

            // Delete the connection from Composio
            await this.sdk.connections.delete({
                connection_id: connection.id
            });

            // Remove from local storage
            delete this.connections[appName];
            this.saveConnections();

            return {
                success: true,
                message: `Disconnected from ${appName}`
            };
        } catch (error) {
            console.error(`[ComposioClient] Error disconnecting from ${appName}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create and export a singleton instance
const composioClient = new ComposioClient();
export default composioClient;
