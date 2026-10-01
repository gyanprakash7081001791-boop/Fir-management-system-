import { INITIAL_CATEGORIES } from '../data/initialData';
import { FIR } from '../types';

export interface AIClassificationResult {
  category: string;
  confidence: number;
  ipcSection: string;
  bnsSection: string;
  severity: string;
  matchedKeywords: string[];
  disclaimer: string;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarityScore: number;
  matchedFir: {
    id: number;
    firNumber: string;
    incidentLocation: string;
    categoryName: string;
  } | null;
}

/**
 * Clean text for NLP vectorization & term weighting
 */
function cleanText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

/**
 * Predict Crime Category based on incident description
 */
export function classifyIncidentLive(description: string): AIClassificationResult {
  if (!description || description.trim().length < 10) {
    const defaultCat = INITIAL_CATEGORIES[0];
    return {
      category: defaultCat.name,
      confidence: 50.0,
      ipcSection: defaultCat.ipcSection,
      bnsSection: defaultCat.bnsSection,
      severity: defaultCat.severity,
      matchedKeywords: [],
      disclaimer: 'AI recommendations are for decision support only. Investigating Officer retains statutory authority to alter penal sections.'
    };
  }

  const words = cleanText(description);
  const wordSet = new Set(words);
  let bestScore = -1;
  let bestCategory = INITIAL_CATEGORIES[0];
  let bestMatches: string[] = [];

  for (const cat of INITIAL_CATEGORIES) {
    let score = 0;
    const matches: string[] = [];
    for (const kw of cat.keywords) {
      if (wordSet.has(kw) || description.toLowerCase().includes(kw)) {
        score += 2;
        matches.push(kw);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
      bestMatches = matches;
    }
  }

  // Calculate normalized confidence score
  let confidence = 70.0;
  if (bestScore > 0) {
    confidence = Math.min(98.5, 75.0 + bestScore * 5.5);
  }

  return {
    category: bestCategory.name,
    confidence: Number(confidence.toFixed(1)),
    ipcSection: bestCategory.ipcSection,
    bnsSection: bestCategory.bnsSection,
    severity: bestCategory.severity,
    matchedKeywords: bestMatches,
    disclaimer: 'AI recommendations are for decision support only. Investigating Officer retains statutory authority to alter penal sections.'
  };
}

/**
 * Detect Duplicate or Highly Similar FIRs using Cosine Similarity on word frequency vectors
 */
export function detectDuplicateFIR(
  newDescription: string,
  existingFirs: FIR[],
  threshold = 40.0
): DuplicateDetectionResult {
  if (!newDescription || newDescription.trim().length < 15 || !existingFirs.length) {
    return { isDuplicate: false, similarityScore: 0, matchedFir: null };
  }

  const newWords = cleanText(newDescription);
  if (!newWords.length) {
    return { isDuplicate: false, similarityScore: 0, matchedFir: null };
  }

  // Build term frequency map for query
  const queryTf: Record<string, number> = {};
  for (const w of newWords) {
    queryTf[w] = (queryTf[w] || 0) + 1;
  }

  let highestScore = 0;
  let matchedFir: FIR | null = null;

  for (const fir of existingFirs) {
    const docWords = cleanText(fir.incidentDescription);
    if (!docWords.length) continue;

    const docTf: Record<string, number> = {};
    for (const w of docWords) {
      docTf[w] = (docTf[w] || 0) + 1;
    }

    // Compute dot product and magnitudes
    let dotProduct = 0;
    let queryMag = 0;
    let docMag = 0;

    const allKeys = new Set([...Object.keys(queryTf), ...Object.keys(docTf)]);
    for (const key of allKeys) {
      const qVal = queryTf[key] || 0;
      const dVal = docTf[key] || 0;
      dotProduct += qVal * dVal;
      queryMag += qVal * qVal;
      docMag += dVal * dVal;
    }

    const similarity = (Math.sqrt(queryMag) * Math.sqrt(docMag)) === 0 
      ? 0 
      : (dotProduct / (Math.sqrt(queryMag) * Math.sqrt(docMag))) * 100;

    if (similarity > highestScore) {
      highestScore = similarity;
      matchedFir = fir;
    }
  }

  const roundedScore = Number(highestScore.toFixed(1));
  const isDuplicate = roundedScore >= threshold && matchedFir !== null;

  return {
    isDuplicate,
    similarityScore: roundedScore,
    matchedFir: isDuplicate && matchedFir ? {
      id: matchedFir.id,
      firNumber: matchedFir.firNumber,
      incidentLocation: matchedFir.incidentLocation,
      categoryName: matchedFir.categoryName
    } : null
  };
}
