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
  const { loginWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const entryRole = useMemo(
    () =>
      location.pathname === "/admin" ||
      new URLSearchParams(location.search).get("role") === "admin"
        ? "admin"
        : "customer",
    [location.pathname, location.search]
  );
  const [role, setRole] = useState(entryRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqItems = [
    {
      q: "How fast is delivery?",
      a: "Most daily orders are delivered in the same day depending on your location and slot availability.",
    },
    {
      q: "Can I save my cart for later?",
      a: "Yes, once signed in your cart stays linked to your account so you can continue shopping anytime.",
    },
    {
      q: "Are products quality checked?",
      a: "Yes. We pick and pack with freshness checks before dispatch.",
    },
  ];

  const targetPath = role === "admin" ? "/admin/dashboard" : "/home";

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    try {
      setIsSubmitting(true);
      await loginWithGoogle({ role });
      navigate(targetPath);
    } catch (error) {
      setErrorMessage(error?.message || "Unable to continue right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="account-page">
        <div className="auth-shell">
          <div className="auth-layout">
            <div className="auth-brand-panel">
              <div className="floating-grocery-icons" aria-hidden="true">
                <span className="g-icon g-icon-1">🍎</span>
                <span className="g-icon g-icon-2">🥦</span>
                <span className="g-icon g-icon-3">🥛</span>
                <span className="g-icon g-icon-4">🍞</span>
              </div>
              <p className="auth-kicker">Welcome to Deep Store</p>
              <h1>Fresh groceries delivered to your doorstep.</h1>
              <p className="auth-subtext">
                Sign in to continue shopping, save your cart, and manage your account seamlessly.
              </p>
              <div className="auth-micro-proof">Trusted by daily shoppers for quality and speed.</div>
            </div>

            <div className="auth-card">
              <div className="form-container unified-auth">
                <p className="auth-title">Sign In</p>
                <h2>{role === "admin" ? "Admin login" : "Customer login"}</h2>
                <div className={`role-slider ${role === "admin" ? "admin" : "customer"}`}>
                  <button
                    type="button"
                    className={`${role === "customer" ? "active" : ""} text-center`}
                    onClick={() => {
                      setRole("customer");
                      setErrorMessage("");
                    }}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    className={`${role === "admin" ? "active" : ""} text-center`}
                    onClick={() => {
                      setRole("admin");
                      setErrorMessage("");
                    }}
                  >
                    Admin
                  </button>
                  <span className="role-slider-pill" />
                </div>
                <div className="auth-form-static">
                  <p className="auth-hint">
                    {role === "admin"
                      ? "Continue with your authorized admin Google account."
                      : "Continue with your Google account to start shopping."}
                  </p>
                  {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
                  <button
                    type="button"
                    className="btn auth-google-btn"
                    disabled={isSubmitting}
                    onClick={handleGoogleLogin}
                  >
                    <i className="fab fa-google"></i>
                    {isSubmitting
                      ? "Signing in..."
                      : `Continue with Google as ${role === "admin" ? "Admin" : "Customer"}`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <section className="interactive-section">
            <div className="section-head">
              <h3>Explore Deep Store</h3>
              <p>Scroll and discover what makes shopping smoother.</p>
            </div>
            <div className="explore-grid">
              <article className="explore-card">
                <span>🥬 Fresh Picks</span>
                <h4>Farm-fresh essentials daily</h4>
                <p>Curated vegetables, fruits, and staples with quality checks.</p>
              </article>
              <article className="explore-card">
                <span>⚡ Fast Checkout</span>
                <h4>Less clicks, faster ordering</h4>
                <p>Smart account flow and personalized cart for quick repeat buys.</p>
              </article>
              <article className="explore-card">
                <span>🎯 Smart Savings</span>
                <h4>Offers where they matter</h4>
                <p>Get better value with practical pricing across everyday categories.</p>
              </article>
            </div>
          </section>

          <section className="interactive-section staggered-bg">
            <div className="section-head">
              <h3>How It Works</h3>
            </div>
            <div className="steps-row">
              <div className="step-item">
                <strong>1</strong>
                <p>Sign in with Google</p>
              </div>
              <div className="step-item">
                <strong>2</strong>
                <p>Add groceries to cart</p>
              </div>
              <div className="step-item">
                <strong>3</strong>
                <p>Place and track order</p>
              </div>
            </div>
          </section>

          <section className="interactive-section">
            <div className="section-head">
              <h3>Quick FAQs</h3>
            </div>
            <div className="faq-list">
              {faqItems.map((item, idx) => (
                <button
                  key={item.q}
                  type="button"
                  className={`faq-item ${openFaqIndex === idx ? "open" : ""}`}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                >
                  <div className="faq-q">
                    <span>{item.q}</span>
                    <span>{openFaqIndex === idx ? "−" : "+"}</span>
                  </div>
                  {openFaqIndex === idx ? <p className="faq-a">{item.a}</p> : null}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
