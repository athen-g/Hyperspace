import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'

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
  const [gameState, setGameState] = useState<'lobby' | 'get-ready' | 'question' | 'answers' | 'leaderboard' | 'ended'>('lobby')
  const [gameMode, setGameMode] = useState<'classic' | 'shared'>('classic')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(0)
  const [readyCountdown, setReadyCountdown] = useState(3)
  const [answerStats, setAnswerStats] = useState<number[]>([0, 0, 0, 0])
  const channelRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const readyTimerRef = useRef<any>(null)

  // Track previous scores to animate leaderboards
  const [prevLeaderboard, setPrevLeaderboard] = useState<Record<string, number>>({})

  useEffect(() => {
    if (codeSlug) {
      supabase
        .from('quizzes')
        .select('id')
        .eq('code_slug', codeSlug)
        .single()
        .then(({ data }) => {
          if (data) {
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
              let points = 0
              if (isCorrect) {
                const ratio = payload.timeSpent / currentQuestion.time_limit
                points = Math.round(1000 * (1 - ratio * 0.5))
              }
              return { ...p, score: p.score + points, answered: true }
            }
            return p
          })

          const allAnswered = updated.length > 0 && updated.every(p => p.answered)
          if (allAnswered) {
            setTimeout(() => {
              endQuestion()
            }, 100)
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
    triggerGetReady(0)
  }

  const triggerGetReady = (index: number) => {
    setCurrentIndex(index)
    setAnswerStats([0, 0, 0, 0])
    setPlayers((prev) => prev.map((p) => ({ ...p, answered: false })))
    setGameState('get-ready')
    setReadyCountdown(3)

    // Notify players to show ready screen
    channelRef.current.send({
      type: 'broadcast',
      event: 'get-ready',
      payload: {
        questionText: questions[index].question_text,
        questionIndex: index + 1,
        totalQuestions: questions.length
      }
    })

    if (readyTimerRef.current) clearInterval(readyTimerRef.current)
    readyTimerRef.current = setInterval(() => {
      setReadyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(readyTimerRef.current)
          startQuestionTimer(index)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startQuestionTimer = (index: number) => {
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
    // Record current standings before updating state
    const scores: Record<string, number> = {}
    players.forEach(p => {
      scores[p.id] = p.score
    })
    setPrevLeaderboard(scores)
    setGameState('leaderboard')
  }

  const nextStep = () => {
    if (currentIndex + 1 < questions.length) {
      triggerGetReady(currentIndex + 1)
    } else {
      setGameState('ended')
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']

  const totalAnsweredCount = players.filter(p => p.answered).length

  return (
    <div style={{ background: '#1c0c3a', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* Return to Dashboard corner button */}
      <button 
        onClick={() => {
          if (confirm('Exit hosting session?')) navigate('/admin/quiz')
        }}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '24px',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontWeight: 600,
          zIndex: 100
        }}
      >
        ← Leave
      </button>
      
      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <div style={{ textAlign: 'center', marginTop: '4vh', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ fontSize: '16px', letterSpacing: '4px', color: '#b9a7eb', fontWeight: 700 }}>JOIN THE GAME AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '80px', margin: '15px 0', letterSpacing: '-2px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', fontWeight: 900 }}>PIN: <span style={{ color: '#00BCD4' }}>{pin}</span></h1>
          
          <div style={{ background: '#fff', padding: '16px', borderRadius: '24px', display: 'inline-block', marginBottom: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', transform: 'rotate(-2deg)' }}>
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={200} level="M" includeMargin={true} />
            <div style={{ color: '#1c0c3a', fontSize: '13px', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>SCAN QR CODE</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', maxWidth: '700px', margin: '0 auto', minHeight: '200px' }}>
            <h3 style={{ fontSize: '24px', margin: '0 0 24px', color: '#00BCD4', fontWeight: 800 }}>
              {players.length === 0 ? 'Waiting for players to join...' : `Joined Players (${players.length})`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: '#fff', color: '#1c0c3a', fontWeight: 700, padding: '10px 24px', borderRadius: '30px', fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transform: 'scale(1)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {p.nickname}
                </div>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div style={{ margin: '32px auto 0', maxWidth: '450px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '13px', color: '#b9a7eb', fontWeight: 700, letterSpacing: '1px' }}>LOBBY GAME MODE</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setGameMode('classic')} style={{ flex: 1, background: gameMode === 'classic' ? '#E91E63' : 'transparent', border: '2px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Classic</button>
              <button onClick={() => setGameMode('shared')} style={{ flex: 1, background: gameMode === 'shared' ? '#00BCD4' : 'transparent', border: '2px solid rgba(255,255,255,0.2)', color: gameMode === 'shared' ? '#000' : '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Shared Screen</button>
            </div>
          </div>

          <button onClick={startQuiz} disabled={players.length === 0} style={{ marginTop: '32px', background: players.length === 0 ? '#444' : '#00BCD4', color: players.length === 0 ? '#888' : '#000', border: 'none', borderRadius: '30px', padding: '16px 48px', fontSize: '20px', fontWeight: 800, cursor: players.length === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 8px 25px rgba(0,188,212,0.4)', transition: 'all 0.2s' }}>
            Start Quiz
          </button>
        </div>
      )}

      {/* 2. GET READY countdown state */}
      {gameState === 'get-ready' && questions[currentIndex] && (
        <div style={{ textAlign: 'center', marginTop: '15vh', animation: 'fadeIn 0.4s' }}>
          <p style={{ fontSize: '18px', letterSpacing: '6px', color: '#00BCD4', fontWeight: 700 }}>GET READY FOR QUESTION {currentIndex + 1}</p>
          <h1 style={{ fontSize: '40px', margin: '40px 0', fontWeight: 800 }}>{questions[currentIndex].question_text}</h1>
          <div style={{ fontSize: '120px', fontWeight: 900, color: '#E91E63', animation: 'pulse 1s infinite' }}>{readyCountdown}</div>
        </div>
      )}

      {/* 3. QUESTION STATE */}
      {gameState === 'question' && questions[currentIndex] && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '16px', color: '#b9a7eb', fontWeight: 700, letterSpacing: '2px' }}>QUESTION {currentIndex + 1} OF {questions.length}</span>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#b9a7eb' }}>Answers: <span style={{ color: '#00BCD4', fontSize: '24px' }}>{totalAnsweredCount}</span></div>
              <div style={{ background: '#fff', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 800, color: '#1c0c3a', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>{timer}</div>
            </div>
          </div>

          <h2 style={{ fontSize: '36px', textAlign: 'center', margin: '30px 0 60px', fontWeight: 800 }}>{questions[currentIndex].question_text}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            {questions[currentIndex].options.map((opt, i) => (
              <div key={i} style={{ background: optionColors[i], borderRadius: '16px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px', fontSize: '24px', fontWeight: 700, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '36px' }}>{optionShapes[i]}</span>
                {opt}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={endQuestion} style={{ background: '#E91E63', border: 'none', borderRadius: '24px', color: '#fff', padding: '12px 36px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Skip Question</button>
            <button onClick={() => { if (confirm('End early?')) setGameState('ended') }} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '24px', color: '#fff', padding: '12px 36px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 4. ANSWERS DISTRIBUTION VIEW */}
      {gameState === 'answers' && questions[currentIndex] && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Correct Answer</h2>
            <span style={{ fontSize: '16px', color: '#b9a7eb', fontWeight: 700 }}>Total submissions: {totalAnsweredCount}</span>
          </div>

          <h2 style={{ fontSize: '32px', textAlign: 'center', margin: '0 0 60px', color: '#b9a7eb' }}>{questions[currentIndex].question_text}</h2>

          {/* Bar Chart Representation of Responses */}
          <div style={{ display: 'flex', height: '240px', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '40px 20px', borderRadius: '24px', marginBottom: '40px' }}>
            {answerStats.map((count, i) => {
              const maxCount = Math.max(...answerStats, 1)
              const heightPercent = (count / maxCount) * 100
              const isCorrect = i === questions[currentIndex].correct_option

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{count}</div>
                  <div style={{ width: '80%', height: `${heightPercent}%`, background: optionColors[i], borderRadius: '8px 8px 0 0', position: 'relative', border: isCorrect ? '4px solid #fff' : 'none', boxShadow: isCorrect ? '0 0 20px #fff' : 'none' }}>
                    {isCorrect && (
                      <span style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '20px' }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: '20px', marginTop: '12px' }}>{optionShapes[i]}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={showLeaderboard} style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '24px', padding: '14px 48px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,188,212,0.3)' }}>Show Standings</button>
            <button onClick={() => { if (confirm('End early?')) setGameState('ended') }} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '24px', color: '#fff', padding: '14px 36px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 5. LEADERBOARD STATE */}
      {gameState === 'leaderboard' && (
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700 }}>CURRENT STANDINGS</p>
          <h1 style={{ fontSize: '48px', margin: '10px 0 40px', fontWeight: 900 }}>Leaderboard</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {sortedPlayers.slice(0, 5).map((p, index) => {
              const prevScore = prevLeaderboard[p.id] ?? 0
              const climbed = p.score > prevScore && prevScore !== 0
              
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 32px', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#fff' }}>#{index + 1}</span>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>{p.nickname}</span>
                    {climbed && (
                      <span style={{ background: '#26890c', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>▲ CLIMBED</span>
                    )}
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#00BCD4' }}>{p.score} pts</span>
                </div>
              )
            })}
          </div>

          <button onClick={nextStep} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '30px', padding: '16px 48px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(233,30,99,0.4)' }}>
            {currentIndex + 1 < questions.length ? 'Next Question' : 'End Game'}
          </button>
        </div>
      )}

      {/* 6. ENDED STATE */}
      {gameState === 'ended' && (
        <div style={{ textAlign: 'center', marginTop: '6vh', animation: 'fadeIn 0.8s' }}>
          <p style={{ fontSize: '16px', letterSpacing: '6px', color: '#00BCD4', fontWeight: 800 }}>QUIZ COMPLETED</p>
          <h1 style={{ fontSize: '64px', margin: '20px 0 50px', fontWeight: 900 }}>Final Results Podium</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', minHeight: '320px', marginBottom: '60px' }}>
            
            {/* 2nd Place */}
            {sortedPlayers[1] && (
              <div style={{ width: '160px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', animation: 'slideUp 0.6s ease-out' }}>
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>🥈</span>
                <span style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0', color: '#fff' }}>{sortedPlayers[1].nickname}</span>
                <span style={{ fontSize: '14px', color: '#b9a7eb' }}>{sortedPlayers[1].score} pts</span>
                <div style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.1)', marginTop: '20px', borderRadius: '8px' }}></div>
              </div>
            )}

            {/* 1st Place */}
            {sortedPlayers[0] && (
              <div style={{ width: '180px', background: 'rgba(255,255,255,0.1)', border: '2px solid #ffd700', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', animation: 'slideUp 0.4s ease-out', boxShadow: '0 0 30px rgba(255,215,0,0.2)' }}>
                <span style={{ fontSize: '48px', marginBottom: '8px' }}>👑</span>
                <span style={{ fontSize: '20px', fontWeight: 800, margin: '8px 0', color: '#ffd700' }}>{sortedPlayers[0].nickname}</span>
                <span style={{ fontSize: '16px', color: '#fff', fontWeight: 700 }}>{sortedPlayers[0].score} pts</span>
                <div style={{ width: '100%', height: '140px', background: 'rgba(255,215,0,0.15)', marginTop: '20px', borderRadius: '8px' }}></div>
              </div>
            )}

            {/* 3rd Place */}
            {sortedPlayers[2] && (
              <div style={{ width: '140px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', animation: 'slideUp 0.8s ease-out' }}>
                <span style={{ fontSize: '28px', marginBottom: '8px' }}>🥉</span>
                <span style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0', color: '#fff' }}>{sortedPlayers[2].nickname}</span>
                <span style={{ fontSize: '14px', color: '#b9a7eb' }}>{sortedPlayers[2].score} pts</span>
                <div style={{ width: '100%', height: '70px', background: 'rgba(255,255,255,0.05)', marginTop: '20px', borderRadius: '8px' }}></div>
              </div>
            )}

          </div>

          <button onClick={() => navigate('/admin/quiz')} style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: '#fff', padding: '16px 40px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00BCD4'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
            Exit to Dashboard
          </button>
        </div>
      )}

      {/* Styled custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(150px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
