import { toDateString, computeContractStatus } from '../utils/dates.js'

export function toRequestDto(request) {
  return {
    id: request.id,
    propertyId: request.propertyId,
    tenantEmail: request.tenant?.email || request.tenantEmail,
    tenantName: request.tenant?.name || request.tenantName,
    landlord: request.property?.landlordUser?.name || request.landlord,
    kind: request.kind === 'viewing' ? 'viewing' : 'rent',
    status: request.status,
    requestedDate: toDateString(request.requestedDate),
    ...(request.kind === 'viewing'
      ? {
          viewingDate: toDateString(request.viewingDate) || toDateString(request.requestedDate),
          viewingTime: request.viewingTime || '10:00',
          note: request.note || '',
        }
      : {}),
  }
}

export function toContractDto(contract) {
  return {
    id: contract.id,
    propertyId: contract.propertyId,
    tenant: contract.tenant?.name || contract.tenantName,
    startDate: toDateString(contract.startDate),
    endDate: toDateString(contract.endDate),
    rent: contract.rent,
    deposit: contract.deposit,
    status: computeContractStatus(contract.startDate, contract.endDate, contract.status),
  }
}

export function toCurrentRentalDto(contract) {
  if (!contract) return null
  return {
    propertyId: contract.propertyId,
    landlord: contract.property?.landlordUser?.name || '',
    landlordTelegram: contract.property?.landlordUser?.telegram || contract.property?.telegram || '',
    abaQrImage: contract.property?.landlordUser?.abaQrImage || '',
    startDate: toDateString(contract.startDate),
    endDate: toDateString(contract.endDate),
    rent: contract.rent,
    deposit: contract.deposit,
    paymentMethod: contract.paymentMethod || 'aba',
  }
}

export const requestInclude = {
  tenant: { select: { id: true, name: true, email: true } },
  property: { include: { landlordUser: { select: { id: true, name: true } } } },
}

export const contractInclude = {
  tenant: { select: { id: true, name: true, email: true, telegram: true } },
  property: {
    include: { landlordUser: { select: { id: true, name: true, telegram: true, abaQrImage: true } } },
  },
  payments: { orderBy: { date: 'desc' } },
}
