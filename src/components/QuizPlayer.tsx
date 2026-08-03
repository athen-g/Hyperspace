import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function QuizPlayer() {
  const location = useLocation()
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [joined, setJoined] = useState(false)
  const [status, setStatus] = useState<'lobby' | 'question' | 'waiting' | 'wrong' | 'correct' | 'ended'>('lobby')
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
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'system-ui', boxSizing: 'border-box' }}>
      
      {/* 1. LOBBY/PIN JOIN FORM */}
      {!joined && (
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '24px' }}>Join Kahoot Game</h2>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Game PIN"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '16px', fontSize: '18px', color: '#fff', textAlign: 'center' }}
            />
            <input
              type="text"
              placeholder="Nickname"
              required
              maxLength={12}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '16px', fontSize: '18px', color: '#fff', textAlign: 'center' }}
            />
            <button type="submit" style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}>Join Game</button>
          </form>
        </div>
      )}

      {/* 2. JOINED / WAITING IN LOBBY STATE */}
      {joined && status === 'lobby' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', color: '#00BCD4', marginBottom: '16px' }}>You are in!</h2>
          <p style={{ fontSize: '18px', color: '#888' }}>Look at the host screen. The quiz will start shortly.</p>
        </div>
      )}

      {/* 3. QUESTION ACTION CONTROLLER STATE */}
      {joined && status === 'question' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {gameMode === 'shared' && (
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px', marginBottom: '10px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{questionText}</h2>
            </div>
          )}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: '0 0 10px', fontWeight: 600 }}>
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
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: gameMode === 'shared' ? '16px' : '54px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, transform 0.1s',
                  padding: '16px',
                  gap: '8px',
                  fontWeight: gameMode === 'shared' ? 600 : 400
                }}
              >
                <span style={{ fontSize: gameMode === 'shared' ? '28px' : '54px' }}>{optionShapes[i]}</span>
                {gameMode === 'shared' && <span>{opt}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. WAITING FOR RESULTS STATE */}
      {joined && status === 'waiting' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', color: '#bbb', marginBottom: '12px' }}>Answer Submitted!</h2>
          <p style={{ fontSize: '16px', color: '#555' }}>Waiting for other players...</p>
        </div>
      )}

      {/* 5. CORRECT STATE */}
      {joined && status === 'correct' && (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '72px', margin: '0 0 16px' }}>🎉</h1>
          <h2 style={{ fontSize: '32px', color: '#26890c', fontWeight: 700 }}>Correct!</h2>
          <p style={{ fontSize: '16px', color: '#888', marginTop: '12px' }}>Keep it up!</p>
        </div>
      )}

      {/* 6. WRONG STATE */}
      {joined && status === 'wrong' && (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '72px', margin: '0 0 16px' }}>❌</h1>
          <h2 style={{ fontSize: '32px', color: '#e21b3c', fontWeight: 700 }}>Wrong</h2>
          <p style={{ fontSize: '16px', color: '#888', marginTop: '12px' }}>Better luck next question!</p>
        </div>
      )}

      {/* 7. GAME ENDED STATE */}
      {joined && status === 'ended' && (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '72px', margin: '0 0 16px' }}>🏁</h1>
          <h2 style={{ fontSize: '32px', color: '#00BCD4', fontWeight: 700 }}>Quiz Finished!</h2>
          <p style={{ fontSize: '16px', color: '#888', marginTop: '12px', marginBottom: '32px' }}>Check the presenter screen for the final podium rankings.</p>
          <a href="/" style={{ display: 'inline-block', textDecoration: 'none', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#aaa', padding: '10px 24px', fontWeight: 600, transition: 'color 0.2s, border-color 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00BCD4'; e.currentTarget.style.color = '#fff' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaa' }}>Return to Hyperspace</a>
        </div>
      )}

    </div>
  )
}
