import natural from 'natural';

// Initializing NLP components
const tokenizer = new natural.WordTokenizer();
// Initialize sentiment analyzer with correct parameters
const sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

/**
 * Analyzes sentiment in text
 * @param text Text to analyze
 * @returns Sentiment analysis results
 */
export async function analyzeSentiment(text: string) {
  try {
    // Tokenize text
    const tokens = tokenizer.tokenize(text);
    
    // Basic sentiment analysis
    const sentiment = tokens.length > 0 
      ? sentimentAnalyzer.getSentiment(tokens)
      : 0;
    
    // Analyze emotional tone
    const emotionalWords = countEmotionalWords(text);
    const totalWords = tokens.length;
    const emotionalRatio = totalWords > 0 ? emotionalWords / totalWords : 0;
    
    // Detect bias indicators
    const biasScore = detectBias(text);
    
    return {
      overallSentiment: normalizeScore(sentiment, -1, 1), // -1 (negative) to 1 (positive)
      overallEmotionalTone: emotionalRatio > 0.2 ? emotionalRatio : 0.2, // Baseline minimum
      biasIndicators: biasScore,
      sensationalismScore: detectSensationalism(text)
    };
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return {
      overallSentiment: 0,
      overallEmotionalTone: 0.5,
      biasIndicators: 0.5,
      sensationalismScore: 0.5
    };
  }
}

/**
 * Analyzes entities in text
 * @param text Text to analyze
 * @returns Entity analysis results
 */
export async function analyzeEntities(text: string) {
  try {
    // Simple named entity recognition for demonstration
    const entities = {
      people: extractPeople(text),
      organizations: extractOrganizations(text),
      locations: extractLocations(text),
      dates: extractDates(text)
    };
    
    // Check for sources cited
    const sourcesCited = extractSources(text);
    
    // Extract claims
    const claims = extractClaims(text);
    
    return {
      namedEntities: entities,
      sourcesCited,
      claims,
      entityConsistency: calculateEntityConsistency(entities)
    };
  } catch (error) {
    console.error("Error in entity analysis:", error);
    return {
      namedEntities: { people: [], organizations: [], locations: [], dates: [] },
      sourcesCited: [],
      claims: [],
      entityConsistency: 0.5
    };
  }
}

/**
 * Calculates readability score for text
 * @param text Text to analyze
 * @returns Readability score (0-100)
 */
export function calculateReadabilityScore(text: string): number {
  try {
    // Count sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Count words
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    const wordCount = words.length;
    
    // Count syllables (simplified approximation)
    const syllableCount = countSyllables(text);
    
    if (sentenceCount === 0 || wordCount === 0) {
      return 50; // Default score for empty or invalid text
    }
    
    // Calculate average words per sentence
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Calculate average syllables per word
    const avgSyllablesPerWord = syllableCount / wordCount;
    
    // Simplified Flesch-Kincaid Grade Level calculation
    const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    // Convert grade level to a 0-100 score (higher is more readable)
    const readabilityScore = Math.max(0, Math.min(100, 100 - (grade * 5)));
    
    return Math.round(readabilityScore);
  } catch (error) {
    console.error("Error calculating readability:", error);
    return 50; // Default score on error
  }
}

/**
 * Extracts keywords from text
 * @param text Text to analyze
 * @returns Array of keywords with relevance scores
 */
