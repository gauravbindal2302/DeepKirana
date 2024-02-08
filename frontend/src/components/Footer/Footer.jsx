import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <>
      <div className="footer">
        <div className="container">
          <div id="footer-row">
            <div className="footer-col-1">
              <div className="footer-logo">
                <NavLink to="/">
                  <span>Deep Store</span>
                </NavLink>
              </div>
            </div>
            <div className="footer-col-2">
              <h3>Follow Us</h3>
              <ul>
                <li>
                  <a href="/">
                    <i className="fa-brands fa-facebook" />
                  </a>
                </li>
                <li>
                  <a href="/">
                    <i className="fa-brands fa-twitter" />
                  </a>
                </li>
                <li>
                  <a href="/">
                    <i className="fa-brands fa-instagram" />
                  </a>
                </li>
                <li>
                  <a href="/">
                    <i className="fa-brands fa-youtube" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <hr />
          <p className="copyright">
            Copyright 2023 - Deep Store | Developed by{" "}
            <a className="developer" href="mailto:gb2302bindal@gmail.com">
              Gaurav Bindal
            </a>
          </p>
          <Link to="/admin" className="admin-in-footer">
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </>
  );
}
