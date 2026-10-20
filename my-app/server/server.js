const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const { randomBytes, scryptSync } = require("node:crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new Database("./database.sqlite");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE
)
`).run();

const userColumns = db.pragma("table_info(users)");

if (!userColumns.some((column) => column.name === "password_hash")) {
  db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
}

app.get("/", (req, res) => {
res.json({
success: true,
message: "Server is running"
});
});

app.get("/api/db-test", (req, res) => {
try {
db.prepare("SELECT 1").get();

res.json({
success: true,
message: "Database is connected"
});
} catch (error) {
console.error(error);
res.status(500).json({
success: false,
error: error.message
});
}
});

app.post("/api/register", (req, res) => {
const { name, email, password } = req.body;

if (!name || !email || !password) {
return res.status(400).json({
success: false,
message: "Name, email, and password are required"
});
}

if (typeof password !== "string" || password.length < 8) {
return res.status(400).json({
success: false,
message: "Password must be at least 8 characters"
});
}

try {
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const statement = db.prepare(`
INSERT INTO users (name, email, password_hash)
VALUES (?, ?, ?)
`);

const result = statement.run(name, email, passwordHash);

res.status(201).json({
success: true,
message: "User registered successfully",
id: result.lastInsertRowid
});
} catch (error) {
console.error("Database error:", error.message);

if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
return res.status(409).json({
success: false,
message: "An account with this email already exists"
});
}

res.status(500).json({
success: false,
message: "Unable to register user"
});
}
});

app.get("/api/users", (req, res) => {
try {
const users = db.prepare("SELECT id, name, email FROM users").all();
res.json(users);
} catch (error) {
res.status(500).json({
success: false,
error: error.message
});
}
});

app.listen(PORT, () => {
console.log(`Server is running at http://localhost:${PORT}`);
});