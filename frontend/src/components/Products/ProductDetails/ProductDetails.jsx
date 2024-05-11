import React, { useState, useEffect } from "react";
import Footer from "../../Footer/Footer";
import Navbar from "../../Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";

export default function ProductDetails() {
  const SERVER_URL = "https://deep-kirana-server.vercel.app";

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(1); // Initialize quantity to 1
  const [packsText, setPacksText] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const categoriesResponse = await axios.get(`${SERVER_URL}/categories`);
        // Fetch all products with their categories
        const productsWithImageUrl = categoriesResponse.data.reduce(
          (accumulator, category) => [
            ...accumulator,
            ...category.products.map((product) => ({
              ...product,
              category: category.category, // Add category to the product object
              image: `${SERVER_URL}/uploads/` + product.productImage,
            })),
          ],
          []
        );
        const selectedProduct = productsWithImageUrl.find(
          (product) => product._id === id
        );
        setProduct(selectedProduct);
        setCategoryName(selectedProduct.category);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (selectedOption && quantity > 0) {
      const costPerKg = product.productPrice / 1000;
      const weightInKg = selectedOption / 1000;
      const totalCost = costPerKg * quantity * weightInKg * 1000;

      if (quantity === 1) {
        const displayOption =
          selectedOption >= 1000
            ? `${selectedOption / 1000} kg`
            : `${selectedOption} gm`;
        setPacksText(`1 pack of ${displayOption} = ₹${totalCost.toFixed(2)}`);
      } else if (quantity > 1) {
        const displayOption =
          selectedOption >= 1000
            ? `${selectedOption / 1000} kg`
            : `${selectedOption} gm`;
        setPacksText(
          `${quantity} packs of ${displayOption} = ₹${totalCost.toFixed(2)}`
        );
      } else {
        setPacksText("");
      }
    }
  }, [quantity, selectedOption, product]);

  const handleOptionChange = (e) => {
    const newSelectedOption = e.target.value;
    setSelectedOption(newSelectedOption);
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (product.productSize === "Customizable") {
      if (selectedOption) {
        // Add to cart works
      } else {
        alert("Please select a valid option before adding to cart.");
      }
    } else {
      if (quantity > 0) {
        // Add to cart works
      } else {
        alert("Please select a valid quantity before adding to cart.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="small-container single-product">
        {product ? (
          <div id="product-details-row">
            <div id="col-2">
              <img
                alt={product.productName}
                src={product.image}
                id="ProductImg"
              />
            </div>

            <div id="col-2">
              <p className="navigator">
                <Link to="/">Home</Link> / {categoryName}
              </p>
              <h1 className="h1">{product.productName}</h1>
              <div className="price">
                <h4 className="h4">₹{product.productPrice}.00</h4>
                {product.productSize === "Customizable" ? (
                  <h6 className="h6">
                    ₹{product.productMrp}.00/
                    <span style={{ fontSize: "13px" }}>Kg</span>
                  </h6>
                ) : (
                  <h6 className="h6">
                    ₹{product.productMrp}.00/
                    <span style={{ fontSize: "13px" }}>unit</span>
                  </h6>
                )}
                <h5 className="h5">
                  {Math.round(
                    ((product.productMrp - product.productPrice) /
                      product.productMrp) *
                      100
                  )}
                  % OFF
                </h5>
              </div>
              <br />
              {product.productSize === "Customizable" ? (
                <div className="quantity">
                  <select
                    name=""
                    onChange={handleOptionChange}
                    value={selectedOption}
                  >
                    <option>Select Weight</option>
                    <option value="250">250gm</option>
                    <option value="500">500gm</option>
                    <option value="1000">1Kg</option>
                    <option value="5000">5Kg</option>
                    <option value="10000">10Kg</option>
                  </select>
                  {selectedOption && (
                    <>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                      />
                      <p>{packsText}</p>
                    </>
                  )}
                </div>
              ) : (
                // Render the quantity input for Non-Customizable products
                <div className="quantity">
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                  />
                </div>
              )}
              <h3 className="h3">
                Product Details <i className="icon fa fa-indent"></i>
              </h3>
              <p className="description">{product.productDescription}</p>
              {product.productSize === "Customizable" ? (
                selectedOption ? (
                  <Link
                    to={`/cart?productId=${product._id}&quantity=${quantity}&weight=${selectedOption}`}
                  >
                    <button type="submit" className="AddToCart">
                      Add To Cart
                    </button>
                  </Link>
                ) : (
                  <button
                    type="submit"
                    className="AddToCart"
                    onClick={handleAddToCart}
                  >
                    Add To Cart
                  </button>
                )
              ) : (
                <Link
                  to={`/cart?productId=${product._id}&quantity=${quantity}`}
                >
                  <button type="submit" className="AddToCart">
                    Add To Cart
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </>
  );
}
