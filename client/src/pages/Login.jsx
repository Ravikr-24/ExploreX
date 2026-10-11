import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import { setCredentials } from "../redux/authSlice";

import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      dispatch(
        setCredentials({
          token: response.data.token,
          user: response.data.user,
        })
      );
      navigate(from, { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        {/* Header */}
        <header className="login-header">
          <p className="login-label">
            WELCOME BACK
          </p>

          <h1>Login to ExploreX</h1>

          <p>
            Sign in to continue exploring
            destinations and planning your next
            adventure.
          </p>
        </header>

        {/* Form */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <div className="login-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="login-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="login-error">
              ⚠️ {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <div className="login-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Login;