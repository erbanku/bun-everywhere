/**
 * Background service worker for Bun Everywhere Chrome Extension
 * Handles extension lifecycle, settings management, and icon state
 */

'use strict';

// Default settings for the extension
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
};

// In-memory storage for replacement counts per tab
const tabCounts = new Map();

/**
 * Initialize default settings on extension install
 */
async function initializeSettings() {
  try {
    const result = await chrome.storage.sync.get(['initialized']);
    if (!result.initialized) {
      await chrome.storage.sync.set({
        ...DEFAULT_SETTINGS,
        initialized: true,
      });
      console.log('Bun Everywhere: Default settings initialized');
    }
  } catch (error) {
    console.error('Bun Everywhere: Failed to initialize settings:', error);
  }
}

/**
 * Update extension icon and badge based on enabled state
 * @param {boolean} enabled - Whether the extension is globally enabled
 */
async function updateIconState(enabled) {
  try {
    if (enabled) {
      await chrome.action.setBadgeText({ text: '' });
      await chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    } else {
      await chrome.action.setBadgeText({ text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
    }
  } catch (error) {
    console.error('Bun Everywhere: Failed to update icon state:', error);
  }
}

/**
 * Send message to all active tabs to re-evaluate replacements
 */
async function notifyAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'reevaluate' });
      } catch (error) {
        // Ignore errors for tabs that don't have content script loaded
      }
    }
  } catch (error) {
    console.error('Bun Everywhere: Failed to notify tabs:', error);
  }
}

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  await initializeSettings();
  
  // Set initial icon state
  const settings = await chrome.storage.sync.get(['globalEnabled']);
  await updateIconState(settings.globalEnabled !== false);
  
  console.log('Bun Everywhere: Extension installed/updated');
});

/**
 * Handle messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.action) {
        case 'toggle':
          // Toggle global enabled state
          const currentSettings = await chrome.storage.sync.get(['globalEnabled']);
          const newState = !currentSettings.globalEnabled;
          await chrome.storage.sync.set({ globalEnabled: newState });
          await updateIconState(newState);
          await notifyAllTabs();
          sendResponse({ success: true, enabled: newState });
          break;

        case 'getState':
          // Get current global enabled state
          const settings = await chrome.storage.sync.get(['globalEnabled']);
          sendResponse({ enabled: settings.globalEnabled !== false });
          break;

        case 'reportCount':
          // Store replacement count for a tab
          if (sender.tab && sender.tab.id) {
            tabCounts.set(sender.tab.id, message.count);
          }
          sendResponse({ success: true });
          break;

        case 'getCount':
          // Get replacement count for current tab
          if (message.tabId) {
            const count = tabCounts.get(message.tabId) || 0;
            sendResponse({ count });
          } else {
            sendResponse({ count: 0 });
          }
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Bun Everywhere: Message handling error:', error);
      sendResponse({ error: error.message });
    }
  })();
  
  // Return true to indicate async response
  return true;
});

/**
 * Clean up tab counts when tabs are closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  tabCounts.delete(tabId);
});

/**
 * Update badge with replacement count if enabled
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    try {
      const settings = await chrome.storage.sync.get(['showCountBadge', 'globalEnabled']);
      if (settings.showCountBadge && settings.globalEnabled) {
        const count = tabCounts.get(tabId) || 0;
        if (count > 0) {
          await chrome.action.setBadgeText({ text: count.toString() });
          await chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
        }
      }
    } catch (error) {
      console.error('Bun Everywhere: Failed to update badge:', error);
    }
  }
});
