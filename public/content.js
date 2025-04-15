// Content script to extract information from the current page

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getPageContent") {
    // Extract the most relevant content from the page
    const content = extractArticleContent();
    sendResponse({ 
      content: content,
      success: true 
    });
  }
  
  return true; // Keep the message channel open for async response
});

/**
 * Extracts the main article content from a news page
 * Uses several heuristics to find the most likely article content
 */
function extractArticleContent() {
  // Try to find common article containers
  const articleSelectors = [
    'article',
    '[itemprop="articleBody"]',
    '.article-content',
    '.story-body',
    '.post-content',
    '.entry-content',
    '#article-body',
    '.news-article',
    '.article__content',
    '.story__content',
    '.news__content'
  ];
  
  let articleElement = null;
  
  // Try each selector until we find content
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Choose the longest content if multiple elements match
      articleElement = Array.from(elements).reduce((longest, current) => 
        current.textContent.length > longest.textContent.length ? current : longest
      );
      break;
    }
  }
  
  // If no article container found, fallback to looking for paragraphs
  if (!articleElement || articleElement.textContent.trim().length < 100) {
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs.length > 3) {
      // Collect paragraphs that are likely part of the main content
      const contentParagraphs = Array.from(paragraphs)
        .filter(p => {
          const text = p.textContent.trim();
          return (
            text.length > 40 && // Reasonably long paragraphs
            !/copyright|terms|privacy|contact|about/.test(p.textContent.toLowerCase()) // Exclude footer content
          );
        });
      
      return contentParagraphs.map(p => p.textContent.trim()).join('\n\n');
    }
  }
  
  // Return the found article content or fallback to body text
  return articleElement ? 
    articleElement.textContent.trim() : 
    document.body.innerText.substring(0, 10000).trim();
}
