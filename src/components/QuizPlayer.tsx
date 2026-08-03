import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function QuizPlayer() {
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [joined, setJoined] = useState(false)
  const [status, setStatus] = useState<'lobby' | 'question' | 'waiting' | 'wrong' | 'correct' | 'ended'>('lobby')
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9))
  
  // Realtime state
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  
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
        timeLimitRef.current = payload.timeLimit
        setSelectedOption(null)
        setCorrectOption(null)
        startTimeRef.current = Date.now()
        setStatus('question')
      })
      .on('broadcast', { event: 'time-up' }, ({ payload }) => {
        setCorrectOption(payload.correctOption)
        setStatus((prev) => {
          if (prev === 'waiting') {
            const isCorrect = selectedOption === payload.correctOption
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
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#555', margin: '0 0 10px' }}>TAP THE CORRECT SHAPE</p>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: '60vh' }}>
            {options.map((_, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                style={{
                  background: optionColors[i],
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '54px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {optionShapes[i]}
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

    </div>
  )
}
