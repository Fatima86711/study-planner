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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route — seedha Login par bhejo */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/profile" element={<Layout><Profile /></Layout>} />  
        
        {/* Main Pages — Layout ke andar honge */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/timelog" element={<Layout><TimeLog /></Layout>} />
        <Route path="/studyplan" element={<Layout><StudyPlan /></Layout>} />
        <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
        <Route path="/notes" element={<Layout><Notes /></Layout>} />  
        </Routes>
    </BrowserRouter>
  )
}

export default App