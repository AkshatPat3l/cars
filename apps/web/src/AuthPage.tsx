import { useState } from "react";
import { api, setToken } from "./api.ts";

export function AuthPage({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { token } = await api.login({ email, password });
        setToken(token);
      } else {
        const { token } = await api.register({ email, password, name });
        setToken(token);
      }
      onAuthed();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === "login" ? "Sign In" : "Sign Up"}</h1>
        {mode === "register" && (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={mode === "register" ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-brand" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <p className="switch">
          {mode === "login" ? (
            <>New to StreamForge? <a href="#" onClick={(e) => { e.preventDefault(); setMode("register"); setError(null); }}>Sign up now</a></>
          ) : (
            <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode("login"); setError(null); }}>Sign in</a></>
          )}
        </p>
        <div className="copy">
          Demo login: <code>demo@streamforge.dev</code> / <code>demo1234</code>
        </div>
      </form>
    </div>
  );
}