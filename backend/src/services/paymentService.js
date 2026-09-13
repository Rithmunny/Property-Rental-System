import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { isAdmin } from '../utils/roles.js'
import { env } from '../config/env.js'
import { getCurrentRental } from './rentalService.js'
import { toCurrentRentalDto, contractInclude } from '../dto/rental.js'
import { toPaymentHistoryDto } from '../dto/misc.js'
import {
  addMonthsUtc,
  computeContractStatus,
  formatDueLabel,
  formatMonthLabel,
  isSameUtcMonth,
  parseDate,
  parseId,
  todayUtc,
} from '../utils/dates.js'

function withStatus(contract) {
  return { ...contract, status: computeContractStatus(contract.startDate, contract.endDate, contract.status) }
}

function paidThisMonth(contract, now) {
  return (contract.payments || []).some(
    (payment) => payment.status === 'paid' && isSameUtcMonth(payment.date, now),
  )
}

function nextDueDate(now, contract) {
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  if (paidThisMonth(contract, now)) return addMonthsUtc(firstOfMonth, 1)
  return firstOfMonth
}

async function tenantPayments(user) {
  const currentRental = await getCurrentRental(user)
  const contract = await prisma.contract.findFirst({
    where: { tenantId: user.id, propertyId: currentRental?.propertyId || undefined },
    include: contractInclude,
    orderBy: { startDate: 'desc' },
  })
  const now = todayUtc()
  const history = (contract?.payments || []).map(toPaymentHistoryDto)
  const amount = currentRental?.rent ?? contract?.rent ?? 0
  return {
    currentRental,
    nextPayment: currentRental ? { dueDate: formatDueLabel(nextDueDate(now, contract || { payments: [] })), amount } : null,
    history,
  }
}

async function landlordPayments(user) {
  const contracts = await prisma.contract.findMany({
    where: { property: { landlordId: user.id } },
    include: contractInclude,
  })
  const now = todayUtc()
  const tenants = contracts.map((contract) => {
    const live = withStatus(contract)
    return {
      id: contract.id,
      propertyId: contract.propertyId,
      name: contract.tenant?.name,
      telegram: contract.tenant?.telegram || '',
      paymentMethod: contract.paymentMethod || 'aba',
      status: paidThisMonth(contract, now) ? 'paid' : 'pending',
      rent: contract.rent,
      contractStatus: live.status,
    }
  })
  const reminders = tenants
    .filter((tenant) => tenant.status === 'pending' && tenant.contractStatus !== 'expired')
    .map((tenant) => {
      const contract = contracts.find((row) => row.id === tenant.id)
      return {
        id: tenant.id,
        tenant: tenant.name,
        property: contract?.property?.title || '',
        dueDate: formatDueLabel(nextDueDate(now, contract)),
        amount: tenant.rent,
      }
    })
  return { reminders, tenants }
}

async function adminPayments() {
  const [payments, contracts] = await Promise.all([
    prisma.payment.findMany({ where: { status: 'paid' } }),
    prisma.contract.findMany({ include: { payments: true } }),
  ])
  const now = todayUtc()
  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const pendingCount = contracts.filter((contract) => {
    const live = withStatus(contract)
    return live.status !== 'expired' && !paidThisMonth(contract, now)
  }).length
  const aba = payments.filter((payment) => payment.method === 'aba').length
  const cash = payments.filter((payment) => payment.method === 'cash').length
  const total = aba + cash
  return {
    totalCollected,
    pendingCount,
    methods: {
      aba: total ? Math.round((aba / total) * 100) : 0,
      cash: total ? Math.round((cash / total) * 100) : 0,
    },
  }
}

export async function getPayments(user, roleQuery) {
  const role = roleQuery || user.role
  if (role === 'admin' || role === 'super_admin') {
    if (!isAdmin(user.role)) throw new HttpError(403, 'Admin only')
    return adminPayments()
  }
  if (role === 'landlord') {
    if (user.role !== 'landlord' && !isAdmin(user.role)) throw new HttpError(403, 'Landlord only')
    return landlordPayments(user)
  }
  return tenantPayments(user)
}

