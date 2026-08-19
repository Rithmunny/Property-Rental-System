import { useState } from 'react'
import { VIEWING_TIME_SLOTS } from '@/utils/listing'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function ViewingRequestModal({ open, onClose, onSubmit, pending }) {
  const [viewingDate, setViewingDate] = useState(todayIso())
  const [viewingTime, setViewingTime] = useState('10:00')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ viewingDate, viewingTime, note })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
        <DialogHeader className="px-6 pt-6 pr-12">
          <DialogTitle className="text-lg font-semibold">Request a viewing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viewingDate">Date</Label>
              <Input
                id="viewingDate"
                type="date"
                min={todayIso()}
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viewingTime">Time</Label>
              <Select value={viewingTime} onValueChange={setViewingTime}>
                <SelectTrigger id="viewingTime" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[70]">
                  {VIEWING_TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="viewingNote">Note (optional)</Label>
              <Textarea
                id="viewingNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Anything the landlord should know"
              />
            </div>
          </div>
          <DialogFooter className="mx-0 mb-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Sending…' : 'Send request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
