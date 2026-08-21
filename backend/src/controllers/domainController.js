import * as reviewService from '../services/reviewService.js'
import * as requestService from '../services/requestService.js'
import * as rentalService from '../services/rentalService.js'
import * as savedService from '../services/savedService.js'
import * as paymentService from '../services/paymentService.js'
import * as messageService from '../services/messageService.js'
import * as adminService from '../services/adminService.js'

export const reviews = {
  list: async (req, res) => res.json(await reviewService.listReviews(req.query.propertyId)),
  create: async (req, res) =>
    res.status(201).json(await reviewService.createReview(req.user, req.body || {})),
}

export const requests = {
  create: async (req, res) =>
    res.status(201).json(await requestService.createRequest(req.user, req.body || {})),
  mine: async (req, res) => res.json(await requestService.listMyRequests(req.user)),
  inbox: async (req, res) => res.json(await requestService.listInboxRequests(req.user)),
  update: async (req, res) =>
    res.json(await requestService.updateRequestStatus(req.user, req.params.id, req.body?.status)),
}

export const rentals = {
  current: async (req, res) => res.json(await rentalService.getCurrentRental(req.user)),
  listContracts: async (req, res) => res.json(await rentalService.listContracts(req.user)),
  createContract: async (req, res) =>
    res.status(201).json(await rentalService.createContract(req.user, req.body || {})),
}

export const saved = {
  list: async (req, res) => res.json(await savedService.listSaved(req.user)),
  toggle: async (req, res) => res.json(await savedService.toggleSaved(req.user, req.params.propertyId)),
  isSaved: async (req, res) => res.json(await savedService.isSaved(req.user, req.params.propertyId)),
}

export const savedSearches = {
  list: async (req, res) => res.json(await savedService.listSavedSearches(req.user)),
  create: async (req, res) =>
    res.status(201).json(await savedService.createSavedSearch(req.user, req.body?.filters || {})),
  remove: async (req, res) => res.json(await savedService.deleteSavedSearch(req.user, req.params.id)),
  markSeen: async (req, res) =>
    res.json(await savedService.markSavedSearchSeen(req.user, req.params.id)),
}

export const payments = {
  get: async (req, res) => res.json(await paymentService.getPayments(req.user, req.query.role)),
  markPaid: async (req, res) =>
    res.json(await paymentService.markPaymentPaid(req.user, req.body || {})),
}

export const messages = {
  list: async (req, res) => res.json(await messageService.listThreads(req.user)),
  send: async (req, res) =>
    res.status(201).json(await messageService.sendMessage(req.user, req.body || {})),
}

export const admin = {
  landlords: async (req, res) => res.json(await adminService.listLandlords()),
  tenants: async (req, res) => res.json(await adminService.listTenants()),
  updateLandlord: async (req, res) =>
    res.json(await adminService.updateLandlordStatus(req.params.id, req.body?.status)),
}
