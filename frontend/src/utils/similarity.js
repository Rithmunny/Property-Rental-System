export function scoreSimilarity(target, candidate) {
  if (target.id === candidate.id) return -1
  let score = 0
  if (target.city === candidate.city) score += 3
  if (target.neighbourhood && target.neighbourhood === candidate.neighbourhood) score += 4
  if (target.type === candidate.type) score += 2
  if (Math.abs((target.bedrooms || 0) - (candidate.bedrooms || 0)) <= 1) score += 2
  const priceDiff = Math.abs((target.price || 0) - (candidate.price || 0))
  if (priceDiff <= 100) score += 2
  else if (priceDiff <= 250) score += 1

  const targetAmenities = new Set(target.amenities || [])
  const overlap = (candidate.amenities || []).filter((a) => targetAmenities.has(a)).length
  score += Math.min(overlap, 3)

  return score
}
