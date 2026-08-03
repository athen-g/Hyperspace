import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_option: number
  time_limit: number
}

interface Player {
  id: string
  nickname: string
  score: number
  answered: boolean
}

export default function QuizHost() {
  const { codeSlug } = useParams()
  const navigate = useNavigate()
  const [pin] = useState(() => Math.floor(100000 + Math.random() * 900000).toString())
  const [gameState, setGameState] = useState<'lobby' | 'question' | 'answers' | 'leaderboard' | 'ended'>('lobby')
  const [gameMode, setGameMode] = useState<'classic' | 'shared'>('classic') // classic: shapes only on phone, shared: questions+options also visible on phone
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(0)
  const [answerStats, setAnswerStats] = useState<number[]>([0, 0, 0, 0])
  const channelRef = useRef<any>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (codeSlug) {
      // Find the quiz ID from its short codeSlug
      supabase
        .from('quizzes')
        .select('id')
        .eq('code_slug', codeSlug)
        .single()
        .then(({ data }) => {
          if (data) {
            // Load questions
            supabase
              .from('quiz_questions')
              .select('*')
              .eq('quiz_id', data.id)
              .order('sort_order', { ascending: true })
              .then(({ data: qData }) => {
                if (qData) setQuestions(qData)
              })
          }
        })
    }
  }, [codeSlug])

  // Setup Supabase Realtime channel
  useEffect(() => {
    const channel = supabase.channel(`quiz-${pin}`, {
      config: {
        broadcast: { self: true, ack: true },
      },
    })

    channel
      .on('broadcast', { event: 'player-join' }, ({ payload }) => {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === payload.id)) return prev
          return [...prev, { id: payload.id, nickname: payload.nickname, score: 0, answered: false }]
        })
        // Acknowledge join
        channel.send({
          type: 'broadcast',
          event: 'join-ack',
          payload: { pin, success: true },
        })
      })
      .on('broadcast', { event: 'player-answer' }, ({ payload }) => {
        setPlayers((prev) => {
          const updated = prev.map((p) => {
            if (p.id === payload.id) {
              const currentQuestion = questions[currentIndex]
              const isCorrect = payload.optionIndex === currentQuestion.correct_option
              
              // Calculate Kahoot dynamic speed points
              let points = 0
              if (isCorrect) {
                const ratio = payload.timeSpent / currentQuestion.time_limit
                points = Math.round(1000 * (1 - ratio * 0.5))
              }
              return { ...p, score: p.score + points, answered: true }
            }
            return p
          })

          // If there are players in the game, and every single one of them has answered:
          const allAnswered = updated.length > 0 && updated.every(p => p.answered)
          if (allAnswered) {
            // Trigger time-up/end question immediately
            setTimeout(() => {
              endQuestion()
            }, 100) // Small delay for state stabilization
          }

          return updated
        })
        setAnswerStats((prev) => {
          const nextStats = [...prev]
          if (payload.optionIndex >= 0 && payload.optionIndex < 4) {
            nextStats[payload.optionIndex]++
          }
          return nextStats
        })
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [pin, questions, currentIndex])

  const startQuiz = () => {
    if (questions.length === 0) return
    showQuestion(0)
  }

  const showQuestion = (index: number) => {
    setCurrentIndex(index)
    setAnswerStats([0, 0, 0, 0])
    setPlayers((prev) => prev.map((p) => ({ ...p, answered: false })))
    setGameState('question')
    const currentQuestion = questions[index]
    setTimer(currentQuestion.time_limit)

    channelRef.current.send({
      type: 'broadcast',
      event: 'next-question',
      payload: {
        questionText: currentQuestion.question_text,
        options: currentQuestion.options,
        timeLimit: currentQuestion.time_limit,
        gameMode: gameMode,
      },
    })

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          endQuestion()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const endQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameState('answers')
    channelRef.current.send({
      type: 'broadcast',
      event: 'time-up',
      payload: { correctOption: questions[currentIndex].correct_option },
    })
  }

  const showLeaderboard = () => {
    setGameState('leaderboard')
  }

  const nextStep = () => {
    if (currentIndex + 1 < questions.length) {
      showQuestion(currentIndex + 1)
    } else {
      setGameState('ended')
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui', position: 'relative' }}>
      
      {/* Return to Dashboard corner button */}
      <button 
        onClick={() => {
          if (confirm('Exit hosting session? The current game state will be lost.')) {
            navigate('/admin/quiz')
          }
        }}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#aaa',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
          fontWeight: 600
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = '#aaa'
        }}
      >
        ← Return to Dashboard
      </button>
      
      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <div style={{ textAlign: 'center', marginTop: '5vh' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#888' }}>JOIN AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '72px', margin: '10px 0', letterSpacing: '-2px' }}>PIN: <span style={{ color: '#E91E63' }}>{pin}</span></h1>
          
          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={180} level="M" includeMargin={true} />
            <div style={{ color: '#000', fontSize: '12px', fontWeight: 700, marginTop: '8px', fontFamily: 'monospace' }}>SCAN TO PLAY</div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#bbb' }}>Waiting for players... ({players.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: '#222', border: '1px solid #333', padding: '8px 16px', borderRadius: '20px', fontSize: '15px' }}>{p.nickname}</div>
              ))}
            </div>
          </div>
          {/* Game Mode Selector */}
          <div style={{ margin: '24px auto', maxWidth: '400px', background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#888', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Select Interface Mode</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setGameMode('classic')} 
                style={{ 
                  flex: 1, 
                  background: gameMode === 'classic' ? '#E91E63' : 'transparent', 
                  border: '1px solid #333', 
                  color: '#fff', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Classic (Shapes Only)
              </button>
              <button 
                onClick={() => setGameMode('shared')} 
                style={{ 
                  flex: 1, 
                  background: gameMode === 'shared' ? '#00BCD4' : 'transparent', 
                  border: '1px solid #333', 
                  color: gameMode === 'shared' ? '#000' : '#fff', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Shared (Question on Phone)
              </button>
            </div>
          </div>

          <button onClick={startQuiz} style={{ marginTop: '16px', background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 36px', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}>
            Start Quiz
          </button>
        </div>
      )}

      {/* 2. QUESTION / ANSWERS STATE */}
      {(gameState === 'question' || gameState === 'answers') && questions[currentIndex] && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '14px', color: '#555', letterSpacing: '2px' }}>QUESTION {currentIndex + 1} OF {questions.length}</span>
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', fontWeight: 700, color: '#E91E63' }}>{timer}</div>
          </div>

          <h2 style={{ fontSize: '32px', textAlign: 'center', margin: '0 0 60px' }}>{questions[currentIndex].question_text}</h2>

          {/* Answer choices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            {questions[currentIndex].options.map((opt, i) => (
              <div key={i} style={{ 
                background: optionColors[i], 
                borderRadius: '12px', 
                padding: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                fontSize: '20px', 
                fontWeight: 600,
                opacity: gameState === 'answers' && i !== questions[currentIndex].correct_option ? 0.3 : 1,
                transition: 'opacity 0.4s ease, transform 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transform: gameState === 'answers' && i === questions[currentIndex].correct_option ? 'scale(1.05)' : 'scale(1)'
              }}>
                <span style={{ fontSize: '28px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{optionShapes[i]}</span>
                {opt}
              </div>
            ))}
          </div>

          {/* Action trigger panel */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
            {gameState === 'question' ? (
              <button onClick={endQuestion} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 30px', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s', fontWeight: 600 }}>Skip Question</button>
            ) : (
              <button onClick={showLeaderboard} style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 30px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }}>Show Leaderboard</button>
            )}
            <button onClick={() => {
              if (confirm('Are you sure you want to end this quiz early?')) {
                setGameState('ended')
                channelRef.current.send({
                  type: 'broadcast',
                  event: 'time-up',
                  payload: { correctOption: -1 } // End signal
                })
              }
            }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '8px', padding: '12px 30px', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', fontWeight: 600 }}>
              End Quiz Early
            </button>
          </div>
        </div>
      )}

      {/* 3. LEADERBOARD STATE */}
      {gameState === 'leaderboard' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 4px', letterSpacing: '2px', color: '#888' }}>RANKINGS</h2>
          <h1 style={{ fontSize: '48px', margin: '0 0 40px', fontWeight: 800 }}>Podium Leaderboard</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
            {sortedPlayers.slice(0, 5).map((p, index) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '16px 24px' }}>
                <span style={{ fontSize: '18px' }}><span style={{ color: '#E91E63', marginRight: '16px', fontWeight: 700 }}>#{index + 1}</span>{p.nickname}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#00BCD4' }}>{p.score} pts</span>
              </div>
            ))}
          </div>
          <button onClick={nextStep} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 36px', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}>
            {currentIndex + 1 < questions.length ? 'Next Question' : 'End Game'}
          </button>
        </div>
      )}

      {/* 4. ENDED STATE */}
      {gameState === 'ended' && (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#888' }}>MATCH COMPLETE</p>
          <h1 style={{ fontSize: '64px', margin: '20px 0 60px' }}>Final Results Podium</h1>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            <h2 style={{ margin: '0 0 24px', color: '#00BCD4' }}>Winner: {sortedPlayers[0]?.nickname || 'No one'}</h2>
            <p style={{ fontSize: '18px', color: '#888' }}>Final Score: {sortedPlayers[0]?.score || 0} points</p>
          </div>
          <button onClick={() => navigate('/admin/quiz')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', padding: '12px 24px', cursor: 'pointer' }}>Return to Hub</button>
        </div>
      )}

    </div>
  )
}
