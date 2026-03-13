import { useState, useEffect } from 'react';

function App() {
  // 1. STATE
  const [serverMessage, setServerMessage] = useState("Waiting for backend...");
  const [inputText, setInputText] = useState(""); // Stores what the user types
  const [chatReply, setChatReply] = useState(""); // Stores the server's reply

  // 2. INITIAL CONNECTION (GET)
  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(res => res.json())
      .then(data => setServerMessage(data.message));
  }, []);

  // 3. SEND MESSAGE FUNCTION (POST)
  const handleSendMessage = async () => {
    // We use 'await' to pause the code until the server responds
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: inputText }) // Turn our text into JSON
    });

    const data = await response.json();
    setChatReply(data.reply); // Save the server's reply into our state
  };

  // 4. THE UI
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>My First AI Stack 🚀</h1>
      <p style={{ color: 'green' }}>Backend Status: {serverMessage}</p>
      
      <hr style={{ margin: '30px 0' }}/>

      <h3>Test the Chat:</h3>
      <input 
        type="text" 
        value={inputText} 
        onChange={(e) => setInputText(e.target.value)} 
        placeholder="Type a message..."
        style={{ padding: '10px', width: '300px', marginRight: '10px' }}
      />
      <button onClick={handleSendMessage} style={{ padding: '10px 20px' }}>
        Send to Server
      </button>

      {/* Only show this box if we actually have a reply */}
      {chatReply && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
          <strong>Server Reply:</strong> {chatReply}
        </div>
      )}
    </div>
  );
}

export default App;