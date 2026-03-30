import { useState, useEffect } from 'react'
import {
  MdEdit, MdSave, MdClose, MdPerson, MdEmail,
  MdSchool, MdCalendarToday, MdLock
} from 'react-icons/md'
import { FaFire, FaTrophy, FaBrain } from 'react-icons/fa'
import useAuth from '../../hooks/useAuth'
import api from '../../services/api'

const subjectColors = {
  Mathematics: 'bg-blue-50 text-blue-600 border-blue-200',
  Physics: 'bg-purple-50 text-purple-600 border-purple-200',
  Chemistry: 'bg-orange-50 text-orange-600 border-orange-200',
  English: 'bg-pink-50 text-pink-600 border-pink-200',
  'Computer Science': 'bg-teal-50 text-teal-600 border-teal-200',
  Biology: 'bg-green-50 text-green-600 border-green-200',
}

const Profile = () => {
  const { user, login } = useAuth()

  // ── Profile State ─────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  // ── Analytics State ───────────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState(null)
  const [noteCount, setNoteCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [weakSubjects, setWeakSubjects] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  // ── Password State ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('info')
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  })
  const [passMsg, setPassMsg] = useState('')
  const [changingPass, setChangingPass] = useState(false)

  // ── Fetch Stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, notesRes, quizRes, weakRes] = await Promise.all([
          api.get('/api/analytics/dashboard'),
          api.get('/api/notes/my-notes'),
          api.get('/api/quiz/history'),
          api.get('/api/analytics/weak-subjects'),
        ])
        setDashboard(dashRes.data.dashboard)
        setNoteCount(notesRes.data.notes.length)
        setQuizCount(quizRes.data.attempts.length)
        setWeakSubjects(weakRes.data.subjectSummary)
      } catch (err) {
        console.error('Failed to load stats')
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
  }, [])

  // ── Stats Cards — Real Data ───────────────────────────────────────────────
  const stats = [
    {
      icon: <FaFire className="text-orange-400" size={22} />,
      label: 'Study Streak',
      value: `${dashboard?.streak || 0} Days`,
      bg: 'bg-orange-50',
    },
    {
      icon: <FaTrophy className="text-yellow-500" size={22} />,
      label: 'Quizzes Done',
      value: quizCount,
      bg: 'bg-yellow-50',
    },
    {
      icon: <FaBrain className="text-purple-400" size={22} />,
      label: 'Notes Saved',
      value: noteCount,
      bg: 'bg-purple-50',
    },
    {
      icon: <MdSchool className="text-teal-500" size={22} />,
      label: 'Study Hours',
      value: `${dashboard?.totalHours || 0} hrs`,
      bg: 'bg-teal-50',
    },
  ]

  // ── Edit Profile ──────────────────────────────────────────────────────────
  const handleEdit = () => {
    setEditData({ name: user?.name || '', email: user?.email || '' })
    setIsEditing(true)
  }

  // ── Save Profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editData.name.trim() || !editData.email.trim()) {
      return alert('Name and Email are required!')
    }
    setSaving(true)
    try {
      // fetch updated user data from getMe
      const res = await api.get('/api/auth/me')
      setIsEditing(false)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 3000)
    } catch (err) {
      alert('Profile update failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Change Password ───────────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      return setPassMsg('error:Please fill in all fields!')
    }
    if (passwords.newPass !== passwords.confirm) {
      return setPassMsg('error:New password and confirmation do not match!')
    }
    if (passwords.newPass.length < 6) {
      return setPassMsg('error:Password must be at least 6 characters long!')
    }

    setChangingPass(true)
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      })
      setPasswords({ current: '', newPass: '', confirm: '' })
      setPassMsg('success:Password successfully update ho gaya!')
      setTimeout(() => setPassMsg(''), 3000)
    } catch (err) {
      setPassMsg(`error:${err.response?.data?.message || 'Password update failed'}`)
    } finally {
      setChangingPass(false)
    }
  }

  // ── Achievements — Real Data Se ───────────────────────────────────────────
  const achievements = [
    {
      icon: '🔥',
      title: '7 Day Streak',
      desc: 'Study 7 days in a row',
      earned: (dashboard?.streak || 0) >= 7,
    },
    {
      icon: '📝',
      title: 'Quiz Master',
      desc: 'Complete 20+ quizzes',
      earned: quizCount >= 20,
    },
    {
      icon: '⭐',
      title: 'Top Performer',
      desc: 'Achieve 90%+ score',
      earned: false,
    },
    {
      icon: '📚',
      title: 'Note Taker',
      desc: 'Save 10+ notes',
      earned: noteCount >= 10,
    },
  ]

  // ── Avatar Initials ───────────────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return 'S'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return parts[0][0] + parts[1][0]
    return parts[0][0]
  }

  // ── Strongest Subject ─────────────────────────────────────────────────────
  const strongestSubject = weakSubjects.length > 0
    ? weakSubjects[weakSubjects.length - 1]?.subject
    : null

  const weakestSubject = weakSubjects.length > 0
    ? weakSubjects[0]?.subject
    : null

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">
          Apni personal information aur settings manage karein
        </p>
      </div>

      {/* ── Top: Avatar Card ── */}
      <div
        className="rounded-3xl p-6 text-white flex items-center gap-5 flex-wrap"
        style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
      >
        {/* Avatar Circle */}
        <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-3xl font-extrabold flex-shrink-0 uppercase">
          {getInitials(user?.name)}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold">{user?.name || 'Student'}</h2>
          <p className="text-white/80 text-sm mt-1">{user?.email}</p>
          <p className="text-white/70 text-xs mt-1">
            Member since:{' '}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long', year: 'numeric'
                })
              : 'N/A'}
          </p>
        </div>

        {/* Edit / Save / Cancel Buttons */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold text-sm transition-all"
          >
            <MdEdit size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all disabled:opacity-60"
            >
              <MdSave size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold text-sm transition-all"
            >
              <MdClose size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Saved Message */}
      {savedMsg && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-600 text-center">
          ✅ Profile successfully updated!
        </div>
      )}

      {/* ── Stats Row — Real Data ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3 border border-gray-100`}
          >
            <div className="p-2 bg-white rounded-xl shadow-sm">{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-extrabold text-gray-800">
                {loadingStats ? '...' : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-gray-100 rounded-full p-1 w-fit">
        {[
          { key: 'info', label: '👤 Personal Info' },
          { key: 'security', label: '🔒 Security' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              activeTab === tab.key
                ? 'text-white shadow-md'
                : 'text-gray-500 bg-transparent'
            }`}
            style={activeTab === tab.key
              ? { background: 'linear-gradient(to right, #0f766e, #14b8a6)' }
              : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ */}
      {/* ── TAB: Personal Info ── */}
      {/* ══════════════════════════ */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left: Form Fields */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-bold text-gray-700 mb-1">Personal Information</h3>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <MdPerson className="text-teal-500" size={18} />
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.name || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <MdEmail className="text-teal-500" size={18} />
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.email || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Member Since — Read Only */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Member Since
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <MdCalendarToday className="text-gray-400" size={18} />
                <span className="text-sm text-gray-400 font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long', year: 'numeric'
                      })
                    : 'N/A'}
                </span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-lg">
                  Read Only
                </span>
              </div>
            </div>

            {/* User ID — Read Only */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                User ID
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-400 font-medium truncate">
                  {user?._id || 'N/A'}
                </span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                  Read Only
                </span>
              </div>
            </div>
          </div>

          {/* Right: Achievements + AI Insight */}
          <div className="flex flex-col gap-4">

            {/* AI Subject Insight */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-4">📊 Subject Performance</h3>

              {weakSubjects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No quiz attempts yet — take a quiz so AI can analyze your performance
                </p>
              ) : (
                <div className="flex flex-col gap-2 mb-4">
                  {weakSubjects.slice(0, 4).map((sub, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 truncate">
                        {sub.subject}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${sub.averagePercentage}%`,
                            background: sub.isWeak
                              ? 'linear-gradient(to right, #f87171, #fb923c)'
                              : 'linear-gradient(to right, #0f766e, #14b8a6)',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {sub.averagePercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="rounded-2xl p-4 text-white"
                style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
              >
                <p className="text-xs font-bold mb-1">🤖 AI Subject Insight</p>
                <p className="text-xs text-white/90 leading-relaxed">
                  {strongestSubject && weakestSubject
                    ? `Your strongest subject is ${strongestSubject}. You need improvement in ${weakestSubject}. AI has adjusted your study plan accordingly.`
                    : 'Attempt a quiz so AI can analyze your performance and provide personalized suggestions.'}
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-4">🏆 Achievements</h3>
              <div className="flex flex-col gap-3">
                {achievements.map((ach, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      ach.earned
                        ? 'bg-teal-50 border-teal-200'
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{ach.title}</p>
                      <p className="text-xs text-gray-400">{ach.desc}</p>
                    </div>
                    {ach.earned && (
                      <span className="ml-auto text-xs text-teal-600 font-bold">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════ */}
      {/* ── TAB: Security ── */}
      {/* ══════════════════════════ */}
      {activeTab === 'security' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <MdLock className="text-teal-500" size={22} />
              <h3 className="font-bold text-gray-700">Change Password</h3>
            </div>

            {/* Current Password */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Current password likhein"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                New Password
              </label>
              <input
                type="password"
                placeholder="Naya password likhein"
                value={passwords.newPass}
                onChange={(e) => setPasswords(prev => ({ ...prev, newPass: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Password dobara likhein"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
              />
            </div>

            {/* Message */}
            {passMsg && (
              <div className={`p-3 rounded-xl text-sm text-center ${
                passMsg.startsWith('success')
                  ? 'bg-teal-50 border border-teal-200 text-teal-600'
                  : 'bg-red-50 border border-red-200 text-red-500'
              }`}>
                {passMsg.split(':')[1]}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePasswordChange}
              disabled={changingPass}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
            >
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
