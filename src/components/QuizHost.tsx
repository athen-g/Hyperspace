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

// Animated score counter hook — cubic ease-out
function useAnimatedCounter(
  from: number,
  to: number,
  duration: number,
  isActive: boolean,
  isFinished: boolean
): number {
  const [displayValue, setDisplayValue] = useState(from)

  useEffect(() => {
    if (isFinished) {
      setDisplayValue(to)
      return
    }
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
      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setDisplayValue(to)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, isFinished, from, to, duration])

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
    1600,
    phase === PHASES.RUNUP,
    phase !== PHASES.IDLE && phase !== PHASES.RUNUP
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
// Podium block — one column of the final results podium.
// Height animates in (grow-from-floor), avatar/name/score fade+pop in
// slightly after the block starts rising so the eye follows the block up.
// ─────────────────────────────────────────────
interface PodiumConfig {
  rank: 1 | 2 | 3
  player: Player | undefined
  heightVh: number
  width: string
  accent: string       // gradient for block + avatar ring
  numberColor: string
  revealAt: number      // podiumRevealStep threshold at which this column appears
  isFirst?: boolean
}

function PodiumColumn({ cfg }: { cfg: PodiumConfig }) {
  const { player, heightVh, width, accent, numberColor, isFirst } = cfg
  if (!player) return <div style={{ width }} />

  return (
    <div className={`podium-col${isFirst ? ' podium-col--first' : ''}`}>
      <div className="podium-player">
        {isFirst && <span className="podium-crown">🏆</span>}
        <div className="podium-avatar" style={{ background: accent }}>
          {player.nickname.trim().charAt(0).toUpperCase()}
        </div>
        <span className="podium-name">{player.nickname}</span>
        <span className="podium-score">{player.score.toLocaleString()} pts</span>
      </div>

      <div
        className="podium-block"
        style={{
          height: `${heightVh}vh`,
          width,
          background: accent,
        }}
      >
        <span className="podium-rank-number" style={{ color: numberColor }}>{cfg.rank}</span>
      </div>
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
  // 0 = nothing risen yet, 1 = 3rd place risen, 2 = 2nd place risen, 3 = 1st place risen (finale)
  const [podiumRevealStep, setPodiumRevealStep] = useState<number>(0)
  const podiumTimersRef = useRef<any[]>([])

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
          el.style.transition = 'transform 900ms cubic-bezier(0.4, 0, 0.2, 1)'
          el.style.transform = 'translateY(0)'
        })
      })
    })
  }, [animationPhase, gameState])

  // Clean up any pending podium timers if the component unmounts mid-reveal
  useEffect(() => {
    return () => { podiumTimersRef.current.forEach(clearTimeout) }
  }, [])

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
    // 500  — initial pause, let host read old state
    // 2100 — run-up complete (1600ms) → reorder
    // 3300 — reorder complete (1200ms space) → flash
    // 4300 — flash complete → done

    const t1 = setTimeout(() => setAnimationPhase(PHASES.RUNUP),   500)
    const t2 = setTimeout(() => setAnimationPhase(PHASES.REORDER), 2100)
    const t3 = setTimeout(() => setAnimationPhase(PHASES.FLASH),   3300)
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
    }, 4300)

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

  // ── triggerEndQuiz — Kahoot-style podium reveal ────────────────────────────
  // 3rd place rises first, then 2nd, then 1st (the finale), each with its own
  // confetti burst. Kept snappy — a host is standing in front of a live room,
  // not watching a 10s animation loop.
  const triggerEndQuiz = () => {
    setGameState('ended')
    setEndedTab('podium')
    setPodiumRevealStep(0)
    channelRef.current.send({ type: 'broadcast', event: 'podium-building', payload: {} })

    podiumTimersRef.current.forEach(clearTimeout)
    const STEP = 650 // ms between each podium column rising

    const t1 = setTimeout(() => {
      setPodiumRevealStep(1) // 3rd place rises
      confetti({ particleCount: 30, spread: 55, startVelocity: 32, origin: { x: 0.5, y: 0.85 } })
    }, STEP)

    const t2 = setTimeout(() => {
      setPodiumRevealStep(2) // 2nd place rises
      confetti({ particleCount: 40, spread: 60, startVelocity: 38, origin: { x: 0.28, y: 0.8 } })
      confetti({ particleCount: 40, spread: 60, startVelocity: 38, origin: { x: 0.72, y: 0.8 } })
    }, STEP * 2)

    const t3 = setTimeout(() => {
      setPodiumRevealStep(3) // 1st place rises — finale
      confetti({ particleCount: 160, spread: 100, startVelocity: 55, origin: { x: 0.5, y: 0.6 } })
      confetti({ particleCount: 70, angle: 60, spread: 55, startVelocity: 45, origin: { x: 0, y: 0.7 } })
      confetti({ particleCount: 70, angle: 120, spread: 55, startVelocity: 45, origin: { x: 1, y: 0.7 } })

      const finalSorted = [...players].sort((a, b) => b.score - a.score)
      const standingsMapping: Record<string, { rank: number; score: number }> = {}
      finalSorted.forEach((p, idx) => { standingsMapping[p.id] = { rank: idx + 1, score: p.score } })
      channelRef.current.send({
        type: 'broadcast', event: 'time-up',
        payload: { correctOption: -1, standings: standingsMapping },
      })
    }, STEP * 3)

    podiumTimersRef.current = [t1, t2, t3]
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

  // Podium column configuration — visual order is 2nd / 1st / 3rd (Kahoot's layout)
  const podiumColumns: PodiumConfig[] = [
    {
      rank: 2,
      player: sortedPlayers[1],
      heightVh: 32,
      width: 'clamp(120px, 15vw, 200px)',
      accent: 'linear-gradient(160deg,#e9ecf2 0%,#a9b0bd 100%)',
      numberColor: '#3a3f4a',
      revealAt: 2,
    },
    {
      rank: 1,
      player: sortedPlayers[0],
      heightVh: 46,
      width: 'clamp(150px, 18vw, 240px)',
      accent: 'linear-gradient(160deg,#ffe9a8 0%,#ffb020 100%)',
      numberColor: '#5c3a00',
      revealAt: 3,
      isFirst: true,
    },
    {
      rank: 3,
      player: sortedPlayers[2],
      heightVh: 22,
      width: 'clamp(110px, 13vw, 170px)',
      accent: 'linear-gradient(160deg,#f0bd8f 0%,#b3702f 100%)',
      numberColor: '#402100',
      revealAt: 1,
    },
  ]

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

      {/* 7. ENDED — full-screen podium */}
      {gameState === 'ended' && (
        <div className="ended-fullscreen">
          {/* Floating tab bar */}
          <div className="podium-tabs">
            <button onClick={() => setEndedTab('podium')} className={`podium-tab-btn${endedTab === 'podium' ? ' active' : ''}`}>Podium</button>
            <button onClick={() => setEndedTab('summary')} className={`podium-tab-btn${endedTab === 'summary' ? ' active' : ''}`}>Session Summary</button>
            <button onClick={handlePlayAgain} className="podium-tab-btn podium-tab-btn--danger">Play Again</button>
          </div>

          {endedTab === 'podium' && (
            <div className="podium-stage">
              <div className="podium-header">
                <p className="podium-eyebrow">QUIZ COMPLETE</p>
                <h1 className="podium-title">{quizTitle || 'Final Results'}</h1>
              </div>

              <div className="podium-row">
                {podiumColumns.map(cfg => (
                  <div
                    key={cfg.rank}
                    className={`podium-col-wrap${podiumRevealStep >= cfg.revealAt ? ' is-revealed' : ''}`}
                  >
                    <PodiumColumn cfg={cfg} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {endedTab === 'summary' && (
            <div className="summary-stage">
              <p className="podium-eyebrow">FULL RESULTS</p>
              <h1 className="podium-title" style={{ marginBottom: '24px' }}>Participant Standings</h1>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', textAlign: 'left', width: '100%', maxWidth: '700px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '8px' }}>
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
            className="exit-fab"
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
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50%      { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
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
            background-color 800ms ease-out,
            color            800ms ease-out,
            border-color     800ms ease-out;
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

        /* ── Podium — full-screen ended state ───────────────────────────── */
        .ended-fullscreen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 200;
        }

        .podium-tabs {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 20;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 8px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .podium-tab-btn {
          background: transparent;
          border: 1px solid #333;
          color: #fff;
          padding: 8px 20px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .podium-tab-btn.active {
          background: #e91e63;
          border-color: #e91e63;
        }
        .podium-tab-btn--danger {
          border-color: #e21b3c;
          color: #ff6b81;
        }

        .podium-stage {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          box-sizing: border-box;
          padding-bottom: 6vh;
          background:
            radial-gradient(ellipse 90% 60% at 50% 12%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%),
            radial-gradient(ellipse 120% 90% at 50% 100%, #5b2a9e 0%, #2c1150 55%, #12081f 100%);
        }

        .podium-header {
          position: absolute;
          top: 10vh;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 2;
        }
        .podium-eyebrow {
          letter-spacing: 6px;
          font-size: 13px;
          font-weight: 800;
          color: #ff9ecf;
          margin: 0 0 8px;
        }
        .podium-title {
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 900;
          margin: 0;
          color: #fff;
          text-shadow: 0 6px 24px rgba(0,0,0,0.45);
          max-width: 90vw;
        }

        .podium-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: clamp(10px, 3vw, 36px);
          width: 100%;
          max-width: 1100px;
          z-index: 2;
        }

        .podium-col-wrap {
          display: flex;
          align-items: flex-end;
        }

        .podium-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .podium-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 14px;
          opacity: 0;
          transform: translateY(24px) scale(0.85);
          transition: opacity 420ms ease-out 120ms, transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 120ms;
        }
        .is-revealed .podium-player {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .podium-avatar {
          width: clamp(54px, 7vw, 90px);
          height: clamp(54px, 7vw, 90px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(20px, 3vw, 36px);
          font-weight: 900;
          color: #fff;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          border: 3px solid rgba(255,255,255,0.2);
          position: relative;
        }
        .podium-col--first .podium-avatar {
          border-color: #ffd700;
          animation: avatarGlow 2.5s infinite;
        }

        .podium-crown {
          position: absolute;
          top: -24px;
          font-size: clamp(24px, 3vw, 38px);
          animation: crownFloat 2s ease-in-out infinite;
          z-index: 5;
        }

        .podium-name {
          font-size: clamp(15px, 2.2vw, 22px);
          font-weight: 800;
          color: #fff;
          margin-top: 10px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          max-width: clamp(120px, 16vw, 220px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .podium-score {
          font-size: clamp(12px, 1.6vw, 16px);
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          margin-top: 3px;
        }

        .podium-block {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.06);
          border-bottom: none;
          
          /* Growth transition when revealed */
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .is-revealed .podium-block {
          transform: scaleY(1);
        }

        .podium-rank-number {
          font-size: clamp(40px, 7vw, 90px);
          font-weight: 900;
          user-select: none;
        }

        /* ── Session Summary Stage ─────────────────────────────────────── */
        .summary-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 80px 20px 40px;
          background: #09090e;
          animation: fadeIn 0.4s ease-out;
        }

        /* Exit FAB button at bottom-right corner */
        .exit-fab {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid #333;
          border-radius: 6px;
          color: #fff;
          padding: 12px 32px;
          font-size: 15px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          z-index: 25;
        }
        .exit-fab:hover {
          border-color: #e91e63;
          box-shadow: 0 4px 20px rgba(233,30,99,0.25);
        }

        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.25); }
          50%      { box-shadow: 0 0 35px rgba(255, 215, 0, 0.55); }
        }
      `}</style>
    </div>
  )
}
