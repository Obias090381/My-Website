import { useState } from "react";
import "./App.css";

const unavailableMessage =
  "Account services are not connected yet. Your information was not sent or saved.";

function App() {
  const [mode, setMode] = useState("signup");
  const [message, setMessage] = useState("");

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      mode === "signup" &&
      event.currentTarget.elements.password.value !==
        event.currentTarget.elements.confirmPassword.value
    ) {
      setMessage("The passwords do not match.");
      return;
    }

    setMessage(
      mode === "reset"
        ? "Password reset is not available yet. No email was sent."
        : unavailableMessage
    );
  };

  return (
    <main className="entry-page">
      <section className="entry-card" aria-labelledby="entry-title">
        <div className="entry-brand">
          <span className="entry-brand__mark" aria-hidden="true">✦</span>
          <p>A Priest’s Journey</p>
          <span className="entry-brand__rule" />
        </div>

        <div className="entry-intro">
          <span className="entry-eyebrow">Faith, Vision and Service</span>
          <h1 id="entry-title">
            {mode === "signup"
              ? "Create your account"
              : mode === "signin"
                ? "Welcome back"
                : "Reset your password"}
          </h1>
          <p>
            {mode === "signup"
              ? "Sign up to continue to the website."
              : mode === "signin"
                ? "Sign in to continue to the website."
                : "Enter your email and we’ll send a password-reset link when account services are available."}
          </p>
        </div>

        {mode !== "reset" && (
          <div className="entry-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => changeMode("signup")}
            >
              Sign up
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => changeMode("signin")}
            >
              Sign in
            </button>
          </div>
        )}

        <form className="entry-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="entry-name-fields">
              <label>
                Last name
                <input
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                />
              </label>
              <label>
                Given name
                <input
                  name="givenName"
                  type="text"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="entry-name-fields__middle">
                Middle initial
                <input
                  name="middleInitial"
                  type="text"
                  autoComplete="additional-name"
                  maxLength={1}
                  pattern="[A-Za-z]"
                  title="Enter one letter."
                  required
                />
              </label>
            </div>
          )}

          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          {mode !== "reset" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              {mode === "signup" && (
                <span className="entry-hint">Use at least 8 characters.</span>
              )}
            </label>
          )}

          {mode === "signup" && (
            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          <button className="entry-submit" type="submit">
            {mode === "signup"
              ? "Create account"
              : mode === "signin"
                ? "Sign in"
                : "Send reset link"}
          </button>
        </form>

        {mode === "signin" && (
          <p className="entry-secondary-action">
            <button type="button" onClick={() => changeMode("reset")}>
              Forgot your password?
            </button>
          </p>
        )}
        {mode === "reset" && (
          <p className="entry-secondary-action">
            <button type="button" onClick={() => changeMode("signin")}>
              Back to sign in
            </button>
          </p>
        )}
        {mode === "signup" && (
          <p className="entry-terms">
            Your full name includes your given name, middle initial, and last name.
          </p>
        )}

        <p className="entry-status" role="status" aria-live="polite">
          {message || "Account setup is pending. Form submissions do not save or send your details."}
        </p>
      </section>
    </main>
  );
}

export default App;
