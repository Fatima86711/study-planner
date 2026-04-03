import { NavLink } from 'react-router-dom'
import {
  MdDashboard,
  MdAccessTime,
  MdCalendarToday,
  MdQuiz,
  MdNote,
} from 'react-icons/md'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
  { path: '/timelog', label: 'Time Log', icon: <MdAccessTime size={20} /> },
  { path: '/studyplan', label: 'Study Plan', icon: <MdCalendarToday size={20} /> },
  { path: '/courses', label: 'Courses', icon: <MdNote size={20} /> },
  { path: '/quiz', label: 'Quiz', icon: <MdQuiz size={20} /> },
  { path: '/notes', label: 'Notes', icon: <MdNote size={20} /> },
]

const Sidebar = () => {
  return (
    <div className="h-screen w-56 flex flex-col py-8 px-4 shadow-xl"
      style={{ background: 'linear-gradient(to bottom, #0f766e, #14b8a6)' }}>

      {/* App Name / Logo */}
      <div className="text-white text-2xl font-bold text-center mb-10 tracking-wide">
        StudyAI
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
              ${isActive
                ? 'bg-white text-teal-700 shadow-md'
                : 'text-white hover:bg-white/20'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar