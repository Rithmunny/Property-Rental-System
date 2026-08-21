import * as authService from '../services/authService.js'

export async function register(req, res) {
  res.status(201).json(await authService.register(req.body || {}))
}

export async function login(req, res) {
  res.json(await authService.login(req.body || {}))
}

export async function logout(req, res) {
  void req
  res.json({ ok: true })
}

export async function me(req, res) {
  res.json(authService.me(req.user))
}

export async function updateProfile(req, res) {
  res.json(await authService.updateProfile(req.user, req.body || {}))
}

export async function changePassword(req, res) {
  res.json(await authService.changePassword(req.user, req.body || {}))
}

export async function getSettings(req, res) {
  res.json(authService.getSettings(req.user))
}

export async function saveSettings(req, res) {
  res.json(await authService.saveSettings(req.user, req.body || {}))
}
