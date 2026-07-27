import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useEvents } from '../../hooks/useEvent'

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }

const emptyForm = { name: '', email: '', phone: '', college: "MES's Wadia College of Engineering", branch: '', year: '1', division: '', prn: '' }

export default function WalkInPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [lastReg, setLastReg] = useState<string | null>(null)

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    const { name, email, phone, prn, college, branch, year, division } = form

    // Required fields check
    if (!name.trim() || !email.trim() || !phone.trim() || !prn.trim() || !college.trim() || !branch.trim() || !division.trim()) {
      toast.error('All fields (Name, Email, Phone, PRN, College, Branch, Division) are required.')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }

    // Phone format validation (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Please enter a valid 10-digit phone number.')
      return
    }

    setLoading(true)
    setLastReg(null)

    try {
      const { data, error } = await supabase.functions.invoke('walkin-registration', {
        body: { ...form, year: parseInt(form.year), event_id: eventId, custom_field_data: {} },
      })

      if (error) throw error

      if (data.alreadyRegistered) {
        toast(`${form.name} is already registered: ${data.registrationNo}`, { icon: 'ℹ️' })
        setLastReg(data.registrationNo)
      } else if (data.success) {
        toast.success(`Walk-in registered & attendance marked! Reg No: ${data.registrationNo}`)
        setLastReg(data.registrationNo)
        setForm(emptyForm)
      } else {
        toast.error(data.error ?? 'Walk-in failed')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Walk-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link to={`/admin/events/${eventId}`} style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>← Event Detail</Link>
        <h1 style={{ margin: '12px 0 4px', fontSize: '24px', fontWeight: 700, color: '#fff' }}>Walk-in Registration</h1>
        <p style={{ margin: 0, color: '#555', fontSize: '13px' }}>Bypass capacity and deadline limits.</p>
      </div>

      {lastReg && (
        <div style={{ background: '#0a2a0a', border: '1px solid #166534', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '2px', color: '#4ade80', textTransform: 'uppercase' }}>Last Registration</p>
            <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '18px', color: '#fff', fontWeight: 700 }}>{lastReg}</p>
          </div>
          <button onClick={() => setForm(emptyForm)} style={{ padding: '8px 16px', background: '#166534', border: 'none', borderRadius: '6px', color: '#4ade80', fontSize: '12px', cursor: 'pointer' }}>Register Another</button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Name *</label><input style={inputStyle} required value={form.name} onChange={f('name')} /></div>
          <div><label style={labelStyle}>Email *</label><input type="email" style={inputStyle} required value={form.email} onChange={f('email')} /></div>
          <div><label style={labelStyle}>Phone *</label><input style={inputStyle} required placeholder="10-digit number" value={form.phone} onChange={f('phone')} /></div>
          <div><label style={labelStyle}>College PRN *</label><input style={inputStyle} required placeholder="F24000000" value={form.prn} onChange={f('prn')} /></div>
          <div><label style={labelStyle}>Year *</label>
            <select style={inputStyle} value={form.year} onChange={f('year')}>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>College *</label><input style={inputStyle} required value={form.college} onChange={f('college')} /></div>
          <div><label style={labelStyle}>Branch *</label>
            <select style={inputStyle} required value={form.branch} onChange={f('branch')}>
              <option value="">— SELECT BRANCH —</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electronics & Telecommunications">Electronics & Telecommunications</option>
              <option value="Automation & Robotics">Automation & Robotics</option>
            </select>
          </div>
          <div><label style={labelStyle}>Division *</label>
            <select style={inputStyle} required value={form.division} onChange={f('division')}>
              <option value="">— SELECT DIVISION —</option>
              {['1', '2', '3', '4'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          id="walkin-submit"
          disabled={loading}
          style={{ padding: '14px', background: loading ? '#1a1a1a' : '#fff', color: loading ? '#555' : '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
        >
          {loading ? 'Registering...' : 'Register Walk-in →'}
        </button>
      </form>
    </div>
  )
}
