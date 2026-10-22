import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import register from "../backend/api/register.js";
import { hashPassword, verifyPassword } from "../backend/server/passwords.js";

function createResponse() {
  return {
    headers: {},
    statusCode: undefined,
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("registration rejects missing account fields before database access", async () => {
  const response = createResponse();
  await register({ method: "POST", body: {} }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /required/i);
});

test("registration clearly reports a missing Neon connection", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const response = createResponse();
    await register({
      method: "POST",
      body: { name: "Test Person", email: "test@example.com", password: "password123" },
    }, response);

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /database is not configured/i);
  } finally {
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
  }
});

test("password hashes verify only against their matching password", () => {
  const hash = hashPassword("correct horse battery staple");

  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("incorrect password", hash), false);
  assert.equal(verifyPassword("anything", null), false);
});
