import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../../services/riftbound-api";
import { useToast } from "../../components/Toast/index";
import HeroCards from "../../components/HeroCards/index";
import Layout from "../../components/Layout/index";
import "./RegisterPage.scss";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validations
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      showToast("Username must be between 3 and 20 characters", "error");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      showToast(
        "Username can only contain letters, numbers, and underscores",
        "error",
      );
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      await api.register(trimmedUsername, password);
      showToast("Account created successfully! Please login.", "success");
      navigate("/");
    } catch (err) {
      showToast(err.message || "Error creating account", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <HeroCards />
      <div className="auth-layout">
        <div className="auth-card">
          <h2>Join the Rift</h2>
          <p className="auth-subtitle">
            Create your account to start building decks
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button className="auth-button" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
