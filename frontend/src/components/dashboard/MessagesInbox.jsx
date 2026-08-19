import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMessages } from '@/context/MessagesContext'
import { useProperties } from '@/context/PropertiesContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import PageHeader from './PageHeader'
import SkeletonRow from '@/components/common/SkeletonRow'

export default function MessagesInbox({ role }) {
  const { user } = useAuth()
  const { properties } = useProperties()
  const { threads, loading, error, sendMessage } = useMessages()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const propertyId = Number(searchParams.get('propertyId')) || null
  const tenantParam = searchParams.get('tenant') || ''

  const selected = useMemo(() => {
    if (propertyId) {
      return (
        threads.find((t) => {
          const sameProperty = t.propertyId === propertyId
          if (!sameProperty) return false
          if (role === 'landlord' && tenantParam) return t.tenantEmail === tenantParam
          return true
        }) || null
      )
    }
    return threads[0] || null
  }, [threads, propertyId, tenantParam, role])

  useEffect(() => {
    if (selected && !propertyId) {
      const params = { propertyId: String(selected.propertyId) }
      if (role === 'landlord') params.tenant = selected.tenantEmail
      setSearchParams(params, { replace: true })
    }
  }, [selected, propertyId, role, setSearchParams])

  const property = properties.find((p) => p.id === (selected?.propertyId || propertyId))
  const draftTenantEmail =
    role === 'tenant' ? user?.email : tenantParam || selected?.tenantEmail || ''

  const handleSend = async (e) => {
    e.preventDefault()
    const targetPropertyId = selected?.propertyId || propertyId
    if (!targetPropertyId || !text.trim()) return
    setSending(true)
    try {
      const updated = await sendMessage({
        propertyId: targetPropertyId,
        tenantEmail: role === 'landlord' ? draftTenantEmail : user?.email,
        text,
      })
      setText('')
      const params = { propertyId: String(updated.propertyId) }
      if (role === 'landlord') params.tenant = updated.tenantEmail
      setSearchParams(params)
    } catch (err) {
      showToast(err.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  const title = role === 'landlord' ? 'Messages' : 'Messages'
  const subtitle =
    role === 'landlord' ? 'Chat with tenants about your listings' : 'Chat with landlords about homes'

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-gray-100 lg:border-b-0 lg:border-r">
          {loading ? (
            <div className="p-3">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : threads.length === 0 && !propertyId ? (
            <p className="p-6 text-sm text-gray-500">No messages yet.</p>
          ) : (
            <div className="flex flex-col">
              {propertyId && !threads.some((t) => t.propertyId === propertyId) && (
                <div className="border-b border-gray-100 bg-sage/30 px-4 py-3 text-sm font-medium text-forest">
                  New conversation
                </div>
              )}
              {threads.map((thread) => {
                const listing = properties.find((p) => p.id === thread.propertyId)
                const last = thread.messages[thread.messages.length - 1]
                const active =
                  selected?.id === thread.id ||
                  (thread.propertyId === propertyId &&
                    (role !== 'landlord' || thread.tenantEmail === (tenantParam || selected?.tenantEmail)))
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => {
                      const params = { propertyId: String(thread.propertyId) }
                      if (role === 'landlord') params.tenant = thread.tenantEmail
                      setSearchParams(params)
                    }}
                    className={`border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                      active ? 'bg-sage/40' : ''
                    }`}
                  >
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {listing?.title ?? 'Listing'}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {role === 'landlord' ? thread.tenantName : thread.landlord}
                    </p>
                    {last && <p className="mt-1 truncate text-xs text-gray-400">{last.text}</p>}
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        <section className="flex min-h-[420px] flex-col">
          {!property && !selected ? (
            <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-500">
              Select a conversation or message a landlord from a listing.
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="font-semibold text-gray-900">{property?.title ?? 'Property'}</p>
                <p className="text-xs text-gray-500">
                  {role === 'landlord'
                    ? selected?.tenantName || draftTenantEmail
                    : property?.landlord}
                </p>
                {property && (
                  <Link to={`/listings/${property.id}`} className="text-xs font-semibold text-forest hover:underline">
                    View listing
                  </Link>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {(selected?.messages || []).map((message) => {
                  const mine = message.fromEmail === user?.email || message.fromRole === role
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                          mine ? 'bg-forest text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {!selected?.messages?.length && (
                  <p className="text-sm text-gray-500">Send the first message.</p>
                )}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message"
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-forest"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim() || !(selected?.propertyId || propertyId)}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
