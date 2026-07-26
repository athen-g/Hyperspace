import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useEvents } from '../../hooks/useEvent'
import { Link } from 'react-router-dom'

type ScanResult = { success: true; studentName: string; eventTitle: string; registrationNo: string } | { error: 'already_scanned'; scannedAt: string } | { error: string }

function playBeep(success: boolean) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = success ? 880 : 220
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (_) { /* AudioContext may not be available */ }
}

export default function ScannerPage() {
  const { events } = useEvents()
  const [selectedEventId, setSelectedEventId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const processingRef = useRef(false)

  // Auto-select today's event
  useEffect(() => {
    const today = new Date().toDateString()
    const todayEvent = events.find(e => new Date(e.event_date).toDateString() === today)
    if (todayEvent) setSelectedEventId(todayEvent.id)
  }, [events])

  const startScanner = () => {
    if (scannerRef.current) return
    setScanning(true)
    setResult(null)
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
    scanner.render(async (decodedText) => {
      if (processingRef.current) return
      processingRef.current = true

      try {
        // Extract token from URL or use raw value
        let token = decodedText
        try {
          const url = new URL(decodedText)
          token = url.searchParams.get('token') ?? decodedText
        } catch (_) { /* not a URL, use raw */ }

        const { data, error } = await supabase.functions.invoke('scan-qr', { body: { qr_token: token } })

        if (error) throw error

        setResult(data)
        if (data.success) {
          playBeep(true)
        } else {
          playBeep(false)
        }

        // Auto-reset after 3 seconds
        setTimeout(() => {
          setResult(null)
          processingRef.current = false
        }, 3000)
      } catch (err) {
        playBeep(false)
        setResult({ error: 'Scan failed. Please try again.' })
        setTimeout(() => { setResult(null); processingRef.current = false }, 2000)
      }
    }, () => { /* error callback */ })
    scannerRef.current = scanner
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
      scannerRef.current = null
    }
    setScanning(false)
    setResult(null)
    processingRef.current = false
  }

  useEffect(() => () => stopScanner(), [])

  const isSuccess = result && 'success' in result && result.success
  const isAlreadyScanned = result && 'error' in result && result.error === 'already_scanned'
  const isError = result && 'error' in result && result.error !== 'already_scanned'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '40px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', letterSpacing: '3px', color: '#555', textTransform: 'uppercase' }}>Hyperspace XR</p>
            <h1 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 700, color: '#fff' }}>QR Scanner</h1>
          </div>
          <Link to="/admin/dashboard" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>← Dashboard</Link>
        </div>

        {/* Event selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '8px' }}>Event</label>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            disabled={scanning}
            style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          >
            <option value="">Select an event...</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {!scanning ? (
            <button
              id="start-scanner"
              onClick={startScanner}
              disabled={!selectedEventId}
              style={{ flex: 1, padding: '14px', background: selectedEventId ? '#fff' : '#1a1a1a', color: selectedEventId ? '#000' : '#555', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: selectedEventId ? 'pointer' : 'not-allowed' }}
            >
              Start Scanning
            </button>
          ) : (
            <button onClick={stopScanner} style={{ flex: 1, padding: '14px', background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '8px', color: '#f87171', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Stop Scanner
            </button>
          )}
        </div>

        {/* Camera feed */}
        {scanning && (
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            <div id="qr-reader" style={{ width: '100%' }} />
          </div>
        )}

        {/* Result overlay */}
        {result && (
          <div style={{
            padding: '28px',
            borderRadius: '16px',
            background: isSuccess ? '#0a2a0a' : isAlreadyScanned ? '#1a1a0a' : '#1a0a0a',
            border: `1px solid ${isSuccess ? '#166534' : isAlreadyScanned ? '#713f12' : '#7f1d1d'}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>
              {isSuccess ? '✅' : isAlreadyScanned ? '⚠️' : '❌'}
            </div>
            {isSuccess && 'success' in result && result.success && (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#4ade80' }}>Check-in Successful!</p>
                <p style={{ margin: '0 0 8px', fontSize: '16px', color: '#e5e5e5' }}>{result.studentName}</p>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#86efac' }}>{result.registrationNo}</p>
              </>
            )}
            {isAlreadyScanned && 'error' in result && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#facc15' }}>Already Scanned</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#a3a3a3' }}>Originally scanned at {new Date('scannedAt' in result ? result.scannedAt : '').toLocaleTimeString()}</p>
              </>
            )}
            {isError && 'error' in result && (
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f87171' }}>{result.error === 'invalid_token' ? 'Invalid QR Code' : result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
