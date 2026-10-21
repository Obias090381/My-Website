import { getDatabase } from "../../src/server/database.js";
import { verifyPassword } from "../../src/server/passwords.js";
import {
  createSessionToken,
  SESSION_DURATION_MS,
  setSessionCookie,
} from "../../src/server/sessions.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { email, password } = request.body ?? {};
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return response.status(400).json({
      success: false,
      message: "Enter your email and password",
    });
  }

  try {
    const sql = await getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await sql`
      SELECT id, name, email, password_hash
      FROM users
      WHERE lower(email) = ${normalizedEmail}
      LIMIT 1
    `;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return response.status(401).json({
        success: false,
        message: "The email or password is incorrect",
      });
    }

    const { token, tokenHash } = createSessionToken();
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    await sql`
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt})
    `;
    setSessionCookie(response, token, expiresAt);

    return response.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Sign-in failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to sign in. Please try again.",
    });
  }
}
