import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function QuizPlayer() {
  const location = useLocation()
  const [pin, setPin] = useState('')
  const [nickname, setNickname] = useState('')
  const [joined, setJoined] = useState(false)
  const [status, setStatus] = useState<'lobby' | 'get-ready' | 'question' | 'waiting' | 'wrong' | 'correct' | 'times-up' | 'podium-building' | 'ended'>('lobby')
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
  
  const [readyCountdown, setReadyCountdown] = useState(3)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(1)
  
  // Lobby waiting list of other joined nicknames
  const [lobbyNicknames, setLobbyNicknames] = useState<string[]>([])

  // Standing / Rank status states
  const [playerRank, setPlayerRank] = useState<number | null>(null)
  const [playerScore, setPlayerScore] = useState<number>(0)
  const [streakCount, setStreakCount] = useState<number>(0)

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
      .on('broadcast', { event: 'lobby-update' }, ({ payload }) => {
        if (payload.players) {
          setLobbyNicknames(payload.players)
        }
      })
      .on('broadcast', { event: 'get-ready' }, ({ payload }) => {
        setQuestionText(payload.questionText)
        setCurrentQuestionIndex(payload.questionIndex)
        setTotalQuestions(payload.totalQuestions)
        setGameMode(payload.gameMode || 'classic')
        setReadyCountdown(3)
        setStatus('get-ready')

        const interval = setInterval(() => {
          setReadyCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
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
          // If standings mapped payload is included inside this final trigger
          if (payload.standings && payload.standings[playerId]) {
            setPlayerRank(payload.standings[playerId].rank)
            setPlayerScore(payload.standings[playerId].score)
          }
          setStatus('ended')
          return
        }
        setCorrectOption(payload.correctOption)
        const chosen = selectedOptionRef.current
        
        setStatus(() => {
          if (chosen !== null) {
            const isCorrect = chosen === payload.correctOption
            if (isCorrect) {
              setStreakCount(prev => prev + 1)
              return 'correct'
            } else {
              setStreakCount(0)
              return 'wrong'
            }
          } else {
            setStreakCount(0)
            return 'times-up' // Timeout waiting state
          }
        })
      })
      .on('broadcast', { event: 'podium-building' }, () => {
        setStatus('podium-building')
      })
      .on('broadcast', { event: 'leaderboard-update' }, ({ payload }) => {
        if (payload.standings && payload.standings[playerId]) {
          setPlayerRank(payload.standings[playerId].rank)
          setPlayerScore(payload.standings[playerId].score)
        }
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
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      {/* 1. LOBBY/PIN JOIN FORM */}
      {!joined && (
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', padding: '20px', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '32px', fontWeight: 800 }}>Join Quiz Game</h2>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Game PIN"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '14px 20px', fontSize: '18px', boxSizing: 'border-box', textAlign: 'center', fontWeight: 700 }}
            />
            <input
              type="text"
              placeholder="Your Nickname"
              required
              maxLength={15}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '14px 20px', fontSize: '18px', boxSizing: 'border-box', textAlign: 'center', fontWeight: 700 }}
            />
            <button type="submit" style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,188,212,0.3)' }}>
              Join Game
            </button>
          </form>
        </div>
      )}

      {/* 2. JOINED / WAITING IN LOBBY STATE */}
      {joined && status === 'lobby' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '36px', color: '#00BCD4', marginBottom: '16px', fontWeight: 800 }}>You're in!</h2>
          <p style={{ fontSize: '20px', color: '#888', marginBottom: '32px' }}>Nickname: <strong>{nickname}</strong></p>
          
          <div style={{ background: '#111', border: '1px solid #222', padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Other Joined Players ({lobbyNicknames.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {lobbyNicknames.map((name, idx) => (
                <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #222', borderRadius: '20px', padding: '6px 12px', fontSize: '14px', color: name === nickname ? '#00BCD4' : '#aaa' }}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. GET READY 3S MIRROR STATE - Hide question text on classic mode */}
      {joined && status === 'get-ready' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700 }}>QUESTION {currentQuestionIndex} OF {totalQuestions}</p>
          {gameMode === 'shared' && (
            <h2 style={{ fontSize: '28px', margin: '32px 0 20px', fontWeight: 800 }}>{questionText}</h2>
          )}
          <div style={{ fontSize: '32px', margin: '20px 0 10px', color: '#aaa', fontWeight: 600 }}>Ready...</div>
          <div style={{ fontSize: '80px', fontWeight: 950, color: '#E91E63', animation: 'pulse 1s infinite' }}>{readyCountdown}</div>
        </div>
      )}

      {/* 4. QUESTION ACTION CONTROLLER STATE */}
      {joined && status === 'question' && (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s' }}>
          {gameMode === 'shared' && (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '10px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{questionText}</h2>
            </div>
          )}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: '0 0 10px', fontWeight: 700, letterSpacing: '1px' }}>
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
                  transition: 'all 0.1s',
                  padding: '16px',
                  gap: '8px',
                  fontWeight: gameMode === 'shared' ? 700 : 400,
                  boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
                }}
              >
                <span style={{ fontSize: gameMode === 'shared' ? '28px' : '54px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{optionShapes[i]}</span>
                {gameMode === 'shared' && <span>{opt}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. WAITING FOR RESULTS STATE */}
      {joined && status === 'waiting' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏱️</div>
          <h2 style={{ fontSize: '28px', color: '#00BCD4', marginBottom: '12px', fontWeight: 800 }}>Answer Submitted!</h2>
          <p style={{ fontSize: '16px', color: '#888' }}>Waiting for other players to finish...</p>
        </div>
      )}

      {/* 6. CORRECT STATE - SHOW STANDINGS SUMMARY & STREAK */}
      {joined && status === 'correct' && (
        <div style={{ textAlign: 'center', animation: 'popIn 0.4s', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>✔️</h1>
          <h2 style={{ fontSize: '36px', color: '#26890c', fontWeight: 800 }}>Correct!</h2>
          
          {streakCount > 0 && (
            <div style={{ margin: '16px 0', fontSize: '18px', color: '#FF9800', fontWeight: 700 }}>
              Answer Streak 🔥 {streakCount}
            </div>
          )}

          {playerRank !== null && (
            <div style={{ marginTop: '24px', background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
              <p style={{ color: '#555', margin: '0 0 4px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Ranking Status</p>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#00BCD4' }}>Rank #{playerRank}</div>
              <div style={{ fontSize: '16px', color: '#aaa', marginTop: '6px' }}>Score: {playerScore} points</div>
            </div>
          )}
        </div>
      )}

      {/* 7. WRONG STATE - SHOW STANDINGS SUMMARY */}
      {joined && status === 'wrong' && (
        <div style={{ textAlign: 'center', animation: 'popIn 0.4s', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>❌</h1>
          <h2 style={{ fontSize: '36px', color: '#e21b3c', fontWeight: 800 }}>Incorrect</h2>

          {playerRank !== null && (
            <div style={{ marginTop: '24px', background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
              <p style={{ color: '#555', margin: '0 0 4px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Ranking Status</p>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#00BCD4' }}>Rank #{playerRank}</div>
              <div style={{ fontSize: '16px', color: '#aaa', marginTop: '6px' }}>Score: {playerScore} points</div>
            </div>
          )}
        </div>
      )}

      {/* 8. TIMES UP STATE */}
      {joined && status === 'times-up' && (
        <div style={{ textAlign: 'center', animation: 'popIn 0.4s', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>⏰</h1>
          <h2 style={{ fontSize: '36px', color: '#FF9800', fontWeight: 800 }}>Time's Up!</h2>
          <p style={{ fontSize: '16px', color: '#aaa', marginTop: '8px' }}>You didn't submit an answer in time.</p>

          {playerRank !== null && (
            <div style={{ marginTop: '24px', background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
              <p style={{ color: '#555', margin: '0 0 4px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Ranking Status</p>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#00BCD4' }}>Rank #{playerRank}</div>
              <div style={{ fontSize: '16px', color: '#aaa', marginTop: '6px' }}>Score: {playerScore} points</div>
            </div>
          )}
        </div>
      )}

      {/* 9. PODIUM BUILDING BUFFER SCREEN */}
      {joined && status === 'podium-building' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'pulse 1s infinite' }}>👑</div>
          <h2 style={{ fontSize: '28px', color: '#00BCD4', marginBottom: '12px', fontWeight: 800 }}>building up...</h2>
          <p style={{ fontSize: '16px', color: '#888' }}>Calculating final standings. Look at the host screen!</p>
        </div>
      )}

      {/* 10. GAME ENDED STATE */}
      {joined && status === 'ended' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s' }}>
          <h1 style={{ fontSize: '80px', margin: '0 0 16px' }}>🏁</h1>
          <h2 style={{ fontSize: '32px', color: '#00BCD4', fontWeight: 800 }}>Quiz Finished!</h2>
          
          {playerRank !== null ? (
            <div style={{ margin: '24px auto', maxWidth: '350px', background: '#111', border: '1px solid #222', padding: '24px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Final Rank</div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#FFD700', margin: '12px 0' }}>#{playerRank}</div>
              <div style={{ fontSize: '18px', color: '#fff' }}>Total score: {playerScore} points</div>
            </div>
          ) : (
            <p style={{ fontSize: '16px', color: '#888', marginTop: '12px', marginBottom: '32px' }}>Check the presenter screen for final rankings.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '32px' }}>
            <button 
              onClick={() => {
                setJoined(false)
                setStatus('lobby')
                setLobbyNicknames([])
                setPlayerRank(null)
                setPlayerScore(0)
                setStreakCount(0)
              }} 
              style={{ background: '#00BCD4', border: 'none', borderRadius: '8px', color: '#000', padding: '12px 32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', width: '100%', maxWidth: '240px' }}
            >
              Play Again / Join New Lobby
            </button>
            <a href="/" style={{ display: 'inline-block', textDecoration: 'none', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '12px 32px', fontWeight: 700, transition: 'all 0.2s', width: '100%', maxWidth: '240px', boxSizing: 'border-box' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00BCD4' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333' }}>
              Return to Hyperspace
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
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
