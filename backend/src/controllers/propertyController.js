import * as propertyService from '../services/propertyService.js'

export async function list(req, res) {
  res.json(await propertyService.listProperties(req.user))
}

export async function get(req, res) {
  res.json(await propertyService.getProperty(req.params.id, req.user))
}

export async function create(req, res) {
  res.status(201).json(await propertyService.createProperty(req.user, req.body || {}))
}

export async function update(req, res) {
  res.json(await propertyService.updateProperty(req.user, req.params.id, req.body || {}))
}

export async function remove(req, res) {
  res.json(await propertyService.deleteProperty(req.user, req.params.id))
}
