/**
 * Comprehensive Search Utility for KALAVIES Jewellery
 * Supports:
 * - Search by Title (name), Description, Detailed Content, Material, Tags, Style, Collection, Category, and SKU
 * - "Any word" search (splits multiple words into tokens)
 * - Jewellery-specific spelling typo and synonym mapping (e.g. nackless -> necklace, earing -> earring, demond -> diamond)
 * - Singular/plural stemming (earring <-> earrings, necklace <-> necklaces)
 * - Relevance ranking to put the best matching titles and in-stock items at the top
 */

export const JEWELLERY_SYNONYM_MAP: Record<string, string[]> = {
  nackless: ['necklace', 'necklaces', 'choker', 'pendant'],
  nacklace: ['necklace', 'necklaces'],
  neckless: ['necklace', 'necklaces', 'choker', 'pendant'],
  necklace: ['necklace', 'necklaces', 'choker', 'pendant', 'haar', 'chain'],
  necklaces: ['necklace', 'necklaces', 'choker', 'pendant', 'haar'],
  chocker: ['choker', 'necklace', 'chokers'],
  choker: ['choker', 'necklace', 'chokers'],
  chokers: ['choker', 'necklace', 'chokers'],
  earing: ['earring', 'earrings', 'jhumka', 'stud', 'studs', 'drops'],
  earings: ['earring', 'earrings', 'jhumka', 'stud', 'studs', 'drops'],
  earring: ['earring', 'earrings', 'jhumka', 'jhumkas', 'stud', 'studs', 'hoops', 'drops'],
  earrings: ['earring', 'earrings', 'jhumka', 'jhumkas', 'stud', 'studs', 'hoops', 'drops'],
  jhumka: ['jhumka', 'jhumkas', 'earring', 'earrings'],
  jhumkas: ['jhumka', 'jhumkas', 'earring', 'earrings'],
  jumka: ['jhumka', 'jhumkas', 'earring'],
  jumkas: ['jhumka', 'jhumkas', 'earring'],
  stud: ['stud', 'studs', 'earring', 'earrings'],
  studs: ['stud', 'studs', 'earring', 'earrings'],
  bangle: ['bangle', 'bangles', 'kada', 'bracelet'],
  bangles: ['bangle', 'bangles', 'kada', 'bracelet'],
  kada: ['kada', 'kadas', 'bangle', 'bangles', 'bracelet'],
  kadas: ['kada', 'kadas', 'bangle', 'bangles', 'bracelet'],
  ring: ['ring', 'rings', 'anguthi'],
  rings: ['ring', 'rings', 'anguthi'],
  pendant: ['pendant', 'pendants', 'locket', 'necklace'],
  pendants: ['pendant', 'pendants', 'locket'],
  pendent: ['pendant', 'pendants', 'locket'],
  demond: ['diamond', 'cz', 'zircon', 'crystal'],
  dimond: ['diamond', 'cz', 'zircon', 'crystal'],
  diamond: ['diamond', 'cz', 'crystal', 'zircon', 'diamonds'],
  diamonds: ['diamond', 'cz', 'crystal', 'zircon'],
  gold: ['gold', 'golden', 'gold plated'],
  golden: ['gold', 'golden', 'gold plated'],
  silver: ['silver', 'oxidised', 'oxidized'],
  oxidised: ['oxidised', 'oxidized', 'silver'],
  oxidized: ['oxidised', 'oxidized', 'silver'],
  oxy: ['oxidised', 'oxidized'],
  chain: ['chain', 'necklace', 'mangalsutra'],
  chains: ['chain', 'chains', 'necklace'],
  mangalsutra: ['mangalsutra', 'chain', 'necklace'],
  anklet: ['anklet', 'anklets', 'payal'],
  anklets: ['anklet', 'anklets', 'payal'],
  payal: ['payal', 'anklet', 'anklets'],
  mohar: ['mohar', 'lotus', 'collection'],
}

/**
 * Extracts and expands search terms from raw query into tokens, stems, and synonyms.
 */
