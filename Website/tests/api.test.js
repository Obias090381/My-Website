import assert from "node:assert/strict";
import test from "node:test";
import register from "../api/register.js";
import requestPasswordReset from "../api/password-reset/request.js";
import confirmPasswordReset from "../api/password-reset/confirm.js";
import { readApiResponse } from "../src/utils/api.js";

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
