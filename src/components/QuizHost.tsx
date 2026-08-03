import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [pin] = useState(() => Math.floor(100000 + Math.random() * 900000).toString())
  const [gameState, setGameState] = useState<'lobby' | 'question' | 'answers' | 'leaderboard' | 'ended'>('lobby')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [timer, setTimer] = useState(0)
  const [answerStats, setAnswerStats] = useState<number[]>([0, 0, 0, 0])
  const channelRef = useRef<any>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (quizId) {
      supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('sort_order', { ascending: true })
        .then(({ data }) => {
          if (data) setQuestions(data)
        })
    }
  }, [quizId])

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
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui' }}>
      
      {/* 1. LOBBY STATE */}
      {gameState === 'lobby' && (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#888' }}>JOIN AT <strong>/quiz/play</strong></p>
          <h1 style={{ fontSize: '72px', margin: '20px 0', letterSpacing: '-2px' }}>PIN: <span style={{ color: '#E91E63' }}>{pin}</span></h1>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px', color: '#bbb' }}>Waiting for players... ({players.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {players.map((p) => (
                <div key={p.id} style={{ background: '#222', border: '1px solid #333', padding: '8px 16px', borderRadius: '20px', fontSize: '15px' }}>{p.nickname}</div>
              ))}
            </div>
          </div>
          <button onClick={startQuiz} style={{ marginTop: '40px', background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 36px', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}>
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
                opacity: gameState === 'answers' && i !== questions[currentIndex].correct_option ? 0.3 : 1
              }}>
                <span style={{ fontSize: '28px' }}>{optionShapes[i]}</span>
                {opt}
              </div>
            ))}
          </div>

          {/* Action trigger panel */}
          <div style={{ textAlign: 'center' }}>
            {gameState === 'question' ? (
              <button onClick={endQuestion} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 30px', fontSize: '16px', cursor: 'pointer' }}>Skip Question</button>
            ) : (
              <button onClick={showLeaderboard} style={{ background: '#00BCD4', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 30px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>Show Leaderboard</button>
            )}
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
