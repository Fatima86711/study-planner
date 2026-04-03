import { createContext, useState, useEffect, useContext } from 'react'
import courseService from '../services/courseService'

// Context banao
const CourseContext = createContext()

// Provider Component
export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // App start hote hi courses fetch karo
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await courseService.getCourses()
      setCourses(data)
    } catch (err) {
      setError('Courses load nahi ho sake')
    } finally {
      setLoading(false)
    }
  }

  // Naya course add karo
  const addCourse = async (courseData) => {
    try {
      const newCourse = await courseService.addCourse(courseData)
      setCourses([newCourse, ...courses])
      return newCourse
    } catch (err) {
      throw err
    }
  }

  // Course update karo
  const updateCourse = async (id, courseData) => {
    try {
      const updated = await courseService.updateCourse(id, courseData)
      setCourses(courses.map(c => c._id === id ? updated : c))
      return updated
    } catch (err) {
      throw err
    }
  }

  // Course delete karo
  const deleteCourse = async (id) => {
    try {
      await courseService.deleteCourse(id)
      setCourses(courses.filter(c => c._id !== id))
    } catch (err) {
      throw err
    }
  }

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        fetchCourses,
        addCourse,
        updateCourse,
        deleteCourse
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

// Custom Hook — easy use ke liye
export const useCourses = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourses must be used within CourseProvider')
  }
  return context
}

export default CourseContext