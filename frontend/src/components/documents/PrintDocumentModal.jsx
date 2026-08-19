import { useState } from 'react'
import { X, Printer, Download } from 'lucide-react'
import { downloadInvoicePdf, printDocument } from '@/utils/documents'

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
        <div className="no-print flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePdf}
              disabled={!invoice || downloading}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? 'Downloading…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={printDocument}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-2 print:p-0">{children}</div>
      </div>
    </div>
  )
}
