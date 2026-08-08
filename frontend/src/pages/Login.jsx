import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/layout/AuthLayout'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'tenant' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form)
      navigate('/dashboard')
    } catch {
      // error shown via context
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Manage your rentals and saved homes."
      footer={
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-forest hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Log in as
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/15"
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}

function Field({ label, name, type, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
      {label}
      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-forest focus:ring-2 focus:ring-forest/15"
      />
    </label>
  )
}
