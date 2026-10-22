import { createHash, randomBytes } from "node:crypto";
import process from "node:process";

const cookieName = "website_session";
const sessionLifetime = 30 * 24 * 60 * 60 * 1000;

export function createSessionToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionToken(request) {
  const cookieHeader = request.headers?.cookie;
  if (typeof cookieHeader !== "string") {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...value] = cookie.trim().split("=");
    if (name === cookieName) {
      return value.join("=") || null;
    }
  }

  return null;
}

export function setSessionCookie(response, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(sessionLifetime / 1000)}${secure}`
  );
}

export function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
  );
}

export function getSessionExpiry() {
  return Date.now() + sessionLifetime;
}
