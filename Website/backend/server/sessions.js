import { createHash, randomBytes } from "node:crypto";
import process from "node:process";

export const SESSION_COOKIE_NAME = "website_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function createSessionToken() {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionToken(request) {
  const cookieHeader = request.headers?.cookie;
  if (typeof cookieHeader !== "string") {
    return undefined;
  }

  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  return sessionCookie?.slice(SESSION_COOKIE_NAME.length + 1) || undefined;
}

export function setSessionCookie(response, token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`
  );
}

export function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
  );
}
