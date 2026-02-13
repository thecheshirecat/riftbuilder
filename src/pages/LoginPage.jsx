import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../services/riftbound-api";
import { useToast } from "../components/Toast";
import HeroCards from "../components/HeroCards";
import "./RegisterPage.css"; // Reusing the same styles for consistency

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await api.login(username, password);
      // For now, we'll store the user in localStorage
      localStorage.setItem("riftbound_user", JSON.stringify(user));
      showToast(`Welcome back, ${user.username}!`, "success");
      navigate("/");
      // Force a reload or use a context to update the UI
      window.location.reload();
    } catch (err) {
      showToast(err.message || "Invalid username or password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ position: "relative", overflow: "hidden" }}>
      <HeroCards />
      <div className="auth-card" style={{ position: "relative", zIndex: 2 }}>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">
          Log in to your Riftbuilder account to create and share your decks
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
