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

function AccountEntry({ onAuthenticated }) {
  const [mode, setMode] = useState("signup");
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
      const response = await fetch(
        mode === "signup" ? "/api/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "signup" ? { name, email, password } : { email, password }
          ),
        }
      );
      const result = await readApiResponse(response);

      if (mode === "signup") {
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

        <form className="entry-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Name
              <input name="name" type="text" autoComplete="name" required />
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
          <button className="entry-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "signup" ? "Creating account…" : "Signing in…"
              : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
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
      {user ? (
        <Site user={user} onSignOut={handleSignOut} />
      ) : (
        <AccountEntry onAuthenticated={setUser} />
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
