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

  // Leaderboard transition states
  const [prevLeaderboard, setPrevLeaderboard] = useState<Record<string, number>>({})
  const [animatingStandings, setAnimatingStandings] = useState(false)
  const [activeLeaderboardPlayers, setActiveLeaderboardPlayers] = useState<Player[]>([])

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
          // Send lobby players list to everyone
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
    
    // Broadcast answer statistics together with correctOption
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
    // 1. Sort players based on previous scores (before this question points were added)
    const sortedOld = [...players].sort((a, b) => {
      const aPrev = prevLeaderboard[a.id] ?? 0
      const bPrev = prevLeaderboard[b.id] ?? 0
      return bPrev - aPrev
    })

    // Display previous leaderboard first
    setActiveLeaderboardPlayers(sortedOld.slice(0, 5))
    setAnimatingStandings(true)
    setGameState('leaderboard')

    // Broadcast current standings updates to player clients
    const standingsMapping: Record<string, { rank: number; score: number }> = {}
    const finalSorted = [...players].sort((a, b) => b.score - a.score)
    finalSorted.forEach((p, idx) => {
      standingsMapping[p.id] = { rank: idx + 1, score: p.score }
    })
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'leaderboard-update',
      payload: { standings: standingsMapping }
    })

    // 2. After 1.5s, trigger re-rank animation to display final sorted scores
    setTimeout(() => {
      setActiveLeaderboardPlayers(finalSorted.slice(0, 5))
      setAnimatingStandings(false)
      
      // Save current scores to prevLeaderboard for next round comparison
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
      handleEndQuiz()
    }
  }

  const handleEndQuiz = () => {
    setGameState('ended')
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
    
    // Send final permanent close event to all active clients
    channelRef.current.send({
      type: 'broadcast',
      event: 'time-up',
      payload: { correctOption: -1 }
    })
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲', '◆', '●', '■']
  const totalAnsweredCount = players.filter(p => p.answered).length

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* Return to Dashboard corner button */}
      <button 
        onClick={() => {
          if (confirm('Exit hosting session?')) {
            handleEndQuiz()
            navigate('/admin/quiz')
          }
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
        <div style={{ textAlign: 'center', marginTop: '4vh', animation: 'fadeIn 0.5s ease-out' }}>
          <p style={{ fontSize: '16px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700 }}>JOIN THE GAME AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '80px', margin: '15px 0', letterSpacing: '-2px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', fontWeight: 900 }}>PIN: <span style={{ color: '#E91E63' }}>{pin}</span></h1>
          
          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <QRCodeSVG value={`${window.location.origin}/quiz/play?pin=${pin}`} size={200} level="M" includeMargin={true} />
            <div style={{ color: '#000', fontSize: '13px', fontWeight: 800, marginTop: '8px', letterSpacing: '1px' }}>SCAN QR CODE</div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '700px', margin: '0 auto', minHeight: '200px' }}>
            <h3 style={{ fontSize: '24px', margin: '0 0 24px', color: '#00BCD4', fontWeight: 800 }}>
              {players.length === 0 ? 'Waiting for players to join...' : `Joined Players (${players.length})`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: '30px', fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {p.nickname}
                </div>
              ))}
            </div>
          </div>

          {/* Mode selector */}
          <div style={{ margin: '32px auto 0', maxWidth: '450px', background: '#111', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #222' }}>
            <span style={{ fontSize: '13px', color: '#888', fontWeight: 700, letterSpacing: '1px' }}>LOBBY GAME MODE</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setGameMode('classic')} style={{ flex: 1, background: gameMode === 'classic' ? '#E91E63' : 'transparent', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Classic</button>
              <button onClick={() => setGameMode('shared')} style={{ flex: 1, background: gameMode === 'shared' ? '#00BCD4' : 'transparent', border: '1px solid #333', color: gameMode === 'shared' ? '#000' : '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Shared Screen</button>
            </div>
          </div>

          <button onClick={startQuiz} disabled={players.length === 0} style={{ marginTop: '32px', background: players.length === 0 ? '#222' : '#00BCD4', color: players.length === 0 ? '#555' : '#000', border: 'none', borderRadius: '8px', padding: '16px 48px', fontSize: '20px', fontWeight: 800, cursor: players.length === 0 ? 'not-allowed' : 'pointer', boxShadow: players.length === 0 ? 'none' : '0 8px 25px rgba(0,188,212,0.4)', transition: 'all 0.2s' }}>
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
            <span style={{ fontSize: '16px', color: '#888', fontWeight: 700, letterSpacing: '2px' }}>QUESTION {currentIndex + 1} OF {questions.length}</span>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#888' }}>Answers: <span style={{ color: '#00BCD4', fontSize: '24px' }}>{totalAnsweredCount}</span></div>
              <div style={{ background: '#111', border: '1px solid #333', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 800, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>{timer}</div>
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
            <button onClick={endQuestion} style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '12px 36px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Skip Question</button>
            <button onClick={() => { if (confirm('End early?')) handleEndQuiz() }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '8px', padding: '12px 36px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 4. ANSWERS DISTRIBUTION VIEW */}
      {gameState === 'answers' && questions[currentIndex] && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Correct Answer</h2>
            <span style={{ fontSize: '16px', color: '#888', fontWeight: 700 }}>Total submissions: {totalAnsweredCount}</span>
          </div>

          <h2 style={{ fontSize: '32px', textAlign: 'center', margin: '0 0 60px', color: '#fff' }}>{questions[currentIndex].question_text}</h2>

          {/* Bar Chart Representation of Responses */}
          <div style={{ display: 'flex', height: '280px', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '40px 20px', borderRadius: '24px', marginBottom: '40px', boxSizing: 'border-box' }}>
            {answerStats.map((count, i) => {
              const maxCount = Math.max(...answerStats, 1)
              const heightPercent = (count / maxCount) * 100
              const isCorrect = i === questions[currentIndex].correct_option

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{count}</div>
                  <div style={{ width: '80%', height: `${heightPercent}%`, background: optionColors[i], borderRadius: '8px 8px 0 0', position: 'relative', border: isCorrect ? '4px solid #fff' : 'none', boxShadow: isCorrect ? '0 0 20px #fff' : 'none', transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
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
            <button onClick={showLeaderboard} style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '14px 48px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,188,212,0.3)' }}>Show Standings</button>
            <button onClick={() => { if (confirm('End early?')) handleEndQuiz() }} style={{ background: 'transparent', border: '1px solid #e21b3c', color: '#e21b3c', borderRadius: '8px', padding: '14px 36px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>End Quiz Early</button>
          </div>
        </div>
      )}

      {/* 5. LEADERBOARD STATE */}
      {gameState === 'leaderboard' && (
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#00BCD4', fontWeight: 700 }}>CURRENT STANDINGS</p>
          <h1 style={{ fontSize: '48px', margin: '10px 0 40px', fontWeight: 900 }}>Leaderboard</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', minHeight: '350px', position: 'relative' }}>
            {activeLeaderboardPlayers.map((p, index) => {
              // Find index in final sorted to show final rank number during re-rank
              const finalSortedIndex = sortedPlayers.findIndex(sp => sp.id === p.id)
              const displayRank = animatingStandings ? (players.findIndex(sp => sp.id === p.id) + 1) : (finalSortedIndex + 1)
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
                    padding: '20px 32px',
                    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: displayRank === 1 ? '#ffd700' : displayRank === 2 ? '#c0c0c0' : displayRank === 3 ? '#cd7f32' : '#fff' }}>#{displayRank}</span>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>{p.nickname}</span>
                    {climbed && (
                      <span style={{ background: '#26890c', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', animation: 'pulse 1s infinite' }}>▲ CLIMBED</span>
                    )}
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#00BCD4' }}>{p.score} pts</span>
                </div>
              )
            })}
          </div>

          <button onClick={nextStep} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 48px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(233,30,99,0.4)' }}>
            {currentIndex + 1 < questions.length ? 'Next Question' : 'End Game'}
          </button>
        </div>
      )}

      {/* 6. ENDED STATE - SHOW ALL PLAYERS RANKINGS */}
      {gameState === 'ended' && (
        <div style={{ textAlign: 'center', marginTop: '4vh', animation: 'fadeIn 0.8s' }}>
          <p style={{ fontSize: '16px', letterSpacing: '6px', color: '#00BCD4', fontWeight: 800 }}>QUIZ COMPLETED</p>
          <h1 style={{ fontSize: '48px', margin: '15px 0 40px', fontWeight: 900 }}>Final Results Podium</h1>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', minHeight: '260px', marginBottom: '60px' }}>
            
            {/* 2nd Place */}
            {sortedPlayers[1] && (
              <div style={{ width: '150px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', animation: 'slideUp 0.6s ease-out' }}>
                <span style={{ fontSize: '28px', marginBottom: '8px' }}>🥈</span>
                <span style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[1].nickname}</span>
                <span style={{ fontSize: '14px', color: '#00BCD4' }}>{sortedPlayers[1].score} pts</span>
                <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.1)', marginTop: '16px', borderRadius: '8px' }}></div>
              </div>
            )}

            {/* 1st Place */}
            {sortedPlayers[0] && (
              <div style={{ width: '170px', background: 'rgba(255,255,255,0.1)', border: '2px solid #ffd700', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px', animation: 'slideUp 0.4s ease-out', boxShadow: '0 0 30px rgba(255,215,0,0.2)' }}>
                <span style={{ fontSize: '44px', marginBottom: '8px' }}>👑</span>
                <span style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0', color: '#ffd700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[0].nickname}</span>
                <span style={{ fontSize: '16px', color: '#fff', fontWeight: 700 }}>{sortedPlayers[0].score} pts</span>
                <div style={{ width: '100%', height: '110px', background: 'rgba(255,215,0,0.15)', marginTop: '16px', borderRadius: '8px' }}></div>
              </div>
            )}

            {/* 3rd Place */}
            {sortedPlayers[2] && (
              <div style={{ width: '130px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', animation: 'slideUp 0.8s ease-out' }}>
                <span style={{ fontSize: '24px', marginBottom: '8px' }}>🥉</span>
                <span style={{ fontSize: '14px', fontWeight: 700, margin: '8px 0', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{sortedPlayers[2].nickname}</span>
                <span style={{ fontSize: '13px', color: '#00BCD4' }}>{sortedPlayers[2].score} pts</span>
                <div style={{ width: '100%', height: '50px', background: 'rgba(255,255,255,0.05)', marginTop: '16px', borderRadius: '8px' }}></div>
              </div>
            )}

          </div>

          {/* Detailed All Players list below podium */}
          <div style={{ maxWidth: '600px', margin: '0 auto 40px', background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#00BCD4', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>Full Participant Standings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
              {sortedPlayers.map((p, index) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #1a1a1a', padding: '8px 0' }}>
                  <span>#{index + 1} {p.nickname}</span>
                  <span style={{ fontWeight: 700, color: '#00BCD4' }}>{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/admin/quiz')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '16px 40px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00BCD4'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
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
