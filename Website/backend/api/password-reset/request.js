import { getDatabase } from "../../server/database.js";
import { createPasswordResetToken } from "../../server/passwords.js";
import process from "node:process";

const resetTokenLifetime = 30 * 60 * 1000;
const genericMessage =
  "If an account exists for that email, a password reset link will be sent.";

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
      message: "A valid email address is required",
    });
  }

  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    process.env.STORAGE_DATABASE_URL;
  if (!databaseUrl) {
    return response.status(503).json({
      success: false,
      message: "Password recovery is unavailable because the database is not configured.",
    });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.APP_URL;
  if (!resendApiKey || !fromEmail || !appUrl) {
    return response.status(503).json({
      success: false,
      message:
        "Password recovery is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and APP_URL.",
    });
  }

  try {
    const sql = await getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await sql`
      SELECT id, name, email
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (!user) {
      return response.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const { token, tokenHash } = createPasswordResetToken();
    const expiresAt = Date.now() + resetTokenLifetime;
    await sql`
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt})
      ON CONFLICT (user_id)
      DO UPDATE SET token_hash = ${tokenHash}, expires_at = ${expiresAt}
    `;

    const resetUrl = new URL("/", appUrl);
    resetUrl.searchParams.set("token", token);
    const safeName = user.name.replace(/[&<>"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[character]);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: "Reset your password",
        html: `<p>Hello ${safeName},</p><p>Use the link below to set a new password. It expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl.toString()}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      }),
    });

    if (!emailResponse.ok) {
      console.error(
        "Password reset email delivery failed:",
        emailResponse.status
      );
      return response.status(502).json({
        success: false,
        message: "Unable to send the password reset email. Try again later.",
      });
    }

    return response.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to request a password reset",
    });
  }
}
