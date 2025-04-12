// This is a simplified implementation of a text classifier
// In a real extension, this would use an actual TensorFlow.js model

/**
 * Classifies text using TensorFlow.js model
 * @param text Text to classify
 * @returns Classification results
 */
export async function classifyText(text: string) {
  // In a real implementation, this would load and use a pre-trained TensorFlow.js model
  // For this simplified version, we'll use heuristic rules to simulate model outputs
  
  try {
    // Run simplified fake news detection heuristics
    const result = simulateModelPrediction(text);
    
    return {
      credibilityScore: result.credibilityScore,  // 0-1 score (1 = most credible)
      confidence: result.confidence,              // 0-1 confidence in prediction
      factualScoreNormalized: result.factual,     // 0-1 score for factual content
      evidenceScoreNormalized: result.evidence,   // 0-1 score for evidence quality
      emotionalScoreNormalized: result.emotional, // 0-1 score for emotional content
      biasScoreNormalized: result.bias,           // 0-1 score for bias (1 = most biased)
      claimsAnalysis: analyzeClaims(text),        // Analysis of individual claims
      category: determineCategory(result.credibilityScore) // Text category
    };
  } catch (error) {
    console.error("Error classifying text:", error);
    
    // Return default values on error
    return {
      credibilityScore: 0.5,
      confidence: 0.6,
      factualScoreNormalized: 0.5,
      evidenceScoreNormalized: 0.5,
      emotionalScoreNormalized: 0.5,
      biasScoreNormalized: 0.5,
      claimsAnalysis: [],
      category: "potentially_misleading"
    };
  }
}

/**
 * Simulates model prediction based on text features
 */
function simulateModelPrediction(text: string) {
  // Lowercase for easier pattern matching
  const lowerText = text.toLowerCase();
  
  // Feature extraction and scoring
  
  // 1. Check for sensationalist language
  const sensationalistTerms = [
    'shocking', 'bombshell', 'mind-blowing', 'you won\'t believe',
    'incredible', 'unbelievable', 'breaking', 'urgent', 'emergency',
    'scandal', 'controversial', 'secret', 'exposed', 'reveals'
  ];
  
  const sensationScore = sensationalistTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.05 : 0);
  }, 0);
  
  // 2. Check for factual indicators
  const factualTerms = [
    'according to', 'study shows', 'research indicates', 'evidence suggests',
    'data from', 'experts say', 'statistics show', 'survey found',
    'investigation revealed', 'analysis of', 'findings suggest'
  ];
  
  const factualScore = factualTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.05 : 0);
  }, 0);
  
  // 3. Check for evidence indicators
  const evidenceTerms = [
    'study', 'data', 'research', 'evidence', 'survey', 'poll',
    'statistics', 'sources', 'experts', 'citation', 'reference',
    'professor', 'scientist', 'researcher', 'published'
  ];
  
  const evidenceScore = evidenceTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.04 : 0);
  }, 0);
  
  // 4. Check for emotional language
  const emotionalTerms = [
    'terrible', 'amazing', 'awful', 'wonderful', 'horrible', 'fantastic',
    'devastating', 'extraordinary', 'disaster', 'triumph', 'catastrophe',
    'miracle', 'tragedy', 'outrage', 'frightening', 'terrifying'
  ];
  
  const emotionalScore = emotionalTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.05 : 0);
  }, 0);
  
  // 5. Check for bias indicators
  const biasTerms = [
    'should', 'must', 'need to', 'have to', 'obviously', 'clearly',
    'undoubtedly', 'certainly', 'absolutely', 'worst', 'best',
    'only', 'always', 'never', 'everyone', 'nobody'
  ];
  
  const biasScore = biasTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.04 : 0);
  }, 0);
  
  // 6. Check for conspiracy indicators
  const conspiracyTerms = [
    'conspiracy', 'cover-up', 'truth', 'they don\'t want you to know',
    'government is hiding', 'secret', 'what they won\'t tell you',
    'suppressed', 'censored', 'mainstream media won\'t report'
  ];
  
  const conspiracyScore = conspiracyTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.08 : 0);
  }, 0);
  
  // 7. Check for scientific consensus challenges
  const antiScienceTerms = [
    'despite what scientists claim', 'scientists are wrong',
    'science has it wrong', 'challenging science', 'debunking science',
    'science doesn\'t know', 'experts are wrong'
  ];
  
  const antiScienceScore = antiScienceTerms.reduce((score, term) => {
    return score + (lowerText.includes(term) ? 0.06 : 0);
  }, 0);
  
  // Calculate overall credibility score (higher is more credible)
  // Credibility increases with factual and evidence indicators
  // Decreases with sensationalism, emotional language, bias, conspiracy, anti-science
  
  const positiveFactors = Math.min(1, factualScore + evidenceScore);
  const negativeFactors = Math.min(1, sensationScore + (emotionalScore * 0.7) + 
                                      (biasScore * 0.8) + conspiracyScore + antiScienceScore);
  
  // Base score starts at moderately credible (0.5)
  const baseScore = 0.5;
  const credibilityScore = Math.max(0.1, Math.min(0.9, 
    baseScore + (positiveFactors * 0.3) - (negativeFactors * 0.4)
  ));
  
  // Calculate confidence based on the amount of signals detected
  // More signals = higher confidence in our prediction
  const totalSignals = factualScore + evidenceScore + sensationScore + 
                      emotionalScore + biasScore + conspiracyScore + antiScienceScore;
  
  const confidence = Math.min(0.95, 0.6 + (totalSignals * 0.05));
  
  // Normalize individual scores to 0-1 range
  return {
    credibilityScore, 
    confidence,
    factual: Math.min(1, factualScore * 1.5), 
    evidence: Math.min(1, evidenceScore * 1.5),
    emotional: Math.min(1, emotionalScore * 1.5),
    bias: Math.min(1, biasScore * 1.5),
    sensational: Math.min(1, sensationScore * 1.5),
    conspiracy: Math.min(1, conspiracyScore * 1.5)
  };
}

