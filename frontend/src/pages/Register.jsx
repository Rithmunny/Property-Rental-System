import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/dashboard')
    } catch {
      // error shown via context
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Sign up as a tenant or a landlord."
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <Field label="Full name" name="name" type="text" value={form.name} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">I am a</Label>
          <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
            <SelectTrigger id="role" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="tenant">Tenant — looking to rent</SelectItem>
              <SelectItem value="landlord">Landlord — listing a property</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading} size="lg" className="mt-2 w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}

function Field({ label, name, type, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        required
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
