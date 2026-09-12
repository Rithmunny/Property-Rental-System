// Mock extensions: POST /api/payments/mark-paid — append ABA payment to tenant history
import { USE_MOCK } from './config'
import { request } from './client'
import { getTenantPayments, getLandlordPayments, appendTenantPayment } from './mockStore'

async function mockGetPayments(role) {
  if (role === 'landlord') return getLandlordPayments()
  if (role === 'admin' || role === 'super_admin') {
    return {
      totalCollected: 12450,
      pendingCount: 3,
      methods: { aba: 72, cash: 28 },
    }
  }
  return getTenantPayments()
}

async function mockMarkPaid({ amount, month, date } = {}) {
  const data = getTenantPayments()
  const rent = amount ?? data.nextPayment?.amount ?? data.currentRental?.rent ?? 0
  const paidDate = date ?? new Date().toISOString().slice(0, 10)
  const paidMonth =
    month ??
    new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  return appendTenantPayment({
    month: paidMonth,
    amount: rent,
    method: 'aba',
    status: 'paid',
    date: paidDate,
  })
}

export async function getPayments(role = 'tenant') {
  if (USE_MOCK) return mockGetPayments(role)
  return request(`/api/payments?role=${role}`)
}

export async function markPaymentPaid(payload = {}) {
  if (USE_MOCK) return mockMarkPaid(payload)
  return request('/api/payments/mark-paid', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Sandbox gateway: checkout creates a pending payment + reference, confirm
// plays the gateway's success callback and returns the refreshed history
// plus a receipt.
function sandboxReference(paymentId) {
  return `PRS-SBX-${paymentId}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function createSandboxCheckout() {
  if (USE_MOCK) {
    const data = getTenantPayments()
    const rent = data.nextPayment?.amount ?? data.currentRental?.rent ?? 0
    return {
      paymentId: Date.now(),
      reference: sandboxReference('mock'),
      amount: rent,
      method: 'aba',
      month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      status: 'pending',
      qrImage: data.currentRental?.abaQrImage || '',
      landlord: data.currentRental?.landlord || '',
      sandbox: true,
    }
  }
  return request('/api/payments/checkout', { method: 'POST' })
}

export async function confirmSandboxCheckout(paymentId) {
  if (USE_MOCK) {
    const data = getTenantPayments()
    const rent = data.nextPayment?.amount ?? data.currentRental?.rent ?? 0
    const next = appendTenantPayment({
      month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      amount: rent,
      method: 'aba',
      status: 'paid',
      date: new Date().toISOString().slice(0, 10),
    })
    return {
      ...next,
      receipt: {
        paymentId,
        reference: `PRS-SBX-${paymentId}`,
        amount: rent,
        date: new Date().toISOString().slice(0, 10),
        alreadyPaid: false,
      },
    }
  }
  return request(`/api/payments/checkout/${paymentId}/confirm`, { method: 'POST' })
}
