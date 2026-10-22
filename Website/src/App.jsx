import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Contact from "./Pages/Contact";
import FOEucharist from "./Pages/FOEucharist";
import Home from "./Pages/Home";
import Ministries from "./Pages/Ministries";
import PastoralVisitation from "./Pages/Pastoral Visitation";
import "./App.css";

async function readApiResponse(response) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : `The request failed (HTTP ${response.status}).`
    );
  }
  return result;
}

function Site({ user, onSignOut }) {
  return (
    <>
      <header>
        <section className="intro">
          <h1 className="main-title">
            <span>A PRIEST&apos;S JOURNEY: </span>
            <br />
            Faith, Vision and Service
          </h1>
        </section>
        <p className="subtitle">
          An unofficial website for the Parishes of St. Mary&apos;s in Winneconne
          &amp; Omro, Wisconsin, USA. This is an unofficial website created
          solely to help inform and support the parish community about the
          pastor&apos;s journey, vision and goals for the parish. It is not an
          official website of the Parishes of St. Mary&apos;s in Winneconne &amp;
          Omro, Wisconsin, USA or any affiliated organization. The information
          provided is for general informational purposes only and may not
          represent official statements, policies or decisions of the parish.
          For official information, please consult the parish&apos;s authorized
          communication channel.
        </p>
      </header>

      <nav className="navbar" aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/FOEucharist">FOEucharist</Link>
        <Link to="/Pastoral%20Visitation">Pastoral Visitation</Link>
        <Link to="/Ministries">Ministries</Link>
        <Link to="/Contact">Contact Us</Link>
        <span className="signed-in-name">{user.name}</span>
        <button className="sign-out-button" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/FOEucharist" element={<FOEucharist />} />
        <Route path="/Pastoral Visitation" element={<PastoralVisitation />} />
        <Route path="/Ministries" element={<Ministries />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function AccountEntry({ onAuthenticated, resetToken }) {
  const [mode, setMode] = useState(() => resetToken ? "confirm-reset" : "signup");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");

    try {
      if (
        (mode === "signup" || mode === "confirm-reset") &&
        password !== formData.get("confirmPassword")
      ) {
        setMessage("The passwords do not match.");
        return;
      }

      if (mode === "request-reset") {
        const response = await fetch("/api/password-reset/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = await readApiResponse(response);
        setMessage(result.message);
        return;
      }

      if (mode === "confirm-reset") {
        const response = await fetch("/api/password-reset/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resetToken, password }),
        });
        const result = await readApiResponse(response);
        window.history.replaceState({}, "", window.location.pathname);
        setMode("signin");
        setMessage(result.message);
        return;
      }

      const isSignup = mode === "signup";
      const response = await fetch(
        isSignup ? "/api/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
        }
      );
      const result = await readApiResponse(response);

      if (isSignup) {
        setMode("signin");
        setMessage(result.message);
      } else {
        onAuthenticated(result.user);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
                : mode === "request-reset"
                  ? "Reset your password"
                  : "Choose a new password"}
          </h1>
          <p>
            {mode === "signup"
              ? "Sign up to continue to the website."
              : mode === "signin"
                ? "Sign in to continue to the website."
                : mode === "request-reset"
                  ? "Enter your email and we’ll send a reset link if an account matches."
                  : "Your reset link is ready. Choose a new password below."}
          </p>
        </div>

        {(mode === "signup" || mode === "signin") && (
          <div className="entry-tabs" role="tablist" aria-label="Account options">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              Sign up
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => {
                setMode("signin");
                setMessage("");
              }}
            >
              Sign in
            </button>
          </div>
        )}

        <form className="entry-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Name
              <input name="name" type="text" autoComplete="name" required />
            </label>
          )}
          {mode !== "confirm-reset" && (
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
          )}
          {(mode === "signup" || mode === "signin" || mode === "confirm-reset") && (
            <label>
              {mode === "confirm-reset" ? "New password" : "Password"}
              <input
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={mode === "signin" ? undefined : 8}
                required
              />
              {mode === "signup" && (
                <span className="entry-hint">Use at least 8 characters.</span>
              )}
            </label>
          )}
          {(mode === "signup" || mode === "confirm-reset") && (
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
          <button className="entry-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "signup"
                ? "Creating account…"
                : mode === "request-reset"
                  ? "Sending link…"
                  : mode === "confirm-reset"
                    ? "Saving password…"
                    : "Signing in…"
              : mode === "signup"
                ? "Create account"
                : mode === "request-reset"
                  ? "Send reset link"
                  : mode === "confirm-reset"
                    ? "Set new password"
                    : "Sign in"}
          </button>
        </form>
        {mode === "signin" && (
          <p className="entry-secondary-action">
            <button
              type="button"
              onClick={() => {
                setMode("request-reset");
                setMessage("");
              }}
            >
              Forgot your password?
            </button>
          </p>
        )}
        {(mode === "request-reset" || mode === "confirm-reset") && (
          <p className="entry-secondary-action">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage("");
                if (mode === "confirm-reset") {
                  window.history.replaceState({}, "", window.location.pathname);
                }
              }}
            >
              Back to sign in
            </button>
          </p>
        )}
        <p className="entry-status" role="status" aria-live="polite">
          {message || "Sign-up and sign-in are handled by the account backend."}
        </p>
      </section>
    </main>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const resetToken = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          signal: controller.signal,
        });
        const result = await readApiResponse(response);
        setUser(result.authenticated ? result.user : null);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSessionError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();
    return () => controller.abort();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      await readApiResponse(response);
      setUser(null);
    } catch (error) {
      setSessionError(error.message);
    }
  };

  if (isCheckingSession) {
    return <main className="entry-page" role="status">Checking your session…</main>;
  }

  return (
    <BrowserRouter>
      {user && !resetToken ? (
        <Site user={user} onSignOut={handleSignOut} />
      ) : (
        <AccountEntry onAuthenticated={setUser} resetToken={resetToken} />
      )}
      {sessionError && (
        <p className="session-error" role="alert">{sessionError}</p>
      )}
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
