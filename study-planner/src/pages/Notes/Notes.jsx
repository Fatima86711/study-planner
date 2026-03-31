import { useState, useEffect, useRef } from 'react'
import {
  MdAdd, MdSearch, MdAutoAwesome, MdNote, MdClose,
  MdMoreVert, MdEdit, MdDelete, MdAutoFixHigh,
  MdFormatBold, MdFormatItalic, MdFormatUnderlined,
  MdFormatListBulleted, MdFormatListNumbered, MdFormatSize,
  MdColorLens
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
  const colorPickerRef = useRef(null)

  const execCmd = (command, value = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }

  const handleColorPicker = (e) => {
    const color = e.target.value
    if (color) {
      execCmd('foreColor', color)
    }
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
        { icon: <span className="w-4 h-4 rounded-full bg-red-500 block" />, cmd: 'foreColor', value: '#ef4444', title: 'Text Red' },
        { icon: <span className="w-4 h-4 rounded-full bg-blue-500 block" />, cmd: 'foreColor', value: '#3b82f6', title: 'Text Blue' },
        { icon: <span className="w-4 h-4 rounded-full bg-teal-500 block" />, cmd: 'foreColor', value: '#14b8a6', title: 'Text Teal' },
        { icon: <span className="w-4 h-4 rounded-full bg-gray-800 block" />, cmd: 'foreColor', value: '#1f2937', title: 'Text Black' },
        { icon: <MdColorLens size={18} className="text-gray-700" />, cmd: 'colorPicker', title: 'Custom Text Color' },
      ]
    },
    // ── Highlight ──
    {
      group: 'highlight',
      buttons: [
        { icon: <span className="w-4 h-4 rounded-full bg-yellow-300 block" />, cmd: 'hiliteColor', value: '#fef08a', title: 'Yellow Highlight' },
        { icon: <span className="w-4 h-4 rounded-full bg-green-300 block" />, cmd: 'hiliteColor', value: '#bbf7d0', title: 'Green Highlight' },
        { icon: <span className="w-4 h-4 rounded-full bg-cyan-300 block" />, cmd: 'hiliteColor', value: '#a5f3fc', title: 'Cyan Highlight' },
        { icon: <span className="w-4 h-4 rounded-full bg-pink-300 block" />, cmd: 'hiliteColor', value: '#fb7185', title: 'Pink Highlight' },
      ]
    },
  ]

  return (
    <>
      <input
        ref={colorPickerRef}
        type="color"
        onChange={handleColorPicker}
        className="hidden"
      />
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-xl mb-2">
        {toolbarButtons.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {/* Group buttons */}
            {group.buttons.map((btn, bi) => (
              <button
                key={bi}
                type="button"
                title={btn.title}
                onClick={() => btn.cmd === 'colorPicker' ? colorPickerRef.current?.click() : execCmd(btn.cmd, btn.value)}
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
    </>
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

  // ── File Upload State ──
  const [uploadedFile, setUploadedFile] = useState(null)      // Selected file
  const [filePreview, setFilePreview] = useState(null)        // Image preview URL
  const [fileAnalysis, setFileAnalysis] = useState(null)      // AI analysis result
  const [analyzingFile, setAnalyzingFile] = useState(false)   // Loading state
  const [fullScreenMode, setFullScreenMode] = useState(false) // Full screen note
  const [fullScreenNote, setFullScreenNote] = useState(null)  // Which note is fullscreen
  const [fullScreenEdit, setFullScreenEdit] = useState(false) // Full screen edit mode
  const fileInputRef = useRef(null)                           // File input ref

  // ── Fetch Notes ──
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/api/notes/my-notes')
        setNotes(res.data.notes)
      } catch (err) {
        setError('Notes load nahi hue')
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  // ── Jab Edit Modal khule toh editor mein content set karo ──
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
    if (!newNote.content.trim()) return alert('Pehle content likho!')
    setSummarizing(true)
    setAiPreview(null)
    try {
      const res = await api.post('/api/notes/summarize', { content: newNote.content })
      setAiPreview({ summary: res.data.summary, suggestions: res.data.suggestions })
    } catch {
      alert('AI summary generate nahi hui — please retry')
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
      alert('✅ Note AI se format ho gaya!')
    } catch {
      alert('AI format nahi kar saka — please retry')
    } finally {
      setFormatting(false)
      setFormattingNoteId(null)
    }
  }

  // ── Save Note — Bina AI ──
  const handleSaveNote = async () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      return alert('Sab fields fill karo!')
    }
    setSaving(true)
    try {
      const res = await api.post('/api/notes/save', {
        title: newNote.title, subject: newNote.subject, content: newNote.content,
      })
      setNotes(prev => [res.data.note, ...prev])
      resetModal()
    } catch {
      alert('Note save nahi hua — please retry')
    } finally {
      setSaving(false)
    }
  }

  // ── Save Note — AI Ke Saath ──
  const handleSaveWithSummary = async () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      return alert('Sab fields fill karo!')
    }
    if (!aiPreview) return alert('Pehle AI summary generate karo!')
    setSaving(true)
    try {
      const res = await api.post('/api/notes/save-with-summary', {
        title: newNote.title, subject: newNote.subject, content: newNote.content,
        summary: aiPreview.summary, suggestions: aiPreview.suggestions,
      })
      setNotes(prev => [res.data.note, ...prev])
      resetModal()
    } catch {
      alert('Note save nahi hua — please retry')
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
      return alert('Title aur content zaroori hain!')
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
      alert('Note update nahi hua — please retry')
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
      setFullScreenNote(updatedNote)
    } catch {
      alert('AI analysis fail — please retry')
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Delete ──
  const handleDelete = (id) => {
    if (!window.confirm('Note delete karna chahte ho?')) return
    setNotes(prev => prev.filter(n => n._id !== id))
    if (selectedNote?._id === id) setSelectedNote(null)
  }


  // ── Reset Modal ──
  const resetModal = () => {
    setShowAddModal(false)
    setNewNote({ subject: '', title: '', content: '' })
    setAiPreview(null)
  }


  // ── File Select Handler ──
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return

  setUploadedFile(file)
  setFileAnalysis(null)

  // Image preview
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => setFilePreview(e.target.result)
    reader.readAsDataURL(file)
  } else {
    setFilePreview(null) // PDF ke liye preview nahi
  }
}