export function extractKeywords(text: string) {
  try {
    // Tokenize
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // Remove stopwords
    const stopwords = ['the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'is', 'are', 'was', 'were'];
    const filteredTokens = tokens.filter(token => 
      !stopwords.includes(token) && token.length > 2
    );
    
    // Count occurrences
    const wordCounts: Record<string, number> = {};
    filteredTokens.forEach(token => {
      wordCounts[token] = (wordCounts[token] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20 keywords
      .map(([word, count]) => ({
        word,
        relevance: count / filteredTokens.length
      }));
    
    return sortedWords;
  } catch (error) {
    console.error("Error extracting keywords:", error);
    return [];
  }
}

// Helper functions

function countEmotionalWords(text: string): number {
  // Simplified emotional word detection
  const emotionalTerms = [
    'shocking', 'amazing', 'terrible', 'wonderful', 'awful', 'incredible',
    'devastating', 'outrageous', 'horrific', 'fantastic', 'tragedy', 'miracle',
    'disaster', 'catastrophe', 'breakthrough', 'bombshell', 'crisis', 'epic',
    'terrifying', 'stunning', 'jaw-dropping', 'mind-blowing', 'explosive'
  ];
  
  const lowerText = text.toLowerCase();
  return emotionalTerms.reduce((count, term) => {
    const regex = new RegExp('\\b' + term + '\\b', 'g');
    const matches = lowerText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function detectBias(text: string): number {
  // Simplified bias detection
  const biasTerms = [
    'obviously', 'clearly', 'undoubtedly', 'certainly', 'absolutely',
    'everyone knows', 'as everyone can see', 'without question',
    'of course', 'naturally', 'surely', 'always', 'never',
    'completely', 'totally', 'definitely', 'guaranteed'
  ];
  
  const lowerText = text.toLowerCase();
  const biasCount = biasTerms.reduce((count, term) => {
    const regex = new RegExp('\\b' + term + '\\b', 'g');
    const matches = lowerText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // Normalize bias score based on text length
  const wordCount = text.split(/\s+/).length;
  return Math.min(1, biasCount / (wordCount * 0.02));
}

function detectSensationalism(text: string): number {
  // Count exclamation marks and all caps words
  const exclamationCount = (text.match(/!/g) || []).length;
  
  // Words in all caps (excluding common acronyms)
  const allCapsRegex = /\b[A-Z]{4,}\b/g;
  const allCapsCount = (text.match(allCapsRegex) || []).length;
  
  // Check for clickbait phrases
  const clickbaitPhrases = [
    'you won\'t believe', 'shocking', 'mind-blowing', 'stunning',
    'jaw-dropping', 'unbelievable', 'amazing', 'incredible',
    'will change your life', 'what happens next', 'secret', 'this is why'
  ];
  
  const lowerText = text.toLowerCase();
  const clickbaitCount = clickbaitPhrases.reduce((count, phrase) => {
    return count + (lowerText.includes(phrase) ? 1 : 0);
  }, 0);
  
  // Calculate sensationalism score
  const wordCount = text.split(/\s+/).length;
  const normalizedExclamation = Math.min(1, exclamationCount / (wordCount * 0.05));
  const normalizedAllCaps = Math.min(1, allCapsCount / (wordCount * 0.03));
  const normalizedClickbait = Math.min(1, clickbaitCount / 5);
  
  return (normalizedExclamation + normalizedAllCaps + normalizedClickbait) / 3;
}

function countSyllables(text: string): number {
  // Very simplified syllable counter
  const words = text.toLowerCase().split(/\s+/);
  
  return words.reduce((total, word) => {
    // Count vowel groups in word
    const vowelGroups = word.replace(/[^aeiouy]+/g, ' ').trim().split(' ');
    let count = vowelGroups.length;
    
    // Adjust for silent e at end
    if (word.length > 2 && word.endsWith('e') && !/[aeiouy]/.test(word.charAt(word.length - 2))) {
      count--;
    }
    
    // Words should have at least one syllable
    return total + Math.max(1, count);
  }, 0);
}

function extractPeople(text: string): string[] {
  // Very simplified person name extraction (this would use NER in production)
  const commonTitles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'President', 'Senator'];
  const peopleRegex = new RegExp(`(${commonTitles.join('|')})\\s[A-Z][a-z]+(?:\\s[A-Z][a-z]+)?`, 'g');
  
  const matches = text.match(peopleRegex) || [];
  return Array.from(new Set(matches));
}

function extractOrganizations(text: string): string[] {
  // Very simplified organization extraction
  const commonOrgs = [
    'Government', 'University', 'Corporation', 'Company', 'Association',
    'Institute', 'Committee', 'Foundation', 'Organization', 'Department'
  ];
  
  const orgsRegex = new RegExp(`[A-Z][a-z]+(?:\\s(?:[A-Z][a-z]+|of|the|and))*\\s(${commonOrgs.join('|')})`, 'g');
  
  const matches = text.match(orgsRegex) || [];
  return Array.from(new Set(matches));
}

function extractLocations(text: string): string[] {
  // Very simplified location extraction
  const locations: string[] = [];
  
  // Common country names
  const countries = ['United States', 'China', 'Russia', 'Canada', 'Brazil', 'Australia', 'India', 'Japan'];
  countries.forEach(country => {
    if (text.includes(country)) locations.push(country);
  });
  
  // Simple regex for "in [Location]" pattern
  const inLocationRegex = /in\s([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g;
  let match;
  while ((match = inLocationRegex.exec(text)) !== null) {
    if (match[1] && !countries.includes(match[1])) {
      locations.push(match[1]);
    }
  }
  
  return Array.from(new Set(locations));
}

function extractDates(text: string): string[] {
  // Extract dates in various formats
  const datePatterns = [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // MM/DD/YYYY
    /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,   // MM-DD-YYYY
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{1,2}(?:st|nd|rd|th)?,?\s\d{4}\b/g, // Month Day, Year
  ];
  
  const allDates: string[] = [];
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    allDates.push(...matches);
  });
  
  return Array.from(new Set(allDates));
}

function extractSources(text: string): string[] {
  // Extract citations and sources
  const sourcePatterns = [
    /according to ([^,.;:]+)/gi,
    /cited by ([^,.;:]+)/gi,
    /reported by ([^,.;:]+)/gi,
    /says ([^,.;:]+)/gi,
    /([^,.;:]+) reported/gi
  ];
  
  const sources: string[] = [];
  sourcePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) sources.push(match[1].trim());
    }
  });
  
  return Array.from(new Set(sources));
}

function extractClaims(text: string): any[] {
  // Simplified claim extraction - in real NLP this would be more sophisticated
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  
  const claims = sentences
    .filter(sentence => {
      const lower = sentence.toLowerCase();
      return (
        lower.includes(' is ') || 
        lower.includes(' are ') || 
        lower.includes(' was ') || 
        lower.includes(' were ') ||
        lower.includes(' will ') ||
        lower.includes(' should ') ||
        lower.includes(' must ') ||
        lower.includes(' found that ') ||
        lower.includes(' shows that ') ||
        lower.includes(' proves ')
      );
    })
    .map(sentence => ({
      text: sentence,
      verifiability: Math.random() // In real app, would assess verifiability
    }))
    .slice(0, 5); // Limit to top 5
  
  return claims;
}

function calculateEntityConsistency(entities: any): number {
  // Check for internal consistency among different entity types
  const allEntities = [
    ...entities.people, 
    ...entities.organizations, 
    ...entities.locations
  ];
  
  // Higher score if there are more distinct entities (more specific article)
  const distinctCount = new Set(allEntities).size;
  
  // Calculate overlap between entity types (more overlap = more consistency)
  const totalCount = allEntities.length;
  
  if (totalCount === 0) return 0.5; // Default for no entities
  
  return Math.min(1, distinctCount / 10);
}

function normalizeScore(score: number, min: number, max: number): number {
  // Normalize score to 0-1 range
  return (score - min) / (max - min);
}
