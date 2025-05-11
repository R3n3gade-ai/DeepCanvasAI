// DOM elements object
const elements = {
    // Legacy button elements (for compatibility)
    disconnectBtn: document.getElementById('disconnectBtn'),
    connectBtn: document.getElementById('connectBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // Control button elements
    micBtn: document.getElementById('micBtn'),
    cameraBtn: document.getElementById('cameraBtn'),
    screenBtn: document.getElementById('screenBtn'),
    
    // Preview elements
    cameraPreview: document.getElementById('cameraPreview'),
    screenPreview: document.getElementById('screenPreview'),
    
    // Text input elements
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    
    // Visualizer canvas
    visualizerCanvas: document.getElementById('visualizer'),
    
    // Left sidebar elements
    leftSidebar: document.querySelector('.left-sidebar'),
    workspaceBtn: document.getElementById('workspaceBtn'),
    projectsBtn: document.getElementById('projectsBtn'),
    workspaceContent: document.querySelector('.workspace-content'),
    projectsContent: document.querySelector('.projects-content'),
    
    // Right sidebar elements
    rightSidebar: document.querySelector('.right-sidebar'),
    toolsBtn: document.getElementById('toolsBtn'),
    connectionsBtn: document.getElementById('connectionsBtn'),
    toolsContent: document.querySelector('.tools-content'),
    connectionsContent: document.querySelector('.connections-content'),
    
    // Main content
    mainContent: document.querySelector('.main-content'),
    chatHistory: document.getElementById('chatHistory'),
    controlPanel: document.querySelector('.control-panel'),
    
    // Gemini settings elements
    modelSelect: document.getElementById('modelSelect'),
    temperatureSlider: document.querySelector('.temperature-slider'),
    temperatureValue: document.querySelector('.temperature-value'),
    structuredOutputToggle: document.querySelector('.setting-row:nth-child(4) .toggle-switch input'),
    codeExecutionToggle: document.querySelector('.setting-row:nth-child(5) .toggle-switch input'),
    functionCallingToggle: document.querySelector('.setting-row:nth-child(6) .toggle-switch input'),
    groundingToggle: document.querySelector('.setting-row:nth-child(7) .toggle-switch input'),
    voiceSelect: document.getElementById('voiceSelect'),
    languageSelect: document.getElementById('languageSelect'),
    
    // Action buttons
    copyBtn: document.querySelector('.copy-btn'),
    shareBtn: document.querySelector('.share-btn'),
    saveBtn: document.querySelector('.save-btn'),
    refreshBtn: document.querySelector('.refresh-btn'),
    moreBtn: document.querySelector('.more-btn'),
    
    // Second-Me brain slots
    brainSlot1: document.getElementById('brainSlot1'),
    brainSlot2: document.getElementById('brainSlot2'),
    brainSlotsContainer: document.querySelector('.brain-slots-container')
};

export default elements;
