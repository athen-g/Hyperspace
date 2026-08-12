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
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const fetchQuizzes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setQuizzes(data)
      
      // Fetch question counts for each quiz
      const counts: Record<string, number> = {}
      for (const q of data) {
        const { count } = await supabase
          .from('quiz_questions')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', q.id)
        counts[q.id] = count || 0
      }
      setQuestionCounts(counts)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This will permanently remove all associated questions.')) return

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
    if (!title.trim()) return

    const slug = Math.random().toString(36).substring(2, 8)
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ title: title.trim(), description: description.trim(), code_slug: slug })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
    } else if (data) {
      toast.success('Quiz created successfully!')
      navigate(`/admin/quiz/${data.code_slug}/edit`)
    }
  }

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '32px 24px', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Quiz Management Hub</h1>
            <p style={{ color: '#888', margin: '4px 0 0', fontSize: '14px' }}>Create, manage, and host live interactive quizzes.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/quiz/play" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px 18px', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }}>
              Join Player View
            </Link>
            <button onClick={() => setShowCreate(true)} style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'transform 0.1s' }}>
              + Create New Quiz
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ background: '#111116', border: '1px solid #222', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800 }}>Create New Quiz</h3>
              <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px' }}>QUIZ TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. XR SIG Tech Trivia 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px' }}>DESCRIPTION (OPTIONAL)</label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of what this quiz covers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ background: '#E91E63', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
                    Create & Add Questions
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quizzes List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', fontSize: '14px', letterSpacing: '1px' }}>
            LOADING QUIZZES...
          </div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#111116', borderRadius: '16px', border: '1px border #222' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '20px', margin: '0 0 8px', fontWeight: 700 }}>No Quizzes Created Yet</h3>
            <p style={{ color: '#888', margin: '0 0 24px', fontSize: '14px' }}>Get started by creating your first interactive quiz.</p>
            <button onClick={() => setShowCreate(true)} style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              Create Quiz
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {quizzes.map((quiz) => (
              <div key={quiz.id} style={{ background: '#111116', border: '1px solid #222', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.2s' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(233,30,99,0.15)', color: '#E91E63', border: '1px solid rgba(233,30,99,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
                      CODE: {quiz.code_slug.toUpperCase()}
                    </span>
                    <span style={{ color: '#666', fontSize: '12px', fontWeight: 600 }}>
                      {questionCounts[quiz.id] ?? 0} {questionCounts[quiz.id] === 1 ? 'Question' : 'Questions'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: '#fff', lineHeight: 1.3 }}>{quiz.title}</h3>
                  {quiz.description && (
                    <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'orient', overflow: 'hidden' }}>
                      {quiz.description}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1c1c24' }}>
                  <Link to={`/admin/quiz/${quiz.code_slug}/host`} style={{ flex: 1, textDecoration: 'none', background: '#E91E63', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    🚀 Host Live
                  </Link>
                  <Link to={`/admin/quiz/${quiz.code_slug}/edit`} style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                    ✏️ Edit
                  </Link>
                  <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#ff4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
