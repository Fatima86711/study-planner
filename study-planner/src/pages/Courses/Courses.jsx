import { useState, useEffect, useContext } from 'react'
import { useCourses } from "../../context/CourseContext"
import { AuthContext } from '../../context/AuthContext'
import { getCourseRecommendations } from '../../services/studyService'

const subjectOptions = ['Science', 'Arts', 'Commerce', 'Technology', 'Language', 'Other']

const colorOptions = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0284C7', '#475569'
]

const Courses = () => {

  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses()
  const { user } = useContext(AuthContext)

  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Other',
    color: '#4F46E5',
    description: ''
  })
  const [recommendations, setRecommendations] = useState([])
  const [recLoading, setRecLoading] = useState(false)

  const levelColors = {
    Beginner:     { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    Intermediate: { bg: '#FFF7ED', text: '#D97706', border: '#FED7AA' },
    Advanced:     { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  }

 const fetchRecs = async () => {
  setRecLoading(true)
  try {
    const data = await getCourseRecommendations(user?._id)
    
    // THIS IS THE LINE YOU ADD:
    console.log("Recommendations received:", data) 
    
    setRecommendations(data)
  } catch (error) {
    console.error("Error fetching recs:", error)
  } finally {
    setRecLoading(false)
  }
}

  useEffect(() => {
    if (user?._id) fetchRecs()
  }, [user])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleColorSelect = (color) => {
    setFormData({ ...formData, color })
  }

  const resetForm = () => {
    setFormData({ name: '', subject: 'Other', color: '#4F46E5', description: '' })
    setEditingCourse(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Course ka naam zaroori hai')
      return
    }
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, formData)
      } else {
        await addCourse(formData)
      }
      resetForm()
    } catch (err) {
      alert(err.message || 'Kuch ghalat hua')
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      subject: course.subject,
      color: course.color,
      description: course.description
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap yeh course delete karna chahte hain?')) return
    try {
      await deleteCourse(id)
    } catch (err) {
      alert('Course delete nahi hua')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            📚 My Courses
          </h1>
          <p style={{ color: 'gray', marginTop: '4px', fontSize: '14px' }}>
            Apne sare courses yahan manage karein
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{
            backgroundColor: '#4F46E5', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', fontSize: '14px'
          }}
        >
          + Add Course
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          border: '1px solid #E5E7EB', borderRadius: '12px',
          padding: '24px', marginBottom: '24px', backgroundColor: '#F9FAFB'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            {editingCourse ? '✏️ Course Edit Karein' : '➕ Naya Course Add Karein'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Course Name *
              </label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleInputChange} placeholder="e.g. Mathematics"
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Subject Type
              </label>
              <select
                name="subject" value={formData.subject} onChange={handleInputChange}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                }}
              >
                {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Description (Optional)
              </label>
              <textarea
                name="description" value={formData.description}
                onChange={handleInputChange}
                placeholder="Course ke baare mein thodi detail..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{
                backgroundColor: '#4F46E5', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px'
              }}>
                {editingCourse ? 'Update Karein' : 'Add Karein'}
              </button>
              <button type="button" onClick={resetForm} style={{
                backgroundColor: 'transparent', color: '#6B7280',
                border: '1px solid #D1D5DB', padding: '10px 24px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses Table */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'gray', padding: '40px' }}>Loading...</p>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'gray' }}>
          <p style={{ fontSize: '48px' }}>📭</p>
          <p style={{ fontSize: '16px' }}>Abhi koi course nahi hai. Pehla course add karein!</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 140px 1fr 120px',
            padding: '12px 20px', backgroundColor: '#F3F4F6',
            fontWeight: '600', fontSize: '13px', color: '#6B7280',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            <span></span>
            <span>Course Name</span>
            <span>Subject</span>
            <span>Description</span>
            <span style={{ textAlign: 'center' }}>Actions</span>
          </div>

          {courses.map((course, index) => (
            <div
              key={course._id}
              style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 140px 1fr 120px',
                padding: '16px 20px', alignItems: 'center',
                borderTop: index === 0 ? 'none' : '1px solid #E5E7EB',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '14px', height: '14px',
                borderRadius: '50%', backgroundColor: course.color
              }} />
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{course.name}</span>
              <span style={{
                display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '500',
                backgroundColor: course.color + '22', color: course.color, width: 'fit-content'
              }}>
                {course.subject}
              </span>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>
                {course.description || '—'}
              </span>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => handleEdit(course)} style={{
                  backgroundColor: '#EEF2FF', color: '#4F46E5', border: 'none',
                  padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '500'
                }}>Edit</button>
                <button onClick={() => handleDelete(course._id)} style={{
                  backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none',
                  padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '500'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <p style={{ textAlign: 'right', fontSize: '13px', color: '#9CA3AF', marginTop: '12px' }}>
          Total: {courses.length} course{courses.length > 1 ? 's' : ''}
        </p>
      )}

      {/* ── AI Recommendations Section ── */}
      <div style={{ marginTop: '40px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              🤖 Recommended For You
            </h2>
            <p style={{ color: 'gray', fontSize: '13px', marginTop: '4px' }}>
              Based on your quiz scores and study sessions
            </p>
          </div>
          <button onClick={fetchRecs} style={{
            backgroundColor: 'transparent', color: '#4F46E5',
            border: '1px solid #C7D2FE', padding: '8px 16px',
            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>
            🔄 Refresh
          </button>
        </div>

        {recLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{
              width: '32px', height: '32px', margin: '0 auto 12px',
              border: '4px solid #E0E7FF', borderTop: '4px solid #4F46E5',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '14px' }}>Analyzing your study profile...</p>
          </div>

        ) : recommendations.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px', backgroundColor: '#F9FAFB',
            borderRadius: '12px', border: '1px dashed #D1D5DB'
          }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>📊</p>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Complete some quizzes and log study sessions to get personalized recommendations
            </p>
          </div>

        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {recommendations.map((rec) => {
              const lvl = levelColors[rec.level] || levelColors.Beginner
              return (
                <div
                  key={rec.id}
                  style={{
                    border: '1px solid #E5E7EB', borderRadius: '12px',
                    padding: '20px', backgroundColor: '#fff',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600', padding: '3px 10px',
                      borderRadius: '20px', backgroundColor: '#EEF2FF', color: '#4F46E5'
                    }}>{rec.subject}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '3px 8px',
                      borderRadius: '6px', backgroundColor: lvl.bg,
                      color: lvl.text, border: `1px solid ${lvl.border}`
                    }}>{rec.level}</span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#111827' }}>
                    {rec.name}
                  </h3>

                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    📡 {rec.platform}
                  </span>

                  <p style={{
                    fontSize: '12px', color: '#6B7280', margin: 0,
                    backgroundColor: '#F9FAFB', borderRadius: '8px',
                    padding: '8px 10px', borderLeft: '3px solid #4F46E5'
                  }}>
                    💡 {rec.reason}
                  </p>

                  <div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '11px', color: '#9CA3AF', marginBottom: '4px'
                    }}>
                      <span>Match score</span>
                      <span>{rec.score}%</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px' }}>
                      <div style={{
                        height: '4px', borderRadius: '2px',
                        width: `${Math.min(rec.score, 100)}%`,
                        background: 'linear-gradient(to right, #4F46E5, #7C3AED)'
                      }} />
                    </div>
                  </div>

                  <a
                    href={rec.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'block', textAlign: 'center',
                      backgroundColor: '#4F46E5', color: 'white',
                      padding: '9px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '600',
                      textDecoration: 'none', marginTop: 'auto'
                    }}
                  >
                    View Course →
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default Courses