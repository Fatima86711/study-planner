import { useState, useEffect, useRef } from 'react'
import {
  MdAdd, MdSearch, MdAutoAwesome, MdNote, MdClose,
  MdMoreVert, MdEdit, MdDelete, MdAutoFixHigh,
  MdFormatBold, MdFormatItalic, MdFormatUnderlined,
  MdFormatListBulleted, MdFormatListNumbered, MdFormatSize
} from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'
import api from '../../services/api'

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology']

const subjectColor = (subject) => {
  const colors = {
    Mathematics: 'bg-blue-50 text-blue-600 border-blue-200',
    Physics: 'bg-purple-50 text-purple-600 border-purple-200',
    Chemistry: 'bg-orange-50 text-orange-600 border-orange-200',
    English: 'bg-pink-50 text-pink-600 border-pink-200',
    Biology: 'bg-green-50 text-green-600 border-green-200',
    'Computer Science': 'bg-teal-50 text-teal-600 border-teal-200',
  }
  return colors[subject] || 'bg-gray-50 text-gray-600 border-gray-200'
}

// ══════════════════════════════════════════════════
// ── RICH TEXT TOOLBAR COMPONENT ──
// ══════════════════════════════════════════════════
const RichToolbar = ({ editorRef }) => {

  const execCmd = (command, value = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }

  const toolbarButtons = [
    // ── Text Style ──
    {
      group: 'style',
      buttons: [
        { icon: <MdFormatBold size={18} />, cmd: 'bold', title: 'Bold (Ctrl+B)' },
        { icon: <MdFormatItalic size={18} />, cmd: 'italic', title: 'Italic (Ctrl+I)' },
        { icon: <MdFormatUnderlined size={18} />, cmd: 'underline', title: 'Underline (Ctrl+U)' },
      ]
    },
    // ── Font Size ──
    {
      group: 'size',
      buttons: [
        { icon: <span className="text-xs font-bold">S</span>, cmd: 'fontSize', value: '2', title: 'Small' },
        { icon: <span className="text-sm font-bold">M</span>, cmd: 'fontSize', value: '3', title: 'Medium' },
        { icon: <span className="text-base font-bold">L</span>, cmd: 'fontSize', value: '5', title: 'Large' },
        { icon: <span className="text-lg font-bold">XL</span>, cmd: 'fontSize', value: '6', title: 'Extra Large' },
      ]
    },
    // ── Heading ──
    {
      group: 'heading',
      buttons: [
        {
          icon: <MdFormatSize size={18} />,
          title: 'Heading',
          cmd: 'formatBlock',
          value: 'H2'
        },
        {
          icon: <span className="text-xs font-bold">¶</span>,
          title: 'Paragraph',
          cmd: 'formatBlock',
          value: 'P'
        },
      ]
    },
    // ── Lists ──
    {
      group: 'list',
      buttons: [
        { icon: <MdFormatListBulleted size={18} />, cmd: 'insertUnorderedList', title: 'Bullet List' },
        { icon: <MdFormatListNumbered size={18} />, cmd: 'insertOrderedList', title: 'Numbered List' },
      ]
    },
    // ── Color ──
    {
      group: 'color',
      buttons: [
        { icon: <span className="w-4 h-4 rounded-full bg-red-500 block" />, cmd: 'foreColor', value: '#ef4444', title: 'Red' },
        { icon: <span className="w-4 h-4 rounded-full bg-blue-500 block" />, cmd: 'foreColor', value: '#3b82f6', title: 'Blue' },
        { icon: <span className="w-4 h-4 rounded-full bg-teal-500 block" />, cmd: 'foreColor', value: '#14b8a6', title: 'Teal' },
        { icon: <span className="w-4 h-4 rounded-full bg-gray-800 block" />, cmd: 'foreColor', value: '#1f2937', title: 'Black' },
      ]
    },
  ]

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-xl mb-2">
      {toolbarButtons.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {/* Group buttons */}
          {group.buttons.map((btn, bi) => (
            <button
              key={bi}
              type="button"
              title={btn.title}
              onClick={() => execCmd(btn.cmd, btn.value)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-teal-100 hover:text-teal-700 transition-all"
            >
              {btn.icon}
            </button>
          ))}
          {/* Divider between groups */}
          {gi < toolbarButtons.length - 1 && (
            <div className="w-px h-6 bg-gray-200 mx-1" />
          )}
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════
// ── THREE DOT MENU COMPONENT ──
// ══════════════════════════════════════════════════
const NoteMenu = ({ note, onEdit, onDelete, onFormat, isFormatting }) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
      >
        <MdMoreVert size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(note); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-all"
          >
            <MdEdit className="text-teal-500" size={18} />
            Edit Note
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onFormat(note); setOpen(false) }}
            disabled={isFormatting}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            <MdAutoFixHigh className="text-purple-500" size={18} />
            {isFormatting ? 'Formatting...' : 'AI Format'}
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note._id); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all"
          >
            <MdDelete size={18} />
            Delete Note
          </button>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════
