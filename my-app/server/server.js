const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const {
  createHash,
  randomBytes,
  scryptSync,
} = require("node:crypto");

const app = express();
const PORT = Number(process.env.PORT || 5000);

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

db.exec(`
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL
)
`);

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
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
const passwordHash = hashPassword(password);
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

app.post("/api/password-reset/request", async (req, res) => {
  const { email } = req.body ?? {};

  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Enter the email address for your account",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.error("Password reset email is not configured");
    return res.status(503).json({
      success: false,
      message: "Password reset email is not configured. Contact the site administrator.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare(
    "SELECT id, email FROM users WHERE lower(email) = ?"
  ).get(normalizedEmail);

  if (user) {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000;
    const resetUrl = new URL(
      `/reset-password?token=${encodeURIComponent(token)}`,
      process.env.APP_URL || "http://localhost:5173"
    ).toString();

    try {
      db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(user.id);
      db.prepare(`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `).run(user.id, tokenHash, expiresAt);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [user.email],
          subject: "Reset your password",
          text: `Use this link within one hour to reset your password:\n\n${resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
        }),
      });

      if (!emailResponse.ok) {
        const errorDetails = await emailResponse.text();
        console.error("Resend email error:", emailResponse.status, errorDetails);
        db.prepare("DELETE FROM password_reset_tokens WHERE token_hash = ?").run(tokenHash);
        return res.status(502).json({
          success: false,
          message: "Unable to send the reset email. Please try again later.",
        });
      }
    } catch (error) {
      db.prepare("DELETE FROM password_reset_tokens WHERE token_hash = ?").run(tokenHash);
      console.error("Password reset request error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to request a password reset. Please try again later.",
      });
    }
  }

  return res.json({
    success: true,
    message: "If an account exists for that email, a password reset link has been sent.",
  });
});

app.post("/api/password-reset/confirm", (req, res) => {
  const { token, password } = req.body ?? {};

  if (typeof token !== "string" || !token ||
      typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "A valid reset link and a password of at least 8 characters are required",
    });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const reset = db.prepare(`
    SELECT id, user_id FROM password_reset_tokens
    WHERE token_hash = ? AND expires_at > ?
  `).get(tokenHash, Date.now());

  if (!reset) {
    return res.status(400).json({
      success: false,
      message: "This reset link is invalid or has expired. Request a new one.",
    });
  }

  try {
    const updatePassword = db.transaction(() => {
      const currentReset = db.prepare(`
        SELECT id, user_id FROM password_reset_tokens
        WHERE token_hash = ? AND expires_at > ?
      `).get(tokenHash, Date.now());

      if (!currentReset) {
        return false;
      }

      const result = db.prepare(
        "UPDATE users SET password_hash = ? WHERE id = ?"
      ).run(hashPassword(password), currentReset.user_id);

      if (result.changes !== 1) {
        return false;
      }

      db.prepare("DELETE FROM password_reset_tokens WHERE id = ?").run(currentReset.id);
      return true;
    });

    if (!updatePassword()) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }

    return res.json({
      success: true,
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to reset the password. Please try again.",
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