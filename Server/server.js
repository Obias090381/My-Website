const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Open or create the SQLite database
const db = new Database("database.sqlite");

// Create a users table
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE
)
`).run();

// Test route
app.get("/", (req, res) => {
res.send("Server is running successfully");
});

// Get all users
app.get("/api/users", (req, res) => {
const users = db
.prepare("SELECT * FROM users ORDER BY id DESC")
.all();

res.json(users);
});

// Add a user
app.post("/api/users", (req, res) => {
const { name, email } = req.body;

if (!name || !email) {
return res.status(400).json({
error: "Name and email are required"
});
}

try {
const result = db
.prepare("INSERT INTO users (name, email) VALUES (?, ?)")
.run(name, email);

res.status(201).json({
id: result.lastInsertRowid,
name,
email
});
} catch (error) {
res.status(400).json({
error: "This email may already be registered"
});
}
});

// Start the server
app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});