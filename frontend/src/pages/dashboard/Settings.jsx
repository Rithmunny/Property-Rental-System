import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import * as settingsApi from '@/api/settings'
import PageHeader from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function Settings() {
  const { user, updateProfile, refreshSession } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [notifyListings, setNotifyListings] = useState(true)
  const [notifyRequests, setNotifyRequests] = useState(true)
  const [notifyPayments, setNotifyPayments] = useState(true)
  const [preferredContact, setPreferredContact] = useState('telegram')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
  }, [user?.name])

  useEffect(() => {
    settingsApi
      .getSettings()
      .then((data) => {
        setPhone(data.phone || '')
        setTelegram(data.telegram || '')
        setNotifyListings(data.notifyListings !== false)
        setNotifyRequests(data.notifyRequests !== false)
        setNotifyPayments(data.notifyPayments !== false)
        setPreferredContact(data.preferredContact || 'telegram')
      })
      .catch((err) => showToast(err.message || 'Could not load settings'))
      .finally(() => setLoading(false))
  }, [showToast])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('Name is required')
      return
    }
    setSavingProfile(true)
    try {
      await updateProfile({ name: name.trim() })
      await settingsApi.saveSettings({
        phone: phone.trim(),
        telegram: telegram.trim(),
        notifyListings,
        notifyRequests,
        notifyPayments,
        preferredContact,
      })
      refreshSession()
      showToast('Profile saved')
    } catch (err) {
      showToast(err.message || 'Could not save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePrefs = async (e) => {
    e.preventDefault()
    setSavingPrefs(true)
    try {
      await settingsApi.saveSettings({
        phone: phone.trim(),
        telegram: telegram.trim(),
        notifyListings,
        notifyRequests,
        notifyPayments,
        preferredContact,
      })
      refreshSession()
      showToast('Preferences saved')
    } catch (err) {
      showToast(err.message || 'Could not save preferences')
    } finally {
      setSavingPrefs(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      await settingsApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated')
    } catch (err) {
      showToast(err.message || 'Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const roleLabel = user?.role === 'landlord' ? 'Landlord' : user?.role === 'admin' ? 'Admin' : 'Tenant'

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your PRS account and notifications" />

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading settings…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={handleSaveProfile}>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>How your name appears on listings and invoices.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} readOnly disabled />
                </div>
                <p className="text-xs text-muted-foreground">Role: {roleLabel}</p>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 000 000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                  />
                </div>
                <Button type="submit" disabled={savingProfile} className="mt-2 w-fit">
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </Button>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={handleSavePrefs}>
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what PRS shows you in the dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <Toggle
                  label="New listing alerts"
                  hint="Saved-search matches on the bell"
                  checked={notifyListings}
                  onChange={setNotifyListings}
                />
                <Toggle
                  label="Request updates"
                  hint="Viewing and rent request status"
                  checked={notifyRequests}
                  onChange={setNotifyRequests}
                />
                <Toggle
                  label="Payment reminders"
                  hint="Upcoming rent due dates"
                  checked={notifyPayments}
                  onChange={setNotifyPayments}
                />

                <div className="mt-3 flex flex-col gap-1.5">
                  <Label htmlFor="preferredContact">Preferred contact</Label>
                  <Select value={preferredContact} onValueChange={setPreferredContact}>
                    <SelectTrigger id="preferredContact" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={savingPrefs} className="mt-4 w-fit">
                  {savingPrefs ? 'Saving…' : 'Save preferences'}
                </Button>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={handlePassword} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Demo mode does not verify the current password. Use at least 6 characters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={savingPassword} className="mt-5">
                  {savingPassword ? 'Updating…' : 'Update password'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      )}
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
