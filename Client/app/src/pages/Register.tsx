import React, { useState } from "react";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const DARK_PRIMARY_COLOR = "#2B1871";

const Logo = ({ appName = "Register" }) => (
  <h1
    style={{
      fontSize: "28px",
      fontWeight: 700,
      color: DARK_PRIMARY_COLOR,
      marginBottom: "30px",
      fontFamily: "Roboto, sans-serif",
    }}
  >
    {appName}
  </h1>
);

const Register: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const checkPasswordStrength = (pwd: string) => {
    const regexStrong =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const regexMedium =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

    if (regexStrong.test(pwd)) return "Strong";
    if (regexMedium.test(pwd)) return "Medium";
    if (pwd.length > 0) return "Weak";
    return "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordStrength(checkPasswordStrength(val));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (passwordStrength !== "Strong") {
      setError(
        "Password is not strong enough. Use at least 8 characters including uppercase, lowercase, number, and special character."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      if (res.status === 201 || res.data.message === "User registered successfully") {
        const loginRes = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email, password }
        );

        if (loginRes.data.token) {
          localStorage.setItem("token", loginRes.data.token);
          if (loginRes.data.user && loginRes.data.user.name) {
               localStorage.setItem("userName", loginRes.data.user.name);
       }
          history.push("/dashboard");
        } else {
          setError("Registration successful, but automatic login failed.");
        }
      } else {
        setError("Unexpected server response. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.response) {
        if (err.response.status === 409)
          setError("Email already registered.");
        else if (err.response.status === 400)
          setError("Invalid input. Please check your details.");
        else
          setError(err.response.data?.message || "Server error. Please try again later.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordColor = () => {
    if (passwordStrength === "Weak") return "#D93025";
    if (passwordStrength === "Medium") return "#FFA500";
    if (passwordStrength === "Strong") return "#28A745";
    return "";
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F0F3F7",
      fontFamily: "Roboto, Arial, sans-serif",
    },
    card: {
      backgroundColor: "white",
      padding: "40px 50px",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
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
    togglePassword: {
      position: "absolute" as const,
      top: "50%",
      right: "12px",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#6e7781",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: DARK_PRIMARY_COLOR,
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: isLoading ? "not-allowed" : "pointer" as const,
      fontSize: "17px",
      fontWeight: 600,
      opacity: isLoading ? 0.7 : 1,
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
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Logo />

        <form onSubmit={handleRegister}>
          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => (e.currentTarget.style.borderColor = DARK_PRIMARY_COLOR)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#DCE0E6")}
            />
          </div>

          <div style={styles.inputContainer}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => (e.currentTarget.style.borderColor = DARK_PRIMARY_COLOR)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#DCE0E6")}
            />
          </div>

          <div style={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Choose a Strong Password"
              value={password}
              onChange={handlePasswordChange}
              required
              style={styles.input}
              onFocus={(e) => (e.currentTarget.style.borderColor = DARK_PRIMARY_COLOR)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#DCE0E6")}
            />
            <span
              style={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {passwordStrength && (
            <p style={{ color: getPasswordColor(), fontSize: "14px", marginBottom: "20px" }}>
              Password Strength: {passwordStrength}
            </p>
          )}

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? "CREATING ACCOUNT..." : "Register"}
          </button>
        </form>

        <p style={{ ...styles.linkText }}>
          Already have an account?{" "}
          <Link to="/login" style={styles.linkStyle}>
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
