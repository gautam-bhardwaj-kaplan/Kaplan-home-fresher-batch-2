import React, { useState } from "react";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Snackbar, Alert } from "@mui/material";
import "./styles/Register.css";
import api from "../api/axiosConfig";

const PASSWORD_STRENGTH = {
  STRONG: "Strong",
  MEDIUM: "Medium",
  WEAK: "Weak",
  EMPTY: "",
} as const;

const Register: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const checkPasswordStrength = (pwd: string) => {
    const regexStrong =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const regexMedium =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

    if (regexStrong.test(pwd)) return PASSWORD_STRENGTH.STRONG;
    if (regexMedium.test(pwd)) return PASSWORD_STRENGTH.MEDIUM;
    if (pwd.length > 0) return PASSWORD_STRENGTH.WEAK;
    return PASSWORD_STRENGTH.EMPTY;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordStrength(checkPasswordStrength(val));
  };

  const validateName = (value: string) => {
    if (!/^[A-Za-z\s]+$/.test(value)) {
      setNameError("Name should contain only letters and spaces.");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateEmail = (value: string) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);

    if (!isNameValid || !isEmailValid) return;

    if (passwordStrength !== "Strong") {
      setPasswordError(
        "Password is not strong enough. Use at least 8 characters including uppercase, lowercase, number, and special character."
      );
      return;
    } else {
      setPasswordError("");
    }

    setIsLoading(true);

    try {
      const res = await api.post(
        "/auth/register",{ name, email, password }
      );

      if (res.status === 201 || res.data.message === "User registered successfully") {
        setOpenSnackbar(true);
        setTimeout(() => history.push("/login"), 1700);
      } else {
        setPasswordError("Unexpected server response. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setPasswordError(
        err.response?.data?.message || "Server error. Please try again later."
      );
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

  return (
    <div className="registerContainer">
      <div className="registerCard">
        <h1 className="registerTitle">Register</h1>

        <form onSubmit={handleRegister}>
          <div className="inputContainer">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              onBlur={() => validateName(name)}
            />
            {nameError && <p className="errorText">{nameError}</p>}
          </div>

          <div className="inputContainer">
            <input
              type="text"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              onBlur={() => validateEmail(email)}
            />
            {emailError && <p className="errorText">{emailError}</p>}
          </div>

          <div className="inputContainer">
         <div className="passwordWrapper">
          <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="input"
           />
         <span
           className="togglePassword"
           onClick={() => setShowPassword(!showPassword)}
         >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>

       {passwordStrength && (
        <p className="passwordStrength" style={{ color: getPasswordColor() }}>
          Password Strength: {passwordStrength}
       </p>
  )}
  {passwordError && <p className="errorText">{passwordError}</p>}
</div>


          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? "CREATING ACCOUNT..." : "Register"}
          </button>
        </form>

        <p className="linkText">
          Already have an account?{" "}
          <Link to="/login" className="linkStyle">
            Login Here
          </Link>
        </p>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
       <Alert
         onClose={handleSnackbarClose}
         severity="success"
         className="snackbarAlert"
        >
          User registered successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Register;
