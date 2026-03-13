import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// 1. Load the hidden variables from our .env file
dotenv.config();

const app = express();
const PORT = 5000;

// 2. Set up the Database Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// A simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: "Hello from the Node.js Backend!" });
});

// 3. Update the Chat Route to use PostgreSQL
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // A. Save the user's message to the database
        await pool.query(
            'INSERT INTO messages (sender, text) VALUES ($1, $2)', 
            ['User', userMessage]
        );

        console.log(`Saved to DB: User says "${userMessage}"`);

        // B. Send the response back to React
        res.json({ reply: `Server saved your message: "${userMessage}"` });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to save message to database" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});