import { getDatabase } from "../../src/server/database.js";
import {
  clearSessionCookie,
  getSessionToken,
  hashSessionToken,
} from "../../src/server/sessions.js";

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
    clearSessionCookie(response);
    if (!token) {
      return response.status(200).json({ success: true });
    }

    try {
      const sql = await getDatabase();
      await sql`DELETE FROM user_sessions WHERE token_hash = ${hashSessionToken(token)}`;
      return response.status(200).json({ success: true });
    } catch (error) {
      console.error("Sign-out failed:", error);
      return response.status(500).json({
        success: false,
        message: "Unable to sign out. Please try again.",
      });
    }
  }

  if (!token) {
    return response.status(200).json({ authenticated: false });
  }

  try {
    const sql = await getDatabase();
    const [user] = await sql`
      SELECT users.id, users.name, users.email
      FROM user_sessions
      JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token_hash = ${hashSessionToken(token)}
        AND user_sessions.expires_at > ${Date.now()}
      LIMIT 1
    `;

    if (!user) {
      clearSessionCookie(response);
      return response.status(200).json({ authenticated: false });
    }

    return response.status(200).json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to check the sign-in session.",
    });
  }
}
