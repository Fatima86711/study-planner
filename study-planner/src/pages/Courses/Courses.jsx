import { useState } from 'react'
import { useCourses } from "../../context/CourseContext"

const subjectOptions = ['Science', 'Arts', 'Commerce', 'Technology', 'Language', 'Other']

const colorOptions = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0284C7', '#475569'
]

const Courses = () => {

  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses()

  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Other',
    color: '#4F46E5',
    description: ''
  })

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
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          + Add Course
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          backgroundColor: '#F9FAFB'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            {editingCourse ? '✏️ Course Edit Karein' : '➕ Naya Course Add Karein'}
          </h2>

          <form onSubmit={handleSubmit}>

            {/* Course Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px'
              }}>
                Course Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Mathematics"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px'
              }}>
                Subject Type
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                {subjectOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px'
              }}>
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Course ke baare mein thodi detail..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {editingCourse ? 'Update Karein' : 'Add Karein'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  border: '1px solid #D1D5DB',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
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
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 140px 1fr 120px',
            padding: '12px 20px',
            backgroundColor: '#F3F4F6',
            fontWeight: '600',
            fontSize: '13px',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span></span>
            <span>Course Name</span>
            <span>Subject</span>
            <span>Description</span>
            <span style={{ textAlign: 'center' }}>Actions</span>
          </div>

          {/* Table Rows */}
          {courses.map((course, index) => (
            <div
              key={course._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 140px 1fr 120px',
                padding: '16px 20px',
                alignItems: 'center',
                borderTop: index === 0 ? 'none' : '1px solid #E5E7EB',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* Color Dot */}
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: course.color
              }} />

              {/* Name */}
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{course.name}</span>

              {/* Subject Badge */}
              <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: course.color + '22',
                color: course.color,
                width: 'fit-content'
              }}>
                {course.subject}
              </span>

              {/* Description */}
              <span style={{ fontSize: '13px', color: '#6B7280' }}>
                {course.description || '—'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleEdit(course)}
                  style={{
                    backgroundColor: '#EEF2FF',
                    color: '#4F46E5',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Count */}
      {courses.length > 0 && (
        <p style={{ textAlign: 'right', fontSize: '13px', color: '#9CA3AF', marginTop: '12px' }}>
          Total: {courses.length} course{courses.length > 1 ? 's' : ''}
        </p>
      )}

    </div>
  )
}

export default Courses