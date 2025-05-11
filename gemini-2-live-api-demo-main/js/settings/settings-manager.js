import { settingsTemplate } from './settings-template.js';

class SettingsManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // Create settings dialog and overlay
        this.dialog = document.createElement('div');
        this.dialog.className = 'settings-dialog';
        this.dialog.innerHTML = settingsTemplate;

        this.overlay = document.createElement('div');
        this.overlay.className = 'settings-overlay';

        // Add to document
        document.body.appendChild(this.dialog);
        document.body.appendChild(this.overlay);

        // Cache DOM elements
        this.elements = {
            dialog: this.dialog,
            overlay: this.overlay,
            apiKeyInput: this.dialog.querySelector('#apiKey'),
            deepgramApiKeyInput: this.dialog.querySelector('#deepgramApiKey'),
            veo2AccessTokenInput: this.dialog.querySelector('#veo2AccessToken'),
            veo2ApiUrlInput: this.dialog.querySelector('#veo2ApiUrl'),
            secondMeToggle: this.dialog.querySelector('#secondMeToggle'),
            secondMeContent: this.dialog.querySelector('#secondMeToggle + .collapsible-content'),
            secondMeApiUrlInput: this.dialog.querySelector('#secondMeApiUrl'),
            secondMeAppUrlInput: this.dialog.querySelector('#secondMeAppUrl'),
            reactVideoEditorToggle: this.dialog.querySelector('#reactVideoEditorToggle'),
            reactVideoEditorContent: this.dialog.querySelector('#reactVideoEditorToggle + .collapsible-content'),
            reactVideoEditorUrlInput: this.dialog.querySelector('#reactVideoEditorUrl'),
            voiceSelect: this.dialog.querySelector('#voice'),
            sampleRateInput: this.dialog.querySelector('#sampleRate'),
            sampleRateValue: this.dialog.querySelector('#sampleRateValue'),
            systemInstructionsToggle: this.dialog.querySelector('#systemInstructionsToggle'),
            systemInstructionsContent: this.dialog.querySelector('#systemInstructions').parentElement,
            systemInstructionsInput: this.dialog.querySelector('#systemInstructions'),
            screenCameraToggle: this.dialog.querySelector('#screenCameraToggle'),
            screenCameraContent: this.dialog.querySelector('#screenCameraToggle + .collapsible-content'),
            fpsInput: this.dialog.querySelector('#fps'),
            fpsValue: this.dialog.querySelector('#fpsValue'),
            resizeWidthInput: this.dialog.querySelector('#resizeWidth'),
            resizeWidthValue: this.dialog.querySelector('#resizeWidthValue'),
            qualityInput: this.dialog.querySelector('#quality'),
            qualityValue: this.dialog.querySelector('#qualityValue'),
            advancedToggle: this.dialog.querySelector('#advancedToggle'),
            advancedContent: this.dialog.querySelector('#advancedToggle + .collapsible-content'),
            temperatureInput: this.dialog.querySelector('#temperature'),
            temperatureValue: this.dialog.querySelector('#temperatureValue'),
            topPInput: this.dialog.querySelector('#topP'),
            topPValue: this.dialog.querySelector('#topPValue'),
            topKInput: this.dialog.querySelector('#topK'),
            topKValue: this.dialog.querySelector('#topKValue'),
            safetyToggle: this.dialog.querySelector('#safetyToggle'),
            safetyContent: this.dialog.querySelector('#safetyToggle + .collapsible-content'),
            harassmentInput: this.dialog.querySelector('#harassmentThreshold'),
            harassmentValue: this.dialog.querySelector('#harassmentValue'),
            dangerousInput: this.dialog.querySelector('#dangerousContentThreshold'),
            dangerousValue: this.dialog.querySelector('#dangerousValue'),
            sexualInput: this.dialog.querySelector('#sexuallyExplicitThreshold'),
            sexualValue: this.dialog.querySelector('#sexualValue'),
            civicInput: this.dialog.querySelector('#civicIntegrityThreshold'),
            civicValue: this.dialog.querySelector('#civicValue'),
            saveBtn: this.dialog.querySelector('#settingsSaveBtn')
        };
    }

    setupEventListeners() {
        // Close settings when clicking overlay
        this.overlay.addEventListener('click', () => this.hide());

        // Prevent dialog close when clicking inside dialog
        this.dialog.addEventListener('click', (e) => e.stopPropagation());

        // Save settings
        this.elements.saveBtn.addEventListener('click', () => {
            this.saveSettings();
            this.hide();
            window.location.reload();
        });

        // Toggle collapsible sections
        this.elements.systemInstructionsToggle.addEventListener('click', () => {
            this.toggleCollapsible(this.elements.systemInstructionsToggle, this.elements.systemInstructionsContent);
        });

        this.elements.advancedToggle.addEventListener('click', () => {
            this.toggleCollapsible(this.elements.advancedToggle, this.elements.advancedContent);
        });

        this.elements.screenCameraToggle.addEventListener('click', () => {
            this.toggleCollapsible(this.elements.screenCameraToggle, this.elements.screenCameraContent);
        });

        this.elements.safetyToggle.addEventListener('click', () => {
            this.toggleCollapsible(this.elements.safetyToggle, this.elements.safetyContent);
        });
        
        this.elements.secondMeToggle.addEventListener('click', () => {
            this.toggleCollapsible(this.elements.secondMeToggle, this.elements.secondMeContent);
        });
        
        this.elements.reactVideoEditorToggle.addEventListener('click', () => {
            this.toggleCollapsible(this.elements.reactVideoEditorToggle, this.elements.reactVideoEditorContent);
        });

        // Add input listeners for real-time value updates
        const inputElements = [
            'sampleRateInput', 'temperatureInput', 'topPInput', 'topKInput',
            'fpsInput', 'resizeWidthInput', 'qualityInput', 'harassmentInput',
            'dangerousInput', 'sexualInput', 'civicInput'
        ];

        inputElements.forEach(elementName => {
            this.elements[elementName].addEventListener('input', () => this.updateDisplayValues());
        });
    }

    loadSettings() {
        // Load values from localStorage
        this.elements.apiKeyInput.value = localStorage.getItem('apiKey') || '';
        this.elements.deepgramApiKeyInput.value = localStorage.getItem('deepgramApiKey') || '';
        this.elements.veo2AccessTokenInput.value = localStorage.getItem('veo2AccessToken') || '';
        this.elements.veo2ApiUrlInput.value = localStorage.getItem('veo2ApiUrl') || '';
        
        // Load Second-Me settings
        this.elements.secondMeApiUrlInput.value = localStorage.getItem('secondMeApiUrl') || 'http://localhost:5000/api';
        this.elements.secondMeAppUrlInput.value = localStorage.getItem('secondMeAppUrl') || 'https://second-me.ai';
        
        // Load React Video Editor settings
        this.elements.reactVideoEditorUrlInput.value = localStorage.getItem('reactVideoEditorUrl') || 'http://localhost:3000';
        this.elements.voiceSelect.value = localStorage.getItem('voiceName') || 'Aoede';
        this.elements.sampleRateInput.value = localStorage.getItem('sampleRate') || '27000';
        this.elements.systemInstructionsInput.value = localStorage.getItem('systemInstructions') || 'You are a helpful assistant';
        this.elements.temperatureInput.value = localStorage.getItem('temperature') || '1.8';
        this.elements.topPInput.value = localStorage.getItem('top_p') || '0.95';
        this.elements.topKInput.value = localStorage.getItem('top_k') || '65';

        // Initialize screen & camera settings
        this.elements.fpsInput.value = localStorage.getItem('fps') || '1';
        this.elements.resizeWidthInput.value = localStorage.getItem('resizeWidth') || '640';
        this.elements.qualityInput.value = localStorage.getItem('quality') || '0.3';

        // Initialize safety settings
        this.elements.harassmentInput.value = localStorage.getItem('harassmentThreshold') || '3';
        this.elements.dangerousInput.value = localStorage.getItem('dangerousContentThreshold') || '3';
        this.elements.sexualInput.value = localStorage.getItem('sexuallyExplicitThreshold') || '3';
        this.elements.civicInput.value = localStorage.getItem('civicIntegrityThreshold') || '3';

        this.updateDisplayValues();
    }

    saveSettings() {
        localStorage.setItem('apiKey', this.elements.apiKeyInput.value);
        localStorage.setItem('deepgramApiKey', this.elements.deepgramApiKeyInput.value);
        localStorage.setItem('veo2AccessToken', this.elements.veo2AccessTokenInput.value);
        localStorage.setItem('veo2ApiUrl', this.elements.veo2ApiUrlInput.value);
        
        // Save Second-Me settings
        localStorage.setItem('secondMeApiUrl', this.elements.secondMeApiUrlInput.value);
        localStorage.setItem('secondMeAppUrl', this.elements.secondMeAppUrlInput.value);
        
        // Save React Video Editor settings
        localStorage.setItem('reactVideoEditorUrl', this.elements.reactVideoEditorUrlInput.value);
        localStorage.setItem('voiceName', this.elements.voiceSelect.value);
        localStorage.setItem('sampleRate', this.elements.sampleRateInput.value);
        localStorage.setItem('systemInstructions', this.elements.systemInstructionsInput.value);
        localStorage.setItem('temperature', this.elements.temperatureInput.value);
        localStorage.setItem('top_p', this.elements.topPInput.value);
        localStorage.setItem('top_k', this.elements.topKInput.value);
        
        // Save screen & camera settings
        localStorage.setItem('fps', this.elements.fpsInput.value);
        localStorage.setItem('resizeWidth', this.elements.resizeWidthInput.value);
        localStorage.setItem('quality', this.elements.qualityInput.value);

        // Save safety settings
        localStorage.setItem('harassmentThreshold', this.elements.harassmentInput.value);
        localStorage.setItem('dangerousContentThreshold', this.elements.dangerousInput.value);
        localStorage.setItem('sexuallyExplicitThreshold', this.elements.sexualInput.value);
        localStorage.setItem('civicIntegrityThreshold', this.elements.civicInput.value);
        
        // Save UI settings (these are managed in the sidebar but we want to persist them)
        const language = localStorage.getItem('language') || 'en-US';
        localStorage.setItem('language', language);
        
        const modelName = localStorage.getItem('modelName') || 'Gemini 2.5 Pro Preview 05-06';
        localStorage.setItem('modelName', modelName);
        
        // Save toggle states
        const structuredOutput = localStorage.getItem('structuredOutput') === 'true';
        const codeExecution = localStorage.getItem('codeExecution') === 'true';
        const functionCalling = localStorage.getItem('functionCalling') === 'true';
        const grounding = localStorage.getItem('grounding') === 'true';
        
        localStorage.setItem('structuredOutput', structuredOutput);
        localStorage.setItem('codeExecution', codeExecution);
        localStorage.setItem('functionCalling', functionCalling);
        localStorage.setItem('grounding', grounding);
    }

    updateDisplayValues() {
        this.elements.sampleRateValue.textContent = this.elements.sampleRateInput.value + ' Hz';
        this.elements.temperatureValue.textContent = this.elements.temperatureInput.value;
        this.elements.topPValue.textContent = this.elements.topPInput.value;
        this.elements.topKValue.textContent = this.elements.topKInput.value;
        this.elements.fpsValue.textContent = this.elements.fpsInput.value + ' FPS';
        this.elements.resizeWidthValue.textContent = this.elements.resizeWidthInput.value + 'px';
        this.elements.qualityValue.textContent = this.elements.qualityInput.value;
        this.elements.harassmentValue.textContent = this.getThresholdLabel(this.elements.harassmentInput.value);
        this.elements.dangerousValue.textContent = this.getThresholdLabel(this.elements.dangerousInput.value);
        this.elements.sexualValue.textContent = this.getThresholdLabel(this.elements.sexualInput.value);
        this.elements.civicValue.textContent = this.getThresholdLabel(this.elements.civicInput.value);
    }

    getThresholdLabel(value) {
        const labels = {
            '0': 'None',
            '1': 'Low',
            '2': 'Medium',
            '3': 'High'
        };
        return labels[value] || value;
    }

    toggleCollapsible(toggle, content) {
        const isActive = content.classList.contains('active');
        content.classList.toggle('active');
        toggle.textContent = toggle.textContent.replace(isActive ? '▼' : '▲', isActive ? '▲' : '▼');
    }

    show() {
        this.dialog.classList.add('active');
        this.overlay.classList.add('active');
    }

    hide() {
        this.dialog.classList.remove('active');
        this.overlay.classList.remove('active');
    }
    
    // Get all settings as an object
    getSettings() {
        return {
            apiKey: localStorage.getItem('apiKey') || '',
            deepgramApiKey: localStorage.getItem('deepgramApiKey') || '',
            veo2: {
                accessToken: localStorage.getItem('veo2AccessToken') || '',
                apiUrl: localStorage.getItem('veo2ApiUrl') || ''
            },
            secondMe: {
                apiUrl: localStorage.getItem('secondMeApiUrl') || 'http://localhost:5000/api',
                appUrl: localStorage.getItem('secondMeAppUrl') || 'https://second-me.ai',
                autoAuthenticate: true
            },
            reactVideoEditor: {
                editorUrl: localStorage.getItem('reactVideoEditorUrl') || 'http://localhost:3000'
            },
            voice: localStorage.getItem('voiceName') || 'Aoede',
            sampleRate: parseInt(localStorage.getItem('sampleRate') || '27000'),
            systemInstructions: localStorage.getItem('systemInstructions') || 'You are a helpful assistant',
            temperature: parseFloat(localStorage.getItem('temperature') || '1.8'),
            top_p: parseFloat(localStorage.getItem('top_p') || '0.95'),
            top_k: parseInt(localStorage.getItem('top_k') || '65'),
            fps: parseInt(localStorage.getItem('fps') || '1'),
            resizeWidth: parseInt(localStorage.getItem('resizeWidth') || '640'),
            quality: parseFloat(localStorage.getItem('quality') || '0.3'),
            safetySettings: {
                harassment: parseInt(localStorage.getItem('harassmentThreshold') || '3'),
                dangerous: parseInt(localStorage.getItem('dangerousContentThreshold') || '3'),
                sexual: parseInt(localStorage.getItem('sexuallyExplicitThreshold') || '3'),
                civic: parseInt(localStorage.getItem('civicIntegrityThreshold') || '3')
            },
            features: {
                structuredOutput: localStorage.getItem('structuredOutput') === 'true',
                codeExecution: localStorage.getItem('codeExecution') === 'true',
                functionCalling: localStorage.getItem('functionCalling') === 'true',
                grounding: localStorage.getItem('grounding') === 'true'
            }
        };
    }
}

export default new SettingsManager();
