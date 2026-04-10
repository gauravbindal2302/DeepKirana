import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar(props) {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [clicked, setClicked] = useState(false);
  const [color, setColor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/categories`);
      const productsWithCategory = response.data.reduce(
        (accumulator, category) => [
          ...accumulator,
          ...category.products.map((product) => ({
            _id: product._id,
            productName: product.productName,
            category: category.category,
          })),
        ],
        []
      );
      setProducts(productsWithCategory);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    if (searchTerm.trim() === "") {
      setSearchResults([]);
    } else {
      const results = products.filter((product) =>
        product.productName.toLowerCase().includes(searchTerm)
      );
      setSearchResults(results);
    }
  }

  function handleClick() {
    setClicked(!clicked);
    setColor(!clicked);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
  }

  return (
    <>
      <div className={color ? "header active" : "header"}>
        <div className="container">
          <div className="navbar">
            <div className="logo">
              <Link to="/home">
                <span>Deep Store</span>
              </Link>
            </div>
            <div className="search-bar">
              <form
                action=""
                method="get"
                className="search-bar-form"
                onSubmit={handleSearchSubmit}
              >
                <div className="search">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <ul>
                    {searchResults.map((product) => (
                      <Link to={"/details/" + product._id}>
                        <li key={product._id}>{product.productName}</li>
                      </Link>
                    ))}
                  </ul>
                </div>
                <button className="search-btn" type="submit" disabled>
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>
            </div>
            <nav>
              <ul className={clicked ? "menuItems active" : "menuItems"}>
                <li className="link">
                  <Link to="/home">Home</Link>
                </li>
                <li className="link">
                  <Link to="/products">Products</Link>
                </li>
                <li className="link">
                  <Link to="/about">About</Link>
                </li>
                <li className="link">
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </nav>
            <Link to="/cart">
              <span id="noOfItems">Cart[{props.noOfItems ?? itemCount}]</span>
            </Link>
            <div className="profile-menu-wrapper">
              <button
                type="button"
                className="profile-icon-btn"
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <i className="fas fa-user-circle"></i>
              </button>
              {showProfileMenu ? (
                <div className="profile-menu-dropdown">
                  {isAuthenticated ? (
                    <>
                      <p className="profile-menu-name">{user?.name || "User"}</p>
                      {user?.role === "customer" ? (
                        <>
                          <Link to="/account" onClick={() => setShowProfileMenu(false)}>
                            My Profile
                          </Link>
                          <Link to="/orders" onClick={() => setShowProfileMenu(false)}>
                            My Orders
                          </Link>
                        </>
                      ) : (
                        <Link to="/admin/dashboard" onClick={() => setShowProfileMenu(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setShowProfileMenu(false)}>
                      Login
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
            <div className="menu-icon" onClick={handleClick}>
              <i
                className={clicked && color ? "fas fa-times" : "fas fa-bars"}
              ></i>
            </div>
          </div>
          <div className="search-bar-full">
            <form
              action=""
              method="get"
              className="search-bar-form"
              onSubmit={handleSearchSubmit}
            >
              <div className="search">
                <input
                  type="text"
                  placeholder="Search product..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <ul>
                  {searchResults.map((product) => (
                    <Link to={"/details/" + product._id}>
                      <li key={product.id}>{product.productName}</li>
                    </Link>
                  ))}
                </ul>
              </div>
              <button className="search-btn" type="submit" disabled>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
