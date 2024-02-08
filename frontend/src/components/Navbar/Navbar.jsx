import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

export default function Navbar() {
  const [clicked, setClicked] = useState(false);
  const [color, setColor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data);
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

  return (
    <>
      <div className={color ? "header active" : "header"}>
        <div className="container">
          <div className="navbar">
            <div className="logo">
              <Link to="/">
                <span>Deep Store</span>
              </Link>
            </div>
            <div className="search-bar">
              <form action="" method="get" className="search-bar-form">
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
                  <Link to="/">Home</Link>
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
              <i id="bag-icon" className="fas fa-regular fa-bag-shopping" />
            </Link>
            <div className="menu-icon" onClick={handleClick}>
              <i
                className={clicked && color ? "fas fa-times" : "fas fa-bars"}
              ></i>
            </div>
          </div>
          <div className="search-bar-full">
            <form action="" method="get" className="search-bar-form">
              <div className="search">
                <input
                  type="text"
                  placeholder="Search product..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <ul>
                  {searchResults.map((product) => (
                    <li key={product.id}>{product.productName}</li>
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
