const express = require('express');
const router = express.Router();
const {
  saveNote,
  summarizeNote,
  saveNoteWithSummary,
  getMyNotes,
  updateNote,
  formatNote,
  deleteNote,
  uploadAndAnalyzeFile,
  saveNoteWithFile,
  extractFromFile
} = require('../controllers/notesController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// File upload + AI analyze
router.post('/upload-analyze', protect, upload.single('file'), uploadAndAnalyzeFile);

// Note with file save
router.post('/save-with-file', protect, upload.single('file'), saveNoteWithFile);

router.post('/save', protect, saveNote);
router.post('/summarize', protect, summarizeNote);
router.post('/save-with-summary', protect, saveNoteWithSummary);
router.get('/my-notes', protect, getMyNotes);
router.delete('/:id', protect, deleteNote);

router.put('/:id', protect, updateNote)        // ← Edit
router.post('/format', protect, formatNote)
module.exports = router;