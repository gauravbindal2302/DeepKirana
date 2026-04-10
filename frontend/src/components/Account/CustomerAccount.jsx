import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./CustomerAccount.css";

export default function CustomerAccount() {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const { user, isAuthenticated, logout, updateMyProfile } = useAuth();
  const { itemCount } = useCart();
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      setIsSaving(true);
      await updateMyProfile({ name });
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error?.response?.data?.error || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") {
      return;
    }
    async function fetchRecentOrders() {
      try {
        const response = await axios.get(`${SERVER_URL}/orders/customer`, {
          params: { email: user?.email || "", userId: user?.id || "" },
        });
        setRecentOrders((response.data || []).slice(0, 3));
      } catch (_error) {
        setRecentOrders([]);
      }
    }
    if (user?.email || user?.id) {
      fetchRecentOrders();
    }
  }, [SERVER_URL, isAuthenticated, user?.email, user?.id, user?.role]);

  if (!isAuthenticated || user?.role !== "customer") {
    return <Navigate to="/login?role=customer" replace />;
  }

  return (
    <>
      <Navbar noOfItems={itemCount} />
      <div className="customer-account-page">
        <div className="customer-account-grid">
          <section className="account-card profile-summary-card">
            <div className="avatar-circle">{(user.name || "U").charAt(0).toUpperCase()}</div>
            <h2>{user.name || "Customer"}</h2>
            <p>{user.email || "No email available"}</p>
            <span className="role-chip">Customer</span>
          </section>

          <section className="account-card">
            <h3>Quick Access</h3>
            <div className="quick-actions">
              <Link to="/cart">
                <button type="button" className="AddToCart">
                  Cart ({itemCount})
                </button>
              </Link>
              <Link to="/orders">
                <button type="button" className="AddToCart">
                  My Orders
                </button>
              </Link>
              <button type="button" className="AddToCart" onClick={logout}>
                Logout
              </button>
            </div>
          </section>

          <section className="account-card edit-profile-card">
            <h3>Edit Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <label htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button type="submit" className="AddToCart" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              {message ? <p className="profile-message">{message}</p> : null}
            </form>
          </section>

          <section className="account-card">
            <h3>Account Security</h3>
            <ul className="security-list">
              <li>Your account is protected by Google sign-in.</li>
              <li>Cart is stored separately for each logged-in user.</li>
              <li>Private pages redirect to login if session expires.</li>
            </ul>
          </section>

          <section className="account-card">
            <h3>Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="recent-order-empty">
                No recent linked orders yet. Place an order while logged in.
              </p>
            ) : (
              <div className="recent-order-list">
                {recentOrders.map((order) => (
                  <div key={order._id} className="recent-order-item">
                    <p>#{String(order._id).slice(-8)}</p>
                    <span>{order.orderStatus}</span>
                  </div>
                ))}
                <Link to="/orders" className="recent-order-view-all">
                  View all orders
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
