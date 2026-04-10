/*import React, { useState } from "react";
import "./Account.css";
import axios from "axios";
import Dashboard from "../Dashboard/Dashboard";
import { Header } from "../Admin";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const navigate = useNavigate();
  const [isLoginVisible, setLoginVisible] = useState(true);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [token, setToken] = useState("");

  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: "",
    forgotPassword: "",
  });

  const handleLogin = (userToken) => {
    setToken(userToken);
    navigate("/admin/dashboard");
  };

  const handleChange = async (event) => {
    const { name, value } = event.target;
    setAdmin({
      ...admin,
      [name]: value,
    });
  };

  const login = () => {
    setLoginVisible(true);
    const { email, password, forgotPassword } = admin;
    if (forgotPasswordMode && email && forgotPassword) {
    } else if (!forgotPasswordMode && email && password) {
      axios
        .post(`${SERVER_URL}/login`, admin)
        .then((res) => {
          handleLogin(res.data.token);
        })
        .catch((error) => {
          handleAPIError(error);
        });
    } else {
      alert("Please fill in all fields!");
    }
  };

  const register = () => {
    setLoginVisible(false);
    const { username, email, password } = admin;
    if (!username || !email || !password) {
      alert("Please fill in all fields!");
    } else {
      axios
        .post(`${SERVER_URL}/register`, admin)
        .then((res) => {
          alert(res.data.message);
          setLoginVisible(true);
        })
        .catch((error) => {
          handleAPIError(error);
        });
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordMode(true);
  };

  function resetForm() {
    setAdmin({
      username: "",
      email: "",
      password: "",
      forgotPassword: "",
    });
  }

  const handleAPIError = (error) => {
    if (error.response && error.response.data && error.response.data.error) {
      alert(error.response.data.error);
    } else {
      alert("An error occurred. Please try again later.");
    }
    console.error(error);
    resetForm();
  };

  return (
    <>
      {token ? (
        <Dashboard />
      ) : (
        <>
          <Header />
          <div className="account-page">
            <div className="container">
              <div className="row account-row">
                <div className="col-12 col-lg-6">
                  <img alt="" src="Images/image-1.png" width="100%" />
                </div>
                <div className="col-12 col-lg-6">
                  <div className="form-container">
                    <div className="form-btn">
                      <span
                        onClick={() => {
                          setLoginVisible(true);
                          resetForm();
                        }}
                      >
                        Login
                      </span>
                      <span
                        onClick={() => {
                          setLoginVisible(false);
                          resetForm();
                        }}
                      >
                        Register
                      </span>
                      <hr
                        className="Indicator"
                        style={{
                          transform:
                            "translateX(" + (isLoginVisible ? 0 : 100) + "px)",
                        }}
                      />
                    </div>
                    {isLoginVisible ? (
                      <form>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your Email"
                          value={admin.email}
                          onChange={handleChange}
                        />
                        {forgotPasswordMode ? (
                          <div className="forgot">
                            <label id="forgot-label">New Password</label>
                            <input
                              name="forgotPassword"
                              value={admin.forgotPassword}
                              onChange={handleChange}
                              type="password"
                              placeholder="Enter New Password"
                            />
                          </div>
                        ) : (
                          <input
                            name="password"
                            value={admin.password}
                            onChange={handleChange}
                            type="password"
                            placeholder="Enter your Password"
                          />
                        )}
                        <button type="button" className="btn" onClick={login}>
                          {forgotPasswordMode ? "Submit" : "Login"}
                        </button>
                        {!forgotPasswordMode && (
                          <div className="forgot-password">
                            <button onClick={handleForgotPasswordClick}>
                              Forgot Password
                            </button>
                          </div>
                        )}
                      </form>
                    ) : (
                      <form>
                        <input
                          type="name"
                          name="username"
                          placeholder="Enter your Name"
                          value={admin.username}
                          onChange={handleChange}
                        />
                        <input
                          type="name"
                          name="email"
                          placeholder="Enter your Email"
                          value={admin.email}
                          onChange={handleChange}
                        />
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter your Password"
                          value={admin.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="btn"
                          onClick={register}
                        >
                          Submit
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
*/

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Account.css";
import { Header } from "../Admin";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const { requestOtp, verifyOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = useMemo(
    () =>
      new URLSearchParams(location.search).get("role") === "admin"
        ? "admin"
        : "customer",
    [location.search]
  );
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpPreview, setDevOtpPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const targetPath = role === "admin" ? "/admin/dashboard" : "/account";

  const handleRequestOtp = async () => {
    setErrorMessage("");
    try {
      setIsSubmitting(true);
      const response = await requestOtp({ mobileNumber, role });
      setDevOtpPreview(response?.devOtp || "");
      setOtpSent(true);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || "Unable to continue right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    try {
      setIsSubmitting(true);
      await verifyOtp({ mobileNumber, role, otp, name });
      navigate(targetPath);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || "Unable to continue right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="account-page">
        <div className="container">
          <div className="row account-row">
            <div className="col-12 col-lg-6">
              <img alt="" src="Images/image-1.png" width="100%" />
            </div>
            <div className="col-12 col-lg-6">
              <div className="form-container unified-auth">
                <h3 style={{ marginBottom: "10px" }}>Login via Mobile</h3>
                <div className="role-switch">
                  <button
                    type="button"
                    className={role === "customer" ? "active" : ""}
                    onClick={() => {
                      setRole("customer");
                      setOtp("");
                      setOtpSent(false);
                      setDevOtpPreview("");
                      setErrorMessage("");
                    }}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    className={role === "admin" ? "active" : ""}
                    onClick={() => {
                      setRole("admin");
                      setOtp("");
                      setOtpSent(false);
                      setDevOtpPreview("");
                      setErrorMessage("");
                    }}
                  >
                    Admin
                  </button>
                </div>
                <form className="auth-form-static" onSubmit={handleVerifyOtp}>
                  {role === "customer" ? (
                    <input
                      type="text"
                      placeholder="Your Name (for first login)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : null}
                  <input
                    type="tel"
                    placeholder="10-digit Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                  />
                  {otpSent ? (
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                    />
                  ) : null}
                  {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
                  {!otpSent ? (
                    <button
                      type="button"
                      className="btn"
                      disabled={isSubmitting || mobileNumber.length !== 10}
                      onClick={handleRequestOtp}
                    >
                      {isSubmitting ? "Sending OTP..." : "Send OTP"}
                    </button>
                  ) : (
                    <>
                      {devOtpPreview ? (
                        <p className="auth-error" style={{ color: "#1f6a1f" }}>
                          Dev OTP: {devOtpPreview}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        className="btn"
                        disabled={isSubmitting || otp.length !== 6}
                      >
                        {isSubmitting
                          ? "Verifying..."
                          : `Verify OTP and Login as ${role === "admin" ? "Admin" : "Customer"}`}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
