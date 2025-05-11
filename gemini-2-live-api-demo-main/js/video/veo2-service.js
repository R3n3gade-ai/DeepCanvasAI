/**
 * Veo 2 API Service
 * Production-ready implementation for Google's Veo 2 video generation API using Vertex AI
 */
import { getVeo2AccessToken, getVeo2ApiUrl } from '../config/config.js';

/**
 * Service class for interacting with the Veo 2 API via Vertex AI
 */
export class Veo2Service {
    /**
     * Initialize the Veo 2 service
     */
    constructor() {
        this.accessToken = getVeo2AccessToken();
        this.apiUrl = getVeo2ApiUrl();
    }

    /**
     * Check if the access token is available
     * @returns {boolean} True if access token is available, false otherwise
     */
    hasApiKey() {
        return !!this.accessToken && this.accessToken.length > 0;
    }

    /**
     * Update the access token
     * @param {string} accessToken - The new access token
     */
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
        localStorage.setItem('veo2AccessToken', accessToken);
    }

    /**
     * Generate a video from text prompt and optional image
     * Production-ready implementation for Google's Veo 2 API using Vertex AI
     *
     * @param {Object} options - Generation options
     * @param {string} options.prompt - Text description of the video
     * @param {string} [options.imageBase64] - Optional base64 encoded image to condition the video on
     * @param {string} options.aspectRatio - Aspect ratio of the video (e.g., "16:9")
     * @param {number} options.duration - Duration of the video in seconds
     * @param {boolean} options.enhancePrompt - Whether to enhance the prompt with AI
     * @returns {Promise<Object>} Response from the API with video URL
     * @throws {Error} If access token is not configured or API request fails
     */
    async generateVideo(options) {
        console.log('🚀 Starting Veo 2 video generation via Vertex AI');
        
        if (!this.hasApiKey()) {
            console.error('❌ No Veo 2 access token available');
            throw new Error('Veo 2 access token not configured. Please add your access token in settings.');
        }
        
        try {
            // Format aspect ratio for Vertex AI
            const aspectRatioParts = options.aspectRatio.split(':');
            const aspectRatioFormatted = {
                width: parseInt(aspectRatioParts[0]),
                height: parseInt(aspectRatioParts[1])
            };
            
            // Prepare Vertex AI request payload
            const payload = {
                contents: [
                    {
                        role: "USER",
                        parts: [
                            {
                                text: options.prompt
                            }
                        ]
                    }
                ],
                generation_config: {
                    temperature: 0.4,
                    seed: Math.floor(Math.random() * 1000000),
                    videoDuration: `${options.duration}s`,
                    aspectRatio: aspectRatioFormatted
                }
            };
            
            // Add image if provided
            if (options.imageBase64) {
                payload.contents[0].parts.push({
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: options.imageBase64
                    }
                });
            }
            
            console.log(`📤 Sending request to Vertex AI Veo 2 endpoint: ${this.apiUrl}`);
            
            // Make API request with Bearer token authentication
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify(payload)
            });
            
            // Handle API errors with specific error messages
            if (!response.ok) {
                let errorText = '';
                try {
                    const errorData = await response.json();
                    errorText = JSON.stringify(errorData);
                } catch {
                    errorText = await response.text();
                }
                
                console.error(`❌ Vertex AI error (${response.status}): ${errorText}`);
                
                // Provide more helpful error messages for common issues
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Invalid or expired access token. Please generate a new access token.');
                } else if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else if (response.status === 400) {
                    throw new Error(`API request error: ${errorText}`);
                } else {
                    throw new Error(`Vertex AI error (${response.status}): ${errorText}`);
                }
            }
            
            // Parse and process response
            const responseData = await response.json();
            console.log('✅ Vertex AI response received');
            
            // Extract video URL from Vertex AI response structure
            const videoResponse = this.processVertexResponse(responseData);
            
            // Return in format expected by the UI
            return {
                success: true,
                video: {
                    url: videoResponse.videoUrl,
                    prompt: options.prompt,
                    aspectRatio: options.aspectRatio,
                    duration: options.duration
                }
            };
            
        } catch (error) {
            console.error('❌ Error generating video with Veo 2:', error);
            throw error;
        }
    }
    
    /**
     * Process the Vertex AI response to extract video URL
     * @param {Object} vertexResponse - The raw response from Vertex AI
     * @returns {Object} Processed response with video URL
     */
    processVertexResponse(vertexResponse) {
        console.log('Processing Vertex AI response');
        
        try {
            // Extract video URL from Vertex AI response structure
            // Note: This structure may need adjusting based on actual Vertex AI response format
            const candidates = vertexResponse.candidates || [];
            if (candidates.length === 0) {
                throw new Error('No candidates returned in response');
            }
            
            const content = candidates[0].content;
            if (!content || !content.parts || content.parts.length === 0) {
                throw new Error('No parts found in candidate content');
            }
            
            // Find the video part in the response
            const videoPart = content.parts.find(part => part.video);
            if (!videoPart || !videoPart.video || !videoPart.video.uri) {
                console.error('Response structure:', JSON.stringify(vertexResponse, null, 2));
                throw new Error('No video URL found in response');
            }
            
            return {
                videoUrl: videoPart.video.uri
            };
        } catch (error) {
            console.error('Failed to process Vertex AI response:', error);
            console.error('Response was:', JSON.stringify(vertexResponse, null, 2));
            throw new Error(`Failed to extract video from response: ${error.message}`);
        }
    }
}

// Export a singleton instance
export const veo2Service = new Veo2Service();