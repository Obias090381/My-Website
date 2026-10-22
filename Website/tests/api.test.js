import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import confirmPasswordReset from "../backend/api/password-reset/confirm.js";
import requestPasswordReset from "../backend/api/password-reset/request.js";
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
  const envNames = [
    "DATABASE_URL",
    "STORAGE_POSTGRES_URL",
    "STORAGE_DATABASE_URL",
  ];
  const previousValues = new Map(
    envNames.map((name) => [name, process.env[name]])
  );
  for (const name of envNames) {
    delete process.env[name];
  }

  try {
    const response = createResponse();
    await register({
      method: "POST",
      body: { name: "Test Person", email: "test@example.com", password: "password123" },
    }, response);

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /database is not configured/i);
  } finally {
    for (const [name, value] of previousValues) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});

test("password hashes verify only against their matching password", () => {
  const hash = hashPassword("correct horse battery staple");

  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("incorrect password", hash), false);
  assert.equal(verifyPassword("anything", null), false);
});

test("password reset request validates email before database access", async () => {
  const response = createResponse();
  await requestPasswordReset({ method: "POST", body: { email: " " } }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /email/i);
});

test("password reset request reports missing email configuration", async () => {
  const envNames = [
    "DATABASE_URL",
    "STORAGE_POSTGRES_URL",
    "STORAGE_DATABASE_URL",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "APP_URL",
  ];
  const previousValues = new Map(
    envNames.map((name) => [
      name,
      process.env[name],
    ])
  );
  for (const name of envNames) {
    delete process.env[name];
  }
  process.env.DATABASE_URL = "postgresql://test.invalid/database";

  try {
    const response = createResponse();
    await requestPasswordReset({
      method: "POST",
      body: { email: "test@example.com" },
    }, response);

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /RESEND_API_KEY/i);
  } finally {
    for (const [name, value] of previousValues) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});

test("password reset request rejects an unsafe application URL", async () => {
  const envNames = [
    "DATABASE_URL",
    "STORAGE_POSTGRES_URL",
    "STORAGE_DATABASE_URL",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "APP_URL",
  ];
  const previousValues = new Map(
    envNames.map((name) => [name, process.env[name]])
  );
  for (const name of envNames) {
    delete process.env[name];
  }
  process.env.DATABASE_URL = "postgresql://test.invalid/database";
  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_FROM_EMAIL = "noreply@example.com";
  process.env.APP_URL = "javascript:alert(1)";

  try {
    const response = createResponse();
    await requestPasswordReset({
      method: "POST",
      body: { email: "test@example.com" },
    }, response);

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /APP_URL/i);
  } finally {
    for (const [name, value] of previousValues) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});

test("password reset confirmation validates token and password before database access", async () => {
  const response = createResponse();
  await confirmPasswordReset({
    method: "POST",
    body: { token: "invalid", password: "short" },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /reset link/i);
});
