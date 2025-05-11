/**
 * Brain Manager for Second-Me Integration
 * This module handles the UI and logic for saving and activating Second-Me brains
 */
import elements from '../dom/elements.js';
import { SecondMeAdapter } from './second-me-adapter.js';
import settingsManager from '../settings/settings-manager.js';

class BrainManager {
  constructor() {
    this.brains = {
      slot1: null,
      slot2: null
    };
    this.activeSlot = null;
    this.adapter = null;
    this.isInitialized = false;
  }

  /**
   * Initialize brain manager and UI elements
   */
  async initialize() {
    if (this.isInitialized) return;
    
    // Load settings
    const settings = settingsManager.getSettings();
    if (settings.secondMe?.apiUrl) {
      this.adapter = new SecondMeAdapter({
        apiEndpoint: settings.secondMe.apiUrl,
        autoAuthenticate: true
      });
    }
    
    // Load saved brains from local storage
    this.loadSavedBrains();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Mark as initialized
    this.isInitialized = true;
    console.log('[BrainManager] Initialized');
  }
  
  /**
   * Set up event listeners for brain slots
   */
  setupEventListeners() {
    // Brain slot 1 click handler
    elements.brainSlot1.addEventListener('click', () => {
      if (this.brains.slot1) {
        this.activateBrain('slot1');
      } else {
        this.saveBrainToSlot('slot1');
      }
    });
    
    // Brain slot 2 click handler
    elements.brainSlot2.addEventListener('click', () => {
      if (this.brains.slot2) {
        this.activateBrain('slot2');
      } else {
        this.saveBrainToSlot('slot2');
      }
    });
    
    // Right-click to clear brain
    elements.brainSlot1.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.brains.slot1) {
        this.clearBrainSlot('slot1');
      }
    });
    
    elements.brainSlot2.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.brains.slot2) {
        this.clearBrainSlot('slot2');
      }
    });
    
    // Model training button connects to Second-Me
    const modelTrainingBtn = document.querySelector('.model-training-btn');
    if (modelTrainingBtn) {
      modelTrainingBtn.addEventListener('click', () => {
        // Open Second-Me in a new window
        const settings = settingsManager.getSettings();
        const secondMeUrl = settings.secondMe && settings.secondMe.appUrl
          ? settings.secondMe.appUrl
          : 'https://second-me.ai';
        
        console.log('[BrainManager] Opening Second-Me URL:', secondMeUrl);
        window.open(secondMeUrl, '_blank');
      });
    } else {
      console.warn('[BrainManager] Model training button not found in DOM');
    }
  }
  
  /**
   * Load saved brains from local storage
   */
  loadSavedBrains() {
    try {
      const savedBrains = localStorage.getItem('secondMe_savedBrains');
      if (savedBrains) {
        const brainData = JSON.parse(savedBrains);
        this.brains = brainData.brains || { slot1: null, slot2: null };
        this.activeSlot = brainData.activeSlot;
        
        // Update UI to reflect loaded data
        this.updateBrainSlotUI('slot1');
        this.updateBrainSlotUI('slot2');
        
        // Activate the previously active brain if any
        if (this.activeSlot && this.brains[this.activeSlot]) {
          this.activateBrain(this.activeSlot, false);
        }
      }
    } catch (error) {
      console.error('[BrainManager] Error loading saved brains:', error);
    }
  }
  
  /**
   * Save brain data to local storage
   */
  saveBrainsToStorage() {
    try {
      const brainData = {
        brains: this.brains,
        activeSlot: this.activeSlot
      };
      localStorage.setItem('secondMe_savedBrains', JSON.stringify(brainData));
    } catch (error) {
      console.error('[BrainManager] Error saving brains to storage:', error);
    }
  }
  
  /**
   * Save current Second-Me brain to a slot
   * @param {string} slotId - 'slot1' or 'slot2'
   */
  async saveBrainToSlot(slotId) {
    if (!this.adapter) {
      console.warn('[BrainManager] Cannot save brain: Second-Me adapter not initialized');
      alert('Please ensure Second-Me API URL is configured correctly');
      return;
    }
    
    try {
      // Get current active brain from Second-Me
      const activeBrain = await this.adapter.retrieveMemories({ type: 'active_brain' });
      
      if (!activeBrain || !activeBrain.id) {
        alert('No active brain found. Please create a brain in Second-Me first.');
        return;
      }
      
      // Save to specified slot
      this.brains[slotId] = {
        id: activeBrain.id,
        name: activeBrain.name || `Brain ${slotId === 'slot1' ? '1' : '2'}`,
        icon: activeBrain.icon || '🧠',
        timestamp: new Date().toISOString()
      };
      
      // Update UI
      this.updateBrainSlotUI(slotId);
      
      // Save to storage
      this.saveBrainsToStorage();
      
      // Activate the newly saved brain
      this.activateBrain(slotId);
      
      console.log(`[BrainManager] Brain saved to ${slotId}:`, this.brains[slotId]);
    } catch (error) {
      console.error(`[BrainManager] Error saving brain to ${slotId}:`, error);
      alert(`Failed to save brain to slot: ${error.message}`);
    }
  }
  
  /**
   * Clear a brain slot
   * @param {string} slotId - 'slot1' or 'slot2'
   */
  clearBrainSlot(slotId) {
    // If this is the active slot, deactivate it first
    if (this.activeSlot === slotId) {
      this.deactivateCurrentBrain();
    }
    
    // Clear the slot
    this.brains[slotId] = null;
    
    // Update UI
    this.updateBrainSlotUI(slotId);
    
    // Save to storage
    this.saveBrainsToStorage();
    
    console.log(`[BrainManager] Cleared brain slot ${slotId}`);
  }
  
  /**
   * Activate a brain from a slot
   * @param {string} slotId - 'slot1' or 'slot2'
   * @param {boolean} notifyAdapter - Whether to notify the adapter
   */
  async activateBrain(slotId, notifyAdapter = true) {
    // Deactivate current brain if any
    if (this.activeSlot) {
      // Remove active class from current slot
      const currentSlotElement = slotId === 'slot1' ? elements.brainSlot1 : elements.brainSlot2;
      currentSlotElement.classList.remove('active');
    }
    
    // Set new active slot
    this.activeSlot = slotId;
    
    // Update UI
    const slotElement = slotId === 'slot1' ? elements.brainSlot1 : elements.brainSlot2;
    slotElement.classList.add('active');
    
    // Notify adapter if needed
    if (notifyAdapter && this.adapter) {
      try {
        const brain = this.brains[slotId];
        await this.adapter.sendMessage({
          type: 'brain_activation',
          brainId: brain.id,
          metadata: { source: 'veo-platform' }
        });
        console.log(`[BrainManager] Activated brain in ${slotId}:`, brain.name);
      } catch (error) {
        console.error(`[BrainManager] Error activating brain from ${slotId}:`, error);
      }
    }
    
    // Save to storage
    this.saveBrainsToStorage();
  }
  
  /**
   * Deactivate current brain if any
   */
  deactivateCurrentBrain() {
    if (!this.activeSlot) return;
    
    // Remove active class
    const slotElement = this.activeSlot === 'slot1' ? elements.brainSlot1 : elements.brainSlot2;
    slotElement.classList.remove('active');
    
    // Set active slot to null
    this.activeSlot = null;
    
    // Notify adapter if available
    if (this.adapter) {
      try {
        this.adapter.sendMessage({
          type: 'brain_deactivation',
          metadata: { source: 'veo-platform' }
        });
      } catch (error) {
        console.error('[BrainManager] Error deactivating brain:', error);
      }
    }
    
    // Save to storage
    this.saveBrainsToStorage();
    
    console.log('[BrainManager] Brain deactivated');
  }
  
  /**
   * Update the UI for a brain slot
   * @param {string} slotId - 'slot1' or 'slot2'
   */
  updateBrainSlotUI(slotId) {
    const slotElement = slotId === 'slot1' ? elements.brainSlot1 : elements.brainSlot2;
    const brain = this.brains[slotId];
    
    if (brain) {
      // Brain exists in this slot
      slotElement.classList.remove('empty');
      
      // Update icon if available
      const iconElement = slotElement.querySelector('.brain-icon');
      if (iconElement) {
        iconElement.textContent = brain.icon || '🧠';
      }
      
      // Update label
      const labelElement = slotElement.querySelector('.brain-label');
      if (labelElement) {
        labelElement.textContent = brain.name || `Brain ${slotId === 'slot1' ? '1' : '2'}`;
      }
      
      // Create or update tooltip
      let tooltipElement = slotElement.querySelector('.tooltip');
      if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip';
        slotElement.appendChild(tooltipElement);
      }
      
      const date = brain.timestamp ? new Date(brain.timestamp).toLocaleString() : 'Unknown date';
      tooltipElement.textContent = `${brain.name} (Saved: ${date})`;
      
      // Add active class if this is the active slot
      if (this.activeSlot === slotId) {
        slotElement.classList.add('active');
      } else {
        slotElement.classList.remove('active');
      }
    } else {
      // Empty slot
      slotElement.classList.add('empty');
      slotElement.classList.remove('active');
      
      // Reset icon
      const iconElement = slotElement.querySelector('.brain-icon');
      if (iconElement) {
        iconElement.textContent = '🧠';
      }
      
      // Reset label
      const labelElement = slotElement.querySelector('.brain-label');
      if (labelElement) {
        labelElement.textContent = `Brain ${slotId === 'slot1' ? '1' : '2'}`;
      }
      
      // Remove tooltip if exists
      const tooltipElement = slotElement.querySelector('.tooltip');
      if (tooltipElement) {
        slotElement.removeChild(tooltipElement);
      }
    }
  }
  
  /**
   * Get the currently active brain
   * @returns {Object|null} Active brain or null if none active
   */
  getActiveBrain() {
    if (!this.activeSlot) return null;
    return this.brains[this.activeSlot];
  }
}

// Create and export singleton instance
const brainManager = new BrainManager();
export default brainManager;