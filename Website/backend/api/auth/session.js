import { getDatabase } from "../../server/database.js";
import {
  clearSessionCookie,
  getSessionToken,
  hashSessionToken,
} from "../../server/sessions.js";
import process from "node:process";

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "DELETE") {
    response.setHeader("Allow", "GET, DELETE");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const token = getSessionToken(request);
  if (request.method === "DELETE") {
    if (
      token &&
      (process.env.DATABASE_URL ||
        process.env.STORAGE_POSTGRES_URL ||
        process.env.STORAGE_DATABASE_URL)
    ) {
      try {
        const sql = await getDatabase();
        await sql`
          DELETE FROM user_sessions
          WHERE token_hash = ${hashSessionToken(token)}
        `;
      } catch (error) {
        console.error("Signing out failed:", error);
        return response.status(500).json({
          success: false,
          message: "Unable to sign out",
        });
      }
    }

    clearSessionCookie(response);
    return response.status(200).json({ authenticated: false });
  }

  if (!token) {
    return response.status(200).json({ authenticated: false });
  }

  if (
    !process.env.DATABASE_URL &&
    !process.env.STORAGE_POSTGRES_URL &&
    !process.env.STORAGE_DATABASE_URL
  ) {
    return response.status(503).json({
      success: false,
      message: "Session verification is unavailable because the database is not configured.",
    });
  }

  try {
    const sql = await getDatabase();
    const [session] = await sql`
      SELECT users.id, users.name, users.email
      FROM user_sessions
      JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token_hash = ${hashSessionToken(token)}
        AND user_sessions.expires_at > ${Date.now()}
      LIMIT 1
    `;

    return response.status(200).json(
      session
        ? { authenticated: true, user: session }
        : { authenticated: false }
    );
  } catch (error) {
    console.error("Session lookup failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to verify session",
    });
  }
}
