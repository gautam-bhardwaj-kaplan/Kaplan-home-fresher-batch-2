import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loginImage from "../assets/images/login.png";
import "./styles/Login.css"; 

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.status === 200) {
        history.push("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mainContainer">
      <div
        className="imagePanel"
        style={{ backgroundImage: `url(${loginImage})` }}
      ></div>

      <div className="loginPanel">
        <div className="card">
          <h1 className="loginTitle">Login</h1>

          <form onSubmit={handleLogin}>
            <div className="inputContainer">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="inputContainer">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
              <span
                className="eyeIcon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <p className="errorText">{error}</p>}

            <button
              type="submit"
              className="button"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="linkText">
            Don't have an account?{" "}
            <Link to="/register" className="linkStyle">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
