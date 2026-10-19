const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new Database("database.sqlite");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE
)
`).run();

app.get("/", (req, res) => {
res.send("Server is running");
});

app.post("/api/register", (req, res) => {
const { name, email } = req.body;

if (!name || !email) {
return res.status(400).json({
success: false,
message: "Name and email are required."
});
}

try {
const statement = db.prepare(`
INSERT INTO users (name, email)
VALUES (?, ?)
`);

const result = statement.run(name, email);

res.status(201).json({
success: true,
message: "Information saved successfully.",
userId: result.lastInsertRowid
});
} catch (error) {
console.error("Database error:", error.message);

if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
return res.status(409).json({
success: false,
message: "This email is already registered."
});
}

res.status(500).json({
success: false,
message: "Could not save information."
});
}
});

app.get("/api/users", (req, res) => {
const users = db.prepare("SELECT id, name, email FROM users").all();
res.json(users);
});

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});