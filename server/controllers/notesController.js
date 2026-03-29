
const Note = require('../models/Note');
const Groq = require('groq-sdk');

// Groq client initialize karein
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── NOTE SAVE KARO — BINA AI ─────────────────────────────────────────────────
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

// ─── AI SUMMARY GENERATE KARO (GEMINI SE) — SAVE NAHI ─────────────────────────
const summarizeNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Please provide content to summarize' });
    }

    // Groq API call (Llama 3 model use kar rahe hain)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Tu ek intelligent study assistant hai. Tera kaam student ke notes ko summarize karna aur study tips dena hai. 
          Hamesha strictly JSON format mein jawab do. Koi extra text nahi.
          Format yeh hona chahiye:
          {
            "summary": "notes ki concise summary — 3 to 5 sentences",
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
      response_format: { type: "json_object" } // Yeh ensure karega ke output sirf JSON ho
    });

    // Response extract karo
    const responseText = chatCompletion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('AI response is empty');
    }

    // JSON ko parse karo
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

// ─── NOTE SAVE KARO — AI SUMMARY KE SAATH ─────────────────────────────────────
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

// ─── SAARE NOTES LAO ──────────────────────────────────────────────────────────
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { saveNote, summarizeNote, saveNoteWithSummary, getMyNotes };