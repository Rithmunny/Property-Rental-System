import * as aiService from '../services/aiService.js'

export async function status(req, res) {
  res.json(aiService.getAiStatus())
}

export async function parseSearch(req, res) {
  const { query } = req.body || {}
  const result = await aiService.parseNaturalSearch(query)
  res.json(result)
}

export async function generateDescription(req, res) {
  const result = await aiService.generateDescription(req.body || {})
  res.json(result)
}

export async function similar(req, res) {
  const limit = Math.min(Number(req.query.limit) || 4, 8)
  const result = await aiService.getSimilarProperties(req.params.propertyId, limit)
  res.json(result)
}

export async function chat(req, res) {
  const { messages } = req.body || {}
  const result = await aiService.chatAssistant(messages)
  res.json(result)
}

export async function suggestReply(req, res) {
  const { role, propertyTitle, messages } = req.body || {}
  const result = await aiService.suggestMessageReply({ role, propertyTitle, messages })
  res.json(result)
}
