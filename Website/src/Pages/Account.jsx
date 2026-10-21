import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { readApiResponse } from "../utils/api";
import "./Account.css";

function Account() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          signal: controller.signal,
        });
        const result = await readApiResponse(response);
        setUser(result.authenticated ? result.user : null);
      } catch (error) {
        if (error.name !== "AbortError") {
          setIsError(true);
          setMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();
    return () => controller.abort();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    const registering = mode === "register";
    try {
      const response = await fetch(
        registering ? "/api/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            registering ? { name, email, password } : { email, password }
          ),
        }
      );
      const result = await readApiResponse(response);

      if (registering) {
        setMode("signin");
        setName("");
        setPassword("");
        setMessage("Your account has been created. Sign in with your email and password.");
      } else {
        const destination =
          location.state?.from?.pathname?.startsWith("/") &&
          !location.state.from.pathname.startsWith("//")
            ? `${location.state.from.pathname}${location.state.from.search ?? ""}`
            : "/";
        setUser(result.user);
        setPassword("");
        navigate(destination, { replace: true });
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetRequest = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await readApiResponse(response);
      setMessage(result.message);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      await readApiResponse(response);
      setUser(null);
      setMode("signin");
      setMessage("You have been signed out.");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  };

  return (
    <main className="account-page">
      <section className="account-card" aria-labelledby="account-title">
        <div className="account-card__intro">
          <span className="account-card__eyebrow">A Priest’s Journey</span>
          <h2 id="account-title">
            {user ? "Your account" : mode === "reset" ? "Reset password" : "Welcome"}
          </h2>
          <p>
            {user
              ? "You are signed in to your account."
              : mode === "reset"
                ? "Enter your account email and we’ll send you a password reset link."
              : "Sign in or create an account to continue."}
          </p>
        </div>

        {isLoading ? (
          <p className="account-message" role="status">Checking your sign-in…</p>
        ) : user ? (
          <div className="account-signed-in">
            <p className="account-signed-in__name">{user.name}</p>
            <p className="account-signed-in__email">{user.email}</p>
            <button
              className="account-button"
              type="button"
              onClick={handleSignOut}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : mode === "reset" ? (
          <form
            className="account-form"
            onSubmit={handlePasswordResetRequest}
          >
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <button className="account-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
            <button
              className="account-text-button"
              type="button"
              onClick={() => selectMode("signin")}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <>
            <div className="account-tabs" role="tablist" aria-label="Account options">
              <button
                id="signin-tab"
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                aria-controls="account-form"
                onClick={() => selectMode("signin")}
              >
                Sign in
              </button>
              <button
                id="register-tab"
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                aria-controls="account-form"
                onClick={() => selectMode("register")}
              >
                Create account
              </button>
            </div>

            <form id="account-form" className="account-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  minLength={mode === "register" ? 8 : undefined}
                  required
                />
                {mode === "register" && (
                  <span className="account-form__hint">Use at least 8 characters.</span>
                )}
              </label>
              <button className="account-button" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "register" ? "Creating account…" : "Signing in…"
                  : mode === "register" ? "Create account" : "Sign in"}
              </button>
            </form>

            {mode === "signin" && (
              <p className="account-reset-link">
                <button
                  className="account-text-button"
                  type="button"
                  onClick={() => selectMode("reset")}
                >
                  Forgot your password?
                </button>
              </p>
            )}
          </>
        )}

        {message && (
          <p
            className={`account-message${isError ? " account-message--error" : ""}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default Account;
