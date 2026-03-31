
const Note = require('../models/Note');
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── SAVE NOTE — without AI ─────────────────────────────────────────────────
const saveNote = async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Please provide title, subject and content' });
    }

    const note = await Note.create({
      user: req.user.id,
      title,
      subject,
      content,
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GENERATE AI SUMMARY (NO SAVE) ────────────────────────────────────────
const summarizeNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Please provide content to summarize' });
    }

    // Groq API call (using Llama 3 model)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an intelligent study assistant. Your job is to summarize the student's notes and provide study tips.
          Always respond in strict JSON format. No extra text.
          Format should be:
          {
            "summary": "concise summary of the notes - 3 to 5 sentences",
            "suggestions": ["tip 1", "tip 2", "tip 3"]
          }`
        },
        {
          role: "user",
          content: content
        }
      ],
      model: "llama-3.1-8b-instant", // Fast and free model
      temperature: 0.5,
      response_format: { type: "json_object" } // This ensures output is JSON only
    });

    // Extract response
    const responseText = chatCompletion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('AI response is empty');
    }

    // Parse JSON
    const parsed = JSON.parse(responseText);

    res.status(200).json({
      success: true,
      summary: parsed.summary,
      suggestions: parsed.suggestions || [],
    });

  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ message: 'Server error or AI generation failed', error: error.message });
  }
};

// ─── SAVE NOTE WITH AI SUMMARY ─────────────────────────────────────────────
const saveNoteWithSummary = async (req, res) => {
  try {
    const { title, subject, content, summary, suggestions } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Please provide title, subject and content' });
    }

    const note = await Note.create({
      user: req.user.id,
      title,
      subject,
      content,
      summary: summary || null,
      suggestions: suggestions || [],
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE NOTE ─────────────────────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();

    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET ALL NOTES ──────────────────────────────────────────────────────────
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// ─── NOTE UPDATE (EDIT) ───────────────────────────────────────────────────────
// Route:  PUT /api/notes/:id
// Access: Private
const updateNote = async (req, res) => {
  try {
    const { title, subject, content } = req.body
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id })

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    note.title = title || note.title
    note.subject = subject || note.subject
    note.content = content || note.content
    await note.save()

    res.status(200).json({ success: true, note })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ─── AI FORMAT NOTE ───────────────────────────────────────────────────────────
// Route:  POST /api/notes/format
// Access: Private
const formatNote = async (req, res) => {
  try {
    const { content, title, subject } = req.body

    if (!content) {
      return res.status(400).json({ message: 'Content required' })
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a note formatting assistant. Format student notes to be clear, organized, and easy to study from. Keep all original information — just improve structure and clarity. Return only the formatted content without extra commentary.'
        },
        {
          role: 'user',
          content: `Please format these ${subject || 'Study'} notes about "${title || 'Untitled'}":\n\n${content}`
        }
      ],
      temperature: 0.4,
      max_tokens: 1200,
    })

    const formattedContent = response.choices[0]?.message?.content || content

    res.status(200).json({ success: true, formattedContent })

  } catch (error) {
    console.error('Format note error:', error)
    res.status(500).json({ message: 'Format failed', error: error.message || 'Unknown error' })
  }
}

// Add to exports
module.exports = { saveNote, summarizeNote, saveNoteWithSummary, getMyNotes, updateNote, formatNote, deleteNote }