import { useState, useEffect } from 'react';

// Define the shape of our message data
type Message = {
  id?: number;
  sender: string;
  text: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 1. Fetch chat history when the page loads
  useEffect(() => {
    fetch('https://eldion-backend.onrender.com/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Could not load history", err));
  }, []);

  // 2. Handle sending a new message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return; // Don't send empty messages

    const userMsg = inputText;
    setInputText(""); // Clear the input box instantly
    setIsTyping(true);

    // Optimistically add the user's message to the screen right away
    setMessages(prev => [...prev, { sender: 'User', text: userMsg }]);

    try {
      // Send to backend
      const response = await fetch('https://eldion-backend.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await response.json();
      
      // Add the AI's reply to the screen
      setMessages(prev => [...prev, { sender: 'AI', text: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Allow pressing "Enter" to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>AI Assistant</h2>
      
      {/* The Chat Window */}
      <div style={{ 
        height: '500px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px', 
        overflowY: 'auto',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'User';
          return (
            <div key={index} style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              backgroundColor: isUser ? '#007bff' : '#e9ecef',
              color: isUser ? 'white' : 'black',
              padding: '10px 15px',
              borderRadius: '18px',
              maxWidth: '75%',
              lineHeight: '1.4'
            }}>
              {msg.text}
            </div>
          );
        })}
        
        {/* Loading indicator */}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
            AI is typing...
          </div>
        )}
      </div>

      {/* The Input Area */}
      <div style={{ display: 'flex', marginTop: '15px', gap: '10px' }}>
        <input 
          type="text" 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isTyping}
          style={{ 
            padding: '12px 20px', 
            backgroundColor: isTyping ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: isTyping ? 'not-allowed' : 'pointer'
          }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;