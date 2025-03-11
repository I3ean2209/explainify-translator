
// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'explainText',
    title: 'Explain this text',
    contexts: ['selection']
  });

  // Set default settings if not already set
  chrome.storage.sync.get(['targetLanguage', 'explanationStyle'], function(result) {
    if (!result.targetLanguage) {
      chrome.storage.sync.set({ targetLanguage: 'en' });
    }
    if (!result.explanationStyle) {
      chrome.storage.sync.set({ explanationStyle: 'simple' });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'explainText' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'explainSelection',
      text: info.selectionText
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getExplanation') {
    // In a real extension, this would call an external API
    // For now, we'll just send a mock response
    setTimeout(() => {
      sendResponse({
        success: true,
        explanation: 'This is a simulated explanation for demonstration purposes.'
      });
    }, 1000);
    return true; // Indicates async response
  }
});
