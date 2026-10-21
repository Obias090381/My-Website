import { getDatabase } from "../server/database.js";

export default async function handler(_request, response) {
  try {
    const sql = await getDatabase();
    await sql`SELECT 1`;
    return response.status(200).json({
      success: true,
      message: "Database is connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to connect to the database",
    });
  }
}
