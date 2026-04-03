import { useState, useEffect, useRef } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  MdAdd, MdSearch, MdAutoAwesome, MdNote, MdClose,
  MdMoreVert, MdDelete, MdAutoFixHigh,
  MdFormatBold, MdFormatItalic, MdFormatUnderlined,
  MdFormatListBulleted, MdFormatListNumbered,
  MdColorLens, MdStrikethroughS, MdFormatAlignLeft,
  MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify,
  MdFormatIndentIncrease, MdFormatIndentDecrease,
  MdFormatClear, MdLink, MdLinkOff, MdHorizontalRule,
  MdUndo, MdRedo, MdCode, MdTableChart, MdFullscreen,
  MdFullscreenExit, MdSave, MdFormatQuote,
  MdPrint, MdNoteAdd, MdPages, MdDeleteOutline,
  MdImage, MdPictureAsPdf
} from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'
import api from '../../services/api'
import AlertModal from '../../components/AlertModal'

/* ─────────────────────────────────────────── */
/*  CONSTANTS                                   */
/* ─────────────────────────────────────────── */
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology']

const subjectColor = (subject) => {
  const map = {
    Mathematics: 'bg-blue-50 text-blue-700 border-blue-200',
    Physics: 'bg-violet-50 text-violet-700 border-violet-200',
    Chemistry: 'bg-orange-50 text-orange-700 border-orange-200',
    English: 'bg-rose-50 text-rose-700 border-rose-200',
    Biology: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Computer Science': 'bg-teal-50 text-teal-700 border-teal-200',
  }
  return map[subject] || 'bg-gray-50 text-gray-600 border-gray-200'
}

const FONT_FAMILIES = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS']
const FONT_SIZES = ['8','9','10','11','12','14','16','18','20','24','28','32','36','48','72']

