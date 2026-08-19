export function invoiceNumber({ id, date }) {
  const stamp = String(date || '').replace(/-/g, '').slice(0, 8) || '00000000'
  return `INV-${stamp}-${id ?? 1}`
}

export function money(amount) {
  const n = Number(amount) || 0
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function downloadCsv(filename, rows) {
  const escape = (value) => {
    const text = value == null ? '' : String(value)
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }
  const csv = rows.map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function printDocument() {
  document.body.classList.add('printing')
  const restore = () => {
    document.body.classList.remove('printing')
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
  setTimeout(restore, 500)
}

const FOREST = [31, 46, 36]
const GRAY = [90, 90, 90]
const LINE = [220, 220, 220]

async function loadLogoDataUrl() {
  try {
    const res = await fetch('/logo.png')
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function createPdf() {
  const { jsPDF } = await import('jspdf')
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
}

export async function downloadInvoicePdf(invoice) {
  if (!invoice) return
  const pdf = await createPdf()
  const number = invoice.number || invoiceNumber({ id: invoice.id, date: invoice.issueDate })
  const items = invoice.items?.length
    ? invoice.items
    : [{ description: `Monthly rent — ${invoice.period}`, amount: invoice.amount }]
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const paid = invoice.status === 'paid'
  const logo = await loadLogoDataUrl()

  pdf.setFillColor(...FOREST)
  pdf.rect(0, 0, 210, 28, 'F')
  if (logo) pdf.addImage(logo, 'PNG', 12, 5, 16, 16)
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text('PRS', logo ? 32 : 14, 13)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text('Property Rental System  ·  Phnom Penh, Cambodia', logo ? 32 : 14, 20)

  pdf.setTextColor(...FOREST)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('RENTAL INVOICE', 196, 42, { align: 'right' })
  pdf.setFontSize(10)
  pdf.text(number, 196, 48, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...GRAY)
  pdf.text(`Issued ${invoice.issueDate || '—'}`, 196, 54, { align: 'right' })
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(paid ? 21 : 180, paid ? 128 : 83, paid ? 61 : 9)
  pdf.text(paid ? 'PAID' : 'DUE', 196, 61, { align: 'right' })

  pdf.setTextColor(...GRAY)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('FROM (LANDLORD)', 14, 72)
  pdf.text('BILL TO (TENANT)', 110, 72)
  pdf.setTextColor(20, 20, 20)
  pdf.setFontSize(11)
  pdf.text(invoice.landlord || 'Landlord', 14, 79)
  pdf.text(invoice.tenant || 'Tenant', 110, 79)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(...GRAY)
  if (invoice.landlordContact) pdf.text(String(invoice.landlordContact), 14, 85)
  if (invoice.tenantContact) pdf.text(String(invoice.tenantContact), 110, 85)

  pdf.setFillColor(246, 245, 240)
  pdf.roundedRect(14, 94, 182, 22, 2, 2, 'F')
  pdf.setTextColor(...FOREST)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(invoice.propertyTitle || 'Rental property', 18, 103)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...GRAY)
  pdf.setFontSize(9)
  pdf.text(invoice.propertyAddress || '', 18, 109)
  pdf.text(`Rental period: ${invoice.period || '—'}`, 18, 115)

  let y = 128
  pdf.setDrawColor(...LINE)
  pdf.line(14, y, 196, y)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(...GRAY)
  pdf.text('DESCRIPTION', 14, y + 6)
  pdf.text('AMOUNT', 196, y + 6, { align: 'right' })
  y += 12
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(30, 30, 30)
  pdf.setFontSize(10)
  items.forEach((item) => {
    pdf.text(item.description || 'Rent', 14, y)
    pdf.text(money(item.amount), 196, y, { align: 'right' })
    y += 8
  })
  pdf.setDrawColor(...LINE)
  pdf.line(14, y, 196, y)
  y += 10
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.setTextColor(...FOREST)
  pdf.text('Total', 140, y)
  pdf.text(money(total), 196, y, { align: 'right' })

  y += 16
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(...GRAY)
  pdf.text(`Payment method: ${invoice.method === 'cash' ? 'Cash' : 'ABA QR'}`, 14, y)
  if (invoice.paidDate) pdf.text(`Paid on: ${invoice.paidDate}`, 110, y)

  pdf.setFontSize(8)
  pdf.text(
    'This rental invoice was generated by PRS for record-keeping. Contact the landlord listed above with questions.',
    14,
    280,
    { maxWidth: 182 },
  )

  pdf.save(`${number}.pdf`)
}

export async function downloadLandlordSheetPdf({ landlord, rows, totals }) {
  const pdf = await createPdf()
  const logo = await loadLogoDataUrl()
  const prepared = new Date().toLocaleDateString()

  pdf.setFillColor(...FOREST)
  pdf.rect(0, 0, 210, 26, 'F')
  if (logo) pdf.addImage(logo, 'PNG', 12, 5, 14, 14)
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('PRS landlord sheet', logo ? 30 : 14, 12)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.text(`Prepared ${prepared}  ·  ${landlord || 'Landlord'}`, logo ? 30 : 14, 18)

  pdf.setTextColor(...FOREST)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text(`Monthly rent  ${money(totals.rent)}`, 14, 36)
  pdf.text(`Deposits  ${money(totals.deposit)}`, 70, 36)
  pdf.text(`Paid  ${totals.paid}`, 126, 36)
  pdf.text(`Pending  ${totals.pending}`, 160, 36)

  const headers = ['Tenant', 'Property', 'Rent', 'Deposit', 'Status', 'Due']
  const colX = [14, 52, 108, 128, 150, 172]
  let y = 46
  pdf.setFillColor(246, 245, 240)
  pdf.rect(14, y - 5, 182, 8, 'F')
  pdf.setFontSize(8)
  pdf.setTextColor(...GRAY)
  headers.forEach((h, i) => pdf.text(h.toUpperCase(), colX[i], y))
  y += 8

  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(30, 30, 30)
  ;(rows || []).forEach((row) => {
    if (y > 275) {
      pdf.addPage()
      y = 20
    }
    const tenant = row.tenant?.name || '—'
    const property = row.property?.title || '—'
    pdf.text(String(tenant).slice(0, 22), colX[0], y)
    pdf.text(String(property).slice(0, 28), colX[1], y)
    pdf.text(money(row.tenant?.rent), colX[2], y)
    pdf.text(row.contract ? money(row.contract.deposit) : '—', colX[3], y)
    pdf.text(row.tenant?.status === 'paid' ? 'Paid' : 'Pending', colX[4], y)
    pdf.text(row.reminder?.dueDate || '—', colX[5], y)
    y += 7
  })

  pdf.save(`prs-landlord-sheet-${new Date().toISOString().slice(0, 10)}.pdf`)
}
