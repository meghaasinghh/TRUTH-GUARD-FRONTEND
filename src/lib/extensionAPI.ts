interface TabInfo {
  url: string;
  title: string;
  content: string;
}

/**
 * Gets the current tab information via the Chrome extension API
 */
export async function getCurrentTabInfo(): Promise<TabInfo> {
  // If running in a Chrome extension context
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        if (!activeTab || !activeTab.id) {
          reject(new Error("No active tab found"));
          return;
        }
        
        // Execute content script to extract page content
        chrome.tabs.sendMessage(
          activeTab.id, 
          { action: "getPageContent" },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (response && response.content) {
              resolve({
                url: activeTab.url || "",
                title: activeTab.title || "",
                content: response.content
              });
            } else {
              reject(new Error("Failed to get page content"));
            }
          }
        );
      });
    });
  } 
  
  // Development fallback (when not running as extension)
  return Promise.resolve({
    url: window.location.href,
    title: document.title,
    // Mock content for development
    content: document.body.innerText.slice(0, 5000) || "Sample content for testing"
  });
}

/**
 * Reports an issue with the analysis
 */
export async function reportIssue(analysisId: number, details: string): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Extension implementation
    return new Promise((resolve, reject) => {
      fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, details }),
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to submit report');
        resolve();
      })
      .catch(error => reject(error));
    });
  } else {
    // Development fallback
    console.log('Report issue:', { analysisId, details });
    return Promise.resolve();
  }
}
