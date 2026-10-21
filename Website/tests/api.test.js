import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import register from "../api/register.js";
import login from "../api/auth/login.js";
import session from "../api/auth/session.js";
import requestPasswordReset from "../api/password-reset/request.js";
import confirmPasswordReset from "../api/password-reset/confirm.js";
import listUsers from "../api/users.js";
import { readApiResponse } from "../src/utils/api.js";
import { hashPassword, verifyPassword } from "../src/server/passwords.js";
import {
  createSessionToken,
  getSessionToken,
  hashSessionToken,
} from "../src/server/sessions.js";

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

test("registration rejects unsupported methods", async () => {
  const response = createResponse();
  await register({ method: "GET" }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "POST");
});

test("registration validates required fields before accessing the database", async () => {
  const response = createResponse();
  await register({ method: "POST", body: {} }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /required/i);
});

test("registration explains when Neon is not configured", async () => {
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

test("sign-in validates credentials before accessing the database", async () => {
  const response = createResponse();
  await login({ method: "POST", body: { email: "person@example.com" } }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /email and password/i);
});

test("session lookup reports unauthenticated when no session cookie is present", async () => {
  const response = createResponse();
  await session({ method: "GET", headers: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { authenticated: false });
});

test("session endpoint rejects unsupported methods", async () => {
  const response = createResponse();
  await session({ method: "POST" }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET, DELETE");
});

test("users endpoint rejects requests without a session cookie", async () => {
  const response = createResponse();
  await listUsers({ method: "GET", headers: {} }, response);

  assert.equal(response.statusCode, 401);
  assert.match(response.body.message, /sign in/i);
});

test("password verification accepts only the matching password", () => {
  const passwordHash = hashPassword("correct horse battery staple");

  assert.equal(verifyPassword("correct horse battery staple", passwordHash), true);
  assert.equal(verifyPassword("incorrect password", passwordHash), false);
  assert.equal(verifyPassword("anything", null), false);
});

test("session tokens are hashed and extracted from their cookie", () => {
  const { token, tokenHash } = createSessionToken();

  assert.notEqual(token, tokenHash);
  assert.equal(hashSessionToken(token), tokenHash);
  assert.equal(
    getSessionToken({
      headers: { cookie: `other=value; website_session=${token}; theme=light` },
    }),
    token
  );
});

test("password reset request rejects an empty email before accessing the database", async () => {
  const response = createResponse();
  await requestPasswordReset({ method: "POST", body: { email: "  " } }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /email/i);
});

test("password reset confirmation validates the token and password", async () => {
  const response = createResponse();
  await confirmPasswordReset({
    method: "POST",
    body: { token: "", password: "short" },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /reset link/i);
});

test("empty 405 responses produce an actionable API routing message", async () => {
  await assert.rejects(
    readApiResponse(new Response("", { status: 405 })),
    /Vercel API route rejected this request/
  );
});
