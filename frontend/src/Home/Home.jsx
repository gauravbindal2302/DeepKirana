import { useState, useEffect } from "react";
import "./Home.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import FeaturedCategories from "./FeaturedCategories/FeaturedCategories";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import axios from "axios";

export default function Home({ title }) {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    document.title = title;
    getCategoryNames();
  }, [title]);

  const getCategoryNames = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <>
      <div className="home-main">
        <Navbar />
        <div className="container">
          <div className="row" id="row">
            <div className="col">
              <div className="category-section">
                <h3 className="category-section-title">
                  <i className="fas fa-regular fa-bowl-rice" /> All Categories
                </h3>
                <ul className="category-list">
                  {categories.map((category) => (
                    <li className="item" key={category.category}>
                      <i className={"fas fa-regular fa-" + category.icon} />
                      {category.category}
                      <i className="arrow-icon fab fa-solid fa-greater-than" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col">
              <img alt="" src="Images/image-1.png" />
            </div>
          </div>
        </div>
        <div className="bg" />
      </div>
      <FeaturedCategories />
      <FeaturedProducts />
      <Footer />
    </>
  );
}
