import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to receive JSON data

// A simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: "Hello from the Node.js Backend!" });
});

// A route to receive a message from the user
app.post('/api/chat', (req, res) => {
    // req.body contains the data React sent us
    const userMessage = req.body.message; 
    
    console.log(`React says: ${userMessage}`);

    // For now, we just echo it back. Later, we will send this to OpenAI!
    res.json({ reply: `I am the Node Server. I heard you say: "${userMessage}"` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});