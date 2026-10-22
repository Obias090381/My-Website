import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { Buffer } from "node:buffer";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password, passwordHash) {
  if (typeof passwordHash !== "string") {
    return false;
  }

  const [salt, storedHash] = passwordHash.split(":");
  if (
    !/^[a-f0-9]{32}$/i.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/i.test(storedHash ?? "")
  ) {
    return false;
  }

  const expectedHash = Buffer.from(storedHash, "hex");
  const actualHash = scryptSync(password, salt, expectedHash.length);
  return timingSafeEqual(actualHash, expectedHash);
}

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashPasswordResetToken(token) };
}

export function hashPasswordResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
