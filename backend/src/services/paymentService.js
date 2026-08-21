import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
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
  if (role === 'admin') {
    if (user.role !== 'admin') throw new HttpError(403, 'Admin only')
    return adminPayments()
  }
  if (role === 'landlord') {
    if (user.role !== 'landlord' && user.role !== 'admin') throw new HttpError(403, 'Landlord only')
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
