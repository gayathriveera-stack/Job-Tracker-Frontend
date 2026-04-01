import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_META = {
  Applied:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  Interview: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  Offer:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  Rejected:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}
const WORK_META = {
  Remote:   { color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  Hybrid:   { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'On-site':{ color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' }) : '—'
const Badge = ({ label, meta }) => (
  <span style={{ display:'inline-block', fontSize:11, fontWeight:500, padding:'3px 10px',
    borderRadius:100, background: meta.bg, color: meta.color, whiteSpace:'nowrap' }}>
    {label}
  </span>
)

// ── Login Screen ──────────────────────────────────────────────────────────────
function Login() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:32 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🎯</div>
        <h1 style={{ fontSize:32, fontWeight:600, marginBottom:8 }}>Job Tracker</h1>
        <p style={{ color:'var(--muted)', fontSize:15 }}>Track every application. Land the right role.</p>
      </div>
      <a href={`${API}/auth/google`} style={{
        display:'flex', alignItems:'center', gap:10, padding:'12px 24px',
        background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:12,
        color:'var(--text)', textDecoration:'none', fontSize:15, fontWeight:500,
        transition:'all 0.15s'
      }}
        onMouseOver={e => e.currentTarget.style.borderColor='var(--accent)'}
        onMouseOut={e => e.currentTarget.style.borderColor='var(--border2)'}
      >
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/><path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.4-4.2-13.3-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>
        Continue with Google
      </a>
      <p style={{ color:'var(--muted)', fontSize:12 }}>Gmail is used only to detect job emails. We never store email content.</p>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ app, userId, onClose, onSave }) {
  const blank = { company:'', role:'', applied_date: new Date().toISOString().slice(0,10), status:'Applied', work_mode:'Remote', salary:'', contact:'', job_url:'', notes:'' }
  const [form, setForm] = useState(app || blank)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.company.trim() || !form.role.trim()) return alert('Company and role are required.')
    const payload = { ...form, user_id: userId }
    const url = app?.id ? `${API}/applications/${app.id}` : `${API}/applications`
    const method = app?.id ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const data = await res.json()
    onSave(data, !!app?.id)
  }

  const Field = ({ label, children }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <label style={{ fontSize:12, color:'var(--muted)', fontWeight:500 }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16
    }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:16,
        padding:28, width:520, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:17, fontWeight:600 }}>{app?.id ? 'Edit application' : 'Add application'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:20 }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="Role *"><input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Frontend Engineer" /></Field>
          <Field label="Company *"><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" /></Field>
          <Field label="Applied date"><input type="date" value={form.applied_date} onChange={e => set('applied_date', e.target.value)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {['Applied','Interview','Offer','Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Work mode">
            <select value={form.work_mode} onChange={e => set('work_mode', e.target.value)}>
              {['Remote','Hybrid','On-site'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Salary / comp"><input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. ₹18L or $90k" /></Field>
          <Field label="Contact person"><input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Recruiter name" /></Field>
          <Field label="Job URL"><input value={form.job_url} onChange={e => set('job_url', e.target.value)} placeholder="https://..." /></Field>
          <div style={{ gridColumn:'1/-1' }}>
            <Field label="Notes"><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes…" rows={3} style={{ resize:'vertical' }} /></Field>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
          <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:10, border:'1px solid var(--border2)', background:'none', color:'var(--muted)', fontSize:14 }}>Cancel</button>
          <button onClick={save} style={{ padding:'9px 20px', borderRadius:10, border:'none', background:'var(--accent)', color:'#fff', fontSize:14, fontWeight:500 }}>Save</button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, apps, onSync, syncing }) {
  const total = apps.length
  const byStatus = s => apps.filter(a => a.status === s).length
  const rate = total > 0 ? Math.round((byStatus('Interview') + byStatus('Offer')) / total * 100) : 0

  const stats = [
    { label:'Total', value: total },
    { label:'Interviews', value: byStatus('Interview'), color:'var(--amber)' },
    { label:'Offers', value: byStatus('Offer'), color:'var(--green)' },
    { label:'Response rate', value: total > 0 ? `${rate}%` : '—', color: rate >= 20 ? 'var(--green)' : 'var(--text)' },
  ]

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:24 }}>
      <div style={{ display:'flex', gap:2, alignItems:'center' }}>
        <img src={user.picture} alt="" style={{ width:32, height:32, borderRadius:'50%', marginRight:8 }} />
        <span style={{ fontWeight:500 }}>{user.name}</span>
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 16px', minWidth:90, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:2 }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:600, color: s.color || 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <button onClick={onSync} disabled={syncing} style={{
        padding:'8px 16px', borderRadius:10, border:'1px solid var(--border2)',
        background:'none', color:'var(--text)', fontSize:13, fontWeight:500,
        opacity: syncing ? 0.6 : 1, display:'flex', alignItems:'center', gap:6
      }}>
        <span style={{ display:'inline-block', animation: syncing ? 'spin 1s linear infinite' : 'none' }}>⟳</span>
        {syncing ? 'Syncing Gmail…' : 'Sync Gmail'}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [apps, setApps] = useState([])
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterWork, setFilterWork] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Parse user from URL after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userParam = params.get('user')
    const errorParam = params.get('error')
    if (errorParam) { alert('Login failed. Please try again.'); return }
    if (userParam) {
      const u = JSON.parse(decodeURIComponent(userParam))
      setUser(u)
      localStorage.setItem('jt_user', JSON.stringify(u))
      window.history.replaceState({}, '', '/')
    } else {
      const stored = localStorage.getItem('jt_user')
      if (stored) setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const fetchApps = useCallback(async () => {
    if (!user) return
    const res = await fetch(`${API}/applications/${user.id}`)
    const data = await res.json()
    setApps(data || [])
  }, [user])

  useEffect(() => { fetchApps() }, [fetchApps])

  const sync = async () => {
    setSyncing(true)
    try {
      const res = await fetch(`${API}/sync/${user.id}`, { method:'POST' })
      const { imported } = await res.json()
      await fetchApps()
      if (imported > 0) alert(`Imported ${imported} new application(s) from Gmail!`)
      else alert('No new applications found in Gmail.')
    } catch { alert('Sync failed. Please try again.') }
    setSyncing(false)
  }

  const logout = () => { localStorage.removeItem('jt_user'); setUser(null) }

  const saveApp = (saved, isEdit) => {
    setApps(prev => isEdit ? prev.map(a => a.id === saved.id ? saved : a) : [saved, ...prev])
    setModal(null)
  }

  const deleteApp = async (id) => {
    if (!confirm('Remove this application?')) return
    await fetch(`${API}/applications/${id}`, { method:'DELETE' })
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const filtered = apps.filter(a => {
    const q = search.toLowerCase()
    return (!q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
      && (!filterStatus || a.status === filterStatus)
      && (!filterWork || a.work_mode === filterWork)
  })

  if (loading) return null
  if (!user) return <Login />

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.02em' }}>🎯 Job Tracker</h1>
        <button onClick={logout} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:13 }}>Sign out</button>
      </div>

      <Dashboard user={user} apps={apps} onSync={sync} syncing={syncing} />

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ flex:1, minWidth:180 }} placeholder="Search company or role…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ width:'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['Applied','Interview','Offer','Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ width:'auto' }} value={filterWork} onChange={e => setFilterWork(e.target.value)}>
          <option value="">All work modes</option>
          {['Remote','Hybrid','On-site'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setModal({})} style={{
          padding:'9px 18px', borderRadius:10, border:'none',
          background:'var(--accent)', color:'#fff', fontSize:14, fontWeight:500, whiteSpace:'nowrap'
        }}>+ Add</button>
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto', border:'1px solid var(--border)', borderRadius:14 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Role','Company','Date','Status','Mode','Salary','Contact','Link',''].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'var(--muted)', fontWeight:500, whiteSpace:'nowrap', background:'var(--surface)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>
                {apps.length === 0 ? 'No applications yet — add one or sync Gmail.' : 'No results match your filter.'}
              </td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.1s' }}
                onMouseOver={e => e.currentTarget.style.background='var(--surface)'}
                onMouseOut={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'10px 14px', fontWeight:500 }}>{a.role}</td>
                <td style={{ padding:'10px 14px' }}>{a.company}</td>
                <td style={{ padding:'10px 14px', color:'var(--muted)', whiteSpace:'nowrap' }}>{fmt(a.applied_date)}</td>
                <td style={{ padding:'10px 14px' }}><Badge label={a.status} meta={STATUS_META[a.status]} /></td>
                <td style={{ padding:'10px 14px' }}><Badge label={a.work_mode} meta={WORK_META[a.work_mode] || WORK_META['On-site']} /></td>
                <td style={{ padding:'10px 14px', color:'var(--muted)', whiteSpace:'nowrap' }}>{a.salary || '—'}</td>
                <td style={{ padding:'10px 14px', color:'var(--muted)' }}>{a.contact || '—'}</td>
                <td style={{ padding:'10px 14px' }}>{a.job_url ? <a href={a.job_url} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize:12 }}>View ↗</a> : '—'}</td>
                <td style={{ padding:'10px 14px', whiteSpace:'nowrap' }}>
                  <button onClick={() => setModal(a)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:14, marginRight:6, padding:'2px 6px' }}>✎</button>
                  <button onClick={() => deleteApp(a.id)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:14, padding:'2px 6px' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <Modal app={modal?.id ? modal : null} userId={user.id} onClose={() => setModal(null)} onSave={saveApp} />
      )}
    </div>
  )
}
