/**
 * Settings page functionality for Bun Everywhere Chrome Extension
 * Handles all settings management, provider toggles, and excluded sites
 */

'use strict';

// DOM elements
let globalToggle, autoCopyToggle, indicatorToggle, badgeToggle;
let siteInput, addSiteButton, excludedSitesList;
let resetButton, resetModal, cancelReset, confirmReset;
let providerToggles = {};

// Current settings state
let currentSettings = {
  globalEnabled: true,
  excludedSites: [],
  providers: {
    npm: true,
    yarn: true,
    pnpm: true,
    npx: true,
    'yarn dlx': true,
    'pnpm dlx': true,
  },
  showIndicator: true,
  showCountBadge: true,
  autoCopyOnLoad: true,
};

// Default settings for reset
const DEFAULT_SETTINGS = {
  globalEnabled: true,
  excludedSites: [],
  providers: {
    npm: true,
    yarn: true,
    pnpm: true,
    npx: true,
    'yarn dlx': true,
    'pnpm dlx': true,
  },
  showIndicator: true,
  showCountBadge: true,
  autoCopyOnLoad: true,
};

/**
 * Initialize DOM elements
 */
function initializeElements() {
  // General settings
  globalToggle = document.getElementById('globalToggle');
  autoCopyToggle = document.getElementById('autoCopyToggle');
  indicatorToggle = document.getElementById('indicatorToggle');
  badgeToggle = document.getElementById('badgeToggle');

  // Excluded sites
  siteInput = document.getElementById('siteInput');
  addSiteButton = document.getElementById('addSiteButton');
  excludedSitesList = document.getElementById('excludedSitesList');

  // Provider toggles
  document.querySelectorAll('.provider-toggle').forEach(toggle => {
    const provider = toggle.dataset.provider;
    providerToggles[provider] = toggle;
  });

  // Reset modal
  resetButton = document.getElementById('resetButton');
  resetModal = document.getElementById('resetModal');
  cancelReset = document.getElementById('cancelReset');
  confirmReset = document.getElementById('confirmReset');

  // Version displays
  const version = chrome.runtime.getManifest().version;
  const versionElement = document.getElementById('version');
  const aboutVersionElement = document.getElementById('aboutVersion');
  if (versionElement) versionElement.textContent = version;
  if (aboutVersionElement) aboutVersionElement.textContent = version;

  // Verify critical elements exist
  if (!globalToggle || !autoCopyToggle || !indicatorToggle || !badgeToggle) {
    console.error('Bun Everywhere: Some toggle elements not found');
    return false;
  }
  return true;
}

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'globalEnabled',
      'excludedSites',
      'providers',
      'showIndicator',
      'showCountBadge',
      'autoCopyOnLoad'
    ]);

    currentSettings = {
      globalEnabled: result.globalEnabled !== false,
      excludedSites: result.excludedSites || [],
      providers: {
        npm: result.providers?.npm !== false,
        yarn: result.providers?.yarn !== false,
        pnpm: result.providers?.pnpm !== false,
        npx: result.providers?.npx !== false,
        'yarn dlx': result.providers?.['yarn dlx'] !== false,
        'pnpm dlx': result.providers?.['pnpm dlx'] !== false,
      },
      showIndicator: result.showIndicator !== false,
      showCountBadge: result.showCountBadge !== false,
      autoCopyOnLoad: result.autoCopyOnLoad !== false,
    };
  } catch (error) {
    console.error('Bun Everywhere: Failed to load settings:', error);
    // Use defaults on error
    currentSettings = { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings to Chrome storage
 */
async function saveSettings() {
  try {
    await chrome.storage.sync.set(currentSettings);
  } catch (error) {
    console.error('Bun Everywhere: Failed to save settings:', error);
  }
}

/**
 * Update UI to reflect current settings
 */
function updateUI() {
  // Update general toggles
  if (globalToggle) globalToggle.checked = currentSettings.globalEnabled;
  if (autoCopyToggle) autoCopyToggle.checked = currentSettings.autoCopyOnLoad;
  if (indicatorToggle) indicatorToggle.checked = currentSettings.showIndicator;
  if (badgeToggle) badgeToggle.checked = currentSettings.showCountBadge;

  // Update provider toggles
  for (const [provider, enabled] of Object.entries(currentSettings.providers)) {
    if (providerToggles[provider]) {
      providerToggles[provider].checked = enabled;
    }
  }

  // Update excluded sites list
  updateExcludedSitesList();
}

/**
 * Update the excluded sites list UI
 */
function updateExcludedSitesList() {
  if (currentSettings.excludedSites.length === 0) {
    excludedSitesList.innerHTML = '<div class="empty-state">No sites excluded yet.</div>';
    return;
  }

  const sitesHTML = currentSettings.excludedSites.map(hostname => `
    <div class="excluded-site-item">
      <img class="excluded-site-icon" 
           src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=16" 
           alt="" 
           onerror="this.style.display='none'">
      <span class="excluded-site-hostname">${hostname}</span>
      <button class="remove-button" data-hostname="${hostname}">✕</button>
    </div>
  `).join('');

  excludedSitesList.innerHTML = sitesHTML;

  // Add event listeners to remove buttons
  excludedSitesList.querySelectorAll('.remove-button').forEach(button => {
    button.addEventListener('click', () => {
      const hostname = button.dataset.hostname;
      removeExcludedSite(hostname);
    });
  });
}

/**
 * Validate hostname format
 * @param {string} hostname - Hostname to validate
 * @returns {boolean} True if valid hostname
 */
function isValidHostname(hostname) {
  if (!hostname || hostname.length === 0) return false;
  
  // Remove protocol and www if present
  hostname = hostname.replace(/^https?:\/\//, '').replace(/^www\./, '');
  
  // Basic hostname validation
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname) && hostname.length <= 253;
}

/**
 * Add a site to excluded sites list
 */
async function addExcludedSite() {
  const hostname = siteInput.value.trim();
  
  if (!hostname) {
    siteInput.focus();
    return;
  }

  if (!isValidHostname(hostname)) {
    showMessage('Please enter a valid hostname (e.g., example.com)');
    siteInput.focus();
    return;
  }

  // Clean hostname
  const cleanHostname = hostname.replace(/^https?:\/\//, '').replace(/^www\./, '');

  if (currentSettings.excludedSites.includes(cleanHostname)) {
    showMessage('This site is already excluded');
    return;
  }

  try {
    currentSettings.excludedSites.push(cleanHostname);
    await saveSettings();
    updateExcludedSitesList();
    siteInput.value = '';
    siteInput.focus();
  } catch (error) {
    console.error('Bun Everywhere: Failed to add excluded site:', error);
    showMessage('Failed to add site');
  }
}

/**
 * Remove a site from excluded sites list
 * @param {string} hostname - Hostname to remove
 */
async function removeExcludedSite(hostname) {
  try {
    currentSettings.excludedSites = currentSettings.excludedSites.filter(site => site !== hostname);
    await saveSettings();
    updateExcludedSitesList();
  } catch (error) {
    console.error('Bun Everywhere: Failed to remove excluded site:', error);
    showMessage('Failed to remove site');
  }
}

/**
 * Show a temporary message (could be enhanced with a toast notification)
 * @param {string} message - Message to show
 */
function showMessage(message) {
  // Simple implementation - could be enhanced with a toast
  console.log('Bun Everywhere:', message);
}

/**
 * Handle toggle changes for general settings
 */
async function handleGeneralToggle(settingName, checked) {
  currentSettings[settingName] = checked;
  await saveSettings();
}

/**
 * Handle provider toggle changes
 * @param {string} provider - Provider name
 * @param {boolean} enabled - Whether provider is enabled
 */
async function handleProviderToggle(provider, enabled) {
  currentSettings.providers[provider] = enabled;
  await saveSettings();
}

/**
 * Show reset confirmation modal
 */
function showResetModal() {
  resetModal.classList.add('active');
}

/**
 * Hide reset confirmation modal
 */
function hideResetModal() {
  resetModal.classList.remove('active');
}

/**
 * Reset all settings to defaults
 */
async function resetToDefaults() {
  try {
    currentSettings = { ...DEFAULT_SETTINGS };
    await saveSettings();
    updateUI();
    hideResetModal();
    showMessage('Settings reset to defaults');
  } catch (error) {
    console.error('Bun Everywhere: Failed to reset settings:', error);
    showMessage('Failed to reset settings');
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // General settings toggles
  if (globalToggle) {
    globalToggle.addEventListener('change', (e) => {
      handleGeneralToggle('globalEnabled', e.target.checked);
    });
  }

  if (autoCopyToggle) {
    autoCopyToggle.addEventListener('change', (e) => {
      handleGeneralToggle('autoCopyOnLoad', e.target.checked);
    });
  }

  if (indicatorToggle) {
    indicatorToggle.addEventListener('change', (e) => {
      handleGeneralToggle('showIndicator', e.target.checked);
    });
  }

  if (badgeToggle) {
    badgeToggle.addEventListener('change', (e) => {
      handleGeneralToggle('showCountBadge', e.target.checked);
    });
  }

  // Provider toggles
  for (const [provider, toggle] of Object.entries(providerToggles)) {
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        handleProviderToggle(provider, e.target.checked);
      });
    }
  }

  // Excluded sites
  if (addSiteButton) {
    addSiteButton.addEventListener('click', addExcludedSite);
  }
  if (siteInput) {
    siteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addExcludedSite();
      }
    });
  }

  // Reset modal
  if (resetButton) {
    resetButton.addEventListener('click', showResetModal);
  }
  if (cancelReset) {
    cancelReset.addEventListener('click', hideResetModal);
  }
  if (confirmReset) {
    confirmReset.addEventListener('click', resetToDefaults);
  }

  // Close modal on overlay click
  if (resetModal) {
    resetModal.addEventListener('click', (e) => {
      if (e.target === resetModal) {
        hideResetModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resetModal && resetModal.classList.contains('active')) {
      hideResetModal();
    }
  });
}

/**
 * Initialize the settings page
 */
async function initialize() {
  try {
    // Show loading state
    document.body.classList.add('loading');

    // Initialize elements
    const elementsLoaded = initializeElements();
    if (!elementsLoaded) {
      console.error('Bun Everywhere: Failed to initialize elements');
      document.body.classList.remove('loading');
      return;
    }

    // Load settings
    await loadSettings();

    // Update UI
    updateUI();

    // Set up event listeners
    setupEventListeners();

    // Remove loading state
    document.body.classList.remove('loading');

    // Focus on first input
    if (siteInput) {
      siteInput.focus();
    }
  } catch (error) {
    console.error('Bun Everywhere: Failed to initialize settings:', error);
    document.body.classList.remove('loading');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
