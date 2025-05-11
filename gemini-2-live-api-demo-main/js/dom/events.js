import elements from './elements.js';
import settingsManager from '../settings/settings-manager.js';

/**
 * Updates UI to show disconnect button and hide connect button
 */
const showDisconnectButton = () => {
    elements.connectBtn.style.display = 'none';
    elements.disconnectBtn.style.display = 'block';
};

/**
 * Updates UI to show connect button and hide disconnect button
 */
const showConnectButton = () => {
    elements.disconnectBtn.style.display = 'none';
    elements.connectBtn.style.display = 'block';
};

let isCameraActive = false;

/**
 * Ensures the agent is connected and initialized
 * @param {GeminiAgent} agent - The main application agent instance
 * @returns {Promise<void>}
 */
const ensureAgentReady = async (agent) => {
    if (!agent.connected) {
        await agent.connect();
        showDisconnectButton();
    }
    if (!agent.initialized) {
        await agent.initialize();
    }
};

/**
 * Sets up event listeners for the application's UI elements
 * @param {GeminiAgent} agent - The main application agent instance
 */
export function setupEventListeners(agent) {
    // Disconnect handler (legacy button)
    elements.disconnectBtn.addEventListener('click', async () => {
        try {
            await agent.disconnect();
            showConnectButton();
            [elements.cameraBtn, elements.screenBtn, elements.micBtn].forEach(btn => btn.classList.remove('active'));
            isCameraActive = false;
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    });

    // Connect handler (legacy button)
    elements.connectBtn.addEventListener('click', async () => {
        try {
            await ensureAgentReady(agent);
        } catch (error) {
            console.error('Error connecting:', error);
        }
    });

    // Microphone toggle handler
    elements.micBtn.addEventListener('click', async () => {
        try {
            await ensureAgentReady(agent);
            await agent.toggleMic();
            elements.micBtn.classList.toggle('active');
        } catch (error) {
            console.error('Error toggling microphone:', error);
            elements.micBtn.classList.remove('active');
        }
    });

    // Camera toggle handler
    elements.cameraBtn.addEventListener('click', async () => {
        try {
            await ensureAgentReady(agent);
            
            if (!isCameraActive) {
                await agent.startCameraCapture();
                elements.cameraBtn.classList.add('active');
            } else {
                await agent.stopCameraCapture();
                elements.cameraBtn.classList.remove('active');
            }
            isCameraActive = !isCameraActive;
        } catch (error) {
            console.error('Error toggling camera:', error);
            elements.cameraBtn.classList.remove('active');
            isCameraActive = false;
        }
    });

    // Screen sharing handler
    let isScreenShareActive = false;
    
    // Listen for screen share stopped events (from native browser controls)
    agent.on('screenshare_stopped', () => {
        elements.screenBtn.classList.remove('active');
        isScreenShareActive = false;
        console.info('Screen share stopped');
    });

    elements.screenBtn.addEventListener('click', async () => {
        try {
            await ensureAgentReady(agent);
            
            if (!isScreenShareActive) {
                await agent.startScreenShare();
                elements.screenBtn.classList.add('active');
            } else {
                await agent.stopScreenShare();
                elements.screenBtn.classList.remove('active');
            }
            isScreenShareActive = !isScreenShareActive;
        } catch (error) {
            console.error('Error toggling screen share:', error);
            elements.screenBtn.classList.remove('active');
            isScreenShareActive = false;
        }
    });

    // Message sending handlers
    const sendMessage = async () => {
        try {
            await ensureAgentReady(agent);
            const text = elements.messageInput.value.trim();
            await agent.sendText(text);
            elements.messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Settings button click (legacy button)
    elements.settingsBtn.addEventListener('click', () => settingsManager.show());
    
    // New UI elements event handlers
    
    // Left sidebar tabs
    if (elements.workspaceBtn && elements.projectsBtn) {
        elements.workspaceBtn.addEventListener('click', () => {
            elements.workspaceBtn.classList.add('active');
            elements.projectsBtn.classList.remove('active');
            elements.workspaceContent.style.display = 'flex';
            elements.projectsContent.style.display = 'none';
        });
        
        elements.projectsBtn.addEventListener('click', () => {
            elements.projectsBtn.classList.add('active');
            elements.workspaceBtn.classList.remove('active');
            elements.projectsContent.style.display = 'flex';
            elements.workspaceContent.style.display = 'none';
        });
    }
    
    // Right sidebar tabs
    if (elements.toolsBtn && elements.connectionsBtn) {
        elements.toolsBtn.addEventListener('click', () => {
            elements.toolsBtn.classList.add('active');
            elements.connectionsBtn.classList.remove('active');
            elements.toolsContent.style.display = 'flex';
            elements.connectionsContent.style.display = 'none';
        });
        
        elements.connectionsBtn.addEventListener('click', () => {
            elements.connectionsBtn.classList.add('active');
            elements.toolsBtn.classList.remove('active');
            elements.connectionsContent.style.display = 'flex';
            elements.toolsContent.style.display = 'none';
        });
    }
    
    // Chat button in left sidebar
    const chatBtn = document.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', async () => {
            try {
                // Show chat interface
                showSection('chatInterface');
                
                // Clear chat history
                if (elements.chatHistory) {
                    elements.chatHistory.innerHTML = '';
                }
                
                // Disconnect and reconnect to start fresh
                if (agent.connected) {
                    await agent.disconnect();
                }
                await ensureAgentReady(agent);
                
                console.log('Started new chat');
            } catch (error) {
                console.error('Error starting new chat:', error);
            }
        });
    }
    
    // Tool buttons in right sidebar
    const socialStationBtn = document.querySelector('.social-station-btn');
    if (socialStationBtn) {
        socialStationBtn.addEventListener('click', () => {
            // Redirect to the social station page with correct path
            window.location.href = './social-station.html';
        });
    }
    
    const videoEditorBtn = document.querySelector('.video-editor-btn');
    if (videoEditorBtn) {
        videoEditorBtn.addEventListener('click', () => {
            // Redirect directly to the React Video Editor running on port 5173
            window.location.href = 'http://localhost:5173';
        });
    }
    
    const appBuilderBtn = document.querySelector('.app-builder-btn');
    if (appBuilderBtn) {
        appBuilderBtn.addEventListener('click', () => {
            showSection('appBuilderSection');
        });
    }
    
    const creationStudioBtn = document.querySelector('.creation-studio-btn');
    if (creationStudioBtn) {
        creationStudioBtn.addEventListener('click', () => {
            // Redirect to the new creation studio page with correct path
            window.location.href = './creation-studio.html';
        });
    }
    
    // Model Training button
    const modelTrainingBtn = document.querySelector('.model-training-btn');
    if (modelTrainingBtn) {
        modelTrainingBtn.addEventListener('click', () => {
            // Open Second-Me in a new window (using local URL by default)
            const settings = settingsManager.getSettings();
            
            // Use local server URL since we already have it running on port 8000
            const secondMeUrl = 'http://localhost:8000/second-me-local';
            
            console.log('Opening Second-Me URL:', secondMeUrl);
            window.open(secondMeUrl, '_blank');
        });
    }
    
    // Function to show a specific section
    function showSection(sectionId) {
        // Show the selected section as an overlay
        document.getElementById(sectionId).classList.add('active');
    }
    
    // Add event listeners for close buttons
    document.querySelectorAll('.close-feature-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Find the parent section and hide it
            const section = btn.closest('.content-section');
            if (section) {
                section.classList.remove('active');
            }
        });
    });
}

