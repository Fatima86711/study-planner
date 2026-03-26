import { MdLogout, MdPerson } from 'react-icons/md'

const Navbar = () => {
  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">

      {/* Left: Page Title */}
      <h1 className="text-xl font-bold text-teal-600">
        Welcome Back 👋
      </h1>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-4">

        {/* User Name */}
        <div className="flex items-center gap-2 text-gray-600">
          <MdPerson size={22} className="text-teal-600" />
          <span className="font-medium">Student Name</span>
        </div>

        {/* Logout Button */}
        <button
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