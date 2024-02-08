import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Products from "./components/Products/Products";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Cart from "./components/Cart/Cart";
import ProductDetails from "./components/Products/ProductDetails/ProductDetails";
import { Admin } from "./Admin/Admin";
import Dashboard from "./Admin/Dashboard/Dashboard";
import Add from "./Admin/Add/Add";
import View from "./Admin/View/View";
import Update from "./Admin/Update/Update";
import Delete from "./Admin/Delete/Delete";
import OrderedOrders from "./Admin/OrdersReceived/OrdersReceived";

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
        <Route path="/" element={<Home title="Deep Store" />} />
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
        <Route path="/cart" element={<Cart title="Deep Store - Cart" />} />
        <Route path="/admin" element={<Admin title="Deep Store - Admin" />} />
        <Route
          path="/admin/dashboard"
          element={<Dashboard title="Deep Store - Admin | Dashboard" />}
        />
        <Route
          path="/admin/dashboard/add"
          element={<Add title="Deep Store - Admin | Add" />}
        />
        <Route
          path="/admin/dashboard/view"
          element={<View title="Deep Store - Admin | View" />}
        />
        <Route
          path="/admin/dashboard/update"
          element={<Update title="Deep Store - Admin | Update" />}
        />
        <Route
          path="/admin/dashboard/delete"
          element={<Delete title="Deep Store - Admin | Delete" />}
        />
        <Route
          path="/admin/dashboard/ordersReceived"
          element={<OrderedOrders title="Deep Store - Admin | Orders" />}
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