/**
 * Maps credibility score to classification category
 */
function determineCategory(score: number): string {
  if (score >= 0.7) {
    return "reliable";
  } else if (score >= 0.4) {
    return "potentially_misleading";
  } else {
    return "likely_false";
  }
}

/**
 * Analyzes individual claims in the text
 */
function analyzeClaims(text: string) {
  // Split text into sentences that might contain claims
  const sentences = text.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);
  
  // For simplicity, we'll identify potential claims and assign random veracity values
  // In a real implementation, each claim would be analyzed by the ML model
  const claims = sentences
    .filter(sentence => {
      const lower = sentence.toLowerCase();
      // Look for sentence patterns that might indicate claims
      return (
        lower.includes(' is ') || 
        lower.includes(' are ') || 
        lower.includes(' will ') ||
        lower.includes(' shows ') ||
        lower.includes(' proves ') ||
        lower.includes(' found ') ||
        lower.includes(' according to ')
      );
    })
    .slice(0, 5) // Limit to top 5 potential claims
    .map(claim => {
      // Simulate claim analysis
      // In a real implementation, this would use the TensorFlow model to evaluate
      
      // Random veracity score for demo purposes
      const veracity = Math.random();
      let verdict, explanation;
      
      if (veracity > 0.7) {
        verdict = "verified";
        explanation = "Multiple independent sources confirm this information";
      } else if (veracity > 0.3) {
        verdict = "misleading";
        explanation = "This claim contains elements of truth but lacks important context";
      } else {
        verdict = "false";
        explanation = "This claim contradicts available evidence and reliable sources";
      }
      
      return {
        text: claim,
        veracity,
        verdict,
        explanation
      };
    });
  
  return claims;
}