// ── MAIN NOTES COMPONENT ──
// ══════════════════════════════════════════════════
const Notes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)

  const [newNote, setNewNote] = useState({ subject: '', title: '', content: '' })
  const [saving, setSaving] = useState(false)

  // ── Edit State ──
  const [showEditModal, setShowEditModal] = useState(false)
  const [editNote, setEditNote] = useState({ _id: '', subject: '', title: '', content: '' })
  const [editSaving, setEditSaving] = useState(false)

  // ── Rich Editor Ref ──
  const editorRef = useRef(null)

  // ── AI State ──
  const [analyzing, setAnalyzing] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [aiPreview, setAiPreview] = useState(null)
  const [formatting, setFormatting] = useState(false)
  const [formattingNoteId, setFormattingNoteId] = useState(null)

  // ── Fetch Notes ──
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/api/notes/my-notes')
        setNotes(res.data.notes)
      } catch (err) {
        setError('Failed to load notes')
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  // ── When edit modal opens, set editor content ──
  useEffect(() => {
    if (showEditModal && editorRef.current) {
      editorRef.current.innerHTML = editNote.content || ''
    }
  }, [showEditModal])

  // ── Filter Notes ──
  const filteredNotes = notes.filter(note => {
    const matchSubject = selectedSubject === 'All' || note.subject === selectedSubject
    const matchSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  // ── AI Summarize ──
  const handleAiSummarize = async () => {
    if (!newNote.content.trim()) return alert('Please enter content first!')
    setSummarizing(true)
    setAiPreview(null)
    try {
      const res = await api.post('/api/notes/summarize', { content: newNote.content })
      setAiPreview({ summary: res.data.summary, suggestions: res.data.suggestions })
    } catch {
      alert('AI summary generation failed — please retry')
    } finally {
      setSummarizing(false)
    }
  }

  // ── AI Format ──
  const handleAiFormat = async (note) => {
    setFormatting(true)
    setFormattingNoteId(note._id)
    try {
      const res = await api.post('/api/notes/format', {
        content: note.content, title: note.title, subject: note.subject,
      })
      const updatedNote = { ...note, content: res.data.formattedContent }
      setNotes(prev => prev.map(n => n._id === note._id ? updatedNote : n))
      if (selectedNote?._id === note._id) setSelectedNote(updatedNote)
      alert('✅ Note formatted by AI successfully!')
    } catch {
      alert('AI formatting failed — please retry')
    } finally {
      setFormatting(false)
      setFormattingNoteId(null)
    }
  }

  // ── Save Note — Without AI ──
  const handleSaveNote = async () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      return alert('Please fill in all fields!')
    }
    setSaving(true)
    try {
      const res = await api.post('/api/notes/save', {
        title: newNote.title, subject: newNote.subject, content: newNote.content,
      })
      setNotes(prev => [res.data.note, ...prev])
      resetModal()
    } catch {
      alert('Failed to save note — please retry')
    } finally {
      setSaving(false)
    }
  }

  // ── Save Note — With AI Summary ──
  const handleSaveWithSummary = async () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      return alert('Please fill in all fields!')
    }
    if (!aiPreview) return alert('Please generate AI summary first!')
    setSaving(true)
    try {
      const res = await api.post('/api/notes/save-with-summary', {
        title: newNote.title, subject: newNote.subject, content: newNote.content,
        summary: aiPreview.summary, suggestions: aiPreview.suggestions,
      })
      setNotes(prev => [res.data.note, ...prev])
      resetModal()
    } catch {
      alert('Failed to save note — please retry')
    } finally {
      setSaving(false)
    }
  }

  // ── Edit Open ──
  const handleEditOpen = (note) => {
    setEditNote({
      _id: note._id,
      subject: note.subject,
      title: note.title,
      content: note.content,
    })
    setShowEditModal(true)
  }

  // ── Edit Save ──
  const handleEditSave = async () => {
    // contentEditable se latest HTML lo
    const latestContent = editorRef.current?.innerHTML || editNote.content

    if (!editNote.title.trim() || !latestContent.trim()) {
      return alert('Title and content are required!')
    }
    setEditSaving(true)
    try {
      const res = await api.put(`/api/notes/${editNote._id}`, {
        title: editNote.title,
        subject: editNote.subject,
        content: latestContent,
      })
      const updated = res.data.note
      setNotes(prev => prev.map(n => n._id === updated._id ? updated : n))
      if (selectedNote?._id === updated._id) setSelectedNote(updated)
      setShowEditModal(false)
    } catch {
      alert('Failed to update note — please retry')
    } finally {
      setEditSaving(false)
    }
  }

  // ── Analyze Existing Note ──
  const handleAnalyzeExisting = async (note) => {
    setAnalyzing(true)
    try {
      const res = await api.post('/api/notes/summarize', { content: note.content })
      await api.post('/api/notes/save-with-summary', {
        title: note.title, subject: note.subject, content: note.content,
        summary: res.data.summary, suggestions: res.data.suggestions,
      })
      const updatedNote = { ...note, summary: res.data.summary, suggestions: res.data.suggestions }
      setNotes(prev => prev.map(n => n._id === note._id ? updatedNote : n))
      setSelectedNote(updatedNote)
    } catch {
      alert('AI analysis fail — please retry')
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Delete ──
  const handleDelete = (id) => {
    if (!window.confirm('Do you want to delete this note?')) return
    setNotes(prev => prev.filter(n => n._id !== id))
    if (selectedNote?._id === id) setSelectedNote(null)
  }

  // ── Reset Modal ──
  const resetModal = () => {
    setShowAddModal(false)
    setNewNote({ subject: '', title: '', content: '' })
    setAiPreview(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-400 text-sm mt-1">AI will analyze your notes and provide study suggestions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdAdd size={20} />
          Add Note
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-200px">
          <MdSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 outline-none focus:border-teal-400"
        >
          <option value="All">All Subjects</option>
          {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
        </select>
      </div>

      {/* ── Main Content ── */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading notes...</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-col lg:flex-row">

          {/* ── Notes List ── */}
          <div className="flex flex-col gap-3 lg:w-2/5">
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <MdNote className="text-gray-300 mx-auto mb-2" size={40} />
                <p className="text-gray-400 text-sm">No notes found</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note._id}
                  onClick={() => setSelectedNote(note)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedNote?._id === note._id ? 'border-teal-400 shadow-md' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${subjectColor(note.subject)}`}>
                        {note.subject}
                      </span>
                      <h3 className="font-bold text-gray-800 mt-2 text-sm truncate">{note.title}</h3>
                      {/* Display HTML content safely — strip tags for preview */}
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {note.content.replace(/<[^>]+>/g, ' ')}
                      </p>
                    </div>
                    <NoteMenu
                      note={note}
                      onEdit={handleEditOpen}
                      onDelete={handleDelete}
                      onFormat={handleAiFormat}
                      isFormatting={formatting && formattingNoteId === note._id}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {note.summary && (
                      <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                        <MdAutoAwesome size={12} /> AI Analyzed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Note Detail Panel ── */}
          <div className="flex-1">
            {!selectedNote ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center min-h-300px">
                <MdNote className="text-gray-200 mb-3" size={60} />
                <p className="text-gray-400 font-medium">Select a note</p>
                <p className="text-gray-300 text-sm mt-1">Click a note on the left to view details</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${subjectColor(selectedNote.subject)}`}>
                      {selectedNote.subject}
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedNote.title}</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <NoteMenu
                    note={selectedNote}
                    onEdit={handleEditOpen}
                    onDelete={handleDelete}
                    onFormat={handleAiFormat}
                    isFormatting={formatting && formattingNoteId === selectedNote._id}
                  />
                </div>

                {/* ── Rich HTML Content Display ── */}
                <div
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-100 prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                />

                {!selectedNote.summary && (
                  <button
                    onClick={() => handleAnalyzeExisting(selectedNote)}
                    disabled={analyzing}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md disabled:opacity-70"
                    style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        AI is analyzing...
                      </>
                    ) : (
                      <><FaBrain size={16} /> Analyze with AI</>
                    )}
                  </button>
                )}

                {selectedNote.summary && (
                  <div className="flex flex-col gap-3">
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MdAutoAwesome className="text-teal-500" size={16} />
                        <span className="text-sm font-bold text-teal-700">AI Summary</span>
                      </div>
                      <p className="text-sm text-teal-700 leading-relaxed">{selectedNote.summary}</p>
                    </div>
                    {selectedNote.suggestions?.length > 0 && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaBrain className="text-purple-500" size={16} />
                          <span className="text-sm font-bold text-purple-700">AI Suggestions</span>
                        </div>
                        <ul className="flex flex-col gap-1">
                          {selectedNote.suggestions.map((tip, i) => (
                            <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                              <span className="flex-shrink-0">💡</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => handleAnalyzeExisting(selectedNote)}
                      disabled={analyzing}
                      className="text-xs text-teal-600 font-semibold hover:underline text-center disabled:opacity-50"
                    >
                      🔄 Re-analyze
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* ── ADD NOTE MODAL ── */}
      {/* ══════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Naya Note Add Karein</h2>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600">
                <MdClose size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Subject</label>
              <select
                value={newNote.subject}
                onChange={(e) => setNewNote(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              >
                <option value="">-- Subject chunein --</option>
                {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Note Title</label>
              <input
                type="text"
                placeholder="e.g. Calculus Notes..."
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Notes Content</label>
              <textarea
                rows={5}
                placeholder="Apne notes yahan likhein — AI analyze karega..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 resize-none"
              />
            </div>

            <button
              onClick={handleAiSummarize}
              disabled={summarizing || !newNote.content.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold text-sm mb-4 hover:bg-teal-50 transition-all disabled:opacity-50"
            >
              {summarizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  AI summary is being generated...
                </>
              ) : (
                <><FaBrain size={14} /> Generate AI Summary (Optional)</>
              )}
            </button>

            {aiPreview && (
              <div className="mb-4 flex flex-col gap-2">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <p className="text-xs font-bold text-teal-700 mb-1">✅ AI Summary:</p>
                  <p className="text-xs text-teal-600">{aiPreview.summary}</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-xs font-bold text-purple-700 mb-1">💡 AI Suggestions:</p>
                  {aiPreview.suggestions.map((tip, i) => (
                    <p key={i} className="text-xs text-purple-600">• {tip}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={resetModal} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              {!aiPreview ? (
                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              ) : (
                <button
                  onClick={handleSaveWithSummary}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                >
                  {saving ? 'Saving...' : '✨ Save with AI'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* ── EDIT NOTE MODAL — RICH TEXT EDITOR ── */}
      {/* ══════════════════════════════════════════ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Note Edit Karein</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <MdClose size={24} />
              </button>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Subject</label>
              <select
                value={editNote.subject}
                onChange={(e) => setEditNote(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              >
                {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
              </select>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Note Title</label>
              <input
                type="text"
                value={editNote.title}
                onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              />
            </div>

            {/* ── Rich Text Editor ── */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Content
                <span className="text-xs text-gray-400 ml-2">(Use toolbar for Bold, Italic, Font Size)</span>
              </label>

              {/* Toolbar */}
              <RichToolbar editorRef={editorRef} />

              {/* Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-180px px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-teal-400 transition-all"
                style={{ lineHeight: '1.7' }}
                onInput={() => {
                  // Content track karo real-time
                  setEditNote(prev => ({
                    ...prev,
                    content: editorRef.current?.innerHTML || ''
                  }))
                }}
              />

              {/* Shortcut Hint */}
              <p className="text-xs text-gray-400 mt-1">
                💡 Shortcuts: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+B</kbd> Bold &nbsp;
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+I</kbd> Italic &nbsp;
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+U</kbd> Underline
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
              >
                {editSaving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Notes