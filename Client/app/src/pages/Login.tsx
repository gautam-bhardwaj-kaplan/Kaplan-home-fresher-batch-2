import React, { useState } from "react";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const Logo = () => (
  <h1 style={{ 
    fontSize: '28px', 
    fontWeight: 700, 
    color: '#2B1871', 
    marginBottom: '30px', 
    fontFamily: 'Roboto, sans-serif' 
  }}>
    <span style={{ color: '#FF7F47' }}></span>Login
  </h1>
);

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
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        history.push("/quizzes");
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

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F0F3F7", 
      fontFamily: 'Roboto, Arial, sans-serif', 
    },
    card: {
      backgroundColor: "white",
      padding: "40px 50px",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)", 
      width: "420px",
      textAlign: "center" as const,
    },
    inputContainer: {
      position: "relative" as const,
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px 40px 12px 15px", 
      borderRadius: "8px",
      border: "1px solid #DCE0E6",
      fontSize: "16px",
      boxSizing: "border-box" as const,
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    },
    eyeIcon: {
      position: "absolute" as const,
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#6e7781",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#2B1871", 
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: isLoading ? "not-allowed" : "pointer" as const,
      fontSize: "17px",
      fontWeight: 600,
      opacity: isLoading ? 0.7 : 1,
      transition: "background-color 0.3s ease", 
    },
    errorText: {
      color: "#D9534F", 
      marginBottom: "20px",
      backgroundColor: "#FEEAEB",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #D9534F",
      fontSize: "14px",
    },
    linkText: {
      marginTop: "25px",
      fontSize: "15px",
      color: "#6e7781", 
    },
    linkStyle: {
      color: "#FF7F47", 
      textDecoration: "none",
      fontWeight: 600,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Logo /> 
        <form onSubmit={handleLogin}>
          <div style={styles.inputContainer}>
            <input
              type="email"
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2B1871'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#DCE0E6'}
            />
          </div>
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.currentTarget.style.borderColor = '#2B1871'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#DCE0E6'}
            />
            <span style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            type="submit"
            style={styles.button}
            disabled={isLoading} 
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1F115C'; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2B1871'; }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        

        <p style={styles.linkText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.linkStyle}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
