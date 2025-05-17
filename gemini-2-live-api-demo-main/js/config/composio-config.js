/**
 * Composio Configuration
 *
 * This module provides configuration settings for the Composio integration.
 *
 * This is a white-labeled implementation that uses our own developer credentials
 * and doesn't require users to obtain API keys.
 */

// Our Composio API key (should be stored securely in production)
// This is a fixed API key for the application, not user-specific
export const COMPOSIO_API_KEY = '42778f76-4713-4470-b930-56f972ab3434';

// Composio API base URL
// Use our proxy server to bypass CORS restrictions
export const COMPOSIO_API_BASE_URL = 'http://localhost:3002/api';

// Get entity ID for the current user
export const getComposioEntityId = () => {
    // Generate a unique entity ID for the user if not already set
    let entityId = localStorage.getItem('composioEntityId');
    if (!entityId) {
        // Generate a random ID for the user
        entityId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('composioEntityId', entityId);
    }
    return entityId;
};

// Set entity ID for the current user
export const setComposioEntityId = (entityId) => {
    localStorage.setItem('composioEntityId', entityId);
};

// Configuration for Composio connections
export const COMPOSIO_APP_CONFIG = {
    twitter: {
        displayName: 'Twitter',
        icon: '𝕏',
        appName: 'TWITTER',
        authMode: 'OAUTH2',
        authConfig: {
            client_id: 'abcdefghijklmnopqrstuvwxyz', // Twitter OAuth client ID
            client_secret: 'abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz', // Twitter OAuth client secret
            redirect_uri: window.location.origin + '/auth-callback.html', // Our redirect page that forwards to Composio
            scopes: 'dm.write dm.read mute.read mute.write space.read tweet.write tweet.read tweet.moderate.write users.read follows.read follows.write like.read like.write list.read list.write block.read block.write bookmark.read bookmark.write offline.access',
            base_url: 'https://api.x.com'
        }
    },
    gmail: {
        displayName: 'Gmail',
        icon: '✉️',
        appName: 'GOOGLEMAIL',
        authMode: 'OAUTH2',
        authConfig: {
            client_id: '1075893382020-aqb7qdmj8v5quu1a5m8nmc3hqj8qe6j5.apps.googleusercontent.com', // Google OAuth client ID
            client_secret: 'GOCSPX-Yd-Nt-Yd-Nt-Yd-Nt-Yd-Nt-Yd-Nt', // Replace with your actual client secret
            // redirect_uri will be set dynamically in the code
            scopes: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.profile'
        }
    },
    github: {
        displayName: 'GitHub',
        icon: '🐙',
        appName: 'GITHUB',
        authMode: 'OAUTH2',
        authConfig: {
            client_id: 'abcdef1234567890abcd', // GitHub OAuth App client ID
            client_secret: 'abcdef1234567890abcdef1234567890abcdef12', // GitHub OAuth App client secret
            redirect_uri: window.location.origin + '/auth-callback.html', // Our redirect page that forwards to Composio
            scopes: 'public_repo,user'
        }
    },
    notion: {
        displayName: 'Notion',
        icon: '📝',
        appName: 'NOTION',
        authMode: 'OAUTH2',
        authConfig: {
            client_id: 'abcdef12-3456-7890-abcd-ef1234567890', // Notion OAuth client ID
            client_secret: 'secret_abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm', // Notion OAuth client secret
            redirect_uri: window.location.origin + '/auth-callback.html', // Our redirect page that forwards to Composio
            // Notion doesn't require explicit scopes in the OAuth flow
            scopes: ''
        }
    },
    googlesheets: {
        displayName: 'Google Sheets',
        icon: '📊',
        appName: 'GOOGLESHEETS',
        authMode: 'OAUTH2',
        authConfig: {
            client_id: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com', // Google OAuth client ID
            client_secret: 'GOCSPX-abcdefghijklmnopqrstuvwxyz123456', // Google OAuth client secret
            redirect_uri: window.location.origin + '/auth-callback.html', // Our redirect page that forwards to Composio
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        }
    },
    shopify: {
        displayName: 'Shopify',
        icon: '🛍️',
        appName: 'SHOPIFY',
        authMode: 'OAUTH2',
        authConfig: {
            client_id: 'abcdef1234567890abcdef1234567890', // Shopify API key
            client_secret: 'abcdef1234567890abcdef1234567890', // Shopify API secret key
            redirect_uri: window.location.origin + '/auth-callback.html', // Our redirect page that forwards to Composio
            scopes: 'read_products,write_products,read_orders,write_orders',
            shop: '' // This needs to be set dynamically based on user input
        }
    },
    stripe: {
        displayName: 'Stripe',
        icon: '💳',
        appName: 'STRIPE',
        authMode: 'API_KEY',
        authConfig: {
            api_key: '' // This needs to be set dynamically based on user input
        }
    }
};

// Export the API key for internal use
export const getComposioApiKey = () => COMPOSIO_API_KEY;

// Export default configuration
export default {
    getComposioApiKey,
    getComposioEntityId,
    setComposioEntityId,
    COMPOSIO_APP_CONFIG
};
