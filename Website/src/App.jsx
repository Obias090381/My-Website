import { useState } from "react";
import "./App.css";

function App() {
  const [mode, setMode] = useState("signup");

  const handleSubmit = (event) => {
    event.preventDefault();
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
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p>
            {mode === "signup"
              ? "Sign up to continue to the website."
              : "Sign in to continue to the website."}
          </p>
        </div>

        <div className="entry-tabs" role="tablist" aria-label="Account options">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
        </div>

        <form className="entry-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Name
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={mode === "signup" ? 8 : undefined}
              required
            />
            {mode === "signup" && (
              <span className="entry-hint">Use at least 8 characters.</span>
            )}
          </label>

          <button className="entry-submit" type="submit">
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="entry-status" role="status" aria-live="polite">
          Account setup is pending. Form submissions do not save or send your details.
        </p>
      </section>
    </main>
  );
}

export default App;
