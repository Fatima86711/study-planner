import { useState, useRef, useEffect } from "react";

// Helper to generate unique IDs for messages
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: generateId(), role: "assistant", content: "Hi! I am your Study Assistant. How can I help you? 📚" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: generateId(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Clean messages — remove any HTML, keep only plain text
      const cleanMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content.replace(/<[^>]+>/g, "").trim() // Strip HTML tags
      }));

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: "You are a helpful study assistant. Help students with their studies. Give concise and friendly answers in English."
            },
            ...cleanMessages
          ]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Groq API Error:", errData);
        throw new Error(errData.error?.message || "API request failed");
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "Sorry, no response received.";
      setMessages(prev => [...prev, { id: generateId(), role: "assistant", content: botReply }]);

    } catch (error) {
      console.error("ChatBot Error:", error.message);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: "assistant",
        content: `Error: ${error.message}. Please check your API key and try again.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // --- NEW FEATURES ---
  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the entire chat?")) {
      setMessages([{ id: generateId(), role: "assistant", content: "Hi! I am your Study Assistant. How can I help you? 📚" }]);
    }
  };

  const deleteMessage = (idToDelete) => {
    setMessages(prev => prev.filter(msg => msg.id !== idToDelete));
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: "340px", height: "450px", background: "#fff",
          borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", marginBottom: "12px",
          border: "1px solid #e2e8f0", overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            padding: "14px 16px", color: "#fff",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>🤖 Study Assistant</div>
              <div style={{ fontSize: "11px", opacity: 0.85 }}>Always here to help!</div>
            </div>
            
            {/* Header Actions */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={clearChat} 
                disabled={loading}
                title="Clear Chat"
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "#fff", borderRadius: "50%", width: "28px", height: "28px",
                  cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", display: "flex",
                  alignItems: "center", justifyContent: "center", opacity: loading ? 0.5 : 1
                }}
              >
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} style={{
                background: "rgba(255,255,255,0.2)", border: "none",
                color: "#fff", borderRadius: "50%", width: "28px", height: "28px",
                cursor: "pointer", fontSize: "16px", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px",
            display: "flex", flexDirection: "column", gap: "8px",
            background: "#f8fafc"
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                position: "relative",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                background: msg.role === "user" 
                  ? "linear-gradient(135deg, #667eea, #764ba2)" 
                  : "#fff",
                color: msg.role === "user" ? "#fff" : "#2d3748",
                padding: "8px 12px", 
                paddingRight: "28px", // Make space for the delete button
                borderRadius: "12px",
                fontSize: "13px", lineHeight: "1.5",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                wordBreak: "break-word"
              }}>
                {msg.content}
                
                {/* Delete Individual Message Button */}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  title="Delete message"
                  style={{
                    position: "absolute", top: "6px", right: "6px",
                    background: "transparent", border: "none",
                    color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)",
                    cursor: "pointer", fontSize: "10px", 
                    width: "16px", height: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "50%"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = msg.role === "user" ? "#fff" : "#000"}
                  onMouseLeave={e => e.currentTarget.style.color = msg.role === "user" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)"}
                >
                  ✕
                </button>
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start", background: "#fff",
                padding: "8px 14px", borderRadius: "12px",
                fontSize: "20px", border: "1px solid #e2e8f0"
              }}>
                <span style={{ animation: "pulse 1s infinite" }}>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px", borderTop: "1px solid #e2e8f0",
            display: "flex", gap: "8px", background: "#fff"
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: "8px 12px", borderRadius: "20px",
                border: "1px solid #e2e8f0", outline: "none",
                fontSize: "13px", background: "#f8fafc"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none", borderRadius: "50%",
                width: "36px", height: "36px",
                color: "#fff", cursor: "pointer",
                fontSize: "16px", display: "flex",
                alignItems: "center", justifyContent: "center",
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >➤</button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "56px", height: "56px",
          borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "#fff", fontSize: "26px", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(102,126,234,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.15)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(102,126,234,0.7)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(102,126,234,0.5)";
        }}
      >
        {isOpen ? "✕" : "🤖"}
      </button>
    </div>
  );
};

export default ChatBot;