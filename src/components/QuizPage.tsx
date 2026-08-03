import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
}

export default function QuizPage() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setQuizzes(data)
      })
  }, [])

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ title, description, created_by: user?.id })
      .select()
      .single()

    if (!error && data) {
      // Add a dummy first question
      await supabase.from('quiz_questions').insert({
        quiz_id: data.id,
        question_text: 'What is Hyperspace XR focused on?',
        options: ['Web3', 'Immersive Reality & XR', 'AI Text Generation', 'Cybersecurity'],
        correct_option: 1,
        time_limit: 20,
        sort_order: 1
      })

      // Redirect directly to editing workspace
      navigate(`/quiz/edit/${data.id}`)
    }
  }

  return (
    <div style={{ background: '#09090e', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>Quiz Hub</h1>
            <p style={{ color: '#888', margin: '4px 0 0' }}>Join or host interactive real-time quizzes.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/quiz/play" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px 20px', fontWeight: 600 }}>Join Game</Link>
            <button onClick={() => setShowCreate(true)} style={{ background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Create Quiz</button>
          </div>
        </div>

        {showCreate && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px' }}>New Quiz Settings</h3>
            <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Quiz Title"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '14px', boxSizing: 'border-box', height: '80px', resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#00BCD4', border: 'none', borderRadius: '6px', color: '#000', padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Launch & Edit</button>
              </div>
            </form>
          </div>
        )}

        <h2 style={{ fontSize: '20px', margin: '0 0 16px', color: '#bbb' }}>Available Quizzes</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          {quizzes.length === 0 ? (
            <p style={{ color: '#444' }}>No quizzes available. Create one to begin!</p>
          ) : (
            quizzes.map(q => (
              <div key={q.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>{q.title}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{q.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link to={`/quiz/edit/${q.id}`} style={{ textDecoration: 'none', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', padding: '8px 20px', fontWeight: 600 }}>Edit Questions</Link>
                  <Link to={`/quiz/host/${q.id}`} style={{ textDecoration: 'none', background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 20px', fontWeight: 600 }}>Host Game →</Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
