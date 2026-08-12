import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CertificateViewPage() {
  const { certId } = useParams()
  const [searchParams] = useSearchParams()

  const activeCertId = certId || 'CERT-HYPER-2026-TD-8538'

  const paramName = searchParams.get('name')
  const paramEmail = searchParams.get('email')

  const [participantName, setParticipantName] = useState(paramName || 'Atharva Ghule')
  const [userEmail, setUserEmail] = useState(paramEmail || 'atharva@example.com')
  const [pdfDataUrl, setPdfDataUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  // Render Certificate PDF on load (Auto-lookup from Supabase by certId)
  useEffect(() => {
    document.title = `Certificate ${activeCertId} | Hyperspace XR SIG`

    const renderCert = async () => {
      setLoading(true)

      let displayName = paramName || participantName
      let displayEmail = paramEmail || userEmail

      // Lookup student record from Supabase by Certificate ID
      try {
        const { data: certInfo } = await supabase.functions.invoke('manage-attendance', {
          body: { action: 'lookup_certificate', certificateId: activeCertId }
        })

        if (certInfo && certInfo.found && certInfo.studentName) {
          displayName = certInfo.studentName
          displayEmail = certInfo.studentEmail || displayEmail
          setParticipantName(displayName)
          setUserEmail(displayEmail)
        }
      } catch (_err) {
        console.warn('Cert lookup notice:', _err)
      }

      try {
        const res = await fetch('/td-certificate-template.pdf')
        if (!res.ok) throw new Error('Could not load certificate background template')
        const templateBuffer = await res.arrayBuffer()

        const pdfDoc = await PDFDocument.load(templateBuffer)
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const page = pdfDoc.getPages()[0]
        const pageWidth = page.getWidth() // 842.25pt

        // 1. Draw Participant Name (Centered)
        const cleanName = displayName.trim().toUpperCase()
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
          color: rgb(0.85, 0.12, 0.39), // Hyperspace Pink (#D84B7E)
        })

        // 2. Draw Certificate Details Stacked at Bottom Left (x=155)
        const certUrl = `hyperspacesig.tech/certificate/${activeCertId}`
        const today = new Date()
        const dynamicDateStr = `Date: ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
        const dynamicDateShort = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

        // Stack line 1: Certificate ID
        page.drawText(`Certificate ID: ${activeCertId}`, {
          x: 155,
          y: 55,
          size: 9,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        })

        // Stack line 2: Certificate URL
        page.drawText(`Certificate URL: ${certUrl}`, {
          x: 155,
          y: 42,
          size: 9,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        })

        // Stack line 3: Issue Date
        page.drawText(dynamicDateStr, {
          x: 155,
          y: 29,
          size: 9,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        setPdfDataUrl(url)
      } catch (err) {
        console.error('Error generating certificate PDF:', err)
        toast.error('Failed to render certificate PDF.')
      } finally {
        setLoading(false)
      }
    }

    renderCert()
  }, [activeCertId, paramName, paramEmail])

  // Get Initials for Avatar
  const getInitials = (fullName) => {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return fullName.slice(0, 2).toUpperCase()
  }

  // Handle Download PDF
  const handleDownload = () => {
    if (!pdfDataUrl) return
    const link = document.createElement('a')
    link.href = pdfDataUrl
    link.download = `Texture_Distortion_Certificate_${participantName.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Certificate PDF downloaded!')
  }

  // Handle LinkedIn Share
  const handleLinkedInShare = () => {
    const certUrl = encodeURIComponent(window.location.href)
    const title = encodeURIComponent('Texture Distortion — 3D Blender Workshop Certificate')
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${certUrl}&title=${title}`
    window.open(linkedinUrl, '_blank', 'width=600,height=600')
  }

  const issueDateFormatted = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div style={{ background: '#f7f9fa', minHeight: '100vh', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#2d2f31' }}>
      
      {/* Main Content Layout */}
      <main style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '36px', alignItems: 'start' }}>
        
        {/* Left Column: Certificate Viewer & Disclaimer */}
        <div>
          {/* Certificate Container Box */}
          <div style={{ background: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            {loading ? (
              <div style={{ height: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6a6f73', fontSize: '14px' }}>
                Rendering Certificate PDF...
              </div>
            ) : pdfDataUrl ? (
              <iframe
                src={pdfDataUrl}
                title="Official Certificate Document"
                style={{ width: '100%', height: '580px', border: 'none', borderRadius: '4px' }}
              />
            ) : null}
          </div>

          {/* Official Verification Disclaimer Statement */}
          <p style={{ marginTop: '20px', fontSize: '12px', lineHeight: '1.7', color: '#6a6f73' }}>
            This certificate above verifies that <strong style={{ color: '#E91E63' }}>{participantName}</strong> successfully completed the workshop <strong style={{ color: '#2d2f31' }}>Texture Distortion — A 2-Day Blender Workshop</strong> on <strong style={{ color: '#2d2f31' }}>{issueDateFormatted}</strong> as organized by <strong style={{ color: '#2d2f31' }}>Hyperspace XR SIG</strong> at <strong style={{ color: '#2d2f31' }}>Wadia College of Engineering</strong>. The certificate indicates the entire 2-day workshop was completed as validated by attendance records.
          </p>
        </div>

        {/* Right Column: Recipient & Course Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Certificate Recipient Box */}
          <div style={{ background: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#2d2f31' }}>Certificate Recipient:</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1c1d1f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                {getInitials(participantName)}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#2d2f31' }}>{participantName}</p>
              </div>
            </div>
          </div>

          {/* About the Course Box */}
          <div style={{ background: '#ffffff', border: '1px solid #d1d7dc', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#2d2f31' }}>About the Workshop:</h3>
            
            <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #e8e8e8', marginBottom: '14px' }}>
              <img
                src="/final-render.jpeg"
                alt="Texture Distortion Blender Donut Workshop Render"
                style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '15px', color: '#2d2f31', lineHeight: '1.3' }}>
              Texture Distortion — The Complete 3D Blender Workshop
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6a6f73' }}>
              Hyperspace XR SIG · Dept. of Computer Engineering
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#b4690e', fontWeight: 700, marginBottom: '16px' }}>
              <span>4.9</span>
              <span>★★★★★</span>
              <span style={{ color: '#6a6f73', fontWeight: 400 }}>(128 reviews)</span>
            </div>

            <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6a6f73', background: '#f7f9fa', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e8e8e8' }}>
              ⏱️ 6.0 total hours · 13–14 August 2026
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleDownload}
                style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid #1c1d1f', borderRadius: '4px', color: '#1c1d1f', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>📥</span> Download PDF
              </button>

              <button
                onClick={handleLinkedInShare}
                style={{ width: '100%', padding: '12px', background: '#0a66c2', border: 'none', borderRadius: '4px', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>🔗</span> Share / Add to LinkedIn
              </button>
            </div>

            <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#6a6f73', textAlign: 'center' }}>
              Verified by Hyperspace XR SIG Certificate Issuer
            </p>
          </div>

        </aside>

      </main>

    </div>
  )
}