/* ─────────────────────────────────────────── */
/*  TABLE INSERT MODAL                          */
/* ─────────────────────────────────────────── */
const TableModal = ({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)

  const handleInsert = () => {
    if (rows < 1 || cols < 1) { toast.warning('Rows and columns must be at least 1'); return }
    onInsert(rows, cols)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[300]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MdTableChart className="text-teal-600" size={18} />
            <span className="text-sm font-bold text-gray-800">Insert Table</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <MdClose size={16} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Rows</label>
              <input
                type="number" min="1" max="20" value={rows}
                onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-center font-semibold text-gray-700 outline-none focus:border-teal-400 bg-gray-50"
              />
            </div>
            <div className="flex items-end pb-2 text-gray-300 font-bold text-lg">×</div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Columns</label>
              <input
                type="number" min="1" max="20" value={cols}
                onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-center font-semibold text-gray-700 outline-none focus:border-teal-400 bg-gray-50"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Preview</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {Array.from({ length: Math.min(rows, 4) }).map((_, r) => (
                <div key={r} className="flex">
                  {Array.from({ length: Math.min(cols, 6) }).map((_, c) => (
                    <div key={c} className="w-7 h-5 border border-gray-200 bg-gray-50" />
                  ))}
                  {cols > 6 && <div className="w-5 h-5 flex items-center justify-center text-[9px] text-gray-300">…</div>}
                </div>
              ))}
              {rows > 4 && (
                <div className="flex justify-center py-0.5">
                  <span className="text-[9px] text-gray-300">…</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{rows} × {cols} table</p>
          </div>
        </div>
        <div className="flex gap-2 px-5 py-3.5 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleInsert}
            className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg,#0f766e,#14b8a6)' }}>
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  PDF-TO-IMAGES MODAL                         */
/* ─────────────────────────────────────────── */
const PdfInsertModal = ({ onInsert, onClose }) => {
  const [pdfFile, setPdfFile] = useState(null)
  const [converting, setConverting] = useState(false)
  const [pages, setPages] = useState([]) // array of { dataUrl, selected }
  const [selectAll, setSelectAll] = useState(true)
  const fileRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || file.type !== 'application/pdf') {
      toast.warning('Please select a valid PDF file')
      return
    }
    setPdfFile(file)
    setConverting(true)
    setPages([])
    try {
      // Dynamically load pdfjs-dist from CDN
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      }

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      const rendered = []

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        rendered.push({ dataUrl: canvas.toDataURL('image/png'), selected: true, pageNum: i })
      }

      setPages(rendered)
      setSelectAll(true)
    } catch (err) {
      console.error(err)
      toast.error('Failed to convert PDF. Please try another file.')
    } finally {
      setConverting(false)
    }
  }

  const togglePage = (idx) => {
    setPages(prev => prev.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p))
  }

  const toggleAll = () => {
    const newVal = !selectAll
    setSelectAll(newVal)
    setPages(prev => prev.map(p => ({ ...p, selected: newVal })))
  }

  const handleInsert = () => {
    const selected = pages.filter(p => p.selected)
    if (selected.length === 0) { toast.warning('Select at least one page'); return }
    onInsert(selected.map(p => p.dataUrl))
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MdPictureAsPdf className="text-red-500" size={20} />
            <span className="text-sm font-bold text-gray-800">Insert PDF as Images</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* File picker */}
          <div>
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <MdPictureAsPdf size={20} />
              {pdfFile ? pdfFile.name : 'Select PDF file…'}
            </button>
          </div>

          {converting && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
              <p className="text-sm text-gray-500">Converting PDF pages to images…</p>
            </div>
          )}

          {pages.length > 0 && (
            <>
              {/* Select all toggle */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{pages.length} page{pages.length > 1 ? 's' : ''} found</p>
                <button onClick={toggleAll}
                  className="text-xs font-semibold text-teal-600 hover:underline">
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Page thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {pages.map((pg, idx) => (
                  <div key={idx} onClick={() => togglePage(idx)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${pg.selected ? 'border-teal-400 shadow-md' : 'border-gray-200 opacity-50'}`}>
                    <img src={pg.dataUrl} alt={`Page ${pg.pageNum}`} className="w-full h-auto block" />
                    {/* Checkmark overlay */}
                    <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${pg.selected ? 'bg-teal-500 text-white' : 'bg-white/80 text-gray-400 border border-gray-300'}`}>
                      {pg.selected ? '✓' : ''}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">
                      Page {pg.pageNum}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-3.5 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleInsert} disabled={pages.filter(p => p.selected).length === 0}
            className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#0f766e,#14b8a6)' }}>
            Insert {pages.filter(p => p.selected).length > 0 ? `${pages.filter(p => p.selected).length} Page${pages.filter(p => p.selected).length > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  RIBBON TOOLBAR  (tabbed + collapsible)      */
/* ─────────────────────────────────────────── */
const RibbonToolbar = ({ editorRef, onFullscreen, isFullscreen }) => {
  const [activeTab, setActiveTab]         = useState(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showTableModal, setShowTableModal]   = useState(false)
  const [showPdfModal, setShowPdfModal]       = useState(false)
  const [linkUrl, setLinkUrl]             = useState('')
  const [savedRange, setSavedRange]       = useState(null)
  const colorRef    = useRef(null)
  const bgColorRef  = useRef(null)
  const linkInputRef = useRef(null)
  const imageInputRef = useRef(null)   // ← new

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }
  const saveRange = () => {
    const sel = window.getSelection()
    if (sel?.rangeCount > 0) setSavedRange(sel.getRangeAt(0).cloneRange())
  }
  const restoreRange = () => {
    if (!savedRange) return
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(savedRange)
  }
  const insertLink = () => {
    restoreRange()
    if (linkUrl.trim()) exec('createLink', linkUrl.trim())
    setShowLinkInput(false); setLinkUrl('')
  }

  // ── Insert image at current cursor position ──
  const insertImageAtCursor = (dataUrl, altText = 'image') => {
    editorRef.current?.focus()
    const html = `<img src="${dataUrl}" alt="${altText}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;display:block;" />`
    document.execCommand('insertHTML', false, html)
  }

  // ── Handle image file selection ──
  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    // Save cursor before file dialog steals focus
    const sel = window.getSelection()
    let range = null
    if (sel?.rangeCount > 0) range = sel.getRangeAt(0).cloneRange()

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        // Restore cursor then insert
        if (range) {
          const s = window.getSelection()
          s.removeAllRanges()
          s.addRange(range)
        }
        insertImageAtCursor(ev.target.result, file.name)
      }
      reader.readAsDataURL(file)
    })
    // Reset input so same file can be reselected
    e.target.value = ''
  }

  // ── Insert PDF pages as images at cursor ──
  const handlePdfInsert = (dataUrls) => {
    // Restore cursor (PDF modal may have stolen focus)
    restoreRange()
    editorRef.current?.focus()
    dataUrls.forEach((dataUrl, i) => {
      const html = `<img src="${dataUrl}" alt="PDF page ${i + 1}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;border:1px solid #e5e7eb;" />`
      document.execCommand('insertHTML', false, html)
    })
  }

  const doInsertTable = (r, c) => {
    let html = '<table style="border-collapse:collapse;width:100%;margin:12px 0;">'
    for (let i = 0; i < r; i++) {
      html += '<tr>'
      for (let j = 0; j < c; j++)
        html += '<td style="border:1px solid #d1d5db;padding:8px 12px;min-width:60px;">&nbsp;</td>'
      html += '</tr>'
    }
    html += '</table><p><br></p>'
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, html)
  }

  const insertHR = () => {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, '<hr style="border:none;border-top:2px solid #e5e7eb;margin:16px 0;"/><p><br></p>')
  }
  const insertBlockquote = () => {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false,
      '<blockquote style="border-left:4px solid #14b8a6;margin:12px 0;padding:10px 16px;background:#f0fdfa;color:#0f766e;border-radius:0 8px 8px 0;">Quote here</blockquote><p><br></p>')
  }
  const insertCode = () => {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false,
      '<code style="background:#1e293b;color:#e2e8f0;padding:2px 8px;border-radius:4px;font-family:Courier New;font-size:.9em;">code</code>')
  }
  const printDoc = () => {
    const content = editorRef.current?.innerHTML || ''
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>Print</title><style>
      body{font-family:Georgia,serif;padding:48px;max-width:760px;margin:auto;color:#1f2937;line-height:1.8}
      table{border-collapse:collapse;width:100%}td{border:1px solid #d1d5db;padding:8px}
      blockquote{border-left:4px solid #14b8a6;padding:10px 16px;background:#f0fdfa;margin:12px 0}
      hr{border:none;border-top:2px solid #e5e7eb;margin:16px 0}
      h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.2em}
      code{background:#1e293b;color:#e2e8f0;padding:2px 6px;border-radius:4px;font-family:Courier New}
    </style></head><body>${content}</body></html>`)
    w.document.close(); w.print()
  }

  const toggleTab = (tab) => setActiveTab(prev => prev === tab ? null : tab)

  /* ── Btn helper ── */
  const Btn = ({ icon, title, action }) => (
    <button title={title} onMouseDown={e => { e.preventDefault(); action() }}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-transparent hover:border-teal-200 transition-all flex-shrink-0">
      {icon}
    </button>
  )

  /* ── Tab panel content ── */
  const panels = {
    home: (
      <div className="flex flex-wrap gap-5 items-start py-3 px-4">
        {/* Clipboard */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            <Btn icon={<MdUndo size={18}/>} title="Undo (Ctrl+Z)" action={()=>exec('undo')}/>
            <Btn icon={<MdRedo size={18}/>} title="Redo (Ctrl+Y)" action={()=>exec('redo')}/>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Clipboard</span>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>
        {/* Font */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <select title="Font Family" defaultValue="Georgia" onChange={e => exec('fontName', e.target.value)}
              className="h-7 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 outline-none hover:border-teal-400 cursor-pointer max-w-[130px]">
              {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select title="Font Size" defaultValue="14"
              onChange={e => {
                editorRef.current?.focus()
                const sel = window.getSelection()
                if (sel?.rangeCount > 0) {
                  const sp = document.createElement('span')
                  sp.style.fontSize = e.target.value + 'px'
                  try { sel.getRangeAt(0).surroundContents(sp) } catch {}
                }
              }}
              className="h-7 w-14 px-1 text-xs rounded-md border border-gray-200 bg-white text-gray-700 outline-none hover:border-teal-400 cursor-pointer">
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-0.5">
            {[
              { icon: <MdFormatBold size={17}/>,       cmd:'bold',          title:'Bold (Ctrl+B)' },
              { icon: <MdFormatItalic size={17}/>,     cmd:'italic',        title:'Italic (Ctrl+I)' },
              { icon: <MdFormatUnderlined size={17}/>, cmd:'underline',     title:'Underline (Ctrl+U)' },
              { icon: <MdStrikethroughS size={17}/>,   cmd:'strikeThrough', title:'Strikethrough' },
              { icon: <span className="font-bold text-[11px] italic">x²</span>, cmd:'superscript', title:'Superscript' },
              { icon: <span className="font-bold text-[11px]">x₂</span>,        cmd:'subscript',   title:'Subscript' },
            ].map((b, i) => (
              <button key={i} title={b.title} onMouseDown={e=>{e.preventDefault();exec(b.cmd)}}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-transparent hover:border-teal-200 transition-all">
                {b.icon}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Font</span>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>
        {/* Paragraph */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap gap-0.5 max-w-[140px]">
            {[
              { icon:<MdFormatListBulleted size={18}/>,   title:'Bullet List',   cmd:'insertUnorderedList' },
              { icon:<MdFormatListNumbered size={18}/>,   title:'Numbered List', cmd:'insertOrderedList' },
              { icon:<MdFormatIndentIncrease size={18}/>, title:'Indent',        cmd:'indent' },
              { icon:<MdFormatIndentDecrease size={18}/>, title:'Outdent',       cmd:'outdent' },
              { icon:<MdFormatAlignLeft size={18}/>,      title:'Align Left',    cmd:'justifyLeft' },
              { icon:<MdFormatAlignCenter size={18}/>,    title:'Center',        cmd:'justifyCenter' },
              { icon:<MdFormatAlignRight size={18}/>,     title:'Align Right',   cmd:'justifyRight' },
              { icon:<MdFormatAlignJustify size={18}/>,   title:'Justify',       cmd:'justifyFull' },
            ].map((b, i) => (
              <button key={i} title={b.title} onMouseDown={e=>{e.preventDefault();exec(b.cmd)}}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-transparent hover:border-teal-200 transition-all">
                {b.icon}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Paragraph</span>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>
        {/* Styles */}
        <div className="flex flex-col gap-1 justify-center">
          <select title="Format" defaultValue="" onChange={e=>{exec('formatBlock',e.target.value);editorRef.current?.focus()}}
            className="h-8 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 outline-none hover:border-teal-400 cursor-pointer">
            <option value="" disabled>Format…</option>
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="pre">Preformatted</option>
          </select>
          <Btn icon={<MdFormatClear size={18}/>} title="Clear Formatting" action={()=>{exec('removeFormat');exec('formatBlock','p')}}/>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Styles</span>
        </div>
      </div>
    ),

    insert: (
      <div className="flex flex-wrap gap-5 items-start py-3 px-4">
        {/* Links */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            <Btn icon={<MdLink size={18}/>}    title="Insert Link"  action={()=>{saveRange();setShowLinkInput(true)}}/>
            <Btn icon={<MdLinkOff size={18}/>} title="Remove Link"  action={()=>exec('unlink')}/>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Links</span>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>

        {/* ── IMAGE ── */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            {/* Insert image from file */}
            <button
              title="Insert Image"
              onMouseDown={e => {
                e.preventDefault()
                saveRange()                       // save cursor before dialog opens
                imageInputRef.current?.click()
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-transparent hover:border-teal-200 transition-all flex-shrink-0">
              <MdImage size={18}/>
            </button>
            {/* Insert PDF pages as images */}
            <button
              title="Insert PDF as Images"
              onMouseDown={e => {
                e.preventDefault()
                saveRange()                       // save cursor before modal opens
                setShowPdfModal(true)
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all flex-shrink-0">
              <MdPictureAsPdf size={18}/>
            </button>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Images</span>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>

        {/* Tables */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            <Btn icon={<MdTableChart size={18}/>}     title="Insert Table"    action={()=>setShowTableModal(true)}/>
            <Btn icon={<MdHorizontalRule size={18}/>} title="Horizontal Rule" action={insertHR}/>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Tables</span>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>

        {/* Blocks */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            <Btn icon={<MdFormatQuote size={18}/>} title="Blockquote"  action={insertBlockquote}/>
            <Btn icon={<MdCode size={18}/>}         title="Inline Code" action={insertCode}/>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">Blocks</span>
        </div>
      </div>
    ),

    color: (
      <div className="flex flex-wrap gap-5 items-start py-3 px-4">
        {/* Text color */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Text Color</p>
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {['#1f2937','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#64748b','#ffffff'].map(c=>(
              <button key={c} title={c} onClick={()=>exec('foreColor',c)}
                className="w-6 h-6 rounded-full border-2 border-white shadow hover:scale-125 transition-transform"
                style={{background:c, outline: c==='#ffffff'?'1px solid #d1d5db':undefined}}/>
            ))}
            <button title="Custom color" onClick={()=>colorRef.current?.click()}
              className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-teal-400 transition-all">
              <MdColorLens size={12} className="text-gray-500"/>
            </button>
          </div>
        </div>
        <div className="w-px h-14 bg-gray-200 self-center"/>
        {/* Highlight */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Highlight</p>
          <div className="flex flex-wrap gap-1.5 max-w-[180px]">
            {['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#f5d0fe','#fed7aa','#a5f3fc','#e9d5ff'].map(c=>(
              <button key={c} title={c} onClick={()=>exec('hiliteColor',c)}
                className="w-6 h-6 rounded border-2 border-white shadow hover:scale-125 transition-transform"
                style={{background:c}}/>
            ))}
            <button title="Custom highlight" onClick={()=>bgColorRef.current?.click()}
              className="w-6 h-6 rounded border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-teal-400 transition-all text-[10px] font-bold text-gray-400">
              +
            </button>
          </div>
        </div>
        <input ref={colorRef}   type="color" className="hidden" onChange={e=>exec('foreColor',e.target.value)}/>
        <input ref={bgColorRef} type="color" className="hidden" onChange={e=>exec('hiliteColor',e.target.value)}/>
      </div>
    ),

    view: (
      <div className="flex flex-wrap gap-5 items-center py-3 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex gap-0.5">
            {onFullscreen && <Btn icon={isFullscreen ? <MdFullscreenExit size={18}/> : <MdFullscreen size={18}/>} title="Fullscreen" action={onFullscreen}/>}
            <Btn icon={<MdPrint size={18}/>} title="Print" action={printDoc}/>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-center">View</span>
        </div>
        <div className="w-px h-10 bg-gray-200 self-center"/>
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">⌨️ Shortcuts</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[['Ctrl+B','Bold'],['Ctrl+I','Italic'],['Ctrl+U','Underline'],['Ctrl+Z','Undo'],['Ctrl+Y','Redo']].map(([k,d])=>(
              <div key={k} className="flex items-center gap-1.5">
                <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">{k}</kbd>
                <span className="text-[11px] text-gray-500">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }

  return (
    <>
      {/* Hidden image file input (supports multiple) */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />

      <div className="select-none border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* ── Tab Bar ── */}
        <div className="flex items-center bg-gray-50 border-b border-gray-200 px-1 overflow-x-auto">
          {[
            { id:'home',   label:'Home' },
            { id:'insert', label:'Insert' },
            { id:'color',  label:'Color' },
            { id:'view',   label:'View' },
          ].map(tab => (
            <button key={tab.id} onClick={() => toggleTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-white border-x border-t border-gray-200 text-teal-700 -mb-px relative z-10 rounded-t-lg'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-t-lg'
              }`}>
              {tab.label}
              <span className="text-[9px] opacity-40">{activeTab === tab.id ? '▲' : '▼'}</span>
            </button>
          ))}
          <div className="flex-1"/>
          {/* Quick Access */}
          <div className="flex items-center gap-0.5 pr-2 py-1">
            {[
              { icon:<MdUndo size={15}/>,             title:'Undo',      action:()=>exec('undo') },
              { icon:<MdRedo size={15}/>,             title:'Redo',      action:()=>exec('redo') },
              { icon:<MdFormatBold size={15}/>,       title:'Bold',      action:()=>exec('bold') },
              { icon:<MdFormatItalic size={15}/>,     title:'Italic',    action:()=>exec('italic') },
              { icon:<MdFormatUnderlined size={15}/>, title:'Underline', action:()=>exec('underline') },
            ].map((b,i) => (
              <button key={i} title={b.title} onMouseDown={e=>{e.preventDefault();b.action()}}
                className="flex items-center justify-center w-6 h-6 rounded text-gray-500 hover:bg-teal-50 hover:text-teal-700 transition-all">
                {b.icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sliding Ribbon Panel ── */}
        <div className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: activeTab ? '120px' : '0px', opacity: activeTab ? 1 : 0 }}>
          <div className="overflow-y-auto max-h-[120px]">
            {activeTab && panels[activeTab]}
          </div>
        </div>

        {/* ── Link Input Bar ── */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border-t border-teal-200">
            <MdLink className="text-teal-600 flex-shrink-0" size={16}/>
            <input ref={linkInputRef} autoFocus type="url" placeholder="https://..."
              value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter')insertLink();if(e.key==='Escape')setShowLinkInput(false)}}
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-teal-300"/>
            <button onClick={insertLink} className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700">Insert</button>
            <button onClick={()=>setShowLinkInput(false)} className="text-gray-400 hover:text-gray-600"><MdClose size={16}/></button>
          </div>
        )}
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <TableModal
          onInsert={doInsertTable}
          onClose={() => setShowTableModal(false)}
        />
      )}

      {/* PDF-to-Images Modal */}
      {showPdfModal && (
        <PdfInsertModal
          onInsert={handlePdfInsert}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </>
  )
}

/* ─────────────────────────────────────────── */
/*  MULTI-PAGE EDITOR                           */
/* ─────────────────────────────────────────── */
const MultiPageEditor = ({ editNote, setEditNote, editorRefs, pages, setPages, activePage, setActivePage }) => {
  const [wordCount, setWordCount] = useState(0)
  const [deletePageIdx, setDeletePageIdx] = useState(null)

  const updateCounts = () => {
    const text = pages.map((_,i) => editorRefs.current[i]?.innerText || '').join(' ')
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
  }

  const addPage = () => {
    const newPg = { id: Date.now(), content: '' }
    const newIdx = pages.length
    setPages(prev => [...prev, newPg])
    setActivePage(newIdx)
    setTimeout(() => {
      if (editorRefs.current[newIdx]) {
        editorRefs.current[newIdx].innerHTML = ''
        editorRefs.current[newIdx].focus()
      }
    }, 60)
  }

  const deletePage = (idx) => {
    if (pages.length === 1) { toast.warning("Can't delete the only page!"); return }
    setDeletePageIdx(idx)
  }

  const confirmDeletePage = () => {
    const idx = deletePageIdx
    setPages(prev => prev.filter((_,i) => i !== idx))
    setActivePage(prev => Math.max(0, idx === prev ? idx - 1 : prev > idx ? prev - 1 : prev))
    setDeletePageIdx(null)
  }

  const syncPageContent = (idx) => {
    const html = editorRefs.current[idx]?.innerHTML || ''
    const updatedPages = pages.map((p,i) => i === idx ? {...p, content: html} : p)
    setPages(updatedPages)
    updateCounts()
    const combined = updatedPages.map((p,i) => `<div class="note-page" data-page="${i+1}">${
      i === idx ? html : (editorRefs.current[i]?.innerHTML || p.content || '')
    }</div>`).join('')
    setEditNote(prev => ({...prev, content: combined}))
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Page Tab Bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200 overflow-x-auto flex-shrink-0 min-h-[44px]">
        <MdPages size={14} className="text-gray-400 flex-shrink-0 mr-1"/>
        {pages.map((pg, idx) => (
          <div key={pg.id} className="flex items-center flex-shrink-0 group/tab">
            <button
              onClick={() => { setActivePage(idx); setTimeout(()=>editorRefs.current[idx]?.focus(), 30) }}
              className={`flex items-center gap-1 px-3 py-1 rounded-l-lg text-xs font-semibold transition-all ${
                activePage === idx
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
              }`}>
              <MdNote size={12}/> Page {idx + 1}
            </button>
            {pages.length > 1 && (
              <button
                onClick={() => deletePage(idx)}
                title={`Delete page ${idx + 1}`}
                className={`h-[26px] px-1.5 flex items-center justify-center rounded-r-lg text-xs transition-all border-l ${
                  activePage === idx
                    ? 'bg-teal-700 text-teal-200 hover:bg-red-500 hover:text-white border-teal-500'
                    : 'bg-white text-gray-300 hover:bg-red-50 hover:text-red-500 border-gray-200'
                }`}>
                <MdDeleteOutline size={13}/>
              </button>
            )}
          </div>
        ))}
        <button onClick={addPage}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-600 border border-dashed border-teal-300 hover:bg-teal-50 transition-all flex-shrink-0 ml-1">
          <MdAdd size={13}/> Add Page
        </button>
        <div className="flex-1"/>
        <span className="text-[10px] text-gray-400 flex-shrink-0 pr-2">{wordCount} words · Page {activePage+1}/{pages.length}</span>
      </div>

      {/* Pages Canvas */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {pages.map((pg, idx) => (
            <div key={pg.id} className={`transition-all duration-200 ${activePage === idx ? '' : 'opacity-50 hover:opacity-75'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">Page {idx+1}</span>
                <div className="flex-1 h-px bg-gray-200"/>
                {pages.length > 1 && (
                  <button
                    onClick={() => deletePage(idx)}
                    title={`Delete page ${idx + 1}`}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all flex-shrink-0">
                    <MdDeleteOutline size={12}/> Delete Page
                  </button>
                )}
                {activePage !== idx && (
                  <button onClick={() => { setActivePage(idx); setTimeout(()=>editorRefs.current[idx]?.focus(), 30) }}
                    className="text-[10px] text-teal-500 hover:underline font-semibold flex-shrink-0">
                    Click to edit
                  </button>
                )}
              </div>

              {/* Paper */}
              <div
                onClick={() => { setActivePage(idx); editorRefs.current[idx]?.focus() }}
                className={`bg-white shadow-xl rounded-sm min-h-[680px] px-14 py-12 relative cursor-text transition-all ${
                  activePage === idx ? 'ring-2 ring-teal-400 ring-offset-2' : ''
                }`}>
                <div className="absolute left-10 top-0 bottom-0 w-px bg-red-100"/>
                <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                  <span className="text-[10px] text-gray-200">— {idx+1} —</span>
                </div>
                <div
                  ref={el => editorRefs.current[idx] = el}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck
                  data-placeholder={idx === 0 ? "Start typing your notes here..." : `Continue on page ${idx+1}...`}
                  className="outline-none min-h-[560px] text-gray-800 text-sm relative z-10"
                  style={{ fontFamily:'Georgia, serif', lineHeight:'1.9', caretColor:'#0f766e' }}
                  onFocus={() => setActivePage(idx)}
                  onInput={() => syncPageContent(idx)}
                />
              </div>
            </div>
          ))}

          <button onClick={addPage}
            className="flex items-center justify-center gap-2 w-full py-5 border-2 border-dashed border-gray-300 rounded-2xl text-sm text-gray-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/40 transition-all">
            <MdNoteAdd size={22}/> Add New Page
          </button>
        </div>
      </div>

      {/* Delete Page Confirmation Modal */}
      {deletePageIdx !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <MdDeleteOutline className="text-red-500" size={20}/>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Delete Page {deletePageIdx + 1}?</p>
                <p className="text-xs text-gray-400 mt-0.5">This will permanently remove this page and its content.</p>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-3.5">
              <button onClick={() => setDeletePageIdx(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={confirmDeletePage}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  WORD EDITOR (Ribbon + MultiPage combined)   */
/* ─────────────────────────────────────────── */
const WordEditor = ({ editNote, setEditNote, onSave, saving, onClose, title = 'Edit Note' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editorRefs = useRef([])

  const parsePages = () => {
    const content = editNote.content || ''
    const matches = [...content.matchAll(/<div class="note-page" data-page="\d+">([\s\S]*?)<\/div>/g)]
    if (matches.length > 0) return matches.map((m,i) => ({ id: Date.now()+i, content: m[1] }))
    return [{ id: Date.now(), content }]
  }

  const [pages, setPages] = useState(parsePages)
  const [activePage, setActivePage] = useState(0)

  useEffect(() => {
    pages.forEach((pg, i) => {
      if (editorRefs.current[i]) editorRefs.current[i].innerHTML = pg.content || ''
    })
  }, [])

  useEffect(() => {
    setTimeout(() => editorRefs.current[activePage]?.focus(), 30)
  }, [activePage])

  const activeEditorRef = { current: editorRefs.current[activePage] }

  return (
    <div className={`flex flex-col bg-white ${isFullscreen ? 'fixed inset-0 z-[200]' : 'h-full'}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background:'linear-gradient(135deg,#0f766e,#14b8a6)' }}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-400 cursor-pointer hover:brightness-110" onClick={onClose}/>
          <div className="w-3 h-3 rounded-full bg-yellow-400"/>
          <div className="w-3 h-3 rounded-full bg-green-400 cursor-pointer hover:brightness-110" onClick={()=>setIsFullscreen(f=>!f)}/>
          <span className="text-sm font-semibold text-white/80 ml-2 max-w-[180px] truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 mx-4 max-w-md">
          <input type="text" value={editNote.title} placeholder="Note title..."
            onChange={e=>setEditNote(p=>({...p,title:e.target.value}))}
            className="flex-1 px-3 py-1.5 text-sm font-semibold bg-white/20 text-white placeholder-white/50 rounded-lg outline-none border border-white/30 focus:border-white/70"/>
          <select value={editNote.subject} onChange={e=>setEditNote(p=>({...p,subject:e.target.value}))}
            className="px-2 py-1.5 text-xs bg-white/20 text-white rounded-lg outline-none border border-white/30">
            {subjects.map(s=><option key={s} value={s} className="text-gray-800">{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold text-white border border-white/30 transition-all disabled:opacity-60">
            <MdSave size={15}/>{saving ? 'Saving...' : 'Save'}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
              <MdClose size={16}/>
            </button>
          )}
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <div className="px-4 pt-2 pb-1 flex-shrink-0">
        <RibbonToolbar editorRef={activeEditorRef} onFullscreen={()=>setIsFullscreen(f=>!f)} isFullscreen={isFullscreen}/>
      </div>

      {/* Multi-Page Editor */}
      <MultiPageEditor
        editNote={editNote}
        setEditNote={setEditNote}
        editorRefs={editorRefs}
        pages={pages}
        setPages={setPages}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-teal-700 text-white text-[11px] flex-shrink-0">
        <span className="opacity-60">Page {activePage+1} of {pages.length}</span>
        <span className="opacity-60">Ready</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  NOTE CONTEXT MENU                           */
/* ─────────────────────────────────────────── */
const NoteMenu = ({ note, onEdit, onDelete, onFormat, isFormatting }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={e=>{e.stopPropagation();setOpen(!open)}}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
        <MdMoreVert size={20}/>
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <button onClick={e=>{e.stopPropagation();onFormat(note);setOpen(false)}} disabled={isFormatting}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-all disabled:opacity-50">
            <MdAutoFixHigh className="text-violet-500" size={18}/>{isFormatting ? 'Formatting...' : 'AI Format'}
          </button>
          <div className="border-t border-gray-100"/>
          <button onClick={e=>{e.stopPropagation();onDelete(note._id);setOpen(false)}}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all">
            <MdDelete size={18}/> Delete Note
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  MAIN NOTES PAGE                             */
/* ─────────────────────────────────────────── */
const Notes = () => {
  const [notes, setNotes]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [newNote, setNewNote]           = useState({ subject:'', title:'', content:'' })
  const [saving, setSaving]             = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editNote, setEditNote]           = useState({ _id:'', subject:'', title:'', content:'' })
  const [editSaving, setEditSaving]       = useState(false)

  const [fullScreenMode, setFullScreenMode] = useState(false)
  const [fullScreenNote, setFullScreenNote] = useState(null)

  const [analyzing, setAnalyzing]       = useState(false)
  const [summarizing, setSummarizing]   = useState(false)
  const [aiPreview, setAiPreview]       = useState(null)
  const [formatting, setFormatting]     = useState(false)
  const [formattingNoteId, setFormattingNoteId] = useState(null)

  const [uploadedFile, setUploadedFile] = useState(null)
  const [filePreview, setFilePreview]   = useState(null)
  const [fileAnalysis, setFileAnalysis] = useState(null)
  const [analyzingFile, setAnalyzingFile] = useState(false)
  const fileInputRef = useRef(null)
  const addEditorRef = useRef(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete]       = useState(null)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/api/notes/my-notes')
        setNotes(res.data.notes)
      } catch { setError('Failed to load notes') }
      finally { setLoading(false) }
    }
    fetchNotes()
  }, [])

  const filteredNotes = notes.filter(n => {
    const ms = selectedSubject === 'All' || n.subject === selectedSubject
    const mq = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               n.content.toLowerCase().includes(searchQuery.toLowerCase())
    return ms && mq
  })

  const handleAiSummarize = async () => {
    const content = addEditorRef.current?.innerHTML || newNote.content
    if (!content.trim()) { toast.warning('Enter content first!'); return }
    setSummarizing(true); setAiPreview(null)
    try {
      const res = await api.post('/api/notes/summarize', { content })
      setAiPreview({ summary:res.data.summary, suggestions:res.data.suggestions })
    } catch { toast.error('AI summary failed') }
    finally { setSummarizing(false) }
  }

  const handleAiFormat = async (note) => {
    setFormatting(true); setFormattingNoteId(note._id)
    try {
      const res = await api.post('/api/notes/format', { content:note.content, title:note.title, subject:note.subject })
      const updated = {...note, content:res.data.formattedContent}
      setNotes(prev => prev.map(n => n._id===note._id ? updated : n))
      if (selectedNote?._id===note._id) setSelectedNote(updated)
      toast.success('Formatted!')
    } catch { toast.error('AI format failed') }
    finally { setFormatting(false); setFormattingNoteId(null) }
  }

  const handleSaveNote = async () => {
    const content = addEditorRef.current?.innerHTML || newNote.content
    if (!newNote.subject||!newNote.title||!content.trim()) { toast.warning('Fill all fields!'); return }
    setSaving(true)
    try {
      const res = await api.post('/api/notes/save', { title:newNote.title, subject:newNote.subject, content })
      setNotes(prev => [res.data.note,...prev]); resetModal()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleSaveWithSummary = async () => {
    const content = addEditorRef.current?.innerHTML || newNote.content
    if (!newNote.subject||!newNote.title||!content.trim()) { toast.warning('Fill all fields!'); return }
    if (!aiPreview) { toast.warning('Generate AI summary first!'); return }
    setSaving(true)
    try {
      const res = await api.post('/api/notes/save-with-summary', {
        title:newNote.title, subject:newNote.subject, content,
        summary:aiPreview.summary, suggestions:aiPreview.suggestions,
      })
      setNotes(prev => [res.data.note,...prev]); resetModal()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleEditOpen = (note) => {
    setEditNote({ _id:note._id, subject:note.subject, title:note.title, content:note.content })
    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!editNote.title.trim()||!editNote.content.trim()) { toast.warning('Title and content required!'); return }
    setEditSaving(true)
    try {
      const res = await api.put(`/api/notes/${editNote._id}`, { title:editNote.title, subject:editNote.subject, content:editNote.content })
      const updated = res.data.note
      setNotes(prev => prev.map(n => n._id===updated._id ? updated : n))
      if (selectedNote?._id===updated._id) setSelectedNote(updated)
      setShowEditModal(false); toast.success('Saved!')
    } catch { toast.error('Update failed') }
    finally { setEditSaving(false) }
  }

  const openFullScreen = (note) => {
    setFullScreenNote(note)
    setEditNote({ _id:note._id, subject:note.subject, title:note.title, content:note.content })
    setFullScreenMode(true)
    window.history.pushState({ fs:note._id }, '', '#editor')
  }
  const closeFullScreen = () => {
    setFullScreenMode(false); setFullScreenNote(null)
    if (window.location.hash==='#editor') window.history.back()
  }
  const handleFullScreenSave = async () => {
    if (!editNote.title.trim()||!editNote.content.trim()) { toast.warning('Fill fields!'); return }
    setEditSaving(true)
    try {
      const res = await api.put(`/api/notes/${editNote._id}`, { title:editNote.title, subject:editNote.subject, content:editNote.content })
      const updated = res.data.note
      setNotes(prev => prev.map(n => n._id===updated._id ? updated : n))
      setSelectedNote(updated); setFullScreenNote(updated); toast.success('Saved!')
    } catch { toast.error('Failed') }
    finally { setEditSaving(false) }
  }

  useEffect(() => {
    const h = () => { if (fullScreenMode) closeFullScreen() }
    window.addEventListener('popstate', h)
    return () => window.removeEventListener('popstate', h)
  }, [fullScreenMode])

  const handleAnalyzeExisting = async (note) => {
    setAnalyzing(true)
    try {
      const res = await api.post('/api/notes/summarize', { content:note.content })
      await api.post('/api/notes/save-with-summary', {
        title:note.title, subject:note.subject, content:note.content,
        summary:res.data.summary, suggestions:res.data.suggestions,
      })
      const updated = {...note, summary:res.data.summary, suggestions:res.data.suggestions}
      setNotes(prev => prev.map(n => n._id===note._id ? updated : n))
      setSelectedNote(updated); setFullScreenNote(updated)
    } catch { toast.error('AI analysis failed') }
    finally { setAnalyzing(false) }
  }

  const handleDelete = id => { setNoteToDelete(id); setDeleteModalOpen(true) }
  const confirmDelete = async () => {
    try {
      await api.delete(`/api/notes/${noteToDelete}`)
      setNotes(prev => prev.filter(n => n._id!==noteToDelete))
      if (selectedNote?._id===noteToDelete) setSelectedNote(null)
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
    finally { setDeleteModalOpen(false); setNoteToDelete(null) }
  }

  const handleFileSelect = e => {
    const file = e.target.files[0]; if (!file) return
    setUploadedFile(file); setFileAnalysis(null)
    if (file.type.startsWith('image/')) {
      const r = new FileReader()
      r.onload = ev => setFilePreview(ev.target.result)
      r.readAsDataURL(file)
    } else setFilePreview(null)
  }
  const handleFileAnalyze = async () => {
    if (!uploadedFile) return
    setAnalyzingFile(true)
    try {
      const fd = new FormData(); fd.append('file', uploadedFile)
      const res = await api.post('/api/notes/upload-analyze', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setFileAnalysis({ summary:res.data.summary, suggestions:res.data.suggestions })
    } catch { toast.error('File analysis failed') }
    finally { setAnalyzingFile(false) }
  }
  const handleSaveWithFile = async () => {
    const content = addEditorRef.current?.innerHTML || newNote.content
    if (!newNote.subject||!newNote.title) { toast.warning('Subject and title required!'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title',newNote.title); fd.append('subject',newNote.subject); fd.append('content',content)
      if (fileAnalysis) { fd.append('summary',fileAnalysis.summary); fd.append('suggestions',JSON.stringify(fileAnalysis.suggestions)) }
      if (uploadedFile) fd.append('file',uploadedFile)
      const res = await api.post('/api/notes/save-with-file', fd, { headers:{'Content-Type':'multipart/form-data'} })
      setNotes(prev => [res.data.note,...prev])
      setUploadedFile(null); setFilePreview(null); setFileAnalysis(null); resetModal()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const resetModal = () => {
    setShowAddModal(false); setNewNote({subject:'',title:'',content:''})
    setAiPreview(null); setUploadedFile(null); setFilePreview(null); setFileAnalysis(null)
  }

  /* ── RENDER ── */
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Notes</h1>
          <p className="text-gray-400 text-sm mt-0.5">Multi-page Word-like editor with AI</p>
        </div>
        <button onClick={()=>setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 shadow-md"
          style={{ background:'linear-gradient(135deg,#0f766e,#14b8a6)' }}>
          <MdAdd size={20}/> Add Note
        </button>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-[200px] shadow-sm">
          <MdSearch className="text-gray-400 flex-shrink-0" size={20}/>
          <input type="text" placeholder="Search notes..." value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"/>
        </div>
        <select value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 outline-none focus:border-teal-400 shadow-sm">
          <option value="All">All Subjects</option>
          {subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-3"/>
          <p className="text-gray-400 text-sm">Loading notes...</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-col lg:flex-row">

          {/* Notes List */}
          <div className="flex flex-col gap-3 lg:w-[320px] flex-shrink-0">
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
                <MdNote className="text-gray-200 mx-auto mb-2" size={40}/>
                <p className="text-gray-400 text-sm">No notes found</p>
              </div>
            ) : filteredNotes.map(note => (
              <div key={note._id} onClick={()=>setSelectedNote(note)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md group ${
                  selectedNote?._id===note._id ? 'border-teal-400 shadow-md' : 'border-gray-100 hover:border-gray-200'
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${subjectColor(note.subject)}`}>
                      {note.subject}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-2 text-sm truncate">{note.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {note.content.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
                    </p>
                  </div>
                  <NoteMenu note={note} onEdit={handleEditOpen} onDelete={handleDelete}
                    onFormat={handleAiFormat} isFormatting={formatting&&formattingNoteId===note._id}/>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </span>
                  <div className="flex items-center gap-2">
                    {note.summary && <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-1"><MdAutoAwesome size={11}/> AI</span>}
                    <button onClick={e=>{e.stopPropagation();openFullScreen(note)}}
                      className="text-[11px] text-teal-500 hover:text-teal-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Editor ↗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="flex-1 min-w-0">
            {!selectedNote ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <MdNote className="text-gray-200" size={32}/>
                </div>
                <p className="text-gray-500 font-semibold">Select a note to view</p>
                <p className="text-gray-300 text-sm mt-1">Click any note from the left list</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${subjectColor(selectedNote.subject)}`}>{selectedNote.subject}</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedNote.title}</h2>
                    <p className="text-xs text-gray-400 mt-1">{new Date(selectedNote.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>openFullScreen(selectedNote)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-all">
                      <MdFullscreen size={15}/> Open Editor
                    </button>
                    <NoteMenu note={selectedNote} onEdit={handleEditOpen} onDelete={handleDelete}
                      onFormat={handleAiFormat} isFormatting={formatting&&formattingNoteId===selectedNote._id}/>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    style={{fontFamily:'Georgia,serif',lineHeight:'1.8'}}
                    dangerouslySetInnerHTML={{__html:selectedNote.content}}/>
                </div>
                <div className="px-6 pb-6">
                  {!selectedNote.summary ? (
                    <button onClick={()=>handleAnalyzeExisting(selectedNote)} disabled={analyzing}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 shadow-md disabled:opacity-70"
                      style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)'}}>
                      {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Analyzing...</> : <><FaBrain size={15}/> Analyze with AI</>}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2"><MdAutoAwesome className="text-teal-500" size={15}/><span className="text-xs font-bold text-teal-700 uppercase tracking-wide">AI Summary</span></div>
                        <p className="text-sm text-teal-700 leading-relaxed">{selectedNote.summary}</p>
                      </div>
                      {selectedNote.suggestions?.length > 0 && (
                        <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2"><FaBrain className="text-violet-500" size={14}/><span className="text-xs font-bold text-violet-700 uppercase tracking-wide">Suggestions</span></div>
                          <ul className="flex flex-col gap-1.5">
                            {selectedNote.suggestions.map((tip,i)=><li key={i} className="text-sm text-violet-700 flex items-start gap-2"><span>💡</span>{tip}</li>)}
                          </ul>
                        </div>
                      )}
                      <button onClick={()=>handleAnalyzeExisting(selectedNote)} disabled={analyzing} className="text-xs text-teal-600 font-semibold hover:underline text-center disabled:opacity-50">🔄 Re-analyze</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN */}
      {fullScreenMode && fullScreenNote && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 min-w-0">
            <WordEditor editNote={editNote} setEditNote={setEditNote}
              onSave={handleFullScreenSave} saving={editSaving} onClose={closeFullScreen} title={fullScreenNote.title}/>
          </div>
          <div className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
            <div className="px-4 py-3 text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)'}}>
              <div className="flex items-center gap-2"><MdAutoAwesome size={16}/><span className="text-sm font-semibold">AI Analysis</span></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {fullScreenNote.summary ? (
                <>
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-2">📋 Summary</p>
                    <p className="text-sm text-teal-700 leading-relaxed">{fullScreenNote.summary}</p>
                  </div>
                  {fullScreenNote.suggestions?.length > 0 && (
                    <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                      <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wider mb-2">💡 Suggestions</p>
                      <ul className="flex flex-col gap-2">{fullScreenNote.suggestions.map((tip,i)=><li key={i} className="text-sm text-violet-700 flex items-start gap-2"><span>•</span>{tip}</li>)}</ul>
                    </div>
                  )}
                  <button onClick={()=>handleAnalyzeExisting(fullScreenNote)} disabled={analyzing}
                    className="py-2 rounded-xl text-xs font-semibold text-teal-600 border border-teal-200 hover:bg-teal-50 transition-all disabled:opacity-50">
                    {analyzing ? 'Analyzing...' : '🔄 Re-analyze'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <p className="text-sm text-gray-400 text-center">Not analyzed yet.</p>
                  <button onClick={()=>handleAnalyzeExisting(fullScreenNote)} disabled={analyzing}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-70"
                    style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)'}}>
                    {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Analyzing...</> : <><FaBrain size={15}/> Analyze</>}
                  </button>
                </div>
              )}
              {fullScreenNote.attachedFile?.mimetype?.startsWith('image/') && (
                <div className="mt-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">📎 Attachment</p>
                  <img src={`data:${fullScreenNote.attachedFile.mimetype};base64,${fullScreenNote.attachedFile.data}`} alt={fullScreenNote.attachedFile.originalName} className="w-full rounded-xl border border-gray-200"/>
                </div>
              )}
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Created</p>
                <p className="text-sm font-medium text-gray-600">{new Date(fullScreenNote.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">Add New Note</h2>
              <button onClick={resetModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"><MdClose size={22}/></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Subject</label>
                  <select value={newNote.subject} onChange={e=>setNewNote(p=>({...p,subject:e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400">
                    <option value="">-- Select --</option>
                    {subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Title</label>
                  <input type="text" placeholder="Note title..." value={newNote.title}
                    onChange={e=>setNewNote(p=>({...p,title:e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Content</label>
                <RibbonToolbar editorRef={addEditorRef}/>
                <div className="bg-gray-100 rounded-xl p-3 mt-1">
                  <div className="bg-white shadow-sm">
                    <div ref={addEditorRef} contentEditable suppressContentEditableWarning spellCheck
                      data-placeholder="Start typing your notes here..."
                      className="outline-none min-h-[160px] p-6 text-sm text-gray-800"
                      style={{fontFamily:'Georgia,serif',lineHeight:'1.85',caretColor:'#0f766e'}}
                      onInput={()=>setNewNote(p=>({...p,content:addEditorRef.current?.innerHTML||''}))}/>
                  </div>
                </div>
              </div>
              <button onClick={handleAiSummarize} disabled={summarizing}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold text-sm hover:bg-teal-50 transition-all disabled:opacity-50">
                {summarizing ? <><div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"/> Generating...</> : <><FaBrain size={14}/> Generate AI Summary (Optional)</>}
              </button>
              {aiPreview && (
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl"><p className="text-xs font-bold text-teal-700 mb-1">✅ AI Summary:</p><p className="text-xs text-teal-600 leading-relaxed">{aiPreview.summary}</p></div>
                  <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl"><p className="text-xs font-bold text-violet-700 mb-1">💡 Suggestions:</p>{aiPreview.suggestions.map((tip,i)=><p key={i} className="text-xs text-violet-600">• {tip}</p>)}</div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">📎 Attach File (Optional)</label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileSelect} className="hidden"/>
                <button type="button" onClick={()=>fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                  {uploadedFile ? `✅ ${uploadedFile.name}` : '📁 Select image or PDF'}
                </button>
                {filePreview && <img src={filePreview} alt="Preview" className="mt-2 w-full h-36 object-cover rounded-xl border border-gray-200"/>}
                {uploadedFile && !filePreview && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <div><p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p><p className="text-xs text-gray-400">{(uploadedFile.size/1024).toFixed(1)} KB</p></div>
                  </div>
                )}
                {uploadedFile && (
                  <button type="button" onClick={handleFileAnalyze} disabled={analyzingFile}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-violet-400 text-violet-600 font-semibold text-sm hover:bg-violet-50 transition-all disabled:opacity-50">
                    {analyzingFile ? <><div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"/> Analyzing...</> : <><FaBrain size={14}/> Analyze File with AI</>}
                  </button>
                )}
                {fileAnalysis && (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl"><p className="text-xs font-bold text-teal-700 mb-1">✅ File Summary:</p><p className="text-xs text-teal-600">{fileAnalysis.summary}</p></div>
                    <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl"><p className="text-xs font-bold text-violet-700 mb-1">💡 Suggestions:</p>{fileAnalysis.suggestions.map((tip,i)=><p key={i} className="text-xs text-violet-600">• {tip}</p>)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={resetModal} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all">Cancel</button>
              {uploadedFile && (
                <button onClick={handleSaveWithFile} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)'}}>
                  {saving ? 'Saving...' : '📎 Save with File'}
                </button>
              )}
              {!aiPreview ? (
                <button onClick={handleSaveNote} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)'}}>
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              ) : (
                <button onClick={handleSaveWithSummary} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)'}}>
                  {saving ? 'Saving...' : '✨ Save with AI'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <WordEditor editNote={editNote} setEditNote={setEditNote}
              onSave={handleEditSave} saving={editSaving} onClose={()=>setShowEditModal(false)} title="Edit Note"/>
          </div>
        </div>
      )}

      <AlertModal isOpen={deleteModalOpen} title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        type="warning" onConfirm={confirmDelete}
        onCancel={()=>{setDeleteModalOpen(false);setNoteToDelete(null)}}
        confirmText="Delete" cancelText="Keep Note"/>

      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false}
        newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light"/>

      <style>{`
        [data-placeholder]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; display: block; }
        .prose table, [contenteditable] table { border-collapse: collapse; width: 100%; }
        .prose td, .prose th, [contenteditable] td { border: 1px solid #e5e7eb; padding: 8px 12px; }
        .prose blockquote, [contenteditable] blockquote { border-left: 4px solid #14b8a6; margin: 12px 0; padding: 10px 16px; background: #f0fdfa; color: #0f766e; border-radius: 0 8px 8px 0; }
        .prose code, [contenteditable] code { background: #1e293b; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New'; font-size: .875em; }
        .prose a, [contenteditable] a { color: #0f766e; text-decoration: underline; }
        [contenteditable] hr { border: none; border-top: 2px solid #e5e7eb; margin: 16px 0; }
        [contenteditable] img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
        .prose img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
      `}</style>
    </div>
  )
}

export default Notes