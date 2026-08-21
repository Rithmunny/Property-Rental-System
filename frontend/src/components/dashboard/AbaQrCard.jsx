import { useEffect, useRef, useState } from 'react'
import { ImagePlus, QrCode, X } from 'lucide-react'
import * as settingsApi from '@/api/settings'
import { useToast } from '@/context/ToastContext'
import { readImageFile } from '@/utils/image'
import { Button } from '@/components/ui/button'

export default function AbaQrCard() {
  const { showToast } = useToast()
  const inputRef = useRef(null)
  const [qr, setQr] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    settingsApi
      .getSettings()
      .then((data) => setQr(data.abaQrImage || ''))
      .catch((err) => showToast(err.message || 'Could not load ABA QR'))
      .finally(() => setLoading(false))
  }, [showToast])

  const save = async (next) => {
    setBusy(true)
    try {
      const saved = await settingsApi.saveSettings({ abaQrImage: next })
      setQr(saved.abaQrImage || '')
      showToast(next ? 'ABA QR saved' : 'ABA QR removed')
    } catch (err) {
      showToast(err.message || 'Could not save ABA QR')
    } finally {
      setBusy(false)
    }
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    setBusy(true)
    try {
      await save(await readImageFile(file, { maxEdge: 900, quality: 0.92 }))
    } catch {
      showToast('Could not read that image')
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900">ABA QR</h3>
      <p className="text-sm text-gray-500">
        Upload your ABA KhQR. Tenants see this when they pay rent.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="mt-4">
          {qr ? (
            <div className="relative mx-auto w-full max-w-[220px]">
              <img
                src={qr}
                alt="Your ABA QR code"
                className="aspect-square w-full rounded-2xl border border-gray-200 bg-white object-contain p-2"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute top-2 right-2"
                disabled={busy}
                onClick={() => save('')}
                aria-label="Remove ABA QR"
              >
                <X />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-60"
            >
              <QrCode className="h-8 w-8 text-forest" strokeWidth={1.25} />
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <ImagePlus className="h-4 w-4" />
                {busy ? 'Saving…' : 'Upload ABA QR'}
              </span>
            </button>
          )}

          {qr && (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? 'Saving…' : 'Replace QR'}
            </Button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  )
}
