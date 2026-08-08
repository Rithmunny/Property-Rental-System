export const CONTRACTS = [
  {
    id: 1,
    propertyId: 1,
    tenant: 'Ratana Chea',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rent: 450,
    deposit: 900,
    status: 'active',
  },
  {
    id: 2,
    propertyId: 2,
    tenant: 'Sophea Meas',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    rent: 280,
    deposit: 280,
    status: 'ending soon',
  },
  {
    id: 3,
    propertyId: 3,
    tenant: 'Vibol Sok',
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    rent: 600,
    deposit: 1200,
    status: 'active',
  },
]

export const TENANTS = [
  {
    id: 1,
    propertyId: 1,
    name: 'Ratana Chea',
    telegram: '@ratana_chea',
    paymentMethod: 'aba',
    status: 'paid',
    rent: 450,
  },
  {
    id: 2,
    propertyId: 2,
    name: 'Sophea Meas',
    telegram: '@sophea_m',
    paymentMethod: 'cash',
    status: 'pending',
    rent: 280,
  },
  {
    id: 3,
    propertyId: 3,
    name: 'Vibol Sok',
    telegram: '@vibol_sok',
    paymentMethod: 'aba',
    status: 'paid',
    rent: 600,
  },
]

export const PAYMENT_REMINDERS = [
  { id: 1, tenant: 'Sophea Meas', property: 'Cozy Studio Near River', dueDate: 'Aug 10', amount: 280 },
  { id: 2, tenant: 'Ratana Chea', property: 'Modern Downtown Apartment', dueDate: 'Sep 1', amount: 450 },
]
