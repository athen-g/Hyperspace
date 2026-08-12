import React, { useState, useEffect } from 'react'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Footer from './Footer'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function TestCertificatePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [participantName, setParticipantName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [generating, setGenerating] = useState(false)

  // 2-Day Attendance State
  const [day1Attended, setDay1Attended] = useState(false)
  const [day2Attended, setDay2Attended] = useState(false)

  // Auto-generated unchangeable unique Certificate ID
  const [certId] = useState(() => `CERT-HYPER-2026-TD-${Math.floor(1000 + Math.random() * 9000)}`)

  useEffect(() => {
    document.title = 'Certificate Generator — Hyperspace XR SIG'
  }, [])

  // Live Supabase student search (with Edge Function fallback for public RLS)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const term = searchTerm.trim()

      // 1. Try direct Supabase query (works if logged in)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10)

      if (!error && data && data.length > 0) {
        setSearchResults(data)
        setSearching(false)
        return
      }

      // 2. Fall back to search-students Edge Function (works for public sessions)
      try {
        const fnRes = await supabase.functions.invoke('search-students', {
          body: { term }
        })
        if (fnRes.data && fnRes.data.students) {
          setSearchResults(fnRes.data.students)
        }
      } catch (e) {
        console.error('Edge Function search error:', e)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Select student and fetch their 2-day attendance
  const handleSelectStudent = async (student) => {
    setSelectedStudent(student)
    setParticipantName(student.name)
    setEmailInput(student.email)

    // Check attendance records from Supabase
    try {
      const { data: reg } = await supabase
        .from('registrations')
        .select('id')
        .eq('student_id', student.id)
        .maybeSingle()

      if (reg) {
        const { data: attList } = await supabase
          .from('attendance')
          .select('scanned_at, notes')
          .eq('registration_id', reg.id)

        if (attList && attList.length > 0) {
          // Check for Day 1 and Day 2 indicators
          const hasDay1 = attList.some(a => (a.notes && a.notes.includes('Day 1')) || new Date(a.scanned_at).getDate() === 13)
          const hasDay2 = attList.some(a => (a.notes && a.notes.includes('Day 2')) || new Date(a.scanned_at).getDate() === 14)
          
          setDay1Attended(hasDay1 || attList.length >= 1)
          setDay2Attended(hasDay2 || attList.length >= 2)
        } else {
          setDay1Attended(false)
          setDay2Attended(false)
        }
      } else {
        setDay1Attended(false)
        setDay2Attended(false)
      }
    } catch (e) {
      // Default false if no records
      setDay1Attended(false)
      setDay2Attended(false)
    }

    toast.success(`Selected student: ${student.name}`)
  }

  const handleResetSelection = () => {
    setSelectedStudent(null)
    setParticipantName('')
    setEmailInput('')
    setSearchTerm('')
    setSearchResults([])
    setDay1Attended(false)
    setDay2Attended(false)
  }

  const isEligible = day1Attended && day2Attended

  // Generate Certificate Action (Blocked unless both Day 1 & Day 2 attended)
  const handleGenerate = async (e) => {
    e.preventDefault()

    if (!isEligible) {
      toast.error('Certificate locked! Student must be marked present for both Day 1 & Day 2.')
      return
    }

    const targetName = participantName.trim() || 'Atharva Ghule'
    const targetEmail = emailInput.trim() || 'atharva@example.com'

    setGenerating(true)
    try {
      // 1. Fetch template
      const res = await fetch('/td-certificate-template.pdf')
      if (!res.ok) throw new Error('Could not load certificate background template')
      const templateBuffer = await res.arrayBuffer()

      // 2. Load with pdf-lib
      const pdfDoc = await PDFDocument.load(templateBuffer)
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const page = pdfDoc.getPages()[0]
      const pageWidth = page.getWidth()

      // 3. Participant Name (Centered)
      const cleanName = targetName.toUpperCase()
      let fontSize = 28
      if (cleanName.length > 25) fontSize = 22
      if (cleanName.length > 35) fontSize = 18

      const textWidth = fontBold.widthOfTextAtSize(cleanName, fontSize)
      const nameX = (pageWidth - textWidth) / 2
      const nameY = 285

      page.drawText(cleanName, {
        x: nameX,
        y: nameY,
        size: fontSize,
        font: fontBold,
        color: rgb(0.85, 0.12, 0.39),
      })

      // 4. Details stacked at bottom left (shifted 100px right to x=155)
      const certUrl = `hyperspacesig.tech/certificate/${certId}`

      page.drawText(`Certificate ID: ${certId}`, {
        x: 155,
        y: 55,
        size: 9,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })

      page.drawText(`Certificate URL: ${certUrl}`, {
        x: 155,
        y: 42,
        size: 9,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })

      page.drawText(`Date: August 14, 2026`, {
        x: 155,
        y: 29,
        size: 9,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })

      toast.success('Certificate verified & generated! Redirecting to certificate page...')

      // Redirect directly to Certificate Page (No navbar)
      setTimeout(() => {
        window.location.href = `/certificate/${certId}?name=${encodeURIComponent(targetName)}&email=${encodeURIComponent(targetEmail)}&day1=true&day2=true`
      }, 300)
    } catch (err) {
      console.error('Generation Error:', err)
      toast.error('Failed to generate certificate PDF.')
      setGenerating(false)
    }
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Default Site Navbar */}
      <Header />
      <BackgroundLines />

      <div style={{ maxWidth: '580px', margin: '110px auto 60px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* Card Container */}
        <div style={{ background: '#120d0f', border: '1px solid #382A2E', borderRadius: '12px', padding: '32px 28px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(216,75,126,0.15)', color: '#D84B7E', border: '1px solid rgba(216,75,126,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Hyperspace XR SIG
            </span>
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: isEligible ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isEligible ? '#4ade80' : '#f87171', border: `1px solid ${isEligible ? '#166534' : '#991b1b'}`, fontWeight: 700 }}>
              {isEligible ? '🟢 Eligible (2/2 Days)' : '🔒 Locked (2-Day Attendance Required)'}
            </span>
          </div>

          <h1 style={{ margin: '14px 0 6px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            Generate Workshop Certificate
          </h1>
          <p style={{ margin: '0 0 24px', color: 'rgba(210,180,195,0.75)', fontSize: '13px', lineHeight: '1.6' }}>
            Search by student name or email. Certificates are strictly locked unless attendance for <strong>both Day 1 (13 Aug) and Day 2 (14 Aug)</strong> is marked present.
          </p>

          {!selectedStudent ? (
            /* Step 1: Search Students Database UI */
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                Search Student (Name or Email)
              </label>
              <input
                type="text"
                placeholder="Type student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#1A1215',
                  border: '1px solid #382A2E',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {searching && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '12px', textAlign: 'center' }}>
                  Searching database...
                </div>
              )}

              {/* Student Search Cards List */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {searchResults.length === 0 && searchTerm.trim() && !searching && (
                  <div style={{ fontSize: '13px', color: '#888', padding: '16px', textAlign: 'center', border: '1px dashed #382A2E', borderRadius: '8px' }}>
                    No students found matching "{searchTerm}"
                  </div>
                )}

                {searchResults.map(st => (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStudent(st)}
                    style={{
                      padding: '14px 16px',
                      background: '#181114',
                      border: '1px solid #382A2E',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E63'; e.currentTarget.style.background = '#25171C' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#382A2E'; e.currentTarget.style.background = '#181114' }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{st.name}</div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                        {st.email} {st.phone ? `• ${st.phone}` : ''}
                      </div>
                      {st.college && (
                        <div style={{ fontSize: '11px', color: '#777', marginTop: '3px' }}>
                          {st.college} {st.branch ? `(${st.branch})` : ''}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#E91E63', padding: '6px 12px', border: '1px solid #E91E63', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Select →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Step 2: Selected Student, 2-Day Attendance Status & Generate Button */
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Selected Student Card */}
              <div style={{ background: '#0e2417', border: '1px solid #166534', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', letterSpacing: '1.5px', color: '#4ade80', textTransform: 'uppercase', fontWeight: 700 }}>
                    Selected Student ✓
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>{selectedStudent.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#86efac' }}>{selectedStudent.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetSelection}
                  style={{ background: '#14532d', border: 'none', borderRadius: '6px', color: '#86efac', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Change
                </button>
              </div>

              {/* 2-Day Attendance Verification Box */}
              <div style={{ background: '#181114', border: '1px solid #382A2E', borderRadius: '8px', padding: '16px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D84B7E' }}>
                  2-Day Workshop Attendance Status
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {/* Day 1 Badge */}
                  <div style={{ padding: '12px', background: day1Attended ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${day1Attended ? '#166534' : '#991b1b'}`, borderRadius: '6px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Day 1 (13 Aug)</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: day1Attended ? '#4ade80' : '#f87171' }}>
                      {day1Attended ? '✓ Present' : '❌ Absent'}
                    </p>
                  </div>

                  {/* Day 2 Badge */}
                  <div style={{ padding: '12px', background: day2Attended ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${day2Attended ? '#166534' : '#991b1b'}`, borderRadius: '6px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>Day 2 (14 Aug)</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: day2Attended ? '#4ade80' : '#f87171' }}>
                      {day2Attended ? '✓ Present' : '❌ Absent'}
                    </p>
                  </div>
                </div>

                {/* Testing Sandbox Toggles */}
                <div style={{ borderTop: '1px dashed #382A2E', pt: '12px', paddingTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setDay1Attended(prev => !prev)}
                    style={{ padding: '6px 12px', background: '#251C1F', border: '1px solid #382A2E', borderRadius: '4px', color: day1Attended ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Toggle Day 1: {day1Attended ? 'Present' : 'Absent'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDay2Attended(prev => !prev)}
                    style={{ padding: '6px 12px', background: '#251C1F', border: '1px solid #382A2E', borderRadius: '4px', color: day2Attended ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Toggle Day 2: {day2Attended ? 'Present' : 'Absent'}
                  </button>
                </div>
              </div>

              {/* Locked Warning Banner if not eligible */}
              {!isEligible && (
                <div style={{ padding: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid #991b1b', borderRadius: '6px', color: '#f87171', fontSize: '12px', lineHeight: '1.6', textAlign: 'center' }}>
                  🔒 <strong>Certificate Generation Locked</strong><br/>
                  Student must have marked attendance for both <strong>Day 1 (13 Aug)</strong> and <strong>Day 2 (14 Aug)</strong>. Use the toggle buttons above to test eligibility.
                </div>
              )}

              {/* Read-Only Unique Certificate ID */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '6px' }}>
                  Assigned Certificate ID (Auto-Generated)
                </label>
                <input
                  type="text"
                  value={certId}
                  readOnly
                  disabled
                  style={{ width: '100%', padding: '12px 14px', background: '#0d0a0b', border: '1px solid #2A1F23', borderRadius: '6px', color: '#D84B7E', fontFamily: 'monospace', fontSize: '13px', cursor: 'not-allowed', boxSizing: 'border-box' }}
                />
              </div>

              {/* Generate Button (Disabled if not eligible) */}
              <button
                type="submit"
                disabled={generating || !isEligible}
                style={{ width: '100%', padding: '14px', background: isEligible ? '#E91E63' : '#332026', border: 'none', borderRadius: '6px', color: isEligible ? '#fff' : '#665057', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: isEligible ? 'pointer' : 'not-allowed', opacity: generating ? 0.7 : 1, marginTop: '4px', boxShadow: isEligible ? '0 4px 14px rgba(233,30,99,0.4)' : 'none' }}
              >
                {generating ? 'Generating Certificate...' : isEligible ? 'Generate Certificate →' : '🔒 Locked (2/2 Days Required)'}
              </button>
            </form>
          )}

        </div>

      </div>

      <Footer />
    </div>
  )
}
