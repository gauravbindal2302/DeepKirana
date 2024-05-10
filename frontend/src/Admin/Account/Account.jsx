import React, { useState } from "react";
import "./Account.css";
import axios from "axios";
import Dashboard from "../Dashboard/Dashboard";
import { Header } from "../Admin";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const navigate = useNavigate();
  const [isLoginVisible, setLoginVisible] = useState(true);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [token, setToken] = useState("");

  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: "",
    forgotPassword: "", // Add forgotPassword field
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
      forgotPassword: "", // Reset forgotPassword field
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
