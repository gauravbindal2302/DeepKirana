/*import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import Account from "./Account/Account";

const Header = () => {
  return (
    <div className="header-1">
      <div className="logo">
        <Link to="/">
          <span>Deep Store</span>
        </Link>
        <Link to="/admin">
          <span className="log-reg">Login | Register</span>
        </Link>
      </div>
    </div>
  );
};

const Header1 = () => {
  return (
    <div className="header-1">
      <div className="logo">
        <Link to="/">
          <span>Deep Store</span>
        </Link>
        <Link to="/admin/dashboard">
          <span className="go-to-dashboard">Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

const CRUD = () => {
  return (
    <div className="CRUD">
      <Link to="/admin/dashboard/add">
        <button type="submit" className="CRUD-button">
          Add
        </button>
      </Link>
      <Link to="/admin/dashboard/view">
        <button type="submit" className="CRUD-button">
          View
        </button>
      </Link>
      <Link to="/admin/dashboard/update">
        <button type="submit" className="CRUD-button">
          Update
        </button>
      </Link>
      <Link to="/admin/dashboard/delete">
        <button type="submit" className="CRUD-button">
          Delete
        </button>
      </Link>
    </div>
  );
};
function Admin({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <>
      <div className="admin-page">
        <Account />
      </div>
    </>
  );
}

export { Admin, Header, Header1, CRUD };
*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import Account from "./Account/Account";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="header-1">
      <div className="logo">
        <Link to="/home">
          <span>Deep Store</span>
        </Link>
        {isAuthenticated ? (
          <div className="admin-profile-menu">
            <button
              type="button"
              className="admin-profile-icon-btn"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <i className="fas fa-user-circle"></i>
            </button>
            {showMenu ? (
              <div className="admin-profile-dropdown">
                <p>{user?.name || "User"}</p>
                <Link to={user?.role === "admin" ? "/admin/dashboard" : "/account"}>
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/login?role=customer");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Header1 = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const handleSignOut = () => {
    logout();
    navigate("/login?role=admin");
  };
  return (
    <div className="header-1">
      <div className="logo">
        <Link to="/">
          <span>Deep Store</span>
        </Link>

        <Link to="/admin/dashboard">
          <span className="go-to-dashboard">Go to Dashboard</span>
        </Link>
        <div className="admin-profile-menu">
          <button
            type="button"
            className="admin-profile-icon-btn"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <i className="fas fa-user-circle"></i>
          </button>
          {showMenu ? (
            <div className="admin-profile-dropdown">
              <p>{user?.name || "User"}</p>
              <Link to={user?.role === "admin" ? "/admin/dashboard" : "/account"}>
                My Profile
              </Link>
              <button type="button" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const CRUD = () => {
  return (
    <div className="CRUD">
      <Link to="/admin/dashboard/add">
        <button type="submit" className="CRUD-button">
          Add
        </button>
      </Link>
      <Link to="/admin/dashboard/view">
        <button type="submit" className="CRUD-button">
          View
        </button>
      </Link>
      <Link to="/admin/dashboard/update">
        <button type="submit" className="CRUD-button">
          Update
        </button>
      </Link>
      <Link to="/admin/dashboard/delete">
        <button type="submit" className="CRUD-button">
          Delete
        </button>
      </Link>
    </div>
  );
};
function Admin({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <>
      <div className="admin-page">
        <Account />
      </div>
    </>
  );
}

export { Admin, Header, Header1, CRUD };
