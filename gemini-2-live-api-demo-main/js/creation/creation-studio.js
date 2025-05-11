/**
 * Creation Studio functionality
 * Handles video generation, image generation, and video editing features
 */
import { veo2Service } from '../video/veo2-service.js';
import videoEditorIntegration from '../integrations/react-video-editor-integration.js';

// DOM Elements - will be initialized in initCreationStudio
let videoGenOption;
let imageGenOption;
let videoEditOption;
let videoGenInterface;

// Video Generation Elements - will be initialized in initCreationStudio
let uploadImageBtn;
let imageUpload;
let imagePreview;
let generateVideoBtn;
let cancelVideoGenBtn;
let videoResult;
let videoPlayer;
let downloadVideoBtn;

// Track the last generated video data
let lastGeneratedVideo = null;

/**
 * Initialize Creation Studio functionality
 */
export function initCreationStudio() {
    console.log('Initializing Creation Studio...');
    
    // Initialize DOM Elements
    videoGenOption = document.getElementById('videoGenOption');
    imageGenOption = document.getElementById('imageGenOption');
    videoEditOption = document.getElementById('videoEditOption');
    videoGenInterface = document.getElementById('videoGenInterface');
    
    // Initialize Video Generation Elements
    uploadImageBtn = document.getElementById('uploadImageBtn');
    imageUpload = document.getElementById('imageUpload');
    imagePreview = document.getElementById('imagePreview');
    generateVideoBtn = document.getElementById('generateVideoBtn');
    cancelVideoGenBtn = document.getElementById('cancelVideoGenBtn');
    videoResult = document.getElementById('videoResult');
    videoPlayer = document.getElementById('videoPlayer');
    downloadVideoBtn = document.getElementById('downloadVideoBtn');
    
    console.log('Video Generation Option:', videoGenOption);
    console.log('Video Generation Interface:', videoGenInterface);
    
    // Add event listeners for creation options
    if (videoGenOption) {
        videoGenOption.addEventListener('click', () => {
            console.log('Video Generation Option clicked');
            showInterface('videoGenInterface');
        });
    }
    
    if (imageGenOption) {
        imageGenOption.addEventListener('click', () => {
            // To be implemented
            alert('Image Generation feature coming soon!');
        });
    }
    
    if (videoEditOption) {
        videoEditOption.addEventListener('click', () => {
            console.log('Video Editor Option clicked');
            
            // Initialize the React Video Editor integration if needed
            if (!videoEditorIntegration.isInitialized) {
                videoEditorIntegration.initialize()
                    .then(success => {
                        if (success) {
                            openVideoEditor();
                        } else {
                            console.error('Failed to initialize Video Editor integration');
                            alert('Could not connect to the Video Editor. Please check if it is running.');
                        }
                    })
                    .catch(error => {
                        console.error('Error initializing Video Editor:', error);
                        alert('Error connecting to the Video Editor: ' + error.message);
                    });
            } else {
                openVideoEditor();
            }
        });
    }
    
    // Video Generation Interface event listeners
    if (uploadImageBtn && imageUpload) {
        uploadImageBtn.addEventListener('click', () => {
            imageUpload.click();
        });
        
        imageUpload.addEventListener('change', handleImageUpload);
    }
    
    if (cancelVideoGenBtn) {
        cancelVideoGenBtn.addEventListener('click', () => {
            hideInterface('videoGenInterface');
        });
    }
    
    if (generateVideoBtn) {
        generateVideoBtn.addEventListener('click', handleVideoGeneration);
    }
    
    if (downloadVideoBtn) {
        downloadVideoBtn.addEventListener('click', handleVideoDownload);
    }
}

/**
 * Show a specific interface and hide others
 * @param {string} interfaceId - The ID of the interface to show
 */
function showInterface(interfaceId) {
    console.log(`Showing interface: ${interfaceId}`);
    
    // Make sure the Creation Studio section is active
    const creationStudioSection = document.getElementById('creationStudioSection');
    if (creationStudioSection && !creationStudioSection.classList.contains('active')) {
        console.log('Activating Creation Studio section');
        creationStudioSection.classList.add('active');
    }
    
    // Hide all interfaces
    const interfaces = document.querySelectorAll('.creation-interface');
    console.log(`Found ${interfaces.length} interfaces to hide`);
    interfaces.forEach(interfaceElement => {
        console.log(`Hiding interface: ${interfaceElement.id}`);
        interfaceElement.style.display = 'none';
    });
    
    // Show the selected interface
    const selectedInterface = document.getElementById(interfaceId);
    console.log(`Selected interface found: ${selectedInterface !== null}`);
    if (selectedInterface) {
        console.log(`Setting display to block for ${interfaceId}`);
        selectedInterface.style.display = 'block';
        
        // Make sure the action row is visible
        const actionRow = selectedInterface.querySelector('.action-row');
        if (actionRow) {
            console.log('Making action row visible');
            actionRow.style.display = 'flex';
        }
        
        // Scroll to the interface to make sure it's visible
        selectedInterface.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error(`Interface with ID ${interfaceId} not found`);
    }
}

/**
 * Hide a specific interface
 * @param {string} interfaceId - The ID of the interface to hide
 */
