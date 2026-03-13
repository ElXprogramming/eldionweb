-- Blueprint for the AI Chat database

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(50),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
