import React, { useState, useEffect } from 'react'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Footer from './Footer'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { supabase } from '../lib/supabase'
import { parseEdgeFunctionError } from '../lib/functions'
import toast from 'react-hot-toast'

export default function CertificatePage() {
  const [emailInput, setEmailInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [studentRecord, setStudentRecord] = useState(null)

  // 2-Day Attendance Verification State
  const [day1Attended, setDay1Attended] = useState(false)
  const [day2Attended, setDay2Attended] = useState(false)
  const [checkingAttendance, setCheckingAttendance] = useState(false)

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [certId, setCertId] = useState(null)

  useEffect(() => {
    document.title = 'Certificate Verification — Hyperspace XR SIG'
  }, [])

  // Lookup student record by exact email address
  const handleLookupEmail = async (e) => {
    e.preventDefault()

    const cleanEmail = emailInput.trim().toLowerCase()
    if (!cleanEmail) {
      toast.error('Please enter your registered email address.')
      return
    }

    setSearching(true)
    setStudentRecord(null)
    setOtpSent(false)
    setOtpVerified(false)
    setOtpInput('')

    try {
      // 1. Fetch student data & existing certificate_id by email
      let studentData = null
      const fnRes = await supabase.functions.invoke('search-students', {
        body: { email: cleanEmail }
      })

      if (fnRes.error) {
        const detail = await parseEdgeFunctionError(fnRes.error)
        console.warn('Search students notice:', detail)
      }

      if (fnRes.data?.student) {
        studentData = fnRes.data.student
      } else {
        // Fallback direct query if Edge Function is unavailable
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle()
        if (data) studentData = data
      }

      if (!studentData) {
        toast.error('No registration record found for this email address.')
        setSearching(false)
        return
      }

      // 2. PRE-CHECK: If certificate_id ALREADY exists, INSTANTLY redirect (Zero screen flash / zero attendance UI)
      if (studentData.certificate_id) {
        toast.success(`Welcome back, ${studentData.name}! Opening your certificate...`)
        window.location.href = `/certificate/${studentData.certificate_id}`
        return
      }

      // 3. First-time certificate generation flow: Check 2-day attendance
      setCheckingAttendance(true)
      const { data: attRes, error: attErr } = await supabase.functions.invoke('manage-attendance', {
        body: {
          action: 'get_attendance',
          studentId: studentData.id
        }
      })

      if (attErr) {
        const detail = await parseEdgeFunctionError(attErr)
        console.warn('Attendance lookup notice:', detail)
      }

      // If manage-attendance finds an existing certificate ID, redirect
      if (attRes?.existingCertificateId) {
        toast.success(`Welcome back, ${studentData.name}! Opening your certificate...`)
        window.location.href = `/certificate/${attRes.existingCertificateId}`
        return
      }

      setStudentRecord(studentData)
      toast.success(`Welcome, ${studentData.name}!`)
      setDay1Attended(!!attRes?.day1_attended)
      setDay2Attended(!!attRes?.day2_attended)

    } catch (err) {
      console.error('Lookup Error:', err)
      toast.error('Error querying student record.')
    } finally {
      setSearching(false)
      setCheckingAttendance(false)
    }
  }

  const handleReset = () => {
    setStudentRecord(null)
    setEmailInput('')
    setDay1Attended(false)
    setDay2Attended(false)
    setOtpSent(false)
    setOtpVerified(false)
    setOtpInput('')
  }

  // Dispatch OTP Email
  const handleSendOtp = async () => {
    if (!studentRecord?.email) return

    setSendingOtp(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email: studentRecord.email,
          studentName: studentRecord.name
        }
      })

      if (error) {
        const detail = await parseEdgeFunctionError(error)
        throw new Error(detail)
      }

      if (data && data.success) {
        setOtpSent(true)
        toast.success(`Verification OTP code sent to ${studentRecord.email}! Check your inbox.`)
      } else {
        throw new Error(data?.error || 'Could not send OTP email.')
      }
    } catch (err) {
      console.error('Send OTP Error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP code.')
    } finally {
      setSendingOtp(false)
    }
  }

  // Verify OTP Input
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpInput.trim() || otpInput.trim().length < 6) {
      toast.error('Please enter the full 6-digit OTP code.')
      return
    }

    setVerifyingOtp(true)
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          email: studentRecord.email,
          otpCode: otpInput.trim()
        }
      })

      if (error) {
        const detail = await parseEdgeFunctionError(error)
        throw new Error(detail)
      }

      if (data && data.success) {
        setOtpVerified(true)
        toast.success('✓ Email OTP Verified successfully!')
      } else {
        throw new Error(data?.error || 'Invalid or expired OTP code.')
      }
    } catch (err) {
      console.error('Verify OTP Error:', err)
      toast.error(err instanceof Error ? err.message : 'Invalid OTP code.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const isEligible = day1Attended && day2Attended

  // Generate & Issue Certificate
  const handleGenerate = async (e) => {
    e.preventDefault()

    if (!isEligible) {
      toast.error('Certificate locked! Student must have marked attendance for both Day 1 & Day 2.')
      return
    }

    if (!otpVerified) {
      toast.error('Please verify your email with the 6-digit OTP code first.')
      return
    }

    const targetName = studentRecord?.name || 'Atharva Ghule'
    const generatedCertId = certId || `CERT-HYPER-2026-TD-${Math.floor(1000 + Math.random() * 9000)}`
    setCertId(generatedCertId)

    setGenerating(true)
    try {
      const res = await fetch('/td-certificate-template.pdf')
      if (!res.ok) throw new Error('Could not load certificate background template')
      const templateBuffer = await res.arrayBuffer()

      const pdfDoc = await PDFDocument.load(templateBuffer)
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const page = pdfDoc.getPages()[0]
      const pageWidth = page.getWidth()

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

      const certUrl = `hyperspacesig.tech/certificate/${generatedCertId}`

      page.drawText(`Certificate ID: ${generatedCertId}`, {
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

      const dynamicDateStr = `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

      page.drawText(dynamicDateStr, {
        x: 155,
        y: 29,
        size: 9,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })

      // Save Certificate ID into Supabase database
      if (studentRecord?.id) {
        await supabase.functions.invoke('manage-attendance', {
          body: {
            action: 'save_certificate_id',
            studentId: studentRecord.id,
            certificateId: generatedCertId
          }
        }).catch((_err) => console.warn('Save cert ID notice:', _err))
      }

      toast.success('Certificate verified & generated! Redirecting to certificate page...')

      setTimeout(() => {
        window.location.href = `/certificate/${generatedCertId}`
      }, 300)
    } catch (err) {
      console.error('Generation Error:', err)
      toast.error('Failed to generate certificate PDF.')
      setGenerating(false)
    }
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <Header />
      <BackgroundLines />

      <div style={{ maxWidth: '580px', margin: '110px auto 70px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* Main Card Container */}
        <div style={{ background: '#120d0f', border: '1px solid #382A2E', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(216,75,126,0.15)', color: '#D84B7E', border: '1px solid rgba(216,75,126,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Hyperspace XR SIG
            </span>
            {studentRecord && (
              <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', background: isEligible ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isEligible ? '#4ade80' : '#f87171', border: `1px solid ${isEligible ? '#166534' : '#991b1b'}`, fontWeight: 700 }}>
                {isEligible ? '🟢 Eligible (2/2 Days Attended)' : '🔒 Ineligible (Missing Attendance)'}
              </span>
            )}
          </div>

          <h1 style={{ margin: '18px 0 6px', fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Texture Distortion Certificate Portal
          </h1>
          <p style={{ margin: '0 0 28px', color: 'rgba(210,180,195,0.75)', fontSize: '13px', lineHeight: '1.6' }}>
            Enter your registered email address to verify your student record, confirm 2-day attendance, and claim your official certificate.
          </p>

          {!studentRecord ? (
            /* Step 1: Privacy-First Email Entry Form */
            <form onSubmit={handleLookupEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '1.5px', color: '#D84B7E', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1A1215',
                    border: '1px solid #382A2E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={searching || checkingAttendance || !emailInput.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#E91E63',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: (searching || checkingAttendance || !emailInput.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (searching || checkingAttendance) ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(233,30,99,0.4)'
                }}
              >
                {(searching || checkingAttendance) ? 'Checking Student Record...' : 'Find My Certificate →'}
              </button>
            </form>
          ) : (
            /* Step 2: First-Time Certificate Generation Flow */
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Loaded Student Card */}
              <div style={{ background: '#0e2417', border: '1px solid #166534', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', letterSpacing: '1.5px', color: '#4ade80', textTransform: 'uppercase', fontWeight: 700 }}>
                    Verified Student Record ✓
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>{studentRecord.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#86efac' }}>{studentRecord.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ background: '#14532d', border: 'none', borderRadius: '6px', color: '#86efac', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Change Email
                </button>
              </div>

              {/* 2-Day Attendance Status Grid */}
              <div style={{ background: '#161013', border: '1px solid #2d1d23', borderRadius: '10px', padding: '18px 20px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '11px', letterSpacing: '1.5px', color: '#D84B7E', textTransform: 'uppercase', fontWeight: 700 }}>
                  Official 2-Day Workshop Attendance Verification
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Day 1 Status Box */}
                  <div style={{ background: day1Attended ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: `1px solid ${day1Attended ? '#166534' : '#7f1d1d'}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>Day 1 (13 Aug)</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: day1Attended ? '#4ade80' : '#f87171' }}>
                      {day1Attended ? '✓ Present' : '❌ Absent'}
                    </p>
                  </div>

                  {/* Day 2 Status Box */}
                  <div style={{ background: day2Attended ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: `1px solid ${day2Attended ? '#166534' : '#7f1d1d'}`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>Day 2 (14 Aug)</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: day2Attended ? '#4ade80' : '#f87171' }}>
                      {day2Attended ? '✓ Present' : '❌ Absent'}
                    </p>
                  </div>
                </div>
              </div>

              {!isEligible ? (
                /* Locked Warning if Ineligible */
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #991b1b', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 800, color: '#f87171' }}>
                    🔒 Certificate Generation Locked
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#fca5a5', lineHeight: '1.5' }}>
                    Our records indicate incomplete attendance. Certificates require confirmed attendance for both <strong>Day 1 (13 Aug)</strong> and <strong>Day 2 (14 Aug)</strong>. Please contact event coordinators if you believe this is an error.
                  </p>
                </div>
              ) : (
                /* Eligible Flow: OTP Security Check */
                <div style={{ background: '#161013', border: '1px solid #2d1d23', borderRadius: '10px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ margin: 0, fontSize: '11px', letterSpacing: '1.5px', color: '#D84B7E', textTransform: 'uppercase', fontWeight: 700 }}>
                    Email Security Verification (OTP)
                  </p>

                  {!otpSent ? (
                    <div>
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#ccc', lineHeight: '1.5' }}>
                        Click below to receive a 6-digit security verification code at <strong style={{ color: '#fff' }}>{studentRecord.email}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#E91E63',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: sendingOtp ? 'not-allowed' : 'pointer',
                          opacity: sendingOtp ? 0.7 : 1
                        }}
                      >
                        {sendingOtp ? 'Sending Security Code...' : '📨 Send 6-Digit OTP Code'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#4ade80' }}>
                        ✓ Verification code sent to <strong>{studentRecord.email}</strong>! Enter code below:
                      </p>

                      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder="6-Digit OTP"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          disabled={otpVerified}
                          style={{
                            flex: 1,
                            padding: '12px 14px',
                            background: '#0d0a0b',
                            border: '1px solid #382A2E',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '16px',
                            letterSpacing: '4px',
                            fontWeight: 800,
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otpInput.trim().length < 6}
                            style={{
                              padding: '12px 18px',
                              background: '#E91E63',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '13px',
                              cursor: (verifyingOtp || otpInput.trim().length < 6) ? 'not-allowed' : 'pointer',
                              opacity: (verifyingOtp || otpInput.trim().length < 6) ? 0.6 : 1
                            }}
                          >
                            {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp}
                          style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                        >
                          Resend Code
                        </button>
                        {otpVerified && (
                          <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700 }}>
                            ✓ Identity Verified
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final Submit Action */}
              <button
                type="submit"
                disabled={generating || !isEligible || !otpVerified}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: (isEligible && otpVerified) ? '#E91E63' : '#22191c',
                  border: 'none',
                  borderRadius: '10px',
                  color: (isEligible && otpVerified) ? '#fff' : '#665056',
                  fontWeight: 900,
                  fontSize: '15px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: (isEligible && otpVerified && !generating) ? 'pointer' : 'not-allowed',
                  opacity: generating ? 0.7 : 1,
                  boxShadow: (isEligible && otpVerified) ? '0 6px 20px rgba(233,30,99,0.4)' : 'none'
                }}
              >
                {generating ? 'Generating Official PDF...' : (isEligible && otpVerified) ? '✨ Generate My Official Certificate' : !isEligible ? '🔒 Locked (2/2 Days Required)' : '🔒 Verify Email OTP First'}
              </button>

            </form>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}
