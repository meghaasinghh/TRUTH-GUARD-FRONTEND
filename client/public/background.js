// Background script for FactCheck extension
let latestAnalysisResult = null;

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storeAnalysisResult") {
    latestAnalysisResult = message.result;
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === "getLatestAnalysisResult") {
    sendResponse({ success: true, result: latestAnalysisResult });
    return true;
  }
  
  // Proxy API requests to the backend when the extension is in use
  if (message.action === "proxyApiRequest") {
    fetch(message.url, {
      method: message.method || 'GET',
      headers: message.headers || { 'Content-Type': 'application/json' },
      body: message.body ? JSON.stringify(message.body) : undefined
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Indicates we will send response asynchronously
  }
});

// Optional: Add analysis on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('news')) {
    // If URL contains news, we could automatically analyze
    // This feature would be tied to a user preference
  }
});
