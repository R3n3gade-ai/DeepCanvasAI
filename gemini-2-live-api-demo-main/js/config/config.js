export const getWebsocketUrl = () => {
    const apiKey = localStorage.getItem('apiKey');
    return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
};

export const getDeepgramApiKey = () => {
    return localStorage.getItem('deepgramApiKey') || '';
};

export const getVeo2AccessToken = () => {
    return localStorage.getItem('veo2AccessToken') || '';
};

export const getVeo2ApiUrl = () => {
    // Using the Vertex AI endpoint for Veo 2
    return localStorage.getItem('veo2ApiUrl') || 'https://us-central1-aiplatform.googleapis.com/v1/projects/deepcanvas-ai/locations/us-central1/publishers/google/models/veo-2:generateContent';
};

// Second-Me Configuration
export const getSecondMeApiUrl = () => {
    return localStorage.getItem('secondMeApiUrl') || 'http://localhost:5000/api';
};

export const getSecondMeAppUrl = () => {
    return localStorage.getItem('secondMeAppUrl') || 'https://second-me.ai';
};

// Second-Me is always enabled - authentication handled by the app
export const getSecondMeEnabled = () => {
    return true; // Always enabled
};

// Audio Configurations
export const MODEL_SAMPLE_RATE = parseInt(localStorage.getItem('sampleRate')) || 27000;

const thresholds = {
    0: "BLOCK_NONE",
    1: "BLOCK_ONLY_HIGH",
    2: "BLOCK_MEDIUM_AND_ABOVE",
    3: "BLOCK_LOW_AND_ABOVE"
}

export const getConfig = () => ({
    model: 'models/gemini-2.0-flash-exp',
    generationConfig: {
        temperature: parseFloat(localStorage.getItem('temperature')) || 1.8,
        top_p: parseFloat(localStorage.getItem('top_p')) || 0.95,
        top_k: parseInt(localStorage.getItem('top_k')) || 65,
        responseModalities: ["text", "audio"],
        speechConfig: {
            voiceConfig: { 
                prebuiltVoiceConfig: { 
                    voiceName: localStorage.getItem('voiceName') || 'Aoede'
                }
            }
        }
    },
    systemInstruction: {
        parts: [{
            text: localStorage.getItem('systemInstructions') || "You are a helpful assistant"
        }]
    },
    tools: {
        functionDeclarations: [],
    },
    safetySettings: [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": thresholds[localStorage.getItem('harassmentThreshold')] || "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": thresholds[localStorage.getItem('dangerousContentThreshold')] || "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": thresholds[localStorage.getItem('sexuallyExplicitThreshold')] || "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": thresholds[localStorage.getItem('hateSpeechThreshold')] || "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
        },
        {
            "category": "HARM_CATEGORY_CIVIC_INTEGRITY",
            "threshold": thresholds[localStorage.getItem('civicIntegrityThreshold')] || "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
        }
    ]
});
