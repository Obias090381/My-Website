import { getDatabase } from "../src/server/database.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const sql = await getDatabase();
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
