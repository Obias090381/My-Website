import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new Database("./database.sqlite");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL
)
`).run();

app.post("/api/register", (req, res) => {
console.log("Received registration data:", req.body);

const { name, email, password } = req.body;

try {
const result = db.prepare(`
INSERT INTO users (name, email, password)
VALUES (?, ?, ?)
`).run(name, email, password);

res.status(201).json({
message: "User saved successfully",
id: result.lastInsertRowid
});
} catch (error) {
console.error(error);
res.status(500).json({ message: error.message });
}
});

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});
