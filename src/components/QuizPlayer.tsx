import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function QuizPlayer() {
  const location = useLocation()
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [joined, setJoined] = useState(false)
  const [status, setStatus] = useState<'lobby' | 'get-ready' | 'question' | 'waiting' | 'wrong' | 'correct' | 'ended'>('lobby')
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9))

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlPin = params.get('pin')
    if (urlPin) {
      setPin(urlPin)
    }
  }, [location])
  
  // Realtime state
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [gameMode, setGameMode] = useState<'classic' | 'shared'>('classic')
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const selectedOptionRef = useRef<number | null>(null)
  
  const [readyCountdown, setReadyCountdown] = useState(3)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(1)
  
  const channelRef = useRef<any>(null)
  const startTimeRef = useRef<number>(0)
  const timeLimitRef = useRef<number>(20)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || !nickname) return

    const channel = supabase.channel(`quiz-${pin}`, {
      config: {
        broadcast: { self: true, ack: true },
      },
    })

    channel
      .on('broadcast', { event: 'join-ack' }, () => {
        setJoined(true)
        setStatus('lobby')
      })
      .on('broadcast', { event: 'get-ready' }, ({ payload }) => {
        setQuestionText(payload.questionText)
        setCurrentQuestionIndex(payload.questionIndex)
        setTotalQuestions(payload.totalQuestions)
        setReadyCountdown(3)
        setStatus('get-ready')

        // Start local 3s countdown mirroring host
        const interval = setInterval(() => {
          setReadyCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      })
      .on('broadcast', { event: 'next-question' }, ({ payload }) => {
        setQuestionText(payload.questionText)
        setOptions(payload.options)
        setGameMode(payload.gameMode || 'classic')
        timeLimitRef.current = payload.timeLimit
        setSelectedOption(null)
        selectedOptionRef.current = null
        setCorrectOption(null)
        startTimeRef.current = Date.now()
        setStatus('question')
      })
      .on('broadcast', { event: 'time-up' }, ({ payload }) => {
        if (payload.correctOption === -1) {
          setStatus('ended')
          return
        }
        setCorrectOption(payload.correctOption)
        const chosen = selectedOptionRef.current
        setStatus(() => {
          if (chosen !== null) {
            const isCorrect = chosen === payload.correctOption
            return isCorrect ? 'correct' : 'wrong'
          }
          return 'wrong' // Did not answer in time
        })
      })
      .subscribe()

    channelRef.current = channel

    // Send join broadcast request
    setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'player-join',
        payload: { id: playerId, nickname },
      })
    }, 1000)
  }

  const submitAnswer = (optionIndex: number) => {
    if (status !== 'question') return
    setSelectedOption(optionIndex)
    selectedOptionRef.current = optionIndex
    setStatus('waiting')
    
    const timeSpent = (Date.now() - startTimeRef.current) / 1000

    channelRef.current.send({
      type: 'broadcast',
      event: 'player-answer',
      payload: {
        id: playerId,
        optionIndex,
        timeSpent: Math.min(timeSpent, timeLimitRef.current),
      },
    })
  }

  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']

  return (
    <div style={{ background: '#1c0c3a', minHeight: '100vh', color: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      {/* 1. LOBBY/PIN JOIN FORM */}
      {!joined && (
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', padding: '20px', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '32px', fontWeight: 800 }}>Join Quiz Game</h2>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Game PIN"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', padding: '14px 20px', fontSize: '18px', boxSizing: 'border-box', textAlign: 'center', fontWeight: 700 }}
            />
            <input
              type="text"
              placeholder="Your Nickname"
              required
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', padding: '14px 20px', fontSize: '18px', boxSizing: 'border-box', textAlign: 'center', fontWeight: 700 }}
            />
            <button type="submit" style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,188,212,0.3)' }}>
              Join Game
            </button>
          </form>
        </div>
      )}

      {/* 2. JOINED / WAITING IN LOBBY STATE */}
      {joined && status === 'lobby' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ fontSize: '36px', color: '#00BCD4', marginBottom: '16px', fontWeight: 800 }}>You're in!</h2>
          <p style={{ fontSize: '20px', color: '#b9a7eb', marginBottom: '8px' }}>Nickname: <strong>{nickname}</strong></p>
          <p style={{ fontSize: '16px', color: '#888' }}>Wait for the host to start the game.</p>
        </div>
      )}

      {/* 3. GET READY 3S MIRROR STATE */}
      {joined && status === 'get-ready' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700 }}>QUESTION {currentQuestionIndex} OF {totalQuestions}</p>
          <h2 style={{ fontSize: '28px', margin: '32px 0 20px', fontWeight: 800 }}>{questionText}</h2>
          <div style={{ fontSize: '80px', fontWeight: 950, color: '#E91E63', animation: 'pulse 1s infinite' }}>{readyCountdown}</div>
        </div>
      )}

      {/* 4. QUESTION ACTION CONTROLLER STATE */}
      {joined && status === 'question' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s' }}>
          {gameMode === 'shared' && (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '10px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{questionText}</h2>
            </div>
          )}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#b9a7eb', margin: '0 0 10px', fontWeight: 700, letterSpacing: '1px' }}>
            {gameMode === 'shared' ? 'TAP THE CORRECT ANSWER' : 'TAP THE CORRECT SHAPE'}
          </p>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: '50vh' }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                style={{
                  background: optionColors[i],
                  border: 'none',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: gameMode === 'shared' ? '16px' : '54px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  padding: '16px',
                  gap: '8px',
                  fontWeight: gameMode === 'shared' ? 700 : 400,
                  boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
                }}
              >
                <span style={{ fontSize: gameMode === 'shared' ? '28px' : '54px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{optionShapes[i]}</span>
                {gameMode === 'shared' && <span>{opt}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. WAITING FOR RESULTS STATE */}
      {joined && status === 'waiting' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏱️</div>
          <h2 style={{ fontSize: '28px', color: '#00BCD4', marginBottom: '12px', fontWeight: 800 }}>Answer Submitted!</h2>
          <p style={{ fontSize: '16px', color: '#b9a7eb' }}>Waiting for other players to finish...</p>
        </div>
      )}

      {/* 6. CORRECT STATE */}
      {joined && status === 'correct' && (
        <div style={{ textAlign: 'center', animation: 'popIn 0.4s' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>✔️</h1>
          <h2 style={{ fontSize: '36px', color: '#26890c', fontWeight: 800 }}>Correct!</h2>
          <p style={{ fontSize: '16px', color: '#b9a7eb', marginTop: '12px' }}>You are on fire!</p>
        </div>
      )}

      {/* 7. WRONG STATE */}
      {joined && status === 'wrong' && (
        <div style={{ textAlign: 'center', animation: 'popIn 0.4s' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>❌</h1>
          <h2 style={{ fontSize: '36px', color: '#e21b3c', fontWeight: 800 }}>Incorrect</h2>
          <p style={{ fontSize: '16px', color: '#b9a7eb', marginTop: '12px' }}>Keep concentration for the next one!</p>
        </div>
      )}

      {/* 8. GAME ENDED STATE */}
      {joined && status === 'ended' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>🏁</h1>
          <h2 style={{ fontSize: '32px', color: '#00BCD4', fontWeight: 800 }}>Quiz Finished!</h2>
          <p style={{ fontSize: '16px', color: '#b9a7eb', marginTop: '12px', marginBottom: '32px' }}>Check the presenter screen for final rankings.</p>
          <a href="/" style={{ display: 'inline-block', textDecoration: 'none', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '24px', color: '#fff', padding: '12px 32px', fontWeight: 700, transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00BCD4' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}>
            Return to Hyperspace
          </a>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

    </div>
  )
}