// ── File AI Analyze ──
const handleFileAnalyze = async () => {
  if (!uploadedFile) return alert('Pehle file select karo!')
  setAnalyzingFile(true)
  try {
    const formData = new FormData()
    formData.append('file', uploadedFile)
    const res = await api.post('/api/notes/upload-analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setFileAnalysis({ summary: res.data.summary, suggestions: res.data.suggestions })
  } catch {
    alert('File analyze nahi hui — please retry')
  } finally {
    setAnalyzingFile(false)
  }
}

// ── Save Note With File ──
const handleSaveWithFile = async () => {
  if (!newNote.subject || !newNote.title) return alert('Subject aur title zaroori hain!')
  setSaving(true)
  try {
    const formData = new FormData()
    formData.append('title', newNote.title)
    formData.append('subject', newNote.subject)
    formData.append('content', newNote.content)
    if (fileAnalysis) {
      formData.append('summary', fileAnalysis.summary)
      formData.append('suggestions', JSON.stringify(fileAnalysis.suggestions))
    }
    if (uploadedFile) formData.append('file', uploadedFile)

    const res = await api.post('/api/notes/save-with-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setNotes(prev => [res.data.note, ...prev])
    setUploadedFile(null)
    setFilePreview(null)
    setFileAnalysis(null)
    resetModal()
  } catch {
    alert('Note save nahi hua — please retry')
  } finally {
    setSaving(false)
  }
}

// ── Open Full Screen ──
const openFullScreen = (note) => {
  setSelectedNote(note)
  setFullScreenNote(note)
  setEditNote({
    _id: note._id,
    subject: note.subject,
    title: note.title,
    content: note.content,
  })
  setFullScreenMode(true)
  setFullScreenEdit(true)

  if (typeof window !== 'undefined') {
    window.history.pushState({ fullScreenNote: note._id }, '', '#fullscreen')
  }
}

const closeFullScreen = () => {
  setFullScreenMode(false)
  setFullScreenNote(null)
  setFullScreenEdit(false)

  if (typeof window !== 'undefined' && window.location.hash === '#fullscreen') {
    window.history.back()
  }
}

// Ensure editor content is set when editing in full screen
useEffect(() => {
  if (fullScreenMode && fullScreenEdit && editorRef.current) {
    editorRef.current.innerHTML = editNote.content || ''
  }

  const onPopState = (event) => {
    if (fullScreenMode) {
      closeFullScreen()
    }
  }

  window.addEventListener('popstate', onPopState)
  return () => window.removeEventListener('popstate', onPopState)
}, [fullScreenMode, fullScreenEdit, editNote])

const handleFullScreenSave = async () => {
  try {
    const latestContent = editorRef.current?.innerHTML || editNote.content || ''

    if (!editNote.title.trim() || !latestContent.trim()) {
      return alert('Title aur content zaroori hain!')
    }

    setEditSaving(true)

    const res = await api.put(`/api/notes/${editNote._id}`, {
      title: editNote.title,
      subject: editNote.subject,
      content: latestContent,
    })

    const updated = res.data.note
    setNotes(prev => prev.map(n => n._id === updated._id ? updated : n))
    if (selectedNote?._id === updated._id) setSelectedNote(updated)
    setFullScreenNote(updated)
    setFullScreenEdit(false)
    alert('Note updated successfully!')
  } catch (err) {
    alert('Update failed — please retry')
  } finally {
    setEditSaving(false)
  }
}

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-400  text-sm mt-1">AI analyzes your notes and provides suggestions</p>
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
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <MdSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Notes search karein..."
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
                <p className="text-gray-400 text-sm">Koi note nahi mila</p>
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
                      {/* HTML content safely show karo — strip tags for preview */}
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
                    <button
                      onClick={(e) => { e.stopPropagation(); openFullScreen(note) }}
                      className="mt-2 text-xs text-teal-500 hover:underline font-medium"
                    >
                      ⛶ Open in Full Screen
                    </button>
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
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <MdNote className="text-gray-200 mb-3" size={60} />
                <p className="text-gray-400 font-medium">Koi note select karein</p>
                <p className="text-gray-300 text-sm mt-1">Left side se note click karein details dekhne ke liye</p>
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
                        AI Analyze kar raha hai...
                      </>
                    ) : (
                      <><FaBrain size={16} /> AI se Analyze Karao</>
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
                      🔄 Reanalyze
                    </button>
                  </div>
                )}

                {fullScreenMode && fullScreenNote && (
                  <div className="fixed inset-0 bg-white z-50 flex flex-col">

                    {/* ── Top Bar ── */}
                    <div
                      className="flex items-center justify-between px-8 py-4 text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editNote.title}
                          onChange={(e) => setEditNote(prev => ({ ...prev, title: e.target.value }))}
                          className="text-lg font-extrabold bg-white/20 px-3 py-1 rounded-lg text-white outline-none border border-white/40"
                        />
                        <select
                          value={editNote.subject}
                          onChange={(e) => setEditNote(prev => ({ ...prev, subject: e.target.value }))}
                          className="text-xs bg-white/20 px-2 py-1 rounded-lg text-white outline-none border border-white/40"
                        >
                          {subjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAnalyzeExisting(fullScreenNote)}
                          disabled={analyzing}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all"
                        >
                          {analyzing ? 'Analyzing...' : 'Reanalyze'}
                        </button>
                        <button
                          onClick={handleFullScreenSave}
                          disabled={editSaving}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all"
                        >
                          {editSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={closeFullScreen}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all"
                        >
                          <MdClose size={16} /> Close
                        </button>
                      </div>
                    </div>

                    {/* ── Main Content Area ── */}
                    <div className="flex flex-1 overflow-hidden">

                      {/* ── Left: Note Content ── */}
                      <div className="flex-1 overflow-y-auto p-8">

                        {/* Attached Image */}
                        {fullScreenNote.attachedFile?.mimetype?.startsWith('image/') && (
                          <div className="mb-6">
                            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Attached Image</p>
                            <img
                              src={`data:${fullScreenNote.attachedFile.mimetype};base64,${fullScreenNote.attachedFile.data}`}
                              alt={fullScreenNote.attachedFile.originalName}
                              className="max-w-full rounded-2xl border border-gray-200 shadow-sm"
                            />
                          </div>
                        )}

                        {/* Attached PDF */}
                        {fullScreenNote.attachedFile?.mimetype === 'application/pdf' && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3">
                            <span className="text-4xl">📄</span>
                            <div>
                              <p className="font-semibold text-gray-700">{fullScreenNote.attachedFile.originalName}</p>
                              <p className="text-xs text-gray-400">{(fullScreenNote.attachedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        )}

                        {/* Note Text Content */}
                        <RichToolbar editorRef={editorRef} />
                        <div
                          ref={editorRef}
                          contentEditable
                          suppressContentEditableWarning
                          className="prose prose-lg max-w-none text-gray-700 leading-relaxed bg-white p-4 rounded-2xl border border-gray-200 min-h-[280px]"
                          onInput={() => setEditNote(prev => ({ ...prev, content: editorRef.current?.innerHTML || '' }))}
                          dangerouslySetInnerHTML={{ __html: editNote.content || fullScreenNote.content }}
                        />
                      </div>

                      {/* ── Right Sidebar: AI Analysis ── */}
                      <div className="w-80 border-l border-gray-100 bg-gray-50 overflow-y-auto p-6 flex flex-col gap-4 flex-shrink-0">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                          <MdAutoAwesome className="text-teal-500" />
                          AI Analysis
                        </h3>

                        {fullScreenNote.summary ? (
                          <>
                            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                              <p className="text-xs font-bold text-teal-700 mb-2">📋 Summary</p>
                              <p className="text-sm text-teal-700 leading-relaxed">{fullScreenNote.summary}</p>
                            </div>

                            {fullScreenNote.suggestions?.length > 0 && (
                              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                                <p className="text-xs font-bold text-purple-700 mb-2">💡 Suggestions</p>
                                <ul className="flex flex-col gap-2">
                                  {fullScreenNote.suggestions.map((tip, i) => (
                                    <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                                      <span>💡</span>{tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-gray-400">
                              Is note ki abhi AI analysis nahi hui. Analyze karo!
                            </p>
                            <button
                              onClick={() => handleAnalyzeExisting(fullScreenNote)}
                              disabled={analyzing}
                              className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-70"
                              style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                            >
                              {analyzing ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <><FaBrain size={16} /> Analyze Karao</>
                              )}
                            </button>
                          </div>
                        )}

                        <div className="mt-auto p-3 bg-white rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-400">Created</p>
                          <p className="text-sm font-medium text-gray-600">
                            {new Date(fullScreenNote.createdAt).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
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
                  AI Summary Generate Ho Rahi Hai...
                </>
              ) : (
                <><FaBrain size={14} /> AI Summary Generate Karo (Optional)</>
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

            {/* ── File Upload Section ── */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                📎 File Attach Karo (Optional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50 transition-all"
              >
                {uploadedFile ? `✅ ${uploadedFile.name}` : '📁 Image ya PDF select karo'}
              </button>

              {filePreview && (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="mt-2 w-full h-40 object-cover rounded-xl border border-gray-200"
                />
              )}

              {uploadedFile && !filePreview && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}

              {uploadedFile && (
                <button
                  type="button"
                  onClick={handleFileAnalyze}
                  disabled={analyzingFile}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-purple-400 text-purple-600 font-semibold text-sm hover:bg-purple-50 transition-all disabled:opacity-50"
                >
                  {analyzingFile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      File Analyze Ho Rahi Hai...
                    </>
                  ) : (
                    <><FaBrain size={14} /> AI Se File Analyze Karao</>
                  )}
                </button>
              )}

              {fileAnalysis && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-xs font-bold text-teal-700 mb-1">✅ AI Summary:</p>
                    <p className="text-xs text-teal-600">{fileAnalysis.summary}</p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <p className="text-xs font-bold text-purple-700 mb-1">💡 Suggestions:</p>
                    {fileAnalysis.suggestions.map((tip, i) => (
                      <p key={i} className="text-xs text-purple-600">• {tip}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {uploadedFile && (
              <button
                onClick={handleSaveWithFile}
                disabled={saving}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md mb-3 disabled:opacity-60"
                style={{ background: 'linear-gradient(to right, #7c3aed, #a855f7)' }}
              >
                {saving ? 'Saving...' : '📎 File Ke Saath Save Karo'}
              </button>
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
                <span className="text-xs text-gray-400 ml-2">(Bold, Italic, Font Size — toolbar use karein)</span>
              </label>

              {/* Toolbar */}
              <RichToolbar editorRef={editorRef} />

              {/* Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-teal-400 transition-all"
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