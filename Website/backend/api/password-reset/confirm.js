import { getDatabase } from "../../server/database.js";
import {
  hashPassword,
  hashResetToken,
} from "../../server/passwords.js";

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
    !token ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return response.status(400).json({
      success: false,
      message: "A valid reset link and a password of at least 8 characters are required",
    });
  }

  try {
    const sql = await getDatabase();
    const [updatedUser] = await sql`
      WITH consumed AS (
        DELETE FROM password_reset_tokens
        WHERE token_hash = ${hashResetToken(token)}
          AND expires_at > ${Date.now()}
        RETURNING user_id
      ), updated AS (
        UPDATE users
        SET password_hash = ${hashPassword(password)}
        WHERE id = (SELECT user_id FROM consumed)
        RETURNING id
      ), revoked_sessions AS (
        DELETE FROM user_sessions
        WHERE user_id = (SELECT id FROM updated)
        RETURNING user_id
      )
      SELECT id FROM updated
    `;

    if (!updatedUser) {
      return response.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    console.error("Password reset confirmation failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to reset the password. Please try again.",
    });
  }
}
