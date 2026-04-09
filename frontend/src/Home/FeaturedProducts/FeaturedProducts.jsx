import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import axios from "axios";
import "./FeaturedProducts.css";
import { useCart } from "../../context/CartContext";

export default function FeaturedProducts() {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const WEIGHT_OPTIONS = [250, 500, 1000, 5000, 10000];
  const formatWeightLabel = (weight) =>
    weight >= 1000 ? `${weight / 1000}Kg` : `${weight}gm`;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/categories`);
      setCategories(response.data);
      // Fetch all products with their categories
      const productsWithImageUrl = response.data.reduce(
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
      setProducts(productsWithImageUrl);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
    },
    custom: {
      breakpoint: { max: 4000, min: 1024 },
      items: 4,
    },
  };

  const getPackValues = (product, isCustomizable, selectedWeight) => {
    const basePrice = Number(product.productPrice) || 0;
    const baseMrp = Number(product.productMrp) || 0;
    if (!isCustomizable) {
      return { packPrice: basePrice, packMrp: baseMrp };
    }
    return {
      packPrice: Number(((basePrice * selectedWeight) / 1000).toFixed(2)),
      packMrp: Number(((baseMrp * selectedWeight) / 1000).toFixed(2)),
    };
  };

  const getCurrentCartQuantity = (productId, isCustomizable, selectedWeight) =>
    items.reduce(
      (total, item) =>
        item.id === productId &&
        (isCustomizable ? item.weight === selectedWeight : !item.weight)
          ? total + item.quantity
          : total,
      0
    );

  const handleAddOne = (product, isCustomizable, selectedWeight) => {
    const { packPrice, packMrp } = getPackValues(
      product,
      isCustomizable,
      selectedWeight
    );
    addToCart({
      id: product._id,
      name: product.productName,
      image: product.image,
      price: packPrice,
      mrp: packMrp,
      quantity: 1,
      weight: isCustomizable ? selectedWeight : null,
      sizeType: product.productSize,
    });
  };

  const handleDecreaseOne = (product, isCustomizable, selectedWeight) => {
    const currentQty = getCurrentCartQuantity(
      product._id,
      isCustomizable,
      selectedWeight
    );
    if (currentQty <= 1) {
      removeFromCart(product._id, isCustomizable ? selectedWeight : null);
      return;
    }
    updateQuantity(
      product._id,
      isCustomizable ? selectedWeight : null,
      currentQty - 1
    );
  };

  return (
    <div className="small-container" id="featuredProducts">
      {categories.map((category) => (
        <div className="category-container" key={category._id}>
          <h2 className="title">{category.category}</h2>
          <Carousel
            responsive={responsive}
            arrows={true}
            infinite={true}
            renderButtonGroupOutside={true}
            className="carousel-box"
          >
            {products
              .filter((product) => product.category === category.category)
              .map((product) => {
                const isCustomizable =
                  String(product.productSize).toLowerCase() === "customizable";
                const cartQuantityForSelectedPack = getCurrentCartQuantity(
                  product._id,
                  isCustomizable,
                  1000
                );
                const totalCustomizableQty = isCustomizable
                  ? items
                      .filter((item) => item.id === product._id)
                      .reduce((acc, item) => acc + item.quantity, 0)
                  : 0;
                const { packPrice } = getPackValues(
                  product,
                  isCustomizable,
                  1000
                );
                return (
                <div className="col-4" key={product._id}>
                  <Link to={"/details/" + product._id}>
                    <img
                      alt={product.productName + " image"}
                      src={product.image}
                    />
                    <h4>{product.productName}</h4>
                  </Link>
                  <p>₹{packPrice.toFixed(2)}</p>
                  {isCustomizable ? (
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
                  <br />
                  {isCustomizable ? (
                    <div className="quick-cart-box">
                      <div className="weight-dropdown">
                        <button
                          type="button"
                          className="weight-dropdown-trigger"
                        >
                          Customize weight
                          <span className="weight-dropdown-arrow">▾</span>
                        </button>
                        <div className="weight-dropdown-menu">
                          {WEIGHT_OPTIONS.map((weight) => {
                            const qtyForWeight = getCurrentCartQuantity(
                              product._id,
                              true,
                              weight
                            );
                            return (
                              <div
                                className="weight-dropdown-option weight-row"
                                key={`${product._id}-${weight}`}
                              >
                                <span>{formatWeightLabel(weight)}</span>
                                {qtyForWeight > 0 ? (
                                  <div className="qty-stepper">
                                    <button
                                      type="button"
                                      className="AddToCart-Btn"
                                      onClick={() =>
                                        handleDecreaseOne(product, true, weight)
                                      }
                                    >
                                      -
                                    </button>
                                    <span className="qty-value">{qtyForWeight}</span>
                                    <button
                                      type="button"
                                      className="AddToCart-Btn"
                                      onClick={() => handleAddOne(product, true, weight)}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="AddToCart-Btn"
                                    onClick={() => handleAddOne(product, true, weight)}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link to={"/details/" + product._id}>
                        <button className="BuyNow-Btn">View Product</button>
                      </Link>
                      {cartQuantityForSelectedPack > 0 ? (
                        <div className="qty-stepper">
                          <button
                            type="button"
                            className="AddToCart-Btn"
                            onClick={() => handleDecreaseOne(product, false, null)}
                          >
                            -
                          </button>
                          <span className="qty-value">{cartQuantityForSelectedPack}</span>
                          <button
                            type="button"
                            className="AddToCart-Btn"
                            onClick={() => handleAddOne(product, false, null)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="AddToCart-Btn"
                          onClick={() => handleAddOne(product, false, null)}
                        >
                          +
                        </button>
                      )}
                    </>
                  )}
                  {!isCustomizable && cartQuantityForSelectedPack > 0 ? (
                    <p className="quick-cart-hint">
                      {`${cartQuantityForSelectedPack} unit(s) in cart`}
                    </p>
                  ) : null}
                </div>
                );
              })}
          </Carousel>
        </div>
      ))}
    </div>
  );
}
