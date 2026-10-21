import { getDatabase, isUniqueViolation } from "../server/database.js";
import { hashPassword } from "../server/passwords.js";
import process from "node:process";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { name, email, password } = request.body ?? {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return response.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  if (password.length < 8) {
    return response.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  if (!process.env.DATABASE_URL) {
    return response.status(503).json({
      success: false,
      message: "Account registration is unavailable because the database is not configured.",
    });
  }

  try {
    const sql = await getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name.trim()}, ${normalizedEmail}, ${hashPassword(password)})
      RETURNING id
    `;

    return response.status(201).json({
      success: true,
      message: "User registered successfully",
      id: user.id,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return response.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Registration failed:", error);
    return response.status(500).json({
      success: false,
      message: "Unable to register user",
    });
  }
}
