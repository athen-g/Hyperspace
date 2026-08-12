import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useEvents } from '../../hooks/useEvent'
import { Link, useSearchParams } from 'react-router-dom'

type ScanResult = 
  | { success: true; studentName: string; eventTitle: string; registrationNo: string; dayNumber?: number } 
  | { error: 'already_scanned'; scannedAt: string; dayNumber?: number } 
  | { error: string }

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
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate() === 14 ? 2 : 1)
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
          const { data, error } = await supabase.functions.invoke('scan-qr', { 
            body: { qr_token: token, day_number: selectedDay } 
          })
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
  }, [searchParams, setSearchParams, selectedDay])

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

            const { data, error } = await supabase.functions.invoke('scan-qr', { 
              body: { qr_token: token, day_number: selectedDay } 
            })

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
  }, [scanning, selectedDay])

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

        {/* Day Attendance Selector Toggle Buttons (Multi-day events only) */}
        {(() => {
          const selectedEvent = events.find(e => e.id === selectedEventId)
          const isMultiDay = selectedEvent?.slug === 'texture-distortion' || selectedEvent?.title?.toLowerCase().includes('texture distortion')
          if (!isMultiDay) return null

          return (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
                SCANNING FOR DAY:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setSelectedDay(1)}
                  style={{
                    padding: '10px',
                    background: selectedDay === 1 ? '#166534' : '#111',
                    border: `1px solid ${selectedDay === 1 ? '#22c55e' : '#222'}`,
                    borderRadius: '8px',
                    color: selectedDay === 1 ? '#fff' : '#888',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Day 1 (13 Aug) {selectedDay === 1 && '✓'}
                </button>
                <button
                  onClick={() => setSelectedDay(2)}
                  style={{
                    padding: '10px',
                    background: selectedDay === 2 ? '#15803d' : '#111',
                    border: `1px solid ${selectedDay === 2 ? '#22c55e' : '#222'}`,
                    borderRadius: '8px',
                    color: selectedDay === 2 ? '#fff' : '#888',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Day 2 (14 Aug) {selectedDay === 2 && '✓'}
                </button>
              </div>
            </div>
          )
        })()}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {!scanning ? (
            <button
              id="start-scanner"
              onClick={startScanner}
              disabled={!selectedEventId}
              style={{ flex: 1, padding: '12px', background: selectedEventId ? '#fff' : '#1a1a1a', color: selectedEventId ? '#000' : '#555', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: selectedEventId ? 'pointer' : 'not-allowed' }}
            >
              Start Scanning (Day {selectedDay})
            </button>
          ) : (
            <button onClick={stopScanner} style={{ flex: 1, padding: '12px', background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '8px', color: '#f87171', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Stop Scanner
            </button>
          )}
        </div>

        {/* Flex layout container for camera and status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Camera Container */}
          <div style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            overflow: 'hidden',
            aspectRatio: '4/3',
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div id="qr-reader" style={{ width: '100%', height: '100%' }} />
            {!scanning && (
              <div style={{ position: 'absolute', color: '#444', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                Camera is off. Select Day {selectedDay} and click "Start Scanning" to begin.
              </div>
            )}
          </div>

          {/* Status Display Area */}
          {result && (
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: isSuccess ? 'rgba(34, 197, 94, 0.1)' : isAlreadyScanned ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${isSuccess ? '#22c55e' : isAlreadyScanned ? '#eab308' : '#ef4444'}`,
              textAlign: 'center'
            }}>
              {isSuccess && (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
                  <h3 style={{ margin: '0 0 4px', color: '#22c55e', fontSize: '18px', fontWeight: 700 }}>
                    Day {result.dayNumber || selectedDay} Attendance Recorded!
                  </h3>
                  <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '15px', fontWeight: 600 }}>{result.studentName}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>{result.registrationNo} • {result.eventTitle}</p>
                </>
              )}

              {isAlreadyScanned && (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
                  <h3 style={{ margin: '0 0 4px', color: '#eab308', fontSize: '18px', fontWeight: 700 }}>
                    Day {result.dayNumber || selectedDay} Already Scanned
                  </h3>
                  <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>This student's Day {result.dayNumber || selectedDay} attendance was already recorded.</p>
                </>
              )}

              {isError && (
                <>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
                  <h3 style={{ margin: '0 0 4px', color: '#ef4444', fontSize: '18px', fontWeight: 700 }}>Scan Failed</h3>
                  <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>{result.error}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
