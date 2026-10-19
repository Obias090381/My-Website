const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new Database("./database.sqlite");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL,UNIQUE 
password TEXT NOT NULL
)
`).run();

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
console.log("Received data:", req.body);

const { name, email, password } = req.body;

if (!name || !email || !password) {
return res.status(400).json({
success: false,
message: "Name, email and password are required"
});
}

try {
const statement = db.prepare(`
INSERT INTO users (name, email, password)
VALUES (?, ?, ?)
`);

const result = statement.run(name, email, password);

res.status(201).json({
success: true,
message: "User registered successfully",
id: result.lastInsertRowid
});
} catch (error) {
console.error("Database error:", error.message);

res.status(500).json({
success: false,
message: error.message
});
}
});

app.get("/api/users", (req, res) => {
try {
const users = db.prepare("SELECT * FROM users").all();
res.json(users);
} catch (error) {
console.error(error);
res.status(500).json({
    message: "Could not retrieve users"
    ,
success: false,
error: error.message
});
}
});

app.listen(PORT, () => {
console.log(`Server is running at http://localhost:${PORT}`);
});