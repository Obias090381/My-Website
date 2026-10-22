import "./App.css";

function App() {
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
          <h1 id="entry-title">Create your account</h1>
          <p>Sign up to continue to the website.</p>
        </div>

        <form className="entry-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
              required
            />
            <span className="entry-hint">Use at least 8 characters.</span>
          </label>

          <button className="entry-submit" type="submit">
            Create account
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
