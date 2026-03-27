import { useState } from 'react'
import { MdEdit, MdSave, MdClose, MdPerson, MdEmail, MdSchool, MdCalendarToday, MdLock } from 'react-icons/md'
import { FaFire, FaTrophy, FaBrain } from 'react-icons/fa'

// ── Dummy Student Data ──
const initialProfile = {
  name: 'Ayesha Khan',
  email: 'ayesha.khan@email.com',
  studentId: 'STU-2024-0042',
  institute: 'Punjab University',
  grade: 'BS Computer Science — Semester 4',
  joinDate: 'January 2024',
  avatar: 'AK',
  subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
}

const stats = [
  { icon: <FaFire className="text-orange-400" size={22} />, label: 'Study Streak', value: '7 Days', bg: 'bg-orange-50' },
  { icon: <FaTrophy className="text-yellow-500" size={22} />, label: 'Quizzes Done', value: '24', bg: 'bg-yellow-50' },
  { icon: <FaBrain className="text-purple-400" size={22} />, label: 'Notes Saved', value: '12', bg: 'bg-purple-50' },
  { icon: <MdSchool className="text-teal-500" size={22} />, label: 'Study Hours', value: '42 hrs', bg: 'bg-teal-50' },
]

const subjectColors = {
  Mathematics: 'bg-blue-50 text-blue-600 border-blue-200',
  Physics: 'bg-purple-50 text-purple-600 border-purple-200',
  Chemistry: 'bg-orange-50 text-orange-600 border-orange-200',
  English: 'bg-pink-50 text-pink-600 border-pink-200',
  'Computer Science': 'bg-teal-50 text-teal-600 border-teal-200',
  Biology: 'bg-green-50 text-green-600 border-green-200',
}

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState('info') // info | security
  const [savedMsg, setSavedMsg] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  })
  const [passMsg, setPassMsg] = useState('')

  const handleEdit = () => {
    setEditData(profile)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editData.name.trim() || !editData.email.trim()) {
      alert('Name aur Email zaroori hain!')
      return
    }
    setProfile(editData)
    setIsEditing(false)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 3000)
  }

  const handleCancel = () => {
    setEditData(profile)
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPassMsg('error:Sab fields fill karein!')
      return
    }
    if (passwords.newPass !== passwords.confirm) {
      setPassMsg('error:Naya password aur confirm password match nahi karte!')
      return
    }
    if (passwords.newPass.length < 6) {
      setPassMsg('error:Password kam az kam 6 characters ka hona chahiye!')
      return
    }
    setPasswords({ current: '', newPass: '', confirm: '' })
    setPassMsg('success:Password successfully update ho gaya!')
    setTimeout(() => setPassMsg(''), 3000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Apni personal information aur settings manage karein</p>
      </div>

      {/* ── Top: Avatar Card ── */}
      <div
        className="rounded-3xl p-6 text-white flex items-center gap-5 flex-wrap"
        style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
      >
        {/* Avatar Circle */}
        <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
          {profile.avatar}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold">{profile.name}</h2>
          <p className="text-white/80 text-sm mt-1">{profile.email}</p>
          <p className="text-white/70 text-xs mt-1">{profile.grade}</p>
        </div>

        {/* Edit Button */}
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
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all"
            >
              <MdSave size={18} />
              Save
            </button>
            <button
              onClick={handleCancel}
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
          ✅ Profile successfully update ho gayi!
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3 border border-gray-100`}>
            <div className="p-2 bg-white rounded-xl shadow-sm">{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-extrabold text-gray-800">{stat.value}</p>
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
                  <span className="text-sm text-gray-700 font-medium">{profile.name}</span>
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
                  <span className="text-sm text-gray-700 font-medium">{profile.email}</span>
                </div>
              )}
            </div>

            {/* Institute */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Institute
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.institute}
                  onChange={(e) => setEditData(prev => ({ ...prev, institute: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <MdSchool className="text-teal-500" size={18} />
                  <span className="text-sm text-gray-700 font-medium">{profile.institute}</span>
                </div>
              )}
            </div>

            {/* Grade / Program */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Program / Grade
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.grade}
                  onChange={(e) => setEditData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <MdCalendarToday className="text-teal-500" size={18} />
                  <span className="text-sm text-gray-700 font-medium">{profile.grade}</span>
                </div>
              )}
            </div>

            {/* Student ID — Read Only */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Student ID
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-400 font-medium">{profile.studentId}</span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-lg">Read Only</span>
              </div>
            </div>

            {/* Join Date — Read Only */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Member Since
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <span className="text-sm text-gray-400 font-medium">{profile.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Right: Subjects */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-4">My Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className={`text-sm font-semibold px-4 py-2 rounded-xl border ${subjectColors[sub] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                  >
                    {sub}
                  </span>
                ))}
              </div>

              {/* AI Insight */}
              <div
                className="mt-5 rounded-2xl p-4 text-white"
                style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
              >
                <p className="text-xs font-bold mb-1">🤖 AI Subject Insight</p>
                <p className="text-xs text-white/90 leading-relaxed">
                  Aapka strongest subject Computer Science hai. Mathematics aur Chemistry mein improvement ki zaroorat hai. AI ne study plan accordingly adjust kar diya hai.
                </p>
              </div>
            </div>

            {/* Achievement Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-700 mb-4">🏆 Achievements</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '🔥', title: '7 Day Streak', desc: 'Lagatar 7 din parha!', earned: true },
                  { icon: '📝', title: 'Quiz Master', desc: '20+ quizzes complete kiye', earned: true },
                  { icon: '⭐', title: 'Top Performer', desc: '90%+ score haasil karo', earned: false },
                  { icon: '📚', title: 'Note Taker', desc: '10+ notes save kiye', earned: true },
                ].map((ach, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      ach.earned ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{ach.title}</p>
                      <p className="text-xs text-gray-400">{ach.desc}</p>
                    </div>
                    {ach.earned && (
                      <span className="ml-auto text-xs text-teal-600 font-bold">✓ Earned</span>
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
              className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
            >
              Update Password
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Profile