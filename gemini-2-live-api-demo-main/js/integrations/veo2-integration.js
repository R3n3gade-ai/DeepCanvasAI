/**
 * Veo2 Integration for Second-Me
 * Registers Veo2 video generation as a tool for Second-Me
 */
import { MCPClient } from '../mcp/mcp-client.js';
import { veo2Service } from '../video/veo2-service.js';

/**
 * Register Veo2 video generation tools with the MCP client
 * @param {MCPClient} mcpClient - MCP client instance
 * @returns {Promise<void>}
 */
export async function registerVeo2Tools(mcpClient) {
  console.log('[Veo2Integration] Registering Veo2 tools with Second-Me');
  
  // Register video generation tool
  await mcpClient.registerTool(
    'generate_video',
    'Generate a video using Veo 2 API',
    async (args) => {
      const { prompt, duration, aspectRatio, imageBase64, enhancePrompt } = args;
      
      console.log('[Veo2Integration] Tool called: generate_video');
      console.log(`[Veo2Integration] Prompt: ${prompt}`);
      console.log(`[Veo2Integration] Duration: ${duration}s, Aspect Ratio: ${aspectRatio}`);
      
      // Validate required parameters
      if (!prompt) {
        throw new Error('A prompt is required to generate a video');
      }
      
      // Set defaults for optional parameters
      const videoOptions = {
        prompt,
        duration: duration || 3,
        aspectRatio: aspectRatio || '16:9',
        imageBase64,
        enhancePrompt: enhancePrompt ?? false
      };
      
      try {
        // Call existing Veo 2 service
        const result = await veo2Service.generateVideo(videoOptions);
        
        console.log('[Veo2Integration] Video generated successfully:', result.video.url);
        
        // Return structured result
        return {
          videoUrl: result.video.url,
          prompt: result.video.prompt,
          aspectRatio: result.video.aspectRatio,
          duration: result.video.duration
        };
      } catch (error) {
        console.error('[Veo2Integration] Error generating video:', error);
        throw error;
      }
    },
    // Tool schema definition (for Second-Me to understand the parameters)
    {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Text description of the desired video content'
        },
        duration: {
          type: 'number',
          description: 'Video duration in seconds (default: 3)'
        },
        aspectRatio: {
          type: 'string',
          description: 'Video aspect ratio like "16:9", "9:16", "1:1" (default: "16:9")'
        },
        imageBase64: {
          type: 'string',
          description: 'Optional base64-encoded image to condition the video generation'
        },
        enhancePrompt: {
          type: 'boolean',
          description: 'Whether to enhance the prompt with AI (default: false)'
        }
      },
      required: ['prompt']
    }
  );

  // Register video style transfer tool
  await mcpClient.registerTool(
    'apply_video_style',
    'Apply a style to an existing video using Veo 2',
    async (args) => {
      const { videoUrl, stylePrompt } = args;
      
      console.log('[Veo2Integration] Tool called: apply_video_style');
      console.log(`[Veo2Integration] Video URL: ${videoUrl}`);
      console.log(`[Veo2Integration] Style Prompt: ${stylePrompt}`);
      
      // This is a placeholder for future implementation
      // In a real implementation, this would call a Veo2 style transfer endpoint
      
      throw new Error('Video style transfer is not yet implemented');
    },
    {
      type: 'object',
      properties: {
        videoUrl: {
          type: 'string',
          description: 'URL of the source video to apply style to'
        },
        stylePrompt: {
          type: 'string',
          description: 'Text description of the style to apply'
        }
      },
      required: ['videoUrl', 'stylePrompt']
    }
  );
  
  console.log('[Veo2Integration] Veo2 tools registered successfully');
}

/**
 * Handle video generation results for memory storage
 * @param {Object} videoResult - Video generation result
 * @param {SecondMeMemory} memory - Second-Me memory instance
 * @returns {Promise<void>}
 */
export async function storeVideoGenerationInMemory(videoResult, memory) {
  if (!memory) {
    console.warn('[Veo2Integration] No memory instance provided for storage');
    return;
  }
  
  try {
    await memory.storeMemory('activity', {
      type: 'video_generation',
      timestamp: new Date().toISOString(),
      data: {
        videoUrl: videoResult.videoUrl,
        prompt: videoResult.prompt,
        aspectRatio: videoResult.aspectRatio,
        duration: videoResult.duration
      }
    });
    
    console.log('[Veo2Integration] Video generation stored in memory');
  } catch (error) {
    console.error('[Veo2Integration] Failed to store video in memory:', error);
  }
}