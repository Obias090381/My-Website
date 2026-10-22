import { getDatabase } from "../../server/database.js";
import {
  hashPassword,
  hashPasswordResetToken,
} from "../../server/passwords.js";
import process from "node:process";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { token, password } = request.body ?? {};
  if (
    typeof token !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(token) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return response.status(400).json({
      success: false,
      message: "A valid reset link and password of at least 8 characters are required.",
    });
  }

  if (
    !process.env.DATABASE_URL &&
    !process.env.STORAGE_POSTGRES_URL &&
    !process.env.STORAGE_DATABASE_URL
  ) {
    return response.status(503).json({
      success: false,
      message: "Password recovery is unavailable because the database is not configured.",
    });
  }

  try {
    const sql = await getDatabase();
    const passwordHash = hashPassword(password);
    const tokenHash = hashPasswordResetToken(token);
    const updatedUsers = await sql`
      WITH valid_token AS (
        DELETE FROM password_reset_tokens
        WHERE token_hash = ${tokenHash}
          AND expires_at > ${Date.now()}
        RETURNING user_id
      ),
      updated_user AS (
        UPDATE users
        SET password_hash = ${passwordHash}
        WHERE id IN (SELECT user_id FROM valid_token)
        RETURNING id
      ),
      revoked_sessions AS (
        DELETE FROM user_sessions
        WHERE user_id IN (SELECT id FROM updated_user)
        RETURNING id
      )
      SELECT id FROM updated_user
    `;

    if (updatedUsers.length === 0) {
      return response.status(400).json({
        success: false,
        message: "This password reset link is invalid or has expired.",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Your password has been reset. Please sign in.",
    });
  } catch (error) {
    console.error("Password reset confirmation failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
}
