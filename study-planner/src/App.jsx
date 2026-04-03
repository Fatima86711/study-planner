import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Dashboard from './pages/Dashboard/Dashboard'
import TimeLog from './pages/TimeLog/TimeLog'
import StudyPlan from './pages/StudyPlan/StudyPlan'
import Quiz from './pages/Quiz/Quiz'
import Notes from './pages/Notes/Notes'
import Layout from './components/Layout'
import Profile from './pages/profile/Profile'
import { AuthProvider } from './context/AuthContext'
import { CourseProvider } from './context/CourseContext'
import ProtectedRoute from './components/ProtectedRoute'
import Courses from './pages/Courses/Courses'

const App = () => {
  return (
    <AuthProvider>
      <CourseProvider>
        <BrowserRouter>
          <Routes>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Auth Pages — No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Main Pages — Layout ke andar */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/timelog" element={<Layout><TimeLog /></Layout>} />
            <Route path="/studyplan" element={<Layout><StudyPlan /></Layout>} />
            <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
            <Route path="/notes" element={<Layout><Notes /></Layout>} />
            <Route path="/courses" element={<Layout><Courses /></Layout>} />

            {/* Protected Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </CourseProvider>
    </AuthProvider>
  )
}

export default App