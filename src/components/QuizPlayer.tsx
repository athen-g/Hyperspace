import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export default function QuizPlayer() {
  const location = useLocation()
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [joined, setJoined] = useState(false)

  // Status state machine
  const [status, setStatus] = useState<
    'lobby' | 'get-ready' | 'question' | 'waiting' | 'wrong' | 'correct' | 'times-up' | 'podium-building' | 'ended' |
    'rejected_game_in_progress' | 'rejected_name_taken' | 'rejected_session_full' | 'rejected_quiz_ended'
  >('lobby')

  // Participant UUID
  const [playerId] = useState(() => {
    try {
      const stored = localStorage.getItem('quiz-player-uuid')
      if (stored) return stored
      const newId = 'player_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('quiz-player-uuid', newId)
      return newId
    } catch {
      return 'player_' + Math.random().toString(36).substring(2, 15)
    }
  })

  // Connection & Dead Host Monitors
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [deadHost, setDeadHost] = useState(false)
  const [timerDisplay, setTimerDisplay] = useState<number>(0)

  // Realtime Question Data
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [gameMode, setGameMode] = useState<'classic' | 'shared'>('classic')
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const [readyCountdown, setReadyCountdown] = useState(3)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(1)

  // Standings
  const [playerRank, setPlayerRank] = useState<number | null>(null)
  const [playerScore, setPlayerScore] = useState<number>(0)

  const channelRef = useRef<any>(null)
  const startTimeRef = useRef<number>(0)
  const timeLimitRef = useRef<number>(20)
  const lastBroadcastTimeRef = useRef<number>(Date.now())
  const hasAnsweredRef = useRef(false)
  const localTimerIntervalRef = useRef<any>(null)

  // 1. Parse URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlPin = params.get('pin')
    if (urlPin) setPin(urlPin)
  }, [location])

  // 2. Auto-rejoin on mount from localStorage
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem('quiz-player-joined-pin')
      const savedNickname = localStorage.getItem('quiz-player-nickname')
      if (savedPin && savedNickname) {
        setPin(savedPin)
        setNickname(savedNickname)
        connectChannel(savedPin, savedNickname, true)
      }
    } catch (e) {
      console.warn(e)
    }

    return () => {
      if (channelRef.current) channelRef.current.unsubscribe()
      if (localTimerIntervalRef.current) clearInterval(localTimerIntervalRef.current)
    }
  }, [])

  // 3. Dead host monitor
  useEffect(() => {
    const interval = setInterval(() => {
      if (!joined) return
      const maxSilence = (timeLimitRef.current + 10) * 1000
      if (Date.now() - lastBroadcastTimeRef.current > maxSilence) {
        setDeadHost(true)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [joined])

  const handleNormalExit = () => {
    try {
      localStorage.removeItem('quiz-player-joined-pin')
      localStorage.removeItem('quiz-player-nickname')
    } catch (e) {
      console.warn(e)
    }
    setJoined(false)
    setStatus('lobby')
    setPlayerRank(null)
    setPlayerScore(0)
    setDeadHost(false)
    setConnectionError(null)
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
    }
  }

  const connectChannel = (targetPin: string, playerNick: string, isRejoinAttempt = false) => {
    if (channelRef.current) channelRef.current.unsubscribe()

    const channel = supabase.channel(`quiz-${targetPin}`, {
      config: { broadcast: { self: true, ack: true } }
    })

    channel.on('system' as any, {} as any, (event: any) => {
      if (event.status === 'disconnected' || event.status === 'timed out') {
        setConnectionError('Connection lost. Reconnecting...')
      } else if (event.status === 'connected') {
        setConnectionError(null)
      }
    })

    channel
      .on('broadcast', { event: 'join-ack' }, ({ payload }) => {
        if (payload.targetPlayerId !== playerId) return
        lastBroadcastTimeRef.current = Date.now()

        if (payload.rejected) {
          if (payload.reason === 'game_in_progress') setStatus('rejected_game_in_progress')
          else if (payload.reason === 'name_taken') setStatus('rejected_name_taken')
          else if (payload.reason === 'session_full') setStatus('rejected_session_full')
          else if (payload.reason === 'quiz_ended') setStatus('rejected_quiz_ended')
          setJoined(false)
          return
        }

        if (payload.success) {
          try {
            localStorage.setItem('quiz-player-joined-pin', targetPin)
            localStorage.setItem('quiz-player-nickname', playerNick)
          } catch (e) {
            console.warn(e)
          }
          setJoined(true)
          setStatus('lobby')
        }
      })
      .on('broadcast', { event: 'rejoin-ack' }, ({ payload }) => {
        if (payload.targetPlayerId !== playerId) return
        lastBroadcastTimeRef.current = Date.now()

        if (payload.success) {
          try {
            localStorage.setItem('quiz-player-joined-pin', targetPin)
            localStorage.setItem('quiz-player-nickname', playerNick)
          } catch (e) {
            console.warn(e)
          }
          setJoined(true)
          setPlayerScore(payload.score ?? 0)
          setDeadHost(false)

          const recoveredState = payload.gameState
          if (recoveredState === 'intro-build' || recoveredState === 'lobby') {
            setStatus('lobby')
          } else if (recoveredState === 'get-ready') {
            setStatus('get-ready')
            setReadyCountdown(3)
          } else if (recoveredState === 'question') {
            if (payload.currentQuestion) {
              setQuestionText(payload.currentQuestion.question_text)
              setOptions(payload.currentQuestion.options)
              setStatus('question')
            }
          } else if (recoveredState === 'answers') {
            setStatus('times-up')
          } else if (recoveredState === 'ended') {
            setStatus('ended')
          }
        } else {
          handleNormalExit()
        }
      })
      .on('broadcast', { event: 'player-kicked' }, ({ payload }) => {
        if (payload?.origin !== 'server') return
        if (payload.targetPlayerId === playerId) {
          toast.error('You were kicked from the lobby by the host.')
          handleNormalExit()
        }
      })
      .on('broadcast', { event: 'get-ready' }, ({ payload }) => {
        if (payload?.origin !== 'server') return
        lastBroadcastTimeRef.current = Date.now()
        setQuestionText(payload.questionText)
        setCurrentQuestionIndex(payload.questionIndex)
        setTotalQuestions(payload.totalQuestions)
        setGameMode(payload.gameMode || 'classic')
        setReadyCountdown(3)
        setStatus('get-ready')

        const interval = setInterval(() => {
          setReadyCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      })
      .on('broadcast', { event: 'next-question' }, ({ payload }) => {
        if (payload?.origin !== 'server') return
        lastBroadcastTimeRef.current = Date.now()
        setQuestionText(payload.questionText)
        setOptions(payload.options)
        setGameMode(payload.gameMode || 'classic')
        timeLimitRef.current = payload.timeLimit
        setSelectedOption(null)
        setCorrectOption(null)
        hasAnsweredRef.current = false
        startTimeRef.current = Date.now()
        setStatus('question')

        setTimerDisplay(payload.timeLimit)
        if (localTimerIntervalRef.current) clearInterval(localTimerIntervalRef.current)
        localTimerIntervalRef.current = setInterval(() => {
          setTimerDisplay(prev => {
            if (prev <= 1) {
              clearInterval(localTimerIntervalRef.current)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      })
      .on('broadcast', { event: 'time-sync' }, ({ payload }) => {
        lastBroadcastTimeRef.current = Date.now()
        setTimerDisplay(payload.remainingSeconds)
      })
      .on('broadcast', { event: 'time-up' }, ({ payload }) => {
        if (payload?.origin !== 'server') return
        lastBroadcastTimeRef.current = Date.now()
        if (localTimerIntervalRef.current) clearInterval(localTimerIntervalRef.current)

        setCorrectOption(payload.correctOption)
        const chosen = selectedOption

        if (chosen !== null) {
          if (chosen === payload.correctOption) setStatus('correct')
          else setStatus('wrong')
        } else {
          setStatus('times-up')
        }
      })
      .on('broadcast', { event: 'podium-building' }, ({ payload }) => {
        if (payload?.origin !== 'server') return
        lastBroadcastTimeRef.current = Date.now()
        setStatus('podium-building')
      })
      .on('broadcast', { event: 'leaderboard-update' }, ({ payload }) => {
        if (payload?.origin !== 'server') return
        lastBroadcastTimeRef.current = Date.now()
        if (payload.standings && payload.standings[playerId]) {
          setPlayerRank(payload.standings[playerId].rank)
          setPlayerScore(payload.standings[playerId].score)
        }
      })
      .subscribe((statusVal) => {
        if (statusVal === 'SUBSCRIBED') {
          setConnectionError(null)
          if (isRejoinAttempt) {
            channel.send({
              type: 'broadcast',
              event: 'player-rejoin',
              payload: { id: playerId, nickname: playerNick }
            })
          } else {
            channel.send({
              type: 'broadcast',
              event: 'player-join',
              payload: { id: playerId, nickname: playerNick }
            })
          }
        }
      })

    channelRef.current = channel
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim() || !nickname.trim()) return
    connectChannel(pin.trim(), nickname.trim(), false)
  }

  const submitAnswer = (optionIndex: number) => {
    if (status !== 'question') return
    if (hasAnsweredRef.current) return
    hasAnsweredRef.current = true

    setSelectedOption(optionIndex)
    setStatus('waiting')

    const timeSpent = (Date.now() - startTimeRef.current) / 1000

    channelRef.current.send({
      type: 'broadcast',
      event: 'player-answer',
      payload: {
        id: playerId,
        optionIndex,
        timeSpent: Math.min(timeSpent, timeLimitRef.current)
      }
    })
  }

  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
      
      {/* Network banner */}
      {connectionError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#e21b3c', color: '#fff', textAlign: 'center', padding: '8px', zIndex: 2000, fontSize: '13px', fontWeight: 700 }}>
          ⚠️ {connectionError}
        </div>
      )}

      {/* Dead host banner */}
      {deadHost && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,9,14,0.95)', zIndex: 1999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Host Disconnected</h2>
          <p style={{ color: '#888', margin: '0 0 24px', maxWidth: '320px', fontSize: '14px' }}>Waiting for presenter broadcast...</p>
          <button onClick={handleNormalExit} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #333', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Exit Game</button>
        </div>
      )}

      {/* Rejections */}
      {status.startsWith('rejected_') && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#e21b3c', margin: '0 0 12px' }}>
            {status === 'rejected_game_in_progress' && 'Game in Progress'}
            {status === 'rejected_name_taken' && 'Nickname Taken'}
            {status === 'rejected_session_full' && 'Session Full'}
            {status === 'rejected_quiz_ended' && 'Quiz Ended'}
          </h2>
          <p style={{ color: '#888', margin: '0 0 24px' }}>Unable to join session.</p>
          <button onClick={handleNormalExit} style={{ background: '#e21b3c', border: 'none', color: '#fff', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      )}

      {/* 1. JOIN FORM */}
      {!joined && !status.startsWith('rejected_') && (
        <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto', background: '#111116', border: '1px solid #222', padding: '28px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, textAlign: 'center', margin: '0 0 24px', color: '#e21b3c' }}>JOIN QUIZ</h2>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: 800 }}>GAME PIN</label>
              <input
                type="text"
                required
                placeholder="6-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '18px', fontWeight: 800, textAlign: 'center', letterSpacing: '2px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: 800 }}>NICKNAME</label>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '16px', fontWeight: 700, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" style={{ background: '#e21b3c', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', marginTop: '8px' }}>
              Enter Game
            </button>
          </form>
        </div>
      )}

      {/* 2. PLAYER LOBBY */}
      {joined && status === 'lobby' && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>You're in, {nickname}!</h2>
          <p style={{ color: '#888', fontSize: '15px' }}>See your nickname on screen? Waiting for host to start...</p>
        </div>
      )}

      {/* 3. GET READY */}
      {joined && status === 'get-ready' && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{ color: '#e21b3c', fontWeight: 800, margin: '0 0 12px' }}>QUESTION {currentQuestionIndex} OF {totalQuestions}</h3>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 24px' }}>{questionText}</h2>
          <div style={{ fontSize: '72px', fontWeight: 900 }}>{readyCountdown}</div>
        </div>
      )}

      {/* 4. QUESTION / ANSWER TILES */}
      {joined && status === 'question' && (
        <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: 800, color: '#888' }}>{currentQuestionIndex} / {totalQuestions}</span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#e21b3c' }}>⏱️ {timerDisplay}s</span>
          </div>

          {gameMode === 'classic' && (
            <h2 style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', margin: '0 0 24px' }}>{questionText}</h2>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: '280px' }}>
            {optionColors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => submitAnswer(idx)}
                style={{
                  background: color,
                  border: 'none',
                  borderRadius: '16px',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  gap: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                }}
              >
                <span style={{ fontSize: '36px' }}>{optionShapes[idx]}</span>
                {gameMode === 'classic' && (
                  <span style={{ fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>{options[idx]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. WAITING */}
      {joined && status === 'waiting' && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Answer Submitted!</h2>
          <p style={{ color: '#888' }}>Waiting for time to expire...</p>
        </div>
      )}

      {/* 6. RESULTS */}
      {joined && (status === 'correct' || status === 'wrong' || status === 'times-up') && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {status === 'correct' ? '🎉' : status === 'wrong' ? '❌' : '⏱️'}
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: status === 'correct' ? '#4CAF50' : '#e21b3c', margin: '0 0 8px' }}>
            {status === 'correct' && 'Correct!'}
            {status === 'wrong' && 'Incorrect!'}
            {status === 'times-up' && "Time's Up!"}
          </h2>
          {playerRank && (
            <div style={{ marginTop: '24px', background: '#111116', border: '1px solid #222', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>YOUR CURRENT RANK</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#e21b3c' }}>#{playerRank}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{playerScore} points</div>
            </div>
          )}
        </div>
      )}

      {/* 7. PODIUM BUILDING / ENDED */}
      {joined && (status === 'podium-building' || status === 'ended') && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#ffd700', margin: '0 0 8px' }}>Quiz Finished!</h2>
          {playerRank ? (
            <div style={{ marginTop: '20px', background: '#111116', border: '1px solid #222', padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '14px', color: '#888' }}>FINAL RANK</div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#e21b3c' }}>#{playerRank}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '8px' }}>{playerScore} points</div>
            </div>
          ) : (
            <p style={{ color: '#888' }}>Calculating final results...</p>
          )}
        </div>
      )}

    </div>
  )
}
