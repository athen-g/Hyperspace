import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useEvents } from '../../hooks/useEvent'
import { Link, useSearchParams } from 'react-router-dom'

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
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processingRef = useRef(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Handle auto-scanning from URL query parameters
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && !processingRef.current) {
      processingRef.current = true

      // Clean URL parameters
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('token')
      setSearchParams(newParams, { replace: true })

      const processToken = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('scan-qr', { body: { qr_token: token } })
          if (error) {
            let errMsg = error.message;
            if (error.context && typeof error.context.json === 'function') {
              try {
                const body = await error.context.clone().json();
                errMsg = body.error || body.message || errMsg;
              } catch (e) {}
            }
            throw new Error(errMsg);
          }
          setResult(data)
          playBeep(!!data.success)
          setTimeout(() => {
            setResult(null)
            processingRef.current = false
          }, 3000)
        } catch (err) {
          playBeep(false)
          setResult({ error: 'Scan failed. Please try again.' })
          setTimeout(() => { setResult(null); processingRef.current = false }, 2000)
        }
      }
      processToken()
    }
  }, [searchParams, setSearchParams])

  // Auto-select today's event
  useEffect(() => {
    const today = new Date().toDateString()
    const todayEvent = events.find(e => new Date(e.event_date).toDateString() === today)
    if (todayEvent) setSelectedEventId(todayEvent.id)
  }, [events])

  // Handle initializing/clearing the camera scanner safely after DOM mounting
  useEffect(() => {
    if (scanning) {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      // Programmatically start camera scanning immediately (triggers native browser prompt)
      scanner.start(
        { facingMode: 'environment' },
        { fps: 25 },
        async (decodedText) => {
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

            if (error) {
              let errMsg = error.message;
              if (error.context && typeof error.context.json === 'function') {
                try {
                  const body = await error.context.clone().json();
                  errMsg = body.error || body.message || errMsg;
                } catch (e) {}
              }
              throw new Error(errMsg);
            }

            setResult(data)
            playBeep(!!data.success)

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
        },
        () => { /* verbose scanner errors ignored */ }
      ).catch(err => {
        console.error('Camera access error:', err)
        toast.error('Failed to open camera. Check permissions.')
        setScanning(false)
      })
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current = null
        })
      }
    }
  }, [scanning])

  const startScanner = () => {
    setScanning(true)
    setResult(null)
  }

  const stopScanner = () => {
    setScanning(false)
    setResult(null)
    processingRef.current = false
  }

  useEffect(() => () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
    }
  }, [])

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
      padding: '16px 16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ width: '100%', maxWidth: '768px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', letterSpacing: '3px', color: '#555', textTransform: 'uppercase' }}>Hyperspace XR</p>
            <h1 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 700, color: '#fff' }}>QR Scanner</h1>
          </div>
          <Link to="/admin/dashboard" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>← Dashboard</Link>
        </div>

        {/* Event selector */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }}>Event</label>
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {!scanning ? (
            <button
              id="start-scanner"
              onClick={startScanner}
              disabled={!selectedEventId}
              style={{ flex: 1, padding: '12px', background: selectedEventId ? '#fff' : '#1a1a1a', color: selectedEventId ? '#000' : '#555', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: selectedEventId ? 'pointer' : 'not-allowed' }}
            >
              Start Scanning
            </button>
          ) : (
            <button onClick={stopScanner} style={{ flex: 1, padding: '12px', background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '8px', color: '#f87171', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Stop Scanner
            </button>
          )}
        </div>

        {/* Flex layout container for camera and status */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: '16px', 
          justifyContent: 'center', 
          alignItems: 'stretch' 
        }}>
          {/* Camera feed */}
          {scanning && (
            <div style={{ 
              flex: '1 1 280px',
              maxWidth: '340px',
              aspectRatio: '1/1', 
              background: '#111', 
              border: '1px solid #1e1e1e', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              position: 'relative'
            }}>
              <div id="qr-reader" style={{ width: '100%', height: '100%' }} />
              {/* Cosmetic target guide box corners */}
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '15%',
                width: '70%',
                height: '70%',
                pointerEvents: 'none',
                boxSizing: 'border-box'
              }}>
                {/* Top-left corner */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderLeft: '4px solid #fff', borderTop: '4px solid #fff', borderTopLeftRadius: '8px' }} />
                {/* Top-right corner */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderRight: '4px solid #fff', borderTop: '4px solid #fff', borderTopRightRadius: '8px' }} />
                {/* Bottom-left corner */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderLeft: '4px solid #fff', borderBottom: '4px solid #fff', borderBottomLeftRadius: '8px' }} />
                {/* Bottom-right corner */}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderRight: '4px solid #fff', borderBottom: '4px solid #fff', borderBottomRightRadius: '8px' }} />
              </div>
            </div>
          )}

          {/* Scan Result Status card - Always visible */}
          <div style={{
            flex: '1 1 280px',
            padding: '16px',
            borderRadius: '12px',
            background: result 
              ? (isSuccess ? '#0a2a0a' : isAlreadyScanned ? '#1a1a0a' : '#1a0a0a')
              : (scanning ? '#0f172a' : '#111'),
            border: `1px solid ${
              result 
                ? (isSuccess ? '#166534' : isAlreadyScanned ? '#713f12' : '#7f1d1d')
                : (scanning ? '#1e3a8a' : '#222')
            }`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>
              {result 
                ? (isSuccess ? '✅' : isAlreadyScanned ? '⚠️' : '❌')
                : (scanning ? '🔍' : '💤')}
            </div>
            
            {/* 1. Active Scan Results */}
            {result && isSuccess && 'success' in result && result.success && (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>Check-in Successful!</p>
                <p style={{ margin: '0 0 4px', fontSize: '15px', color: '#e5e5e5' }}>{result.studentName}</p>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#86efac' }}>{result.registrationNo}</p>
              </>
            )}
            {result && isAlreadyScanned && 'error' in result && (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#facc15' }}>Already Scanned</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#a3a3a3' }}>Originally scanned at {new Date('scannedAt' in result ? result.scannedAt : '').toLocaleTimeString()}</p>
              </>
            )}
            {result && isError && 'error' in result && (
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f87171' }}>{result.error === 'invalid_token' ? 'Invalid QR Code' : result.error}</p>
            )}

            {/* 2. Scanning State (No Result) */}
            {!result && scanning && (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#60a5fa' }}>Scanning for Ticket...</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Point the camera at the attendee's QR code.</p>
              </>
            )}

            {/* 3. Idle State (No Result, Not Scanning) */}
            {!result && !scanning && (
              <>
                <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#64748b' }}>Scanner Offline</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Choose an event above and click Start Scanning.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
