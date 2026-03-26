import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Left: Sidebar */}
      <Sidebar />

      {/* Right: Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top: Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  )
}

export default Layout