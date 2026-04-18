import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import TimeLog from './pages/TimeLog/TimeLog';
import StudyPlan from './pages/StudyPlan/StudyPlan';
import Quiz from './pages/Quiz/Quiz';
import Notes from './pages/Notes/Notes';
import Courses from './pages/Courses/Courses';
import Profile from './pages/profile/Profile';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/Chatbot';

import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';

const AppContent = () => {
  const location = useLocation();
  const hiddenRoutes = ["/login", "/signup", "/"];
  const showChatBot = !hiddenRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Default route — redirect directly to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main Pages — inside Layout */}
        {/* Note: You might want to wrap these in <ProtectedRoute> as well if they require login */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/timelog" element={<Layout><TimeLog /></Layout>} />
        <Route path="/studyplan" element={<Layout><StudyPlan /></Layout>} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/notes" element={<Layout><Notes /></Layout>} />
        <Route path="/courses" element={<Layout><Courses /></Layout>} />

        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Render ChatBot conditionally based on the route */}
      {showChatBot && <ChatBot />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CourseProvider> {/* Added this since it was imported but not used */}
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CourseProvider>
    </AuthProvider>
  );
};

export default App;