export const CURRENT_RENTAL = {
  propertyId: 4,
  landlord: 'Kim Sreymom',
  landlordTelegram: '@kim_sreymom',
  startDate: '2026-02-01',
  endDate: '2027-01-31',
  rent: 900,
  deposit: 1800,
  paymentMethod: 'aba',
}

export const NEXT_PAYMENT = { dueDate: 'Aug 1', amount: 900 }

export const PAYMENT_HISTORY = [
  { id: 1, month: 'July 2026', amount: 900, method: 'aba', status: 'paid', date: '2026-07-01' },
  { id: 2, month: 'June 2026', amount: 900, method: 'aba', status: 'paid', date: '2026-06-01' },
  { id: 3, month: 'May 2026', amount: 900, method: 'cash', status: 'paid', date: '2026-05-02' },
]

export const RENTAL_REQUESTS = [
  { id: 1, propertyId: 3, status: 'pending', requestedDate: '2026-07-28' },
  { id: 2, propertyId: 6, status: 'accepted', requestedDate: '2026-07-10' },
]

export const SAVED_PROPERTY_IDS = [1, 2]
