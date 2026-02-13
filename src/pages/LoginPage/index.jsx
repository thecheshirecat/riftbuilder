import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../../services/riftbound-api";
import { useToast } from "../../components/Toast/index";
import HeroCards from "../../components/HeroCards/index";
import Layout from "../../components/Layout/index";
import "./LoginPage.scss";

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
    <div className="login-page">
      <HeroCards />
      <div className="auth-layout">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">
            Log in to your Riftbuilder account to create and share your decks
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
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

            <button className="auth-button" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
