export function averageRating(reviews) {
  if (!reviews?.length) return 0
  const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0)
  return Math.round((sum / reviews.length) * 100) / 100
}

export function toReviewDto(review) {
  return {
    id: review.id,
    propertyId: review.propertyId,
    tenantEmail: review.tenantEmail,
    tenantName: review.tenantName,
    rating: review.rating,
    comment: review.comment || '',
    createdAt: typeof review.createdAt === 'string'
      ? review.createdAt.slice(0, 10)
      : review.createdAt.toISOString().slice(0, 10),
  }
}
