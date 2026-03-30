// Navbar component
import { useNavigate } from 'react-router-dom'
import { MdLogout, MdPerson } from 'react-icons/md'
import useAuth from '../hooks/useAuth'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">

      <h1 className="text-xl font-bold text-teal-600">
        Welcome Back 👋
      </h1>

      <div className="flex items-center gap-4">

        {/* User Name — click to go to Profile */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-teal-600 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <span className="font-medium">{user?.name || 'Student'}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdLogout size={18} />
          Logout
        </button>

      </div>
    </div>
  )
}

export default Navbar