export async function markPaymentPaid(user, payload = {}) {
  if (user.role !== 'tenant') throw new HttpError(403, 'Only tenants can mark rent paid')
  const currentRental = await getCurrentRental(user)
  if (!currentRental) throw new HttpError(400, 'No current rental')
  const contract = await prisma.contract.findFirst({
    where: { tenantId: user.id, propertyId: currentRental.propertyId },
    include: contractInclude,
  })
  if (!contract) throw new HttpError(400, 'No current rental')

  const paidDate = parseDate(payload.date) || todayUtc()
  const amount = Number(payload.amount) || currentRental.rent || contract.rent
  await prisma.payment.create({
    data: {
      contractId: contract.id,
      amount,
      method: 'aba',
      status: 'paid',
      month: payload.month || formatMonthLabel(paidDate),
      date: paidDate,
    },
  })
  return tenantPayments(user)
}

// --- Sandbox payment gateway -------------------------------------------
// The demo gateway mimics a hosted checkout (ABA PayWay style) without
// touching real money: checkout creates a pending row + reference, and the
// confirm endpoint plays the role of the gateway's success callback.
// NFR-07 holds: no card data is ever stored — references only.
function requireSandbox() {
  if (env.paymentGateway !== 'sandbox') {
    throw new HttpError(501, 'Payment gateway is not in sandbox mode')
  }
}

async function tenantContract(user) {
  const currentRental = await getCurrentRental(user)
  if (!currentRental) throw new HttpError(400, 'No current rental')
  const contract = await prisma.contract.findFirst({
    where: { tenantId: user.id, propertyId: currentRental.propertyId },
    include: contractInclude,
    orderBy: { startDate: 'desc' },
  })
  if (!contract) throw new HttpError(400, 'No current rental')
  return contract
}

export async function createSandboxCheckout(user) {
  requireSandbox()
  if (user.role !== 'tenant') throw new HttpError(403, 'Only tenants can pay rent')
  const contract = await tenantContract(user)
  const now = todayUtc()
  if (paidThisMonth(contract, now)) {
    throw new HttpError(409, "This month's rent is already paid")
  }
  const month = formatMonthLabel(now)
  let payment = await prisma.payment.findFirst({
    where: { contractId: contract.id, status: 'pending', month },
  })
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        contractId: contract.id,
        amount: contract.rent,
        method: 'aba',
        status: 'pending',
        month,
        date: now,
      },
    })
  }
  return {
    paymentId: payment.id,
    reference: `PRS-SBX-${payment.id}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    amount: payment.amount,
    method: payment.method,
    month: payment.month,
    status: payment.status,
    qrImage: contract.property?.landlordUser?.abaQrImage || '',
    landlord: contract.property?.landlordUser?.name || '',
    sandbox: true,
  }
}

export async function confirmSandboxCheckout(user, paymentId) {
  requireSandbox()
  if (user.role !== 'tenant') throw new HttpError(403, 'Only tenants can confirm payments')
  const id = parseId(paymentId)
  if (!id) throw new HttpError(404, 'Payment not found')
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { contract: { select: { tenantId: true } } },
  })
  if (!payment) throw new HttpError(404, 'Payment not found')
  if (payment.contract.tenantId !== user.id) {
    throw new HttpError(403, 'You cannot confirm this payment')
  }
  const alreadyPaid = payment.status === 'paid'
  if (!alreadyPaid) {
    await prisma.payment.update({ where: { id }, data: { status: 'paid', date: todayUtc() } })
  }
  const data = await tenantPayments(user)
  return {
    ...data,
    receipt: {
      paymentId: id,
      reference: `PRS-SBX-${id}`,
      amount: payment.amount,
      month: payment.month,
      date: todayUtc().toISOString().slice(0, 10),
      alreadyPaid,
    },
  }
}
