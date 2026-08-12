import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

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

const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
const optionShapes = ['▲', '◆', '●', '■']

const emojis = ['🚀', '👾', '🛸', '🛰️', '🪐', '💫', '☄️', '🌌', '🤖', '👽', '⭐', '✨', '⚡', '🔮']
const gradients = [
  'linear-gradient(135deg, #e91e63 0%, #9C27B0 100%)',
  'linear-gradient(135deg, #00BCD4 0%, #3F51B5 100%)',
  'linear-gradient(135deg, #9C27B0 0%, #00BCD4 100%)',
  'linear-gradient(135deg, #e91e63 0%, #FF5722 100%)',
  'linear-gradient(135deg, #8A2BE2 0%, #FF00FF 100%)',
]

const getPlayerEmoji = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return emojis[Math.abs(hash) % emojis.length]
}

const getPlayerGradient = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export default function QuizHost() {
  const { codeSlug } = useParams()
  const navigate = useNavigate()
  const { member } = useAuth()

  const [pin] = useState(() => Math.floor(100000 + Math.random() * 900000).toString())
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hostStatus, setHostStatus] = useState<'loading' | 'active' | 'locked'>('loading')
  const [activeHostName, setActiveHostName] = useState('')
  const [activeHostClaimedAt, setActiveHostClaimedAt] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Host state machine: lobby -> intro-build -> get-ready -> question -> answers -> leaderboard -> ended
  const [gameState, setGameState] = useState<'lobby' | 'intro-build' | 'get-ready' | 'question' | 'answers' | 'leaderboard' | 'ended'>('lobby')
  const [gameMode, setGameMode] = useState<'classic' | 'shared'>('classic')
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizTitle, setQuizTitle] = useState('')
  const [quizId, setQuizId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(0)
  const [readyCountdown, setReadyCountdown] = useState(3)
  const [introCountdown, setIntroCountdown] = useState(3)
  const [introTitleShow, setIntroTitleShow] = useState(false)
  const [answerStats, setAnswerStats] = useState<number[]>([0, 0, 0, 0])
  const [qrZoomed, setQrZoomed] = useState(false)

  // Leaderboard & Podium States
  const [prevLeaderboard, setPrevLeaderboard] = useState<Record<string, number>>({})
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'runup' | 'reorder' | 'flash' | 'done'>('idle')
  const [activeLeaderboardPlayers, setActiveLeaderboardPlayers] = useState<any[]>([])
  const [podiumRevealStep, setPodiumRevealStep] = useState(0)
  const [endedTab, setEndedTab] = useState<'podium' | 'full'>('podium')

  const channelRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const readyTimerRef = useRef<any>(null)
  const sessionIdRef = useRef<string | null>(null)
  const playersRef = useRef<Player[]>([])
  const gameStateRef = useRef(gameState)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])

  // Timer for lock screen elapsed time
  useEffect(() => {
    if (!activeHostClaimedAt || hostStatus !== 'locked') return
    setElapsedSeconds(Math.floor((Date.now() - activeHostClaimedAt) / 1000))
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - activeHostClaimedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeHostClaimedAt, hostStatus])

  // Host Control edge function invocation helper
  const sendHostControl = async (event: string, payload: any = {}) => {
    const activeSessionId = sessionIdRef.current
    if (!activeSessionId) return

    try {
      const { error } = await supabase.functions.invoke('quiz-host-control', {
        body: {
          session_id: activeSessionId,
          action: event,
          payload
        }
      })
      if (error) {
        console.error(`Host control error on ${event}:`, error)
      }
    } catch (e: any) {
      console.error(`Failed sending host control event ${event}:`, e)
    }
  }

  // 1. Data Fetching & Session Claiming
  useEffect(() => {
    if (codeSlug && member) {
      setHostStatus('loading')
      supabase
        .from('quizzes')
        .select('id, title')
        .eq('code_slug', codeSlug)
        .single()
        .then(async ({ data, error }) => {
          if (error || !data) {
            toast.error('Quiz not found.')
            navigate('/admin/quiz')
            return
          }

          setQuizTitle(data.title)
          setQuizId(data.id)

          // Fetch questions
          const { data: qData } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', data.id)
            .order('sort_order', { ascending: true })

          if (qData) {
            setQuestions(qData)
          }

          // Atomic session claim via RPC
          try {
            const { data: claimData, error: claimErr } = await supabase.rpc('claim_quiz_session', {
              p_quiz_id: data.id,
              p_pin: pin,
              p_user_id: member.user_id,
              p_display: member.name || 'Admin Host'
            })

            if (claimErr) throw claimErr

            if (claimData && (claimData.status === 'claimed' || claimData.status === 'recovered')) {
              setSessionId(claimData.session_id)
              setHostStatus('active')
            } else if (claimData && claimData.status === 'locked') {
              setActiveHostName(claimData.host_display || 'Another Admin')
              setActiveHostClaimedAt(claimData.claimed_at)
              setHostStatus('locked')
            }
          } catch (e: any) {
            console.error('Session claim error:', e)
            toast.error('Failed to initialize host session.')
          }
        })
    }
  }, [codeSlug, member])

  // 2. Heartbeat & Cleanup Setup
  useEffect(() => {
    if (hostStatus !== 'active' || !sessionId || !member) return

    let accessToken = ''
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) accessToken = session.access_token
    })

    const sendHeartbeat = async () => {
      try {
        await supabase.functions.invoke('quiz-session-heartbeat', {
          body: { session_id: sessionId }
        })
      } catch (e) {
        console.warn('Heartbeat failed:', e)
      }
    }

    const interval = setInterval(sendHeartbeat, 15000)

    const handleUnloadCleanup = () => {
      if (!accessToken) return
      const payload = JSON.stringify({ session_id: sessionId, access_token: accessToken })
      const blob = new Blob([payload], { type: 'application/json' })
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-session-cleanup`
      navigator.sendBeacon(url, blob)
    }

    window.addEventListener('unload', handleUnloadCleanup)

    return () => {
      clearInterval(interval)
      window.removeEventListener('unload', handleUnloadCleanup)
    }
  }, [hostStatus, sessionId, member])

  // 3. Presence & Realtime Broadcast listener
  useEffect(() => {
    if (!member || hostStatus !== 'active') return

    // Presence channel to detect secondary host joins
    const hostPresenceChannel = supabase.channel(`quiz-host-${pin}`, {
      config: { presence: { key: 'host' } }
    })

    // Player channel
    const playerChannel = supabase.channel(`quiz-${pin}`, {
      config: { broadcast: { self: true, ack: true } }
    })

    hostPresenceChannel.on('presence', { event: 'sync' }, () => {
      const state = hostPresenceChannel.presenceState()
      const hostList = state.host || []
      const secondaryHost = hostList.some((h: any) => h.user_id !== member.user_id)
      if (secondaryHost) {
        setHostStatus('locked')
      }
    })

    hostPresenceChannel.subscribe(async (statusVal) => {
      if (statusVal === 'SUBSCRIBED') {
        await hostPresenceChannel.track({ user_id: member.user_id, display: member.name })
      }
    })

    // Listen for player broadcast actions
    playerChannel
      .on('broadcast', { event: 'player-join' }, ({ payload }) => {
        const { id, nickname } = payload
        const currentPlayers = playersRef.current

        if (gameStateRef.current !== 'lobby') {
          playerChannel.send({
            type: 'broadcast',
            event: 'join-ack',
            payload: { targetPlayerId: id, success: false, rejected: true, reason: 'game_in_progress' }
          })
          return
        }

        if (currentPlayers.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
          playerChannel.send({
            type: 'broadcast',
            event: 'join-ack',
            payload: { targetPlayerId: id, success: false, rejected: true, reason: 'name_taken' }
          })
          return
        }

        const updated = [...currentPlayers, { id, nickname, score: 0, answered: false }]
        setPlayers(updated)

        playerChannel.send({
          type: 'broadcast',
          event: 'join-ack',
          payload: { targetPlayerId: id, success: true }
        })

        sendHostControl('lobby-update', { players: updated.map(p => p.nickname) })
      })
      .on('broadcast', { event: 'player-rejoin' }, ({ payload }) => {
        const { id, nickname } = payload
        const currentPlayers = playersRef.current
        const existing = currentPlayers.find(p => p.id === id || p.nickname.toLowerCase() === nickname.toLowerCase())

        if (existing) {
          playerChannel.send({
            type: 'broadcast',
            event: 'rejoin-ack',
            payload: {
              targetPlayerId: id,
              success: true,
              gameState: gameStateRef.current,
              score: existing.score
            }
          })
        } else {
          playerChannel.send({
            type: 'broadcast',
            event: 'rejoin-ack',
            payload: { targetPlayerId: id, success: false }
          })
        }
      })
      .on('broadcast', { event: 'player-answer' }, ({ payload }) => {
        const { id, optionIndex, timeSpent } = payload

        setPlayers(prev => {
          const currentQ = questions[currentIndex]
          if (!currentQ) return prev

          return prev.map(p => {
            if (p.id !== id || p.answered) return p

            const isCorrect = optionIndex === currentQ.correct_option
            let points = 0
            if (isCorrect) {
              const clampedTimeSpent = Math.max(0, Math.min(timeSpent, currentQ.time_limit))
              points = Math.round(1000 * (1 - clampedTimeSpent / (2 * currentQ.time_limit)))
              points = Math.max(500, Math.min(1000, points))
            }

            return {
              ...p,
              score: p.score + points,
              answered: true
            }
          })
        })

        setAnswerStats(prev => {
          const next = [...prev]
          if (optionIndex >= 0 && optionIndex <= 3) {
            next[optionIndex] += 1
          }
          return next
        })

        playerChannel.send({
          type: 'broadcast',
          event: 'answer-ack',
          payload: { targetPlayerId: id }
        })
      })
      .on('broadcast', { event: 'state-request' }, ({ payload }) => {
        const { id } = payload
        const currentQ = questions[currentIndex]
        playerChannel.send({
          type: 'broadcast',
          event: 'sync-state',
          payload: {
            targetPlayerId: id,
            gameState: gameStateRef.current,
            currentQuestion: currentQ ? { question_text: currentQ.question_text, options: currentQ.options } : undefined
          }
        })
      })
      .subscribe()

    channelRef.current = playerChannel

    return () => {
      hostPresenceChannel.unsubscribe()
      playerChannel.unsubscribe()
    }
  }, [member, hostStatus, pin, questions, currentIndex])

  // 4. Auto-advance question when all players have answered
  useEffect(() => {
    if (gameState !== 'question' || players.length === 0) return
    const allAnswered = players.every(p => p.answered)
    if (allAnswered) {
      if (timerRef.current) clearInterval(timerRef.current)
      endQuestion()
    }
  }, [players, gameState])

  // 5. Time sync broadcast interval during question phase
  useEffect(() => {
    if (gameState !== 'question') return
    const interval = setInterval(() => {
      sendHostControl('time-sync', { remainingSeconds: timer })
    }, 5000)
    return () => clearInterval(interval)
  }, [gameState, timer])

  // Game state handlers
  const handleKickPlayer = (player: Player) => {
    if (confirm(`Kick ${player.nickname}?`)) {
      const updated = players.filter(p => p.id !== player.id)
      setPlayers(updated)
      sendHostControl('player-kicked', { targetPlayerId: player.id })
      sendHostControl('lobby-update', { players: updated.map(p => p.nickname) })
    }
  }

  const startQuiz = () => {
    if (questions.length === 0) return
    triggerIntroBuild()
  }

  const triggerIntroBuild = () => {
    setGameState('intro-build')
    setIntroCountdown(3)
    setIntroTitleShow(false)
    sendHostControl('get-ready', { questionText: 'Get Ready...', questionIndex: 1, totalQuestions: questions.length, gameMode })

    let elapsed = 3
    const interval = setInterval(() => {
      elapsed -= 1
      setIntroCountdown(elapsed)
      if (elapsed <= 0) {
        clearInterval(interval)
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

    sendHostControl('get-ready', {
      questionText: questions[index].question_text,
      questionIndex: index + 1,
      totalQuestions: questions.length,
      gameMode
    })

    if (readyTimerRef.current) clearInterval(readyTimerRef.current)
    readyTimerRef.current = setInterval(() => {
      setReadyCountdown(prev => {
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
    const q = questions[index]
    setTimer(q.time_limit)

    sendHostControl('next-question', {
      questionText: q.question_text,
      options: q.options,
      timeLimit: q.time_limit,
      gameMode
    })

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(prev => {
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
    sendHostControl('time-up', {
      correctOption: questions[currentIndex].correct_option,
      answerStats
    })
  }

  const showLeaderboard = () => {
    const oldSorted = [...players].sort((a, b) => (prevLeaderboard[b.id] ?? 0) - (prevLeaderboard[a.id] ?? 0))
    const newSorted = [...players].sort((a, b) => b.score - a.score)

    const oldTop5 = oldSorted.slice(0, 5)
    const newTop5 = newSorted.slice(0, 5)
    const newTop5Ids = new Set(newTop5.map(p => p.id))

    const enrich = (p: Player, transition: 'stay' | 'enter' | 'leave') => ({
      id: p.id,
      nickname: p.nickname,
      previousScore: prevLeaderboard[p.id] ?? 0,
      currentScore: p.score,
      pointsEarned: p.score - (prevLeaderboard[p.id] ?? 0),
      previousRank: oldSorted.findIndex(x => x.id === p.id) + 1,
      currentRank: newSorted.findIndex(x => x.id === p.id) + 1,
      transition
    })

    const idleData = oldTop5.map(p => enrich(p, 'stay'))
    setActiveLeaderboardPlayers(idleData)
    setAnimationPhase('idle')
    setGameState('leaderboard')

    const stayData = oldTop5.filter(p => newTop5Ids.has(p.id)).map(p => enrich(p, 'stay'))
    const leaveData = oldTop5.filter(p => !newTop5Ids.has(p.id)).map(p => enrich(p, 'leave'))
    const enterData = newTop5.filter(p => !newTop5Ids.has(p.id)).map(p => enrich(p, 'enter'))
    const unionData = [...stayData, ...enterData, ...leaveData]
    const flashData = newTop5.map(p => enrich(p, 'stay'))

    setTimeout(() => setAnimationPhase('runup'), 500)
    setTimeout(() => {
      setActiveLeaderboardPlayers(unionData)
      setAnimationPhase('reorder')
    }, 2100)
    setTimeout(() => {
      setActiveLeaderboardPlayers(flashData)
      setAnimationPhase('flash')
    }, 3300)
    setTimeout(() => {
      setAnimationPhase('done')
      const updatedPrevScores: Record<string, number> = {}
      players.forEach(p => { updatedPrevScores[p.id] = p.score })
      setPrevLeaderboard(updatedPrevScores)

      const standingsMapping: Record<string, { rank: number; score: number }> = {}
      newSorted.forEach((p, idx) => { standingsMapping[p.id] = { rank: idx + 1, score: p.score } })
      sendHostControl('leaderboard-update', { standings: standingsMapping })
    }, 4300)
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
    sendHostControl('podium-building')

    setTimeout(() => setPodiumRevealStep(1), 1200) // 3rd place
    setTimeout(() => setPodiumRevealStep(2), 2400) // 2nd place
    setTimeout(() => {
      setPodiumRevealStep(3) // 1st place
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    }, 3600)
  }

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score)
  }, [players])

  if (hostStatus === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#09090e', color: '#888', fontSize: '14px', letterSpacing: '2px', fontFamily: 'system-ui' }}>
        LOADING HOST SESSION...
      </div>
    )
  }

  if (hostStatus === 'locked') {
    return (
      <div style={{ background: '#09090e', height: '100vh', width: '100vw', color: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', background: '#111116', border: '1px solid #222', padding: '32px', borderRadius: '16px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#e91e63', marginBottom: '12px' }}>Session Locked</h2>
          <p style={{ color: '#888', lineHeight: 1.6, marginBottom: '24px' }}>
            <strong>{activeHostName}</strong> is currently hosting this quiz (started {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s ago). Presenter control is restricted to one active host.
          </p>
          <button onClick={() => navigate('/admin/quiz')} style={{ background: '#e91e63', border: 'none', borderRadius: '8px', color: '#fff', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#09090e', height: '100vh', width: '100vw', color: '#fff', padding: '16px', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Leave button */}
      <button onClick={() => { if (confirm('Exit hosting session?')) navigate('/admin/quiz') }} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', zIndex: 100 }}>
        ← Leave
      </button>

      {/* 1. LOBBY */}
      {gameState === 'lobby' && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '18px', letterSpacing: '4px', color: '#e91e63', fontWeight: 700, margin: '0 0 10px' }}>JOIN AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px', fontWeight: 900, lineHeight: 1 }}>
            PIN: <span style={{ color: '#e91e63' }}>{pin}</span>
          </h1>

          <div onClick={() => setQrZoomed(true)} style={{ background: '#fff', padding: '16px', borderRadius: '20px', marginBottom: '24px', cursor: 'pointer' }}>
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={140} includeMargin={true} />
            <div style={{ color: '#000', fontSize: '10px', fontWeight: 800, marginTop: '4px' }}>CLICK TO ENLARGE</div>
          </div>

          <div style={{ background: '#111116', border: '1px solid #222', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '800px', flex: 1, maxHeight: '35vh', overflowY: 'auto', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px', color: '#e91e63', fontWeight: 800 }}>
              Joined Players ({players.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} onClick={() => handleKickPlayer(p)} style={{ background: getPlayerGradient(p.id), color: '#fff', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{getPlayerEmoji(p.id)}</span>
                  <span>{p.nickname}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#111116', border: '1px solid #222', borderRadius: '8px', padding: '4px' }}>
              <button onClick={() => setGameMode('classic')} style={{ background: gameMode === 'classic' ? '#e91e63' : 'transparent', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Classic Mode</button>
              <button onClick={() => setGameMode('shared')} style={{ background: gameMode === 'shared' ? '#e91e63' : 'transparent', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Shared Screen</button>
            </div>

            <button onClick={startQuiz} disabled={players.length === 0} style={{ background: players.length === 0 ? '#333' : '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 36px', fontSize: '18px', fontWeight: 800, cursor: players.length === 0 ? 'not-allowed' : 'pointer' }}>
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* 2. INTRO BUILD */}
      {gameState === 'intro-build' && (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {!introTitleShow ? (
            <div style={{ fontSize: '120px', fontWeight: 900, color: '#e91e63' }}>{introCountdown}</div>
          ) : (
            <div>
              <h2 style={{ fontSize: '24px', color: '#888', margin: '0 0 12px' }}>GET READY FOR</h2>
              <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#fff' }}>{quizTitle}</h1>
            </div>
          )}
        </div>
      )}

      {/* 3. GET READY */}
      {gameState === 'get-ready' && (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '28px', color: '#e91e63', fontWeight: 800, margin: '0 0 16px' }}>QUESTION {currentIndex + 1} OF {questions.length}</h2>
          <h1 style={{ fontSize: '40px', fontWeight: 800, maxWidth: '800px', margin: '0 0 32px' }}>{questions[currentIndex]?.question_text}</h1>
          <div style={{ fontSize: '80px', fontWeight: 900, color: '#fff' }}>{readyCountdown}</div>
        </div>
      )}

      {/* 4. QUESTION ACTIVE */}
      {gameState === 'question' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#888' }}>{currentIndex + 1} / {questions.length}</span>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e91e63', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 900 }}>
              {timer}
            </div>
            <span style={{ fontSize: '16px', color: '#888', fontWeight: 700 }}>Answers: {players.filter(p => p.answered).length} / {players.length}</span>
          </div>

          <h1 style={{ fontSize: '36px', textAlign: 'center', fontWeight: 800, margin: '20px 0' }}>
            {questions[currentIndex]?.question_text}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            {questions[currentIndex]?.options.map((opt, idx) => (
              <div key={idx} style={{ background: optionColors[idx], padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '22px', fontWeight: 700 }}>
                <span>{optionShapes[idx]}</span>
                <span>{gameMode === 'classic' ? opt : `Option ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ANSWERS */}
      {gameState === 'answers' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 0 16px' }}>
          <h2 style={{ fontSize: '32px', textAlign: 'center', fontWeight: 800 }}>{questions[currentIndex]?.question_text}</h2>

          {/* Bar Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '32px', height: '300px', margin: '20px 0' }}>
            {answerStats.map((count, idx) => {
              const maxCount = Math.max(...answerStats, 1)
              const heightPct = (count / maxCount) * 100
              const isCorrect = idx === questions[currentIndex]?.correct_option

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '120px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{count}</div>
                  <div style={{ width: '100%', height: `${Math.max(heightPct, 8)}%`, background: optionColors[idx], borderRadius: '8px 8px 0 0', position: 'relative', border: isCorrect ? '4px solid #fff' : 'none' }}>
                    {isCorrect && <span style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{optionShapes[idx]}</div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={showLeaderboard} style={{ background: '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '18px', fontWeight: 800, cursor: 'pointer' }}>
              Show Leaderboard →
            </button>
          </div>
        </div>
      )}

      {/* 6. LEADERBOARD */}
      {gameState === 'leaderboard' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 0 16px' }}>
          <h2 style={{ fontSize: '36px', textAlign: 'center', fontWeight: 900, color: '#e91e63' }}>LEADERBOARD</h2>

          <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeLeaderboardPlayers.map((p, idx) => (
              <div key={p.id} style={{ background: '#111116', border: '1px solid #222', padding: '16px 24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#e91e63' }}>#{idx + 1}</span>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>{p.nickname}</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{p.currentScore} pts</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={nextStep} style={{ background: '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 40px', fontSize: '18px', fontWeight: 800, cursor: 'pointer' }}>
              {currentIndex + 1 < questions.length ? 'Next Question →' : 'Final Results →'}
            </button>
          </div>
        </div>
      )}

      {/* 7. ENDED / PODIUM */}
      {gameState === 'ended' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <button onClick={() => setEndedTab('podium')} style={{ background: endedTab === 'podium' ? '#e91e63' : 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              🏆 Podium View
            </button>
            <button onClick={() => setEndedTab('full')} style={{ background: endedTab === 'full' ? '#e91e63' : 'transparent', border: '1px solid #333', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              📜 Full Standings
            </button>
          </div>

          {endedTab === 'podium' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', height: '400px' }}>
              {/* 2nd Place */}
              {podiumRevealStep >= 2 && sortedPlayers[1] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '160px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{sortedPlayers[1].nickname}</div>
                  <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>{sortedPlayers[1].score} pts</div>
                  <div style={{ width: '100%', height: '180px', background: 'linear-gradient(180deg, #c0c0c0 0%, #606060 100%)', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '48px', fontWeight: 900 }}>2</div>
                </div>
              )}

              {/* 1st Place */}
              {podiumRevealStep >= 3 && sortedPlayers[0] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '180px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>👑</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffd700', marginBottom: '8px' }}>{sortedPlayers[0].nickname}</div>
                  <div style={{ fontSize: '16px', color: '#888', marginBottom: '8px' }}>{sortedPlayers[0].score} pts</div>
                  <div style={{ width: '100%', height: '260px', background: 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '64px', fontWeight: 900, color: '#000' }}>1</div>
                </div>
              )}

              {/* 3rd Place */}
              {podiumRevealStep >= 1 && sortedPlayers[2] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>{sortedPlayers[2].nickname}</div>
                  <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>{sortedPlayers[2].score} pts</div>
                  <div style={{ width: '100%', height: '120px', background: 'linear-gradient(180deg, #cd7f32 0%, #8b4513 100%)', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '36px', fontWeight: 900 }}>3</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', overflowY: 'auto', maxHeight: '50vh', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedPlayers.map((p, idx) => (
                <div key={p.id} style={{ background: '#111116', border: '1px solid #222', padding: '14px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, color: '#e91e63' }}>#{idx + 1}</span>
                    <span style={{ fontWeight: 700 }}>{p.nickname}</span>
                  </div>
                  <span style={{ fontWeight: 800 }}>{p.score} pts</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => navigate('/admin/quiz')} style={{ background: '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>
              Back to Quiz Admin
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
