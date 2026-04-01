# Privacy Policy for Bun Everywhere Chrome Extension

**Last Updated:** April 1, 2026  
**Effective Date:** April 1, 2026

## 1. Overview

Bun Everywhere is a Chrome Extension that automatically replaces npm, yarn, pnpm, and npx commands with their Bun equivalents on web pages. This privacy policy explains how we handle data and protect your privacy when using our extension.

**Our commitment:** Bun Everywhere operates entirely locally within your browser. We do not collect, store, or transmit any personal data or browsing information to external servers.

## 2. Data Collected

### No Data Collection
Bun Everywhere does **NOT** collect any of the following:
- Personal information (name, email, address, etc.)
- Browsing history or websites you visit
- Page content or text from websites
- Search queries or form inputs
- IP addresses or location data
- Device identifiers or usage analytics

### Local Processing Only
All command replacement processing happens locally in your browser. The extension:
- Scans web page content for package manager commands
- Replaces commands with Bun equivalents
- Stores only your preferences locally

## 3. Data Storage

### Chrome Storage API
We use Chrome's built-in storage API to save your preferences:

**What is stored:**
- Extension enable/disable status
- Excluded websites list
- Package manager provider preferences (npm, yarn, pnpm, npx toggles)
- Visual indicator settings
- Badge display preferences

**Where it's stored:**
- Locally on your device using `chrome.storage.sync`
- Optionally synced across your own Chrome browsers via your Google Account

**Important:** This sync feature is provided by Google Chrome and only shares data between your own devices. No third-party servers are involved.

### Data Retention
Your settings are retained until you:
- Uninstall the extension (settings are deleted)
- Manually reset settings in the options page
- Clear Chrome extension data

## 4. Permissions Justification

Bun Everywhere requests the following permissions for specific purposes:

### storage
- **Purpose:** Save your preferences and excluded sites
- **Usage:** Stores settings locally using Chrome's storage API
- **Data:** Only your extension preferences, no personal data

### activeTab
- **Purpose:** Access the current tab to apply command replacements
- **Usage:** Scans and modifies content on the active tab only
- **Data:** Temporary access to page content for local processing only

### scripting
- **Purpose:** Inject content scripts to perform replacements
- **Usage:** Runs JavaScript on web pages to replace commands
- **Data:** No data transmission, all processing is local

### host_permissions: <all_urls>
- **Purpose:** Work on any website you visit
- **Usage:** Enables command replacements on all web pages
- **Data:** No data collection, only local text processing

## 5. Third Parties

### No Third-Party Services
Bun Everywhere does not use any third-party services for:
- Analytics or tracking
- Data collection or processing
- Advertising or marketing
- Crash reporting or error logging

### Open Source Dependencies
This extension is built with:
- Vanilla JavaScript (no external libraries)
- Chrome Extension APIs (built into Chrome)
- No npm packages or external dependencies

## 6. Data Security

### Local Security
- All data processing happens locally in your browser
- No data transmission to external servers
- Chrome's built-in security protections apply

### Storage Security
- Settings are protected by Chrome's storage security
- Synced data is encrypted by Google's sync infrastructure
- No sensitive data is stored (only preferences)

## 7. Children's Privacy

Bun Everywhere is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.

## 8. Changes to This Privacy Policy

We may update this privacy policy from time to time. Changes will be:
- Posted on this page with an updated "Last Updated" date
- Effective immediately upon posting
- Communicated through the extension's update notes if significant

**How to stay informed:**
- Check this privacy policy periodically
- Review extension release notes on GitHub
- Watch for notifications in the Chrome Web Store

## 9. Your Rights and Choices

### Data Control
You have complete control over your data:
- **Access:** View your settings in the extension options page
- **Modify:** Change any preference in the settings
- **Delete:** Reset settings or uninstall the extension
- **Export:** Settings are stored locally and can be backed up

### Opt-Out Options
- **Disable extension:** Turn off the extension at any time
- **Exclude sites:** Add specific websites to exclusion list
- **Reset settings:** Return to default preferences
- **Uninstall:** Completely remove the extension and all data

## 10. Browser-Specific Privacy

### Chrome/Edge
- Uses Chrome's standard extension security model
- Benefits from Chrome's automatic updates and security patches
- Data sync controlled by your Google/Microsoft account settings

### Other Browsers
This privacy policy applies to Chrome and Edge. If this extension becomes available on other browsers, browser-specific privacy considerations will be addressed.

## 11. Compliance

This privacy policy is designed to comply with:
- **GDPR** (General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **COPPA** (Children's Online Privacy Protection Act)
- **Chrome Web Store Developer Policies**

## 12. Contact Information

If you have questions about this privacy policy or how we handle your data:

**Primary Contact:**
- GitHub Issues: [Create an issue](https://github.com/erbanku/bun-everywhere/issues)
- GitHub Discussions: [Start a discussion](https://github.com/erbanku/bun-everywhere/discussions)

**Response Time:**
- We typically respond to privacy inquiries within 7 days
- Complex issues may take up to 30 days for complete resolution

## 13. Transparency Report

### Data Access Requests
Since we don't collect any personal data, there are no data access requests to fulfill. Your settings are always accessible through the extension's interface.

### Data Breaches
Given our local-only architecture, the risk of data breaches is minimal. In the unlikely event of a security issue:
- We will promptly disclose known vulnerabilities
- Provide fixes through extension updates
- Communicate through official channels

---

**Summary:** Bun Everywhere respects your privacy by processing everything locally and collecting no personal data. Your settings are stored securely using Chrome's built-in storage, and you have complete control over your data at all times.

*This privacy policy is part of our commitment to transparency and user privacy. If you have any concerns or suggestions for improvement, please reach out through our GitHub repository.*
