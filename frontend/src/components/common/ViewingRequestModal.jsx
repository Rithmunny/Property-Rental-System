import { useState } from 'react'
import { X } from 'lucide-react'
import { VIEWING_TIME_SLOTS } from '@/utils/listing'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function ViewingRequestModal({ open, onClose, onSubmit, pending }) {
  const [viewingDate, setViewingDate] = useState(todayIso())
  const [viewingTime, setViewingTime] = useState('10:00')
  const [note, setNote] = useState('')

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ viewingDate, viewingTime, note })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Request a viewing</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Date
            <input
              type="date"
              min={todayIso()}
              value={viewingDate}
              onChange={(e) => setViewingDate(e.target.value)}
              required
              className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Time
            <select
              value={viewingTime}
              onChange={(e) => setViewingTime(e.target.value)}
              className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
            >
              {VIEWING_TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Note (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything the landlord should know"
              className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
            >
              {pending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
