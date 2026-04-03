import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import ChatBot from './components/Chatbot'
import Courses from './pages/Courses/Courses'

// ✅ Alag component banao jo BrowserRouter ke ANDAR hoimport Courses from './pages/Courses/Courses'

const AppContent = () => {
  const location = useLocation();
  const hiddenRoutes = ["/login", "/signup"];
  const showChatBot = !hiddenRoutes.includes(location.pathname);

  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Default route — redirect directly to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/profile" element={<Layout><Profile /></Layout>} />  
        
        {/* Main Pages — will be inside Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/timelog" element={<Layout><TimeLog /></Layout>} />
        <Route path="/studyplan" element={<Layout><StudyPlan /></Layout>} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/notes" element={<Layout><Notes /></Layout>} /> 
         <Route path="/courses" element={<Layout><Courses /></Layout>} />

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
    </AuthProvider>
  );
};

export default App