function hideInterface(interfaceId) {
    const interfaceElement = document.getElementById(interfaceId);
    if (interfaceElement) {
        interfaceElement.style.display = 'none';
    }
}

/**
 * Handle image upload for video generation
 * @param {Event} event - The change event from the file input
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
}

/**
 * Handle video generation
 * This is a mock implementation since we don't have access to the actual Veo 2 API
 */
async function handleVideoGeneration() {
    console.log('🔍 Starting video generation process');
    const videoPrompt = document.getElementById('videoPrompt').value.trim();
    
    // Get settings values if they exist, otherwise use defaults
    const aspectRatio = document.getElementById('aspectRatio')?.value || '16:9';
    const videoDuration = parseInt(document.getElementById('videoDuration')?.value || '5');
    const enhancePrompt = document.getElementById('enhancePrompt')?.checked || true;
    
    // Log the settings being used
    console.log('🎬 Video Generation Settings:', {
        prompt: videoPrompt,
        aspectRatio: aspectRatio,
        duration: videoDuration,
        enhancePrompt: enhancePrompt,
        uploadedImage: !!imagePreview.querySelector('img')
    });
    
    // Validate input
    if (!videoPrompt) {
        alert('Please enter a description for your video');
        console.error('❌ Video generation canceled: No prompt provided');
        return;
    }
    
    // Show loading state
    generateVideoBtn.disabled = true;
    generateVideoBtn.textContent = 'Generating...';
    
    try {
        // Get image data if available
        let imageBase64 = null;
        const uploadedImage = imagePreview.querySelector('img');
        if (uploadedImage) {
            // Extract the base64 data from the src attribute
            const src = uploadedImage.src;
            if (src.startsWith('data:image')) {
                imageBase64 = src.split(',')[1]; // Remove the data:image/jpeg;base64, part
                console.log('📸 Image data extracted for upload');
            }
        }
        
        // Prepare generation options
        const options = {
            prompt: videoPrompt,
            aspectRatio: aspectRatio,
            duration: videoDuration,
            enhancePrompt: enhancePrompt,
            imageBase64: imageBase64
        };
        
        // Require a Veo 2 API key - no fallback to mock implementation
        if (!veo2Service.hasApiKey()) {
            console.error('❌ No Veo 2 API key configured');
            alert('Veo 2 API key is required. Please configure it in the settings panel.');
            return;
        }

        console.log('🔑 API key found, using Veo 2 API');
        const result = await veo2Service.generateVideo(options);
        
        // Store the video result for download
        lastGeneratedVideo = result;
        
        // Show result
        videoResult.style.display = 'block';
        console.log('🎥 Displaying video result');
        
        // Show actual video player with the generated video
        const videoUrl = result.video?.url;
        if (videoUrl) {
            videoPlayer.innerHTML = `
                <video controls style="width: 100%; max-height: 400px;">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            // Handle case where video URL is not provided
            videoPlayer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                    <p><strong>⚠️ Video processing error</strong></p>
                    <p>The video was processed, but no URL was returned. This may be due to an API limitation or error.</p>
                </div>
            `;
        }
        
        // Scroll to the result
        videoResult.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Error generating video:', error);
        alert(`Error generating video: ${error.message}`);
    } finally {
        // Reset button state
        generateVideoBtn.disabled = false;
        generateVideoBtn.textContent = 'Generate Video';
    }
}

/**
 * Handle video download
 * This is a mock implementation
 */
function handleVideoDownload() {
    console.log('🔽 Video download requested');
    
    if (!lastGeneratedVideo) {
        console.log('❌ No video available to download');
        alert('No video available to download. Please generate a video first.');
        return;
    }
    
    const videoUrl = lastGeneratedVideo.video?.url;
    if (!videoUrl) {
        console.log('❌ No video URL available');
        alert('No video URL available for download.');
        return;
    }
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `veo2-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Video download initiated');
}

/**
 * Open the React Video Editor in a new tab/window
 */
function openVideoEditor(projectId = null) {
    console.log('Opening React Video Editor...');
    
    const options = {};
    if (projectId) {
        options.projectId = projectId;
    }
    
    const editorWindow = videoEditorIntegration.openEditor(options);
    
    // You can listen for messages from the editor window if needed
    window.addEventListener('message', (event) => {
        // Check origin for security
        if (event.origin !== videoEditorIntegration.editorUrl) return;
        
        // Handle messages from the editor
        console.log('Received message from Video Editor:', event.data);
        
        // Example: If editor sends a completed video
        if (event.data.type === 'video_completed') {
            alert('Video editing completed! You can now download your video.');
            // Additional processing as needed
        }
    });
    
    return editorWindow;
}

/**
 * Create a new video project with the specified media
 * @param {Object} options - Project options
 * @param {string} options.title - Project title
 * @param {Array} options.assets - Media assets for the project
 * @returns {Promise<Object>} - Created project details
 */
async function createVideoProject(options) {
    console.log('Creating new video project:', options);
    
    try {
        const project = await videoEditorIntegration.createProject({
            title: options.title || 'Untitled Project',
            assets: options.assets || []
        });
        
        console.log('Project created:', project);
        return project;
    } catch (error) {
        console.error('Error creating video project:', error);
        throw error;
    }
}
