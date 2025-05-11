/**
 * React Video Editor Integration
 *
 * This module provides the integration between the Gemini platform and the React Video Editor.
 * It handles the communication between the two systems and manages the video editing workflow.
 */
import settingsManager from '../settings/settings-manager.js';

export class ReactVideoEditorIntegration {
  /**
   * Create a new React Video Editor integration
   * @param {Object} config - Configuration options (optional, will use settings from settings manager if not provided)
   */
  constructor(config = {}) {
    // Get editor URL from settings if available, otherwise use the provided config or default
    const settings = settingsManager.getSettings();
    this.editorUrl = config.editorUrl ||
                    (settings.reactVideoEditor && settings.reactVideoEditor.editorUrl) ||
                    'http://localhost:5173';
    
    this.isInitialized = false;
    this.eventListeners = {};
    
    console.log('[ReactVideoEditorIntegration] Created with editorUrl:', this.editorUrl);
  }
  
  /**
   * Initialize the integration
   * @returns {Promise<boolean>} - True if initialization is successful
   */
  async initialize() {
    try {
      console.log('[ReactVideoEditorIntegration] Initializing...');
      
      // Update editorUrl from settings (in case it was changed)
      const settings = settingsManager.getSettings();
      if (settings.reactVideoEditor && settings.reactVideoEditor.editorUrl) {
        this.editorUrl = settings.reactVideoEditor.editorUrl;
        console.log('[ReactVideoEditorIntegration] Updated editorUrl from settings:', this.editorUrl);
      }
      
      // Verify the editor is available by making a ping request
      // In a real implementation, this might check the editor's status or API
      this.isInitialized = true;
      this.emitEvent('initialized', { success: true });
      
      console.log('[ReactVideoEditorIntegration] Initialization complete');
      return true;
    } catch (error) {
      console.error('[ReactVideoEditorIntegration] Initialization error:', error);
      this.emitEvent('error', {
        source: 'initialization',
        error,
        message: 'Failed to initialize React Video Editor integration'
      });
      return false;
    }
  }
  
  /**
   * Get the URL for the React Video Editor
   * @param {Object} options - Editor options
   * @param {string} options.projectId - Existing project ID to open (optional)
   * @returns {string} - The URL for the editor
   */
  getEditorUrl(options = {}) {
    let url = this.editorUrl;
    
    // Add any parameters if needed
    if (options.projectId) {
      url += `?projectId=${encodeURIComponent(options.projectId)}`;
    }
    
    console.log('[ReactVideoEditorIntegration] Editor URL:', url);
    return url;
  }
  
  /**
   * Open the React Video Editor in a new window/tab (legacy method)
   * @param {Object} options - Editor options
   * @param {string} options.projectId - Existing project ID to open (optional)
   * @returns {Window} - The window object for the editor
   * @deprecated Use the embedded iframe approach instead
   */
  openEditor(options = {}) {
    const url = this.getEditorUrl(options);
    
    console.log('[ReactVideoEditorIntegration] Opening editor in new window (deprecated):', url);
    
    // Open in a new tab/window
    const editorWindow = window.open(url, '_blank');
    this.emitEvent('editor_opened', { url });
    
    return editorWindow;
  }
  
  /**
   * Create a new video project with the specified media assets
   * @param {Object} project - Project details
   * @param {string} project.title - Project title
   * @param {Array<Object>} project.assets - Media assets to include
   * @returns {Promise<Object>} - Created project details
   */
  async createProject(project) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log('[ReactVideoEditorIntegration] Creating new project:', project.title);
    
    // In a real implementation, this would communicate with the editor's API
    // to create a new project with the provided assets
    
    const projectId = 'project_' + Date.now();
    
    this.emitEvent('project_created', {
      projectId,
      title: project.title,
      assetCount: (project.assets || []).length
    });
    
    return {
      projectId,
      title: project.title,
      url: `${this.editorUrl}?projectId=${projectId}`
    };
  }
  
  /**
   * Get a list of recent projects
   * @returns {Promise<Array<Object>>} - Recent projects
   */
  async getRecentProjects() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // In a real implementation, this would fetch from the editor's API
    return [];
  }
  
  /**
   * Event system
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event]
      .filter(cb => cb !== callback);
  }
  
  emitEvent(event, data) {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[ReactVideoEditorIntegration] Error in event listener for '${event}':`, error);
      }
    });
  }
}

// Create a default instance
const videoEditorIntegration = new ReactVideoEditorIntegration();
export default videoEditorIntegration;
