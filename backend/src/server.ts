import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load hidden variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Set up AI (Configured for OpenRouter)
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.use(cors());
app.use(express.json());


// Fetch all past messages from the database
app.get('/api/messages', async (req, res) => {
    try {
        // Fetch everything, ordered by oldest to newest
        const result = await pool.query('SELECT * FROM messages ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ error: "Database error" });
    }
});


// The Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // 1. Save the USER's message to the database
        await pool.query(
            'INSERT INTO messages (sender, text) VALUES ($1, $2)', 
            ['User', userMessage]
        );

        // 2. Ask the AI for a response
        // We are using a free Llama 3 model here for testing, but you can change this later!
        const aiResponse = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-lite",
            messages: [
                { role: "system", content: "You are a helpful, concise AI assistant." },
                { role: "user", content: userMessage }
            ],
        });

        // Extract the actual text from the AI's reply
        const botReply = aiResponse.choices[0].message.content;

        // 3. Save the AI's reply to the database
        await pool.query(
            'INSERT INTO messages (sender, text) VALUES ($1, $2)', 
            ['AI', botReply]
        );

        // 4. Send the AI's reply back to your React frontend
        res.json({ reply: botReply });

    } catch (error) {
        console.error("AI or Database Error:", error);
        res.status(500).json({ error: "Something went wrong in the backend." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});