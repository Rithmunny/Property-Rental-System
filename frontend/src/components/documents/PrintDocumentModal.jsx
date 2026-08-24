import { useState } from 'react'
import { Printer, Download, X } from 'lucide-react'
import { downloadInvoicePdf, printDocument } from '@/utils/documents'
import { Button } from '@/components/ui/button'

export default function PrintDocumentModal({ open, title, onClose, children, invoice }) {
  const [downloading, setDownloading] = useState(false)

  if (!open) return null

  const handlePdf = async () => {
    if (!invoice) return
    setDownloading(true)
    try {
      await downloadInvoicePdf(invoice)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 print:static print:bg-white print:p-0">
      <div className="my-6 w-full max-w-[860px] rounded-2xl bg-white shadow-xl print:my-0 print:max-w-none print:rounded-none print:shadow-none">
        <div className="no-print flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePdf}
              disabled={!invoice || downloading}
            >
              <Download />
              {downloading ? 'Downloading…' : 'Download PDF'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={printDocument}>
              <Printer />
              Print
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
              <X />
            </Button>
          </div>
        </div>
        <div className="p-2 print:p-0">{children}</div>
      </div>
    </div>
  )
}