export function extractSearchTokens(rawQuery: string): string[] {
  if (!rawQuery || typeof rawQuery !== 'string') return []

  const clean = rawQuery
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .trim()

  if (!clean) return []

  const tokens = new Set<string>()

  // Always include the full cleaned query if non-empty
  tokens.add(clean)

  // Split into words by whitespace or hyphens
  const words = clean
    .split(/[\s-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2)

  // Filter out noise/stop words unless the entire query is short
  const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'also', 'item', 'piece'])

  for (const word of words) {
    if (STOP_WORDS.has(word) && words.length > 1) continue
    tokens.add(word)

    // Check jewellery synonyms and typo corrections
    if (JEWELLERY_SYNONYM_MAP[word]) {
      JEWELLERY_SYNONYM_MAP[word].forEach((syn) => tokens.add(syn))
    }

    // Singular / Plural stemming
    if (word.endsWith('s') && word.length > 3) {
      const singular = word.slice(0, -1)
      tokens.add(singular)
      if (JEWELLERY_SYNONYM_MAP[singular]) {
        JEWELLERY_SYNONYM_MAP[singular].forEach((syn) => tokens.add(syn))
      }
    } else if (!word.endsWith('s') && word.length >= 3) {
      const plural = `${word}s`
      tokens.add(plural)
      if (JEWELLERY_SYNONYM_MAP[plural]) {
        JEWELLERY_SYNONYM_MAP[plural].forEach((syn) => tokens.add(syn))
      }
    }
  }

  return Array.from(tokens).slice(0, 20) // Limit to 20 search variations for performance
}

/**
 * Builds Prisma OR conditions for comprehensive multi-field, multi-word searching.
 */
export function buildProductSearchWhere(rawQuery: string) {
  const tokens = extractSearchTokens(rawQuery)
  if (tokens.length === 0) return []

  const conditions: any[] = []

  // Clean full phrase
  const cleanFullPhrase = rawQuery.trim()
  if (cleanFullPhrase) {
    conditions.push(
      { name: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { description: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { detailedContent: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { material: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { searchTags: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { style: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { collectionName: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { sku: { contains: cleanFullPhrase, mode: 'insensitive' } },
      { category: { name: { contains: cleanFullPhrase, mode: 'insensitive' } } }
    )
  }

  // Token-level and synonym-level matches across title, description, and keywords
  for (const token of tokens) {
    if (token === cleanFullPhrase.toLowerCase()) continue // already added above

    conditions.push(
      { name: { contains: token, mode: 'insensitive' } },
      { description: { contains: token, mode: 'insensitive' } },
      { detailedContent: { contains: token, mode: 'insensitive' } },
      { searchTags: { contains: token, mode: 'insensitive' } },
      { material: { contains: token, mode: 'insensitive' } },
      { style: { contains: token, mode: 'insensitive' } },
      { collectionName: { contains: token, mode: 'insensitive' } },
      { sku: { contains: token, mode: 'insensitive' } },
      { category: { name: { contains: token, mode: 'insensitive' } } }
    )
  }

  return conditions
}

/**
 * Calculates a search relevance score for a product given a user query.
 * Higher score = more relevant.
 */
export function calculateRelevanceScore(product: any, rawQuery: string): number {
  if (!rawQuery) return 0

  const queryLower = rawQuery.toLowerCase().trim()
  const nameLower = (product.name || '').toLowerCase()
  const descLower = (product.description || '').toLowerCase()
  const detailLower = (product.detailedContent || '').toLowerCase()
  const tagsLower = (product.searchTags || '').toLowerCase()
  const matLower = (product.material || '').toLowerCase()
  const catLower = (product.category?.name || '').toLowerCase()

  let score = 0

  // 1. Exact title matches
  if (nameLower === queryLower) score += 200
  else if (nameLower.startsWith(queryLower)) score += 120
  else if (nameLower.includes(queryLower)) score += 80

  // 2. Exact description & category matches
  if (descLower.includes(queryLower)) score += 40
  if (tagsLower.includes(queryLower)) score += 35
  if (catLower.includes(queryLower)) score += 30
  if (matLower.includes(queryLower)) score += 25
  if (detailLower.includes(queryLower)) score += 20

  // 3. Individual word matches in title and description
  const words = queryLower.split(/[\s-]+/).filter((w) => w.length >= 2)
  let wordsInTitle = 0
  let wordsInDesc = 0

  for (const w of words) {
    if (nameLower.includes(w)) {
      score += 25
      wordsInTitle++
    }
    if (descLower.includes(w) || detailLower.includes(w)) {
      score += 15
      wordsInDesc++
    }
    if (tagsLower.includes(w) || matLower.includes(w) || catLower.includes(w)) {
      score += 10
    }
  }

  // Bonus if all query words appear in the title
  if (words.length > 1 && wordsInTitle === words.length) {
    score += 50
  }

  // Bonus for in-stock items so customers see available items first
  if ((product.totalStock ?? 0) > 0) {
    score += 5
  }

  return score
}

/**
 * Sorts products by relevance score when the user hasn't explicitly chosen another sort order.
 */
export function rankProductsByRelevance<T extends Record<string, any>>(products: T[], rawQuery: string): T[] {
  if (!rawQuery.trim() || products.length <= 1) return products

  return [...products].sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, rawQuery)
    const scoreB = calculateRelevanceScore(b, rawQuery)
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }
    // Tie-breaker: creation date or stock
    return (b.totalStock ?? 0) - (a.totalStock ?? 0)
  })
}
