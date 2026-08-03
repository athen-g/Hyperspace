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
  
  // States: lobby -> intro-build -> get-ready -> question -> answers -> leaderboard -> ended
  const [gameState, setGameState] = useState<'lobby' | 'intro-build' | 'get-ready' | 'question' | 'answers' | 'leaderboard' | 'ended'>('lobby')
  const [gameMode, setGameMode] = useState<'classic' | 'shared'>('classic')
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizTitle, setQuizTitle] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(0)
  const [readyCountdown, setReadyCountdown] = useState(3)
  const [answerStats, setAnswerStats] = useState<number[]>([0, 0, 0, 0])
  const channelRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const readyTimerRef = useRef<any>(null)

  // Demo config
  const [isDemo, setIsDemo] = useState(false)

  // QR Modal State
  const [qrZoomed, setQrZoomed] = useState(false)

  // Leaderboard scoring transition states
  const [prevLeaderboard, setPrevLeaderboard] = useState<Record<string, number>>({})
  const [animatingStandings, setAnimatingStandings] = useState(false)
  const [activeLeaderboardPlayers, setActiveLeaderboardPlayers] = useState<Player[]>([])
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({})
  
  // Control name card flash color state
  const [flashConfirm, setFlashConfirm] = useState(false)

  // Intro steps countdown
  const [introCountdown, setIntroCountdown] = useState(3)
  const [introTitleShow, setIntroTitleShow] = useState(false)

  // Ended view sub-tabs
  const [endedTab, setEndedTab] = useState<'podium' | 'summary'>('podium')
  const [podiumRevealStep, setPodiumRevealStep] = useState<number>(0)

  useEffect(() => {
    if (codeSlug) {
      supabase
        .from('quizzes')
        .select('id, title')
        .eq('code_slug', codeSlug)
        .single()
        .then(({ data }) => {
          if (data) {
            setQuizTitle(data.title)
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
    }
  }, [pin, questions, currentIndex])

  // Keyboard shortcut handlers (Space controls key steps)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameState === 'question') {
          endQuestion()
        } else if (gameState === 'answers') {
          showLeaderboard()
        } else if (gameState === 'leaderboard') {
          nextStep()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, currentIndex, questions, players])

  // Bot response simulation in Demo mode
  useEffect(() => {
    if (gameState === 'question' && isDemo && players.length > 0) {
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
    triggerIntroBuild()
  }

  const startDemo = () => {
    setIsDemo(true)
    const botPlayers: Player[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `bot${i}`,
      nickname: `SIGBot_${i + 1} 🤖`,
      score: 0,
      answered: false
    }))
    setPlayers(botPlayers)
    
    setTimeout(() => {
      channelRef.current.send({
        type: 'broadcast',
        event: 'lobby-update',
        payload: { players: botPlayers.map(b => b.nickname) }
      })
      triggerIntroBuild()
    }, 500)
  }

  // Phase 1: Slow build-up introduction screen
  const triggerIntroBuild = () => {
    setGameState('intro-build')
    setIntroCountdown(3)
    setIntroTitleShow(false)

    // Notify clients to display waiting buffer
    channelRef.current.send({
      type: 'broadcast',
      event: 'get-ready',
      payload: {
        questionText: 'Get Ready...',
        questionIndex: 1,
        totalQuestions: questions.length,
        gameMode: gameMode
      }
    })

    // 1. Step: 3s Countdown for Hyperspace XR SIG fade-in
    let elapsed = 3
    const introInterval = setInterval(() => {
      elapsed -= 1
      setIntroCountdown(elapsed)
      if (elapsed <= 0) {
        clearInterval(introInterval)
        
        // 2. Step: Show Quiz Title for 2.5s (no 'quiz template' prefix)
        setIntroTitleShow(true)
        setTimeout(() => {
          triggerGetReady(0)
        }, 2500)
      }
    }, 1000)
  }

  const triggerGetReady = (index: number) => {
    setCurrentIndex(index)
    setAnswerStats([0, 0, 0, 0])
    setPlayers((prev) => prev.map((p) => ({ ...p, answered: false })))
    setGameState('get-ready')
    setReadyCountdown(3)

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
    // 1. First, secure and render the exact current positions (old standings list order)
    const oldSorted = [...players].sort((a, b) => {
      const aPrev = prevLeaderboard[a.id] ?? 0
      const bPrev = prevLeaderboard[b.id] ?? 0
      return bPrev - aPrev
    })

    const initialScores: Record<string, number> = {}
    players.forEach(p => {
      initialScores[p.id] = prevLeaderboard[p.id] ?? 0
    })

    setAnimatedScores(initialScores)
    setActiveLeaderboardPlayers(oldSorted.slice(0, 5))
    setAnimatingStandings(false) // Static rendering layout
    setFlashConfirm(false)
    setGameState('leaderboard')

    // 2. Trigger the slide transitions & score counts smoothly after 800ms
    setTimeout(() => {
      setAnimatingStandings(true)
      const finalSorted = [...players].sort((a, b) => b.score - a.score)
      
      finalSorted.forEach(p => {
        const start = prevLeaderboard[p.id] ?? 0
        const end = p.score
        if (start === end) return
        
        let currentVal = start
        const steps = 30 // Slower score increment steps
        const stepVal = Math.ceil((end - start) / steps)
        const scoreInterval = setInterval(() => {
          currentVal += stepVal
          if (currentVal >= end) {
            currentVal = end
            clearInterval(scoreInterval)
          }
          setAnimatedScores(prev => ({ ...prev, [p.id]: currentVal }))
        }, 40)
      })

      // Swap positions
      setActiveLeaderboardPlayers(finalSorted.slice(0, 5))

      // 3. Confirm transition end, fade container backgrounds to white smoothly
      setTimeout(() => {
        setFlashConfirm(true)
        setAnimatingStandings(false)
      }, 1600) // Slower confirmation matching transition speeds

      const standingsMapping: Record<string, { rank: number; score: number }> = {}
      finalSorted.forEach((p, idx) => {
        standingsMapping[p.id] = { rank: idx + 1, score: p.score }
      })
      channelRef.current.send({
        type: 'broadcast',
        event: 'leaderboard-update',
        payload: { standings: standingsMapping }
      })

      const scores: Record<string, number> = {}
      players.forEach(p => {
        scores[p.id] = p.score
      })
      setPrevLeaderboard(scores)
    }, 800)
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

    channelRef.current.send({
      type: 'broadcast',
      event: 'podium-building',
      payload: {}
    })

    setTimeout(() => {
      setPodiumRevealStep(1)
      confetti({ particleCount: 40, spread: 45, origin: { x: 0.8, y: 0.6 } })
      
      setTimeout(() => {
        setPodiumRevealStep(2)
        confetti({ particleCount: 40, spread: 45, origin: { x: 0.2, y: 0.6 } })

        setTimeout(() => {
          setPodiumRevealStep(3)
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } })

          const finalSorted = [...players].sort((a, b) => b.score - a.score)
          const standingsMapping: Record<string, { rank: number; score: number }> = {}
          finalSorted.forEach((p, idx) => {
            standingsMapping[p.id] = { rank: idx + 1, score: p.score }
          })
          
          // Send correctOption: -1 event with correct rankings to finish quiz state
          channelRef.current.send({
            type: 'broadcast',
            event: 'time-up',
            payload: { correctOption: -1, standings: standingsMapping }
          })
        }, 3500)
      }, 3500)
    }, 3500)
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
  
  // Use original Kahoot colors
  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']
  const totalAnsweredCount = players.filter(p => p.answered).length

  return (
    <div style={{ background: '#09090e', height: '100vh', width: '100vw', color: '#fff', padding: '12px', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* Return to Dashboard corner button */}
      <button 
        onClick={() => {
          if (confirm('Exit hosting session?')) navigate('/admin/quiz')
        }}
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #333',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '12px',
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
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ fontSize: '18px', letterSpacing: '4px', color: '#e91e63', fontWeight: 700, margin: '0 0 10px' }}>JOIN THE GAME AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '90px', margin: '0 0 16px', letterSpacing: '-2px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', fontWeight: 900, lineHeight: 1 }}>PIN: <span style={{ color: '#e91e63' }}>{pin}</span></h1>
          
          <div 
            onClick={() => setQrZoomed(!qrZoomed)} 
            style={{ 
              background: '#fff', 
              padding: '16px', 
              borderRadius: '20px', 
              display: 'inline-block', 
              marginBottom: '20px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transform: qrZoomed ? 'scale(1.8)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              zIndex: 99,
              position: 'relative'
            }}
          >
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={qrZoomed ? 200 : 130} level="M" includeMargin={true} />
            <div style={{ color: '#000', fontSize: '10px', fontWeight: 800, marginTop: '4px', letterSpacing: '1px' }}>{qrZoomed ? 'CLICK TO MINIMIZE' : 'CLICK TO ENLARGE'}</div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px 40px', width: '100%', maxWidth: '95%', flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '30vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 16px', color: '#e91e63', fontWeight: 800 }}>
              {players.length === 0 ? 'Waiting for players to join...' : `Joined Players (${players.length})`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', fontWeight: 700, padding: '8px 20px', borderRadius: '30px', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {p.nickname}
                </div>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div style={{ margin: '20px 0', width: '100%', maxWidth: '400px', background: '#111', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #222' }}>
            <span style={{ fontSize: '12px', color: '#888', fontWeight: 700, letterSpacing: '1px' }}>LOBBY GAME MODE</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setGameMode('classic')} style={{ flex: 1, background: gameMode === 'classic' ? '#e91e63' : 'transparent', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>Classic Mode</button>
              <button onClick={() => setGameMode('shared')} style={{ flex: 1, background: gameMode === 'shared' ? '#e91e63' : 'transparent', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' }}>Shared Screen</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={startQuiz} disabled={players.length === 0} style={{ background: players.length === 0 ? '#222' : '#e91e63', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px 40px', fontSize: '18px', fontWeight: 800, cursor: players.length === 0 ? 'not-allowed' : 'pointer', boxShadow: players.length === 0 ? 'none' : '0 8px 25px rgba(233,30,99,0.4)', transition: 'all 0.2s' }}>
              Start Quiz
            </button>
            <button onClick={startDemo} style={{ background: 'transparent', border: '2px solid #e91e63', color: '#e91e63', borderRadius: '6px', padding: '12px 30px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
              Host Demo (10 Bots) 🤖
            </button>
          </div>
        </div>
      )}

      {/* 2. INTRO BUILD STATE - Slow build up sequence prior to question 1 */}
      {gameState === 'intro-build' && (
        <div style={{ background: '#09090e', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 999 }}>
          {!introTitleShow ? (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', boxSizing: 'border-box', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 3.507%', position: 'relative' }}>
                <span className="hero-title" style={{ position: 'static', fontSize: 'clamp(3rem, 10vw, 10vw)', color: '#E91E63', fontWeight: 900, fontFamily: 'mokoto, sans-serif', animation: 'scaleUpFadeGrow 3s forwards', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'block', lineHeight: '0.536' }}>HYPERSPACE</span>
                <span className="hero-subtitle" style={{ position: 'static', alignSelf: 'flex-end', fontSize: 'clamp(1.5rem, 4.64vw, 4.64vw)', color: '#fff', marginTop: '16px', fontFamily: 'mokoto, sans-serif', animation: 'scaleUpFadeGrow 3s forwards', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'block', marginRight: 'max(3.507%, calc(96.493vw - (clamp(3rem, 10vw, 10vw) * 6.64)))' }}>XR SIG</span>
              </div>
              {introCountdown > 0 && <div style={{ fontSize: '24px', color: '#444', textAlign: 'center', marginTop: '40px', fontWeight: 600 }}>Starting in {introCountdown}...</div>}
            </div>
          ) : (
            <div style={{ animation: 'fadeInOut 2.5s forwards', textAlign: 'center' }}>
              {/* Output quiz title solely with no prefix */}
              <h1 style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>{quizTitle}</h1>
            </div>
          )}
        </div>
      )}

      {/* 3. GET READY countdown state */}
      {gameState === 'get-ready' && questions[currentIndex] && (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.4s' }}>
          <p style={{ fontSize: '20px', letterSpacing: '6px', color: '#e91e63', fontWeight: 700, margin: '0 0 10px' }}>GET READY FOR QUESTION {currentIndex + 1}</p>
          <h1 style={{ fontSize: '44px', margin: '20px 0', fontWeight: 900, lineHeight: 1.2, maxWidth: '90%' }}>{questions[currentIndex].question_text}</h1>
          <div style={{ fontSize: '130px', fontWeight: 950, color: '#e91e63', animation: 'pulse 1s infinite', lineHeight: 1 }}>{readyCountdown}</div>
        </div>
      )}

      {/* 4. QUESTION STATE */}
      {gameState === 'question' && questions[currentIndex] && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'fadeIn 0.5s', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', color: '#888', fontWeight: 700, letterSpacing: '2px' }}>QUESTION {currentIndex + 1} OF {questions.length}</span>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#888' }}>Answers: <span style={{ color: '#e91e63', fontSize: '28px' }}>{totalAnsweredCount}</span></div>
              <div style={{ background: '#111', border: '1px solid #333', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '36px', fontWeight: 900, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>{timer}</div>
            </div>
          </div>

          <h2 style={{ fontSize: '40px', textAlign: 'center', margin: '20px 0', fontWeight: 900, lineHeight: 1.2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{questions[currentIndex].question_text}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {questions[currentIndex].options.map((opt, i) => (
              <div key={i} style={{ background: optionColors[i], borderRadius: '12px', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '20px', fontSize: '24px', fontWeight: 700, boxShadow: '0 6px 15px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '36px' }}>{optionShapes[i]}</span>
                {opt}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '10px' }}>
            <button onClick={endQuestion} style={{ background: '#e91e63', border: 'none', borderRadius: '6px', color: '#fff', padding: '8px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Skip Question [Space]</button>
            <button onClick={() => { if (confirm('End early?')) triggerEndQuiz() }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '6px', padding: '8px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 5. ANSWERS DISTRIBUTION VIEW */}
      {gameState === 'answers' && questions[currentIndex] && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'fadeIn 0.5s', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>Correct Answer</h2>
            <span style={{ fontSize: '18px', color: '#888', fontWeight: 700 }}>Total submissions: {totalAnsweredCount}</span>
          </div>

          <h2 style={{ fontSize: '36px', textAlign: 'center', margin: '15px 0', color: '#fff', lineHeight: 1.2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{questions[currentIndex].question_text}</h2>

          {/* Bar Chart Representation of Responses */}
          <div style={{ display: 'flex', height: '300px', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '30px 20px', borderRadius: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
            {answerStats.map((count, i) => {
              const maxCount = Math.max(...answerStats, 1)
              const heightPercent = (count / maxCount) * 100
              const isCorrect = i === questions[currentIndex].correct_option

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{count}</div>
                  <div style={{ width: '80%', height: `${heightPercent}%`, background: optionColors[i], borderRadius: '6px 6px 0 0', position: 'relative', border: isCorrect ? '3px solid #fff' : 'none', transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    {isCorrect && (
                      <span style={{ position: 'absolute', top: '-32px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px' }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: '24px', marginTop: '8px' }}>{optionShapes[i]}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '10px' }}>
            <button onClick={showLeaderboard} style={{ background: '#e91e63', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px 40px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(233,30,99,0.3)' }}>Show Standings [Space]</button>
            <button onClick={() => { if (confirm('End early?')) triggerEndQuiz() }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '6px', padding: '12px 32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 6. LEADERBOARD STATE */}
      {gameState === 'leaderboard' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.5s', padding: '0 12px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#e91e63', fontWeight: 700, margin: 0 }}>CURRENT STANDINGS</p>
            <h1 style={{ fontSize: '48px', margin: '5px 0 10px', fontWeight: 900 }}>Leaderboard</h1>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '96vw', flex: 1, justifyContent: 'center', position: 'relative' }}>
            {activeLeaderboardPlayers.map((p, index) => {
              // Lock indices based on old standings map first, then swap
              const baseSorted = [...players].sort((a, b) => {
                const aPrev = prevLeaderboard[a.id] ?? 0
                const bPrev = prevLeaderboard[b.id] ?? 0
                return bPrev - aPrev
              })
              const initialIndex = baseSorted.findIndex(sp => sp.id === p.id)
              const finalIndex = [...players].sort((a,b)=>b.score-a.score).findIndex(sp => sp.id === p.id)

              // Calculate stable transition offsets
              const currentOffset = animatingStandings ? (finalIndex - initialIndex) * 76 : 0
              const displayRank = animatingStandings ? (finalIndex + 1) : (initialIndex + 1)
              const displayScore = animatedScores[p.id] ?? p.score
              const prevScore = prevLeaderboard[p.id] ?? 0
              const climbed = !animatingStandings && p.score > prevScore && prevScore !== 0 && finalIndex < initialIndex

              return (
                <div 
                  key={p.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderRadius: '12px', 
                    padding: '20px 40px',
                    transition: 'transform 1.6s cubic-bezier(0.25, 1, 0.5, 1), background 1.6s ease-out, color 1.6s ease-out',
                    transform: `translateY(${currentOffset}px)`,
                    background: flashConfirm ? '#fff' : '#000',
                    border: '1px solid #222',
                    color: flashConfirm ? '#000' : '#fff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    position: 'absolute',
                    width: '100%',
                    top: `${15% + (animatingStandings ? finalIndex : initialIndex) * 76}px`,
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: displayRank === 1 ? '#ffd700' : displayRank === 2 ? '#888' : displayRank === 3 ? '#cd7f32' : (flashConfirm ? '#333' : '#aaa') }}>#{displayRank}</span>
                    <span style={{ fontSize: '24px', fontWeight: 700 }}>{p.nickname}</span>
                    {climbed && (
                      <span style={{ background: '#26890c', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', animation: 'pulse 1s infinite' }}>▲ CLIMBED</span>
                    )}
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 850, color: '#e91e63' }}>{displayScore} pts</span>
                </div>
              )
            })}
          </div>

          <div style={{ marginBottom: '10px', zIndex: 10 }}>
            <button onClick={nextStep} style={{ background: '#e91e63', color: '#fff', border: 'none', borderRadius: '6px', padding: '14px 48px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(233,30,99,0.4)' }}>
              Next Question [Space]
            </button>
          </div>
        </div>
      )}

      {/* 7. ENDED STATE - Full-screen responsive Podium view matches Kahoot screen */}
      {gameState === 'ended' && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.8s' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
            <button onClick={() => setEndedTab('podium')} style={{ background: endedTab === 'podium' ? '#e91e63' : 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>Podium</button>
            <button onClick={() => setEndedTab('summary')} style={{ background: endedTab === 'summary' ? '#e91e63' : 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>Session Summary</button>
            <button onClick={handlePlayAgain} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '6px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>Play Again</button>
          </div>

          {endedTab === 'podium' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%', paddingBottom: '32px' }}>
              <p style={{ fontSize: '18px', letterSpacing: '6px', color: '#e91e63', fontWeight: 800, margin: '0 0 10px' }}>QUIZ COMPLETED</p>
              <h1 style={{ fontSize: '48px', margin: '0 0 40px', fontWeight: 900 }}>Final Results Podium</h1>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '32px', width: '100%', maxWidth: '900px' }}>
                
                {/* 2nd Place Column */}
                {sortedPlayers[1] && podiumRevealStep >= 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.6s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', width: '180px', height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
                      <span style={{ fontSize: '48px', marginBottom: '8px' }}>2</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[1].nickname}</span>
                      <span style={{ fontSize: '14px', color: '#e91e63', marginTop: '4px' }}>{sortedPlayers[1].score} pts</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '180px' }}></div>
                )}

                {/* 1st Place Column */}
                {sortedPlayers[0] && podiumRevealStep >= 3 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.4s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid #ffd700', borderRadius: '16px 16px 0 0', width: '210px', height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxShadow: '0 0 35px rgba(255,215,0,0.2)' }}>
                      <span style={{ fontSize: '64px', marginBottom: '8px' }}>1</span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffd700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[0].nickname}</span>
                      <span style={{ fontSize: '16px', color: '#fff', marginTop: '4px' }}>{sortedPlayers[0].score} pts</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '210px' }}></div>
                )}

                {/* 3rd Place Column */}
                {sortedPlayers[2] && podiumRevealStep >= 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.8s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', width: '160px', height: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
                      <span style={{ fontSize: '38px', marginBottom: '4px' }}>3</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[2].nickname}</span>
                      <span style={{ fontSize: '13px', color: '#e91e63', marginTop: '4px' }}>{sortedPlayers[2].score} pts</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '160px' }}></div>
                )}

              </div>
            </div>
          )}

          {endedTab === 'summary' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: '700px' }}>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'left', animation: 'fadeIn 0.3s' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#e91e63', marginBottom: '12px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>Full Participant Standings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                  {sortedPlayers.map((p, index) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', borderBottom: '1px solid #1a1a1a', padding: '8px 0' }}>
                      <span>#{index + 1} {p.nickname}</span>
                      <span style={{ fontWeight: 700, color: '#e91e63' }}>{p.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button onClick={() => navigate('/admin/quiz')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '12px 36px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginBottom: '10px' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e91e63'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
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
        @keyframes scaleUpFadeGrow {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1.0); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>

    </div>
  )
}
