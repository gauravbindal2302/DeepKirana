import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FeaturedCategories.css";
import axios from "axios";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategoryNames();
  }, []);

  const getCategoryNames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <div className="categories-container">
      <div className="main-title">
        <h1>Love our Categories</h1>
        <Link to="/products">
          <button type="button">Show All Products</button>
        </Link>
      </div>
      <div className="categories-outer">
        <div className="categories-row">
          {categories.map((category) => (
            <div className="category" key={category._id}>
              <img alt={category.category + " image"} src={category.image} />
              <div className="category-information">
                <span className="category-title">{category.category}</span>
                <p>{category.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
