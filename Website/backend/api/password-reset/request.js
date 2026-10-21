import process from "node:process";
import { getDatabase } from "../../server/database.js";
import {
  createResetToken,
  getAppUrl,
} from "../../server/passwords.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { email } = request.body ?? {};
  if (typeof email !== "string" || !email.trim()) {
    return response.status(400).json({
      success: false,
      message: "Enter the email address for your account",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.error("Password reset email is not configured");
    return response.status(503).json({
      success: false,
      message: "Password reset email is not configured. Contact the site administrator.",
    });
  }

  let sql;
  let pendingTokenHash;
  try {
    sql = await getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await sql`
      SELECT id, email FROM users WHERE lower(email) = ${normalizedEmail}
    `;

    if (user) {
      const { token, tokenHash } = createResetToken();
      pendingTokenHash = tokenHash;
      const expiresAt = Date.now() + 60 * 60 * 1000;
      const resetUrl = new URL(
        `/account?token=${encodeURIComponent(token)}`,
        getAppUrl()
      ).toString();

      await sql`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (${user.id}, ${tokenHash}, ${expiresAt})
        ON CONFLICT (user_id)
        DO UPDATE SET
          token_hash = EXCLUDED.token_hash,
          expires_at = EXCLUDED.expires_at
      `;

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
        await sql`DELETE FROM password_reset_tokens WHERE token_hash = ${tokenHash}`;
        pendingTokenHash = undefined;
        return response.status(502).json({
          success: false,
          message: "Unable to send the reset email. Please try again later.",
        });
      }

      pendingTokenHash = undefined;
    }

    return response.status(200).json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    if (sql && pendingTokenHash) {
      try {
        await sql`DELETE FROM password_reset_tokens WHERE token_hash = ${pendingTokenHash}`;
      } catch (cleanupError) {
        console.error("Failed to remove the unused password reset token:", cleanupError);
      }
    }
    console.error("Password reset request failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to request a password reset. Please try again.",
    });
  }
}
