import { useState } from "react";
import { createUser, findUserByEmail } from "../users";
import type { UserAccount } from "../users";

interface AuthModalProps {
  onAuthSuccess: (user: UserAccount) => void;
  onClose: () => void;
}

export function AuthModal({ onAuthSuccess, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin) {
        // Sign up
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError("Please enter your email");
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          setError("Please enter a password");
          setLoading(false);
          return;
        }

        const existingUser = findUserByEmail(email);
        if (existingUser) {
          setError("An account with this email already exists");
          setLoading(false);
          return;
        }

        const newUser = createUser(email, password, name);
        onAuthSuccess(newUser);
      } else {
        // Login
        if (!email.trim()) {
          setError("Please enter your email");
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          setError("Please enter your password");
          setLoading(false);
          return;
        }

        const user = findUserByEmail(email);
        if (!user) {
          setError("No account found with this email");
          setLoading(false);
          return;
        }
        if (user.password !== password) {
          setError("Incorrect password");
          setLoading(false);
          return;
        }

        onAuthSuccess(user);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-title">{isLogin ? "Welcome Back" : "Create Account"}</div>
          <div className="auth-modal-subtitle">
            {isLogin ? "Sign in to access your reports" : "Join to start saving on your vehicle purchase"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {!isLogin && (
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Patel"
                autoComplete="name"
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete={isLogin ? "email" : "off"}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "off"}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-modal-switch">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button type="button" className="auth-switch-btn" onClick={() => setIsLogin(false)}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="auth-switch-btn" onClick={() => setIsLogin(true)}>
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="auth-modal-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>Demo mode: No real authentication required</span>
        </div>
      </div>
    </div>
  );
}
