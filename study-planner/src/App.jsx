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
import ProtectedRoute from './components/ProtectedRoute'
import ChatBot from './components/Chatbot'

// ✅ Alag component banao jo BrowserRouter ke ANDAR ho
const AppContent = () => {
  const location = useLocation();
  const hiddenRoutes = ["/login", "/signup"];
  const showChatBot = !hiddenRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/timelog" element={<Layout><TimeLog /></Layout>} />
        <Route path="/studyplan" element={<Layout><StudyPlan /></Layout>} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/notes" element={<Layout><Notes /></Layout>} />

        {/* ✅ Sirf ek /profile route — protected wala */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* ✅ ChatBot ab sahi jagah hai — BrowserRouter ke andar */}
      {showChatBot && <ChatBot />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />  {/* ✅ useLocation yahan safe hai */}
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App