// Initialize settings
settingsManager;

// Connect Gemini settings UI elements to settings manager
function setupGeminiSettings() {
    // Load initial values from localStorage
    if (elements.voiceSelect) {
        elements.voiceSelect.value = localStorage.getItem('voiceName') || 'Aoede';
    }
    
    if (elements.languageSelect) {
        elements.languageSelect.value = localStorage.getItem('language') || 'en-US';
        
        // Add change listener
        elements.languageSelect.addEventListener('change', () => {
            localStorage.setItem('language', elements.languageSelect.value);
        });
    }
    
    if (elements.modelSelect) {
        // Default to Gemini 2.5 Pro Preview if not set
        const savedModel = localStorage.getItem('modelName') || 'Gemini 2.5 Pro Preview 05-06';
        elements.modelSelect.value = savedModel;
        
        // Add change listener
        elements.modelSelect.addEventListener('change', () => {
            localStorage.setItem('modelName', elements.modelSelect.value);
            // Update token count display based on model
            updateTokenCount(elements.modelSelect.value);
        });
    }
    
    if (elements.temperatureSlider && elements.temperatureValue) {
        const savedTemp = localStorage.getItem('temperature') || '1.8';
        elements.temperatureSlider.value = savedTemp;
        elements.temperatureValue.value = savedTemp;
        
        // Add input listeners
        elements.temperatureSlider.addEventListener('input', () => {
            const value = elements.temperatureSlider.value;
            elements.temperatureValue.value = value;
            localStorage.setItem('temperature', value);
        });
        
        elements.temperatureValue.addEventListener('change', () => {
            const value = elements.temperatureValue.value;
            elements.temperatureSlider.value = value;
            localStorage.setItem('temperature', value);
        });
    }
    
    // Connect toggle switches
    const toggles = [
        { element: elements.structuredOutputToggle, key: 'structuredOutput' },
        { element: elements.codeExecutionToggle, key: 'codeExecution' },
        { element: elements.functionCallingToggle, key: 'functionCalling' },
        { element: elements.groundingToggle, key: 'grounding' }
    ];
    
    toggles.forEach(toggle => {
        if (toggle.element) {
            // Load initial state (default to true if not set)
            const savedState = localStorage.getItem(toggle.key);
            toggle.element.checked = savedState === null ? true : savedState === 'true';
            
            // Add change listener
            toggle.element.addEventListener('change', () => {
                localStorage.setItem(toggle.key, toggle.element.checked);
            });
        }
    });
    
    // Connect edit links
    const editLinks = document.querySelectorAll('.edit-link');
    editLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Show settings dialog when edit is clicked
            settingsManager.show();
            
            // Expand the appropriate section based on which edit link was clicked
            const settingType = link.closest('.setting-row').querySelector('.setting-label').textContent.trim().toLowerCase();
            
            if (settingType.includes('structured output')) {
                settingsManager.toggleCollapsible(
                    settingsManager.elements.advancedToggle, 
                    settingsManager.elements.advancedContent
                );
            } else if (settingType.includes('function calling')) {
                settingsManager.toggleCollapsible(
                    settingsManager.elements.advancedToggle, 
                    settingsManager.elements.advancedContent
                );
            }
        });
    });
    
    // Connect action buttons
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', () => {
            // Show settings dialog
            settingsManager.show();
        });
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', () => {
            // Copy current settings to clipboard
            const settings = {
                apiKey: localStorage.getItem('apiKey') || '',
                voiceName: localStorage.getItem('voiceName') || 'Aoede',
                temperature: localStorage.getItem('temperature') || '1.8',
                modelName: localStorage.getItem('modelName') || 'Gemini 2.5 Pro Preview 05-06',
                structuredOutput: localStorage.getItem('structuredOutput') === 'true',
                codeExecution: localStorage.getItem('codeExecution') === 'true',
                functionCalling: localStorage.getItem('functionCalling') === 'true',
                grounding: localStorage.getItem('grounding') === 'true'
            };
            
            navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
                .then(() => {
                    alert('Settings copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy settings: ', err);
                });
        });
    }
    
    // Initial token count update
    updateTokenCount(elements.modelSelect?.value || 'Gemini 2.5 Pro Preview 05-06');
}

// Helper function to update token count display
function updateTokenCount(modelName) {
    const tokenCountElement = document.querySelector('.token-count');
    if (!tokenCountElement) return;
    
    // Get current token usage (this would normally come from the API)
    const currentTokens = 599;
    
    // Set max tokens based on model
    let maxTokens = 1048576; // Default for Gemini 2.5
    
    if (modelName.includes('1.5 Flash')) {
        maxTokens = 131072; // 128K for Gemini 1.5 Flash
    } else if (modelName.includes('1.5 Pro')) {
        maxTokens = 1048576; // 1M for Gemini 1.5 Pro
    }
    
    // Update display
    tokenCountElement.textContent = `${currentTokens} / ${maxTokens.toLocaleString()}`;
}

// Call the setup function
setupGeminiSettings();
