const express = require('express');
const router = express.Router();
const { saveNote, summarizeNote, saveNoteWithSummary, getMyNotes, updateNote, formatNote, deleteNote } = require('../controllers/notesController')

const { protect } = require('../middleware/authMiddleware');

router.post('/save', protect, saveNote);
router.post('/summarize', protect, summarizeNote);
router.post('/save-with-summary', protect, saveNoteWithSummary);
router.get('/my-notes', protect, getMyNotes);
router.delete('/:id', protect, deleteNote);

router.put('/:id', protect, updateNote)        // ← Edit
router.post('/format', protect, formatNote)
module.exports = router;