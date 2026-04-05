/**
 * Content script for Bun Everywhere Chrome Extension
 * Scans DOM for package manager commands and replaces them with Bun equivalents
 */

'use strict';

// Replacement rules (inline to ensure they're always available)
const REPLACEMENTS = [
  // npm → bun replacements
  { provider: 'npm', pattern: /\bnpm install --save-dev\s+([^\s\n]+)/g, replacement: 'bun add --dev $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm install -D\s+([^\s\n]+)/g, replacement: 'bun add --dev $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm install --global\s+([^\s\n]+)/g, replacement: 'bun add --global $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm install -g\s+([^\s\n]+)/g, replacement: 'bun add --global $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm install\s+([^\s\n]+)/g, replacement: 'bun add $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm uninstall\s+([^\s\n]+)/g, replacement: 'bun remove $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm run\s+([^\s\n]+)/g, replacement: 'bun run $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm install\b/g, replacement: 'bun install', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm i\b/g, replacement: 'bun install', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm test\b/g, replacement: 'bun test', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm start\b/g, replacement: 'bun start', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm publish\b/g, replacement: 'bun publish', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm init\b/g, replacement: 'bun init', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm create\s+([^\s\n]+)/g, replacement: 'bun create $1', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm update\b/g, replacement: 'bun update', bunCompatible: true },
  { provider: 'npm', pattern: /\bnpm ci\b/g, replacement: 'bun install --frozen-lockfile', bunCompatible: true },

  // npx → bunx replacements
  { provider: 'npx', pattern: /\bnpx\s+([^\s\n]+)/g, replacement: 'bunx $1', bunCompatible: true },

  // yarn → bun replacements
  { provider: 'yarn', pattern: /\byarn add --dev\s+([^\s\n]+)/g, replacement: 'bun add --dev $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn add -D\s+([^\s\n]+)/g, replacement: 'bun add --dev $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn global add\s+([^\s\n]+)/g, replacement: 'bun add --global $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn remove\s+([^\s\n]+)/g, replacement: 'bun remove $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn run\s+([^\s\n]+)/g, replacement: 'bun run $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn add\s+([^\s\n]+)/g, replacement: 'bun add $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn test\b/g, replacement: 'bun test', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn start\b/g, replacement: 'bun start', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn build\b/g, replacement: 'bun run build', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn dlx\s+([^\s\n]+)/g, replacement: 'bunx $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn create\s+([^\s\n]+)/g, replacement: 'bun create $1', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn upgrade\b/g, replacement: 'bun update', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn init\b/g, replacement: 'bun init', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn install\b/g, replacement: 'bun install', bunCompatible: true },
  { provider: 'yarn', pattern: /\byarn\b/g, replacement: 'bun install', bunCompatible: true },

  // pnpm → bun replacements
  { provider: 'pnpm', pattern: /\bpnpm add --save-dev\s+([^\s\n]+)/g, replacement: 'bun add --dev $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm add -D\s+([^\s\n]+)/g, replacement: 'bun add --dev $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm add --global\s+([^\s\n]+)/g, replacement: 'bun add --global $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm add -g\s+([^\s\n]+)/g, replacement: 'bun add --global $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm remove\s+([^\s\n]+)/g, replacement: 'bun remove $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm run\s+([^\s\n]+)/g, replacement: 'bun run $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm add\s+([^\s\n]+)/g, replacement: 'bun add $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm test\b/g, replacement: 'bun test', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm start\b/g, replacement: 'bun start', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm dlx\s+([^\s\n]+)/g, replacement: 'bunx $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm create\s+([^\s\n]+)/g, replacement: 'bun create $1', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm update\b/g, replacement: 'bun update', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm init\b/g, replacement: 'bun init', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm install\b/g, replacement: 'bun install', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm i\b/g, replacement: 'bun install', bunCompatible: true },
  { provider: 'pnpm', pattern: /\bpnpm exec\s+([^\s\n]+)/g, replacement: 'bunx $1', bunCompatible: true },

  // yarn dlx → bunx (separate provider)
  { provider: 'yarn dlx', pattern: /\byarn dlx\s+([^\s\n]+)/g, replacement: 'bunx $1', bunCompatible: true },

  // pnpm dlx → bunx (separate provider)
  { provider: 'pnpm dlx', pattern: /\bpnpm dlx\s+([^\s\n]+)/g, replacement: 'bunx $1', bunCompatible: true },
];

// Global state
let isEnabled = true;
let settings = {};
let replacementCount = 0;
let mutationObserver = null;

/**
 * Check if element should be processed for replacements
 * @param {Element} element - DOM element to check
 * @returns {boolean} True if element should be processed
 */
function shouldProcessElement(element) {
  if (!element || !element.tagName) return false;

  const tagName = element.tagName.toLowerCase();
  // Ensure className is always a string
  const className = (element.className && typeof element.className.toString === 'function')
    ? element.className.toString()
    : (element.className || '');
  const role = element.getAttribute('role') || '';

  // Skip editable elements
  if (tagName === 'input' || tagName === 'textarea' || element.contentEditable === 'true') {
    return false;
  }

  // Check for code-related elements
  const codeSelectors = [
    'code',
    'pre',
    'kbd',
    '[role="code"]',
    '.blob-code',
    '.js-file-line',
    '.highlight',
    '.highlight-source',
    '.language-',
    '.token',
    '.line',
    '.codeblock',
    '.prism',
    '.hljs',
    '.shiki',
  ];

  // Check tag names
  if (tagName === 'code' || tagName === 'pre' || tagName === 'kbd') {
    return true;
  }

  // Check role attribute
  if (role === 'code') {
    return true;
  }

  // Check class names
  const codeClasses = ['highlight', 'prism', 'hljs', 'shiki', 'codeblock', 'token', 'line'];
  for (const codeClass of codeClasses) {
    if (className.includes(codeClass)) {
      return true;
    }
  }

  // Check for language classes
  if (className.includes('language-')) {
    return true;
  }

  // Check GitHub-specific classes
  if (className.includes('blob-code') || className.includes('js-file-line')) {
    return true;
  }

  return false;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Apply replacements to a text node with highlighting
 * @param {Text} textNode - Text node to process
 * @returns {number} Number of replacements made
 */
function processTextNode(textNode) {
  // No longer used - processing happens at element level
  return 0;
}

/**
 * Highlight replaced text in HTML
 * @param {string} originalText - Original text
 * @param {string} newText - Text with replacements applied
 * @returns {string} HTML with highlighted replacement lines
 */
function highlightReplacements(originalText, newText) {
  const lines = newText.split('\n');
  const processedLines = new Array(lines.length).fill(false);
  const result = [];

  const bunCommands = [
    /\bbun install\b/, /\bbun add\b/, /\bbun remove\b/, /\bbun run\b/,
    /\bbun test\b/, /\bbun start\b/, /\bbun publish\b/, /\bbun init\b/,
    /\bbun create\b/, /\bbun update\b/, /\bbunx\b/, /\bbun build\b/,
    /\bbun dev\b/, /\bbun serve\b/, /\bbun clean\b/, /\bbun lock\b/,
    /\bbun upgrade\b/, /\bbun patch\b/, /\bbun major\b/, /\bbun minor\b/
  ];

  for (let i = 0; i < lines.length; i++) {
    if (processedLines[i]) {
      result.push(escapeHTML(lines[i]));
      continue;
    }

    const line = lines[i];
    const hasBunCommand = bunCommands.some(cmd => cmd.test(line));

    if (hasBunCommand) {
      // Look ahead to capture multi-line commands
      const commandLines = [line];
      let endIndex = i;
      let nextIndex = i + 1;

      while (nextIndex < lines.length) {
        const trimmedNext = lines[nextIndex].trim();
        if (
          trimmedNext.startsWith('@') ||
          trimmedNext.startsWith('--') ||
          lines[nextIndex].match(/^\s+/) ||
          trimmedNext.match(/^[a-zA-Z0-9@\/\-_.]+$/)
        ) {
          commandLines.push(lines[nextIndex]);
          endIndex = nextIndex;
          nextIndex++;
        } else {
          break;
        }
      }

      const fullCommand = commandLines
        .join('\n')
        .trim()
        .replace(/^\$\s+/, '');
      const isMultiLine = commandLines.length > 1;

      for (let j = i; j <= endIndex; j++) {
        processedLines[j] = true;
      }

      commandLines.forEach((cmdLine, idx) => {
        if (idx === 0) {
          result.push(`<span class="bun-highlighted ${isMultiLine ? 'multiline' : ''}" data-command="${escapeHTML(fullCommand)}">${escapeHTML(cmdLine)}</span>`);
        } else {
          result.push(`<span class="bun-highlighted continuation">${escapeHTML(cmdLine)}</span>`);
        }
      });

      i = endIndex;
    } else {
      result.push(escapeHTML(line));
    }
  }

  return result.join('\n');
}

/**
 * Create a copy button for a code block
 * @param {Element} codeBlock - The code block element
 * @returns {HTMLElement} The copy button element
 */
function createCopyButton(codeBlock) {
  const button = document.createElement('button');
  button.className = 'bun-copy-button';
  button.innerHTML = 'Copy';
  button.title = 'Copy code';
  button.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  button.addEventListener('click', async () => {
    try {
      const text = codeBlock.textContent || codeBlock.innerText;
      await navigator.clipboard.writeText(text);

      // Show success feedback
      button.innerHTML = 'Copied';
      button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      button.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';

      setTimeout(() => {
        button.innerHTML = 'Copy';
        button.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        button.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
      }, 2000);
    } catch (error) {
      console.error('Bun Everywhere: Failed to copy text:', error);
      button.innerHTML = 'Failed';
      button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      button.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';

      setTimeout(() => {
        button.innerHTML = 'Copy';
        button.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        button.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
      }, 2000);
    }
  });

  return button;
}

/**
 * Add CSS for highlighting
 */
function addHighlightStyles() {
  if (document.getElementById('bun-highlight-styles')) return;

  const style = document.createElement('style');
  style.id = 'bun-highlight-styles';
  style.textContent = `
    .bun-highlighted {
      background: rgba(251, 191, 36, 0.15);
      border-radius: 4px;
      padding: 2px 6px;
      border-bottom: 2px solid #f59e0b;
      font-weight: 500;
      transition: all 0.2s ease;
      display: block;
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
      position: relative;
    }

    .bun-highlighted.continuation {
      cursor: default;
      background: rgba(251, 191, 36, 0.08);
      border-bottom: 2px solid #fbbf24;
    }

    .bun-highlighted.continuation:hover {
      background: rgba(251, 191, 36, 0.12);
    }

    .bun-highlighted:hover {
      background: rgba(251, 191, 36, 0.25);
      border-bottom-color: #d97706;
      transform: translateY(-1px);
    }

    .bun-highlighted::after {
      content: 'Click to copy';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: #f59e0b;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      font-weight: 400;
    }

    .bun-highlighted.continuation::after {
      display: none;
    }

    .bun-highlighted.multiline::after {
      content: 'Click to copy (multi-line)';
    }

    .bun-highlighted:hover::after {
      opacity: 1;
    }

    .bun-highlighted.copied {
      background: rgba(16, 185, 129, 0.15);
      border-bottom-color: #10b981;
    }

    .bun-highlighted.copied::after {
      content: 'Copied!';
      background: #10b981;
      opacity: 1;
    }

    .bun-highlighted.multiline.copied::after {
      content: 'Multi-line copied!';
    }

    .bun-scroll-button:hover {
      background: #d97706 !important;
      transform: translateY(-1px) !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Process an element's full text content for replacements and highlighting
 * @param {Element} element - Root element to process
 * @returns {number} Total number of replacements made
 */
function processElement(element) {
  if (!shouldProcessElement(element)) return 0;
  if (element.dataset.bunProcessed) return 0;

  const originalText = element.textContent;
  if (!originalText || !originalText.trim()) return 0;

  let text = originalText;
  let totalReplacements = 0;

  // Apply enabled replacement rules on the full text
  for (const rule of REPLACEMENTS) {
    if (!settings.providers[rule.provider] || !rule.bunCompatible || !rule.replacement) {
      continue;
    }
    const matches = text.match(rule.pattern);
    if (matches) {
      text = text.replace(rule.pattern, rule.replacement);
      totalReplacements += matches.length;
    }
  }

  if (totalReplacements > 0) {
    // Replace the entire element content with highlighted HTML
    element.innerHTML = highlightReplacements(originalText, text);
    element.dataset.bunProcessed = 'true';
  }

  return totalReplacements;
}

/**
 * Auto-copy the first Bun command found on the page
 */
async function autoCopyFirstCommand() {
  try {
    const firstCommand = document.querySelector('.bun-highlighted[data-command]');
    if (!firstCommand) return;

    const command = firstCommand.getAttribute('data-command');
    if (!command) return;

    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      console.warn('Bun Everywhere: Clipboard API not available');
      return;
    }

    await navigator.clipboard.writeText(command);

    // Show brief copied state on the element
    firstCommand.classList.add('copied');
    setTimeout(() => {
      firstCommand.classList.remove('copied');
    }, 2000);
  } catch (error) {
    // Silently fail for auto-copy to avoid spamming console
    // Only log if it's not a common clipboard permission error
    if (!error.message.includes('Clipboard') && !error.message.includes('permission')) {
      console.error('Bun Everywhere: Auto-copy failed:', error);
    }
  }
}

/**
 * Add click handlers to highlighted commands
 */
function addClickHandlers() {
  const highlightedElements = document.querySelectorAll('.bun-highlighted');

  highlightedElements.forEach(element => {
    // Remove existing listeners to avoid duplicates
    element.removeEventListener('click', handleCopyClick);
    element.addEventListener('click', handleCopyClick);
  });
}

/**
 * Handle click on highlighted command to copy it
 */
async function handleCopyClick(event) {
  const element = event.target;
  const command = element.getAttribute('data-command');

  if (!command) return;

  try {
    await navigator.clipboard.writeText(command);

    // Show copied state
    element.classList.add('copied');

    // Reset after 2 seconds
    setTimeout(() => {
      element.classList.remove('copied');
    }, 2000);

  } catch (error) {
    console.error('Bun Everywhere: Failed to copy command:', error);
  }
}

/**
 * Scan the entire document for replacements
 */
function scanDocument() {
  if (!isEnabled || !settings.globalEnabled) return;

  replacementCount = 0;

  // Add highlight styles first
  addHighlightStyles();

  // Find all elements that might contain code
  const potentialElements = document.querySelectorAll(
    'code, pre, kbd, [role="code"], .highlight, .prism, .hljs, .shiki, .codeblock, .language-, .token, .line, .blob-code, .js-file-line'
  );

  for (const element of potentialElements) {
    replacementCount += processElement(element);
  }

  // Add click handlers to highlighted commands
  addClickHandlers();

  // Auto-copy first command if setting is enabled
  if (replacementCount > 0 && settings.autoCopyOnLoad) {
    // Delay auto-copy to ensure page is fully loaded and clipboard is ready
    setTimeout(() => {
      autoCopyFirstCommand();
    }, 500);
  }

  // Report count to background script
  if (replacementCount > 0) {
    chrome.runtime.sendMessage({ action: 'reportCount', count: replacementCount });
  }
}

/**
 * Load settings from storage
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

    settings = {
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

    isEnabled = settings.globalEnabled && !settings.excludedSites.includes(window.location.hostname);
  } catch (error) {
    console.error('Bun Everywhere: Failed to load settings:', error);
    // Use defaults on error
    settings = {
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
    isEnabled = true;
  }
}

/**
 * Handle DOM mutations for dynamic content
 */
function setupMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  mutationObserver = new MutationObserver((mutations) => {
    let shouldRescan = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes contain code elements
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (shouldProcessElement(node) || node.querySelector && node.querySelector('code, pre, kbd, [role="code"], .highlight, .prism, .hljs, .shiki, .codeblock, .language-, .token, .line, .blob-code, .js-file-line')) {
              shouldRescan = true;
              break;
            }
          }
        }
      }
      if (shouldRescan) break;
    }

    if (shouldRescan) {
      // Debounce rescanning
      setTimeout(scanDocument, 100);
    }
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Handle messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'reevaluate') {
    loadSettings().then(() => {
      if (isEnabled) {
        scanDocument();
      } else {
        // Remove all bun-replaced spans if disabled (not used anymore but kept for compatibility)
        document.querySelectorAll('.bun-replaced').forEach(span => {
          const parent = span.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(span.textContent), span);
          }
        });


      }
    });
  }
});

/**
 * Initialize the content script
 */
async function initialize() {
  await loadSettings();

  if (isEnabled) {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        scanDocument();
        setupMutationObserver();
      });
    } else {
      scanDocument();
      setupMutationObserver();
    }
  }
}

// Start the extension
initialize();
