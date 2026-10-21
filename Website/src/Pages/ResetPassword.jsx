import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiBaseUrl, readApiResponse } from "../utils/api";

function ResetPassword() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const handleRequest = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/password-reset/request`, {
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

  const handleConfirm = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/password-reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await readApiResponse(response);
      setMessage(result.message);
      setIsResetComplete(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAnotherLink = () => {
    setSearchParams({});
    setMessage("");
    setIsError(false);
  };

  return (
    <main>
      <h2>Reset Password</h2>
      {token ? (
        <>
          {isResetComplete ? (
            <p>
              Your password has been reset. <Link to="/">Return to the website</Link>.
            </p>
          ) : (
            <>
              <p>Choose a new password. It must be at least 8 characters.</p>
              <form onSubmit={handleConfirm}>
                <label>
                  New password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Set new password"}
                </button>
              </form>
              <button type="button" onClick={requestAnotherLink}>
                Request another reset link
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <p>Enter the email address associated with your account.</p>
          <form onSubmit={handleRequest}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </>
      )}
      {message && (
        <p role="status" aria-live="polite" className={isError ? "error" : undefined}>
          {message}
        </p>
      )}
    </main>
  );
}

export default ResetPassword;
