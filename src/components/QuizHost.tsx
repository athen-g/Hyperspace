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

  // Demo state config
  const [isDemo, setIsDemo] = useState(false)
  const demoIntervalRef = useRef<any>(null)

  // QR Modal State
  const [qrZoomed, setQrZoomed] = useState(false)

  // Leaderboard scoring transition states
  const [prevLeaderboard, setPrevLeaderboard] = useState<Record<string, number>>({})
  const [animatingStandings, setAnimatingStandings] = useState(false)
  const [activeLeaderboardPlayers, setActiveLeaderboardPlayers] = useState<Player[]>([])
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({})

  // Ended view sub-tabs
  const [endedTab, setEndedTab] = useState<'podium' | 'summary'>('podium')
  const [podiumRevealStep, setPodiumRevealStep] = useState<number>(0) // 0: None, 1: 3rd place, 2: 2nd place, 3: 1st place complete

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
          const next = [...prev, { id: payload.id, nickname: payload.nickname, score: 0, answered: false }]
          channel.send({
            type: 'broadcast',
            event: 'lobby-update',
            payload: { players: next.map(p => p.nickname) }
          })
          return next
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
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    }
  }, [pin, questions, currentIndex])

  // Automatically trigger bot responses in demo mode when question phase starts
  useEffect(() => {
    if (gameState === 'question' && isDemo && players.length > 0) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
      
      // Bots submit random option selections after random delay durations
      players.forEach(p => {
        const delay = Math.random() * 4000 + 1000 // 1-5s
        setTimeout(() => {
          if (gameState !== 'question') return
          const randOption = Math.floor(Math.random() * 4)
          
          setPlayers((prev) => {
            const updated = prev.map(pl => {
              if (pl.id === p.id && !pl.answered) {
                const currentQuestion = questions[currentIndex]
                const isCorrect = randOption === currentQuestion.correct_option
                let points = 0
                if (isCorrect) {
                  const ratio = (delay / 1000) / currentQuestion.time_limit
                  points = Math.round(1000 * (1 - ratio * 0.5))
                }
                return { ...pl, score: pl.score + points, answered: true }
              }
              return pl
            })
            
            const allAnswered = updated.length > 0 && updated.every(pl => pl.answered)
            if (allAnswered) {
              setTimeout(() => {
                endQuestion()
              }, 100)
            }
            return updated
          })
          
          setAnswerStats((prev) => {
            const nextStats = [...prev]
            nextStats[randOption]++
            return nextStats
          })
        }, delay)
      })
    }
  }, [gameState, isDemo])

  const startQuiz = () => {
    if (questions.length === 0) return
    triggerGetReady(0)
  }

  const startDemo = () => {
    setIsDemo(true)
    // Seed 4 demo bot players
    const botPlayers: Player[] = [
      { id: 'bot1', nickname: 'NovaBot 🤖', score: 0, answered: false },
      { id: 'bot2', nickname: 'StellarBot 🤖', score: 0, answered: false },
      { id: 'bot3', nickname: 'CosmoBot 🤖', score: 0, answered: false },
      { id: 'bot4', nickname: 'ApexBot 🤖', score: 0, answered: false }
    ]
    setPlayers(botPlayers)
    
    // Broadcast ready update list
    setTimeout(() => {
      channelRef.current.send({
        type: 'broadcast',
        event: 'lobby-update',
        payload: { players: botPlayers.map(b => b.nickname) }
      })
      
      triggerGetReady(0)
    }, 500)
  }

  const triggerGetReady = (index: number) => {
    setCurrentIndex(index)
    setAnswerStats([0, 0, 0, 0])
    setPlayers((prev) => prev.map((p) => ({ ...p, answered: false })))
    setGameState('get-ready')
    setReadyCountdown(3)

    // Notify clients to display ready buffer screen
    channelRef.current.send({
      type: 'broadcast',
      event: 'get-ready',
      payload: {
        questionText: questions[index].question_text,
        questionIndex: index + 1,
        totalQuestions: questions.length,
        gameMode: gameMode
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
    
    // Broadcast correct index and stats answer distribution
    channelRef.current.send({
      type: 'broadcast',
      event: 'time-up',
      payload: { 
        correctOption: questions[currentIndex].correct_option,
        answerStats: answerStats
      },
    })
  }

  const showLeaderboard = () => {
    const oldSorted = [...players].sort((a, b) => {
      const aPrev = prevLeaderboard[a.id] ?? 0
      const bPrev = prevLeaderboard[b.id] ?? 0
      return bPrev - aPrev
    })

    // Setup initial scores representation values matching prevLeaderboard
    const initialScores: Record<string, number> = {}
    players.forEach(p => {
      initialScores[p.id] = prevLeaderboard[p.id] ?? 0
    })
    setAnimatedScores(initialScores)
    setActiveLeaderboardPlayers(oldSorted.slice(0, 5))
    setAnimatingStandings(true)
    setGameState('leaderboard')

    // 1. Wait 1.5 seconds, then count up points and re-order ranks
    setTimeout(() => {
      const finalSorted = [...players].sort((a, b) => b.score - a.score)
      
      // Animate score count up increments
      finalSorted.forEach(p => {
        const start = prevLeaderboard[p.id] ?? 0
        const end = p.score
        if (start === end) return
        
        let currentVal = start
        const steps = 15
        const stepVal = Math.ceil((end - start) / steps)
        const scoreInterval = setInterval(() => {
          currentVal += stepVal
          if (currentVal >= end) {
            currentVal = end
            clearInterval(scoreInterval)
          }
          setAnimatedScores(prev => ({ ...prev, [p.id]: currentVal }))
        }, 30)
      })

      // Shift position layouts
      setActiveLeaderboardPlayers(finalSorted.slice(0, 5))
      setAnimatingStandings(false)

      // Notify students of updated rank status details
      const standingsMapping: Record<string, { rank: number; score: number }> = {}
      finalSorted.forEach((p, idx) => {
        standingsMapping[p.id] = { rank: idx + 1, score: p.score }
      })
      channelRef.current.send({
        type: 'broadcast',
        event: 'leaderboard-update',
        payload: { standings: standingsMapping }
      })

      // Update prevLeaderboard tracker references
      const scores: Record<string, number> = {}
      players.forEach(p => {
        scores[p.id] = p.score
      })
      setPrevLeaderboard(scores)
    }, 1500)
  }

  const nextStep = () => {
    if (currentIndex + 1 < questions.length) {
      triggerGetReady(currentIndex + 1)
    } else {
      triggerEndQuiz()
    }
  }

  const triggerEndQuiz = () => {
    setGameState('ended')
    setEndedTab('podium')
    setPodiumRevealStep(0)

    // Notify clients that host is building up final podium rankings
    channelRef.current.send({
      type: 'broadcast',
      event: 'podium-building',
      payload: {}
    })

    // Slow step-by-step podium reveal countdown timers
    setTimeout(() => {
      setPodiumRevealStep(1) // Show 3rd place
      confetti({ particleCount: 40, spread: 45, origin: { x: 0.8, y: 0.6 } })
      
      setTimeout(() => {
        setPodiumRevealStep(2) // Show 2nd place
        confetti({ particleCount: 40, spread: 45, origin: { x: 0.2, y: 0.6 } })

        setTimeout(() => {
          setPodiumRevealStep(3) // Show 1st place complete
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } })

          // Send final standings map so student client resolves rank and total score
          const finalSorted = [...players].sort((a, b) => b.score - a.score)
          const standingsMapping: Record<string, { rank: number; score: number }> = {}
          finalSorted.forEach((p, idx) => {
            standingsMapping[p.id] = { rank: idx + 1, score: p.score }
          })
          channelRef.current.send({
            type: 'broadcast',
            event: 'time-up',
            payload: { correctOption: -1, standings: standingsMapping }
          })
        }, 3000)
      }, 3000)
    }, 3000)
  }

  const handlePlayAgain = () => {
    setGameState('lobby')
    setPlayers([])
    setCurrentIndex(0)
    setPrevLeaderboard({})
    setAnswerStats([0, 0, 0, 0])
    setIsDemo(false)
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']
  const totalAnsweredCount = players.filter(p => p.answered).length

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', width: '100%', color: '#fff', padding: '40px', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
      
      {/* Return to Dashboard corner button */}
      <button 
        onClick={() => {
          if (confirm('Exit hosting session?')) navigate('/admin/quiz')
        }}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #333',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
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
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ fontSize: '20px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700 }}>JOIN THE GAME AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '110px', margin: '15px 0', letterSpacing: '-2px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', fontWeight: 900 }}>PIN: <span style={{ color: '#E91E63' }}>{pin}</span></h1>
          
          <div 
            onClick={() => setQrZoomed(!qrZoomed)} 
            style={{ 
              background: '#fff', 
              padding: '24px', 
              borderRadius: '24px', 
              display: 'inline-block', 
              marginBottom: '32px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transform: qrZoomed ? 'scale(1.8)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              zIndex: 99,
              position: 'relative'
            }}
          >
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={qrZoomed ? 280 : 180} level="M" includeMargin={true} />
            <div style={{ color: '#000', fontSize: '12px', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>{qrZoomed ? 'CLICK TO MINIMIZE' : 'CLICK TO ENLARGE'}</div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '200px' }}>
            <h3 style={{ fontSize: '28px', margin: '0 0 24px', color: '#00BCD4', fontWeight: 800 }}>
              {players.length === 0 ? 'Waiting for players to join...' : `Joined Players (${players.length})`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', fontWeight: 700, padding: '12px 28px', borderRadius: '30px', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {p.nickname}
                </div>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div style={{ margin: '32px auto 0', maxWidth: '450px', background: '#111', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #222' }}>
            <span style={{ fontSize: '14px', color: '#888', fontWeight: 700, letterSpacing: '1px' }}>LOBBY GAME MODE</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setGameMode('classic')} style={{ flex: 1, background: gameMode === 'classic' ? '#E91E63' : 'transparent', border: '1px solid #333', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '15px' }}>Classic Mode</button>
              <button onClick={() => setGameMode('shared')} style={{ flex: 1, background: gameMode === 'shared' ? '#00BCD4' : 'transparent', border: '1px solid #333', color: gameMode === 'shared' ? '#000' : '#fff', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '15px' }}>Shared Screen</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
            <button onClick={startQuiz} disabled={players.length === 0} style={{ background: players.length === 0 ? '#222' : '#00BCD4', color: players.length === 0 ? '#555' : '#000', border: 'none', borderRadius: '8px', padding: '18px 60px', fontSize: '24px', fontWeight: 800, cursor: players.length === 0 ? 'not-allowed' : 'pointer', boxShadow: players.length === 0 ? 'none' : '0 8px 25px rgba(0,188,212,0.4)', transition: 'all 0.2s' }}>
              Start Quiz
            </button>
            <button onClick={startDemo} style={{ background: 'transparent', border: '2px solid #00BCD4', color: '#00BCD4', borderRadius: '8px', padding: '18px 40px', fontSize: '20px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
              Host Demo 🤖
            </button>
          </div>
        </div>
      )}

      {/* 2. GET READY countdown state */}
      {gameState === 'get-ready' && questions[currentIndex] && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s' }}>
          <p style={{ fontSize: '24px', letterSpacing: '6px', color: '#00BCD4', fontWeight: 700 }}>GET READY FOR QUESTION {currentIndex + 1}</p>
          <h1 style={{ fontSize: '56px', margin: '40px 0', fontWeight: 900, lineHeight: 1.2 }}>{questions[currentIndex].question_text}</h1>
          <div style={{ fontSize: '160px', fontWeight: 950, color: '#E91E63', animation: 'pulse 1s infinite' }}>{readyCountdown}</div>
        </div>
      )}

      {/* 3. QUESTION STATE */}
      {gameState === 'question' && questions[currentIndex] && (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '20px', color: '#888', fontWeight: 700, letterSpacing: '2px' }}>QUESTION {currentIndex + 1} OF {questions.length}</span>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#888' }}>Answers: <span style={{ color: '#00BCD4', fontSize: '32px' }}>{totalAnsweredCount}</span></div>
              <div style={{ background: '#111', border: '1px solid #333', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '44px', fontWeight: 900, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>{timer}</div>
            </div>
          </div>

          <h2 style={{ fontSize: '48px', textAlign: 'center', margin: '30px 0 60px', fontWeight: 900, lineHeight: 1.2 }}>{questions[currentIndex].question_text}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            {questions[currentIndex].options.map((opt, i) => (
              <div key={i} style={{ background: optionColors[i], borderRadius: '16px', padding: '40px', display: 'flex', alignItems: 'center', gap: '28px', fontSize: '32px', fontWeight: 700, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '48px' }}>{optionShapes[i]}</span>
                {opt}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={endQuestion} style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '16px 48px', fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>Skip Question</button>
            <button onClick={() => { if (confirm('End early?')) triggerEndQuiz() }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '8px', padding: '16px 48px', fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 4. ANSWERS DISTRIBUTION VIEW */}
      {gameState === 'answers' && questions[currentIndex] && (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, margin: 0 }}>Correct Answer</h2>
            <span style={{ fontSize: '20px', color: '#888', fontWeight: 700 }}>Total submissions: {totalAnsweredCount}</span>
          </div>

          <h2 style={{ fontSize: '44px', textAlign: 'center', margin: '0 0 60px', color: '#fff', lineHeight: 1.2 }}>{questions[currentIndex].question_text}</h2>

          {/* Bar Chart Representation of Responses */}
          <div style={{ display: 'flex', height: '340px', alignItems: 'flex-end', justifyContent: 'space-around', gap: '24px', background: 'rgba(0,0,0,0.2)', padding: '50px 30px', borderRadius: '24px', marginBottom: '40px', boxSizing: 'border-box' }}>
            {answerStats.map((count, i) => {
              const maxCount = Math.max(...answerStats, 1)
              const heightPercent = (count / maxCount) * 100
              const isCorrect = i === questions[currentIndex].correct_option

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>{count}</div>
                  <div style={{ width: '80%', height: `${heightPercent}%`, background: optionColors[i], borderRadius: '8px 8px 0 0', position: 'relative', border: isCorrect ? '4px solid #fff' : 'none', boxShadow: isCorrect ? '0 0 20px #fff' : 'none', transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    {isCorrect && (
                      <span style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', fontSize: '28px' }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: '28px', marginTop: '12px' }}>{optionShapes[i]}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={showLeaderboard} style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '16px 60px', fontSize: '22px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,188,212,0.3)' }}>Show Standings</button>
            <button onClick={() => { if (confirm('End early?')) triggerEndQuiz() }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '8px', padding: '16px 48px', fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 5. LEADERBOARD STATE - Full screen height layout */}
      {gameState === 'leaderboard' && (
        <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'fadeIn 0.5s' }}>
          <p style={{ fontSize: '18px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700, margin: '0 0 10px' }}>CURRENT STANDINGS</p>
          <h1 style={{ fontSize: '64px', margin: '0 0 40px', fontWeight: 900 }}>Leaderboard</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center', marginBottom: '40px', position: 'relative' }}>
            {activeLeaderboardPlayers.map((p, index) => {
              const finalSortedIndex = sortedPlayers.findIndex(sp => sp.id === p.id)
              const displayRank = animatingStandings ? (players.findIndex(sp => sp.id === p.id) + 1) : (finalSortedIndex + 1)
              const displayScore = animatedScores[p.id] ?? p.score
              const prevScore = prevLeaderboard[p.id] ?? 0
              const climbed = !animatingStandings && p.score > prevScore && prevScore !== 0 && finalSortedIndex < index

              return (
                <div 
                  key={p.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(255,255,255,0.06)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px', 
                    padding: '24px 40px',
                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: displayRank === 1 ? '#ffd700' : displayRank === 2 ? '#c0c0c0' : displayRank === 3 ? '#cd7f32' : '#fff' }}>#{displayRank}</span>
                    <span style={{ fontSize: '28px', fontWeight: 700 }}>{p.nickname}</span>
                    {climbed && (
                      <span style={{ background: '#26890c', color: '#fff', fontSize: '13px', fontWeight: 800, padding: '6px 14px', borderRadius: '12px', animation: 'pulse 1s infinite' }}>▲ CLIMBED</span>
                    )}
                  </div>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#00BCD4' }}>{displayScore} pts</span>
                </div>
              )
            })}
          </div>

          <div>
            <button onClick={nextStep} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '8px', padding: '18px 60px', fontSize: '22px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(233,30,99,0.4)' }}>
              {currentIndex + 1 < questions.length ? 'Next Question' : 'End Game'}
            </button>
          </div>
        </div>
      )}

      {/* 6. ENDED STATE - WITH podium / summary tabs */}
      {gameState === 'ended' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.8s' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
            <button onClick={() => setEndedTab('podium')} style={{ background: endedTab === 'podium' ? '#00BCD4' : 'transparent', color: endedTab === 'podium' ? '#000' : '#fff', border: '1px solid #333', borderRadius: '8px', padding: '12px 32px', fontWeight: 700, cursor: 'pointer', fontSize: '18px' }}>Podium</button>
            <button onClick={() => setEndedTab('summary')} style={{ background: endedTab === 'summary' ? '#00BCD4' : 'transparent', color: endedTab === 'summary' ? '#000' : '#fff', border: '1px solid #333', borderRadius: '8px', padding: '12px 32px', fontWeight: 700, cursor: 'pointer', fontSize: '18px' }}>Session Summary</button>
            <button onClick={handlePlayAgain} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '8px', padding: '12px 32px', fontWeight: 700, cursor: 'pointer', fontSize: '18px' }}>Play Again</button>
          </div>

          {endedTab === 'podium' && (
            <div>
              <p style={{ fontSize: '20px', letterSpacing: '6px', color: '#00BCD4', fontWeight: 800 }}>QUIZ COMPLETED</p>
              <h1 style={{ fontSize: '64px', margin: '15px 0 40px', fontWeight: 900 }}>Final Results Podium</h1>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '24px', minHeight: '320px', marginBottom: '60px' }}>
                
                {/* 2nd Place */}
                {sortedPlayers[1] && podiumRevealStep >= 2 && (
                  <div style={{ width: '180px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', animation: 'slideUp 0.6s ease-out' }}>
                    <span style={{ fontSize: '36px', marginBottom: '8px' }}>🥈</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[1].nickname}</span>
                    <span style={{ fontSize: '16px', color: '#00BCD4' }}>{sortedPlayers[1].score} pts</span>
                    <div style={{ width: '100%', height: '110px', background: 'rgba(255,255,255,0.1)', marginTop: '20px', borderRadius: '8px' }}></div>
                  </div>
                )}

                {/* 1st Place */}
                {sortedPlayers[0] && podiumRevealStep >= 3 && (
                  <div style={{ width: '200px', background: 'rgba(255,255,255,0.1)', border: '2px solid #ffd700', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', animation: 'slideUp 0.4s ease-out', boxShadow: '0 0 30px rgba(255,215,0,0.2)' }}>
                    <span style={{ fontSize: '56px', marginBottom: '8px' }}>👑</span>
                    <span style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0', color: '#ffd700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[0].nickname}</span>
                    <span style={{ fontSize: '18px', color: '#fff', fontWeight: 700 }}>{sortedPlayers[0].score} pts</span>
                    <div style={{ width: '100%', height: '150px', background: 'rgba(255,215,0,0.15)', marginTop: '20px', borderRadius: '8px' }}></div>
                  </div>
                )}

                {/* 3rd Place */}
                {sortedPlayers[2] && podiumRevealStep >= 1 && (
                  <div style={{ width: '160px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', animation: 'slideUp 0.8s ease-out' }}>
                    <span style={{ fontSize: '32px', marginBottom: '8px' }}>🥉</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[2].nickname}</span>
                    <span style={{ fontSize: '15px', color: '#00BCD4' }}>{sortedPlayers[2].score} pts</span>
                    <div style={{ width: '100%', height: '70px', background: 'rgba(255,255,255,0.05)', marginTop: '20px', borderRadius: '8px' }}></div>
                  </div>
                )}

              </div>
            </div>
          )}

          {endedTab === 'summary' && (
            <div style={{ maxWidth: '800px', margin: '0 auto 40px', background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '32px', textAlign: 'left', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#00BCD4', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>Full Participant Standings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {sortedPlayers.map((p, index) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', borderBottom: '1px solid #1a1a1a', padding: '12px 0' }}>
                    <span>#{index + 1} {p.nickname}</span>
                    <span style={{ fontWeight: 700, color: '#00BCD4' }}>{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => navigate('/admin/quiz')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '16px 40px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00BCD4'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
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
