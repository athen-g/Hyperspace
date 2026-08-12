import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface Question {
  id?: string
  question_text: string
  options: string[]
  correct_option: number
  time_limit: number
  sort_order?: number
}

interface Quiz {
  id: string
  title: string
  description: string
  code_slug: string
}

export default function QuizEditor() {
  const { codeSlug } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  // Title / description editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Question Form states
  const [questionText, setQuestionText] = useState('')
  const [opt0, setOpt0] = useState('')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')
  const [opt3, setOpt3] = useState('')
  const [correctOption, setCorrectOption] = useState(0)
  const [timeLimit, setTimeLimit] = useState(20)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (codeSlug) {
      supabase
        .from('quizzes')
        .select('*')
        .eq('code_slug', codeSlug)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            toast.error('Quiz not found.')
            navigate('/admin/quiz')
          } else {
            setQuiz(data)
            setNewTitle(data.title)
            setNewDescription(data.description || '')
            fetchQuestions(data.id)
          }
        })
    }
  }, [codeSlug])

  const fetchQuestions = async (quizIdVal: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizIdVal)
      .order('sort_order', { ascending: true })

    if (error) {
      toast.error(error.message)
    } else if (data) {
      setQuestions(data)
    }
    setLoading(false)
  }

  const handleUpdateQuizDetails = async () => {
    if (!quiz?.id || !newTitle.trim()) return
    const { error } = await supabase
      .from('quizzes')
      .update({ title: newTitle.trim(), description: newDescription.trim() })
      .eq('id', quiz.id)

    if (!error) {
      toast.success('Quiz details updated!')
      setQuiz(prev => prev ? { ...prev, title: newTitle.trim(), description: newDescription.trim() } : null)
      setEditingTitle(false)
    } else {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setQuestionText('')
    setOpt0('')
    setOpt1('')
    setOpt2('')
    setOpt3('')
    setCorrectOption(0)
    setTimeLimit(20)
    setEditingId(null)
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quiz?.id) return
    if (!questionText.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      toast.error('Please fill in question text and all 4 options.')
      return
    }

    const payload = {
      quiz_id: quiz.id,
      question_text: questionText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correct_option: correctOption,
      time_limit: Number(timeLimit) || 20,
    }

    if (editingId) {
      const { error } = await supabase
        .from('quiz_questions')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Question updated successfully!')
        resetForm()
        fetchQuestions(quiz.id)
      }
    } else {
      const nextSortOrder = questions.length
      const { error } = await supabase
        .from('quiz_questions')
        .insert({ ...payload, sort_order: nextSortOrder })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Question added successfully!')
        resetForm()
        fetchQuestions(quiz.id)
      }
    }
  }

  const handleEditClick = (q: Question) => {
    if (!q.id) return
    setEditingId(q.id)
    setQuestionText(q.question_text)
    setOpt0(q.options[0] || '')
    setOpt1(q.options[1] || '')
    setOpt2(q.options[2] || '')
    setOpt3(q.options[3] || '')
    setCorrectOption(q.correct_option)
    setTimeLimit(q.time_limit || 20)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteQuestion = async (qId: string) => {
    if (!quiz?.id || !confirm('Delete this question?')) return
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', qId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Question deleted.')
      fetchQuestions(quiz.id)
    }
  }

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (!quiz?.id) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= questions.length) return

    const newQuestions = [...questions]
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[targetIndex]
    newQuestions[targetIndex] = temp

    setQuestions(newQuestions)

    // Persist new sort_order
    for (let i = 0; i < newQuestions.length; i++) {
      if (newQuestions[i].id) {
        await supabase
          .from('quiz_questions')
          .update({ sort_order: i })
          .eq('id', newQuestions[i].id)
      }
    }
  }

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '32px 24px', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Navigation back bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link to="/admin/quiz" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← Back to Dashboard
          </Link>
          {quiz && (
            <Link to={`/admin/quiz/${quiz.code_slug}/host`} style={{ background: '#E91E63', color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}>
              🚀 Launch Host View
            </Link>
          )}
        </div>

        {/* Quiz Header & Title Edit */}
        {quiz && (
          <div style={{ background: '#111116', border: '1px solid #222', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            {editingTitle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '18px', fontWeight: 800, outline: 'none' }}
                />
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description..."
                  style={{ background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleUpdateQuizDetails} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>
                    Save Changes
                  </button>
                  <button onClick={() => setEditingTitle(false)} style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ color: '#E91E63', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>
                      QUIZ CODE: {quiz.code_slug.toUpperCase()}
                    </span>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 6px' }}>{quiz.title}</h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>{quiz.description || 'No description provided.'}</p>
                  </div>
                  <button onClick={() => setEditingTitle(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Edit Details
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Add / Edit Form */}
        <div style={{ background: '#111116', border: '1px solid #222', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: editingId ? '#E91E63' : '#fff' }}>
            {editingId ? '✏️ Edit Question' : '➕ Add New Question'}
          </h3>

          <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px' }}>QUESTION TEXT</label>
              <input
                type="text"
                required
                placeholder="e.g. What does XR stand for?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#e21b3c', marginBottom: '6px', fontWeight: 700 }}>OPTION 1 (RED ▲)</label>
                <input
                  type="text"
                  required
                  placeholder="Option 1"
                  value={opt0}
                  onChange={(e) => setOpt0(e.target.value)}
                  style={{ width: '100%', background: '#1a1a22', border: '1px solid #e21b3c', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#1368ce', marginBottom: '6px', fontWeight: 700 }}>OPTION 2 (BLUE ◆)</label>
                <input
                  type="text"
                  required
                  placeholder="Option 2"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  style={{ width: '100%', background: '#1a1a22', border: '1px solid #1368ce', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d89e00', marginBottom: '6px', fontWeight: 700 }}>OPTION 3 (YELLOW ●)</label>
                <input
                  type="text"
                  required
                  placeholder="Option 3"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  style={{ width: '100%', background: '#1a1a22', border: '1px solid #d89e00', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#26890c', marginBottom: '6px', fontWeight: 700 }}>OPTION 4 (GREEN ■)</label>
                <input
                  type="text"
                  required
                  placeholder="Option 4"
                  value={opt3}
                  onChange={(e) => setOpt3(e.target.value)}
                  style={{ width: '100%', background: '#1a1a22', border: '1px solid #26890c', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px' }}>CORRECT ANSWER</label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(Number(e.target.value))}
                  style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value={0}>Option 1 (RED ▲)</option>
                  <option value={1}>Option 2 (BLUE ◆)</option>
                  <option value={2}>Option 3 (YELLOW ●)</option>
                  <option value={3}>Option 4 (GREEN ■)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px' }}>TIME LIMIT (SECONDS)</label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  style={{ width: '100%', background: '#1a1a22', border: '1px solid #333', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                  Cancel Edit
                </button>
              )}
              <button type="submit" style={{ background: '#E91E63', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
                {editingId ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </form>
        </div>

        {/* Questions List */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px' }}>Questions ({questions.length})</h3>

          {loading ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '30px' }}>Loading questions...</div>
          ) : questions.length === 0 ? (
            <div style={{ background: '#111116', border: '1px solid #222', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#888' }}>
              No questions created yet. Use the form above to add your first question.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q, idx) => (
                <div key={q.id || idx} style={{ background: '#111116', border: '1px solid #222', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#E91E63', width: '28px' }}>#{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{q.question_text}</div>
                      <div style={{ display: 'flex', gap: '16px', color: '#888', fontSize: '12px' }}>
                        <span>⏱️ {q.time_limit}s</span>
                        <span style={{ color: '#4CAF50', fontWeight: 600 }}>Correct: Option {q.correct_option + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => handleMoveQuestion(idx, 'up')} disabled={idx === 0} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>
                      ▲
                    </button>
                    <button onClick={() => handleMoveQuestion(idx, 'down')} disabled={idx === questions.length - 1} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', cursor: idx === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === questions.length - 1 ? 0.3 : 1 }}>
                      ▼
                    </button>
                    <button onClick={() => handleEditClick(q)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => q.id && handleDeleteQuestion(q.id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#ff4444', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
