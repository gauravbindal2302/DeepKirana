import React, { useState, useEffect } from "react";
import Footer from "../../Footer/Footer";
import Navbar from "../../Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetails.css";
import { useCart } from "../../../context/CartContext";

export default function ProductDetails() {
  const SERVER_URL = process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const WEIGHT_OPTIONS = [250, 500, 1000, 5000, 10000];
  const formatWeightLabel = (weight) =>
    weight >= 1000 ? `${weight / 1000}Kg` : `${weight}gm`;

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedOption, setSelectedOption] = useState("1000");

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
  }, [id, SERVER_URL]);

  const getPackValues = (isCustomizable, selectedWeight) => {
    const basePrice = Number(product?.productPrice) || 0;
    const baseMrp = Number(product?.productMrp) || 0;
    if (!isCustomizable) {
      return { packPrice: basePrice, packMrp: baseMrp };
    }
    return {
      packPrice: Number(((basePrice * selectedWeight) / 1000).toFixed(2)),
      packMrp: Number(((baseMrp * selectedWeight) / 1000).toFixed(2)),
    };
  };

  const handleOptionChange = (weight) => {
    setSelectedOption(String(weight));
  };

  return (
    <>
      <Navbar />
      <div className="small-container single-product">
        {product ? (
          (() => {
            const isCustomizable =
              String(product.productSize).toLowerCase() === "customizable";
            const selectedWeight = selectedOption
              ? Number(selectedOption)
              : 1000;
            const selectedPackQuantityInCart =
              isCustomizable && selectedOption
                ? items.reduce(
                    (total, item) =>
                      item.id === product._id && item.weight === selectedWeight
                        ? total + item.quantity
                        : total,
                    0
                  )
                : 0;
            const totalCustomizableQuantityInCart = isCustomizable
              ? items.reduce(
                  (total, item) => (item.id === product._id ? total + item.quantity : total),
                  0
                )
              : 0;
            const nonCustomizableQuantityInCart = !isCustomizable
              ? items.reduce(
                  (total, item) =>
                    item.id === product._id && !item.weight ? total + item.quantity : total,
                  0
                )
              : 0;
            const { packPrice, packMrp } = getPackValues(
              isCustomizable,
              selectedWeight
            );

            const handleAddOne = () => {
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

            const handleDecreaseOne = () => {
              const currentQty = isCustomizable
                ? selectedPackQuantityInCart
                : nonCustomizableQuantityInCart;
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
          <div id="product-details-row">
            <div id="col-2">
              <img
                alt={product.productName}
                src={product.image}
                id="ProductImg"
              />
            </div>

            <div id="col-2" className="product-details-content">
              <p className="navigator">
                <Link to="/">Home</Link> / {categoryName}
              </p>
              <h1 className="h1">{product.productName}</h1>
              <div className="price price-row">
                <h4 className="h4">₹{packPrice.toFixed(2)}</h4>
                {isCustomizable ? (
                  <h6 className="h6">
                    ₹{packMrp.toFixed(2)}/
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
              {isCustomizable ? (
                <div className="quantity quantity-block">
                  <div className="pd-weight-dropdown">
                    <button type="button" className="pd-weight-dropdown-trigger">
                      Customize weight
                      <span className="pd-weight-dropdown-arrow">▾</span>
                    </button>
                    <div className="pd-weight-dropdown-menu">
                      {WEIGHT_OPTIONS.map((weight) => {
                        const qtyForWeight = items.reduce(
                          (total, item) =>
                            item.id === product._id && item.weight === weight
                              ? total + item.quantity
                              : total,
                          0
                        );
                        const { packPrice: weightPackPrice } = getPackValues(true, weight);
                        return (
                          <div
                            key={`${product._id}-${weight}`}
                            className={`pd-weight-option-row ${
                              selectedWeight === weight ? "active" : ""
                            }`}
                            onClick={() => handleOptionChange(weight)}
                          >
                            <span className="weight-option-label">
                              {formatWeightLabel(weight)}
                            </span>
                            <span className="weight-option-price">
                              ₹{weightPackPrice.toFixed(2)}
                            </span>
                            {qtyForWeight > 0 ? (
                              <div className="pd-qty-stepper">
                                <button
                                  type="button"
                                  className="AddToCart"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (qtyForWeight <= 1) {
                                      removeFromCart(product._id, weight);
                                      return;
                                    }
                                    updateQuantity(product._id, weight, qtyForWeight - 1);
                                  }}
                                >
                                  -
                                </button>
                                <span>{qtyForWeight}</span>
                                <button
                                  type="button"
                                  className="AddToCart"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const { packPrice: p, packMrp: m } = getPackValues(
                                      true,
                                      weight
                                    );
                                    addToCart({
                                      id: product._id,
                                      name: product.productName,
                                      image: product.image,
                                      price: p,
                                      mrp: m,
                                      quantity: 1,
                                      weight,
                                      sizeType: product.productSize,
                                    });
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="AddToCart"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const { packPrice: p, packMrp: m } = getPackValues(
                                    true,
                                    weight
                                  );
                                  addToCart({
                                    id: product._id,
                                    name: product.productName,
                                    image: product.image,
                                    price: p,
                                    mrp: m,
                                    quantity: 1,
                                    weight,
                                    sizeType: product.productSize,
                                  });
                                }}
                              >
                                +
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {totalCustomizableQuantityInCart > 0 ? (
                    <p className="cart-note">
                      {totalCustomizableQuantityInCart} customizable pack(s) already in cart
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="quantity">
                  {nonCustomizableQuantityInCart > 0 ? (
                    <p className="cart-note">
                      {nonCustomizableQuantityInCart} unit(s) in cart
                    </p>
                  ) : null}
                </div>
              )}
              <h3 className="h3">
                Product Details <i className="icon fa fa-indent"></i>
              </h3>
              <p className="description">{product.productDescription}</p>
              {!isCustomizable ? (
                nonCustomizableQuantityInCart > 0 ? (
                  <div className="details-stepper">
                    <button type="button" className="AddToCart" onClick={handleDecreaseOne}>
                      -
                    </button>
                    <button type="button" className="AddToCart" onClick={handleAddOne}>
                      {nonCustomizableQuantityInCart} in cart (+)
                    </button>
                  </div>
                ) : (
                  <button type="button" className="AddToCart" onClick={handleAddOne}>
                    Add To Cart
                  </button>
                )
              ) : null}
            </div>
          </div>
            );
          })()
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <Footer />
    </>
  );
}
