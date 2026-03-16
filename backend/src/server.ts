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
    const userMsg = req.body.message;

    try {
        // 1. Save the user's new message to the database first
        await pool.query('INSERT INTO messages (sender, text) VALUES ($1, $2)', ['User', userMsg]);

        // 2. Fetch the last 10 messages from the database to build the "memory"
        const historyData = await pool.query(
            'SELECT sender, text FROM messages ORDER BY id DESC LIMIT 10'
        );
        
        // The DB sorts them newest first, so we reverse them to read like a normal chat log
        const chronologicalHistory = historyData.rows.reverse();

        // 3. Translate our DB format into the exact format OpenRouter expects
        const openRouterMessages = chronologicalHistory.map((row) => ({
            role: row.sender === 'User' ? 'user' : 'assistant',
            content: row.text
        }));


        console.log("🧠 MEMORY CHECK:", openRouterMessages);


        // 4. Send the entire conversation history to the AI!
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "nvidia/nemotron-3-super-120b-a12b:free", // Or whatever model you are using!
                messages: openRouterMessages
            })
        });

        const data = await response.json();
        const aiReply = data.choices[0].message.content;

        // 5. Save the AI's reply to the database
        await pool.query('INSERT INTO messages (sender, text) VALUES ($1, $2)', ['AI', aiReply]);

        // 6. Send it back to React
        res.json({ reply: aiReply });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to communicate with AI" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});