import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  code_slug: string
}

export default function QuizPage() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activeSession, setActiveSession] = useState<{
    codeSlug: string
    title: string
    pin: string
    gameState: string
    currentIndex: number
    playerCount: number
    timeAgo: string
  } | null>(null)

  const fetchQuizzes = () => {
    supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setQuizzes(data)
          // Look for active host session in localStorage
          try {
            data.forEach((q) => {
              const stored = localStorage.getItem(`quiz-host-session-${q.code_slug}`)
              if (stored) {
                const parsed = JSON.parse(stored)
                const ageMs = Date.now() - parsed.timestamp
                if (ageMs < 2 * 60 * 60 * 1000) {
                  // Under 2 hours - active session found!
                  const minutesAgo = Math.floor(ageMs / 60000)
                  setActiveSession({
                    codeSlug: q.code_slug,
                    title: q.title,
                    pin: parsed.pin,
                    gameState: parsed.gameState,
                    currentIndex: parsed.currentIndex,
                    playerCount: parsed.players ? parsed.players.length : 0,
                    timeAgo: minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`
                  })
                } else {
                  // Older than 2 hours - clear stale entry
                  localStorage.removeItem(`quiz-host-session-${q.code_slug}`)
                }
              }
            })
          } catch (e) {
            console.warn('Failed to parse active host session:', e)
          }
        }
      })
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this game? This will permanently delete all associated questions.')) return

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    if (!error) {
      toast.success('Quiz deleted successfully.')
      fetchQuizzes()
    } else {
      toast.error(error.message)
    }
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const { data: { user } } = await supabase.auth.getUser()
    const slug = Math.random().toString(36).substring(2, 8)
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ title, description, created_by: user?.id, code_slug: slug })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('quiz_questions').insert({
        quiz_id: data.id,
        question_text: 'What is Hyperspace XR focused on?',
        options: ['Web3', 'Immersive Reality & XR', 'AI Text Generation', 'Cybersecurity'],
        correct_option: 1,
        time_limit: 20,
        sort_order: 1
      })

      toast.success('Quiz created successfully!')
      navigate(`/admin/quiz/edit/${data.code_slug}`)
    }
  }

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Block with Pink branding accent */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #1f1f2e', paddingBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0, letterSpacing: '-1px', color: '#fff' }}>Quiz Admin Hub</h1>
            <p style={{ color: '#888', margin: '6px 0 0', fontSize: '15px' }}>Design, edit, and host interactive real-time presenter sessions.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/quiz/play" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px 20px', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E91E63'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>Join Player view</Link>
            <button onClick={() => setShowCreate(true)} style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>Create New Quiz</button>
          </div>
        </div>

        {/* Resume Active Session Card */}
        {activeSession && (
          <div style={{ background: 'linear-gradient(135deg, rgba(233,30,99,0.15) 0%, rgba(233,30,99,0.02) 100%)', border: '1px solid rgba(233,30,99,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
            <div>
              <span style={{ background: '#E91E63', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Session Detected</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '8px 0 4px' }}>{activeSession.title}</h2>
              <div style={{ display: 'flex', gap: '20px', color: '#aaa', fontSize: '14px', marginTop: '8px' }}>
                <span>PIN: <strong style={{ color: '#fff' }}>{activeSession.pin}</strong></span>
                <span>•</span>
                <span>Question: <strong style={{ color: '#fff' }}>#{activeSession.currentIndex + 1}</strong></span>
                <span>•</span>
                <span>Players: <strong style={{ color: '#fff' }}>{activeSession.playerCount}</strong></span>
                <span>•</span>
                <span>Disconnected: <strong style={{ color: '#fff' }}>{activeSession.timeAgo}</strong></span>
              </div>
            </div>
            <Link to={`/admin/quiz/host/${activeSession.codeSlug}`} style={{ textDecoration: 'none', background: '#E91E63', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 15px rgba(233,30,99,0.4)', transition: 'transform 0.1s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Resume Active Session →
            </Link>
          </div>
        )}

        {/* Modal Create form Overlay */}
        {showCreate && (
          <div style={{ background: '#111116', border: '1px solid #1f1f2e', borderRadius: '16px', padding: '32px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800 }}>Create a New Quiz</h3>
            <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>QUIZ TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Workshop Session 1 Quiz"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', background: '#09090e', border: '1px solid #222', borderRadius: '8px', color: '#fff', padding: '12px 16px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>DESCRIPTION (OPTIONAL)</label>
                <textarea
                  placeholder="Provide a brief context or instructions for this game..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', background: '#09090e', border: '1px solid #222', borderRadius: '8px', color: '#fff', padding: '12px 16px', fontSize: '15px', boxSizing: 'border-box', height: '100px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>Create & Edit</button>
              </div>
            </form>
          </div>
        )}

        {/* Available Quizzes Grid List */}
        <h2 style={{ fontSize: '20px', margin: '0 0 20px', color: '#888', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Available Games ({quizzes.length})</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          {quizzes.length === 0 ? (
            <div style={{ background: '#111116', border: '1px dashed #222', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#555' }}>
              <p style={{ margin: 0, fontSize: '16px' }}>No quizzes available. Create one to begin!</p>
            </div>
          ) : (
            quizzes.map(q => (
              <div key={q.id} style={{ background: '#111116', border: '1px solid #1f1f2e', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ maxWidth: '60%' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700 }}>{q.title}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#888', lineHeight: 1.4 }}>{q.description || 'No description provided.'}</p>
                  <div style={{ fontSize: '11px', color: '#444', marginTop: '12px', fontFamily: 'monospace' }}>SLUG: {q.code_slug}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => handleDeleteQuiz(q.id)} style={{ background: 'transparent', border: '1px solid rgba(226, 27, 60, 0.2)', borderRadius: '8px', color: '#e21b3c', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(226,27,60,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Delete</button>
                  <Link to={`/admin/quiz/edit/${q.code_slug}`} style={{ textDecoration: 'none', background: 'transparent', border: '1px solid #222', borderRadius: '8px', color: '#aaa', padding: '10px 20px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E91E63'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}>Edit Questions</Link>
                  <Link to={`/admin/quiz/host/${q.code_slug}`} style={{ textDecoration: 'none', background: '#E91E63', borderRadius: '8px', color: '#fff', padding: '10px 24px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(233,30,99,0.2)' }}>Host Game →</Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
