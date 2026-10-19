const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create or open the SQLite database
const databasePath = path.join(__dirname, "database.sqlite");
const db = new Database(databasePath);

// Create the users table if it does not already exist
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

console.log("Database connected successfully.");

// Home route
app.get("/", (req, res) => {
res.send("Backend server is running.");
});

// Database test route
app.get("/api/db-test", (req, res) => {
try {
const result = db
.prepare("SELECT 1 AS connected")
.get();

res.json({
connected: result.connected === 1,
message: "Database connection is working."
});
} catch (error) {
console.error("Database test failed:", error.message);

res.status(500).json({
connected: false,
error: error.message
});
}
});

// Get all users
app.get("/api/users", (req, res) => {
try {
const users = db
.prepare(`
SELECT id, name, email, created_at
FROM users
ORDER BY id DESC
`)
.all();

res.json(users);
} catch (error) {
console.error("Could not retrieve users:", error.message);

res.status(500).json({
error: "Could not retrieve users."
});
}
});

// Register a new user
app.post("/api/register", (req, res) => {
try {
const { name, email, password } = req.body;

if (!name || !email || !password) {
return res.status(400).json({
success: false,
message: "Name, email, and password are required."
});
}

const existingUser = db
.prepare("SELECT id FROM users WHERE email = ?")
.get(email);

if (existingUser) {
return res.status(409).json({
success: false,
message: "This email is already registered."
});
}

const statement = db.prepare(`
INSERT INTO users (name, email, password)
VALUES (?, ?, ?)
`);

const result = statement.run(name, email, password);

res.status(201).json({
success: true,
message: "User registered successfully.",
userId: result.lastInsertRowid
});
} catch (error) {
console.error("Registration failed:", error.message);

res.status(500).json({
success: false,
message: "Registration failed.",
error: error.message
});
}
});

// Start the server
app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});