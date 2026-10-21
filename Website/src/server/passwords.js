import {
  createHash,
  randomBytes,
  scryptSync,
} from "node:crypto";
import process from "node:process";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function getAppUrl() {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    return /^https?:\/\//i.test(configuredUrl)
      ? configuredUrl
      : `https://${configuredUrl}`;
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercelUrl ? `https://${vercelUrl}` : "http://localhost:5173";
}
