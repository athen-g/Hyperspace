import { useEffect, useState, useRef, useMemo } from 'react'
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

// Animation phase constants
const PHASES = {
  IDLE:    'idle',
  RUNUP:   'runup',
  REORDER: 'reorder',
  FLASH:   'flash',
  DONE:    'done',
} as const
type Phase = typeof PHASES[keyof typeof PHASES]

// Data shape passed into each leaderboard row
interface LeaderboardPlayerData {
  id: string
  nickname: string
  previousScore: number
  currentScore: number
  pointsEarned: number
  previousRank: number
  currentRank: number
}

// Animated score counter hook — cubic ease-out, resets when isActive flips
function useAnimatedCounter(
  from: number,
  to: number,
  duration: number,
  isActive: boolean
): number {
  const [displayValue, setDisplayValue] = useState(from)

  useEffect(() => {
    if (!isActive) {
      setDisplayValue(from)
      return
    }

    const startTime = performance.now()
    let rafId: number

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setDisplayValue(Math.round(from + (to - from) * eased))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, from, to, duration])

  return displayValue
}

// Leaderboard row as its own component so useAnimatedCounter is called
// at the top level of a component (satisfies Rules of Hooks)
function LeaderboardRow({
  player,
  phase,
  rowRefs,
  index,
}: {
  player: LeaderboardPlayerData
  phase: Phase
  rowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  index: number
}) {
  const ROW_STRIDE = 76 // row height + gap

  const displayScore = useAnimatedCounter(
    player.previousScore,
    player.currentScore,
    1200,
    phase === PHASES.RUNUP
  )

  const isFlashing = phase === PHASES.FLASH || phase === PHASES.DONE
  // Rank #1 flashes last — draws the eye upward to the winner
  const flashDelay = player.currentRank * 80
  const rankDelta = player.previousRank - player.currentRank // positive = climbed

  return (
    <div
      ref={el => { rowRefs.current[player.id] = el }}
      className={`leaderboard-row${isFlashing ? ' flashing' : ''}`}
      style={{
        '--flash-delay': `${flashDelay}ms`,
        position: 'absolute',
        width: '100%',
        top: `${index * ROW_STRIDE}px`,
        boxSizing: 'border-box',
      } as React.CSSProperties & { '--flash-delay': string }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        {/* Rank badge */}
        <span style={{
          fontSize: '26px',
          fontWeight: 900,
          minWidth: '52px',
          color: player.currentRank === 1 ? '#ffd700'
               : player.currentRank === 2 ? '#c0c0c0'
               : player.currentRank === 3 ? '#cd7f32'
               : isFlashing ? '#333' : '#aaa',
        }}>
          #{player.currentRank}
        </span>

        {/* Name */}
        <span style={{ fontSize: '22px', fontWeight: 700 }}>{player.nickname}</span>

        {/* +points badge — visible during run-up only */}
        {phase === PHASES.RUNUP && player.pointsEarned > 0 && (
          <span className="points-earned">+{player.pointsEarned}</span>
        )}

        {/* Rank change arrow — visible after reorder */}
        {isFlashing && rankDelta !== 0 && (
          <span style={{
            color: rankDelta > 0 ? '#4ade80' : '#f87171',
            fontWeight: 800,
            fontSize: '18px',
          }}>
            {rankDelta > 0 ? '▲' : '▼'}
          </span>
        )}
      </div>

      {/* Score — tabular-nums prevents width jitter during count-up */}
      <span className="lb-score">{displayScore.toLocaleString()} pts</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
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

  const [isDemo, setIsDemo] = useState(false)
  const [qrZoomed, setQrZoomed] = useState(false)

  // Previous-round scores used as the "from" baseline for animations
  const [prevLeaderboard, setPrevLeaderboard] = useState<Record<string, number>>({})

  // Players enriched with rank/score delta data, sliced to top 5
  const [activeLeaderboardPlayers, setActiveLeaderboardPlayers] = useState<LeaderboardPlayerData[]>([])

  // Current animation phase
  const [animationPhase, setAnimationPhase] = useState<Phase>(PHASES.IDLE)

  // FLIP refs — rowRefs holds DOM nodes, prevPositions holds pre-reorder Y coords
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevPositions = useRef<Record<string, number>>({})

  // Intro animation state
  const [introCountdown, setIntroCountdown] = useState(3)
  const [introTitleShow, setIntroTitleShow] = useState(false)

  // Ended screen
  const [endedTab, setEndedTab] = useState<'podium' | 'summary'>('podium')
  const [podiumRevealStep, setPodiumRevealStep] = useState<number>(0)

  // ── Data fetching ──────────────────────────────────────────────────────────
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

  // Stable refs so interval callbacks can call the latest endQuestion
  const endQuestionRef = useRef<() => void>(() => {})
  const showLeaderboardRef = useRef<() => void>(() => {})
  useEffect(() => {
    endQuestionRef.current = endQuestion
    showLeaderboardRef.current = showLeaderboard
  })

  // ── Realtime channel ───────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel(`quiz-${pin}`, {
      config: { broadcast: { self: true, ack: true } },
    })

    channel
      .on('broadcast', { event: 'player-join' }, ({ payload }) => {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === payload.id)) return prev
          const next = [...prev, { id: payload.id, nickname: payload.nickname, score: 0, answered: false }]
          channel.send({ type: 'broadcast', event: 'lobby-update', payload: { players: next.map(p => p.nickname) } })
          return next
        })
        channel.send({ type: 'broadcast', event: 'join-ack', payload: { pin, success: true } })
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
          if (allAnswered) setTimeout(() => endQuestionRef.current(), 100)
          return updated
        })
        setAnswerStats((prev) => {
          const next = [...prev]
          if (payload.optionIndex >= 0 && payload.optionIndex < 4) next[payload.optionIndex]++
          return next
        })
      })
      .subscribe()

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [pin, questions, currentIndex])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (gameState === 'question') endQuestion()
      else if (gameState === 'answers') showLeaderboard()
      else if (gameState === 'leaderboard' && animationPhase === PHASES.DONE) nextStep()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, currentIndex, questions, players, animationPhase])

  // ── Demo bot simulation ────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'question' || !isDemo || players.length === 0) return
    players.forEach(p => {
      const delay = Math.random() * 4000 + 1000
      setTimeout(() => {
        if (gameState !== 'question') return
        const randOption = Math.floor(Math.random() * 4)
        setPlayers((prev) => {
          const updated = prev.map(pl => {
            if (pl.id !== p.id || pl.answered) return pl
            const q = questions[currentIndex]
            const isCorrect = randOption === q.correct_option
            const points = isCorrect ? Math.round(1000 * (1 - (delay / 1000) / q.time_limit * 0.5)) : 0
            return { ...pl, score: pl.score + points, answered: true }
          })
          if (updated.length > 0 && updated.every(pl => pl.answered))
            setTimeout(() => endQuestionRef.current(), 100)
          return updated
        })
        setAnswerStats((prev) => {
          const next = [...prev]; next[randOption]++; return next
        })
      }, delay)
    })
  }, [gameState, isDemo])

  // ── FLIP Step 1: snapshot Y positions BEFORE the DOM reorders ─────────────
  // Runs when phase transitions to RUNUP (rows are still in previousRank order)
  useEffect(() => {
    if (gameState !== 'leaderboard' || animationPhase !== PHASES.RUNUP) return
    Object.entries(rowRefs.current).forEach(([id, el]) => {
      if (el) prevPositions.current[id] = el.getBoundingClientRect().top
    })
  }, [animationPhase, gameState])

  // ── FLIP Step 2: apply invert→play when REORDER phase starts ──────────────
  // At this point displayedLeaderboardPlayers has re-sorted so DOM is in new order.
  // We translate each row back to where it was, then animate to translateY(0).
  useEffect(() => {
    if (gameState !== 'leaderboard' || animationPhase !== PHASES.REORDER) return

    Object.entries(rowRefs.current).forEach(([id, el]) => {
      if (!el || prevPositions.current[id] == null) return

      const oldTop = prevPositions.current[id]
      const newTop = el.getBoundingClientRect().top
      const deltaY = oldTop - newTop

      // INVERT: snap back to old visual position without transition
      el.style.transition = 'none'
      el.style.transform = `translateY(${deltaY}px)`

      // PLAY: double-rAF ensures browser paints the snapped state first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
          el.style.transform = 'translateY(0)'
        })
      })
    })
  }, [animationPhase, gameState])

  // ── Game flow ──────────────────────────────────────────────────────────────
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
      answered: false,
    }))
    setPlayers(botPlayers)
    setTimeout(() => {
      channelRef.current.send({
        type: 'broadcast', event: 'lobby-update',
        payload: { players: botPlayers.map(b => b.nickname) },
      })
      triggerIntroBuild()
    }, 500)
  }

  const triggerIntroBuild = () => {
    setGameState('intro-build')
    setIntroCountdown(3)
    setIntroTitleShow(false)
    channelRef.current.send({
      type: 'broadcast', event: 'get-ready',
      payload: { questionText: 'Get Ready...', questionIndex: 1, totalQuestions: questions.length, gameMode },
    })
    let elapsed = 3
    const introInterval = setInterval(() => {
      elapsed -= 1
      setIntroCountdown(elapsed)
      if (elapsed <= 0) {
        clearInterval(introInterval)
        setIntroTitleShow(true)
        setTimeout(() => triggerGetReady(0), 2500)
      }
    }, 1000)
  }

  const triggerGetReady = (index: number) => {
    setCurrentIndex(index)
    setAnswerStats([0, 0, 0, 0])
    setPlayers(prev => prev.map(p => ({ ...p, answered: false })))
    setGameState('get-ready')
    setReadyCountdown(3)
    channelRef.current.send({
      type: 'broadcast', event: 'get-ready',
      payload: { questionText: questions[index].question_text, questionIndex: index + 1, totalQuestions: questions.length, gameMode },
    })
    if (readyTimerRef.current) clearInterval(readyTimerRef.current)
    readyTimerRef.current = setInterval(() => {
      setReadyCountdown(prev => {
        if (prev <= 1) { clearInterval(readyTimerRef.current); startQuestionTimer(index); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const startQuestionTimer = (index: number) => {
    setGameState('question')
    const q = questions[index]
    setTimer(q.time_limit)
    channelRef.current.send({
      type: 'broadcast', event: 'next-question',
      payload: { questionText: q.question_text, options: q.options, timeLimit: q.time_limit, gameMode },
    })
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); endQuestion(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const endQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameState('answers')
    channelRef.current.send({
      type: 'broadcast', event: 'time-up',
      payload: { correctOption: questions[currentIndex].correct_option, answerStats },
    })
  }

  // ── showLeaderboard — drives the full 4-phase animation sequence ───────────
  const showLeaderboard = () => {
    // Build enriched player data with previous/current ranks and point delta
    const oldSorted = [...players].sort((a, b) => (prevLeaderboard[b.id] ?? 0) - (prevLeaderboard[a.id] ?? 0))
    const newSorted = [...players].sort((a, b) => b.score - a.score)

    const enriched: LeaderboardPlayerData[] = oldSorted.map(p => ({
      id:            p.id,
      nickname:      p.nickname,
      previousScore: prevLeaderboard[p.id] ?? 0,
      currentScore:  p.score,
      pointsEarned:  p.score - (prevLeaderboard[p.id] ?? 0),
      previousRank:  oldSorted.findIndex(x => x.id === p.id) + 1,
      currentRank:   newSorted.findIndex(x => x.id === p.id) + 1,
    }))

    // Render in previousRank order first (IDLE state)
    setActiveLeaderboardPlayers(enriched.slice(0, 5))
    setAnimationPhase(PHASES.IDLE)
    setGameState('leaderboard')

    // Phase timing (ms from leaderboard mount):
    // 400  — initial pause, let host read old state
    // 1600 — run-up complete → reorder
    // 2200 — reorder complete → flash
    // 3000 — flash complete → done

    const t1 = setTimeout(() => setAnimationPhase(PHASES.RUNUP),   400)
    const t2 = setTimeout(() => setAnimationPhase(PHASES.REORDER), 1600)
    const t3 = setTimeout(() => setAnimationPhase(PHASES.FLASH),   2200)
    const t4 = setTimeout(() => {
      setAnimationPhase(PHASES.DONE)

      // Commit scores so next round uses these as the baseline
      const nextPrev: Record<string, number> = {}
      players.forEach(p => { nextPrev[p.id] = p.score })
      setPrevLeaderboard(nextPrev)

      // Notify player devices of their new rankings
      const standingsMapping: Record<string, { rank: number; score: number }> = {}
      newSorted.forEach((p, idx) => { standingsMapping[p.id] = { rank: idx + 1, score: p.score } })
      channelRef.current.send({
        type: 'broadcast', event: 'leaderboard-update',
        payload: { standings: standingsMapping },
      })
    }, 3000)

    // Cleanup if component unmounts mid-animation
    return () => { [t1, t2, t3, t4].forEach(clearTimeout) }
  }

  // ── Sort order flips at the REORDER phase boundary ─────────────────────────
  // IDLE + RUNUP → previousRank order (so reorder is visible)
  // REORDER onwards → currentRank order
  const displayedLeaderboardPlayers = useMemo(() => {
    if (animationPhase === PHASES.IDLE || animationPhase === PHASES.RUNUP) {
      return [...activeLeaderboardPlayers].sort((a, b) => a.previousRank - b.previousRank)
    }
    return [...activeLeaderboardPlayers].sort((a, b) => a.currentRank - b.currentRank)
  }, [activeLeaderboardPlayers, animationPhase])

  const nextStep = () => {
    if (currentIndex + 1 < questions.length) triggerGetReady(currentIndex + 1)
    else triggerEndQuiz()
  }

  const triggerEndQuiz = () => {
    setGameState('ended')
    setEndedTab('podium')
    setPodiumRevealStep(0)
    channelRef.current.send({ type: 'broadcast', event: 'podium-building', payload: {} })

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
          finalSorted.forEach((p, idx) => { standingsMapping[p.id] = { rank: idx + 1, score: p.score } })
          channelRef.current.send({
            type: 'broadcast', event: 'time-up',
            payload: { correctOption: -1, standings: standingsMapping },
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
  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']
  const totalAnsweredCount = players.filter(p => p.answered).length

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#09090e', height: '100vh', width: '100vw', color: '#fff', padding: '12px', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

      {/* Return to Dashboard corner button */}
      <button
        onClick={() => { if (confirm('Exit hosting session?')) navigate('/admin/quiz') }}
        style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, zIndex: 100 }}
      >
        ← Leave
      </button>

      {/* 1. LOBBY */}
      {gameState === 'lobby' && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ fontSize: '18px', letterSpacing: '4px', color: '#e91e63', fontWeight: 700, margin: '0 0 10px' }}>JOIN THE GAME AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '90px', margin: '0 0 16px', letterSpacing: '-2px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', fontWeight: 900, lineHeight: 1 }}>PIN: <span style={{ color: '#e91e63' }}>{pin}</span></h1>

          <div
            onClick={() => setQrZoomed(!qrZoomed)}
            style={{ background: '#fff', padding: '16px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', cursor: 'pointer', transform: qrZoomed ? 'scale(1.8)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 99, position: 'relative' }}
          >
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={qrZoomed ? 200 : 130} level="M" includeMargin={true} />
            <div style={{ color: '#000', fontSize: '10px', fontWeight: 800, marginTop: '4px', letterSpacing: '1px' }}>{qrZoomed ? 'CLICK TO MINIMIZE' : 'CLICK TO ENLARGE'}</div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px 40px', width: '100%', maxWidth: '95%', flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '30vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 16px', color: '#e91e63', fontWeight: 800 }}>
              {players.length === 0 ? 'Waiting for players to join...' : `Joined Players (${players.length})`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {players.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', fontWeight: 700, padding: '8px 20px', borderRadius: '30px', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {p.nickname}
                </div>
              ))}
            </div>
          </div>

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

      {/* 2. INTRO BUILD */}
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
              <h1 style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>{quizTitle}</h1>
            </div>
          )}
        </div>
      )}

      {/* 3. GET READY */}
      {gameState === 'get-ready' && questions[currentIndex] && (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.4s' }}>
          <p style={{ fontSize: '20px', letterSpacing: '6px', color: '#e91e63', fontWeight: 700, margin: '0 0 10px' }}>GET READY FOR QUESTION {currentIndex + 1}</p>
          <h1 style={{ fontSize: '44px', margin: '20px 0', fontWeight: 900, lineHeight: 1.2, maxWidth: '90%' }}>{questions[currentIndex].question_text}</h1>
          <div style={{ fontSize: '130px', fontWeight: 950, color: '#e91e63', animation: 'pulse 1s infinite', lineHeight: 1 }}>{readyCountdown}</div>
        </div>
      )}

      {/* 4. QUESTION */}
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

      {/* 5. ANSWERS */}
      {gameState === 'answers' && questions[currentIndex] && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'fadeIn 0.5s', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>Correct Answer</h2>
            <span style={{ fontSize: '18px', color: '#888', fontWeight: 700 }}>Total submissions: {totalAnsweredCount}</span>
          </div>

          <h2 style={{ fontSize: '36px', textAlign: 'center', margin: '15px 0', color: '#fff', lineHeight: 1.2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{questions[currentIndex].question_text}</h2>

          <div style={{ display: 'flex', height: '300px', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '30px 20px', borderRadius: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
            {answerStats.map((count, i) => {
              const maxCount = Math.max(...answerStats, 1)
              const heightPercent = (count / maxCount) * 100
              const isCorrect = i === questions[currentIndex].correct_option
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{count}</div>
                  <div style={{ width: '80%', height: `${heightPercent}%`, background: optionColors[i], borderRadius: '6px 6px 0 0', position: 'relative', border: isCorrect ? '3px solid #fff' : 'none', transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    {isCorrect && <span style={{ position: 'absolute', top: '-32px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px' }}>✓</span>}
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

      {/* 6. LEADERBOARD */}
      {gameState === 'leaderboard' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.5s', padding: '0 12px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#e91e63', fontWeight: 700, margin: 0 }}>CURRENT STANDINGS</p>
            <h1 style={{ fontSize: '48px', margin: '5px 0 10px', fontWeight: 900 }}>Leaderboard</h1>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '96vw',
              flex: 1,
              height: `${displayedLeaderboardPlayers.length * 76}px`,
              maxHeight: '70vh',
            }}
          >
            {displayedLeaderboardPlayers.map((player, index) => (
              <LeaderboardRow
                key={player.id}
                player={player}
                phase={animationPhase}
                rowRefs={rowRefs}
                index={index}
              />
            ))}
          </div>

          <div style={{ marginBottom: '10px', zIndex: 10 }}>
            <button
              onClick={nextStep}
              disabled={animationPhase !== PHASES.DONE}
              style={{
                background: animationPhase === PHASES.DONE ? '#e91e63' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '14px 48px',
                fontSize: '18px',
                fontWeight: 800,
                cursor: animationPhase === PHASES.DONE ? 'pointer' : 'not-allowed',
                boxShadow: animationPhase === PHASES.DONE ? '0 6px 20px rgba(233,30,99,0.4)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {currentIndex + 1 < questions.length ? 'Next Question [Space]' : 'See Final Results [Space]'}
            </button>
          </div>
        </div>
      )}

      {/* 7. ENDED */}
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
                {sortedPlayers[1] && podiumRevealStep >= 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.6s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', width: '180px', height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
                      <span style={{ fontSize: '48px', marginBottom: '8px' }}>2</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[1].nickname}</span>
                      <span style={{ fontSize: '14px', color: '#e91e63', marginTop: '4px' }}>{sortedPlayers[1].score} pts</span>
                    </div>
                  </div>
                ) : <div style={{ width: '180px' }} />}

                {sortedPlayers[0] && podiumRevealStep >= 3 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.4s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid #ffd700', borderRadius: '16px 16px 0 0', width: '210px', height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxShadow: '0 0 35px rgba(255,215,0,0.2)' }}>
                      <span style={{ fontSize: '64px', marginBottom: '8px' }}>1</span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffd700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[0].nickname}</span>
                      <span style={{ fontSize: '16px', color: '#fff', marginTop: '4px' }}>{sortedPlayers[0].score} pts</span>
                    </div>
                  </div>
                ) : <div style={{ width: '210px' }} />}

                {sortedPlayers[2] && podiumRevealStep >= 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.8s ease-out' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', width: '160px', height: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
                      <span style={{ fontSize: '38px', marginBottom: '4px' }}>3</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[2].nickname}</span>
                      <span style={{ fontSize: '13px', color: '#e91e63', marginTop: '4px' }}>{sortedPlayers[2].score} pts</span>
                    </div>
                  </div>
                ) : <div style={{ width: '160px' }} />}
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

          <button
            onClick={() => navigate('/admin/quiz')}
            style={{ background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '12px 36px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginBottom: '10px' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e91e63'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
          >
            Exit to Dashboard
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(150px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes pulse {
          0%   { transform: scale(1);   }
          50%  { transform: scale(1.1); }
          100% { transform: scale(1);   }
        }
        @keyframes scaleUpFadeGrow {
          0%   { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1.0); }
        }
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translateY(20px);  }
          20%  { opacity: 1; transform: translateY(0);     }
          80%  { opacity: 1; transform: translateY(0);     }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        /* ── Leaderboard row ───────────────────────────────────────────── */
        .leaderboard-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          border-radius: 10px;
          border: 1px solid #222;
          background-color: #0d0d1a;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.05rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .leaderboard-row.flashing {
          background-color: #ffffff;
          color: #0d0d1a;
          border-color: #ddd;
          transition:
            background-color 500ms ease-out,
            color            500ms ease-out,
            border-color     500ms ease-out;
          transition-delay: var(--flash-delay, 0ms);
        }

        .lb-score {
          margin-left: auto;
          font-variant-numeric: tabular-nums;
          min-width: 90px;
          text-align: right;
          color: #e91e63;
          font-size: 22px;
          font-weight: 900;
        }

        .points-earned {
          font-size: 13px;
          color: #ffd700;
          font-weight: 600;
          background: rgba(255, 215, 0, 0.12);
          padding: 3px 10px;
          border-radius: 20px;
          animation: fadeSlideIn 300ms ease-out forwards;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
