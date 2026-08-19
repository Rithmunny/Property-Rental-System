import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import * as settingsApi from '@/api/settings'
import PageHeader from '@/components/dashboard/PageHeader'

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
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-gray-500">How your name appears on listings and invoices.</p>

            <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
              />
            </label>
            <label className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              Email
              <input
                value={user?.email || ''}
                readOnly
                className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500"
              />
            </label>
            <p className="mt-1 text-xs text-gray-400">Role: {roleLabel}</p>
            <label className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+855 12 000 000"
                className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
              />
            </label>
            <label className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              Telegram
              <input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
              />
            </label>
            <button
              type="submit"
              disabled={savingProfile}
              className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
            >
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </form>

          <form onSubmit={handleSavePrefs} className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Notifications</h2>
            <p className="mt-1 text-sm text-gray-500">Choose what PRS shows you in the dashboard.</p>

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

            <label className="mt-4 flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              Preferred contact
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
              >
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={savingPrefs}
              className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
            >
              {savingPrefs ? 'Saving…' : 'Save preferences'}
            </button>
          </form>

          <form onSubmit={handlePassword} className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <h2 className="font-semibold text-gray-900">Password</h2>
            <p className="mt-1 text-sm text-gray-500">
              Demo mode does not verify the current password. Use at least 6 characters.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-forest"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
            >
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="mt-4 flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        <span className="block text-xs text-gray-500">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-forest"
      />
    </label>
  )
}
