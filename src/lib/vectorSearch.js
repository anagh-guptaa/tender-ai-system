// Semantic Vector Search & RAG Matchmaker Engine for TenderAI
// Generates embeddings via Google Gemini (gemini-embedding-001) and performs
// fast in-browser and Supabase pgvector cosine similarity ranking.

const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) ||
  ''

const EMBEDDING_CACHE_KEY = 'tenderai_vector_embeddings_cache'

// In-memory cache of embeddings to prevent redundant API calls
function getEmbeddingCache() {
  try {
    return JSON.parse(localStorage.getItem(EMBEDDING_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveEmbeddingCache(cache) {
  try {
    localStorage.setItem(EMBEDDING_CACHE_KEY, JSON.stringify(cache))
  } catch (err) {
    console.warn('Embedding cache save warning:', err.message)
  }
}

/**
 * Generate 3072-dimensional embedding using Gemini API with local fallback
 */
export async function getEmbedding(text) {
  if (!text || !text.trim()) return null
  const clean = text.trim().slice(0, 2000)

  const cache = getEmbeddingCache()
  if (cache[clean]) return cache[clean]

  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: clean }] },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.embedding?.values) {
          cache[clean] = data.embedding.values
          saveEmbeddingCache(cache)
          return data.embedding.values
        }
      }
    } catch (err) {
      console.warn('Gemini live embedding call failed, falling back to local semantic vectorizer:', err.message)
    }
  }

  // Graceful deterministic semantic vector fallback (offline/demo resilience)
  const localVec = generateDeterministicVector(clean, 128)
  cache[clean] = localVec
  saveEmbeddingCache(cache)
  return localVec
}

/**
 * Calculate cosine similarity between two numerical vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0
  const len = Math.min(vecA.length, vecB.length)

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Fast deterministic bag-of-words & n-gram vectorizer for offline fallback
 */
function generateDeterministicVector(text, dimensions = 128) {
  const vec = new Array(dimensions).fill(0)
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)

  tokens.forEach((token, idx) => {
    let hash = 0
    for (let c = 0; c < token.length; c++) {
      hash = (hash << 5) - hash + token.charCodeAt(c)
      hash |= 0
    }
    const bucket = Math.abs(hash) % dimensions
    vec[bucket] += 1 / (idx + 1)
  })

  // Normalize to unit vector
  let norm = 0
  for (let i = 0; i < dimensions; i++) norm += vec[i] * vec[i]
  const sqrtNorm = Math.sqrt(norm) || 1
  return vec.map((v) => v / sqrtNorm)
}

/**
 * Perform semantic vector search over a list of tenders
 */
export async function searchTendersSemantic(query, tenders, minScore = 20) {
  if (!query || !query.trim() || !tenders || tenders.length === 0) return tenders

  const queryVec = await getEmbedding(query)
  if (!queryVec) return tenders

  const scoredTenders = await Promise.all(
    tenders.map(async (tender) => {
      // Build rich semantic document for the tender
      const doc = `${tender.title || ''} | ${tender.category || ''} | ${tender.organization || ''} | ${tender.description || ''} | Location: ${tender.location || ''} | Eligibility: ${Array.isArray(tender.eligibility) ? tender.eligibility.join(', ') : ''}`
      const tenderVec = await getEmbedding(doc)
      const rawSim = cosineSimilarity(queryVec, tenderVec)

      // Normalize similarity to a readable percentage (0 to 100)
      const score = Math.max(0, Math.min(100, Math.round(rawSim * 100)))

      return {
        ...tender,
        similarityScore: score,
        isSemanticMatch: score >= minScore,
      }
    })
  )

  // Sort by highest semantic similarity first
  return scoredTenders
    .filter((t) => t.isSemanticMatch)
    .sort((a, b) => b.similarityScore - a.similarityScore)
}

/**
 * RAG Matchmaker: Match a contractor's registered profile against all active tenders
 */
export async function matchContractorProfile(companyProfile, tenders) {
  if (!companyProfile || !tenders || tenders.length === 0) return []

  const profileSummary = `
Contractor Profile:
Name: ${companyProfile.name || 'General Contractor'}
Sectors: ${(companyProfile.sectors || []).join(', ')}
Certifications: ${(companyProfile.certifications || []).join(', ')}
Annual Turnover: ₹${companyProfile.annual_turnover_lakhs || 0} Lakhs
Experience: ${companyProfile.years_experience || 0} years
Registration Type: ${companyProfile.registration_type || 'Private Limited'}
`.trim()

  const profileVec = await getEmbedding(profileSummary)
  if (!profileVec) return []

  const scored = await Promise.all(
    tenders.map(async (tender) => {
      const tenderDoc = `${tender.title} ${tender.category} ${tender.description} ${(tender.eligibility || []).join(' ')}`
      const tenderVec = await getEmbedding(tenderDoc)
      const sim = cosineSimilarity(profileVec, tenderVec)
      const score = Math.max(0, Math.min(100, Math.round(sim * 100)))

      return {
        tender,
        matchScore: score,
      }
    })
  )

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5) // Return top 5 personalized opportunities
}
