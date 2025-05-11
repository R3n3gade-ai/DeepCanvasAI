import { GeminiAgent } from './main/agent.js';
import { getConfig, getWebsocketUrl, getDeepgramApiKey, MODEL_SAMPLE_RATE, getSecondMeEnabled } from './config/config.js';

import { GoogleSearchTool } from './tools/google-search.js';
import { ToolManager } from './tools/tool-manager.js';
import { ChatManager } from './chat/chat-manager.js';

import { setupEventListeners } from './dom/events.js';
import { initCreationStudio } from './creation/creation-studio.js';
import { secondMeIntegration } from './integrations/second-me-integration.js';
import brainManager from './integrations/brain-manager.js';

const url = getWebsocketUrl();
const config = getConfig();
const deepgramApiKey = getDeepgramApiKey();

const toolManager = new ToolManager();
toolManager.registerTool('googleSearch', new GoogleSearchTool());

const chatManager = new ChatManager();

const geminiAgent = new GeminiAgent({
    url,
    config,
    deepgramApiKey,
    modelSampleRate: MODEL_SAMPLE_RATE,
    toolManager
});

// Handle chat-related events
geminiAgent.on('transcription', (transcript) => {
    chatManager.updateStreamingMessage(transcript);
});

geminiAgent.on('text_sent', (text) => {
    chatManager.finalizeStreamingMessage();
    chatManager.addUserMessage(text);
});

geminiAgent.on('interrupted', () => {
    chatManager.finalizeStreamingMessage();
    if (!chatManager.lastUserMessageType) {
        chatManager.addUserAudioMessage();
    }
});

geminiAgent.on('turn_complete', () => {
    chatManager.finalizeStreamingMessage();
});

// Handle text content from the model
geminiAgent.on('model_text', (text) => {
    // Start a new message if there isn't one already streaming
    if (!chatManager.currentStreamingMessage) {
        chatManager.startModelMessage();
    }
    chatManager.updateStreamingMessage(text);
});

geminiAgent.connect();

setupEventListeners(geminiAgent);

// Initialize Second-Me integration
async function initializeSecondMe() {
    if (getSecondMeEnabled()) {
        console.log('Second-Me integration is enabled, initializing...');
        try {
            // Initialize with the chat manager
            await secondMeIntegration.initialize({ chatManager });
            
            if (secondMeIntegration.isActive()) {
                console.log('Second-Me integration initialized successfully');
                
                // Get the enhanced chat manager (if Second-Me is enabled)
                const enhancedChatManager = secondMeIntegration.getEnhancedChatManager();
                
                if (enhancedChatManager) {
                    console.log('Using Enhanced Chat Manager with Second-Me capabilities');
                    
                    // Add any additional setup for the enhanced chat manager here
                    enhancedChatManager.addEventListener('error', (error) => {
                        console.error('Second-Me error:', error);
                    });
                }
                
                // Initialize brain manager for Second-Me
                await brainManager.initialize();
                console.log('Brain Manager initialized for Second-Me integration');
            }
        } catch (error) {
            console.error('Failed to initialize Second-Me integration:', error);
        }
    } else {
        console.log('Second-Me integration is disabled in settings');
    }
}

// Initialize Creation Studio and Second-Me after DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded, initializing components...');
    initCreationStudio();
    await initializeSecondMe();
});

// Fallback in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already loaded, initializing components...');
    initCreationStudio();
    initializeSecondMe();
}
