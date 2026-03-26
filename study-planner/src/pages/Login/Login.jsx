import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const handleSubmit = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' }}
      >
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide">StudyAI</div>

        {/* Main Text */}
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Navigate Your <br />
            <span className="text-yellow-300">Study Journey</span><br />
            With AI
          </h1>
          <p className="text-white/80 text-lg max-w-sm">
            Empowering students through personalized AI-driven study plans and smart time tracking.
          </p>
        </div>

        {/* Stats Row — Prosperix style */}
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold">98%</div>
            <div className="text-white/70 text-sm">Student Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl font-bold">2x</div>
            <div className="text-white/70 text-sm">Faster Revision</div>
          </div>
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-white/70 text-sm">Active Students</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">

          {/* Toggle Buttons — Login / Signup */}
          <div className="flex bg-gray-200 rounded-full p-1 mb-8 w-fit mx-auto">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-8 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                isLogin
                  ? 'text-white shadow-md'
                  : 'text-gray-500 bg-transparent'
              }`}
              style={isLogin ? { background: 'linear-gradient(to right, #0f766e, #14b8a6)' } : {}}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-8 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                !isLogin
                  ? 'text-white shadow-md'
                  : 'text-gray-500 bg-transparent'
              }`}
              style={!isLogin ? { background: 'linear-gradient(to right, #0f766e, #14b8a6)' } : {}}
            >
              Sign Up
            </button>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {isLogin ? 'Welcome Back 👋' : 'Create Account ✨'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {isLogin
                ? 'Login to continue your study journey'
                : 'Sign up to start your AI study plan'}
            </p>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">

              {/* Name field — only on signup */}
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Confirm Password — only signup */}
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 transition-all"
                  />
                </div>
              )}

              {/* Forgot Password */}
              {isLogin && (
                <div className="text-right">
                  <span className="text-sm text-purple-600 cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-2 transition-transform hover:scale-105 shadow-md"
                style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
              >
                {isLogin ? 'Login →' : 'Create Account →'}
              </button>

            </div>
          </div>

          {/* Bottom Text */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 font-semibold cursor-pointer hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login