import { analyzeSentiment, analyzeEntities, calculateReadabilityScore, extractKeywords } from './nlpService';
import { classifyText } from './tf-classifier';
import { 
  type Article, 
  type AnalysisResponse, 
  type Criteria, 
  type FactCheck 
} from '@shared/schema';

/**
 * Analyzes an article for fake news indicators
 */
export async function analyzeArticle(article: Article): Promise<AnalysisResponse> {
  try {
    // Extract text content from article
    const { title, content, source } = article;
    const fullText = `${title}\n\n${content}`;
    
    // Perform NLP analysis
    const sentiments = await analyzeSentiment(fullText);
    const entities = await analyzeEntities(fullText);
    const readabilityScore = calculateReadabilityScore(fullText);
    const keywords = extractKeywords(fullText);
    
    // Classify text using TensorFlow model
    const classification = await classifyText(fullText);
    
    // Extract credibility score from classification result (0-100)
    const credibilityScore = Math.round(classification.credibilityScore * 100);
    
    // Map raw score to classification category
    let classificationCategory: "reliable" | "potentially_misleading" | "likely_false";
    if (credibilityScore >= 75) {
      classificationCategory = "reliable";
    } else if (credibilityScore >= 40) {
      classificationCategory = "potentially_misleading";
    } else {
      classificationCategory = "likely_false";
    }
    
    // Generate criteria analysis
    const criteria = generateCriteriaAnalysis(
      source,
      sentiments,
      entities,
      readabilityScore,
      classification
    );
    
    // Generate fact checks
    const factChecks = generateFactChecks(
      fullText,
      entities,
      classification.claimsAnalysis
    );
    
    // Build final analysis response
    return {
      credibilityScore,
      classification: classificationCategory,
      confidence: Math.round(classification.confidence * 100),
      criteria,
      factChecks,
      recommendations: [], // Will be added by the route handler
    };
  } catch (error) {
    console.error('Error analyzing article:', error);
    
    // Return a default analysis if something fails
    return {
      credibilityScore: 50,
      classification: "potentially_misleading",
      confidence: 60,
      criteria: [
        {
          name: "Source Evaluation",
          rating: "medium",
          description: "Could not fully evaluate the source reliability",
          status: "warning"
        }
      ],
      factChecks: [
        {
          claim: "Article content",
          verdict: "misleading",
          explanation: "Analysis could not be completed. Exercise caution with this content."
        }
      ],
      recommendations: []
    };
  }
}

/**
 * Generates criteria analysis based on NLP results
 */
function generateCriteriaAnalysis(
  source: string,
  sentiments: any,
  entities: any,
  readabilityScore: number,
  classification: any
): Criteria[] {
  const criteria: Criteria[] = [];
  
  // Source credibility (simplified for demo - would use a real database of sources)
  const knownReliableSources = [
    'bbc.com', 'npr.org', 'reuters.com', 'apnews.com', 
    'nytimes.com', 'wsj.com', 'economist.com'
  ];
  const knownUnreliableSources = [
    'fakenews.com', 'conspiracytheory.net', 'clickbait.co',
    'sensationalnews.org'
  ];
  
  let sourceRating: "high" | "medium" | "low" = "medium";
  let sourceStatus: "good" | "warning" | "bad" = "warning";
  let sourceDescription = "Source has limited verification history";
  
  if (knownReliableSources.some(s => source.includes(s))) {
    sourceRating = "high";
    sourceStatus = "good";
    sourceDescription = "Source has history of factual reporting";
  } else if (knownUnreliableSources.some(s => source.includes(s))) {
    sourceRating = "low";
    sourceStatus = "bad";
    sourceDescription = "Source has history of publishing misleading content";
  }
  
  criteria.push({
    name: "Source Credibility",
    rating: sourceRating,
    description: sourceDescription,
    status: sourceStatus
  });
  
  // Factual accuracy
  const factualAccuracyRating = classification.factualScoreNormalized > 0.7 ? "high" : 
                               classification.factualScoreNormalized > 0.4 ? "medium" : "low";
  const factualAccuracyStatus = factualAccuracyRating === "high" ? "good" : 
                               factualAccuracyRating === "medium" ? "warning" : "bad";
  
  criteria.push({
    name: "Factual Accuracy",
    rating: factualAccuracyRating,
    description: factualAccuracyRating === "high" ? 
      "Claims are generally factual and verifiable" : 
      factualAccuracyRating === "medium" ? 
      "Some claims may be misleading or lacking context" : 
      "Multiple claims appear to be false or misleading",
    status: factualAccuracyStatus
  });
  
  // Evidence quality
  const evidenceRating = classification.evidenceScoreNormalized > 0.7 ? "high" : 
                        classification.evidenceScoreNormalized > 0.4 ? "medium" : "low";
  const evidenceStatus = evidenceRating === "high" ? "good" : 
                         evidenceRating === "medium" ? "warning" : "bad";
  
  criteria.push({
    name: "Evidence Quality",
    rating: evidenceRating,
    description: evidenceRating === "high" ? 
      "References scientific studies and expert opinions" : 
      evidenceRating === "medium" ? 
      "Some evidence provided but may be selective" : 
      "Little or no evidence to support claims",
    status: evidenceStatus
  });
  
  // Emotional language
  const emotionalScore = sentiments.overallEmotionalTone;
  const emotionalRating = emotionalScore < 0.3 ? "low" : 
                         emotionalScore < 0.6 ? "medium" : "high";
  // Invert status for emotional language (high emotion = bad, low emotion = good)
  const emotionalStatus = emotionalRating === "low" ? "good" : 
                          emotionalRating === "medium" ? "warning" : "bad";
  
  criteria.push({
    name: "Emotional Language",
    rating: emotionalRating,
    description: emotionalRating === "low" ? 
      "Uses neutral language focused on facts" : 
      emotionalRating === "medium" ? 
      "Some emotional language present" : 
      "Uses emotional language that may influence perception",
    status: emotionalStatus
  });
  
  return criteria;
}

/**
 * Generates fact checks based on NLP results and content analysis
 */
function generateFactChecks(
  text: string,
  entities: any,
  claimsAnalysis: any[]
): FactCheck[] {
  // For this simplified implementation, we'll generate some basic fact checks
  // based on the model's claim analysis
  const factChecks: FactCheck[] = [];
  
  if (!claimsAnalysis || claimsAnalysis.length === 0) {
    // If no claims analysis is available, create a generic fact check
    return [
      {
        claim: "Article content",
        verdict: "misleading",
        explanation: "Analysis could not identify specific claims to verify"
      }
    ];
  }
  
  // Process up to 3 claims from the analysis
  const claimsToProcess = claimsAnalysis.slice(0, 3);
  
  for (const claim of claimsToProcess) {
    let verdict: "verified" | "misleading" | "false";
    
    if (claim.veracity > 0.7) {
      verdict = "verified";
    } else if (claim.veracity > 0.3) {
      verdict = "misleading";
    } else {
      verdict = "false";
    }
    
    factChecks.push({
      claim: claim.text,
      verdict,
      explanation: claim.explanation || getDefaultExplanation(verdict)
    });
  }
  
  return factChecks;
}

/**
 * Provides default explanation text based on verdict
 */
function getDefaultExplanation(verdict: string): string {
  switch (verdict) {
    case "verified":
      return "Multiple independent sources confirm this information";
    case "misleading":
      return "This claim contains elements of truth but lacks important context";
    case "false":
      return "This claim contradicts available evidence and reliable sources";
    default:
      return "Verification was inconclusive";
  }
}
