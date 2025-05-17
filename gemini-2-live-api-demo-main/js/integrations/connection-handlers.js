/**
 * Connection Handlers Module
 *
 * This module provides event handlers for the connection buttons in the right sidebar.
 * It integrates with the Composio Client module to manage connections to third-party services.
 */

import composioClient from './composio-client.js';
import { COMPOSIO_APP_CONFIG } from '../config/composio-config.js';

/**
 * Initialize connection handlers
 * Attaches event listeners to connection buttons and updates UI
 */
export function initializeConnectionHandlers() {
    console.log('[ConnectionHandlers] Initializing connection handlers...');

    // Clear any existing connections from localStorage
    localStorage.removeItem('composio_connections');

    // Initialize Composio Client
    composioClient.initialize().then(success => {
        if (success) {
            console.log('[ConnectionHandlers] Composio Client initialized successfully');

            // Create the Gmail connection button
            createGmailConnectionButton();

            // Set up event listeners for connection messages
            setupConnectionMessageListener();
        } else {
            console.error('[ConnectionHandlers] Failed to initialize Composio Client');
        }
    });
}

/**
 * Create the Gmail connection button
 */
function createGmailConnectionButton() {
    const connectionsGrid = document.getElementById('connectionsGrid');

    if (!connectionsGrid) {
        console.error('[ConnectionHandlers] Connections grid not found');
        return;
    }

    // Clear existing buttons
    connectionsGrid.innerHTML = '';

    // Create the Gmail connection button
    const gmailButton = document.createElement('div');
    gmailButton.className = 'connection-button';
    gmailButton.setAttribute('data-app', 'gmail');

    gmailButton.innerHTML = `
        <div class="connection-icon">✉️</div>
        <div class="connection-name">Gmail</div>
        <div class="connection-status">Not connected</div>
    `;

    // Add click event listener
    gmailButton.addEventListener('click', handleConnectionButtonClick);

    // Add to the grid
    connectionsGrid.appendChild(gmailButton);

    console.log('[ConnectionHandlers] Gmail connection button created');
}

/**
 * Handle click on a connection button
 * @param {Event} event - The click event
 */
async function handleConnectionButtonClick(event) {
    const button = event.currentTarget;
    const appName = button.getAttribute('data-app');

    console.log(`[ConnectionHandlers] Connection button clicked for ${appName}`);

    if (!appName) {
        console.error('[ConnectionHandlers] No app name found for connection button');
        return;
    }

    try {
        if (composioClient.isConnected(appName)) {
            // If already connected, show disconnect confirmation
            if (confirm(`Are you sure you want to disconnect from ${appName}?`)) {
                const result = await composioClient.disconnect(appName);

                if (result.success) {
                    console.log(`[ConnectionHandlers] Successfully disconnected from ${appName}`);
                    showNotification(`Disconnected from ${appName}`, 'success');
                    updateConnectionsUI();
                } else {
                    console.error(`[ConnectionHandlers] Failed to disconnect from ${appName}:`, result.error);
                    showNotification(`Failed to disconnect from ${appName}: ${result.error}`, 'error');
                }
            }
        } else {
            // If not connected, initiate connection directly
            // Update the UI to show connecting status
            const statusElement = button.querySelector('.connection-status');
            if (statusElement) {
                statusElement.textContent = 'Connecting...';
                statusElement.style.color = '#ff9800';
            }

            // Initiate the connection - this will open the Gmail OAuth popup
            const result = await composioClient.initiateConnection(appName);

            if (result.success) {
                console.log(`[ConnectionHandlers] Initiating connection to ${appName}`);
                showNotification(`${result.message}`, 'success');
                // Note: The UI will be updated when the user returns from the OAuth flow
            } else {
                console.error(`[ConnectionHandlers] Failed to connect to ${appName}:`, result.error);
                showNotification(`Failed to connect to ${appName}: ${result.error}`, 'error');

                // Reset the status
                if (statusElement) {
                    statusElement.textContent = 'Not connected';
                    statusElement.style.color = '';
                }
            }
        }
    } catch (error) {
        console.error(`[ConnectionHandlers] Error handling connection for ${appName}:`, error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Set up event listener for connection messages from popup windows
 */
function setupConnectionMessageListener() {
    window.addEventListener('message', function(event) {
        // Check if it's a connection success message
        if (event.data && event.data.type === 'composio_connection_success') {
            const { app, connectionId } = event.data;
            console.log(`[ConnectionHandlers] Received connection success message for ${app} with ID ${connectionId}`);

            // Store the connection information
            composioClient.connections[app] = {
                connected: true,
                connectedAt: new Date().toISOString(),
                id: connectionId
            };

            composioClient.saveConnections();

            // Update the UI
            updateConnectionsUI();

            // Show notification
            showNotification(`Connected to ${app} successfully`, 'success');
        }
    });
}

/**
 * Show a notification to the user
 * @param {string} message - The notification message
 * @param {string} type - The notification type ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists, create if not
    let notificationContainer = document.getElementById('notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.backgroundColor = type === 'success' ? '#4caf50' :
                                         type === 'error' ? '#ff4444' : '#1f6feb';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';

    notification.textContent = message;

    // Add notification to container
    notificationContainer.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove notification after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';

        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Update the UI to reflect current connection status
 */
export function updateConnectionsUI() {
    const connectionButtons = document.querySelectorAll('.connection-button');
    console.log(`[ConnectionHandlers] Updating UI for ${connectionButtons.length} connection buttons`);

    connectionButtons.forEach(button => {
        const appName = button.getAttribute('data-app');
        const statusElement = button.querySelector('.connection-status');

        if (composioClient.isConnected(appName)) {
            button.classList.add('connected');
            statusElement.textContent = 'Connected';
            statusElement.style.color = '#4caf50';
        } else {
            button.classList.remove('connected');
            statusElement.textContent = 'Not connected';
            statusElement.style.color = '';
        }
    });
}

// Export functions
export default {
    initializeConnectionHandlers,
    updateConnectionsUI
};
