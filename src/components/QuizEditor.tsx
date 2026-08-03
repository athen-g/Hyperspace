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
}

interface Quiz {
  id: string
  title: string
  description: string
}

export default function QuizEditor() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [questionText, setQuestionText] = useState('')
  const [opt0, setOpt0] = useState('')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')
  const [opt3, setOpt3] = useState('')
  const [correctOption, setCorrectOption] = useState(0)
  const [timeLimit, setTimeLimit] = useState(20)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (quizId) {
      // Fetch quiz details
      supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
        .then(({ data }) => setQuiz(data))

      // Fetch questions list
      fetchQuestions()
    }
  }, [quizId])

  const fetchQuestions = () => {
    setLoading(true)
    supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setQuestions(data)
        setLoading(false)
      })
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
    if (!questionText || !opt0 || !opt1 || !opt2 || !opt3) {
      toast.error('All options are required.')
      return
    }

    const payload = {
      quiz_id: quizId,
      question_text: questionText,
      options: [opt0, opt1, opt2, opt3],
      correct_option: correctOption,
      time_limit: timeLimit,
      sort_order: questions.length + 1
    }

    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from('quiz_questions')
        .update(payload)
        .eq('id', editingId)

      if (!error) {
        toast.success('Question updated!')
        resetForm()
        fetchQuestions()
      } else {
        toast.error(error.message)
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from('quiz_questions')
        .insert(payload)

      if (!error) {
        toast.success('Question added!')
        resetForm()
        fetchQuestions()
      } else {
        toast.error(error.message)
      }
    }
  }

  const startEdit = (q: Question) => {
    setEditingId(q.id || null)
    setQuestionText(q.question_text)
    setOpt0(q.options[0])
    setOpt1(q.options[1])
    setOpt2(q.options[2])
    setOpt3(q.options[3])
    setCorrectOption(q.correct_option)
    setTimeLimit(q.time_limit)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id)

    if (!error) {
      toast.success('Question deleted.')
      fetchQuestions()
    }
  }

  const optionColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
  const optionShapes = ['▲ Option 1 (Red)', '◆ Option 2 (Blue)', '● Option 3 (Yellow)', '■ Option 4 (Green)']

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <Link to="/quiz" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>← Back to Quiz Hub</Link>
            <h1 style={{ fontSize: '28px', margin: '8px 0 0 0' }}>Edit Quiz: {quiz?.title || 'Loading...'}</h1>
            <p style={{ color: '#555', margin: '4px 0 0' }}>{quiz?.description || 'No description'}</p>
          </div>
          {quiz && (
            <Link to={`/quiz/host/${quiz.id}`} style={{ textDecoration: 'none', background: '#00BCD4', borderRadius: '8px', color: '#000', padding: '10px 24px', fontWeight: 600 }}>Host Game →</Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
          
          {/* LEFT: Add / Edit form */}
          <div>
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: '#eee' }}>
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h3>
              <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Question Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What does XR stand for?"
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Option fields */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Answers Options</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      placeholder="Red Option"
                      value={opt0}
                      onChange={e => setOpt0(e.target.value)}
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderLeft: `4px solid ${optionColors[0]}`, borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Blue Option"
                      value={opt1}
                      onChange={e => setOpt1(e.target.value)}
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderLeft: `4px solid ${optionColors[1]}`, borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Yellow Option"
                      value={opt2}
                      onChange={e => setOpt2(e.target.value)}
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderLeft: `4px solid ${optionColors[2]}`, borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Green Option"
                      value={opt3}
                      onChange={e => setOpt3(e.target.value)}
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderLeft: `4px solid ${optionColors[3]}`, borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Configurations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Correct Option</label>
                    <select
                      value={correctOption}
                      onChange={e => setCorrectOption(Number(e.target.value))}
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px' }}
                    >
                      {optionShapes.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Time Limit (s)</label>
                    <select
                      value={timeLimit}
                      onChange={e => setTimeLimit(Number(e.target.value))}
                      style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px' }}
                    >
                      <option value={10}>10s</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                      <option value={60}>60s</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {editingId && (
                    <button type="button" onClick={resetForm} style={{ flex: 1, background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#888', padding: '10px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                  )}
                  <button type="submit" style={{ flex: 2, background: '#E91E63', border: 'none', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    {editingId ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Questions list */}
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#eee' }}>Questions List ({questions.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <p style={{ color: '#444' }}>Loading questions...</p>
              ) : questions.length === 0 ? (
                <p style={{ color: '#444' }}>No questions configured. Add one on the left!</p>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#E91E63', letterSpacing: '1px' }}>Q{index + 1} ({q.time_limit}s)</span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => startEdit(q)} style={{ background: 'none', border: 'none', color: '#00BCD4', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Edit</button>
                        <button onClick={() => handleDelete(q.id!)} style={{ background: 'none', border: 'none', color: '#e21b3c', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Delete</button>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600 }}>{q.question_text}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#aaa' }}>
                      {q.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: optionColors[i] }}>●</span>
                          <span style={{ fontWeight: i === q.correct_option ? 700 : 400, color: i === q.correct_option ? '#fff' : '#888' }}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
