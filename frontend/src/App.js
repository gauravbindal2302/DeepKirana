/*import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Products from "./components/Products/Products";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Cart from "./components/Cart/Cart";
import OrderConfirmation from "./components/OrderConfirmation/OrderConfirmation";
import ProductDetails from "./components/Products/ProductDetails/ProductDetails";
import Dashboard from "./Admin/Dashboard/Dashboard";
import Add from "./Admin/Add/Add";
import View from "./Admin/View/View";
import Update from "./Admin/Update/Update";
import Delete from "./Admin/Delete/Delete";
import OrderedOrders from "./Admin/OrdersReceived/OrdersReceived";
import MessagesReceived from "./Admin/MessagesReceived/MessagesReceived";
import Account from "./Admin/Account/Account";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";
import CustomerAccount from "./components/Account/CustomerAccount";
import MyOrders from "./components/Orders/MyOrders";
import MyOrders from "./components/Orders/MyOrders";

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.pageYOffset > window.innerHeight) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Account title="Deep Store - Login" />
            </PublicOnlyRoute>
          }
        />
        <Route path="/home" element={<Home title="Deep Store" />} />
        <Route
          path="/products"
          element={<Products title="Deep Store - Products" />}
        />
        <Route
          path="/details/:id"
          element={<ProductDetails title="Deep Store - Products" />}
        />
        <Route path="/about" element={<About title="Deep Store - About" />} />
        <Route
          path="/contact"
          element={<Contact title="Deep Store - Contact" />}
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="customer">
              <Cart title="Deep Store - Cart" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <ProtectedRoute requiredRole="customer">
              <OrderConfirmation title="Deep Store - Order Confirmation" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <MyOrders title="Deep Store - My Orders" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <MyOrders title="Deep Store - My Orders" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PublicOnlyRoute>
              <Account title="Deep Store - Login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Account title="Deep Store - Login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard title="Deep Store - Admin | Dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/add"
          element={
            <ProtectedRoute requiredRole="admin">
              <Add title="Deep Store - Admin | Add" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/view"
          element={
            <ProtectedRoute requiredRole="admin">
              <View title="Deep Store - Admin | View" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/update"
          element={
            <ProtectedRoute requiredRole="admin">
              <Update title="Deep Store - Admin | Update" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/delete"
          element={
            <ProtectedRoute requiredRole="admin">
              <Delete title="Deep Store - Admin | Delete" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/ordersReceived"
          element={
            <ProtectedRoute requiredRole="admin">
              <OrderedOrders title="Deep Store - Admin | Orders" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/messagesReceived"
          element={
            <ProtectedRoute requiredRole="admin">
              <MessagesReceived title="Deep Store - Admin | Messages" />
            </ProtectedRoute>
          }
        />
      </Routes>
      {isScrolled && (
        <button
          className="whatsapp-link"
          onClick={() => (window.location.href = "https://wa.me/9897034244")}
        >
          <i className="fab fa-whatsapp"></i>
        </button>
      )}
      {isScrolled && (
        <button
          className="scroll-to-top-button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </>
  );
}
*/

import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Products from "./components/Products/Products";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Cart from "./components/Cart/Cart";
import OrderConfirmation from "./components/OrderConfirmation/OrderConfirmation";
import ProductDetails from "./components/Products/ProductDetails/ProductDetails";
import Dashboard from "./Admin/Dashboard/Dashboard";
import Add from "./Admin/Add/Add";
import View from "./Admin/View/View";
import Update from "./Admin/Update/Update";
import Delete from "./Admin/Delete/Delete";
import OrderedOrders from "./Admin/OrdersReceived/OrdersReceived";
import MessagesReceived from "./Admin/MessagesReceived/MessagesReceived";
import Account from "./Admin/Account/Account";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";
import CustomerAccount from "./components/Account/CustomerAccount";

export default function App() {
  const whatsapp_number = process.env.REACT_APP_WHATSAPP_NUMBER;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.pageYOffset > window.innerHeight) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Account title="Deep Store - Login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole="customer">
              <Home title="Deep Store" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute requiredRole="customer">
              <Products title="Deep Store - Products" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details/:id"
          element={
            <ProtectedRoute requiredRole="customer">
              <ProductDetails title="Deep Store - Products" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute requiredRole="customer">
              <About title="Deep Store - About" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute requiredRole="customer">
              <Contact title="Deep Store - Contact" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="customer">
              <Cart title="Deep Store - Cart" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <ProtectedRoute requiredRole="customer">
              <OrderConfirmation title="Deep Store - Order Confirmation" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PublicOnlyRoute>
              <Account title="Deep Store - Login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Account title="Deep Store - Login" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard title="Deep Store - Admin | Dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/add"
          element={
            <ProtectedRoute requiredRole="admin">
              <Add title="Deep Store - Admin | Add" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/view"
          element={
            <ProtectedRoute requiredRole="admin">
              <View title="Deep Store - Admin | View" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/update"
          element={
            <ProtectedRoute requiredRole="admin">
              <Update title="Deep Store - Admin | Update" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/delete"
          element={
            <ProtectedRoute requiredRole="admin">
              <Delete title="Deep Store - Admin | Delete" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/ordersReceived"
          element={
            <ProtectedRoute requiredRole="admin">
              <OrderedOrders title="Deep Store - Admin | Orders" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard/messagesReceived"
          element={
            <ProtectedRoute requiredRole="admin">
              <MessagesReceived title="Deep Store - Admin | Messages" />
            </ProtectedRoute>
          }
        />
      </Routes>
      {isScrolled && (
        <button
          className="whatsapp-link"
          onClick={() =>
            (window.location.href = `https://wa.me/${whatsapp_number}`)
          }
        >
          <i className="fab fa-whatsapp"></i>
        </button>
      )}
      {isScrolled && (
        <button
          className="scroll-to-top-button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </>
  );
}
