import { getDatabase } from "../server/database.js";
import {
  getSessionToken,
  hashSessionToken,
} from "../server/sessions.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const token = getSessionToken(request);
    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Sign in to view users",
      });
    }

    const sql = await getDatabase();
    const [session] = await sql`
      SELECT user_id
      FROM user_sessions
      WHERE token_hash = ${hashSessionToken(token)}
        AND expires_at > ${Date.now()}
      LIMIT 1
    `;
    if (!session) {
      return response.status(401).json({
        success: false,
        message: "Sign in to view users",
      });
    }

    const users = await sql`SELECT id, name, email FROM users ORDER BY id`;
    return response.status(200).json(users);
  } catch (error) {
    console.error("Fetching users failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
}
