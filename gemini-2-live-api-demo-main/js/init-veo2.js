/**
 * Initialize API keys and access tokens
 * This script pre-populates the Gemini API key and Vertex AI access token for the deepcanvas-ai project
 */

// Default Gemini API key
const defaultApiKey = "YOUR_GEMINI_API_KEY";

// Default Veo 2 access token obtained from user
const defaultAccessToken = "YOUR_VEO2_ACCESS_TOKEN";

// Set Gemini API key if not already configured
if (!localStorage.getItem('apiKey')) {
    console.log('🔑 Pre-populating Gemini API key');
    localStorage.setItem('apiKey', defaultApiKey);
}

// Set Veo 2 access token if not already configured
if (!localStorage.getItem('veo2AccessToken')) {
    console.log('🔑 Pre-populating Veo 2 access token for deepcanvas-ai project');
    localStorage.setItem('veo2AccessToken', defaultAccessToken);
}
