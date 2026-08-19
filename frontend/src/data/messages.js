export const SEED_THREADS = [
  {
    id: 1,
    propertyId: 1,
    tenantEmail: 'demo@tenant.com',
    tenantName: 'Demo Tenant',
    landlord: 'Sok Dara',
    messages: [
      {
        id: 1,
        fromEmail: 'demo@tenant.com',
        fromRole: 'tenant',
        text: 'Hi, is the BKK1 apartment still available for a 12-month lease?',
        createdAt: '2026-08-10T09:12:00.000Z',
      },
      {
        id: 2,
        fromEmail: 'sokdara@prs.demo',
        fromRole: 'landlord',
        text: 'Yes it is. I can show you this week — weekday evenings work best.',
        createdAt: '2026-08-10T09:40:00.000Z',
      },
    ],
  },
  {
    id: 2,
    propertyId: 6,
    tenantEmail: 'demo@tenant.com',
    tenantName: 'Demo Tenant',
    landlord: 'Heng Bopha',
    messages: [
      {
        id: 1,
        fromEmail: 'heng_bopha@prs.demo',
        fromRole: 'landlord',
        text: 'Thanks for the viewing request. Otres is free Saturday at 10:00 if that still works.',
        createdAt: '2026-08-12T03:20:00.000Z',
      },
      {
        id: 2,
        fromEmail: 'demo@tenant.com',
        fromRole: 'tenant',
        text: 'Saturday 10:00 is perfect. See you there.',
        createdAt: '2026-08-12T04:01:00.000Z',
      },
    ],
  },
]
