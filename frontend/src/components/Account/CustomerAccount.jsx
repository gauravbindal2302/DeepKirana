import React from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function CustomerAccount() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  if (!isAuthenticated || user?.role !== "customer") {
    return <Navigate to="/login?role=customer" replace />;
  }

  return (
    <>
      <Navbar noOfItems={itemCount} />
      <div className="small-container" style={{ minHeight: "60vh", paddingTop: "40px" }}>
        <h2>My Account</h2>
        <p>
          <strong>Name:</strong> {user.name || "Customer"}
        </p>
        <p>
          <strong>Mobile:</strong> {user.mobileNumber}
        </p>
        <p>
          <strong>Role:</strong> Customer
        </p>
        <p>
          <strong>Cart Items:</strong> {itemCount}
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <Link to="/cart">
            <button type="button" className="AddToCart">
              Go to Cart
            </button>
          </Link>
          <button type="button" className="AddToCart" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
